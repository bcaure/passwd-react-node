# Passwords React/Node.js app

Password manager with a React frontend and Node.js/Express backend, targeting **Node.js 24**, **React 19**, and **MariaDB 11.8**.

## Requirements

- Node.js 24 (`nvm use` reads `.nvmrc`)
- Docker (optional, for local MariaDB 11.8)

## Local development

### 1. Start MariaDB 11.8

Using Docker (recommended for local machines):

```bash
docker compose up -d mariadb
```

Without Docker (e.g. the Cursor cloud agent), install the server from the
official MariaDB repository — Ubuntu's default apt only ships 10.11:

```bash
bash test/db/install-mariadb.sh   # installs MariaDB 11.8 (idempotent)
sudo service mariadb start
```

Either way, `db/init-mariadb-11.8.sql` creates the `passwd` database and loads
sample data.

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

### Manual deploy

#### Backend

- Copy `back/` to your server
- Configure `.env` for your MariaDB 11.8 instance
- Run with Node.js 24: `npm start`

#### Frontend

Build with the production API URL:

```bash
cd front
VITE_API_URL=/api npm run build
```

Copy `front/dist/` to your static web root (for example `www/passwd`).

The production `.htaccess` for the static site lives in `front/public/.htaccess` (copied into `dist/` on build). Uncomment the API proxy rule and set your Node.js internal port from AlwaysData → Web → Sites → Environment.

### Automated deploy (GitHub Actions)

Pushing to `master` runs **CI** (unit tests, build, API tests, Playwright E2E), then **Deploy** (rsync over SSH + AlwaysData site restart).

#### GitHub secrets

| Secret | Description |
|--------|-------------|
| `ALWAYSDATA_SSH_PRIVATE_KEY` | SSH private key (public key added in AlwaysData → Remote access → SSH keys) |
| `ALWAYSDATA_SSH_USER` | SSH account name (e.g. `cgicertif`) |
| `ALWAYSDATA_API_KEY` | API key from AlwaysData profile |
| `ALWAYSDATA_ACCOUNT` | AlwaysData account name |
| `ALWAYSDATA_API_PASSWORD` | Account password (used for API basic auth) |
| `ALWAYSDATA_BACKEND_SITE_ID` | Numeric site ID of the Node.js backend (Web → Sites) |

#### Remote paths

| Component | Path on server |
|-----------|----------------|
| Backend | `/home/cgicertif/passwd/back` |
| Frontend | `/home/cgicertif/www/passwd` |

The deploy workflow preserves the server-side `back/.env` and `back/.htaccess` (excluded from rsync).

## Automated verification

Run the full end-to-end check (MariaDB setup, frontend tests/build, API integration, frontend preview):

```bash
npm run verify
```

This uses the locally installed MariaDB 11.8 server in the cloud agent environment. Docker is optional for local machines that prefer containers.

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

1. resets and seeds the MariaDB 11.8 test database (`test/db/reset-test-db.sh`),
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
- Backend uses **mysql2** instead of the deprecated `mysql` package for MariaDB 11.8 compatibility
- Legacy SQL dump preserved in `small-dump-dev.sql`; use `db/init-mariadb-11.8.sql` for new MariaDB 11.8 setups
