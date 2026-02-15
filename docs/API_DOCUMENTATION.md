# WellSense AI - Complete API Documentation

## Base URL

**Development:**
```
http://localhost:3000/api/v1
```

**Production:**
```
https://yourdomain.com/api/v1
```

## Security

### HTTPS Requirement

**Production environments MUST use HTTPS.** All API requests over HTTP will be automatically redirected to HTTPS (301 redirect).

- **Development:** HTTP is allowed for localhost testing
- **Production:** HTTPS is enforced. HTTP requests on port 80 are redirected to HTTPS on port 443
- **SSL/TLS:** Production deployments require valid SSL certificates (Let's Encrypt recommended)

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

**Token Expiration:** JWT tokens expire after 7 days by default. Clients should handle 401 Unauthorized responses and prompt for re-authentication.

**Strong Secrets:** Production environments use cryptographically secure JWT secrets (minimum 64 characters, 256+ bits entropy). Never use placeholder or weak secrets like "your-secret-key" in production.

**Example Authentication Request:**
```bash
# Login to get JWT token
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}

# Use token in subsequent requests
curl -X GET https://api.yourdomain.com/api/v1/users/123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### CORS Policy

**Development:** Localhost origins are automatically allowed:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`

**Production:** Only whitelisted origins can make requests. The CORS policy is strictly enforced to prevent unauthorized cross-origin requests.

**Allowed Origins Configuration:**
Production origins must be explicitly configured in the `CORS_ORIGIN` environment variable:
```bash
CORS_ORIGIN=https://app.yourdomain.com,https://www.yourdomain.com
```

**CORS Requirements for API Clients:**
1. Your application domain must be added to the CORS whitelist
2. Requests must include proper `Origin` header
3. Credentials (cookies, authorization headers) are only allowed for whitelisted origins
4. Preflight OPTIONS requests are cached for 10 minutes

**Common CORS Error:**
```
Access to fetch at 'https://api.yourdomain.com' from origin 'https://yourapp.com' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Solution:** Contact your administrator to add your domain to the CORS whitelist.

**Wildcard Origins:** Wildcard (`*`) origins are NOT allowed in production for security reasons.

### Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Limit:** 100 requests per 15 minutes per IP address
- **Response:** 429 Too Many Requests
- **Scope:** Per IP address (not per user)

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Handling Rate Limits:**
```javascript
// Check rate limit headers
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

if (response.status === 429) {
  const resetTime = new Date(reset * 1000);
  console.log(`Rate limit exceeded. Resets at ${resetTime}`);
  // Implement exponential backoff or wait until reset
}
```

### Error Responses

Error responses vary by environment to balance debugging needs with security:

**Development Environment:**
Detailed error messages with stack traces for debugging:
```json
{
  "success": false,
  "error": "User not found",
  "stack": "Error: User not found\n    at UserService.findById (user-service.js:45:11)\n    ...",
  "details": {
    "userId": "123",
    "query": "SELECT * FROM users WHERE id = $1"
  }
}
```

**Production Environment:**
Sanitized error messages without sensitive information:
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions or CORS violation
- `404 Not Found` - Resource does not exist
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error (details hidden in production)

**Error Handling Best Practices:**
```javascript
try {
  const response = await fetch('https://api.yourdomain.com/api/v1/users/123', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      redirectToLogin();
    } else if (response.status === 403) {
      // CORS or permission error
      console.error('Access denied');
    } else if (response.status === 429) {
      // Rate limit - implement backoff
      await waitAndRetry();
    }
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Network error:', error);
}
```

### Security Best Practices

**For API Clients:**

1. **Always use HTTPS in production**
   - Never disable SSL certificate validation
   - Verify the certificate chain is valid
   - Use environment-specific API URLs (don't hardcode production URLs in development)

2. **Secure Token Storage**
   - For web apps: Use httpOnly cookies or secure session storage
   - Avoid localStorage for sensitive applications (vulnerable to XSS)
   - For mobile apps: Use secure keychain/keystore
   - Never log tokens or include them in error reports

3. **Token Lifecycle Management**
   - Implement token refresh logic before expiration
   - Handle 401 Unauthorized responses gracefully
   - Clear tokens on logout
   - Implement automatic logout on token expiration

4. **Request Security**
   - Always include proper `Content-Type` headers
   - Validate and sanitize all user input before sending
   - Use CORS-compliant requests (proper Origin headers)
   - Implement request timeouts to prevent hanging connections

5. **Error Handling**
   - Don't expose sensitive information in error messages
   - Log errors securely (server-side only)
   - Implement proper retry logic with exponential backoff
   - Handle network failures gracefully

6. **Rate Limiting Compliance**
   - Monitor rate limit headers
   - Implement client-side rate limiting
   - Use exponential backoff for retries
   - Cache responses when appropriate

**For API Developers:**

1. **Secret Management**
   - Use cryptographically secure secrets (minimum 64 characters for JWT)
   - Never commit secrets to version control
   - Rotate secrets regularly (JWT: every 90 days, DB passwords: every 180 days)
   - Use environment-specific secrets (never reuse development secrets in production)

2. **Input Validation**
   - Validate all input data (type, format, length, range)
   - Use parameterized queries to prevent SQL injection
   - Sanitize user input before processing
   - Implement request size limits

3. **Authentication & Authorization**
   - Verify JWT signatures on every request
   - Check token expiration
   - Implement proper role-based access control (RBAC)
   - Follow principle of least privilege

4. **Logging & Monitoring**
   - Never log sensitive data (passwords, tokens, credit cards)
   - Log security events (failed logins, unauthorized access attempts)
   - Monitor for suspicious patterns (brute force, unusual traffic)
   - Implement audit trails for sensitive operations

5. **Environment Configuration**
   - Use separate configuration files for each environment
   - Validate configuration at startup
   - Fail fast on invalid configuration in production
   - Use environment variables for sensitive settings

6. **Security Headers**
   - Implement proper CORS headers
   - Use security headers (HSTS, X-Content-Type-Options, etc.)
   - Set appropriate cache headers for sensitive data
   - Implement Content Security Policy (CSP)

**Security Checklist for Production Deployment:**
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong JWT secret configured (64+ characters)
- [ ] CORS whitelist configured (no wildcards)
- [ ] Rate limiting enabled
- [ ] Error responses sanitized (no stack traces)
- [ ] Database passwords meet complexity requirements (32+ characters)
- [ ] All secrets rotated from development values
- [ ] Security audit passed (`npm run security:audit`)
- [ ] Logging configured (no sensitive data logged)
- [ ] Monitoring and alerting configured

---

## 📊 Database Statistics

### Get Database Stats
```http
GET /api/v1/stats
```
Returns counts for all database tables.

### Health Check
```http
GET /api/v1/health
```
Checks database connectivity.

---

## 👤 User Management

### Create User
```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "passwordHash": "hashed_password",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "MALE",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "preferredUnits": "METRIC"
}
```

### Get User by ID
```http
GET /api/v1/users/:id?include=true
```
Query params:
- `include`: Include all relations (health records, goals, etc.)

### Get All Users
```http
GET /api/v1/users?skip=0&take=50
```

### Update User
```http
PUT /api/v1/users/:id
Content-Type: application/json

