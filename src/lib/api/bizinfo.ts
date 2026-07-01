import type { GrantProgram } from "@/types";
import {
  extractAmount,
  mapBizinfoCategory,
  mapRegionName,
  parseDateRangeEnd,
  parseHashtags,
  stripHtml,
} from "@/lib/api/utils";

interface BizinfoItem {
  pblancId?: string;
  pblancNm?: string;
  bsnsSumryCn?: string;
  trgetNm?: string;
  reqstBeginEndDe?: string;
  jrsdInsttNm?: string;
  excInsttNm?: string;
  pldirSportRealmLclasCodeNm?: string;
  hashtags?: string;
  pblancUrl?: string;
}

interface BizinfoResponse {
  jsonArray?: BizinfoItem[];
}

const BIZINFO_URL = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

export async function fetchBizinfoGrants(count = 100): Promise<GrantProgram[]> {
  const key = process.env.BIZINFO_API_KEY;
  if (!key) throw new Error("BIZINFO_API_KEY가 설정되지 않았습니다.");

  const url = new URL(BIZINFO_URL);
  url.searchParams.set("crtfcKey", key);
  url.searchParams.set("dataType", "json");
  url.searchParams.set("searchCnt", String(count));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`기업마당 API 오류: HTTP ${res.status}`);
  }

  const data = (await res.json()) as BizinfoResponse;
  const items = data.jsonArray ?? [];

  return items
    .map((item): GrantProgram | null => {
      const deadline = parseDateRangeEnd(item.reqstBeginEndDe);
      if (!item.pblancId || !item.pblancNm || !deadline) return null;

      const summary = stripHtml(item.bsnsSumryCn);

      return {
        id: `bizinfo-${item.pblancId}`,
        title: item.pblancNm,
        source: "기업마당",
        category: mapBizinfoCategory(item.pldirSportRealmLclasCodeNm),
        summary: summary || item.pblancNm,
        target: item.trgetNm || "중소기업",
        region: mapRegionName(item.jrsdInsttNm),
        maxAmount: extractAmount(summary),
        deadline,
        organizer: item.excInsttNm || item.jrsdInsttNm || "기업마당",
        tags: parseHashtags(item.hashtags),
        detailUrl: item.pblancUrl,
      };
    })
    .filter((g): g is GrantProgram => g !== null);
}
