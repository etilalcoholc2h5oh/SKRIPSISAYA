// Pemanggil asisten AI dari sisi klien. Selalu mengembalikan hasil yang aman dipakai
// (tidak melempar error) sehingga tampilan bisa menampilkan pesan yang jelas.

export type AiAction =
  | 'evaluate'
  | 'rubric'
  | 'harakat'
  | 'suggest'
  | 'fix'
  | 'translate'
  | 'visual-prompt'
  | 'theme';

export interface AiResponse<T = any> {
  ok: boolean;
  result?: T;
  error?: string;
  /** true bila AI tidak terjangkau (server mati, kuota habis, belum dipasang), bukan karena isian salah. */
  unavailable?: boolean;
}

const readCustomKey = (): string => {
  try {
    return localStorage.getItem('geminiApiKey') || '';
  } catch {
    return '';
  }
};

export async function callAi<T = any>(
  action: AiAction,
  body: Record<string, unknown>,
  timeoutMs = 30000
): Promise<AiResponse<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`/api/ai/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, customApiKey: readCustomKey() }),
      signal: controller.signal
    });

    // Jika server AI belum dipasang, host mengembalikan halaman HTML (bukan JSON).
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) {
      return { ok: false, unavailable: true, error: 'Layanan AI belum aktif di server ini.' };
    }

    const data = await res.json();
    const empty = data?.result === undefined || data?.result === null || data?.result === '';
    if (!res.ok || empty) {
      return {
        ok: false,
        unavailable: res.status === 429 || res.status === 503 || res.status === 404,
        error: data?.error || 'Asisten AI belum bisa menjawab. Coba lagi sebentar lagi.'
      };
    }
    return { ok: true, result: data.result as T };
  } catch (e: any) {
    return {
      ok: false,
      unavailable: true,
      error:
        e?.name === 'AbortError'
          ? 'Asisten AI terlalu lama merespons. Coba lagi.'
          : 'Tidak dapat menghubungi server. Periksa koneksi internet.'
    };
  } finally {
    clearTimeout(timer);
  }
}
