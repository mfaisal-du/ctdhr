#!/bin/bash
# Download portal images from du.edu.om into public/assets/images/
# Mirrors scripts/download-du-images.ps1 + brand logos.
# Safe to re-run (skips files that already exist with size > 1KB).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/assets/images"
UA="Mozilla/5.0 (compatible; CTDHR-Deploy/1.0)"

mkdir -p "$DEST/du/graduation" "$DEST/du/2025" "$DEST/du/brand" "$DEST/contact"

download() {
    local url="$1"
    local out="$2"
    local dir
    dir="$(dirname "$out")"
    mkdir -p "$dir"

    if [ -f "$out" ] && [ "$(wc -c < "$out" | tr -d ' ')" -gt 1024 ]; then
        echo "  skip (exists): $(basename "$out")"
        return 0
    fi

    echo "  get: $(basename "$out")"
    if ! curl -fsSL --retry 3 --retry-delay 2 -A "$UA" -o "$out" "$url"; then
        echo "  FAIL: $url" >&2
        rm -f "$out"
        return 1
    fi

    if [ ! -s "$out" ]; then
        echo "  FAIL (empty): $url" >&2
        rm -f "$out"
        return 1
    fi
}

echo "==> DU gallery images (graduation)"
declare -A GRADUATION=(
    [tn_DU-Graduation.jpg]=graduation-main.jpg
    [tn_DSC_7061.jpg]=graduation-ceremony-01.jpg
    [tn_DSC_7112.jpg]=graduation-ceremony-02.jpg
    [tn_DSC_7149.jpg]=graduation-ceremony-03.jpg
    [tn_DSC_8579.jpg]=graduation-ceremony-04.jpg
    [tn_DSC_0818.jpg]=graduation-ceremony-05.jpg
    [tn_DSC_5886.jpg]=graduation-ceremony-06.jpg
)
for src in "${!GRADUATION[@]}"; do
    download "https://www.du.edu.om/wp-content/uploads/2020/11/$src" \
        "$DEST/du/graduation/${GRADUATION[$src]}"
done

echo "==> DU gallery images (2025)"
declare -A DU2025=(
    [Dhofar-University-2025-Gallery-1.jpg]=du2025-gallery-hero.jpg
    [10.jpg]=du2025-campus-wide.jpg
    [3A6A1261.jpg]=du2025-training-01.jpg
    [3A6A8317.jpg]=du2025-campus-01.jpg
    [467A0505.jpg]=du2025-training-02.jpg
    [3A6A8620.jpg]=du2025-event-01.jpg
    [8.jpg]=du2025-event-02.jpg
    [3.jpg]=du2025-academic-01.jpg
    [3A6A5595.jpg]=du2025-campus-02.jpg
    [3A6A6264.jpg]=du2025-training-03.jpg
    [3A6A1339.jpg]=du2025-gallery-02.jpg
    [3A6A1344.jpg]=du2025-gallery-03.jpg
    [3A6A1348.jpg]=du2025-gallery-04.jpg
    [3A6A1353.jpg]=du2025-gallery-05.jpg
    [3A6A1567.jpg]=du2025-gallery-06.jpg
    [3A6A3314.jpg]=du2025-gallery-07.jpg
    [3A6A3325.jpg]=du2025-gallery-08.jpg
    [3A6A4837.jpg]=du2025-gallery-09.jpg
    [3A6A5054.jpg]=du2025-gallery-10.jpg
    [3A6A5074.jpg]=du2025-gallery-11.jpg
    [3A6A5602.jpg]=du2025-gallery-12.jpg
    [3A6A5604.jpg]=du2025-gallery-13.jpg
    [3A6A5655.jpg]=du2025-gallery-14.jpg
    [3A6A8025.jpg]=du2025-gallery-15.jpg
    [3A6A8382.jpg]=du2025-gallery-16.jpg
    [3A6A8504.jpg]=du2025-gallery-17.jpg
    [3A6A8560.jpg]=du2025-gallery-18.jpg
    [3A6A8626.jpg]=du2025-gallery-19.jpg
    [3A6A8648.jpg]=du2025-gallery-20.jpg
    [467A0510.jpg]=du2025-gallery-21.jpg
)
for src in "${!DU2025[@]}"; do
    download "https://www.du.edu.om/wp-content/uploads/2025/02/$src" \
        "$DEST/du/2025/${DU2025[$src]}"
done

echo "==> DU brand logos"
download "https://www.du.edu.om/wp-content/uploads/2018/04/cropped-cropped-small_logoH9JJ3E1JGMUU6RTWWNPMQ39LQ9E92JZSDAYE56YQ216M79E3V8PS7HTJSBT2JZX4R4254WELN4QP91PA-2-1-192x192.jpg" \
    "$DEST/du/brand/du-emblem.jpg"
download "https://www.du.edu.om/wp-content/uploads/2018/04/Dhofar-University-Logo-1-2021.jpg" \
    "$DEST/du/brand/du-logo.jpg"

echo "==> Optional legacy / reference images"
download "https://www.du.edu.om/wp-content/uploads/2025/04/Alumni.jpg" "$DEST/alumni.png"
download "https://www.du.edu.om/wp-content/uploads/2025/04/Campus-Life.jpg" "$DEST/campus-life.png"
download "https://www.du.edu.om/wp-content/uploads/2025/04/Prospective-Students.jpg" "$DEST/hero-prospective.png"
download "https://www.du.edu.om/wp-content/uploads/2020/12/Faculty_Staff.jpg" "$DEST/faculty-staff.png"
download "https://www.du.edu.om/wp-content/uploads/2025/04/Research.jpg" "$DEST/research.png"
download "https://www.du.edu.om/wp-content/uploads/2025/04/My-DU.jpg" "$DEST/my-du.png"
download "https://www.du.edu.om/wp-content/uploads/2018/11/New-DU-Academic-Programs_ca3e4def260d9bd2d668a2f5fe16e5e6.jpg" "$DEST/du-academic.png"
download "https://www.du.edu.om/wp-content/uploads/2018/11/CAAS-Main_24e753a6d7507b0a4c242b9d4fc574c5.jpg" "$DEST/college-caas.png"
download "https://www.du.edu.om/wp-content/uploads/2018/11/CCBA-Main_87cdde7e84deff50c933e8f2fd3ab06d.jpg" "$DEST/college-ccba.png"
download "https://www.du.edu.om/wp-content/uploads/2018/11/CE-Main_f9a4e3944cd912e5233ecfa0a8f85057.jpg" "$DEST/college-ce.png"
download "https://www.du.edu.om/wp-content/uploads/2018/11/CSCEC-Main_591a4a75ec3f7ff62c5284637d856ecf.jpg" "$DEST/college-cscec.png"
download "https://www.du.edu.om/wp-content/uploads/2018/11/FP-Main_9f83f467a2af3d6ec8f4c2defd1c11d3.jpg" "$DEST/college-fp.png"
download "https://www.du.edu.om/wp-content/uploads/2018/04/Dhofar-University-Logo-1-2021.jpg" "$DEST/dhofar-university.png"
download "https://www.du.edu.om/wp-content/uploads/2021/08/How-To-Register-Thumb.jpg" "$DEST/how-to-register.png"
download "https://www.du.edu.om/wp-content/uploads/2025/02/3A6A8317.jpg" "$DEST/contact/contact-hero.jpg"

echo "==> Done"
count="$(find "$DEST" -type f | wc -l | tr -d ' ')"
echo "    $count files under public/assets/images/"