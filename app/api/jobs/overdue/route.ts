import { NextResponse } from "next/server";
import { runOverdueSweep } from "@/lib/domain/platform-store";
import { isCronAuthorized, requireAuthenticatedUser } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const authResult = await requireAuthenticatedUser();
  const user = "response" in authResult ? null : authResult.user;

  if (!isCronAuthorized(request, user)) {
    if ("response" in authResult) {
      return authResult.response;
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const escalated = await runOverdueSweep();
  return NextResponse.json({ data: escalated, count: escalated.length });
}