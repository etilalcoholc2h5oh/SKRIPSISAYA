import type { Analysis } from './analyzer';
import type { ThemeTopic, Mufradat } from '../data';

// Gamifikasi Latihan Mandiri: misi, XP, level, bintang, lencana.
// Semua dihitung dari hasil analyze() (aturan, tanpa AI). Lihat LOGIKA-PENILAIAN.md.

export interface Quest {
  id: string;
  title: string;
  hint: string;
  current: number;
  target: number;
  done: boolean;
  xp: number;
}

// Kata tantangan: 3 kosakata tema yang dipilih tetap per kode sesi (acak tapi stabil).
export function challengeWords(theme: ThemeTopic, seed: string, n = 3): Mufradat[] {
  const list = (theme.mufradat || []).slice();
  let h = 2166136261;
  for (const c of `${seed}:${theme.id}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const out: Mufradat[] = [];
  while (list.length && out.length < n) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    out.push(list.splice(h % list.length, 1)[0]);
  }
  return out;
}

export function buildQuests(a: Analysis, theme: ThemeTopic, challenge: Mufradat[]): Quest[] {
  const T = (theme.mufradat || []).length;
  const vocabTarget = Math.max(1, Math.min(5, T));
  const usedWords = new Set(a.usedVocab.map((m) => m.word));
  const challengeHit = challenge.filter((m) => usedWords.has(m.word)).length;
  const errors = a.findings.filter((f) => f.kind !== 'campur').length;
  const clean = a.words >= 15 && errors === 0;

  const q: Quest[] = [
    { id: 'panjang', title: 'Tulis 40 kata', hint: 'Karangan yang cukup panjang', current: Math.min(a.words, 40), target: 40, done: a.words >= 40, xp: 15 },
    { id: 'kosakata', title: `Pakai ${vocabTarget} kosakata tema`, hint: 'Ambil dari daftar mufradat tema', current: Math.min(a.usedVocab.length, vocabTarget), target: vocabTarget, done: a.usedVocab.length >= vocabTarget, xp: 20 },
    { id: 'penghubung', title: 'Pakai 2 kata penghubung', hint: 'Contoh: ثُمَّ، وَ، لِأَنَّ', current: Math.min(a.connectorsUsed.length, 2), target: 2, done: a.connectorsUsed.length >= 2, xp: 15 },
    { id: 'penutup', title: 'Tutup dengan kalimat penutup', hint: 'Contoh: وَفِي الْخِتَامِ', current: a.hasClosing ? 1 : 0, target: 1, done: a.hasClosing, xp: 10 },
    { id: 'harakat', title: 'Harakat minimal 80%', hint: 'Beri harakat pada kata-katamu', current: Math.round(Math.min(a.harakatCoverage, 0.8) * 100), target: 80, done: a.words >= 5 && a.harakatCoverage >= 0.8, xp: 15 },
    { id: 'bersih', title: 'Tanpa kesalahan yang terdeteksi', hint: 'Minimal 15 kata, tanpa tanda merah di Peta Tulisan', current: clean ? 1 : 0, target: 1, done: clean, xp: 25 },
  ];
  if (challenge.length) {
    q.push({
      id: 'tantangan',
      title: `Kata tantangan (${challenge.length})`,
      hint: 'Pakai semua kata tantangan di atas',
      current: challengeHit,
      target: challenge.length,
      done: challengeHit >= challenge.length,
      xp: 30,
    });
  }
  return q;
}

export function stars(total: number): 0 | 1 | 2 | 3 {
  return total >= 85 ? 3 : total >= 70 ? 2 : total >= 55 ? 1 : 0;
}

export const LEVEL_NAMES = ["Mubtadi' (Pemula)", 'Katib (Penulis)', 'Mujid (Mahir)', 'Adib (Sastrawan)', 'Balig (Fasih)'];

// Level n dimulai di XP = 60 * (n-1)^2 (0, 60, 240, 540, 960, ...)
export function levelInfo(xp: number) {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 60)) + 1;
  const base = 60 * (level - 1) ** 2;
  const next = 60 * level ** 2;
  return {
    level,
    name: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
    xpIntoLevel: xp - base,
    xpForLevel: next - base,
    progress: (xp - base) / (next - base),
  };
}

// XP satu ronde = XP misi yang selesai + total nilai / 5 (maks 20)
export function roundXp(quests: Quest[], total: number): number {
  return quests.filter((x) => x.done).reduce((s, x) => s + x.xp, 0) + Math.round(Math.min(100, total) / 5);
}

export interface BadgeDef { id: string; name: string; desc: string }
export const BADGES: BadgeDef[] = [
  { id: 'pertama', name: 'Langkah Pertama', desc: 'Menyelesaikan ronde pertama' },
  { id: 'bintang3', name: 'Tiga Bintang', desc: 'Meraih 3 bintang (nilai 85+)' },
  { id: 'bersih', name: 'Tanpa Cela', desc: 'Menyelesaikan misi tanpa kesalahan' },
  { id: 'lengkap', name: 'Semua Misi', desc: 'Menyelesaikan semua misi dalam satu ronde' },
  { id: 'jelajah', name: 'Penjelajah Tema', desc: 'Menyelesaikan ronde di 3 tema berbeda' },
];
