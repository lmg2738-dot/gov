import type { GrantProgram, UserProfile } from "@/types";

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr);
  deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function recommendGrants(
  profile: UserProfile,
  grants: GrantProgram[]
): GrantProgram[] {
  const sizeKeywords: Record<UserProfile["companySize"], string[]> = {
    startup: ["창업", "예비", "스타트업", "딥테크"],
    small: ["중소", "소기업", "강소"],
    medium: ["중기업", "중소·중견"],
    large: ["대기업"],
  };

  const industryKeywords = profile.industry
    .split(/[·\s]/)
    .filter(Boolean)
    .map((k) => k.toLowerCase());

  const scored = grants.map((grant) => {
    let score = 50;
    const reasons: string[] = [];

    if (grant.region === "전국" || grant.region === profile.region) {
      score += 15;
      if (grant.region === profile.region) {
        reasons.push(`${profile.region} 지역 우대`);
      }
    } else {
      score -= 20;
    }

    const grantText =
      `${grant.title} ${grant.summary} ${grant.tags.join(" ")} ${grant.target}`.toLowerCase();

    for (const kw of industryKeywords) {
      if (grantText.includes(kw)) {
        score += 12;
        reasons.push(`${profile.industry} 업종 연관`);
        break;
      }
    }

    for (const kw of sizeKeywords[profile.companySize]) {
      if (grantText.includes(kw.toLowerCase())) {
        score += 10;
        reasons.push(
          `${profile.companySize === "startup" ? "창업 단계" : "기업 규모"} 적합`
        );
        break;
      }
    }

    const days = daysUntil(grant.deadline);
    if (days <= 14) {
      score += 8;
      reasons.push("마감 임박");
    } else if (days <= 30) {
      score += 4;
    }

    if (days < 0) score -= 50;

    const uniqueReasons = [...new Set(reasons)].slice(0, 3);
    const matchReason =
      uniqueReasons.length > 0
        ? uniqueReasons.join(" · ")
        : "프로필 기반 일반 추천";

    return {
      ...grant,
      matchScore: Math.min(99, Math.max(0, score)),
      matchReason,
    };
  });

  return scored
    .filter((g) => daysUntil(g.deadline) >= 0)
    .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}

export function getDeadlineLabel(deadline: string): {
  label: string;
  urgency: "critical" | "warning" | "normal" | "expired";
} {
  const days = daysUntil(deadline);
  if (days < 0) return { label: "마감", urgency: "expired" };
  if (days === 0) return { label: "오늘 마감", urgency: "critical" };
  if (days <= 7) return { label: `D-${days}`, urgency: "critical" };
  if (days <= 30) return { label: `D-${days}`, urgency: "warning" };
  return { label: `D-${days}`, urgency: "normal" };
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
