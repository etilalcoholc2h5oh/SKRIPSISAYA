import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Award, 
  FileText, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  User, 
  GraduationCap,
  PenTool
} from 'lucide-react';
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

  const rubric = student.rubricScores || {
    fikrah: 20,
    tarkib: 20,
    mufradat: 20,
    imla: 20,
    total: 80
  };

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
      showToast('✓ Berhasil mengunduh file PDF!');
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
              background-color: #f8fafc;
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
              🖨️ Cetak / Simpan PDF
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
LEMBAR KERJA SISWA - INSYA' MUWAJJAH
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
- Fikrah: ${rubric.fikrah}/25
- Tarkib: ${rubric.tarkib}/25
- Mufradat: ${rubric.mufradat}/25
- Imla': ${rubric.imla}/25
Total Nilai: ${rubric.total}/100
Catatan: ${student.feedback || '-'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('✓ Teks lembar kerja berhasil disalin!');
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

        {/* Printable Paper Document Preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-100 dark:bg-stone-950/80">
          <div 
            ref={printContentRef}
            className="max-w-3xl mx-auto bg-white text-stone-900 p-6 sm:p-10 rounded-2xl shadow-md border border-stone-200 space-y-6 font-sans"
            style={{ minHeight: '840px' }}
          >
            {/* Header Kop Lembar Kerja */}
            <div className="border-b-2 border-stone-900 pb-4 text-center space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 uppercase tracking-widest border-b border-stone-200 pb-1.5 mb-2">
                <span>KITABAH INSYA' • MADRASAH / KBM</span>
                <span>إِنْشَاءٌ مُوَجَّهٌ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 uppercase">
                LEMBAR KERJA SISWA — INSYA' MUWAJJAH
              </h1>
              <p className="text-xs text-stone-600 font-medium">
                Pembelajaran Maharah Al-Kitabah Berbasis Panduan & Rubrik Analitis
              </p>
            </div>

            {/* Student & Class Identity Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs">
              <div className="space-y-1">
                <div>
                  <span className="text-stone-500">Nama Siswa: </span>
                  <strong className="text-stone-900 font-bold text-sm">{student.name}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Kelas / Sesi: </span>
                  <strong className="font-mono text-stone-800 font-bold">{sessionId}</strong>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div>
                  <span className="text-stone-500">Tema: </span>
                  <strong className="text-stone-900 font-bold">{theme.titleIndo}</strong>
                </div>
                <div className="font-arabic text-sm font-bold text-stone-800" dir="rtl">
                  {theme.titleArabic} ({theme.grade})
                </div>
                <div className="text-[11px] text-stone-500">
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Section 1: Alur Gagasan */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <span>1. Kerangka Gagasan (الأفكار)</span>
                </h3>
                <span className="text-[11px] text-stone-500 font-arabic">الفكرة الأساسية</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg border border-stone-200 bg-amber-50/50 space-y-1">
                  <div className="font-bold text-amber-800 text-[11px] flex items-center justify-between">
                    <span>Awal (المقدمة)</span>
                  </div>
                  <p className="text-stone-700 leading-snug">
                    {student.ideas?.[0] || <span className="text-stone-400 italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-stone-200 bg-blue-50/50 space-y-1">
                  <div className="font-bold text-blue-800 text-[11px] flex items-center justify-between">
                    <span>Inti (الموضوع)</span>
                  </div>
                  <p className="text-stone-700 leading-snug">
                    {student.ideas?.[1] || <span className="text-stone-400 italic">Belum diisi</span>}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-stone-200 bg-emerald-50/50 space-y-1">
                  <div className="font-bold text-emerald-800 text-[11px] flex items-center justify-between">
                    <span>Penutup (الخاتمة)</span>
                  </div>
                  <p className="text-stone-700 leading-snug">
                    {student.ideas?.[2] || <span className="text-stone-400 italic">Belum diisi</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Kosakata & Pola Terpilih */}
            {(student.selectedMufradat?.length || student.selectedTarkib?.length) ? (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1">
                  2. Kosakata & Kaidah Kalimat Terpilih (المفردات والتركيب)
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(student.selectedMufradat || []).map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-300 font-arabic text-sm font-bold text-stone-800" dir="rtl">
                      {m}
                    </span>
                  ))}
                  {(student.selectedTarkib || []).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-[11px] font-semibold text-stone-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Section 3: Naskah Karangan Insya' (Utama) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b-2 border-stone-800 pb-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  3. Naskah Karangan Insya' (نَصُّ الْإِنْشَاءِ)
                </h3>
                <span className="text-xs font-arabic font-bold text-stone-700">
                  كِتَابَةُ الطَّالِبِ
                </span>
              </div>

              <div className="p-6 rounded-xl border border-stone-300 bg-stone-50/40 min-h-[220px]">
                {student.draft ? (
                  <p className="font-arabic text-2xl sm:text-3xl leading-[2.4] text-stone-900 text-right whitespace-pre-wrap" dir="rtl">
                    {student.draft}
                  </p>
                ) : (
                  <p className="text-xs text-stone-400 italic text-center py-10">
                    (Belum ada draf karangan yang ditulis)
                  </p>
                )}
              </div>

              {/* Handwriting snapshot if available */}
              {student.handwritingDataUrl && (
                <div className="p-3 rounded-xl border border-stone-200 space-y-1">
                  <div className="text-[11px] font-bold text-stone-600">Hasil Khat / Tulis Tangan:</div>
                  <img
                    src={student.handwritingDataUrl}
                    alt="Tulis Tangan Siswa"
                    className="max-h-40 w-auto mx-auto rounded border border-stone-200"
                  />
                </div>
              )}
            </div>

            {/* Section 4: Rubrik Penilaian & Catatan Evaluasi */}
            <div className="border-t-2 border-stone-800 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>4. Evaluasi & Rubrik Penilaian Analitis</span>
                </h3>
                <div className="text-right">
                  <span className="text-xs text-stone-500 mr-1">Skor Akhir:</span>
                  <strong className="text-lg font-bold text-stone-900">{rubric.total}</strong>
                  <span className="text-xs text-stone-500 font-normal"> / 100</span>
                </div>
              </div>

              {/* Rubric Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg border border-stone-200 bg-stone-50">
                  <div className="text-[10px] text-stone-500">Gagasan (الفكرة)</div>
                  <div className="font-bold text-sm text-stone-800 mt-0.5">{rubric.fikrah} / 25</div>
                </div>
                <div className="p-2 rounded-lg border border-stone-200 bg-stone-50">
                  <div className="text-[10px] text-stone-500">Kaidah (التركيب)</div>
                  <div className="font-bold text-sm text-stone-800 mt-0.5">{rubric.tarkib} / 25</div>
                </div>
                <div className="p-2 rounded-lg border border-stone-200 bg-stone-50">
                  <div className="text-[10px] text-stone-500">Kosakata (المفردات)</div>
                  <div className="font-bold text-sm text-stone-800 mt-0.5">{rubric.mufradat} / 25</div>
                </div>
                <div className="p-2 rounded-lg border border-stone-200 bg-stone-50">
                  <div className="text-[10px] text-stone-500">Imla' & Khat (الإملاء)</div>
                  <div className="font-bold text-sm text-stone-800 mt-0.5">{rubric.imla} / 25</div>
                </div>
              </div>

              {/* Teacher Feedback Text */}
              {student.feedback && (
                <div className="p-3 rounded-lg border border-stone-200 bg-purple-50/40 text-xs space-y-1">
                  <div className="font-bold text-purple-900 text-[11px]">Catatan / Umpan Balik Guru:</div>
                  <p className="text-stone-800 whitespace-pre-wrap leading-relaxed">
                    {student.feedback}
                  </p>
                </div>
              )}

              {/* Signature section for Official Worksheet */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs text-stone-600">
                <div className="space-y-12">
                  <div>Siswa / Penulis</div>
                  <div className="border-b border-stone-400 w-36 mx-auto"></div>
                  <div className="font-bold text-stone-800">{student.name}</div>
                </div>
                <div className="space-y-12">
                  <div>Guru Pengajar / Pembimbing</div>
                  <div className="border-b border-stone-400 w-36 mx-auto"></div>
                  <div className="font-bold text-stone-800">
                    {isTeacher ? 'Ustadz / Ustadzah' : 'Guru Bahasa Arab'}
                  </div>
                </div>
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
