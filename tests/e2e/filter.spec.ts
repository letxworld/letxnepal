import { expect, test } from "@playwright/test";

test.describe("single-button destination filter", () => {
  test("one Filter button, panel opens, chips and result count update", async ({ page }) => {
    await page.goto("/destinations");
    // Exactly one Filter trigger.
    const trigger = page.getByRole("button", { name: /^Filter/ });
    await expect(trigger).toHaveCount(1);
    await expect(trigger).toBeVisible();

    // Panel is closed initially.
    await expect(page.getByRole("button", { name: "Show" })).toHaveCount(0);

    await trigger.click();
    await expect(page.getByRole("button", { name: /Show \d+/ })).toBeVisible();

    // Select hidden gems only and apply.
    await page.getByRole("button", { name: "Hidden gems only" }).click();
    await page.getByRole("button", { name: /Show \d+/ }).click();

    await expect(page).toHaveURL(/hiddenGem=true/);
    await expect(page.getByText("15 destinations", { exact: true })).toBeVisible();
    // A removable chip appears for the active filter.
    await expect(page.getByRole("button", { name: /Remove filter Hidden gems/ })).toBeVisible();
  });

  test("removing a chip navigates back to the unfiltered list", async ({ page }) => {
    await page.goto("/destinations?hiddenGem=true");
    await page.getByRole("button", { name: /Remove filter Hidden gems/ }).click();
    await expect(page).toHaveURL(/\/destinations$/);
    await expect(page.getByText("23 destinations", { exact: true })).toBeVisible();
  });

  test("Escape closes the panel and returns focus", async ({ page }) => {
    await page.goto("/destinations");
    const trigger = page.getByRole("button", { name: /^Filter/ });
    await trigger.click();
    await expect(page.getByRole("button", { name: /Show \d+/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /Show \d+/ })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("filter state is reflected in the URL and survives a reload", async ({ page }) => {
    await page.goto("/destinations?province=KARNALI&remoteness=very_remote");
    await expect(page).toHaveURL(/province=KARNALI/);
    await page.reload();
    await expect(page.getByText("4 destinations", { exact: true })).toBeVisible();
  });
});
