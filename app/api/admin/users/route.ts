import { NextResponse } from "next/server";
import { getUsers, setDirectoryUserActiveState, upsertDirectoryUser } from "@/lib/domain/platform-store";
import { applyRateLimit, requireAdmin, requireAuthenticatedUser } from "@/lib/api-helpers";

export async function GET() {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const forbidden = requireAdmin(authResult.user);
  if (forbidden) {
    return forbidden;
  }

  return NextResponse.json({ data: await getUsers(authResult.user) });
}

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "admin:users", 20, 60_000);
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
  if (!body.name || !body.email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const user = await upsertDirectoryUser({
    name: body.name,
    email: body.email,
    title: body.title,
    company: body.company,
    isActive: body.isActive
  });

  return NextResponse.json({ data: user }, { status: 201 });
}

export async function PATCH(request: Request) {
  const rateLimit = applyRateLimit(request, "admin:users:update", 30, 60_000);
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
  if (!body.userId || typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "User id and active state are required" }, { status: 400 });
  }

  const user = await setDirectoryUserActiveState({
    userId: String(body.userId),
    isActive: Boolean(body.isActive)
  });

  return NextResponse.json({ data: user });
}
