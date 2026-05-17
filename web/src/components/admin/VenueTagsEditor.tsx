'use client';

import React, { useState } from 'react';
import { FullTagCategory, VenueTagConfig, ContextTagSelection } from '@/types';
import { Loader2, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VenueTagsEditorProps {
  categories: FullTagCategory[];
  config: VenueTagConfig;
  onChange: (newTags: ContextTagSelection[]) => void;
  onTagAdded?: () => void;
  t: any;
  lang: string;
  venueId?: string;
}

export function VenueTagsEditor({ 
  categories, 
  config, 
  onChange, 
  onTagAdded,
  t,
  lang,
  venueId
}: VenueTagsEditorProps) {
  const [newTagName, setNewTagName] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const currentTags = config.tags.length > 0 ? config.tags : config.inherited_tags;
  const isOverride = config.tags.length > 0;

  const toggleTag = (tagId: string) => {
    const exists = config.tags.find(t => t.tag_id === tagId);
    let newTags = [...config.tags];
    
    if (exists) {
      newTags = newTags.filter(t => t.tag_id !== tagId);
    } else {
      const baseTags = config.tags.length > 0 ? config.tags : config.inherited_tags;
      const alreadyInBase = baseTags.find(t => t.tag_id === tagId);
      
      if (alreadyInBase) {
        newTags = baseTags.filter(t => t.tag_id !== tagId);
      } else {
        newTags = [...baseTags, { tag_id: tagId, display_order: baseTags.length }];
      }
    }
    onChange(newTags);
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    setIsAddingTag(true);
    try {
      const menuCat = categories.find(c => c.name === 'menu');
      if (!menuCat) throw new Error('Menu category not found');

      const token = localStorage.getItem('vidita_token');
      const res = await fetch('/api/v1/admin/tags', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category_id: menuCat.id,
          name: newTagName.trim(),
          display_name: newTagName.trim(),
          language_code: lang,
          venue_id: venueId
        })
      });

      if (res.ok) {
        setNewTagName('');
        onTagAdded?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingTag(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-stone-500 italic">
          {isOverride ? "Customizing tags for this venue" : "Using inherited tags from country/global"}
        </p>
      </div>

      {categories.map(cat => (
        <div key={cat.id} className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">
            {cat.translations[lang] || cat.translations['en'] || cat.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {cat.tags.map(tag => {
              const isSelected = !!currentTags.find(t => t.tag_id === tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-xs font-bold transition-all border",
                    isSelected 
                      ? "bg-stone-700 text-white border-stone-700 shadow-md scale-105" 
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-100 dark:border-stone-800 hover:border-stone-700/30"
                  )}
                >
                  {tag.translations[lang] || tag.translations['en'] || tag.name}
                </button>
              );
            })}

            {cat.name === 'menu' && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New menu item..."
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-stone-700/50 w-32"
                />
                <button
                  onClick={handleAddNewTag}
                  disabled={isAddingTag || !newTagName.trim()}
                  className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-700 hover:text-white p-2 rounded-2xl transition-colors disabled:opacity-50"
                >
                  {isAddingTag ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
