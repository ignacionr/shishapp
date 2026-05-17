'use client';

import React from 'react';
import { ShortLink } from '@/types';
import { Globe, Camera } from 'lucide-react';

interface ShortLinksManagementProps {
  shortLinkSearch: string;
  setShortLinkSearch: (q: string) => void;
  filteredShortLinks: ShortLink[];
  setIsAssigningBlock: (val: boolean) => void;
  setShowScanner: (val: boolean) => void;
  setSelectedShortLink: (sl: ShortLink) => void;
  setIsAssigningVenue: (val: boolean) => void;
  t: any;
}

export function ShortLinksManagement({
  shortLinkSearch,
  setShortLinkSearch,
  filteredShortLinks,
  setIsAssigningBlock,
  setShowScanner,
  setSelectedShortLink,
  setIsAssigningVenue,
  t
}: ShortLinksManagementProps) {
  return (
    <section>
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 px-2">
          <div className="flex items-center space-x-2 text-stone-500">
              <Globe size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">{t.admin_short_links}</h2>
          </div>
          <div className="relative flex-1 max-w-xs md:mx-8">
              <input 
                  type="text" 
                  value={shortLinkSearch}
                  onChange={(e) => setShortLinkSearch(e.target.value)}
                  placeholder="Search codes..."
                  className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-2 px-4 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-stone-700/20"
              />
              <Globe size={16} className="absolute left-3 top-2.5 text-stone-400" />
           </div>
          <div className="flex items-center space-x-2">
              <button 
              onClick={() => setIsAssigningBlock(true)}
              className="bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all"
              >
              Block
              </button>
              <button 
              onClick={() => setShowScanner(true)}
              className="bg-stone-700 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center space-x-2 active:scale-95 transition-all"
              >
              <Camera size={16} />
              <span>{t.scan_qr}</span>
              </button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShortLinks.map(sl => (
            <div key={sl.id} className="bg-white dark:bg-stone-900 p-6 rounded-[32px] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col space-y-4">
               <div className="flex justify-between items-start">
                  <div className="bg-stone-50 dark:bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-100 dark:border-stone-800">
                     <span className="text-xs font-black text-stone-700 dark:text-stone-400">/dl/{sl.code}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold">{sl.created_at?.split(' ')[0]}</span>
               </div>
               <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{sl.target_path}</p>
                  <p className="text-[10px] text-stone-500 font-medium line-clamp-2 mt-1">{sl.description}</p>
               </div>
               <div className="flex items-center space-x-2 pt-2 border-t border-stone-50 dark:border-stone-800">
                  <button 
                    onClick={() => { setSelectedShortLink(sl); setIsAssigningVenue(true); }}
                    className="flex-1 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-700/10 hover:text-stone-700 transition-all"
                  >
                    {t.assign_to_venue}
                  </button>
               </div>
            </div>
          ))}
       </div>
    </section>
  );
}
