// Status sinkronisasi ke server, supaya "tersambung" bukan sekadar hiasan.
// Firestore menyimpan perubahan di perangkat lebih dulu, lalu mengirimnya ke server.
// Bila server tidak terjangkau atau menolak, data tampak aman di layar sendiri tetapi tidak
// pernah sampai ke perangkat lain. Modul ini mencatat keadaan itu agar bisa ditampilkan.
import { useEffect, useState } from 'react';

export type SyncState = 'ok' | 'pending' | 'error';

interface Snapshot {
  state: SyncState;
  since: number; // kapan keadaan ini dimulai
  message: string;
}

let current: Snapshot = { state: 'ok', since: Date.now(), message: '' };
const listeners = new Set<(s: Snapshot) => void>();

const set = (state: SyncState, message = '') => {
  if (current.state === state && current.message === message) return;
  current = { state, since: state === current.state ? current.since : Date.now(), message };
  listeners.forEach((l) => l(current));
};

export const friendlyError = (e: unknown): string => {
  const code = (e as { code?: string } | null)?.code || '';
  if (code.includes('permission-denied')) return 'Server menolak menyimpan (aturan database). Hubungi pengembang.';
  if (code.includes('unavailable')) return 'Tidak bisa terhubung ke server. Periksa internet.';
  if (code.includes('resource-exhausted')) return 'Kuota database habis untuk hari ini.';
  if (code.includes('not-found')) return 'Data kelas tidak ditemukan di server.';
  return 'Perubahan gagal dikirim ke server.';
};

export const reportError = (e: unknown) => {
  console.error('Sinkronisasi gagal:', e);
  set('error', friendlyError(e));
};

// Dipanggil dari tiap onSnapshot (dengan includeMetadataChanges).
export const reportSnapshot = (meta: { fromCache: boolean; hasPendingWrites: boolean }) => {
  if (meta.hasPendingWrites || meta.fromCache) set('pending');
  else set('ok');
};

export function useSyncStatus() {
  const [snap, setSnap] = useState<Snapshot>(current);
  const [, tick] = useState(0);
  useEffect(() => {
    listeners.add(setSnap);
    setSnap(current);
    // Segarkan label "belum terkirim" setelah beberapa detik tanpa menunggu perubahan lain.
    const id = setInterval(() => tick((n) => n + 1), 2000);
    return () => {
      listeners.delete(setSnap);
      clearInterval(id);
    };
  }, []);
  const stuck = snap.state === 'pending' && Date.now() - snap.since > 8000;
  return { state: snap.state, message: snap.message, stuck };
}
