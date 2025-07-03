// tests/todo-flow.spec.ts
import { test, expect } from "@playwright/test";

test("Todoアプリの一連の流れをテスト", async ({ page }) => {
  // 1️⃣ アプリを開く
  await page.goto("http://localhost:3000");

  // 2️⃣ 新規登録フォームへ切り替え
  await page.click("text=登録へ");

  // 3️⃣ 登録フォームに入力して登録
  await page.fill('input[type="email"]', "testuser3@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click("button:has-text('登録')");

  // 4️⃣ 自動リダイレクト後、ログイン
  await page.fill('input[type="email"]', "testuser3@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click("button:has-text('ログイン')");

  // 5️⃣ プロジェクト追加フォームで作成
  await expect(
    page.getByRole("heading", { name: /プロジェクト追加/ })
  ).toBeVisible();
  await page.fill("input[placeholder='プロジェクト名']", "テストプロジェクト");
  await page.click("button:has-text('作成')");

  // 6️⃣ プロジェクト一覧のリンクを待ってクリック
  const projectLink = page.getByRole("link", { name: "テストプロジェクト" });
  await expect(projectLink).toBeVisible({ timeout: 5000 });
  await projectLink.click();

  // 7️⃣ タスク作成フォームでタスク追加
  await expect(
    page.getByRole("heading", { name: /新しいタスクを追加/ })
  ).toBeVisible();
  await page.fill("input[placeholder='タスクのタイトル']", "テストタスク");
  await page.click("button:has-text('タスク追加')");

  // 8️⃣ タスクが表示されていることを確認
  await expect(page.getByText("テストタスク")).toBeVisible();

  // 9️⃣ タスク完了のチェック
  const taskRow = page.locator("li", { hasText: "テストタスク" });
  const checkbox = taskRow.getByRole("checkbox");
  // 未チェック状態を確認
  await expect(checkbox).not.toBeChecked();
  // クリックしてトグル
  await checkbox.click();
  // 更新が反映されるまで最大5秒待機
  await expect(checkbox).toBeChecked({ timeout: 5000 });

  // 🔟 ログアウト
  await page.click("text=ログアウト");

  // 🔚 /auth へ遷移
  await expect(page).toHaveURL(/\/auth$/);
});
