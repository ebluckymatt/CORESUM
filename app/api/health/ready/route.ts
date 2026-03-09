import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isDatabaseMode } from "@/lib/env";

export async function GET() {
  if (!isDatabaseMode()) {
    return NextResponse.json({ status: "degraded", mode: "mock", checks: { database: false } }, { status: 200 });
  }

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready", mode: "database", checks: { database: true } });
  } catch (error) {
    return NextResponse.json(
      {
        status: "not-ready",
        mode: "database",
        checks: { database: false },
        error: error instanceof Error ? error.message : "Database check failed"
      },
      { status: 503 }
    );
  }
}