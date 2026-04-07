@echo off
cd /d "%~dp0"
title Levy Photography - Gallery Updater
echo ---------------------------------------
echo   LEVY PHOTOGRAPHY GALLERY UPDATER
echo ---------------------------------------
echo.

:: 1. Verify node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    pause
    exit
)

:: 2. Run the update script
echo [1/2] Updating galleries and thumbnails...
call npm run update

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Update failed. Check the error above.
    pause
    exit
)

echo.
echo [2/2] SUCCESS: Local update complete!
echo.

:: 3. Ask to push to GitHub
set /p "choice=Push changes to GitHub live site? (y/n): "

if /i "%choice%"=="y" (
    echo.
    echo [GIT] Adding changes...
    git add .
    
    echo [GIT] Committing...
    git commit -m "Update gallery and thumbnails"
    
    echo [GIT] Pushing to GitHub...
    git push origin main
    
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Push failed. Check your internet or GitHub connection.
        pause
    ) else (
        echo.
        echo ---------------------------------------
        echo   WEBSITE IS NOW LIVE!
        echo ---------------------------------------
        pause
    )
) else (
    echo.
    echo Skipping push. Changes are saved locally only.
    pause
)
