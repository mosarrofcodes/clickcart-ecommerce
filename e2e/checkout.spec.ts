import { test, expect } from "@playwright/test";

test("place a cash-on-delivery order", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("admin@clickcart.com");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/products");
  const addToCart = page.getByRole("button", { name: /add to cart/i }).first();
  await expect(addToCart).toBeVisible();
  await addToCart.click();
  await expect(
    page.getByRole("link", { name: "View Full Cart" }),
  ).toBeVisible();

  await page.goto("/cart");
  const checkoutLink = page
    .locator("main")
    .getByRole("link", { name: "Proceed to Checkout" });
  await expect(checkoutLink).toBeVisible();
  await checkoutLink.click();
  await expect(page).toHaveURL("/checkout");

  await page.getByLabel("Full Name").fill("E2E Shopper");
  await page.getByLabel("Phone").fill("01712345678");
  await page.getByLabel("Address", { exact: false }).fill("House 12, Road 5");
  await page.getByLabel("City").fill("Dhaka");
  await page.getByLabel("District").fill("Dhaka");

  await page.getByRole("button", { name: /place order/i }).click();

  await expect(page).toHaveURL(/\/orders\/.+(\?placed=1)?$/);
  await expect(page.getByText(/order/i).first()).toBeVisible();
});

test("guest adding to cart gets sent to sign-in and returned to /checkout", async ({
  page,
}) => {
  await page.goto("/products");
  const addToCart = page
    .getByRole("button", { name: /add to cart/i })
    .first();
  await addToCart.click();

  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/signin\?callbackUrl=%2Fcheckout$/);

  await page.getByLabel("Email").fill("admin@clickcart.com");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL("/checkout");
  await expect(
    page.getByRole("button", { name: /place order/i }),
  ).toBeVisible();
});