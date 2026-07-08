#!/bin/bash
set -e
cd "$(dirname "$0")/.."
DB_PASS="${DB_PASS:?Set DB_PASS}"
MYSQL=(mysql -h localhost -u u813653424_ctdhr -p"$DB_PASS" u813653424_ctdhr)
for f in \
  database/seed.sql.deploy \
  database/migrations/phase2.sql.deploy \
  database/migrations/attendance-cert-features.sql.deploy \
  database/migrations/category-card-image.sql.deploy \
  database/migrations/news-ticker.sql.deploy \
  database/migrate-participant-types.sql.deploy
do
  echo "==> $f"
  sed -e '/^USE /d' "$f" | "${MYSQL[@]}"
done
"${MYSQL[@]}" -e "
UPDATE system_settings SET setting_value='smtp.gmail.com' WHERE setting_key='smtp_host';
UPDATE system_settings SET setting_value='587' WHERE setting_key='smtp_port';
UPDATE system_settings SET setting_value='arhamfaisal.146@gmail.com' WHERE setting_key='smtp_username';
UPDATE system_settings SET setting_value='mhxferzicqpuuoxt' WHERE setting_key='smtp_password';
UPDATE system_settings SET setting_value='tls' WHERE setting_key='smtp_encryption';
UPDATE system_settings SET setting_value='arhamfaisal.146@gmail.com' WHERE setting_key='email_from';
UPDATE system_settings SET setting_value='CTDHR Portal' WHERE setting_key='email_from_name';
"
echo "==> Seed import complete"