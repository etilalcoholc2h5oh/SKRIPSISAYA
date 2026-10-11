import { analyze, formatRubricFeedback, levelLabel } from './analyzer.ts';
import type { StudentProgress } from './db';
import type { ThemeTopic } from '../data';

// Rekap nilai kelas: menggantikan rekap manual di buku/Excel. Tanpa AI.
export interface RecapRow {
  name: string;
  status: string;
  words: number;
  fikrah: number | '';
  tarkib: number | '';
  mufradat: number | '';
  imla: number | '';
  total: number | '';
  predikat: string;
  dinilaiGuru: boolean; // true bila guru sudah mengirim penilaian
}

const STATUS: Record<string, string> = { draft: 'Menulis', submitted: 'Sudah kirim', reviewed: 'Dinilai' };

// Saran nilai otomatis dari karangan siswa (null bila tidak ada teks Arab).
export function suggestFor(s: Pick<StudentProgress, 'draft' | 'selectedMufradat'>, theme: ThemeTopic) {
  const a = analyze({ text: s.draft || '', theme, selectedMufradat: s.selectedMufradat || [] });
  if (a.words === 0) return null;
  return { rubric: a.rubric, feedback: formatRubricFeedback(a) };
}

export function buildRecap(students: StudentProgress[], theme: ThemeTopic): RecapRow[] {
  return students
    .slice()
    .sort((x, y) => x.name.localeCompare(y.name, 'id'))
    .map((s) => {
      const words = (s.draft || '').trim().split(/\s+/).filter(Boolean).length;
      const r = s.rubricScores;
      const graded = !!r && s.status === 'reviewed';
      const sg = !r ? suggestFor(s, theme) : null;
      const shown = r || sg?.rubric || null;
      return {
        name: s.name,
        status: STATUS[s.status] || s.status,
        words,
        fikrah: shown ? shown.fikrah : '',
        tarkib: shown ? shown.tarkib : '',
        mufradat: shown ? shown.mufradat : '',
        imla: shown ? shown.imla : '',
        total: shown ? shown.total : '',
        predikat: shown ? levelLabel(shown.total) + (graded ? '' : ' (saran otomatis)') : '',
        dinilaiGuru: graded,
      };
    });
}

export function recapToCsv(rows: RecapRow[]): string {
  const head = ['No', 'Nama', 'Status', 'Jumlah Kata', 'Fikrah', 'Tarkib', 'Mufradat', "Imla'", 'Total', 'Predikat'];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [head.map(esc).join(',')];
  rows.forEach((r, i) =>
    lines.push([i + 1, r.name, r.status, r.words, r.fikrah, r.tarkib, r.mufradat, r.imla, r.total, r.predikat].map(esc).join(','))
  );
  return '﻿' + lines.join('\r\n'); // BOM agar Excel membaca UTF-8
}

export function classStats(rows: RecapRow[]) {
  const graded = rows.filter((r) => r.dinilaiGuru && r.total !== '');
  const totals = graded.map((r) => r.total as number);
  return {
    students: rows.length,
    graded: graded.length,
    average: totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10 : null,
    highest: totals.length ? Math.max(...totals) : null,
    lowest: totals.length ? Math.min(...totals) : null,
  };
}
