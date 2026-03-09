import { redirect } from "next/navigation";
import { UserAdminConsole } from "@/components/admin/user-admin-console";
import { auth } from "@/lib/auth";
import { isAdminUser } from "@/lib/authz";
import { getLookups, getProjects, getUsers } from "@/lib/domain/platform-store";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!isAdminUser(session?.user)) {
    redirect("/projects");
  }

  const [users, projects, lookups] = await Promise.all([
    getUsers(session?.user ?? null),
    getProjects(session?.user ?? null),
    getLookups()
  ]);

  return (
    <UserAdminConsole
      initialUsers={users as never}
      projects={projects.map((project) => ({ id: project.id, code: project.code, name: project.name }))}
      roles={lookups.roles}
      companies={lookups.companies}
    />
  );
}