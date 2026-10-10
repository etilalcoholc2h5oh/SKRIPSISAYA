// Mesin analisis tulisan Insya' berbasis aturan (tanpa AI, tanpa internet).
//
// Semua keputusan berasal dari aturan yang bisa dijelaskan:
//   1. Teks Arab dinormalkan (harakat dibuang, hamza/ta marbuthah/alif maqshurah disamakan)
//   2. Kata dicocokkan dengan kosakata tema (dengan toleransi awalan و/ف/ب/ل/ك/ال dan akhiran)
//   3. Rubrik 4 aspek x 25 poin dihitung dari ukuran yang terukur (jumlah kata, cakupan
//      kosakata, kata penghubung, kelengkapan harakat, dst.), lalu dikurangi temuan kesalahan
//   4. Kesalahan hanya ditandai bila aturannya pasti (presisi tinggi), bukan menebak
//
// Hasilnya adalah ESTIMASI awal. Guru tetap menjadi penilai akhir.

import type { ThemeTopic, Mufradat, TarkibPattern } from '../data';

// ---------------------------------------------------------------------------
// Alat bantu huruf Arab
// ---------------------------------------------------------------------------

const IS_MARK = /[ً-ْٰ]/;
const MARK_RE = /[ً-ْٰ]/g;
const AR_LETTER = /[ء-ي]/;
const TANWIN = /[ًٌٍ]/;

export const stripHarakat = (s: string): string => s.replace(MARK_RE, '').replace(/ـ/g, '');

export const normalizeAr = (s: string): string =>
  stripHarakat(s)
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim();

