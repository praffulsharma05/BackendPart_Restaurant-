import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseInitialized = false;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'restaurant-app-firebase',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk@restaurant.iam.gserviceaccount.com',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK Initialized');
  }
} catch (error) {
  console.warn('⚠️ Firebase Admin SDK running in fallback mode:', (error as Error).message);
}

export { admin, firebaseInitialized };
