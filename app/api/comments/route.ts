import { NextResponse } from "next/server";
import { createComment } from "@/lib/domain/platform-store";
import { applyRateLimit, requireAuthenticatedUser, requireProjectAccess } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "comments:create", 80, 60_000);
  if (rateLimit) {
    return rateLimit;
  }

  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const body = await request.json();
  if (!body.projectId || !body.recordType || !body.recordId || !body.body) {
    return NextResponse.json({ error: "Project, record context, and comment body are required" }, { status: 400 });
  }

  const forbidden = requireProjectAccess(authResult.user, String(body.projectId));
  if (forbidden) {
    return forbidden;
  }

  const created = await createComment(
    {
      projectId: String(body.projectId),
      recordType: String(body.recordType),
      recordId: String(body.recordId),
      body: String(body.body)
    },
    authResult.user
  );

  return NextResponse.json({ data: created }, { status: 201 });
}
