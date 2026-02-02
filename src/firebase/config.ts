// Firebase config loaded from environment variables (NEXT_PUBLIC_FIREBASE_* prefix required for client-side)
const firebaseConfigFromEnv = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Fallback to hardcoded defaults if env vars not set (for backward compatibility during migration)
const hardcodedDefaults = {
  projectId: "tooldaddy-1-04475293-a5fef",
  appId: "1:987172589038:web:5211ddefd13ab9fcefd2ff",
  apiKey: "AIzaSyBL5MT0y0ZgThKMts1ShtkNPykV7jHHL84",
  authDomain: "tooldaddy-1-04475293-a5fef.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "987172589038"
};

// Use env vars if available, fallback to hardcoded defaults
export const firebaseConfig = {
  projectId: firebaseConfigFromEnv.projectId || hardcodedDefaults.projectId,
  appId: firebaseConfigFromEnv.appId || hardcodedDefaults.appId,
  apiKey: firebaseConfigFromEnv.apiKey || hardcodedDefaults.apiKey,
  authDomain: firebaseConfigFromEnv.authDomain || hardcodedDefaults.authDomain,
  measurementId: firebaseConfigFromEnv.measurementId || hardcodedDefaults.measurementId,
  messagingSenderId: firebaseConfigFromEnv.messagingSenderId || hardcodedDefaults.messagingSenderId,
};

// Log warning if using hardcoded defaults in production
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn('⚠️  Firebase config using hardcoded defaults. Set NEXT_PUBLIC_FIREBASE_* environment variables for production.');
}
