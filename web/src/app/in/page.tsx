'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useStore();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Extract token from URL (Search Params or Hash)
    const getHashParam = (name: string) => {
        if (typeof window === 'undefined') return null;
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get(name);
    };

    // Google returns id_token in hash. Backend might redirect with token in query.
    const token = searchParams.get('token') || searchParams.get('id_token') || getHashParam('id_token');
    
    if (token) {
      try {
        // 2. If it's a Google ID Token (JWT), we need to extract user info and register with our backend
        // Note: Google ID Tokens are 3-part JWTs.
        if (token.includes('.') && token.length > 100) {
            // Google tokens are Base64URL encoded
            const payloadBase64Url = token.split('.')[1];
            const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
            
            // Robust UTF-8 decoding for Base64
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const googleUser = JSON.parse(jsonPayload);
            
            // Get current session context to persist if account is new
            const { user: guestUser } = useStore.getState();

            // 3. Exchange Google User info for a Vidita Token
            fetch('/api/v1/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: googleUser.sub,
                    email: googleUser.email,
                    name: googleUser.name,
                    picture: googleUser.picture,
                    preferredCountry: guestUser?.country,
                    preferredLanguage: guestUser?.language
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('vidita_token', data.token);
                    setUser(data.user);
                    window.location.href = '/journey';
                } else {
                    throw new Error('Backend failed to provide token');
                }
            })
            .catch(err => {
                console.error(err);
                setError('Backend registration failed');
            });
        } else {
            // 4. If it's already a Vidita token (e.g. from a direct link)
            localStorage.setItem('vidita_token', token);
            fetch('/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch user data');
                return res.json();
            })
            .then(user => {
                setUser(user);
                window.location.href = '/journey';
            })
            .catch(err => {
                console.error(err);
                setError('Session validation failed');
            });
        }
      } catch (e) {
        console.error("Token parsing error", e);
        setError('Invalid authentication response');
      }
    } else {
      setError('No token found in URL');
    }
  }, [searchParams, setUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-full">
          <AlertCircle className="text-red-600" size={48} />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-4 dark:text-stone-100">{t.login_failed}</h1>
          <p className="text-stone-500 max-w-xs mx-auto">{error}</p>
        </div>
        <button 
          onClick={() => router.push('/login')}
          className="bg-stone-900 text-white px-8 py-4 rounded-3xl font-black shadow-xl active:scale-95 transition-transform"
        >
          {t.back_to_safety}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="text-stone-700 animate-spin mb-6" size={64} />
      <h1 className="text-2xl font-bold mb-2 dark:text-stone-100">{t.authenticating}</h1>
      <p className="text-stone-500">{t.auth_handshake_msg}</p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="text-stone-700 animate-spin mb-6" size={64} />
        </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
