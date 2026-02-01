import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Define interface for Config
export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const LOCAL_STORAGE_KEY = 'mui_firebase_config';

// Default config (placeholders)
const defaultConfig: FirebaseConfigType = {
  apiKey: "ISI_DENGAN_API_KEY_DARI_FIREBASE",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id-default-rtdb.firebaseio.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Function to get config
export const getFirebaseConfig = (): FirebaseConfigType => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored config", e);
    }
  }
  return defaultConfig;
};

// Function to save config
export const saveFirebaseConfig = (config: FirebaseConfigType) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
};

// Function to reset config
export const resetFirebaseConfig = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

const currentConfig = getFirebaseConfig();
const isConfigured = currentConfig.apiKey !== "ISI_DENGAN_API_KEY_DARI_FIREBASE";

let app;
let db: any;

if (isConfigured) {
  try {
    // Singleton pattern to prevent re-initialization errors
    if (!getApps().length) {
      app = initializeApp(currentConfig);
    } else {
      app = getApp();
    }
    db = getDatabase(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
} else {
  // console.warn("Firebase not configured");
}

export { db, isConfigured };