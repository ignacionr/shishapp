'use client';

import React from 'react';
import { AdminStats } from '@/types';
import { Users, BookOpen, Star, Coffee, BarChart3, MapPin, Globe } from 'lucide-react';
import { StatCard } from './StatCard';

const COUNTRIES = [
  { code: 'WW', label: 'Worldwide' },
  { code: 'AR', label: 'Argentina' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'BR', label: 'Brazil' },
  { code: 'ES', label: 'Spain' },
  { code: 'GE', label: 'Georgia' },
  { code: 'TH', label: 'Thailand' },
  { code: 'RU', label: 'Russia' }
];

interface GlobalStatsProps {
  stats: AdminStats;
  t: any;
}

export function GlobalStats({ stats, t }: GlobalStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <StatCard icon={<Users className="text-blue-500" />} label={t.total_users} value={stats.total_users} />
          <StatCard icon={<BookOpen className="text-orange-500" />} label={t.total_journals} value={stats.total_journals} />
          <StatCard icon={<Star className="text-yellow-500" />} label={t.total_presets} value={stats.total_presets} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center space-x-2 text-stone-500 mb-6 px-2">
                <Coffee size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest">{t.popular_coffee}</h2>
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
                {stats.popular_coffee.map((entry, idx) => (
                  <div key={entry.name} className={`p-5 flex justify-between items-center ${idx !== stats.popular_coffee.length - 1 ? 'border-b border-stone-50 dark:border-stone-800' : ''}`}>
                    <span className="font-bold text-sm">{entry.name}</span>
                    <span className="bg-stone-50 dark:bg-stone-950 px-3 py-1 rounded-full text-[10px] font-black text-coffee-700">{entry.count}</span>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 text-stone-500 mb-6 px-2">
                <BarChart3 size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest">{t.popular_methods}</h2>
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
                {stats.popular_methods.map((entry, idx) => (
                  <div key={entry.name} className={`p-5 flex justify-between items-center ${idx !== stats.popular_methods.length - 1 ? 'border-b border-stone-50 dark:border-stone-800' : ''}`}>
                    <span className="font-bold text-sm">{t[entry.name as keyof typeof t] || entry.name}</span>
                    <span className="bg-stone-50 dark:bg-stone-950 px-3 py-1 rounded-full text-[10px] font-black text-coffee-700">{entry.count}</span>
                  </div>
                ))}
            </div>
          </section>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
              <div className="flex items-center space-x-2 text-stone-500 mb-6 px-2">
                  <MapPin size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest">{(t as any).popular_venues}</h2>
              </div>
              <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
                  {stats.popular_venues?.map((entry, idx) => (
                  <div key={entry.name} className={`p-5 flex justify-between items-center ${idx !== stats.popular_venues.length - 1 ? 'border-b border-stone-50 dark:border-stone-800' : ''}`}>
                      <span className="font-bold text-sm">{entry.name}</span>
                      <span className="bg-stone-50 dark:bg-stone-950 px-3 py-1 rounded-full text-[10px] font-black text-coffee-700">{entry.count}</span>
                  </div>
                  ))}
              </div>
          </section>

          <section>
              <div className="flex items-center space-x-2 text-stone-500 mb-6 px-2">
                  <Globe size={18} />
                  <h2 className="text-xs font-black uppercase tracking-widest">{t.users_by_country}</h2>
              </div>
              <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
                  {stats.users_by_country.map((entry, idx) => (
                  <div key={entry.name} className={`p-5 flex justify-between items-center ${idx !== stats.users_by_country.length - 1 ? 'border-b border-stone-50 dark:border-stone-800' : ''}`}>
                      <span className="font-bold">{COUNTRIES.find(c => c.code === entry.name)?.label || entry.name}</span>
                      <span className="bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full text-xs font-black text-coffee-700">{entry.count}</span>
                  </div>
                  ))}
              </div>
          </section>
      </div>
    </>
  );
}
