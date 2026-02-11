# 🔥 Firebase Setup Guide

## 📋 Quick Setup

You have a Firebase service account file at:
```
C:\Users\abhay\Downloads\wellsense-ai-f06cf-firebase-adminsdk-fbsvc-bbf94cd5dc.json
```

### Option 1: Use File Path (Recommended for Development)

1. **Copy the Firebase file to your project root:**
   ```bash
   copy "C:\Users\abhay\Downloads\wellsense-ai-f06cf-firebase-adminsdk-fbsvc-bbf94cd5dc.json" firebase-service-account.json
   ```

2. **Update your `.env` file:**
   ```env
   FIREBASE_PROJECT_ID=wellsense-ai-f06cf
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/firebase-service-account.json
   ```

3. **Verify `.gitignore` includes the file:**
   ```
   firebase-service-account.json
   ```

4. **Test the setup:**
   ```bash
   npm start
   ```

### Option 2: Use Environment Variables (Recommended for Production)

1. **Open the Firebase JSON file and extract values**

2. **Add to your `.env` file:**
   ```env
   FIREBASE_PROJECT_ID=wellsense-ai-f06cf
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@wellsense-ai-f06cf.iam.gserviceaccount.com
   ```

3. **For Production:**
   - Set environment variables in your hosting platform
   - Add each Firebase variable
   - Redeploy

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `firebase-service-account.json` in `.gitignore`
- ✅ Use environment variables in production
- ✅ Restrict Firebase service account permissions
- ✅ Rotate keys periodically

### ❌ DON'T:
- ❌ Commit Firebase credentials to Git
- ❌ Share credentials in public channels
- ❌ Use development credentials in production
- ❌ Give excessive permissions

## 📝 Current Configuration

Your Firebase project:
- **Project ID**: `wellsense-ai-f06cf`
- **Service Account**: `firebase-adminsdk-fbsvc@wellsense-ai-f06cf.iam.gserviceaccount.com`

## 🧪 Testing Firebase Setup

After setup, test with:

```bash
# Start the server
npm start

# Check logs for Firebase initialization
# You should see: "✅ Firebase Admin initialized"
```

## 🔧 Troubleshooting

### Issue: "Firebase Admin not configured"
**Solution**: Check that your `.env` file has the correct path or environment variables.

### Issue: "Invalid credentials"
**Solution**: Verify the JSON file is valid and not corrupted.

### Issue: "Permission denied"
**Solution**: Check Firebase service account has necessary permissions in Firebase Console.

## 📚 What Firebase is Used For

In WellSense AI, Firebase provides:
- 🔐 **Authentication** - Google Sign-In, Phone Auth
- 📱 **Push Notifications** - User notifications
- 📊 **Analytics** - User behavior tracking
- 💾 **Cloud Storage** - File uploads (optional)

## 🚀 Next Steps

1. Copy the Firebase file to your project
2. Update `.env` with Firebase configuration
3. Start the application
4. Test authentication features
5. Configure Firebase Console settings if needed

## 📞 Need Help?

- Check [Google Auth Fix](docs/GOOGLE_AUTH_FIX.md)
- Review [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- See Firebase documentation: https://firebase.google.com/docs

---

**Security Note**: Never commit `firebase-service-account.json` to version control!
