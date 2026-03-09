import assert from "node:assert/strict";

async function main() {
  process.env.HTSG_DATA_MODE = "mock";
  const projectId = "proj-smoke";
  const user = { id: "user-admin-1", email: "admin@halotsg.com", role: "Admin", memberships: [] as { projectId: string; role: string }[] };

  const platformStore = await import("../lib/domain/platform-store");
  const storage = await import("../lib/storage");

  const createdIssue = await platformStore.createRecord("issues", {
    projectId,
    title: "QA smoke test issue",
    owner: "HTSG Platform Admin",
    company: "Halo Technical Solutions Global",
    dueDate: "2026-03-01",
    priority: "HIGH",
    summary: "Created by automated smoke test."
  });
  assert.equal(createdIssue.title, "QA smoke test issue");

  const createdComment = await platformStore.createComment(
    {
      projectId,
      recordType: "issues",
      recordId: createdIssue.id,
      body: "Smoke test note"
    },
    user
  );
  assert.equal(createdComment.body, "Smoke test note");

  const commentsAfter = await platformStore.getComments("issues", createdIssue.id);
  assert.equal(commentsAfter.some((item) => item.body === "Smoke test note"), true, "new comment should be visible");

  const historyAfterIssueCreate = await platformStore.getStatusHistory("issues", createdIssue.id);
  assert.equal(historyAfterIssueCreate.length > 0, true, "new issue should have status history");

  const metadata = await storage.createUploadMetadata("qa-smoke.txt", "text/plain", {
    projectId,
    recordType: "issues",
    recordId: createdIssue.id
  });
  const attachment = await storage.finalizeUpload(
    { attachmentToken: metadata.attachmentToken },
    { id: user.id, email: user.email, name: "HTSG Platform Admin", role: user.role, memberships: user.memberships }
  );
  assert.equal(attachment.fileName, "qa-smoke.txt");

  const attachmentsAfter = await platformStore.getAttachments("issues", createdIssue.id);
  assert.equal(attachmentsAfter.some((item) => item.fileName === "qa-smoke.txt"), true, "new attachment should be visible");

  const overdueActionsBefore = await platformStore.getCollection("actions", projectId);
  const newAction = await platformStore.createRecord("actions", {
    projectId,
    title: "QA smoke overdue action",
    owner: "HTSG Platform Admin",
    company: "Halo Technical Solutions Global",
    dueDate: "2026-03-01",
    priority: "HIGH",
    status: "Open",
    summary: "Should flip to overdue in sweep."
  });
  assert.equal(newAction.status, "Open");

  await platformStore.runOverdueSweep();
  const overdueActionsAfter = await platformStore.getCollection("actions", projectId);
  const sweptAction = overdueActionsAfter.find((item) => item.id === newAction.id);
  assert.equal(sweptAction?.status, "Overdue", "overdue sweep should flag action");
  assert.equal(overdueActionsAfter.length >= overdueActionsBefore.length, true, "action collection should remain available after sweep");

  console.log("domain smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
