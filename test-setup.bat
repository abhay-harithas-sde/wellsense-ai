@echo off
echo 🧪 Testing WellSense AI Setup...
echo.

REM Test Node.js
echo 📦 Testing Node.js...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js test failed
    goto :error
)
echo ✅ Node.js OK
echo.

REM Test MongoDB connection
echo 🗄️ Testing MongoDB connection...
cd server
node -e "require('./utils/database').databaseManager.connect().then(() => { console.log('✅ MongoDB connection OK'); process.exit(0); }).catch((err) => { console.log('❌ MongoDB connection failed:', err.message); process.exit(1); })"
if %errorlevel% neq 0 (
    echo ❌ MongoDB connection failed
    echo 💡 Make sure MongoDB is running:
    echo    - Windows Service: net start MongoDB
    echo    - Manual: mongod --dbpath "C:\data\db"
    echo    - Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest
    goto :error
)
echo.

REM Test server startup (quick test)
echo 🚀 Testing server startup...
timeout /t 2 /nobreak >nul
start /b node server.js
timeout /t 5 /nobreak >nul

REM Test health endpoint
echo 🏥 Testing health endpoint...
curl -s http://localhost:5000/api/health-check >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server health check failed
    echo 💡 Server might not be running on port 5000
    goto :cleanup
)
echo ✅ Server health check OK
echo.

REM Test database endpoint
echo 🗄️ Testing database endpoint...
curl -s http://localhost:5000/api/database/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Database endpoint test failed
    goto :cleanup
)
echo ✅ Database endpoint OK
echo.

echo 🎉 All tests passed! Your setup is working correctly.
echo.
echo 📋 You can now:
echo 1. Run: start-server.bat (to start the backend)
echo 2. Run: npm run dev (to start the frontend)
echo 3. Open: http://localhost:3000
echo.
goto :cleanup

:error
echo.
echo ❌ Setup test failed. Please check the issues above.
echo 📖 See SETUP_WINDOWS.md for detailed troubleshooting.
echo.

:cleanup
REM Kill any test server processes
taskkill /f /im node.exe >nul 2>&1
cd ..
pause