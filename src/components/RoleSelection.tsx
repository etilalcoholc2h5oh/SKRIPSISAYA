import React, { useState, useEffect } from 'react';
import { createSession, joinSession, verifyTeacherAccess } from '../lib/db';
import { THEMES, ThemeTopic } from '../data';
import { ChibiMascot, ChibiAvatar, MascotVariant } from './ChibiMascot';
import chibiWriterImg from '../assets/images/chibi_writer_1787208654329.jpg';
import chibiTeacherImg from '../assets/images/chibi_teacher_1787208708138.jpg';
import chibiCheerImg from '../assets/images/chibi_cheer_1787208676480.jpg';
import chibiThinkingImg from '../assets/images/chibi_thinking_1787208690035.jpg';
import chibiKitabImg from '../assets/images/chibi_studying_kitab_1787209304570.jpg';
import chibiDigitalPenImg from '../assets/images/chibi_digital_pen_1787209319158.jpg';
import chibiAwardImg from '../assets/images/chibi_star_award_1787209287345.jpg';
import flowStepStartImg from '../assets/images/flow_step_start_1787210042818.jpg';
import flowStepMainImg from '../assets/images/flow_step_main_1787210066046.jpg';
import flowStepEndImg from '../assets/images/flow_step_end_1787210088142.jpg';
import { 
  Users, BookOpen, Sparkles, ArrowRight, AlertCircle, BookMarked, 
  Key, PlusCircle, Clock, Trash2, ShieldCheck, Lock, Eye, EyeOff,
  GraduationCap, PenTool, CheckCircle2, Compass, Layers
} from 'lucide-react';

interface RoleSelectionProps {
  onJoinSession: (sessionId: string, studentId: string) => void;
  onCreateSession: (sessionId: string) => void;
}

