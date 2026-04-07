@echo off
title Levy Photography - Gallery Updater
echo ---------------------------------------
echo   LEVY PHOTOGRAPHY GALLERY UPDATER
echo ---------------------------------------
echo.

:: Ensure we are in the right directory
cd /d "%~dp0"

:: Check if node_modules exists, if not install
if not exist "node_modules\" (
    echo [1/2] Installing image tools (first time only)...
    powershell -ExecutionPolicy Bypass -Command "npm install"
) else (
    echo [1/2] Image tools already installed.
)

echo.
echo [2/2] Scanning images and updating galleries...
node update_galleries.js

echo.
echo ---------------------------------------
echo   UPDATE COMPLETE!
echo ---------------------------------------
echo.
echo You can now push your changes to GitHub.
echo.
pause
