import React from 'react';
import { useSyncStatus } from '../lib/syncStatus';

// Penanda sinkronisasi yang jujur: hijau hanya bila server sudah menerima semua perubahan.
export const SyncBadge: React.FC = () => {
  const { state, message, stuck } = useSyncStatus();
  let dot = 'bg-emerald-500';
  let label = 'Tersinkron';
  let tone = 'text-stone-400';
  if (state === 'error') {
    dot = 'bg-red-500';
    label = message || 'Gagal menyimpan ke server';
    tone = 'text-red-600 dark:text-red-400 font-semibold';
  } else if (stuck) {
    dot = 'bg-amber-500';
    label = 'Belum terkirim ke server';
    tone = 'text-amber-600 dark:text-amber-400 font-semibold';
  } else if (state === 'pending') {
    dot = 'bg-amber-400 animate-pulse';
    label = 'Menyinkronkan';
  }
  return (
    <span className={`text-[11px] flex items-center gap-1.5 ${tone}`} role="status" aria-live="polite">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
};
