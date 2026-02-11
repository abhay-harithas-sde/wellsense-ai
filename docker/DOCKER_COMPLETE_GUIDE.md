# WellSense AI - Complete Docker Guide

## 🐳 Overview

This guide covers the complete Docker setup for WellSense AI, including PostgreSQL, MongoDB, Redis, and management tools.

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** (included with Docker Desktop)
- **Node.js** 18+ installed
- **Git** (optional)

### Install Docker Desktop

Download from: https://www.docker.com/products/docker-desktop

## 🚀 Quick Start

### Option 1: Complete Automated Setup (Recommended)

```bash
cd docker
docker-complete-setup.bat
```

This script will:
1. Check prerequisites
2. Stop existing containers
3. Create required directories
4. Pull Docker images
5. Start all containers
6. Wait for services to be ready
7. Test all connections
8. Setup Prisma schema
9. Display connection details

### Option 2: Manual Setup

```bash
cd docker

# Start containers
docker-compose up -d

# Wait for services (30-60 seconds)
timeout /t 30

# Test connections
node test-docker-connections.js
```

## 📊 Services Included

### 1. PostgreSQL (Primary Database)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: wellsense_ai
- **Username**: postgres
- **Password**: Abhay#1709
- **Connection**: `postgresql://postgres:Abhay%231709@localhost:5432/wellsense_ai`

### 2. MongoDB (Document Store)
- **Image**: mongo:7.0
- **Port**: 27017
- **Database**: wellsense_ai
- **Username**: admin
- **Password**: Abhay#1709
- **Connection**: `mongodb://admin:Abhay%231709@localhost:27017/wellsense_ai?authSource=admin`

### 3. Redis (Cache & Sessions)
- **Image**: redis:7-alpine
- **Port**: 6379
- **Connection**: `redis://localhost:6379`

### 4. pgAdmin (PostgreSQL GUI)
- **Image**: dpage/pgadmin4
- **Port**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@wellsense.ai
- **Password**: Abhay#1709

### 5. Mongo Express (MongoDB GUI)
- **Image**: mongo-express
- **Port**: 8081
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: Abhay#1709

## 🔧 Configuration

### Environment Variables

Update your `.env` file in the project root:

```env
# PostgreSQL
DATABASE_URL="postgresql://postgres:Abhay%231709@localhost:5432/wellsense_ai"

# MongoDB
MONGODB_URI="mongodb://admin:Abhay%231709@localhost:27017/wellsense_ai?authSource=admin"

# Redis
REDIS_URL="redis://localhost:6379"
```

### Docker Compose Configuration

The `docker-compose.yml` file defines all services. Key features:

- **Health checks** for all services
- **Persistent volumes** for data
- **Automatic restart** on failure
- **Network isolation** with bridge network
- **Init scripts** for database setup

## 📝 Available Scripts

### Setup Scripts

```bash
# Complete setup with verification
docker-complete-setup.bat

# Basic setup
docker-setup.bat

# Test connections
node test-docker-connections.js
```

### Management Scripts

```bash
# Interactive management menu
docker-management.bat

# Health check
docker-health-check.bat

# Database status
docker-db-status.bat
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres

# Check status
docker-compose ps

# Remove everything (including volumes)
docker-compose down -v
```

## 🧪 Testing Connections

### Automated Test

```bash
cd docker
node test-docker-connections.js
```

This tests:
- ✅ Connection to all databases
- ✅ Health checks
- ✅ Basic operations (CRUD)
- ✅ Cache functionality
- ✅ Statistics gathering

### Manual Testing

#### PostgreSQL
```bash
# Connect to PostgreSQL
docker exec -it wellsense-postgres psql -U postgres -d wellsense_ai

# Test query
SELECT version();

# List tables
\dt

# Exit
\q
```

#### MongoDB
```bash
# Connect to MongoDB
docker exec -it wellsense-mongodb mongosh -u admin -p "Abhay#1709" --authenticationDatabase admin wellsense_ai

# Test query
db.version()

# List collections
show collections

# Exit
exit
```

#### Redis
```bash
# Connect to Redis
docker exec -it wellsense-redis redis-cli

# Test
PING

# Get info
INFO

# Exit
exit
```

## 🗄️ Database Management

### Using pgAdmin (PostgreSQL)

1. Open http://localhost:5050
2. Login with:
   - Email: admin@wellsense.ai
   - Password: Abhay#1709
3. Add server:
   - Name: WellSense AI
   - Host: postgres (or host.docker.internal)
   - Port: 5432
   - Database: wellsense_ai
   - Username: postgres
   - Password: Abhay#1709

### Using Mongo Express (MongoDB)

1. Open http://localhost:8081
2. Login with:
   - Username: admin
   - Password: Abhay#1709
3. Select `wellsense_ai` database

### Using Prisma Studio

```bash
npm run db:studio
```

Opens at http://localhost:5555

## 💾 Backup & Restore

### Backup

#### PostgreSQL Backup
```bash
# Manual backup
docker exec wellsense-postgres pg_dump -U postgres wellsense_ai > backup.sql

# Using management script
docker-management.bat
# Select option 7 (Backup databases)
```

#### MongoDB Backup
```bash
# Manual backup
docker exec wellsense-mongodb mongodump --db wellsense_ai --out /tmp/backup
docker cp wellsense-mongodb:/tmp/backup ./mongodb_backup
```

### Restore

#### PostgreSQL Restore
```bash
# Manual restore
docker exec -i wellsense-postgres psql -U postgres -d wellsense_ai < backup.sql

# Using management script
docker-management.bat
# Select option 8 (Restore databases)
```

