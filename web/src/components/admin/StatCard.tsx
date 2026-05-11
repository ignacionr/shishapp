'use client';

import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  isFloat?: boolean;
}

export function StatCard({ icon, label, value, isFloat }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col space-y-4">
       <div className="bg-stone-50 dark:bg-stone-950 w-12 h-12 rounded-2xl flex items-center justify-center">{icon}</div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{label}</p>
          <p className="text-3xl font-black">{isFloat ? value.toFixed(1) : value.toLocaleString()}</p>
       </div>
    </div>
  );
}
