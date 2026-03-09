"use client";

import { useMemo } from "react";
import type { WorkRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type GanttItem = WorkRecord & {
  level: number;
};

function clampLevel(level: number) {
  return Math.min(Math.max(level, 0), 4);
}

function buildHierarchy(records: WorkRecord[]) {
  const byParent = new Map<string, WorkRecord[]>();
  const roots: WorkRecord[] = [];

  for (const record of records) {
    if (record.parentId) {
      byParent.set(record.parentId, [...(byParent.get(record.parentId) ?? []), record]);
    } else {
      roots.push(record);
    }
  }

  const output: GanttItem[] = [];

  function visit(record: WorkRecord, level: number) {
    output.push({ ...record, level: clampLevel(level) });
    for (const child of byParent.get(record.id) ?? []) {
      visit(child, level + 1);
    }
  }

  for (const root of roots) {
    visit(root, 0);
  }

  return output;
}

function daysBetween(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ScheduleGantt({ title, records }: { title: string; records: WorkRecord[] }) {
  const scheduled = useMemo(() => records.filter((record) => record.startDate || record.endDate || record.dueDate), [records]);
  const hierarchy = useMemo(() => buildHierarchy(scheduled), [scheduled]);

  const timeline = useMemo(() => {
    const dates = hierarchy.flatMap((record) => [record.startDate, record.endDate ?? record.dueDate].filter(Boolean).map((value) => new Date(String(value))));
    if (!dates.length) {
      return null;
    }

    const start = new Date(Math.min(...dates.map((item) => item.getTime())));
    const end = new Date(Math.max(...dates.map((item) => item.getTime())));
    const totalDays = Math.max(1, daysBetween(start, end));

    return {
      start,
      end,
      totalDays,
      columns: Array.from({ length: totalDays }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return date;
      })
    };
  }, [hierarchy]);

  if (!timeline || !hierarchy.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Schedule View</p>
          <h2 className="text-lg font-semibold text-slate-950">{title} Gantt</h2>
          <p className="mt-1 text-sm text-slate-600">Five-level hierarchy supported for one integrated WBS. Schedule packages, assets or equipment, and open issues stay visible in the same execution structure.</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>{formatDate(timeline.start.toISOString())} to {formatDate(timeline.end.toISOString())}</p>
          <p>{timeline.totalDays} day window</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[360px_minmax(620px,1fr)] gap-4">
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hierarchy, Asset Context, and Issue Flow</div>
            <div
              className="grid gap-px rounded-xl bg-slate-200"
              style={{ gridTemplateColumns: `repeat(${timeline.columns.length}, minmax(20px, 1fr))` }}
            >
              {timeline.columns.map((date) => (
                <div key={date.toISOString()} className="bg-slate-50 px-1 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {hierarchy.map((record) => {
              const start = new Date(record.startDate ?? record.dueDate ?? timeline.start.toISOString());
              const end = new Date(record.endDate ?? record.dueDate ?? record.startDate ?? timeline.start.toISOString());
              const offset = Math.max(0, daysBetween(timeline.start, start) - 1);
              const span = Math.max(1, daysBetween(start, end));

              return (
                <div key={record.id} className="grid grid-cols-[360px_minmax(620px,1fr)] gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div style={{ paddingLeft: `${record.level * 18}px` }}>
                      <p className="text-sm font-semibold text-slate-950">{record.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{record.owner} | {record.status}</p>
                      {record.assetName || record.checklistTemplate ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {record.assetName ?? record.equipmentType ?? "Asset"}{record.assetStatus ? ` | ${record.assetStatus}` : ""}{record.checklistTemplate ? ` | ${record.checklistTemplate}` : ""}{record.ashraeLevel ? ` | ${record.ashraeLevel}` : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className="grid items-center rounded-xl border border-slate-200 bg-white px-2 py-3"
                    style={{ gridTemplateColumns: `repeat(${timeline.columns.length}, minmax(20px, 1fr))` }}
                  >
                    <div
                      className={`h-6 rounded-lg text-[10px] font-semibold leading-6 text-center ${
                        record.level === 0 ? "bg-brand-steel text-white" : record.level === 1 ? "bg-brand-clay text-white" : "bg-slate-300 text-slate-800"
                      }`}
                      style={{ gridColumn: `${offset + 1} / span ${span}` }}
                      title={`${record.title}: ${formatDate(start.toISOString())} to ${formatDate(end.toISOString())}`}
                    >
                      {typeof record.percentComplete === "number" ? `${record.percentComplete}%` : record.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
