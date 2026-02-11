# WellSense AI - Server Architecture

## 🏗️ Architecture Overview

WellSense AI uses a **JOD (Join-On-Demand)** unified server architecture that combines frontend serving, backend API, and database management in a single, cohesive system.

```
┌─────────────────────────────────────────────────────────────────┐
│                     WellSense AI Platform                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌──────────────────┐               │
│  │   Frontend     │◄────────┤  JOD Server      │               │
│  │   (React)      │         │  (Port 3001)     │               │
│  │   Port 3000    │         │                  │               │
│  └────────────────┘         └────────┬─────────┘               │
│         │                             │                          │
│         │                             │                          │
│         └─────────────┬───────────────┘                          │
│                       │                                          │
│              ┌────────▼────────┐                                │
│              │   AAP Backend   │                                │
│              │   (Express.js)  │                                │
│              └────────┬────────┘                                │
│                       │                                          │
│         ┌─────────────┼─────────────┐                           │
│         │             │             │                           │
│    ┌────▼────┐   ┌───▼────┐   ┌───▼────┐                      │
│    │Database │   │   AI   │   │Firebase│                      │
│    │(Prisma) │   │Manager │   │ Admin  │                      │
│    └─────────┘   └────────┘   └────────┘                      │
│         │                                                        │
│    ┌────▼────────────────────────────┐                         │
│    │  PostgreSQL / MongoDB           │                         │
│    │  (Docker Container)             │                         │
│    └─────────────────────────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Core Components

### 1. JOD Server (`jod-server.cjs`)

**Purpose**: Unified server that handles both frontend serving and backend API

**Port**: 3001 (Backend API)
**Frontend**: Port 3000 (Vite Dev Server in development)

**Key Features**:
- Express.js application
- Middleware stack (CORS, Helmet, Compression)
- API route mounting
- Static file serving
- Health monitoring
- Graceful shutdown

**Initialization Flow**:
```javascript
1. Load environment variables (.env)
2. Initialize Express app
3. Initialize DatabaseManager
4. Initialize Firebase Admin (optional)
5. Configure middleware
6. Mount API routes
7. Setup error handlers
8. Start listening on port 3001
```

### 2. AAP Backend (`AAP/`)

**AAP** = Application Programming Platform

**Structure**:
```
AAP/
├── index.js          # Main AAP module exports
├── database.js       # DatabaseManager class
├── ai.js            # AIManager class
├── auth.js          # Authentication middleware
├── routes.js        # Main route aggregator
├── routes/
│   └── auth.js      # Authentication routes
├── prisma/
│   └── schema.prisma # Database schema
└── package.json     # AAP dependencies
```

**Components**:

#### a) DatabaseManager (`database.js`)
- Prisma ORM wrapper
- CRUD operations
- Health checks
- Statistics
- Cleanup utilities

#### b) AIManager (`ai.js`)
- Multi-provider AI integration
- OpenAI, Anthropic, Google AI
- Health advice generation
- Fallback mechanisms

#### c) Authentication (`auth.js`)
- JWT token verification
- Google OAuth integration
- Microsoft OAuth integration
- Token middleware

#### d) Routes (`routes.js`)
- Route aggregation
- Endpoint definitions
- Middleware application

## 🛣️ API Routes Structure

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

### Route Hierarchy

```
/api
├── /health                    # Health check
├── /health-check             # Simple health check
├── /updates
│   └── /check                # Auto-update check
│
├── /auth                     # Authentication routes
│   ├── POST /register        # User registration
│   ├── POST /login           # User login
│   ├── POST /logout          # User logout
│   ├── GET  /me              # Get current user
│   ├── POST /google/verify   # Google OAuth verify
│   └── GET  /google          # Google OAuth redirect
│
├── /user                     # User management
│   ├── GET  /profile         # Get user profile
│   └── PUT  /profile         # Update user profile
│
├── /health                   # Health records
│   ├── POST /records         # Create health record
│   └── GET  /records         # Get health records
│
├── /weight                   # Weight tracking
│   ├── POST /records         # Create weight record
│   └── GET  /records         # Get weight records
│
├── /ai                       # AI services
│   ├── POST /chat            # AI chat
│   └── POST /analyze         # AI analysis
│
├── /goals                    # Goal management
│   ├── POST /                # Create goal
│   └── GET  /                # Get goals
│
├── /community                # Community features
│   ├── POST /posts           # Create post
│   ├── GET  /posts           # Get posts
│   ├── POST /comments        # Add comment
│   └── GET  /comments        # Get comments
│
├── /consultation             # Consultation booking
│   ├── POST /book            # Book consultation
│   └── GET  /list            # List consultations
│
└── /stats                    # Database statistics
```

## 🔐 Authentication Flow

### JWT Token-Based Authentication

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       │ 1. POST /api/auth/login
       │    { email, password }
       ▼
┌──────────────────────┐
│   Auth Routes        │
│   (auth.js)          │
└──────┬───────────────┘
       │
       │ 2. Verify credentials
       │    with Prisma
       ▼
┌──────────────────────┐
│   Database           │
│   (PostgreSQL)       │
└──────┬───────────────┘
       │
       │ 3. Generate JWT token
       │    jwt.sign(payload, secret)
       ▼
┌──────────────────────┐
│   Return to Client   │
│   { token, user }    │
└──────┬───────────────┘
       │
       │ 4. Store token
       │    localStorage.setItem('wellsense_token', token)
       ▼
┌──────────────────────┐
│   Subsequent         │
│   Requests           │
│   Authorization:     │
│   Bearer <token>     │
└──────────────────────┘
```

