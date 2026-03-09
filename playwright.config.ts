import path from "node:path";
import { defineConfig } from "@playwright/test";

const privateRoot = path.join(process.env.LOCALAPPDATA || "", "HTSG-Execution-Platform-Private");
const nodeExe = path.join(process.cwd(), ".tools", "node", "node.exe");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3010",
    headless: true
  },
  webServer: {
    command: `"${nodeExe}" ".\\node_modules\\next\\dist\\bin\\next" dev --hostname 127.0.0.1 --port 3010`,
    cwd: privateRoot,
    url: "http://127.0.0.1:3010/signin",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PORT: "3010",
      HOSTNAME: "127.0.0.1",
      HTSG_DATA_MODE: "mock",
      AUTH_ALLOW_DEV_CREDENTIALS: "true"
    }
  }
});
