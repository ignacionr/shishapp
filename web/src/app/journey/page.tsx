'use client';

import { useStore } from '@/store/useStore';
import { BookOpen, Plus, MapPin, Calendar, Star, X, Loader2, Home as HomeIcon, Coffee as CafeIcon, Coffee, Check, Wind, Smile, Utensils, ChevronLeft, ChevronRight, Edit2, Trash2, LogIn } from 'lucide-react';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, useSearchParams } from 'next/navigation';
import { JournalEntry, TagCategory } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMOTIONAL_TAGS = ['Cozy', 'Focused', 'Energetic', 'Relaxed'];
const ENVIRONMENT_TAGS = ['Quiet', 'Noisy', 'Crowded', 'Sunlight', 'Music'];
const TASTE_TAGS = ['Nutty', 'Acidic', 'Chocolatey', 'Floral', 'Fruity', 'Bitter', 'Sweet', 'Spicy', 'Caramel', 'Berry', 'Citrus', 'Earthy', 'Creamy', 'Smoky', 'Herbal', 'Honey', 'Syrupy', 'Woody', 'Vanilla', 'Toffee'];

export default function JourneyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-center">
        <Loader2 className="text-stone-700 animate-spin" size={48} />
      </div>
    }>
      <JourneyContent />
    </Suspense>
  );
}

