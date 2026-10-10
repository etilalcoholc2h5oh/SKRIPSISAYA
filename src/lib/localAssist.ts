// Pemeriksa cepat TANPA AI. Dipakai sebagai cadangan ketika asisten AI tidak bisa dijangkau,
// supaya siswa tetap mendapat umpan balik yang berguna. Ini bukan penilaian: tidak ada skor.

import type { ThemeTopic } from '../data';

const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g;

export function normalizeArabic(text: string): string {
  return String(text || '')
    .replace(HARAKAT, '')
    .replace(/ـ/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

const stripAl = (w: string) => (w.length > 3 && w.startsWith('ال') ? w.slice(2) : w);

export interface QuickCheckResult {
  words: number;
  sentences: number;
  harakatPercent: number;
  usedWords: string[];
  unusedWords: string[];
}

export function analyzeDraft(text: string, theme: ThemeTopic): QuickCheckResult {
  const raw = String(text || '');
  const norm = normalizeArabic(raw);
  const words = norm ? norm.split(/[\s،؛.؟!?,]+/).filter(Boolean).length : 0;
  const sentences = raw.split(/[.؟!?۔]+/).map((s) => s.trim()).filter((s) => normalizeArabic(s).length > 0).length;

  const letters = (raw.match(/[ء-ي]/g) || []).length;
  const marks = (raw.match(HARAKAT) || []).length;
  const harakatPercent = letters === 0 ? 0 : Math.min(100, Math.round((marks / letters) * 100));

  const used: string[] = [];
  const unused: string[] = [];
  for (const m of theme.mufradat || []) {
    const key = stripAl(normalizeArabic(m.word));
    if (key && norm.includes(key)) used.push(m.word);
    else unused.push(m.word);
  }
  return { words, sentences, harakatPercent, usedWords: used, unusedWords: unused };
}

/** Umpan balik cepat berbasis aturan sederhana (dipakai untuk "Evaluasi" dan "Rubrik" saat AI tidak tersedia). */
export function quickCheckMessage(text: string, theme: ThemeTopic, reason?: string): string {
  const r = analyzeDraft(text, theme);
  const total = (theme.mufradat || []).length;
  const lines: string[] = [];
  lines.push('🔎 Pemeriksa Cepat (tanpa AI)');
  if (reason) lines.push(`Catatan: ${reason}`);
  lines.push('');
  lines.push(`• Panjang tulisan: ${r.words} kata dalam ${r.sentences} kalimat.` +
    (r.sentences < 5 ? ' Cobalah menulis minimal 5 kalimat agar gagasanmu utuh.' : ' Panjangnya sudah cukup.'));
  lines.push(`• Kosakata tema yang terpakai: ${r.usedWords.length} dari ${total}.`);
  if (r.usedWords.length) lines.push(`  Sudah dipakai: ${r.usedWords.slice(0, 6).join('، ')}`);
  if (r.unusedWords.length) lines.push(`  Coba tambahkan: ${r.unusedWords.slice(0, 5).join('، ')}`);
  if (r.words > 0) {
    lines.push(
      r.harakatPercent < 25
        ? '• Harakat masih sedikit. Tambahkan harakat pada kata-kata penting, atau pakai tombol "Beri Harakat" saat AI tersedia.'
        : `• Harakat sudah terisi sekitar ${r.harakatPercent}% huruf. Periksa lagi harakat akhir kata (i'rab).`
    );
  }
  lines.push('');
  lines.push('Pemeriksaan ini hanya menghitung dan mencocokkan kata. Koreksi nahwu, sharaf, dan nilai tetap ditentukan guru.');
  return lines.join('\n');
}

/** Pancingan ide cadangan: memakai pola kalimat dan kosakata dari tema. */
export function quickIdeaMessage(theme: ThemeTopic, reason?: string): string {
  const lines: string[] = [];
  lines.push('💡 Pancingan Ide (tanpa AI)');
  if (reason) lines.push(`Catatan: ${reason}`);
  lines.push('');
  const pattern = (theme.tarkib || [])[0];
  if (pattern) {
    lines.push(`• Coba pola kalimat: ${pattern.name}`);
    lines.push(`  ${pattern.patternArabic}`);
    lines.push(`  Contoh: ${pattern.example}`);
  }
  const words = (theme.mufradat || []).slice(0, 4).map((m) => `${m.word} (${m.meaning})`);
  if (words.length) lines.push(`• Kosakata untuk dimulai: ${words.join('، ')}`);
  lines.push(`• Arah tulisan: ${theme.prompt}`);
  return lines.join('\n');
}
