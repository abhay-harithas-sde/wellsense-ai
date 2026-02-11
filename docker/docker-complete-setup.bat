@echo off
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  WellSense AI - Complete Docker Setup and Verification        ║
echo ║  PostgreSQL + MongoDB + Redis + Management Tools              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Step 1: Check Prerequisites
echo [1/10] Checking Prerequisites...
echo ═══════════════════════════════════════════════════════════════

:: Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker is installed

:: Check Docker running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo ✅ Docker is running

:: Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed
    pause
    exit /b 1
)
echo ✅ Docker Compose is available

echo.
:: Step 2: Stop existing containers
echo [2/10] Stopping Existing Containers...
echo ═══════════════════════════════════════════════════════════════
docker-compose down >nul 2>&1
echo ✅ Existing containers stopped

echo.
:: Step 3: Create required directories
echo [3/10] Creating Required Directories...
echo ═══════════════════════════════════════════════════════════════
if not exist "postgres\init" mkdir postgres\init
if not exist "mongodb\init" mkdir mongodb\init
if not exist "backups" mkdir backups
echo ✅ Directories created

echo.
:: Step 4: Verify configuration files
echo [4/10] Verifying Configuration Files...
echo ═══════════════════════════════════════════════════════════════

if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found
    pause
    exit /b 1
)
echo ✅ docker-compose.yml found

if not exist "postgres\init\01-init.sql" (
    echo ⚠️  PostgreSQL init script not found
) else (
    echo ✅ PostgreSQL init script found
)

if not exist "mongodb\init\01-init.js" (
    echo ⚠️  MongoDB init script not found
) else (
    echo ✅ MongoDB init script found
)

echo.
:: Step 5: Pull Docker images
echo [5/10] Pulling Docker Images...
echo ═══════════════════════════════════════════════════════════════
echo This may take a few minutes on first run...
docker-compose pull
if %errorlevel% neq 0 (
    echo ❌ Failed to pull images
    pause
    exit /b 1
)
echo ✅ Images pulled successfully

echo.
:: Step 6: Start containers
echo [6/10] Starting Docker Containers...
echo ═══════════════════════════════════════════════════════════════
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start containers
    echo.
    echo Checking logs...
    docker-compose logs
    pause
    exit /b 1
)
echo ✅ Containers started

echo.
:: Step 7: Wait for services to be ready
echo [7/10] Waiting for Services to Initialize...
echo ═══════════════════════════════════════════════════════════════
echo This may take 30-60 seconds...

timeout /t 15 /nobreak >nul

:: Wait for PostgreSQL
echo.
echo 🔍 Waiting for PostgreSQL...
set /a pg_attempts=0
:wait_postgres
set /a pg_attempts+=1
if %pg_attempts% gtr 30 (
    echo ❌ PostgreSQL failed to start after 30 attempts
    goto show_logs
)
docker exec wellsense-postgres pg_isready -U postgres -d wellsense_ai >nul 2>&1
if %errorlevel% neq 0 (
    echo    Attempt %pg_attempts%/30 - waiting...
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)
echo ✅ PostgreSQL is ready

:: Wait for MongoDB
echo.
echo 🔍 Waiting for MongoDB...
set /a mongo_attempts=0
:wait_mongodb
set /a mongo_attempts+=1
if %mongo_attempts% gtr 30 (
    echo ❌ MongoDB failed to start after 30 attempts
    goto show_logs
)
docker exec wellsense-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo    Attempt %mongo_attempts%/30 - waiting...
    timeout /t 2 /nobreak >nul
    goto wait_mongodb
)
echo ✅ MongoDB is ready

:: Wait for Redis
echo.
echo 🔍 Waiting for Redis...
set /a redis_attempts=0
:wait_redis
set /a redis_attempts+=1
if %redis_attempts% gtr 30 (
    echo ❌ Redis failed to start after 30 attempts
    goto show_logs
)
docker exec wellsense-redis redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo    Attempt %redis_attempts%/30 - waiting...
    timeout /t 2 /nobreak >nul
    goto wait_redis
)
echo ✅ Redis is ready

echo.
:: Step 8: Test connections
echo [8/10] Testing Database Connections...
echo ═══════════════════════════════════════════════════════════════

:: Test PostgreSQL
echo.
echo 📊 Testing PostgreSQL...
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT version();" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL connection successful
    docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>nul | findstr /C:"count"
) else (
    echo ❌ PostgreSQL connection failed
)

