@echo off
REM Firebase Setup Script for WellSense AI
REM This script helps you set up Firebase credentials

echo.
echo ========================================
echo   WellSense AI - Firebase Setup
echo ========================================
echo.

REM Check if Firebase file exists in Downloads
set "FIREBASE_SOURCE=C:\Users\abhay\Downloads\wellsense-ai-f06cf-firebase-adminsdk-fbsvc-bbf94cd5dc.json"
set "FIREBASE_DEST=firebase-service-account.json"

REM Go to project root if we're in firebase folder
if exist "..\package.json" cd ..

if exist "%FIREBASE_SOURCE%" (
    echo Found Firebase credentials in Downloads folder
    echo.
    echo Copying Firebase service account file...
    copy "%FIREBASE_SOURCE%" "firebase\%FIREBASE_DEST%" >nul 2>&1
    
    if exist "firebase\%FIREBASE_DEST%" (
        echo [32m✓ Firebase credentials copied successfully![0m
        echo.
        echo File location: %CD%\firebase\%FIREBASE_DEST%
        echo.
    ) else (
        echo [31m✗ Failed to copy Firebase credentials[0m
        echo Please copy manually:
        echo   From: %FIREBASE_SOURCE%
        echo   To:   %CD%\firebase\%FIREBASE_DEST%
        goto :error
    )
) else (
    echo [33m! Firebase file not found in Downloads folder[0m
    echo.
    echo Please copy your Firebase service account JSON file to:
    echo   %CD%\firebase\firebase-service-account.json
    echo.
    goto :manual
)

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env >nul 2>&1
    echo [32m✓ .env file created[0m
    echo.
)

REM Update .env with Firebase configuration
echo Updating .env with Firebase configuration...
echo.
echo FIREBASE_PROJECT_ID=wellsense-ai-f06cf>> .env
echo FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/firebase-service-account.json>> .env
echo.
echo [32m✓ .env updated with Firebase settings[0m
echo.

REM Check AAP .env
if not exist "AAP\.env" (
    echo Creating AAP/.env file from example...
    copy AAP\.env.example AAP\.env >nul 2>&1
    echo [32m✓ AAP/.env file created[0m
    echo.
)

echo ========================================
echo   Firebase Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Review your .env file
echo   2. Start the application: npm start
echo   3. Test Firebase features
echo.
echo For more information, see firebase/FIREBASE_SETUP.md
echo.
pause
exit /b 0

:manual
echo ========================================
echo   Manual Setup Required
echo ========================================
echo.
echo 1. Copy your Firebase JSON file to:
echo    %CD%\firebase\firebase-service-account.json
echo.
echo 2. Add to .env file:
echo    FIREBASE_PROJECT_ID=wellsense-ai-f06cf
echo    FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/firebase-service-account.json
echo.
echo 3. Start the application: npm start
echo.
echo For detailed instructions, see firebase/FIREBASE_SETUP.md
echo.
pause
exit /b 1

:error
echo.
echo ========================================
echo   Setup Failed
echo ========================================
echo.
echo Please follow manual setup instructions in firebase/FIREBASE_SETUP.md
echo.
pause
exit /b 1
