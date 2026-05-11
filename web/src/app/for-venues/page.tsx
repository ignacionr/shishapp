'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { BarChart3, Users, Gift, QrCode, MessageCircle } from 'lucide-react';

export default function ForVenuesPage() {
  const { t, mounted } = useTranslation();

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-24">
      {/* Hero Section */}
      <div className="bg-stone-900 dark:bg-stone-900 py-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-50 mb-4">
          {t.venues_title}
        </h1>
        <p className="text-lg text-stone-300 max-w-2xl mx-auto">
          {t.venues_subtitle}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">{t.analytics_title}</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              {t.analytics_desc}
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">{t.community_title}</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              {t.community_desc}
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">{t.free_forever_title}</h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              {t.free_forever_desc}
            </p>
          </div>
        </div>

        {/* Our Request Section */}
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-amber-100 dark:border-amber-900/30">
          <div className="w-24 h-24 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <QrCode className="w-12 h-12 text-stone-900 dark:text-stone-100" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
              {t.our_request_title}
            </h2>
            <p className="text-stone-700 dark:text-stone-300 text-lg">
              {t.our_request_desc}
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center pt-8">
          <a
            href="https://wa.me/59895191127"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
            {t.contact_us}
          </a>
        </div>
      </div>

      {/* Floating WhatsApp Button (Mobile focus) */}
      <a
        href="https://wa.me/59895191127"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-28 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-50 md:hidden"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-8 h-8 fill-current" />
      </a>
    </div>
  );
}
