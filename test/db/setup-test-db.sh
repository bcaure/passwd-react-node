#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_PASSWORD="${TEST_PASSWORD:-testpass123}"

echo "Starting MariaDB..."
sudo service mariadb start >/dev/null 2>&1 || true

echo "Provisioning passwd database..."
sudo mariadb <<'SQL'
CREATE DATABASE IF NOT EXISTS `passwd` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'passwd'@'localhost' IDENTIFIED BY 'passwd';
CREATE USER IF NOT EXISTS 'passwd'@'127.0.0.1' IDENTIFIED BY 'passwd';
GRANT ALL PRIVILEGES ON passwd.* TO 'passwd'@'localhost';
GRANT ALL PRIVILEGES ON passwd.* TO 'passwd'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

sudo mariadb passwd < "${ROOT_DIR}/db/init-mariadb-10.11.sql"

echo "Setting known test credentials for user ben..."
HASH="$(node -e "process.stdout.write(require('${ROOT_DIR}/back/node_modules/bcryptjs').hashSync('${TEST_PASSWORD}', 10))")"
mysql -u passwd -ppasswd -h 127.0.0.1 passwd -e \
  "UPDATE user SET password='${HASH}', used_quota=0 WHERE login='ben';"

echo "Database ready."
