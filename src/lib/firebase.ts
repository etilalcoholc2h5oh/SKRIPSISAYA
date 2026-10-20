import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, where, getDocs, updateDoc, serverTimestamp, orderBy, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0420650550",
  appId: "1:437519431811:web:79708be7adc2a4ba3843b6",
  apiKey: "AIzaSyCGYDtjdzjqJZST6HrinP8a9xJeCLTtgVU",
  authDomain: "gen-lang-client-0420650550.firebaseapp.com",
  storageBucket: "gen-lang-client-0420650550.firebasestorage.app",
  messagingSenderId: "437519431811",
};

const app = initializeApp(firebaseConfig);
// Database Firestore milik proyek ini. Bawaan: database "(default)". Bisa diganti lewat variabel
// lingkungan VITE_FIRESTORE_DATABASE_ID (mis. di Vercel) tanpa mengubah kode.
const databaseId: string = (import.meta.env.VITE_FIRESTORE_DATABASE_ID as string | undefined)?.trim() || '(default)';

// Sebagian jaringan seluler/sekolah memblokir koneksi streaming Firestore. Mode auto-detect menunggu
// sekitar 10 detik sebelum menyerah pada streaming, sehingga membuat kelas terasa macet. Untuk aplikasi
// kelas yang datanya kecil, long polling langsung dipakai sejak awal: lebih cepat dan lolos di semua jaringan.
export const activeDatabaseId = databaseId;
export const firestore = initializeFirestore(app, { experimentalForceLongPolling: true }, databaseId);

// Enable offline persistence
enableIndexedDbPersistence(firestore).catch((err) => {
  console.warn("Offline persistence failed to enable:", err);
});

export { collection, doc, setDoc, getDoc, onSnapshot, query, where, getDocs, updateDoc, serverTimestamp, orderBy };
