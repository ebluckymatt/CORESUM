import {
  mockActionsByProject as actionsByProject,
  mockAttachmentsByRecord as attachmentsByRecord,
  mockCommentsByRecord as commentsByRecord,
  mockDashboardByProject as dashboardByProject,
  mockDeficienciesByProject as deficienciesByProject,
  mockDocumentsByProject as documentsByProject,
  mockEngineeringRequestsByProject as engineeringRequestsByProject,
  mockInspectionsByProject as inspectionsByProject,
  mockIssuesByProject as issuesByProject,
  mockLookups as lookups,
  mockMeetingsByProject as meetingsByProject,
  mockMilestones as milestones,
  mockProjects as projects,
  mockReportsByProject as reportsByProject,
  mockRisksByProject as risksByProject,
  mockStakeholders as stakeholders,
  mockStatusHistoryByRecord as statusHistoryByRecord,
  mockUsers as users,
  mockWbsItems as wbsItems
} from "@/lib/domain/mock-state";
import { createStatusEvent } from "@/lib/domain/status-history";
import type { KPI, ProjectSummary, WorkRecord } from "@/lib/types";

const collectionMap: Record<string, Record<string, WorkRecord[]>> = {
  actions: actionsByProject,
  issues: issuesByProject,
  risks: risksByProject,
  inspections: inspectionsByProject,
  deficiencies: deficienciesByProject,
  engineeringRequests: engineeringRequestsByProject,
  documents: documentsByProject,
  meetings: meetingsByProject,
  reports: reportsByProject
};

const stakeholderMap = stakeholders as Record<string, unknown[]>;
const milestoneMap = milestones as Record<string, unknown[]>;
const wbsMap = wbsItems as Record<string, unknown[]>;

const singularResourceMap: Record<string, string> = {
  actions: "action",
  issues: "issue",
  risks: "risk",
  inspections: "inspection",
  deficiencies: "deficiency",
  engineeringRequests: "engineering",
  documents: "document",
  meetings: "meeting",
  reports: "report"
};

function getHistoryKey(resource: string, id: string) {
  return `${singularResourceMap[resource] ?? resource}:${id}`;
}

export function getProjects(): ProjectSummary[] {
  return projects;
}

export function getProject(projectId: string) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function updateProject(projectId: string, payload: Partial<ProjectSummary>) {
  const idx = projects.findIndex((project) => project.id === projectId);
  if (idx < 0) return null;
  projects[idx] = { ...projects[idx], ...payload };
  return projects[idx];
}

export function getDashboard(projectId: string): KPI[] {
  return dashboardByProject[projectId] ?? [];
}

export function getStakeholders(projectId: string) {
  return stakeholderMap[projectId] ?? [];
}

export function getMilestones(projectId: string) {
  return milestoneMap[projectId] ?? [];
}

export function getWbsItems(projectId: string) {
  return wbsMap[projectId] ?? [];
}

export function getCollection(resource: string, projectId?: string) {
  const mapped = collectionMap[resource];
  if (!mapped) return [];
  if (!projectId) return Object.values(mapped).flat();
  return mapped[projectId] ?? [];
}

export function getRecord(resource: string, id: string) {
  const records = getCollection(resource);
  return records.find((record) => record.id === id) ?? null;
}

export function createRecord(resource: string, payload: Partial<WorkRecord> & { projectId: string }) {
  const bucket = collectionMap[resource]?.[payload.projectId] ?? [];
  if (!collectionMap[resource]) {
    throw new Error(`Unsupported resource: ${resource}`);
  }

  const next: WorkRecord = {
    id: `${resource}-${Date.now()}`,
    title: payload.title ?? "Untitled record",
    status: payload.status ?? "Open",
    owner: payload.owner ?? "Unassigned",
    company: payload.company ?? "Halo Technical Solutions Global",
    dueDate: payload.dueDate,
    priority: payload.priority ?? "MEDIUM",
    severity: payload.severity,
    ageDays: 0,
    area: payload.area,
    discipline: payload.discipline,
    system: payload.system,
    summary: payload.summary,
    links: payload.links ?? []
  };

  collectionMap[resource][payload.projectId] = [next, ...bucket];
  const historyKey = getHistoryKey(resource, next.id);
  statusHistoryByRecord[historyKey] = [
    createStatusEvent({ recordType: resource, recordId: next.id, toStatus: next.status, actorName: "System" })
  ];
  return next;
}

