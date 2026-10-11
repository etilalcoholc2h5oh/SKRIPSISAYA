import React, { useMemo, useState } from 'react';
import { Check, X, RotateCcw } from 'lucide-react';
import type { ThemeTopic } from '../data';
import { makeMeaningQuiz, makeOrderItems, MEANING_XP, ORDER_XP } from '../lib/warmup';
import { claimWarmup } from '../lib/gameProgress';

interface WarmUpProps {
  theme: ThemeTopic;
  seed: string;
}

type Tab = 'arti' | 'susun';

const btn = 'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors';

// Latihan sebelum menulis: tebak arti kata dan susun kalimat dari tema.
export const WarmUp: React.FC<WarmUpProps> = ({ theme, seed }) => {
  const [tab, setTab] = useState<Tab>('arti');
  const [round, setRound] = useState(0);
  const key = `${seed}:${theme.id}:${round}`;

  const quiz = useMemo(() => makeMeaningQuiz(theme, key), [theme, key]);
  const items = useMemo(() => makeOrderItems(theme, key), [theme, key]);

  // tebak arti
  const [picked, setPicked] = useState<Record<number, string>>({});
  // susun kalimat
  const [built, setBuilt] = useState<Record<number, number[]>>({}); // indeks kata acak yang dipilih, berurutan
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [xpMsg, setXpMsg] = useState<string | null>(null);

  const reset = () => {
    setRound((r) => r + 1);
    setPicked({});
    setBuilt({});
    setChecked({});
    setXpMsg(null);
  };

  const correctArti = quiz.filter((q, i) => picked[i] === q.answer).length;
  const doneArti = quiz.length > 0 && Object.keys(picked).length === quiz.length;

  const isOrderRight = (i: number) => {
    const sel = (built[i] || []).map((k) => items[i].shuffled[k]);
    return sel.length === items[i].words.length && sel.join(' ') === items[i].words.join(' ');
  };
  const correctOrder = items.filter((_, i) => checked[i] && isOrderRight(i)).length;

  const pickArti = (qi: number, opt: string) => {
    if (picked[qi] !== undefined) return;
    const next = { ...picked, [qi]: opt };
    setPicked(next);
    if (Object.keys(next).length === quiz.length) {
      const xp = quiz.filter((q, i) => next[i] === q.answer).length * MEANING_XP;
      const r = claimWarmup(theme.id, 'arti', xp);
      setXpMsg(r.gained > 0 ? `+${r.gained} XP` : 'Tidak ada XP baru (hasil terbaikmu di tema ini belum terlampaui).');
    }
  };

  const checkOrder = (i: number) => {
    const next = { ...checked, [i]: true };
    setChecked(next);
    const right = items.filter((_, k) => next[k] && (k === i ? isOrderRight(i) : isOrderRight(k))).length;
    const r = claimWarmup(theme.id, 'susun', right * ORDER_XP);
    setXpMsg(r.gained > 0 ? `+${r.gained} XP` : null);
  };

  const tabBtn = (id: Tab, label: string, disabled = false) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { setTab(id); setXpMsg(null); }}
      className={`${btn} ${tab === id ? 'bg-stone-800 text-white border-stone-800 dark:bg-stone-100 dark:text-stone-900' : 'border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200'} disabled:opacity-40`}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-6 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Latihan sebelum menulis</h3>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">Kumpulkan XP dulu, lalu tulis karanganmu.</p>
        </div>
        <div className="flex gap-1.5">
          {tabBtn('arti', 'Tebak arti', quiz.length === 0)}
          {tabBtn('susun', 'Susun kalimat', items.length === 0)}
        </div>
      </div>

      {tab === 'arti' && quiz.length > 0 && (
        <div className="mt-4 space-y-4">
          {quiz.map((q, qi) => (
            <div key={qi}>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-stone-400">{qi + 1}.</span>
                <span dir="rtl" className="font-arabic text-2xl text-stone-900 dark:text-stone-100">{q.word}</span>
              </div>
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {q.options.map((o) => {
                  const chosen = picked[qi];
                  const state = chosen === undefined ? 'idle' : o === q.answer ? 'right' : o === chosen ? 'wrong' : 'idle';
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => pickArti(qi, o)}
                      disabled={chosen !== undefined}
                      className={`text-left text-xs px-3 py-2 rounded-lg border ${
                        state === 'right' ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-900 dark:text-emerald-100'
                        : state === 'wrong' ? 'bg-red-100 dark:bg-red-900/40 border-red-400 text-red-900 dark:text-red-100'
                        : 'border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {doneArti && (
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
              Skor {correctArti} / {quiz.length}. {xpMsg}
            </p>
          )}
        </div>
      )}

      {tab === 'susun' && items.length > 0 && (
        <div className="mt-4 space-y-5">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Ketuk kata satu per satu untuk menyusun kalimat dari contoh karangan tema. Ketuk kata di jawabanmu untuk membatalkan.
          </p>
          {items.map((it, i) => {
            const sel = built[i] || [];
            const done = !!checked[i];
            const right = done && isOrderRight(i);
            return (
              <div key={i}>
                <div
                  dir="rtl"
                  className={`min-h-[3rem] p-2 rounded-lg border flex flex-wrap gap-1.5 ${
                    done ? (right ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : 'border-red-400 bg-red-50 dark:bg-red-950/30') : 'border-dashed border-stone-300 dark:border-stone-600'
                  }`}
                >
                  {sel.map((k, pos) => (
                    <button
                      key={pos}
                      type="button"
                      disabled={done}
                      onClick={() => setBuilt({ ...built, [i]: sel.filter((_, p) => p !== pos) })}
                      className="font-arabic text-xl px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                    >
                      {it.shuffled[k]}
                    </button>
                  ))}
                </div>
                <div dir="rtl" className="mt-2 flex flex-wrap gap-1.5">
                  {it.shuffled.map((w, k) =>
                    sel.includes(k) ? null : (
                      <button
                        key={k}
                        type="button"
                        disabled={done}
                        onClick={() => setBuilt({ ...built, [i]: [...sel, k] })}
                        className="font-arabic text-xl px-2 py-0.5 rounded-md border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800"
                      >
                        {w}
                      </button>
                    )
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {!done ? (
                    <button
                      type="button"
                      disabled={sel.length !== it.words.length}
                      onClick={() => checkOrder(i)}
                      className={`${btn} bg-amber-600 text-white border-amber-600 disabled:opacity-40`}
                    >
                      Periksa
                    </button>
                  ) : right ? (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1"><Check className="w-4 h-4" /> Benar</span>
                  ) : (
                    <span className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1">
                      <X className="w-4 h-4 shrink-0" />
                      <span>Urutan di contoh: <span dir="rtl" className="font-arabic text-base">{it.words.join(' ')}</span></span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {Object.keys(checked).length === items.length && (
            <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
              Benar {correctOrder} / {items.length}. {xpMsg}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        className={`${btn} mt-4 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 inline-flex items-center gap-1.5`}
      >
        <RotateCcw className="w-3.5 h-3.5" /> Soal baru
      </button>
    </div>
  );
};
