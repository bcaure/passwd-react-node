#!/usr/bin/env bash
# Installs the MariaDB 11.8 server from the official MariaDB apt repository.
#
# Ubuntu 24.04's default repositories only provide MariaDB 10.11, so the
# official MariaDB repository is required to match the 11.8 production server.
#
# Intended for the Cloud Agent environment "install" phase. It is idempotent:
# if MariaDB 11.8 is already present it exits early.
set -euo pipefail

TARGET_VERSION="${MARIADB_VERSION:-11.8}"

current_version() {
  # Handles both the old ("Distrib 10.11.14-MariaDB") and new
  # ("mariadb from 11.8.8-MariaDB, client ...") --version formats.
  mariadb --version 2>/dev/null \
    | grep -oE '[0-9]+\.[0-9]+\.[0-9]+-MariaDB' \
    | head -1 | cut -d. -f1,2 || true
}

if [ "$(current_version)" = "${TARGET_VERSION}" ]; then
  echo "MariaDB ${TARGET_VERSION} is already installed ($(mariadb --version))."
  exit 0
fi

echo "Configuring the official MariaDB ${TARGET_VERSION} repository..."
curl -fsSL https://r.mariadb.com/downloads/mariadb_repo_setup -o /tmp/mariadb_repo_setup.sh
sudo bash /tmp/mariadb_repo_setup.sh \
  --mariadb-server-version="mariadb-${TARGET_VERSION}" \
  --skip-maxscale

echo "Installing MariaDB ${TARGET_VERSION} server..."
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server mariadb-client

echo "Installed: $(mariadb --version)"
