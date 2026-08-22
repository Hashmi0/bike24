import { expect, test } from "@playwright/test";

test("checks stock and adds a configured bundle to the cart", async ({ page }) => {
  await page.goto("/bikes/bike-003");

  const roadSlider = page.getByRole("slider", {
    name: "Quantity for Carbon Aero Handlebar Extension",
  });
  await expect(roadSlider).toBeEnabled();

  await roadSlider.focus();
  await roadSlider.press("ArrowRight");
  await expect(roadSlider).toHaveValue("1");

  await page.getByRole("button", { name: "Add bundle to cart" }).click();
  await expect(
    page.getByRole("dialog", { name: "What would you like to do next?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue shopping" }).click();
  await expect(page.getByRole("link", { name: "Cart (1)" })).toBeVisible();

  await page.getByRole("link", { name: "Cart (1)" }).click();
  await page.getByRole("button", { name: "Clear cart" }).click();
  await page.getByRole("link", { name: "Continue shopping" }).click();
  await page.goto("/bikes/bike-003");

  await page.getByRole("button", { name: "Add bundle to cart" }).click();
  await expect(page.getByRole("link", { name: "Cart (1)" })).toBeVisible();
  await page.getByRole("button", { name: "Go to cart" }).click();

  await expect(page).toHaveURL(/\/cart$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Speedline Carbon Race" }),
  ).toHaveCount(1);
  await expect(page.getByText("1 bundle")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove Speedline Carbon Race bundle" }),
  ).toHaveCount(1);

  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByText("Thanks for your order")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
});
