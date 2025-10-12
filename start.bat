@echo off
echo 🚀 Starting WellSense AI Application...
echo.

echo 📦 Installing dependencies...
call npm install

echo.
echo 🌟 Starting WellSense AI in demo mode...
echo 📱 Frontend will be available at: http://localhost:3000
echo 💡 The app will work in demo mode without a backend!
echo.

call npm run dev

pause