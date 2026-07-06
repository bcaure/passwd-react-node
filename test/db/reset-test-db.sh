#!/usr/bin/env bash
# Resets the test database to a known, deterministic state.
# Truncates all tables, reseeds from the init SQL, and sets a known password
# for the "ben" test user. Safe to run repeatedly (used by the E2E suite).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_PASSWORD="${TEST_PASSWORD:-testpass123}"

sudo service mariadb start >/dev/null 2>&1 || true

sudo mariadb <<'SQL'
CREATE DATABASE IF NOT EXISTS `passwd` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'passwd'@'localhost' IDENTIFIED BY 'passwd';
CREATE USER IF NOT EXISTS 'passwd'@'127.0.0.1' IDENTIFIED BY 'passwd';
GRANT ALL PRIVILEGES ON `passwd`.* TO 'passwd'@'localhost';
GRANT ALL PRIVILEGES ON `passwd`.* TO 'passwd'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

# Ensure schema exists, then wipe all data for a clean slate.
sudo mariadb passwd < "${ROOT_DIR}/db/init-mariadb-10.11.sql" >/dev/null
mysql -u passwd -ppasswd -h 127.0.0.1 passwd <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE compte;
TRUNCATE TABLE site;
TRUNCATE TABLE user;
SET FOREIGN_KEY_CHECKS = 1;
SQL

# Reseed fresh data into the now-empty tables.
sudo mariadb passwd < "${ROOT_DIR}/db/init-mariadb-10.11.sql" >/dev/null

# Set a known bcrypt password for the "ben" test user and reset its quota.
HASH="$(node -e "process.stdout.write(require('${ROOT_DIR}/back/node_modules/bcryptjs').hashSync('${TEST_PASSWORD}', 10))")"
mysql -u passwd -ppasswd -h 127.0.0.1 passwd -e \
  "UPDATE user SET password='${HASH}', used_quota=0 WHERE login='ben';"
