'use client';

import React, { useState, useEffect } from 'react';
import { FullTagCategory } from '@/types';
import { Loader2, Plus, Tag as TagIcon, Smile, Wind, Utensils, Coffee, Edit3, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es-419', label: 'Español' },
  { code: 'pt-BR', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'ka', label: 'ქართული' },
  { code: 'it', label: 'Italiano' }
];

export function TagsManager() {
  const [categories, setCategories] = useState<FullTagCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'emotional': return <Smile size={18} className="text-orange-500" />;
      case 'environment': return <Wind size={18} className="text-blue-500" />;
      case 'taste': return <Utensils size={18} className="text-green-500" />;
      case 'menu': return <Coffee size={18} className="text-coffee" />;
      default: return <TagIcon size={18} className="text-stone-400" />;
    }
  };

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const token = localStorage.getItem('vidita_token');
        const res = await fetch('/api/v1/admin/tags/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch all tags", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTags();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-coffee" size={48} /></div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center">
          <TagIcon className="mr-3 text-coffee" size={28} />
          Tag Management
        </h2>
        <button className="bg-coffee text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg active:scale-95 transition-all opacity-50 cursor-not-allowed">
          <Plus size={20} className="mr-2" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden relative group">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-coffee/60">Category</span>
                  <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded text-[10px] font-bold">Order: {category.display_order}</span>
                </div>
                <div className="flex items-center space-x-3 mb-1">
                  {getCategoryIcon(category.name)}
                  <h3 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">{category.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <div key={lang.code} className="flex items-center space-x-1 bg-stone-50 dark:bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-100 dark:border-stone-800">
                      <span className="text-[10px] font-black text-stone-400 uppercase">{lang.code}</span>
                      <span className="text-sm font-bold">{category.translations[lang.code] || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-stone-400 hover:text-coffee transition-colors opacity-50"><Edit3 size={20} /></button>
                <button className="p-2 text-stone-400 hover:text-red-500 transition-colors opacity-50"><Trash2 size={20} /></button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-stone-400">Tags in this category</h4>
                <button className="text-coffee text-xs font-bold flex items-center hover:underline opacity-50">
                  <Plus size={14} className="mr-1" /> Add Tag
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.tags.map((tag) => (
                  <div key={tag.id} className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-stone-900 dark:text-white">{tag.name}</span>
                      <div className="flex items-center space-x-2">
                         <span className={cn(
                           "w-2 h-2 rounded-full",
                           tag.is_active ? "bg-green-500" : "bg-red-500"
                         )} />
                         <span className="text-[10px] font-bold text-stone-500 uppercase">{tag.display_order}</span>
                         <button className="p-1 text-stone-400 hover:text-coffee opacity-50"><Edit3 size={14} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <div key={lang.code} className="flex flex-col">
                          <span className="text-[8px] font-black text-stone-400 uppercase leading-none mb-1">{lang.code}</span>
                          <span className="text-xs font-bold truncate">{tag.translations[lang.code] || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
