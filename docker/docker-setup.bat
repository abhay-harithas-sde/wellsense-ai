@echo off
echo 🐳 WellSense AI Docker Database Setup
echo =====================================

echo.
echo 📋 Checking prerequisites...

:: Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker is installed

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo ✅ Docker is running

echo.
echo 🚀 Starting database containers...

:: Create directories if they don't exist
if not exist "postgres\init" mkdir postgres\init
if not exist "mongodb\init" mkdir mongodb\init

:: Start the containers
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for databases to be ready...
timeout /t 10 /nobreak >nul

:: Wait for PostgreSQL to be ready
echo 🔍 Checking PostgreSQL connection...
:check_postgres
docker exec wellsense-postgres pg_isready -U postgres -d wellsense_ai >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ PostgreSQL not ready yet, waiting...
    timeout /t 5 /nobreak >nul
    goto check_postgres
)
echo ✅ PostgreSQL is ready

:: Wait for MongoDB to be ready
echo 🔍 Checking MongoDB connection...
:check_mongodb
docker exec wellsense-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ MongoDB not ready yet, waiting...
    timeout /t 5 /nobreak >nul
    goto check_mongodb
)
echo ✅ MongoDB is ready

echo.
echo 📝 Setting up environment configuration...

:: Copy environment file
if not exist "..\server\.env" (
    copy ".env.docker" "..\server\.env"
    echo ✅ Environment file created at server\.env
) else (
    echo ℹ️  Environment file already exists at server\.env
)

echo.
echo 🗄️ Setting up database schema...

:: Navigate to server directory and run Prisma commands
cd ..\server

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing server dependencies...
    npm install
)

:: Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

:: Push database schema
echo 📊 Creating database schema...
npx prisma db push

:: Seed database with demo data
echo 🌱 Seeding database with demo data...
npx prisma db seed

cd ..

echo.
echo 🧪 Testing database connections...

:: Test PostgreSQL connection
echo 🔍 Testing PostgreSQL connection...
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT 'PostgreSQL connection successful!' as status;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL connection test passed
) else (
    echo ⚠️  PostgreSQL connection test failed
)

:: Test MongoDB connection
echo 🔍 Testing MongoDB connection...
docker exec wellsense-mongodb mongosh --eval "db.adminCommand('ping'); print('MongoDB connection successful!');" wellsense_ai 2>nul
if %errorlevel% equ 0 (
    echo ✅ MongoDB connection test passed
) else (
    echo ⚠️  MongoDB connection test failed
)

:: Test Redis connection
echo 🔍 Testing Redis connection...
docker exec wellsense-redis redis-cli ping 2>nul
if %errorlevel% equ 0 (
    echo ✅ Redis connection test passed
) else (
    echo ⚠️  Redis connection test failed
)

echo.
echo 🎉 Docker database setup completed!
echo.
echo 📊 Database Management URLs:
echo   • pgAdmin (PostgreSQL): http://localhost:5050
echo     Username: admin@wellsense.ai
echo     Password: Abhay#1709
echo.
echo   • Mongo Express (MongoDB): http://localhost:8081
echo     Username: admin
echo     Password: Abhay#1709
echo.
echo 🔧 Database Connection Details:
echo   • PostgreSQL: localhost:5432
echo     Database: wellsense_ai
echo     Username: postgres
echo     Password: Abhay#1709
echo.
echo   • MongoDB: localhost:27017
echo     Database: wellsense_ai
echo     Username: admin
echo     Password: Abhay#1709
echo.
echo   • Redis: localhost:6379
echo.
echo 🚀 Next Steps:
echo   1. Start your backend server: cd server && npm run dev
echo   2. Start your frontend: npm run dev
echo   3. Open Prisma Studio: cd server && npx prisma studio
echo.
echo 📋 Useful Docker Commands:
echo   • View running containers: docker ps
echo   • Stop all containers: docker-compose down
echo   • View container logs: docker logs [container-name]
echo   • Restart containers: docker-compose restart
echo.

pause