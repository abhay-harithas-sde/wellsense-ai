# 🏥 WellSense AI - Comprehensive Health & Wellness Platform

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Deployment-Ready-brightgreen.svg)](#deployment)

> **AI-driven health and wellness platform with video consultations, personalized health coaching, and comprehensive health tracking.**

## 🌟 Features

### 🤖 AI Health Assistant
- **Multi-Provider AI Integration**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Personalized Health Coaching**: Tailored advice based on user health data
- **Natural Language Processing**: Conversational health interactions
- **Context-Aware Responses**: Maintains conversation history and user preferences

### 🩺 Video Consultations
- **Real-time Video Calls**: WebRTC-based secure video consultations
- **Professional Booking System**: Search and book healthcare professionals by specialty
- **Appointment Management**: Schedule, reschedule, and cancel appointments
- **In-call Features**: Chat, screen sharing, recording capabilities
- **Professional Profiles**: Detailed provider information, reviews, and ratings

### 📊 Health Dashboard
- **Comprehensive Tracking**: Weight, nutrition, exercise, mental health, vitals
- **Analytics & Insights**: Visual charts and progress tracking
- **Goal Setting**: Personalized health goals with progress monitoring
- **Data Export**: Export health data in various formats

### 👥 Community Features
- **Social Health Network**: Share achievements and connect with others
- **Discussion Forums**: Health-focused community discussions
- **Achievement System**: Gamified health milestones and badges
- **Peer Support**: Connect with users with similar health goals

### 🥗 Nutritionist Tools
- **Professional Dashboard**: Tools for nutrition professionals
- **Client Management**: Track multiple clients and their progress
- **Meal Planning**: AI-assisted meal plan generation
- **Nutrition Analysis**: Detailed nutritional breakdowns and recommendations

## 🚀 Quick Start

### One-Command Deployment
```bash
git clone https://github.com/aruwellpreneurs/wellsense-ai.git
cd wellsense-ai
npm install
npm run deploy
```

### Development Mode
```bash
npm run start:dev
```

### System Check
```bash
npm run final:check
```

## 📋 Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: Version 8 or higher
- **Database** (optional): MongoDB, MySQL, or PostgreSQL
  - If no database is configured, the system will use mock data

## 🔧 Configuration

### Environment Setup
Create `.env` files in root and `server/` directories:

#### Root `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Server `.env`
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (choose one)
PRIMARY_DATABASE=mongodb
MONGODB_URI=mongodb://localhost:27017/wellsense-ai

# AI Provider Keys (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Security
JWT_SECRET=your_jwt_secret_key_here
```

## 🗄️ Database Support

### Supported Databases
- **MongoDB** (recommended)
- **MySQL**
- **PostgreSQL**
- **SQLite** (development)

### Database Commands
```bash
# Complete database setup
npm run db:setup

# Run migrations
npm run db:migrate

# Check status
npm run db:status

# Seed sample data
npm run db:seed

# Health check
npm run db:health
```

## 📡 API Endpoints

### Core Services
- **Health Check**: `GET /api/health-check`
- **Authentication**: `POST /api/auth/login`
- **Chat**: `POST /api/chat/message`
- **Health Records**: `GET /api/health/records`

### Video Consultations
- **Professionals**: `GET /api/professionals`
- **Book Consultation**: `POST /api/consultations/book`
- **Join Video Call**: `GET /api/consultations/{id}`

### Community
- **Posts**: `GET /api/community/posts`
- **Create Post**: `POST /api/community/posts`
- **User Interactions**: `POST /api/community/like`

## 🎯 Available Scripts

### Deployment
```bash
npm run deploy          # Full production deployment
npm run start:dev       # Development mode
npm run build          # Build frontend only
```

### Database Management
```bash
npm run db:setup       # Complete database setup
npm run db:migrate     # Run migrations
npm run db:seed        # Seed sample data
npm run db:reset       # Reset database (WARNING: deletes data)
npm run db:status      # Database status
npm run db:health      # Database health check
```

### System Checks
```bash
npm run system:check   # System requirements check
npm run final:check    # Comprehensive deployment check
npm run health-check   # Service health check
```

## 🌐 Access Points

After deployment, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health-check

### Main Features
- **Health Dashboard**: `/dashboard`
- **AI Chat**: `/chat`
- **Video Consultations**: `/consultation`
- **Community**: `/community`
- **Nutritionist Tools**: `/nutritionist`

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18**: Modern React with hooks and context
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Data visualization and charts

### Backend (Node.js + Express)
- **Express.js**: Web application framework
- **Socket.IO**: Real-time communication
- **JWT**: Authentication and authorization
- **Helmet**: Security middleware
- **Rate Limiting**: API protection

### Database Layer
- **Multi-database Support**: MongoDB, MySQL, PostgreSQL
- **Migration System**: Version-controlled schema changes
- **Connection Pooling**: Optimized database connections
- **Data Seeding**: Sample data generation

### AI Integration
- **OpenAI GPT-4**: Advanced language model
- **Anthropic Claude**: Constitutional AI
- **Google Gemini**: Multimodal AI capabilities
- **Fallback System**: Graceful degradation

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection

### Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure headers with Helmet

### Video Call Security
- Encrypted WebRTC connections
- Session token validation
- Room access control
- Recording permissions

## 📊 Performance Features

### Optimization
- Frontend build optimization
- Database connection pooling
- API response caching
- Image optimization
- Code splitting

### Monitoring
- Real-time health checks
- Performance metrics
- Error logging
- Database performance tracking

## 🧪 Testing

### Automated Tests
```bash
npm run test           # Run all tests
npm run test:frontend  # Frontend tests
npm run test:backend   # Backend tests
npm run db:test        # Database tests
```

### Manual Testing
- System health checks
- API endpoint testing
- Database connectivity
- Video call functionality

## 📚 Documentation

### Guides
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)**: Complete deployment instructions
- **[Database Migration Guide](DATABASE_MIGRATION_GUIDE.md)**: Database management
- **[LLM Integration Guide](LLM_INTEGRATION_GUIDE.md)**: AI provider setup
- **[Database Integration Guide](DATABASE_INTEGRATION_GUIDE.md)**: Database configuration

### API Documentation
- Swagger/OpenAPI documentation (when implemented)
- Endpoint reference guides
- Authentication examples

## 🛠️ Development

### Local Development
```bash
# Clone repository
git clone https://github.com/aruwellpreneurs/wellsense-ai.git
cd wellsense-ai

# Install dependencies
npm install
cd server && npm install && cd ..

# Start development servers
npm run start:dev
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and checks
5. Submit a pull request

## 🚀 Deployment Options

### Local Deployment
```bash
npm run deploy
```

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment
- **Vercel**: Frontend deployment
- **Railway/Heroku**: Backend deployment
- **MongoDB Atlas**: Database hosting
- **AWS/GCP**: Full stack deployment

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
npx kill-port 3000 5000
```

#### Database Connection Failed
- Check database is running
- Verify credentials in `.env`
- Ensure database exists

#### Dependencies Issues
```bash
rm -rf node_modules server/node_modules
npm install
cd server && npm install
```

### Debug Mode
```bash
DEBUG=* npm run start:dev
```

## 📈 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Telemedicine integrations
- [ ] Wearable device sync
- [ ] Advanced AI diagnostics
- [ ] Multi-language support
- [ ] Insurance integration

### Technical Improvements
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Advanced caching
- [ ] Load balancing
- [ ] Automated testing
- [ ] CI/CD pipeline

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork and clone the repository
2. Install dependencies
3. Set up environment variables
4. Run the development server
5. Make your changes
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**ARUWELL PRENEURS**
- Email: contact@aruwellpreneurs.com
- Website: https://aruwellpreneurs.com

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- Google for Gemini API
- React and Node.js communities
- All contributors and testers

## 📞 Support

- **Documentation**: Check the guides in the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Email**: contact@aruwellpreneurs.com
- **Community**: Join our Discord server

---

**WellSense AI** - Empowering healthier lives through AI-driven technology.

[![Built with ❤️](https://img.shields.io/badge/Built%20with-❤️-red.svg)](https://github.com/aruwellpreneurs/wellsense-ai)