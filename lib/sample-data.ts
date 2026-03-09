import type { KPI, ProjectSummary, WorkRecord } from "@/lib/types";
import type { StatusEvent } from "@/lib/domain/status-history";

type MockMembership = {
  projectId: string;
  projectName?: string;
  role: string;
  company?: string;
  canApprove: boolean;
};

type MockUser = {
  id: string;
  name: string;
  email: string;
  title: string;
  role: string;
  company: string;
  isActive: boolean;
  memberships: MockMembership[];
};

export const users: MockUser[] = [
  {
    id: "user-admin-1",
    name: "HTSG Platform Admin",
    email: "admin@halotsg.com",
    title: "Platform Administrator",
    role: "Admin",
    company: "Halo Technical Solutions Global",
    isActive: true,
    memberships: []
  }
];

export const lookups = {
  roles: ["ExecutiveLeadership", "ProjectManager", "QualityManager", "Inspector", "Engineer", "Consultant", "ClientRepresentative", "Admin"],
  disciplines: ["Civil", "Structural", "Mechanical", "Electrical", "I&C", "Architectural", "Commissioning"],
  systems: ["Switchgear", "Transformers", "Cable Tray", "Chilled Water", "Fire Alarm", "Controls Network", "Generator", "UPS"],
  statuses: {
    action: ["Open", "InProgress", "AwaitingVerification", "Closed", "Overdue"],
    issue: ["Open", "UnderReview", "Escalated", "RecoveryActive", "Closed"],
    risk: ["Identified", "Assessed", "Mitigating", "Triggered", "Closed", "Converted"],
    inspection: ["Draft", "Open", "Assigned", "ReadyForVerification", "VerifiedClosed", "Rejected"],
    engineering: ["Submitted", "InReview", "WaitingOnInfo", "Responded", "Implemented", "Closed"],
    submittal: ["Draft", "Submitted", "InReview", "Approved", "ReviseAndResubmit", "Superseded"]
  },
  companies: ["Halo Technical Solutions Global"]
};

export const projects: ProjectSummary[] = [];

export const stakeholders: Record<string, Record<string, unknown>[]> = {};

export const milestones: Record<string, Record<string, unknown>[]> = {};

export const wbsItems: Record<string, Record<string, unknown>[]> = {};

export const actionsByProject: Record<string, WorkRecord[]> = {};

export const issuesByProject: Record<string, WorkRecord[]> = {};

export const risksByProject: Record<string, WorkRecord[]> = {};

export const inspectionsByProject: Record<string, WorkRecord[]> = {};

export const deficienciesByProject: Record<string, WorkRecord[]> = {};

export const engineeringRequestsByProject: Record<string, WorkRecord[]> = {};

export const documentsByProject: Record<string, WorkRecord[]> = {};

export const meetingsByProject: Record<string, WorkRecord[]> = {};

export const reportsByProject: Record<string, WorkRecord[]> = {};

export const commentsByRecord: Record<string, { id: string; author: string; body: string; createdAt: string }[]> = {};

export const attachmentsByRecord: Record<string, { id: string; fileName: string; uploadedBy: string; uploadedAt: string }[]> = {};

export const statusHistoryByRecord: Record<string, StatusEvent[]> = {};

export const dashboardByProject: Record<string, KPI[]> = {};
