import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://localhost:3001",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm start -- --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});