{
  "firstName": "Jane",
  "location": "New York",
  "bio": "Health enthusiast"
}
```

### Delete User
```http
DELETE /api/v1/users/:id
```

### Search Users
```http
GET /api/v1/users/search/:searchTerm
```

---

## 🏥 Health Records

### Create Health Record
```http
POST /api/v1/health-records
Content-Type: application/json

{
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 72,
  "temperature": 36.6,
  "oxygenSaturation": 98.5,
  "bloodSugar": 95.0,
  "bmi": 22.5,
  "mood": 8,
  "energyLevel": 7,
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "symptoms": ["headache"],
  "notes": "Feeling good today"
}
```

### Get Health Record by ID
```http
GET /api/v1/health-records/:id
```

### Get User's Health Records
```http
GET /api/v1/health-records/user/:userId?skip=0&take=50
```

### Update Health Record
```http
PUT /api/v1/health-records/:id
Content-Type: application/json

{
  "heartRate": 75,
  "notes": "Updated notes"
}
```

### Delete Health Record
```http
DELETE /api/v1/health-records/:id
```

### Get Health Records by Date Range
```http
GET /api/v1/health-records/user/:userId/range?startDate=2026-01-01&endDate=2026-02-09
```

---

## ⚖️ Weight Records

### Create Weight Record
```http
POST /api/v1/weight-records
Content-Type: application/json

{
  "weightKg": 70.5,
  "bodyFatPercentage": 18.5,
  "muscleMass": 55.2,
  "waterPercentage": 60.0,
  "notes": "Morning weight"
}
```

### Get Weight Record by ID
```http
GET /api/v1/weight-records/:id
```

### Get User's Weight Records
```http
GET /api/v1/weight-records/user/:userId?skip=0&take=50
```

### Update Weight Record
```http
PUT /api/v1/weight-records/:id
```

### Delete Weight Record
```http
DELETE /api/v1/weight-records/:id
```

### Get Weight Progress
```http
GET /api/v1/weight-records/user/:userId/progress?days=30
```

---

## 🏃 Exercise Records

### Create Exercise Record
```http
POST /api/v1/exercise-records
Content-Type: application/json

