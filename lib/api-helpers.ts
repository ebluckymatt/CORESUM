import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessProject, isActiveUser, isAdminUser, type SessionUserLike } from "@/lib/authz";
import { appEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  return firstForwarded || request.headers.get("x-real-ip") || "local";
}

export async function requireAuthenticatedUser() {
  const session = await auth();
  if (!session?.user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isActiveUser(session.user as SessionUserLike)) {
    return { response: NextResponse.json({ error: "Access inactive" }, { status: 403 }) };
  }

  return { user: session.user as SessionUserLike };
}

export function requireAdmin(user?: SessionUserLike | null) {
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export function applyRateLimit(request: Request, scope: string, limit = 60, windowMs = 60_000) {
  const result = checkRateLimit(`${scope}:${clientKey(request)}`, limit, windowMs);
  if (!result.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  return null;
}

export function requireProjectAccess(user: SessionUserLike | null | undefined, projectId?: string | null) {
  if (!projectId) {
    return NextResponse.json({ error: "Project context is required" }, { status: 400 });
  }

  if (!canAccessProject(user, projectId) && !isAdminUser(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export function isCronAuthorized(request: Request, user?: SessionUserLike | null) {
  if (isAdminUser(user)) {
    return true;
  }

  const authorization = request.headers.get("authorization");
  if (appEnv.cronSecret && authorization === `Bearer ${appEnv.cronSecret}`) {
    return true;
  }

  return false;
}
