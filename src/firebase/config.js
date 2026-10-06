import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const env = import.meta.env;

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];
const PLACEHOLDERS = new Set(['your_api_key_here', 'your_project_id']);

export const missingFirebaseKeys = REQUIRED_KEYS.filter((key) => {
  const value = String(env[key] ?? '').trim();
  return value === '' || PLACEHOLDERS.has(value);
});

export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

function init() {
  if (!isFirebaseConfigured) {
    console.error('[Firebase] Missing configuration:', missingFirebaseKeys.join(', '));
    return { app: null, db: null, initError: new Error('Firebase is not configured.') };
  }
  try {
    const alreadyInitialized = getApps().length > 0;
    const app = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);
    const db = alreadyInitialized
      ? getFirestore(app)
      : initializeFirestore(app, {
          localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
        });
    return { app, db, initError: null };
  } catch (initError) {
    console.error('[Firebase] Initialization failed:', initError);
    return { app: null, db: null, initError };
  }
}

export const { app, db, initError: firebaseInitError } = init();