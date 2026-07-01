"use client";

import { useState } from "react";
import type { UserProfile } from "@/types";
import {
  COMPANY_SIZE_LABELS,
  INDUSTRY_OPTIONS,
  REVENUE_OPTIONS,
  type Region,
} from "@/types";

const REGIONS: Region[] = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산",
  "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

interface ProfileFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  onSubmit?: () => void;
  submitLabel?: string;
}

export function ProfileForm({
  profile,
  onChange,
  onSubmit,
  submitLabel = "프로필 저장",
}: ProfileFormProps) {
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    onChange({ ...profile, [key]: value });
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          회사명
        </label>
        <input
          type="text"
          value={profile.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          placeholder="(주)그랜트파인더"
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          업종
        </label>
        <select
          value={profile.industry}
          onChange={(e) => update("industry", e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          기업 규모
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.entries(COMPANY_SIZE_LABELS) as [UserProfile["companySize"], string][]).map(
            ([value, label]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  profile.companySize === value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-border bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="companySize"
                  value={value}
                  checked={profile.companySize === value}
                  onChange={() => update("companySize", value)}
                  className="accent-brand-600"
                />
                {label}
              </label>
            )
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            소재 지역
          </label>
          <select
            value={profile.region}
            onChange={(e) => update("region", e.target.value as Region)}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            직원 수
          </label>
          <input
            type="number"
            min={1}
            max={10000}
            value={profile.employeeCount}
            onChange={(e) => update("employeeCount", Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          연 매출 규모
        </label>
        <select
          value={profile.annualRevenue}
          onChange={(e) => update("annualRevenue", e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {REVENUE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        {saved ? "✓ 저장됨" : submitLabel}
      </button>
    </form>
  );
}
