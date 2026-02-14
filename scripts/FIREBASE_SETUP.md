# Firebase Email/Password Authentication Setup

## Overview

The `populate-data.js` script creates Firebase authentication accounts for demo users. To enable this functionality, you need to enable Email/Password authentication in your Firebase project.

## Current Status

✅ Firebase Admin SDK is configured and working  
⚠️ Email/Password authentication is **not enabled** in Firebase Console

## How to Enable Email/Password Authentication

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wellsense-ai-f06cf**

### Step 2: Enable Email/Password Sign-in Method
1. In the left sidebar, click **Authentication**
2. Click the **Sign-in method** tab
3. Find **Email/Password** in the list of providers
4. Click on **Email/Password**
5. Toggle **Enable** to ON
6. Click **Save**

### Step 3: Verify Setup
Run the data population script again:
```bash
node scripts/populate-data.js
```

You should now see:
```
✓ Created Firebase auth account for user@example.com (UID: abc123...)
```

## Demo User Credentials

Once Firebase email/password authentication is enabled, all demo users will be created with:

- **Email**: The generated email addresses (shown in script output)
- **Password**: `DemoDay2024!` (same for all demo users)

Example:
```
Email: elsa.feest11@yahoo.com
Password: DemoDay2024!
```

## Troubleshooting

### Error: "There is no configuration corresponding to the provided identifier"
This means Email/Password authentication is not enabled. Follow the steps above to enable it.

### Error: "auth/email-already-exists"
The script automatically handles this by retrieving the existing user's UID instead of creating a new account.

### Firebase Not Configured
If you see "Firebase not configured (optional)", ensure:
1. `firebase/firebase-service-account.json` exists, OR
2. Environment variables are set: `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PROJECT_ID`

## Benefits of Firebase Auth Integration

✅ **Realistic Demo**: Users can actually log in with email/password  
✅ **Google OAuth Ready**: Firebase UID stored in `googleId` field for OAuth integration  
✅ **Production-Ready**: Same authentication flow as production environment  
✅ **Secure**: All users have verified email addresses and secure passwords

## Notes

- The script gracefully handles Firebase being unavailable or not configured
- PostgreSQL user records are created regardless of Firebase status
- Firebase UIDs are stored in the `googleId` field in PostgreSQL
- All demo users have `emailVerified: true` for immediate login access
