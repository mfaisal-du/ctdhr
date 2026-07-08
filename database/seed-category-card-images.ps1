# Downloads relevant Unsplash images per category (WebP) and updates ctdhr_portal.
# Run: powershell -ExecutionPolicy Bypass -File database/seed-category-card-images.ps1

$ErrorActionPreference = 'Continue'

$root = Split-Path -Parent $PSScriptRoot
$uploadDir = Join-Path $root 'public\assets\uploads\categories'
$mysql = 'C:\xampp\mysql\bin\mysql.exe'

if (-not (Test-Path $uploadDir)) {
    New-Item -ItemType Directory -Path $uploadDir -Force | Out-Null
}

# slug => Unsplash photo (topic-matched, portrait 800x1000 WebP)
$sources = [ordered]@{
    'information-technology'   = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
    'languages'                = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
    'professional-development' = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
    'research-academic-skills' = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
    'leadership-management'    = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
    'health-safety'            = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
    'digital-literacy'         = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
    'communication-skills'     = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&h=1000&q=82&fm=webp'
}

function Download-CategoryImage {
    param(
        [string]$Url,
        [string]$Destination,
        [int]$MaxAttempts = 3
    )

    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add('User-Agent', 'CTDHR-Portal-Seed/1.0')

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $bytes = $wc.DownloadData($Url)
            if ($bytes.Length -lt 1024) {
                throw "Downloaded file is too small ($($bytes.Length) bytes)."
            }
            [System.IO.File]::WriteAllBytes($Destination, $bytes)
            return $bytes.Length
        } catch {
            if ($attempt -eq $MaxAttempts) {
                throw
            }
            Start-Sleep -Seconds (2 * $attempt)
        }
    }

    return 0
}

$rows = & $mysql -u root -P 3307 -N -B -e "SELECT id, slug FROM course_categories WHERE deleted_at IS NULL ORDER BY display_order;" ctdhr_portal
$seeded = 0
$failed = @()

foreach ($line in $rows) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $parts = $line -split "`t", 2
    if ($parts.Count -lt 2) { continue }

    $id = [int]$parts[0]
    $slug = $parts[1].Trim()

    if (-not $sources.Contains($slug)) {
        Write-Host "Skip (no source): $slug"
        continue
    }

    $filename = "category-$id-$slug.webp"
    $relativePath = "uploads/categories/$filename"
    $fullPath = Join-Path $uploadDir $filename

    try {
        $size = Download-CategoryImage -Url $sources[$slug] -Destination $fullPath
        $escaped = $relativePath.Replace("'", "''")
        & $mysql -u root -P 3307 ctdhr_portal -e "UPDATE course_categories SET card_image_path = '$escaped' WHERE id = $id;" | Out-Null
        Write-Host "Seeded: $slug -> $relativePath ($size bytes)"
        $seeded++
    } catch {
        Write-Host "FAILED: $slug - $($_.Exception.Message)"
        $failed += $slug
    }
}

Write-Host "Done. $seeded category image(s) downloaded from Unsplash."
if ($failed.Count -gt 0) {
    Write-Host "Failed slugs: $($failed -join ', ')"
    exit 1
}

& $mysql -u root -P 3307 ctdhr_portal -e "SELECT slug, card_image_path FROM course_categories WHERE deleted_at IS NULL ORDER BY display_order;"
exit 0