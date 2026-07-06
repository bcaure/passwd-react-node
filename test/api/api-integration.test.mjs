import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API_URL = process.env.API_URL || 'http://127.0.0.1:3001/api';
const TEST_USER = process.env.TEST_USER || 'ben';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpass123';

async function expectStatus(response, expectedStatus, label) {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    assert.fail(`${label}: expected HTTP ${expectedStatus}, got ${response.status} (${body})`);
  }
}

async function login() {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: TEST_USER, password: TEST_PASSWORD })
  });
  await expectStatus(response, 200, 'login');
  const body = await response.json();
  assert.ok(body.token, 'login response should include a token');
  return body.token;
}

export async function runApiIntegrationTests() {
  console.log('Running API integration tests against', API_URL);

  const missingCredentials = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: '', password: '' })
  });
  await expectStatus(missingCredentials, 401, 'login without credentials');

  const wrongPassword = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: TEST_USER, password: 'wrong-password' })
  });
  await expectStatus(wrongPassword, 401, 'login with wrong password');

  const token = await login();

  const unauthorized = await fetch(`${API_URL}/password`);
  await expectStatus(unauthorized, 401, 'password list without token');

  const listResponse = await fetch(`${API_URL}/password`, {
    headers: { Authorization: token }
  });
  await expectStatus(listResponse, 200, 'password list with token');
  const accounts = await listResponse.json();
  assert.ok(Array.isArray(accounts), 'password list should return an array');
  assert.ok(accounts.length > 0, 'password list should not be empty');

  const searchResponse = await fetch(`${API_URL}/password?search=Adobe`, {
    headers: { Authorization: token }
  });
  await expectStatus(searchResponse, 200, 'password search');
  const searchResults = await searchResponse.json();
  assert.ok(
    searchResults.some((account) => account.name === 'Adobe'),
    'search should return matching accounts'
  );

  console.log('API integration tests passed.');
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runApiIntegrationTests().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
