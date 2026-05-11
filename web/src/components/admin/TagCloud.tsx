'use client';

import React from 'react';
import { StatEntry, FullTagCategory } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TagCloudProps {
  tags: StatEntry[];
  categories?: FullTagCategory[];
  lang?: string;
}

export function TagCloud({ tags, categories, lang }: TagCloudProps) {
  if (!tags || tags.length === 0) return <p className="text-stone-500 text-xs italic">No tags yet</p>;
  const max = Math.max(...tags.map(t => t.count));
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tagEntry => {
        const size = 0.75 + (tagEntry.count / max) * 1.25;
        const avg = tagEntry.average_rating || 0;
        
        const tagDetails = categories?.flatMap(c => c.tags).find(t => t.name === tagEntry.name);
        const displayName = (lang && tagDetails?.translations[lang]) || tagDetails?.translations['en'] || tagEntry.name;

        let bgColor = "bg-stone-100 dark:bg-stone-800";
        let textColor = "text-stone-700 dark:text-stone-300";
        
        if (avg >= 9.0) {
            bgColor = "bg-green-100 dark:bg-green-900/30";
            textColor = "text-green-700 dark:text-green-400";
        } else if (avg >= 7.5) {
            bgColor = "bg-amber-100 dark:bg-amber-900/30";
            textColor = "text-amber-700 dark:text-amber-400";
        } else if (avg > 0) {
            bgColor = "bg-red-100 dark:bg-red-900/30";
            textColor = "text-red-700 dark:text-red-400";
        }

        return (
          <span 
            key={tagEntry.name} 
            style={{ fontSize: `${size}rem` }}
            className={cn(
                "px-3 py-1.5 rounded-2xl font-black transition-all",
                bgColor,
                textColor
            )}
            title={`Avg Rating: ${avg.toFixed(1)}`}
          >
            {displayName}
          </span>
        );
      })}
    </div>
  );
}
