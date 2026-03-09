import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminUser } from "@/lib/authz";
import { getLookups } from "@/lib/domain/platform-store";

export default async function AdminTemplatesPage() {
  const session = await auth();

  if (!isAdminUser(session?.user)) {
    redirect("/projects");
  }

  const lookups = await getLookups();

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Administration</p>
          <h1 className="text-3xl font-semibold text-slate-950">Templates and Control Defaults</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Reference the current role, status, and classification defaults that drive project setup and record behavior.</p>
        </div>
        <div className="rounded-2xl border border-brand-steel/20 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Guide</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">Use the user guide together with these defaults when onboarding teams into the platform.</p>
          <Link href={"/wiki" as Route} className="mt-4 inline-flex rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Open User Guide</Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Roles</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {lookups.roles.map((role) => <div key={role} className="rounded-xl bg-slate-50 px-3 py-2">{role}</div>)}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Companies</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {lookups.companies.map((company) => <div key={company} className="rounded-xl bg-slate-50 px-3 py-2">{company}</div>)}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Disciplines</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {lookups.disciplines.map((discipline) => <div key={discipline} className="rounded-xl bg-slate-50 px-3 py-2">{discipline}</div>)}
          </div>
        </section>
      </div>
    </div>
  );
}