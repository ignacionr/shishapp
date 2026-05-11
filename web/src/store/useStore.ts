import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, JournalEntry, Equipment, FeedCard, BrewingMethod, BrewingPreset } from '../types';

interface AppState {
  user: User | null;
  isGuest: boolean;
  journals: JournalEntry[];
  equipment: Equipment[];
  ownedEquipmentIds: string[];
  methods: BrewingMethod[];
  presets: BrewingPreset[];
  feed: FeedCard[];
  
  // Actions
  setUser: (user: User | null) => void;
  addJournal: (entry: JournalEntry) => void;
  updateJournal: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => void;
  markSynced: (tempId: string, realId: string) => void;
  setJournals: (journals: JournalEntry[]) => void;
  toggleEquipment: (id: string) => void;
  setOwnedEquipmentIds: (ids: string[]) => void;
  setEquipment: (equipment: Equipment[]) => void;
  setMethods: (methods: BrewingMethod[]) => void;
  setPresets: (presets: BrewingPreset[]) => void;
  addPreset: (preset: BrewingPreset) => void;
  removePreset: (id: string) => void;
  setFeed: (cards: FeedCard[]) => void;
  setGuestContext: (country: string, language: string) => void;
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
  isPwaInstalled: boolean;
  setIsPwaInstalled: (installed: boolean) => void;
  syncingIds: Set<string>;
  setSyncing: (id: string, syncing: boolean) => void;
  adminSession: { user: User; token: string } | null;
  startImpersonating: (targetUser: User, targetToken: string) => void;
  stopImpersonating: () => void;
  lastProcessedParams: string | null;
  setLastProcessedParams: (params: string | null) => void;
  activeJournalEntry: Partial<JournalEntry> | null;
  setActiveJournalEntry: (entry: Partial<JournalEntry> | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: true,
      journals: [],
      equipment: [],
      ownedEquipmentIds: [],
      methods: [],
      presets: [],
      feed: [],
      deferredPrompt: null,
      setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
      isPwaInstalled: false,
      setIsPwaInstalled: (isPwaInstalled) => set({ isPwaInstalled }),
      syncingIds: new Set(),
      adminSession: null,
      lastProcessedParams: null,
      activeJournalEntry: null,

      setLastProcessedParams: (lastProcessedParams) => set({ lastProcessedParams }),
      setActiveJournalEntry: (activeJournalEntry) => set({ activeJournalEntry }),

      setSyncing: (id, syncing) => set((state) => {
        const next = new Set(state.syncingIds);
        if (syncing) next.add(id);
        else next.delete(id);
        return { syncingIds: next };
      }),

      setUser: (user) => set((state) => {
        if (!user) {
          // Reset personal data on logout
          // Proactively set guest language from browser to avoid English flicker
          const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
          const mappedLang: any = ['es', 'pt', 'ru', 'ka', 'it'].includes(browserLang) 
            ? (browserLang === 'es' ? 'es-419' : browserLang === 'pt' ? 'pt-BR' : browserLang)
            : 'en';

          return { 
            user: { id: 'guest', name: 'Guest', email: '', country: 'WW', language: mappedLang }, 
            isGuest: true, 
            journals: [],
            ownedEquipmentIds: [],
            presets: [],
            adminSession: null, // Clear impersonation on logout
            equipment: state.equipment.map(e => ({ ...e, isOwned: false }))
          };
        }
        return { user, isGuest: false };
      }),

      startImpersonating: (targetUser, targetToken) => {
        const currentUser = get().user;
        const currentToken = localStorage.getItem('vidita_token');
        if (currentUser && currentToken) {
          set({ 
            adminSession: { user: currentUser, token: currentToken },
            user: targetUser,
            isGuest: false,
            // Clear current user data
            journals: [],
            ownedEquipmentIds: [],
            presets: [],
          });
          localStorage.setItem('vidita_token', targetToken);
          window.location.href = '/'; // Go home and reload
        }
      },

      stopImpersonating: () => {
        const session = get().adminSession;
        if (session) {
          set({ 
            user: session.user,
            adminSession: null,
            isGuest: false,
            // Clear target user data
            journals: [],
            ownedEquipmentIds: [],
            presets: [],
          });
          localStorage.setItem('vidita_token', session.token);
          window.location.reload();
        }
      },
      addJournal: (entry) => set((state) => ({ 
        journals: [entry, ...state.journals] 
      })),
      updateJournal: (id, updatedEntry) => set((state) => ({
        journals: state.journals.map(j => j.id === id ? { ...j, ...updatedEntry } : j)
      })),
      deleteJournal: (id) => set((state) => ({
        journals: state.journals.filter(j => j.id !== id)
      })),
      markSynced: (tempId, realId) => set((state) => ({
        journals: state.journals.map(j => 
          j.id === tempId ? { ...j, id: realId, is_synced: true } : j
        )
      })),
      setJournals: (newJournals) => set((state) => {
        const unsynced = state.journals.filter(j => j.is_synced === false);
        const syncedFromApi = newJournals.map(j => ({ ...j, is_synced: true }));
        const filteredUnsynced = unsynced.filter(u => !syncedFromApi.find(s => s.id === u.id));
        return { journals: [...filteredUnsynced, ...syncedFromApi].sort((a, b) => b.date - a.date) };
      }),
      toggleEquipment: (id) => set((state) => {
        const isCurrentlyOwned = state.ownedEquipmentIds.includes(id);
        const newOwnedIds = isCurrentlyOwned 
          ? state.ownedEquipmentIds.filter(oid => oid !== id)
          : [...state.ownedEquipmentIds, id];
        
        return {
          ownedEquipmentIds: newOwnedIds,
          equipment: state.equipment.map((e) => 
            e.id === id ? { ...e, isOwned: !isCurrentlyOwned } : e
          )
        };
      }),
      setOwnedEquipmentIds: (ids) => set((state) => ({
        ownedEquipmentIds: ids,
        equipment: state.equipment.map(e => ({
          ...e,
          isOwned: ids.includes(e.id)
        }))
      })),
      setEquipment: (newEquipment) => set((state) => {
        const merged = newEquipment.map(item => ({
          ...item,
          isOwned: state.ownedEquipmentIds.includes(item.id)
        }));
        return { equipment: merged };
      }),
      setMethods: (methods) => set({ methods }),
      setPresets: (presets) => set({ presets }),
      addPreset: (preset) => set((state) => ({ presets: [preset, ...state.presets] })),
      removePreset: (id) => set((state) => ({ 
        presets: state.presets.filter(p => p.id !== id) 
      })),
      setFeed: (feed) => set({ feed }),
      setGuestContext: (country, language) => set((state) => {
        if (state.isGuest) {
          return {
            user: { 
              id: 'guest', 
              name: 'Guest', 
              email: '', 
              country, 
              language: language as any 
            }
          };
        }
        return {};
      }),
    }),
    {
      name: 'viditacafe-storage',
      version: 6, 
      partialize: (state) => ({ 
        journals: state.journals, 
        equipment: state.equipment,
        ownedEquipmentIds: state.ownedEquipmentIds,
        presets: state.presets,
        // Only persist user if they are NOT a guest
        user: state.isGuest ? null : state.user,
        isGuest: state.isGuest,
        adminSession: state.adminSession,
        lastProcessedParams: state.lastProcessedParams,
        activeJournalEntry: state.activeJournalEntry
      }),
    }
  )
);
