const { test, expect } = require('@playwright/test');
const { SEEDED_ACCOUNT_COUNT, resetDatabase, loginAndWaitForAccounts, accountRow } = require('./helpers');

test.describe('Account listing and search', () => {
  test.beforeEach(async ({ page }) => {
    resetDatabase();
    await loginAndWaitForAccounts(page);
  });

  test('lists all seeded accounts for the user', async ({ page }) => {
    await expect(page.getByTestId('account-row')).toHaveCount(SEEDED_ACCOUNT_COUNT);
    await expect(accountRow(page, 'Adobe')).toBeVisible();
    await expect(accountRow(page, '3 Suisses')).toBeVisible();
  });

  test('filters accounts using the search field', async ({ page }) => {
    await page.getByTestId('search-filter').pressSequentially('Adobe');

    // The search input debounces for 2s before querying the backend.
    await expect(page.getByTestId('account-row')).toHaveCount(1, { timeout: 10_000 });
    await expect(accountRow(page, 'Adobe')).toBeVisible();
  });
});
