import React, { useState, useEffect, useRef } from 'react';
import { THEMES, ThemeTopic, Mufradat, TarkibPattern } from '../data';
import { generateInstantStoryboardLocally, resolveScenePhoto, resolveQuickTranslation, StoryboardScene } from '../utils/visualResolver';
import { updateStudentProgress, subscribeToStudent, subscribeToSession, StudentProgress, ClassSession } from '../lib/db';
import { ChibiMascot } from './ChibiMascot';
import flowStepStartImg from '../assets/images/flow_step_start_1787210042818.jpg';
import flowStepMainImg from '../assets/images/flow_step_main_1787210066046.jpg';
import flowStepEndImg from '../assets/images/flow_step_end_1787210088142.jpg';

import { 
  Lightbulb, CheckCircle2, Type, Send, Wand2, Volume2, 
  BookOpen, Plus, Search, HelpCircle, ArrowLeft, ArrowRight, 
  Award, Check, PenTool, Keyboard, RefreshCw, AlertCircle, Lock,
  Copy, Printer, Bot, Share2, Compass, GraduationCap, Heart, Image, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HandwritingCanvas } from './HandwritingCanvas';
import { PrintPdfModal } from './PrintPdfModal';

const getCategoryStyle = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'tempat':
      return {
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
        bg: 'from-emerald-500/15 via-teal-500/10 to-emerald-500/5 dark:from-emerald-900/30 dark:to-teal-900/20 border-emerald-200/70 dark:border-emerald-800/50'
      };
    case 'aktivitas':
    case 'hobi':
      return {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
        bg: 'from-blue-500/15 via-indigo-500/10 to-sky-500/5 dark:from-blue-900/30 dark:to-indigo-900/20 border-blue-200/70 dark:border-blue-800/50'
      };
    case 'tokoh':
    case 'profesi':
    case 'keluarga':
      return {
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
        bg: 'from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-900/30 dark:to-orange-900/20 border-amber-200/70 dark:border-amber-800/50'
      };
    case 'makanan':
    case 'medis':
    case 'perasaan':
      return {
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
        bg: 'from-rose-500/15 via-pink-500/10 to-rose-500/5 dark:from-rose-900/30 dark:to-pink-900/20 border-rose-200/70 dark:border-rose-800/50'
      };
    case 'perangkat':
    case 'teknologi':
    case 'komunikasi':
    case 'materi':
      return {
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
        bg: 'from-purple-500/15 via-violet-500/10 to-purple-500/5 dark:from-purple-900/30 dark:to-violet-900/20 border-purple-200/70 dark:border-purple-800/50'
      };
    case 'wisata':
    case 'alam':
    case 'olahraga':
      return {
        badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
        bg: 'from-teal-500/15 via-cyan-500/10 to-teal-500/5 dark:from-teal-900/30 dark:to-cyan-900/20 border-teal-200/70 dark:border-teal-800/50'
      };
    default:
      return {
        badge: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
        bg: 'from-stone-500/10 via-stone-500/5 to-transparent dark:from-stone-800/40 dark:to-stone-900/20 border-stone-200/70 dark:border-stone-800/50'
      };
  }
};

interface StudentWorkspaceProps {
  sessionId: string;
  studentId: string;
  isDarkMode: boolean;
  onExit?: () => void;
}

