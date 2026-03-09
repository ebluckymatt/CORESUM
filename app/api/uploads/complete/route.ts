import { NextResponse } from "next/server";
import { finalizeUpload } from "@/lib/storage";
import { requireAuthenticatedUser } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const body = await request.json();
  try {
    const record = await finalizeUpload(body, authResult.user);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Attachment could not be registered" }, { status: 400 });
  }
}
