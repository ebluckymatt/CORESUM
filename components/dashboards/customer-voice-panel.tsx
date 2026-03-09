import type { WorkRecord } from "@/lib/types";

export function CustomerVoicePanel({ section, records }: { section: string; records: WorkRecord[] }) {
  const urgent = records.filter((record) => ["Overdue", "Escalated", "Rejected"].includes(record.status)).slice(0, 2);
  const userVoice = urgent.length
    ? `I can see the problem immediately, but I need the owner and due date to be obvious so I know whether this is under control.`
    : `This view feels calm, but users still need a clear answer to “what do I do next?” on arrival.`;
  const coreTeam = urgent.length
    ? `The product is strongest when it turns hot items into a small number of visible priorities instead of forcing users to scan tables.`
    : `The product needs clearer action cues and stronger workflow affordances so it feels operational, not archival.`;
  const productMove = section === "dashboard"
    ? `Keep the dashboard centered on attention, ownership, and movement. That is what leaders, inspectors, and consultants will judge first.`
    : `Every ${section} screen should help the user identify what is late, who owns it, and what evidence or decision is still missing.`;

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer Voice</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{userVoice}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Core Team Review</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{coreTeam}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Product Move</p>
        <p className="mt-3 text-sm leading-6 text-slate-700">{productMove}</p>
      </article>
    </section>
  );
}
