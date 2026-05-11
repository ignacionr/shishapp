'use client';

import { useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';

export default function Bootstrap() {
  const { 
    user, isGuest, setUser, setEquipment, setMethods, 
    setJournals, setPresets, setFeed, setDeferredPrompt, 
    setIsPwaInstalled, setSyncing 
  } = useStore();

  // 1. One-time Initialization (PWA, SW, Events)
  useEffect(() => {
    // PWA Standalone Detection
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
        setIsPwaInstalled(true);
      }
    }

    // Service Worker Registration & Updates
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Bootstrap: SW registered');
            setInterval(() => registration.update(), 60 * 60 * 1000);
          },
          (err) => console.error('Bootstrap: SW registration failed', err)
        );
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('Bootstrap: New SW detected, reloading...');
        window.location.reload();
      });
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, setIsPwaInstalled]);

  // 2. Reactive Data Fetching (Depends on language and auth state)
  useEffect(() => {
    const token = localStorage.getItem('vidita_token');
    
    // URL Language Override logic (run once per language change/boot)
    let urlLang: string | null = null;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const l = urlParams.get('l');
      if (l) {
        const supported: Record<string, string> = {
          'en': 'en', 'es': 'es-419', 'es-419': 'es-419', 'pt': 'pt-BR', 'pt-BR': 'pt-BR', 'ru': 'ru', 'ka': 'ka', 'it': 'it'
        };
        urlLang = supported[l.toLowerCase()] || null;
      }
    }

    // If URL override exists and differs from current user/guest lang, apply it
    if (urlLang && user?.language !== urlLang) {
       console.log(`Bootstrap: Applying URL language override: ${urlLang}`);
       if (isGuest) {
         useStore.getState().setGuestContext(user?.country || 'WW', urlLang);
       } else {
         setUser({ ...user!, language: urlLang as any });
         if (token) {
           fetch('/api/v1/auth/profile', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ language: urlLang })
           }).catch(err => console.error("Bootstrap: Failed to persist URL lang override", err));
         }
       }
       // We stop here because the state change will trigger this effect again
       return;
    }

    const baseHeaders: Record<string, string> = {};
    if (user?.language) {
      baseHeaders['X-Shishapp-Language'] = user.language;
    }
    
    let authFailed = false;

    const safeFetch = async (url: string, opts: RequestInit, requiresAuth: boolean = false) => {
        if (requiresAuth && (!token || authFailed)) return null;
        try {
            const res = await fetch(url, opts);
            if (res.status === 401) {
                if (token && !authFailed) {
                    authFailed = true;
                    localStorage.removeItem('vidita_token');
                    setUser(null);
                }
                return null;
            }
            if (!res.ok) return null;
            const contentType = res.headers.get("content-type");
            if (contentType?.includes("application/json")) return await res.json();
            return null;
        } catch (e) {
            return null;
        }
    };

    const authHeaders = token ? { ...baseHeaders, 'Authorization': `Bearer ${token}` } : null;

    const syncOfflineEntries = async () => {
      const currentToken = localStorage.getItem('vidita_token');
      const { journals, markSynced, updateJournal, syncingIds, isGuest } = useStore.getState();
      
      // 1. Identify entries to sync or claim
      const toProcess = journals.filter(j => {
        if (syncingIds.has(j.id)) return false;
        
        // Case A: Unsynced entry (POST)
        if (j.is_synced === false) {
          if (isGuest && !j.venue_id) return false; // Guest non-venue entries stay local
          return true;
        }
        
        // Case B: Synced but anonymous entry (PUT to claim if now logged in)
        if (!isGuest && j.is_synced === true && j.user_id === 'guest') {
          return true;
        }

        return false;
      });

      if (toProcess.length === 0) return;
      
      for (const entry of toProcess) {
        if (authFailed) break;
        try {
          setSyncing(entry.id, true);
          const headers: Record<string, string> = { 
            'Content-Type': 'application/json', 
            'X-Shishapp-Language': user?.language || 'en' 
          };
          if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
          }

          const isClaim = entry.is_synced === true && entry.user_id === 'guest';
          const url = isClaim ? `/api/v1/journal/${entry.id}` : '/api/v1/journal';
          const method = isClaim ? 'PUT' : 'POST';

          const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(entry)
          });

          if (response.status === 401 && currentToken) {
             authFailed = true;
             localStorage.removeItem('vidita_token');
             setUser(null);
             break;
          }

          if (response.ok) {
            if (isClaim) {
              updateJournal(entry.id, { user_id: user?.id, is_synced: true });
            } else {
              const data = await response.json();
              markSynced(entry.id, data.id);
            }
          }
        } catch (err) {
          console.error(`Bootstrap: Sync error`, err);
        } finally {
          setSyncing(entry.id, false);
        }
      }
    };

    // Data Fetching Pipeline
    if (token && authHeaders) {
      safeFetch('/api/v1/auth/me', { headers: authHeaders }, true).then(data => {
        if (data?.id) setUser(data);
      });
    }

    if (!token) {
        safeFetch('/api/v1/auth/context', { headers: baseHeaders }).then(data => {
          if (data?.country && data?.language && !urlLang) {
            useStore.getState().setGuestContext(data.country, data.language);
          }
        });
    }

    // Localized content (Re-fetched on language change)
    safeFetch('/api/v1/feed', { headers: authHeaders || baseHeaders }).then(data => {
      if (Array.isArray(data)) setFeed(data);
    });

    safeFetch('/api/v1/methods', { headers: baseHeaders }).then(data => {
      if (Array.isArray(data)) setMethods(data);
    });

    safeFetch('/api/v1/equipment', { headers: baseHeaders }).then(data => {
      if (Array.isArray(data)) setEquipment(data);
    });

    if (token && authHeaders) {
        safeFetch('/api/v1/journal', { headers: authHeaders }, true).then(data => {
          if (Array.isArray(data)) setJournals(data);
        });

        safeFetch('/api/v1/equipment/owned', { headers: authHeaders }, true).then(data => {
          if (Array.isArray(data)) useStore.getState().setOwnedEquipmentIds(data);
        });

        safeFetch('/api/v1/brewing/presets', { headers: authHeaders }, true).then(data => {
          if (Array.isArray(data)) setPresets(data);
        });
    }

    syncOfflineEntries();

    window.addEventListener('online', syncOfflineEntries);
    return () => window.removeEventListener('online', syncOfflineEntries);
  }, [user?.language, isGuest, setUser, setEquipment, setMethods, setJournals, setPresets, setFeed, setSyncing]);

  return null;
}
