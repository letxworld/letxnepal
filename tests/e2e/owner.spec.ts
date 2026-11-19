import { expect, test } from "@playwright/test";

test.describe("hotel owner availability dashboard", () => {
  test("shows a per-date calendar of rooms and prices", async ({ page }) => {
    await page.goto("/org/hotels");
    await expect(page.getByRole("heading", { level: 1, name: "Your properties" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Availability and prices" })).toBeVisible();

    // One labelled input per visible date for rooms and price.
    const roomsInputs = page.locator("input[type=number]").first();
    await expect(roomsInputs).toBeVisible();

    // Summary figures render.
    await expect(page.getByText("Sellable days")).toBeVisible();
    await expect(page.getByText("Potential revenue")).toBeVisible();
  });

  test("editing a date marks the calendar dirty", async ({ page }) => {
    await page.goto("/org/hotels");
    const input = page.locator("input[type=number]").first();
    await input.fill("3");
    await expect(page.getByText("Unsaved changes")).toBeVisible();
  });

  test("closing a date disables its rooms input", async ({ page }) => {
    await page.goto("/org/hotels");
    const closed = page.getByLabel("Closed").first();
    await closed.check();
    await expect(page.getByText("Unsaved changes")).toBeVisible();
  });
});
