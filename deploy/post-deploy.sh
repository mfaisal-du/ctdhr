#!/bin/bash
# Run on Hostinger after git pull (SSH: cd to project root, then bash deploy/post-deploy.sh)
set -e
cd "$(dirname "$0")/.."

echo "==> Composer install"
COMPOSER_FLAGS=(--no-dev --optimize-autoloader --no-interaction --ignore-platform-req=ext-ldap)

if command -v composer >/dev/null 2>&1; then
    composer install "${COMPOSER_FLAGS[@]}"
elif [ -f composer.phar ]; then
    php composer.phar install "${COMPOSER_FLAGS[@]}"
else
    echo "Composer not found. Install dependencies manually."
    exit 1
fi

echo "==> Writable directories"
mkdir -p storage/logs storage/cache storage/mail storage/tmp
mkdir -p public/assets/uploads/courses public/assets/uploads/categories
mkdir -p public/assets/uploads/certificates public/assets/uploads/profiles
chmod -R 775 storage public/assets/uploads 2>/dev/null || true

echo "==> Portal images (du.edu.om → public/assets/images)"
if [ -f deploy/download-du-images.sh ]; then
    bash deploy/download-du-images.sh
else
    echo "    download-du-images.sh not found — skip"
fi

if [ "${RUN_SEED_IMPORT:-}" = "1" ] && [ -f deploy/import-seed-only.sh ]; then
    echo "==> Database seed (RUN_SEED_IMPORT=1)"
    bash deploy/import-seed-only.sh
fi

echo "==> Post-deploy complete"