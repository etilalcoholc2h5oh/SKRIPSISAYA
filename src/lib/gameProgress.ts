import { BADGES, levelInfo, roundXp, stars } from './quests';
import type { BadgeDef, Quest } from './quests';

// Kemajuan permainan disimpan di perangkat: hanya angka (XP, lencana, nilai terbaik),
// BUKAN isi karangan, sehingga tidak bisa dicontek siswa lain.
const KEY = 'kitabah_game_v1';

interface GameState {
  xp: number;
  badges: string[];
  best: Record<string, { xp: number; stars: number }>; // per tema
  rounds: number;
}

const empty = (): GameState => ({ xp: 0, badges: [], best: {}, rounds: 0 });

export function loadGame(): GameState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw.xp === 'number') return { ...empty(), ...raw };
  } catch { /* abaikan */ }
  return empty();
}

function save(s: GameState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* abaikan */ }
}

export interface ClaimResult {
  xpGained: number;
  stars: number;
  levelBefore: number;
  levelAfter: number;
  newBadges: BadgeDef[];
  improved: boolean;
  state: GameState;
}

// Klaim hasil ronde. XP hanya bertambah sebesar selisih dari ronde terbaik di tema yang sama,
// jadi mengulang-ulang klaim tidak bisa dipakai untuk "menambang" XP.
export function claimRound(themeId: string, quests: Quest[], total: number): ClaimResult {
  const s = loadGame();
  const xpRound = roundXp(quests, total);
  const st = stars(total);
  const prev = s.best[themeId] || { xp: 0, stars: 0 };
  const gain = Math.max(0, xpRound - prev.xp);
  const levelBefore = levelInfo(s.xp).level;

  s.xp += gain;
  s.rounds += 1;
  s.best[themeId] = { xp: Math.max(prev.xp, xpRound), stars: Math.max(prev.stars, st) };

  const done = (id: string) => quests.find((q) => q.id === id)?.done;
  const earned: string[] = [];
  if (s.rounds >= 1) earned.push('pertama');
  if (st === 3) earned.push('bintang3');
  if (done('bersih')) earned.push('bersih');
  if (quests.every((q) => q.done)) earned.push('lengkap');
  if (Object.values(s.best).filter((b) => b.xp > 0).length >= 3) earned.push('jelajah');

  const fresh = earned.filter((id) => !s.badges.includes(id));
  s.badges = [...s.badges, ...fresh];
  save(s);

  return {
    xpGained: gain,
    stars: st,
    levelBefore,
    levelAfter: levelInfo(s.xp).level,
    newBadges: BADGES.filter((b) => fresh.includes(b.id)),
    improved: gain > 0,
    state: s,
  };
}
