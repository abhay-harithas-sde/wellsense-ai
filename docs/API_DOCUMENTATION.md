# WellSense AI - Complete API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

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
