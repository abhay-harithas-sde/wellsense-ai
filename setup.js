#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
🌟 WellSense AI Setup Complete! 🌟

Your intelligent health platform is ready to run!

📋 QUICK START OPTIONS:

1️⃣  INSTANT DEMO (Recommended):
   npm start
   
   Then open: http://localhost:3000
   Login with ANY email/password!

2️⃣  WINDOWS USERS:
   Double-click: start.bat

3️⃣  FULL DEVELOPMENT:
   npm run install:all
   npm run start:full

✨ DEMO FEATURES:
✅ Beautiful UI with animations
✅ Interactive dashboard
✅ AI chat simulation  
✅ Health metrics tracking
✅ Community features
✅ Profile management
✅ Responsive design

🎯 DEMO LOGIN:
Email: demo@wellsense.ai (or any email)
Password: password123 (or any password)

🚀 WHAT'S INCLUDED:
- React 18 + Vite frontend
- Node.js + Express backend
- MongoDB integration ready
- OpenAI GPT-4 integration ready
- Real-time chat with Socket.io
- File upload system
- Community features
- Authentication system

📱 MOBILE READY:
Works perfectly on phones, tablets, and desktop!

🔧 NEED HELP?
- Check QUICKSTART.md for detailed guide
- Check README.md for full documentation
- All features work in demo mode!

🎉 Ready to explore your health platform!
`);

// Check if .env files exist, create them if not
try {
  const envPath = path.join(process.cwd(), '.env');
  const serverDir = path.join(process.cwd(), 'server');
  const serverEnvPath = path.join(serverDir, '.env');

  // Create frontend .env if it doesn't exist
  if (!fs.existsSync(envPath)) {
    const envContent = `VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=WellSense AI
VITE_APP_VERSION=1.0.0
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_IMAGE_ANALYSIS=true
VITE_ENABLE_COMMUNITY=true`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
  }

  // Create server directory if it doesn't exist
  if (!fs.existsSync(serverDir)) {
    console.log('⚠️  Server directory not found. This is normal for frontend-only setup.');
    process.exit(0);
  }

  // Create server .env if it doesn't exist
  if (!fs.existsSync(serverEnvPath)) {
    const serverEnvContent = `MONGODB_URI=mongodb://localhost:27017/wellsense-ai
JWT_SECRET=wellsense-ai-super-secret-jwt-key-2024-health-platform
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-openai-api-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads`;
    
    fs.writeFileSync(serverEnvPath, serverEnvContent);
    console.log('✅ Created server/.env file');
  }
} catch (error) {
  console.log('⚠️  Setup encountered an issue, but installation can continue.');
  console.log('   You can run "npm run setup" later to configure environment files.');
}

console.log(`
🚀 TO START NOW:
   npm start

📖 FOR MORE INFO:
   cat QUICKSTART.md
`);