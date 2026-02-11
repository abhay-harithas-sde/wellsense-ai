@echo off
echo 🔍 WellSense AI Database Status Check
echo ====================================

echo.
echo 📊 Container Status:
echo -------------------
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=wellsense"

echo.
echo 🐘 PostgreSQL Configuration:
echo ----------------------------
echo 📍 Server Configuration:
docker exec wellsense-postgres psql -U postgres -c "SHOW listen_addresses; SHOW port; SHOW max_connections;"

echo.
echo 📍 Authentication Configuration:
echo Current pg_hba.conf rules:
docker exec wellsense-postgres grep -v "^#" /var/lib/postgresql/data/pg_hba.conf | grep -v "^$"

echo.
echo 📍 Database Information:
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT current_database(), current_user, version();"

echo.
echo 📍 Schema Status:
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

echo.
echo 📍 Database Size:
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT pg_size_pretty(pg_database_size('wellsense_ai')) as database_size;"

echo.
echo 🍃 MongoDB Status:
echo -----------------
echo 📍 Server Information:
docker exec wellsense-mongodb mongosh --eval "db.adminCommand('buildInfo').version" --quiet

echo.
echo 📍 Database Information:
docker exec wellsense-mongodb mongosh --eval "db.getName(); db.stats().collections" wellsense_ai --quiet

echo.
echo 📍 Collections:
docker exec wellsense-mongodb mongosh --eval "db.getCollectionNames()" wellsense_ai --quiet

echo.
echo 🔴 Redis Status:
echo ---------------
echo 📍 Server Information:
docker exec wellsense-redis redis-cli info server | findstr redis_version

echo.
echo 📍 Memory Usage:
docker exec wellsense-redis redis-cli info memory | findstr used_memory_human

echo.
echo 📍 Connected Clients:
docker exec wellsense-redis redis-cli info clients | findstr connected_clients

echo.
echo 🔧 Connection Tests:
echo -------------------

:: Test PostgreSQL connection
echo 📊 Testing PostgreSQL connection...
docker exec wellsense-postgres pg_isready -U postgres -d wellsense_ai
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL: Ready for connections
) else (
    echo ❌ PostgreSQL: Connection failed
)

:: Test MongoDB connection
echo 📊 Testing MongoDB connection...
docker exec wellsense-mongodb mongosh --eval "db.adminCommand('ping')" --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB: Ready for connections
) else (
    echo ❌ MongoDB: Connection failed
)

:: Test Redis connection
echo 📊 Testing Redis connection...
docker exec wellsense-redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis: Ready for connections
) else (
    echo ❌ Redis: Connection failed
)

echo.
echo 🌐 Management Interface Status:
echo ------------------------------

:: Check pgAdmin
curl -s -o nul -w "%%{http_code}" http://localhost:5050 2>nul | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ pgAdmin: Available at http://localhost:5050
) else (
    echo ⚠️  pgAdmin: Not accessible (may still be starting)
)

:: Check Mongo Express
curl -s -o nul -w "%%{http_code}" http://localhost:8081 2>nul | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ Mongo Express: Available at http://localhost:8081
) else (
    echo ⚠️  Mongo Express: Not accessible (may still be starting)
)

echo.
echo 💾 Volume Information:
echo ---------------------
docker volume ls --filter "name=wellsense" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

echo.
echo 📈 Resource Usage:
echo -----------------
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" wellsense-postgres wellsense-mongodb wellsense-redis

echo.
echo 🔧 Quick Actions:
echo ----------------
echo • Initialize Prisma schema: cd server && npx prisma db push
echo • Seed demo data: cd server && npx prisma db seed
echo • Open Prisma Studio: cd server && npx prisma studio
echo • View container logs: docker logs [container-name]
echo • Restart containers: docker-compose restart
echo • Stop containers: docker-compose down
echo.

pause