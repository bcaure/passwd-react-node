const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { expect } = require('@playwright/test');

const ROOT = path.join(__dirname, '../..');

const CREDENTIALS = {
  username: 'ben',
  password: 'testpass123'
};

// Number of accounts seeded for the "ben" user (see db/init-mariadb-10.11.sql).
const SEEDED_ACCOUNT_COUNT = 8;

function resetDatabase() {
  execFileSync('bash', [path.join(ROOT, 'test/db/reset-test-db.sh')], {
    stdio: 'pipe',
    env: { ...process.env, TEST_PASSWORD: CREDENTIALS.password }
  });
}

async function login(page, username = CREDENTIALS.username, password = CREDENTIALS.password) {
  await page.goto('/');
  await page.getByTestId('login-username').fill(username);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
}

async function loginAndWaitForAccounts(page) {
  await login(page);
  await expect(page.getByTestId('accounts-table')).toBeVisible();
  await expect(page.getByTestId('account-row').first()).toBeVisible();
}

function accountRow(page, name) {
  return page.locator(`[data-testid="account-row"][data-account-name="${name}"]`);
}

module.exports = {
  CREDENTIALS,
  SEEDED_ACCOUNT_COUNT,
  resetDatabase,
  login,
  loginAndWaitForAccounts,
  accountRow
};
