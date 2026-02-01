import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// KONFIGURASI FIREBASE
// 1. Buka https://console.firebase.google.com/
// 2. Buat Project Baru (Gratis)
// 3. Pilih "Web App" (icon </>)
// 4. Copy config yang muncul dan tempel di bawah ini:
// 5. Masuk menu "Realtime Database" -> "Rules" -> Ubah ".read": true, ".write": true (Untuk demo)

const firebaseConfig = {
  apiKey: "ISI_DENGAN_API_KEY_DARI_FIREBASE",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id-default-rtdb.firebaseio.com", // PASTIKAN URL DATABASE ADA
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Cek apakah config sudah diisi (bukan default)
const isConfigured = firebaseConfig.apiKey !== "ISI_DENGAN_API_KEY_DARI_FIREBASE";

let app;
let db: any;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (error) {
    console.error("Firebase Error:", error);
  }
} else {
  console.warn("⚠️ FIREBASE BELUM DIKONFIGURASI. Notifikasi lintas device tidak akan berjalan. Silakan edit file firebaseConfig.ts");
}

export { db };
