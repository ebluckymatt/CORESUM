export function GlobalFilterBar() {
  const fields = ["Project", "Area", "Discipline", "System", "Owner", "Status"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {fields.map((field) => (
          <label key={field} className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {field}
            <input
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-0"
              placeholder={`Filter ${field.toLowerCase()}`}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
