const { defineConfig } = require("@playwright/test");
const path = require("node:path");

module.exports = defineConfig({
  testDir: ".",
  testMatch: "fr*.spec.js",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  expect: { timeout: 5000 },
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || "test-results/playwright",
  reporter: [["list"]],
  use: {
    baseURL: process.env.ESHOP_WEB_URL || "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "off",
    video: "retain-on-failure",
  },
});
