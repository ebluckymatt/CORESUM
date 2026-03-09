import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/env";
import { mockLookups, mockProjects, mockUsers } from "@/lib/domain/mock-state";
import { withMode, resolveCompanyId } from "@/lib/domain/platform-common";
import type { SessionMembership, SessionUserLike } from "@/lib/authz";

type DirectoryMembership = {
  id?: string;
  projectId: string;
  projectName?: string;
  role: string;
  company?: string;
  canApprove: boolean;
};

type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  isActive: boolean;
  accessStatus: "Pending access" | "Active" | "Inactive";
  role: string;
  memberships: DirectoryMembership[];
};

type LookupSet = {
  roles: string[];
  disciplines: string[];
  systems: string[];
  statuses: typeof mockLookups.statuses;
  companies: string[];
};

type MembershipAssignment = {
  id: string;
  projectId: string;
  userId: string;
  roleId: string;
  companyId: string | null;
  canApprove: boolean;
};

function deriveRoleFromMemberships(memberships: SessionMembership[], email?: string | null) {
  if (isAdminEmail(email)) return "Admin";
  return memberships[0]?.role ?? "Inspector";
}

function deriveAccessStatus(isActive: boolean, memberships: DirectoryMembership[], role?: string, email?: string | null) {
  if (!isActive) return "Inactive" as const;
  if (role === "Admin" || isAdminEmail(email)) return "Active" as const;
  return memberships.length ? "Active" as const : "Pending access" as const;
}

function formatDirectoryUser(user: {
  id: string;
  name: string;
  email: string;
  title: string | null;
  isActive: boolean;
  company?: { name: string } | null;
  memberships?: Array<{
    id: string;
    projectId: string;
    project?: { name: string } | null;
    role?: { name: string } | null;
    company?: { name: string } | null;
    canApprove: boolean;
  }>;
}): DirectoryUser {
  const memberships: DirectoryMembership[] = (user.memberships ?? []).map((membership) => ({
    id: membership.id,
    projectId: membership.projectId,
    projectName: membership.project?.name,
    role: membership.role?.name ?? "Unknown",
    company: membership.company?.name ?? undefined,
    canApprove: membership.canApprove ?? false
  }));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title ?? undefined,
    company: user.company?.name ?? undefined,
    isActive: user.isActive ?? true,
    accessStatus: deriveAccessStatus(user.isActive ?? true, memberships, deriveRoleFromMemberships(memberships.map((membership) => ({ projectId: membership.projectId, role: membership.role })), user.email), user.email),
    role: deriveRoleFromMemberships(memberships.map((membership) => ({ projectId: membership.projectId, role: membership.role })), user.email),
    memberships
  };
}

function formatMockUser(user: (typeof mockUsers)[number]): DirectoryUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title,
    company: user.company,
    isActive: user.isActive ?? true,
    accessStatus: deriveAccessStatus(user.isActive ?? true, user.memberships ?? [], user.role, user.email),
    role: user.role,
    memberships: user.memberships ?? []
  };
}

export async function getUsers(currentUser?: SessionUserLike | null): Promise<DirectoryUser[]> {
  return withMode<DirectoryUser[]>(async () => {
    if (currentUser && !isAdminEmail(currentUser.email) && currentUser.role !== "Admin") {
      const self = await db.user.findUnique({
        where: { id: currentUser.id ?? "" },
        include: { company: true, memberships: { include: { role: true, project: true, company: true } } }
      });
      return self ? [formatDirectoryUser(self)] : [];
    }

    const items = await db.user.findMany({
      include: { company: true, memberships: { include: { role: true, project: true, company: true } } },
      orderBy: { name: "asc" }
    });
    return items.map((item) => formatDirectoryUser(item));
  }, async () => mockUsers.map((user) => formatMockUser(user)));
}

export async function getLookups(): Promise<LookupSet> {
  return withMode<LookupSet>(async () => {
    const [roles, companies, disciplines, systems] = await Promise.all([
      db.role.findMany({ orderBy: { name: "asc" } }),
      db.company.findMany({ orderBy: { name: "asc" } }),
      db.discipline.findMany({ distinct: ["name"], orderBy: { name: "asc" } }),
      db.systemTag.findMany({ distinct: ["name"], orderBy: { name: "asc" } })
    ]);

    return {
      roles: roles.map((role) => role.name),
      disciplines: disciplines.map((discipline) => discipline.name),
      systems: systems.map((system) => system.name),
      statuses: mockLookups.statuses,
      companies: companies.map((company) => company.name)
    };
  }, async () => mockLookups);
}

