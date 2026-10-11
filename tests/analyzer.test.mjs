// Pengujian mesin penilaian otomatis (src/lib/analyzer.ts).
// Jalankan: npm run test   (butuh Node 22.18+ karena memuat berkas .ts langsung)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, formatEvaluation, formatRubricFeedback, formatHarakatReport, suggestIdeas, stripHarakat } from '../src/lib/analyzer.ts';
import { THEMES } from '../src/data.ts';

const safar = THEMES.find((t) => t.id === 'safar');
const pasar = THEMES.find((t) => t.id === 'tasawwuq');

const custom = {
  id: 'custom-x', titleArabic: 'الرِّيَاضَةُ', titleIndo: 'Olahraga', grade: 'Tema Sendiri', imageUrl: '', prompt: 'p',
  mufradat: [
    { word: 'كُرَةُ الْقَدَمِ', meaning: 'sepak bola', pronunciation: '', icon: '📝', category: 'Kosakata' },
    { word: 'مَلْعَبٌ', meaning: 'lapangan', pronunciation: '', icon: '📝', category: 'Kosakata' },
    { word: 'لَاعِبٌ', meaning: 'pemain', pronunciation: '', icon: '📝', category: 'Kosakata' },
  ],
  tarkib: [], contohInsya: '', kesalahanUmum: [],
};

const wrongKinds = (a, kind) => a.findings.filter((f) => f.kind === kind);

test('contoh karangan yang benar tidak memicu temuan palsu dan skornya tinggi', () => {
  for (const id of ['tasawwuq', 'sihhah', 'safar', 'hajj', 'tiknulujiya', 'biah']) {
    const th = THEMES.find((t) => t.id === id);
    const a = analyze({ text: th.contohInsya, theme: th });
    assert.equal(a.findings.length, 0, `${id}: ${JSON.stringify(a.findings)}`);
    assert.ok(a.rubric.total >= 70, `${id}: total ${a.rubric.total}`);
  }
});

test('total selalu jumlah empat aspek dan tiap aspek bilangan bulat 0-25', () => {
  const a = analyze({ text: safar.contohInsya, theme: safar });
  const r = a.rubric;
  assert.equal(r.total, r.fikrah + r.tarkib + r.mufradat + r.imla);
  for (const k of ['fikrah', 'tarkib', 'mufradat', 'imla']) assert.ok(Number.isInteger(r[k]) && r[k] >= 0 && r[k] <= 25);
});

test('input kosong, spasi, Latin, atau emoji menghasilkan skor 0 tanpa error', () => {
  for (const txt of ['', '   \n ', '... ,,, ؟؟', 'hello 123', '😀😀']) {
    const a = analyze({ text: txt, theme: safar });
    assert.equal(a.rubric.total, 0);
    assert.ok(formatEvaluation(a) && formatRubricFeedback(a) && formatHarakatReport(a));
  }
});

test('karangan pendek mendapat skor jauh lebih rendah daripada karangan utuh', () => {
  const short = analyze({ text: 'ذَهَبْتُ إِلَى الْمَحَطَّةِ.', theme: safar }).rubric.total;
  const full = analyze({ text: safar.contohInsya, theme: safar }).rubric.total;
  assert.ok(full - short >= 30, `${short} vs ${full}`);
});

test('karangan di luar tema ditandai dan fikrah rendah', () => {
  const a = analyze({ text: 'أُحِبُّ كُرَةَ الْقَدَمِ كَثِيرًا. لَعِبْتُ مَعَ أَصْدِقَائِي فِي الْمَلْعَبِ. فَازَ فَرِيقُنَا. كُنْتُ سَعِيدًا.', theme: safar });
  assert.equal(a.usedVocab.length, 0);
  assert.ok(a.rubric.fikrah <= 8);
  assert.match(formatEvaluation(a), /belum ada satu pun kosakata tema/);
});

test('nahwu: الذي setelah kata muannats dikoreksi menjadi الَّتِي', () => {
  const a = analyze({ text: 'رَكِبْنَا الْحَافِلَةُ الَّذِي تَنْطَلِقُ مِنَ الْمَحَطَّةِ.', theme: safar });
  const f = wrongKinds(a, 'nahwu');
  assert.equal(f.length, 1);
  assert.match(f[0].right, /الَّتِي/);
});

