#!/bin/bash
# Ensure production uses email/password auth (LDAP extension unavailable on Hostinger).
set -e
cd "$(dirname "$0")/.."
DB_PASS="${DB_PASS:?Set DB_PASS}"
MYSQL=(mysql -h localhost -u u813653424_ctdhr -p"$DB_PASS" u813653424_ctdhr)

echo "==> Force email auth (disable LDAP on shared hosting)"
"${MYSQL[@]}" -e "
UPDATE system_settings SET setting_value='email' WHERE setting_key='auth_method';
UPDATE system_settings SET setting_value='false' WHERE setting_key='ldap_enabled';
UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()), is_active = 1
WHERE role = 'admin' AND email_verified_at IS NULL;
"

echo "==> Live auth settings OK"