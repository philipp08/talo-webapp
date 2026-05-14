import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "./constants";

const firebaseConfig = FIREBASE_CONFIG;

// Initialize Firebase once. The public web config can be overridden via NEXT_PUBLIC_* env vars.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export Firebase services if the app was successfully initialized
export const auth = getAuth(app);
export const db = getFirestore(app);

