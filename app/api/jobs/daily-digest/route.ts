import { NextResponse } from "next/server";
import { isCronAuthorized, requireAuthenticatedUser } from "@/lib/api-helpers";
import { sendDailyDigest } from "@/lib/notifications";

export async function POST(request: Request) {
  const authResult = await requireAuthenticatedUser();
  const user = "response" in authResult ? null : authResult.user;

  if (!isCronAuthorized(request, user)) {
    if ("response" in authResult) {
      return authResult.response;
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sent = await sendDailyDigest();
  return NextResponse.json({ data: sent, count: sent.length });
}
