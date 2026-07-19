#!/usr/bin/env bash
# Provisions the test database in CI (GitHub Actions MariaDB service container).
# No sudo required — connects as root using MARIADB_ROOT_PASSWORD.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MARIADB_HOST="${MARIADB_HOST:-127.0.0.1}"
MARIADB_ROOT_PASSWORD="${MARIADB_ROOT_PASSWORD:?MARIADB_ROOT_PASSWORD is required}"
TEST_PASSWORD="${TEST_PASSWORD:-testpass123}"

mysql_cmd() {
  mariadb -h "$MARIADB_HOST" -u root -p"$MARIADB_ROOT_PASSWORD" "$@"
}

echo "Provisioning passwd database (CI)..."
mysql_cmd < "${ROOT_DIR}/db/init-mariadb-11.8.sql"

echo "Setting known test credentials for user ben..."
HASH="$(node -e "process.stdout.write(require('${ROOT_DIR}/back/node_modules/bcryptjs').hashSync('${TEST_PASSWORD}', 10))")"
mariadb -u passwd -ppasswd -h "$MARIADB_HOST" passwd -e \
  "UPDATE user SET password='${HASH}', used_quota=0 WHERE login='ben';"

echo "Database ready."
