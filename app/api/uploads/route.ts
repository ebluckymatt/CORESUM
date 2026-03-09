import { NextResponse } from "next/server";
import { createUploadMetadata } from "@/lib/storage";
import { applyRateLimit, requireAuthenticatedUser, requireProjectAccess } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "uploads:create", 30, 60_000);
  if (rateLimit) {
    return rateLimit;
  }

  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const body = await request.json();
  if (!body.fileName || !body.contentType || !body.projectId || !body.recordType || !body.recordId) {
    return NextResponse.json({ error: "Missing upload context" }, { status: 400 });
  }

  const forbidden = requireProjectAccess(authResult.user, String(body.projectId));
  if (forbidden) {
    return forbidden;
  }

  const metadata = await createUploadMetadata(body.fileName, body.contentType, {
    projectId: body.projectId,
    recordType: body.recordType,
    recordId: body.recordId,
    size: typeof body.size === "number" ? body.size : undefined
  });

  return NextResponse.json({ data: metadata }, { status: 201 });
}
