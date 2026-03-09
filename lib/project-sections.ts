import { getCollection, getDashboard, getMilestones, getProject, getStakeholders, getWbsItems } from "@/lib/domain/platform-store";
import type { SessionUserLike } from "@/lib/authz";
import type { KPI, WorkRecord } from "@/lib/types";

type SectionData = {
  title: string;
  description: string;
  recordType?: string;
  records: WorkRecord[];
  metrics?: KPI[];
};

type GenericRow = Record<string, unknown>;

function isoDate(value: unknown) {
  if (!value) return undefined;
  return new Date(String(value)).toISOString();
}

function buildIntegratedWbsRecords(wbsItems: GenericRow[], milestones: GenericRow[], issues: WorkRecord[]) {
  const records: WorkRecord[] = [];
  const assetParentByKey = new Map<string, string>();
  const wbsParentBySystem = new Map<string, string>();

  for (const item of wbsItems) {
    const record: WorkRecord = {
      id: String(item.id),
      parentId: item.parentId ? String(item.parentId) : undefined,
      title: String(item.taskName ?? item.title ?? "Work package"),
      status: String(item.status ?? "Planned"),
      owner: String(item.responsibleStakeholder ?? item.owner ?? "Unassigned"),
      company: "Halo Technical Solutions Global",
      startDate: isoDate(item.startDate),
      endDate: isoDate(item.endDate),
      percentComplete: Number(item.percentComplete ?? item.percent ?? 0),
      priority: `${Number(item.percentComplete ?? item.percent ?? 0)}%`,
      assetId: item.assetId ? String(item.assetId) : undefined,
      assetName: item.assetName ? String(item.assetName) : undefined,
      equipmentType: item.equipmentType ? String(item.equipmentType) : undefined,
      assetStatus: item.assetStatus ? String(item.assetStatus) : undefined,
      checklistTemplate: item.checklistTemplate ? String(item.checklistTemplate) : undefined,
      checklistStatus: item.checklistStatus ? String(item.checklistStatus) : undefined,
      ashraeLevel: item.ashraeLevel ? String(item.ashraeLevel) : undefined,
      system: item.equipmentType ? String(item.equipmentType) : undefined,
      summary: String(item.deliverable ?? item.summary ?? "Integrated WBS package")
    };

    records.push(record);

    const systemKey = String(item.equipmentType ?? item.system ?? "").trim().toLowerCase();
    if (systemKey && !wbsParentBySystem.has(systemKey)) {
      wbsParentBySystem.set(systemKey, record.id);
    }

    if (record.assetId || record.assetName) {
      const assetKey = String(record.assetId ?? record.assetName).trim().toLowerCase();
      assetParentByKey.set(assetKey, record.id);
    }
  }

  if (milestones.length) {
    records.push({
      id: "schedule-root",
      title: "Integrated Schedule Controls",
      status: "Active",
      owner: "Project Leadership",
      company: "Halo Technical Solutions Global",
      summary: "Milestones and required delivery control points."
    });

    for (const item of milestones) {
      records.push({
        id: `milestone-${String(item.id)}`,
        parentId: "schedule-root",
        title: String(item.name ?? item.title ?? "Milestone"),
        status: String(item.status ?? "Planned"),
        owner: String(item.owner ?? "Project Leadership"),
        company: "Halo Technical Solutions Global",
        startDate: isoDate(item.plannedStart),
        endDate: isoDate(item.plannedFinish),
        dueDate: isoDate(item.plannedFinish) ?? (String(item.dueDate ?? "") || undefined),
        priority: "Milestone",
        summary: String(item.description ?? "Critical delivery event")
      });
    }
  }

  if (issues.length) {
    records.push({
      id: "issue-root",
      title: "Execution Issues",
      status: "Active",
      owner: "Project Controls",
      company: "Halo Technical Solutions Global",
      summary: "Open field and execution issues tied into the WBS structure."
    });

    for (const issue of issues) {
      const assetKey = String(issue.assetId ?? issue.assetName ?? "").trim().toLowerCase();
      const systemKey = String(issue.equipmentType ?? issue.system ?? "").trim().toLowerCase();
      const parentId = (assetKey && assetParentByKey.get(assetKey))
        || (systemKey && wbsParentBySystem.get(systemKey))
        || "issue-root";

      records.push({
        ...issue,
        id: `issue-${issue.id}`,
        parentId
      });
    }
  }

  return records;
}