### Google OAuth Flow

```
┌──────────────┐
│   Client     │
│   Clicks     │
│   "Google"   │
└──────┬───────┘
       │
       │ 1. Google Sign-In popup
       ▼
┌──────────────────────┐
│   Google OAuth       │
│   (accounts.google)  │
└──────┬───────────────┘
       │
       │ 2. Return JWT credential
       ▼
┌──────────────────────┐
│   Frontend           │
│   GoogleAuthButton   │
└──────┬───────────────┘
       │
       │ 3. POST /api/auth/google/verify
       │    { credential }
       ▼
┌──────────────────────┐
│   Backend            │
│   OAuth2Client       │
│   verifyIdToken()    │
└──────┬───────────────┘
       │
       │ 4. Check if user exists
       ▼
┌──────────────────────┐
│   Database           │
│   findUnique(email)  │
└──────┬───────────────┘
       │
       ├─── Exists ────┐
       │               │
       │               │ 5a. Login
       │               │     Update lastLoginAt
       │               │
       └─── New ───────┤
                       │ 5b. Register
                       │     Create user
                       │
                       ▼
                ┌──────────────┐
                │ Generate JWT │
                │ Return user  │
                └──────────────┘
```

## 💾 Database Architecture

### Prisma ORM

**Schema Location**: `AAP/prisma/schema.prisma`

**Key Models**:

```prisma
User
├── id (String, CUID)
├── email (String, unique)
├── googleId (String, unique, optional)
├── passwordHash (String, optional)
├── firstName, lastName
├── profileImage
├── isVerified, isActive
├── lastLoginAt
└── Relations:
    ├── healthRecords[]
    ├── weightRecords[]
    ├── exerciseRecords[]
    ├── nutritionRecords[]
    ├── mentalHealthRecords[]
    ├── goals[]
    ├── chatSessions[]
    ├── communityPosts[]
    └── consultations[]

HealthRecord
├── id
├── userId (FK → User)
├── recordType
├── data (JSON)
└── recordedAt

WeightRecord
├── id
├── userId (FK → User)
├── weightKg
├── bodyFatPercentage
└── recordedAt

Goal
├── id
├── userId (FK → User)
├── type
├── targetValue
├── currentValue
├── deadline
└── status

ChatSession
├── id
├── userId (FK → User)
├── messages (JSON)
├── aiProvider
├── model
└── lastMessageAt

CommunityPost
├── id
├── userId (FK → User)
├── title
├── content
├── category
├── likes
└── isPublished
```

### Database Manager Class

**Location**: `AAP/database.js`

**Methods**:

```javascript
class DatabaseManager {
  // Health & Monitoring
  healthCheck()              // Check database connection
  getStats()                 // Get record counts
  
  // User Operations
  createUser(userData)       // Create new user
  getUserById(id)            // Get user by ID
  getUserByEmail(email)      // Get user by email
  
  // Health Records
  createHealthRecord(userId, data)
  getHealthRecords(userId, limit)
  
  // Weight Records
  createWeightRecord(userId, data)
  getWeightRecords(userId, limit)
  
  // Maintenance
  cleanup()                  // Clean old data
  disconnect()               // Close connections
}
```

## 🤖 AI Integration

