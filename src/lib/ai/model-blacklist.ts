const blacklist = new Set<string>();
const failureCount = new Map<string, number>();

const MAX_FAILURES = 2;
const BLACKLIST_TTL_MS = 24 * 60 * 60 * 1000;
const expiry = new Map<string, number>();

export function isBlacklisted(modelId: string): boolean {
  const exp = expiry.get(modelId);
  if (exp && Date.now() > exp) {
    blacklist.delete(modelId);
    expiry.delete(modelId);
    failureCount.delete(modelId);
    return false;
  }
  return blacklist.has(modelId);
}

export function markModelFailed(modelId: string, reason?: string): void {
  const count = (failureCount.get(modelId) ?? 0) + 1;
  failureCount.set(modelId, count);

  if (count >= MAX_FAILURES) {
    blacklist.add(modelId);
    expiry.set(modelId, Date.now() + BLACKLIST_TTL_MS);
    console.warn(`[OpenRouter] 모델 제외: ${modelId}${reason ? ` (${reason})` : ""}`);
  }
}

export function markModelSuccess(modelId: string): void {
  failureCount.delete(modelId);
}

export function getBlacklistSize(): number {
  return blacklist.size;
}
