import { expect, test } from "@playwright/test";

test("configures compatible accessories for a road bike", async ({ page }) => {
  await page.goto("/bikes/bike-003");

  await expect(
    page.getByRole("heading", { level: 1, name: "Speedline Carbon Race" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Your bundle" }),
  ).toBeVisible();

  const roadSlider = page.getByRole("slider", {
    name: "Quantity for Carbon Aero Handlebar Extension",
  });
  const mountainSlider = page.getByRole("slider", {
    name: "Quantity for Mountain Protective Gear Set (Knee/Elbow)",
  });

  await expect(roadSlider).toBeEnabled();
  await expect(mountainSlider).toBeDisabled();
  await expect(
    page.locator("#accessory-acc-013-reason"),
  ).toBeVisible();

  await roadSlider.focus();
  await roadSlider.press("ArrowRight");

  await expect(roadSlider).toHaveValue("1");
  const summary = page.getByRole("complementary");
  await expect(summary).toContainText("1 accessory selected");
  await expect(summary).toContainText("Carbon Aero Handlebar Extension");
});
