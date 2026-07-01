"use client";

import { Bell, Bookmark, ChevronRight, ExternalLink } from "lucide-react";
import type { GrantProgram } from "@/types";
import {
  CategoryBadge,
  DeadlineBadge,
  MatchScore,
  SourceBadge,
} from "@/components/Badge";
import { formatDate, getDeadlineLabel } from "@/lib/recommend";
import { cn } from "@/lib/utils";

interface GrantCardProps {
  grant: GrantProgram;
  bookmarked?: boolean;
  notifying?: boolean;
  onToggleBookmark?: () => void;
  onToggleNotification?: () => void;
  showMatch?: boolean;
  compact?: boolean;
}

export function GrantCard({
  grant,
  bookmarked = false,
  notifying = false,
  onToggleBookmark,
  onToggleNotification,
  showMatch = true,
  compact = false,
}: GrantCardProps) {
  const deadline = getDeadlineLabel(grant.deadline);

  return (
    <article
      className={cn(
        "group animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        compact && "p-4"
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={grant.category} />
          <SourceBadge source={grant.source} />
          <DeadlineBadge label={deadline.label} urgency={deadline.urgency} />
        </div>
        <div className="flex gap-1">
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              aria-label={bookmarked ? "북마크 해제" : "북마크"}
              className={cn(
                "rounded-lg p-2 transition-colors",
                bookmarked
                  ? "bg-amber-50 text-amber-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
            >
              <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
            </button>
          )}
          {onToggleNotification && (
            <button
              type="button"
              onClick={onToggleNotification}
              aria-label={notifying ? "알림 해제" : "마감 알림 설정"}
              className={cn(
                "rounded-lg p-2 transition-colors",
                notifying
                  ? "bg-brand-50 text-brand-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              )}
            >
              <Bell className={cn("h-4 w-4", notifying && "fill-current")} />
            </button>
          )}
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-snug text-slate-900 group-hover:text-brand-700 transition-colors">
        {grant.title}
      </h3>

      {!compact && (
        <p className="mb-4 text-sm leading-relaxed text-muted line-clamp-2">
          {grant.summary}
        </p>
      )}

      {showMatch && grant.matchScore !== undefined && (
        <div className="mb-4 rounded-xl bg-brand-50/60 border border-brand-100 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-brand-700">AI 매칭 점수</span>
            <MatchScore score={grant.matchScore} />
          </div>
          {grant.matchReason && (
            <p className="text-xs text-brand-600/80">{grant.matchReason}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted mb-0.5">지원대상</p>
          <p className="font-medium text-slate-800 truncate">{grant.target}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-0.5">지원규모</p>
          <p className="font-medium text-slate-800">{grant.maxAmount}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-0.5">마감일</p>
          <p className="font-medium text-slate-800">{formatDate(grant.deadline)}</p>
        </div>
        <div>
          <p className="text-xs text-muted mb-0.5">주관기관</p>
          <p className="font-medium text-slate-800 truncate">{grant.organizer}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {grant.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted">
          {grant.region === "전국" ? "전국 대상" : `${grant.region} 지역`}
        </span>
        {grant.detailUrl ? (
          <a
            href={grant.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            상세보기
            <ChevronRight className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-sm text-muted">상세 URL 없음</span>
        )}
      </div>
    </article>
  );
}

import type { GrantsApiMeta } from "@/lib/api/utils";

export function ApiStatusBanner({
  meta,
  error,
}: {
  meta: GrantsApiMeta | null;
  error?: string | null;
}) {
  if (error) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <ExternalLink className="h-4 w-4 shrink-0" />
        <p>
          <strong>API 오류</strong> — {error}
        </p>
      </div>
    );
  }

  if (!meta) return null;

  const parts = [
    meta.bizinfo.ok
      ? `기업마당 ${meta.bizinfo.count}건`
      : `기업마당 실패`,
    meta.kstartup.ok
      ? `K-Startup ${meta.kstartup.count}건`
      : `K-Startup 실패`,
  ];

  const hasFailure = !meta.bizinfo.ok || !meta.kstartup.ok;

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm",
        hasFailure
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      )}
    >
      <ExternalLink className="h-4 w-4 shrink-0" />
      <p>
        <strong>실시간 API 연동</strong> — {parts.join(" · ")}
        {hasFailure && " (일부 소스 조회 실패)"}
      </p>
    </div>
  );
}
