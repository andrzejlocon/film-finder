import type { Page } from "@playwright/test";

/**
 * Bazowa klasa Page Object dla wszystkich stron
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Przechodzi do podanego URL
   */
  async navigate(path = "/") {
    await this.page.goto(path);
  }

  /**
   * Czeka na załadowanie strony
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Pobiera tekst elementu o podanym selektorze
   */
  async getTextContent(selector: string): Promise<string | null> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: "visible" });
    return element.textContent();
  }

  /**
   * Wykonuje kliknięcie w element o podanym selektorze
   */
  async clickElement(selector: string) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: "visible" });
    await element.click();
  }

  /**
   * Uzupełnia pole tekstowe
   */
  async fillInput(selector: string, value: string) {
    const input = this.page.locator(selector);
    await input.waitFor({ state: "visible" });
    await input.fill(value);
  }
}
