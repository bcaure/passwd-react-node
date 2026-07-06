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

## Upgrade notes

- Frontend migrated from Create React App (React 16) to **Vite + React 19**
- Backend uses **mysql2** instead of the deprecated `mysql` package for MariaDB 10.11 compatibility
- Legacy SQL dump preserved in `small-dump-dev.sql`; use `db/init-mariadb-10.11.sql` for new MariaDB 10.11 setups
