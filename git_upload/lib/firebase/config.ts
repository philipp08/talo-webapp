import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase securely, avoiding crashes during Next.js SSG/build
const app = typeof window !== "undefined"
  ? !getApps().length
    ? firebaseConfig.apiKey
      ? initializeApp(firebaseConfig)
      : ({} as ReturnType<typeof initializeApp>)
    : getApp()
  : ({} as ReturnType<typeof initializeApp>);

export const auth = typeof window !== "undefined" && app && "name" in app
  ? getAuth(app)
  : ({} as ReturnType<typeof getAuth>);

export const db = typeof window !== "undefined" && app && "name" in app
  ? getFirestore(app)
  : ({} as ReturnType<typeof getFirestore>);