export function updateRecord(resource: string, id: string, payload: Partial<WorkRecord>) {
  const mapped = collectionMap[resource];
  if (!mapped) throw new Error(`Unsupported resource: ${resource}`);

  for (const projectId of Object.keys(mapped)) {
    const idx = mapped[projectId].findIndex((record) => record.id === id);
    if (idx >= 0) {
      const current = mapped[projectId][idx];
      const updated = { ...current, ...payload };
      mapped[projectId][idx] = updated;
      const historyKey = getHistoryKey(resource, id);
      const history = statusHistoryByRecord[historyKey] ?? [];
      if (payload.status && payload.status !== current.status) {
        history.unshift(
          createStatusEvent({
            recordType: resource,
            recordId: id,
            fromStatus: current.status,
            toStatus: payload.status,
            actorName: "System"
          })
        );
      }
      statusHistoryByRecord[historyKey] = history;
      return updated;
    }
  }

  return null;
}

export function getComments(recordType: string, recordId: string) {
  return commentsByRecord[`${recordType}:${recordId}`] ?? [];
}

export function getAttachments(recordType: string, recordId: string) {
  return attachmentsByRecord[`${recordType}:${recordId}`] ?? [];
}

export function getStatusHistory(recordType: string, recordId: string) {
  return statusHistoryByRecord[`${recordType}:${recordId}`] ?? [];
}

export function getLookups() {
  return lookups;
}

export function getUsers() {
  return users;
}

export function createProject(payload: Partial<ProjectSummary>) {
  const next: ProjectSummary = {
    id: `proj-${Date.now()}`,
    code: payload.code ?? `HTSG-${projects.length + 1}`,
    name: payload.name ?? "New Project",
    phase: payload.phase ?? "Startup",
    health: payload.health ?? "AMBER",
    sponsor: payload.sponsor ?? "Halo Technical Solutions Global",
    manager: payload.manager ?? "Unassigned",
    openIssues: 0,
    overdueActions: 0,
    openDeficiencies: 0
  };

  projects.unshift(next);
  stakeholderMap[next.id] = [];
  milestoneMap[next.id] = [];
  wbsMap[next.id] = [];
  actionsByProject[next.id] = [];
  issuesByProject[next.id] = [];
  risksByProject[next.id] = [];
  inspectionsByProject[next.id] = [];
  deficienciesByProject[next.id] = [];
  engineeringRequestsByProject[next.id] = [];
  documentsByProject[next.id] = [];
  meetingsByProject[next.id] = [];
  reportsByProject[next.id] = [];
  dashboardByProject[next.id] = [
    { label: "Open Issues", value: "0", trend: "New project", tone: "neutral" },
    { label: "Overdue Actions", value: "0", trend: "New project", tone: "good" },
    { label: "Open Deficiencies", value: "0", trend: "New project", tone: "good" }
  ];

  return next;
}

export function runOverdueSweep() {
  const escalated: { resource: string; id: string; title: string }[] = [];

  for (const [resource, projectBuckets] of Object.entries(collectionMap)) {
    for (const records of Object.values(projectBuckets)) {
      for (const record of records) {
        if (!record.dueDate) continue;
        const dueDate = new Date(record.dueDate);
        if (dueDate.getTime() < Date.now() && record.status !== "Closed" && record.status !== "Overdue") {
          record.status = resource === "issues" ? "Escalated" : "Overdue";
          escalated.push({ resource, id: record.id, title: record.title });
        }
      }
    }
  }

  return escalated;
}
