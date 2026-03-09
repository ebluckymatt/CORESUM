import { NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/domain/platform-store";
import { applyRateLimit, requireAuthenticatedUser } from "@/lib/api-helpers";

export async function GET(_: Request, context: { params: Promise<{ projectId: string }> }) {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId } = await context.params;
  const project = await getProject(projectId, authResult.user);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ data: project });
}

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const rateLimit = applyRateLimit(request, "projects:update", 40, 60_000);
  if (rateLimit) {
    return rateLimit;
  }

  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { projectId } = await context.params;
  const body = await request.json();
  const project = await updateProject(projectId, body, authResult.user);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ data: project });
}