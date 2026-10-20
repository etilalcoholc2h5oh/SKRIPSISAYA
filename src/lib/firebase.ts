import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, where, getDocs, updateDoc, serverTimestamp, orderBy, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDV54jswKMRp2MLEAiMc_r1u-IxqKwcByA",
  authDomain: "kitabah-83bcc.firebaseapp.com",
  projectId: "kitabah-83bcc",
  storageBucket: "kitabah-83bcc.firebasestorage.app",
  messagingSenderId: "106855743889",
  appId: "1:106855743889:web:f5a7aa5ec4abfd692eda30",
};

const app = initializeApp(firebaseConfig);
// Database Firestore milik proyek ini. Bawaan: database "(default)". Bisa diganti lewat variabel
// lingkungan VITE_FIRESTORE_DATABASE_ID (mis. di Vercel) tanpa mengubah kode.
const databaseId: string = (import.meta.env.VITE_FIRESTORE_DATABASE_ID as string | undefined)?.trim() || '(default)';

// Sebagian jaringan seluler/sekolah memblokir koneksi streaming Firestore. Mode auto-detect menunggu
// sekitar 10 detik sebelum menyerah pada streaming, sehingga membuat kelas terasa macet. Untuk aplikasi
// kelas yang datanya kecil, long polling langsung dipakai sejak awal: lebih cepat dan lolos di semua jaringan.
export const firebaseProjectId = firebaseConfig.projectId;
export const firebaseApiKey = firebaseConfig.apiKey;
export const firebaseDatabaseId = databaseId;
export const activeDatabaseId = `${firebaseConfig.projectId} / ${databaseId}`;
export const firestore = initializeFirestore(app, { experimentalForceLongPolling: true }, databaseId);

// Enable offline persistence
enableIndexedDbPersistence(firestore).catch((err) => {
  console.warn("Offline persistence failed to enable:", err);
});

export { collection, doc, setDoc, getDoc, onSnapshot, query, where, getDocs, updateDoc, serverTimestamp, orderBy };
