# GOD (Ghar O Dev) - WellSense AI Platform

<div align="center">

# 🌟 GOD Server

**Unified WellSense AI Platform**

*One Server to Rule Them All*

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Port](https://img.shields.io/badge/Port-3000-red.svg)](http://localhost:3000)

</div>

---

## 🎯 What is GOD?

**GOD (Ghar O Dev)** is a unified server that consolidates the entire WellSense AI platform into a single, powerful application running on **Port 3000**.

### Key Features

✅ **Unified Architecture** - Frontend + Backend in one server  
✅ **Fixed Port 3000** - Consistent, predictable deployment  
✅ **Multi-Database** - PostgreSQL, MongoDB, Redis integrated  
✅ **AI Integration** - OpenAI, Anthropic, Google AI with fallback  
✅ **Authentication** - JWT + Google OAuth  
✅ **Health Tracking** - Complete health records system  
✅ **Production Ready** - Security, monitoring, graceful shutdown  

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start
```bash
npm start
# or
start-god.bat
```

### 4. Access
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api
- **Health:** http://localhost:3000/api/health

---

## 📚 Documentation

### 📖 Essential Guides

| Document | Description | When to Use |
|----------|-------------|-------------|
| **[📋 Documentation Index](GOD_INDEX.md)** | Complete documentation map | Finding specific docs |
| **[⚡ Quick Start](GOD_QUICK_START.md)** | Get started in 3 steps | First time setup |
| **[📘 Server README](GOD_SERVER_README.md)** | Complete server guide | Understanding features |
| **[🔄 Migration Guide](GOD_MIGRATION_GUIDE.md)** | Migrate from old servers | Upgrading from v1 |
| **[🏗️ Architecture](GOD_ARCHITECTURE.md)** | System design & flow | Understanding structure |
| **[📊 Summary](GOD_SERVER_SUMMARY.md)** | Implementation details | Technical overview |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         GOD Server (Port 3000)                  │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Frontend (React SPA from /dist)          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  API Layer                                │ │
│  │  ├── Authentication (/api/auth/*)         │ │
│  │  ├── Database (/api/db/*)                 │ │
│  │  ├── Health Records (/api/health/*)       │ │
│  │  ├── AI Services (/api/ai/*)              │ │
│  │  └── User & Community (/api/*)            │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Services                                 │ │
│  │  ├── Database Integrations (Multi-DB)    │ │
│  │  ├── Database Manager (Prisma)           │ │
│  │  ├── AI Manager (Multi-provider)         │ │
│  │  └── Auth Manager (JWT + OAuth)          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
[PostgreSQL] [MongoDB] [Redis] [AI APIs]
```

---

## 📡 API Endpoints

### Core
- `GET /api/health` - Server health check
- `GET /api` - API information

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google/verify` - Google Sign-In
- `GET /api/auth/me` - Current user

### Database API
- `GET /api/db/status` - Connection status
- `GET /api/db/health` - Health check
- `GET /api/db/stats` - Database statistics

### Health Records
- `POST /api/health/records` - Create health record
- `GET /api/health/records` - Get health records
- `POST /api/weight/records` - Create weight record
- `GET /api/weight/records` - Get weight records

### AI Services
- `POST /api/ai/chat` - AI health advice

### User & Community
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get goals
- `POST /api/community/posts` - Create post
- `GET /api/community/posts` - Get posts

---

## 🛠️ Commands

```bash
# Server
npm start              # Start GOD server
npm run dev            # Development mode (auto-reload)
npm run god            # Alternative start
npm run health         # Check server health

# Database
npm run db:migrate     # Run migrations
npm run db:generate    # Generate Prisma client
npm run db:studio      # Open Prisma Studio

# Docker
npm run docker:up      # Start databases
npm run docker:down    # Stop databases
npm run docker:status  # Check status
```

---

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Databases
DATABASE_URL=postgresql://user:pass@localhost:5432/wellsense
MONGODB_URI=mongodb://localhost:27017/wellsense
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

---

## 🐳 Docker Support

Start all databases with Docker:

```bash
npm run docker:up
```

Access management tools:
- **pgAdmin:** http://localhost:5050
- **Mongo Express:** http://localhost:8081

---

## 🔒 Security

- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting (100 req/15min)
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ SQL injection protection (Prisma)
- ✅ Input validation

---

## 📊 Tech Stack

### Backend
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Databases
- **PostgreSQL** - Primary database
- **MongoDB** - Document store
- **Redis** - Cache layer

### AI Services
- **OpenAI** - GPT models
- **Anthropic** - Claude models
- **Google AI** - Gemini models

### Security
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - Request throttling

---

## 🎯 Project Structure

```
.
├── god-server.js              # Main unified server
├── start-god.bat             # Windows startup script
├── package.json              # Root configuration
│
├── lib/                      # Core library modules
│   ├── database.js          # Database Manager
│   ├── database-integrations.js # Multi-DB integration
│   ├── ai.js                # AI Manager
│   └── auth.js              # Authentication
│
├── routes/                   # API routes
│   ├── index.js             # Main API routes
│   └── auth.js              # Auth routes
│
├── automations/              # Automation modules
│   ├── index.js             # Automations manager
│   ├── auto-database-sync.js
│   ├── auto-cleanup.js
│   ├── auto-integrate-all.js
│   ├── auto-update-sync.js
│   └── auto-restart.js
│
├── prisma/                   # Database schema
│   └── schema.prisma        # Prisma schema
│
├── dist/                     # Frontend build
├── docker/                   # Docker configurations
├── docs/                     # Documentation
└── firebase/                 # Firebase config
```

---

## 🚦 Health Monitoring

Check server health:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "service": "GOD (Ghar O Dev) - Unified Platform",
  "port": 3000,
  "services": {
    "database": { "status": "healthy" },
    "ai": { "available": ["openai", "anthropic"] }
  }
}
```

---

## 🐛 Troubleshooting

### Port already in use?
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database connection error?
```bash
npm run docker:up
```

### Module not found?
```bash
npm install
cd AAP && npm install
```

See [Migration Guide - Troubleshooting](GOD_MIGRATION_GUIDE.md#troubleshooting) for more.

---

## 📈 What's New?

### ✅ Unified Server
- Single server on port 3000
- Frontend + Backend combined
- Simplified deployment

### ❌ Removed
- Old AAP server (Port 5000)
- Separate startup scripts
- Multiple configurations

### 🎉 Benefits
- Easier development
- Simpler deployment
- Better performance
- Unified logging
- Resource efficiency

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

**ARUWELL PRENEURS**

---

## 🎓 Learning Resources

### Getting Started
1. [Quick Start Guide](GOD_QUICK_START.md) - Start here
2. [Server README](GOD_SERVER_README.md) - Complete guide
3. [Architecture](GOD_ARCHITECTURE.md) - System design

### Advanced
1. [Implementation Summary](GOD_SERVER_SUMMARY.md) - Technical details
2. [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production setup

---

## 🌟 Features

### Frontend
- ✅ React SPA
- ✅ Responsive design
- ✅ Modern UI/UX

### Backend
- ✅ RESTful API
- ✅ JWT authentication
- ✅ Google OAuth
- ✅ Rate limiting
- ✅ Error handling

### Database
- ✅ Multi-database support
- ✅ Automatic sync
- ✅ Query optimization
- ✅ Connection pooling

### AI
- ✅ Multiple providers
- ✅ Automatic fallback
- ✅ Context-aware responses
- ✅ Health advice

---

## 📞 Support

Need help? Check these resources:

1. **[Documentation Index](GOD_INDEX.md)** - Find all docs
2. **[Quick Start](GOD_QUICK_START.md)** - Get started fast
3. **[Troubleshooting](GOD_MIGRATION_GUIDE.md#troubleshooting)** - Common issues
4. **Console Logs** - Check for errors
5. **Health Endpoint** - Verify services

---

<div align="center">

## 🎉 Welcome to GOD!

**One Server, All Features, Port 3000**

[Get Started](GOD_QUICK_START.md) • [Documentation](GOD_INDEX.md) • [Architecture](GOD_ARCHITECTURE.md)

---

**GOD (Ghar O Dev)** - Unified, Powerful, Production-Ready 🌟

Made with ❤️ by ARUWELL PRENEURS

</div>
