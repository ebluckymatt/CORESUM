import { NextResponse } from "next/server";
import { getLookups, getUsers } from "@/lib/domain/platform-store";
import { requireAuthenticatedUser } from "@/lib/api-helpers";

export async function GET() {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const [lookups, users] = await Promise.all([getLookups(), getUsers(authResult.user)]);
  return NextResponse.json({ data: { ...lookups, users } });
}