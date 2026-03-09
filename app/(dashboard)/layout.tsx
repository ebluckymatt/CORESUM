import { redirect } from "next/navigation";
import { sidebarLinks } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { isAdminUser } from "@/lib/authz";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SignOutButton } from "@/components/forms/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const visibleLinks = sidebarLinks.filter((link) => !("adminOnly" in link && link.adminOnly) || isAdminUser(session.user));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 lg:grid lg:grid-cols-[280px_1fr]">
      <AppSidebar links={visibleLinks} />
      <main className="min-h-screen">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Halo Technical Solutions Global</p>
            <h1 className="text-xl font-semibold text-slate-950">Execution Platform</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{session.user.role}</p>
            </div>
            <SignOutButton />
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
