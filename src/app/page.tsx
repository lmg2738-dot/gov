import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Building2,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/Header";

const FEATURES = [
  {
    icon: Building2,
    title: "기업 프로필",
    desc: "업종·규모·지역·매출을 입력하면 맞춤 필터가 자동 적용됩니다.",
  },
  {
    icon: Sparkles,
    title: "AI 추천",
    desc: "기업마당·K-Startup 공공 API 데이터를 분석해 지원사업을 추천합니다.",
  },
  {
    icon: Bookmark,
    title: "북마크",
    desc: "관심 공고를 저장하고 팀과 공유할 수 있습니다.",
  },
  {
    icon: Bell,
    title: "마감 알림",
    desc: "D-7, D-3, D-1 이메일 알림으로 놓치는 지원금을 방지합니다.",
  },
];

const APIS = ["기업마당", "K-Startup"];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-brand-50)_0%,_transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI 기반 정부지원금 추천 SaaS
            </div>
            <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              놓치고 있는
              <br />
              <span className="text-brand-600">정부지원금</span>을 찾아드립니다
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-muted leading-relaxed">
              업종만 입력하면 AI가 지원사업·정부과제·R&D·교육·세금혜택을 자동 추천합니다.
              사업자를 위한 올인원 정부지원금 플랫폼.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                무료로 체험하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center rounded-xl border border-border bg-white px-6 py-3 text-sm font-medium text-slate-700">
                월 29,000원 · 14일 무료 체험
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
            연동 예정 공공 API
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {APIS.map((api) => (
              <span
                key={api}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                {api}
              </span>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">
              핵심 기능
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl bg-brand-900 p-8 sm:p-12 text-white">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-brand-100">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">시장 규모</span>
                </div>
                <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                  중소·스타트업 400만+ 사업자
                </h2>
                <p className="text-brand-100 max-w-lg">
                  놓친 지원금 1건만으로도 연 수백만 원. 월 2.9만 원으로 ROI를 극대화하세요.
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                {["무제한 AI 추천", "마감 알림 포함", "팀 3인까지 공유"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        GrantFinder © 2026 · 목업 버전
      </footer>
    </div>
  );
}