{
  "exerciseType": "RUNNING",
  "name": "Morning Run",
  "duration": 30,
  "caloriesBurned": 300,
  "distance": 5.0,
  "intensity": "MODERATE",
  "heartRateAvg": 140,
  "steps": 6500,
  "notes": "Great run!"
}
```

### Get Exercise Record by ID
```http
GET /api/v1/exercise-records/:id
```

### Get User's Exercise Records
```http
GET /api/v1/exercise-records/user/:userId?skip=0&take=50
```

### Update Exercise Record
```http
PUT /api/v1/exercise-records/:id
```

### Delete Exercise Record
```http
DELETE /api/v1/exercise-records/:id
```

### Get Exercise Statistics
```http
GET /api/v1/exercise-records/user/:userId/stats?days=30
```
Returns:
- Total workouts
- Total duration
- Total calories burned
- Total distance
- Average duration

---

## 🍎 Nutrition Records

### Create Nutrition Record
```http
POST /api/v1/nutrition-records
Content-Type: application/json

{
  "mealType": "BREAKFAST",
  "foodName": "Oatmeal with Berries",
  "servingSize": 1,
  "servingUnit": "bowl",
  "calories": 350,
  "protein": 12,
  "carbohydrates": 55,
  "fat": 8,
  "fiber": 10,
  "waterIntakeMl": 250
}
```

### Get Nutrition Record by ID
```http
GET /api/v1/nutrition-records/:id
```

### Get User's Nutrition Records
```http
GET /api/v1/nutrition-records/user/:userId?skip=0&take=50
```

### Update Nutrition Record
```http
PUT /api/v1/nutrition-records/:id
```

### Delete Nutrition Record
```http
DELETE /api/v1/nutrition-records/:id
```

### Get Daily Nutrition Summary
```http
GET /api/v1/nutrition-records/user/:userId/daily?date=2026-02-09
```
Returns:
- Total calories
- Total protein, carbs, fat, fiber
- Total water intake
- Meal count

---

## 🧠 Mental Health Records

### Create Mental Health Record
```http
POST /api/v1/mental-health-records
Content-Type: application/json

{
  "mood": 8,
  "anxiety": 3,
  "stress": 4,
  "depression": 2,
  "energy": 7,
  "focus": 8,
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "meditation": 20,
  "journaling": true,
  "symptoms": ["mild anxiety"],
  "triggers": ["work deadline"],
  "copingStrategies": ["meditation", "exercise"],
  "notes": "Overall good day"
}
```

### Get Mental Health Record by ID
```http
GET /api/v1/mental-health-records/:id
```

### Get User's Mental Health Records
```http
GET /api/v1/mental-health-records/user/:userId?skip=0&take=50
```

### Update Mental Health Record
```http
PUT /api/v1/mental-health-records/:id
```

### Delete Mental Health Record
```http
DELETE /api/v1/mental-health-records/:id
```

### Get Mental Health Trends
```http
GET /api/v1/mental-health-records/user/:userId/trends?days=30
```

---

## 🎯 Goals

### Create Goal
```http
POST /api/v1/goals
Content-Type: application/json

{
  "title": "Lose 5kg",
  "description": "Reach target weight by summer",
  "category": "WEIGHT_LOSS",
  "targetValue": 65,
  "targetUnit": "kg",
  "currentValue": 70,
  "targetDate": "2026-06-01T00:00:00Z",
  "priority": "HIGH"
}
```

### Get Goal by ID
```http
GET /api/v1/goals/:id
```

### Get User's Goals
```http
GET /api/v1/goals/user/:userId?status=ACTIVE
```
Status options: ACTIVE, COMPLETED, PAUSED, CANCELLED

### Update Goal
```http
PUT /api/v1/goals/:id
```

### Delete Goal
```http
DELETE /api/v1/goals/:id
```

### Update Goal Progress
```http
PATCH /api/v1/goals/:id/progress
Content-Type: application/json

{
  "currentValue": 68
}
```

### Complete Goal
```http
PATCH /api/v1/goals/:id/complete
```

---

## 💬 Chat Sessions

### Create Chat Session
```http
POST /api/v1/chat-sessions
Content-Type: application/json

