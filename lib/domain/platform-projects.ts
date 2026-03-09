import { ActionStatus, EngineeringRequestStatus, InspectionStatus, IssueStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { canAccessProject, type SessionUserLike } from "@/lib/authz";
import { isAdminEmail } from "@/lib/env";
import {
  mockActionsByProject,
  mockDashboardByProject,
  mockDeficienciesByProject,
  mockDocumentsByProject,
  mockEngineeringRequestsByProject,
  mockInspectionsByProject,
  mockIssuesByProject,
  mockMeetingsByProject,
  mockMilestones,
  mockProjects,
  mockReportsByProject,
  mockRisksByProject,
  mockStakeholders,
  mockWbsItems
} from "@/lib/domain/mock-state";
import type { KPI, ProjectSummary } from "@/lib/types";
import { withMode } from "@/lib/domain/platform-common";

function projectToSummary(project: Record<string, unknown>, related?: { issues?: number; overdueActions?: number; deficiencies?: number }): ProjectSummary {
  return {
    id: String(project["id"]),
    code: String(project["code"]),
    name: String(project["name"]),
    phase: String(project["phase"] ?? "Startup"),
    sponsor: String(project["sponsor"] ?? "Halo Technical Solutions Global"),
    manager: String(project["manager"] ?? "Unassigned"),
    health: String(project["health"] ?? "AMBER") as ProjectSummary["health"],
    openIssues: related?.issues ?? 0,
    overdueActions: related?.overdueActions ?? 0,
    openDeficiencies: related?.deficiencies ?? 0
  };
}

async function getProjectCounts(projectId: string) {
  const [issuesCount, overdueActionsCount, deficienciesCount] = await Promise.all([
    db.issue.count({ where: { projectId, status: { not: IssueStatus.Closed } } }),
    db.actionItem.count({ where: { projectId, status: ActionStatus.Overdue } }),
    db.deficiency.count({ where: { projectId, status: { not: InspectionStatus.VerifiedClosed } } })
  ]);

  return {
    issues: issuesCount,
    overdueActions: overdueActionsCount,
    deficiencies: deficienciesCount
  };
}

export async function getProjects(currentUser?: SessionUserLike | null): Promise<ProjectSummary[]> {
  return withMode<ProjectSummary[]>(async () => {
    const where = currentUser && !isAdminEmail(currentUser.email)
      ? { memberships: { some: { userId: currentUser.id } } }
      : {};

    const projectRows = await db.project.findMany({ where, orderBy: { updatedAt: "desc" } });
    return Promise.all(projectRows.map(async (project) => projectToSummary(project, await getProjectCounts(project.id))));
  }, async () => mockProjects);
}

export async function getProject(projectId: string, currentUser?: SessionUserLike | null): Promise<ProjectSummary | null> {
  return withMode<ProjectSummary | null>(async () => {
    if (currentUser && !canAccessProject(currentUser, projectId) && !isAdminEmail(currentUser.email)) {
      return null;
    }

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return null;
    return projectToSummary(project, await getProjectCounts(project.id));
  }, async () => mockProjects.find((project) => project.id === projectId) ?? null);
}

export async function updateProject(projectId: string, payload: Partial<ProjectSummary>, currentUser?: SessionUserLike | null): Promise<ProjectSummary | null> {
  return withMode<ProjectSummary | null>(async () => {
    if (currentUser && !canAccessProject(currentUser, projectId) && !isAdminEmail(currentUser.email)) {
      return null;
    }

    const updated = await db.project.update({
      where: { id: projectId },
      data: {
        code: payload.code,
        name: payload.name,
        phase: payload.phase,
        sponsor: payload.sponsor,
        manager: payload.manager,
        health: payload.health
      }
    });
    return projectToSummary(updated, await getProjectCounts(updated.id));
  }, async () => {
    const idx = mockProjects.findIndex((project) => project.id === projectId);
    if (idx < 0) return null;
    mockProjects[idx] = { ...mockProjects[idx], ...payload };
    return mockProjects[idx];
  });
}

export async function createProject(payload: Partial<ProjectSummary>, currentUser?: SessionUserLike | null): Promise<ProjectSummary> {
  return withMode<ProjectSummary>(async () => {
    const created = await db.project.create({
      data: {
        code: payload.code ?? `HTSG-${Date.now()}`,
        name: payload.name ?? "New Project",
        phase: payload.phase ?? "Startup",
        sponsor: payload.sponsor ?? "Halo Technical Solutions Global",
        manager: payload.manager ?? currentUser?.email ?? "Unassigned",
        health: payload.health ?? "AMBER"
      }
    });

    if (currentUser?.id) {
      const role = await db.role.findFirst({ where: { name: currentUser.role === "Admin" ? "Admin" : "ProjectManager" } });
      if (role) {
        await db.projectMembership.upsert({
          where: { projectId_userId_roleId: { projectId: created.id, userId: currentUser.id, roleId: role.id } },
          update: {},
          create: { projectId: created.id, userId: currentUser.id, roleId: role.id, canApprove: currentUser.role === "Admin" }
        });
      }
    }

    return projectToSummary(created, { issues: 0, overdueActions: 0, deficiencies: 0 });
  }, async () => {
    const next: ProjectSummary = {
      id: `proj-${Date.now()}`,
      code: payload.code ?? `HTSG-${mockProjects.length + 1}`,
      name: payload.name ?? "New Project",
      phase: payload.phase ?? "Startup",
      health: payload.health ?? "AMBER",
      sponsor: payload.sponsor ?? "Halo Technical Solutions Global",
      manager: payload.manager ?? "Unassigned",
      openIssues: 0,
      overdueActions: 0,
      openDeficiencies: 0
    };
    mockProjects.unshift(next);
    mockStakeholders[next.id] = [];
    mockMilestones[next.id] = [];
    mockWbsItems[next.id] = [];
    mockActionsByProject[next.id] = [];
    mockIssuesByProject[next.id] = [];
    mockRisksByProject[next.id] = [];
    mockInspectionsByProject[next.id] = [];
    mockDeficienciesByProject[next.id] = [];
    mockEngineeringRequestsByProject[next.id] = [];
    mockDocumentsByProject[next.id] = [];
    mockMeetingsByProject[next.id] = [];
    mockReportsByProject[next.id] = [];
    mockDashboardByProject[next.id] = [];
    return next;
  });
}

export async function getDashboard(projectId: string, currentUser?: SessionUserLike | null): Promise<KPI[]> {
  return withMode<KPI[]>(async () => {
    if (currentUser && !canAccessProject(currentUser, projectId) && !isAdminEmail(currentUser.email)) {
      return [];
    }

    const [openIssues, overdueActions, openDeficiencies, engineeringBacklog, publishedReports, meetingsLogged] = await Promise.all([
      db.issue.count({ where: { projectId, status: { not: IssueStatus.Closed } } }),
      db.actionItem.count({ where: { projectId, status: ActionStatus.Overdue } }),
      db.deficiency.count({ where: { projectId, status: { not: InspectionStatus.VerifiedClosed } } }),
      db.engineeringRequest.count({ where: { projectId, status: { not: EngineeringRequestStatus.Closed } } }),
      db.report.count({ where: { projectId } }),
      db.meeting.count({ where: { projectId } })
    ]);

    return [
      { label: "Open Issues", value: String(openIssues), tone: openIssues > 5 ? "warning" : "good" },
      { label: "Overdue Actions", value: String(overdueActions), tone: overdueActions > 0 ? "critical" : "good" },
      { label: "Open Deficiencies", value: String(openDeficiencies), tone: openDeficiencies > 5 ? "warning" : "good" },
      { label: "Engineering Queue", value: String(engineeringBacklog), tone: engineeringBacklog > 3 ? "warning" : "neutral" },
      { label: "Published Reports", value: String(publishedReports), tone: "neutral" },
      { label: "Meetings Logged", value: String(meetingsLogged), tone: "neutral" }
    ];
  }, async () => mockDashboardByProject[projectId] ?? []);
}

export async function getStakeholders(projectId: string, currentUser?: SessionUserLike | null): Promise<Record<string, unknown>[]> {
  return withMode<Record<string, unknown>[]>(async () => {
    if (currentUser && !canAccessProject(currentUser, projectId) && !isAdminEmail(currentUser.email)) {
      return [];
    }
    return db.stakeholder.findMany({ where: { projectId }, orderBy: { name: "asc" } });
  }, async () => (mockStakeholders as Record<string, Record<string, unknown>[]>)[projectId] ?? []);
}

export async function getMilestones(projectId: string, currentUser?: SessionUserLike | null): Promise<Record<string, unknown>[]> {
  return withMode<Record<string, unknown>[]>(async () => {
    if (currentUser && !canAccessProject(currentUser, projectId) && !isAdminEmail(currentUser.email)) {
      return [];
    }
    return db.milestone.findMany({ where: { projectId }, orderBy: { plannedFinish: "asc" } });
  }, async () => (mockMilestones as Record<string, Record<string, unknown>[]>)[projectId] ?? []);
}

export async function getWbsItems(projectId: string, currentUser?: SessionUserLike | null): Promise<Record<string, unknown>[]> {
  return withMode<Record<string, unknown>[]>(async () => {
    if (currentUser && !canAccessProject(currentUser, projectId) && !isAdminEmail(currentUser.email)) {
      return [];
    }
    return db.wbsItem.findMany({ where: { projectId }, orderBy: { code: "asc" } });
  }, async () => (mockWbsItems as Record<string, Record<string, unknown>[]>)[projectId] ?? []);
}
