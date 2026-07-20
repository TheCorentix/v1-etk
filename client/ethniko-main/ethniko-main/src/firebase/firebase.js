import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// 1. Fetch Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 2. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 3. Initialize Firebase Auth instance
export const auth = getAuth(app);

export default auth;
