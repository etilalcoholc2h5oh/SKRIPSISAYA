import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp, firestore } from './firebase';
import { THEMES, ThemeTopic } from '../data';
import { reportError, reportSnapshot } from './syncStatus';

export interface RubricScores {
  fikrah: number;    // Kesesuaian Isi & Gagasan (0-25)
  tarkib: number;    // Struktur Kalimat / Nahwu (0-25)
  mufradat: number;  // Kekayaan & Ketepatan Kosakata (0-25)
  imla: number;      // Ejaan / Khat / Tanda Baca (0-25)
  total: number;     // Total (0-100)
}

export interface StudentProgress {
  id: string;
  name: string;
  themeId: string;
  step: number; // 1: Brainstorming, 2: Mufradat & Tarkib, 3: Drafting
  ideas: string[];
  selectedMufradat: string[];
  customMufradat?: { word: string; meaning: string }[]; // kosakata tambahan dari siswa
  selectedTarkib: string[];
  draft: string;
  writingMode?: 'type' | 'handwriting';
  handwritingDataUrl?: string;
  feedback: string;
  rubricScores?: RubricScores;
  status: 'draft' | 'submitted' | 'reviewed';
  lastUpdated: any;
}

export interface ClassSession {
  id: string;
  teacherName: string;
  teacherPin?: string; // data lama (teks biasa); sesi baru memakai teacherPinHash
  teacherPinHash?: string;
  active: boolean;
  themeId: string;
  isSoloPractice?: boolean;
  customTheme?: ThemeTopic; // tema buatan guru/siswa; dipakai bila themeId tidak ada di THEMES
  createdAt: any;
}

// Operasi yang menunggu balasan server tidak boleh menggantung selamanya: setelah batas waktu,
// pengguna mendapat pesan yang jelas, bukan layar "memuat" tanpa akhir.
const withTimeout = <T,>(p: Promise<T>, ms = 15000): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const id = setTimeout(
      () => reject(new Error('Server tidak merespons. Periksa internet, lalu pastikan database Firestore sudah dibuat dan aturannya dipublikasikan.')),
      ms
    );
    p.then(
      (v) => { clearTimeout(id); resolve(v); },
      (e) => { clearTimeout(id); reject(e); }
    );
  });