export async function syncUserAccessProfile(input: { email: string; name?: string | null }) {
  return withMode(async () => {
    const user = await db.user.upsert({
      where: { email: input.email.toLowerCase() },
      update: { name: input.name ?? input.email },
      create: {
        email: input.email.toLowerCase(),
        name: input.name ?? input.email,
        isActive: isAdminEmail(input.email) ? true : false
      }
    });

    const memberships = await db.projectMembership.findMany({ where: { userId: user.id }, include: { role: true } });
    const normalizedMemberships = memberships.map((membership) => ({ projectId: membership.projectId, role: membership.role.name }));
    const isActive = isAdminEmail(user.email) ? true : user.isActive;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: deriveRoleFromMemberships(normalizedMemberships, user.email),
      memberships: normalizedMemberships,
      isActive,
      accessStatus: isActive ? (normalizedMemberships.length || isAdminEmail(user.email) ? "Active" : "Pending access") : "Inactive"
    };
  }, async () => {
    const existing = mockUsers.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
    const existingMemberships = ((existing?.memberships ?? []) as Array<{ projectId: string; role: string }>);
    return {
      id: existing?.id ?? `user-${Date.now()}`,
      name: existing?.name ?? input.name ?? input.email,
      email: existing?.email ?? input.email.toLowerCase(),
      role: isAdminEmail(input.email) ? "Admin" : existing?.role ?? "ProjectManager",
      memberships: existingMemberships.map((membership) => ({ projectId: membership.projectId, role: membership.role })),
      isActive: existing?.isActive ?? isAdminEmail(input.email),
      accessStatus: existing?.isActive === false ? "Inactive" : (existingMemberships.length || isAdminEmail(input.email) ? "Active" : "Pending access")
    };
  });
}

export async function upsertDirectoryUser(input: { name: string; email: string; title?: string; company?: string; isActive?: boolean }): Promise<DirectoryUser> {
  return withMode<DirectoryUser>(async () => {
    const companyId = input.company ? await resolveCompanyId(input.company) : undefined;
    const persisted = await db.user.upsert({
      where: { email: input.email.toLowerCase() },
      update: { name: input.name, title: input.title, isActive: input.isActive ?? true, companyId },
      create: { name: input.name, email: input.email.toLowerCase(), title: input.title, isActive: input.isActive ?? true, companyId },
      include: { company: true }
    });

    return formatDirectoryUser({ ...persisted, memberships: [] });
  }, async () => {
    const existing = mockUsers.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      existing.name = input.name;
      existing.title = input.title ?? existing.title;
      existing.company = input.company ?? existing.company;
      existing.isActive = input.isActive ?? true;
      return formatMockUser(existing);
    }

    const created: (typeof mockUsers)[number] = {
      id: `user-${Date.now()}`,
      name: input.name,
      email: input.email.toLowerCase(),
      title: input.title ?? "",
      role: "ProjectManager",
      company: input.company ?? "Halo Technical Solutions Global",
      isActive: input.isActive ?? true,
      memberships: []
    };
    mockUsers.push(created);
    return formatMockUser(created);
  });
}

export async function setDirectoryUserActiveState(input: { userId: string; isActive: boolean }): Promise<DirectoryUser> {
  return withMode<DirectoryUser>(async () => {
    const updated = await db.user.update({
      where: { id: input.userId },
      data: { isActive: input.isActive },
      include: { company: true, memberships: { include: { role: true, project: true, company: true } } }
    });
    return formatDirectoryUser(updated);
  }, async () => {
    const user = mockUsers.find((candidate) => candidate.id === input.userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.isActive = input.isActive;
    return formatMockUser(user);
  });
}

export async function assignUserMembership(input: { userId: string; projectId: string; roleName: string; company?: string; canApprove?: boolean }): Promise<MembershipAssignment> {
  return withMode<MembershipAssignment>(async () => {
    const [role, companyId] = await Promise.all([
      db.role.findFirst({ where: { name: input.roleName } }),
      input.company ? resolveCompanyId(input.company) : Promise.resolve(undefined)
    ]);

    if (!role) {
      throw new Error("Role not found");
    }

    const membership = await db.projectMembership.upsert({
      where: { projectId_userId_roleId: { projectId: input.projectId, userId: input.userId, roleId: role.id } },
      update: { companyId, canApprove: input.canApprove ?? false },
      create: { projectId: input.projectId, userId: input.userId, roleId: role.id, companyId, canApprove: input.canApprove ?? false }
    });

    return {
      id: membership.id,
      projectId: membership.projectId,
      userId: membership.userId,
      roleId: membership.roleId,
      companyId: membership.companyId,
      canApprove: membership.canApprove
    };
  }, async () => {
    const user = mockUsers.find((candidate) => candidate.id === input.userId);
    const project = mockProjects.find((candidate) => candidate.id === input.projectId);
    const membershipId = `membership-${Date.now()}`;
    const membershipForMock = {
      projectId: input.projectId,
      projectName: project?.name ?? input.projectId,
      role: input.roleName,
      company: input.company ?? "Halo Technical Solutions Global",
      canApprove: input.canApprove ?? false
    };

    if (user) {
      const typedUser = user as typeof user & { memberships: DirectoryMembership[] };
      typedUser.memberships = [...(typedUser.memberships ?? []), membershipForMock];
      user.role = input.roleName;
    }

    return {
      id: membershipId,
      projectId: input.projectId,
      userId: input.userId,
      roleId: input.roleName,
      companyId: input.company ?? null,
      canApprove: input.canApprove ?? false
    };
  });
}
