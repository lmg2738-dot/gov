"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, RefreshCw, Sparkles } from "lucide-react";
import { ApiStatusBanner, GrantCard } from "@/components/GrantCard";
import { useGrants } from "@/hooks/use-grants";
import { useBookmarks, useNotifications, useProfile } from "@/hooks/use-storage";
import { recommendGrants } from "@/lib/recommend";
import { CATEGORY_LABELS, type GrantCategory, type GrantProgram } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIES: (GrantCategory | "all")[] = [
  "all",
  "support",
  "startup",
  "rnd",
  "education",
  "tax",
];

export default function DashboardPage() {
  const { value: profile, hydrated: profileReady } = useProfile();
  const { toggle, isBookmarked, hydrated: bookmarkReady } = useBookmarks();
  const { toggleNotification, isNotifying, hydrated: notifyReady } = useNotifications();
  const { grants, meta, loading, error, reload } = useGrants();
  const [category, setCategory] = useState<GrantCategory | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState<GrantProgram[]>([]);
  const [aiStatus, setAiStatus] = useState<{
    used: boolean;
    model?: string;
    loading: boolean;
    message?: string;
  }>({ used: false, loading: false });

  const runAiRecommend = useCallback(
    async (grantList: GrantProgram[]) => {
      if (!profileReady || grantList.length === 0) return;

      const ruleBased = recommendGrants(profile, grantList);
      setRecommendations(ruleBased);

      setAiStatus({ used: false, loading: true });
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, grants: grantList }),
        });
        const data = await res.json();

        if (res.ok && data.grants) {
          setRecommendations(data.grants);
          setAiStatus({
            used: data.aiUsed,
            model: data.model,
            loading: false,
            message: data.aiUsed
              ? undefined
              : data.fallbackReason ?? "규칙 기반 추천 사용",
          });
        } else {
          setAiStatus({
            used: false,
            loading: false,
            message: data.error ?? "AI 추천 실패 — 규칙 기반 사용",
          });
        }
      } catch {
        setAiStatus({
          used: false,
          loading: false,
          message: "AI 추천 실패 — 규칙 기반 사용",
        });
      }
    },
    [profile, profileReady]
  );

  useEffect(() => {
    if (!loading && grants.length > 0 && profileReady) {
      runAiRecommend(grants);
    } else if (!loading && grants.length === 0) {
      setRecommendations([]);
    }
  }, [grants, loading, profileReady, runAiRecommend]);

  const filtered = useMemo(() => {
    if (category === "all") return recommendations;
    return recommendations.filter((g) => g.category === category);
  }, [recommendations, category]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const ready = profileReady && bookmarkReady && notifyReady && !loading;
  const sourceCount = [meta?.bizinfo.ok, meta?.kstartup.ok].filter(Boolean).length;

  return (
    <div>
      <ApiStatusBanner meta={meta} error={error} />

      {aiStatus.loading && (
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          OpenRouter 무료 모델로 AI 추천 분석 중...
        </div>
      )}
      {!aiStatus.loading && aiStatus.message && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          {aiStatus.message}
        </div>
      )}
      {!aiStatus.loading && aiStatus.used && aiStatus.model && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          AI 추천 완료 — <span className="font-medium">{aiStatus.model}</span> (무료)
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-brand-600">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">AI 맞춤 추천</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile.companyName || "내 기업"}을 위한 지원사업
          </h1>
          <p className="mt-1 text-sm text-muted">
            {profile.industry} · {profile.region} · 직원 {profile.employeeCount}명 기준
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading || aiStatus.loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              (refreshing || loading || aiStatus.loading) && "animate-spin"
            )}
          />
          새로고침
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "추천 공고", value: filtered.length },
          {
            label: "마감 30일 이내",
            value: filtered.filter((g) => {
              const d = Math.ceil(
                (new Date(g.deadline).getTime() - Date.now()) / 86400000
              );
              return d <= 30 && d >= 0;
            }).length,
          },
          {
            label: "최고 매칭",
            value: filtered[0]?.matchScore ? `${filtered[0].matchScore}%` : "-",
          },
          { label: "연동 API", value: `${sourceCount}개` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-white px-4 py-3"
          >
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 shrink-0 text-muted" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-border bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            {cat === "all" ? "전체" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {!ready ? (
        <div className="py-20 text-center text-muted">공고를 불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-muted">해당 분야 추천 공고가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filtered.map((grant, i) => (
            <div key={grant.id} style={{ animationDelay: `${i * 50}ms` }}>
              <GrantCard
                grant={grant}
                bookmarked={isBookmarked(grant.id)}
                notifying={isNotifying(grant.id)}
                onToggleBookmark={() => toggle(grant.id)}
                onToggleNotification={() =>
                  toggleNotification(grant.id, "user@company.com")
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
