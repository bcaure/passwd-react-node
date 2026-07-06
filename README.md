# Passwords React/Node.js app

Password manager with a React frontend and Node.js/Express backend, targeting **Node.js 24**, **React 19**, and **MariaDB 10.11**.

## Requirements

- Node.js 24 (`nvm use` reads `.nvmrc`)
- Docker (optional, for local MariaDB 10.11)

## Local development

### 1. Start MariaDB 10.11

```bash
docker compose up -d mariadb
```

This creates the `passwd` database and loads sample data from `db/init-mariadb-10.11.sql`.

### 2. Backend

```bash
cd back
cp .env.example .env
npm install
npm start
```

The API listens on port `3001`.

### 3. Frontend

```bash
cd front
npm install
npm start
```

The app runs on port `3000` and proxies `/api` requests to the backend.

## Environment variables

### Backend (`back/.env`)

| Variable | Description |
|----------|-------------|
| `DATASOURCE_HOST` | MariaDB host |
| `DATASOURCE_USER` | MariaDB user |
| `DATASOURCE_PASSWORD` | MariaDB password |
| `DATASOURCE_DATABASE` | Database name |
| `SECRET` | JWT signing secret |
| `PORT` | API port (default: 3001) |
| `STATIC_DIR` | Optional path to serve the frontend build |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (default: `http://localhost:3001/api`) |

## Deploy instructions

### Backend

- Copy `back/` to your server
- Configure `.env` for your MariaDB 10.11 instance
- Run with Node.js 24: `npm start`

### Frontend

Build with the production API URL:

```bash
cd front
VITE_API_URL=/api npm run build
```

Copy `front/dist/` to your static web root (for example `www/passwd`).

## Automated verification

Run the full end-to-end check (MariaDB setup, frontend tests/build, API integration, frontend preview):

```bash
npm run verify
```

This uses the locally installed MariaDB 10.11 server in the cloud agent environment. Docker is optional for local machines that prefer containers.

Individual steps:

```bash
npm run verify:db    # reset and seed the test database
npm run verify:api   # API tests only (backend must already be running)
npm run test:front   # frontend unit tests
npm run test:build   # frontend production build
```

## Test layout

All tests and test tooling live under the root `test/` directory:

```
test/
  api/            # API integration tests (node --test style, run against the backend)
  db/             # database setup/reset scripts used by the API and E2E tests
  e2e/            # Playwright GUI tests + shared helpers
  verify-app.mjs  # full-stack verification orchestrator (npm run verify)
```

## End-to-end (GUI) tests with Playwright

The `test/e2e/` suite drives the real UI in a headless browser and covers the
main user flows: login (success and failure), account listing, search, and
create/edit/delete with server-side persistence checks.

Install the browser once (already available in the Cursor cloud agent
environment), then run the suite:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright automatically:

1. resets and seeds the MariaDB 10.11 test database (`test/db/reset-test-db.sh`),
2. starts the backend (`back/`) and the Vite dev server (`front/`),
3. runs the specs in `test/e2e/`.

Useful options:

```bash
npm run test:e2e -- test/e2e/crud.spec.js    # run a single spec
PW_VIDEO=on PW_SLOWMO=350 npm run test:e2e    # record videos in slow motion
npm run test:e2e:report                       # open the HTML report
```

The test user is `ben` / `testpass123` (seeded by the reset script).


- Frontend migrated from Create React App (React 16) to **Vite + React 19**
- Backend uses **mysql2** instead of the deprecated `mysql` package for MariaDB 10.11 compatibility
- Legacy SQL dump preserved in `small-dump-dev.sql`; use `db/init-mariadb-10.11.sql` for new MariaDB 10.11 setups