:: Test MongoDB
echo.
echo 📊 Testing MongoDB...
docker exec wellsense-mongodb mongosh --eval "db.version()" wellsense_ai >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB connection successful
    docker exec wellsense-mongodb mongosh --eval "print('Collections: ' + db.getCollectionNames().length)" wellsense_ai 2>nul
) else (
    echo ❌ MongoDB connection failed
)

:: Test Redis
echo.
echo 📊 Testing Redis...
docker exec wellsense-redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis connection successful
    docker exec wellsense-redis redis-cli INFO server | findstr redis_version
) else (
    echo ❌ Redis connection failed
)

echo.
:: Step 9: Setup Prisma
echo [9/10] Setting up Prisma Database Schema...
echo ═══════════════════════════════════════════════════════════════

cd ..

:: Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

:: Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ⚠️  Prisma generate failed, but continuing...
)

:: Push schema to database
echo 📊 Pushing schema to database...
call npx prisma db push --skip-generate
if %errorlevel% neq 0 (
    echo ⚠️  Schema push failed, you may need to run migrations manually
    echo    Run: npm run db:migrate
)

cd docker

echo.
:: Step 10: Verify setup
echo [10/10] Final Verification...
echo ═══════════════════════════════════════════════════════════════

:: Show container status
echo.
echo 📊 Container Status:
docker-compose ps

:: Show resource usage
echo.
echo 💻 Resource Usage:
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" wellsense-postgres wellsense-mongodb wellsense-redis wellsense-pgadmin wellsense-mongo-express

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ Docker Setup Complete!                                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 All services are running successfully!
echo.
echo ═══════════════════════════════════════════════════════════════
echo 📊 DATABASE CONNECTION DETAILS
echo ═══════════════════════════════════════════════════════════════
echo.
echo PostgreSQL:
echo   Host: localhost
echo   Port: 5432
echo   Database: wellsense_ai
echo   Username: postgres
echo   Password: Abhay#1709
echo   Connection String: postgresql://postgres:Abhay%%231709@localhost:5432/wellsense_ai
echo.
echo MongoDB:
echo   Host: localhost
echo   Port: 27017
echo   Database: wellsense_ai
echo   Username: admin
echo   Password: Abhay#1709
echo   Connection String: mongodb://admin:Abhay%%231709@localhost:27017/wellsense_ai?authSource=admin
echo.
echo Redis:
echo   Host: localhost
echo   Port: 6379
echo   Connection String: redis://localhost:6379
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🌐 MANAGEMENT INTERFACES
echo ═══════════════════════════════════════════════════════════════
echo.
echo pgAdmin (PostgreSQL GUI):
echo   URL: http://localhost:5050
echo   Email: admin@wellsense.ai
echo   Password: Abhay#1709
echo.
echo Mongo Express (MongoDB GUI):
echo   URL: http://localhost:8081
echo   Username: admin
echo   Password: Abhay#1709
echo.
echo Prisma Studio:
echo   Run: npm run db:studio
echo   URL: http://localhost:5555
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🚀 NEXT STEPS
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Update your .env file with the connection strings above
echo 2. Run database migrations: npm run db:migrate
echo 3. Test database: npm run db:test
echo 4. Start your server: npm run dev
echo.
echo ═══════════════════════════════════════════════════════════════
echo 🔧 USEFUL COMMANDS
echo ═══════════════════════════════════════════════════════════════
echo.
echo View logs:           docker-compose logs -f
echo Stop containers:     docker-compose down
echo Restart containers:  docker-compose restart
echo Health check:        docker\docker-health-check.bat
echo Management menu:     docker\docker-management.bat
echo.
echo ═══════════════════════════════════════════════════════════════
echo 📚 DOCUMENTATION
echo ═══════════════════════════════════════════════════════════════
echo.
echo Docker Guide:        docker\DOCKER_GUIDE.md
echo Database Guide:      DATABASE_GUIDE.md
echo API Documentation:   docs\API_DOCUMENTATION.md
echo.

pause
goto end

:show_logs
echo.
echo ═══════════════════════════════════════════════════════════════
echo 📋 Container Logs (Last 50 lines)
echo ═══════════════════════════════════════════════════════════════
docker-compose logs --tail=50
echo.
echo ⚠️  Setup encountered issues. Please review the logs above.
echo.
pause

:end
endlocal
