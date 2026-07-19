# Passwd

A React + Node/Express password manager backed by MySQL/MariaDB. Two services live under `back/` (Express REST API) and `front/` (Create React App SPA). See `front/README.md` for the base dev commands.

## Cursor Cloud specific instructions

### Services

| Service | Dir | Dev command | Port |
|---------|-----|-------------|------|
| Backend API | `back` | `npm start` (`node --env-file=.env server.js`) | 3001 |
| Frontend SPA | `front` | `npm start` (`react-scripts start`) | 3000 |
| Database | — | MariaDB (`sudo service mariadb start`) | 3306 |

### Non-obvious startup caveats

- **Start MariaDB first**: `sudo service mariadb start`. It is not auto-started on boot. The backend fails all API calls (HTTP 500) without a DB connection.
- **Backend needs `back/.env`** (git-ignored, so it lives only in the VM snapshot, not the repo). It defines `DATASOURCE_HOST/USER/PASSWORD/DATABASE` and the JWT `SECRET`. If it is ever missing, recreate it pointing at DB `cgicertif_mydb` with app user `passwd`/`passwd` and any `SECRET`.
- **Frontend requires the legacy OpenSSL provider** on modern Node (this repo pins `react-scripts` 1.1.4). Start it with `NODE_OPTIONS=--openssl-legacy-provider npm start`; without it webpack crashes with `error:0308010C:digital envelope routines::unsupported`.
- The frontend defaults its API base to `http://localhost:3001/api` when `REACT_APP_API_URL` is unset (`front/src/redux/Actions.js`), which matches the local backend.

### Database

- DB name: `cgicertif_mydb`, seeded from `small-dump-dev.sql` (tables `compte`, `site`, `user`, `password`). App user: `passwd` / `passwd`.
- Demo users `ben` and `delphine` exist but their plaintext passwords are unknown. A test account was seeded for local login: **`testuser` / `testpass123`**. To (re)seed it, bcrypt-hash the password with the backend's own lib and upsert into `user`, e.g. from `back/`:
  `node -e "console.log(require('bcryptjs').hashSync('testpass123',10))"` then `INSERT ... ON DUPLICATE KEY UPDATE` into the `user` table.
- Login enforces a per-user quota: rows with `used_quota >= 50` are rejected. Keep `testuser.used_quota` low.

### Lint / test / build

- No lint script is defined in either package.
- `front`: `CI=true NODE_OPTIONS=--openssl-legacy-provider npm test`. Note the single existing test `src/components/App.test.js` currently FAILS as-is (pre-existing bug): it renders the Redux-connected `<App />` without a `<Provider>` store, so it throws `Could not find "store"`. The test runner itself works.
- `back`: `npm test` is a stub (`exit 1`); there are no backend tests.
- Production build (frontend): `npm run build` (also needs the legacy OpenSSL provider).