const SPLIT = /[\s،؛؟۔.,;:!?()\[\]{}"'«»\-–—…\/\\|=+*]+/;

export const tokenize = (text: string): string[] => text.split(SPLIT).filter((t) => AR_LETTER.test(t));

const sentencesOf = (text: string): string[] =>
  text
    .split(/[.!?؟۔\n]+/)
    .map((s) => s.trim())
    .filter((s) => AR_LETTER.test(s));

const PREFIXES = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال', 'و', 'ف', 'ب', 'ل', 'ك', 'س'];
const SUFFIXES = ['ها', 'هم', 'هن', 'كم', 'كن', 'نا', 'ني', 'ه', 'ك', 'ي'];

// Semua kemungkinan batang kata setelah awalan/akhiran umum dilepas
function stems(norm: string): Set<string> {
  const out = new Set<string>([norm]);
  for (let round = 0; round < 2; round++) {
    for (const w of [...out]) {
      for (const p of PREFIXES) {
        if (w.startsWith(p) && w.length - p.length >= 3) out.add(w.slice(p.length));
      }
    }
  }
  for (const w of [...out]) {
    for (const sfx of SUFFIXES) {
      if (w.endsWith(sfx) && w.length - sfx.length >= 3) {
        const st = w.slice(0, -sfx.length);
        out.add(st);
        if (st.endsWith('ت')) out.add(st.slice(0, -1) + 'ه'); // مدرستي -> مدرسه
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Data bahasa (dikurasi manual)
// ---------------------------------------------------------------------------

// Kata fungsi (sudah dinormalkan). Tidak dihitung sebagai "kosakata isi".
const FUNCTION_WORDS = new Set(
  ('في الي من علي عن مع و ثم ف او ام ان لان لكن كي حتي لو اذا الذي التي الذين هذا هذه ذلك تلك هو هي هم هن انا نحن انت ' +
    'ما لا لم لن ليس كان قد بعد قبل عند بين حول خلال كل ايضا كذلك لذلك اذ حيث هناك هنا').split(' ')
);

// Kata fungsi yang menandakan keragaman struktur kalimat (tanpa "و" yang terlalu umum)
const GRAMMAR_WORDS = new Set(
  ('في الي من علي عن مع ثم ان لان لكن كي حتي لو اذا الذي التي الذين ما لا لم لن ليس كان قد بعد قبل عند بين كل ايضا كذلك لذلك حيث').split(' ')
);

// Penanda khas pola kalimat (dipakai untuk mendeteksi pola tema yang dipakai siswa)
const DISTINCTIVE_MARKERS = new Set(
  'الذي التي الذين اذا لو كي حتي لان لكن ليس لم لن كان انما'.split(' ')
);

interface Connector {
  ar: string;
  id: string; // dinormalkan
  arti: string;
  fungsi: 'pembuka' | 'urutan' | 'sebab' | 'akibat' | 'kontras' | 'tambahan' | 'penutup';
}

export const CONNECTORS: Connector[] = [
  { ar: 'فِي الْبِدَايَةِ', id: 'في البدايه', arti: 'pada awalnya', fungsi: 'pembuka' },
  { ar: 'فِي يَوْمٍ مِنَ الْأَيَّامِ', id: 'في يوم من الايام', arti: 'pada suatu hari', fungsi: 'pembuka' },
  { ar: 'أَوَّلًا', id: 'اولا', arti: 'pertama', fungsi: 'urutan' },
  { ar: 'ثَانِيًا', id: 'ثانيا', arti: 'kedua', fungsi: 'urutan' },
  { ar: 'ثُمَّ', id: 'ثم', arti: 'kemudian', fungsi: 'urutan' },
  { ar: 'بَعْدَ ذَلِكَ', id: 'بعد ذلك', arti: 'setelah itu', fungsi: 'urutan' },
  { ar: 'لِأَنَّ', id: 'لان', arti: 'karena', fungsi: 'sebab' },
  { ar: 'لِذَلِكَ', id: 'لذلك', arti: 'oleh karena itu', fungsi: 'akibat' },
  { ar: 'وَلَكِنْ', id: 'لكن', arti: 'tetapi', fungsi: 'kontras' },
  { ar: 'أَيْضًا', id: 'ايضا', arti: 'juga', fungsi: 'tambahan' },
  { ar: 'كَذَلِكَ', id: 'كذلك', arti: 'demikian juga', fungsi: 'tambahan' },
  { ar: 'وَأَخِيرًا', id: 'اخيرا', arti: 'akhirnya', fungsi: 'penutup' },
  { ar: 'فِي النِّهَايَةِ', id: 'في النهايه', arti: 'pada akhirnya', fungsi: 'penutup' },
  { ar: 'فِي الْخِتَامِ', id: 'في الختام', arti: 'sebagai penutup', fungsi: 'penutup' },
];

// Sifat umum (batang tanpa ال) yang harus mengikuti jenis kata benda
const ADJECTIVES = new Set(
  ('كبير صغير جديد قديم جميل طويل قصير سريع بطيء بطيئ نظيف واسع ضيق كثير قليل مهم ممتع رخيص ' +
    'رئيسي تقليدي مركزي سياحي طبيعي مدرسي عالمي محلي دولي عربي اسلامي ' +
    'سعيد حزين مريح متعب جيد سهل صعب غني فقير نشيط جذاب مزدحم هادئ شديد').split(' ')
);

// Salah ketik/ejaan yang sangat umum (kunci = tanpa harakat)
const COMMON_MISSPELL: Record<string, { benar: string; alasan: string }> = {
  'الي': { benar: 'إِلَى', alasan: 'huruf jar "ilaa" ditulis إلى (hamzah qath\' di awal, alif maqshurah di akhir)' },
  'إلي': { benar: 'إِلَى', alasan: 'akhir kata "ilaa" memakai alif maqshurah (ى), bukan ya (ي)' },
  'الى': { benar: 'إِلَى', alasan: 'awal kata "ilaa" memakai hamzah qath\' (إ)' },
  'فى': { benar: 'فِي', alasan: '"fii" ditulis dengan ya bertitik (في)' },
  'التى': { benar: 'الَّتِي', alasan: 'akhir "allatii" memakai ya bertitik (ي)' },
  'الذى': { benar: 'الَّذِي', alasan: 'akhir "alladzii" memakai ya bertitik (ي)' },
  'اللذي': { benar: 'الَّذِي', alasan: 'isim maushul mudzakkar ditulis الذي' },
  'هاذا': { benar: 'هَذَا', alasan: 'isim isyarah ditulis هذا (tanpa alif setelah ha)' },
  'هاذه': { benar: 'هَذِهِ', alasan: 'isim isyarah ditulis هذه (tanpa alif setelah ha)' },
  'ذالك': { benar: 'ذَلِكَ', alasan: 'isim isyarah ditulis ذلك (tanpa alif)' },
  'لاكن': { benar: 'لَكِنْ', alasan: '"lakin" ditulis لكن (tanpa alif)' },
  'لان': { benar: 'لِأَنَّ', alasan: '"karena" ditulis لأن / لأنّ dengan hamzah' },
  'لانه': { benar: 'لِأَنَّهُ', alasan: '"karena ia" ditulis لأنه dengan hamzah' },
  'انشاء': { benar: 'إِنْ شَاءَ', alasan: '"in syaa-a" ditulis dua kata: إن شاء الله' },
};

// ---------------------------------------------------------------------------
// Tipe hasil
// ---------------------------------------------------------------------------

export type FindingKind = 'nahwu' | 'imla' | 'harakat' | 'campur';

export interface Finding {
  kind: FindingKind;
  wrong: string;
  right?: string;
  reason: string;
}

export interface Rubric {
  fikrah: number;
  tarkib: number;
  mufradat: number;
  imla: number;
  total: number;
}

export interface Analysis {
  words: number;
  sentences: number;
  distinctWords: number;
  usedVocab: Mufradat[];
  unusedVocab: Mufradat[];
  vocabTarget: number;
  selectedUsed: string[];
  selectedUnused: string[];
  connectorsUsed: Connector[];
  hasClosing: boolean;
  structureTypes: string[];
  grammarWordsUsed: string[];
  patternsUsed: TarkibPattern[];
  patternsMissing: TarkibPattern[];
  harakatCoverage: number; // 0..1
  findings: Finding[];
  harakatHints: { word: string; vocalised: string }[];
  rubric: Rubric;
  notes: Record<'fikrah' | 'tarkib' | 'mufradat' | 'imla', string>;
}

export interface AnalyzeInput {
  text: string;
  theme: ThemeTopic;
  selectedMufradat?: string[];
}

// ---------------------------------------------------------------------------
// Kosakata tema
// ---------------------------------------------------------------------------

interface VocabEntry {
  item: Mufradat;
  alts: string[][]; // tiap alternatif = daftar token ternormalisasi (tanpa ال)
}

const vocabTokens = (raw: string): string[] =>
  raw
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+/)
    .map((t) => normalizeAr(t).replace(/^ال/, ''))
    .filter((t) => t.length >= 2 && !FUNCTION_WORDS.has(t));

function buildVocab(theme: ThemeTopic): VocabEntry[] {
  return (theme.mufradat || [])
    .map((item) => {
      const alts = item.word
        .split(/\s*[\/،]\s*/)
        .map(vocabTokens)
        .filter((a) => a.length > 0);
      return { item, alts };
    })
    .filter((e) => e.alts.length > 0);
}

function vocabUsed(entry: VocabEntry, allStems: Set<string>): boolean {
  return entry.alts.some((alt) => {
    const matched = alt.filter((t) => allStems.has(t)).length;
    const need = alt.length <= 2 ? alt.length : Math.ceil(alt.length * 0.66);
    return matched >= need && matched > 0;
  });
}

// ---------------------------------------------------------------------------
// Pencocokan harakat dengan kamus tema
// ---------------------------------------------------------------------------

interface Letter {
  ch: string;
  marks: string;
}

function toLetters(w: string): Letter[] {
  const out: Letter[] = [];
  for (const c of w.replace(/ـ/g, '')) {
    if (IS_MARK.test(c)) {
      if (out.length) out[out.length - 1].marks += c;
    } else {
      out.push({ ch: c, marks: '' });
    }
  }
  return out;
}

const lettersToString = (ls: Letter[]) => ls.map((l) => l.ch + l.marks).join('');

// Hanya vokal pendek/sukun (bukan syaddah/tanwin) untuk perbandingan
const vowelsOf = (marks: string) => marks.replace(/[ًّ-ٍٰ]/g, '');

function dropAl(ls: Letter[]): Letter[] {
  if (ls.length > 3 && ls[0].ch === 'ا' && ls[1].ch === 'ل') return ls.slice(2);
  return ls;
}

function buildKnownForms(theme: ThemeTopic): Map<string, Letter[][]> {
  const map = new Map<string, Letter[][]>();
  const sources: string[] = [];
  for (const m of theme.mufradat || []) sources.push(m.word);
  for (const t of theme.tarkib || []) sources.push(t.example, t.patternArabic);
  if (theme.contohInsya) sources.push(theme.contohInsya);
  for (const src of sources) {
    for (const tok of tokenize(src)) {
      const letters = dropAl(toLetters(tok));
      const marks = letters.reduce((n, l) => n + l.marks.length, 0);
      if (marks < 2) continue; // hanya kata yang benar-benar berharakat
      const key = letters.map((l) => l.ch).join('');
      const list = map.get(key) || [];
      if (!list.some((x) => lettersToString(x) === lettersToString(letters))) list.push(letters);
      map.set(key, list);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Deteksi kesalahan (aturan presisi tinggi)
// ---------------------------------------------------------------------------

function tanwinToVowel(s: string): string {
  return s
    .replace(/ٌ/g, 'ُ')
    .replace(/ٍ/g, 'ِ')
    .replace(/ًا?$/, 'َ')
    .replace(/ً/g, 'َ');
}

// Ubah sifat menjadi muannats dengan menjaga harakat akhir: الْكَبِيرُ -> الْكَبِيرَةُ
function toFeminine(tok: string): string {
  const m = tok.match(/^(.*[\u0621-\u064A])([\u064B-\u0652\u0670]*)$/);
  if (!m) return tok + 'ة';
  const [, base, tail] = m;
  return tail ? `${base}\u064Eة${tail}` : `${base}ة`;
}

function detectFindings(rawTokens: string[], text: string, theme: ThemeTopic, vocab: VocabEntry[]): Finding[] {
  const findings: Finding[] = [];
  const seen = new Set<string>();
  const add = (f: Finding) => {
    const key = `${f.kind}|${f.wrong}|${f.right || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push(f);
  };

  const plain = rawTokens.map(stripHarakat);
  const norm = rawTokens.map(normalizeAr);

  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];
    const p = plain[i];
    const prev = i > 0 ? plain[i - 1] : '';
    const prevRaw = i > 0 ? rawTokens[i - 1] : '';

    // N1: الذي setelah kata muannats (berakhiran ة)
    if (norm[i] === 'الذي' && prev.endsWith('ة')) {
      add({
        kind: 'nahwu',
        wrong: `${prevRaw} ${tok}`,
        right: `${prevRaw} الَّتِي`,
        reason: `"${prevRaw}" muannats (berakhiran ة), maka isim maushulnya الَّتِي, bukan الَّذِي`,
      });
    }

    // N2: sifat tidak mengikuti kata benda muannats
    const prevNoAl = prev.replace(/^ال/, '');
    const pNoAl = p.replace(/^ال/, '');
    const bothDefinite = prev.startsWith('ال') && p.startsWith('ال');
    const bothIndefinite = !prev.startsWith('ال') && !p.startsWith('ال');
    if (
      prev.endsWith('ة') &&
      (bothDefinite || bothIndefinite) &&
      ADJECTIVES.has(normalizeAr(pNoAl)) &&
      !p.endsWith('ة') &&
      prevNoAl.length >= 3
    ) {
      add({
        kind: 'nahwu',
        wrong: `${prevRaw} ${tok}`,
        right: `${prevRaw} ${toFeminine(tok)}`,
        reason: `sifat harus mengikuti kata benda muannats "${prevRaw}", jadi ditambah ة (muannats)`,
      });
    }

    // N3: ال + tanwin
    if (p.startsWith('ال') && p.length > 3 && TANWIN.test(tok.slice(-2)) && !/^الله/.test(p)) {
      add({
        kind: 'nahwu',
        wrong: tok,
        right: tanwinToVowel(tok),
        reason: 'kata berawalan ال (ma\'rifah) tidak boleh bertanwin',
      });
    }

    // N4: هذا + kata muannats ber-ال berakhiran ة
    if (norm[i] === 'ذلك' || norm[i] === 'هذا') {
      const next = plain[i + 1] || '';
      if (next.startsWith('ال') && next.endsWith('ة') && next.length > 4) {
        const fix = norm[i] === 'هذا' ? 'هَذِهِ' : 'تِلْكَ';
        add({
          kind: 'nahwu',
          wrong: `${tok} ${rawTokens[i + 1]}`,
          right: `${fix} ${rawTokens[i + 1]}`,
          reason: `"${rawTokens[i + 1]}" muannats, maka isim isyarahnya ${fix}`,
        });
      }
    }

    // N6: setelah huruf jar, kata benda ber-ال harus majrur (berharakat kasrah), bukan dhammah.
    // "من" hanya dianggap huruf jar bila mim-nya berkasrah (مِنْ / مِنَ); مَنْ/مَنِ ("siapa") dilewati.
    const isJarr =
      ['في', 'فى', 'إلى', 'إلي', 'الى', 'الي', 'على', 'عن', 'حتى'].includes(p) || (p === 'من' && /^مِ/.test(tok));
    if (isJarr && i + 1 < rawTokens.length) {
      const nextTok = rawTokens[i + 1];
      const nextPlain = plain[i + 1];
      const trailing = nextTok.match(/[ً-ْٰ]+$/)?.[0] || '';
      if (nextPlain.startsWith('ال') && nextPlain.length > 3 && !/^الله/.test(nextPlain) && /[ٌُ]/.test(trailing)) {
        const fixedNext = nextTok.slice(0, nextTok.length - trailing.length) + trailing.replace(/[ٌُ]/g, 'ِ');
        add({
          kind: 'nahwu',
          wrong: `${tok} ${nextTok}`,
          right: `${tok} ${fixedNext}`,
          reason: `setelah huruf jar "${tok}", kata benda harus majrur (berharakat kasrah di akhir), bukan dhammah`,
        });
      }
    }

    // N5: kata terulang berurutan
    if (i > 0 && norm[i] === norm[i - 1] && norm[i].length > 1 && !/^[وف]$/.test(norm[i])) {
      add({ kind: 'nahwu', wrong: `${prevRaw} ${tok}`, right: tok, reason: 'kata terulang dua kali berturut-turut (kemungkinan salah ketik)' });
    }

    // I1b: sifat umum berakhiran ه padahal seharusnya ة (ta marbuthah)
    const bareAdj = p.replace(/^ال/, ''); // dilaporkan tanpa ال, sama seperti aturan ejaan I1
    if (p.length >= 4 && p.endsWith('ه') && ADJECTIVES.has(normalizeAr(bareAdj.slice(0, -1)))) {
      add({
        kind: 'imla',
        wrong: bareAdj,
        right: bareAdj.slice(0, -1) + 'ة',
        reason: 'ta marbuthah ditulis ة (dua titik), bukan ه',
      });
    }

    // I2: salah ejaan sangat umum
    const mis = COMMON_MISSPELL[p];
    if (mis) {
      // "لان" bisa jadi bagian dari kata lain; hanya tandai bila berdiri sendiri tanpa hamzah
      add({ kind: 'imla', wrong: tok, right: mis.benar, reason: mis.alasan });
    }
  }

  // I1: ejaan (hamzah / ta marbuthah / alif maqshurah) dibanding kosakata tema
  const canonical = new Map<string, string>(); // kunci ternormalisasi (tanpa ال) -> bentuk tanpa harakat
  const spellSources: string[] = [];
  for (const e of vocab) spellSources.push(e.item.word);
  for (const t of theme.tarkib || []) spellSources.push(t.example);
  if (theme.contohInsya) spellSources.push(theme.contohInsya);
  for (const src of spellSources) {
    for (const w of tokenize(src)) {
      const bare = stripHarakat(w).replace(/^ال/, '');
      if (bare.length >= 3 && !canonical.has(normalizeAr(bare))) canonical.set(normalizeAr(bare), bare);
    }
  }
  for (let i = 0; i < rawTokens.length; i++) {
    const p = plain[i];
    if (COMMON_MISSPELL[p]) continue;
    const variants: string[] = [p, p.replace(/^ال/, '')];
    for (const pre of ['و', 'ف', 'ب', 'ل', 'ك']) {
      for (const v of [...variants]) if (v.startsWith(pre) && v.length > 3) variants.push(v.slice(1).replace(/^ال/, ''));
    }
    for (const v of variants) {
      const canon = canonical.get(normalizeAr(v));
      if (canon && canon !== v) {
        add({
          kind: 'imla',
          wrong: v,
          right: canon,
          reason: 'ejaan berbeda dari penulisan di materi tema (periksa hamzah, ta marbuthah ة, atau alif maqshurah ى)',
        });
        break;
      }
    }
  }

  // I3: huruf Latin bercampur
  const latin = text.split(SPLIT).filter((t) => /[A-Za-z]/.test(t));
  if (latin.length > 0) {
    add({
      kind: 'campur',
      wrong: latin.slice(0, 3).join(' '),
      reason: 'ada huruf Latin di dalam karangan Arab; tulis semuanya dalam huruf Arab',
    });
  }

  return findings;
}

// Tulis ulang kata siswa dengan harakat tengah dari kamus; harakat akhir (i'rab) tetap milik siswa
function correctedForm(prefix: Letter[], core: Letter[], ref: Letter[]): string {
  const fixed = core.map((l, i) => {
    if (i === core.length - 1) return l;
    const a = vowelsOf(l.marks);
    const b = vowelsOf(ref[i].marks);
    if (a && b && a !== b) {
      const shadda = l.marks.includes('\u0651') || ref[i].marks.includes('\u0651') ? '\u0651' : '';
      return { ch: l.ch, marks: shadda + b };
    }
    return l;
  });
  return lettersToString(prefix) + lettersToString(fixed);
}

function checkHarakat(rawTokens: string[], known: Map<string, Letter[][]>): {
  findings: Finding[];
  hints: { word: string; vocalised: string }[];
} {
  const findings: Finding[] = [];
  const hints: { word: string; vocalised: string }[] = [];
  const seenHint = new Set<string>();

  for (const tok of rawTokens) {
    const all = toLetters(tok);
    let letters = dropAl(all);
    let prefix = all.slice(0, all.length - letters.length);
    let refs = known.get(letters.map((l) => l.ch).join(''));
    if (!refs && letters.length > 3 && 'وفبلك'.includes(letters[0].ch)) {
      const rest = dropAl(letters.slice(1));
      const r2 = known.get(rest.map((l) => l.ch).join(''));
      if (r2) {
        prefix = all.slice(0, all.length - rest.length);
        letters = rest;
        refs = r2;
      }
    }
    if (!refs) continue;

    const marksCount = letters.reduce((n, l) => n + l.marks.length, 0);
    if (marksCount === 0) {
      const ref = refs[0];
      // bentuk kamus tanpa harakat akhir (i'rab) agar siswa menentukannya sendiri
      const v = lettersToString(prefix.map((l) => ({ ch: l.ch, marks: '' }))) +
        lettersToString(ref.map((l, i) => (i === ref.length - 1 ? { ch: l.ch, marks: '' } : l)));
      if (!seenHint.has(v)) {
        seenHint.add(v);
        hints.push({ word: tok, vocalised: v });
      }
      continue;
    }

    // Bandingkan harakat huruf non-akhir (huruf akhir = i'rab, tergantung kedudukan kata)
    const matches = (ref: Letter[]) => {
      for (let i = 0; i < letters.length - 1; i++) {
        const a = vowelsOf(letters[i].marks);
        const b = vowelsOf(ref[i].marks);
        if (a && b && a !== b) return false;
      }
      return true;
    };
    if (!refs.some(matches)) {
      findings.push({
        kind: 'harakat',
        wrong: tok,
        right: correctedForm(prefix, letters, refs[0]),
        reason: 'harakat pada huruf di tengah kata berbeda dari kamus tema',
      });
    }
  }
  return { findings, hints };
}

// ---------------------------------------------------------------------------
// Deteksi struktur kalimat & pola tema
// ---------------------------------------------------------------------------

const PRONOUN_START = new Set('هذا هذه هو هي هم نحن انا انت ذلك تلك'.split(' '));

function sentenceType(sentence: string): string {
  const toks = tokenize(sentence).map(normalizeAr);
  if (toks.length === 0) return 'lain';
  let first = toks[0];
  if (first.length > 3 && /^[وف]/.test(first)) first = first.slice(1);
  if (first === 'اذا' || first === 'لو') return 'syarat';
  if (['في', 'علي', 'بعد', 'قبل', 'عند', 'ثم', 'خلال', 'مع', 'من', 'الي'].includes(first)) return 'keterangan';
  if (first.startsWith('ال') || PRONOUN_START.has(first) || first === 'ان' || first === 'كان') return 'ismiyyah';
  if (/(ت|نا|وا|تم|تن)$/.test(first) && first.length >= 3) return 'fi\'liyyah madhi';
  if (/^[انيت]/.test(first) && first.length >= 4 && !FUNCTION_WORDS.has(first)) return 'fi\'liyyah mudhari\'';
  return 'lain';
}

function patternMarkers(p: TarkibPattern): string[] {
  const toks = tokenize(`${p.patternArabic} ${p.name}`).map(normalizeAr);
  return [...new Set(toks.filter((t) => DISTINCTIVE_MARKERS.has(t)))];
}

// ---------------------------------------------------------------------------
// Analisis utama
// ---------------------------------------------------------------------------

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function analyze(input: AnalyzeInput): Analysis {
  const { text, theme } = input;
  const rawTokens = tokenize(text);
  const norm = rawTokens.map(normalizeAr);
  const sentences = sentencesOf(text);
  const N = rawTokens.length;
  const S = sentences.length;

  const allStems = new Set<string>();
  for (const n of norm) for (const s of stems(n)) allStems.add(s);
  const joined = ` ${norm.join(' ')} `;

  // --- kosakata tema ---
  const vocab = buildVocab(theme);
  const used = vocab.filter((e) => vocabUsed(e, allStems)).map((e) => e.item);
  const unused = vocab.filter((e) => !vocabUsed(e, allStems)).map((e) => e.item);
  const T = vocab.length;
  const V = used.length;

  // --- pilihan siswa di langkah 2 ---
  const selected = (input.selectedMufradat || [])
    .map((w) => w.replace(/\([^)]*\)/g, '').trim())
    .filter(Boolean);
  const selUsed: string[] = [];
  const selUnused: string[] = [];
  for (const w of selected) {
    const toks = vocabTokens(w);
    const need = toks.length <= 2 ? toks.length : Math.ceil(toks.length * 0.66);
    const hit = toks.length > 0 && toks.filter((t) => allStems.has(t)).length >= need;
    (hit ? selUsed : selUnused).push(w);
  }

  // --- kata penghubung ---
  const connectorsUsed = CONNECTORS.filter((c) => {
    const sfx = c.id.includes(' ') ? '' : '(?:ني|نا|ه|ها|هم|ك|ي)?';
    const re = new RegExp(`(?:^| )[وف]?${c.id}${sfx}(?: |$)`);
    return re.test(joined.trim());
  });
  const hasClosing = connectorsUsed.some((c) => c.fungsi === 'penutup');

  // --- struktur ---
  const types = sentences.map(sentenceType).filter((t) => t !== 'lain');
  const structureTypes = [...new Set(types)];
  const grammarWordsUsed = [...new Set(norm.filter((w) => GRAMMAR_WORDS.has(w)))];
  const wellFormed = sentences.filter((s) => tokenize(s).length >= 3).length;

  // --- pola tema ---
  const patternsUsed: TarkibPattern[] = [];
  const patternsMissing: TarkibPattern[] = [];
  let verifiable = 0;
  for (const p of theme.tarkib || []) {
    const markers = patternMarkers(p);
    if (markers.length === 0) continue; // tidak bisa diverifikasi otomatis
    verifiable++;
    (markers.some((m) => allStems.has(m) || norm.includes(m)) ? patternsUsed : patternsMissing).push(p);
  }

  // --- harakat & kesalahan ---
  const letters = rawTokens.reduce((n, t) => n + (t.match(/[ء-ي]/g) || []).length, 0);
  const marks = rawTokens.reduce((n, t) => n + (t.match(MARK_RE) || []).length, 0);
  const harakatCoverage = letters === 0 ? 0 : clamp(marks / (0.7 * letters), 0, 1);

  const findings = detectFindings(rawTokens, text, theme, vocab);
  const hk = checkHarakat(rawTokens, buildKnownForms(theme));
  findings.push(...hk.findings);

  const nahwuCount = findings.filter((f) => f.kind === 'nahwu').length;
  const imlaCount = findings.filter((f) => f.kind === 'imla').length;
  const campurCount = findings.filter((f) => f.kind === 'campur').length;
  const harakatWrong = findings.filter((f) => f.kind === 'harakat').length;

  const distinct = new Set(norm).size;

  // ================= RUBRIK =================
  const notes = { fikrah: '', tarkib: '', mufradat: '', imla: '' };

  // --- Fikrah (25) = panjang 9 + tema 9 + alur 7 ---
  const lenPts = 9 * (0.6 * Math.min(1, N / 45) + 0.4 * Math.min(1, S / 5));
  const themeTarget = Math.max(1, Math.min(5, T));
  const themePts = 9 * Math.min(1, V / themeTarget);
  const nConn = connectorsUsed.length;
  const flowPts = (nConn === 0 ? 0 : nConn === 1 ? 2 : nConn === 2 ? 3.5 : 5) + (hasClosing ? 2 : 0);
  let fikrah = lenPts + themePts + flowPts;
  if (T > 0 && V === 0) fikrah = Math.min(fikrah, 12);
  if (N < 8) fikrah = Math.min(fikrah, 10);
  notes.fikrah = `${N} kata, ${S} kalimat; ${V} dari ${T} kosakata tema dipakai; ${nConn} kata penghubung${hasClosing ? ', ada penutup' : ', belum ada penutup'}`;

  // --- Tarkib (25) = kelengkapan 8 + variasi 7 + alat gramatikal 5 + pola tema 5 - penalti ---
  const completePts = S === 0 ? 0 : 8 * (wellFormed / S);
  const t = structureTypes.length;
  const varPts = t === 0 ? 0 : t === 1 ? 2 : t === 2 ? 4 : t === 3 ? 5.5 : 7;
  const gramRatio = Math.min(1, grammarWordsUsed.length / 6);
  const gramPts = 5 * gramRatio;
  const patternPts = verifiable > 0 ? 5 * Math.min(1, patternsUsed.length / Math.min(2, verifiable)) : 5 * gramRatio;
  const nahwuPenalty = Math.min(8, nahwuCount * 1.5);
  let tarkib = completePts + varPts + gramPts + patternPts - nahwuPenalty;
  if (N < 5) tarkib = Math.min(tarkib, 8);
  notes.tarkib = `${wellFormed} dari ${S} kalimat cukup lengkap; ${t} jenis struktur kalimat; ${grammarWordsUsed.length} kata penghubung/partikel gramatikal; ` +
    (verifiable > 0 ? `${patternsUsed.length} dari ${verifiable} pola tema terpakai; ` : '') +
    `${nahwuCount} kesalahan nahwu terdeteksi`;

  // --- Mufradat (25) = cakupan 12 + pilihan siswa 5 + variasi 5 + kekayaan 3 ---
  const covTarget = Math.max(1, Math.min(8, T));
  const covRatio = Math.min(1, V / covTarget);
  const coverPts = 12 * covRatio;
  const selPts = selected.length > 0 ? 5 * (selUsed.length / selected.length) : 5 * covRatio;
  const ttr = N === 0 ? 0 : distinct / N;
  const variedPts = 5 * Math.min(1, ttr / 0.75) * Math.min(1, N / 10);
  const themeNorms = new Set<string>();
  for (const e of vocab) for (const a of e.alts) for (const tk of a) themeNorms.add(tk);
  const contentWords = new Set(
    norm.filter((w) => !FUNCTION_WORDS.has(w) && ![...stems(w)].some((s) => themeNorms.has(s)))
  );
  const richPts = 3 * Math.min(1, contentWords.size / 15);
  let mufradat = coverPts + selPts + variedPts + richPts;
  if (N < 5) mufradat = Math.min(mufradat, 8);
  notes.mufradat =
    `${V} dari ${T} kosakata tema dipakai` +
    (selected.length > 0 ? `; ${selUsed.length} dari ${selected.length} kosakata pilihanmu masuk ke karangan` : '') +
    `; ${distinct} kata berbeda dari ${N} kata`;

  // --- Imla' (25) = harakat 9 + tanda baca 4 + ejaan 12 ---
  const harakatPts = Math.min(9, 2 + 7 * harakatCoverage);
  const terminators = (text.match(/[.!?؟]/g) || []).length;
  const latinPunct = /[,;?]/.test(text);
  let punct = 0;
  if (/[.!?؟]\s*$/.test(text.trim())) punct += 1;
  if (S > 0 && terminators >= Math.max(1, S - 1)) punct += 1;
  if (N < 25 || text.includes('،')) punct += 1;
  if (!latinPunct && S > 0 && N / Math.max(1, S) <= 25) punct += 1;
  const spellPts = Math.max(0, 12 - imlaCount * 2.5 - campurCount * 1 - harakatWrong * 1.5);
  let imla = harakatPts + Math.min(4, punct) + spellPts;
  if (N < 5) imla = Math.min(imla, 12);
  if (latinPunct) {
    findings.push({
      kind: 'imla',
      wrong: 'tanda baca Latin (, ? ;)',
      right: '، ؟ ؛',
      reason: 'gunakan tanda baca Arab: koma ،  tanda tanya ؟  titik koma ؛',
    });
  }
  notes.imla =
    `harakat terisi sekitar ${Math.round(harakatCoverage * 100)}%; ${imlaCount} kesalahan ejaan, ${harakatWrong} harakat tidak sesuai kamus` +
    (campurCount ? `, ada huruf Latin` : '');

  const r = (x: number, max = 25) => (N === 0 ? 0 : Math.round(clamp(x, 0, max)));
  const rubric: Rubric = {
    fikrah: r(fikrah),
    tarkib: r(tarkib),
    mufradat: r(mufradat),
    imla: r(imla),
    total: 0,
  };
  rubric.total = rubric.fikrah + rubric.tarkib + rubric.mufradat + rubric.imla;

  return {
    words: N,
    sentences: S,
    distinctWords: distinct,
    usedVocab: used,
    unusedVocab: unused,
    vocabTarget: covTarget,
    selectedUsed: selUsed,
    selectedUnused: selUnused,
    connectorsUsed,
    hasClosing,
    structureTypes,
    grammarWordsUsed,
    patternsUsed,
    patternsMissing,
    harakatCoverage,
    findings,
    harakatHints: hk.hints,
    rubric,
    notes,
  };
}

// ---------------------------------------------------------------------------
// Penyusun teks (hasil ditampilkan apa adanya di layar siswa)
// ---------------------------------------------------------------------------

export const levelLabel = (total: number): string =>
  total >= 85 ? 'Mumtaz (istimewa)' : total >= 75 ? 'Jayyid Jiddan (sangat baik)' : total >= 65 ? 'Jayyid (baik)' : total >= 55 ? 'Maqbul (cukup)' : 'Perlu ditingkatkan';

const KIND_LABEL: Record<FindingKind, string> = {
  nahwu: 'Nahwu',
  imla: "Imla'",
  harakat: 'Harakat',
  campur: 'Penulisan',
};

const formatFinding = (f: Finding): string =>
  `- ${KIND_LABEL[f.kind]}: ${f.wrong}${f.right ? `  →  ${f.right}` : ''}\n  (${f.reason})`;

const NO_TEXT = 'Tulis karangan bahasa Arab dulu (minimal satu kalimat), lalu coba lagi.';

export function formatEvaluation(a: Analysis): string {
  if (a.words === 0) return NO_TEXT;
  const lines: string[] = [];
  lines.push(`Ringkasan: ${a.words} kata, ${a.sentences} kalimat, ${a.usedVocab.length} dari ${a.usedVocab.length + a.unusedVocab.length} kosakata tema terpakai.`);

  const good: string[] = [];
  if (a.usedVocab.length >= Math.min(5, a.usedVocab.length + a.unusedVocab.length) && a.usedVocab.length > 0) good.push('Kosakata tema sudah banyak dipakai.');
  if (a.connectorsUsed.length >= 2) good.push(`Sudah memakai kata penghubung (${a.connectorsUsed.slice(0, 3).map((c) => c.ar).join('، ')}).`);
  if (a.hasClosing) good.push('Karangan punya kalimat penutup.');
  if (a.structureTypes.length >= 3) good.push('Struktur kalimat cukup bervariasi.');
  if (a.harakatCoverage >= 0.8) good.push('Harakat sudah hampir lengkap.');
  if (a.patternsUsed.length > 0) good.push(`Sudah memakai pola kalimat tema: ${a.patternsUsed.map((p) => p.name.split('(')[0].trim()).join('، ')}.`);
  if (a.findings.length === 0) good.push('Tidak ada kesalahan nahwu atau imla\' yang terdeteksi aturan.');
  if (good.length) lines.push('\nYang sudah baik:\n' + good.map((g) => `- ${g}`).join('\n'));

  const totalVocab = a.usedVocab.length + a.unusedVocab.length;
  const fix: string[] = [];
  if (totalVocab > 0 && a.usedVocab.length === 0) {
    fix.push('- Isi: belum ada satu pun kosakata tema yang dipakai. Pastikan karanganmu membahas tema yang dipilih.');
  }
  if (a.findings.length > 0 || fix.length > 0) {
    lines.push('\nPerlu diperbaiki:\n' + [...fix, ...a.findings.slice(0, 8).map(formatFinding)].join('\n'));
  }

  const tips: string[] = [];
  if (a.unusedVocab.length > 0) {
    tips.push(
      'Kosakata tema yang belum dipakai: ' +
        a.unusedVocab.slice(0, 4).map((m) => `${m.word} (${m.meaning})`).join('، ')
    );
  }
  if (a.patternsMissing.length > 0) {
    const p = a.patternsMissing[0];
    tips.push(`Coba pola "${p.name.split('(')[0].trim()}", contoh: ${p.example}`);
  }
  if (a.connectorsUsed.length < 2) tips.push('Tambahkan kata penghubung agar alurnya runtut, misalnya ثُمَّ (kemudian) atau بَعْدَ ذَلِكَ (setelah itu).');
  if (!a.hasClosing) tips.push('Akhiri dengan kalimat penutup, misalnya وَأَخِيرًا (akhirnya) atau فِي الْخِتَامِ (sebagai penutup).');
  if (a.harakatCoverage < 0.5) tips.push("Lengkapi harakat agar bacaan dan imla'mu jelas. Tombol Cek Harakat bisa menunjukkan contoh dari kamus tema.");
  if (a.selectedUnused.length > 0) tips.push(`Kosakata yang kamu pilih tapi belum dipakai: ${a.selectedUnused.slice(0, 4).join('، ')}`);
  if (tips.length) lines.push('\nSaran:\n' + tips.slice(0, 5).map((x) => `- ${x}`).join('\n'));

  lines.push('\nCatatan: pemeriksaan ini memakai aturan otomatis, bukan penilaian guru. Tidak semua kesalahan bisa terdeteksi.');
  return lines.join('\n');
}

export function formatRubricFeedback(a: Analysis): string {
  if (a.words === 0) return NO_TEXT;
  const r = a.rubric;
  const lines = [
    `Penilaian otomatis berbasis aturan: ${levelLabel(r.total)}`,
    `- Fikrah ${r.fikrah}/25: ${a.notes.fikrah}`,
    `- Tarkib ${r.tarkib}/25: ${a.notes.tarkib}`,
    `- Mufradat ${r.mufradat}/25: ${a.notes.mufradat}`,
    `- Imla' ${r.imla}/25: ${a.notes.imla}`,
  ];
  if (a.findings.length > 0) {
    lines.push('\nKoreksi:\n' + a.findings.slice(0, 6).map(formatFinding).join('\n'));
  }
  const next: string[] = [];
  if (a.unusedVocab.length > 0) next.push(`pakai kosakata ${a.unusedVocab.slice(0, 3).map((m) => m.word).join('، ')}`);
  if (!a.hasClosing) next.push('tambahkan kalimat penutup');
  if (a.harakatCoverage < 0.6) next.push('lengkapi harakat');
  if (next.length) lines.push(`\nUntuk revisi: ${next.join('; ')}.`);
  lines.push('\nSkor ini estimasi otomatis; guru dapat menyesuaikannya.');
  return lines.join('\n');
}

export function formatHarakatReport(a: Analysis): string {
  if (a.words === 0) return NO_TEXT;
  const pct = Math.round(a.harakatCoverage * 100);
  const lines = [`Kelengkapan harakat tulisanmu sekitar ${pct}%.`];
  const wrong = a.findings.filter((f) => f.kind === 'harakat');
  if (wrong.length > 0) {
    lines.push('\nHarakat yang tidak sesuai kamus tema:\n' + wrong.map(formatFinding).join('\n'));
  } else if (a.harakatCoverage > 0) {
    lines.push('Harakat pada kata-kata tema yang kamu tulis sudah sesuai kamus.');
  }
  if (a.harakatHints.length > 0) {
    lines.push(
      '\nKata berikut belum berharakat. Bentuk dari kamus tema (harakat huruf terakhir menyesuaikan kedudukan kata dalam kalimatmu):\n' +
        a.harakatHints.slice(0, 8).map((h) => `- ${h.word}  →  ${h.vocalised}`).join('\n')
    );
  } else if (a.harakatCoverage < 0.5) {
    lines.push('\nKata-katamu belum ada di kamus tema, jadi harakatnya perlu kamu tentukan sendiri berdasarkan kaidah nahwu dan sharaf.');
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Ide: dari catatan gagasan siswa + kamus tema (tanpa AI)
// ---------------------------------------------------------------------------

const idTokens = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4);

const sameStem = (a: string, b: string) => a === b || (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a)));

export function suggestIdeas(input: { ideas: string[]; text: string; theme: ThemeTopic; selectedMufradat?: string[] }): string {
  const { theme } = input;
  const notes = input.ideas.filter((i) => i && i.trim());
  const lines: string[] = [];

  // 1. Kosakata yang cocok dengan gagasan siswa (cocok arti Indonesia)
  if (notes.length > 0) {
    const noteWords = new Set(notes.flatMap(idTokens));
    const matches = (theme.mufradat || []).filter((m) => idTokens(m.meaning).some((mw) => [...noteWords].some((nw) => sameStem(nw, mw))));
    if (matches.length > 0) {
      lines.push('Kosakata yang cocok dengan gagasanmu:\n' + matches.slice(0, 5).map((m) => `- ${m.word}  (${m.meaning})`).join('\n'));
    }
  }

  // 2. Kerangka paragraf
  const a = analyze({ text: input.text, theme, selectedMufradat: input.selectedMufradat });
  if (a.words === 0) {
    lines.push(
      "Kerangka karangan:\n- Pembuka: kenalkan tema, misalnya فِي يَوْمٍ مِنَ الْأَيَّامِ (pada suatu hari) atau فِي الْبِدَايَةِ (pada awalnya).\n- Isi: urutkan kejadian dengan أَوَّلًا (pertama)، ثُمَّ (kemudian)، بَعْدَ ذَلِكَ (setelah itu).\n- Penutup: وَأَخِيرًا (akhirnya) atau فِي الْخِتَامِ (sebagai penutup)."
    );
  } else {
    const next: string[] = [];
    const wanted = ['urutan', 'sebab', 'kontras', 'tambahan', 'penutup'];
    const have = new Set(a.connectorsUsed.map((c) => c.fungsi));
    for (const f of wanted) {
      if (!have.has(f as Connector['fungsi'])) {
        const c = CONNECTORS.find((x) => x.fungsi === f);
        if (c) next.push(`${c.ar} (${c.arti})`);
      }
    }
    if (next.length) lines.push('Kata penghubung yang bisa kamu tambahkan:\n' + next.slice(0, 3).map((x) => `- ${x}`).join('\n'));
  }

  // 3. Pola kalimat tema yang belum dipakai
  const patterns = a.words === 0 ? (theme.tarkib || []).slice(0, 2) : a.patternsMissing.slice(0, 2);
  if (patterns.length > 0) {
    lines.push('Pola kalimat dari tema ini:\n' + patterns.map((p) => `- ${p.name}\n  contoh: ${p.example}\n  ${p.explanation}`).join('\n'));
  }

  // 4. Kosakata belum dipakai
  const unused = a.words === 0 ? (theme.mufradat || []).slice(0, 4) : a.unusedVocab.slice(0, 4);
  if (unused.length > 0) {
    lines.push('Kosakata tema untuk dicoba:\n' + unused.map((m) => `- ${m.word}  (${m.meaning})`).join('\n'));
  }

  // 5. Contoh pembuka jika masih kosong
  if (a.words === 0 && theme.contohInsya) {
    const first = sentencesOf(theme.contohInsya)[0];
    if (first) lines.push(`Contoh kalimat pembuka untuk tema ini:\n- ${first}`);
  }

  return lines.length > 0 ? lines.join('\n\n') : 'Tulis dulu satu atau dua gagasanmu, lalu tekan tombol ini lagi untuk mendapat saran.';
}
