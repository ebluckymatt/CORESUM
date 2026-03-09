import { NextResponse } from "next/server";
import { getRecord, updateRecord } from "@/lib/domain/platform-store";
import { normalizeResource } from "@/lib/domain/platform-common";
import { applyRateLimit, requireAuthenticatedUser } from "@/lib/api-helpers";

export async function GET(_: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { resource: rawResource, id } = await context.params;
  const resource = normalizeResource(rawResource);
  const record = await getRecord(resource, id, authResult.user);
  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  return NextResponse.json({ data: record });
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const rateLimit = applyRateLimit(request, "records:update", 80, 60_000);
  if (rateLimit) {
    return rateLimit;
  }

  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { resource: rawResource, id } = await context.params;
  const resource = normalizeResource(rawResource);
  const existing = await getRecord(resource, id, authResult.user);
  if (!existing) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  const body = await request.json();
  const updated = await updateRecord(resource, id, body, authResult.user);
  if (!updated) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  return NextResponse.json({ data: updated });
}
