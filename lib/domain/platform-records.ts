import { ActionStatus, IssueStatus, RecordType } from "@prisma/client";
import { db } from "@/lib/db";
import { canAccessProject, type SessionUserLike } from "@/lib/authz";
import { isAdminEmail } from "@/lib/env";
import { createStatusEvent } from "@/lib/domain/status-history";
import {
  mockActionsByProject as actionsByProject,
  mockAttachmentsByRecord as attachmentsByRecord,
  mockCommentsByRecord as commentsByRecord,
  mockDeficienciesByProject as deficienciesByProject,
  mockDocumentsByProject as documentsByProject,
  mockEngineeringRequestsByProject as engineeringRequestsByProject,
  mockInspectionsByProject as inspectionsByProject,
  mockIssuesByProject as issuesByProject,
  mockMeetingsByProject as meetingsByProject,
  mockReportsByProject as reportsByProject,
  mockRisksByProject as risksByProject,
  mockStatusHistoryByRecord as statusHistoryByRecord
} from "@/lib/domain/mock-state";
import type { WorkRecord } from "@/lib/types";
import {
  mapDbRecords,
  normalizeResource,
  parseDate,
  recordTypeMap,
  resolveCompanyId,
  resolveUserId,
  toActionStatus,
  toEngineeringStatus,
  toInspectionStatus,
  toIssueStatus,
  toPriority,
  toRiskStatus,
  toSeverity,
  transformDbRecord,
  withMode,
  loadCompanyMap,
  loadUserMap,
  deriveDocumentStatus,
  deriveMeetingStatus
} from "@/lib/domain/platform-common";

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

function projectIdlessCollection(resource: string) {
  const mapped = collectionMap[resource];
  if (!mapped) return [];
  return Object.values(mapped).flat();
}

export async function getCollection(resource: string, projectId?: string, currentUser?: SessionUserLike | null) {
  const normalized = normalizeResource(resource);

  return withMode(async () => {
    if (projectId && currentUser && !canAccessProject(currentUser, projectId) && !isAdminEmail(currentUser.email)) {
      return [];
    }

    const where: Record<string, unknown> = {};
    if (projectId) {
      where.projectId = projectId;
    } else if (currentUser && !isAdminEmail(currentUser.email)) {
      where.projectId = { in: currentUser.memberships?.map((membership) => membership.projectId) ?? [] };
    }

    const delegateMap: Record<string, any> = {
      actions: db.actionItem,
      issues: db.issue,
      risks: db.risk,
      inspections: db.inspection,
      deficiencies: db.deficiency,
      engineeringRequests: db.engineeringRequest,
      documents: db.document,
      meetings: db.meeting,
      reports: db.report
    };

    const delegate = delegateMap[normalized];
    if (!delegate) return [];
    const records = await delegate.findMany({ where });
    return mapDbRecords(normalized, records);
  }, () => {
    const mapped = collectionMap[normalized];
    if (!mapped) return [];
    if (!projectId) return Object.values(mapped).flat();
    return mapped[projectId] ?? [];
  });
}

export async function getRecord(resource: string, id: string, currentUser?: SessionUserLike | null) {
  const normalized = normalizeResource(resource);
  return withMode(async () => {
    const delegateMap: Record<string, any> = {
      actions: db.actionItem,
      issues: db.issue,
      risks: db.risk,
      inspections: db.inspection,
      deficiencies: db.deficiency,
      engineeringRequests: db.engineeringRequest,
      documents: db.document,
      meetings: db.meeting,
      reports: db.report
    };
    const delegate = delegateMap[normalized];
    if (!delegate) return null;
    const record = await delegate.findUnique({ where: { id } });
    if (!record) return null;
    if (currentUser && !canAccessProject(currentUser, String(record.projectId)) && !isAdminEmail(currentUser.email)) {
      return null;
    }
    const [usersById, companiesById] = await Promise.all([loadUserMap(), loadCompanyMap()]);
    return transformDbRecord(normalized, record, usersById, companiesById);
  }, () => projectIdlessCollection(normalized).find((record) => record.id === id) ?? null);
}

async function createStatusHistoryEntry(projectId: string, resource: string, recordId: string, toStatus: string, actorName?: string, note?: string) {
  await db.statusHistory.create({
    data: {
      projectId,
      recordType: recordTypeMap[resource],
      recordId,
      toStatus,
      actorName,
      note
    }
  });
}

