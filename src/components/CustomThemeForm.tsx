import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { ThemeTopic, Mufradat } from '../data';

const ARABIC = /[؀-ۿ]/;
const MIN_VOCAB = 3; // langkah 2 di ruang menulis butuh minimal 2 item untuk dipilih
const MAX_VOCAB = 40;

// Satu baris = satu kosakata. Boleh "كِتَابٌ = buku" atau "buku = كِتَابٌ"
// (pemisah: =, :, |, -, –, tab). Bagian yang berhuruf Arab dianggap kata Arabnya.
export function parseVocabLines(text: string): Mufradat[] {
  const out: Mufradat[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(.+?)\s*(?:=|:|\||\t|\s[-–—]\s)\s*(.+)$/);
    if (!m) continue;
    const [a, b] = [m[1].trim(), m[2].trim()];
    const aAr = ARABIC.test(a);
    const bAr = ARABIC.test(b);
    if (aAr === bAr) continue; // harus tepat satu sisi yang Arab
    out.push({
      word: aAr ? a : b,
      meaning: aAr ? b : a,
      pronunciation: '',
      icon: '📝',
      category: 'Kosakata',
    });
    if (out.length >= MAX_VOCAB) break;
  }
  return out;
}

const vocabToLines = (list: Mufradat[]) => list.map((m) => `${m.word} = ${m.meaning}`).join('\n');

const newId = () => `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

interface Props {
  initial?: ThemeTopic | null;
  submitLabel?: string;
  onSubmit: (theme: ThemeTopic) => void;
  onCancel: () => void;
}

export const CustomThemeForm: React.FC<Props> = ({ initial, submitLabel = 'Pakai Tema Ini', onSubmit, onCancel }) => {
  const [titleIndo, setTitleIndo] = useState(initial?.titleIndo || '');
  const [titleArabic, setTitleArabic] = useState(initial?.titleArabic || '');
  const [prompt, setPrompt] = useState(initial?.prompt || '');
  const [vocabText, setVocabText] = useState(initial ? vocabToLines(initial.mufradat) : '');
  const [contohInsya, setContohInsya] = useState(initial?.contohInsya || '');
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    'w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500';

  // Form ini bisa berada di dalam <form> lain; cegah Enter mengirim form induk.
  const blockEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const submit = () => {
    const title = titleIndo.trim();
    if (title.length < 3) {
      setError('Judul tema (bahasa Indonesia) wajib diisi.');
      return;
    }
    const mufradat = parseVocabLines(vocabText);
    if (mufradat.length < MIN_VOCAB) {
      setError(
        `Isi minimal ${MIN_VOCAB} kosakata, satu per baris, dengan format: كِتَابٌ = buku (kata Arab dan artinya dipisah tanda "=").`
      );
      return;
    }
    setError(null);
    onSubmit({
      id: initial?.id || newId(),
      titleArabic: titleArabic.trim() || title,
      titleIndo: title,
      grade: 'Tema Sendiri',
      imageUrl: '',
      prompt: prompt.trim() || `Tuliskan karangan bahasa Arab tentang ${title}.`,
      mufradat,
      tarkib: initial?.tarkib || [],
      contohInsya: contohInsya.trim(),
      kesalahanUmum: initial?.kesalahanUmum || [],
    });
  };

  const vocabCount = parseVocabLines(vocabText).length;

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Judul tema (Indonesia)</label>
          <input
            type="text"
            value={titleIndo}
            onChange={(e) => setTitleIndo(e.target.value)}
            onKeyDown={blockEnter}
            maxLength={120}
            placeholder="Contoh: Olahraga di Sekolah"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Judul Arab (opsional)</label>
          <input
            type="text"
            dir="rtl"
            value={titleArabic}
            onChange={(e) => setTitleArabic(e.target.value)}
            onKeyDown={blockEnter}
            maxLength={160}
            placeholder="الرِّيَاضَةُ فِي الْمَدْرَسَةِ"
            className={`${inputCls} font-arabic`}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Arahan menulis untuk siswa</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          maxLength={400}
          placeholder="Contoh: Tuliskan karangan tentang olahraga favoritmu dan manfaatnya."
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Kosakata (satu per baris)</label>
          <span className={`text-[11px] font-semibold ${vocabCount >= MIN_VOCAB ? 'text-emerald-600' : 'text-stone-400'}`}>
            {vocabCount} kosakata
          </span>
        </div>
        <textarea
          value={vocabText}
          onChange={(e) => setVocabText(e.target.value)}
          rows={6}
          placeholder={'كُرَةُ الْقَدَمِ = sepak bola\nمَلْعَبٌ = lapangan\nلَاعِبٌ = pemain'}
          className={`${inputCls} font-arabic leading-relaxed`}
        />
        <p className="text-[11px] text-stone-500 mt-1">
          Format: kata Arab, tanda "=", lalu artinya. Minimal {MIN_VOCAB} baris. Tulis dengan harakat agar fitur Cek Harakat bisa membandingkan tulisan siswa.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Contoh karangan (opsional)</label>
        <textarea
          dir="rtl"
          value={contohInsya}
          onChange={(e) => setContohInsya(e.target.value)}
          rows={3}
          maxLength={1200}
          className={`${inputCls} font-arabic`}
        />
        <p className="text-[11px] text-stone-500 mt-1">Contoh yang berharakat membantu pengecekan ejaan dan harakat tulisan siswa.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="flex-1 py-3 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold transition-colors"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  );
};
