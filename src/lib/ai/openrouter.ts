import {
  getBlacklistSize,
  isBlacklisted,
  markModelFailed,
  markModelSuccess,
} from "@/lib/ai/model-blacklist";

const OPENROUTER_API = "https://openrouter.ai/api/v1";
const MODELS_CACHE_TTL_MS = 60 * 60 * 1000;

interface OpenRouterModel {
  id: string;
  name: string;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { modality?: string; instruct_type?: string | null };
  top_provider?: { is_moderated?: boolean };
}

interface ModelsCache {
  models: string[];
  fetchedAt: number;
}

let modelsCache: ModelsCache | null = null;

function isFreeModel(model: OpenRouterModel): boolean {
  const prompt = parseFloat(model.pricing?.prompt ?? "1");
  const completion = parseFloat(model.pricing?.completion ?? "1");
  return prompt === 0 && completion === 0;
}

function isChatModel(model: OpenRouterModel): boolean {
  const id = model.id.toLowerCase();
  const modality = model.architecture?.modality ?? "";

  if (!modality.includes("text")) return false;
  if (modality.includes("image") && !modality.includes("text->text")) return false;

  const blocked = [
    "lyria",
    "embed",
    "embedding",
    "whisper",
    "tts",
    "dall-e",
    "stable-diffusion",
    "music",
    "audio",
    "clip-preview",
    "content-safety",
  ];
  return !blocked.some((b) => id.includes(b) || model.name.toLowerCase().includes(b));
}

export async function fetchFreeChatModels(): Promise<string[]> {
  if (
    modelsCache &&
    Date.now() - modelsCache.fetchedAt < MODELS_CACHE_TTL_MS
  ) {
    return modelsCache.models.filter((id) => !isBlacklisted(id));
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY가 설정되지 않았습니다.");

  const res = await fetch(`${OPENROUTER_API}/models`, {
    headers: { Authorization: `Bearer ${key}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`OpenRouter 모델 목록 조회 실패: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { data?: OpenRouterModel[] };
  const freeChat = (data.data ?? [])
    .filter(isFreeModel)
    .filter(isChatModel)
    .filter((m) => !isBlacklisted(m.id))
    .map((m) => m.id);

  modelsCache = { models: freeChat, fetchedAt: Date.now() };
  return freeChat;
}

function isRetryableError(status: number, body: string): boolean {
  if (status === 404 || status === 402 || status === 403) return true;
  if (status === 429) return true;
  const lower = body.toLowerCase();
  return (
    lower.includes("no endpoints") ||
    lower.includes("not found") ||
    lower.includes("invalid model") ||
    lower.includes("capacity") ||
    lower.includes("rate limit") ||
    lower.includes("insufficient credits")
  );
}

export interface AiScoreItem {
  id: string;
  score: number;
  reason: string;
}

export async function chatWithFreeModel(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: { maxTokens?: number }
): Promise<{ content: string; model: string }> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY가 설정되지 않았습니다.");

  const models = await fetchFreeChatModels();
  if (models.length === 0) {
    throw new Error(
      `사용 가능한 무료 모델이 없습니다. (제외 ${getBlacklistSize()}개)`
    );
  }

  let lastError = "알 수 없는 오류";

  for (const model of models) {
    if (isBlacklisted(model)) continue;

    try {
      const res = await fetch(`${OPENROUTER_API}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:60003",
          "X-Title": "GrantFinder",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options?.maxTokens ?? 2048,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      const bodyText = await res.text();

      if (!res.ok) {
        lastError = `HTTP ${res.status}: ${bodyText.slice(0, 200)}`;
        if (isRetryableError(res.status, bodyText)) {
          markModelFailed(model, lastError);
          continue;
        }
        throw new Error(lastError);
      }

      const data = JSON.parse(bodyText) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      };

      if (data.error?.message) {
        lastError = data.error.message;
        markModelFailed(model, lastError);
        continue;
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        lastError = "빈 응답";
        markModelFailed(model, lastError);
        continue;
      }

      markModelSuccess(model);
      return { content, model };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      markModelFailed(model, lastError);
    }
  }

  modelsCache = null;
  throw new Error(`모든 무료 모델 시도 실패. 마지막 오류: ${lastError}`);
}
