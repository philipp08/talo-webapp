import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIe0tYGLYgnbI2Evd6jr_Q3kXzzTIwU9E",
  authDomain: "talo-def0d.firebaseapp.com",
  projectId: "talo-def0d",
  storageBucket: "talo-def0d.firebasestorage.app",
  messagingSenderId: "917279212839",
  appId: "1:917279212839:web:45007fe8be197150c25502",
  measurementId: "G-NP5SXYBQ6E"
};

// Initialize Firebase normally. If API keys are set, this works safely across SSR and Client.
const app = !getApps().length && firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : getApps().length > 0 
    ? getApp() 
    : undefined;

// Export Firebase services if the app was successfully initialized
export const auth = app ? getAuth(app) : null as any;
export const db = app ? getFirestore(app) : null as any;



