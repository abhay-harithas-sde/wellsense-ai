// Firebase Admin SDK Integration
// Handles Firebase initialization and authentication

import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let firebaseApp = null;
let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  if (firebaseApp) {
    return { success: true, app: firebaseApp, message: 'Firebase already initialized' };
  }

  try {
    // Try to initialize from service account file
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase/firebase-service-account.json';
    const fullPath = path.resolve(serviceAccountPath);

    if (fs.existsSync(fullPath)) {
      const serviceAccount = require(fullPath);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
      });

      isInitialized = true;
      console.log('✅ Firebase Admin initialized from service account file');
      console.log(`   Project ID: ${serviceAccount.project_id}`);
      
      return { 
        success: true, 
        app: firebaseApp, 
        message: 'Firebase initialized from file',
        projectId: serviceAccount.project_id
      };
    }

    // Try to initialize from environment variables (production)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      isInitialized = true;
      console.log('✅ Firebase Admin initialized from environment variables');
      console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
      
      return { 
        success: true, 
        app: firebaseApp, 
        message: 'Firebase initialized from environment',
        projectId: process.env.FIREBASE_PROJECT_ID
      };
    }

    // Firebase not configured
    console.log('⚠️  Firebase not configured (optional)');
    console.log('   To enable Firebase:');
    console.log('   1. Add firebase-service-account.json to firebase/ folder');
    console.log('   2. Or set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in .env');
    
    return { 
      success: false, 
      app: null, 
      message: 'Firebase not configured (optional)',
      optional: true
    };

  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    
    return { 
      success: false, 
      app: null, 
      message: error.message,
      error: error
    };
  }
}

/**
 * Get Firebase Admin instance
 */
function getFirebaseAdmin() {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp;
}

/**
 * Verify Firebase ID token
 */
async function verifyFirebaseToken(idToken) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      decodedToken
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create custom Firebase token
 */
async function createCustomToken(uid, additionalClaims = {}) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return {
      success: true,
      token: customToken
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Firebase user by email
 */
async function getUserByEmail(email) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const userRecord = await admin.auth().getUserByEmail(email);
    return {
      success: true,
      user: userRecord
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send push notification
 */
async function sendPushNotification(token, notification, data = {}) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: data,
      token: token
    };

    const response = await admin.messaging().send(message);
    return {
      success: true,
      messageId: response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send push notification to multiple devices
 */
async function sendMulticastNotification(tokens, notification, data = {}) {
  try {
    if (!firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: data,
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if Firebase is initialized
 */
function isFirebaseInitialized() {
  return isInitialized;
}

/**
 * Get Firebase status
 */
function getFirebaseStatus() {
  return {
    initialized: isInitialized,
    available: !!firebaseApp,
    projectId: process.env.FIREBASE_PROJECT_ID || null
  };
}

export {
  initializeFirebase,
  getFirebaseAdmin,
  verifyFirebaseToken,
  createCustomToken,
  getUserByEmail,
  sendPushNotification,
  sendMulticastNotification,
  isFirebaseInitialized,
  getFirebaseStatus,
  admin
};
