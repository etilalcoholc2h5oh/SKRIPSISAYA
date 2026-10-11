import React, { useMemo, useState } from 'react';
import { Check, Star, Trophy, Target } from 'lucide-react';
import { analyze } from '../lib/analyzer';
import type { ThemeTopic } from '../data';
import { BADGES, buildQuests, challengeWords, levelInfo, stars as starsFor } from '../lib/quests';
import { ClaimResult, claimRound, loadGame } from '../lib/gameProgress';
import { useDebounced } from '../lib/useDebounced';

interface QuestPanelProps {
  text: string;
  theme: ThemeTopic;
  seed: string; // kode sesi, untuk kata tantangan yang stabil
  selectedMufradat?: string[];
  onClaim?: () => void; // dipanggil saat hasil ronde diklaim (mis. menyimpan rubrik)
}

// Mode permainan Latihan Mandiri: misi, XP, level, bintang, lencana.
const QuestPanelBase: React.FC<QuestPanelProps> = ({ text: liveText, theme, seed, selectedMufradat, onClaim }) => {
  const text = useDebounced(liveText, 600);
  const selKey = (selectedMufradat || []).join('|');
  const [game, setGame] = useState(loadGame);
  const [result, setResult] = useState<ClaimResult | null>(null);

  const challenge = useMemo(() => challengeWords(theme, seed), [theme, seed]);
  const analysis = useMemo(
    () => analyze({ text, theme, selectedMufradat: selKey ? selKey.split('|') : [] }),
    [text, theme, selKey]
  );
  const quests = useMemo(() => buildQuests(analysis, theme, challenge), [analysis, theme, challenge]);

  const lv = levelInfo(game.xp);
  const doneCount = quests.filter((q) => q.done).length;
  const liveStars = analysis.words >= 5 ? starsFor(analysis.rubric.total) : 0;
  const canClaim = analysis.words >= 5;

  const handleClaim = () => {
    const r = claimRound(theme.id, quests, analysis.rubric.total);
    setResult(r);
    setGame(r.state);
    onClaim?.();
  };

  return (
    <div className="mb-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4 sm:p-5">
      {/* Level */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100">Level {lv.level}: {lv.name}</div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">{game.xp} XP total</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5" title={`Perkiraan bintang ronde ini: ${liveStars}`}>
          {[1, 2, 3].map((n) => (
            <Star key={n} className={`w-5 h-5 ${n <= liveStars ? 'text-amber-500 fill-amber-500' : 'text-stone-300 dark:text-stone-600'}`} />
          ))}
        </div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
        <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.round(lv.progress * 100)}%` }} />
      </div>
      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
        {lv.xpIntoLevel} / {lv.xpForLevel} XP menuju level berikutnya
      </div>

      {/* Kata tantangan */}
      {challenge.length > 0 && (
        <div className="mt-4 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 dark:text-stone-200">
            Kata tantangan ronde ini
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {challenge.map((m) => {
              const hit = analysis.usedVocab.some((u) => u.word === m.word);
              return (
                <span
                  key={m.word}
                  className={`px-2.5 py-1 rounded-lg border text-xs ${hit
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                    : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200'}`}
                >
                  <span dir="rtl" className="font-arabic text-base">{m.word}</span> <span className="text-stone-500 dark:text-stone-400">{m.meaning}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Misi */}
      <div className="mt-4">
        <div className="text-xs font-bold text-stone-700 dark:text-stone-200 mb-2">Misi ({doneCount}/{quests.length})</div>
        <ul className="space-y-2">
          {quests.map((q) => (
            <li key={q.id} className="flex items-start gap-2.5">
              <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${q.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 dark:border-stone-600'}`}>
                {q.done && <Check className="w-3.5 h-3.5" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm ${q.done ? 'text-stone-500 line-through' : 'text-stone-800 dark:text-stone-100 font-medium'}`}>{q.title}</span>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 shrink-0">+{q.xp} XP</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                  <div className={`h-full ${q.done ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.round((q.current / q.target) * 100)}%` }} />
                </div>
                {!q.done && <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{q.hint}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleClaim}
        disabled={!canClaim}
        className="mt-4 w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm disabled:opacity-40 transition-colors"
      >
        Selesai ronde dan klaim hasil
      </button>
      {!canClaim && <p className="text-[11px] text-stone-500 mt-1.5 text-center">Tulis minimal 5 kata untuk mengklaim hasil.</p>}

      {/* Hasil ronde */}
      {result && (
        <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-sm text-stone-800 dark:text-stone-100">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((n) => (
              <Star key={n} className={`w-6 h-6 ${n <= result.stars ? 'text-amber-500 fill-amber-500' : 'text-stone-300 dark:text-stone-600'}`} />
            ))}
          </div>
          <p className="mt-1.5 font-bold">
            {result.xpGained > 0 ? `+${result.xpGained} XP` : 'Tidak ada XP baru'}
          </p>
          {!result.improved && (
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              XP hanya bertambah jika hasilmu melebihi ronde terbaik di tema ini. Perbaiki karanganmu lalu klaim lagi.
            </p>
          )}
          {result.levelAfter > result.levelBefore && (
            <p className="mt-1 font-bold text-amber-800 dark:text-amber-300">Naik ke level {result.levelAfter}.</p>
          )}
          {result.newBadges.map((b) => (
            <p key={b.id} className="text-xs mt-1">Lencana baru: <strong>{b.name}</strong> ({b.desc})</p>
          ))}
        </div>
      )}

      {/* Lencana */}
      <div className="mt-4">
        <div className="text-xs font-bold text-stone-700 dark:text-stone-200 mb-1.5">Lencana ({game.badges.length}/{BADGES.length})</div>
        <div className="flex flex-wrap gap-1.5">
          {BADGES.map((b) => {
            const has = game.badges.includes(b.id);
            return (
              <span
                key={b.id}
                title={b.desc}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${has
                  ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100'
                  : 'border-dashed border-stone-300 dark:border-stone-600 text-stone-400'}`}
              >
                {b.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const QuestPanel = React.memo(QuestPanelBase);
