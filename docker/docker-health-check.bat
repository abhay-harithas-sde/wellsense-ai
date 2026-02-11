@echo off
echo 🏥 WellSense AI Docker Health Check
echo ===================================

echo.
echo 🔍 Checking Docker containers...

:: Check if containers are running
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=wellsense"

echo.
echo 🧪 Testing database connections...

:: Test PostgreSQL
echo 📊 Testing PostgreSQL connection...
docker exec wellsense-postgres pg_isready -U postgres -d wellsense_ai >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL: Connected and ready
    docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';" 2>nul | findstr /C:"table_count"
) else (
    echo ❌ PostgreSQL: Connection failed
)

:: Test MongoDB
echo 📊 Testing MongoDB connection...
docker exec wellsense-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB: Connected and ready
    docker exec wellsense-mongodb mongosh --eval "print('Collections: ' + db.getCollectionNames().length)" wellsense_ai 2>nul
) else (
    echo ❌ MongoDB: Connection failed
)

:: Test Redis
echo 📊 Testing Redis connection...
docker exec wellsense-redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis: Connected and ready
    docker exec wellsense-redis redis-cli info memory | findstr used_memory_human
) else (
    echo ❌ Redis: Connection failed
)

echo.
echo 🌐 Checking management interfaces...

:: Check if pgAdmin is accessible
curl -s -o nul -w "%%{http_code}" http://localhost:5050 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ pgAdmin: Accessible at http://localhost:5050
) else (
    echo ⚠️  pgAdmin: Not accessible (may still be starting)
)

:: Check if Mongo Express is accessible
curl -s -o nul -w "%%{http_code}" http://localhost:8081 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Mongo Express: Accessible at http://localhost:8081
) else (
    echo ⚠️  Mongo Express: Not accessible (may still be starting)
)

echo.
echo 💾 Checking data persistence...

:: Check Docker volumes
echo 📁 Docker volumes:
docker volume ls --filter "name=wellsense" --format "table {{.Name}}\t{{.Driver}}"

echo.
echo 🔧 System resources...

:: Show container resource usage
echo 📊 Container resource usage:
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" wellsense-postgres wellsense-mongodb wellsense-redis

echo.
echo 📋 Health check summary:
echo ========================

:: Count successful services
set /a success_count=0

docker exec wellsense-postgres pg_isready -U postgres -d wellsense_ai >nul 2>&1
if %errorlevel% equ 0 set /a success_count+=1

docker exec wellsense-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% equ 0 set /a success_count+=1

docker exec wellsense-redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 set /a success_count+=1

echo 🎯 %success_count%/3 core services are healthy

if %success_count% equ 3 (
    echo ✅ All systems operational!
    echo 🚀 Ready for development
) else (
    echo ⚠️  Some services need attention
    echo 🔧 Run docker-management.bat for troubleshooting
)

echo.
echo 📚 Quick reference:
echo   • Start containers: docker-compose up -d
echo   • Stop containers: docker-compose down
echo   • View logs: docker logs [container-name]
echo   • Management menu: docker-management.bat
echo.

pause