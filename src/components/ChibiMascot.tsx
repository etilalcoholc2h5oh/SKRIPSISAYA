import React from 'react';

// Dulu menampilkan gambar maskot. Sekarang hanya kotak petunjuk teks biasa.
// Nama komponen dan props dipertahankan agar pemanggil tidak perlu diubah.
export type MascotVariant = 'writer' | 'cheer' | 'thinking' | 'teacher' | 'award' | 'kitab' | 'digitalPen' | 'vocabCard';

interface ChibiMascotProps {
  variant?: MascotVariant;
  quote?: string;
  subquote?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  bubbleDirection?: 'top' | 'right' | 'left' | 'bottom';
  className?: string;
  badge?: string;
}

export const ChibiMascot: React.FC<ChibiMascotProps> = ({ quote, subquote, className = '', badge }) => {
  if (!quote) return null;
  return (
    <div className={`w-full ${className}`}>
      <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/90 dark:bg-stone-900/70 text-left">
        {badge && (
          <span className="inline-block mb-1 px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[10px] rounded-md">
            {badge}
          </span>
        )}
        <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">{quote}</p>
        {subquote && <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-tight">{subquote}</p>}
      </div>
    </div>
  );
};

export const ChibiAvatar: React.FC<{ variant?: MascotVariant; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }> = () => null;
