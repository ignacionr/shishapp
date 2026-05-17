'use client';

import React from 'react';
import { Venue } from '@/types';
import { X, MapPin, Loader2, Save } from 'lucide-react';

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

interface VenueEditorModalProps {
  currentVenue: Partial<Venue>;
  setCurrentVenue: (v: Partial<Venue>) => void;
  onClose: () => void;
  isSavingVenue: boolean;
  handleSaveVenue: () => Promise<void>;
  adminCountries: string[];
  t: any;
}

export function VenueEditorModal({
  currentVenue,
  setCurrentVenue,
  onClose,
  isSavingVenue,
  handleSaveVenue,
  adminCountries,
  t
}: VenueEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-6 overflow-y-auto">
        <div className="bg-white dark:bg-stone-900 w-full max-w-sm rounded-[40px] p-8 border border-stone-100 dark:border-stone-800 shadow-2xl space-y-6 my-auto">
            <header className="flex justify-between items-center">
                <h4 className="text-xl font-black">{currentVenue.id ? (t as any).edit_venue : (t as any).add_venue}</h4>
                <button onClick={onClose} className="text-stone-500 hover:text-stone-900 dark:hover:text-white"><X size={24} /></button>
            </header>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">{(t as any).venue_name}</label>
                    <input 
                        type="text" 
                        value={currentVenue.name}
                        onChange={(e) => setCurrentVenue({...currentVenue, name: e.target.value})}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-stone-700/50"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">{(t as any).address}</label>
                    <input 
                        type="text" 
                        value={currentVenue.address}
                        onChange={(e) => setCurrentVenue({...currentVenue, address: e.target.value})}
                        className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-stone-700/50"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">{(t as any).city}</label>
                        <input 
                            type="text" 
                            value={currentVenue.city}
                            onChange={(e) => setCurrentVenue({...currentVenue, city: e.target.value})}
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-stone-700/50"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">{(t as any).country}</label>
                        <select 
                            value={currentVenue.country_code}
                            onChange={(e) => setCurrentVenue({...currentVenue, country_code: e.target.value})}
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-stone-700/50"
                        >
                            {adminCountries.map(code => (
                                <option key={code} value={code}>{COUNTRIES.find(c => c.code === code)?.label || code}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Coordinates (Lat, Lon)</label>
                        <button 
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition((pos) => {
                                        setCurrentVenue({
                                            ...currentVenue,
                                            latitude: pos.coords.latitude,
                                            longitude: pos.coords.longitude
                                        });
                                    }, (err) => alert(err.message));
                                }
                            }}
                            className="text-[10px] font-black uppercase text-stone-700 hover:underline flex items-center space-x-1"
                        >
                            <MapPin size={10} />
                            <span>{(t as any).use_my_location}</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            type="number" 
                            step="any"
                            value={currentVenue.latitude}
                            onChange={(e) => setCurrentVenue({...currentVenue, latitude: parseFloat(e.target.value)})}
                            placeholder="Latitude"
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-stone-700/50"
                        />
                        <input 
                            type="number" 
                            step="any"
                            value={currentVenue.longitude}
                            onChange={(e) => setCurrentVenue({...currentVenue, longitude: parseFloat(e.target.value)})}
                            placeholder="Longitude"
                            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-stone-700/50"
                        />
                    </div>
                </div>

                <button 
                    disabled={isSavingVenue}
                    onClick={handleSaveVenue}
                    className="w-full bg-stone-700 text-white py-4 rounded-3xl font-black shadow-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                    {isSavingVenue ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span>{t.save_content}</span>
                </button>
            </div>
        </div>
    </div>
  );
}