### AIManager Class

**Location**: `AAP/ai.js`

**Providers**:
1. **OpenAI** (GPT-4, GPT-3.5)
2. **Anthropic** (Claude 3)
3. **Google AI** (Gemini Pro)

**Features**:
- Multi-provider fallback
- Health advice generation
- Context-aware responses
- Provider health checks

**Flow**:
```
User Message
     ↓
AIManager.generateHealthAdvice()
     ↓
Try Primary Provider (OpenAI)
     ↓
     ├─ Success → Return response
     │
     └─ Failure → Try Fallback (Anthropic)
              ↓
              ├─ Success → Return response
              │
              └─ Failure → Try Final Fallback (Google)
                       ↓
                       └─ Return response or error
```

## 🔧 Middleware Stack

### Order of Execution

```javascript
1. dotenv.config()              // Load environment variables
2. helmet()                     // Security headers
3. cors()                       // Cross-origin requests
4. compression()                // Response compression
5. express.json()               // JSON body parser
6. express.urlencoded()         // URL-encoded body parser
7. Request logging              // Custom logger
8. API routes                   // Application routes
9. Static file serving          // Public assets
10. Error handler               // Error middleware
11. 404 handler                 // Not found handler
```

### Security Middleware

**Helmet Configuration**:
```javascript
helmet({
  contentSecurityPolicy: false,  // Allow Vite dev server
  crossOriginEmbedderPolicy: false
})
```

**CORS Configuration**:
```javascript
cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
})
```

**Rate Limiting**:
```javascript
rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests per window
})
```

## 🚀 Deployment Architecture

### Development Mode

```
┌─────────────────────────────────────────┐
│  Terminal 1: Backend                    │
│  node jod-server.cjs                    │
│  Port: 3001                             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Terminal 2: Frontend                   │
│  npm run dev (Vite)                     │
│  Port: 3000                             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Docker: Database                       │
│  PostgreSQL: 5432                       │
│  MongoDB: 27017 (optional)              │
└─────────────────────────────────────────┘
```

### Production Mode

```
┌─────────────────────────────────────────┐
│  JOD Server (Single Process)            │
│  - Serves built React app from /dist    │
│  - Handles API requests on /api/*       │
│  - Port: 3001                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Database (Cloud/Docker)                │
│  - PostgreSQL (Primary)                 │
│  - MongoDB (Optional)                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  External Services                      │
│  - Firebase (Optional)                  │
│  - OpenAI API                           │
│  - Google OAuth                         │
└─────────────────────────────────────────┘
```

## 📊 Request Flow

### Typical API Request

```
1. Client Request
   ↓
   GET http://localhost:3001/api/health/records
   Headers: { Authorization: Bearer <token> }

2. JOD Server
   ↓
   Express receives request

3. Middleware Chain
   ↓
   helmet() → cors() → compression() → json() → logging()

4. Route Matching
   ↓
   /api → routes.js → /health/records

5. Authentication
   ↓
   authenticateToken() middleware
   - Verify JWT token
   - Decode user info
   - Attach to req.user

6. Route Handler
   ↓
   async (req, res) => {
     const records = await db.getHealthRecords(req.user.id);
     res.json(records);
   }

7. Database Query
   ↓
   Prisma → PostgreSQL
   SELECT * FROM "HealthRecord" WHERE "userId" = ?

8. Response
   ↓
   JSON response with health records

9. Client
   ↓
   Receives and processes data
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  API Service │  │ Auth Context │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTP Requests    │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Layer (JOD)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Express.js Application                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ Middleware │→ │   Routes   │→ │ Controllers│    │  │
│  │  └────────────┘  └────────────┘  └─────┬──────┘    │  │
│  └────────────────────────────────────────┼───────────┘  │
│                                            │               │
│  ┌─────────────────────────────────────────┼──────────┐  │
│  │              AAP Backend                │          │  │
│  │  ┌──────────────┐  ┌──────────────┐   │          │  │
│  │  │ DatabaseMgr  │  │  AIManager   │   │          │  │
│  │  └──────┬───────┘  └──────┬───────┘   │          │  │
│  └─────────┼──────────────────┼───────────┘          │  │
└────────────┼──────────────────┼──────────────────────────┘
             │                  │
             ▼                  ▼
┌─────────────────────┐  ┌─────────────────────┐
│   Database Layer    │  │   External APIs     │
│  ┌───────────────┐  │  │  ┌───────────────┐ │
│  │  PostgreSQL   │  │  │  │   OpenAI      │ │
│  │  (Prisma ORM) │  │  │  │   Anthropic   │ │
│  └───────────────┘  │  │  │   Google AI   │ │
│  ┌───────────────┐  │  │  │   Firebase    │ │
│  │   MongoDB     │  │  │  └───────────────┘ │
│  │  (Optional)   │  │  │                     │
│  └───────────────┘  │  └─────────────────────┘
└─────────────────────┘
```

