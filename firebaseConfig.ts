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
  measurementId?: string;
}

const LOCAL_STORAGE_KEY = 'mui_firebase_config';

// --- KONFIGURASI FIREBASE ---
// 1. Buka https://console.firebase.google.com/
// 2. Buat Project / Buka Project yang ada
// 3. Masuk ke Project Settings > General > Your apps > Web App
// 4. Salin config "firebaseConfig" dan tempel di bawah ini menggantikan nilai default.
// 5. Pastikan Realtime Database Rules diatur ke ".read": true, ".write": true (atau sesuai kebutuhan keamanan)

const defaultConfig: FirebaseConfigType = {
  apiKey: "AIzaSyBVi6MUBod6aPIDNDu7I9kDaxkcnqteo0c",
  authDomain: "mui-jakarta.firebaseapp.com",
  databaseURL: "https://mui-jakarta-default-rtdb.asia-southeast1.firebasedatabase.app", // Updated based on screenshot
  projectId: "mui-jakarta",
  storageBucket: "mui-jakarta.firebasestorage.app",
  messagingSenderId: "1032854256041",
  appId: "1:1032854256041:web:c460e9057947c22c15acb8"
};

// Function to get config
export const getFirebaseConfig = (): FirebaseConfigType => {
  // Prioritas 1: Ambil dari Local Storage (jika di-set lewat Admin Panel)
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validasi sederhana
      if (parsed.apiKey && parsed.apiKey !== "AIzaSyBVi6MUBod6aPIDNDu7I9kDaxkcnqteo0c") {
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing stored config", e);
    }
  }
  // Prioritas 2: Gunakan Config Hardcoded di atas
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

// Cek apakah config sudah diisi (bukan placeholder default)
// Kita anggap configured jika apiKey tidak sama dengan placeholder default
const isConfigured = currentConfig.apiKey !== "AIzaSyBVi6MUBod6aPIDNDu7I9kDaxkcnqteo0c" && 
                     currentConfig.apiKey !== "AIzaSyBVi6MUBod6aPIDNDu7I9kDaxkcnqteo0c";

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
    console.log("Firebase Database Initialized:", currentConfig.databaseURL);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
} else {
  console.warn("Firebase belum dikonfigurasi. Silakan isi firebaseConfig.ts atau gunakan Admin Panel.");
}

export { db, isConfigured };