test('nahwu: sifat tidak mengikuti muannats dan ال + tanwin dan isim isyarah', () => {
  const a = analyze({ text: 'هَذَا الْمَحَطَّةُ الْكَبِيرُ. الْكِتَابٌ جَدِيدٌ.', theme: safar });
  const reasons = wrongKinds(a, 'nahwu').map((f) => f.reason).join(' | ');
  assert.match(reasons, /isim isyarahnya/);
  assert.match(reasons, /sifat harus mengikuti/);
  assert.match(reasons, /tidak boleh bertanwin/);
  const sifat = wrongKinds(a, 'nahwu').find((f) => /sifat harus/.test(f.reason));
  assert.match(sifat.right, /الْكَبِيرَةُ$/, 'harakat akhir dipertahankan');
});

test('nahwu: setelah huruf jar kata benda harus majrur, dengan penjagaan مَنْ dan frasa benar', () => {
  const bad = analyze({ text: 'ذَهَبْتُ إِلَى الْمَحَطَّةُ. جَلَسْتُ فِي الْحَافِلَةُ. خَرَجْنَا مِنَ الْبَيْتُ.', theme: safar });
  const jarr = wrongKinds(bad, 'nahwu').filter((f) => /huruf jar/.test(f.reason));
  assert.equal(jarr.length, 3);
  assert.equal(jarr[0].right, 'إِلَى الْمَحَطَّةِ');
  // benar: tidak ditandai
  const ok1 = analyze({ text: 'ذَهَبْتُ إِلَى الْمَحَطَّةِ. جَلَسْتُ فِي الْحَافِلَةِ. خَرَجْنَا مِنَ الْبَيْتِ.', theme: safar });
  assert.equal(wrongKinds(ok1, 'nahwu').length, 0);
  // مَنِ الْمُعَلِّمُ = "siapa gurunya?" (benar, bukan huruf jar), dan tanpa harakat tidak menebak
  const ok2 = analyze({ text: 'مَنِ الْمُعَلِّمُ؟ فِي الْبَيْتِ الْكَبِيرُ. إلى المحطة', theme: safar });
  assert.equal(wrongKinds(ok2, 'nahwu').filter((f) => /huruf jar/.test(f.reason)).length, 0);
});

test('memperbaiki kesalahan menghapus temuan dan menaikkan skor tarkib', () => {
  const bad = analyze({ text: 'رَكِبْنَا الْحَافِلَةُ الَّذِي تَنْطَلِقُ مِنَ الْمَحَطَّةِ.', theme: safar });
  const good = analyze({ text: 'رَكِبْنَا الْحَافِلَةَ الَّتِي تَنْطَلِقُ مِنَ الْمَحَطَّةِ.', theme: safar });
  assert.equal(wrongKinds(good, 'nahwu').length, 0);
  assert.ok(good.rubric.tarkib > bad.rubric.tarkib);
});

test("imla': ta marbuthah ه, إلى tanpa hamzah, dan kata dari materi tema", () => {
  const a = analyze({ text: 'وَصَلْنَا الي القريه الْكَبِيره.', theme: safar });
  const imla = wrongKinds(a, 'imla').map((f) => stripHarakat(f.wrong));
  assert.ok(imla.includes('الي'));
  assert.ok(imla.includes('قريه'));
  assert.ok(imla.includes('كبيره'));
});

test("imla': huruf Latin dan tanda baca Latin ditandai", () => {
  const a = analyze({ text: 'ذَهَبْتُ with my family, ثُمَّ وَصَلْتُ.', theme: safar });
  assert.equal(wrongKinds(a, 'campur').length, 1);
  assert.ok(wrongKinds(a, 'imla').some((f) => /tanda baca Latin/.test(f.wrong)));
});

test('harakat: harakat tengah kata yang salah dikoreksi, harakat akhir milik siswa dipertahankan', () => {
  const a = analyze({ text: 'ذَهَبْتُ إِلَى الْمَحِطَّةِ.', theme: safar });
  const f = wrongKinds(a, 'harakat');
  assert.equal(f.length, 1);
  assert.equal(f[0].right, 'الْمَحَطَّةِ');
});

