'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { legalTranslations } from '@/translations/legal';

export default function TermsPage() {
  const router = useRouter();
  const { lang } = useTranslation();
  const lt = legalTranslations[lang] || legalTranslations.en;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-24 text-stone-900 dark:text-stone-100">
      <header className="flex items-center space-x-4 mb-12">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-stone-900 rounded-full shadow-sm border border-stone-100 dark:border-stone-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black">{lt.terms_title}</h1>
      </header>

      <div className="max-w-2xl mx-auto bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex justify-center py-4">
           <ScrollText size={48} className="text-coffee-500" />
        </div>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium text-sm">
          {lt.terms_intro}
        </p>

        <h2 className="text-lg font-bold">{lt.t_h1}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.t_c1}
        </p>

        <h2 className="text-lg font-bold">{lt.t_h2}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.t_c2}
        </p>

        <h2 className="text-lg font-bold">{lt.t_h3}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.t_c3}
        </p>

        <h2 className="text-lg font-bold">{lt.t_h4}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.t_c4}
        </p>

        <h2 className="text-lg font-bold">{lt.t_h5}</h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
          {lt.t_c5}
        </p>

        <p className="text-stone-400 text-xs pt-8 border-t border-stone-50 dark:border-stone-800">
           {lt.last_updated}
        </p>
      </div>
    </div>
  );
}
