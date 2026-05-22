@echo off
cd /d "%~dp0frontend"
echo Installing npm packages (first run only)...
npm install
echo.
echo Starting React frontend on http://localhost:3000
npm start