{
  "title": "Nutrition Consultation",
  "sessionType": "NUTRITION",
  "aiProvider": "OPENAI",
  "model": "gpt-4",
  "messages": []
}
```

### Get Chat Session by ID
```http
GET /api/v1/chat-sessions/:id
```

### Get User's Chat Sessions
```http
GET /api/v1/chat-sessions/user/:userId?skip=0&take=50
```

### Update Chat Session
```http
PUT /api/v1/chat-sessions/:id
```

### Delete Chat Session
```http
DELETE /api/v1/chat-sessions/:id
```

### Add Message to Session
```http
POST /api/v1/chat-sessions/:id/messages
Content-Type: application/json

{
  "role": "user",
  "content": "What should I eat for breakfast?",
  "timestamp": "2026-02-09T10:00:00Z"
}
```

---

## 📝 Community Posts

### Create Community Post
```http
POST /api/v1/community-posts
Content-Type: application/json

{
  "title": "My Weight Loss Journey",
  "content": "Lost 10kg in 3 months!",
  "category": "SUCCESS_STORY",
  "tags": ["weight-loss", "motivation"],
  "images": ["https://example.com/image.jpg"]
}
```

### Get Community Post by ID
```http
GET /api/v1/community-posts/:id
```

### Get All Community Posts
```http
GET /api/v1/community-posts?skip=0&take=50&category=FITNESS
```

### Get User's Community Posts
```http
GET /api/v1/community-posts/user/:userId?skip=0&take=50
```

### Update Community Post
```http
PUT /api/v1/community-posts/:id
```

### Delete Community Post
```http
DELETE /api/v1/community-posts/:id
```

### Like Community Post
```http
POST /api/v1/community-posts/:id/like
```

### Search Community Posts
```http
GET /api/v1/community-posts/search/:searchTerm
```

---

## 🩺 Consultations

### Create Consultation
```http
POST /api/v1/consultations
Content-Type: application/json

{
  "type": "VIDEO_CALL",
  "specialization": "Nutritionist",
  "duration": 30,
  "scheduledAt": "2026-02-10T14:00:00Z",
  "professionalName": "Dr. Smith"
}
```

### Get Consultation by ID
```http
GET /api/v1/consultations/:id
```

### Get User's Consultations
```http
GET /api/v1/consultations/user/:userId?skip=0&take=50
```

### Update Consultation
```http
PUT /api/v1/consultations/:id
```

### Delete Consultation
```http
DELETE /api/v1/consultations/:id
```

### Start Consultation
```http
PATCH /api/v1/consultations/:id/start
```

### Complete Consultation
```http
PATCH /api/v1/consultations/:id/complete
Content-Type: application/json

{
  "notes": "Patient is doing well",
  "prescription": "Continue current diet plan"
}
```

### Get Upcoming Consultations
```http
GET /api/v1/consultations/user/:userId/upcoming
```

---

## 📋 Enums Reference

### Gender
- MALE
- FEMALE
- OTHER
- PREFER_NOT_TO_SAY

### UnitSystem
- METRIC
- IMPERIAL
- MIXED

### ProfileVisibility
- PUBLIC
- FRIENDS
- PRIVATE

### ExerciseType
- CARDIO
- STRENGTH
- FLEXIBILITY
- SPORTS
- YOGA
- PILATES
- WALKING
- RUNNING
- CYCLING
- SWIMMING
- OTHER

### ExerciseIntensity
- LOW
- MODERATE
- HIGH
- VERY_HIGH

### MealType
- BREAKFAST
- LUNCH
- DINNER
- SNACK
- DRINK

### GoalCategory
- WEIGHT_LOSS
- WEIGHT_GAIN
- FITNESS
- NUTRITION
- MENTAL_HEALTH
- SLEEP
- HYDRATION
- EXERCISE
- OTHER

### GoalStatus
- ACTIVE
- COMPLETED
- PAUSED
- CANCELLED

### Priority
- LOW
- MEDIUM
- HIGH
- URGENT

### ChatType
- GENERAL
- NUTRITION
- FITNESS
- MENTAL_HEALTH
- MEDICAL
- COACHING

### AIProvider
- OPENAI
- ANTHROPIC
- GOOGLE
- CUSTOM

### PostCategory
- GENERAL
- FITNESS
- NUTRITION
- MENTAL_HEALTH
- SUCCESS_STORY
- QUESTION
- TIP
- RECIPE

### ConsultationType
- VIDEO_CALL
- PHONE_CALL
- CHAT
- IN_PERSON

### ConsultationStatus
- SCHEDULED
- IN_PROGRESS
- COMPLETED
- CANCELLED
- NO_SHOW

---

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

---

## Pagination

List endpoints support pagination with `skip` and `take` query parameters:
- `skip`: Number of records to skip (default: 0)
- `take`: Number of records to return (default: 50, max: 100)

Example:
```http
GET /api/v1/users?skip=0&take=20
```
