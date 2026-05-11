'use client';

import React from 'react';
import { Video } from '@/types';
import { PlayCircle, Plus, Edit3, Trash2 } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es-419', label: 'Español' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ka', label: 'ქართული' },
  { code: 'it', label: 'Italiano' }
];

interface VideosManagementProps {
  filterLang: string;
  setFilterLang: (val: string) => void;
  filteredVideos: Video[];
  setCurrentVideo: (v: Partial<Video>) => void;
  setIsEditingVideo: (val: boolean) => void;
  handleDeleteVideo: (id: string) => Promise<void>;
  t: any;
}

export function VideosManagement({
  filterLang,
  setFilterLang,
  filteredVideos,
  setCurrentVideo,
  setIsEditingVideo,
  handleDeleteVideo,
  t
}: VideosManagementProps) {
  return (
    <section>
       <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-stone-500">
                <PlayCircle size={18} />
                <h2 className="text-xs font-black uppercase tracking-widest">{t.videos_title}</h2>
             </div>
             <select 
               value={filterLang}
               onChange={(e) => setFilterLang(e.target.value)}
               className="bg-stone-200 dark:bg-stone-800 text-[10px] font-black uppercase px-3 py-1 rounded-full outline-none focus:ring-1 focus:ring-coffee/30"
             >
               <option value="all">{t.all_languages}</option>
               {SUPPORTED_LANGUAGES.map(l => (
                 <option key={l.code} value={l.code}>{l.label}</option>
               ))}
             </select>
          </div>
          <button 
            onClick={() => { setCurrentVideo({ slug: '', title: '', description: '', language_code: 'en' }); setIsEditingVideo(true); }}
            className="bg-coffee text-white p-2 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {filteredVideos.map(v => (
            <div key={v.id} className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex items-center space-x-4">
               <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                  <img src={`https://img.youtube.com/vi/${v.slug}/hqdefault.jpg`} className="w-full h-full object-cover opacity-70" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center"><PlayCircle size={16} className="text-white opacity-80" /></div>
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold truncate">{v.title}</p>
                    <span className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-stone-500">{v.language_code}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest truncate">{v.slug}</p>
               </div>
               <div className="flex items-center space-x-1">
                  <button onClick={() => { setCurrentVideo(v); setIsEditingVideo(true); }} className="p-2 text-stone-400 hover:text-coffee transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => handleDeleteVideo(v.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
               </div>
            </div>
          ))}
       </div>
    </section>
  );
}
