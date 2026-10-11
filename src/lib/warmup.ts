import type { ThemeTopic } from '../data';

// Latihan sebelum menulis: tebak arti dan susun kalimat. Dibuat dari data tema, tanpa AI.

function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

export function shuffle<T>(arr: T[], seed: string): T[] {
  const r = rng(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface MeaningQ {
  word: string;
  options: string[];
  answer: string;
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

// Tebak arti: n kata Arab dari tema, 4 pilihan arti (jawaban benar + pengecoh dari kata lain di tema).
export function makeMeaningQuiz(theme: ThemeTopic, seed: string, n = 5): MeaningQ[] {
  const list = (theme.mufradat || []).filter((m) => clean(m.word) && clean(m.meaning));
  if (list.length < 2) return [];
  const picked = shuffle(list, `${seed}:q`).slice(0, Math.min(n, list.length));
  return picked.map((m, i) => {
    const answer = clean(m.meaning);
    const distractors = shuffle(
      Array.from(new Set(list.map((x) => clean(x.meaning)))).filter((x) => x !== answer),
      `${seed}:d${i}`
    ).slice(0, 3);
    return { word: m.word, answer, options: shuffle([answer, ...distractors], `${seed}:o${i}`) };
  });
}

export interface OrderItem {
  words: string[]; // urutan benar
  shuffled: string[]; // urutan acak (selalu berbeda dari urutan benar)
}

// Susun kalimat: kalimat dari contoh karangan tema, 4 sampai 12 kata.
export function makeOrderItems(theme: ThemeTopic, seed: string, n = 3): OrderItem[] {
  const sentences = (theme.contohInsya || '')
    .split(/[.!?؟\n]+/)
    .map((s) => s.replace(/[،,؛;:"“”]/g, ' ').trim().split(/\s+/).filter(Boolean))
    .filter((w) => w.length >= 4 && w.length <= 12);
  return shuffle(sentences, `${seed}:s`)
    .slice(0, n)
    .map((words, i) => {
      let sh = shuffle(words, `${seed}:w${i}`);
      for (let k = 1; k < 6 && sh.join(' ') === words.join(' '); k++) sh = shuffle(words, `${seed}:w${i}:${k}`);
      return { words, shuffled: sh };
    });
}

export const MEANING_XP = 4; // per jawaban benar
export const ORDER_XP = 8; // per kalimat benar
