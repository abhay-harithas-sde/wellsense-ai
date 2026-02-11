@echo off
echo ========================================
echo Wellsense AI - Complete Test Suite
echo ========================================
echo.

echo [1/6] Running Unit Tests...
call npm run test:unit
if %errorlevel% neq 0 (
    echo FAILED: Unit tests failed
    exit /b 1
)
echo.

echo [2/6] Running Integration Tests...
call npm run test:integration
if %errorlevel% neq 0 (
    echo FAILED: Integration tests failed
    exit /b 1
)
echo.

echo [3/6] Running E2E Tests...
call npm run test:e2e
if %errorlevel% neq 0 (
    echo FAILED: E2E tests failed
    exit /b 1
)
echo.

echo [4/6] Running Security Tests...
call npm run test:security
if %errorlevel% neq 0 (
    echo FAILED: Security tests failed
    exit /b 1
)
echo.

echo [5/6] Running Performance Tests...
call npm run test:performance
if %errorlevel% neq 0 (
    echo FAILED: Performance tests failed
    exit /b 1
)
echo.

echo [6/6] Generating Coverage Report...
call npm test
echo.

echo ========================================
echo ✅ ALL TESTS PASSED!
echo ========================================
echo.
echo Coverage report available in: coverage/
echo.
pause