export async function getProjectSectionData(projectId: string, section: string, currentUser?: SessionUserLike | null): Promise<SectionData> {
  const project = await getProject(projectId, currentUser);

  const meta: Record<string, Omit<SectionData, "records" | "metrics">> = {
    dashboard: {
      title: `${project?.name ?? "Project"} Dashboard`,
      description: "Leadership view of issue age, overdue accountability, quality backlog, technical blockers, and performance metrics.",
      recordType: "issue"
    },
    setup: {
      title: "Project Setup",
      description: "Charter, scope, membership, accountability, areas, disciplines, and systems baseline."
    },
    stakeholders: {
      title: "Stakeholder Register",
      description: "Influence, interest, reporting cadence, and who must stay aligned to protect execution."
    },
    wbs: {
      title: "Integrated WBS",
      description: "One execution hierarchy for work packages, asset or equipment status, schedule controls, and open issues."
    },
    milestones: {
      title: "Milestones",
      description: "Critical delivery events, dates, variance exposure, and milestone recovery visibility."
    },
    actions: {
      title: "Action Tracker",
      description: "Universal accountability engine for commitments, coordination outputs, and follow-up.",
      recordType: "action"
    },
    issues: {
      title: "Issue Register",
      description: "Field and program issues with aging, impact, ownership, and escalation discipline.",
      recordType: "issue"
    },
    risks: {
      title: "Risk Register",
      description: "Probability, impact, mitigation, trigger conditions, and conversion to active issues.",
      recordType: "risk"
    },
    quality: {
      title: "Quality Control",
      description: "Quality requirements, acceptance criteria, inspection planning, and verification rigor.",
      recordType: "inspection"
    },
    inspections: {
      title: "Inspections",
      description: "Field inspection execution with evidence, outcomes, and direct linkage to findings.",
      recordType: "inspection"
    },
    deficiencies: {
      title: "Deficiencies",
      description: "Punch and deficiency closure with owner accountability, verification, and reject or reopen control.",
      recordType: "deficiency"
    },
    engineering: {
      title: "Engineering Support",
      description: "Technical clarifications, review requests, and formal responses that unblock field work.",
      recordType: "engineering"
    },
    documents: {
      title: "Documents and Submittals",
      description: "Controlled records, revisions, technical submittals, and approval routing.",
      recordType: "document"
    },
    meetings: {
      title: "Meetings and Decisions",
      description: "Coordination records that generate traceable decisions and action items.",
      recordType: "meeting"
    },
    reports: {
      title: "Reports",
      description: "Daily, weekly, and executive reporting built from live project data.",
      recordType: "report"
    }
  };

  if (section === "stakeholders") {
    const stakeholders = await getStakeholders(projectId, currentUser);
    const records = (stakeholders as GenericRow[]).map((stakeholder) => ({
      id: String(stakeholder.id),
      title: String(stakeholder.name ?? stakeholder.organization ?? "Stakeholder"),
      status: String(stakeholder.communicationFrequency ?? stakeholder.communicationMethod ?? stakeholder.communication ?? stakeholder.role ?? "Active"),
      owner: String(stakeholder.role ?? "Stakeholder"),
      company: String(stakeholder.organization ?? "Unknown organization"),
      summary: `${String(stakeholder.influenceLevel ?? stakeholder.influence ?? "Unknown")} influence / ${String(stakeholder.interestLevel ?? stakeholder.interest ?? "Unknown")} interest`
    }));
    return { ...meta[section], records };
  }

  if (section === "wbs") {
    const [wbsItems, milestones, issues] = await Promise.all([
      getWbsItems(projectId, currentUser),
      getMilestones(projectId, currentUser),
      getCollection("issues", projectId, currentUser)
    ]);
    const records = buildIntegratedWbsRecords(wbsItems as GenericRow[], milestones as GenericRow[], issues);
    return { ...meta[section], records };
  }

  if (section === "milestones") {
    const milestones = await getMilestones(projectId, currentUser);
    const records = (milestones as GenericRow[]).map((item) => ({
      id: String(item.id),
      title: String(item.name ?? item.title ?? "Milestone"),
      status: String(item.status ?? "Planned"),
      owner: String(item.owner ?? "Project Leadership"),
      company: "Project Leadership",
      startDate: item.plannedStart ? new Date(String(item.plannedStart)).toISOString() : undefined,
      endDate: item.plannedFinish ? new Date(String(item.plannedFinish)).toISOString() : undefined,
      dueDate: item.plannedFinish ? new Date(String(item.plannedFinish)).toISOString() : String(item.dueDate ?? "") || undefined,
      priority: "Milestone",
      summary: String(item.description ?? "Critical delivery event")
    }));
    return { ...meta[section], records };
  }

  if (section === "setup") {
    const projectSummary = await getProject(projectId, currentUser);
    const records = projectSummary
      ? [
          {
            id: projectSummary.id,
            title: projectSummary.name,
            status: projectSummary.health,
            owner: projectSummary.manager,
            company: projectSummary.sponsor,
            priority: projectSummary.phase,
            summary: `Sponsor: ${projectSummary.sponsor} | Open issues: ${projectSummary.openIssues}`
          }
        ]
      : [];
    return { ...meta[section], records };
  }

  if (section === "dashboard") {
    return {
      ...meta[section],
      records: await getCollection("issues", projectId, currentUser),
      metrics: await getDashboard(projectId, currentUser)
    };
  }

  const resourceMap: Record<string, string> = {
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

  const resource = resourceMap[section];
  return {
    ...meta[section],
    records: resource ? await getCollection(resource, projectId, currentUser) : []
  };
}
