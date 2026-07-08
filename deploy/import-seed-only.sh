#!/bin/bash
# Import base seed + demo workflow data (safe to re-run on live).
# Usage: DB_PASS='yourpass' bash deploy/import-seed-only.sh
set -e
cd "$(dirname "$0")/.."
DB_PASS="${DB_PASS:?Set DB_PASS}"
MYSQL=(mysql -h localhost -u u813653424_ctdhr -p"$DB_PASS" u813653424_ctdhr)

import_sql() {
    local file="$1"
    echo "==> $file"
    sed -e '/^USE /d' "$file" | "${MYSQL[@]}"
}

category_count="$("${MYSQL[@]}" -N -e "SELECT COUNT(*) FROM course_categories" 2>/dev/null || echo 0)"
if [ "${category_count:-0}" -eq 0 ]; then
    import_sql database/seed.sql.deploy
else
    echo "==> skip database/seed.sql.deploy ($category_count categories already present)"
fi

for f in \
  database/migrations/phase2.sql.deploy \
  database/migrations/attendance-cert-features.sql.deploy \
  database/migrations/category-card-image.sql.deploy \
  database/migrations/news-ticker.sql.deploy \
  database/migrate-participant-types.sql.deploy \
  database/seed-demo.sql.deploy \
  database/seed-category-card-images.sql.deploy
do
  import_sql "$f"
done

echo "==> Demo certificate PDF assets"
demo_dir="public/assets/uploads/certificates/demo"
mkdir -p "$demo_dir" public/assets/uploads/certificates/qr public/assets/uploads/certificates/templates
for pdf in database/assets/certificates/demo/*.pdf.deploy; do
  [ -f "$pdf" ] || continue
  base="$(basename "$pdf" .pdf.deploy)"
  if [ ! -f "$demo_dir/$base.pdf" ]; then
    cp "$pdf" "$demo_dir/$base.pdf"
    echo "    copied $base.pdf"
  fi
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