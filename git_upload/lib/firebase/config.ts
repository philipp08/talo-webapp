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

// Initialize Firebase normally. If API keys are set, this works safely across SSR and Client.
const app = !getApps().length && firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : getApps().length > 0 
    ? getApp() 
    : undefined;

// Export Firebase services if the app was successfully initialized
export const auth = app ? getAuth(app) : ({
  onAuthStateChanged: () => () => {},
  currentUser: null,
  signOut: async () => {},
} as unknown as ReturnType<typeof getAuth>);

export const db = app ? getFirestore(app) : ({
  type: "firestore",
} as unknown as ReturnType<typeof getFirestore>);



