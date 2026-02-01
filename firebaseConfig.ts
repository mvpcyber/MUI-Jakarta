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
const defaultConfig: FirebaseConfigType = {
  apiKey: "AIzaSyBVi6MUBod6aPIDNDu7I9kDaxkcnqteo0c",
  authDomain: "mui-jakarta.firebaseapp.com",
  databaseURL: "https://mui-jakarta-default-rtdb.asia-southeast1.firebasedatabase.app",
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
      // Validasi sederhana: Jika API Key tersimpan valid (bukan placeholder)
      if (parsed.apiKey && !parsed.apiKey.includes("ISI_API_KEY")) {
        // FIX: Pastikan databaseURL tidak kosong dan valid (starts with http).
        let dbUrl = parsed.databaseURL;
        if (typeof dbUrl !== 'string' || dbUrl.trim().length < 10 || !dbUrl.trim().startsWith('http')) {
            // Jika URL di storage invalid/kosong, gunakan default
            dbUrl = defaultConfig.databaseURL;
        } else {
            dbUrl = dbUrl.trim();
        }
        
        return { 
            ...defaultConfig, 
            ...parsed,
            databaseURL: dbUrl
        };
      }
    } catch (e) {
      console.error("Error parsing stored config", e);
      // Jika corrupt, hapus agar kembali ke default bersih
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
const isConfigured = currentConfig.apiKey.length > 20 && 
                     !currentConfig.apiKey.includes("ISI_API_KEY");

let app;
let db: any = null;

if (isConfigured) {
  try {
    // Singleton pattern
    if (!getApps().length) {
      app = initializeApp(currentConfig);
    } else {
      app = getApp();
    }
    
    // Inisialisasi Database dengan Safe Handling
    try {
        // Kita gunakan getDatabase(app) yang otomatis menggunakan databaseURL dari config initializeApp.
        // Ini lebih aman daripada mempassing URL secara eksplisit yang bisa menyebabkan mismatch.
        db = getDatabase(app);
        console.log("Firebase Database Initialized Successfully");
    } catch (dbError) {
        // Jika gagal (misal URL salah atau service tidak tersedia), kita set db ke null
        // agar aplikasi tetap jalan (graceful degradation) tanpa crash FATAL.
        console.warn("Warning: Firebase Realtime Database could not be initialized.", dbError);
        db = null;
    }
    
  } catch (error) {
    console.error("Firebase App Initialization Error:", error);
  }
} else {
  console.warn("Firebase belum dikonfigurasi.");
}

export { db, isConfigured };