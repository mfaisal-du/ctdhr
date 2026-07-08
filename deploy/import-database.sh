#!/bin/bash
# Import CTDHR schema + seed + migrations into Hostinger MySQL database.
# Usage: DB_PASS='yourpass' bash deploy/import-database.sh
set -e
cd "$(dirname "$0")/.."

DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-u813653424_ctdhr}"
DB_USER="${DB_USER:-u813653424_ctdhr}"
DB_PASS="${DB_PASS:?Set DB_PASS}"

MYSQL=(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME")

import_sql() {
    local file="$1"
    echo "==> Importing $(basename "$file")"
    sed -e '/^CREATE DATABASE/,/^USE /d' -e '/^USE /d' "$file" | "${MYSQL[@]}"
}

import_sql database/schema.sql.deploy
import_sql database/seed.sql.deploy
import_sql database/migrations/phase2.sql.deploy
import_sql database/migrations/attendance-cert-features.sql.deploy
import_sql database/migrations/category-card-image.sql.deploy
import_sql database/migrations/news-ticker.sql.deploy
import_sql database/migrate-participant-types.sql.deploy

echo "==> Database import complete"