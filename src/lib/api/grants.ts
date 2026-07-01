import type { GrantsApiMeta, GrantsApiResponse } from "@/lib/api/utils";
import { fetchBizinfoGrants } from "@/lib/api/bizinfo";

export async function fetchAllGrants(): Promise<GrantsApiResponse> {
  const meta: GrantsApiMeta = {
    bizinfo: { ok: false, count: 0 },
    fetchedAt: new Date().toISOString(),
  };

  try {
    const grants = await fetchBizinfoGrants(100);
    meta.bizinfo = { ok: true, count: grants.length };
    return {
      grants: grants.sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ),
      meta,
    };
  } catch (error) {
    meta.bizinfo = {
      ok: false,
      count: 0,
      error: error instanceof Error ? error.message : "조회 실패",
    };
    return { grants: [], meta };
  }
}
