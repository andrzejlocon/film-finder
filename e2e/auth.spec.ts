import { expect, test } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";
import { TopbarComponent } from "./page-objects/TopbarComponent";

test.describe('Authentication flows', () => {
  let loginPage: LoginPage;
  let topbar: TopbarComponent;

  const TEST_USERNAME = process.env.E2E_USERNAME as string;
  const TEST_PASSWORD = process.env.E2E_PASSWORD as string;

  test.beforeEach(({ page }) => {
    if (!TEST_USERNAME || !TEST_PASSWORD) {
      throw new Error('Missing required environment variables: E2E_USERNAME and/or E2E_PASSWORD');
    }

    // Page Objects initialization
    loginPage = new LoginPage(page);
    topbar = new TopbarComponent(page);
  });

  test('should successfully log in and show user email in topbar', async () => {
    // Arrange
    await loginPage.goto();
    await loginPage.expectReady();

    // Act
    await loginPage.login(TEST_USERNAME, TEST_PASSWORD);

    // Assert
    await topbar.expectLoggedIn(TEST_USERNAME);
    await topbar.expectNavigationLinks();
  });

  test('should show loading state during login process', async () => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.fillLoginForm(TEST_USERNAME, TEST_PASSWORD);

    await Promise.all([
      loginPage.expectLoading(),
      loginPage.submit()
    ]);

    // Assert
    await topbar.expectLoggedIn(TEST_USERNAME);
  });

  test('should show error message for invalid credentials', async () => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.login(TEST_USERNAME, 'wrong_password');

    // Assert
    await loginPage.expectError('Invalid email or password');
    await loginPage.expectReady();
  });

  test('should redirect to recommendations after successful login', async ({ page }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.login(TEST_USERNAME, TEST_PASSWORD);

    // Assert
    await expect(page).toHaveURL('/recommendations');
    await topbar.expectLoggedIn(TEST_USERNAME);
  });
});
