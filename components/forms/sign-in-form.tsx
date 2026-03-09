"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignInForm({ showMicrosoft, allowDevCredentials }: { showMicrosoft: boolean; allowDevCredentials: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setPending(false);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      {showMicrosoft ? (
        <button type="button" onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/projects" })} className="w-full rounded-2xl bg-brand-steel px-4 py-3 font-semibold text-white">
          Continue with Microsoft 365
        </button>
      ) : (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
          Enterprise Microsoft sign-in is not configured in this environment yet. Use administrator-provisioned local access only if you were explicitly instructed to do so.
        </div>
      )}

      {allowDevCredentials ? (
        <form className="space-y-4 border-t border-slate-800 pt-6" onSubmit={handleSubmit}>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Local Access</p>
          <p className="text-sm text-slate-400">Restricted access for setup and controlled review environments. Production users should sign in with Microsoft 365 once that connection is enabled.</p>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Email</span>
            <input
              name="email"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3"
              placeholder="name@halotsg.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Password</span>
            <input
              name="password"
              type="password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="rounded-2xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          <button type="submit" disabled={pending} className="w-full rounded-2xl bg-brand-clay px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
            {pending ? "Signing In..." : "Use Local Access"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
