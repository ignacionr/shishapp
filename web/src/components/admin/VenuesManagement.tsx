'use client';

import React from 'react';
import { Venue } from '@/types';
import { MapPin, Plus, Edit3, Trash2, Globe } from 'lucide-react';

interface VenuesManagementProps {
  venuesList: Venue[];
  adminCountries: string[];
  setCurrentVenue: (v: Partial<Venue>) => void;
  setIsEditingVenue: (val: boolean) => void;
  handleDeleteVenue: (id: string) => Promise<void>;
  COUNTRIES: { code: string; label: string }[];
  t: any;
}

export function VenuesManagement({
  venuesList,
  adminCountries,
  setCurrentVenue,
  setIsEditingVenue,
  handleDeleteVenue,
  COUNTRIES,
  t
}: VenuesManagementProps) {
  return (
    <section>
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 px-2">
          <div className="flex items-center space-x-2 text-stone-500">
              <MapPin size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">{(t as any).admin_venues}</h2>
          </div>
          <button 
            onClick={() => { setCurrentVenue({ name: '', latitude: 0, longitude: 0, address: '', city: '', country_code: adminCountries[0] || 'AR' }); setIsEditingVenue(true); }}
            className="bg-stone-700 text-white p-2 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venuesList.map(v => (
            <div key={v.id} className="bg-white dark:bg-stone-900 p-6 rounded-[32px] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col space-y-4">
               <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                     <span className="font-bold text-sm truncate">{v.name}</span>
                     <span className="text-[10px] text-stone-500 font-medium">{v.city}, {v.country_code}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                     <button onClick={() => { setCurrentVenue(v); setIsEditingVenue(true); }} className="p-2 text-stone-400 hover:text-stone-700 transition-colors"><Edit3 size={16} /></button>
                     <button onClick={() => handleDeleteVenue(v.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
               </div>
               <p className="text-[10px] text-stone-400 font-bold truncate">{v.address}</p>
               <div className="flex items-center space-x-2 text-[10px] font-black text-stone-700/50">
                  <Globe size={12} />
                  <span>{v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}</span>
               </div>
            </div>
          ))}
       </div>
    </section>
  );
}
