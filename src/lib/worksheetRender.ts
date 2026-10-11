// Menggambar lembar karangan langsung ke canvas (A4, 150 dpi), tanpa html2canvas dan tanpa bergantung pada CSS.
// Huruf Arab dibentuk oleh mesin teks browser sendiri, jadi sambungan huruf dan harakat benar.

export interface WorksheetData {
  name: string;
  session: string;
  themeTitle: string;
  themeArabic: string;
  date: string;
  ideas: string[]; // pembuka, isi, penutup
  draft: string;
  handwritingDataUrl?: string;
  rubric?: { fikrah: number; tarkib: number; mufradat: number; imla: number; total: number };
  feedback?: string;
}

export const PAGE_W = 1240; // 210 mm pada 150 dpi
export const PAGE_H = 1754; // 297 mm

const MARGIN_X = 110;
const MARGIN_TOP = 110;
const MARGIN_BOTTOM = 110;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const LATIN = '"Plus Jakarta Sans", "Quicksand", Arial, Helvetica, sans-serif';
const ARABIC = '"Noto Naskh Arabic", "Amiri", "Traditional Arabic", serif';

const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load(`32px ${ARABIC}`, 'بسم'),
      document.fonts.load(`24px ${LATIN}`, 'Abc'),
      document.fonts.load(`bold 24px ${LATIN}`, 'Abc'),
    ]);
  } catch {
    /* font cadangan sistem akan dipakai */
  }
}

