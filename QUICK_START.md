# 🚀 WellSense AI - Quick Start Guide

Get WellSense AI running in under 5 minutes with multiple deployment options!

## ⚡ Instant Demo (0 Setup Required)

**Perfect for**: Testing, presentations, quick demos

```bash
# Just double-click this file:
start-frontend.bat
```

✅ **What you get:**
- Full UI with all features visible
- Mock data for realistic experience
- AI chat with simulated responses
- No backend or database needed
- Works offline

🌐 **Access at**: http://localhost:3000

---

## 🔧 Full Stack (Complete Experience)

**Perfect for**: Development, full feature testing

```bash
# Double-click this file:
start-full-stack.bat
```

✅ **What you get:**
- Complete frontend + backend
- Real database storage
- Actual AI integration (if configured)
- File upload capabilities
- Real-time features

🌐 **Access at**: 
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🏗️ Production Build

**Perfect for**: Deployment, performance testing

```bash
# Double-click this file:
build-production.bat
```

✅ **What you get:**
- Optimized production build
- Minified and compressed assets
- Ready for deployment
- Performance optimized

---

## 📋 Prerequisites Check

### Required (All Options)
- ✅ **Node.js 16+** - [Download here](https://nodejs.org/)
- ✅ **Windows OS** - Scripts are Windows-optimized

### Optional (Enhanced Features)
- 🔧 **MongoDB** - For data persistence ([Download](https://www.mongodb.com/try/download/community))
- 🤖 **OpenAI API Key** - For real AI features ([Get key](https://platform.openai.com/api-keys))

---

## 🎯 Choose Your Path

### 👨‍💻 I'm a Developer
```bash
# Get the full development experience
start-full-stack.bat
```

### 🎨 I'm a Designer/PM
```bash
# See the UI and features quickly
start-frontend.bat
```

### 🚀 I'm Deploying
```bash
# Build for production
build-production.bat
```

### 🧪 I'm Testing
```bash
# Start with demo data
start-frontend.bat
```

---

## 🔧 Configuration (Optional)

### Basic Setup
1. Copy `.env.example` to `.env`
2. Edit with your preferences
3. Run your chosen start script

### Advanced Setup
```env
# Add to .env for enhanced features
OPENAI_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017/wellsense-ai
```

---

## 🆘 Troubleshooting

### ❌ "Node.js not found"
**Solution**: Install Node.js from https://nodejs.org/

### ❌ "Port already in use"
**Solution**: Close other applications using ports 3000/5000

### ❌ "Dependencies failed to install"
**Solution**: 
```bash
# Clear cache and retry
npm cache clean --force
# Then run your start script again
```

### ❌ "Backend connection failed"
**Solution**: This is normal! Frontend works with mock data

---

## 🎉 Success Indicators

### Frontend Started Successfully
```
✅ Local:   http://localhost:3000/
✅ Network: http://192.168.x.x:3000/
```

### Backend Started Successfully
```
✅ Server running on port 5000
✅ Database: Connected
✅ API: http://localhost:5000/api
```

---

## 🌟 What to Expect

### Demo Mode Features
- 👤 **User Authentication** - Login with demo credentials
- 📊 **Health Dashboard** - View sample health metrics
- 🤖 **AI Chat** - Interact with simulated AI coach
- 📈 **Analytics** - See mock progress charts
- 👥 **Community** - Browse sample community posts
- 📱 **Responsive Design** - Test on different screen sizes

### Full Stack Features
- 💾 **Data Persistence** - Your data is saved
- 🔄 **Real-time Updates** - Live notifications and updates
- 📁 **File Uploads** - Upload health reports and images
- 🤖 **Real AI** - Actual OpenAI integration (if configured)
- 🔐 **Secure Auth** - Real user accounts and sessions

---

## 📞 Need Help?

1. **Check the logs** - Look at the terminal output for errors
2. **Try demo mode first** - Use `start-frontend.bat` to test
3. **Review prerequisites** - Ensure Node.js is installed
4. **Check the full guide** - See `DEPLOYMENT_GUIDE.md` for details

---

## 🎯 Next Steps

After getting started:

1. **Explore the features** - Click around and test everything
2. **Check the code** - Look at the source code structure
3. **Customize** - Modify colors, content, or features
4. **Deploy** - Use the production build for deployment
5. **Integrate** - Add your own APIs and services

---

**🎉 Welcome to WellSense AI! Your health journey starts here.**