function JourneyContent() {
  const { 
    journals, addJournal, updateJournal, deleteJournal, 
    markSynced, isGuest, user, methods, setSyncing,
    lastProcessedParams, setLastProcessedParams,
    activeJournalEntry, setActiveJournalEntry
  } = useStore();
  const { t, lang } = useTranslation();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicTags, setDynamicTags] = useState<TagCategory[]>([]);
  
  const hasMenu = dynamicTags.some(c => c.name === 'menu');
  
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    coffee_name: '',
    brewing_method: '',
    location: 'Home',
    venue: '',
    venue_id: '',
    rating: 5.0,
    tags: []
  });

  // Sync store entry to local buffer when it changes
  useEffect(() => {
    if (activeJournalEntry) {
        setNewEntry(prev => ({ ...prev, ...activeJournalEntry }));
    }
  }, [activeJournalEntry]);

  const isAdding = !!activeJournalEntry;

  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const venueId = searchParams.get('venue_id') || '';
        const country = user?.country || '';
        const res = await fetch(`/api/v1/journal/tags?lang=${lang}&venue_id=${venueId}&country=${country}`);
        if (res.ok) {
          const data = await res.json();
          setDynamicTags(data);
        }
      } catch (err) {
        console.error("Failed to fetch tags", err);
      }
    };
    fetchTags();
  }, [lang, user?.country, searchParams]);

  useEffect(() => {
    const coffee = searchParams.get('coffee');
    const method = searchParams.get('method');
    const tags = searchParams.get('tags');
    const venue = searchParams.get('venue');
    const rating = searchParams.get('rating');
    const venue_id = searchParams.get('venue_id');

    // Robust check for whether we have any params to process
    const currentParamsString = searchParams.toString();
    if (!currentParamsString || currentParamsString === lastProcessedParams) {
        // If the URL still contains params we've already handled, clear them from the address bar
        if (currentParamsString && currentParamsString === lastProcessedParams && typeof window !== 'undefined') {
            window.history.replaceState({}, '', window.location.pathname);
        }
        return;
    }

    // Mark as processed GLOBALLY in the store immediately and synchronously
    setLastProcessedParams(currentParamsString);

    const resolveParams = async () => {
        if (!coffee && !method && !tags && !venue && !rating && !venue_id) {
            return;
        }

        let finalVenueName = venue;
        let finalCoffeeName = coffee;

        // Clear URL parameters immediately to prevent re-triggering
        // We use both router.replace and replaceState for maximum compatibility/speed
        if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', window.location.pathname);
            router.replace(window.location.pathname);
        }

        if (venue_id) {
            try {
                const res = await fetch(`/api/v1/venues/${venue_id}`);
                if (res.ok) {
                    const data = await res.json();
                    finalVenueName = data.name;
                    // If no coffee name provided, use venue name as title
                    if (!finalCoffeeName) finalCoffeeName = data.name;
                }
            } catch (err) {
                console.error("Failed to resolve venue_id", err);
            }
        }

        const deepLinkEntry = {
            coffee_name: finalCoffeeName || '',
            brewing_method: method || '',
            tags: tags ? tags.split(',') : [],
            venue: finalVenueName || '',
            venue_id: venue_id || '',
            rating: rating ? parseFloat(rating) : 5.0,
            location: (finalVenueName || venue_id) ? ('Coffee Shop' as any) : ('Home' as any)
        };

        setActiveJournalEntry(deepLinkEntry);
    };

    resolveParams();
  }, [searchParams, lastProcessedParams, setLastProcessedParams, setActiveJournalEntry]);

  const handleAddEntry = () => {
    setEditingId(null);
    const emptyEntry = {
        coffee_name: '',
        brewing_method: '',
        location: 'Home',
        venue: '',
        venue_id: '',
        rating: 5.0,
        tags: []
    };
    setActiveJournalEntry(emptyEntry);
    setNewEntry(emptyEntry);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setActiveJournalEntry(entry);
    setNewEntry({ ...entry });
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    // Optimistic local delete
    deleteJournal(id);

    try {
      const token = localStorage.getItem('vidita_token');
      await fetch(`/api/v1/journal/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to delete journal entry from server", err);
    }
  };

  const toggleTag = (tag: string, categoryName?: string, tagDisplayName?: string) => {
    const currentTags = newEntry.tags || [];
    
    // If it's a menu item, we might want to set the coffee name automatically
    // and potentially make it exclusive within its category
    if (categoryName === 'menu') {
        if (currentTags.includes(tag)) {
            setNewEntry({ 
                ...newEntry, 
                tags: currentTags.filter(t => t !== tag),
                coffee_name: '' // Reset if unselecting
            });
        } else {
            // Find other menu tags and remove them (exclusive selection)
            const menuTags = dynamicTags.find(c => c.name === 'menu')?.tags.map(t => t.name) || [];
            const filtered = currentTags.filter(t => !menuTags.includes(t));
            setNewEntry({ 
                ...newEntry, 
                tags: [...filtered, tag],
                coffee_name: tagDisplayName || tag,
                brewing_method: '' // Menu item usually implies a method already
            });
        }
        return;
    }

    if (currentTags.includes(tag)) {
      setNewEntry({ ...newEntry, tags: currentTags.filter(t => t !== tag) });
    } else {
      setNewEntry({ ...newEntry, tags: [...currentTags, tag] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (editingId) {
        // UPDATE Existing
        const updatedEntry = { ...newEntry, is_synced: false } as JournalEntry;
        updateJournal(editingId, updatedEntry);
        setActiveJournalEntry(null);

        if (isGuest) {
            setIsLoading(false);
            setEditingId(null);
            return;
        }

        try {
            const token = localStorage.getItem('vidita_token');
            const response = await fetch(`/api/v1/journal/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedEntry)
            });

            if (response.ok) {
                updateJournal(editingId, { is_synced: true });
            }
        } catch (err) {
            console.error("Failed to update journal entry", err);
        } finally {
            setIsLoading(false);
            setEditingId(null);
        }
    } else {
        // CREATE New
        const tempId = `temp_${Date.now()}`;
        const entryToSave: JournalEntry = {
          ...newEntry,
          id: tempId,
          date: Date.now(),
          tags: newEntry.tags || [],
          is_synced: false
        } as JournalEntry;

        addJournal(entryToSave);
        setActiveJournalEntry(null);

        // For guests, we only sync if it's a check-in (has venue_id)
        // This ensures anonymous check-ins contribute to venue statistics
        if (isGuest && !newEntry.venue_id) {
          setIsLoading(false);
          setNewEntry({ coffee_name: '', brewing_method: '', location: 'Home', venue: '', venue_id: '', rating: 5.0, tags: [] });
          return;
        }

        try {
          setSyncing(tempId, true);
          const token = localStorage.getItem('vidita_token');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch('/api/v1/journal', {
            method: 'POST',
            headers,
            body: JSON.stringify(entryToSave)
          });

          if (response.ok) {
            const savedEntry = await response.json();
            markSynced(tempId, savedEntry.id);
          }
        } catch (err) {
          console.warn('Journey: Offline mode, entry will sync in background.', err);
        } finally {
          setIsLoading(false);
          setSyncing(tempId, false);
          setNewEntry({ coffee_name: '', brewing_method: '', location: 'Home', venue: '', venue_id: '', rating: 5.0, tags: [] });
        }
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const filteredJournals = journals.filter(j => {
    const d = new Date(j.date);
    return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-24 text-stone-900 dark:text-stone-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">{t.journey}</h1>
        <button 
          onClick={handleAddEntry}
          aria-label={t.add_entry}
          className="bg-stone-700 text-white p-3 rounded-full shadow-xl active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Month/Year Filter Header */}
      <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-3xl mb-8 border border-stone-100 dark:border-stone-800 shadow-sm">
         <button onClick={() => changeMonth(-1)} className="p-2 text-stone-400 hover:text-stone-700 transition-colors">
            <ChevronLeft size={24} />
         </button>
         <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{t.viewing_period}</p>
            <p className="font-bold text-lg capitalize">
               {selectedDate.toLocaleString(lang === 'es-419' ? 'es-ES' : lang, { month: 'long' })} {selectedDate.getFullYear()}
            </p>
         </div>
         <button onClick={() => changeMonth(1)} className="p-2 text-stone-400 hover:text-stone-700 transition-colors">
            <ChevronRight size={24} />
         </button>
      </div>

      <div className="space-y-6">
        {filteredJournals.length > 0 ? filteredJournals.map((entry) => (
          <div key={entry.id} className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-stone-800 relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold">{entry.coffee_name}</h3>
                  {entry.is_synced === false && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Pending Sync" />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                 <div className="flex items-center space-x-1 bg-stone-50 dark:bg-stone-800 px-3 py-1 rounded-full border border-stone-100 dark:border-stone-700">
                    <Star size={14} className="text-yellow-600 fill-yellow-600" />
                    <span className="text-sm font-bold">{entry.rating.toFixed(1)}</span>
                 </div>
                 <div className="flex items-center space-x-1 sm:space-x-2">
                    <button 
                      onClick={() => handleEditEntry(entry)}
                      aria-label="Edit entry"
                      className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      aria-label="Delete entry"
                      className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-stone-500 dark:text-stone-400 text-xs font-medium mb-4">
              <div className="flex items-center space-x-1">
                {entry.location === 'Home' ? <HomeIcon size={14} /> : <CafeIcon size={14} />}
                <span>{entry.location === 'Home' ? t.home_loc : t.shop_loc}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(entry.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {entry.brewing_method && (
                <span className="text-[10px] font-black uppercase tracking-widest bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-2 py-1 rounded-md border border-stone-800 dark:border-stone-200">
                  {(t as any)[entry.brewing_method] || entry.brewing_method}
                </span>
              )}
              {entry.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-stone-700/5 text-stone-700 dark:text-stone-300 px-2 py-1 rounded-md border border-stone-700/20">
                  {(t as any)[tag] || tag}
                </span>
              ))}
            </div>

            {isGuest && entry.user_id === 'guest' && (
              <div className="mt-6 p-4 bg-stone-700/5 border border-stone-700/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-stone-700/10 p-2 rounded-lg mt-0.5">
                    <LogIn size={16} className="text-stone-700" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-900 dark:text-stone-100 font-bold">{t.claim_checkin}</p>
                    <p className="text-[10px] text-stone-500 font-medium">{t.claim_desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-stone-700 text-white px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap active:scale-95 transition-transform"
                >
                  {t.login}
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-stone-200 dark:bg-stone-800 p-8 rounded-full mb-6">
              <BookOpen className="text-stone-500 dark:text-stone-400" size={48} />
            </div>
            <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-xs font-medium">{t.empty_journey}</p>
            <button 
              onClick={handleAddEntry}
              className="bg-stone-700 text-white px-8 py-3 rounded-full font-bold shadow-xl active:scale-95 transition-transform"
            >
              {t.add_first}
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Entry Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-xl z-[60] flex flex-col overflow-y-auto">
           <header className="p-6 short:px-6 short:py-3 flex justify-between items-center sticky top-0 bg-stone-950/50 backdrop-blur-sm z-10">
             <button onClick={() => setActiveJournalEntry(null)} className="text-stone-400 p-2">
               <X size={24} className="short:w-5 short:h-5" />
             </button>

              <h2 className="text-xl short:text-lg font-black text-white">{editingId ? t.edit_experience : t.new_experience}</h2>
              <div className="w-10"></div>
           </header>

           <form onSubmit={handleSubmit} className="px-6 pb-20 space-y-10 short:space-y-6 max-w-md mx-auto w-full">
              {/* Coffee Name */}
              {!hasMenu && (
                <div className="space-y-3 short:space-y-2">
                  <label className="text-xs short:text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.what_session}</label>
                  <input 
                    required
                    autoFocus
                    type="text" 
                    value={newEntry.coffee_name}
                    onChange={e => setNewEntry({...newEntry, coffee_name: e.target.value})}
                    placeholder={t.shisha_origin_placeholder}
                    className="w-full bg-stone-900 border border-stone-800 text-white p-5 short:p-4 rounded-3xl short:rounded-2xl text-lg short:text-base font-bold focus:ring-2 focus:ring-stone-700/50 outline-none transition-all"
                  />
                </div>
              )}

              {/* Method Selector */}
              {/* Brewing Method Selection (Prominent Tags) */}
              {!hasMenu && (
                <div className="space-y-4 short:space-y-2">
                  <label className="text-xs short:text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.method}</label>
                  <div className="flex flex-wrap gap-2">
                    {methods.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setNewEntry({...newEntry, brewing_method: newEntry.brewing_method === m.displayName ? '' : m.displayName})}
                        className={cn(
                          "px-6 short:px-4 py-3 short:py-2 rounded-2xl short:rounded-xl text-sm short:text-xs font-black transition-all border-2",
                          newEntry.brewing_method === m.displayName 
                            ? "bg-white dark:bg-stone-100 border-white dark:border-stone-100 text-stone-900 shadow-xl scale-105" 
                            : "bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-700"
                        )}
                      >
                        {(t as any)[m.displayName] || m.displayName}
                      </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setNewEntry({...newEntry, brewing_method: ''})}
                        className={cn(
                          "px-6 short:px-4 py-3 short:py-2 rounded-2xl short:rounded-xl text-sm short:text-xs font-black transition-all border-2",
                          !newEntry.brewing_method 
                            ? "bg-white dark:bg-stone-100 border-white dark:border-stone-100 text-stone-900 shadow-xl scale-105" 
                            : "bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-700"
                        )}
                      >
                        {t.none || 'None'}
                    </button>
                  </div>
                </div>
              )}

              {/* Location Segmented Picker */}
              <div className="space-y-3 short:space-y-2">
                <label className="text-xs short:text-[10px] font-black uppercase tracking-widest text-stone-500 ml-1">{t.location}</label>
                <div className="grid grid-cols-2 gap-2 bg-stone-900 p-1.5 rounded-3xl short:rounded-2xl border border-stone-800">
                   <button 
                     type="button"
                     onClick={() => setNewEntry({...newEntry, location: 'Home'})}
                     className={`flex items-center justify-center space-x-2 py-3 short:py-2 rounded-2xl short:rounded-xl font-bold transition-all ${
                       newEntry.location === 'Home' ? 'bg-stone-700 text-white shadow-lg' : 'text-stone-500'
                     }`}
                   >
                     <HomeIcon size={18} className="short:w-4 short:h-4" />
                     <span className="short:text-xs">{t.home_loc}</span>
                   </button>
                   <button 
                     type="button"
                     onClick={() => setNewEntry({...newEntry, location: 'Coffee Shop'})}
                     className={`flex items-center justify-center space-x-2 py-3 short:py-2 rounded-2xl short:rounded-xl font-bold transition-all ${
                       newEntry.location === 'Coffee Shop' ? 'bg-stone-700 text-white shadow-lg' : 'text-stone-500'
                     }`}
                   >
                     <CafeIcon size={18} className="short:w-4 short:h-4" />
                     <span className="short:text-xs">{t.shop_loc}</span>
                   </button>
                </div>
              </div>

              {/* Rating 0-10 with 0.5 increments */}
              <div className="space-y-4 short:space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs short:text-[10px] font-black uppercase tracking-widest text-stone-500">{t.rating}</label>
                  <span className="text-2xl short:text-xl font-black text-stone-700">{newEntry.rating?.toFixed(1)}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={newEntry.rating}
                  onChange={e => setNewEntry({...newEntry, rating: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-stone-700"
                />
                <div className="flex justify-between text-[10px] font-black text-stone-600 uppercase tracking-tighter text-center">
                   <span className="w-20 text-left">{t.avoid}</span>
                   <span className="flex-1">{t.average}</span>
                   <span className="w-20 text-right">{t.god_shot}</span>
                </div>
              </div>

              {/* Sensory Tags Flow Layout */}
              <div className="space-y-8 short:space-y-4">
                {dynamicTags.length > 0 ? (
                  dynamicTags.map((category) => (
                    <div key={category.id} className="space-y-3 short:space-y-2">
                      <div className="flex items-center space-x-2 text-stone-500 ml-1">
                        {category.name === 'emotional' && <Smile size={14} />}
                        {category.name === 'environment' && <Wind size={14} />}
                        {category.name === 'taste' && <Utensils size={14} />}
                        {category.name === 'menu' && <Coffee size={14} />}
                        <label className="text-xs short:text-[10px] font-black uppercase tracking-widest">{category.display_name}</label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.tags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.name, category.name, tag.display_name)}
                            className={cn(
                              "transition-all border font-bold",
                              category.name === 'menu' 
                                ? "px-6 short:px-4 py-3 short:py-2 rounded-2xl short:rounded-xl text-sm short:text-xs border-2" 
                                : "px-4 short:px-3 py-2 short:py-1.5 rounded-full text-xs short:text-[10px]",
                              newEntry.tags?.includes(tag.name) 
                                ? category.name === 'emotional' ? 'bg-orange-600 border-orange-600 text-white' :
                                  category.name === 'environment' ? 'bg-blue-600 border-blue-600 text-white' :
                                  category.name === 'menu' ? 'bg-white dark:bg-stone-100 border-white dark:border-stone-100 text-stone-900 shadow-xl scale-105' :
                                  'bg-green-700 border-green-700 text-white'
                                : category.name === 'menu' 
                                  ? 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700' 
                                  : 'bg-stone-900 border-stone-800 text-stone-400'
                            )}
                          >
                            {tag.display_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="space-y-3 short:space-y-2">
                        <div className="flex items-center space-x-2 text-stone-500 ml-1">
                          <Smile size={14} />
                          <label className="text-xs short:text-[10px] font-black uppercase tracking-widest">{t.emotional}</label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {EMOTIONAL_TAGS.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`px-4 short:px-3 py-2 short:py-1.5 rounded-full text-xs short:text-[10px] font-bold border transition-all ${
                                newEntry.tags?.includes(tag) 
                                ? 'bg-orange-600 border-orange-600 text-white' 
                                : 'bg-stone-900 border-stone-800 text-stone-400'
                              }`}
                            >
                              {(t as any)[tag] || tag}
                            </button>
                          ))}
                        </div>
                    </div>

                    <div className="space-y-3 short:space-y-2">
                        <div className="flex items-center space-x-2 text-stone-500 ml-1">
                          <Wind size={14} />
                          <label className="text-xs short:text-[10px] font-black uppercase tracking-widest">{t.environment}</label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ENVIRONMENT_TAGS.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`px-4 short:px-3 py-2 short:py-1.5 rounded-full text-xs short:text-[10px] font-bold border transition-all ${
                                newEntry.tags?.includes(tag) 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-stone-900 border-stone-800 text-stone-400'
                              }`}
                            >
                              {(t as any)[tag] || tag}
                            </button>
                          ))}
                        </div>
                    </div>

                    <div className="space-y-3 short:space-y-2">
                        <div className="flex items-center space-x-2 text-stone-500 ml-1">
                          <Utensils size={14} />
                          <label className="text-xs short:text-[10px] font-black uppercase tracking-widest">{t.taste}</label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {TASTE_TAGS.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`px-4 short:px-3 py-2 short:py-1.5 rounded-full text-xs short:text-[10px] font-bold border transition-all ${
                                newEntry.tags?.includes(tag) 
                                ? 'bg-green-700 border-green-700 text-white' 
                                : 'bg-stone-900 border-stone-800 text-stone-400'
                              }`}
                            >
                              {(t as any)[tag] || tag}
                            </button>
                          ))}
                        </div>
                    </div>
                  </>
                )}
              </div>

              <button 
                disabled={isLoading}
                type="submit"
                className="w-full bg-stone-700 text-white py-6 short:py-4 rounded-3xl short:rounded-2xl font-black text-xl short:text-lg shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center space-x-3 sticky bottom-4 z-20"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <Check size={24} className="short:w-5 short:h-5" strokeWidth={4} />
                    <span>{editingId ? t.update_experience : t.save_experience}</span>
                  </>
                )}
              </button>
           </form>
        </div>
      )}
    </div>
  );
}
