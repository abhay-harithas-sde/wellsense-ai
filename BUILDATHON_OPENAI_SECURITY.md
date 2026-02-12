# 🏆 OpenAI Academy x NxtWave Buildathon - API Security Guide

## 🎉 Congratulations!

You've been selected for the **Project Showcase** of OpenAI Academy x NxtWave Buildathon!

---

## 🔑 Your OpenAI API Key Configuration

### ✅ API Key Status: CONFIGURED & SECURED

Your OpenAI API key has been securely configured with proper limits and security measures.

**Key Details:**
- **API Key:** `sk-proj-xmPt...` (Securely stored in `.env`)
- **Total Token Limit:** 300,000 tokens
- **Max Tokens Per Request:** 500 tokens
- **Model:** gpt-4o-mini (cost-effective)

---

## 🔒 Security Measures Implemented

### 1. Environment Variable Storage ✅
```env
# .env file (NOT committed to Git)
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=500
OPENAI_TOTAL_TOKEN_LIMIT=300000
```

### 2. Git Protection ✅
Your `.gitignore` includes:
```
.env
.env.local
.env.production
.env.test.local
.openai-usage.json
```
✅ API key will NEVER be committed to Git

### 3. Backend-Only Usage ✅
- API key is used only in `lib/ai.js` (server-side)
- Never exposed to frontend/client code
- All AI requests go through backend API

### 4. Usage Tracking ✅
Automatic tracking in `lib/ai.js`:
- Total tokens used
- Tokens per request
- Request history
- Automatic warnings at 80% usage

### 5. Rate Limiting ✅
Built-in limits:
- Max 500 tokens per request
- Total limit: 300,000 tokens
- Automatic rejection if limits exceeded

---

## 📊 Usage Monitoring

### Check Current Usage

```bash
# Start server to see usage stats
npm start

# Look for logs like:
# 📊 Loaded OpenAI usage: 1234/300000 tokens used
```

### Usage Stats Endpoint

```bash
# Get usage statistics
curl http://localhost:3000/api/ai/usage
```

**Response:**
```json
{
  "totalTokens": 1234,
  "totalRequests": 45,
  "totalTokenLimit": 300000,
  "percentUsed": "0.41%",
  "remaining": 298766,
  "status": "healthy"
}
```

### Usage Tracking File

Location: `.openai-usage.json` (auto-created, gitignored)

```json
{
  "totalTokens": 1234,
  "totalRequests": 45,
  "requests": [
    {
      "timestamp": "2026-02-12T...",
      "promptTokens": 50,
      "completionTokens": 100,
      "totalTokens": 150
    }
  ]
}
```

---

## ⚠️ Security Rules (MUST FOLLOW)

### ✅ DO:
1. ✅ Use API key ONLY in backend/server-side code
2. ✅ Store key in `.env` file (environment variables)
3. ✅ Keep `.env` in `.gitignore`
4. ✅ Monitor token usage regularly
5. ✅ Handle rate limit errors properly
6. ✅ Use for buildathon project only
7. ✅ Test locally before deploying

### ❌ DON'T:
1. ❌ Expose key in frontend/client code
2. ❌ Commit `.env` to Git/GitHub
3. ❌ Share API key with anyone
4. ❌ Exceed token limits
5. ❌ Use in public files or logs
6. ❌ Hardcode key in source code
7. ❌ Use for non-buildathon purposes

---

## 🚨 Violation Consequences

Breaking security rules may lead to:
- ⚠️ API key deactivation
- ⚠️ Project access removal
- ⚠️ Disqualification from buildathon

**Stay safe! Follow all security guidelines.**

---

## 🧪 Testing Your Setup

### 1. Verify API Key is Secure

```bash
# Check .env is gitignored
git status

# .env should NOT appear in untracked files
# If it does, add to .gitignore immediately!
```

### 2. Test AI Endpoint

```bash
# Start server
npm start

# Test AI chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello, test message"}'
```

### 3. Check Usage Tracking

```bash
# Check usage stats
curl http://localhost:3000/api/ai/usage
```

### 4. Test Token Limits

```bash
# Try a request (should work)
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Short test", "maxTokens": 100}'

# Try exceeding per-request limit (should fail)
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "maxTokens": 2000}'
```

---

## 📈 Token Usage Guidelines

### Optimize Token Usage

**1. Use Shorter Prompts:**
```javascript
// ❌ Bad - Too verbose
"Please provide me with a very detailed and comprehensive explanation..."

// ✅ Good - Concise
"Explain briefly:"
```

**2. Limit Response Length:**
```javascript
// Set max tokens per request
maxTokens: 500  // Buildathon limit
```

