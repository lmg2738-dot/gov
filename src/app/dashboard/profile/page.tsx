"use client";

import { Building2 } from "lucide-react";
import { ProfileForm } from "@/components/ProfileForm";
import { useProfile } from "@/hooks/use-storage";
import { COMPANY_SIZE_LABELS } from "@/types";

export default function ProfilePage() {
  const { value: profile, setValue, hydrated } = useProfile();

  return (
    <div>
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        기업마당 API 연동 완료
      </div>

      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2 text-slate-600">
          <Building2 className="h-5 w-5" />
          <span className="text-sm font-medium">기업 프로필</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">회사 정보 설정</h1>
        <p className="mt-1 text-sm text-muted">
          프로필을 저장하면 AI 추천 결과가 즉시 반영됩니다.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-border bg-white p-6">
          {!hydrated ? (
            <div className="py-12 text-center text-muted">불러오는 중...</div>
          ) : (
            <ProfileForm
              profile={profile}
              onChange={setValue}
              submitLabel="프로필 저장 및 AI 재추천"
            />
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold text-slate-900">현재 프로필 요약</h2>
            {hydrated && (
              <dl className="space-y-3 text-sm">
                {[
                  ["회사명", profile.companyName || "(미입력)"],
                  ["업종", profile.industry],
                  ["규모", COMPANY_SIZE_LABELS[profile.companySize]],
                  ["지역", profile.region],
                  ["직원 수", `${profile.employeeCount}명`],
                  ["연 매출", profile.annualRevenue],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                    <dt className="text-muted">{key}</dt>
                    <dd className="font-medium text-slate-900 text-right">{val}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="rounded-2xl bg-brand-900 p-6 text-white">
            <p className="text-sm text-brand-100 mb-1">구독 플랜</p>
            <p className="text-2xl font-bold mb-2">월 29,000원</p>
            <ul className="space-y-1.5 text-sm text-brand-100">
              <li>· 무제한 AI 추천</li>
              <li>· 마감 알림 포함</li>
              <li>· 기업마당 API</li>
            </ul>
            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-brand-900 hover:bg-brand-50 transition-colors"
              onClick={() => alert("목업: 결제 연동 예정")}
            >
              구독 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
