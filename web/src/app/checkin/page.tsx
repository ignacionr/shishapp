'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const dynamic = 'force-static';

function CheckinRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  useEffect(() => {
    // Forward all parameters to the journey page
    const params = searchParams.toString();
    router.replace(`/journey?${params}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="text-stone-700 animate-spin mb-4" size={48} />
      <h1 className="text-xl font-bold dark:text-stone-100">{t.preparing_checkin}</h1>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={null}>
      <CheckinRedirect />
    </Suspense>
  );
}
