const permissions: Record<string, string[]> = {
  ExecutiveLeadership: ["projects:read", "dashboards:read", "escalations:write"],
  ProjectManager: ["projects:read", "projects:write", "records:write", "dashboards:read"],
  QualityManager: ["projects:read", "quality:write", "deficiencies:verify", "dashboards:read"],
  Inspector: ["projects:read", "inspections:write", "findings:write", "attachments:write"],
  Engineer: ["projects:read", "engineering:write", "documents:write"],
  Consultant: ["projects:read", "comments:write", "escalations:write"],
  ClientRepresentative: ["projects:read", "reports:read", "approvals:write"],
  Admin: ["admin:write", "projects:read", "projects:write", "records:write"]
};

export function hasPermission(role: string | undefined, permission: string) {
  if (!role) return false;
  return permissions[role]?.includes(permission) ?? false;
}
