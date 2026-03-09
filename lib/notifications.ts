import { db } from "@/lib/db";
import { appEnv, isDatabaseMode } from "@/lib/env";
import { logger } from "@/lib/logger";

type EmailPayload = {
  to: string[];
  subject: string;
  html: string;
};

async function sendEmail(payload: EmailPayload) {
  if (!appEnv.resendApiKey) {
    logger.info("Skipping email send because RESEND_API_KEY is not configured", {
      to: payload.to,
      subject: payload.subject
    });
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appEnv.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: appEnv.emailFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.html
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error("Notification send failed", { status: response.status, errorBody });
    throw new Error("Notification send failed");
  }

  return response.json();
}

export async function sendDailyDigest() {
  if (!isDatabaseMode()) {
    logger.info("Skipping daily digest in mock mode");
    return [];
  }

  const projects = await db.project.findMany({
    include: {
      memberships: {
        include: {
          user: true,
          role: true
        }
      }
    }
  });

  const sent: { projectId: string; recipients: number }[] = [];

  for (const project of projects) {
    const recipients = project.memberships
      .filter((membership) => membership.user.isActive && ["Admin", "ProjectManager", "QualityManager", "Engineer"].includes(membership.role.name))
      .map((membership) => membership.user.email);

    if (!recipients.length) {
      continue;
    }

    const [openIssues, overdueActions, openDeficiencies, openEngineering] = await Promise.all([
      db.issue.count({ where: { projectId: project.id, status: { not: "Closed" } } }),
      db.actionItem.count({ where: { projectId: project.id, status: "Overdue" } }),
      db.deficiency.count({ where: { projectId: project.id, status: { not: "VerifiedClosed" } } }),
      db.engineeringRequest.count({ where: { projectId: project.id, status: { not: "Closed" } } })
    ]);

    await sendEmail({
      to: recipients,
      subject: `[HTSG] Daily Digest - ${project.code} ${project.name}`,
      html: `
        <h1>${project.code} - ${project.name}</h1>
        <p>This is the automated daily execution digest.</p>
        <ul>
          <li>Open issues: ${openIssues}</li>
          <li>Overdue actions: ${overdueActions}</li>
          <li>Open deficiencies: ${openDeficiencies}</li>
          <li>Open engineering requests: ${openEngineering}</li>
        </ul>
      `
    });

    sent.push({ projectId: project.id, recipients: recipients.length });
  }

  return sent;
}
