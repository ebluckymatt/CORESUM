import crypto from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { RecordType } from "@prisma/client";
import { db } from "@/lib/db";
import { appEnv, isDatabaseMode } from "@/lib/env";
import { logger } from "@/lib/logger";
import { mockAttachmentsByRecord as attachmentsByRecord } from "@/lib/domain/mock-state";
import { canAccessProject, type SessionUserLike } from "@/lib/authz";

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const allowedMimePrefixes = ["image/", "application/pdf", "text/", "application/vnd.openxmlformats-officedocument", "application/vnd.ms-excel", "application/msword"];

function getS3Client() {
  if (!appEnv.s3Bucket || !appEnv.s3Region || !appEnv.s3AccessKeyId || !appEnv.s3SecretAccessKey) {
    return null;
  }

  return new S3Client({
    region: appEnv.s3Region,
    endpoint: appEnv.s3Endpoint || undefined,
    forcePathStyle: Boolean(appEnv.s3Endpoint),
    credentials: {
      accessKeyId: appEnv.s3AccessKeyId,
      secretAccessKey: appEnv.s3SecretAccessKey
    }
  });
}

function signPayload(payload: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", appEnv.authSecret || "local-dev-secret").update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyPayload(token: string) {
  const [body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", appEnv.authSecret || "local-dev-secret").update(body).digest("base64url");
  if (signature !== expected) {
    throw new Error("Invalid upload token");
  }
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Record<string, unknown>;
}

function toRecordType(recordType: string) {
  const map: Record<string, RecordType> = {
    action: RecordType.ActionItem,
    actions: RecordType.ActionItem,
    issue: RecordType.Issue,
    issues: RecordType.Issue,
    risk: RecordType.Risk,
    risks: RecordType.Risk,
    inspection: RecordType.Inspection,
    inspections: RecordType.Inspection,
    deficiency: RecordType.Deficiency,
    deficiencies: RecordType.Deficiency,
    engineering: RecordType.EngineeringRequest,
    engineeringRequests: RecordType.EngineeringRequest,
    document: RecordType.Document,
    documents: RecordType.Document,
    meeting: RecordType.Meeting,
    meetings: RecordType.Meeting,
    report: RecordType.Report,
    reports: RecordType.Report
  };
  return map[recordType] ?? RecordType.Document;
}

function toMockRecordKey(recordType: string, recordId: string) {
  const singularMap: Record<string, string> = {
    actions: "action",
    issues: "issue",
    risks: "risk",
    inspections: "inspection",
    deficiencies: "deficiency",
    engineeringRequests: "engineering",
    documents: "document",
    meetings: "meeting",
    reports: "report"
  };

  return `${singularMap[recordType] ?? recordType}:${recordId}`;
}

function validateUploadInput(fileName: string, contentType: string, size?: number) {
  if (!fileName.trim()) {
    throw new Error("Attachment file name is required");
  }

  if (!allowedMimePrefixes.some((prefix) => contentType === prefix || contentType.startsWith(prefix))) {
    throw new Error("This file type is not allowed for evidence upload");
  }

  if (typeof size === "number" && size > MAX_ATTACHMENT_BYTES) {
    throw new Error("Attachment exceeds the 25 MB upload limit");
  }
}

export async function createUploadMetadata(fileName: string, contentType: string, context: { projectId: string; recordType: string; recordId: string; size?: number }) {
  validateUploadInput(fileName, contentType, context.size);
  const safeName = fileName.replace(/\s+/g, "-").toLowerCase();
  const storageKey = `projects/${context.projectId}/${context.recordType}/${Date.now()}-${safeName}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();
  const attachmentToken = signPayload({ ...context, fileName, contentType, storageKey, expiresAt });
  const client = getS3Client();

  if (!client || !appEnv.s3Bucket) {
    return {
      mode: "mock",
      method: "PUT",
      fileName,
      contentType,
      storageKey,
      uploadUrl: `/api/uploads/mock/${encodeURIComponent(storageKey)}`,
      headers: {},
      attachmentToken,
      expiresAt
    };
  }

  const command = new PutObjectCommand({ Bucket: appEnv.s3Bucket, Key: storageKey, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 10 });
  return {
    mode: "s3",
    method: "PUT",
    fileName,
    contentType,
    storageKey,
    uploadUrl,
    headers: { "Content-Type": contentType },
    attachmentToken,
    expiresAt
  };
}

export async function finalizeUpload(input: { attachmentToken: string }, user: SessionUserLike | null | undefined) {
  const payload = verifyPayload(input.attachmentToken);
  const record = {
    projectId: String(payload.projectId),
    recordType: String(payload.recordType),
    recordId: String(payload.recordId),
    fileName: String(payload.fileName),
    storageKey: String(payload.storageKey),
    contentType: String(payload.contentType)
  };

  if (!canAccessProject(user, record.projectId)) {
    throw new Error("Forbidden");
  }

  if (!isDatabaseMode()) {
    const created = {
      id: `attachment-${Date.now()}`,
      ...record,
      uploadedBy: user?.email ?? user?.name ?? "Authorized User",
      uploadedAt: new Date().toISOString(),
      downloadUrl: undefined
    };
    const key = toMockRecordKey(record.recordType, record.recordId);
    attachmentsByRecord[key] = [created, ...(attachmentsByRecord[key] ?? [])];
    return created;
  }

  try {
    return await db.attachment.create({
      data: {
        projectId: record.projectId,
        recordType: toRecordType(record.recordType),
        recordId: record.recordId,
        fileName: record.fileName,
        contentType: record.contentType,
        storageKey: record.storageKey
      }
    });
  } catch (error) {
    logger.error("Failed to finalize upload", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function getAttachmentAccess(id: string, user: SessionUserLike | null | undefined) {
  if (!isDatabaseMode()) {
    return null;
  }

  const attachment = await db.attachment.findUnique({ where: { id } });
  if (!attachment) {
    return null;
  }

  if (!canAccessProject(user, attachment.projectId)) {
    throw new Error("Forbidden");
  }

  const client = getS3Client();
  if (!client || !appEnv.s3Bucket) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: appEnv.s3Bucket,
    Key: attachment.storageKey
  });
  const downloadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    downloadUrl
  };
}