const ARABIC_DIACRITICS = [
  { label: 'َ Fathah', char: 'َ' },
  { label: 'ِ Kasrah', char: 'ِ' },
  { label: 'ُ Dhommah', char: 'ُ' },
  { label: 'ً Fathatain', char: 'ً' },
  { label: 'ٍ Kasratain', char: 'ٍ' },
  { label: 'ٌ Dhommatain', char: 'ٌ' },
  { label: 'ّ Tasydid', char: 'ّ' },
  { label: 'ْ Sukun', char: 'ْ' },
  { label: 'ـ Kasheeda', char: 'ـ' },
];

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({ 
  sessionId, 
  studentId, 
  isDarkMode,
  onExit 
}) => {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [session, setSession] = useState<ClassSession | null>(null);
  const [localDraft, setLocalDraft] = useState<string>('');
  const [localIdeas, setLocalIdeas] = useState<string[]>(['', '', '']);
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ideasTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingRubric, setLoadingRubric] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiActionType, setAiActionType] = useState<'ide' | 'evaluasi' | 'harakat' | 'rubrik' | null>(null);

  const [visualStory, setVisualStory] = useState<StoryboardScene[]>([]);
  const [loadingVisual, setLoadingVisual] = useState(false);

  const [mufradatSearch, setMufradatSearch] = useState('');
  const [customWord, setCustomWord] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [stepLockWarning, setStepLockWarning] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);


  const isSolo = session?.isSoloPractice || session?.teacherName === 'Latihan Mandiri' || sessionId.startsWith('SL');

  useEffect(() => {
    const unsubStudent = subscribeToStudent(sessionId, studentId, (data) => {
      setProgress(data);
      if (data) {
        // Sync local draft from remote only if user isn't actively in middle of debounce typing
        if (!draftTimeoutRef.current) {
          setLocalDraft(data.draft || '');
        }
        if (!ideasTimeoutRef.current && data.ideas) {
          setLocalIdeas(data.ideas);
        }
      }
    });

    const unsubSession = subscribeToSession(sessionId, (data) => {
      setSession(data);
    });

    return () => {
      if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);
      if (ideasTimeoutRef.current) clearTimeout(ideasTimeoutRef.current);
      unsubStudent();
      unsubSession();
    };
  }, [sessionId, studentId]);

  // Live, instant, 0-latency storyboard synchronization
  useEffect(() => {
    const text = localDraft || progress?.draft || '';
    if (!text || text.trim().length < 3) {
      setVisualStory([]);
      return;
    }
    
    // 1. Instant local visual resolution with 0 latency
    const instantScenes = generateInstantStoryboardLocally(text);
    if (instantScenes.length > 0) {
      setVisualStory(prev => {
        // Retain existing refined translations if sentences match
        return instantScenes.map((newScene, idx) => {
          const matchingPrev = prev[idx];
          if (matchingPrev && matchingPrev.arabic === newScene.arabic && matchingPrev.indoMeaning) {
            return {
              ...newScene,
              indoMeaning: matchingPrev.indoMeaning,
              sceneTitle: matchingPrev.sceneTitle || newScene.sceneTitle
            };
          }
          return newScene;
        });
      });
    }

    // 2. Fast background AI translation refinement (debounce 1s)
    if (visualTimeoutRef.current) {
      clearTimeout(visualTimeoutRef.current);
    }
    visualTimeoutRef.current = setTimeout(() => {
      handleUpdateVisual();
    }, 1000);

    return () => {
      if (visualTimeoutRef.current) clearTimeout(visualTimeoutRef.current);
    };
  }, [localDraft]);

  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-medium animate-pulse">Menghubungkan ke Ruang Kelas...</p>
      </div>
    );
  }











  // Safe fallback resolution for Theme
  const resolvedThemeId = progress?.themeId || session?.themeId || THEMES[0].id;
  const theme: ThemeTopic = THEMES.find(t => t.id === resolvedThemeId) || THEMES[0];

  const borderColor = isDarkMode ? 'border-stone-800' : 'border-stone-200';
  const cardBg = isDarkMode ? 'bg-stone-900/60' : 'bg-white';

  // Step Completion Validations
  const activeIdeas = localIdeas.length > 0 ? localIdeas : (progress.ideas || []);
  const filledIdeasCount = activeIdeas.filter(i => i && i.trim().length >= 2).length;
  const isStep1Done = filledIdeasCount >= 2; // Minimal 2 gagasan terisi
  
  const selectedVocabCount = (progress.selectedMufradat?.length || 0) + (progress.selectedTarkib?.length || 0);
  const isStep2Done = selectedVocabCount >= 2; // Minimal 2 kosakata / pola kalimat dipilih

  const isStepAccessible = (targetStep: number): boolean => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return isStep1Done;
    if (targetStep === 3) return isStep1Done && isStep2Done;
    return false;
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const updateIdea = (index: number, val: string) => {
    const newIdeas = [...activeIdeas];
    newIdeas[index] = val;
    setLocalIdeas(newIdeas);
    if (stepLockWarning) setStepLockWarning(null);

    if (ideasTimeoutRef.current) {
      clearTimeout(ideasTimeoutRef.current);
    }
    ideasTimeoutRef.current = setTimeout(() => {
      updateStudentProgress(sessionId, studentId, { ideas: newIdeas });
      ideasTimeoutRef.current = null;
    }, 400);
  };

  const handleDraftChange = (newVal: string) => {
    setLocalDraft(newVal);
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }
    draftTimeoutRef.current = setTimeout(() => {
      updateStudentProgress(sessionId, studentId, { draft: newVal });
      draftTimeoutRef.current = null;
    }, 450);
  };



  const flushDraftImmediately = (overrideText?: string) => {
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
      draftTimeoutRef.current = null;
    }
    const textToSave = overrideText !== undefined ? overrideText : localDraft;
    updateStudentProgress(sessionId, studentId, { draft: textToSave });
  };

  const toggleMufradat = (word: string) => {
    const current = progress.selectedMufradat || [];
    const isSelected = current.includes(word);
    const updated = isSelected ? current.filter(w => w !== word) : [...current, word];
    updateStudentProgress(sessionId, studentId, { selectedMufradat: updated });
    if (stepLockWarning) setStepLockWarning(null);
  };

  const toggleTarkib = (patternName: string) => {
    const current = progress.selectedTarkib || [];
    const isSelected = current.includes(patternName);
    const updated = isSelected ? current.filter(p => p !== patternName) : [...current, patternName];
    updateStudentProgress(sessionId, studentId, { selectedTarkib: updated });
    if (stepLockWarning) setStepLockWarning(null);
  };

  const addCustomMufradat = () => {
    if (!customWord.trim()) return;
    const formatted = customMeaning.trim() ? `${customWord.trim()} (${customMeaning.trim()})` : customWord.trim();
    const current = progress.selectedMufradat || [];
    if (!current.includes(formatted)) {
      updateStudentProgress(sessionId, studentId, { selectedMufradat: [...current, formatted] });
    }
    setCustomWord('');
    setCustomMeaning('');
    if (stepLockWarning) setStepLockWarning(null);
  };

  const setStep = (stepNumber: number) => {
    // Flush pending ideas or draft before moving
    if (ideasTimeoutRef.current) {
      clearTimeout(ideasTimeoutRef.current);
      ideasTimeoutRef.current = null;
      updateStudentProgress(sessionId, studentId, { ideas: localIdeas });
    }
    if (draftTimeoutRef.current) {
      flushDraftImmediately();
    }

    // Validate whether student can advance to the target step
    if (stepNumber === 2 && !isStep1Done) {
      setStepLockWarning('Tahap 1 belum selesai. Silakan isi minimal 2 gagasan alur karangan (Muqaddimah & Aktivitas Inti) sebelum melanjutkan ke pemilihan kosakata.');
      return;
    }

    if (stepNumber === 3) {
      if (!isStep1Done) {
        setStepLockWarning('Tahap 1 belum selesai. Lengkapi gagasan pokok karanganmu di Langkah 1 terlebih dahulu.');
        return;
      }
      if (!isStep2Done) {
        setStepLockWarning('Tahap 2 belum selesai. Silakan pilih minimal 2 kosakata (Mufradat) atau pola kalimat (Tarkib) sebelum mulai merangkai draf karangan.');
        return;
      }
    }

    setStepLockWarning(null);

    const currentDraft = localDraft || progress.draft || '';
    if (stepNumber === 3 && (!currentDraft || currentDraft.trim() === '')) {
      // Auto compose initial draft skeleton from brainstorming ideas
      const validIdeas = activeIdeas.filter(i => i && i.trim() !== '');
      let autoStarter = '';
      if (validIdeas.length > 0) {
        autoStarter = validIdeas.join('.\n') + '.\n';
      }
      setLocalDraft(autoStarter);
      updateStudentProgress(sessionId, studentId, { step: stepNumber, draft: autoStarter });
    } else {
      updateStudentProgress(sessionId, studentId, { step: stepNumber });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInsertDiacritic = (char: string) => {
    const textarea = document.getElementById('draft-textarea') as HTMLTextAreaElement | null;
    if (!textarea) {
      const updated = localDraft + char;
      setLocalDraft(updated);
      handleDraftChange(updated);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = localDraft;
    const updated = text.substring(0, start) + char + text.substring(end);
    
    setLocalDraft(updated);
    handleDraftChange(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 50);
  };

  const handleUpdateVisual = async () => {
    const textToEvaluate = localDraft || progress?.draft;
    if (!textToEvaluate || textToEvaluate.trim().length < 3) return;
    
    // Guarantee instant local scenes
    const localScenes = generateInstantStoryboardLocally(textToEvaluate);
    if (localScenes.length > 0) {
      setVisualStory(prev => {
        if (prev.length === 0) return localScenes;
        return prev;
      });
    }

    setLoadingVisual(true);
    const customKey = localStorage.getItem('geminiApiKey') || '';
    try {
      const res = await fetch('/api/ai/visual-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToEvaluate,
          customApiKey: customKey
        })
      });
      const data = await res.json();
      
      let parsed: { arabic: string; indoMeaning?: string; sceneTitle?: string; visualSceneEn?: string; categoryIcon?: string }[] = [];
      try {
        const cleanJson = (data.result || "").replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const finalStory: StoryboardScene[] = parsed.map((item, idx) => {
            const photo = resolveScenePhoto(item.arabic, item.indoMeaning, idx);
            return {
              arabic: item.arabic,
              indoMeaning: item.indoMeaning || resolveQuickTranslation(item.arabic),
              sceneTitle: item.sceneTitle || photo.title,
              categoryIcon: item.categoryIcon || photo.icon,
              imageUrl: photo.url
            };
          });
          setVisualStory(finalStory);
        } else {
          throw new Error("Not an array");
        }
      } catch (parseErr) {
        setVisualStory(localScenes);
      }
    } catch (err) {
      console.error("Visual auto-sync:", err);
      setVisualStory(localScenes);
    } finally {
      setLoadingVisual(false);
    }
  };

  const handleAskAI = async (action: 'ide' | 'evaluasi' | 'harakat') => {
    // Flush draft before sending to AI
    flushDraftImmediately();
    setLoadingAi(true);
    setAiActionType(action);
    setAiSuggestion(null);

    const customKey = localStorage.getItem('geminiApiKey') || '';
    let endpoint = '/api/ai/suggest';
    let body: any = { theme: theme.titleIndo, customApiKey: customKey };

    const currentDraftText = localDraft || progress?.draft || '';
    const currentIdeas = progress?.ideas || localIdeas;

    if (action === 'ide') {
      endpoint = '/api/ai/suggest';
      body.text = currentIdeas.filter(Boolean).join('. ') || currentDraftText || theme.prompt;
    } else if (action === 'harakat') {
      endpoint = '/api/ai/harakat';
      body.text = currentDraftText;
    } else if (action === 'evaluasi') {
      endpoint = '/api/ai/evaluate';
      body.text = currentDraftText;
      body.ideas = currentIdeas;
      body.selectedMufradat = progress?.selectedMufradat;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.result) {
        if (action === 'harakat') {
          // Update local draft and Firestore with diacritics directly
          setLocalDraft(data.result);
          updateStudentProgress(sessionId, studentId, { draft: data.result });
          setAiSuggestion('Teks karanganmu telah berhasil dilengkapi harakat.');
        } else {
          setAiSuggestion(data.result);
        }
      } else {
        setAiSuggestion('Maaf, asisten AI sedang sibuk. Silakan coba lagi sebentar lagi.');
      }
    } catch (e) {
      console.error(e);
      setAiSuggestion('Gagal menghubungi asisten AI. Periksa koneksi internet Anda.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleRequestAiRubric = async () => {
    const textToEvaluate = localDraft || progress?.draft;
    if (!textToEvaluate) return;
    flushDraftImmediately();
    setLoadingRubric(true);
    setAiActionType('rubrik');
    const customKey = localStorage.getItem('geminiApiKey') || '';
    try {
      const res = await fetch('/api/ai/rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToEvaluate,
          theme: theme.titleIndo,
          customApiKey: customKey
        })
      });
      const data = await res.json();
      if (data.result) {
        const rubric = {
          fikrah: data.result.fikrah ?? 20,
          tarkib: data.result.tarkib ?? 20,
          mufradat: data.result.mufradat ?? 20,
          imla: data.result.imla ?? 20,
          total: data.result.total ?? (data.result.fikrah + data.result.tarkib + data.result.mufradat + data.result.imla)
        };
        const fb = data.result.feedback || 'Evaluasi AI berhasil diperbarui.';
        await updateStudentProgress(sessionId, studentId, {
          rubricScores: rubric,
          feedback: fb,
          status: 'reviewed'
        });
        setAiSuggestion(`✅ Penilaian Rubrik AI Selesai! Skor Total: ${rubric.total}/100.`);
      }
    } catch (err) {
      console.error(err);
      setAiSuggestion('Gagal mendapatkan penilaian rubrik AI. Periksa koneksi internet Anda.');
    } finally {
      setLoadingRubric(false);
    }
  };

  const handleCopyDraft = () => {
    const textToCopy = localDraft || progress?.draft;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const handlePrintDraft = () => {
    setIsPrintModalOpen(true);
  };

  const handleSubmitToTeacher = async () => {
    flushDraftImmediately();
    setIsSubmitting(true);
    await updateStudentProgress(sessionId, studentId, { 
      draft: localDraft || progress?.draft || '',
      status: 'submitted' 
    });
    setIsSubmitting(false);
    setSubmitNotice(true);
    setTimeout(() => setSubmitNotice(false), 4000);
  };

  const filteredMufradat = (theme.mufradat || []).filter(m => 
    m.word.toLowerCase().includes(mufradatSearch.toLowerCase()) ||
    m.meaning.toLowerCase().includes(mufradatSearch.toLowerCase()) ||
    m.pronunciation.toLowerCase().includes(mufradatSearch.toLowerCase())
  );



  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-16">
      {/* Top Header Card */}
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border ${borderColor} ${cardBg} shadow-sm transition-all space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {isSolo ? (
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Latihan Mandiri
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Kelas KBM: {sessionId}
                </span>
              )}
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {isSolo ? 'Penulis:' : 'Siswa:'} <strong className="text-stone-800 dark:text-stone-100">{progress.name}</strong>
              </span>
              {progress.status === 'submitted' && (
                <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-[11px] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Terkirim ke Guru
                </span>
              )}
              {isSolo && progress.rubricScores && (
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> Nilai Rubrik: {progress.rubricScores.total}/100
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-arabic text-stone-900 dark:text-white" dir="rtl">
              {theme.titleArabic}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-stone-500 dark:text-stone-400">
              Tema Insya': <span className="text-blue-600 dark:text-blue-400 font-semibold">{theme.titleIndo}</span> ({theme.grade})
            </p>
          </div>

          {/* Stepper Tabs - Clean Segmented Control */}
          <div className="w-full md:w-auto grid grid-cols-3 gap-1.5 bg-stone-100 dark:bg-stone-800/90 p-1.5 rounded-2xl shrink-0">
            {[
              { num: 1, label: '1. Gagasan', arabic: 'الأفكار', icon: Lightbulb, isDone: isStep1Done, isAccessible: true },
              { num: 2, label: '2. Kosakata', arabic: 'المفردات', icon: BookOpen, isDone: isStep2Done, isAccessible: isStepAccessible(2) },
              { num: 3, label: '3. Karangan', arabic: 'الإنشاء', icon: Type, isDone: !!(progress.draft && progress.draft.trim().length > 10), isAccessible: isStepAccessible(3) }
            ].map(({ num, label, arabic, icon: Icon, isDone, isAccessible }) => {
              const isActive = progress.step === num;
              return (
                <button
                  key={num}
                  onClick={() => setStep(num)}
                  title={!isAccessible ? `Langkah ${num} terkunci. Selesaikan langkah sebelumnya.` : `Buka Langkah ${num}: ${label}`}
                  className={`flex flex-col items-center justify-center py-2 px-2.5 sm:px-4 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : !isAccessible
                      ? 'text-stone-400 dark:text-stone-600 bg-transparent cursor-not-allowed opacity-50'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700/60'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs">
                    {!isAccessible ? (
                      <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    ) : isDone && !isActive ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{label}</span>
                  </div>
                  <span className="text-[10px] font-arabic opacity-80 mt-0.5 leading-none">{arabic}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lock Warning Notice Banner */}
        {stepLockWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-start justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs md:text-sm font-medium shadow-sm"
          >
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{stepLockWarning}</span>
            </div>
            <button
              onClick={() => setStepLockWarning(null)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold text-xs shrink-0 px-2 py-0.5"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Prompt Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
          <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <strong className="text-blue-700 dark:text-blue-300 font-bold">Petunjuk Insya' Muwajjah: </strong>
            {theme.prompt}
          </div>
        </div>

        {/* Live Teacher Assessment Notification Banner (When graded) */}
        {(progress.status === 'reviewed' || progress.rubricScores || progress.feedback) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-emerald-500/15 border-2 border-amber-400 dark:border-amber-500/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    🎉 Guru Telah Memberikan Nilai & Evaluasi!
                  </span>
                  {progress.rubricScores && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-xs font-bold shadow-xs">
                      Nilai: {progress.rubricScores.total} / 100
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  {progress.feedback 
                    ? `Catatan Guru: "${progress.feedback.slice(0, 75)}${progress.feedback.length > 75 ? '...' : ''}"`
                    : 'Nilai rubrik analitis dan umpan balik guru sudah siap dilihat.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Award className="w-4 h-4" /> Lihat Rapor & Nilai
              </button>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                title="Download PDF Rapor"
              >
                <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Cetak PDF
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Workflow Step Views */}
      <AnimatePresence mode="wait">
        {/* STEP 1: BRAINSTORMING */}
        {progress.step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border ${borderColor} ${cardBg} shadow-sm space-y-4 sm:space-y-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 shrink-0" /> Langkah 1: Brainstorming Gagasan Utama
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Tentukan 3 poin alur cerita karanganmu sebelum menyusun kalimat bahasa Arab (boleh dicatat dalam Bahasa Indonesia atau Arab).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAskAI('ide')}
                  disabled={loadingAi}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 shrink-0"
                >
                  <Lightbulb className="w-4 h-4" />
                  {loadingAi && aiActionType === 'ide' ? 'Mencari Ide...' : 'Pancingan Ide AI'}
                </button>
              </div>

              {/* Mascot Guidance for Step 1 */}
              <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
                <ChibiMascot
                  variant="thinking"
                  size="sm"
                  quote="Petakan 3 alur ceritamu dulu! Mulai dari pembuka, inti kegiatan, hingga penutup."
                  subquote="Boleh tulis dalam bahasa Indonesia dulu, nanti kita rangkai bersama ke bahasa Arab yang tepat."
                  badge="Tips Ide"
                />
              </div>

              {/* 3 Idea Cards with Flow Illustrations */}
              <div className="grid gap-3 sm:gap-4">
                {[
                  { 
                    index: 0, 
                    title: '1. Gagasan Pembuka (المقدمة)', 
                    subtitle: 'Muqaddimah / Awal Cerita',
                    hint: 'Contoh: Di pagi hari yang cerah kami berkumpul (في الصباح الباكر)',
                    helpText: 'Tuliskan waktu kejadian, suasana, atau persiapan awal.',
                    img: flowStepStartImg,
                    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  },
                  { 
                    index: 1, 
                    title: '2. Gagasan Utama (الموضوع)', 
                    subtitle: 'Inti Kegiatan & Aksi',
                    hint: 'Contoh: Kami belajar dan berdiskusi di kelas (نتعلم ونتحاور في الفصل)',
                    helpText: 'Tuliskan aktivitas utama yang dilakukan.',
                    img: flowStepMainImg,
                    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                  },
                  { 
                    index: 2, 
                    title: '3. Gagasan Penutup (الخاتمة)', 
                    subtitle: 'Khatimah / Kesan & Akhir',
                    hint: 'Contoh: Kami pulang dengan perasaan gembira (رجعنا مسرورين)',
                    helpText: 'Tuliskan kesan, waktu selesai, atau hikmah kegiatan.',
                    img: flowStepEndImg,
                    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  }
                ].map(({ index, title, subtitle, hint, helpText, img, badgeColor }) => (
                  <div key={index} className="p-3 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700 shadow-sm mt-0.5">
                        <img 
                          src={img} 
                          alt={title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}`}>
                            {subtitle}
                          </span>
                        </div>
                        <label className="block text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 leading-snug">
                          {title}
                        </label>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {helpText}
                        </p>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={activeIdeas[index] || ''}
                        onChange={(e) => updateIdea(index, e.target.value)}
                        placeholder={hint}
                        className={`w-full p-2.5 sm:p-3 rounded-xl border ${borderColor} bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contoh Insya' Reference Accordion */}
              {theme.contohInsya && (
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/50 space-y-2">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Contoh Model Karangan (Sebagai Referensi)
                  </span>
                  <p className="font-arabic text-base sm:text-lg leading-relaxed text-stone-800 dark:text-stone-200" dir="rtl">
                    {theme.contohInsya}
                  </p>
                </div>
              )}

              {/* AI Suggestion Box */}
              {aiSuggestion && aiActionType === 'ide' && (
                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" /> Saran Ide dari Asisten AI:
                    </span>
                    <button onClick={() => setAiSuggestion(null)} className="text-stone-400 hover:text-stone-600 text-xs">
                      Tutup
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                    {aiSuggestion}
                  </p>
                </div>
              )}

              {/* Navigation Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="text-xs text-stone-500 font-medium text-center sm:text-left">
                  {!isStep1Done ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center justify-center sm:justify-start gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5" /> Lengkapi minimal 2 gagasan di atas (Terisi: {filledIdeasCount}/3)
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Gagasan siap ({filledIdeasCount}/3 gagasan terisi)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Done}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {!isStep1Done ? (
                    <>
                      <Lock className="w-4 h-4" /> Lengkapi Gagasan untuk Lanjut
                    </>
                  ) : (
                    <>
                      Lanjut ke Pilih Kosakata & Pola Kalimat <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: MUFRADAT & TARKIB SELECTION */}
        {progress.step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border ${borderColor} ${cardBg} shadow-sm space-y-6`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" /> Langkah 2: Pilih Kosakata & Pola Kalimat
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Pilih kosakata (Mufradat) dan kaidah kalimat (Tarkib) yang akan kamu gunakan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold">
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    {progress.selectedMufradat?.length || 0} Kosakata
                  </span>
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {progress.selectedTarkib?.length || 0} Tarkib
                  </span>
                </div>
              </div>

              {/* Mascot Guidance for Step 2 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50">
                <ChibiMascot
                  variant="vocabCard"
                  size="sm"
                  quote="Pilih kosakata bergambar dan kaidah kalimat (tarkib) untuk karanganmu!"
                  subquote="Klik kartu untuk memilih kata, dan tekan tombol suara 🔊 untuk mendengarkan cara membacanya."
                  badge="Bank Kosakata"
                />
              </div>

              {/* Section 1: Mufradat Grid */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500 shrink-0" /> Bank Kosakata Bergambar ({theme.titleIndo})
                  </h3>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 top-2.5 sm:top-3 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Cari kosakata..."
                      value={mufradatSearch}
                      onChange={(e) => setMufradatSearch(e.target.value)}
                      className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Mufradat Cards */}
                {filteredMufradat.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                    {filteredMufradat.map((item) => {
                      const isSelected = (progress.selectedMufradat || []).includes(item.word);
                      const catStyle = getCategoryStyle(item.category);
                      return (
                        <div
                          key={item.word}
                          onClick={() => toggleMufradat(item.word)}
                          className={`relative p-3 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none group shadow-xs ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50/90 dark:bg-purple-950/50 shadow-md ring-2 ring-purple-500/30 -translate-y-0.5'
                              : 'border-stone-200 dark:border-stone-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-stone-900/60 hover:shadow-sm hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Top bar with audio, category badge, and selection check */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playSpeech(item.word);
                              }}
                              title="Dengarkan pelafalan fasih"
                              className="p-1 rounded-lg text-stone-400 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            {item.category && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${catStyle.badge}`}>
                                {item.category}
                              </span>
                            )}

                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] font-bold transition-transform ${
                              isSelected ? 'bg-purple-600 border-purple-600 text-white shadow-xs scale-110' : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800'
                            }`}>
                              {isSelected ? '✓' : ''}
                            </div>
                          </div>

                          {/* Center: Contextual Real Photo/Illustration & Arabic word */}
                          <div className="flex flex-col items-center justify-center my-1 text-center w-full">
                            <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden mb-2 bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 relative shadow-2xs group-hover:shadow-md transition-all">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.meaning}
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full ${item.imageUrl ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br ${catStyle.bg}`}
                              >
                                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                                  {item.category || 'مفردات'}
                                </span>
                              </div>
                            </div>
                            <span className="font-arabic text-xl sm:text-2xl font-bold text-stone-900 dark:text-white leading-tight mt-0.5" dir="rtl">
                              {item.word}
                            </span>
                          </div>

                          {/* Bottom info: Meaning & Pronunciation */}
                          <div className="border-t border-stone-100 dark:border-stone-800/80 pt-2 mt-1 text-center space-y-0.5">
                            <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                              {item.meaning}
                            </p>
                            <p className="text-[10px] text-stone-400 italic truncate font-medium">
                              {item.pronunciation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400 text-xs">
                    Tidak ditemukan kosakata dengan kata kunci "{mufradatSearch}"
                  </div>
                )}

                {/* Add Custom Word */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-stone-50 dark:bg-stone-900/30 rounded-xl sm:rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                  <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Tambah Kosakata Sendiri:</span>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="Kata Arab (misal: قَلَمٌ)"
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    className="p-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex-1 font-arabic"
                  />
                  <input
                    type="text"
                    placeholder="Arti (misal: Pulpen)"
                    value={customMeaning}
                    onChange={(e) => setCustomMeaning(e.target.value)}
                    className="p-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCustomMufradat}
                    disabled={!customWord.trim()}
                    className="px-4 py-2.5 sm:py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-40 shrink-0 text-center"
                  >
                    + Tambahkan
                  </button>
                </div>
              </div>

              {/* Section 2: Tarkib / Pola Kalimat */}
              <div className="space-y-3 sm:space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <h3 className="text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                  <Type className="w-4 h-4 text-blue-500 shrink-0" /> Pola Kalimat / Kaidah Tarkib Rekomendasi
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {(theme.tarkib || []).map((t) => {
                    const isSelected = (progress.selectedTarkib || []).includes(t.name);
                    return (
                      <div
                        key={t.name}
                        onClick={() => toggleTarkib(t.name)}
                        className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all space-y-2 select-none ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-stone-200 dark:border-stone-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-stone-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                            {t.name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                          }`}>
                            {isSelected ? 'Dipilih' : '+ Pilih'}
                          </span>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/60 font-arabic text-xs sm:text-sm text-right text-stone-800 dark:text-stone-200 leading-relaxed" dir="rtl">
                          {t.patternArabic}
                        </div>

                        <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1">
                          <p><strong>Penjelasan:</strong> {t.explanation}</p>
                          <p className="text-blue-600 dark:text-blue-400 font-arabic text-xs sm:text-sm text-right" dir="rtl">
                            مثال: {t.example}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-stone-300 dark:border-stone-700 rounded-xl sm:rounded-2xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Gagasan (Langkah 1)
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="text-xs text-stone-500 font-medium text-center sm:text-right">
                    {!isStep2Done ? (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center justify-center sm:justify-end gap-1.5 font-bold">
                        <Lock className="w-3.5 h-3.5" /> Pilih minimal 2 kosakata/pola (Terpilih: {selectedVocabCount}/2)
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-end gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {selectedVocabCount} Kosakata & Pola Siap
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!isStep2Done}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-md transition-all text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {!isStep2Done ? (
                      <>
                        <Lock className="w-4 h-4" /> Pilih Kosakata untuk Lanjut
                      </>
                    ) : (
                      <>
                        Mulai Merangkai Draf Karangan <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DRAFTING & WRITING */}
        {progress.step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Writing Studio Container */}
            <div className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border ${borderColor} ${cardBg} shadow-sm space-y-4 sm:space-y-6`}>
              {/* Studio Header & AI Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Type className="w-5 h-5 shrink-0" /> Langkah 3: Menulis & Menyempurnakan Draf Insya'
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Rangkai gagasan dan kosakata pilihanmu menjadi satu karangan yang utuh dan padu.
                  </p>
                </div>

                {/* AI Assistant Quick Tools - Responsive Row / Grid */}
                <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handleAskAI('harakat')}
                    disabled={loadingAi || !progress.draft}
                    title="Lengkapi tulisan dengan harakat yang tepat"
                    className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[11px] sm:text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                  >
                    <Wand2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{loadingAi && aiActionType === 'harakat' ? 'Memproses...' : 'Beri Harakat'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskAI('evaluasi')}
                    disabled={loadingAi || !progress.draft}
                    title="Periksa tata bahasa, kaidah nahwu, dan kesesuaian makna"
                    className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] sm:text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{loadingAi && aiActionType === 'evaluasi' ? 'Menganalisis...' : 'Evaluasi AI'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskAI('ide')}
                    disabled={loadingAi}
                    title="Bantuan ide jika kamu mengalami writer's block"
                    className="flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 sm:px-3.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[11px] sm:text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                  >
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{loadingAi && aiActionType === 'ide' ? 'Berpikir...' : 'Ide AI'}</span>
                  </button>
                </div>
              </div>

              {/* Mascot Guidance for Step 3 */}
              <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
                <ChibiMascot
                  variant="digitalPen"
                  size="sm"
                  quote="Rangkai kalimatmu menjadi paragraf insya'. Gunakan mode ketik atau tulis tangan dengan jari/stylus."
                  subquote="Tersedia tombol harakat dan bantuan Asisten AI untuk memeriksa tata bahasa."
                  badge="Studio Menulis"
                />
              </div>

              {/* Ideas & Vocabulary Pill Reminder */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-1.5 sm:space-y-2">
                <div className="text-[11px] sm:text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Kosakata & Gagasan Pilihanmu:
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(progress.selectedMufradat || []).map((w) => (
                    <span key={w} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs sm:text-sm font-arabic font-bold" dir="rtl">
                      {w}
                    </span>
                  ))}
                  {(progress.selectedTarkib || []).map((t) => (
                    <span key={t} className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] sm:text-xs font-semibold">
                      {t}
                    </span>
                  ))}
                  {(progress.selectedMufradat?.length === 0 && progress.selectedTarkib?.length === 0) && (
                    <span className="text-xs text-stone-400 italic">Belum ada kosakata yang dipilih di Langkah 2.</span>
                  )}
                </div>
              </div>

              {/* Mode Switcher: Ketik Arab vs Tulis Tangan */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => updateStudentProgress(sessionId, studentId, { writingMode: 'type' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      (progress.writingMode || 'type') === 'type'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    <Keyboard className="w-3.5 h-3.5" /> Ketik Arab
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStudentProgress(sessionId, studentId, { writingMode: 'handwriting' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      progress.writingMode === 'handwriting'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" /> Tulis Tangan
                  </button>
                </div>

                <div className="text-[11px] sm:text-xs text-stone-400">
                  {localDraft ? `${localDraft.trim().split(/\s+/).length} Kata | ${localDraft.length} Karakter` : '0 Kata'}
                </div>
              </div>

              {/* Writing Interface */}
              {(progress.writingMode || 'type') === 'type' ? (
                <div className="space-y-3">
                  {/* Diacritics Bar */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-1.5 p-1.5 sm:p-2 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800">
                    <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 px-1">Harakat:</span>
                    {ARABIC_DIACRITICS.map(({ label, char }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleInsertDiacritic(char)}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-blue-400 rounded-lg font-arabic text-base sm:text-lg font-bold text-stone-800 dark:text-stone-100 transition-colors"
                      >
                        {char}
                      </button>
                    ))}
                  </div>

                  <textarea
                    id="draft-textarea"
                    dir="rtl"
                    value={localDraft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    onBlur={() => flushDraftImmediately()}
                    placeholder="اكتب هنا... (Mulai tulis karanganmu dalam bahasa Arab di sini)"
                    className={`w-full min-h-[220px] sm:min-h-[320px] p-4 sm:p-6 rounded-xl sm:rounded-2xl border ${borderColor} bg-transparent resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 font-arabic text-2xl sm:text-3xl leading-[2.3] sm:leading-[2.7] tracking-wide`}
                  />

                  {/* Visualisasi AI Berkesinambungan */}
                  {(localDraft || progress?.draft) && (
                    <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm sm:text-base">
                          <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 
                          <span>Visualisasi Papan Cerita Karangan (Alur Kronologis)</span>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <div className={`text-xs px-3 py-1.5 rounded-lg font-medium shadow-xs flex items-center gap-1.5 ${loadingVisual ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'}`}>
                            {loadingVisual ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                <span>Menyempurnakan Terjemahan...</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Sinkron Otomatis (Real-Time)</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {visualStory.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
                          {visualStory.map((segment, idx) => {
                            const photo = resolveScenePhoto(segment.arabic, segment.indoMeaning, idx);
                            const activeImgUrl = segment.imageUrl || photo.url;
                            const title = segment.sceneTitle || photo.title;
                            const icon = segment.categoryIcon || photo.icon || '🎬';
                            return (
                              <div key={idx} className="min-w-[280px] sm:min-w-[320px] max-w-[360px] shrink-0 snap-center rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-blue-200/90 dark:border-blue-900/70 flex flex-col shadow-sm hover:shadow-md transition-all">
                                <div className="h-44 sm:h-52 w-full bg-stone-100 dark:bg-stone-800 relative overflow-hidden group">
                                  <img 
                                    src={activeImgUrl}
                                    alt={title}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      if (target.src !== photo.url) {
                                        target.src = photo.url;
                                      }
                                    }}
                                  />
                                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-stone-900/85 backdrop-blur-xs text-white flex items-center gap-1.5 text-xs font-bold shadow-md max-w-[90%]">
                                    <span className="text-sm">{icon}</span>
                                    <span className="shrink-0">Adegan {idx + 1}</span>
                                    {title && (
                                      <span className="text-[11px] font-normal text-stone-200 border-l border-stone-600 pl-1.5 truncate">
                                        {title}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="p-3.5 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
                                  <p className="font-arabic text-lg sm:text-xl font-bold text-stone-900 dark:text-white leading-relaxed text-right" dir="rtl">
                                    {segment.arabic}
                                  </p>
                                  {segment.indoMeaning ? (
                                    <p className="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/70 px-2.5 py-2 rounded-lg border border-stone-100 dark:border-stone-800 text-left leading-relaxed">
                                      <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1">Arti:</span>
                                      {segment.indoMeaning}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="w-full h-24 sm:h-32 rounded-xl bg-blue-100/50 dark:bg-blue-900/20 border border-dashed border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-medium px-4 text-center gap-1">
                          <p className="font-bold">Papan Cerita Visual Belum Dimuat</p>
                          <p className="text-stone-500 dark:text-stone-400 text-[11px]">Tulis kalimat karangan dalam bahasa Arab di kotak atas, lalu klik "Segarkan Visual" atau tunggu beberapa detik agar adegan cerita muncul secara berurutan.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <HandwritingCanvas
                  initialDataUrl={progress.handwritingDataUrl}
                  isDarkMode={isDarkMode}
                  onSave={(dataUrl) => {
                    updateStudentProgress(sessionId, studentId, { handwritingDataUrl: dataUrl });
                  }}
                />
              )}

              {/* AI Suggestion Box */}
              {aiSuggestion && aiActionType !== 'ide' && (
                <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border space-y-2 ${
                  aiActionType === 'evaluasi' 
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' 
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                }`}>
                  <div className={`flex items-center justify-between font-bold text-xs sm:text-sm ${
                    aiActionType === 'evaluasi' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4" /> 
                      {aiActionType === 'evaluasi' ? 'Hasil Evaluasi Asisten AI:' : 'Saran Asisten AI:'}
                    </span>
                    <button onClick={() => setAiSuggestion(null)} className="text-stone-400 hover:text-stone-600 text-xs">
                      Tutup
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                    {aiSuggestion}
                  </p>
                </div>
              )}

              {/* Assessment Feedback & Rubric Card (For both KBM Teacher feedback and Solo AI Rubric) */}
              {progress.feedback && (
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-50/90 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-900/60 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ChibiMascot
                        variant="award"
                        size="xs"
                        badge="Mumtaz"
                      />
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-amber-800 dark:text-amber-300 flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600 shrink-0" /> 
                          {isSolo ? 'Evaluasi & Rubrik Analitis AI (Mandiri)' : 'Umpan Balik & Evaluasi Guru'}
                        </h3>
                        <p className="text-[11px] text-stone-500">Hasil penilaian karangan insya' muwajjah</p>
                      </div>
                    </div>
                    {progress.rubricScores && (
                      <div className="px-3.5 py-1.5 bg-amber-600 text-white rounded-full font-bold text-xs sm:text-sm shrink-0 shadow-sm text-center">
                        Nilai Akhir: {progress.rubricScores.total} / 100
                      </div>
                    )}
                  </div>

                  {progress.rubricScores && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 sm:pt-2">
                      {[
                        { label: 'Gagasan / Fikrah', val: progress.rubricScores.fikrah },
                        { label: 'Tarkib / Nahwu', val: progress.rubricScores.tarkib },
                        { label: 'Mufradat', val: progress.rubricScores.mufradat },
                        { label: 'Imla / Khat', val: progress.rubricScores.imla }
                      ].map(({ label, val }) => (
                        <div key={label} className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-stone-900/60 border border-amber-200 dark:border-amber-900/40 text-center">
                          <div className="text-[10px] sm:text-[11px] text-stone-500">{label}</div>
                          <div className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300">{val} / 25</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-stone-900/50 border border-amber-200/70 dark:border-amber-900/40 text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                    {progress.feedback}
                  </div>
                </div>
              )}

              {/* Action Toolbar & Submission */}
              <div className="space-y-3 pt-4 sm:pt-6 border-t border-stone-200 dark:border-stone-800">
                {/* Secondary Quick Actions: Copy & Print */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      disabled={!progress.draft}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-40"
                    >
                      <Copy className="w-3.5 h-3.5" /> Salin Teks
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintDraft}
                      disabled={!progress.draft}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-40"
                    >
                      <Printer className="w-3.5 h-3.5" /> Cetak / PDF
                    </button>

                    {copyToast && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                        ✓ Teks karangan berhasil disalin!
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Step Navigation Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-stone-300 dark:border-stone-700 rounded-xl sm:rounded-2xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Kosakata
                  </button>

                  {!isSolo ? (
                    <div className="w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSubmitToTeacher}
                        disabled={isSubmitting || !progress.draft}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg transition-all text-xs sm:text-sm disabled:opacity-40"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmitting ? 'Mengirim...' : progress.status === 'submitted' ? 'Kirim Ulang ke Guru' : 'Kirim Karangan ke Guru'}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-2">
                      <button
                        type="button"
                        onClick={handleRequestAiRubric}
                        disabled={loadingRubric || !progress.draft}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl sm:rounded-2xl shadow-lg transition-all text-xs sm:text-sm disabled:opacity-40"
                      >
                        <Bot className="w-4 h-4" />
                        {loadingRubric ? 'Meminta Penilaian...' : 'Minta Penilaian & Rubrik AI'}
                      </button>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-stone-500 dark:text-stone-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Progres dan draf Anda tersimpan otomatis di perangkat ini.</span>
                      </div>
                    </div>
                  )}
                </div>

                {submitNotice && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl text-center">
                    Karanganmu berhasil dikirimkan ke Guru! Guru dapat melihat dan memberikan evaluasi secara langsung di Panel Guru.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable PDF & Official Worksheet Modal */}
      {progress && (
        <PrintPdfModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={{
            ...progress,
            name: progress.name || 'Siswa',
            draft: localDraft || progress.draft || '',
            ideas: (progress.ideas && progress.ideas.some(i => i.trim())) ? progress.ideas : localIdeas
          }}
          theme={theme}
          sessionId={sessionId}
          isTeacher={false}
        />
      )}

      {/* Student Score & Rubric Detail Modal (Direct Feedback from Teacher) */}
      {isScoreModalOpen && progress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-white">
                    Rapor Hasil Penilaian Karangan
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {session?.teacherName ? `Dinilai oleh: ${session.teacherName}` : 'Evaluasi Kitabah Insya\''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Score Highlight Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-100">
                    Nilai Akhir Insya'
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {progress.rubricScores?.total || 0}
                    <span className="text-xl font-normal text-amber-200 ml-1">/ 100</span>
                  </div>
                  <div className="text-xs font-semibold text-amber-100">
                    {(() => {
                      const total = progress.rubricScores?.total || 0;
                      if (total >= 90) return '🏆 ممتاز (Mumtaz / Sangat Istimewa)';
                      if (total >= 80) return '✨ جيد جدا (Jayyid Jiddan / Sangat Baik)';
                      if (total >= 70) return '👍 جيد (Jayyid / Baik)';
                      return '📝 مقبول (Maqbul / Perlu Latihan Lagi)';
                    })()}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1 bg-white/15 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                  <GraduationCap className="w-8 h-8 text-amber-100" />
                  <span className="text-[11px] font-bold text-white">{theme.titleIndo}</span>
                </div>
              </div>

              {/* 4 Rubric Indicators Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-500" /> Rincian 4 Aspek Rubrik Penilaian
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { label: 'Gagasan & Isi (Fikrah)', desc: 'Kesesuaian ide pembuka, inti, penutup', val: progress.rubricScores?.fikrah ?? '-' },
                    { label: 'Kaidah Nahwu & Tarkib', desc: 'Kesesuaian fi\'il-fa\'il & susunan kalimat', val: progress.rubricScores?.tarkib ?? '-' },
                    { label: 'Kosakata (Mufradat)', desc: 'Ketepatan pemilihan kata kontekstual', val: progress.rubricScores?.mufradat ?? '-' },
                    { label: 'Ejaan & Khat (Imla\')', desc: 'Hamzah, ta\' marbuthah & tanda baca', val: progress.rubricScores?.imla ?? '-' },
                  ].map(({ label, desc, val }) => (
                    <div key={label} className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{label}</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          {val} / 25
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 leading-tight">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher's Feedback / Catatan Guru */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-purple-500" /> Catatan & Umpan Balik Guru
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-stone-800 dark:text-stone-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {progress.feedback ? progress.feedback : 'Belum ada catatan tertulis khusus dari guru.'}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsScoreModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsScoreModalOpen(false);
                  setIsPrintModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" /> Download / Cetak PDF Rapor Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
