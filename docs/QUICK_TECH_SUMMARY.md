# ⚡ WellSense AI - Quick Technical Summary

**One-page overview of the entire tech stack**

---

## 🖥️ Server Languages

- **Backend:** JavaScript (Node.js 18+)
- **Frontend:** JavaScript (React 19)
- **Databases:** SQL (PostgreSQL), NoSQL (MongoDB)
- **ORM:** Prisma Schema Language

---

## 🏗️ Architecture

**Pattern:** Monolithic with Modular Components (GOD Architecture)

```
GOD Server (Port 3000)
├── Express.js (Backend API)
├── React (Frontend - served from /dist)
├── PostgreSQL (Primary DB - Port 5432)
├── MongoDB (Document Store - Port 27017)
└── Redis (Cache - Port 6379)
```

---

## 💻 Core Technologies

### Backend
- **Express.js 5.2.1** - Web framework
- **Prisma 6.19.2** - Database ORM
- **JWT + bcrypt** - Authentication
- **Helmet + CORS** - Security

### Frontend
- **React 19.2.4** - UI library
- **Tailwind CSS 3.4.19** - Styling
- **Vite 7.3.1** - Build tool
- **Recharts 3.7.0** - Charts

### Databases
- **PostgreSQL** - User data, health records (10 tables)
- **MongoDB** - AI content, community posts
- **Redis** - Caching, sessions

### AI Services
- **OpenAI GPT-4** - Primary AI
- **Anthropic Claude** - Fallback
- **Google Gemini** - Secondary fallback

---

## 📡 API

- **100+ RESTful endpoints**
- **Base:** `/api/v1`
- **Auth:** JWT tokens (7-day expiry)
- **Rate Limit:** 100 req/15min per IP
- **Format:** JSON

**Main Categories:**
- Users, Health Records, Weight, Exercise
- Nutrition, Mental Health, Goals
- Chat Sessions, Community, Consultations

---

## 🔐 Security

✅ JWT + OAuth (Google, Microsoft)  
✅ bcrypt password hashing (12 rounds)  
✅ Helmet security headers  
✅ CORS whitelisting  
✅ Rate limiting  
✅ SSL/TLS support  
✅ Environment validation  
✅ Input validation (Joi)  

---

## 🗄️ Database Models

**PostgreSQL (10 tables):**
1. User
2. HealthRecord
3. WeightRecord
4. ExerciseRecord
5. NutritionRecord
6. MentalHealthRecord
7. Goal
8. ChatSession
9. CommunityPost
10. Consultation

---

## 🐳 DevOps

**Docker Services:**
- PostgreSQL (postgres:15-alpine)
- MongoDB (mongo:7)
- Redis (redis:7-alpine)
- pgAdmin (dpage/pgadmin4)
- Mongo Express (mongo-express)

**Automation:**
- Database sync (30s)
- Health checks (30s)
- Auto-cleanup (30s)
- Auto-restart (30s)

---

## 📊 Performance

- **API Response:** < 50ms
- **AI Response:** 1-5 seconds
- **Frontend Load:** < 2 seconds
- **Concurrent Users:** 100+
- **Uptime Target:** 99.9%

---

## 📦 Project Stats

- **Total Files:** 200+
- **Lines of Code:** 50,000+
- **Documentation:** 34 files
- **Dependencies:** 50+
- **Test Coverage:** 80%+

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Docker services
cd docker && docker-compose up -d

# 3. Setup database
npm run db:setup

# 4. Start server
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- pgAdmin: http://localhost:5050
- Mongo Express: http://localhost:8081

---

## 📚 Key Documentation

1. **[TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md)** - Complete technical details
2. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
3. **[DATABASE_GUIDE.md](DATABASE_GUIDE.md)** - Database guide
4. **[SERVER_ARCHITECTURE.md](SERVER_ARCHITECTURE.md)** - Architecture details
5. **[SECURITY_HARDENING.md](SECURITY_HARDENING.md)** - Security guide

---

**Status:** ✅ Production Ready  
**Last Updated:** February 15, 2026  
**Team:** ABHAY HARITHAS
