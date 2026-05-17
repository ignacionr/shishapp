'use client';

import { FeedCard as FeedCardType } from '../types';
import { Sparkles, PlayCircle, Wrench, ArrowRight, Download, Volume2, VolumeX, LogIn, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useRef, useEffect } from 'react';
import { handleGoogleLogin } from '@/lib/auth';

interface Props {
  item: FeedCardType;
  priority?: boolean;
  onVideoEnd?: () => void;
}

export default function FeedCard({ item, priority, onVideoEnd }: Props) {
  const { deferredPrompt, setDeferredPrompt } = useStore();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isVeryShort, setIsVeryShort] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && item.type === 'native_video') {
      videoRef.current.playbackRate = 0.6;
    }
    
    const checkSize = () => {
        setIsVeryShort(window.innerHeight <= 620);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [item.type]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert(t.install_ios || "To install: tap the Share icon and then 'Add to Home Screen'.");
      } else {
        alert(t.install_generic || "To install: use your browser's menu and select 'Install' or 'Add to Home Screen'.");
      }
    }
  };

  const renderIcon = (forceIcon = false) => {
    // RESTORED: Images are now ALWAYS shown if available
    if (item.type === 'suggestion' && item.media && !forceIcon) {
        return (
            <img 
              src={item.media} 
              alt="" 
              className={`object-cover shadow-2xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 ${
                  isVeryShort ? 'w-24 h-24 rounded-2xl' : 'w-56 h-56 short:w-32 short:h-32 rounded-[48px] short:rounded-[32px]'
              }`} 
            />
        );
    }

    switch (item.type) {
      case 'insight': return <Sparkles className={`text-orange-500 ${isVeryShort ? 'w-10 h-10' : 'w-16 h-16 short:w-12'}`} />;
      case 'video': return <PlayCircle className="text-white w-20 h-16 short:w-14 drop-shadow-lg" />;
      case 'native_video': return <PlayCircle className="text-white w-20 h-16 short:w-14 drop-shadow-lg" />;
      case 'suggestion': 
        if (item.id === 'login_cta') return <LogIn className={`text-stone-600 ${isVeryShort ? 'w-10 h-10' : 'w-16 h-16 short:w-12'}`} />;
        return <Wrench className={`text-green-500 ${isVeryShort ? 'w-10 h-10' : 'w-16 h-16 short:w-12'}`} />;
      case 'pwa_install' as any: return <Download className="text-blue-500 w-16 h-16 short:w-12" />;
      default: return null;
    }
  };

  if (item.id === 'login_cta') {
    return (
        <div className={`h-full flex flex-col items-center px-8 short:px-6 text-center bg-stone-50 dark:bg-stone-950 ${isVeryShort ? 'pt-4 justify-start' : 'justify-center'}`}>
          <div className={`bg-white dark:bg-stone-900 shadow-2xl border border-stone-100 dark:border-stone-800 ${isVeryShort ? 'mb-2 p-4 rounded-2xl' : 'mb-10 short:mb-4 p-8 short:p-4 rounded-[40px] short:rounded-[24px]'}`}>
            {renderIcon()}
          </div>
          <h2 className={`font-black dark:text-stone-100 leading-tight max-w-sm ${isVeryShort ? 'text-lg mb-1' : 'text-4xl short:text-xl mb-6 short:mb-2'}`}>{item.title}</h2>
          <p className={`text-stone-500 dark:text-stone-400 font-medium max-w-sm ${isVeryShort ? 'text-xs leading-tight mb-3' : 'text-xl short:text-sm leading-relaxed mb-10 short:mb-4'}`}>
            {item.content}
          </p>
          
          <div className={`w-full max-w-xs ${isVeryShort ? 'space-y-2' : 'space-y-6 short:space-y-2'}`}>
            <div className="flex items-start space-x-3 text-left px-4">
                <button 
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                    aria-labelledby="terms-label"
                    className={`mt-1 flex-shrink-0 rounded-md border-2 transition-all flex items-center justify-center ${
                        isVeryShort ? 'w-4 h-4' : 'w-6 h-6 short:w-5 short:h-5'
                    } ${acceptedTerms ? 'bg-stone-700 border-stone-700' : 'border-stone-300 dark:border-stone-700'}`}
                >
                    {acceptedTerms && <CheckCircle2 size={isVeryShort ? 10 : 12} className="text-white" />}
                </button>
                <p id="terms-label" className={`text-stone-500 dark:text-stone-400 leading-tight font-bold ${isVeryShort ? 'text-[10px]' : 'text-[10px]'}`}>
                    {t.agree} <Link href="/terms" className="text-stone-700 dark:text-stone-400 underline">{t.terms}</Link> {t.and} <Link href="/privacy" className="text-stone-700 dark:text-stone-400 underline">{t.privacy}</Link>.
                </p>
            </div>

            <button 
                onClick={() => acceptedTerms && handleGoogleLogin()}
                disabled={!acceptedTerms}
                className={`w-full flex items-center justify-center space-x-3 font-black shadow-2xl transition-all active:scale-95 ${
                    isVeryShort ? 'py-2 rounded-xl text-sm' : 'py-5 short:py-3 rounded-3xl short:text-base'
                } ${acceptedTerms ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-600 cursor-not-allowed'}`}
            >
                <img src="https://www.google.com/favicon.ico" alt="" className={`${isVeryShort ? 'w-4 h-4' : 'w-6 h-6 short:w-5 short:h-5'} ${!acceptedTerms ? 'grayscale opacity-30' : ''}`} />
                <span>{t.login}</span>
            </button>
          </div>
        </div>
    );
  }

  if (item.type === 'native_video') {
    return (
      <div className="h-full relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={item.metadata}
          autoPlay
          onEnded={onVideoEnd}
          muted={isMuted}
          playsInline
          loop
          preload="metadata"
          poster="/static/images/v60.jpg"
          className="w-full h-full object-cover opacity-90"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-8 short:p-6 ${isVeryShort ? 'p-4 pb-8' : 'pb-24 short:pb-20'}`}>
          <div className="mb-4 short:mb-2">
             <span className="bg-stone-700/80 text-white px-3 py-1 rounded-full text-[10px] short:text-[8px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">Feature</span>
          </div>
          <h2 className={`font-black text-white leading-tight drop-shadow-2xl ${isVeryShort ? 'text-xl mb-3' : 'text-4xl short:text-2xl mb-8 short:mb-4'}`}>{item.title}</h2>
          
          <div className="flex items-center space-x-4">
            {(item.id === 'featured_video_1' || item.id === 'scan_log_savor_video') && (
              <Link 
                href={item.id === 'featured_video_1' ? "/checkin" : "/search"}
                className={`flex-1 bg-white text-black font-black text-center shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-2 ${isVeryShort ? 'py-2 rounded-xl text-sm' : 'py-4 short:py-3 rounded-2xl short:text-sm'}`}
              >
                <span>{item.id === 'featured_video_1' ? t.journal_home_brew : t.find_closest}</span>
                <ArrowRight size={isVeryShort ? 16 : 20} strokeWidth={3} />
              </Link>
            )}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-colors ${isVeryShort ? 'p-2' : 'p-4 short:p-3'}`}
            >
              {isMuted ? <VolumeX size={isVeryShort ? 16 : 20} /> : <Volume2 size={isVeryShort ? 16 : 20} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'video') {
    const youtubeId = item.metadata;
    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    
    if (showPlayer) {
      return (
        <div className="h-full relative overflow-hidden bg-black flex flex-col">
          <div className="flex-1 w-full relative">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
          <div className="bg-black p-4 flex justify-center pb-20">
            <button 
              onClick={() => setShowPlayer(false)}
              className="bg-white/10 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest backdrop-blur-md border border-white/10 active:scale-95 transition-all"
            >
              {t.back_to_journey}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full relative overflow-hidden bg-black">
        <img 
          src={thumbnailUrl} 
          alt="" 
          className="w-full h-full object-cover opacity-60"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-8 short:p-6 ${isVeryShort ? 'p-4 pb-8' : 'pb-24 short:pb-20'}`}>
          <div className="mb-4 short:mb-2">
             <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] short:text-[8px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">YouTube</span>
          </div>
          <h2 className={`font-black text-white leading-tight drop-shadow-2xl ${isVeryShort ? 'text-xl mb-3' : 'text-4xl short:text-2xl mb-8 short:mb-4'}`}>{item.title}</h2>
          <p className="text-white/70 font-medium mb-8 short:mb-4 line-clamp-3 leading-relaxed drop-shadow-lg">{item.content}</p>
          
          <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowPlayer(true)}
                className={`flex-1 bg-white text-black font-black text-center shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-2 ${isVeryShort ? 'py-2 rounded-xl text-sm' : 'py-4 short:py-3 rounded-2xl short:text-sm'}`}
              >
                <PlayCircle size={isVeryShort ? 16 : 20} strokeWidth={3} />
                <span>{(t as any).watch_video || "Watch Video"}</span>
              </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col items-center px-8 short:px-6 text-center bg-stone-50 dark:bg-stone-950 ${isVeryShort ? 'pt-6 justify-start' : 'justify-center'}`}>
      <div className={`flex transition-all ${isVeryShort ? 'flex-row text-left space-x-4 w-full mb-4 items-center' : 'flex-col mb-12 short:mb-6'}`}>
        <div className={`flex-shrink-0 flex items-center justify-center ${item.media ? '' : 'bg-white dark:bg-stone-900 shadow-2xl border border-stone-100 dark:border-stone-800 rounded-[40px] short:rounded-[24px] p-8 short:p-4'}`}>
            {renderIcon()}
        </div>

        
        <div className="max-w-md w-full">
            <h2 className={`font-black dark:text-stone-100 leading-tight ${isVeryShort ? 'text-xl mb-1' : 'text-4xl short:text-xl mb-6 short:mb-2'}`}>
              {item.title}
            </h2>
            <p className={`text-stone-500 dark:text-stone-400 font-medium ${isVeryShort ? 'text-[13px] leading-tight line-clamp-3' : 'text-xl short:text-sm leading-relaxed mb-12 short:mb-6 mx-auto max-w-sm line-clamp-3 short:line-clamp-2'}`}>
              {item.content}
            </p>
        </div>
      </div>
      
      {item.destination && (
        <div className={`flex w-full ${isVeryShort ? 'justify-start pl-28' : 'justify-center'}`}>
          <Link 
            href={item.destination}
            className={`bg-stone-700 text-white font-black flex items-center space-x-2 shadow-2xl active:scale-95 transition-all ${isVeryShort ? 'py-2 px-4 rounded-full text-xs' : 'px-10 py-5 short:px-6 short:py-3 rounded-full text-xl short:text-sm'}`}
          >
            <span>{t.view_item}</span>
            <ArrowRight size={isVeryShort ? 14 : 24} strokeWidth={3} />
          </Link>
        </div>
      )}
    </div>
  );
}
