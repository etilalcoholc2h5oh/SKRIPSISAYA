import React, { useMemo, useState } from 'react';
import { Sparkles, X, AlertCircle, PlusCircle } from 'lucide-react';
import { ThemeTopic, buildCustomTheme, parseMufradatLines, MAX_CUSTOM_MUFRADAT } from '../data';
import { callAi } from '../lib/ai';

interface CustomThemeFormProps {
  onClose: () => void;
  onSave: (theme: ThemeTopic) => void;
}

interface ThemeDraft {
  titleArabic: string;
  prompt: string;
  mufradat: { word: string; meaning: string; pronunciation: string }[];
}

const inputCls =
  'w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500';

export const CustomThemeForm: React.FC<CustomThemeFormProps> = ({ onClose, onSave }) => {
  const [titleIndo, setTitleIndo] = useState('');
  const [titleArabic, setTitleArabic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [vocabText, setVocabText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  const parsed = useMemo(() => parseMufradatLines(vocabText), [vocabText]);
  const canSave = titleIndo.trim().length > 0 && prompt.trim().length > 0 && parsed.length >= 2;

  const handleAiDraft = async () => {
    if (!titleIndo.trim()) {
      setMessage({ kind: 'error', text: 'Isi dulu judul tema (bahasa Indonesia), lalu minta AI melengkapinya.' });
      return;
    }
    setAiLoading(true);
    setMessage(null);
    const ai = await callAi<ThemeDraft>('theme', { text: titleIndo.trim() });
    setAiLoading(false);
    if (!ai.ok || !ai.result) {
      setMessage({ kind: 'error', text: `${ai.error || 'AI belum bisa membuat draf.'} Kamu tetap bisa mengisi manual.` });
      return;
    }
    const draft = ai.result;
    // Hanya mengisi kolom yang masih kosong agar ketikan sendiri tidak tertimpa.
    if (!titleArabic.trim() && draft.titleArabic) setTitleArabic(draft.titleArabic);
    if (!prompt.trim() && draft.prompt) setPrompt(draft.prompt);
    const lines = (draft.mufradat || []).map((m) => [m.word, m.meaning, m.pronunciation].filter(Boolean).join(' = ')).join('\n');
    if (lines) setVocabText((prev) => (prev.trim() ? `${prev.trim()}\n${lines}` : lines));
    setMessage({ kind: 'info', text: 'Draf dari AI sudah diisikan. Periksa dan sesuaikan sebelum disimpan, terutama kosakata dan harakatnya.' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const theme = buildCustomTheme({ titleIndo, titleArabic, prompt, mufradat: parsed });
    if (!theme) {
      setMessage({ kind: 'error', text: 'Lengkapi judul, perintah menulis, dan minimal 2 kosakata.' });
      return;
    }
    onSave(theme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/50 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="custom-theme-title">
      <form
        onSubmit={handleSave}
        className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="custom-theme-title" className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" /> Tambah Tema Baru
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Buat tema karangan sendiri sesuai materi di kelasmu.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">Judul Tema (bahasa Indonesia)</label>
          <input type="text" value={titleIndo} onChange={(e) => setTitleIndo(e.target.value)} placeholder="Contoh: Kegiatan di Perpustakaan" maxLength={100} className={inputCls} />
        </div>

        <button
          type="button"
          onClick={handleAiDraft}
          disabled={aiLoading}
          className="w-full py-2.5 rounded-xl border border-dashed border-emerald-400 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 disabled:opacity-50 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {aiLoading ? 'AI sedang menyusun draf...' : 'Lengkapi otomatis dengan AI (judul Arab, perintah, kosakata)'}
        </button>

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
            Judul Tema (bahasa Arab) <span className="font-normal text-stone-400">- boleh dikosongkan</span>
          </label>
          <input type="text" dir="rtl" value={titleArabic} onChange={(e) => setTitleArabic(e.target.value)} placeholder="الْمَكْتَبَةُ" maxLength={120} className={`${inputCls} font-arabic text-lg`} />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">Perintah Menulis untuk Siswa</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} maxLength={400} placeholder="Contoh: Ceritakan kegiatanmu saat meminjam dan membaca buku di perpustakaan sekolah." className={inputCls} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Daftar Kosakata (Mufradat)</label>
            <span className={`text-[11px] font-semibold ${parsed.length >= 2 ? 'text-emerald-600' : 'text-stone-400'}`}>
              {parsed.length} terbaca (maks. {MAX_CUSTOM_MUFRADAT})
            </span>
          </div>
          <textarea
            value={vocabText}
            onChange={(e) => setVocabText(e.target.value)}
            rows={6}
            placeholder={'Satu kosakata per baris:\nكِتَابٌ = Buku = Kitaabun\nمَكْتَبَةٌ = Perpustakaan = Maktabatun'}
            className={`${inputCls} font-mono text-xs leading-relaxed`}
            spellCheck={false}
          />
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Format: <strong>kata Arab = arti = cara baca</strong>. Cara baca boleh dikosongkan. Minimal 2 kosakata.
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${message.kind === 'error'
            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-300'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'}`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <button type="button" onClick={onClose} className="sm:flex-1 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300">
            Batal
          </button>
          <button type="submit" disabled={!canSave} className="sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-40 transition-colors">
            Simpan Tema
          </button>
        </div>
      </form>
    </div>
  );
};
