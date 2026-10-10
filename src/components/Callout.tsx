import React from 'react';

interface CalloutProps {
  quote?: string;
  subquote?: string;
  badge?: string;
  className?: string;
}

// Kotak keterangan teks biasa (tanpa gambar). Menggantikan maskot.
export const Callout: React.FC<CalloutProps> = ({ quote, subquote, badge, className = '' }) => {
  if (!quote && !subquote) {
    return badge ? (
      <span
        className={`inline-block px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-bold ${className}`}
      >
        {badge}
      </span>
    ) : null;
  }

  return (
    <div
      className={`w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 px-3.5 py-3 text-left ${className}`}
    >
      {badge && (
        <span className="inline-block mb-1 px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-[10px] font-bold">
          {badge}
        </span>
      )}
      {quote && (
        <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">{quote}</p>
      )}
      {subquote && (
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">{subquote}</p>
      )}
    </div>
  );
};
