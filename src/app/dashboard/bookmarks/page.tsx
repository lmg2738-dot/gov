"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { ApiStatusBanner, GrantCard } from "@/components/GrantCard";
import { useGrants } from "@/hooks/use-grants";
import { useBookmarks, useNotifications } from "@/hooks/use-storage";

export default function BookmarksPage() {
  const { bookmarks, toggle, hydrated } = useBookmarks();
  const { toggleNotification, isNotifying } = useNotifications();
  const { grants, meta, loading, error } = useGrants();

  const saved = useMemo(
    () => grants.filter((g) => bookmarks.includes(g.id)),
    [bookmarks, grants]
  );

  return (
    <div>
      <ApiStatusBanner meta={meta} error={error} />

      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-amber-600">
          <Bookmark className="h-5 w-5" />
          <span className="text-sm font-medium">북마크</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">저장한 지원사업</h1>
        <p className="mt-1 text-sm text-muted">
          관심 공고 {saved.length}건 · 마감 알림과 함께 관리하세요
        </p>
      </div>

      {loading || !hydrated ? (
        <div className="py-20 text-center text-muted">불러오는 중...</div>
      ) : saved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Bookmark className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="mb-4 text-muted">아직 북마크한 공고가 없습니다.</p>
          <Link
            href="/dashboard"
            className="inline-flex rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            AI 추천 보러가기
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {saved.map((grant) => (
            <GrantCard
              key={grant.id}
              grant={grant}
              showMatch={false}
              bookmarked
              notifying={isNotifying(grant.id)}
              onToggleBookmark={() => toggle(grant.id)}
              onToggleNotification={() =>
                toggleNotification(grant.id, "user@company.com")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
