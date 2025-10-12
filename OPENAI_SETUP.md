# OpenAI API Integration Setup Guide

This guide will help you set up OpenAI API integration for your WellSense AI health platform.

## Prerequisites

1. **OpenAI Account**: Sign up at [https://platform.openai.com](https://platform.openai.com)
2. **API Key**: Generate an API key from your OpenAI dashboard
3. **Node.js**: Version 16 or higher
4. **MongoDB**: Local installation or MongoDB Atlas account

## Step 1: Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (you won't be able to see it again)
4. Store it securely

## Step 2: Environment Configuration

### Backend Configuration

1. Navigate to the `server` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your OpenAI API key:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_ORG_ID=your_organization_id_here

   # Database
   MONGODB_URI=mongodb://localhost:27017/wellsense-ai

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

### Frontend Configuration

1. In the root directory, create `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_OPENAI_API_KEY=demo-mode
   ```

## Step 3: Install Dependencies

### Backend Dependencies
```bash
cd server
npm install
```

### Frontend Dependencies
```bash
npm install
```

## Step 4: Start the Application

### Option 1: Start Both Frontend and Backend
```bash
npm run start:full
```

### Option 2: Start Separately

**Backend:**
```bash
cd server
npm run dev
```

**Frontend (in another terminal):**
```bash
npm run dev
```

## Step 5: Test the Integration

1. Open your browser to `http://localhost:3000`
2. Register a new account or login
3. Navigate to the AI Chat section
4. Send a message to test the OpenAI integration

## API Endpoints

The following endpoints are available for OpenAI integration:

### Chat Endpoints
- `POST /api/chat/start` - Start a new chat session
- `POST /api/chat/:sessionId/message` - Send a message
- `POST /api/chat/stream` - Stream chat responses
- `GET /api/chat/:sessionId` - Get chat history

### AI Analysis Endpoints
- `POST /api/chat/analyze-food` - Analyze food images
- `POST /api/chat/generate-plan` - Generate health plans
- `POST /api/chat/nutrition-advice` - Get nutrition advice
- `POST /api/chat/workout-plan` - Generate workout plans
- `POST /api/chat/analyze-trends` - Analyze health trends

### Health Check
- `GET /api/chat/health-check` - Check OpenAI service status

## Features Enabled

With OpenAI integration, you get:

### 1. **Intelligent Health Coaching**
- Personalized advice based on user data
- Context-aware conversations
- Evidence-based recommendations

### 2. **Food Analysis**
- Image recognition for meals
- Nutritional breakdown
- Health scoring and suggestions

### 3. **Personalized Plans**
- Custom nutrition plans
- Workout routines
- Health goal tracking

### 4. **Real-time Chat**
- Streaming responses
- Context retention
- Multi-session support

### 5. **Health Insights**
- Trend analysis
- Anomaly detection
- Predictive recommendations

## Usage Examples

### Basic Chat
```javascript
// Start a chat session
const response = await fetch('/api/chat/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionType: 'health_coaching'
  })
});

// Send a message
const messageResponse = await fetch(`/api/chat/${sessionId}/message`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'I want to lose weight, can you help me?',
    includeHealthData: true
  })
});
```

### Food Analysis
```javascript
const analysis = await fetch('/api/chat/analyze-food', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageUrl: 'data:image/jpeg;base64,...',
    prompt: 'Analyze this meal for nutritional content'
  })
});
```

## Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Check that `OPENAI_API_KEY` is set in your `.env` file
   - Ensure the key is valid and has sufficient credits

2. **"Rate limit exceeded" error**
   - You've hit OpenAI's rate limits
   - Wait a few minutes or upgrade your OpenAI plan

3. **"Model not found" error**
   - Check that you have access to GPT-4
   - Fallback to GPT-3.5-turbo if needed

4. **Connection errors**
   - Verify your internet connection
   - Check if OpenAI services are operational

### Demo Mode

If you don't have an OpenAI API key, the system will run in demo mode with simulated responses. To enable demo mode:

1. Set `OPENAI_API_KEY=demo-mode` in your environment
2. The system will use pre-programmed responses
3. All features will work but with simulated AI responses

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** to prevent abuse
4. **Monitor usage** to avoid unexpected charges
5. **Rotate keys regularly** for security

## Cost Management

- **Monitor usage** in your OpenAI dashboard
- **Set usage limits** to prevent overspending
- **Use GPT-3.5-turbo** for cost-effective responses
- **Implement caching** for repeated queries
- **Optimize prompts** to reduce token usage

## Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify your OpenAI API key and credits
3. Test the `/api/chat/health-check` endpoint
4. Review the OpenAI API documentation

## Next Steps

Once you have OpenAI integration working:

1. **Customize prompts** for your specific use case
2. **Add more AI features** like voice transcription
3. **Implement user feedback** to improve responses
4. **Add analytics** to track AI performance
5. **Scale up** with production-ready configurations

Happy coding! 🚀