## 🛡️ Security Architecture

### Authentication Layers

```
1. JWT Token Generation
   - Secret: process.env.JWT_SECRET
   - Expiry: 7 days (configurable)
   - Payload: { id, email, role }

2. Token Verification
   - Middleware: authenticateToken()
   - Validates signature
   - Checks expiration
   - Attaches user to request

3. Password Security
   - Hashing: bcrypt (12 rounds)
   - No plain text storage
   - Salted hashes

4. OAuth Security
   - Google: OAuth2Client verification
   - Server-side token validation
   - No client secrets exposed

5. API Security
   - CORS restrictions
   - Helmet security headers
   - Rate limiting
   - Input validation
```

## 📈 Scalability Considerations

### Current Architecture
- **Single Server**: JOD handles all requests
- **Single Database**: PostgreSQL primary
- **Stateless**: JWT tokens (no session storage)

### Scaling Options

**Horizontal Scaling**:
```
Load Balancer
     ↓
┌────┴────┬────────┬────────┐
│ JOD 1   │ JOD 2  │ JOD 3  │
└────┬────┴────┬───┴────┬───┘
     └─────────┼────────┘
               ↓
         Database Pool
```

**Vertical Scaling**:
- Increase server resources
- Optimize database queries
- Add caching layer (Redis)

**Microservices** (Future):
```
API Gateway
     ↓
┌────┴────┬────────┬────────┬────────┐
│  Auth   │ Health │   AI   │Community│
│ Service │Service │Service │ Service │
└─────────┴────────┴────────┴─────────┘
```

## 🔍 Monitoring & Logging

### Health Checks

**Endpoints**:
- `/health` - Full health check (database + AI)
- `/api/health-check` - Simple health check
- `/api/stats` - Database statistics

**Response Format**:
```json
{
  "status": "healthy",
  "server": "JOD",
  "timestamp": "2024-02-06T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "services": {
    "database": {
      "status": "healthy",
      "timestamp": "2024-02-06T10:30:00.000Z"
    },
    "ai": {
      "status": "healthy",
      "providers": ["openai", "anthropic", "google"]
    }
  }
}
```

### Request Logging

```javascript
[2024-02-06T10:30:00.000Z] POST /api/auth/login
[2024-02-06T10:30:01.000Z] GET /api/user/profile
[2024-02-06T10:30:02.000Z] POST /api/health/records
```

## 🚦 Error Handling

### Error Flow

```
Error Occurs
     ↓
Try-Catch Block
     ↓
Error Handler Middleware
     ↓
Log Error (console.error)
     ↓
Format Error Response
     ↓
Send to Client
```

### Error Response Format

```json
{
  "error": "Error message",
  "status": 500,
  "timestamp": "2024-02-06T10:30:00.000Z",
  "stack": "..." // Only in development
}
```

## 📝 Configuration

### Environment Variables

**Required**:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Optional**:
```env
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_AI_API_KEY=...
FIREBASE_PROJECT_ID=...
```

### Ports

- **3000**: Frontend (Vite Dev Server)
- **3001**: Backend (JOD Server)
- **5432**: PostgreSQL
- **27017**: MongoDB (optional)

## 🎯 Summary

**Architecture Type**: Monolithic with modular components

**Key Strengths**:
- ✅ Simple deployment (single server)
- ✅ Easy development (unified codebase)
- ✅ Stateless design (JWT tokens)
- ✅ Modular structure (AAP backend)
- ✅ Multi-database support
- ✅ Multi-AI provider support

**Technology Stack**:
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (primary), MongoDB (optional)
- **Authentication**: JWT + OAuth2
- **AI**: OpenAI, Anthropic, Google AI
- **Frontend**: React + Vite

**Production Ready**: ✅ Yes
- Security middleware configured
- Error handling implemented
- Health monitoring active
- Graceful shutdown support
- Database connection pooling
- Rate limiting enabled