interface SavedSessionItem {
  sessionId: string;
  themeId: string;
  teacherName?: string;
  teacherPin?: string;
  studentName?: string;
  studentId?: string;
  timestamp: number;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onJoinSession, onCreateSession }) => {
  // Main Mode: 'kbm' (Kegiatan Belajar Mengajar) or 'mandiri' (Latihan Mandiri)
  const [mainMode, setMainMode] = useState<'kbm' | 'mandiri'>('kbm');

  // KBM Sub-role: 'student' | 'teacher' | null
  const [kbmRole, setKbmRole] = useState<'student' | 'teacher' | null>(null);
  
  // Teacher Tabs: 'existing' | 'create'
  const [teacherTab, setTeacherTab] = useState<'existing' | 'create'>('create');
  
  // Student KBM Form
  const [studentName, setStudentName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  
  // Teacher KBM Form - Create
  const [teacherName, setTeacherName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [teacherPin, setTeacherPin] = useState('1234');
  const [isCreating, setIsCreating] = useState(false);

  // Teacher KBM Form - Existing
  const [existingTeacherCode, setExistingTeacherCode] = useState('');
  const [existingTeacherPin, setExistingTeacherPin] = useState('');
  const [showExistingPin, setShowExistingPin] = useState(false);
  const [isEnteringExisting, setIsEnteringExisting] = useState(false);
  const [existingCodeError, setExistingCodeError] = useState<string | null>(null);

  // Mandiri (Solo) Form
  const [soloStudentName, setSoloStudentName] = useState('');
  const [soloSelectedTheme, setSoloSelectedTheme] = useState<string>(THEMES[0].id);
  const [soloFilter, setSoloFilter] = useState('');

  // Local Storage Saved Sessions
  const [savedTeacherSessions, setSavedTeacherSessions] = useState<SavedSessionItem[]>([]);
  const [savedStudentSessions, setSavedStudentSessions] = useState<SavedSessionItem[]>([]);
  const [savedSoloSessions, setSavedSoloSessions] = useState<SavedSessionItem[]>([]);

  useEffect(() => {
    try {
      const tSessions = JSON.parse(localStorage.getItem('kitabah_teacher_sessions') || '[]').filter(Boolean);
      const sSessions = JSON.parse(localStorage.getItem('kitabah_student_sessions') || '[]').filter(Boolean);
      const soloSessions = JSON.parse(localStorage.getItem('kitabah_solo_sessions') || '[]').filter(Boolean);
      const lastName = localStorage.getItem('kitabah_last_student_name') || '';
      
      setSavedTeacherSessions(tSessions);
      setSavedStudentSessions(sSessions);
      setSavedSoloSessions(soloSessions);
      if (lastName) {
        setStudentName(lastName);
        setSoloStudentName(lastName);
      }

      if (tSessions.length === 0) {
        setTeacherTab('create');
      } else {
        setTeacherTab('existing');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveTeacherSessionToHistory = (sessionId: string, themeId: string, tName: string, pin?: string) => {
    try {
      const existing: SavedSessionItem[] = JSON.parse(localStorage.getItem('kitabah_teacher_sessions') || '[]').filter(Boolean);
      const filtered = existing.filter(item => item.sessionId !== sessionId);
      const updated = [
        { sessionId, themeId, teacherName: tName, teacherPin: pin, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem('kitabah_teacher_sessions', JSON.stringify(updated));
      setSavedTeacherSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const saveStudentSessionToHistory = (sessionId: string, studentId: string, sName: string, themeId: string) => {
    try {
      const existing: SavedSessionItem[] = JSON.parse(localStorage.getItem('kitabah_student_sessions') || '[]').filter(Boolean);
      const filtered = existing.filter(item => !(item.sessionId === sessionId && item.studentId === studentId));
      const updated = [
        { sessionId, studentId, studentName: sName, themeId, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem('kitabah_student_sessions', JSON.stringify(updated));
      setSavedStudentSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSoloSessionToHistory = (sessionId: string, studentId: string, sName: string, themeId: string) => {
    try {
      const existing: SavedSessionItem[] = JSON.parse(localStorage.getItem('kitabah_solo_sessions') || '[]').filter(Boolean);
      const filtered = existing.filter(item => !(item.sessionId === sessionId && item.studentId === studentId));
      const updated = [
        { sessionId, studentId, studentName: sName, themeId, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10);
      localStorage.setItem('kitabah_solo_sessions', JSON.stringify(updated));
      setSavedSoloSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const removeTeacherSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTeacherSessions.filter(s => s.sessionId !== sessionId);
    localStorage.setItem('kitabah_teacher_sessions', JSON.stringify(updated));
    setSavedTeacherSessions(updated);
  };

  const removeStudentSession = (studentId: string, sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStudentSessions.filter(s => !(s.sessionId === sessionId && s.studentId === studentId));
    localStorage.setItem('kitabah_student_sessions', JSON.stringify(updated));
    setSavedStudentSessions(updated);
  };

  const removeSoloSession = (studentId: string, sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSoloSessions.filter(s => !(s.sessionId === sessionId && s.studentId === studentId));
    localStorage.setItem('kitabah_solo_sessions', JSON.stringify(updated));
    setSavedSoloSessions(updated);
  };

  const handleStudentJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !joinCode.trim()) return;
    
    setIsJoining(true);
    setJoinError(null);

    try {
      const cleanName = studentName.trim();
      localStorage.setItem('kitabah_last_student_name', cleanName);
      const result = await joinSession(joinCode.trim(), cleanName);
      saveStudentSessionToHistory(result.cleanSessionId, result.studentId, cleanName, result.themeId);
      onJoinSession(result.cleanSessionId, result.studentId);
    } catch (err: any) {
      console.error(err);
      setJoinError(err.message || 'Gagal masuk ke kelas. Pastikan kode kelas sudah sesuai.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleResumeStudentSession = (item: SavedSessionItem) => {
    if (!item.studentId) {
      alert("Maaf, draf ini adalah format lama dan tidak dapat dilanjutkan. Silakan hapus dan mulai sesi baru.");
      return;
    }
    onJoinSession(item.sessionId, item.studentId);
  };

  const handleTeacherCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) return;

    setIsCreating(true);
    try {
      const cleanPin = teacherPin.trim() || '1234';
      const sessionId = await createSession(teacherName.trim(), selectedTheme, cleanPin, false);
      saveTeacherSessionToHistory(sessionId, selectedTheme, teacherName.trim(), cleanPin);
      onCreateSession(sessionId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTeacherEnterExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingTeacherCode.trim()) return;

    setIsEnteringExisting(true);
    setExistingCodeError(null);

    const cleanCode = existingTeacherCode.trim().toUpperCase();
    try {
      const result = await verifyTeacherAccess(cleanCode, existingTeacherPin.trim());
      if (!result.valid) {
        setExistingCodeError(result.message || 'Akses ditolak. PIN Guru salah.');
        return;
      }
      const session = result.session!;
      saveTeacherSessionToHistory(cleanCode, session?.themeId || "", session.teacherName || 'Guru', session.teacherPin);
      onCreateSession(cleanCode);
    } catch (err: any) {
      console.error(err);
      setExistingCodeError(err.message || 'Gagal membuka kelas guru.');
    } finally {
      setIsEnteringExisting(false);
    }
  };

  const handleResumeTeacherSession = async (item: SavedSessionItem) => {
    setIsEnteringExisting(true);
    setExistingCodeError(null);
    setExistingTeacherCode(item.sessionId);
    if (item.teacherPin) {
      setExistingTeacherPin(item.teacherPin);
    }
    try {
      const result = await verifyTeacherAccess(item.sessionId, item.teacherPin || '');
      if (!result.valid) {
        setTeacherTab('existing');
        setExistingCodeError(result.message || 'Silakan masukkan PIN Guru Anda untuk melanjutkan.');
        return;
      }
      onCreateSession(item.sessionId);
    } catch (err: any) {
      console.error(err);
      setExistingCodeError(err.message || 'Gagal membuka kelas guru.');
    } finally {
      setIsEnteringExisting(false);
    }
  };

  const handleStartSoloPractice = async (themeId: string) => {
    const sName = soloStudentName.trim() || 'Siswa Mandiri';
    localStorage.setItem('kitabah_last_student_name', sName);
    setIsCreating(true);
    try {
      const sessionId = await createSession('Latihan Mandiri', themeId, '1234', true);
      const result = await joinSession(sessionId, sName);
      saveSoloSessionToHistory(sessionId, result.studentId, sName, themeId);
      onJoinSession(result.cleanSessionId, result.studentId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredSoloThemes = THEMES.filter(t => 
    t.titleIndo.toLowerCase().includes(soloFilter.toLowerCase()) ||
    t.titleArabic.includes(soloFilter) ||
    t.prompt.toLowerCase().includes(soloFilter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-6 sm:space-y-8">
      {/* Hero Title with Mascot */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 text-center md:text-left">
        <ChibiMascot
          variant="writer"
          size="lg"
          quote="Ahlan wa Sahlan! Mari mengarang insya' muwajjah bersama Makuro."
          subquote="Pilih Mode KBM bersama Guru atau Mode Latihan Mandiri untuk memulai."
          className="justify-center"
        />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-[11px] sm:text-xs font-bold shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Kurikulum MA Kelas XI (Kelas 11) • Insya' Muwajjah
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white leading-tight">
            Selamat Datang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Kitabah Insya'</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-lg leading-relaxed">
            Media interaktif menulis karangan bahasa Arab kurikulum <strong>MA Kelas XI (Kelas 11)</strong> berbasis <strong>Process-Genre Approach</strong> & Asisten AI.
          </p>
        </div>
      </div>

      {/* Top Primary Mode Switcher: Mode KBM vs Mode Mandiri */}
      <div className="p-1.5 bg-stone-200/80 dark:bg-stone-800/80 rounded-2xl sm:rounded-3xl max-w-xl mx-auto grid grid-cols-2 gap-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => { setMainMode('kbm'); setKbmRole(null); setJoinError(null); setExistingCodeError(null); }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            mainMode === 'kbm'
              ? 'bg-white dark:bg-stone-900 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-blue-500" />
          <span>Mode KBM (Kelas)</span>
        </button>

        <button
          type="button"
          onClick={() => { setMainMode('mandiri'); setJoinError(null); setExistingCodeError(null); }}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            mainMode === 'mandiri'
              ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-md scale-[1.02]'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <PenTool className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-emerald-500" />
          <span>Latihan Mandiri</span>
        </button>
      </div>

      {/* ================= MODE KBM CONTENT ================= */}
      {mainMode === 'kbm' && (
        <div className="space-y-6">
          {!kbmRole ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Siswa KBM Card */}
                <button 
                  type="button"
                  onClick={() => setKbmRole('student')} 
                  className="group relative flex flex-col items-center text-center p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-2 border-blue-500/20 hover:border-blue-500 bg-white dark:bg-stone-900/60 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                      Siswa
                    </span>
                  </div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-3 sm:mb-4 border-2 border-blue-200 dark:border-blue-800/60 shadow-md group-hover:scale-105 transition-transform">
                    <img 
                      src={chibiThinkingImg} 
                      alt="Chibi Siswa Makuro" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mb-1.5">Siswa</span>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mb-2">
                    Masuk ke ruang menulis kelas dengan kode dari guru. Tulisanmu terhubung langsung ke panel penilaian guru.
                  </p>
                  <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
                    Masuk Ruang Kelas Siswa <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Guru KBM Card */}
                <button 
                  type="button"
                  onClick={() => setKbmRole('teacher')} 
                  className="group relative flex flex-col items-center text-center p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-2 border-purple-500/20 hover:border-purple-500 bg-white dark:bg-stone-900/60 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 text-[10px] font-bold flex items-center gap-0.5">
                      <Lock className="w-3 h-3" /> PIN Guru
                    </span>
                  </div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden mb-3 sm:mb-4 border-2 border-purple-200 dark:border-purple-800/60 shadow-md group-hover:scale-105 transition-transform">
                    <img 
                      src={chibiTeacherImg} 
                      alt="Guru Chibi Makuro" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mb-1.5">Guru</span>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mb-2">
                    Buka kelas baru atau pantau kelas aktif, lihat progres menulis siswa secara live, dan berikan skor rubrik analitis.
                  </p>
                  <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                    Buka Panel Guru <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>

              {/* KBM Features Banner with Illustrations */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
                <div className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" /> Alur Kegiatan Belajar Mengajar (KBM) Kitabah Insya':
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-stone-300">
                  <div className="p-3 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex flex-col gap-2.5 shadow-sm">
                    <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
                      <img
                        src={flowStepStartImg}
                        alt="Guru Buat Kode"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs sm:text-sm mb-1">
                        1. Guru Buat Kode
                      </span>
                      <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                        Guru menentukan tema karangan & membagikan kode kelas 6 karakter kepada siswa.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex flex-col gap-2.5 shadow-sm">
                    <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
                      <img
                        src={flowStepMainImg}
                        alt="Siswa Menulis"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs sm:text-sm mb-1">
                        2. Siswa Menulis
                      </span>
                      <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                        Siswa menyusun gagasan, memilih kosakata, dan menulis karangan (ketik / tulis tangan).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 flex flex-col gap-2.5 shadow-sm">
                    <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60">
                      <img
                        src={flowStepEndImg}
                        alt="Penilaian Real-time"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs sm:text-sm mb-1">
                        3. Penilaian Real-time
                      </span>
                      <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                        Guru memantau live, memberi umpan balik, dan menilai rubrik 4 dimensi analitis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
              <button 
                type="button"
                onClick={() => { setKbmRole(null); setJoinError(null); setExistingCodeError(null); }} 
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors p-1"
              >
                &larr; Kembali ke Pilihan Peran KBM
              </button>

              {kbmRole === 'student' ? (
                /* STUDENT KBM FORM */
                <div className="bg-white dark:bg-stone-900/70 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl space-y-5 sm:space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">Masuk Ruang Siswa</h3>
                      <p className="text-xs text-stone-500">Mulai alur penulisan terarah kelas</p>
                    </div>
                  </div>

                  {joinError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{joinError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStudentJoin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        Nama Lengkap Siswa
                      </label>
                      <input 
                        type="text" 
                        required
                        value={studentName} 
                        onChange={e => setStudentName(e.target.value)} 
                        placeholder="Contoh: Muhammad Rayhan" 
                        className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        Kode Kelas (Diberikan oleh Guru)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={joinCode} 
                        onChange={e => setJoinCode(e.target.value.toUpperCase())} 
                        placeholder="Misal: AB12CD" 
                        className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono tracking-widest text-center uppercase font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                      <p className="text-[11px] text-stone-400 mt-1.5">
                        * Siswa hanya memerlukan Kode Kelas dari guru untuk mulai mengerjakan.
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isJoining || !studentName.trim() || !joinCode.trim()} 
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md disabled:opacity-40 transition-colors text-sm"
                    >
                      {isJoining ? 'Menghubungkan...' : 'Masuk ke Ruang Kelas Siswa'}
                    </button>
                  </form>

                  {/* Saved Student Sessions */}
                  {savedStudentSessions.length > 0 && (
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                      <div className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Lanjutkan Draf Siswa Tersimpan:
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {savedStudentSessions.map(item => {
                          const themeObj = THEMES.find(t => t.id === item?.themeId);
                          return (
                            <div 
                              key={item.studentId}
                              className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="font-bold text-stone-800 dark:text-stone-200">
                                  {item.studentName} <span className="font-mono text-blue-600 font-bold">({item.sessionId})</span>
                                </div>
                                <div className="text-stone-400 text-[11px]">
                                  {themeObj?.titleIndo || 'Karangan Arab'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleResumeStudentSession(item)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                                >
                                  Lanjutkan
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => removeStudentSession(item.studentId!, item.sessionId, e)}
                                  className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TEACHER KBM FORM */
                <div className="bg-white dark:bg-stone-900/70 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl space-y-5 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">Panel Guru KBM</h3>
                        <p className="text-xs text-stone-500">Kelola dan pantau ruang kelas menulis</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800">
                      <ShieldCheck className="w-3.5 h-3.5" /> Akses Guru
                    </div>
                  </div>

                  {/* Teacher Tabs */}
                  <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => { setTeacherTab('create'); setExistingCodeError(null); }}
                      className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        teacherTab === 'create'
                          ? 'bg-white dark:bg-stone-900 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Buat Kelas Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTeacherTab('existing'); setExistingCodeError(null); }}
                      className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        teacherTab === 'existing'
                          ? 'bg-white dark:bg-stone-900 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                      }`}
                    >
                      <Key className="w-3.5 h-3.5" /> Buka Kelas Lama
                    </button>
                  </div>

                  {existingCodeError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{existingCodeError}</span>
                    </div>
                  )}

                  {teacherTab === 'create' ? (
                    <form onSubmit={handleTeacherCreate} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                          Nama Guru
                        </label>
                        <input 
                          type="text" 
                          required
                          value={teacherName} 
                          onChange={e => setTeacherName(e.target.value)} 
                          placeholder="Contoh: Ustadz Ahmad Fauzi, M.Pd" 
                          className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                          Pilih Topik Tema Insya' Muwajjah
                        </label>
                        <select 
                          value={selectedTheme} 
                          onChange={e => setSelectedTheme(e.target.value)} 
                          className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {THEMES.map(t => (
                            <option key={t.id} value={t.id} className="dark:bg-stone-800">
                              {t.titleIndo} ({t.titleArabic}) — {t.grade}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                            Atur PIN Rahasia Guru
                          </label>
                          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Wajib dijaga
                          </span>
                        </div>
                        <input 
                          type="text" 
                          required
                          value={teacherPin} 
                          onChange={e => setTeacherPin(e.target.value)} 
                          placeholder="Contoh: 1234 atau GURU2026" 
                          className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" 
                        />
                        <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                          Siswa hanya diberikan <strong>Kode Kelas</strong> untuk menulis. PIN ini khusus disimpan oleh Guru agar siswa tidak dapat masuk ke Panel Guru.
                        </p>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isCreating || !teacherName.trim() || !teacherPin.trim()} 
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-md disabled:opacity-40 transition-colors text-sm"
                      >
                        {isCreating ? 'Membuat Ruang Kelas...' : 'Buat & Dapatkan Kode Kelas Baru'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <form onSubmit={handleTeacherEnterExisting} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                            Kode Kelas Guru
                          </label>
                          <input 
                            type="text" 
                            required
                            value={existingTeacherCode} 
                            onChange={e => setExistingTeacherCode(e.target.value.toUpperCase())} 
                            placeholder="Contoh: AB12CD" 
                            className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono tracking-widest text-center uppercase font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" 
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                              PIN Rahasia Guru
                            </label>
                          </div>
                          <div className="relative">
                            <input 
                              type={showExistingPin ? "text" : "password"} 
                              required
                              value={existingTeacherPin} 
                              onChange={e => setExistingTeacherPin(e.target.value)} 
                              placeholder="Masukkan PIN Guru (default: 1234)" 
                              className="w-full p-3.5 pr-11 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            />
                            <button
                              type="button"
                              onClick={() => setShowExistingPin(!showExistingPin)}
                              className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            >
                              {showExistingPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={isEnteringExisting || !existingTeacherCode.trim()} 
                          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-md disabled:opacity-40 transition-colors text-sm"
                        >
                          {isEnteringExisting ? 'Memverifikasi Akses...' : 'Buka Dashboard Kelas Guru'}
                        </button>
                      </form>

                      {/* Saved Teacher Sessions list */}
                      {savedTeacherSessions.length > 0 && (
                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                          <div className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Riwayat Kelas Guru di Perangkat Ini:
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {savedTeacherSessions.map(item => {
                              const themeObj = THEMES.find(t => t.id === item?.themeId);
                              return (
                                <div 
                                  key={item.sessionId}
                                  className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                                      <span>Kode: <strong className="font-mono text-purple-600 tracking-wider">{item.sessionId}</strong></span>
                                      <span className="text-stone-400 font-normal">({item.teacherName || 'Guru'})</span>
                                    </div>
                                    <div className="text-stone-400 text-[11px]">
                                      {themeObj?.titleIndo || 'Karangan Arab'}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleResumeTeacherSession(item)}
                                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                                    >
                                      Buka
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => removeTeacherSession(item.sessionId, e)}
                                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODE MANDIRI CONTENT ================= */}
      {mainMode === 'mandiri' && (
        <div className="space-y-6">
          {/* Header Info Mandiri with Cheer Mascot */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <ChibiMascot
                variant="kitab"
                size="md"
                quote="Semangat belajar menulis mandiri! Kamu pasti bisa menghasilkan insya' yang mumtaz."
                subquote="Pilih tema di bawah dan mulailah merangkai kalimat indahmu."
                badge="Semangat"
              />

              {/* Student Name Input for Solo Practice */}
              <div className="w-full md:w-64 shrink-0 bg-white/80 dark:bg-stone-900/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Siswa / Penulis:
                </label>
                <input
                  type="text"
                  value={soloStudentName}
                  onChange={(e) => setSoloStudentName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* AI Features Highlights */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-stone-900/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                <BookOpen className="w-3 h-3 text-emerald-600" /> Bantuan Ide Paragraf AI
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-stone-900/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Koreksi Nahwu & Imla' Otomatis
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 dark:bg-stone-900/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                <BookMarked className="w-3 h-3 text-emerald-600" /> Prediksi Nilai Rubrik Analitis AI
              </span>
            </div>
          </div>

          {/* Saved Solo Sessions */}
          {savedSoloSessions.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-2.5">
              <div className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" /> Lanjutkan Latihan Mandiri Sebelumnya:
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  {savedSoloSessions.length} draf tersimpan
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedSoloSessions.map(item => {
                  const themeObj = THEMES.find(t => t.id === item?.themeId);
                  return (
                    <div 
                      key={item.sessionId}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <div className="font-bold text-stone-800 dark:text-stone-200 truncate">
                          {themeObj?.titleIndo || 'Karangan Arab'}
                        </div>
                        <div className="text-[11px] text-stone-400 font-arabic truncate" dir="rtl">
                          {themeObj?.titleArabic}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (!item.studentId) {
                              alert("Maaf, draf mandiri ini menggunakan format lama. Silakan hapus dan buat Latihan Mandiri baru.");
                              return;
                            }
                            onJoinSession(item.sessionId, item.studentId);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Lanjut
                        </button>
                        <button
                          type="button"
                          onClick={(e) => removeSoloSession(item.studentId!, item.sessionId, e)}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded-md"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Theme Topic Selection Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
                Pilih Topik Tema Karangan ({THEMES.length} Tema Tersedia)
              </h3>
              <p className="text-xs text-stone-500">
                Pilih tema yang ingin kamu latih hari ini:
              </p>
            </div>
            <input
              type="text"
              value={soloFilter}
              onChange={(e) => setSoloFilter(e.target.value)}
              placeholder="Cari tema..."
              className="px-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48"
            />
          </div>

          {/* 7 Themes Grid with Chibi Mascot Illustrations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSoloThemes.map((topic, idx) => {
              const chibiVariants: MascotVariant[] = ['writer', 'kitab', 'thinking', 'digitalPen', 'cheer', 'award', 'teacher'];
              const currentVariant = chibiVariants[idx % chibiVariants.length];

              return (
                <div 
                  key={topic.id}
                  className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ChibiAvatar variant={currentVariant} size="xs" />
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                          {topic.grade}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-semibold">
                        {topic.mufradat?.length || 0} Kosakata
                      </span>
                    </div>

                    <div>
                      <h4 className="font-arabic text-xl sm:text-2xl font-bold text-stone-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" dir="rtl">
                        {topic.titleArabic}
                      </h4>
                      <p className="text-sm font-bold text-stone-800 dark:text-stone-200 mt-1">
                        {topic.titleIndo}
                      </p>
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {topic.prompt}
                    </p>

                    {/* Vocabulary preview chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {topic.mufradat.slice(0, 3).map((m) => (
                        <span key={m.word} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-arabic font-semibold text-stone-600 dark:text-stone-300" dir="rtl">
                          <span className="text-xs">{m.icon}</span>
                          <span>{m.word}</span>
                        </span>
                      ))}
                      {topic.mufradat.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-stone-400 font-medium self-center">
                          +{topic.mufradat.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800/80">
                    <button
                      type="button"
                      onClick={() => handleStartSoloPractice(topic.id)}
                      disabled={isCreating}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Mulai Latihan Mandiri</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
