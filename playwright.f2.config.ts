import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/f2",
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3002",
    viewport: { width: 390, height: 844 },
    trace: "off",
    screenshot: "off",
  },
  webServer: {
    command: "npm start -- --port 3002",
    url: "http://localhost:3002",
    reuseExistingServer: false,
  },
  reporter: "list",
});
