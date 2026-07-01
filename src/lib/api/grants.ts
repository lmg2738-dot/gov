import type { GrantsApiMeta, GrantsApiResponse } from "@/lib/api/utils";
import { fetchBizinfoGrants } from "@/lib/api/bizinfo";
import { fetchKStartupGrants } from "@/lib/api/kstartup";
import type { GrantProgram } from "@/types";

function dedupeGrants(grants: GrantProgram[]): GrantProgram[] {
  const seen = new Set<string>();
  return grants.filter((g) => {
    const key = g.title.replace(/\s+/g, "").slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchAllGrants(): Promise<GrantsApiResponse> {
  const meta: GrantsApiMeta = {
    bizinfo: { ok: false, count: 0 },
    kstartup: { ok: false, count: 0 },
    fetchedAt: new Date().toISOString(),
  };

  const results = await Promise.allSettled([
    fetchBizinfoGrants(100),
    fetchKStartupGrants(100),
  ]);

  const grants: GrantProgram[] = [];

  if (results[0].status === "fulfilled") {
    meta.bizinfo = { ok: true, count: results[0].value.length };
    grants.push(...results[0].value);
  } else {
    meta.bizinfo = {
      ok: false,
      count: 0,
      error: results[0].reason instanceof Error ? results[0].reason.message : "조회 실패",
    };
  }

  if (results[1].status === "fulfilled") {
    meta.kstartup = { ok: true, count: results[1].value.length };
    grants.push(...results[1].value);
  } else {
    meta.kstartup = {
      ok: false,
      count: 0,
      error: results[1].reason instanceof Error ? results[1].reason.message : "조회 실패",
    };
  }

  return {
    grants: dedupeGrants(grants).sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    ),
    meta,
  };
}
