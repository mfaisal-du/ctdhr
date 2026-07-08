#!/bin/bash
# Run on Hostinger after git pull (SSH: cd to project root, then bash deploy/post-deploy.sh)
set -e
cd "$(dirname "$0")/.."

echo "==> Composer install"
if command -v composer >/dev/null 2>&1; then
    composer install --no-dev --optimize-autoloader --no-interaction
elif [ -f composer.phar ]; then
    php composer.phar install --no-dev --optimize-autoloader --no-interaction
else
    echo "Composer not found. Install dependencies manually."
    exit 1
fi

echo "==> Writable directories"
mkdir -p storage/logs storage/cache storage/mail storage/tmp
mkdir -p public/assets/uploads/courses public/assets/uploads/categories
mkdir -p public/assets/uploads/certificates public/assets/uploads/profiles
chmod -R 775 storage public/assets/uploads 2>/dev/null || true

echo "==> Post-deploy complete"