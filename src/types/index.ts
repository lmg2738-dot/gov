export type GrantCategory =
  | "support"
  | "rnd"
  | "education"
  | "tax"
  | "startup";

export type GrantSource = "기업마당" | "K-Startup";

export type CompanySize = "startup" | "small" | "medium" | "large";

export type Region =
  | "서울"
  | "경기"
  | "인천"
  | "부산"
  | "대구"
  | "광주"
  | "대전"
  | "울산"
  | "세종"
  | "강원"
  | "충북"
  | "충남"
  | "전북"
  | "전남"
  | "경북"
  | "경남"
  | "제주"
  | "전국";

export interface UserProfile {
  companyName: string;
  industry: string;
  companySize: CompanySize;
  region: Region;
  employeeCount: number;
  annualRevenue: string;
}

export interface GrantProgram {
  id: string;
  title: string;
  source: GrantSource;
  category: GrantCategory;
  summary: string;
  target: string;
  region: Region | "전국";
  maxAmount: string;
  deadline: string;
  organizer: string;
  tags: string[];
  detailUrl?: string;
  matchScore?: number;
  matchReason?: string;
}

export interface NotificationSetting {
  grantId: string;
  daysBefore: number[];
  email: string;
  enabled: boolean;
}

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  startup: "예비·초기 창업 (3년 미만)",
  small: "소기업",
  medium: "중기업",
  large: "대기업",
};

export const CATEGORY_LABELS: Record<GrantCategory, string> = {
  support: "지원사업",
  rnd: "R&D",
  education: "교육·훈련",
  tax: "세금혜택",
  startup: "창업지원",
};

export const INDUSTRY_OPTIONS = [
  "IT·소프트웨어",
  "제조업",
  "바이오·헬스케어",
  "유통·커머스",
  "콘텐츠·미디어",
  "건설·부동산",
  "금융·핀테크",
  "식품·외식",
  "물류·운송",
  "기타",
];

export const REVENUE_OPTIONS = [
  "10억 미만",
  "10억~50억",
  "50억~100억",
  "100억~300억",
  "300억 이상",
];
