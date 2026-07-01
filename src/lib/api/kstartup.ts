import type { GrantProgram } from "@/types";
import { mapRegionName, parseYmd } from "@/lib/api/utils";

interface KStartupItem {
  postsn?: string;
  title?: string;
  biztitle?: string;
  posttarget?: string;
  posttargetcomage?: string;
  enddate?: string;
  startdate?: string;
  areaname?: string;
  organizationname?: string;
  supporttype?: string;
  detailurl?: string;
}

interface KStartupResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: KStartupItem | KStartupItem[] };
      totalCount?: number;
    };
  };
}

const KSTARTUP_BASE =
  "http://openapi.kised.or.kr/openapi/service/rest/ContentsService/getAnnouncementList";

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function fetchKStartupGrants(rows = 100): Promise<GrantProgram[]> {
  const key = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!key) throw new Error("DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.");

  const url = new URL(KSTARTUP_BASE);
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", String(rows));
  url.searchParams.set("dataType", "json");
  url.searchParams.set("openYn", "1");

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`K-Startup API 오류: HTTP ${res.status}`);
  }

  const data = (await res.json()) as KStartupResponse;
  const resultCode = data.response?.header?.resultCode;

  if (resultCode && resultCode !== "00") {
    throw new Error(
      data.response?.header?.resultMsg || `K-Startup API 오류 코드: ${resultCode}`
    );
  }

  const items = toArray(data.response?.body?.items?.item);

  return items
    .map((item): GrantProgram | null => {
      const deadline = parseYmd(item.enddate);
      if (!item.postsn || !item.title || !deadline) return null;

      const target = [item.posttarget, item.posttargetcomage]
        .filter(Boolean)
        .join(" · ");

      return {
        id: `kstartup-${item.postsn}`,
        title: item.title,
        source: "K-Startup",
        category: "startup",
        summary: item.biztitle
          ? `${item.biztitle} — ${item.supporttype || "창업지원"}`
          : item.title,
        target: target || "창업기업",
        region: mapRegionName(item.areaname),
        maxAmount: "공고문 참조",
        deadline,
        organizer: item.organizationname || "창업진흥원",
        tags: [item.supporttype, item.biztitle, item.areaname]
          .filter((t): t is string => Boolean(t))
          .slice(0, 6),
        detailUrl: item.detailurl,
      };
    })
    .filter((g): g is GrantProgram => g !== null);
}
