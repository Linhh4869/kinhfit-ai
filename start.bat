@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Can cai Node.js: https://nodejs.org
  pause
  exit /b 1
)
start "" http://localhost:8080
node server.js 8080
