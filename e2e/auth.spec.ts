import { test, expect } from "@playwright/test";

test("a new user can register and sign in", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/signup");
  await page.getByLabel("Full Name").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign Up" }).click();

  await expect(page).toHaveURL("/signin");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/");
});

test("an admin can sign in", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("admin@clickcart.com");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/");
});