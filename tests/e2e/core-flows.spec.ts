import { expect, test, type Page } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/signin");
  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(page.getByLabel("Password")).toHaveValue("");
  await page.getByLabel("Email").fill("admin@halotsg.com");
  await page.getByLabel("Password").fill("halo1234");
  await page.getByRole("button", { name: /Use Local Access/i }).click();
  await expect(page).toHaveURL(/\/projects/);
}

async function createFirstProject(page: Page) {
  const stamp = Date.now();
  const projectName = `Launch Project ${stamp}`;
  const projectCode = `HTSG-${stamp}`;

  await page.getByLabel("Project code").fill(projectCode);
  await page.getByLabel("Project name").fill(projectName);
  await page.getByLabel("Phase").selectOption("Startup");
  await page.getByLabel("Sponsor").fill("Halo Technical Solutions Global");
  await page.getByRole("button", { name: "Create First Project" }).click();

  await expect(page).toHaveURL(/\/projects\/proj-/);
  await expect(page.getByText(new RegExp(`${projectName} Dashboard`)).first()).toBeVisible();

  return { projectName, projectCode, projectId: page.url().split("/projects/")[1]?.split("/")[0] ?? "" };
}

async function ensureProjectAvailable(page: Page) {
  await page.goto("/projects");

  const emptyState = page.getByRole("heading", { name: "No projects yet" });
  if (await emptyState.count()) {
    return createFirstProject(page);
  }

  const firstProjectCard = page.locator("article").first();
  const projectName = ((await firstProjectCard.getByRole("heading", { level: 2 }).textContent()) ?? "Existing Project").trim();
  const projectLink = firstProjectCard.getByRole("link", { name: "Open Workspace" });
  const href = await projectLink.getAttribute("href");
  const projectId = href?.split("/projects/")[1] ?? "";
  await projectLink.click();

  return { projectName, projectCode: "", projectId };
}

test("fresh install starts blank and lets admin create the first project", async ({ page }) => {
  await signInAsAdmin(page);

  await expect(page.getByRole("heading", { name: "No projects yet" })).toBeVisible();
  await expect(page.getByText("This workspace is starting clean.")).toBeVisible();

  const created = await createFirstProject(page);
  await expect(page.getByText(created.projectCode)).toBeVisible();
});

test("wiki stays available from a clean-start environment", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/wiki/getting-started-admin");

  await expect(page.getByText("Screen Path: Sidebar > Admin Users")).toBeVisible();
  await expect(page.getByText(/Create the first project workspace before assigning project memberships/i)).toBeVisible();
});

test("admin can create a user and assign membership after creating the first project", async ({ page }) => {
  await signInAsAdmin(page);
  const createdProject = await ensureProjectAvailable(page);

  await page.goto("/admin/users");
  const stamp = Date.now();
  const name = `Taylor Ortiz ${stamp}`;
  const email = `taylor.${stamp}@halotsg.com`;

  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Title").fill("Field Coordinator");
  await page.getByLabel("Company").first().selectOption("Halo Technical Solutions Global");
  await page.getByRole("button", { name: "Save User" }).click();
  await expect(page.getByText(`User saved: ${email}`)).toBeVisible();

  await page.locator('select[name="userId"]').selectOption({ label: `${name} (${email})` });
  await page.locator('select[name="projectId"]').selectOption(createdProject.projectId);
  await page.locator('select[name="roleName"]').selectOption("Engineer");
  await page.locator('select[name="membershipCompany"]').selectOption("Halo Technical Solutions Global");
  await page.getByRole("button", { name: "Assign Membership" }).click();

  await expect(page.getByText("Project membership assigned.")).toBeVisible();
  await expect(page.getByText(new RegExp(`${createdProject.projectName} \\| Engineer`))).toBeVisible();
});
