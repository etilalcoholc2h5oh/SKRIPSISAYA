import React, { useRef, useState } from 'react';
import { X, Download, ExternalLink, Copy, Check, FileText } from 'lucide-react';
import { StudentProgress } from '../lib/db';
import { ThemeTopic } from '../data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  // 1. Generate & Download PDF using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printContentRef.current) return;
    try {
      setIsGeneratingPdf(true);
      showToast('Sedang memproses & menyusun dokumen PDF...');

      const element = printContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const totalPdfHeight = (canvasHeight * pageWidth) / canvasWidth;

      // Handle multi-page pagination seamlessly if content is longer than 1 A4 page
      let heightLeft = totalPdfHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, totalPdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Subsequent pages if any
      while (heightLeft > 0) {
        position = heightLeft - totalPdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, totalPdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const safeName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeTheme = (theme.titleIndo || 'Karangan').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Lembar_Insya_${safeName}_${safeTheme}.pdf`);
      showToast('Berhasil mengunduh file PDF!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Gagal membuat file PDF. Silakan gunakan tombol Buka Tab Baru untuk cetak.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 2. Open printable standalone document in new window/tab
  const handleOpenInNewTab = () => {
    if (!printContentRef.current) return;
    const contentHtml = printContentRef.current.innerHTML;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // If popup blocked, fallback to direct print
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Lembar Kerja Insya' - ${student.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              font-family: 'Plus Jakarta Sans', sans-serif; 
              background-color: #ffffff;
              color: #0f172a;
              padding: 20px;
            }
            .font-arabic { font-family: 'Amiri', serif; }
            @media print {
              body { background-color: #ffffff; padding: 0; }
              .no-print { display: none !important; }
              @page { margin: 15mm; size: A4; }
            }
          </style>
        </head>
        <body>
          <div class="max-w-3xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl shadow-md border border-slate-200">
            <div>
              <h2 class="font-bold text-slate-800 text-base">Pratinjau Cetak Lembar Insya'</h2>
              <p class="text-xs text-slate-500">Gunakan tombol Cetak di bawah atau tekan Ctrl+P</p>
            </div>
            <button onclick="window.print()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center gap-2">
              Cetak / Simpan PDF
            </button>
          </div>
          <div class="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            ${contentHtml}
          </div>
          <script>
            // Auto trigger print after short delay
            setTimeout(() => {
              window.print();
            }, 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                Siswa: <strong className="text-stone-700 dark:text-stone-300">{student.name}</strong> • Tema: {theme.titleIndo}
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
              <span className="hidden xs:inline">Buka Tab Cetak</span>
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
            className="max-w-3xl mx-auto bg-white text-black p-8 sm:p-12 border border-stone-300 font-sans"
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
                <p className="font-arabic text-2xl leading-[2.3] text-right whitespace-pre-wrap" dir="rtl">
                  {student.draft}
                </p>
              ) : (
                <p className="text-sm text-stone-500">(Belum ada karangan)</p>
              )}
              {student.handwritingDataUrl && (
                <img
                  src={student.handwritingDataUrl}
                  alt="Tulisan tangan"
                  className="max-h-40 w-auto mt-3 border border-stone-300"
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
