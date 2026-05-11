'use client';

import React from 'react';
import { ShortLink, Venue } from '@/types';
import { X, MapPin, Loader2, Plus } from 'lucide-react';

interface ShortLinkAssignmentModalProps {
  selectedShortLink: ShortLink;
  onClose: () => void;
  venueSearch: string;
  handleSearchVenues: (q: string) => Promise<void>;
  isSearchingVenues: boolean;
  venueResults: Venue[];
  isSavingShortLink: boolean;
  handleAssignShortLinkToVenue: (v: Venue) => Promise<void>;
  customRedirectPath: string;
  setCustomRedirectPath: (val: string) => void;
  handleAssignShortLinkToPath: () => Promise<void>;
  t: any;
}

export function ShortLinkAssignmentModal({
  selectedShortLink,
  onClose,
  venueSearch,
  handleSearchVenues,
  isSearchingVenues,
  venueResults,
  isSavingShortLink,
  handleAssignShortLinkToVenue,
  customRedirectPath,
  setCustomRedirectPath,
  handleAssignShortLinkToPath,
  t
}: ShortLinkAssignmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-6">
        <div className="bg-stone-900 w-full max-w-sm rounded-[40px] p-8 border border-stone-800 shadow-2xl space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h4 className="text-xl font-black text-white">{t.assign_to_venue}</h4>
                    <p className="text-[10px] text-coffee-400 font-bold">/dl/{selectedShortLink.code}</p>
                </div>
                <button onClick={onClose} className="text-stone-500 hover:text-white"><X size={24} /></button>
            </header>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Custom Redirect Path</label>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={customRedirectPath}
                            onChange={(e) => setCustomRedirectPath(e.target.value)}
                            placeholder="/for-venues"
                            className="flex-1 bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-coffee/50"
                        />
                        <button 
                            disabled={isSavingShortLink || !customRedirectPath}
                            onClick={handleAssignShortLinkToPath}
                            className="bg-coffee hover:bg-coffee-600 disabled:bg-stone-800 text-white px-4 rounded-2xl transition-all"
                        >
                            {isSavingShortLink ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                        </button>
                    </div>
                </div>

                <div className="relative border-t border-stone-800 pt-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1 mb-2 block">Or Search Venue</label>
                    <div className="relative">
                        <input 
                            type="text"
                            value={venueSearch}
                            onChange={(e) => handleSearchVenues(e.target.value)}
                            placeholder={t.search_venues_placeholder}
                            className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-coffee/50 pl-12"
                        />
                        <MapPin size={18} className="absolute left-4 top-4 text-stone-600" />
                        {isSearchingVenues && <Loader2 size={18} className="absolute right-4 top-4 animate-spin text-coffee" />}
                    </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {venueResults.length > 0 ? venueResults.map(v => (
                        <button 
                            key={v.id}
                            disabled={isSavingShortLink}
                            onClick={() => handleAssignShortLinkToVenue(v)}
                            className="w-full bg-stone-950 border border-stone-800 hover:border-coffee/50 p-4 rounded-2xl text-left flex justify-between items-center transition-all group disabled:opacity-50"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-stone-300 group-hover:text-white">{v.name}</span>
                                <span className="text-[10px] text-stone-500 font-bold">{v.city}, {v.address}</span>
                            </div>
                            {isSavingShortLink ? <Loader2 size={16} className="animate-spin text-coffee" /> : <Plus size={18} className="text-stone-600 group-hover:text-coffee" />}
                        </button>
                    )) : venueSearch.length >= 2 ? (
                        <p className="text-center py-8 text-stone-600 font-bold text-sm italic">{t.no_venues_found}</p>
                    ) : null}
                </div>
            </div>
        </div>
    </div>
  );
}
