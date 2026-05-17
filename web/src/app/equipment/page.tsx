'use client';

import { useStore } from '@/store/useStore';
import { CheckCircle2, ChevronRight, ShoppingCart, Layout, Package, Coffee } from 'lucide-react';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { Equipment } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/translations';
import { useRouter, useSearchParams } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCurrencySymbol } from '@/lib/countries';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CONSUMABLE_CATEGORIES = ['beans', 'filters', 'subscription', 'capsule'];

function EquipmentContent() {
  const { equipment, toggleEquipment, isGuest, user, methods } = useStore();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState<'bar' | 'gear' | 'pantry'>('bar');

  // Deep-linking logic
  useEffect(() => {
    const slug = searchParams.get('item');
    if (!slug) {
      setSelectedItem(null);
      return;
    }

    if (equipment.length > 0) {
      const item = equipment.find(e => e.slug === slug);
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [searchParams, equipment]);

  const handleSelectItem = (item: Equipment | null) => {
    setSelectedItem(item);
    if (item) {
      router.push(`/equipment?item=${item.slug}`, { scroll: false });
    } else {
      router.replace('/equipment', { scroll: false });
    }
  };

  // Visibility Logic: Provisions show if they have ANY purchase link
  const filteredEquipment = useMemo(() => {
    return equipment.filter(e => {
        const isConsumable = CONSUMABLE_CATEGORIES.includes(e.category);
        if (!isConsumable) return true; // Always show gear
        
        // Provisions show if they have at least one valid link (WW or specific country)
        // We show them even if not in user country so they can see the catalog
        return (e.purchaseLinks?.length || 0) > 0;
    });
  }, [equipment]);

  // Relevant Provisions Logic: Automatically list what relates to enabled methods
  const relevantProvisions = useMemo(() => {
    const ownedGearNames = equipment.filter(e => e.isOwned && !CONSUMABLE_CATEGORIES.includes(e.category)).map(e => e.internal_name.toLowerCase());
    
    // 1. Identify "Enabled Methods" (user owns all required gear)
    const enabledMethods = methods.filter(m => 
        m.requiredEquipment.every(req => ownedGearNames.includes(req.toLowerCase()))
    );

    // 2. Collect all consumables related to these methods
    const relatedConsumableNames = new Set<string>();
    enabledMethods.forEach(m => {
        m.consumables?.forEach(c => relatedConsumableNames.add(c.toLowerCase()));
    });

    // 3. Filter provisions that match these names OR are already owned
    return filteredEquipment.filter(e => 
        CONSUMABLE_CATEGORIES.includes(e.category) && 
        (e.isOwned || relatedConsumableNames.has(e.internal_name.toLowerCase()) || relatedConsumableNames.has(e.name.toLowerCase()))
    );
  }, [filteredEquipment, equipment, methods]);

  const hasAnyProvisions = useMemo(() => {
    return filteredEquipment.some(e => CONSUMABLE_CATEGORIES.includes(e.category));
  }, [filteredEquipment]);

  // Adjust active tab if Provisions tab is hidden but selected
  useEffect(() => {
    if (activeTab === 'pantry' && !hasAnyProvisions) {
        setActiveTab('bar');
    }
  }, [hasAnyProvisions, activeTab]);

  if (equipment.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6 text-center">
        <p className="text-stone-600 dark:text-stone-400 animate-pulse font-medium">{t.inventorying_gear}</p>
      </div>
    );
  }

  const displayedEquipment = activeTab === 'bar' 
    ? filteredEquipment.filter(e => e.isOwned) 
    : activeTab === 'gear'
      ? filteredEquipment.filter(e => !CONSUMABLE_CATEGORIES.includes(e.category))
      : filteredEquipment.filter(e => CONSUMABLE_CATEGORIES.includes(e.category));

  const sections = activeTab === 'bar' 
    ? [
        { title: t.my_equipment, items: displayedEquipment.filter((e: Equipment) => !CONSUMABLE_CATEGORIES.includes(e.category)) },
        { title: (t as any).relevant_provisions || "Relevant Provisions", items: relevantProvisions },
      ].filter(s => s.items.length > 0)
    : activeTab === 'gear'
      ? [
          { title: (t as any).brewer, items: displayedEquipment.filter((e: Equipment) => e.category === 'brewer') },
          { title: (t as any).grinder, items: displayedEquipment.filter((e: Equipment) => e.category === 'grinder') },
          { title: (t as any).accessory, items: displayedEquipment.filter((e: Equipment) => e.category === 'scale' || e.category === 'kettle' || e.category === 'accessory') },
        ].filter(s => s.items.length > 0)
      : [
          { title: (t as any).beans, items: displayedEquipment.filter((e: Equipment) => e.category === 'beans') },
          { title: (t as any).filters, items: displayedEquipment.filter((e: Equipment) => e.category === 'filters') },
          { title: (t as any).subscription, items: displayedEquipment.filter((e: Equipment) => e.category === 'subscription') },
          { title: (t as any).capsule, items: displayedEquipment.filter((e: Equipment) => e.category === 'capsule') },
        ].filter(s => s.items.length > 0);

  const handleToggleOwned = async (id: string) => {
    if (isGuest) {
      router.push('/login');
      return;
    }

    // Optimistic local update
    toggleEquipment(id);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({...selectedItem, isOwned: !selectedItem.isOwned});
    }

    try {
      const token = localStorage.getItem('vidita_token');
      const response = await fetch(`/api/v1/equipment/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to toggle ownership');
    } catch (err) {
      console.error(err);
      // Revert on error for consistency
      toggleEquipment(id);
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({...selectedItem, id: selectedItem.id, isOwned: !selectedItem.isOwned});
      }
      alert('Could not sync equipment status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-24 text-stone-900 dark:text-stone-100">
      <h1 className="text-3xl font-black mb-8">{t.shisha_bar}</h1>

      {/* Segmented Control */}
      <div className="bg-stone-200 dark:bg-stone-900 p-1 rounded-2xl flex mb-8 max-w-md overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('bar')}
          className={cn(
            "flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
            activeTab === 'bar' 
              ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" 
              : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
          )}
        >
          <Layout size={16} className="mr-2" />
          {t.shisha_bar}
        </button>
        <button
          onClick={() => setActiveTab('gear')}
          className={cn(
            "flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
            activeTab === 'gear' 
              ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" 
              : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
          )}
        >
          <Coffee size={16} className="mr-2" />
          {t.gear}
        </button>
        {hasAnyProvisions && (
            <button
              onClick={() => setActiveTab('pantry')}
              className={cn(
                "flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
                activeTab === 'pantry' 
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" 
                  : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
              )}
            >
              <Package size={16} className="mr-2" />
              {t.pantry}
            </button>
        )}
      </div>
      
      {sections.length > 0 ? (
        <div className="space-y-10">
          {activeTab === 'pantry' && (
            <div className="px-2 mb-2">
              <p className="text-stone-600 dark:text-stone-400 font-medium italic text-sm">
                {t.provisions_intro}
              </p>
            </div>
          )}
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-4 px-2">
                {section.title}
              </h2>
              <div className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
                {section.items.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    aria-label={`View details for ${item.name}`}
                    className={`w-full flex items-center justify-between p-5 text-left active:bg-stone-50 dark:active:bg-stone-800 transition-colors ${
                      idx !== section.items.length - 1 ? 'border-b border-stone-50 dark:border-stone-800' : ''
                    }`}
                  >
                    <span className="font-bold dark:text-stone-200">{item.name}</span>
                    <div className="flex items-center space-x-3 text-stone-500">
                      {!CONSUMABLE_CATEGORIES.includes(item.category) && item.isOwned && <CheckCircle2 className="text-green-600" size={20} />}
                      <ChevronRight size={18} className="text-stone-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="bg-white dark:bg-stone-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-stone-100 dark:border-stone-800">
             <Layout size={32} className="text-stone-300 dark:text-stone-700" />
          </div>
          <p className="text-stone-500 dark:text-stone-400 font-bold mb-6">
            {activeTab === 'bar' ? t.empty_bar_msg : t.no_items_found}
          </p>
          <button 
            onClick={() => setActiveTab('gear')}
            className="bg-stone-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
          >
            {t.explore_gear}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => handleSelectItem(null)}
        >
          <div 
            className="bg-white dark:bg-stone-950 w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all border border-stone-200 dark:border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-64 bg-stone-200 dark:bg-stone-900 flex items-center justify-center relative border-b border-stone-100 dark:border-stone-800">
               <button 
                 onClick={() => handleSelectItem(null)}
                 aria-label="Close modal"
                 className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors shadow-lg"
               >
                 ✕
               </button>
               {selectedItem.imageUrl ? (
                 <img 
                   src={selectedItem.imageUrl} 
                   alt={selectedItem.name}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <span className="text-stone-400 font-bold uppercase tracking-tighter text-4xl opacity-50">
                   {selectedItem.name.split(' ').map(n => n[0]).join('')}
                 </span>
               )}
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-widest">{(t as any)[selectedItem.category] || selectedItem.category}</p>
                {!CONSUMABLE_CATEGORIES.includes(selectedItem.category) && selectedItem.isOwned && (
                  <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-[10px] font-black px-2 py-1 rounded-md uppercase border border-green-200 dark:border-green-800">{t.own_this}</span>
                )}
              </div>
              <h3 className="text-3xl font-black mb-4 dark:text-stone-100">{selectedItem.name}</h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed mb-8 font-medium">
                {selectedItem.description}
              </p>

              <button
                onClick={() => handleToggleOwned(selectedItem.id)}
                className={`w-full py-5 rounded-2xl font-black transition-all mb-4 text-lg ${
                  selectedItem.isOwned 
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700' 
                  : 'bg-stone-700 text-white shadow-xl active:scale-[0.98]'
                }`}
              >
                {selectedItem.isOwned 
                  ? (CONSUMABLE_CATEGORIES.includes(selectedItem.category) ? t.remove_from_bar : t.not_owned)
                  : (CONSUMABLE_CATEGORIES.includes(selectedItem.category) ? t.add_to_bar : t.own_this)
                }
              </button>

              {(CONSUMABLE_CATEGORIES.includes(selectedItem.category) || !selectedItem.isOwned) && (
                <div className="mt-8 space-y-4">
                  {selectedItem.purchaseLinks && selectedItem.purchaseLinks.filter(l => l.countryCode === 'WW' || l.countryCode === user?.country).length > 0 && (
                    <>
                      <p className="font-bold text-stone-800 dark:text-stone-200">
                        {CONSUMABLE_CATEGORIES.includes(selectedItem.category) ? t.available_options : t.missing_setup}
                      </p>
                      {selectedItem.purchaseLinks
                        .filter(l => l.countryCode === 'WW' || l.countryCode === user?.country)
                        .map(link => (
                          <a 
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-700 transition-colors shadow-sm"
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-sm dark:text-stone-200">{link.description}</span>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold">
                                {link.countryCode === 'WW' ? t.worldwide : link.countryCode} {t.delivery} {link.price > 0 ? `• ${getCurrencySymbol(link.countryCode)}${link.price}` : ''}
                              </span>
                            </div>
                            <ShoppingCart size={22} className="text-stone-700 dark:text-stone-300" />
                          </a>
                        ))
                      }
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EquipmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center font-bold">{translations.en.loading_gear}</div>}>
      <EquipmentContent />
    </Suspense>
  );
}
