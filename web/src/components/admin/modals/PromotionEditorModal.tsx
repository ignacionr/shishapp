'use client';

import React from 'react';
import { VenuePromotion } from '@/types';
import { X, Loader2, Save } from 'lucide-react';

interface PromotionEditorModalProps {
  currentPromotion: Partial<VenuePromotion>;
  setCurrentPromotion: (p: Partial<VenuePromotion>) => void;
  onClose: () => void;
  isSavingPromotion: boolean;
  handleSavePromotion: () => Promise<void>;
  t: any;
}

export function PromotionEditorModal({
  currentPromotion,
  setCurrentPromotion,
  onClose,
  isSavingPromotion,
  handleSavePromotion,
  t
}: PromotionEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
       <div className="bg-stone-900 w-full max-w-sm rounded-[40px] p-8 border border-stone-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          <header className="flex justify-between items-center">
             <h4 className="text-2xl font-black text-white">{t.add_promotion}</h4>
             <button onClick={onClose} className="text-stone-500 hover:text-white"><X size={24} /></button>
          </header>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.promotion_type}</label>
                <select 
                  value={currentPromotion.type} 
                  onChange={e => setCurrentPromotion({...currentPromotion, type: e.target.value})} 
                  className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-coffee/50"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="video">Video</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.promotion_title}</label>
                <input type="text" value={currentPromotion.title} onChange={e => setCurrentPromotion({...currentPromotion, title: e.target.value})} placeholder={t.promotion_title} className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.promotion_content}</label>
                <textarea value={currentPromotion.content} onChange={e => setCurrentPromotion({...currentPromotion, content: e.target.value})} placeholder={t.promotion_content} className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none h-32" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.promotion_image}</label>
                <input type="text" value={currentPromotion.image_url || ''} onChange={e => setCurrentPromotion({...currentPromotion, image_url: e.target.value})} placeholder="https://..." className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
             </div>
             {currentPromotion.type === 'video' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.promotion_youtube}</label>
                    <input type="text" value={currentPromotion.youtube_id || ''} onChange={e => setCurrentPromotion({...currentPromotion, youtube_id: e.target.value})} placeholder="YouTube ID" className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
                </div>
             )}
          </div>
          <button onClick={handleSavePromotion} disabled={isSavingPromotion} className="w-full bg-coffee text-white py-5 rounded-3xl font-black shadow-lg flex items-center justify-center space-x-2 active:scale-[0.98] transition-all">
            {isSavingPromotion ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{t.add_promotion}</span>
          </button>
       </div>
    </div>
  );
}