export async function createRecord(resource: string, payload: Partial<WorkRecord> & { projectId: string }, currentUser?: SessionUserLike | null) {
  const normalized = normalizeResource(resource);
  return withMode(async () => {
    const ownerUserId = await resolveUserId(payload.owner);
    const responsibleCompanyId = await resolveCompanyId(payload.company);
    const actorName = currentUser?.email ?? currentUser?.id ?? "System";

    let created: Record<string, unknown> | null = null;
    if (normalized === "actions") created = await db.actionItem.create({ data: { projectId: payload.projectId, title: payload.title ?? "Untitled action", description: payload.summary ?? payload.title ?? "", ownerUserId, responsibleCompanyId, status: toActionStatus(payload.status), priority: toPriority(payload.priority), severity: toSeverity(payload.severity), dueDate: parseDate(payload.dueDate), createdById: currentUser?.id, updatedById: currentUser?.id } });
    if (normalized === "issues") created = await db.issue.create({ data: { projectId: payload.projectId, title: payload.title ?? "Untitled issue", description: payload.summary ?? payload.title ?? "", ownerUserId, responsibleCompanyId, status: toIssueStatus(payload.status), priority: toPriority(payload.priority ?? "HIGH"), severity: toSeverity(payload.severity), dueDate: parseDate(payload.dueDate), createdById: currentUser?.id, updatedById: currentUser?.id } });
    if (normalized === "risks") created = await db.risk.create({ data: { projectId: payload.projectId, title: payload.title ?? "Untitled risk", description: payload.summary ?? payload.title ?? "", ownerUserId, responsibleCompanyId, status: toRiskStatus(payload.status), priority: toPriority(payload.priority), severity: toSeverity(payload.severity), dueDate: parseDate(payload.dueDate), createdById: currentUser?.id, updatedById: currentUser?.id } });
    if (normalized === "inspections") created = await db.inspection.create({ data: { projectId: payload.projectId, title: payload.title ?? "Untitled inspection", inspectionType: payload.discipline ?? "General", area: payload.area, discipline: payload.discipline, system: payload.system, ownerUserId, responsibleCompanyId, status: toInspectionStatus(payload.status), dueDate: parseDate(payload.dueDate), result: payload.summary, createdById: currentUser?.id, updatedById: currentUser?.id } });
    if (normalized === "deficiencies") created = await db.deficiency.create({ data: { projectId: payload.projectId, title: payload.title ?? "Untitled deficiency", description: payload.summary ?? payload.title ?? "", ownerUserId, responsibleCompanyId, status: toInspectionStatus(payload.status), priority: toPriority(payload.priority), severity: toSeverity(payload.severity), dueDate: parseDate(payload.dueDate), createdById: currentUser?.id, updatedById: currentUser?.id } });
    if (normalized === "engineeringRequests") created = await db.engineeringRequest.create({ data: { projectId: payload.projectId, title: payload.title ?? "Untitled engineering request", description: payload.summary ?? payload.title ?? "", discipline: payload.discipline, ownerUserId, responsibleCompanyId, status: toEngineeringStatus(payload.status), priority: toPriority(payload.priority), severity: toSeverity(payload.severity), dueDate: parseDate(payload.dueDate), createdById: currentUser?.id, updatedById: currentUser?.id } });
    if (normalized === "documents") created = await db.document.create({ data: { projectId: payload.projectId, name: payload.title ?? "Untitled document", documentType: payload.discipline ?? "General", discipline: payload.discipline, version: payload.status === "Approved" ? "Approved" : "Draft", author: actorName, submittedAt: new Date() } });
    if (normalized === "meetings") created = await db.meeting.create({ data: { projectId: payload.projectId, title: payload.title ?? "Untitled meeting", meetingDate: parseDate(payload.dueDate) ?? new Date(), notes: payload.summary } });
    if (normalized === "reports") created = await db.report.create({ data: { projectId: payload.projectId, type: "WEEKLY", title: payload.title ?? "Untitled report", summary: payload.summary ?? payload.title ?? "", reportDate: parseDate(payload.dueDate) ?? new Date() } });

    if (!created) {
      throw new Error(`Unsupported resource: ${normalized}`);
    }

    await createStatusHistoryEntry(payload.projectId, normalized, String(created.id), String(created["status"] ?? payload.status ?? "Created"), actorName, "Record created");
    const [usersById, companiesById] = await Promise.all([loadUserMap(), loadCompanyMap()]);
    return transformDbRecord(normalized, created, usersById, companiesById);
  }, () => {
    const bucket = collectionMap[normalized]?.[payload.projectId] ?? [];
    if (!collectionMap[normalized]) {
      throw new Error(`Unsupported resource: ${normalized}`);
    }
    const next: WorkRecord = {
      id: `${normalized}-${Date.now()}`,
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
    collectionMap[normalized][payload.projectId] = [next, ...bucket];
    const historyKey = getHistoryKey(normalized, next.id);
    statusHistoryByRecord[historyKey] = [createStatusEvent({ recordType: normalized, recordId: next.id, toStatus: next.status, actorName: currentUser?.email ?? "System" })];
    return next;
  });
}

export async function updateRecord(resource: string, id: string, payload: Partial<WorkRecord>, currentUser?: SessionUserLike | null) {
  const normalized = normalizeResource(resource);
  return withMode(async () => {
    const ownerUserId = payload.owner ? await resolveUserId(payload.owner) : undefined;
    const responsibleCompanyId = payload.company ? await resolveCompanyId(payload.company) : undefined;
    const actorName = currentUser?.email ?? currentUser?.id ?? "System";

    const delegateMap: Record<string, any> = {
      actions: db.actionItem,
      issues: db.issue,
      risks: db.risk,
      inspections: db.inspection,
      deficiencies: db.deficiency,
      engineeringRequests: db.engineeringRequest,
      documents: db.document,
      meetings: db.meeting,
      reports: db.report
    };

    const delegate = delegateMap[normalized];
    if (!delegate) throw new Error(`Unsupported resource: ${normalized}`);

    const current = await delegate.findUnique({ where: { id } });
    if (!current) return null;

    const data: Record<string, unknown> = {};
    if (payload.title) data[normalized === "documents" ? "name" : "title"] = payload.title;
    if (payload.summary) {
      if (normalized === "reports") data.summary = payload.summary;
      else if (normalized === "meetings") data.notes = payload.summary;
      else if (normalized === "inspections") data.result = payload.summary;
      else data.description = payload.summary;
    }
    if (payload.dueDate) {
      if (normalized === "meetings") data.meetingDate = parseDate(payload.dueDate);
      else if (normalized === "reports") data.reportDate = parseDate(payload.dueDate);
      else data.dueDate = parseDate(payload.dueDate);
    }
    if (ownerUserId) data.ownerUserId = ownerUserId;
    if (responsibleCompanyId) data.responsibleCompanyId = responsibleCompanyId;
    if (payload.priority && ["actions", "issues", "risks", "deficiencies", "engineeringRequests"].includes(normalized)) data.priority = toPriority(payload.priority);
    if (payload.severity && ["actions", "issues", "risks", "deficiencies", "engineeringRequests"].includes(normalized)) data.severity = toSeverity(payload.severity);
    if (payload.status) {
      if (normalized === "actions") data.status = toActionStatus(payload.status);
      if (normalized === "issues") data.status = toIssueStatus(payload.status);
      if (normalized === "risks") data.status = toRiskStatus(payload.status);
      if (["inspections", "deficiencies"].includes(normalized)) data.status = toInspectionStatus(payload.status);
      if (normalized === "engineeringRequests") data.status = toEngineeringStatus(payload.status);
      if (normalized === "documents") {
        if (payload.status === "Approved") data.approvedAt = new Date();
        if (payload.status === "InReview") data.submittedAt = new Date();
      }
    }
    if (current.updatedById !== undefined) data.updatedById = currentUser?.id;

    const updated = await delegate.update({ where: { id }, data });
    if (payload.status && String(current.status ?? deriveDocumentStatus(current) ?? deriveMeetingStatus(current) ?? "Unknown") !== payload.status) {
      await db.statusHistory.create({
        data: {
          projectId: String(current.projectId),
          recordType: recordTypeMap[normalized],
          recordId: id,
          fromStatus: String(current.status ?? deriveDocumentStatus(current) ?? deriveMeetingStatus(current) ?? "Unknown"),
          toStatus: payload.status,
          actorName,
          note: "Status updated"
        }
      });
    }

    const [usersById, companiesById] = await Promise.all([loadUserMap(), loadCompanyMap()]);
    return transformDbRecord(normalized, updated, usersById, companiesById);
  }, () => {
    const mapped = collectionMap[normalized];
    if (!mapped) throw new Error(`Unsupported resource: ${normalized}`);
    for (const projectId of Object.keys(mapped)) {
      const idx = mapped[projectId].findIndex((record) => record.id === id);
      if (idx >= 0) {
        const current = mapped[projectId][idx];
        const updated = { ...current, ...payload };
        mapped[projectId][idx] = updated;
        const historyKey = getHistoryKey(normalized, id);
        const history = statusHistoryByRecord[historyKey] ?? [];
        if (payload.status && payload.status !== current.status) {
          history.unshift(createStatusEvent({ recordType: normalized, recordId: id, fromStatus: current.status, toStatus: payload.status, actorName: currentUser?.email ?? "System" }));
        }
        statusHistoryByRecord[historyKey] = history;
        return updated;
      }
    }
    return null;
  });
}

export async function getComments(recordType: string, recordId: string) {
  const normalized = normalizeResource(recordType);
  return withMode(async () => {
    const items = await db.comment.findMany({ where: { recordType: recordTypeMap[recordType], recordId }, orderBy: { createdAt: "desc" } });
    return items.map((item) => ({ id: item.id, author: item.authorName ?? "System", body: item.body, createdAt: item.createdAt.toISOString() }));
  }, () => commentsByRecord[getHistoryKey(normalized, recordId)] ?? []);
}

export async function getAttachments(recordType: string, recordId: string) {
  const normalized = normalizeResource(recordType);
  return withMode<Array<{ id: string; fileName: string; uploadedBy: string; uploadedAt: string; downloadUrl?: string }>>(async () => {
    const items = await db.attachment.findMany({ where: { recordType: recordTypeMap[recordType], recordId }, orderBy: { id: "desc" } });
    return items.map((item) => ({
      id: item.id,
      fileName: item.fileName,
      uploadedBy: "Authorized User",
      uploadedAt: new Date().toISOString(),
      downloadUrl: `/api/attachments/${item.id}`
    }));
  }, () => attachmentsByRecord[getHistoryKey(normalized, recordId)]?.map((item) => ({ ...item, downloadUrl: undefined })) ?? []);
}

export async function getStatusHistory(recordType: string, recordId: string) {
  const normalized = normalizeResource(recordType);
  return withMode(async () => {
    const items = await db.statusHistory.findMany({ where: { recordType: recordTypeMap[recordType], recordId }, orderBy: { createdAt: "desc" } });
    return items.map((item) => ({ recordType, recordId, fromStatus: item.fromStatus ?? undefined, toStatus: item.toStatus, actorName: item.actorName ?? undefined, note: item.note ?? undefined, createdAt: item.createdAt.toISOString() }));
  }, () => statusHistoryByRecord[getHistoryKey(normalized, recordId)] ?? []);
}

export async function createComment(
  input: { projectId: string; recordType: string; recordId: string; body: string },
  currentUser?: SessionUserLike | null
) {
  const normalized = normalizeResource(input.recordType);
  const authorName = currentUser?.name ?? currentUser?.email ?? currentUser?.id ?? "Authorized User";

  return withMode(async () => {
    const created = await db.comment.create({
      data: {
        projectId: input.projectId,
        recordType: recordTypeMap[normalized],
        recordId: input.recordId,
        body: input.body,
        authorName
      }
    });

    return {
      id: created.id,
      author: created.authorName ?? authorName,
      body: created.body,
      createdAt: created.createdAt.toISOString()
    };
  }, () => {
    const key = getHistoryKey(normalized, input.recordId);
    const created = {
      id: `comment-${Date.now()}`,
      author: authorName,
      body: input.body,
      createdAt: new Date().toISOString()
    };
    commentsByRecord[key] = [created, ...(commentsByRecord[key] ?? [])];
    return created;
  });
}

export async function runOverdueSweep() {
  return withMode(async () => {
    const now = new Date();
    const escalated: { resource: string; id: string; title: string }[] = [];

    const overdueActions = await db.actionItem.findMany({ where: { dueDate: { lt: now }, status: { notIn: [ActionStatus.Closed, ActionStatus.Overdue] } } });
    for (const record of overdueActions) {
      await db.actionItem.update({ where: { id: record.id }, data: { status: ActionStatus.Overdue } });
      await db.statusHistory.create({ data: { projectId: record.projectId, recordType: RecordType.ActionItem, recordId: record.id, fromStatus: record.status, toStatus: ActionStatus.Overdue, actorName: "Vercel Cron", note: "Automated overdue sweep" } });
      escalated.push({ resource: "actions", id: record.id, title: record.title });
    }

    const overdueIssues = await db.issue.findMany({ where: { dueDate: { lt: now }, status: { notIn: [IssueStatus.Closed, IssueStatus.Escalated] } } });
    for (const record of overdueIssues) {
      await db.issue.update({ where: { id: record.id }, data: { status: IssueStatus.Escalated } });
      await db.statusHistory.create({ data: { projectId: record.projectId, recordType: RecordType.Issue, recordId: record.id, fromStatus: record.status, toStatus: IssueStatus.Escalated, actorName: "Vercel Cron", note: "Automated overdue sweep" } });
      escalated.push({ resource: "issues", id: record.id, title: record.title });
    }

    return escalated;
  }, () => {
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
  });
}
