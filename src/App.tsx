import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, BookOpen, Users, RefreshCw } from 'lucide-react';
import { RoleSelection } from './components/RoleSelection';
import { StudentWorkspace } from './components/StudentWorkspace';
import { TeacherDashboard } from './components/TeacherDashboard';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { firestore } from './lib/firebase';
import { ClassSession, getSession } from './lib/db';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Routing State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  
  const [sessionData, setSessionData] = useState<ClassSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      setIsLoadingSession(true);
      // Immediately fetch once
      getSession(currentSessionId).then((sess) => {
        if (sess) setSessionData(sess);
        setIsLoadingSession(false);
      }).catch(err => {
        console.error(err);
        setIsLoadingSession(false);
      });

      // Realtime listener
      const unsub = onSnapshot(doc(firestore, 'sessions', currentSessionId), (docSnap) => {
        if (docSnap.exists()) {
          setSessionData({ id: docSnap.id, ...docSnap.data() } as ClassSession);
        }
        setIsLoadingSession(false);
      });
      return () => unsub();
    } else {
      setSessionData(null);
    }
  }, [currentSessionId]);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleJoinSession = (sessionId: string, studentId: string) => {
    setCurrentSessionId(sessionId);
    setCurrentStudentId(studentId);
    setIsTeacher(false);
  };

  const handleCreateSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setCurrentStudentId(null);
    setIsTeacher(true);
  };

  const handleLogout = () => {
    setCurrentSessionId(null);
    setCurrentStudentId(null);
    setIsTeacher(false);
    setSessionData(null);
  };

  const handleSwitchToTeacher = () => {
    setIsTeacher(true);
  };

  const borderColor = isDarkMode ? 'border-stone-800' : 'border-stone-200';
  const cardBg = isDarkMode ? 'bg-stone-900/50' : 'bg-white';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      
      {/* Navbar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b ${borderColor} ${isDarkMode ? 'bg-stone-950/80' : 'bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base sm:text-lg leading-none whitespace-nowrap">Kitabah Insya'</h1>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  Kelas XI
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium hidden sm:block mt-0.5">MA Kelas XI • Insya' Muwajjah PWA</p>
            </div>
          </button>

          {/* Session Status & Quick Switch */}
          {currentSessionId && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-[11px] shrink-0">
              {sessionData?.isSoloPractice || sessionData?.teacherName === 'Latihan Mandiri' || currentSessionId.startsWith('SL') ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>Latihan Mandiri</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400 font-medium">KBM:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{currentSessionId}</span>
                  <span className="text-stone-300 dark:text-stone-600">|</span>
                  <span className="font-semibold text-stone-600 dark:text-stone-300">
                    {isTeacher ? 'Guru' : 'Siswa'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {currentSessionId && (
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl transition-colors shrink-0"
                title="Ganti Peran / Kembali ke Menu Utama"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Ganti Peran</span>
              </button>
            )}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Mode Gelap / Terang"
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!currentSessionId ? (
          <RoleSelection onJoinSession={handleJoinSession} onCreateSession={handleCreateSession} />
        ) : isTeacher ? (
          sessionData ? (
            <TeacherDashboard session={sessionData} isDarkMode={isDarkMode} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-sm font-semibold text-stone-600 dark:text-stone-400">
                Menghubungkan ke Ruang Kelas Guru ({currentSessionId})...
              </p>
            </div>
          )
        ) : (
          currentStudentId && <StudentWorkspace sessionId={currentSessionId} studentId={currentStudentId} isDarkMode={isDarkMode} />
        )}
      </main>

    </div>
  );
}

