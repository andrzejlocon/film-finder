import { type Page, type Locator, expect } from "@playwright/test";

export class TopbarComponent {
  readonly page: Page;
  readonly userEmail: Locator;
  readonly signOutButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileSignOutButton: Locator;
  readonly navigationLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userEmail = page.getByTestId("user-email");
    this.signOutButton = page.getByTestId("sign-out-button");
    this.mobileMenuButton = page.getByRole("button", { name: "Toggle menu" });
    this.mobileSignOutButton = page.getByRole("button", { name: "Sign out" });
    this.navigationLinks = page.getByRole("navigation").locator("a");
  }

  /**
   * Checks if the user is logged in by verifying the presence of their email
   * @param expectedEmail - The email that should be displayed
   */
  async expectLoggedIn(expectedEmail: string) {
    await expect(this.userEmail).toBeVisible();
    await expect(this.userEmail).toContainText(expectedEmail);
    await expect(this.signOutButton).toBeVisible();
  }

  /**
   * Clicks the sign out button and waits for navigation
   * @param isMobile - Whether to use the mobile sign out button
   */
  async signOut(isMobile = false) {
    if (isMobile) {
      await this.mobileMenuButton.click();
      await this.mobileSignOutButton.click();
    } else {
      await this.signOutButton.click();
    }
    // Wait for navigation to login page
    await this.page.waitForURL("/login");
  }

  /**
   * Checks if all navigation links are present for logged in user
   */
  async expectNavigationLinks() {
    const expectedLinks = ["Recommendations", "Watchlist", "Profile"];
    for (const link of expectedLinks) {
      await expect(this.navigationLinks.getByText(link)).toBeVisible();
    }
  }

  /**
   * Navigates to a specific section using the navigation menu
   * @param section - The name of the section to navigate to
   * @param isMobile - Whether to use the mobile menu
   */
  async navigateTo(section: "Recommendations" | "Watchlist" | "Profile", isMobile = false) {
    if (isMobile) {
      await this.mobileMenuButton.click();
    }
    await this.navigationLinks.getByText(section).click();
  }
}
