import React, { useMemo } from 'react';
import { analyze, annotateText, MarkKind } from '../lib/analyzer';
import type { ThemeTopic } from '../data';

interface TextMapProps {
  text: string;
  theme: ThemeTopic;
  selectedMufradat?: string[];
}

const wordClass: Record<MarkKind, string> = {
  vocab: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100 rounded px-0.5',
  connector: 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100 rounded px-0.5',
  error: 'underline decoration-red-500 decoration-wavy underline-offset-4 text-red-700 dark:text-red-300',
  plain: '',
};

// Peta Tulisan: menandai kosakata tema, kata penghubung, dan kata yang perlu diperiksa.
export const TextMap: React.FC<TextMapProps> = ({ text, theme, selectedMufradat }) => {
  const { analysis, sentences } = useMemo(() => {
    const a = analyze({ text, theme, selectedMufradat: selectedMufradat || [] });
    return { analysis: a, sentences: annotateText(text, theme, a.findings) };
  }, [text, theme, selectedMufradat]);

  if (!text || text.trim().length < 3) return null;

  const count = (k: MarkKind) =>
    sentences.reduce((n, s) => n + s.words.filter((w) => w.kind === k).length, 0);

  return (
    <div className="mt-4 p-4 sm:p-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40">
      <h3 className="font-bold text-sm sm:text-base text-stone-800 dark:text-stone-100">Peta Tulisan</h3>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
        Tulisanmu ditandai per kalimat. Penanda ini hasil aturan otomatis, bukan penilaian akhir.
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-stone-700 dark:text-stone-300">
        <span><span className={wordClass.vocab}>kosakata tema</span> : {count('vocab')}</span>
        <span><span className={wordClass.connector}>kata penghubung</span> : {count('connector')}</span>
        <span><span className={wordClass.error}>perlu diperiksa</span> : {count('error')}</span>
      </div>

      <ol className="mt-3 space-y-3">
        {sentences.map((s, i) => {
          const notes = s.words.filter((w) => w.kind === 'error' && w.note);
          return (
            <li key={i} className="rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3">
              <div className="flex items-start gap-3">
                <span className="text-[11px] font-bold text-stone-400 mt-1 shrink-0">{i + 1}</span>
                <p dir="rtl" className="font-arabic text-xl sm:text-2xl leading-[2.2] flex-1 text-stone-900 dark:text-stone-100">
                  {s.words.map((w, j) => (
                    <React.Fragment key={j}>
                      <span className={wordClass[w.kind]} title={w.note}>{w.text}</span>{' '}
                    </React.Fragment>
                  ))}
                </p>
                <span className="text-[11px] text-stone-400 shrink-0 mt-1">{s.wordCount} kata</span>
              </div>
              {notes.length > 0 && (
                <ul className="mt-2 ml-6 space-y-1 text-xs text-red-700 dark:text-red-300">
                  {notes.map((w, j) => (
                    <li key={j}>
                      <span dir="rtl" className="font-arabic text-sm">{w.text}</span> : {w.note}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 text-xs text-stone-600 dark:text-stone-300 space-y-1">
        <p>
          Kosakata tema terpakai {analysis.usedVocab.length} dari {analysis.vocabTarget} target;
          kata penghubung {analysis.connectorsUsed.length}; kalimat {analysis.sentences}.
        </p>
        {analysis.unusedVocab.length > 0 && (
          <p>
            Belum dipakai:{' '}
            {analysis.unusedVocab.slice(0, 8).map((v, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <span dir="rtl" className="font-arabic text-sm">{v.word}</span>
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
};
