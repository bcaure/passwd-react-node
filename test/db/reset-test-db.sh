#!/usr/bin/env bash
# Resets the test database to a known, deterministic state.
# Truncates all tables, reseeds from the init SQL, and sets a known password
# for the "ben" test user. Safe to run repeatedly (used by the E2E suite).
#
# In CI (GitHub Actions), set MARIADB_ROOT_PASSWORD and optionally MARIADB_HOST.
# Locally, uses sudo + system MariaDB service.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_PASSWORD="${TEST_PASSWORD:-testpass123}"
MARIADB_HOST="${MARIADB_HOST:-127.0.0.1}"

set_ben_password() {
  local hash
  hash="$(node -e "process.stdout.write(require('${ROOT_DIR}/back/node_modules/bcryptjs').hashSync('${TEST_PASSWORD}', 10))")"
  mariadb -u passwd -ppasswd -h "$MARIADB_HOST" passwd -e \
    "UPDATE user SET password='${hash}', used_quota=0 WHERE login='ben';"
}

if [ -n "${MARIADB_ROOT_PASSWORD:-}" ]; then
  mysql_root() {
    mariadb -h "$MARIADB_HOST" -u root -p"$MARIADB_ROOT_PASSWORD" "$@"
  }

  mysql_root < "${ROOT_DIR}/db/init-mariadb-11.8.sql" >/dev/null
  mariadb -u passwd -ppasswd -h "$MARIADB_HOST" passwd <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE compte;
TRUNCATE TABLE site;
TRUNCATE TABLE user;
SET FOREIGN_KEY_CHECKS = 1;
SQL
  mysql_root passwd < "${ROOT_DIR}/db/init-mariadb-11.8.sql" >/dev/null
  set_ben_password
else
  sudo service mariadb start >/dev/null 2>&1 || true

  sudo mariadb <<'SQL'
CREATE DATABASE IF NOT EXISTS `passwd` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'passwd'@'localhost' IDENTIFIED BY 'passwd';
CREATE USER IF NOT EXISTS 'passwd'@'127.0.0.1' IDENTIFIED BY 'passwd';
GRANT ALL PRIVILEGES ON `passwd`.* TO 'passwd'@'localhost';
GRANT ALL PRIVILEGES ON `passwd`.* TO 'passwd'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

  sudo mariadb passwd < "${ROOT_DIR}/db/init-mariadb-11.8.sql" >/dev/null
  mariadb -u passwd -ppasswd -h 127.0.0.1 passwd <<'SQL'
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE compte;
TRUNCATE TABLE site;
TRUNCATE TABLE user;
SET FOREIGN_KEY_CHECKS = 1;
SQL

  sudo mariadb passwd < "${ROOT_DIR}/db/init-mariadb-11.8.sql" >/dev/null
  set_ben_password
fi
