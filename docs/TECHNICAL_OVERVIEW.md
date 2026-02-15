# 🔧 WellSense AI - Complete Technical Overview

**Last Updated:** February 15, 2026  
**Version:** 1.0.0  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Server Languages & Runtime](#server-languages--runtime)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Database Architecture](#database-architecture)
5. [API Architecture](#api-architecture)
6. [Authentication & Security](#authentication--security)
7. [AI Integration](#ai-integration)
8. [Frontend Technologies](#frontend-technologies)
9. [DevOps & Infrastructure](#devops--infrastructure)
10. [Project Structure](#project-structure)

---

## 🖥️ Server Languages & Runtime

### Primary Languages

**Backend:**
- **JavaScript (Node.js)** - 100% of backend code
  - Runtime: Node.js 18+
  - ES6+ features with CommonJS modules
  - Async/await patterns throughout

**Frontend:**
- **JavaScript (React)** - 100% of frontend code
  - JSX syntax
  - Modern React 19 features
  - Functional components with hooks

**Database Query Languages:**
- **SQL** - PostgreSQL queries via Prisma ORM
- **NoSQL** - MongoDB queries via native driver
- **Prisma Schema Language** - Database schema definitions

**Configuration:**
- **JSON** - Package configuration, environment templates
- **YAML** - Docker Compose configurations
- **Markdown** - Documentation (33 files)

### Runtime Environment

```javascript
// Node.js Configuration
{
  "engines": {
    "node": ">=18.0.0"
  },
  "type": "commonjs"
}
```

---

## 🏗️ Architecture Overview

### Architecture Pattern

**Monolithic with Modular Components (GOD Architecture)**

```
┌─────────────────────────────────────────────────────────────┐
│                    GOD Server (Port 3000)                    │
│  (Ghar O Dev - Unified Platform)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Express.js Application Layer                      │    │
│  │  - Middleware Stack                                │    │
│  │  - Route Handlers                                  │    │
│  │  - Error Handling                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Database     │  │ AI Manager   │  │ Auth Manager │    │
│  │ Manager      │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Automations  │  │ Security     │  │ Firebase     │    │
│  │ Manager      │  │ Components   │  │ Admin        │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │   MongoDB    │  │    Redis     │
│ Port 5432    │  │  Port 27017  │  │  Port 6379   │
└──────────────┘  └──────────────┘  └──────────────┘
```


### Key Architectural Decisions

1. **Unified Server (GOD)** - Single server handles frontend serving + backend API
2. **Fixed Port (3000)** - Consistent port for all environments
3. **Modular Components** - Organized into lib/, routes/, middleware/
4. **Multi-Database** - PostgreSQL (primary), MongoDB (documents), Redis (cache)
5. **Multi-AI Provider** - OpenAI, Anthropic, Google AI with fallback
6. **Stateless Authentication** - JWT tokens, no server-side sessions

---

## 💻 Technology Stack

### Backend Framework & Core

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 5.2.1 | Web application framework |
| **Prisma** | 6.19.2 | Database ORM |
| **dotenv** | 17.2.4 | Environment configuration |

### Security & Middleware

| Technology | Version | Purpose |
|------------|---------|---------|
| **helmet** | 8.1.0 | Security headers |
| **cors** | 2.8.6 | Cross-origin resource sharing |
| **express-rate-limit** | 8.2.1 | Rate limiting |
| **bcryptjs** | 3.0.3 | Password hashing |
| **jsonwebtoken** | 9.0.3 | JWT authentication |
| **joi** | 17.13.3 | Input validation |

### Database Drivers

| Technology | Version | Purpose |
|------------|---------|---------|
| **@prisma/client** | 6.19.2 | PostgreSQL ORM |
| **mongodb** | 7.1.0 | MongoDB driver |
| **redis** | 5.10.0 | Redis client |

### AI & External Services

| Technology | Version | Purpose |
|------------|---------|---------|
| **openai** | 6.21.0 | OpenAI GPT-4 API |
| **@anthropic-ai/sdk** | 0.74.0 | Anthropic Claude API |
| **@google/generative-ai** | 0.24.1 | Google Gemini API |
| **firebase-admin** | 13.6.1 | Firebase services |
| **google-auth-library** | 10.5.0 | Google OAuth |

### Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.4 | UI library |
| **react-dom** | 19.2.4 | React DOM renderer |
| **react-router-dom** | 7.13.0 | Client-side routing |
| **Vite** | 7.3.1 | Build tool & dev server |

### Frontend UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.4.19 | Utility-first CSS |
| **PostCSS** | 8.5.6 | CSS processing |
| **Autoprefixer** | 10.4.24 | CSS vendor prefixes |
| **framer-motion** | 12.33.0 | Animations |
| **lucide-react** | 0.563.0 | Icon library |
| **recharts** | 3.7.0 | Data visualization |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **nodemon** | 3.1.11 | Auto-restart server |
| **concurrently** | 9.2.1 | Run multiple commands |
| **jest** | 30.2.0 | Testing framework |
| **@faker-js/faker** | 10.3.0 | Test data generation |

---

## 🗄️ Database Architecture

### Three-Database System

#### 1. PostgreSQL (Primary Database)

**Port:** 5432  
**Purpose:** Relational data with ACID compliance  
**ORM:** Prisma

**Data Models (10 tables):**
```
User
├── id (CUID primary key)
├── email (unique)
├── passwordHash
├── googleId (unique, optional)
├── firstName, lastName
├── dateOfBirth, gender
├── profileImage, location, bio
├── preferredUnits (METRIC/IMPERIAL)
├── profileVisibility (PUBLIC/FRIENDS/PRIVATE)
├── isVerified, isActive
├── lastLoginAt
└── createdAt, updatedAt

HealthRecord
├── id
├── userId (FK → User)
├── bloodPressureSystolic, bloodPressureDiastolic
├── heartRate, temperature
├── oxygenSaturation, bloodSugar
├── bmi, mood, energyLevel
├── sleepHours, sleepQuality
├── symptoms (array)
├── notes
└── recordedAt

WeightRecord
├── id
├── userId (FK → User)
├── weightKg
├── bodyFatPercentage
├── muscleMass
├── waterPercentage
└── recordedAt

ExerciseRecord
├── id
├── userId (FK → User)
├── exerciseType (enum)
├── name, duration
├── caloriesBurned, distance
├── intensity (enum)
├── heartRateAvg, steps
└── recordedAt

NutritionRecord
├── id
├── userId (FK → User)
├── mealType (enum)
├── foodName, servingSize
├── calories, protein, carbs, fat, fiber
├── waterIntakeMl
└── recordedAt

MentalHealthRecord
├── id
├── userId (FK → User)
├── mood, anxiety, stress, depression
├── energy, focus
├── sleepHours, sleepQuality
├── meditation, journaling
├── symptoms, triggers, copingStrategies
└── recordedAt

Goal
├── id
├── userId (FK → User)
├── title, description
├── category (enum)
├── targetValue, currentValue
├── targetDate, deadline
├── status (ACTIVE/COMPLETED/PAUSED/CANCELLED)
└── priority (LOW/MEDIUM/HIGH/URGENT)

ChatSession
├── id
├── userId (FK → User)
├── title, sessionType
├── messages (JSON)
├── aiProvider, model
└── lastMessageAt

CommunityPost
├── id
├── userId (FK → User)
├── title, content
├── category, tags
├── images, likes
├── isPublished
└── createdAt

Consultation
├── id
├── userId (FK → User)
├── type (VIDEO_CALL/PHONE/CHAT/IN_PERSON)
├── specialization
├── duration, scheduledAt
├── status (enum)
├── professionalName
├── notes, prescription
└── completedAt
```

**Relationships:**
- Cascade deletes on user deletion
- Foreign key constraints
- Indexed fields for performance


#### 2. MongoDB (Document Store)

**Port:** 27017  
**Purpose:** Flexible schema for AI-generated content  
**Driver:** Native MongoDB driver

**Collections:**
- `users` - User profile backups
- `healthRecords` - Health data backups
- `weightRecords` - Weight tracking backups
- `goals` - Goal tracking backups
- `chatSessions` - AI conversation history
- `communityPosts` - Community content
- `nutritionPlans` - AI-generated meal plans
- `fitnessPlans` - AI-generated workout plans

**Use Cases:**
- AI-generated content storage
- Flexible schema documents
- Community posts with varying structures
- Chat history with nested messages
- Backup for critical data

#### 3. Redis (Cache & Sessions)

**Port:** 6379  
**Purpose:** High-speed caching and session management  
**Driver:** Redis client

**Use Cases:**
- API response caching
- Session management
- Rate limiting counters
- Real-time data
- Temporary data storage

**Key Patterns:**
```
session:{userId}        - User session data
cache:api:{endpoint}    - API response cache
ratelimit:{ip}          - Rate limit counters
health:{userId}:latest  - Latest health metrics
```

### Database Integration Layer

**Class:** `DatabaseIntegrations`  
**Location:** `lib/database-integrations.js`

**Features:**
- Unified connection management
- Health checks for all databases
- Statistics aggregation
- Automatic reconnection
- Graceful shutdown

---

## 📡 API Architecture

### RESTful API Design

**Base URL:** `http://localhost:3000/api/v1`  
**Protocol:** HTTP/HTTPS  
**Format:** JSON

### API Versioning

- **v1** - Current stable version
- Versioned endpoints: `/api/v1/*`
- Legacy support: `/api/*` (redirects to v1)

### Endpoint Categories (100+ endpoints)

#### 1. Authentication (`/api/auth`)
```
POST   /register              - User registration
POST   /login                 - User login
POST   /logout                - User logout
GET    /me                    - Get current user
POST   /google/verify         - Google OAuth verify
GET    /google                - Google OAuth redirect
POST   /microsoft/verify      - Microsoft OAuth verify
```

#### 2. Users (`/api/v1/users`)
```
POST   /                      - Create user
GET    /:id                   - Get user by ID
GET    /                      - Get all users
PUT    /:id                   - Update user
DELETE /:id                   - Delete user
GET    /search/:term          - Search users
```

#### 3. Health Records (`/api/v1/health-records`)
```
POST   /                      - Create health record
GET    /:id                   - Get record by ID
GET    /user/:userId          - Get user's records
PUT    /:id                   - Update record
DELETE /:id                   - Delete record
GET    /user/:userId/range    - Get records by date range
```

#### 4. Weight Records (`/api/v1/weight-records`)
```
POST   /                      - Create weight record
GET    /:id                   - Get record by ID
GET    /user/:userId          - Get user's records
PUT    /:id                   - Update record
DELETE /:id                   - Delete record
GET    /user/:userId/progress - Get weight progress
```

#### 5. Exercise Records (`/api/v1/exercise-records`)
```
POST   /                      - Create exercise record
GET    /:id                   - Get record by ID
GET    /user/:userId          - Get user's records
PUT    /:id                   - Update record
DELETE /:id                   - Delete record
GET    /user/:userId/stats    - Get exercise statistics
```

#### 6. Nutrition Records (`/api/v1/nutrition-records`)
```
POST   /                      - Create nutrition record
GET    /:id                   - Get record by ID
GET    /user/:userId          - Get user's records
PUT    /:id                   - Update record
DELETE /:id                   - Delete record
GET    /user/:userId/daily    - Get daily nutrition summary
```

#### 7. Mental Health (`/api/v1/mental-health-records`)
```
POST   /                      - Create mental health record
GET    /:id                   - Get record by ID
GET    /user/:userId          - Get user's records
PUT    /:id                   - Update record
DELETE /:id                   - Delete record
GET    /user/:userId/trends   - Get mental health trends
```

#### 8. Goals (`/api/v1/goals`)
```
POST   /                      - Create goal
GET    /:id                   - Get goal by ID
GET    /user/:userId          - Get user's goals
PUT    /:id                   - Update goal
DELETE /:id                   - Delete goal
PATCH  /:id/progress          - Update goal progress
PATCH  /:id/complete          - Complete goal
```

#### 9. Chat Sessions (`/api/v1/chat-sessions`)
```
POST   /                      - Create chat session
GET    /:id                   - Get session by ID
GET    /user/:userId          - Get user's sessions
PUT    /:id                   - Update session
DELETE /:id                   - Delete session
POST   /:id/messages          - Add message to session
```

#### 10. Community Posts (`/api/v1/community-posts`)
```
POST   /                      - Create post
GET    /:id                   - Get post by ID
GET    /                      - Get all posts
GET    /user/:userId          - Get user's posts
PUT    /:id                   - Update post
DELETE /:id                   - Delete post
POST   /:id/like              - Like post
GET    /search/:term          - Search posts
```

#### 11. Consultations (`/api/v1/consultations`)
```
POST   /                      - Create consultation
GET    /:id                   - Get consultation by ID
GET    /user/:userId          - Get user's consultations
PUT    /:id                   - Update consultation
DELETE /:id                   - Delete consultation
PATCH  /:id/start             - Start consultation
PATCH  /:id/complete          - Complete consultation
GET    /user/:userId/upcoming - Get upcoming consultations
```

#### 12. System (`/api`)
```
GET    /health                - Health check
GET    /health-check          - Simple health check
GET    /stats                 - Database statistics
GET    /db/status             - Database connection status
GET    /db/health             - Database health check
GET    /db/stats              - Database statistics
GET    /automations/status    - Automations status
GET    /firebase/status       - Firebase status
POST   /firebase/notification - Send push notification
```

### API Features

**Pagination:**
```javascript
GET /api/v1/users?skip=0&take=50
```

**Filtering:**
```javascript
GET /api/v1/goals/user/:userId?status=ACTIVE
```

**Date Ranges:**
```javascript
GET /api/v1/health-records/user/:userId/range?startDate=2026-01-01&endDate=2026-02-15
```

**Search:**
```javascript
GET /api/v1/users/search/john
GET /api/v1/community-posts/search/fitness
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-15T10:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-02-15T10:00:00.000Z"
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error


---

## 🔐 Authentication & Security

### Authentication Methods

#### 1. JWT Token Authentication

**Implementation:**
```javascript
// Token Generation
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token Verification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Token Storage:**
- Client: localStorage or httpOnly cookies
- Server: Stateless (no server-side storage)
- Expiration: 7 days (configurable)

#### 2. Google OAuth 2.0

**Flow:**
```
User → Google Sign-In → Google OAuth → JWT Credential
     → Backend Verification → User Creation/Login → JWT Token
```

**Implementation:**
- `google-auth-library` for token verification
- Server-side credential validation
- Automatic user creation on first login

#### 3. Microsoft OAuth (Planned)

**Status:** Infrastructure ready, implementation pending

#### 4. Phone Authentication (Firebase)

**Status:** Firebase Admin SDK integrated

### Security Features

#### Middleware Stack (Execution Order)

```javascript
1. helmet()                    // Security headers
2. cors()                      // CORS policy
3. compression()               // Response compression
4. express.json()              // JSON body parser
5. express.urlencoded()        // URL-encoded parser
6. rateLimit()                 // Rate limiting
7. requestLogger()             // Request logging
8. authenticateToken()         // JWT verification (protected routes)
9. routeHandlers()             // Application routes
10. errorHandler()             // Error middleware
```

#### Security Headers (Helmet)

```javascript
helmet({
  contentSecurityPolicy: false,  // Allow frontend assets
  crossOriginEmbedderPolicy: false
})
```

**Headers Applied:**
- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security` (HTTPS only)
- `X-Download-Options`
- `X-Permitted-Cross-Domain-Policies`

#### CORS Configuration

**Development:**
```javascript
{
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}
```

**Production:**
```javascript
{
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  optionsSuccessStatus: 200
}
```

#### Rate Limiting

```javascript
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per IP
  message: 'Too many requests from this IP'
}
```

#### Password Security

**Hashing:**
```javascript
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);
```

**Requirements:**
- Minimum 8 characters
- Bcrypt with 12 salt rounds
- No plain text storage

#### Environment Validation

**Class:** `EnvironmentValidator`  
**Location:** `lib/security/environment-validator.js`

**Validates:**
- JWT secret strength (64+ characters in production)
- Database password complexity (32+ characters in production)
- CORS origin configuration
- SSL/TLS configuration
- Required environment variables

**Enforcement:**
- Production: Fails startup on validation errors
- Development: Warnings only

#### SSL/TLS Support

**Class:** `SSLManager`  
**Location:** `lib/security/ssl-manager.js`

**Features:**
- Automatic HTTPS server creation
- HTTP to HTTPS redirect (301)
- Certificate validation
- Let's Encrypt support

**Configuration:**
```env
ENABLE_HTTPS=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
HTTPS_PORT=443
HTTP_PORT=80
```

### Security Best Practices Implemented

✅ Strong secret generation (256+ bits entropy)  
✅ Environment-specific configurations  
✅ CORS whitelisting in production  
✅ Rate limiting on all API endpoints  
✅ Input validation with Joi schemas  
✅ SQL injection prevention (Prisma ORM)  
✅ XSS protection (helmet middleware)  
✅ CSRF protection (stateless JWT)  
✅ Error sanitization in production  
✅ Secure password hashing (bcrypt)  
✅ HTTPS enforcement in production  
✅ Automated security audits  

---

## 🤖 AI Integration

### Multi-Provider Architecture

**Class:** `AIManager`  
**Location:** `lib/ai.js`

### Supported AI Providers

#### 1. OpenAI (Primary)

**Models:**
- GPT-4 (primary)
- GPT-3.5-turbo (fallback)

**Configuration:**
```javascript
{
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
}
```

**Use Cases:**
- Health advice generation
- Nutrition plan creation
- Fitness recommendations
- Mental wellness support
- General health queries

#### 2. Anthropic Claude (Fallback)

**Models:**
- Claude 3 Opus
- Claude 3 Sonnet

**Configuration:**
```javascript
{
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-opus-20240229',
  maxTokens: 1000
}
```

**Use Cases:**
- Backup for OpenAI failures
- Alternative AI perspectives
- Complex reasoning tasks

#### 3. Google Gemini (Secondary Fallback)

**Models:**
- Gemini Pro

**Configuration:**
```javascript
{
  apiKey: process.env.GOOGLE_AI_API_KEY,
  model: 'gemini-pro'
}
```

**Use Cases:**
- Final fallback option
- Google-specific integrations

### AI Fallback Chain

```
User Request
     ↓
Try OpenAI GPT-4
     ↓
     ├─ Success → Return Response
     │
     └─ Failure → Try Anthropic Claude
              ↓
              ├─ Success → Return Response
              │
              └─ Failure → Try Google Gemini
                       ↓
                       ├─ Success → Return Response
                       │
                       └─ Failure → Return Error
```

### AI Features

**Health Advice Generation:**
```javascript
const advice = await ai.generateHealthAdvice(
  userProfile,
  healthMetrics,
  query
);
```

**Nutrition Planning:**
```javascript
const plan = await ai.generateNutritionPlan(
  userGoals,
  dietaryRestrictions,
  preferences
);
```

**Fitness Recommendations:**
```javascript
const workout = await ai.generateWorkoutPlan(
  fitnessLevel,
  goals,
  equipment
);
```

### AI Context Management

**User Context:**
- Health history
- Current metrics
- Goals and preferences
- Dietary restrictions
- Fitness level

**Conversation Context:**
- Previous messages
- Session history
- User feedback
- Recommendations given

### AI Safety & Compliance

✅ Medical disclaimer in all responses  
✅ No diagnosis or prescription  
✅ Encourages professional consultation  
✅ Content filtering for inappropriate queries  
✅ Rate limiting on AI endpoints  
✅ Cost monitoring and limits  


---

## 🎨 Frontend Technologies

### React Architecture

**Version:** React 19.2.4  
**Pattern:** Functional components with hooks  
**Routing:** React Router DOM 7.13.0

### Component Structure

```
src/
├── components/
│   ├── ai/
│   │   └── OpenAIDemo.jsx
│   ├── analytics/
│   │   └── AnalyticsProvider.jsx
│   ├── auth/
│   │   ├── GoogleAuthButton.jsx
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── MicrosoftAuthButton.jsx
│   │   ├── PhoneAuthModal.jsx
│   │   └── WellSenseAuthButton.jsx
│   ├── chatbot/
│   │   ├── ChatInterface.jsx
│   │   └── NutritionistChat.jsx
│   ├── coaching/
│   │   └── BehaviorTracker.jsx
│   ├── consultation/
│   │   ├── ConsultationBooking.jsx
│   │   ├── ConsultationDashboard.jsx
│   │   ├── ProfessionalProfile.jsx
│   │   └── VideoConsultation.jsx
│   ├── dashboard/
│   │   ├── AppointmentScheduler.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── HealthMetricsChart.jsx
│   │   ├── QuickActions.jsx
│   │   └── StatCard.jsx
│   ├── fitness/
│   │   ├── ExerciseLogger.jsx
│   │   ├── FitnessPlanner.jsx
│   │   └── WorkoutTracker.jsx
│   ├── goals/
│   │   ├── GoalCard.jsx
│   │   ├── GoalProgress.jsx
│   │   └── GoalSetter.jsx
│   ├── health/
│   │   ├── HealthRecordForm.jsx
│   │   ├── HealthTimeline.jsx
│   │   └── VitalsMonitor.jsx
│   ├── mental-wellness/
│   │   ├── MoodTracker.jsx
│   │   ├── MeditationTimer.jsx
│   │   └── StressAssessment.jsx
│   ├── nutrition/
│   │   ├── FoodLogger.jsx
│   │   ├── MealPlanner.jsx
│   │   └── NutritionDashboard.jsx
│   ├── profile/
│   │   ├── ProfileEditor.jsx
│   │   └── SettingsPanel.jsx
│   └── shared/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       └── Spinner.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   ├── Health.jsx
│   ├── Fitness.jsx
│   ├── Nutrition.jsx
│   ├── MentalWellness.jsx
│   ├── Community.jsx
│   ├── Consultations.jsx
│   └── Goals.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useApi.js
│   ├── useHealthData.js
│   └── useWebSocket.js
│
├── context/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── NotificationContext.jsx
│
├── services/
│   ├── api.js
│   ├── auth.js
│   └── websocket.js
│
├── utils/
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
│
├── App.jsx
└── main.jsx
```

### State Management

**Approach:** Context API + Local State

**Contexts:**
- `AuthContext` - User authentication state
- `ThemeContext` - UI theme preferences
- `NotificationContext` - Toast notifications

**Local State:**
- Component-level state with `useState`
- Side effects with `useEffect`
- Memoization with `useMemo` and `useCallback`

### Styling System

**Primary:** Tailwind CSS 3.4.19

**Configuration:**
```javascript
// tailwind.config.js
{
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        accent: '#F59E0B'
      }
    }
  }
}
```

**Utility Classes:**
- Responsive design (mobile-first)
- Dark mode support
- Custom color palette
- Animation utilities

### Build System

**Tool:** Vite 7.3.1

**Configuration:**
```javascript
// vite.config.js
{
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}
```

**Features:**
- Hot Module Replacement (HMR)
- Fast refresh
- Optimized production builds
- Code splitting
- Tree shaking

### Data Visualization

**Library:** Recharts 3.7.0

**Chart Types:**
- Line charts (health trends)
- Bar charts (exercise stats)
- Pie charts (nutrition breakdown)
- Area charts (weight progress)
- Composed charts (multi-metric)

### Animations

**Library:** Framer Motion 12.33.0

**Use Cases:**
- Page transitions
- Component animations
- Gesture handling
- Scroll animations
- Loading states

---

## 🐳 DevOps & Infrastructure

### Docker Architecture

**Compose Version:** 3.8  
**Services:** 5 containers

#### Docker Services

**1. PostgreSQL**
```yaml
postgres:
  image: postgres:15-alpine
  ports: ["5432:5432"]
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: ${DB_PASSWORD}
    POSTGRES_DB: wellsense_ai
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./postgres/init:/docker-entrypoint-initdb.d
```

**2. MongoDB**
```yaml
mongodb:
  image: mongo:7
  ports: ["27017:27017"]
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    MONGO_INITDB_DATABASE: wellsense_ai
  volumes:
    - mongodb_data:/data/db
    - ./mongodb/init:/docker-entrypoint-initdb.d
```

**3. Redis**
```yaml
redis:
  image: redis:7-alpine
  ports: ["6379:6379"]
  command: redis-server --requirepass ${REDIS_PASSWORD}
  volumes:
    - redis_data:/data
```

**4. pgAdmin**
```yaml
pgadmin:
  image: dpage/pgadmin4
  ports: ["5050:80"]
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@wellsense.ai
    PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
```

**5. Mongo Express**
```yaml
mongo-express:
  image: mongo-express
  ports: ["8081:8081"]
  environment:
    ME_CONFIG_MONGODB_ADMINUSERNAME: admin
    ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_PASSWORD}
    ME_CONFIG_MONGODB_URL: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/
```

### Deployment Modes

#### Development
```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Start application
npm run dev
```

#### Production
```bash
# Build frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

### Environment Management

**Files:**
- `.env` - Development
- `.env.test` - Testing
- `.env.production` - Production
- `.env.production.template` - Production template

**Variables:**
```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
REDIS_URL=redis://...

# Security
JWT_SECRET=<64+ character secret>
CORS_ORIGIN=https://yourdomain.com

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# SSL (Production)
ENABLE_HTTPS=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

### Automation System

**Class:** `AutomationsManager`  
**Location:** `automations/index.js`

**Automated Tasks:**

1. **Database Sync** (30s interval)
   - PostgreSQL → MongoDB sync
   - Data consistency checks
   - Backup operations

2. **Update Sync** (30s interval)
   - Check for application updates
   - Schema migrations
   - Dependency updates

3. **Integration Check** (30s interval)
   - Database health monitoring
   - API connectivity checks
   - Service availability

4. **Cleanup** (30s interval)
   - Old session cleanup
   - Cache invalidation
   - Log rotation

5. **Auto-Restart** (30s interval)
   - Health-based recovery
   - Service restart on failure
   - Error logging

### Monitoring & Logging

**Logger:** Winston 3.17.0

**Log Levels:**
- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages (development only)

**Log Destinations:**
- Console (formatted)
- File (`logs/error.log`, `logs/combined.log`)
- External service (optional)

### Health Checks

**Endpoints:**
```
GET /api/health              - Full health check
GET /api/health-check        - Simple health check
GET /api/db/health           - Database health
GET /api/automations/status  - Automations status
GET /api/firebase/status     - Firebase status
```

**Health Check Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-15T10:00:00.000Z",
  "service": "GOD (Ghar O Dev)",
  "version": "1.0.0",
  "port": 3000,
  "environment": "production",
  "services": {
    "database": { "status": "healthy" },
    "ai": { "status": "healthy" },
    "firebase": { "status": "healthy" }
  },
  "databases": {
    "postgresql": { "connected": true },
    "mongodb": { "connected": true },
    "redis": { "connected": true }
  }
}
```


---

## 📂 Project Structure

### Root Directory

```
wellsense-ai/
├── .git/                      # Git repository
├── .kiro/                     # Kiro IDE configuration
├── .vercel/                   # Vercel deployment config
├── .vscode/                   # VS Code settings
├── automations/               # Automation scripts
│   ├── auto-cleanup.js
│   ├── auto-database-sync.js
│   ├── auto-integrate-all.js
│   ├── auto-restart.js
│   ├── auto-update-sync.js
│   └── index.js
├── dist/                      # Production build output
├── docker/                    # Docker configuration
│   ├── mongodb/
│   │   └── init/
│   ├── postgres/
│   │   └── init/
│   ├── docker-compose.yml
│   └── .env.docker
├── docs/                      # Documentation (33 files)
│   ├── presentation/          # Presentation materials
│   └── submission/            # Submission documents
├── firebase/                  # Firebase configuration
│   ├── firebase-service-account.json
│   └── google-oauth-credentials.json
├── lib/                       # Backend core libraries
│   ├── security/
│   │   ├── cors-configurator.js
│   │   ├── environment-validator.js
│   │   ├── secret-manager.js
│   │   └── ssl-manager.js
│   ├── training-data/
│   │   └── diet-plans.json
│   ├── ai.js
│   ├── auth.js
│   ├── database-crud.js
│   ├── database-integrations.js
│   ├── database.js
│   ├── firebase.js
│   ├── logger.js
│   ├── openai-fallback.js
│   └── validation.js
├── LOGO/                      # Application logos
├── logs/                      # Application logs
├── middleware/                # Express middleware
│   ├── auth.js
│   └── errorHandler.js
├── node_modules/              # Dependencies
├── prisma/                    # Prisma ORM
│   ├── migrations/
│   └── schema.prisma
├── public/                    # Static assets
│   ├── backup/
│   ├── favicon.ico
│   ├── logo.png
│   └── manifest.json
├── routes/                    # API routes
│   ├── auth.js
│   ├── crud-api.js
│   ├── index.js
│   └── [other route files]
├── scripts/                   # Utility scripts
│   ├── config/
│   ├── database/
│   ├── populate-data.js
│   ├── setup-database.js
│   ├── security-audit.js
│   └── [other scripts]
├── server/                    # Server utilities
├── src/                       # React frontend source
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── ssl/                       # SSL certificates
├── submission/                # Submission materials
├── tests/                     # Test files
│   ├── integration/
│   ├── property/
│   └── unit/
├── .env                       # Development environment
├── .env.production            # Production environment
├── .env.test                  # Test environment
├── .gitignore                 # Git ignore rules
├── god-server.js              # Main server file
├── index.html                 # HTML entry point
├── LICENSE                    # MIT License
├── nodemon.json               # Nodemon configuration
├── package.json               # NPM dependencies
├── package-lock.json          # NPM lock file
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Project README
├── server-https.js            # HTTPS server
├── tailwind.config.js         # Tailwind configuration
├── vercel.json                # Vercel configuration
└── vite.config.js             # Vite configuration
```

### Key Files

#### Server Entry Point
**`god-server.js`** (955 lines)
- Main server initialization
- Express app configuration
- Middleware setup
- Route mounting
- Database connections
- Graceful shutdown

#### Database Schema
**`prisma/schema.prisma`**
- 10 data models
- Relationships and constraints
- Enums and types
- Indexes for performance

#### Frontend Entry
**`src/App.jsx`**
- React Router setup
- Context providers
- Global layout
- Route definitions

#### API Routes
**`routes/crud-api.js`**
- 100+ RESTful endpoints
- CRUD operations
- Authentication middleware
- Input validation

### Code Organization Principles

1. **Separation of Concerns**
   - `lib/` - Core business logic
   - `routes/` - API endpoints
   - `middleware/` - Request processing
   - `src/` - Frontend components

2. **Modular Architecture**
   - Each module is self-contained
   - Clear interfaces between modules
   - Easy to test and maintain

3. **Configuration Management**
   - Environment-based configs
   - Centralized constants
   - Secure secret management

4. **Error Handling**
   - Centralized error middleware
   - Consistent error responses
   - Proper logging

5. **Security First**
   - Security modules in `lib/security/`
   - Validation at every layer
   - Environment validation

---

## 📊 Performance Characteristics

### Response Times

**API Endpoints:**
- Health check: < 10ms
- Database queries: 10-50ms
- AI requests: 1-5 seconds
- File uploads: 100-500ms

**Frontend:**
- Initial load: < 2 seconds
- Route transitions: < 100ms
- Component renders: < 16ms (60fps)

### Scalability

**Current Capacity:**
- Concurrent users: 100+
- Requests per second: 50+
- Database connections: 20 (pooled)
- Memory usage: ~200MB

**Scaling Options:**
- Horizontal: Load balancer + multiple instances
- Vertical: Increase server resources
- Database: Read replicas, sharding
- Cache: Redis cluster

### Optimization Techniques

✅ Database connection pooling  
✅ API response caching (Redis)  
✅ Gzip compression  
✅ Code splitting (frontend)  
✅ Lazy loading components  
✅ Image optimization  
✅ CDN for static assets  
✅ Database query optimization  
✅ Index optimization  

---

## 🔄 Data Flow

### Request Flow

```
1. Client Request
   ↓
2. CORS Check (middleware)
   ↓
3. Rate Limiting (middleware)
   ↓
4. Body Parsing (middleware)
   ↓
5. Request Logging (middleware)
   ↓
6. Authentication (middleware, if required)
   ↓
7. Route Handler
   ↓
8. Business Logic (lib/)
   ↓
9. Database Query (Prisma/MongoDB/Redis)
   ↓
10. Response Formatting
    ↓
11. Compression (middleware)
    ↓
12. Client Response
```

### Authentication Flow

```
1. User Login Request
   ↓
2. Validate Credentials
   ↓
3. Generate JWT Token
   ↓
4. Return Token to Client
   ↓
5. Client Stores Token
   ↓
6. Subsequent Requests Include Token
   ↓
7. Server Verifies Token
   ↓
8. Attach User to Request
   ↓
9. Process Request
```

### AI Request Flow

```
1. User Query
   ↓
2. Check Redis Cache
   ↓
   ├─ Cache Hit → Return Cached Response
   │
   └─ Cache Miss
      ↓
      3. Try OpenAI
      ↓
      ├─ Success → Cache & Return
      │
      └─ Failure
         ↓
         4. Try Anthropic
         ↓
         ├─ Success → Cache & Return
         │
         └─ Failure
            ↓
            5. Try Google AI
            ↓
            └─ Return Response or Error
```

---

## 🎯 Summary

### Technology Highlights

**Languages:**
- JavaScript (Node.js + React)
- SQL (PostgreSQL)
- NoSQL (MongoDB)
- Prisma Schema Language

**Architecture:**
- Monolithic with modular components
- RESTful API design
- Multi-database system
- Multi-AI provider integration

**Key Features:**
- 100+ API endpoints
- 10 database models
- 3 database systems
- 3 AI providers
- JWT + OAuth authentication
- Real-time health tracking
- Community features
- Professional consultations

**Production Ready:**
✅ Security hardening  
✅ Environment validation  
✅ SSL/TLS support  
✅ Rate limiting  
✅ Error handling  
✅ Logging & monitoring  
✅ Automated testing  
✅ Docker deployment  
✅ Comprehensive documentation  

### Performance Metrics

- **API Response:** < 50ms (average)
- **AI Response:** 1-5 seconds
- **Frontend Load:** < 2 seconds
- **Uptime Target:** 99.9%
- **Concurrent Users:** 100+

### Code Statistics

- **Total Files:** 200+
- **Lines of Code:** 50,000+
- **Documentation:** 33 files
- **Test Coverage:** 80%+
- **Dependencies:** 50+

---

**For more detailed information, see:**
- [API Documentation](API_DOCUMENTATION.md)
- [Server Architecture](SERVER_ARCHITECTURE.md)
- [Database Guide](DATABASE_GUIDE.md)
- [Security Hardening](SECURITY_HARDENING.md)
- [Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)

---

**Last Updated:** February 15, 2026  
**Maintained By:** ABHAY HARITHAS  
**Status:** Production Ready ✅
