import { test, expect } from "@playwright/test";
import { BasePage } from "./page-objects/BasePage";

test.describe("Start page", () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.navigate("/");
    await basePage.waitForPageLoad();
  });

  test("has correct title", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Sign in - FilmFinder/);
  });

  test("displays main components", async ({ page }) => {
    // Check if main elements of the page are loaded
    const form = page.locator("form");
    const button = page.locator("button", { hasText: "Sign In" });

    await expect(form).toBeVisible();
    await expect(button).toBeVisible();
  });
});
