const { test, expect } = require('@playwright/test');
const {
  SEEDED_ACCOUNT_COUNT,
  resetDatabase,
  loginAndWaitForAccounts,
  accountRow
} = require('./helpers');

test.describe('Account CRUD operations', () => {
  test.beforeEach(async ({ page }) => {
    resetDatabase();
    await loginAndWaitForAccounts(page);
  });

  test('creates a new account', async ({ page }) => {
    await page.getByTestId('add-account').click();

    await page.getByTestId('row-name').fill('Playwright Site');
    await page.getByTestId('row-url').fill('https://playwright.dev');
    await page.getByTestId('row-username').fill('e2e-user');
    await page.getByTestId('row-password').fill('e2e-secret');
    await page.getByTestId('row-validate').click();

    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT + 1));
    await expect(accountRow(page, 'Playwright Site')).toBeVisible();

    // Confirm it persisted server-side by reloading and logging back in.
    await page.reload();
    await loginAndWaitForAccounts(page);
    await expect(accountRow(page, 'Playwright Site')).toBeVisible();
    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT + 1));
  });

  test('edits an existing account password', async ({ page }) => {
    const row = accountRow(page, 'Adobe');
    await row.getByTestId('row-edit').click();

    const passwordField = page.getByTestId('row-password');
    await expect(passwordField).toBeVisible();
    await passwordField.fill('updated-password');
    await page.getByTestId('row-validate').click();

    await expect(row.getByTestId('row-col-password')).toHaveText('updated-password');

    // Reload to confirm the change was persisted in MariaDB.
    await page.reload();
    await loginAndWaitForAccounts(page);
    await expect(accountRow(page, 'Adobe').getByTestId('row-col-password')).toHaveText('updated-password');
  });

  test('deletes an account', async ({ page }) => {
    await expect(accountRow(page, 'Adobe')).toBeVisible();

    await accountRow(page, 'Adobe').getByTestId('row-delete').click();

    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT - 1));
    await expect(accountRow(page, 'Adobe')).toHaveCount(0);

    // Confirm the deletion persisted server-side.
    await page.reload();
    await loginAndWaitForAccounts(page);
    await expect(accountRow(page, 'Adobe')).toHaveCount(0);
    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT - 1));
  });
});
