'use client';

import React from 'react';
import { 
  VenueStats, 
  VenuePromotion, 
  VenueTagConfig, 
  FullTagCategory, 
  UserRole,
  ContextTagSelection
} from '@/types';
import { 
  MapPin, 
  Check, 
  Star, 
  Tag as TagIcon, 
  RotateCcw, 
  X, 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  PlayCircle 
} from 'lucide-react';
import { StatCard } from './StatCard';
import { LineGraph } from './LineGraph';
import { TagCloud } from './TagCloud';
import { VenueTagsEditor } from './VenueTagsEditor';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VenueDashboardProps {
  venueRoles: UserRole[];
  selectedVenueId: string | null;
  setSelectedVenueId: (id: string) => void;
  statsPeriod: 'week' | 'month' | 'year';
  setStatsPeriod: (period: 'week' | 'month' | 'year') => void;
  venueStats: VenueStats | null;
  venuePromotions: VenuePromotion[];
  venueTagsConfig: VenueTagConfig | null;
  setVenueTagsConfig: (config: VenueTagConfig) => void;
  allCategories: FullTagCategory[];
  lang: string;
  t: any;
  isEditingVenueTags: boolean;
  setIsEditingVenueTags: (val: boolean) => void;
  isSavingVenueTags: boolean;
  handleSaveVenueTags: () => Promise<void>;
  handleResetVenueTags: () => Promise<void>;
  setIsEditingPromotion: (val: boolean) => void;
  setCurrentPromotion: (promo: Partial<VenuePromotion>) => void;
  handleDeletePromotion: (id: string) => Promise<void>;
  setAllCategories: (categories: FullTagCategory[]) => void;
}

