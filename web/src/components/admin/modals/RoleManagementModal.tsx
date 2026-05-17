'use client';

import React from 'react';
import { User, Venue } from '@/types';
import { X, Trash2, Plus, MapPin, Loader2 } from 'lucide-react';

const COUNTRIES = [
  { code: 'AR', label: 'Argentina' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'BR', label: 'Brazil' },
  { code: 'ES', label: 'Spain' },
  { code: 'GE', label: 'Georgia' },
  { code: 'TH', label: 'Thailand' },
  { code: 'RU', label: 'Russia' }
];

interface RoleManagementModalProps {
  selectedUser: User;
  onClose: () => void;
  handleRevokeRole: (id: string) => Promise<void>;
  handleAssignRole: (userId: string, type: string, targetId?: string) => Promise<void>;
  venueSearch: string;
  handleSearchVenues: (q: string) => Promise<void>;
  isSearchingVenues: boolean;
  venueResults: Venue[];
  isGlobalAdmin: boolean;
  t: any;
}

export function RoleManagementModal({
  selectedUser,
  onClose,
  handleRevokeRole,
  handleAssignRole,
  venueSearch,
  handleSearchVenues,
  isSearchingVenues,
  venueResults,
  isGlobalAdmin,
  t
}: RoleManagementModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-6">
        <div className="bg-stone-900 w-full max-w-sm rounded-[40px] p-8 border border-stone-800 shadow-2xl space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h4 className="text-xl font-black text-white">{t.roles}</h4>
                    <p className="text-[10px] text-stone-500 font-bold truncate max-w-[200px]">{selectedUser.email}</p>
                </div>
                <button onClick={onClose} className="text-stone-500 hover:text-white"><X size={24} /></button>
            </header>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">Current Roles</label>
                    <div className="space-y-2">
                        {selectedUser.roles && selectedUser.roles.length > 0 ? selectedUser.roles.map((r) => (
                            <div key={r.id} className="bg-stone-950 border border-stone-800 p-3 rounded-2xl flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase">{r.role_type}</span>
                                    <span className="text-[10px] text-stone-500 font-bold">{r.target_id || 'Global'}</span>
                                </div>
                                <button onClick={() => handleRevokeRole(r.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )) : (
                            <p className="text-[10px] text-stone-600 italic px-2">{t.no_roles}</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-stone-800 pt-6 space-y-4">
                    <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t.assign_role}</h5>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {COUNTRIES.map(c => (
                            <button 
                                key={c.code}
                                onClick={() => handleAssignRole(selectedUser.id, 'COUNTRY', c.code)}
                                className="bg-stone-950 border border-stone-800 hover:border-stone-700/50 p-4 rounded-2xl text-left flex justify-between items-center transition-all group"
                            >
                                <span className="text-sm font-bold text-stone-300 group-hover:text-white">{c.label} Admin</span>
                                <Plus size={16} className="text-stone-600 group-hover:text-stone-700" />
                            </button>
                        ))}
                        <button 
                            onClick={() => handleAssignRole(selectedUser.id, 'GLOBAL', '')}
                            className="bg-stone-700/10 border border-stone-700/20 hover:border-stone-700/50 p-4 rounded-2xl text-left flex justify-between items-center transition-all group mt-2"
                        >
                            <span className="text-sm font-bold text-stone-400 group-hover:text-stone-700">{t.global_admin}</span>
                            <Plus size={16} className="text-stone-600" />
                        </button>
                    </div>

                    <div className="border-t border-stone-800 pt-6 space-y-4">
                        <h5 className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{t.venue_admin}</h5>
                        <div className="relative">
                            <input 
                                type="text"
                                value={venueSearch}
                                onChange={(e) => handleSearchVenues(e.target.value)}
                                placeholder={t.search_venues}
                                className="w-full bg-stone-950 border border-stone-800 text-white p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-stone-700/50 pl-12"
                            />
                            <MapPin size={18} className="absolute left-4 top-4 text-stone-600" />
                            {isSearchingVenues && <Loader2 size={18} className="absolute right-4 top-4 animate-spin text-stone-700" />}
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {venueResults.map(v => (
                                <button 
                                    key={v.id}
                                    onClick={() => handleAssignRole(selectedUser.id, 'VENUE', v.id)}
                                    className="w-full bg-stone-950 border border-stone-800 hover:border-stone-700/50 p-3 rounded-2xl text-left flex justify-between items-center transition-all group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-stone-300 group-hover:text-white">{v.name}</span>
                                        <span className="text-[8px] text-stone-500 font-bold">{v.city}, {v.address}</span>
                                    </div>
                                    <Plus size={14} className="text-stone-600 group-hover:text-stone-700" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
