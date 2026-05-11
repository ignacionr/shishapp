'use client';

import React from 'react';
import { StatEntry } from '@/types';

interface LineGraphProps {
  data: StatEntry[];
  mode?: 'count' | 'rating';
}

export function LineGraph({ data, mode = 'count' }: LineGraphProps) {
  if (!data || data.length < 2) return <div className="h-32 flex items-center justify-center text-stone-400 text-xs italic">Not enough data for graph</div>;
  
  const isRating = mode === 'rating';
  const values = data.map(d => isRating ? (d.average_rating || 0) : d.count);
  const max = isRating ? 10 : Math.max(...values, 1);
  const height = 100;
  const width = 300;
  const padding = 10;
  
  const points = values.map((v, i) => ({
    x: padding + (i * (width - 2 * padding) / (data.length - 1)),
    y: height - padding - (v * (height - 2 * padding) / max)
  }));
  
  const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // Find X for specific hours if in rating mode (where names are "HH:00")
  const markers = isRating ? [8, 12, 16, 20].map(h => {
    const hourStr = (h < 10 ? '0' : '') + h + ':00';
    const index = data.findIndex(d => d.name === hourStr);
    if (index === -1) return null;
    return {
      x: padding + (index * (width - 2 * padding) / (data.length - 1)),
      label: hourStr
    };
  }).filter(m => m !== null) : [];
  
  return (
    <div className="space-y-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
            {/* Grid lines for rating */}
            {isRating && [0, 5, 10].map(v => {
               const y = height - padding - (v * (height - 2 * padding) / max);
               return (
                 <line key={v} x1={padding} y1={y} x2={width-padding} y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" className="text-stone-200 dark:text-stone-800" />
               );
            })}

            {/* Hour markers */}
            {markers.map(m => (
              <g key={m!.label}>
                <line x1={m!.x} y1={padding} x2={m!.x} y2={height-padding} stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="text-stone-200 dark:text-stone-800" />
                <text x={m!.x} y={height + 2} textAnchor="middle" className="text-[6px] font-black fill-stone-400">{m!.label}</text>
              </g>
            ))}

            <path d={path} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-coffee" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="currentColor" className="text-coffee" />
            ))}
        </svg>
        <div className="flex justify-between px-1">
            <span className="text-[8px] font-bold text-stone-400 uppercase">{data[0].name}</span>
            <span className="text-[8px] font-bold text-stone-400 uppercase">{data[data.length - 1].name}</span>
        </div>
    </div>
  );
}
