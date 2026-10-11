import React, { useRef, useState } from 'react';
import { X, Download, ExternalLink, Copy, Check, FileText } from 'lucide-react';
import { StudentProgress } from '../lib/db';
import { ThemeTopic } from '../data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// html2canvas belum bisa membaca warna modern (oklch, color-mix) yang dipakai Tailwind v4 dan akan gagal.
// Sebelum difoto, semua warna di salinan dokumen diubah menjadi rgb biasa.
const MODERN_COLOR = /oklch|oklab|color\(|lab\(|lch\(|color-mix/;
const COLOR_PROPS = [
  'color', 'background-color', 'border-top-color', 'border-right-color',
  'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color'
];

function toRgb(value: string): string {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const x = c.getContext('2d');
  if (!x) return 'rgb(0,0,0)';
  x.clearRect(0, 0, 1, 1);
  x.fillStyle = '#000000';
  x.fillStyle = value;
  x.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = x.getImageData(0, 0, 1, 1).data;
  return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
}

function sanitizeColors(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;
  doc.querySelectorAll<HTMLElement>('*').forEach((node) => {
    const cs = win.getComputedStyle(node);
    for (const prop of COLOR_PROPS) {
      const v = cs.getPropertyValue(prop);
      if (v && MODERN_COLOR.test(v)) node.style.setProperty(prop, toRgb(v), 'important');
    }
    if (MODERN_COLOR.test(cs.boxShadow) || MODERN_COLOR.test(cs.backgroundImage)) {
      node.style.setProperty('box-shadow', 'none', 'important');
      if (MODERN_COLOR.test(cs.backgroundImage)) node.style.setProperty('background-image', 'none', 'important');
    }
  });
}

interface PrintPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Partial<StudentProgress> & { name: string; draft?: string; ideas?: string[] };
  theme: ThemeTopic;
  sessionId?: string;
  isTeacher?: boolean;
}

export const PrintPdfModal: React.FC<PrintPdfModalProps> = ({
  isOpen,
  onClose,
  student,
  theme,
  sessionId = 'MANDIRI',
  isTeacher = false
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const rubric = student.rubricScores;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Buat PDF (A4, margin 10 mm). Pemotongan halaman dicari di baris kosong agar teks tidak terbelah.
  const handleDownloadPdf = async () => {
    if (!printContentRef.current) return;
    try {
      setIsGeneratingPdf(true);
      showToast('Menyusun PDF...');

      const element = printContentRef.current;
      const canvas = await html2canvas(element, {
        scale: Math.min(2, 1800 / Math.max(1, element.scrollWidth)),
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => sanitizeColors(clonedDoc)
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 10;
      const usableW = pdf.internal.pageSize.getWidth() - margin * 2; // 190 mm
      const usableH = pdf.internal.pageSize.getHeight() - margin * 2; // 277 mm
      const pxPerMm = canvas.width / usableW;
      const pageHpx = Math.floor(usableH * pxPerMm);
      const ctx = canvas.getContext('2d');

      // Cari baris yang seluruhnya putih di dekat batas halaman, supaya garis potong tidak memotong huruf.
      const findCut = (from: number): number => {
        const ideal = from + pageHpx;
        if (ideal >= canvas.height || !ctx) return Math.min(ideal, canvas.height);
        const lookBack = Math.floor(pageHpx * 0.15);
        for (let y = ideal; y > ideal - lookBack; y--) {
          const row = ctx.getImageData(0, y, canvas.width, 1).data;
          let blank = true;
          for (let i = 0; i < row.length; i += 4) {
            if (row[i] < 245 || row[i + 1] < 245 || row[i + 2] < 245) { blank = false; break; }
          }
          if (blank) return y;
        }
        return ideal;
      };

      let y = 0;
      let first = true;
      while (y < canvas.height) {
        const cut = findCut(y);
        const sliceH = Math.max(1, cut - y);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;
        const sctx = slice.getContext('2d');
        if (!sctx) throw new Error('canvas');
        sctx.fillStyle = '#ffffff';
        sctx.fillRect(0, 0, slice.width, slice.height);
        sctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        if (!first) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, usableW, sliceH / pxPerMm, undefined, 'FAST');
        first = false;
        y = cut;
      }

      const safeName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeTheme = (theme.titleIndo || 'Karangan').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Lembar_Insya_${safeName}_${safeTheme}.pdf`;
      const blob = pdf.output('blob');

      // HP: buka lembar bagikan agar PDF bisa disimpan ke berkas atau dikirim langsung.
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: fileName });
          showToast('PDF siap disimpan atau dibagikan.');
          return;
        } catch (e: any) {
          if (e && e.name === 'AbortError') return; // pengguna menutup lembar bagikan
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      showToast('PDF diunduh. Jika tidak muncul, tekan tombol Buka Tab Cetak lalu Cetak / Simpan PDF.');
    } catch (err) {
      console.error('Error generating PDF:', err);
      const msg = err instanceof Error ? err.message : String(err);
      console.error('PDF otomatis gagal:', msg);
      showToast('PDF otomatis gagal, membuka dialog cetak. Pilih "Simpan sebagai PDF".');
      handleOpenInNewTab();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Cetak lewat dialog cetak browser (di HP: pilih "Simpan sebagai PDF"). Tidak memakai html2canvas,
  // jadi tetap bekerja walau pembuatan PDF otomatis gagal. Memakai iframe tersembunyi, tanpa pop-up.
  const handleOpenInNewTab = () => {
    const el = printContentRef.current;
    if (!el) return;
    try {
      const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((n) => n.outerHTML)
        .join('\n');
      const iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) throw new Error('iframe');
      doc.open();
      doc.write(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8" />
<title>Lembar Karangan Insya' - ${student.name.replace(/[<>&"]/g, '')}</title>
${headStyles}
<style>
  html, body { background: #ffffff !important; margin: 0; }
  body > div { border: 0 !important; box-shadow: none !important; max-width: none !important; min-height: 0 !important; padding: 0 !important; }
  @page { size: A4; margin: 15mm; }
</style></head><body>${el.outerHTML}</body></html>`);
      doc.close();
      const go = () => {
        try {
          win.focus();
          win.print();
        } catch (e) {
          console.error(e);
          showToast('Gagal membuka dialog cetak.');
        }
        setTimeout(() => iframe.remove(), 60000);
      };
      // beri waktu agar stylesheet dan font termuat
      setTimeout(go, 700);
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  // 3. Direct Print
  const handleDirectPrint = () => {
    // If inside iframe, open in new tab for best printing result
    if (window.self !== window.top) {
      handleOpenInNewTab();
    } else {
      window.print();
    }
  };

  // 4. Copy text to clipboard
  const handleCopyAll = () => {
    const text = `
LEMBAR KARANGAN INSYA'
Nama Siswa: ${student.name}
Kelas/Sesi: ${sessionId}
Tema: ${theme.titleIndo} (${theme.titleArabic})
Tanggal: ${currentDate}

====================================
Gagasan Alur (الأفكار):
- Muqaddimah: ${student.ideas?.[0] || '-'}
- Al-Maudhu': ${student.ideas?.[1] || '-'}
- Al-Khatimah: ${student.ideas?.[2] || '-'}

====================================
Naskah Karangan (الإنشاء):
${student.draft || '(Belum ada draf)'}

====================================
Nilai Rubrik Insya':
${rubric ? `- Fikrah: ${rubric.fikrah}/25
- Tarkib: ${rubric.tarkib}/25
- Mufradat: ${rubric.mufradat}/25
- Imla': ${rubric.imla}/25
Total Nilai: ${rubric.total}/100` : '(Belum dinilai)'}
Catatan: ${student.feedback || '-'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Teks lembar kerja berhasil disalin!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-fadeIn">
        
        {/* Modal Top Action Bar */}
        <div className="p-3.5 sm:p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white leading-tight">
                Dokumen Lembar Kerja Insya'
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Siswa: <strong className="text-stone-700 dark:text-stone-300">{student.name}</strong>, Tema: {theme.titleIndo}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              title="Unduh file PDF ke perangkat"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Buka pratinjau cetak di tab baru browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition-colors"
              title="Salin isi lembar kerja"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Salin</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-blue-600 text-white px-4 py-2 text-xs font-bold text-center animate-fadeIn shrink-0">
            {toastMessage}
          </div>
        )}

        {/* Pratinjau lembar cetak (polos, hitam putih) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-100 dark:bg-stone-950/80">
          <div
            ref={printContentRef}
            className="max-w-3xl mx-auto bg-white text-black p-8 sm:p-12 border border-stone-300 font-sans overflow-hidden break-words [overflow-wrap:anywhere]"
            style={{ minHeight: '840px' }}
          >
            <h1 className="text-xl font-bold text-center text-black">Lembar Karangan Insya'</h1>
            <hr className="border-black my-3" />

            <table className="w-full text-sm mb-5">
              <tbody>
                <tr>
                  <td className="w-28 py-0.5 align-top">Nama</td>
                  <td className="py-0.5">: {student.name}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Kelas / Sesi</td>
                  <td className="py-0.5">: {sessionId}</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Tema</td>
                  <td className="py-0.5">: {theme.titleIndo} ({theme.titleArabic})</td>
                </tr>
                <tr>
                  <td className="py-0.5 align-top">Tanggal</td>
                  <td className="py-0.5">: {currentDate}</td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-sm font-bold mb-1">Kerangka Gagasan</h2>
            <ol className="list-decimal ml-5 text-sm mb-5 space-y-0.5">
              <li>Pembuka: {student.ideas?.[0] || '-'}</li>
              <li>Isi: {student.ideas?.[1] || '-'}</li>
              <li>Penutup: {student.ideas?.[2] || '-'}</li>
            </ol>

            <h2 className="text-sm font-bold mb-1">Karangan</h2>
            <div className="border border-black p-4 min-h-[220px] mb-5">
              {student.draft ? (
                <p className="font-arabic text-2xl leading-[2.3] text-right whitespace-pre-wrap break-words [overflow-wrap:anywhere]" dir="rtl">
                  {student.draft}
                </p>
              ) : (
                <p className="text-sm text-stone-500">(Belum ada karangan)</p>
              )}
              {student.handwritingDataUrl && (
                <img
                  src={student.handwritingDataUrl}
                  alt="Tulisan tangan"
                  className="max-h-40 max-w-full w-auto mt-3 border border-stone-300"
                />
              )}
            </div>

            {student.rubricScores && (
              <>
                <h2 className="text-sm font-bold mb-1">Penilaian</h2>
                <table className="w-full text-sm border border-black border-collapse mb-5">
                  <tbody>
                    {[
                      ['Fikrah (isi)', student.rubricScores.fikrah],
                      ['Tarkib (struktur)', student.rubricScores.tarkib],
                      ['Mufradat (kosakata)', student.rubricScores.mufradat],
                      ["Imla' (ejaan)", student.rubricScores.imla],
                    ].map(([label, v]) => (
                      <tr key={label as string}>
                        <td className="border border-black px-2 py-1">{label}</td>
                        <td className="border border-black px-2 py-1 w-24 text-center">{v} / 25</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="border border-black px-2 py-1">Total</td>
                      <td className="border border-black px-2 py-1 text-center">{student.rubricScores.total} / 100</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {student.feedback && (
              <div className="mb-5 text-sm">
                <h2 className="font-bold mb-1">Catatan</h2>
                <p className="whitespace-pre-wrap leading-relaxed">{student.feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 pt-8 text-center text-sm">
              <div className="space-y-12">
                <div>Siswa</div>
                <div className="border-b border-black w-40 mx-auto"></div>
                <div>{student.name}</div>
              </div>
              <div className="space-y-12">
                <div>Guru</div>
                <div className="border-b border-black w-40 mx-auto"></div>
                <div>&nbsp;</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Format Cetak Standar A4 Siap Cetak & Ekspor PDF</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 font-semibold hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
