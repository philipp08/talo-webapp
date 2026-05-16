export const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_TALO_ADMIN_EMAIL ?? "philipp@pauli-one.de";

export const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAIe0tYGLYgnbI2Evd6jr_Q3kXzzTIwU9E";

export const FIREBASE_CONFIG = {
  apiKey: FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "talo-def0d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "talo-def0d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "talo-def0d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "917279212839",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:917279212839:web:45007fe8be197150c25502",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-NP5SXYBQ6E",
};
