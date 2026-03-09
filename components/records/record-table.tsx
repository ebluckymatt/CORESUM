import { formatDate } from "@/lib/utils";
import type { WorkRecord } from "@/lib/types";

export function RecordTable({ title, records }: { title: string; records: WorkRecord[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">Dense operational list built for filtering, export, and bulk follow-up.</p>
        </div>
        <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Export CSV</button>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Owner</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Due</th>
              <th className="px-5 py-3">Priority</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t border-slate-100 align-top">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{record.title}</p>
                  {record.summary ? <p className="mt-1 text-xs text-slate-500">{record.summary}</p> : null}
                </td>
                <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{record.status}</span></td>
                <td className="px-5 py-4">{record.owner}</td>
                <td className="px-5 py-4">{record.company}</td>
                <td className="px-5 py-4">{formatDate(record.dueDate)}</td>
                <td className="px-5 py-4">{record.priority ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
