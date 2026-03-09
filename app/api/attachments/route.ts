import { NextResponse } from "next/server";
import { createUploadMetadata, finalizeUpload } from "@/lib/storage";
import { requireAuthenticatedUser, requireProjectAccess } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const authResult = await requireAuthenticatedUser();
  if ("response" in authResult) {
    return authResult.response;
  }

  const body = await request.json();
  if (!body.fileName || !body.contentType || !body.projectId || !body.recordType || !body.recordId) {
    return NextResponse.json({ error: "Missing attachment context" }, { status: 400 });
  }

  const forbidden = requireProjectAccess(authResult.user, String(body.projectId));
  if (forbidden) {
    return forbidden;
  }

  const metadata = await createUploadMetadata(String(body.fileName), String(body.contentType), {
    projectId: String(body.projectId),
    recordType: String(body.recordType),
    recordId: String(body.recordId),
    size: typeof body.size === "number" ? body.size : undefined
  });

  try {
    const attachment = await finalizeUpload({ attachmentToken: metadata.attachmentToken }, authResult.user);
    return NextResponse.json({ data: attachment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Attachment could not be registered" }, { status: 400 });
  }
}
