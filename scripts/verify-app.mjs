#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runApiIntegrationTests } from './api-integration.test.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BACKEND_PORT = process.env.PORT || '3001';
const PREVIEW_PORT = process.env.PREVIEW_PORT || '4173';
const API_URL = `http://127.0.0.1:${BACKEND_PORT}/api`;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

const children = [];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || ROOT,
      env: { ...process.env, ...options.env },
      stdio: options.stdio || 'inherit'
    });
    children.push(child);

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0 || options.ignoreExit) {
        resolve(child);
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

function runSync(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: options.cwd || ROOT,
    env: { ...process.env, ...options.env },
    stdio: 'inherit'
  });
}

async function waitForHttp(url, label, attempts = 30) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 401) {
        console.log(`${label} is ready (${url})`);
        return;
      }
    } catch {
      // retry
    }
    await delay(500);
  }
  throw new Error(`${label} did not become ready at ${url}`);
}

function stopChildren() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }
}

async function main() {
  process.on('SIGINT', stopChildren);
  process.on('exit', stopChildren);

  console.log('=== Passwd app verification ===');

  console.log('\n[1/4] Setting up MariaDB test database...');
  runSync('bash', [path.join(ROOT, 'scripts/setup-test-db.sh')]);

  console.log('\n[2/4] Running frontend unit tests and build...');
  runSync('npm', ['test'], { cwd: path.join(ROOT, 'front') });
  runSync('npm', ['run', 'build'], { cwd: path.join(ROOT, 'front') });

  console.log('\n[3/4] Starting backend and running API integration tests...');
  const backend = spawn('node', ['--env-file=.env.test', 'server.js'], {
    cwd: path.join(ROOT, 'back'),
    env: {
      ...process.env,
      PORT: BACKEND_PORT,
      DATASOURCE_HOST: '127.0.0.1',
      DATASOURCE_USER: 'passwd',
      DATASOURCE_PASSWORD: 'passwd',
      DATASOURCE_DATABASE: 'passwd',
      SECRET: 'test-secret'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  children.push(backend);
  backend.stdout.on('data', (chunk) => process.stdout.write(chunk));
  backend.stderr.on('data', (chunk) => process.stderr.write(chunk));

  await waitForHttp(`${API_URL}/password`, 'Backend API');
  process.env.API_URL = API_URL;
  await runApiIntegrationTests();

  console.log('\n[4/4] Starting frontend preview and checking UI bundle...');
  const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', PREVIEW_PORT], {
    cwd: path.join(ROOT, 'front'),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  children.push(preview);
  preview.stdout.on('data', (chunk) => process.stdout.write(chunk));
  preview.stderr.on('data', (chunk) => process.stderr.write(chunk));

  await waitForHttp(PREVIEW_URL, 'Frontend preview');
  const page = await fetch(PREVIEW_URL);
  if (!page.ok) {
    throw new Error(`Frontend preview returned HTTP ${page.status}`);
  }
  const html = await page.text();
  if (!html.includes('React Passwd') || !html.includes('id="root"')) {
    throw new Error('Frontend preview HTML did not contain expected app shell');
  }

  console.log('\nAll verification checks passed.');
}

main()
  .catch((error) => {
    console.error('\nVerification failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    stopChildren();
    process.exit(process.exitCode ?? 0);
  });
