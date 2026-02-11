@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  GOD (Ghar O Dev) Server Startup Script
REM  Unified WellSense AI Platform - Port 3000
REM ═══════════════════════════════════════════════════════════════════════════

echo.
echo ═══════════════════════════════════════════════════════════════════════════
echo   GOD (Ghar O Dev) - Unified WellSense AI Platform
echo ═══════════════════════════════════════════════════════════════════════════
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

REM Check if AAP node_modules exists
if not exist "AAP\node_modules\" (
    echo [INFO] Installing AAP dependencies...
    cd AAP
    call npm install
    cd ..
    echo.
)

REM Start GOD Server
echo [INFO] Starting GOD Server on Port 3000...
echo.
node god-server.js

pause
