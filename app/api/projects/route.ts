import { NextResponse } from "next/server";
import { createProject, getProjects } from "@/lib/domain/platform-store";
import { applyRateLimit, requireAuthenticatedUser } from "@/lib/api-helpers";

export async function GET() {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  return NextResponse.json({ data: await getProjects(authResult.user) });
}

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "projects:create", 20, 60_000);
  if (rateLimit) {
    return rateLimit;
  }

  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const body = await request.json();
  const created = await createProject(body, authResult.user);
  return NextResponse.json({ data: created }, { status: 201 });
}