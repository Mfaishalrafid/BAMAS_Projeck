import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/preview",
  workers: 1,
  use: {
    baseURL: "http://localhost:3003",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
  webServer: {
    command: "npm start -- --port 3003",
    url: "http://localhost:3003",
    reuseExistingServer: false,
  },
  reporter: "list",
});
