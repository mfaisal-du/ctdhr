# Downloads high-resolution images from Dhofar University gallery pages
# Sources:
#   https://www.du.edu.om/dhofar-university-graduation/
#   https://www.du.edu.om/dhofar-university-2025/

$dest = Join-Path $PSScriptRoot "..\public\assets\images\du"
New-Item -ItemType Directory -Force -Path "$dest\graduation", "$dest\2025" | Out-Null

$graduation = @{
    'tn_DU-Graduation.jpg' = 'graduation-main.jpg'
    'tn_DSC_7061.jpg' = 'graduation-ceremony-01.jpg'
    'tn_DSC_7112.jpg' = 'graduation-ceremony-02.jpg'
    'tn_DSC_7149.jpg' = 'graduation-ceremony-03.jpg'
    'tn_DSC_8579.jpg' = 'graduation-ceremony-04.jpg'
    'tn_DSC_0818.jpg' = 'graduation-ceremony-05.jpg'
    'tn_DSC_5886.jpg' = 'graduation-ceremony-06.jpg'
}

$du2025 = @{
    'Dhofar-University-2025-Gallery-1.jpg' = 'du2025-gallery-hero.jpg'
    '10.jpg' = 'du2025-campus-wide.jpg'
    '3A6A1261.jpg' = 'du2025-training-01.jpg'
    '3A6A8317.jpg' = 'du2025-campus-01.jpg'
    '467A0505.jpg' = 'du2025-training-02.jpg'
    '3A6A8620.jpg' = 'du2025-event-01.jpg'
    '8.jpg' = 'du2025-event-02.jpg'
    '3.jpg' = 'du2025-academic-01.jpg'
    '3A6A5595.jpg' = 'du2025-campus-02.jpg'
    '3A6A6264.jpg' = 'du2025-training-03.jpg'
    '3A6A1339.jpg' = 'du2025-gallery-02.jpg'
    '3A6A1344.jpg' = 'du2025-gallery-03.jpg'
    '3A6A1348.jpg' = 'du2025-gallery-04.jpg'
    '3A6A1353.jpg' = 'du2025-gallery-05.jpg'
    '3A6A1567.jpg' = 'du2025-gallery-06.jpg'
    '3A6A3314.jpg' = 'du2025-gallery-07.jpg'
    '3A6A3325.jpg' = 'du2025-gallery-08.jpg'
    '3A6A4837.jpg' = 'du2025-gallery-09.jpg'
    '3A6A5054.jpg' = 'du2025-gallery-10.jpg'
    '3A6A5074.jpg' = 'du2025-gallery-11.jpg'
    '3A6A5602.jpg' = 'du2025-gallery-12.jpg'
    '3A6A5604.jpg' = 'du2025-gallery-13.jpg'
    '3A6A5655.jpg' = 'du2025-gallery-14.jpg'
    '3A6A8025.jpg' = 'du2025-gallery-15.jpg'
    '3A6A8382.jpg' = 'du2025-gallery-16.jpg'
    '3A6A8504.jpg' = 'du2025-gallery-17.jpg'
    '3A6A8560.jpg' = 'du2025-gallery-18.jpg'
    '3A6A8626.jpg' = 'du2025-gallery-19.jpg'
    '3A6A8648.jpg' = 'du2025-gallery-20.jpg'
    '467A0510.jpg' = 'du2025-gallery-21.jpg'
}

foreach ($k in $graduation.Keys) {
    $url = "https://www.du.edu.om/wp-content/uploads/2020/11/$k"
    $out = Join-Path "$dest\graduation" $graduation[$k]
    Write-Host "Downloading $url"
    curl.exe -sL $url -o $out
}

foreach ($k in $du2025.Keys) {
    $url = "https://www.du.edu.om/wp-content/uploads/2025/02/$k"
    $out = Join-Path "$dest\2025" $du2025[$k]
    Write-Host "Downloading $url"
    curl.exe -sL $url -o $out
}

Write-Host "Done. Files in $dest"
Get-ChildItem $dest -Recurse -File | Format-Table Name, @{N='KB';E={[math]::Round($_.Length/1KB,1)}}