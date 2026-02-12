# Setup Remaining API Keys

## ✅ Already Configured

- ✅ **Firebase** - All 3 keys configured from your service account file
- ✅ **Databases** - PostgreSQL, MongoDB, Redis all working
- ✅ **JWT Secret** - Configured (change for production)

---

## ⚠️ Still Need Setup (2 services)

### 1. OpenAI API Key (Required for AI Features)

**Why you need it:** For AI chat, nutrition advice, health recommendations

**How to get it:**

1. **Go to OpenAI Platform:**
   - Visit: https://platform.openai.com/api-keys
   - Sign in with your account (or create one)

2. **Create API Key:**
   - Click "Create new secret key"
   - Give it a name like "WellSense AI Development"
   - Copy the key (starts with `sk-...`)
   - ⚠️ Save it immediately - you won't see it again!

3. **Add to .env file:**
   ```bash
   # Open .env file
   notepad .env
   
   # Replace this line:
   OPENAI_API_KEY=your-openai-api-key
   
   # With your actual key:
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

4. **Restart your server:**
   ```bash
   npm start
   ```

**Cost:** 
- Free tier: $5 credit for new accounts
- Pay-as-you-go: ~$0.002 per 1K tokens (very cheap)
- Your current config uses `gpt-4o-mini` (most cost-effective)

---

### 2. Google OAuth (Required for Google Sign-In)

**Why you need it:** To allow users to sign in with Google

**How to get it:**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create/Select Project:**
   - Click project dropdown at top
   - Create new project: "WellSense AI"
   - Or select existing project

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: WellSense AI
     - User support email: your email
     - Developer contact: your email
   - Application type: "Web application"
   - Name: "WellSense AI Web Client"
   
5. **Add Authorized Redirect URIs:**
   ```
   http://localhost:3000/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```

6. **Copy Credentials:**
   - You'll see Client ID and Client Secret
   - Copy both values

7. **Add to .env file:**
   ```bash
   # Replace these lines:
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # With your actual values:
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
   ```

8. **Restart your server:**
   ```bash
   npm start
   ```

**Cost:** Free!

---

## 🎯 Quick Setup Checklist

### OpenAI Setup
- [ ] Go to https://platform.openai.com/api-keys
- [ ] Create new API key
- [ ] Copy key (starts with `sk-`)
- [ ] Update `.env` file with `OPENAI_API_KEY=sk-...`
- [ ] Restart server

### Google OAuth Setup
- [ ] Go to https://console.cloud.google.com/
- [ ] Create/select project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Client ID
- [ ] Add redirect URIs
- [ ] Copy Client ID and Secret
- [ ] Update `.env` file
- [ ] Restart server

---

## 🧪 Testing After Setup

### Test OpenAI Integration

1. **Start server:**
   ```bash
   npm start
   ```

2. **Check logs for:**
   ```
   ✅ OpenAI API configured
   ```

3. **Test AI endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, how are you?"}'
   ```

### Test Google OAuth

1. **Start server:**
   ```bash
   npm start
   ```

2. **Open browser:**
   ```
   http://localhost:3000
   ```

3. **Click "Sign in with Google" button**

4. **Should redirect to Google login**

---

## 📝 Your Current .env Status

```env
# ✅ CONFIGURED
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...
REDIS_URL=redis://...
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FIREBASE_PROJECT_ID=wellsense-ai-f06cf
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@...

# ⚠️ NEEDS YOUR INPUT
OPENAI_API_KEY=your-openai-api-key  # ← Get from OpenAI
GOOGLE_CLIENT_ID=your-google-client-id  # ← Get from Google Cloud
GOOGLE_CLIENT_SECRET=your-google-client-secret  # ← Get from Google Cloud

# ✅ OPTIONAL (Can skip for now)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

---

## 🔒 Security Notes

### After Getting Keys:

1. **Never commit .env to Git:**
   ```bash
   # Check .gitignore includes:
   .env
   .env.local
   .env.*.local
   ```

2. **Use different keys for production:**
   - Development: Use test/development keys
   - Production: Use separate production keys

3. **Set spending limits:**
   - OpenAI: Set monthly budget in dashboard
   - Google: Free but monitor usage

4. **Rotate keys regularly:**
   - Change keys every 3-6 months
   - Immediately if compromised

---

## 💡 Pro Tips

### OpenAI Tips:
- Start with `gpt-4o-mini` (cheapest, fast)
- Monitor usage in OpenAI dashboard
- Set up usage alerts
- Use caching to reduce costs

### Google OAuth Tips:
- Add multiple redirect URIs for different environments
- Test with test users first
- Configure OAuth consent screen properly
- Add privacy policy URL (can be placeholder for dev)

---

## 🆘 Troubleshooting

### OpenAI Issues

**Error: "Invalid API key"**
- Check key starts with `sk-`
- No extra spaces in .env
- Key is active in OpenAI dashboard

**Error: "Rate limit exceeded"**
- You've hit free tier limit
- Add payment method in OpenAI
- Or wait for limit reset

### Google OAuth Issues

**Error: "Redirect URI mismatch"**
- Check redirect URI exactly matches
- Include http:// or https://
- No trailing slashes

**Error: "Access blocked"**
- Add your email as test user
- Configure OAuth consent screen
- Check app is not in production mode

---

## 📞 Need Help?

### Resources:
- **OpenAI Docs:** https://platform.openai.com/docs
- **Google OAuth Docs:** https://developers.google.com/identity/protocols/oauth2
- **Your Firebase Setup:** `firebase/FIREBASE_SETUP.md`
- **API Keys Status:** `API_KEYS_STATUS.md`

### Quick Commands:
```bash
# Check current .env
cat .env

# Test server startup
npm start

# Check health endpoint
curl http://localhost:3000/api/health

# View logs
npm start | grep -i "api\|error\|configured"
```

---

## ✅ Summary

**What's Done:**
- ✅ Firebase fully configured (3/3 keys)
- ✅ Databases working (3/3)
- ✅ JWT configured

**What You Need:**
- ⚠️ OpenAI API key (5 minutes to get)
- ⚠️ Google OAuth credentials (10 minutes to get)

**Total Time:** ~15 minutes to complete setup

**After Setup:**
- 🤖 AI chat will work
- 🔐 Google sign-in will work
- 🚀 Full app functionality

---

**Ready to get started? Follow the steps above for OpenAI and Google OAuth!**
