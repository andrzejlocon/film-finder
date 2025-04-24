import { test, expect } from "@playwright/test";
import { BasePage } from "./pages/BasePage";

test.describe("Strona główna", () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.navigate("/");
    await basePage.waitForPageLoad();
  });

  test("posiada poprawny tytuł", async ({ page }) => {
    // Sprawdź tytuł strony
    await expect(page).toHaveTitle(/Sign in - FilmFinder/);
  });

  test("wyświetla główne komponenty interfejsu", async ({ page }) => {
    // Sprawdź czy główne elementy strony zostały załadowane
    const form = page.locator("form");
    const button = page.locator("button");

    await expect(form).toBeVisible();
    await expect(button).toBeVisible();
  });
});
