import { test, expect } from "@playwright/test";

test("admin can access the dashboard", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("admin@clickcart.com");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/admin");
  await expect(page.locator("h1").filter({ hasText: "Dashboard" })).toBeVisible();
});