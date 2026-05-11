'use client';

import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Eye, X } from 'lucide-react';

export default function ImpersonationBanner() {
  const { user, adminSession, stopImpersonating } = useStore();
  
  if (!adminSession || !user) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[200] shadow-md animate-in slide-in-from-top duration-300">
      <div className="flex items-center space-x-2 overflow-hidden">
        <Eye size={16} className="flex-shrink-0" />
        <p className="text-xs font-black uppercase tracking-widest truncate">
          Impersonating <span className="underline">{user.name}</span>
        </p>
      </div>
      <button 
        onClick={() => {
            if (confirm('Stop impersonating and return to your admin session?')) {
                stopImpersonating();
            }
        }}
        className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-colors flex items-center space-x-1"
      >
        <span>Stop</span>
        <X size={12} />
      </button>
    </div>
  );
}
