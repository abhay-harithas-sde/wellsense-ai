# 🚀 WellSense AI - Windows Setup Guide

## Prerequisites

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (v18 or higher)
- Verify installation: `node --version` and `npm --version`

### 2. Install MongoDB
Choose one of these options:

#### Option A: MongoDB Community Server (Recommended)
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

#### Option B: MongoDB Atlas (Cloud)
1. Create free account at: https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Update `MONGODB_URI` in `server/.env`

#### Option C: Docker (If you have Docker Desktop)
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🛠️ Setup Steps

### 1. Install Dependencies
```powershell
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Go back to root
cd ..
```

### 2. Environment Configuration
The `.env` file has been created in `server/.env` with default values:

```env
MONGODB_URI=mongodb://localhost:27017/wellsense-ai
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
OPENAI_API_KEY=your-openai-api-key-here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Important**: Update the `JWT_SECRET` and `OPENAI_API_KEY` with your actual values.

### 3. Start MongoDB (if using local installation)
MongoDB should start automatically as a Windows service. If not:

```powershell
# Start MongoDB service
net start MongoDB

# Or if installed manually, navigate to MongoDB bin folder and run:
mongod --dbpath "C:\data\db"
```

### 4. Initialize Database
```powershell
# Navigate to server directory
cd server

# Initialize database with demo data
node scripts/initDatabase.js --seed --users=10
```

### 5. Start the Server
```powershell
# In server directory
npm start

# Or for development with auto-restart
npm run dev
```

### 6. Start Frontend (in another terminal)
```powershell
# Navigate to root directory
cd ..

# Start frontend
npm run dev
```

## 🧪 Testing the Setup

### 1. Test Server Health
```powershell
# Test basic health check
curl http://localhost:5000/api/health-check

# Test database health
curl http://localhost:5000/api/database/health

# View database statistics
curl http://localhost:5000/api/database/stats
```

### 2. Test Frontend
Open browser and go to: http://localhost:3000

## 🔧 Troubleshooting

### MongoDB Connection Issues
```powershell
# Check if MongoDB is running
tasklist /fi "imagename eq mongod.exe"

# Check MongoDB service status
sc query MongoDB

# Start MongoDB service if stopped
net start MongoDB
```

### Port Already in Use
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Node Modules Issues
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
npm install

# Do the same for server
cd server
rmdir /s node_modules
npm install
```

### Environment Variables Not Loading
Make sure the `.env` file is in the `server` directory (not root) and has no extra spaces or special characters.

## 📋 Quick Commands Reference

```powershell
# Install everything
npm run install:all

# Start both frontend and backend
npm run start:full

# Initialize database with demo data
cd server && node scripts/initDatabase.js --seed

# Reset database completely
cd server && node scripts/initDatabase.js --clear --seed

# Check server logs
cd server && npm start

# Check database connection
cd server && node -e "require('./utils/database').databaseManager.connect().then(() => console.log('✅ Connected')).catch(console.error)"
```

## 🎯 Expected Output

When everything is working correctly, you should see:

### Server Startup
```
🚀 WellSense AI Server running on port 5000
🌐 Environment: development
📊 Database: Connected and ready
🔗 API Base URL: http://localhost:5000/api
📋 Health Check: http://localhost:5000/api/health-check

📡 Available API Endpoints:
   🔐 Authentication: /api/auth
   💬 Chat: /api/chat
   🏥 Health: /api/health
   👥 Community: /api/community
   📁 Upload: /api/upload
   🗄️  Database: /api/database
```

### Database Health Check
```json
{
  "status": "healthy",
  "connected": true,
  "ping": true,
  "readyState": 1,
  "collections": {
    "users": { "documents": 10, "size": 12345, "indexes": 3 },
    "healthrecords": { "documents": 150, "size": 45678, "indexes": 2 }
  }
}
```

## 🆘 Still Having Issues?

1. **Check MongoDB Installation**:
   - Open MongoDB Compass (if installed) and try connecting to `mongodb://localhost:27017`
   - Or use command: `mongo` (for older versions) or `mongosh` (for newer versions)

2. **Check Node.js Version**:
   ```powershell
   node --version  # Should be v16 or higher
   npm --version   # Should be v8 or higher
   ```

3. **Check Firewall/Antivirus**:
   - Make sure ports 3000 and 5000 are not blocked
   - Temporarily disable antivirus to test

4. **Use Alternative Package Manager**:
   ```powershell
   # Try with yarn instead of npm
   npm install -g yarn
   yarn install
   ```

5. **Run as Administrator**:
   - Right-click PowerShell and "Run as Administrator"
   - Try the setup commands again

## 🎉 Success!

Once everything is running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: MongoDB running on port 27017

You should see the beautiful WellSense AI interface with all the enhanced UI components we created! 🌟