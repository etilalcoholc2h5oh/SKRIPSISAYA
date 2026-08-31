import React from 'react';
import chibiWriterImg from '../assets/images/chibi_writer_1787208654329.jpg';
import chibiCheerImg from '../assets/images/chibi_cheer_1787208676480.jpg';
import chibiThinkingImg from '../assets/images/chibi_thinking_1787208690035.jpg';
import chibiTeacherImg from '../assets/images/chibi_teacher_1787208708138.jpg';
import chibiAwardImg from '../assets/images/chibi_star_award_1787209287345.jpg';
import chibiKitabImg from '../assets/images/chibi_studying_kitab_1787209304570.jpg';
import chibiDigitalPenImg from '../assets/images/chibi_digital_pen_1787209319158.jpg';
import chibiVocabCardImg from '../assets/images/chibi_vocab_card_1787211534616.jpg';

export type MascotVariant = 'writer' | 'cheer' | 'thinking' | 'teacher' | 'award' | 'kitab' | 'digitalPen' | 'vocabCard';

export const CHIBI_IMAGES: Record<MascotVariant, string> = {
  writer: chibiWriterImg,
  cheer: chibiCheerImg,
  thinking: chibiThinkingImg,
  teacher: chibiTeacherImg,
  award: chibiAwardImg,
  kitab: chibiKitabImg,
  digitalPen: chibiDigitalPenImg,
  vocabCard: chibiVocabCardImg,
};

const MASCOT_NAMES: Record<MascotVariant, string> = {
  writer: 'Makuro',
  cheer: 'Makuro',
  thinking: 'Makuro',
  teacher: 'Makuro Pengajar',
  award: 'Makuro',
  kitab: 'Makuro',
  digitalPen: 'Makuro',
  vocabCard: 'Makuro',
};

const SIZE_CLASSES = {
  xs: 'w-8 h-8',
  sm: 'w-12 h-12 sm:w-14 sm:h-14',
  md: 'w-16 h-16 sm:w-20 sm:h-20',
  lg: 'w-24 h-24 sm:w-28 sm:h-28',
  xl: 'w-32 h-32 sm:w-36 sm:h-36',
};

interface ChibiMascotProps {
  variant: MascotVariant;
  quote?: string;
  subquote?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  bubbleDirection?: 'top' | 'right' | 'left' | 'bottom';
  className?: string;
  badge?: string;
}

export const ChibiMascot: React.FC<ChibiMascotProps> = ({
  variant,
  quote,
  subquote,
  size = 'md',
  className = '',
  badge,
}) => {
  const imgSrc = CHIBI_IMAGES[variant] || chibiWriterImg;
  const mascotName = MASCOT_NAMES[variant] || 'Makuro';

  return (
    <div className={`flex items-start sm:items-center gap-3 w-full ${className}`}>
      {/* Mascot Image Container */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute -inset-1 bg-amber-400/30 rounded-full blur-xs group-hover:opacity-75 transition-opacity" />
          <div className={`relative ${SIZE_CLASSES[size]} rounded-full p-0.5 bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-amber-500/60 shadow-md overflow-hidden flex items-center justify-center shrink-0`}>
            <img
              src={imgSrc}
              alt={mascotName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Speech / Dialog Bubble if Quote Provided */}
      {quote && (
        <div className="flex-1 min-w-0 relative bg-white/95 dark:bg-stone-850/95 p-3 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-sm text-left backdrop-blur-sm">
          {/* Bubble Pointer triangle */}
          <div className="hidden sm:block absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] border-r-amber-200/80 dark:border-r-amber-900/50" />
          <div className="hidden sm:block absolute top-1/2 -left-[6px] -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-white dark:border-r-stone-850" />

          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <span>{mascotName}</span>
            </div>
            {badge && (
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-[10px] rounded-md shrink-0">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">
            "{quote}"
          </p>
          {subquote && (
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-tight">
              {subquote}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const ChibiAvatar: React.FC<{
  variant: MascotVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ variant, size = 'sm', className = '' }) => {
  const imgSrc = CHIBI_IMAGES[variant] || chibiWriterImg;
  const mascotName = MASCOT_NAMES[variant] || 'Makuro';
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`relative rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-indigo-400 shadow-sm shrink-0 ${className}`}>
      <img
        src={imgSrc}
        alt={mascotName}
        referrerPolicy="no-referrer"
        className={`${sizeMap[size]} rounded-full object-cover border border-white dark:border-stone-900`}
      />
    </div>
  );
};
