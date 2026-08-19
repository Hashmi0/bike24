import { expect, test } from "@playwright/test";

test("enters the storefront through the bike catalog", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/bikes$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Choose the bike that starts your build.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart" })).toHaveAttribute(
    "href",
    "/cart",
  );
});
