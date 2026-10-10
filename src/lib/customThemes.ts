// Perpustakaan tema buatan sendiri, disimpan di perangkat pembuatnya (localStorage).
// Saat tema dipakai untuk sebuah sesi, salinannya ikut disimpan di dokumen sesi
// sehingga semua siswa di kelas itu mendapatkan tema yang sama.

import type { ThemeTopic } from '../data';
import { isCustomThemeId } from '../data';

const KEY = 'kitabah_custom_themes';
const MAX_THEMES = 20;

const looksValid = (t: any): t is ThemeTopic =>
  t && typeof t.id === 'string' && isCustomThemeId(t.id) &&
  typeof t.titleIndo === 'string' && typeof t.prompt === 'string' &&
  Array.isArray(t.mufradat);

export function loadCustomThemes(): ThemeTopic[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(looksValid) : [];
  } catch {
    return [];
  }
}

function persist(list: ThemeTopic[]): ThemeTopic[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Penyimpanan penuh atau diblokir: tema tetap bisa dipakai pada sesi ini.
  }
  return list;
}

export function saveCustomTheme(theme: ThemeTopic): ThemeTopic[] {
  const rest = loadCustomThemes().filter((t) => t.id !== theme.id);
  return persist([theme, ...rest].slice(0, MAX_THEMES));
}

export function deleteCustomTheme(id: string): ThemeTopic[] {
  return persist(loadCustomThemes().filter((t) => t.id !== id));
}