// PIN guru disimpan sebagai hash SHA-256 (bukan teks biasa) agar tidak terbaca di database.
const hashPin = async (sessionId: string, pin: string): Promise<string> => {
  const data = new TextEncoder().encode(`kitabah:${sessionId.toUpperCase()}:${pin.trim()}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const createSession = async (teacherName: string, themeId: string, customPin?: string, isSoloPractice: boolean = false, customTheme?: ThemeTopic) => {
  const prefix = isSoloPractice ? 'SL' : '';
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sessionId = isSoloPractice ? `${prefix}${randomPart}` : Math.random().toString(36).substring(2, 8).toUpperCase();
  const pin = customPin?.trim() || Math.floor(1000 + Math.random() * 9000).toString();
  const sessionRef = doc(firestore, 'sessions', sessionId);
  await withTimeout(setDoc(sessionRef, {
    id: sessionId,
    teacherName: teacherName.trim(),
    teacherPinHash: await hashPin(sessionId, pin),
    active: true,
    themeId: customTheme ? customTheme.id : (themeId || THEMES[0].id),
    isSoloPractice: isSoloPractice,
    // Firestore menolak nilai undefined, jadi hanya disertakan bila ada.
    ...(customTheme ? { customTheme } : {}),
    createdAt: serverTimestamp()
  }));
  return sessionId;
};

export const verifyTeacherAccess = async (sessionId: string, enteredPin: string): Promise<{ valid: boolean; session?: ClassSession; message?: string }> => {
  const cleanId = sessionId.trim().toUpperCase();
  const session = await getSession(cleanId);
  if (!session) {
    return { valid: false, message: `Kelas dengan kode "${cleanId}" tidak ditemukan di database.` };
  }
  // Sesi baru: bandingkan hash. Sesi lama: bandingkan PIN teks biasa.
  const entered = enteredPin.trim();
  let ok = true;
  if (session.teacherPinHash) {
    ok = (await hashPin(cleanId, entered)) === session.teacherPinHash;
  } else if (session.teacherPin) {
    ok = session.teacherPin.trim() === entered;
  }
  if (!ok) {
    return {
      valid: false,
      message: 'PIN Pengajar salah! Hanya guru yang memiliki PIN yang dapat mengakses panel guru.'
    };
  }
  return { valid: true, session };
};

export const getSession = async (sessionId: string): Promise<ClassSession | null> => {
  const cleanId = sessionId.trim().toUpperCase();
  const sessionRef = doc(firestore, 'sessions', cleanId);
  const snap = await withTimeout(getDoc(sessionRef));
  if (snap.exists()) {
    return snap.data() as ClassSession;
  }
  return null;
};

export const joinSession = async (sessionId: string, studentName: string) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const sessionRef = doc(firestore, 'sessions', cleanSessionId);
  const sessionSnap = await withTimeout(getDoc(sessionRef));

  let themeId = THEMES[0].id;
  if (!sessionSnap.exists()) {
    throw new Error(`Kode kelas "${cleanSessionId}" tidak ditemukan. Pastikan kode kelas yang dimasukkan sudah benar.`);
  }

  const sessionData = sessionSnap.data() as ClassSession;
  if (sessionData?.themeId) {
    themeId = sessionData?.themeId;
  }

  const studentId = Math.random().toString(36).substring(2, 9);
  const studentRef = doc(firestore, `sessions/${cleanSessionId}/students`, studentId);

  const initialData: StudentProgress = {
    id: studentId,
    name: studentName.trim(),
    themeId: themeId,
    step: 1,
    ideas: ['', '', ''],
    selectedMufradat: [],
    selectedTarkib: [],
    draft: '',
    writingMode: 'type',
    feedback: '',
    status: 'draft',
    lastUpdated: serverTimestamp()
  };

  await withTimeout(setDoc(studentRef, initialData));
  return { studentId, cleanSessionId, themeId };
};

// Latihan Mandiri: sesi dan data siswa dibuat sekaligus, tanpa menunggu balasan server.
// Firestore langsung menayangkan data lokal ke layar, jadi siswa bisa mulai menulis seketika.
export const startSoloPractice = (studentName: string, themeId: string, customTheme?: ThemeTopic) => {
  const sessionId = `SL${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const studentId = Math.random().toString(36).substring(2, 9);
  const finalThemeId = customTheme ? customTheme.id : (themeId || THEMES[0].id);

  const sessionData = {
    id: sessionId,
    teacherName: 'Latihan Mandiri',
    active: true,
    themeId: finalThemeId,
    isSoloPractice: true,
    ...(customTheme ? { customTheme } : {}),
    createdAt: serverTimestamp()
  };
  const studentData: StudentProgress = {
    id: studentId,
    name: studentName.trim() || 'Siswa Mandiri',
    themeId: finalThemeId,
    step: 1,
    ideas: ['', '', ''],
    selectedMufradat: [],
    selectedTarkib: [],
    draft: '',
    writingMode: 'type',
    feedback: '',
    status: 'draft',
    lastUpdated: serverTimestamp()
  };

  Promise.all([
    setDoc(doc(firestore, 'sessions', sessionId), sessionData),
    setDoc(doc(firestore, `sessions/${sessionId}/students`, studentId), studentData)
  ]).catch((e) => console.error('Gagal menyimpan sesi latihan mandiri:', e));

  return { sessionId, studentId };
};

export const updateStudentProgress = async (sessionId: string, studentId: string, data: Partial<StudentProgress>) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const studentRef = doc(firestore, `sessions/${cleanSessionId}/students`, studentId);
  try {
    await updateDoc(studentRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (e) {
    reportError(e);
    throw e;
  }
};

export const subscribeToSession = (sessionId: string, callback: (session: ClassSession | null) => void) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const sessionRef = doc(firestore, 'sessions', cleanSessionId);
  return onSnapshot(sessionRef, { includeMetadataChanges: true }, (docSnap) => {
    reportSnapshot(docSnap.metadata);
    if (docSnap.exists()) {
      callback(docSnap.data() as ClassSession);
    } else {
      callback(null);
    }
  }, reportError);
};

export const subscribeToStudents = (sessionId: string, callback: (students: StudentProgress[]) => void) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const studentsRef = collection(firestore, `sessions/${cleanSessionId}/students`);
  return onSnapshot(studentsRef, { includeMetadataChanges: true }, (snapshot) => {
    reportSnapshot(snapshot.metadata);
    const students: StudentProgress[] = [];
    snapshot.forEach((doc) => {
      students.push(doc.data() as StudentProgress);
    });
    callback(students);
  }, reportError);
};

export const subscribeToStudent = (sessionId: string, studentId: string, callback: (student: StudentProgress | null) => void) => {
  const cleanSessionId = sessionId.trim().toUpperCase();
  const studentRef = doc(firestore, `sessions/${cleanSessionId}/students`, studentId);
  return onSnapshot(studentRef, { includeMetadataChanges: true }, (docSnap) => {
    reportSnapshot(docSnap.metadata);
    if (docSnap.exists()) {
      callback(docSnap.data() as StudentProgress);
    } else {
      callback(null);
    }
  }, reportError);
};

// Cari tema berdasarkan id: bawaan dulu, lalu tema kustom milik sesi.
export const resolveTheme = (themeId: string | undefined, session?: ClassSession | null): ThemeTopic => {
  return (
    THEMES.find(t => t.id === themeId) ||
    (session?.customTheme && session.customTheme.id === themeId ? session.customTheme : undefined) ||
    session?.customTheme ||
    THEMES[0]
  );
};
