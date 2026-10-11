import { useEffect, useState } from 'react';

// Nilai yang baru berubah setelah pengguna berhenti mengetik, agar analisis berat tidak jalan di tiap ketukan.
export function useDebounced<T>(value: T, ms = 600): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
