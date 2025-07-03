import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__", // ✅ ここが tests/
  testMatch: "**/*.spec.ts", // ✅ 拡張子が .spec.ts であること
  use: {
    baseURL: "http://localhost:3000", // Next.js devサーバーのURL
    headless: true, // false にするとブラウザ表示される
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
