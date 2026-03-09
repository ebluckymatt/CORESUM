import { NextResponse } from "next/server";
import { updateRecord } from "@/lib/domain/platform-store";
import { normalizeResource } from "@/lib/domain/platform-common";
import { applyRateLimit, requireAuthenticatedUser } from "@/lib/api-helpers";

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const rateLimit = applyRateLimit(request, "records:bulk", 30, 60_000);
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
  const ids: string[] = body.ids ?? [];
  const updates = (await Promise.all(ids.map((id) => updateRecord(resource, id, body.patch ?? {}, authResult.user)))).filter(Boolean);
  return NextResponse.json({ data: updates });
}