'use client';

import React from 'react';
import { PurchaseLink, Equipment } from '@/types';
import { X, Loader2, Save } from 'lucide-react';

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

interface LinkEditorModalProps {
  currentLink: Partial<PurchaseLink>;
  setCurrentLink: (l: Partial<PurchaseLink>) => void;
  onClose: () => void;
  isSavingLink: boolean;
  handleSaveLink: () => Promise<void>;
  equipmentList: Equipment[];
  t: any;
}

export function LinkEditorModal({
  currentLink,
  setCurrentLink,
  onClose,
  isSavingLink,
  handleSaveLink,
  equipmentList,
  t
}: LinkEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
       <div className="bg-stone-900 w-full max-w-sm rounded-[40px] p-8 border border-stone-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          <header className="flex justify-between items-center">
             <h4 className="text-2xl font-black text-white">{currentLink.id ? t.edit_link : t.add_link}</h4>
             <button onClick={onClose} className="text-stone-500 hover:text-white"><X size={24} /></button>
          </header>
          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.equipment} / {t.pantry}</label>
                <select 
                  value={currentLink.equipmentName} 
                  onChange={e => setCurrentLink({...currentLink, equipmentName: e.target.value})} 
                  className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-coffee/50"
                >
                  {equipmentList.map(e => (<option key={e.id} value={e.internal_name || e.name}>{e.internal_name || e.name}</option>))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.target_country}</label>
                <select 
                  value={currentLink.countryCode} 
                  onChange={e => setCurrentLink({...currentLink, countryCode: e.target.value})} 
                  className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-coffee/50"
                >
                  {COUNTRIES.map(c => (<option key={c.code} value={c.code}>{c.label}</option>))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.store_promo}</label>
                <input type="text" value={currentLink.description} onChange={e => setCurrentLink({...currentLink, description: e.target.value})} placeholder="e.g. 15% OFF on Amazon" className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.admin_links}</label>
                <input type="text" value={currentLink.url} onChange={e => setCurrentLink({...currentLink, url: e.target.value})} placeholder="https://..." className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.price_local}</label>
                <input type="number" value={currentLink.price} onChange={e => setCurrentLink({...currentLink, price: parseFloat(e.target.value)})} placeholder="0.00" className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
             </div>
          </div>
          <button onClick={handleSaveLink} disabled={isSavingLink} className="w-full bg-coffee text-white py-5 rounded-3xl font-black shadow-lg flex items-center justify-center space-x-2 active:scale-[0.98] transition-all">
            {isSavingLink ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{t.save_provision_link}</span>
          </button>
       </div>
    </div>
  );
}
