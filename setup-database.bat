@echo off
echo WellSense AI - Database Setup
echo =============================
echo.

echo This script will help you set up database connections for WellSense AI
echo.

echo Available database options:
echo 1. MongoDB (Recommended - NoSQL, flexible schema)
echo 2. MySQL (Popular SQL database)
echo 3. PostgreSQL (Advanced SQL database)
echo 4. SQLite (Lightweight, file-based)
echo 5. Multiple databases (for redundancy)
echo.

set /p choice="Choose your database setup (1-5): "

if "%choice%"=="1" goto :mongodb
if "%choice%"=="2" goto :mysql
if "%choice%"=="3" goto :postgresql
if "%choice%"=="4" goto :sqlite
if "%choice%"=="5" goto :multiple
goto :invalid

:mongodb
echo.
echo Setting up MongoDB...
echo.
echo MongoDB is the recommended database for WellSense AI
echo It provides flexible schema and excellent performance for health data
echo.
echo To install MongoDB:
echo 1. Download from: https://www.mongodb.com/try/download/community
echo 2. Install and start MongoDB service
echo 3. Database will be created automatically
echo.
echo Default connection: mongodb://localhost:27017/wellsense-ai
echo.
goto :env_setup

:mysql
echo.
echo Setting up MySQL...
echo.
echo MySQL is a popular SQL database with excellent performance
echo.
echo To install MySQL:
echo 1. Download from: https://dev.mysql.com/downloads/mysql/
echo 2. Install and configure MySQL server
echo 3. Create database: CREATE DATABASE wellsense_ai;
echo.
echo Default connection: localhost:3306
echo.
goto :env_setup

:postgresql
echo.
echo Setting up PostgreSQL...
echo.
echo PostgreSQL is an advanced SQL database with JSON support
echo.
echo To install PostgreSQL:
echo 1. Download from: https://www.postgresql.org/download/
echo 2. Install and configure PostgreSQL server
echo 3. Create database: CREATE DATABASE wellsense_ai;
echo.
echo Default connection: localhost:5432
echo.
goto :env_setup

:sqlite
echo.
echo Setting up SQLite...
echo.
echo SQLite is a lightweight, file-based database
echo Perfect for development and small deployments
echo.
echo No installation required - database file will be created automatically
echo Location: ./data/wellsense-ai.db
echo.
goto :env_setup

:multiple
echo.
echo Setting up multiple databases...
echo.
echo This option allows you to configure multiple databases for:
echo - High availability and redundancy
echo - Load balancing
echo - Backup and failover
echo.
echo You can configure any combination of the supported databases
echo.
goto :env_setup

:env_setup
echo.
echo Creating environment configuration...
echo.

if not exist ".env" (
    copy .env.example .env
    echo ✅ Created .env file from template
) else (
    echo ⚠️  .env file already exists
)

echo.
echo 📝 Next steps:
echo.
echo 1. Edit .env file with your database credentials
echo 2. Install database dependencies: cd server && npm install
echo 3. Start the server: npm run server
echo 4. Check database status: http://localhost:5000/api/database/health
echo.

echo 🔧 Environment variables to configure:
echo.

if "%choice%"=="1" (
    echo MONGODB_URI=mongodb://localhost:27017/wellsense-ai
    echo PRIMARY_DATABASE=mongodb
) else if "%choice%"=="2" (
    echo MYSQL_HOST=localhost
    echo MYSQL_PORT=3306
    echo MYSQL_USER=your_username
    echo MYSQL_PASSWORD=your_password
    echo MYSQL_DATABASE=wellsense_ai
    echo PRIMARY_DATABASE=mysql
) else if "%choice%"=="3" (
    echo POSTGRES_HOST=localhost
    echo POSTGRES_PORT=5432
    echo POSTGRES_USER=postgres
    echo POSTGRES_PASSWORD=your_password
    echo POSTGRES_DATABASE=wellsense_ai
    echo PRIMARY_DATABASE=postgresql
) else if "%choice%"=="4" (
    echo SQLITE_PATH=./data/wellsense-ai.db
    echo ENABLE_SQLITE=true
    echo PRIMARY_DATABASE=sqlite
) else if "%choice%"=="5" (
    echo # Configure multiple databases in .env file
    echo # Set PRIMARY_DATABASE to your preferred option
    echo # All configured databases will be available for failover
)

echo.
echo 🚀 Database features available:
echo • Automatic schema creation
echo • Health monitoring and diagnostics
echo • Performance metrics
echo • Backup capabilities (planned)
echo • Multi-database support with failover
echo • Mock data mode (works without any database)
echo.

echo 📊 API endpoints for database management:
echo • GET /api/database/health - Database health check
echo • GET /api/database/stats - Database statistics
echo • GET /api/database/connections - Connection status
echo • POST /api/database/switch - Switch active database
echo.

goto :end

:invalid
echo.
echo ❌ Invalid choice. Please run the script again and choose 1-5.
echo.

:end
echo.
echo Database setup complete!
echo.
echo To test your database connection:
echo 1. Start the server: npm run server
echo 2. Check: http://localhost:5000/api/database/health
echo.
pause