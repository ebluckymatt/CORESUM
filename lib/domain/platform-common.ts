import {
  ActionStatus,
  EngineeringRequestStatus,
  InspectionStatus,
  Priority,
  RecordType,
  RiskStatus,
  IssueStatus,
  Severity
} from "@prisma/client";
import { db } from "@/lib/db";
import { appEnv, isDatabaseMode } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { WorkRecord } from "@/lib/types";

export const recordTypeMap: Record<string, RecordType> = {
  action: RecordType.ActionItem,
  actions: RecordType.ActionItem,
  issue: RecordType.Issue,
  issues: RecordType.Issue,
  risk: RecordType.Risk,
  risks: RecordType.Risk,
  inspection: RecordType.Inspection,
  inspections: RecordType.Inspection,
  deficiency: RecordType.Deficiency,
  deficiencies: RecordType.Deficiency,
  engineering: RecordType.EngineeringRequest,
  engineeringRequest: RecordType.EngineeringRequest,
  engineeringRequests: RecordType.EngineeringRequest,
  document: RecordType.Document,
  documents: RecordType.Document,
  meeting: RecordType.Meeting,
  meetings: RecordType.Meeting,
  report: RecordType.Report,
  reports: RecordType.Report
};

export function normalizeResource(resource: string) {
  const map: Record<string, string> = {
    action: "actions",
    actions: "actions",
    issue: "issues",
    issues: "issues",
    risk: "risks",
    risks: "risks",
    inspection: "inspections",
    inspections: "inspections",
    deficiency: "deficiencies",
    deficiencies: "deficiencies",
    engineering: "engineeringRequests",
    engineeringRequest: "engineeringRequests",
    engineeringRequests: "engineeringRequests",
    document: "documents",
    documents: "documents",
    meeting: "meetings",
    meetings: "meetings",
    report: "reports",
    reports: "reports"
  };

  return map[resource] ?? resource;
}

export async function withMode<T>(dbFn: () => Promise<T>, mockFn: () => T | Promise<T>) {
  if (!isDatabaseMode()) {
    return await mockFn();
  }

  try {
    return await dbFn();
  } catch (error) {
    if (!appEnv.allowDatabaseFallback) {
      throw error;
    }
    logger.warn("Falling back to mock data store", {
      error: error instanceof Error ? error.message : String(error)
    });
    return await mockFn();
  }
}

