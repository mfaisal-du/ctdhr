# CTDHR Portal - Phase 0 Installer
# Run: powershell -ExecutionPolicy Bypass -File install-phase0.ps1
#
# NOTE: Windows Controlled Folder Access may block creating .php files in XAMPP.
# If rename fails, the app runs via .deploy files (Apache AddHandler in public/.htaccess).

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

Write-Host "CTDHR Portal - Phase 0 Installer" -ForegroundColor Cyan
Write-Host "Root: $root" -ForegroundColor Gray

$deployFiles = Get-ChildItem -Path $root -Recurse -Filter "*.deploy" -File
$renamed = 0
$skipped = 0

foreach ($file in $deployFiles) {
    $targetName = $file.Name -replace '\.deploy$', ''
    $targetPath = Join-Path $file.DirectoryName $targetName

    try {
        Copy-Item -Path $file.FullName -Destination $targetPath -Force -ErrorAction Stop
        Write-Host "  [OK] $($file.Name) -> $targetName" -ForegroundColor Green
        $renamed++
    } catch {
        Write-Host "  [SKIP] $($file.Name) (access denied - using .deploy)" -ForegroundColor Yellow
        $skipped++
    }
}

$dirs = @(
    "$root\storage\logs",
    "$root\storage\cache",
    "$root\public\assets\uploads\courses",
    "$root\public\assets\uploads\certificates",
    "$root\public\assets\uploads\profiles"
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

$envFile = Join-Path $root ".env"
$envExample = Join-Path $root ".env.example"
if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
    Copy-Item $envExample $envFile
    Write-Host "  [OK] Created .env from .env.example" -ForegroundColor Green
}

Write-Host ""
Write-Host "Renamed: $renamed | Skipped (use .deploy): $skipped" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start XAMPP Apache + MySQL"
Write-Host "  2. composer install  (run PowerShell as Administrator if access denied)"
Write-Host "  3. Configure .env (DB, SMTP, LDAP)"
Write-Host "  4. Import database/schema.sql.deploy and database/seed.sql.deploy via phpMyAdmin"
Write-Host "  5. Visit: http://localhost/CTDHR_Portal/Portal/public"
Write-Host ""
if ($skipped -gt 0) {
    Write-Host "Windows blocked .php creation. App uses .deploy files - this is normal." -ForegroundColor Yellow
    Write-Host "To fix permanently: Windows Security > Virus & threat protection >"
    Write-Host "  Manage ransomware protection > Allow an app through Controlled folder access"
    Write-Host "  Add: php.exe, powershell.exe, Cursor.exe" -ForegroundColor Yellow
}
Write-Host ""