@echo off
setlocal enabledelayedexpansion

:: 0.0 Check and create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    (
        echo GIT_USERNAME=
        echo GIT_EMAIL=
    ) > .env
)

:: 0.1 Load environment variables from .env file
for /f "tokens=1,* delims==" %%a in (.env) do set "%%a=%%b"

:: 0.2 Check for Git installation
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Warning: Git is not installed. Skipping Git operations.
    goto :check_npm
)

:: 0.3 Configure Git
echo Configuring Git...
:: only set the username and email if they exist in the .env file
if not "%GIT_USERNAME%"=="" git config --global user.name "%GIT_USERNAME%"
if not "%GIT_EMAIL%"=="" git config --global user.email "%GIT_EMAIL%"

:: 0.4 Pull latest code
echo Attempting to pull latest code...
git remote set-url origin https://github.com/Colbyg13/Screening-App
git pull origin main
if %errorlevel% neq 0 (
    echo Warning: Failed to pull latest code. Continuing with existing code.
)

:check_npm
:: 0.5 Check for npm installation
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Warning: npm is not installed. Skipping dependency installation.
    goto :start_prod
)

:: 1.0 Install dependencies
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
