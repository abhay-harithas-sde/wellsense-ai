@echo off
echo 🗄️ WellSense AI Database Schema Initialization
echo ==============================================

echo.
echo 🔍 Checking prerequisites...

:: Check if server directory exists
if not exist "server" (
    echo ❌ Server directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

:: Check if package.json exists in server
if not exist "server\package.json" (
    echo ❌ Server package.json not found
    echo Please ensure the server directory is properly set up
    pause
    exit /b 1
)

:: Check if containers are running
docker ps --filter "name=wellsense-postgres" --format "{{.Names}}" | findstr wellsense-postgres >nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL container is not running
    echo Please start containers first: docker-compose up -d
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

echo.
echo 📦 Installing server dependencies...
cd server

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 🔧 Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🔧 Setting up environment configuration...

:: Copy environment file if it doesn't exist
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ Environment file created from template
        echo ⚠️  Please update .env with your actual configuration values
    ) else (
        echo ⚠️  No .env.example found, creating basic .env file
        echo DATABASE_URL="postgresql://postgres:Abhay%231709@localhost:5432/wellsense_ai" > .env
        echo NODE_ENV=development >> .env
        echo PORT=5000 >> .env
        echo JWT_SECRET=your-super-secret-jwt-key-change-this >> .env
    )
) else (
    echo ✅ Environment file already exists
)

echo.
echo 🗄️ Initializing database schema...

:: Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated successfully

:: Push database schema
echo 📊 Creating database tables...
npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to create database schema
    echo 🔍 Checking database connection...
    npx prisma db pull
    pause
    exit /b 1
)
echo ✅ Database schema created successfully

echo.
echo 🌱 Seeding database with demo data...
npx prisma db seed
if %errorlevel% neq 0 (
    echo ⚠️  Seeding failed or no seed script found
    echo This is not critical - you can add data manually
) else (
    echo ✅ Demo data seeded successfully
)

echo.
echo 🧪 Testing database connection...
npx prisma db execute --stdin < nul
if %errorlevel% equ 0 (
    echo ✅ Database connection test passed
) else (
    echo ⚠️  Database connection test failed
)

echo.
echo 📊 Verifying schema creation...
npx prisma db pull --print
echo.

cd ..

echo.
echo 🎉 Database initialization completed!
echo.
echo 📋 What was created:
echo   • Prisma client generated
echo   • Database schema pushed to PostgreSQL
echo   • Demo data seeded (if available)
echo   • Environment configuration set up
echo.
echo 🚀 Next steps:
echo   1. Start your backend server: cd server && npm run dev
echo   2. Start your frontend: npm run dev
echo   3. Open Prisma Studio: cd server && npx prisma studio
echo   4. Access pgAdmin: http://localhost:5050
echo.
echo 🔧 Useful commands:
echo   • View database status: docker-db-status.bat
echo   • Manage containers: docker-management.bat
echo   • Health check: docker-health-check.bat
echo.

pause