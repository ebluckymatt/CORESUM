"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  isActive?: boolean;
  accessStatus?: "Pending access" | "Active" | "Inactive";
  role?: string;
  memberships?: {
    id?: string;
    projectId: string;
    projectName?: string;
    role: string;
    company?: string;
    canApprove?: boolean;
  }[];
};

type ProjectOption = {
  id: string;
  code: string;
  name: string;
};

export function UserAdminConsole({
  initialUsers,
  projects,
  roles,
  companies
}: {
  initialUsers: AdminUser[];
  projects: ProjectOption[];
  roles: string[];
  companies: string[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [savingMembership, setSavingMembership] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function refreshUsers() {
    const response = await fetch("/api/admin/users");
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error ?? "Failed to refresh users");
    }
    setUsers(json.data ?? []);
  }

  async function handleCreateUser(formData: FormData) {
    setSavingUser(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          title: String(formData.get("title") ?? "") || undefined,
          company: String(formData.get("company") ?? "") || undefined,
          isActive: formData.get("isActive") === "on"
        })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to save user");
      }
      await refreshUsers();
      setMessage(`User saved: ${json.data.email ?? json.data.name}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save user");
    } finally {
      setSavingUser(false);
    }
  }

  async function handleAssignMembership(formData: FormData) {
    setSavingMembership(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(formData.get("userId") ?? ""),
          projectId: String(formData.get("projectId") ?? ""),
          roleName: String(formData.get("roleName") ?? ""),
          company: String(formData.get("membershipCompany") ?? "") || undefined,
          canApprove: formData.get("canApprove") === "on"
        })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to assign membership");
      }
      await refreshUsers();
      setMessage("Project membership assigned.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to assign membership");
    } finally {
      setSavingMembership(false);
    }
  }

  async function handleToggleUser(userId: string, isActive: boolean) {
    setUpdatingUserId(userId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to update user");
      }
      await refreshUsers();
      setMessage(isActive ? "User activated." : "User deactivated.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update user");
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Administration</p>
          <h1 className="text-3xl font-semibold text-slate-950">User Access Control</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">Create directory users, assign project memberships, and control who can enter which workspace.</p>
        </div>
        <div className="rounded-2xl border border-brand-steel/20 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Guide</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">Use the in-app access management guide when provisioning new employees or changing project responsibility.</p>
          <Link href={"/wiki/admin-access-management" as Route} className="mt-4 inline-flex rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">Open Admin Guide</Link>
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 1</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Create or Update User</h2>
          <form className="mt-5 grid gap-4" action={handleCreateUser}>
            <label className="text-sm text-slate-700">Name<input name="name" required className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            <label className="text-sm text-slate-700">Email<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            <label className="text-sm text-slate-700">Title<input name="title" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            <label className="text-sm text-slate-700">Company<select name="company" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"><option value="">Select company</option>{companies.map((company) => <option key={company} value={company}>{company}</option>)}</select></label>
            <label className="inline-flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-slate-300" />Active user</label>
            <div className="flex justify-end">
              <button type="submit" disabled={savingUser} className="rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">{savingUser ? "Saving..." : "Save User"}</button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 2</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">Assign Project Membership</h2>
          <form className="mt-5 grid gap-4" action={handleAssignMembership}>
            <label className="text-sm text-slate-700">User<select name="userId" required className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"><option value="">Select user</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select></label>
            <label className="text-sm text-slate-700">Project<select name="projectId" required className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.code} - {project.name}</option>)}</select></label>
            <label className="text-sm text-slate-700">Role<select name="roleName" required className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"><option value="">Select role</option>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
            <label className="text-sm text-slate-700">Company<select name="membershipCompany" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"><option value="">Select company</option>{companies.map((company) => <option key={company} value={company}>{company}</option>)}</select></label>
            <label className="inline-flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" name="canApprove" className="h-4 w-4 rounded border-slate-300" />Can approve</label>
            <div className="flex justify-end">
              <button type="submit" disabled={savingMembership} className="rounded-xl bg-brand-clay px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">{savingMembership ? "Saving..." : "Assign Membership"}</button>
            </div>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-950">Current Users</h2>
          <p className="mt-1 text-sm text-slate-500">Review current role posture, activity state, and project memberships.</p>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Access</th>
                <th className="px-6 py-3">Memberships</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 align-top">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    {user.title ? <p className="mt-1 text-xs text-slate-500">{user.title}</p> : null}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{user.role ?? "Unassigned"}</td>
                  <td className="px-6 py-4 text-slate-700">{user.company ?? "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.accessStatus === "Inactive"
                        ? "bg-red-100 text-red-800"
                        : user.accessStatus === "Pending access"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                    }`}
                    >
                      {user.accessStatus ?? (user.isActive === false ? "Inactive" : "Active")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="space-y-2">
                      {user.memberships?.length ? user.memberships.map((membership) => (
                        <div key={`${user.id}-${membership.projectId}-${membership.role}`} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {membership.projectName ?? membership.projectId} | {membership.role}{membership.company ? ` | ${membership.company}` : ""}{membership.canApprove ? " | Approver" : ""}
                        </div>
                      )) : <p className="text-xs text-slate-500">No project memberships assigned.</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleUser(user.id, user.isActive === false)}
                      disabled={updatingUserId === user.id}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                        user.isActive === false ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      } disabled:opacity-60`}
                    >
                      {updatingUserId === user.id ? "Updating..." : user.isActive === false ? "Activate" : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
