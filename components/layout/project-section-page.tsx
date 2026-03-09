import type { Route } from "next";
import Link from "next/link";
import { AttentionBoard } from "@/components/dashboards/attention-board";
import { DashboardGrid } from "@/components/dashboards/dashboard-grid";
import { ScheduleGantt } from "@/components/dashboards/schedule-gantt";
import { ProjectNav } from "@/components/layout/project-nav";
import { RecordWorkbench } from "@/components/records/record-workbench";
import { type SessionUserLike } from "@/lib/authz";
import { getAttachments, getComments, getProject, getStatusHistory } from "@/lib/domain/platform-store";
import type { KPI, WorkRecord } from "@/lib/types";
import { getWikiArticleForSection } from "@/lib/wiki";

const apiResourceBySection: Record<string, string | undefined> = {
  actions: "actions",
  issues: "issues",
  risks: "risks",
  quality: "inspections",
  inspections: "inspections",
  deficiencies: "deficiencies",
  engineering: "engineeringRequests",
  documents: "documents",
  meetings: "meetings",
  reports: "reports"
};

const operatingNotesBySection: Record<string, string> = {
  dashboard: "Read this screen as a control room. The first job is to spot aging risk, ownership gaps, and stuck decisions before they become schedule damage.",
  setup: "This section should make accountability and project structure obvious. If ownership is unclear here, every downstream workflow will drift.",
  stakeholders: "Use this register to see who can block, approve, accelerate, or distort work. Stakeholder visibility is execution control, not paperwork.",
  wbs: "This view should act as the single execution backbone. Work packages, assets or equipment status, schedule controls, and field issues should all connect here.",
  milestones: "Milestones matter only when risk, owner, and recovery pressure are visible beside the date.",
  actions: "This screen should answer whether commitments are moving, late, or ownerless without forcing people into meeting notes or email.",
  issues: "A strong issue screen makes aging, impact, and escalation impossible to hide.",
  risks: "The risk register should separate real exposure from passive logging. Mitigation and trigger visibility are the whole point.",
  quality: "Quality control must feel operational: plan the check, capture the evidence, close the gap, verify the result.",
  inspections: "Inspectors need speed and certainty here. If field entry is slow or ambiguous, quality data becomes unreliable.",
  deficiencies: "Deficiency management lives or dies on visible owners, due dates, evidence, and reject or verify discipline.",
  engineering: "Engineering support should reduce cycle time and ambiguity, not become a parking lot for unresolved questions.",
  documents: "Document control only matters if users can trust that the current field basis is visible and approval status is unambiguous.",
  meetings: "Meetings should produce governed decisions and accountable actions, not minutes that disappear after distribution.",
  reports: "Reports should synthesize live project reality, not restate what people already know from the dashboard."
};

export async function ProjectSectionPage({
  projectId,
  section,
  title,
  description,
  records,
  metrics,
  recordType,
  currentUser
}: {
  projectId: string;
  section: string;
  title: string;
  description: string;
  records: WorkRecord[];
  metrics?: KPI[];
  recordType?: string;
  currentUser?: SessionUserLike | null;
}) {
  const guide = getWikiArticleForSection(section);
  const [project, recordMetaEntries] = await Promise.all([
    getProject(projectId, currentUser),
    Promise.all(
      records.map(async (record) => {
        if (!recordType) {
          return [record.id, { comments: [], attachments: [], statusHistory: [] }] as const;
        }

        const [comments, attachments, statusHistory] = await Promise.all([
          getComments(recordType, record.id),
          getAttachments(recordType, record.id),
          getStatusHistory(recordType, record.id)
        ]);

        return [record.id, { comments, attachments, statusHistory }] as const;
      })
    )
  ]);

  const recordMeta = Object.fromEntries(recordMetaEntries);
  const guideHref = guide ? `/wiki/${guide.slug}` : undefined;
  const guideLabel = guide ? `Open ${guide.title}` : undefined;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px_320px] xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{project?.code} - {project?.phase ?? "Project"}</p>
          <h1 className="text-3xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operating Note</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{operatingNotesBySection[section] ?? operatingNotesBySection.dashboard}</p>
        </div>
        <div className="rounded-2xl border border-brand-steel/20 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workflow Guide</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">{guide?.summary ?? "Use the in-app user guide to train users on the exact workflow for this screen."}</p>
          {guideHref ? <Link href={guideHref as Route} className="mt-4 inline-flex rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">{guideLabel}</Link> : <Link href={"/wiki" as Route} className="mt-4 inline-flex rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Open User Guide</Link>}
        </div>
      </div>
      <ProjectNav projectId={projectId} active={section} />
      {metrics ? <DashboardGrid metrics={metrics} /> : null}
      <AttentionBoard section={section} records={records} />
      {section === "wbs" || section === "milestones" ? <ScheduleGantt title={title} records={records} /> : null}
      <RecordWorkbench
        projectId={projectId}
        section={section}
        title={title}
        records={records}
        recordMeta={recordMeta}
        apiResource={apiResourceBySection[section]}
        guideHref={guideHref}
        guideLabel={guideLabel}
      />
    </div>
  );
}
