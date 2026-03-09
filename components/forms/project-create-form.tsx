"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ProjectCreateForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("Startup");
  const [sponsor, setSponsor] = useState("Halo Technical Solutions Global");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim() || undefined,
          name: name.trim() || undefined,
          phase,
          sponsor: sponsor.trim() || undefined
        })
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to create project.");
      }

      router.push(`/projects/${json.data.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="text-sm text-slate-700">
        Project code
        <input
          name="code"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
          placeholder="HTSG-001"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </label>

      <label className="text-sm text-slate-700">
        Project name
        <input
          name="name"
          required
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
          placeholder="New project"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Phase
          <select
            name="phase"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            value={phase}
            onChange={(event) => setPhase(event.target.value)}
          >
            <option value="Startup">Startup</option>
            <option value="Planning">Planning</option>
            <option value="Field Execution">Field Execution</option>
            <option value="Commissioning">Commissioning</option>
            <option value="Closeout">Closeout</option>
          </select>
        </label>

        <label className="text-sm text-slate-700">
          Sponsor
          <input
            name="sponsor"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            value={sponsor}
            onChange={(event) => setSponsor(event.target.value)}
          />
        </label>
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">
          {pending ? "Creating..." : "Create First Project"}
        </button>
      </div>
    </form>
  );
}
