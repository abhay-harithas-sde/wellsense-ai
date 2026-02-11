@echo off
:menu
cls
echo 🐳 WellSense AI Docker Database Management
echo ==========================================
echo.
echo Please select an option:
echo.
echo 1. Start all databases
echo 2. Stop all databases
echo 3. Restart all databases
echo 4. View container status
echo 5. View container logs
echo 6. Clean up (remove containers and volumes)
echo 7. Backup databases
echo 8. Restore databases
echo 9. Open database management tools
echo 0. Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto cleanup
if "%choice%"=="7" goto backup
if "%choice%"=="8" goto restore
if "%choice%"=="9" goto tools
if "%choice%"=="0" goto exit

echo Invalid choice. Please try again.
pause
goto menu

:start
echo 🚀 Starting all database containers...
docker-compose up -d
echo.
echo ✅ Containers started successfully!
echo ⏳ Waiting for databases to be ready...
timeout /t 10 /nobreak >nul
echo.
echo 🔍 Checking container health...
docker-compose ps
pause
goto menu

:stop
echo 🛑 Stopping all database containers...
docker-compose down
echo.
echo ✅ Containers stopped successfully!
pause
goto menu

:restart
echo 🔄 Restarting all database containers...
docker-compose restart
echo.
echo ✅ Containers restarted successfully!
echo ⏳ Waiting for databases to be ready...
timeout /t 10 /nobreak >nul
pause
goto menu

:status
echo 📊 Container Status:
echo ===================
docker-compose ps
echo.
echo 🔍 Detailed container information:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
pause
goto menu

:logs
echo.
echo Which container logs would you like to view?
echo 1. PostgreSQL
echo 2. MongoDB
echo 3. Redis
echo 4. pgAdmin
echo 5. Mongo Express
echo 6. All containers
echo.
set /p log_choice="Enter your choice (1-6): "

if "%log_choice%"=="1" docker logs -f wellsense-postgres
if "%log_choice%"=="2" docker logs -f wellsense-mongodb
if "%log_choice%"=="3" docker logs -f wellsense-redis
if "%log_choice%"=="4" docker logs -f wellsense-pgadmin
if "%log_choice%"=="5" docker logs -f wellsense-mongo-express
if "%log_choice%"=="6" docker-compose logs -f

pause
goto menu

:cleanup
echo ⚠️  WARNING: This will remove all containers and data!
echo This action cannot be undone.
echo.
set /p confirm="Are you sure? Type 'YES' to confirm: "

if not "%confirm%"=="YES" (
    echo Operation cancelled.
    pause
    goto menu
)

echo 🧹 Cleaning up containers and volumes...
docker-compose down -v
docker system prune -f
echo.
echo ✅ Cleanup completed!
pause
goto menu

:backup
echo 💾 Creating database backups...
echo.

:: Create backup directory
if not exist "backups" mkdir backups

:: Get current date for backup filename
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

:: Backup PostgreSQL
echo 📊 Backing up PostgreSQL database...
docker exec wellsense-postgres pg_dump -U postgres wellsense_ai > "backups\postgres_backup_%timestamp%.sql"
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL backup created: backups\postgres_backup_%timestamp%.sql
) else (
    echo ❌ PostgreSQL backup failed
)

:: Backup MongoDB
echo 📊 Backing up MongoDB database...
docker exec wellsense-mongodb mongodump --db wellsense_ai --out /tmp/backup
docker cp wellsense-mongodb:/tmp/backup "backups\mongodb_backup_%timestamp%"
if %errorlevel% equ 0 (
    echo ✅ MongoDB backup created: backups\mongodb_backup_%timestamp%
) else (
    echo ❌ MongoDB backup failed
)

echo.
echo 💾 Backup process completed!
pause
goto menu

:restore
echo 🔄 Database Restore
echo ==================
echo.
echo Available backups:
dir /b backups\*.sql 2>nul
dir /b backups\mongodb_backup_* 2>nul
echo.
echo Please specify the backup files to restore:
set /p pg_backup="PostgreSQL backup file (leave empty to skip): "
set /p mongo_backup="MongoDB backup directory (leave empty to skip): "

if not "%pg_backup%"=="" (
    echo 🔄 Restoring PostgreSQL database...
    docker exec -i wellsense-postgres psql -U postgres -d wellsense_ai < "backups\%pg_backup%"
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL restore completed
    ) else (
        echo ❌ PostgreSQL restore failed
    )
)

if not "%mongo_backup%"=="" (
    echo 🔄 Restoring MongoDB database...
    docker cp "backups\%mongo_backup%" wellsense-mongodb:/tmp/restore
    docker exec wellsense-mongodb mongorestore --db wellsense_ai /tmp/restore/wellsense_ai
    if %errorlevel% equ 0 (
        echo ✅ MongoDB restore completed
    ) else (
        echo ❌ MongoDB restore failed
    )
)

echo.
echo 🔄 Restore process completed!
pause
goto menu

:tools
echo 🔧 Opening database management tools...
echo.
echo 1. pgAdmin (PostgreSQL) - http://localhost:5050
echo 2. Mongo Express (MongoDB) - http://localhost:8081
echo 3. Prisma Studio
echo.
set /p tool_choice="Which tool would you like to open? (1-3): "

if "%tool_choice%"=="1" (
    echo 🌐 Opening pgAdmin...
    start http://localhost:5050
    echo Username: admin@wellsense.ai
    echo Password: Abhay#1709
)

if "%tool_choice%"=="2" (
    echo 🌐 Opening Mongo Express...
    start http://localhost:8081
    echo Username: admin
    echo Password: Abhay#1709
)

if "%tool_choice%"=="3" (
    echo 🌐 Opening Prisma Studio...
    cd server
    start npx prisma studio
    cd ..
)

pause
goto menu

:exit
echo 👋 Goodbye!
exit /b 0