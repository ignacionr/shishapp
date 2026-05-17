'use client';

import React from 'react';
import { Equipment } from '@/types';
import { Library, Plus, Edit3, Trash2 } from 'lucide-react';

interface EquipmentCatalogProps {
  equipmentList: Equipment[];
  setCurrentEquipment: (e: Partial<Equipment>) => void;
  setIsEditingEquipment: (val: boolean) => void;
  handleDeleteEquipment: (id: string) => Promise<void>;
  t: any;
}

export function EquipmentCatalog({
  equipmentList,
  setCurrentEquipment,
  setIsEditingEquipment,
  handleDeleteEquipment,
  t
}: EquipmentCatalogProps) {
  return (
    <section>
       <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center space-x-2 text-stone-500">
             <Library size={18} />
             <h2 className="text-xs font-black uppercase tracking-widest">{t.catalog_title}</h2>
          </div>
          <button 
            onClick={() => { 
              setCurrentEquipment({ 
                  name: '', 
                  category: 'brewer', 
                  description: '', 
                  imageUrl: '', 
                  slug: '',
                  translations: {
                      en: { name: '', description: '' },
                      'es-419': { name: '', description: '' },
                      'pt-BR': { name: '', description: '' },
                      ru: { name: '', description: '' },
                      ka: { name: '', description: '' }
                  }
              }); 
              setIsEditingEquipment(true); 
            }}
            className="bg-stone-700 text-white p-2 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipmentList.map(e => (
            <div key={e.id} className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex items-center space-x-4">
               <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                  {e.imageUrl ? (
                    <img src={e.imageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 font-black uppercase text-xl">
                      {e.name[0]}
                    </div>
                  )}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold truncate">{e.internal_name || e.name}</p>
                    <span className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter text-stone-500">{e.category}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 font-bold truncate">{Object.keys(e.translations || {}).length} translations</p>
               </div>
               <div className="flex items-center space-x-1">
                  <button onClick={() => { setCurrentEquipment(e); setIsEditingEquipment(true); }} className="p-2 text-stone-400 hover:text-stone-700 transition-colors"><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteEquipment(e.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
               </div>
            </div>
          ))}
       </div>
    </section>
  );
}
