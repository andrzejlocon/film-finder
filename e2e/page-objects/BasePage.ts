import type { Page } from "@playwright/test";

/**
 * Base Page Object class for all pages
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigates to the given URL
   */
  async navigate(path = "/") {
    await this.page.goto(path);
  }

  /**
   * Waits for the page to load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Gets the text content of the element with the given selector
   */
  async getTextContent(selector: string): Promise<string | null> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: "visible" });
    return element.textContent();
  }

  /**
   * Performs a click on the element with the given selector
   */
  async clickElement(selector: string) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: "visible" });
    await element.click();
  }

  /**
   * Fills in the input field with the given selector
   */
  async fillInput(selector: string, value: string) {
    const input = this.page.locator(selector);
    await input.waitFor({ state: "visible" });
    await input.fill(value);
  }
}
