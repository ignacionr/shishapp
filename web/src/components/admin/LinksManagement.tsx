'use client';

import React from 'react';
import { PurchaseLink, Equipment } from '@/types';
import { Link as LinkIcon, Plus, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/countries';

interface LinksManagementProps {
  links: PurchaseLink[];
  isGlobalAdmin: boolean;
  adminCountries: string[];
  equipmentList: Equipment[];
  isCountryAdmin: (code: string) => boolean;
  setCurrentLink: (l: Partial<PurchaseLink>) => void;
  setIsEditingLink: (val: boolean) => void;
  handleDeleteLink: (id: string) => Promise<void>;
  t: any;
}

export function LinksManagement({
  links,
  isGlobalAdmin,
  adminCountries,
  equipmentList,
  isCountryAdmin,
  setCurrentLink,
  setIsEditingLink,
  handleDeleteLink,
  t
}: LinksManagementProps) {
  return (
    <section>
       <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center space-x-2 text-stone-500">
             <LinkIcon size={18} />
             <h2 className="text-xs font-black uppercase tracking-widest">{t.links_title}</h2>
          </div>
          <button 
            onClick={() => { setCurrentLink({ equipmentName: equipmentList[0]?.internal_name || '', description: '', url: '', countryCode: 'WW', price: 0 }); setIsEditingLink(true); }}
            className="bg-coffee text-white p-2 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {links
            .filter(l => isGlobalAdmin || adminCountries.includes(l.countryCode))
            .map(l => (
            <div key={l.id} className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex items-center justify-between">
               <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold">{l.equipmentName}</span>
                    <span className="bg-coffee/10 text-coffee-700 dark:text-coffee-300 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">{l.countryCode}</span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium truncate">{l.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                     <span className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">{getCurrencySymbol(l.countryCode)}{l.price}</span>
                     <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-stone-400 hover:text-coffee flex items-center space-x-1">
                        <span className="truncate max-w-[150px]">{l.url}</span>
                        <ExternalLink size={10} />
                     </a>
                  </div>
               </div>
               <div className="flex items-center space-x-1 ml-4">
                  {isCountryAdmin(l.countryCode) && (
                    <>
                      <button onClick={() => { setCurrentLink(l); setIsEditingLink(true); }} className="p-2 text-stone-400 hover:text-coffee transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteLink(l.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </>
                  )}
               </div>
            </div>
          ))}
       </div>
    </section>
  );
}
