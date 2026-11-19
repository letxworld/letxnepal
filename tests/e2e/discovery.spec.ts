import { expect, test } from "@playwright/test";

/**
 * Smoke journeys for the public discovery surface. These assert the mission gates:
 * the four homepage rails render, the hidden list is non-empty, coverage reports all
 * seven provinces, and the public API answers.
 */

test.describe("homepage", () => {
  test("renders the four mission rails", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("postcards");
    for (const rail of ["Popular destinations", "Hidden gems", "Adventures", "Popular trails"]) {
      await expect(page.getByRole("heading", { name: rail })).toBeVisible();
    }
  });

  test("has a document title and a skip link", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/letxNepal/);
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeAttached();
  });
});

test.describe("destinations", () => {
  test("lists destinations and filters by hidden gems", async ({ page }) => {
    await page.goto("/destinations");
    await expect(page.getByRole("heading", { level: 1, name: "Destinations" })).toBeVisible();

    // One Filter button opens the panel; the choice is applied from there.
    await page.getByRole("button", { name: /^Filter/ }).click();
    await page.getByRole("button", { name: "Hidden gems only" }).click();
    await page.getByRole("button", { name: /Show \d+/ }).click();

    await expect(page).toHaveURL(/hiddenGem=true/);
    await expect(page.getByText("15 destinations", { exact: true })).toBeVisible();
    await expect(page.locator("a[href^='/destinations/']").first()).toBeVisible();
  });

  test("shows an empty state when nothing matches", async ({ page }) => {
    await page.goto("/destinations?q=zzzzzzzzzz");
    await expect(page.getByRole("heading", { name: /no destinations match/i })).toBeVisible();
  });

  test("destination detail renders facts and structured data", async ({ page }) => {
    await page.goto("/destinations/tsum-valley");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Tsum Valley");
    await expect(page.getByText("Practical information")).toBeVisible();
    await expect(page.getByText("Why it is hidden")).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  });

  test("unknown destination returns a not-found page", async ({ page }) => {
    const response = await page.goto("/destinations/definitely-not-a-place");
    expect(response?.status()).toBe(404);
  });
});

test.describe("coverage", () => {
  test("reports all seven provinces and the gap list", async ({ page }) => {
    await page.goto("/coverage");
    await expect(page.getByRole("heading", { level: 1, name: /coverage/i })).toBeVisible();
    await expect(page.getByText(/7\s*\/\s*7/)).toBeVisible();
    await expect(page.getByText("21 / 77")).toBeVisible();
  });
});

test.describe("public API", () => {
  test("returns hidden gems only", async ({ request }) => {
    const response = await request.get("/api/v1/destinations?visitationLevel=hidden&pageSize=5");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.total).toBeGreaterThan(0);
    for (const item of body.data) {
      expect(item.visitationLevel).toBe("hidden");
    }
  });

  test("rejects an invalid enum value", async ({ request }) => {
    const response = await request.get("/api/v1/destinations?visitationLevel=bogus");
    expect(response.status()).toBe(422);
  });

  test("coverage endpoint reports provinces", async ({ request }) => {
    const response = await request.get("/api/v1/regions/coverage");
    const body = await response.json();
    expect(body.provinces).toHaveLength(7);
    expect(body.totals.zeroCoverageDistricts).toBeGreaterThan(0);
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/v1/health");
    expect((await response.json()).status).toBe("ok");
  });
});
