import type { KPI } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardGrid({ metrics }: { metrics: KPI[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{metric.value}</p>
          {metric.trend ? (
            <p
              className={cn(
                "mt-3 text-sm font-medium",
                metric.tone === "good" && "text-emerald-700",
                metric.tone === "warning" && "text-amber-700",
                metric.tone === "critical" && "text-red-700",
                (!metric.tone || metric.tone === "neutral") && "text-slate-600"
              )}
            >
              {metric.trend}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