export async function renderWorksheetPages(d: WorksheetData): Promise<HTMLCanvasElement[]> {
  await ensureFonts();
  const pages: HTMLCanvasElement[] = [];
  let canvas!: HTMLCanvasElement;
  let ctx!: CanvasRenderingContext2D;
  let y = 0;

  const newPage = () => {
    canvas = document.createElement('canvas');
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const c = canvas.getContext('2d');
    if (!c) throw new Error('Canvas tidak tersedia');
    ctx = c;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    pages.push(canvas);
    y = MARGIN_TOP;
  };
  const ensure = (h: number) => {
    if (y + h > PAGE_H - MARGIN_BOTTOM) newPage();
  };

  // Pecah teks menjadi baris selebar maxW. Kata yang lebih lebar dari kotak dipotong per huruf.
  const wrap = (text: string, font: string, maxW: number): string[] => {
    ctx.font = font;
    const out: string[] = [];
    for (const para of text.replace(/\r/g, '').split('\n')) {
      if (!para.trim()) { out.push(''); continue; }
      let line = '';
      for (const word of para.split(/\s+/).filter(Boolean)) {
        let w = word;
        const trial = line ? `${line} ${w}` : w;
        if (ctx.measureText(trial).width <= maxW) { line = trial; continue; }
        if (line) { out.push(line); line = ''; }
        while (ctx.measureText(w).width > maxW && w.length > 1) {
          let n = w.length - 1;
          while (n > 1 && ctx.measureText(w.slice(0, n)).width > maxW) n--;
          out.push(w.slice(0, n));
          w = w.slice(n);
        }
        line = w;
      }
      if (line) out.push(line);
    }
    return out;
  };

  const drawLines = (lines: string[], font: string, lineH: number, opts: { rtl?: boolean; x?: number; w?: number; color?: string } = {}) => {
    const x0 = opts.x ?? MARGIN_X;
    const w = opts.w ?? CONTENT_W;
    ctx.font = font;
    for (const line of lines) {
      ensure(lineH);
      ctx.fillStyle = opts.color || '#000000';
      ctx.textBaseline = 'middle';
      if (opts.rtl) {
        ctx.direction = 'rtl';
        ctx.textAlign = 'right';
        ctx.fillText(line, x0 + w, y + lineH / 2);
      } else {
        ctx.direction = 'ltr';
        ctx.textAlign = 'left';
        ctx.fillText(line, x0, y + lineH / 2);
      }
      y += lineH;
    }
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
  };

  const paragraph = (text: string, opts: { size?: number; bold?: boolean; lineH?: number; x?: number; w?: number; color?: string } = {}) => {
    const size = opts.size ?? 26;
    const arabic = hasArabic(text);
    const font = arabic ? `${size + 6}px ${ARABIC}` : `${opts.bold ? 'bold ' : ''}${size}px ${LATIN}`;
    const lineH = opts.lineH ?? Math.round(size * (arabic ? 2.1 : 1.5));
    const w = opts.w ?? CONTENT_W;
    drawLines(wrap(text, font, w), font, lineH, { rtl: arabic, x: opts.x, w, color: opts.color });
  };

  const heading = (text: string, need = 0) => {
    ensure(70 + need);
    y += 14;
    drawLines([text], `bold 28px ${LATIN}`, 40);
    y += 6;
  };

  const rule = (thick = 2) => {
    ensure(10);
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, y);
    ctx.lineTo(PAGE_W - MARGIN_X, y);
    ctx.stroke();
    y += 14;
  };

  newPage();

  // Judul
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 40px ${LATIN}`;
  ctx.fillText("Lembar Karangan Insya'", PAGE_W / 2, y + 24);
  ctx.textAlign = 'left';
  y += 60;
  rule(3);
  y += 6;

  // Identitas
  const rows: [string, string][] = [
    ['Nama', d.name],
    ['Kelas / Sesi', d.session],
    ['Tema', d.themeTitle],
    ['Tanggal', d.date],
  ];
  for (const [k, v] of rows) {
    const lines = wrap(v, `26px ${LATIN}`, CONTENT_W - 230);
    const h = Math.max(1, lines.length) * 38;
    ensure(h);
    const top = y;
    drawLines([k], `26px ${LATIN}`, 38);
    y = top;
    drawLines([':'], `26px ${LATIN}`, 38, { x: MARGIN_X + 200, w: 20 });
    y = top;
    drawLines(lines, `26px ${LATIN}`, 38, { x: MARGIN_X + 230, w: CONTENT_W - 230 });
  }
  if (d.themeArabic) {
    drawLines([d.themeArabic], `32px ${ARABIC}`, 64, { rtl: true });
  }
  y += 10;

  // Kerangka gagasan
  heading('Kerangka Gagasan', 160);
  const labels = ['Pembuka', 'Isi', 'Penutup'];
  labels.forEach((lab, i) => {
    const txt = (d.ideas?.[i] || '').trim() || '-';
    if (hasArabic(txt)) {
      drawLines([`${i + 1}. ${lab}:`], `26px ${LATIN}`, 38);
      paragraph(txt, { size: 26 });
    } else {
      paragraph(`${i + 1}. ${lab}: ${txt}`, { size: 26 });
    }
  });
  y += 10;

  // Karangan
  heading('Karangan', 200);
  const draft = (d.draft || '').trim();
  const boxPadding = 22;
  const startPage = pages.length;
  const startY = y;
  ctx.lineWidth = 2;
  if (draft) {
    paragraph(draft, { size: 30, x: MARGIN_X + boxPadding, w: CONTENT_W - boxPadding * 2 });
  } else {
    paragraph('(Belum ada karangan)', { size: 26, x: MARGIN_X + boxPadding, w: CONTENT_W - boxPadding * 2, color: '#555555' });
  }
  // Bingkai di sekeliling karangan; bila lintas halaman, tiap halaman diberi bingkai sendiri.
  const frame = (pageIdx: number, top: number, bottom: number) => {
    const c = pages[pageIdx].getContext('2d');
    if (!c) return;
    c.strokeStyle = '#000000';
    c.lineWidth = 2;
    c.strokeRect(MARGIN_X, top - 8, CONTENT_W, Math.max(40, bottom - top + 16));
  };
  if (pages.length === startPage) {
    frame(startPage - 1, startY, y);
  } else {
    frame(startPage - 1, startY, PAGE_H - MARGIN_BOTTOM);
    for (let p = startPage; p < pages.length - 1; p++) frame(p, MARGIN_TOP, PAGE_H - MARGIN_BOTTOM);
    frame(pages.length - 1, MARGIN_TOP, y);
  }
  y += 24;

  // Tulisan tangan
  if (d.handwritingDataUrl) {
    const img = await loadImage(d.handwritingDataUrl);
    if (img && img.width > 0) {
      heading('Tulisan Tangan');
      const maxW = CONTENT_W;
      const maxH = 520;
      const s = Math.min(maxW / img.width, maxH / img.height, 1.5);
      const w = img.width * s;
      const h = img.height * s;
      ensure(h + 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(MARGIN_X, y, w, h);
      ctx.drawImage(img, MARGIN_X, y, w, h);
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1;
      ctx.strokeRect(MARGIN_X, y, w, h);
      ctx.strokeStyle = '#000000';
      y += h + 24;
    }
  }

  // Penilaian
  if (d.rubric) {
    heading('Penilaian', 280);
    const items: [string, string][] = [
      ['Fikrah (isi)', `${d.rubric.fikrah} / 25`],
      ['Tarkib (struktur)', `${d.rubric.tarkib} / 25`],
      ['Mufradat (kosakata)', `${d.rubric.mufradat} / 25`],
      ["Imla' (ejaan)", `${d.rubric.imla} / 25`],
      ['Total', `${d.rubric.total} / 100`],
    ];
    const rowH = 54;
    ensure(rowH * items.length + 10);
    const col = CONTENT_W - 260;
    ctx.lineWidth = 2;
    items.forEach(([k, v], i) => {
      const top = y + i * rowH;
      const bold = i === items.length - 1;
      ctx.strokeRect(MARGIN_X, top, col, rowH);
      ctx.strokeRect(MARGIN_X + col, top, 260, rowH);
      ctx.fillStyle = '#000000';
      ctx.font = `${bold ? 'bold ' : ''}26px ${LATIN}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(k, MARGIN_X + 16, top + rowH / 2);
      ctx.textAlign = 'center';
      ctx.fillText(v, MARGIN_X + col + 130, top + rowH / 2);
    });
    ctx.textAlign = 'left';
    y += rowH * items.length + 26;
  }

  // Catatan
  if (d.feedback && d.feedback.trim()) {
    heading('Catatan', 110);
    paragraph(d.feedback.trim(), { size: 24 });
    y += 14;
  }

  // Tanda tangan
  ensure(230);
  y += 50;
  const colW = CONTENT_W / 2;
  const sigTop = y;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `26px ${LATIN}`;
  ctx.fillText('Siswa', MARGIN_X + colW / 2, sigTop + 18);
  ctx.fillText('Guru', MARGIN_X + colW + colW / 2, sigTop + 18);
  ctx.lineWidth = 2;
  for (const cx of [MARGIN_X + colW / 2, MARGIN_X + colW + colW / 2]) {
    ctx.beginPath();
    ctx.moveTo(cx - 170, sigTop + 150);
    ctx.lineTo(cx + 170, sigTop + 150);
    ctx.stroke();
  }
  ctx.fillText(d.name, MARGIN_X + colW / 2, sigTop + 178, 360);
  ctx.textAlign = 'left';
  y = sigTop + 200;

  return pages;
}
