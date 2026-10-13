@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   Ayurveda Platform - 1-Click Auto Deploy to Cloud
echo ========================================================

set "MSG=%~1"
if "%MSG%"=="" set "MSG=Auto-deploy update: %date% %time%"

echo.
echo [1/2] Deploying Backend Server to GitHub (Render auto-deploy)...
cd /d "%~dp0server"
git add .
git diff-index --quiet HEAD || (
    git commit -m "%MSG%"
    git push origin main
    echo [✓] Server pushed! Render is automatically building and updating now.
)

echo.
echo [2/2] Deploying Frontend Website to GitHub (Netlify auto-deploy)...
cd /d "%~dp0ayurvedic-app-website"
git add .
git diff-index --quiet HEAD || (
    git commit -m "%MSG%"
    git push origin main
    echo [✓] Website pushed! Netlify is automatically building and updating now.
)

echo.
echo ========================================================
echo   All changes deployed! Render and Netlify are updating!
echo ========================================================
