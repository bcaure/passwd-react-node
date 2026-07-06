const { test, expect } = require('@playwright/test');
const {
  CREDENTIALS,
  SEEDED_ACCOUNT_COUNT,
  resetDatabase,
  login,
  loginAndWaitForAccounts,
  accountRow
} = require('./helpers');

// End-to-end smoke test covering the full user journey in a single flow.
// Also serves as the source for the demo recording.
test.describe('Full user journey', () => {
  test.beforeEach(() => {
    resetDatabase();
  });

  test('login, browse, search, create, edit and delete', async ({ page }) => {
    // 1. Log in
    await login(page);
    await expect(page.getByTestId('accounts-table')).toBeVisible();
    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT));

    // 2. Search for an account (input debounces ~2s before querying)
    await page.getByTestId('search-filter').pressSequentially('Adobe');
    await expect(page.getByTestId('account-row')).toHaveCount(1, { timeout: 10_000 });
    await expect(accountRow(page, 'Adobe')).toBeVisible();

    // 3. Clear the search to see all accounts again
    await page.getByTestId('search-filter').fill('');
    await page.getByTestId('search-filter').pressSequentially(' ');
    await page.getByTestId('search-filter').fill('');
    await expect(page.getByTestId('account-row')).toHaveCount(SEEDED_ACCOUNT_COUNT, { timeout: 10_000 });

    // 4. Create a new account
    await page.getByTestId('add-account').click();
    await page.getByTestId('row-name').fill('Demo Site');
    await page.getByTestId('row-url').fill('https://demo.example');
    await page.getByTestId('row-username').fill('demo-user');
    await page.getByTestId('row-password').fill('demo-pass');
    await page.getByTestId('row-validate').click();
    await accountRow(page, 'Demo Site').scrollIntoViewIfNeeded();
    await expect(accountRow(page, 'Demo Site')).toBeVisible();
    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT + 1));

    // 5. Edit an existing account's password
    await accountRow(page, 'Adobe').scrollIntoViewIfNeeded();
    await accountRow(page, 'Adobe').getByTestId('row-edit').click();
    await page.getByTestId('row-password').fill('adobe-pass-updated');
    await page.getByTestId('row-validate').click();
    await expect(accountRow(page, 'Adobe').getByTestId('row-col-password')).toHaveText('adobe-pass-updated');

    // 6. Delete an existing account
    await accountRow(page, '3 Suisses').scrollIntoViewIfNeeded();
    await accountRow(page, '3 Suisses').getByTestId('row-delete').click();
    await expect(accountRow(page, '3 Suisses')).toHaveCount(0);
    // Started with SEEDED_ACCOUNT_COUNT, +1 created, -1 deleted.
    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT));

    // 7. Confirm everything persisted after a full reload + re-login
    await page.reload();
    await login(page, CREDENTIALS.username, CREDENTIALS.password);
    await expect(page.getByTestId('account-count')).toHaveText(String(SEEDED_ACCOUNT_COUNT));
    await expect(accountRow(page, 'Demo Site')).toBeVisible();
    await expect(accountRow(page, 'Adobe').getByTestId('row-col-password')).toHaveText('adobe-pass-updated');
    await expect(accountRow(page, '3 Suisses')).toHaveCount(0);
  });
});
