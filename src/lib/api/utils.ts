import type { GrantCategory, GrantProgram, Region } from "@/types";

const REGION_MAP: Record<string, Region> = {
  서울: "서울",
  서울특별시: "서울",
  경기: "경기",
  경기도: "경기",
  인천: "인천",
  인천광역시: "인천",
  부산: "부산",
  부산광역시: "부산",
  대구: "대구",
  대구광역시: "대구",
  광주: "광주",
  광주광역시: "광주",
  대전: "대전",
  대전광역시: "대전",
  울산: "울산",
  울산광역시: "울산",
  세종: "세종",
  세종특별자치시: "세종",
  강원: "강원",
  강원도: "강원",
  강원특별자치도: "강원",
  충북: "충북",
  충청북도: "충북",
  충남: "충남",
  충청남도: "충남",
  전북: "전북",
  전라북도: "전북",
  전북특별자치도: "전북",
  전남: "전남",
  전라남도: "전남",
  경북: "경북",
  경상북도: "경북",
  경남: "경남",
  경상남도: "경남",
  제주: "제주",
  제주도: "제주",
  제주특별자치도: "제주",
};

export function mapRegionName(name?: string): Region | "전국" {
  if (!name || name.includes("전국") || name === "중앙부처") return "전국";
  for (const [key, region] of Object.entries(REGION_MAP)) {
    if (name.includes(key)) return region;
  }
  return "전국";
}

export function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDateRangeEnd(range?: string): string {
  if (!range) return "";
  const parts = range.split("~").map((s) => s.trim());
  const end = parts[parts.length - 1];
  const compact = end.replace(/[^\d]/g, "");
  if (compact.length === 8) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(end)) return end;
  return "";
}

export function parseYmd(ymd?: string): string {
  if (!ymd) return "";
  const compact = ymd.replace(/[^\d]/g, "");
  if (compact.length !== 8) return "";
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

export function mapBizinfoCategory(lclas?: string): GrantCategory {
  switch (lclas) {
    case "기술":
      return "rnd";
    case "인력":
      return "education";
    case "금융":
    case "수출":
    case "경영":
    case "내수":
    default:
      return "support";
  }
}

export function parseHashtags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function extractAmount(summary: string): string {
  const patterns = [
    /최대\s*[\d,.]+\s*억\s*원/,
    /최대\s*[\d,.]+\s*천\s*만\s*원/,
    /[\d,.]+\s*억\s*원/,
    /기업당\s*최대\s*[^<\n.]{2,20}/,
  ];
  for (const p of patterns) {
    const m = summary.match(p);
    if (m) return m[0].trim();
  }
  return "공고문 참조";
}

export interface GrantsApiMeta {
  bizinfo: { ok: boolean; count: number; error?: string };
  fetchedAt: string;
}

export interface GrantsApiResponse {
  grants: GrantProgram[];
  meta: GrantsApiMeta;
}
