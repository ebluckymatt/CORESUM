export const appName = "Halo Execution Platform";

export const roleNames = [
  "ExecutiveLeadership",
  "ProjectManager",
  "QualityManager",
  "Inspector",
  "Engineer",
  "Consultant",
  "ClientRepresentative",
  "Admin"
] as const;

export const sidebarLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/wiki", label: "User Guide" },
  { href: "/admin/users", label: "Admin Users", adminOnly: true },
  { href: "/admin/templates", label: "Templates", adminOnly: true }
] as const;
