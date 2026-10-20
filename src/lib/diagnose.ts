// Periksa langsung ke server Firestore (lewat REST) untuk tahu mengapa koneksi gagal.
// Hasilnya berupa kalimat yang menyebut penyebab sebenarnya, bukan pesan umum "offline".
import { firebaseProjectId, firebaseApiKey, firebaseDatabaseId } from './firebase';

export async function diagnoseFirestore(): Promise<string> {
  const db = encodeURIComponent(firebaseDatabaseId);
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/${db}/documents/sessions/_cek?key=${firebaseApiKey}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  const where = `proyek ${firebaseProjectId}, database ${firebaseDatabaseId}`;
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    let body: any = null;
    try { body = await res.json(); } catch { /* bukan JSON */ }
    const status: string = body?.error?.status || '';
    const msg: string = body?.error?.message || '';
    const reason: string = body?.error?.details?.[0]?.reason || '';
    if (res.ok) return `Diagnosa: server terjangkau dan database ada (${where}). Masalahnya di koneksi realtime; coba jaringan lain.`;
    if (res.status === 404 && /^Document/i.test(msg)) return `Diagnosa: server terjangkau dan database ada (${where}). Masalahnya di koneksi realtime; coba jaringan lain.`;
    if (res.status === 404 || /does not exist|not.*exist/i.test(msg)) return `Diagnosa: database BELUM ADA di ${where}. Buat Firestore Database (Native mode) di proyek itu.`;
    if (reason === 'SERVICE_DISABLED' || /has not been used|is disabled/i.test(msg)) return `Diagnosa: API Cloud Firestore belum aktif di ${firebaseProjectId}. Buka Firestore Database di Console lalu buat database, atau aktifkan Cloud Firestore API.`;
    if (/referer|referrer/i.test(msg) || reason.startsWith('API_KEY_HTTP')) return `Diagnosa: API key dibatasi untuk domain tertentu. Izinkan domain aplikasi ini di pengaturan API key proyek ${firebaseProjectId}.`;
    if (reason === 'API_KEY_INVALID' || status === 'INVALID_ARGUMENT') return `Diagnosa: API key tidak valid untuk ${firebaseProjectId}. Periksa konfigurasi.`;
    if (res.status === 403 || status === 'PERMISSION_DENIED') return `Diagnosa: server menolak akses (${where}). Periksa tab Rules dan pastikan sudah di-Publish pada database ini.`;
    return `Diagnosa: server menjawab ${res.status} ${status} ${msg}`.slice(0, 300);
  } catch (e: any) {
    if (e?.name === 'AbortError') return 'Diagnosa: permintaan ke server Google tidak dijawab dalam 8 detik. Jaringan terlalu lambat atau diblokir.';
    return 'Diagnosa: browser tidak bisa menjangkau firestore.googleapis.com. Jaringan, VPN, DNS pribadi, atau pemblokir iklan memblokirnya. Coba paket data lain atau matikan pemblokir.';
  } finally {
    clearTimeout(timer);
  }
}
