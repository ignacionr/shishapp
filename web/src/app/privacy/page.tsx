'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { legalTranslations } from '@/translations/legal';

export default function PrivacyPage() {
  const router = useRouter();
  const { lang } = useTranslation();
  const lt = legalTranslations[lang] || legalTranslations.en;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-24 text-stone-900 dark:text-stone-100">
      <header className="flex items-center space-x-4 mb-12">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-stone-900 rounded-full shadow-sm border border-stone-100 dark:border-stone-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black">{lt.privacy_title}</h1>
      </header>

      <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex justify-center py-4">
           <ShieldCheck size={48} className="text-green-600" />
        </div>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium text-sm">
          {lt.privacy_intro}
        </p>

        <h2 className="text-lg font-bold">{lt.p_h1}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: lt.p_c1.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

        <h2 className="text-lg font-bold">{lt.p_h2}</h2>
        <div className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.p_c2}
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>{lt.p_l1}</li>
            <li>{lt.p_l2}</li>
            <li>{lt.p_l3}</li>
          </ul>
        </div>

        <h2 className="text-lg font-bold">{lt.p_h3}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.p_c3}
        </p>

        <h2 className="text-lg font-bold">{lt.p_h4}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.p_c4}
        </p>

        <p className="text-stone-400 text-xs pt-8 border-t border-stone-50 dark:border-stone-800">
           {lt.last_updated}
        </p>
      </div>
    </div>
  );
}
