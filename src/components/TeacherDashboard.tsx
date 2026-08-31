import React, { useState, useEffect } from 'react';
import { subscribeToStudents, updateStudentProgress, StudentProgress, ClassSession, RubricScores } from '../lib/db';
import { THEMES } from '../data';
import { ChibiMascot } from './ChibiMascot';
import { 
  MessageCircle, CheckCircle2, Search, Edit3, Copy, Check, 
  Award, Users, Eye, PenTool, Send, FileText, Download,
  Lock, EyeOff, ShieldCheck, Heart, Printer
} from 'lucide-react';
import { motion } from 'motion/react';
import { PrintPdfModal } from './PrintPdfModal';

interface TeacherDashboardProps {
  session: ClassSession;
  isDarkMode: boolean;
  onExit?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ session, isDarkMode, onExit }) => {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  
  // Feedback & Rubric state
  const [feedbackText, setFeedbackText] = useState('');
  const [rubric, setRubric] = useState<RubricScores>({
    fikrah: 20,
    tarkib: 20,
    mufradat: 20,
    imla: 20,
    total: 80
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStudents(session.id, (data) => {
      setStudents(data);
      if (selectedStudent) {
        const updated = data.find(s => s.id === selectedStudent.id);
        if (updated) {
          setSelectedStudent(updated);
        }
      }
    });
    return () => unsub();
  }, [session.id, selectedStudent?.id]);

  const handleSelectStudent = (student: StudentProgress) => {
    setSelectedStudent(student);
    setFeedbackText(student.feedback || '');
    if (student.rubricScores) {
      setRubric(student.rubricScores);
    } else {
      setRubric({ fikrah: 20, tarkib: 20, mufradat: 20, imla: 20, total: 80 });
    }
  };

  const updateRubricScore = (field: keyof Omit<RubricScores, 'total'>, val: number) => {
    const clamped = Math.max(0, Math.min(25, val));
    const newRubric = { ...rubric, [field]: clamped };
    newRubric.total = newRubric.fikrah + newRubric.tarkib + newRubric.mufradat + newRubric.imla;
    setRubric(newRubric);
  };

  const handleSaveAssessment = async () => {
    if (!selectedStudent) return;
    setIsSaving(true);
    try {
      await updateStudentProgress(session.id, selectedStudent.id, {
        feedback: feedbackText,
        rubricScores: rubric,
        status: 'reviewed'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(session.teacherPin || '1234');
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const insertQuickFeedback = (text: string) => {
    setFeedbackText(prev => prev ? `${prev}\n- ${text}` : `- ${text}`);
  };

  const borderColor = isDarkMode ? 'border-stone-800' : 'border-stone-200';
  const cardBg = isDarkMode ? 'bg-stone-900/60' : 'bg-white';
  const theme = THEMES.find(t => t.id === session?.themeId) || THEMES[0];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Teacher Header Card with Mascot */}
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border ${borderColor} ${cardBg} shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-5`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <ChibiMascot
            variant="teacher"
            size="sm"
            quote="Ahlan wa Sahlan Ustadz/Ustadzah! Pantau tulisan siswa secara langsung di bawah ini."
            badge="Guru"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                Panel Pengajar (Guru)
              </span>
              <span className="text-xs text-stone-500">
                Guru: <strong className="text-stone-700 dark:text-stone-300">{session.teacherName || 'Pengajar'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Ruang Kelas: {theme.titleIndo} ({theme.titleArabic})
            </h1>
            <p className="text-xs text-stone-500">
              Pantau draf siswa secara real-time, evaluasi bertahap, dan berikan penilaian rubrik analitis.
            </p>
          </div>
        </div>

        {/* Action Badges: Student Code & Teacher PIN */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Class Code Badge for Students */}
          <div className="flex items-center justify-between sm:justify-start gap-3 bg-stone-100 dark:bg-stone-800/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-700 flex-1">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400">
                Kode Bergabung Siswa:
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400">
                {session.id}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Salin Kode Siswa"
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          {/* Teacher PIN Badge (Confidential) */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-purple-50 dark:bg-purple-950/40 p-3 rounded-xl sm:rounded-2xl border border-purple-200/80 dark:border-purple-900/60 flex-1">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Lock className="w-3 h-3" /> PIN Guru:
              </div>
              <div className="text-lg font-mono font-bold tracking-widest text-purple-900 dark:text-purple-200">
                {showPin ? (session.teacherPin || '1234') : '••••'}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                title={showPin ? "Sembunyikan PIN" : "Lihat PIN"}
                className="p-2 text-purple-700 dark:text-purple-300 hover:bg-purple-200/50 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopyPin}
                title="Salin PIN Pengajar"
                className="p-2 text-purple-700 dark:text-purple-300 hover:bg-purple-200/50 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Student List (4 cols) */}
        <div className={`lg:col-span-4 rounded-2xl sm:rounded-3xl border ${borderColor} ${cardBg} shadow-sm overflow-hidden flex flex-col ${selectedStudent ? 'hidden lg:flex' : 'flex'}`}>
          <div className={`p-3.5 sm:p-4 border-b ${borderColor} bg-stone-50/70 dark:bg-stone-900/60 space-y-2.5 sm:space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-500" /> Daftar Siswa ({students.length})
              </span>
              <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            {/* Student Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 max-h-[500px] lg:max-h-[650px]">
            {filteredStudents.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-stone-400 text-xs space-y-3 flex flex-col items-center justify-center">
                <ChibiMascot
                  variant="cheer"
                  size="sm"
                  quote="Menunggu siswa bergabung ke kelas..."
                  subquote={`Beri tahu kode kelas ${session.id} ke siswa ya!`}
                />
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 shadow-sm ring-2 ring-purple-500/20'
                        : 'border-stone-200 dark:border-stone-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-stone-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                        {student.name}
                      </span>
                      {student.status === 'submitted' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-md text-[10px] font-bold">
                          Sudah Kirim
                        </span>
                      ) : student.status === 'reviewed' ? (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold">
                          Dinilai ({student.rubricScores?.total || 0})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-md text-[10px]">
                          Sedang Menulis
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-500">
                      <span>
                        {student.step === 1 && 'Tahap 1: Brainstorming'}
                        {student.step === 2 && `Tahap 2: ${student.selectedMufradat?.length || 0} Kosakata`}
                        {student.step === 3 && `Tahap 3: Menulis (${student.draft?.trim().split(/\s+/).filter(Boolean).length || 0} kata)`}
                      </span>
                      {student.writingMode === 'handwriting' && (
                        <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 text-[10px]">
                          <PenTool className="w-3 h-3" /> Khat
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Work Preview & Rubric Assessment (8 cols) */}
        <div className={`lg:col-span-8 rounded-2xl sm:rounded-3xl border ${borderColor} ${cardBg} shadow-sm overflow-hidden flex flex-col ${!selectedStudent ? 'hidden lg:flex min-h-[300px] lg:min-h-[600px]' : 'flex'}`}>
          {!selectedStudent ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center text-stone-400 space-y-3">
              <Eye className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" />
              <h3 className="font-bold text-sm sm:text-base text-stone-600 dark:text-stone-400">Pilih Siswa untuk Ditinjau</h3>
              <p className="text-xs max-w-sm">
                Klik salah satu siswa dari daftar di sebelah kiri untuk melihat gagasan, kosakata pilihan, dan draf tulisan Arab mereka secara real-time.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header with Mobile Back Button */}
              <div className={`p-3.5 sm:p-5 md:p-6 border-b ${borderColor} bg-stone-50/70 dark:bg-stone-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="lg:hidden p-1.5 -ml-1 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800"
                    title="Kembali ke Daftar Siswa"
                  >
                    ← Daftar
                  </button>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Lembar Kerja Siswa (Live)
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      {selectedStudent.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-bold transition-all shadow-xs"
                    title="Cetak atau Unduh PDF Lembar Kerja Siswa"
                  >
                    <Printer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Cetak / PDF</span>
                  </button>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                    selectedStudent.step === 3 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    Langkah {selectedStudent.step} dari 3
                  </span>
                </div>
              </div>

              {/* Student Content Preview */}
              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
                {/* 1. Ideas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    1. Gagasan Utama (Brainstorming)
                  </h4>
                  <div className="grid gap-2">
                    {selectedStudent.ideas.map((idea, idx) => (
                      <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 flex items-start gap-2">
                        <span className="font-bold text-blue-500">{idx + 1}.</span>
                        <span>{idea || <span className="text-stone-400 italic">Belum diisi</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Selected Mufradat & Tarkib */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    2. Kosakata & Kaidah Tarkib Terpilih
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {(selectedStudent.selectedMufradat || []).map((m) => (
                      <span key={m} className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs sm:text-sm font-arabic font-bold" dir="rtl">
                        {m}
                      </span>
                    ))}
                    {(selectedStudent.selectedTarkib || []).map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] sm:text-xs font-semibold">
                        {t}
                      </span>
                    ))}
                    {(!selectedStudent.selectedMufradat?.length && !selectedStudent.selectedTarkib?.length) && (
                      <span className="text-xs text-stone-400 italic">Belum ada pilihan kosakata</span>
                    )}
                  </div>
                </div>

                {/* 3. Draft Realtime */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      3. Draf Karangan Siswa (Real-time Live)
                    </h4>
                    <span className="text-xs text-stone-400 font-mono">
                      {selectedStudent.draft ? `${selectedStudent.draft.trim().split(/\s+/).filter(Boolean).length} Kata` : '0 Kata'}
                    </span>
                  </div>

                  <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${borderColor} bg-stone-50/50 dark:bg-stone-900/50 min-h-[140px] sm:min-h-[160px]`}>
                    {selectedStudent.draft ? (
                      <p className="font-arabic text-xl sm:text-2xl md:text-3xl leading-loose text-stone-900 dark:text-white break-words" dir="rtl">
                        {selectedStudent.draft}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 italic text-center py-6">
                        Siswa belum mulai mengetik draf karangan...
                      </p>
                    )}
                  </div>

                  {/* Handwriting view if available */}
                  {selectedStudent.handwritingDataUrl && (
                    <div className="mt-3 p-3 rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                      <div className="text-xs font-bold text-stone-500 mb-2 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-purple-500" /> Hasil Tulis Tangan Siswa (Khat Canvas):
                      </div>
                      <img
                        src={selectedStudent.handwritingDataUrl}
                        alt="Tulis Tangan Siswa"
                        className="max-h-52 sm:max-h-60 w-auto rounded-xl border border-stone-200 dark:border-stone-800 mx-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Assessment Form & Rubric */}
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between border-b border-purple-200/60 dark:border-purple-900/40 pb-3">
                    <h3 className="font-bold text-xs sm:text-sm text-purple-800 dark:text-purple-300 flex items-center gap-1.5 sm:gap-2">
                      <Award className="w-4 h-4 text-purple-600 shrink-0" /> Rubrik Penilaian Analitis Insya'
                    </h3>
                    <div className="text-right">
                      <span className="text-[11px] sm:text-xs text-stone-500 mr-1 sm:mr-2">Total:</span>
                      <span className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {rubric.total} <span className="text-xs text-stone-400 font-normal">/ 100</span>
                      </span>
                    </div>
                  </div>

                  {/* 4 Rubric Sliders / Number Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { key: 'fikrah' as const, title: 'Kesesuaian Gagasan & Isi (Fikrah)', desc: 'Kepaduan ide pembuka, inti, penutup' },
                      { key: 'tarkib' as const, title: 'Kaidah Nahwu & Tarkib', desc: 'Kesesuaian fi\'il-fa\'il, i\'rab, na\'at-man\'ut' },
                      { key: 'mufradat' as const, title: 'Kekayaan Kosakata (Mufradat)', desc: 'Ketepatan pemilihan kata kontekstual' },
                      { key: 'imla' as const, title: 'Kerapian Imla & Khat', desc: 'Ejaan hamzah, ta marbuthah, harakat' }
                    ].map(({ key, title, desc }) => (
                      <div key={key} className="p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-stone-900/80 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-stone-700 dark:text-stone-200">
                            {title}
                          </label>
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/50 px-2 py-0.5 rounded-lg">
                            {rubric[key]} / 25
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="25"
                          value={rubric[key]}
                          onChange={(e) => updateRubricScore(key, parseInt(e.target.value) || 0)}
                          className="w-full h-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <p className="text-[10px] text-stone-400">{desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Feedback Textarea & Quick Templates */}
                  <div className="space-y-2 pt-1 sm:pt-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      Catatan Evaluasi & Umpan Balik Guru (Tampil langsung di layar siswa):
                    </label>

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {[
                        'Mumtaz! Susunan kalimat sangat baik dan teratur.',
                        'Perhatikan kesesuaian mudzakkar dan muannats pada fi\'il.',
                        'Hati-hati dengan harakat kasrah setelah huruf jar.',
                        'Kembangkan lagi gagasan penutup agar lebih padu.'
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => insertQuickFeedback(t)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-100/70 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-colors text-left"
                        >
                          + {t.substring(0, 32)}...
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tuliskan catatan perbaikan, apresiasi, atau koreksi tata bahasa untuk siswa..."
                      className="w-full p-3 sm:p-3.5 text-xs md:text-sm rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-stone-900 min-h-[90px] sm:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    {saveSuccess ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" /> Penilaian berhasil dikirim ke layar {selectedStudent.name}!
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400">
                        Siswa akan menerima nilai dan feedback ini secara real-time.
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveAssessment}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-40 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSaving ? 'Menyimpan...' : 'Kirim Penilaian & Feedback'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print / Export PDF Modal */}
      {selectedStudent && (
        <PrintPdfModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={{
            ...selectedStudent,
            rubricScores: rubric,
            feedback: feedbackText || selectedStudent.feedback
          }}
          theme={theme}
          sessionId={session.id}
          isTeacher={true}
        />
      )}
    </div>
  );
};
