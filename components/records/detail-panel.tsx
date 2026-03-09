import type { StatusEvent } from "@/lib/domain/status-history";
import type { WorkRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function DetailPanel({
  title,
  record,
  comments,
  attachments,
  statusHistory
}: {
  title: string;
  record: WorkRecord | null;
  comments: { id: string; author: string; body: string; createdAt: string }[];
  attachments: { id: string; fileName: string; uploadedBy: string; uploadedAt: string }[];
  statusHistory: StatusEvent[];
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        {record ? (
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Owner:</span> {record.owner}</p>
            <p><span className="font-semibold text-slate-900">Company:</span> {record.company}</p>
            <p><span className="font-semibold text-slate-900">Due Date:</span> {formatDate(record.dueDate)}</p>
            <p><span className="font-semibold text-slate-900">Status:</span> {record.status}</p>
            <p><span className="font-semibold text-slate-900">Area / System:</span> {record.area ?? "-"} / {record.system ?? "-"}</p>
            {record.links?.length ? (
              <div>
                <p className="font-semibold text-slate-900">Linked Records</p>
                <ul className="mt-2 space-y-2">
                  {record.links.map((link) => (
                    <li key={link.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{link.type}: {link.label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Select a record to inspect details, comments, and audit history.</p>
        )}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">Attachments</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          {attachments.length ? attachments.map((item) => <p key={item.id}>{item.fileName} - {item.uploadedBy}</p>) : <p>No attachments yet.</p>}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">Comments</h3>
        <div className="mt-3 space-y-3 text-sm text-slate-600">
          {comments.length ? comments.map((item) => <div key={item.id}><p className="font-semibold text-slate-800">{item.author}</p><p>{item.body}</p></div>) : <p>No comments yet.</p>}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">Audit History</h3>
        <div className="mt-3 space-y-3 text-sm text-slate-600">
          {statusHistory.length ? statusHistory.map((event) => <div key={`${event.recordId}-${event.createdAt}`}><p className="font-semibold text-slate-800">{`${event.fromStatus ?? "None"} -> ${event.toStatus}`}</p><p>{event.note ?? "Status updated."}</p></div>) : <p>No audit events yet.</p>}
        </div>
      </section>
    </aside>
  );
}