export function VenueDashboard({
  venueRoles,
  selectedVenueId,
  setSelectedVenueId,
  statsPeriod,
  setStatsPeriod,
  venueStats,
  venuePromotions,
  venueTagsConfig,
  setVenueTagsConfig,
  allCategories,
  lang,
  t,
  isEditingVenueTags,
  setIsEditingVenueTags,
  isSavingVenueTags,
  handleSaveVenueTags,
  handleResetVenueTags,
  setIsEditingPromotion,
  setCurrentPromotion,
  handleDeletePromotion,
  setAllCategories
}: VenueDashboardProps) {
  if (!selectedVenueId) return null;

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 px-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-stone-500">
              <MapPin size={18} />
              <h2 className="text-xs font-black uppercase tracking-widest">{t.venue_dashboard}</h2>
            </div>
            {venueRoles.length > 1 && (
              <select 
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="bg-stone-200 dark:bg-stone-800 text-[10px] font-black uppercase px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-coffee/30"
              >
                {venueRoles.map(vr => (
                  <option key={vr.id} value={vr.target_id}>{vr.target_id}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex bg-stone-200 dark:bg-stone-900 p-1 rounded-2xl">
            {(['week', 'month', 'year'] as const).map(p => (
              <button 
                key={p}
                onClick={() => setStatsPeriod(p)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all",
                  statsPeriod === p ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500"
                )}
              >
                {t[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<Check className="text-green-500" />} label={t.checkins_count} value={venueStats?.checkins_count || 0} />
              <StatCard icon={<Star className="text-yellow-500" />} label={t.average_rating} value={venueStats?.average_rating || 0} isFloat />
            </div>
            
            <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-100 dark:border-stone-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">{t.checkins_over_time}</h3>
              <LineGraph data={venueStats?.checkins_over_time || []} />
            </div>

            <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-100 dark:border-stone-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">{t.avg_rating_by_hour || "Average Rating by Hour"}</h3>
              <LineGraph data={venueStats?.rating_over_time || []} mode="rating" />
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-100 dark:border-stone-800 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-8">{t.tag_cloud}</h3>
            <TagCloud tags={venueStats?.tags_cloud || []} categories={allCategories} lang={lang} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center space-x-2 text-stone-500">
            <TagIcon size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest">{(t as any).suggested_tags}</h2>
          </div>
          {!isEditingVenueTags ? (
            <button 
              onClick={() => setIsEditingVenueTags(true)}
              className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-coffee/10 hover:text-coffee transition-all"
            >
              {(t as any).edit_tags}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleResetVenueTags}
                disabled={isSavingVenueTags}
                className="text-stone-400 hover:text-red-500 p-2 transition-colors"
                title={(t as any).reset_to_default}
              >
                <RotateCcw size={18} />
              </button>
              <button 
                onClick={() => setIsEditingVenueTags(false)}
                className="text-stone-400 hover:text-stone-600 p-2 transition-colors"
              >
                <X size={20} />
              </button>
              <button 
                onClick={handleSaveVenueTags}
                disabled={isSavingVenueTags}
                className="bg-coffee text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center space-x-2"
              >
                {isSavingVenueTags ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{(t as any).save_tags}</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-stone-900 p-8 rounded-[40px] border border-stone-100 dark:border-stone-800 shadow-sm">
          {!isEditingVenueTags ? (
            <div className="space-y-6">
              <p className="text-sm text-stone-500 font-medium">{(t as any).tags_help}</p>
              <div className="flex flex-wrap gap-2">
                {((venueTagsConfig?.tags.length || 0) > 0 ? venueTagsConfig?.tags : venueTagsConfig?.inherited_tags)?.map(ct => {
                  const tag = allCategories.flatMap(c => c.tags).find(t => t.id === ct.tag_id);
                  if (!tag) return null;
                  return (
                    <span key={tag.id} className="bg-stone-50 dark:bg-stone-950 px-4 py-2 rounded-2xl text-xs font-bold border border-stone-100 dark:border-stone-800">
                      {tag.translations[lang] || tag.translations['en'] || tag.name}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : venueTagsConfig && (
            <VenueTagsEditor
              categories={allCategories}
              config={venueTagsConfig}
              onChange={(tags) => setVenueTagsConfig({...venueTagsConfig, tags})}
              onTagAdded={async () => {
                const token = localStorage.getItem('vidita_token');
                const res = await fetch('/api/v1/admin/tags/all', { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) setAllCategories(await res.json());

                if (selectedVenueId) {
                    const vTagsRes = await fetch(`/api/v1/admin/tags/venue/${selectedVenueId}`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (vTagsRes.ok) setVenueTagsConfig(await vTagsRes.json());
                }
              }}
              t={t}
              lang={lang}
              venueId={selectedVenueId || undefined}
            />
          )}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center space-x-2 text-stone-500">
            <Star size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest">{t.promotions}</h2>
          </div>
          <button 
            onClick={() => {
              setCurrentPromotion({
                type: 'suggestion',
                title: '',
                content: '',
                start_date: new Date().toISOString().split('T')[0]
              });
              setIsEditingPromotion(true);
            }}
            className="bg-coffee text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venuePromotions.length > 0 ? venuePromotions.map(promo => (
            <div key={promo.id} className="bg-white dark:bg-stone-900 p-6 rounded-[32px] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <span className="bg-coffee/10 text-coffee-700 dark:text-coffee-300 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {promo.type}
                </span>
                <button onClick={() => handleDeletePromotion(promo.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              {promo.image_url && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img src={promo.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h4 className="font-black text-lg">{promo.title}</h4>
                <p className="text-sm text-stone-500 font-medium line-clamp-3 mt-1">{promo.content}</p>
              </div>
              {promo.youtube_id && (
                <div className="flex items-center space-x-2 text-coffee font-black text-[10px] uppercase tracking-widest">
                  <PlayCircle size={14} />
                  <span>YouTube: {promo.youtube_id}</span>
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-stone-500 font-bold italic bg-white dark:bg-stone-900 rounded-[40px] border border-stone-100 dark:border-stone-800">
              {t.no_promotions}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
