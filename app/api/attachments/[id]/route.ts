import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-helpers";
import { getAttachmentAccess } from "@/lib/storage";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { id } = await context.params;

  try {
    const access = await getAttachmentAccess(id, authResult.user);
    if (!access) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }
    return NextResponse.json({ data: access });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Attachment access failed" }, { status: 500 });
  }
}
