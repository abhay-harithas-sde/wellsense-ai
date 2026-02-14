# WellSense AI - Intelligent Health & Wellness Platform

![WellSense AI Logo](./LOGO/L1.png)

## 🌟 Overview

WellSense AI is a comprehensive health and wellness platform that combines artificial intelligence with personalized health tracking to help users achieve their fitness and wellness goals. The platform provides AI-powered nutrition advice, personalized fitness plans, mental wellness tracking, and a supportive community environment.

## ✨ Key Features

- **AI Health Assistant**: Intelligent chatbot powered by OpenAI for personalized health advice
- **Health Metrics Tracking**: Monitor weight, vitals, exercise, and body composition
- **Personalized Nutrition Plans**: AI-generated meal plans tailored to your goals
- **Fitness Planning**: Custom workout routines based on fitness level and objectives
- **Mental Wellness Tracking**: Mood, stress, and sleep quality monitoring
- **Video Consultations**: Connect with health professionals remotely
- **Community Features**: Share progress, get support, and stay motivated
- **Real-time Analytics**: Visualize your health journey with interactive charts

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM

### Databases
- **PostgreSQL** - Primary relational database (user data, health records)
- **MongoDB** - Document store (fitness plans, community posts)
- **Redis** - Caching and session management

### Authentication & Services
- **Firebase Auth** - User authentication (Google OAuth)
- **OpenAI API** - AI-powered health assistant
- **WebRTC** - Video consultation capabilities

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** (optional)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/abhay-harithas-sde/wellsense-ai.git
cd wellsense-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database
DATABASE_URL="postgresql://postgres:Abhay%231709@localhost:5432/wellsense_ai"

# MongoDB
MONGODB_URI="mongodb://admin:Abhay%231709@localhost:27017/wellsense_ai?authSource=admin"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key_here"

# Firebase Configuration
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL="your_client_email"

# Session Secret
SESSION_SECRET="your_secure_random_string_here"

# CORS Origin
CORS_ORIGIN="http://localhost:3000"
```

### 4. Start Docker Services

```bash
cd docker
docker-compose up -d
```

Wait 30-60 seconds for services to initialize.

### 5. Initialize Database

```bash
# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# (Optional) Populate demo data
node scripts/populate-data.js
```

### 6. Start the Application

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The application will be available at **http://localhost:3000**

## 📖 Usage

### First Time Setup

1. Open http://localhost:3000 in your browser
2. Click "Sign in with Google" to create an account
3. Complete your profile with health information
4. Start tracking your health metrics!

### Key Workflows

**Track Health Metrics**
- Navigate to Dashboard → Health Metrics
- Log weight, vitals, or exercise data
- View trends and progress charts

**Get AI Nutrition Advice**
- Open the AI Health Assistant chat
- Ask questions about nutrition, fitness, or wellness
- Receive personalized recommendations

**Create Fitness Plans**
- Go to Fitness Plans section
- Generate AI-powered workout routines
- Track your exercise progress

**Join the Community**
- Visit Community section
- Share your progress and success stories
- Engage with other users' posts

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- scripts/__tests__/validate-health-metrics.test.js

# Run with coverage
npm test -- --coverage
```

## 📊 Database Management

### PostgreSQL (pgAdmin)
- URL: http://localhost:5050
- Email: admin@wellsense.ai
- Password: Abhay#1709

### MongoDB (Mongo Express)
- URL: http://localhost:8081
- Username: admin
- Password: Abhay#1709

## 🔧 Development

### Project Structure

```
wellsense-ai/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   └── App.jsx            # Main app component
├── lib/                   # Backend utilities
│   ├── ai.js             # OpenAI integration
│   ├── auth.js           # Authentication logic
│   ├── database.js       # Database connections
│   └── firebase.js       # Firebase setup
├── routes/               # Express API routes
├── middleware/           # Express middleware
├── prisma/              # Database schema and migrations
├── scripts/             # Utility scripts
├── docker/              # Docker configuration
└── public/              # Static assets
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npx prisma studio` - Open Prisma database GUI
- `node scripts/populate-data.js` - Generate demo data

## 🐳 Docker Services

The application uses Docker Compose to manage multiple services:

- **PostgreSQL** (Port 5432) - Primary database
- **MongoDB** (Port 27017) - Document store
- **Redis** (Port 6379) - Cache
- **pgAdmin** (Port 5050) - PostgreSQL GUI
- **Mongo Express** (Port 8081) - MongoDB GUI

To manage services:

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Stop all services
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Restart a specific service
docker-compose -f docker/docker-compose.yml restart postgres
```

## 🔐 Security

- All sensitive data is stored in environment variables
- Passwords are hashed using bcrypt
- Firebase handles authentication securely
- API keys are never exposed to the client
- CORS is configured to allow only trusted origins
- Input validation on all user inputs

## 🤝 Team

**Team GOD (Ghar O Dev)**

- **Abhay Harithas** - Lead Developer (Backend, AI Integration, DevOps)
- **Yokesh** - Support Developer (Frontend, UI/UX, Testing)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT API
- Firebase for authentication services
- The open-source community for amazing tools and libraries

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: support@wellsense.ai
- Documentation: [docs/](./docs/)

## 🚀 Deployment

For production deployment instructions, see [PRODUCTION_DEPLOYMENT_GUIDE.md](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md)

---

**Built with ❤️ for Demo Day 2026**
