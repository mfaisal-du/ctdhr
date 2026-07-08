#!/bin/bash
# One-time: link live folder to public GitHub repo (preserves .env + vendor).
set -e
cd "$(dirname "$0")/.."
REPO_URL="${REPO_URL:-https://github.com/mfaisal-du/ctdhr.git}"
BRANCH="${BRANCH:-main}"

if [ -f .env ]; then
    cp .env /tmp/ctdhr.env.bak
fi

if [ ! -d .git ]; then
    git init
    git remote add origin "$REPO_URL"
fi

git fetch origin "$BRANCH"
git checkout -B "$BRANCH" 2>/dev/null || true
git reset --hard "origin/$BRANCH"

if [ -f /tmp/ctdhr.env.bak ]; then
    cp /tmp/ctdhr.env.bak .env
    chmod 600 .env
fi

if [ ! -d vendor ]; then
    composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-req=ext-ldap
else
    composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-req=ext-ldap
fi

bash deploy/post-deploy.sh
echo "==> Git linked to $REPO_URL ($BRANCH)"