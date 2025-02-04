@echo off

:: 1. Run npm install in root, server-app, and mobile-app directories
echo Installing dependencies in root directory...
call npm install

echo Installing dependencies in server-app...
cd server-app
call npm install
cd ..

echo Installing dependencies in mobile-app...
cd mobile-app
call npm install
cd ..

:: 2. Run npm run prod
echo Starting production...
start /min npm run prod

echo Script completed.
exit /b 0