test('cek harakat memberi bentuk kamus untuk kata tanpa harakat', () => {
  const a = analyze({ text: 'ركبنا الحافلة الى المحطة', theme: safar });
  assert.ok(a.harakatHints.length >= 2);
  assert.match(formatHarakatReport(a), /belum berharakat/);
});

test('tanpa harakat: imla lebih rendah tetapi tidak ada temuan palsu', () => {
  const withH = analyze({ text: safar.contohInsya, theme: safar });
  const without = analyze({ text: stripHarakat(safar.contohInsya), theme: safar });
  assert.equal(without.findings.filter((f) => f.kind !== 'harakat').length, 0);
  assert.ok(without.rubric.imla < withH.rubric.imla);
});

test('kosakata dua kata tidak dihitung terpakai bila hanya satu katanya muncul', () => {
  const a = analyze({ text: 'ذَهَبْتُ إِلَى السُّوقِ.', theme: pasar });
  assert.ok(!a.usedVocab.some((m) => m.meaning === 'Supermarket / Swalayan'));
});

test('tema buatan sendiri (tanpa pola kalimat dan contoh) tetap bisa dinilai', () => {
  const a = analyze({ text: 'لَعِبْتُ كُرَةَ الْقَدَمِ فِي الْمَلْعَبِ مَعَ اللَّاعِبِينَ. ثُمَّ فُزْنَا. وَأَخِيرًا رَجَعْنَا إِلَى الْبَيْتِ.', theme: custom });
  assert.ok(a.usedVocab.length >= 2);
  assert.ok(a.rubric.total > 30);
});

test('hasil deterministik: input sama selalu menghasilkan hasil sama', () => {
  assert.deepEqual(analyze({ text: safar.contohInsya, theme: safar }), analyze({ text: safar.contohInsya, theme: safar }));
});

test('ide mencocokkan gagasan siswa dengan kosakata tema', () => {
  const out = suggestIdeas({ ideas: ['beli buah dan sayur di pasar', '', ''], text: '', theme: pasar });
  assert.match(out, /Kosakata yang cocok dengan gagasanmu/);
  assert.match(out, /Pasar Tradisional/);
});

test('ketahanan: 300 teks acak tidak membuat error dan skor tetap valid', () => {
  const letters = 'ابتثجحخدذرزسشصضطظعغفقكلمنهويءأإآةىؤئ';
  const marks = 'ًٌٍَُِّْ';
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < 300; i++) {
    let txt = '';
    for (let j = 0, n = Math.floor(rnd() * 200); j < n; j++) {
      const r = rnd();
      txt += r < 0.6 ? letters[Math.floor(rnd() * letters.length)] : r < 0.75 ? marks[Math.floor(rnd() * marks.length)] : r < 0.88 ? ' ' : r < 0.93 ? '.' : r < 0.96 ? '،' : r < 0.98 ? 'a' : '\n';
    }
    const a = analyze({ text: txt, theme: i % 3 === 0 ? custom : safar });
    const r = a.rubric;
    assert.equal(r.total, r.fikrah + r.tarkib + r.mufradat + r.imla);
    for (const k of ['fikrah', 'tarkib', 'mufradat', 'imla']) assert.ok(Number.isInteger(r[k]) && r[k] >= 0 && r[k] <= 25);
  }
});

test('peta tulisan: kosakata tema, kata penghubung, dan kesalahan diberi penanda yang sejalan dengan temuan', async () => {
  const { annotateText } = await import('../src/lib/analyzer.ts');
  const text = 'ذَهَبْتُ إِلَى الْمَحَطَّةُ. ثُمَّ رَكِبْنَا الْحَافِلَةَ الَّذِي تَنْطَلِقُ. وَصَلْنَا الي القريه.';
  const a = analyze({ text, theme: safar });
  const m = annotateText(text, safar, a.findings);
  assert.equal(m.length, 3);
  const flat = m.flatMap((s) => s.words);
  const byText = (t) => flat.find((w) => stripHarakat(w.text).replace(/[.]/g, '') === t);
  // hanya kata yang salah yang merah (إِلَى sendiri benar)
  assert.equal(byText('المحطة').kind, 'error');
  assert.equal(byText('إلى').kind, 'plain');
  assert.equal(byText('ثم').kind, 'connector');
  assert.equal(byText('الذي').kind, 'error');
  assert.equal(byText('الحافلة').kind, 'plain'); // bukan kosakata tema Safar
  assert.equal(byText('الي').kind, 'error');
  assert.equal(byText('القريه').kind, 'error');
  assert.equal(m[0].wordCount, 3);
  // kosakata tema ditandai
  const ok = analyze({ text: safar.contohInsya, theme: safar });
  const mm = annotateText(safar.contohInsya, safar, ok.findings).flatMap((s) => s.words);
  assert.ok(mm.some((w) => w.kind === 'vocab'));
  assert.equal(mm.filter((w) => w.kind === 'error').length, 0);
  // teks kosong atau non-Arab
  assert.deepEqual(annotateText('', safar, []), []);
  assert.deepEqual(annotateText('hello world', safar, []), []);
});

