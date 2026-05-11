'use client';

import { useStore } from '@/store/useStore';
import { Coffee, LogOut, User as UserIcon, Shield, Settings, CheckCircle2, Globe, Languages, ChevronRight, Award, Zap, Target, BookOpen, Layout, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { handleGoogleLogin } from '@/lib/auth';
import { UserMastery } from '@/types';
import { COUNTRY_DATA } from '@/lib/countries';

function MasteryRing({ mastery }: { mastery?: UserMastery }) {
  if (!mastery) return null;
  
  // Levels: 1 (0-50), 2 (200), 3 (1000), 4 (5000), 5 (Above)
  // This is a simplified progress calculation for the UI ring
  const levelThresholds = [0, 50, 200, 1000, 5000];
  const currentThreshold = levelThresholds[mastery.current_level - 1] || 0;
  const nextThreshold = levelThresholds[mastery.current_level] || 10000;
  
  const progress = Math.min(100, Math.max(5, ((mastery.total_score - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
  
  const strokeDasharray = `${progress} 100`;

  return (
    <svg viewBox="0 0 36 36" className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90">
      <path
        className="text-stone-200 dark:text-stone-800"
        strokeDasharray="100 100"
        strokeWidth="1"
        stroke="currentColor"
        fill="none"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className="text-coffee-600 dark:text-coffee-400 transition-all duration-1000 ease-out"
        strokeDasharray={strokeDasharray}
        strokeWidth="1.5"
        strokeLinecap="round"
        stroke="currentColor"
        fill="none"
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
    </svg>
  );
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es-419", name: "Español" },
  { code: "pt-BR", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "ka", name: "ქართული" },
  { code: "it", name: "Italiano" }
];

export default function LoginPage() {
  const { user, isGuest, setUser } = useStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleGoogleLoginClick = () => {
    if (!acceptedTerms) return;
    handleGoogleLogin();
  };

  const updateProfile = async (updates: { country?: string; language?: string }) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser); // Update local UI first

    try {
      const token = localStorage.getItem('vidita_token');
      await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error("Failed to persist profile update", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vidita_token');
    router.push('/');
  };

  if (!isGuest && user) {
    const currentCountryData = COUNTRY_DATA[user.country] || COUNTRY_DATA["WW"];

    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-24">
        <header className="flex flex-col items-center py-12 text-center relative">
           <div className="relative mb-6">
              <div className="w-24 h-24 bg-coffee-100 dark:bg-coffee-900/30 rounded-full flex items-center justify-center border-2 border-white dark:border-stone-900 overflow-hidden shadow-xl relative z-10">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-coffee-700 dark:text-coffee-300" />
                )}
              </div>
              <MasteryRing mastery={user.mastery} />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-stone-900 w-10 h-10 rounded-full border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-center text-xl z-20">
                 {currentCountryData.flag}
              </div>
           </div>
           
           <div className="flex flex-col items-center space-y-1">
             <div className="flex items-center space-x-2">
               <h1 className="text-3xl font-black dark:text-stone-100">{user.name}</h1>
               {user.mastery && (
                 <span className="bg-coffee-100 dark:bg-coffee-900/40 text-coffee-700 dark:text-coffee-300 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-coffee/10">
                   LVL {user.mastery.current_level}
                 </span>
               )}
             </div>
             <p className="text-stone-500 font-medium">{user.email}</p>
             {user.mastery && (
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-coffee-600 dark:text-coffee-400 mt-2 flex items-center space-x-1">
                 <Award size={12} />
                 <span>{t[`mastery_title_${user.mastery.current_level}` as keyof typeof t] || t.mastery_title_1}</span>
               </p>
             )}
           </div>
        </header>

        <div className="space-y-6 max-w-sm mx-auto">
           {/* Mastery Stats Dashboard */}
           {user.mastery && (
             <section className="grid grid-cols-2 gap-3">
               <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col items-center justify-center space-y-1">
                  <BookOpen size={16} className="text-stone-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{t.mastery_journals}</span>
                  <span className="text-xl font-black">{user.mastery.journal_count}</span>
               </div>
               <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col items-center justify-center space-y-1">
                  <Zap size={16} className="text-stone-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{t.mastery_methods}</span>
                  <span className="text-xl font-black">{user.mastery.method_count}</span>
               </div>
               <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col items-center justify-center space-y-1">
                  <MapPin size={16} className="text-stone-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{t.mastery_venues}</span>
                  <span className="text-xl font-black">{user.mastery.venue_count}</span>
               </div>
               <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col items-center justify-center space-y-1">
                  <Target size={16} className="text-stone-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{t.mastery_precision}</span>
                  <span className="text-xl font-black">{user.mastery.precision_count}</span>
               </div>
             </section>
           )}

           <section className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm">
              <div className="p-5 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
                 <div className="flex items-center space-x-4 text-stone-700 dark:text-stone-200">
                    <Globe size={20} className="text-stone-400" />
                    <span className="font-bold">{t.country}</span>
                 </div>
                 <select 
                   value={user.country}
                   onChange={(e) => {
                     const newCountry = e.target.value;
                     const newLang = COUNTRY_DATA[newCountry]?.lang || user.language;
                     updateProfile({ country: newCountry, language: newLang });
                   }}
                   className="bg-transparent font-bold text-sm text-coffee-700 dark:text-coffee-400 focus:outline-none text-right appearance-none"
                 >
                   {Object.entries(COUNTRY_DATA).map(([code, data]) => (
                     <option key={code} value={code}>{data.label}</option>
                   ))}
                 </select>
              </div>

              <div className="p-5 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
                 <div className="flex items-center space-x-4 text-stone-700 dark:text-stone-200">
                    <Languages size={20} className="text-stone-400" />
                    <span className="font-bold">{t.language}</span>
                 </div>
                 <select 
                   value={user.language}
                   onChange={(e) => updateProfile({ language: e.target.value })}
                   className="bg-transparent font-bold text-sm text-coffee-700 dark:text-coffee-400 focus:outline-none text-right appearance-none"
                 >
                   {SUPPORTED_LANGUAGES.map(l => (
                     <option key={l.code} value={l.code}>{l.name}</option>
                   ))}
                 </select>
              </div>

              {/* Admin Dashboard */}
              {(user.is_admin || (user.roles?.length ?? 0) > 0) && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="w-full p-5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <div className="flex items-center space-x-4 text-orange-600">
                    <Shield size={20} />
                    <span className="font-bold">{t.admin_dashboard}</span>
                  </div>
                  <ChevronRight size={18} className="text-stone-400" />
                </button>
              )}
           </section>

           <button 
             onClick={handleLogout}
             className="w-full bg-white dark:bg-stone-900 text-red-500 py-5 rounded-3xl font-black shadow-sm border border-stone-100 dark:border-stone-800 flex items-center justify-center space-x-3 active:scale-[0.98] transition-all"
           >
             <LogOut size={20} />
             <span>{t.logout}</span>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-coffee/10 p-6 rounded-3xl mb-8">
        <Coffee size={64} className="text-coffee-700 dark:text-coffee-300" />
      </div>
      
      <h1 className="text-4xl font-black mb-2 dark:text-stone-100">Vidita Cafe</h1>
      <p className="text-stone-600 dark:text-stone-400 mb-12 max-w-xs font-medium">{t.guest_msg}</p>
      
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-start space-x-3 text-left px-4">
           <button 
             onClick={() => setAcceptedTerms(!acceptedTerms)}
             className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
               acceptedTerms ? 'bg-coffee-700 border-coffee-700' : 'border-stone-300 dark:border-stone-700'
             }`}
           >
             {acceptedTerms && <CheckCircle2 size={16} className="text-white" />}
           </button>
           <p className="text-xs text-stone-500 dark:text-stone-400 leading-normal font-medium">
             {t.agree} <Link href="/terms" className="text-coffee-700 dark:text-coffee-400 underline decoration-coffee/30">{t.terms}</Link> {t.and} <Link href="/privacy" className="text-coffee-700 dark:text-coffee-400 underline decoration-coffee/30">{t.privacy}</Link>.
           </p>
        </div>

        <button 
          onClick={handleGoogleLoginClick}
          disabled={!acceptedTerms}
          aria-label={t.login}
          className={`w-full flex items-center justify-center space-x-3 py-4 rounded-2xl font-bold shadow-xl transition-all ${
            acceptedTerms 
            ? 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 active:scale-[0.98] hover:border-coffee/30' 
            : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 border border-transparent cursor-not-allowed opacity-50'
          }`}
        >
          <img src="https://www.google.com/favicon.ico" alt="" className={`w-5 h-5 ${!acceptedTerms ? 'grayscale opacity-30' : ''}`} />
          <span>{t.login}</span>
        </button>
      </div>

      <button 
        onClick={() => router.push('/')}
        className="mt-8 text-coffee-700 dark:text-coffee-300 font-black text-sm uppercase tracking-widest hover:underline"
      >
        {t.home}
      </button>
    </div>
  );
}
