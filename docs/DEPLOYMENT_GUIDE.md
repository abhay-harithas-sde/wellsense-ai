# WellSense AI - Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- Node.js 16+ installed
- Git (for cloning)
- Database (MongoDB, MySQL, or PostgreSQL) - optional, will use mock data if not available

### One-Command Deployment
```bash
npm run deploy
```

### Development Mode
```bash
npm run start:dev
```

## 📋 System Requirements

### Required Software
- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **Database** (optional): MongoDB, MySQL, or PostgreSQL

### System Check
Run the system check before deployment:
```bash
npm run system:check
```

## 🔧 Configuration

### Environment Variables
Create `.env` files in root and `AAP/` directories:

#### Root `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### AAP Backend `.env`
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration (choose one)
PRIMARY_DATABASE=mongodb
MONGODB_URI=mongodb://localhost:27017/wellsense-ai

# OR MySQL
PRIMARY_DATABASE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=wellsense_ai

# OR PostgreSQL
PRIMARY_DATABASE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=wellsense_ai

# AI Provider Keys (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

## 🗄️ Database Setup

### Automatic Setup
The deployment script will automatically:
1. Run database migrations
2. Create necessary tables/collections
3. Seed sample data

### Manual Database Commands
```bash
# Setup database with migrations and sample data
npm run db:setup

# Check database status
npm run db:status

# Run migrations only
npm run db:migrate

# Seed sample data
npm run db:seed

# Reset database (WARNING: deletes all data)
npm run db:reset

# Database health check
npm run db:health
```

## 🌐 Deployment Options

### 1. Development Deployment
```bash
# Start both frontend and backend in development mode
npm run start:dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Hot reload enabled
- Debug logging

### 2. Production Deployment
```bash
# Full production deployment
npm run deploy
```
- Builds optimized frontend
- Starts production server
- Runs health checks
- Sets up database

### 3. Manual Step-by-Step
```bash
# 1. Install dependencies
npm install
cd AAP && npm install && cd ..

# 2. Setup database
npm run db:setup

# 3. Build frontend
npm run build

# 4. Start backend
cd AAP && npm start
```

## 📡 Available Services

### Frontend (Port 3000)
- **Main App**: http://localhost:3000
- **Health Dashboard**: http://localhost:3000/dashboard
- **Video Consultations**: http://localhost:3000/consultation
- **AI Chat**: http://localhost:3000/chat
- **Community**: http://localhost:3000/community
- **Nutritionist Tools**: http://localhost:3000/nutritionist

### Backend API (Port 5000)
- **Health Check**: http://localhost:5000/api/health-check
- **Authentication**: http://localhost:5000/api/auth
- **Chat**: http://localhost:5000/api/chat
- **Health Records**: http://localhost:5000/api/health
- **Consultations**: http://localhost:5000/api/consultations
- **Community**: http://localhost:5000/api/community
- **Database**: http://localhost:5000/api/database
- **LLM Services**: http://localhost:5000/api/llm

## 🩺 Video Consultation System

### Features
- **Real-time Video Calls**: WebRTC-based secure video consultations
- **Professional Booking**: Search and book healthcare professionals
- **Appointment Management**: Schedule, reschedule, and cancel appointments
- **In-call Features**: Chat, screen sharing, recording
- **Professional Profiles**: Detailed provider information and reviews

### Usage
1. **Book Consultation**: `/consultation/book`
2. **Join Video Call**: `/consultation/video/{id}`
3. **View Professionals**: `/consultation/professional/{id}`
4. **Manage Appointments**: `/consultation`

## 🔍 Health Monitoring

### System Health Check
```bash
curl http://localhost:5000/api/health-check
```

### Database Status
```bash
curl http://localhost:5000/api/database/status
```

### Service Status
```bash
npm run health-check
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000
```

#### 2. Database Connection Failed
- Check database is running
- Verify connection credentials in `.env`
- Ensure database exists
- Check firewall settings

#### 3. Dependencies Issues
```bash
# Clean install
rm -rf node_modules AAP/node_modules
npm install
cd AAP && npm install
```

#### 4. Migration Failures
```bash
# Reset and retry
npm run db:reset
npm run db:setup
```

### Debug Mode
Set environment variables for detailed logging:
```bash
DEBUG=* npm run start:dev
```

## 📊 Performance Optimization

### Production Optimizations
- Frontend build optimization with Vite
- Database connection pooling
- Rate limiting and security headers
- Gzip compression
- Static file caching

### Monitoring
- Real-time health checks
- Database performance metrics
- API response time monitoring
- Error logging and tracking

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection

### Data Security
- HTTPS enforcement (production)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Video Call Security
- Encrypted WebRTC connections
- Session token validation
- Room access control
- Recording permissions

## 📚 Additional Resources

### Documentation
- **Database Migrations**: `DATABASE_MIGRATION_GUIDE.md`
- **LLM Integration**: `LLM_INTEGRATION_GUIDE.md`
- **Database Setup**: `DATABASE_INTEGRATION_GUIDE.md`

### API Documentation
- Swagger/OpenAPI docs available at: http://localhost:5000/api/docs (when implemented)

### Support
- Check logs in `AAP/logs/` directory
- Run system diagnostics: `npm run system:check`
- Database diagnostics: `npm run db:health`

## 🎯 Quick Start Commands

```bash
# Complete setup and deployment
npm run deploy

# Development mode
npm run start:dev

# System check
npm run system:check

# Database setup
npm run db:setup

# Health check
npm run health-check
```

## 🌟 Features Overview

### Core Features
✅ **AI Health Chat** - Multi-provider AI integration (OpenAI, Anthropic, Google)
✅ **Video Consultations** - Real-time video calls with healthcare professionals
✅ **Health Dashboard** - Comprehensive health tracking and analytics
✅ **Community Features** - Social health community with posts and interactions
✅ **Nutritionist Tools** - Professional nutrition analysis and meal planning
✅ **Database Management** - Advanced migration and data management system

### Technical Features
✅ **Multi-Database Support** - MongoDB, MySQL, PostgreSQL
✅ **Real-time Communication** - Socket.IO for live features
✅ **Responsive Design** - Mobile-first responsive interface
✅ **Security** - Enterprise-grade security features
✅ **Scalability** - Designed for horizontal scaling
✅ **Monitoring** - Comprehensive health and performance monitoring

---

**WellSense AI** - Your comprehensive AI-driven health and wellness platform.

For support or questions, please check the documentation or create an issue in the repository.