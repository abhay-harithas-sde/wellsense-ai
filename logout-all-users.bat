@echo off
echo.
echo ========================================
echo   Logout All Users - WellSense AI
echo ========================================
echo.
echo This will logout all users from the system.
echo.
pause

curl -X POST http://localhost:3000/api/admin/logout-all -H "Content-Type: application/json"

echo.
echo.
echo ========================================
echo   Operation Complete
echo ========================================
echo.
pause
