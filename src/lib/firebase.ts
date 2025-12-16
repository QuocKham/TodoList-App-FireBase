import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const getFirebaseConfig = () => {
  // 1. Ưu tiên Sandbox
  if (typeof window !== 'undefined' && (window as any).__firebase_config) {
    try { return JSON.parse((window as any).__firebase_config); } catch (e) {}
  }
  // 2. Ưu tiên biến môi trường
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
  }
  return null;
};

const firebaseConfig = getFirebaseConfig();
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (firebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app!);
    db = getFirestore(app!);
  } catch (error) { console.error("Firebase Init Error:", error); }
}

export { app, auth, db };