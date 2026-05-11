'use client';

import React from 'react';
import { Venue } from '@/types';
import { X, MapPin, Loader2, Plus } from 'lucide-react';

interface ShortLinkBlockAssignmentModalProps {
  onClose: () => void;
  blockAssignment: { start_code: string; end_code: string };
  setBlockAssignment: (val: { start_code: string; end_code: string }) => void;
  venueSearch: string;
  handleSearchVenues: (q: string) => Promise<void>;
  isSearchingVenues: boolean;
  venueResults: Venue[];
  isSavingShortLink: boolean;
  handleAssignBlockToVenue: (v: Venue) => Promise<void>;
  customRedirectPath: string;
  setCustomRedirectPath: (val: string) => void;
  handleAssignBlockToPath: () => Promise<void>;
  t: any;
}

export function ShortLinkBlockAssignmentModal({
  onClose,
  blockAssignment,
  setBlockAssignment,
  venueSearch,
  handleSearchVenues,
  isSearchingVenues,
  venueResults,
  isSavingShortLink,
  handleAssignBlockToVenue,
  customRedirectPath,
  setCustomRedirectPath,
  handleAssignBlockToPath,
  t
}: ShortLinkBlockAssignmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-6">
        <div className="bg-stone-900 w-full max-w-sm rounded-[40px] p-8 border border-stone-800 shadow-2xl space-y-6">
            <header className="flex justify-between items-center">
                <h4 className="text-xl font-black text-white">Assign Block</h4>
                <button onClick={onClose} className="text-stone-500 hover:text-white"><X size={24} /></button>
            </header>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">From Code</label>
                        <input 
                            type="text"
                            value={blockAssignment.start_code}
                            onChange={(e) => setBlockAssignment({...blockAssignment, start_code: e.target.value})}
                            placeholder="a1001"
                            className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-coffee/50"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">To Code</label>
                        <input 
                            type="text"
                            value={blockAssignment.end_code}
                            onChange={(e) => setBlockAssignment({...blockAssignment, end_code: e.target.value})}
                            placeholder="a1201"
                            className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-coffee/50"
                        />
                    </div>
                </div>

                <div className="space-y-2 border-t border-stone-800 pt-6">
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
                            disabled={isSavingShortLink || !customRedirectPath || !blockAssignment.start_code || !blockAssignment.end_code}
                            onClick={handleAssignBlockToPath}
                            className="bg-coffee hover:bg-coffee-600 disabled:bg-stone-800 text-white px-4 rounded-2xl transition-all"
                        >
                            {isSavingShortLink ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                        </button>
                    </div>
                </div>

                <div className="border-t border-stone-800 pt-6 space-y-4">
                    <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t.assign_to_venue}</h5>
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

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {venueResults.length > 0 ? venueResults.map(v => (
                            <button 
                                key={v.id}
                                disabled={isSavingShortLink || !blockAssignment.start_code || !blockAssignment.end_code}
                                onClick={() => handleAssignBlockToVenue(v)}
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
    </div>
  );
}
