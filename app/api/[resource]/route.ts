import { NextRequest, NextResponse } from "next/server";
import { createRecord, getCollection } from "@/lib/domain/platform-store";
import { normalizeResource } from "@/lib/domain/platform-common";
import { applyRateLimit, requireAuthenticatedUser, requireProjectAccess } from "@/lib/api-helpers";

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { resource: rawResource } = await context.params;
  const resource = normalizeResource(rawResource);
  const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
  const forbidden = requireProjectAccess(authResult.user, projectId);
  if (projectId && forbidden) {
    return forbidden;
  }
  return NextResponse.json({ data: await getCollection(resource, projectId, authResult.user) });
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const rateLimit = applyRateLimit(request, "records:create", 60, 60_000);
  if (rateLimit) {
    return rateLimit;
  }

  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { resource: rawResource } = await context.params;
  const resource = normalizeResource(rawResource);
  const body = await request.json();
  const forbidden = requireProjectAccess(authResult.user, String(body.projectId ?? ""));
  if (forbidden) {
    return forbidden;
  }
  const created = await createRecord(resource, body, authResult.user);
  return NextResponse.json({ data: created }, { status: 201 });
}
