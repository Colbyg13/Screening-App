@echo off
setlocal enabledelayedexpansion

:: Check for git and npm installation
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Warning: Git is not installed. Please install Git and try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Warning: npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

:: call npx expo whoami -> save to variable If VARIABLE = "Not logged in", run npx expo login
for /f "tokens=*" %%a in ('npx expo whoami 2^>^&1') do set "output=%%a"
if "%output%"=="Not logged in" (
    echo Please login to Expo
    call npx expo login
) else (
    echo User is logged in to expo
)

:: Pull latest code
echo Attempting to pull latest code...
git remote set-url origin https://github.com/Colbyg13/Screening-App
git pull origin main
if %errorlevel% neq 0 (
    echo Warning: Failed to pull latest code. Continuing with existing code.
)

:: Install dependencies
call :install_deps "" "root directory"
call :install_deps "server-app" "server-app"
call :install_deps "mobile-app" "mobile-app"

:start_prod
:: 2.0 Run npm run prod
echo Starting production...
start /min cmd /c "npm run prod"

echo Script completed.
exit /b 0

:: Function to install dependencies
:install_deps
set "dir=%~1"
set "name=%~2"
echo Attempting to install dependencies in %name%...
if not "%dir%"=="" cd "%dir%"
call npm install
if %errorlevel% neq 0 (
    echo Warning: Failed to install dependencies in %name%. Continuing with existing dependencies.
)
if not "%dir%"=="" cd ..
exit /b 0
