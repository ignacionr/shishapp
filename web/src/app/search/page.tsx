'use client';

import { MapPin, Navigation, Loader2, ExternalLink, Coffee, ChevronRight, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Venue } from '@/types';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle');
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number} | null>(null);

  const fetchClosestVenues = (lat: number, lon: number) => {
    setLoading(true);
    setUserCoords({ lat, lon });
    fetch(`/api/v1/venues/search?lat=${lat}&lon=${lon}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch venues');
        return res.json();
      })
      .then(data => {
        setVenues(data);
        setLocationStatus('granted');
      })
      .catch(err => {
        console.error(err);
        setError(t.loc_error);
        setLocationStatus('error');
      })
      .finally(() => setLoading(false));
  };

  const handleRequestLocation = () => {
    setLocationStatus('requesting');
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchClosestVenues(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationStatus('denied');
        setError(t.loc_error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Helper to calculate approximate distance in km (for display)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const handleCheckin = (venue: Venue) => {
    // Navigate to checkin deep link
    router.push(`/checkin?venue=${encodeURIComponent(venue.name)}&tags=${venue.tags.join(',')}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-24 text-stone-900 dark:text-stone-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">{t.search}</h1>
        <div className="bg-coffee/10 p-3 rounded-full">
          <MapPin className="text-coffee" size={24} />
        </div>
      </div>

      {locationStatus === 'idle' || locationStatus === 'denied' || locationStatus === 'error' ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="bg-stone-100 dark:bg-stone-800 p-6 rounded-full mb-6">
            <Navigation className="text-stone-400 dark:text-stone-500" size={48} />
          </div>
          <h2 className="text-xl font-bold mb-2">{t.loc_permission}</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-xs mx-auto">
            {t.loc_desc}
          </p>
          <button 
            onClick={handleRequestLocation}
            disabled={loading}
            className="w-full sm:w-auto bg-coffee text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
            <span>{t.allow_loc}</span>
          </button>
          {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center space-x-2 text-stone-600 dark:text-stone-400 px-2">
            <Coffee size={16} />
            <h2 className="text-xs font-black uppercase tracking-widest">{t.closest_venues}</h2>
          </div>

          <div className="space-y-4">
            {venues.map((venue) => (
              <div 
                key={venue.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-100 dark:border-stone-800 shadow-sm group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-coffee transition-colors">{venue.name}</h3>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-500 dark:text-stone-400 text-sm font-medium flex items-center mt-1 hover:text-coffee transition-colors"
                    >
                      <MapPin size={14} className="mr-1" />
                      {venue.address}, {venue.city}
                    </a>
                  </div>
                  {userCoords && (
                    <div className="bg-stone-50 dark:bg-stone-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-stone-500">
                      {t.km_away.replace('{dist}', calculateDistance(userCoords.lat, userCoords.lon, venue.latitude, venue.longitude))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {venue.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-1 rounded-lg flex items-center">
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleCheckin(venue)}
                    className="flex-1 bg-coffee text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
                  >
                    <Coffee size={16} />
                    <span>{t.checkin_here}</span>
                  </button>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 p-3 rounded-xl active:scale-95 transition-transform"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="text-coffee animate-spin" size={32} />
              </div>
            )}
          </div>

          <button 
            onClick={handleRequestLocation}
            className="w-full py-4 text-stone-500 dark:text-stone-400 text-sm font-bold flex items-center justify-center space-x-2 hover:text-coffee transition-colors"
          >
            <Navigation size={14} />
            <span>{t.update_location}</span>
          </button>
        </div>
      )}
    </div>
  );
}