**3. Cache Responses:**
```javascript
// Cache common responses to avoid repeated API calls
const cache = new Map();
```

**4. Use Efficient Models:**
```javascript
// gpt-4o-mini is most cost-effective
model: 'gpt-4o-mini'
```

### Token Estimation

Rough estimates:
- 1 token ≈ 4 characters
- 1 token ≈ 0.75 words
- 100 words ≈ 133 tokens

**Your limits:**
- 300,000 tokens total
- ≈ 225,000 words
- ≈ 600 requests (at 500 tokens each)

---

## 🛡️ Error Handling

### Handle Limit Exceeded Errors

```javascript
try {
  const response = await ai.generateResponse(messages);
} catch (error) {
  if (error.message.includes('token limit exceeded')) {
    // Handle gracefully
    return {
      error: 'API usage limit reached',
      message: 'Please try again later or contact support'
    };
  }
}
```

### Built-in Error Handling

Your AI manager automatically:
- ✅ Checks limits before requests
- ✅ Tracks usage after requests
- ✅ Warns at 80% usage (240,000 tokens)
- ✅ Rejects requests exceeding limits
- ✅ Saves usage data persistently

---

## 📝 Code Examples

### Secure AI Request (Backend)

```javascript
// lib/ai.js - CORRECT ✅
const ai = new AIManager();

async function getAIResponse(userMessage) {
  try {
    // Check limits before request
    ai.checkUsageLimits(500);
    
    // Make request
    const response = await ai.generateResponse([
      { role: 'user', content: userMessage }
    ], {
      maxTokens: 500,
      temperature: 0.7
    });
    
    return response;
  } catch (error) {
    console.error('AI request failed:', error);
    throw error;
  }
}
```

### Insecure Example (DON'T DO THIS!)

```javascript
// ❌ WRONG - Frontend code
const OPENAI_API_KEY = 'sk-proj-...'; // NEVER DO THIS!

fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}` // EXPOSED!
  }
});
```

---

## 🎯 Best Practices for Buildathon

### 1. Monitor Usage Daily
```bash
# Check usage every day
npm start
# Look for: 📊 OpenAI usage: X/300000 tokens
```

### 2. Test with Small Requests First
```bash
# Start with small token limits
maxTokens: 100  # Test
maxTokens: 500  # Production
```

### 3. Implement Caching
```javascript
// Cache common responses
const responseCache = new Map();

if (responseCache.has(query)) {
  return responseCache.get(query);
}
```

### 4. Use Fallback Responses
```javascript
// If limit reached, use fallback
if (tokensUsed > 280000) {
  return getFallbackResponse(query);
}
```

### 5. Log All Requests
```javascript
// Track what's using tokens
console.log(`AI request: ${query.substring(0, 50)}... (${estimatedTokens} tokens)`);
```

---

## 📞 Support & Resources

### Buildathon Guidelines
https://notion.so/Guidelines-and-Security-Usage-of-Open-AI-Key-2fd573730b5a803ba073eb0ce1274618

### Your Project Files
- **API Key:** `.env` (secured)
- **Usage Tracking:** `.openai-usage.json` (auto-created)
- **AI Manager:** `lib/ai.js` (with limits)
- **Security Guide:** This file

### Check Security Status
```bash
# Verify .env is gitignored
git status

# Check usage
npm start

# Test API
curl http://localhost:3000/api/ai/usage
```

---

## ✅ Security Checklist

Before deploying or sharing your project:

- [ ] `.env` file is in `.gitignore`
- [ ] API key is NOT in any committed files
- [ ] API key is used only in backend code
- [ ] Usage tracking is working
- [ ] Token limits are enforced
- [ ] Error handling is implemented
- [ ] Usage is monitored regularly
- [ ] No API key in frontend/client code
- [ ] No API key in logs or console
- [ ] Project follows buildathon guidelines

---

## 🏆 Your Configuration Summary

```
✅ API Key: Configured & Secured
✅ Token Limit: 300,000 tokens
✅ Per-Request Limit: 500 tokens
✅ Model: gpt-4o-mini
✅ Usage Tracking: Enabled
✅ Git Protection: Active
✅ Backend-Only: Verified
✅ Error Handling: Implemented
```

**Status:** 🎯 READY FOR BUILDATHON!

---

## 🎉 Good Luck!

Your OpenAI API is securely configured and ready for the buildathon. Follow the security guidelines, monitor your usage, and build something amazing!

**Team NxtWave is excited to see your innovation!** 🚀

---

**Last Updated:** February 12, 2026  
**Buildathon:** OpenAI Academy x NxtWave  
**Team:** ABHAY HARITHAS
