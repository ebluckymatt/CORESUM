import {
  actionsByProject as initialActionsByProject,
  attachmentsByRecord as initialAttachmentsByRecord,
  commentsByRecord as initialCommentsByRecord,
  dashboardByProject as initialDashboardByProject,
  deficienciesByProject as initialDeficienciesByProject,
  documentsByProject as initialDocumentsByProject,
  engineeringRequestsByProject as initialEngineeringRequestsByProject,
  inspectionsByProject as initialInspectionsByProject,
  issuesByProject as initialIssuesByProject,
  lookups as initialLookups,
  meetingsByProject as initialMeetingsByProject,
  milestones as initialMilestones,
  projects as initialProjects,
  reportsByProject as initialReportsByProject,
  risksByProject as initialRisksByProject,
  stakeholders as initialStakeholders,
  statusHistoryByRecord as initialStatusHistoryByRecord,
  users as initialUsers,
  wbsItems as initialWbsItems
} from "@/lib/sample-data";

type MockState = {
  users: typeof initialUsers;
  lookups: typeof initialLookups;
  projects: typeof initialProjects;
  stakeholders: typeof initialStakeholders;
  milestones: typeof initialMilestones;
  wbsItems: typeof initialWbsItems;
  actionsByProject: typeof initialActionsByProject;
  issuesByProject: typeof initialIssuesByProject;
  risksByProject: typeof initialRisksByProject;
  inspectionsByProject: typeof initialInspectionsByProject;
  deficienciesByProject: typeof initialDeficienciesByProject;
  engineeringRequestsByProject: typeof initialEngineeringRequestsByProject;
  documentsByProject: typeof initialDocumentsByProject;
  meetingsByProject: typeof initialMeetingsByProject;
  reportsByProject: typeof initialReportsByProject;
  commentsByRecord: typeof initialCommentsByRecord;
  attachmentsByRecord: typeof initialAttachmentsByRecord;
  statusHistoryByRecord: typeof initialStatusHistoryByRecord;
  dashboardByProject: typeof initialDashboardByProject;
};

function clone<T>(value: T): T {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

const globalMockState = globalThis as typeof globalThis & { __htsgMockState?: MockState };

if (!globalMockState.__htsgMockState) {
  globalMockState.__htsgMockState = {
    users: clone(initialUsers),
    lookups: clone(initialLookups),
    projects: clone(initialProjects),
    stakeholders: clone(initialStakeholders),
    milestones: clone(initialMilestones),
    wbsItems: clone(initialWbsItems),
    actionsByProject: clone(initialActionsByProject),
    issuesByProject: clone(initialIssuesByProject),
    risksByProject: clone(initialRisksByProject),
    inspectionsByProject: clone(initialInspectionsByProject),
    deficienciesByProject: clone(initialDeficienciesByProject),
    engineeringRequestsByProject: clone(initialEngineeringRequestsByProject),
    documentsByProject: clone(initialDocumentsByProject),
    meetingsByProject: clone(initialMeetingsByProject),
    reportsByProject: clone(initialReportsByProject),
    commentsByRecord: clone(initialCommentsByRecord),
    attachmentsByRecord: clone(initialAttachmentsByRecord),
    statusHistoryByRecord: clone(initialStatusHistoryByRecord),
    dashboardByProject: clone(initialDashboardByProject)
  };
}

export const mockState = globalMockState.__htsgMockState;

export const mockUsers = mockState.users;
export const mockLookups = mockState.lookups;
export const mockProjects = mockState.projects;
export const mockStakeholders = mockState.stakeholders;
export const mockMilestones = mockState.milestones;
export const mockWbsItems = mockState.wbsItems;
export const mockActionsByProject = mockState.actionsByProject;
export const mockIssuesByProject = mockState.issuesByProject;
export const mockRisksByProject = mockState.risksByProject;
export const mockInspectionsByProject = mockState.inspectionsByProject;
export const mockDeficienciesByProject = mockState.deficienciesByProject;
export const mockEngineeringRequestsByProject = mockState.engineeringRequestsByProject;
export const mockDocumentsByProject = mockState.documentsByProject;
export const mockMeetingsByProject = mockState.meetingsByProject;
export const mockReportsByProject = mockState.reportsByProject;
export const mockCommentsByRecord = mockState.commentsByRecord;
export const mockAttachmentsByRecord = mockState.attachmentsByRecord;
export const mockStatusHistoryByRecord = mockState.statusHistoryByRecord;
export const mockDashboardByProject = mockState.dashboardByProject;
