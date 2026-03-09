import { NextResponse } from "next/server";
import { assignUserMembership } from "@/lib/domain/platform-store";
import { applyRateLimit, requireAdmin, requireAuthenticatedUser } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "admin:memberships", 30, 60_000);
  if (rateLimit) {
    return rateLimit;
  }

  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const forbidden = requireAdmin(authResult.user);
  if (forbidden) {
    return forbidden;
  }

  const body = await request.json();
  if (!body.userId || !body.projectId || !body.roleName) {
    return NextResponse.json({ error: "User, project, and role are required" }, { status: 400 });
  }

  const membership = await assignUserMembership({
    userId: body.userId,
    projectId: body.projectId,
    roleName: body.roleName,
    company: body.company,
    canApprove: Boolean(body.canApprove)
  });

  return NextResponse.json({ data: membership }, { status: 201 });
}