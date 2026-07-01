import type { GrantCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<GrantCategory, string> = {
  support: "bg-blue-50 text-blue-700 border-blue-100",
  rnd: "bg-purple-50 text-purple-700 border-purple-100",
  education: "bg-amber-50 text-amber-700 border-amber-100",
  tax: "bg-emerald-50 text-emerald-700 border-emerald-100",
  startup: "bg-rose-50 text-rose-700 border-rose-100",
};

export function CategoryBadge({ category }: { category: GrantCategory }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        CATEGORY_STYLES[category]
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
      {source}
    </span>
  );
}

export function MatchScore({ score }: { score: number }) {
  const color =
    score >= 85 ? "text-emerald-600" : score >= 70 ? "text-brand-600" : "text-amber-600";

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-2 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-brand-500" : "bg-amber-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn("text-sm font-semibold tabular-nums", color)}>{score}%</span>
    </div>
  );
}

export function DeadlineBadge({
  label,
  urgency,
}: {
  label: string;
  urgency: "critical" | "warning" | "normal" | "expired";
}) {
  const styles = {
    critical: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    normal: "bg-slate-50 text-slate-600 border-slate-200",
    expired: "bg-slate-100 text-slate-400 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        styles[urgency]
      )}
    >
      {label}
    </span>
  );
}
