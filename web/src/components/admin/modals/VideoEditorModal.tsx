'use client';

import React from 'react';
import { Video } from '@/types';
import { X, Loader2, Save } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es-419', label: 'Español' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ka', label: 'ქართული' },
  { code: 'it', label: 'Italiano' },
  { code: 'ar', label: 'العربية' }
];

interface VideoEditorModalProps {
  currentVideo: Partial<Video>;
  setCurrentVideo: (v: Partial<Video>) => void;
  onClose: () => void;
  isSavingVideo: boolean;
  handleSaveVideo: () => Promise<void>;
  t: any;
}

export function VideoEditorModal({
  currentVideo,
  setCurrentVideo,
  onClose,
  isSavingVideo,
  handleSaveVideo,
  t
}: VideoEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
       <div className="bg-stone-900 w-full max-w-sm rounded-[40px] p-8 border border-stone-800 shadow-2xl space-y-6">
          <header className="flex justify-between items-center">
             <h4 className="text-2xl font-black text-white">{currentVideo.id ? t.edit_video : t.add_video}</h4>
             <button onClick={onClose} className="text-stone-500 hover:text-white"><X size={24} /></button>
          </header>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.language}</label>
                <select value={currentVideo.language_code} onChange={e => setCurrentVideo({...currentVideo, language_code: e.target.value})} className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-stone-700/50">
                  {SUPPORTED_LANGUAGES.map(l => (<option key={l.code} value={l.code}>{l.label}</option>))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.youtube_slug}</label>
                <input type="text" value={currentVideo.slug} onChange={e => setCurrentVideo({...currentVideo, slug: e.target.value})} placeholder="Slug" className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Title</label>
                <input type="text" value={currentVideo.title} onChange={e => setCurrentVideo({...currentVideo, title: e.target.value})} placeholder="Title" className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
             </div>
          </div>
          <button onClick={handleSaveVideo} disabled={isSavingVideo} className="w-full bg-stone-700 text-white py-5 rounded-3xl font-black shadow-lg flex items-center justify-center space-x-2 active:scale-[0.98] transition-all">
            {isSavingVideo ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{t.save_content}</span>
          </button>
       </div>
    </div>
  );
}
