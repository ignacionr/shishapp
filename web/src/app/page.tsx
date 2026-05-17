'use client';

import { useStore } from '@/store/useStore';
import FeedCard from '@/components/FeedCard';
import { useTranslation } from '@/hooks/useTranslation';
import { FeedCard as FeedCardType } from '@/types';
import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function HomePageContent() {
  const { feed, isPwaInstalled, isGuest, deferredPrompt, equipment, methods, journals } = useStore();
  const { t, mounted } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const isDebug = searchParams.get('debug') === 'true' || searchParams.get('display_size') === 'true';
  
  // Keep the shuffled pool in state to ensure it's stable after hydration
  const [shuffledPool, setShuffledPool] = useState<FeedCardType[]>([]);

  const handleVideoEnd = () => {
    if (containerRef.current) {
        if (containerRef.current.scrollTop < 50) {
            containerRef.current.scrollBy({ top: containerRef.current.clientHeight, behavior: 'smooth' });
        }
    }
  };

  const suggestions = useMemo(() => {
    const list: FeedCardType[] = [];
    const ownedNames = equipment.filter(e => e.isOwned).map(e => e.internal_name.toLowerCase());
    
    const hasScale = equipment.some(e => e.category === 'scale' && e.isOwned);
    if (!hasScale) {
      const scale = equipment.find(e => e.category === 'scale');
      list.push({
        id: 'suggest_scale',
        type: 'suggestion',
        title: t.suggestion_scale_title,
        content: t.suggestion_scale_content,
        media: scale?.imageUrl,
        destination: scale ? `/equipment?item=${scale.slug}` : '/equipment'
      });
    }

    const hasKettle = equipment.some(e => e.category === 'kettle' && e.isOwned);
    if (!hasKettle) {
      const kettle = equipment.find(e => e.internal_name === 'Gooseneck Kettle') || equipment.find(e => e.category === 'kettle');
      list.push({
        id: 'suggest_kettle',
        type: 'suggestion',
        title: t.suggestion_kettle_title,
        content: t.suggestion_kettle_content,
        media: kettle?.imageUrl,
        destination: kettle ? `/equipment?item=${kettle.slug}` : '/equipment'
      });
    }

    methods.forEach(method => {
      const missing = method.requiredEquipment.filter(req => !ownedNames.includes(req.toLowerCase()));
      if (missing.length === 1) {
        const missingName = missing[0];
        const eqItem = equipment.find(e => e.internal_name.toLowerCase() === missingName.toLowerCase());
        
        if (eqItem && eqItem.category === 'brewer') {
          list.push({
            id: `suggest_method_${method.id}`,
            type: 'suggestion',
            title: t.suggestion_brewer_title.replace('{method}', method.displayName),
            content: t.suggestion_brewer_content.replace('{method}', method.displayName),
            media: eqItem.imageUrl,
            destination: `/equipment?item=${eqItem.slug}`
          });
        }
      }
    });

    return list;
  }, [equipment, methods, t]);

  useEffect(() => {
    if (!mounted) return;
    const shufflePool = [...feed, ...suggestions];
    for (let i = shufflePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shufflePool[i], shufflePool[j]] = [shufflePool[j], shufflePool[i]];
    }
    setShuffledPool(shufflePool);
  }, [feed, suggestions, mounted]);

  const fullFeed = useMemo(() => {
    const fixedTop: FeedCardType[] = [];
    const hasJournals = journals && journals.length > 0;
    if (!hasJournals) {
      fixedTop.push({
          id: 'featured_video_1',
          type: 'native_video',
          title: (t as any).master_ritual || "The Daily Ritual",
          content: (t as any).master_ritual_desc || "The art of coffee, documented.",
          metadata: '/static/videos/ritual.mp4',
          destination: '/journey'
      });
    }

    const hasVenueCheckin = journals && journals.some(j => j.location_type && j.location_type !== 'home');
    if (!hasVenueCheckin) {
      fixedTop.push({
          id: 'scan_log_savor_video',
          type: 'native_video',
          title: (t as any).scan_log_savor || "Scan, Log, Savor",
          content: (t as any).scan_log_savor_desc || "Discover the magic of your local coffee shop.",
          metadata: '/static/videos/Scan_Log_Savor_Coffee_Journey.mp4',
          destination: '/search'
      });
    }

    if (isGuest) {
      fixedTop.push({
        id: 'login_cta',
        type: 'suggestion',
        title: (t as any).login_suggestion_title || "Save Your Journey",
        content: (t as any).login_suggestion_desc || "Log in to save your brewing journal.",
        destination: '/login'
      });
    }

    if (!isPwaInstalled) {
      fixedTop.push({
        id: 'pwa_install',
        type: 'pwa_install' as any,
        title: t.install_title,
        content: t.install_desc
      });
    }

    if (!mounted) return fixedTop;
    return [...fixedTop, ...shuffledPool];
  }, [shuffledPool, mounted, t, isGuest, isPwaInstalled, journals]);

  return (
    <div ref={containerRef} className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory bg-stone-50 dark:bg-stone-950 overscroll-contain">
      {isDebug && (
        <>
            <div className="fixed top-2 right-2 z-[9999] bg-black/80 text-white text-[10px] p-2 pointer-events-none font-mono opacity-50 rounded-lg">
                <div className="flex flex-col space-y-1">
                    <span>H: <span id="debug-h">?</span>px</span>
                    <span className="text-red-400">SHORT: <span id="debug-short">?</span></span>
                    <span className="text-blue-400">VERY: <span id="debug-very">?</span></span>
                </div>
            </div>
            <script dangerouslySetInnerHTML={{ __html: `
                    setInterval(() => {
                        const h = window.innerHeight;
                        const dh = document.getElementById('debug-h');
                        const ds = document.getElementById('debug-short');
                        const dv = document.getElementById('debug-very');
                        if (dh) dh.innerText = h;
                        if (ds) ds.innerText = window.matchMedia('(max-height: 720px)').matches;
                        if (dv) dv.innerText = window.matchMedia('(max-height: 600px)').matches;
                    }, 500);
            `}} />
        </>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "MyShisha.vip",
            "url": "https://myshisha.vip",
            "description": "MyShisha.vip is your personal shisha journal and session companion.",
            "applicationCategory": "LifestyleApplication, UtilityApplication",
            "operatingSystem": "Web (PWA)",
            "author": { "@type": "Organization", "name": "MyShisha.vip" }
          })
        }}
      />
      {fullFeed.map((item, index) => (
        <section key={item.id} className="h-[100dvh] w-full snap-start snap-always border-b border-stone-100 dark:border-stone-900 pb-16 short:pb-12 very-short:pb-0">
          <FeedCard 
            item={item} 
            priority={index === 0} 
            onVideoEnd={index === 0 && item.type === 'native_video' ? handleVideoEnd : undefined}
          />
        </section>
      ))}
      
      {fullFeed.length === 0 && !deferredPrompt && (
        <div className="h-[100dvh] flex items-center justify-center">
          <p className="text-stone-400 animate-pulse">{t.loading_journey}</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
    return (
        <Suspense fallback={null}>
            <HomePageContent />
        </Suspense>
    );
}