test('gamifikasi: misi, level, XP', async () => {
  const { buildQuests, challengeWords, levelInfo, roundXp, stars } = await import('../src/lib/quests.ts');
  const theme = THEMES.find((t) => t.id === 'safar') || THEMES[0];
  const ch = challengeWords(theme, 'ABC123');
  assert.equal(ch.length, 3);
  assert.deepEqual(ch.map((m) => m.word), challengeWords(theme, 'ABC123').map((m) => m.word)); // stabil
  const empty = buildQuests(analyze({ text: '', theme }), theme, ch);
  assert.equal(empty.filter((q) => q.done).length, 0);
  const full = buildQuests(analyze({ text: theme.contohInsya, theme }), theme, ch);
  assert.ok(full.some((q) => q.done), 'contoh karangan menyelesaikan minimal satu misi');
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(60).level, 2);
  assert.equal(levelInfo(240).level, 3);
  assert.equal(stars(90), 3);
  assert.equal(stars(40), 0);
  assert.equal(roundXp(empty, 0), 0);
});

test('rekap kelas: saran nilai, CSV, statistik', async () => {
  const { buildRecap, recapToCsv, classStats, suggestFor } = await import('../src/lib/recap.ts');
  const theme = THEMES.find((t) => t.id === 'safar') || THEMES[0];
  const mk = (name, draft, status, rubricScores) => ({ id: name, name, draft, status, rubricScores, selectedMufradat: [] });
  const students = [
    mk('Budi', theme.contohInsya, 'submitted'),
    mk('Ani', '', 'draft'),
    mk('Citra', theme.contohInsya, 'reviewed', { fikrah: 20, tarkib: 20, mufradat: 20, imla: 20, total: 80 }),
  ];
  const rows = buildRecap(students, theme);
  assert.deepEqual(rows.map((r) => r.name), ['Ani', 'Budi', 'Citra']); // urut abjad
  assert.equal(rows[0].total, ''); // tanpa teks: tidak ada nilai palsu
  assert.ok(rows[1].total > 0 && rows[1].predikat.includes('saran otomatis') && !rows[1].dinilaiGuru);
  assert.equal(rows[2].total, 80);
  assert.equal(suggestFor(students[1], theme), null);
  const csv = recapToCsv(rows);
  assert.ok(csv.startsWith('﻿"No","Nama"'));
  assert.equal(csv.split('\r\n').length, 4);
  const st = classStats(rows);
  assert.equal(st.graded, 1);
  assert.equal(st.average, 80);
});

test('latihan: tebak arti dan susun kalimat', async () => {
  const { makeMeaningQuiz, makeOrderItems } = await import('../src/lib/warmup.ts');
  for (const th of THEMES) {
    const qs = makeMeaningQuiz(th, 'S1');
    assert.ok(qs.length >= 2, th.id);
    for (const q of qs) {
      assert.ok(q.options.includes(q.answer));
      assert.equal(new Set(q.options).size, q.options.length); // tanpa pilihan ganda sama
    }
    assert.deepEqual(qs, makeMeaningQuiz(th, 'S1')); // stabil
    const items = makeOrderItems(th, 'S1');
    for (const it of items) {
      assert.deepEqual(it.shuffled.slice().sort(), it.words.slice().sort());
      assert.notEqual(it.shuffled.join(' '), it.words.join(' '));
    }
  }
  assert.deepEqual(makeOrderItems({ ...THEMES[0], contohInsya: '' }, 'x'), []);
});
