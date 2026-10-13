param (
    [string]$Message = "Auto-deploy update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Ayurveda Platform - 1-Click Auto Deploy to Cloud" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Server Deploy
Write-Host "`n[1/2] Deploying Server to GitHub -> Render..." -ForegroundColor Yellow
Set-Location "$root\server"
git add .
$statusServer = git status --porcelain
if ($statusServer) {
    git commit -m "$Message"
    git push origin main
    Write-Host "[✓] Server pushed! Render is auto-deploying live now." -ForegroundColor Green
} else {
    Write-Host "[✓] Server is already up to date." -ForegroundColor Gray
}

# 2. Website Deploy
Write-Host "`n[2/2] Deploying Website to GitHub -> Netlify..." -ForegroundColor Yellow
Set-Location "$root\ayurvedic-app-website"
git add .
$statusWeb = git status --porcelain
if ($statusWeb) {
    git commit -m "$Message"
    git push origin main
    Write-Host "[✓] Website pushed! Netlify is auto-deploying live now." -ForegroundColor Green
} else {
    Write-Host "[✓] Website is already up to date." -ForegroundColor Gray
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  All changes pushed! Render & Netlify are updating!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
