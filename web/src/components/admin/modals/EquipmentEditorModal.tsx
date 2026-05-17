'use client';

import React from 'react';
import { Equipment, PurchaseLink } from '@/types';
import { X, Plus, Loader2, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es-419', label: 'Español' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ka', label: 'ქართული' },
  { code: 'it', label: 'Italiano' },
  { code: 'ar', label: 'العربية' }
];

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

const CATEGORIES = [
  { code: 'brewer', label: 'Brewer' },
  { code: 'grinder', label: 'Grinder' },
  { code: 'scale', label: 'Scale' },
  { code: 'kettle', label: 'Kettle' },
  { code: 'accessory', label: 'Accessory' },
  { code: 'beans', label: 'Coffee Beans' },
  { code: 'filters', label: 'Filters' },
  { code: 'subscription', label: 'Subscription' },
  { code: 'capsule', label: 'Capsules' }
];

interface EquipmentEditorModalProps {
  currentEquipment: Partial<Equipment>;
  setCurrentEquipment: (e: Partial<Equipment>) => void;
  onClose: () => void;
  isSavingEquipment: boolean;
  handleSaveEquipment: () => Promise<void>;
  editingLang: string;
  setEditingLang: (l: string) => void;
  showAddLinkInEquipment: boolean;
  setShowAddLinkInEquipment: (val: boolean) => void;
  newLinkInEquipment: Partial<PurchaseLink>;
  setNewLinkInEquipment: (l: Partial<PurchaseLink>) => void;
  t: any;
}

export function EquipmentEditorModal({
  currentEquipment,
  setCurrentEquipment,
  onClose,
  isSavingEquipment,
  handleSaveEquipment,
  editingLang,
  setEditingLang,
  showAddLinkInEquipment,
  setShowAddLinkInEquipment,
  newLinkInEquipment,
  setNewLinkInEquipment,
  t
}: EquipmentEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-6">
       <div className="bg-stone-900 w-full max-w-lg rounded-[40px] p-8 border border-stone-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
          <header className="flex justify-between items-center">
             <h4 className="text-2xl font-black text-white">{currentEquipment.id ? t.edit_item : t.add_item}</h4>
             <button onClick={onClose} className="text-stone-500 hover:text-white"><X size={24} /></button>
          </header>
          
          <div className="space-y-4">
             {/* Shared Fields */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.internal_id}</label>
                    <input type="text" value={currentEquipment.name} onChange={e => setCurrentEquipment({...currentEquipment, name: e.target.value})} placeholder="V60" className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.slug_url}</label>
                    <input type="text" value={currentEquipment.slug} onChange={e => setCurrentEquipment({...currentEquipment, slug: e.target.value})} placeholder="v60" className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.method}</label>
                <select value={currentEquipment.category} onChange={e => setCurrentEquipment({...currentEquipment, category: e.target.value})} className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none">
                  {CATEGORIES.map(c => (<option key={c.code} value={c.code}>{c.label}</option>))}
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.image_url}</label>
                <input type="text" value={currentEquipment.imageUrl} onChange={e => setCurrentEquipment({...currentEquipment, imageUrl: e.target.value})} placeholder="https://... or /static/..." className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" />
                <p className="text-[8px] text-stone-500 italic px-1">{t.image_hint}</p>
             </div>

             {/* Quick Link Section */}
             <div className="bg-stone-950/30 p-4 rounded-3xl border border-stone-800/50 space-y-4">
                <button 
                    onClick={() => setShowAddLinkInEquipment(!showAddLinkInEquipment)}
                    className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors"
                >
                    {showAddLinkInEquipment ? <X size={14} /> : <Plus size={14} />}
                    <span>{showAddLinkInEquipment ? t.cancel_link_btn : t.add_link_btn}</span>
                </button>

                {showAddLinkInEquipment && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-600 ml-1">{t.country}</label>
                                <select 
                                    value={newLinkInEquipment.countryCode} 
                                    onChange={e => setNewLinkInEquipment({...newLinkInEquipment, countryCode: e.target.value})} 
                                    className="w-full bg-stone-950 border border-stone-800 text-white p-2 rounded-xl text-xs font-bold outline-none"
                                >
                                    {COUNTRIES.map(c => (<option key={c.code} value={c.code}>{c.label}</option>))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black uppercase tracking-widest text-stone-600 ml-1">{t.price_local}</label>
                                <input 
                                    type="number" 
                                    value={newLinkInEquipment.price} 
                                    onChange={e => setNewLinkInEquipment({...newLinkInEquipment, price: parseFloat(e.target.value)})} 
                                    placeholder="0.00" 
                                    className="w-full bg-stone-950 border border-stone-800 text-white p-2 rounded-xl text-xs font-bold outline-none" 
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-stone-600 ml-1">{t.store_promo}</label>
                            <input 
                                type="text" 
                                value={newLinkInEquipment.description} 
                                onChange={e => setNewLinkInEquipment({...newLinkInEquipment, description: e.target.value})} 
                                placeholder="e.g. 15% OFF at Amazon" 
                                className="w-full bg-stone-950 border border-stone-800 text-white p-2 rounded-xl text-xs font-bold outline-none" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-stone-600 ml-1">{t.slug_url}</label>
                            <input 
                                type="text" 
                                value={newLinkInEquipment.url} 
                                onChange={e => setNewLinkInEquipment({...newLinkInEquipment, url: e.target.value})} 
                                placeholder="https://..." 
                                className="w-full bg-stone-950 border border-stone-800 text-white p-2 rounded-xl text-xs font-bold outline-none" 
                            />
                        </div>
                    </div>
                )}
             </div>

             {/* Translations Section */}
             <div className="mt-8 border-t border-stone-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-black text-stone-400 uppercase tracking-widest">{t.languages}</h5>
                    <div className="flex bg-stone-950 p-1 rounded-xl">
                        {SUPPORTED_LANGUAGES.map(l => (
                            <button 
                                key={l.code}
                                onClick={() => setEditingLang(l.code)}
                                className={cn("px-2 py-1 rounded-lg text-[10px] font-black transition-all", editingLang === l.code ? "bg-stone-700 text-white" : "text-stone-600 hover:text-stone-400")}
                            >
                                {l.code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 bg-stone-950/50 p-4 rounded-3xl border border-stone-800">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.localized_name} ({editingLang})</label>
                        <input 
                            type="text" 
                            value={currentEquipment.translations?.[editingLang]?.name || ''} 
                            onChange={e => {
                                const trans = { ...currentEquipment.translations } as any;
                                trans[editingLang] = { ...trans[editingLang], name: e.target.value };
                                setCurrentEquipment({...currentEquipment, translations: trans});
                            }} 
                            placeholder="Name in this language" 
                            className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.localized_desc} ({editingLang})</label>
                        <textarea 
                            value={currentEquipment.translations?.[editingLang]?.description || ''} 
                            onChange={e => {
                                const trans = { ...currentEquipment.translations } as any;
                                trans[editingLang] = { ...trans[editingLang], description: e.target.value };
                                setCurrentEquipment({...currentEquipment, translations: trans});
                            }} 
                            placeholder="Description in this language" 
                            className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none h-32" 
                        />
                    </div>
                </div>
             </div>
          </div>

          <button onClick={handleSaveEquipment} disabled={isSavingEquipment} className="w-full bg-stone-700 text-white py-5 rounded-3xl font-black shadow-lg flex items-center justify-center space-x-2 active:scale-[0.98] transition-all">
            {isSavingEquipment ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{t.save_catalog_item}</span>
          </button>
       </div>
    </div>
  );
}
