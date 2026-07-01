"use client";

import { useMemo } from "react";
import { Bell, Mail } from "lucide-react";
import { ApiStatusBanner } from "@/components/GrantCard";
import { DeadlineBadge } from "@/components/Badge";
import { useGrants } from "@/hooks/use-grants";
import { useNotifications } from "@/hooks/use-storage";
import { formatDate, getDeadlineLabel } from "@/lib/recommend";

export default function NotificationsPage() {
  const { notifications, toggleNotification, hydrated } = useNotifications();
  const { grants, meta, loading, error } = useGrants();

  const items = useMemo(() => {
    return notifications
      .filter((n) => n.enabled)
      .map((n) => {
        const grant = grants.find((g) => g.id === n.grantId);
        if (!grant) return null;
        return { ...n, grant };
      })
      .filter(Boolean) as Array<{
      grantId: string;
      daysBefore: number[];
      email: string;
      enabled: boolean;
      grant: (typeof grants)[0];
    }>;
  }, [notifications, grants]);

  return (
    <div>
      <ApiStatusBanner meta={meta} error={error} />

      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-brand-600">
          <Bell className="h-5 w-5" />
          <span className="text-sm font-medium">마감 알림</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">알림 설정 현황</h1>
        <p className="mt-1 text-sm text-muted">
          D-7, D-3, D-1 이메일 알림 (이메일 발송은 추후 연동)
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-slate-900">알림 수신 이메일</p>
            <p className="text-sm text-muted">user@company.com</p>
          </div>
        </div>
      </div>

      {loading || !hydrated ? (
        <div className="py-20 text-center text-muted">불러오는 중...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-muted">
            설정된 마감 알림이 없습니다. 추천 목록에서 🔔 버튼을 눌러 설정하세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ grant, daysBefore, email }) => {
            const deadline = getDeadlineLabel(grant.deadline);
            return (
              <div
                key={grant.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <DeadlineBadge label={deadline.label} urgency={deadline.urgency} />
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {grant.source}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate">{grant.title}</h3>
                  <p className="mt-1 text-sm text-muted">
                    마감 {formatDate(grant.deadline)} · {email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {daysBefore.map((d) => (
                      <span
                        key={d}
                        className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
                      >
                        D-{d}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification(grant.id, email)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    해제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
