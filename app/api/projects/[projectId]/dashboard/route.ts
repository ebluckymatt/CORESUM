import { NextResponse } from "next/server";
import { getDashboard, getProject } from "@/lib/domain/platform-store";
import { requireAuthenticatedUser } from "@/lib/api-helpers";

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

  return NextResponse.json({ data: { project, metrics: await getDashboard(projectId, authResult.user) } });
}