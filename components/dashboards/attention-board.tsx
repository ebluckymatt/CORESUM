import type { WorkRecord } from "@/lib/types";
import { daysUntil, formatDate } from "@/lib/utils";

type HotRecord = WorkRecord & { urgencyScore: number };

function urgencyScore(record: WorkRecord) {
  let score = 0;
  const status = record.status.toLowerCase();
  const priority = (record.priority ?? "").toLowerCase();
  const severity = (record.severity ?? "").toLowerCase();
  const dueInDays = daysUntil(record.dueDate);

  if (status.includes("escalated") || status.includes("rejected") || status.includes("overdue")) score += 40;
  if (status.includes("review") || status.includes("assigned") || status.includes("ready")) score += 12;
  if (priority.includes("critical")) score += 18;
  if (priority.includes("high")) score += 10;
  if (severity.includes("critical")) score += 16;
  if (severity.includes("high")) score += 8;
  if (typeof dueInDays === "number") {
    if (dueInDays < 0) score += 20;
    else if (dueInDays <= 3) score += 12;
    else if (dueInDays <= 7) score += 6;
  }
  score += Math.min(record.ageDays ?? 0, 10);

  return score;
}

function nextAction(record: WorkRecord) {
  const status = record.status.toLowerCase();
  if (status.includes("escalated") || status.includes("overdue")) return "Recovery plan and owner follow-up required.";
  if (status.includes("rejected")) return "Closure evidence was not accepted. Rework and re-verify.";
  if (status.includes("ready") || status.includes("awaiting")) return "Verification is the next move.";
  if (status.includes("review")) return "Decision or technical response is blocking progress.";
  if (status.includes("assigned")) return "Responsible party has the work. Monitor evidence and due date.";
  return "Maintain movement and close the record cleanly.";
}

export function AttentionBoard({ section, records }: { section: string; records: WorkRecord[] }) {
  const hotRecords: HotRecord[] = [...records]
    .map((record) => ({ ...record, urgencyScore: urgencyScore(record) }))
    .sort((left, right) => right.urgencyScore - left.urgencyScore)
    .slice(0, 3);

  const lateCount = records.filter((record) => {
    const dueInDays = daysUntil(record.dueDate);
    return typeof dueInDays === "number" && dueInDays < 0 && !record.status.toLowerCase().includes("closed");
  }).length;
  const highPriorityCount = records.filter((record) => {
    const priority = (record.priority ?? "").toLowerCase();
    const severity = (record.severity ?? "").toLowerCase();
    return priority.includes("critical") || priority.includes("high") || severity.includes("critical");
  }).length;
  const reviewQueueCount = records.filter((record) => {
    const status = record.status.toLowerCase();
    return status.includes("review") || status.includes("ready") || status.includes("awaiting");
  }).length;

  const title = section === "dashboard" ? "Immediate Attention" : "Control Focus";
  const description = section === "dashboard"
    ? "Start with the items that can damage milestone confidence, closure rate, or stakeholder trust this week."
    : "Use this board to identify the record most likely to slow field execution or create management friction next.";

  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{description}</p>
        <div className="mt-5 space-y-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Late or Escalated</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{lateCount}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">High Priority</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{highPriorityCount}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Waiting Review</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{reviewQueueCount}</p>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority Queue</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">What deserves attention first</h2>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Top {hotRecords.length}</p>
        </div>

        <div className="mt-5 space-y-4">
          {hotRecords.length ? hotRecords.map((record) => (
            <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-950">{record.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{record.owner} - {record.company}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">{record.status}</span>
              </div>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                <p><span className="font-semibold text-slate-900">Due:</span> {formatDate(record.dueDate)}</p>
                <p><span className="font-semibold text-slate-900">Priority:</span> {record.priority ?? "Standard"}</p>
                <p><span className="font-semibold text-slate-900">System:</span> {record.system ?? "Not set"}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{nextAction(record)}</p>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No urgent records are visible in this view. Use filters below to focus on a specific owner, status, or due date window.
            </div>
          )}
        </div>
      </article>
    </section>
  );
}