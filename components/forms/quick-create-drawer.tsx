export function QuickCreateDrawer({ section, projectId }: { section: string; projectId: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick Create</p>
          <h2 className="text-lg font-semibold text-slate-950">Create new {section} record</h2>
          <p className="mt-1 text-sm text-slate-500">Use this entry point for fast capture in project {projectId}. Owner, due date, and purpose should be visible immediately.</p>
        </div>
        <button className="rounded-xl bg-brand-clay px-4 py-3 text-sm font-semibold text-white shadow-sm">New {section}</button>
      </div>
    </section>
  );
}