# WellSense AI Database Status Check (PowerShell)
Write-Host "🔍 WellSense AI Database Status Check" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n📊 Container Status:" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=wellsense"

Write-Host "`n🐘 PostgreSQL Configuration:" -ForegroundColor Green
Write-Host "----------------------------" -ForegroundColor Green
Write-Host "📍 Server Configuration:"
docker exec wellsense-postgres psql -U postgres -c "SHOW listen_addresses; SHOW port; SHOW max_connections;"

Write-Host "`n📍 Database Information:"
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT current_database(), current_user, version();"

Write-Host "`n📍 Schema Status:"
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

Write-Host "`n📍 Database Size:"
docker exec wellsense-postgres psql -U postgres -d wellsense_ai -c "SELECT pg_size_pretty(pg_database_size('wellsense_ai')) as database_size;"

Write-Host "`n🍃 MongoDB Status:" -ForegroundColor Green
Write-Host "-----------------" -ForegroundColor Green

# Check if MongoDB container exists
$mongoContainer = docker ps --filter "name=wellsense-mongodb" --format "{{.Names}}"
if ($mongoContainer) {
    Write-Host "📍 Server Information:"
    docker exec wellsense-mongodb mongosh --eval "print('MongoDB version: ' + db.version())" --quiet
    
    Write-Host "`n📍 Database Information:"
    docker exec wellsense-mongodb mongosh --eval "print('Database: ' + db.getName()); print('Collections: ' + db.getCollectionNames().length)" wellsense_ai --quiet
    
    Write-Host "`n📍 Collections:"
    docker exec wellsense-mongodb mongosh --eval "db.getCollectionNames()" wellsense_ai --quiet
} else {
    Write-Host "⚠️  MongoDB container not running" -ForegroundColor Yellow
}

Write-Host "`n🔴 Redis Status:" -ForegroundColor Red
Write-Host "---------------" -ForegroundColor Red

# Check if Redis container exists
$redisContainer = docker ps --filter "name=wellsense-redis" --format "{{.Names}}"
if ($redisContainer) {
    Write-Host "📍 Server Information:"
    docker exec wellsense-redis redis-cli info server | Select-String "redis_version"
    
    Write-Host "`n📍 Memory Usage:"
    docker exec wellsense-redis redis-cli info memory | Select-String "used_memory_human"
    
    Write-Host "`n📍 Connected Clients:"
    docker exec wellsense-redis redis-cli info clients | Select-String "connected_clients"
} else {
    Write-Host "⚠️  Redis container not running" -ForegroundColor Yellow
}

Write-Host "`n🔧 Connection Tests:" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan

# Test PostgreSQL connection
Write-Host "📊 Testing PostgreSQL connection..."
$pgTest = docker exec wellsense-postgres pg_isready -U postgres -d wellsense_ai 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL: Ready for connections" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL: Connection failed" -ForegroundColor Red
}

# Test MongoDB connection
if ($mongoContainer) {
    Write-Host "📊 Testing MongoDB connection..."
    $mongoTest = docker exec wellsense-mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB: Ready for connections" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB: Connection failed" -ForegroundColor Red
    }
}

# Test Redis connection
if ($redisContainer) {
    Write-Host "📊 Testing Redis connection..."
    $redisTest = docker exec wellsense-redis redis-cli ping 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Redis: Ready for connections" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis: Connection failed" -ForegroundColor Red
    }
}

Write-Host "`n🌐 Management Interface Status:" -ForegroundColor Magenta
Write-Host "------------------------------" -ForegroundColor Magenta

# Check pgAdmin
try {
    $pgAdminResponse = Invoke-WebRequest -Uri "http://localhost:5050" -TimeoutSec 5 -UseBasicParsing 2>$null
    if ($pgAdminResponse.StatusCode -eq 200) {
        Write-Host "✅ pgAdmin: Available at http://localhost:5050" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  pgAdmin: Not accessible (may still be starting)" -ForegroundColor Yellow
}

# Check Mongo Express
try {
    $mongoExpressResponse = Invoke-WebRequest -Uri "http://localhost:8081" -TimeoutSec 5 -UseBasicParsing 2>$null
    if ($mongoExpressResponse.StatusCode -eq 200) {
        Write-Host "✅ Mongo Express: Available at http://localhost:8081" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Mongo Express: Not accessible (may still be starting)" -ForegroundColor Yellow
}

Write-Host "`n💾 Volume Information:" -ForegroundColor Blue
Write-Host "---------------------" -ForegroundColor Blue
docker volume ls --filter "name=wellsense" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

Write-Host "`n📈 Resource Usage:" -ForegroundColor Cyan
Write-Host "-----------------" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" wellsense-postgres wellsense-mongodb wellsense-redis 2>$null

Write-Host "`n🔧 Quick Actions:" -ForegroundColor Yellow
Write-Host "----------------" -ForegroundColor Yellow
Write-Host "• Initialize Prisma schema: cd server; npx prisma db push"
Write-Host "• Seed demo data: cd server; npx prisma db seed"
Write-Host "• Open Prisma Studio: cd server; npx prisma studio"
Write-Host "• View container logs: docker logs [container-name]"
Write-Host "• Restart containers: docker-compose restart"
Write-Host "• Stop containers: docker-compose down"

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")