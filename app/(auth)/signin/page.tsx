import { redirect } from "next/navigation";
import { SignInForm } from "@/components/forms/sign-in-form";
import { auth } from "@/lib/auth";
import { appEnv, isEntraConfigured } from "@/lib/env";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const params = searchParams ? await searchParams : undefined;

  if (session?.user) {
    redirect("/projects");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-ink px-4 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/70 p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Halo Technical Solutions Global</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign In</h1>
        <p className="mt-2 text-sm text-slate-300">Sign in with the access method enabled for this environment. Microsoft 365 becomes the primary path once enterprise identity is connected.</p>
        {params?.error === "AccessPending" ? (
          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
            Your account was authenticated but is not active for platform access yet. Contact the HTSG platform administrator to activate your profile and assign project memberships.
          </div>
        ) : null}
        <SignInForm showMicrosoft={isEntraConfigured()} allowDevCredentials={appEnv.authAllowDevCredentials} />
      </div>
    </div>
  );
}