#### MongoDB Restore
```bash
# Manual restore
docker cp ./mongodb_backup wellsense-mongodb:/tmp/restore
docker exec wellsense-mongodb mongorestore --db wellsense_ai /tmp/restore/wellsense_ai
```

## 🔍 Monitoring

### Container Status

```bash
# View all containers
docker ps

# View WellSense containers only
docker ps --filter "name=wellsense"

# Detailed status
docker-compose ps
```

### Resource Usage

```bash
# Real-time stats
docker stats

# One-time stats
docker stats --no-stream
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100

# Since timestamp
docker-compose logs --since 2024-02-09T10:00:00
```

## 🐛 Troubleshooting

### Containers Won't Start

```bash
# Check Docker is running
docker info

# Check for port conflicts
netstat -ano | findstr "5432"
netstat -ano | findstr "27017"
netstat -ano | findstr "6379"

# View error logs
docker-compose logs

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Connection Refused

```bash
# Wait for services to be ready
timeout /t 30

# Check health
docker-health-check.bat

# Restart services
docker-compose restart
```

### Database Not Initialized

```bash
# Check init scripts
dir postgres\init
dir mongodb\init

# Recreate with fresh data
docker-compose down -v
docker-compose up -d
```

### Permission Errors

```bash
# Run as administrator
# Right-click Command Prompt -> Run as Administrator

# Or fix Docker Desktop permissions
# Docker Desktop -> Settings -> Resources -> File Sharing
```

### Out of Disk Space

```bash
# Clean up unused resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

## 🔐 Security

### Change Default Passwords

Edit `docker-compose.yml` and update:
- `POSTGRES_PASSWORD`
- `MONGO_INITDB_ROOT_PASSWORD`
- `PGADMIN_DEFAULT_PASSWORD`
- `ME_CONFIG_BASICAUTH_PASSWORD`

Then recreate containers:
```bash
docker-compose down -v
docker-compose up -d
```

### Network Security

The containers are on an isolated bridge network. To expose to external networks, update port mappings in `docker-compose.yml`.

### Data Encryption

For production:
1. Enable SSL for PostgreSQL
2. Enable TLS for MongoDB
3. Use Redis with AUTH
4. Store passwords in secrets manager

## 📈 Performance Tuning

### PostgreSQL

Edit `docker-compose.yml` to add:
```yaml
command:
  - "postgres"
  - "-c"
  - "shared_buffers=256MB"
  - "-c"
  - "max_connections=200"
```

### MongoDB

Add to environment:
```yaml
environment:
  - MONGO_INITDB_ROOT_USERNAME=admin
  - MONGO_INITDB_ROOT_PASSWORD=Abhay#1709
  - MONGO_INITDB_DATABASE=wellsense_ai
```

### Redis

Add configuration:
```yaml
command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## 🔄 Updates

### Update Images

```bash
# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d --force-recreate
```

### Update Configuration

```bash
# Edit docker-compose.yml
notepad docker-compose.yml

# Apply changes
docker-compose up -d
```

## 📚 Additional Resources

### Docker Commands Reference

```bash
# Container management
docker start <container>
docker stop <container>
docker restart <container>
docker rm <container>

# Image management
docker images
docker rmi <image>
docker pull <image>

# Volume management
docker volume ls
docker volume rm <volume>
docker volume inspect <volume>

# Network management
docker network ls
docker network inspect wellsense-network

# System cleanup
docker system prune
docker system prune -a --volumes
```

### Useful Links

- Docker Documentation: https://docs.docker.com
- PostgreSQL Docker: https://hub.docker.com/_/postgres
- MongoDB Docker: https://hub.docker.com/_/mongo
- Redis Docker: https://hub.docker.com/_/redis
- Prisma Documentation: https://www.prisma.io/docs

## 🎯 Best Practices

1. **Always use volumes** for data persistence
2. **Regular backups** of databases
3. **Monitor resource usage** with `docker stats`
4. **Keep images updated** with `docker-compose pull`
5. **Use health checks** for reliability
6. **Clean up regularly** with `docker system prune`
7. **Check logs** when troubleshooting
8. **Use .env files** for configuration
9. **Document changes** to docker-compose.yml
10. **Test after updates** with test scripts

## 🆘 Getting Help

If you encounter issues:

1. Run health check: `docker-health-check.bat`
2. Check logs: `docker-compose logs`
3. Test connections: `node test-docker-connections.js`
4. Review this guide
5. Check Docker Desktop status
6. Restart Docker Desktop
7. Recreate containers: `docker-compose down -v && docker-compose up -d`

## ✅ Checklist

Before starting development:

- [ ] Docker Desktop installed and running
- [ ] Containers started: `docker-compose up -d`
- [ ] Services healthy: `docker-health-check.bat`
- [ ] Connections tested: `node test-docker-connections.js`
- [ ] .env file updated with connection strings
- [ ] Prisma schema pushed: `npm run db:migrate`
- [ ] Database tested: `npm run db:test`

## 🎉 Summary

You now have a complete Docker setup with:
- ✅ PostgreSQL for primary data storage
- ✅ MongoDB for document storage
- ✅ Redis for caching and sessions
- ✅ pgAdmin for PostgreSQL management
- ✅ Mongo Express for MongoDB management
- ✅ Automated setup scripts
- ✅ Health monitoring
- ✅ Backup/restore capabilities
- ✅ Complete documentation

Your Docker environment is production-ready! 🚀
