import { chatWithFreeModel, type AiScoreItem } from "@/lib/ai/openrouter";
import { recommendGrants } from "@/lib/recommend";
import type { GrantProgram, UserProfile } from "@/types";
import { COMPANY_SIZE_LABELS } from "@/types";

export interface AiRecommendResult {
  grants: GrantProgram[];
  aiUsed: boolean;
  model?: string;
  fallbackReason?: string;
}

export async function recommendGrantsWithAi(
  profile: UserProfile,
  grants: GrantProgram[],
  topN = 20
): Promise<AiRecommendResult> {
  const ruleBased = recommendGrants(profile, grants).slice(0, topN);

  if (!process.env.OPENROUTER_API_KEY || ruleBased.length === 0) {
    return {
      grants: ruleBased,
      aiUsed: false,
      fallbackReason: "OPENROUTER_API_KEY 미설정 또는 공고 없음",
    };
  }

  const grantBriefs = ruleBased.map((g) => ({
    id: g.id,
    title: g.title,
    summary: g.summary.slice(0, 200),
    target: g.target,
    region: g.region,
    deadline: g.deadline,
    category: g.category,
  }));

  const systemPrompt = `당신은 한국 정부지원사업 추천 전문가입니다.
사용자 프로필에 맞는 지원사업을 분석하고 JSON만 반환하세요.
반드시 아래 형식의 JSON 객체로만 응답하세요:
{"items":[{"id":"공고id","score":0-100 정수,"reason":"한 줄 추천 이유"}]}
score는 적합도이며 100에 가까울수록 좋습니다. 모든 공고 id에 대해 항목을 포함하세요.`;

  const userPrompt = `## 기업 프로필
- 회사명: ${profile.companyName || "(미입력)"}
- 업종: ${profile.industry}
- 규모: ${COMPANY_SIZE_LABELS[profile.companySize]}
- 지역: ${profile.region}
- 직원 수: ${profile.employeeCount}명
- 연 매출: ${profile.annualRevenue}

## 지원사업 목록
${JSON.stringify(grantBriefs, null, 0)}`;

  try {
    const { content, model } = await chatWithFreeModel(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { maxTokens: 4096 }
    );

    const parsed = JSON.parse(content) as { items?: AiScoreItem[] };
    const scores = new Map(
      (parsed.items ?? []).map((item) => [item.id, item])
    );

    const enhanced = ruleBased
      .map((grant) => {
        const ai = scores.get(grant.id);
        if (!ai) return grant;
        return {
          ...grant,
          matchScore: Math.min(99, Math.max(0, Math.round(ai.score))),
          matchReason: `AI · ${ai.reason}`,
        };
      })
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

    return { grants: enhanced, aiUsed: true, model };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "AI 추천 실패";
    console.warn("[AI Recommend]", reason);
    return {
      grants: ruleBased,
      aiUsed: false,
      fallbackReason: reason,
    };
  }
}
