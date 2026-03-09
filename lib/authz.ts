import { isAdminEmail } from "@/lib/env";

export type SessionMembership = {
  projectId: string;
  role: string;
};

export type SessionUserLike = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  isActive?: boolean;
  accessStatus?: string;
  memberships?: SessionMembership[];
};

export function isAdminUser(user?: SessionUserLike | null) {
  if (!user) return false;
  return user.role === "Admin" || isAdminEmail(user.email);
}

export function isActiveUser(user?: SessionUserLike | null) {
  if (!user) return false;
  return user.isActive !== false;
}

export function canAccessProject(user: SessionUserLike | null | undefined, projectId: string) {
  if (!isActiveUser(user)) return false;
  if (isAdminUser(user)) return true;
  return user?.memberships?.some((membership) => membership.projectId === projectId) ?? false;
}

export function getProjectRole(user: SessionUserLike | null | undefined, projectId: string) {
  if (!user) return undefined;
  if (isAdminUser(user)) return "Admin";
  return user.memberships?.find((membership) => membership.projectId === projectId)?.role;
}
