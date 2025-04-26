import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId('login-form');
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorAlert = page.getByTestId('login-error');
  }

  /**
   * Navigates to the login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForURL('/login');
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fills in the login form and submits it
   * @param email - The email to login with
   * @param password - The password to login with
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submit();
  }

  /**
   * Fills in the login form but does not submit it
   * @param email - The email to fill in
   * @param password - The password to fill in
   */
  async fillLoginForm(email: string, password: string) {
    // Fill in email and wait for the value to update
    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);

    // Short delay for certainty that React updated the state
    await this.page.waitForTimeout(100);

    // Fill in password and wait for the value to update
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);
  }

  /**
   * Submits the login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Checks if the error message is visible
   * @param expectedError - The expected error message (optional)
   */
  async expectError(expectedError?: string) {
    await expect(this.errorAlert).toBeVisible();
    if (expectedError) {
      await expect(this.errorAlert).toContainText(expectedError);
    }
  }

  /**
   * Checks if the form is in loading state
   */
  async expectLoading() {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.submitButton).toContainText('Signing in...');
  }

  /**
   * Checks if the form is ready for input
   */
  async expectReady() {
    await expect(this.submitButton).toBeEnabled();
    await expect(this.submitButton).toContainText('Sign in');
  }
}
