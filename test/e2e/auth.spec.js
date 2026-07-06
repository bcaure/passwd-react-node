const { test, expect } = require('@playwright/test');
const { CREDENTIALS, SEEDED_ACCOUNT_COUNT, resetDatabase, login } = require('./helpers');

test.describe('Authentication', () => {
  test.beforeEach(() => {
    resetDatabase();
  });

  test('logs in with valid credentials and loads accounts', async ({ page }) => {
    await login(page);

    await expect(page.getByTestId('accounts-table')).toBeVisible();
    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT));
    await expect(page.getByTestId('user-initials')).toHaveText('B');
  });

  test('rejects invalid credentials with an error message', async ({ page }) => {
    await login(page, CREDENTIALS.username, 'wrong-password');

    await expect(page.getByTestId('app-message')).toContainText('Nom d\'utilisateur ou mot de passe erroné');
    await expect(page.getByTestId('accounts-table')).toHaveCount(0);
  });
});