export function parseDate(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function toPriority(value?: string | null) {
  switch ((value ?? "").toUpperCase()) {
    case "LOW":
      return Priority.LOW;
    case "HIGH":
      return Priority.HIGH;
    case "CRITICAL":
      return Priority.CRITICAL;
    default:
      return Priority.MEDIUM;
  }
}

export function toSeverity(value?: string | null) {
  switch ((value ?? "").toUpperCase()) {
    case "LOW":
      return Severity.LOW;
    case "HIGH":
      return Severity.HIGH;
    case "CRITICAL":
      return Severity.CRITICAL;
    case "MEDIUM":
      return Severity.MEDIUM;
    default:
      return undefined;
  }
}

export function toActionStatus(value?: string | null) {
  switch (value) {
    case "InProgress":
      return ActionStatus.InProgress;
    case "AwaitingVerification":
      return ActionStatus.AwaitingVerification;
    case "Closed":
      return ActionStatus.Closed;
    case "Overdue":
      return ActionStatus.Overdue;
    default:
      return ActionStatus.Open;
  }
}

export function toIssueStatus(value?: string | null) {
  switch (value) {
    case "UnderReview":
      return IssueStatus.UnderReview;
    case "Escalated":
      return IssueStatus.Escalated;
    case "RecoveryActive":
      return IssueStatus.RecoveryActive;
    case "Closed":
      return IssueStatus.Closed;
    default:
      return IssueStatus.Open;
  }
}

export function toRiskStatus(value?: string | null) {
  switch (value) {
    case "Assessed":
      return RiskStatus.Assessed;
    case "Mitigating":
      return RiskStatus.Mitigating;
    case "Triggered":
      return RiskStatus.Triggered;
    case "Closed":
      return RiskStatus.Closed;
    case "Converted":
      return RiskStatus.Converted;
    default:
      return RiskStatus.Identified;
  }
}

export function toInspectionStatus(value?: string | null) {
  switch (value) {
    case "Open":
      return InspectionStatus.Open;
    case "Assigned":
      return InspectionStatus.Assigned;
    case "ReadyForVerification":
      return InspectionStatus.ReadyForVerification;
    case "VerifiedClosed":
      return InspectionStatus.VerifiedClosed;
    case "Rejected":
      return InspectionStatus.Rejected;
    default:
      return InspectionStatus.Draft;
  }
}

export function toEngineeringStatus(value?: string | null) {
  switch (value) {
    case "InReview":
      return EngineeringRequestStatus.InReview;
    case "WaitingOnInfo":
      return EngineeringRequestStatus.WaitingOnInfo;
    case "Responded":
      return EngineeringRequestStatus.Responded;
    case "Implemented":
      return EngineeringRequestStatus.Implemented;
    case "Closed":
      return EngineeringRequestStatus.Closed;
    default:
      return EngineeringRequestStatus.Submitted;
  }
}

export async function loadUserMap() {
  const items = await db.user.findMany({ select: { id: true, name: true, email: true } });
  return Object.fromEntries(items.map((item) => [item.id, item.name || item.email]));
}

export async function loadCompanyMap() {
  const items = await db.company.findMany({ select: { id: true, name: true } });
  return Object.fromEntries(items.map((item) => [item.id, item.name]));
}

export function deriveDocumentStatus(document: Record<string, unknown>) {
  if (document["approvedAt"]) return "Approved";
  if (document["submittedAt"]) return "InReview";
  return "Draft";
}

export function deriveMeetingStatus(meeting: Record<string, unknown>) {
  const meetingDate = parseDate(String(meeting["meetingDate"] ?? ""));
  if (!meetingDate) return "Actions Open";
  return meetingDate.getTime() > Date.now() ? "Scheduled" : "Actions Open";
}

export function transformDbRecord(resource: string, record: Record<string, unknown>, usersById: Record<string, string>, companiesById: Record<string, string>): WorkRecord {
  const title = String(record["title"] ?? record["name"] ?? "Untitled record");
  const status =
    resource === "documents"
      ? deriveDocumentStatus(record)
      : resource === "meetings"
        ? deriveMeetingStatus(record)
        : String(record["status"] ?? "Open");

  const ownerId = String(record["ownerUserId"] ?? "");
  const companyId = String(record["responsibleCompanyId"] ?? "");

  return {
    id: String(record["id"]),
    title,
    status,
    owner: usersById[ownerId] ?? String(record["owner"] ?? "Unassigned"),
    company: companiesById[companyId] ?? String(record["company"] ?? "Halo Technical Solutions Global"),
    dueDate: record["dueDate"] ? new Date(String(record["dueDate"])).toISOString() : record["reportDate"] ? new Date(String(record["reportDate"])).toISOString() : undefined,
    priority: record["priority"] ? String(record["priority"]) : undefined,
    severity: record["severity"] ? String(record["severity"]) : undefined,
    area: record["area"] ? String(record["area"]) : undefined,
    discipline: record["discipline"] ? String(record["discipline"]) : undefined,
    system: record["system"] ? String(record["system"]) : undefined,
    summary: String(record["description"] ?? record["summary"] ?? record["notes"] ?? record["inspectionType"] ?? record["documentType"] ?? "") || undefined,
    links: resource === "actions" && record["sourceId"]
      ? [{ type: String(record["sourceType"] ?? "Source"), id: String(record["sourceId"]), label: String(record["sourceType"] ?? "Linked record") }]
      : undefined
  };
}

export async function mapDbRecords(resource: string, records: Record<string, unknown>[]) {
  const [usersById, companiesById] = await Promise.all([loadUserMap(), loadCompanyMap()]);
  return records.map((record) => transformDbRecord(resource, record, usersById, companiesById));
}

export async function resolveUserId(owner?: string | null) {
  if (!owner) return undefined;
  const exact = await db.user.findFirst({ where: { OR: [{ name: owner }, { email: owner }] }, select: { id: true } });
  return exact?.id;
}

export async function resolveCompanyId(company?: string | null) {
  if (!company) return undefined;
  const exact = await db.company.findFirst({ where: { name: company }, select: { id: true } });
  return exact?.id;
}
