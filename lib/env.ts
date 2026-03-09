export function getEnv(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export function getBoolEnv(name: string, fallback = false) {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value);
}

export const appEnv = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  dataMode: getEnv("HTSG_DATA_MODE", process.env.NODE_ENV === "production" ? "database" : "mock"),
  allowDatabaseFallback: getBoolEnv("HTSG_ALLOW_DATABASE_FALLBACK", process.env.NODE_ENV !== "production"),
  authSecret: getEnv("AUTH_SECRET"),
  nextAuthUrl: getEnv("NEXTAUTH_URL"),
  authAllowDevCredentials: getBoolEnv("AUTH_ALLOW_DEV_CREDENTIALS", process.env.NODE_ENV !== "production"),
  entraClientId: getEnv("AUTH_MICROSOFT_ENTRA_ID_CLIENT_ID"),
  entraClientSecret: getEnv("AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET"),
  entraTenantId: getEnv("AUTH_MICROSOFT_ENTRA_ID_TENANT_ID"),
  adminEmails: getEnv("HTSG_ADMIN_EMAILS")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  s3Bucket: getEnv("S3_BUCKET"),
  s3Region: getEnv("S3_REGION", "us-east-1"),
  s3AccessKeyId: getEnv("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: getEnv("S3_SECRET_ACCESS_KEY"),
  s3Endpoint: getEnv("S3_ENDPOINT"),
  resendApiKey: getEnv("RESEND_API_KEY"),
  emailFrom: getEnv("EMAIL_FROM", "noreply@halotsg.com"),
  sentryDsn: getEnv("SENTRY_DSN"),
  nextPublicSentryDsn: getEnv("NEXT_PUBLIC_SENTRY_DSN"),
  cronSecret: getEnv("CRON_SECRET")
};

export function isDatabaseMode() {
  return appEnv.dataMode === "database";
}

export function isEntraConfigured() {
  return Boolean(appEnv.entraClientId && appEnv.entraClientSecret && appEnv.entraTenantId);
}

export function isAdminEmail(email?: string | null) {
  return Boolean(email && appEnv.adminEmails.includes(email.toLowerCase()));
}
