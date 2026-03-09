import type { Route } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { getProjects } from "@/lib/domain/platform-store";

function projectAttentionScore(project: { openIssues: number; overdueActions: number; openDeficiencies: number }) {
  return project.overdueActions * 3 + project.openIssues * 2 + project.openDeficiencies;
}

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await getProjects(session?.user ?? null);
  const rankedProjects = [...projects].sort((left, right) => projectAttentionScore(right) - projectAttentionScore(left));
  const topProject = rankedProjects[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Portfolio</p>
          <h1 className="text-3xl font-semibold text-slate-950">Projects</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Purpose-built workspaces for field execution, accountability, technical control, and leadership visibility.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Control Principle</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">A project list is only useful if it helps the user decide where to go first. This view ranks work by attention demand, not by administrative order.</p>
          <Link href={"/wiki" as Route} className="mt-4 inline-flex rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Open User Guide</Link>
        </div>
      </section>

      {!topProject ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">First Run</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">No projects yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              This workspace is starting clean. Create the first project to activate the portfolio, then assign users and project memberships before field teams begin using the platform.
            </p>
            <div className="mt-6">
              <ProjectCreateForm />
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recommended Next Steps</p>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>1. Create the first project workspace.</li>
              <li>2. Open <Link href={"/admin/users" as Route} className="font-semibold text-brand-steel underline-offset-2 hover:underline">Admin Users</Link> and add your internal team.</li>
              <li>3. Assign project memberships and roles before inviting field use.</li>
              <li>4. Use the <Link href={"/wiki/getting-started-admin" as Route} className="font-semibold text-brand-steel underline-offset-2 hover:underline">admin rollout guide</Link> to complete setup.</li>
            </ol>
          </aside>
        </section>
      ) : null}

      {topProject ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Needs Review First</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{topProject.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{topProject.code} | {topProject.phase} | Sponsor: {topProject.sponsor}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/projects/${topProject.id}`} className="rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Open Priority Workspace</Link>
              <Link href={`/projects/${topProject.id}/issues`} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">Review Hot Issues</Link>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open Issues</p><p className="mt-2 text-2xl font-semibold text-slate-950">{topProject.openIssues}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overdue Actions</p><p className="mt-2 text-2xl font-semibold text-slate-950">{topProject.overdueActions}</p></div>
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open Deficiencies</p><p className="mt-2 text-2xl font-semibold text-slate-950">{topProject.openDeficiencies}</p></div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {rankedProjects.map((project) => (
          <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{project.code}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{project.name}</h2>
                <p className="mt-2 text-sm text-slate-600">Phase: {project.phase} | Sponsor: {project.sponsor}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{project.health}</span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open Issues</p><p className="mt-2 text-2xl font-semibold text-slate-950">{project.openIssues}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overdue Actions</p><p className="mt-2 text-2xl font-semibold text-slate-950">{project.overdueActions}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open Deficiencies</p><p className="mt-2 text-2xl font-semibold text-slate-950">{project.openDeficiencies}</p></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/projects/${project.id}`} className="rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Open Workspace</Link>
              <Link href={`/projects/${project.id}/issues`} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">Review Issues</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
