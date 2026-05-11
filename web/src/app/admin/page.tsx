'use client';

import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, BookOpen, Coffee, Star, BarChart3, ArrowLeft, Loader2, AlertCircle, Globe, History, PlayCircle, Plus, Trash2, Edit3, X, Check, Save, Languages, Link as LinkIcon, DollarSign, ExternalLink, Package, Library, MapPin, Eye, Camera, Tag as TagIcon, Smile, Wind, Utensils, RotateCcw } from 'lucide-react';
import { PurchaseLink, Equipment, User, UserRole, Venue, ShortLink, FullTag, FullTagCategory, VenueTagConfig, ContextTagSelection, AdminStats, VenueStats, StatEntry, UserBasic, Video, VenuePromotion } from '@/types';
import QRScanner from '@/components/QRScanner';
import { TagsManager } from '@/components/admin/TagsManager';
import { EquipmentCatalog } from '@/components/admin/EquipmentCatalog';
import { LinksManagement } from '@/components/admin/LinksManagement';
import { VideosManagement } from '@/components/admin/VideosManagement';
import { VenueDashboard } from '@/components/admin/VenueDashboard';
import { GlobalStats } from '@/components/admin/GlobalStats';
import { UserManagement } from '@/components/admin/UserManagement';
import { ShortLinksManagement } from '@/components/admin/ShortLinksManagement';
import { VenuesManagement } from '@/components/admin/VenuesManagement';
import { RoleManagementModal } from '@/components/admin/modals/RoleManagementModal';
import { VenueEditorModal } from '@/components/admin/modals/VenueEditorModal';
import { EquipmentEditorModal } from '@/components/admin/modals/EquipmentEditorModal';
import { VideoEditorModal } from '@/components/admin/modals/VideoEditorModal';
import { LinkEditorModal } from '@/components/admin/modals/LinkEditorModal';
import { PromotionEditorModal } from '@/components/admin/modals/PromotionEditorModal';
import { ShortLinkAssignmentModal } from '@/components/admin/modals/ShortLinkAssignmentModal';
import { ShortLinkBlockAssignmentModal } from '@/components/admin/modals/ShortLinkBlockAssignmentModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COUNTRIES = [
  { code: 'WW', label: 'Worldwide' },
  { code: 'AR', label: 'Argentina' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'BR', label: 'Brazil' },
  { code: 'ES', label: 'Spain' },
  { code: 'GE', label: 'Georgia' },
  { code: 'TH', label: 'Thailand' },
  { code: 'RU', label: 'Russia' }
];

type AdminTab = 'stats' | 'catalog' | 'links' | 'videos' | 'users' | 'short-links' | 'venue-dashboard' | 'tags' | 'venues';

export default function AdminPage() {
  const { user, isGuest, startImpersonating } = useStore();
  const { t, lang } = useTranslation();
  const router = useRouter();

  // Role Helpers
  const isGlobalAdmin = user?.is_admin || user?.roles?.some((r: UserRole) => r.role_type === 'GLOBAL');
  const getAdminCountries = () => {
    if (isGlobalAdmin) return COUNTRIES.map(c => c.code);
    return user?.roles?.filter((r: UserRole) => r.role_type === 'COUNTRY').map((r: UserRole) => r.target_id!) || [];
  };
  const adminCountries = getAdminCountries();
  const isCountryAdmin = (code: string) => isGlobalAdmin || adminCountries.includes(code);
  const needsGlobalData = isGlobalAdmin || adminCountries.length > 0;
  
  const venueRoles = user?.roles?.filter((r: UserRole) => r.role_type === 'VENUE') || [];
  const isVenueAdmin = venueRoles.length > 0;
  const isOnlyVenueAdmin = isVenueAdmin && !isGlobalAdmin && adminCountries.length === 0;
  const hasAnyAdminRole = isGlobalAdmin || (user?.roles?.length || 0) > 0;
  
  const [activeTab, setActiveTab] = useState<AdminTab>(isOnlyVenueAdmin ? 'venue-dashboard' : 'stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [links, setLinks] = useState<PurchaseLink[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState<number | null>(null);
  const [filterLang, setFilterLang] = useState<string>('all');
  
  // Venue Admin State
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(venueRoles[0]?.target_id || null);
  const [venueStats, setVenueStats] = useState<VenueStats | null>(null);
  const [venuePromotions, setVenuePromotions] = useState<VenuePromotion[]>([]);
  const [venueTagsConfig, setVenueTagsConfig] = useState<VenueTagConfig | null>(null);
  const [isEditingVenueTags, setIsEditingVenueTags] = useState(false);
  const [isSavingVenueTags, setIsSavingVenueTags] = useState(false);
  const [allCategories, setAllCategories] = useState<FullTagCategory[]>([]);
  const [statsPeriod, setStatsPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [isEditingPromotion, setIsEditingPromotion] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<Partial<VenuePromotion>>({
    type: 'suggestion',
    title: '',
    content: '',
    start_date: new Date().toISOString().split('T')[0]
  });
  const [isSavingPromotion, setIsSavingPromotion] = useState(false);

  // Catalog Management State
  const [isEditingEquipment, setIsEditingEquipment] = useState(false);
  const [editingLang, setEditingLang] = useState('en');
  const [currentEquipment, setCurrentEquipment] = useState<Partial<Equipment>>({ 
    name: '', 
    category: 'brewer', 
    description: '', 
    imageUrl: '', 
    slug: '',
    translations: {
        en: { name: '', description: '' },
        'es-419': { name: '', description: '' },
        'pt-BR': { name: '', description: '' },
        ru: { name: '', description: '' },
        ka: { name: '', description: '' }
    }
  });
  const [isSavingEquipment, setIsSavingEquipment] = useState(false);
  const [newLinkInEquipment, setNewLinkInEquipment] = useState<Partial<PurchaseLink>>({ 
    description: '', 
    url: '', 
    countryCode: 'WW', 
    price: 0 
  });
  const [showAddLinkInEquipment, setShowAddLinkInEquipment] = useState(false);

  // Video Management State
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Partial<Video>>({ slug: '', title: '', description: '', language_code: 'en' });
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  // Link Management State
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [currentLink, setCurrentLink] = useState<Partial<PurchaseLink>>({ equipmentName: '', description: '', url: '', countryCode: 'WW', price: 0 });
  const [isSavingLink, setIsSavingLink] = useState(false);

  // User Management State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [venueSearch, setVenueSearch] = useState('');
  const [venueResults, setVenueResults] = useState<Venue[]>([]);
  const [isSearchingVenues, setIsSearchingVenues] = useState(false);

  // Short Links State
  const [shortLinksList, setShortLinksList] = useState<ShortLink[]>([]);
  const [shortLinkSearch, setShortLinkSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isAssigningVenue, setIsAssigningVenue] = useState(false);
  const [isAssigningBlock, setIsAssigningBlock] = useState(false);
  const [blockAssignment, setBlockAssignment] = useState({ start_code: '', end_code: '' });
  const [selectedShortLink, setSelectedShortLink] = useState<ShortLink | null>(null);
  const [isSavingShortLink, setIsSavingShortLink] = useState(false);
  const [customRedirectPath, setCustomRedirectPath] = useState('');

  // Venue Management State
  const [venuesList, setVenuesList] = useState<Venue[]>([]);
  const [isEditingVenue, setIsEditingVenue] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<Partial<Venue>>({ 
    name: '', latitude: 0, longitude: 0, address: '', city: '', country_code: adminCountries[0] || 'AR' 
  });
  const [isSavingVenue, setIsSavingVenue] = useState(false);

  useEffect(() => {
    if (isGuest || !hasAnyAdminRole) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('vidita_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const requests = [];
        
        // Global/Country Admin data
        if (needsGlobalData) {
            requests.push(fetch('/api/v1/admin/stats', { headers }));
            requests.push(fetch(`/api/v1/admin/videos${filterLang !== 'all' ? `?lang=${filterLang}` : ''}`, { headers }));
            requests.push(fetch('/api/v1/admin/links', { headers }));
            requests.push(fetch('/api/v1/admin/equipment', { headers }));
            requests.push(fetch('/api/v1/admin/users', { headers }));
            requests.push(fetch('/api/v1/admin/short-links', { headers }));
            requests.push(fetch('/api/v1/admin/venues', { headers }));
        }

        // Venue Admin data
        if (selectedVenueId) {
            requests.push(fetch(`/api/v1/venue-admin/stats?venue_id=${selectedVenueId}&period=${statsPeriod}`, { headers }));
            requests.push(fetch(`/api/v1/venue-admin/promotions?venue_id=${selectedVenueId}`, { headers }));
            requests.push(fetch(`/api/v1/admin/tags/venue/${selectedVenueId}`, { headers }));
            requests.push(fetch('/api/v1/admin/tags/all', { headers }));
        }

        const responses = await Promise.all(requests);
        let idx = 0;

        if (needsGlobalData) {
            const [statsRes, videosRes, linksRes, equipmentRes, usersRes, shortLinksRes, venuesRes] = responses.slice(0, 7);
            idx = 7;
            if (statsRes.ok) setStats(await statsRes.json());
            if (videosRes.ok) setVideos(await videosRes.json());
            if (linksRes.ok) setLinks(await linksRes.json());
            if (equipmentRes.ok) setEquipmentList(await equipmentRes.json());
            if (usersRes.ok) setUsersList(await usersRes.json());
            if (shortLinksRes.ok) setShortLinksList(await shortLinksRes.json());
            if (venuesRes.ok) setVenuesList(await venuesRes.json());

            if (!statsRes.ok) setErrorType(statsRes.status);
        }
        if (selectedVenueId) {
            const [vStatsRes, vPromsRes, vTagsRes, allTagsRes] = responses.slice(idx);
            if (vStatsRes.ok) setVenueStats(await vStatsRes.json());
            if (vPromsRes.ok) setVenuePromotions(await vPromsRes.json());
            if (vTagsRes.ok) setVenueTagsConfig(await vTagsRes.json());
            if (allTagsRes.ok) setAllCategories(await allTagsRes.json());
        }
        
      } catch (err) {
        console.error(err);
        setErrorType(500);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isGuest, user, router, filterLang, selectedVenueId, statsPeriod, needsGlobalData, hasAnyAdminRole]);

  const handleSearchUsers = async (q: string) => {
    setUserSearch(q);
    const token = localStorage.getItem('vidita_token');
    const res = await fetch(`/api/v1/admin/users?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
        const users = await res.json();
        setUsersList(users);
        if (selectedUser) {
            const updated = users.find((u: User) => u.id === selectedUser.id);
            if (updated) setSelectedUser(updated);
        }
    }
  };

  const handleAssignRole = async (userId: string, roleType: string, targetId?: string) => {
    const token = localStorage.getItem('vidita_token');
    const res = await fetch(`/api/v1/admin/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_type: roleType, target_id: targetId })
    });
    if (res.ok) {
      handleSearchUsers(userSearch); // Refresh list
      if (roleType === 'VENUE') {
        setVenueSearch('');
        setVenueResults([]);
      }
    }
  };

  const handleSearchVenues = async (q: string) => {
    setVenueSearch(q);
    if (q.length < 2) {
        setVenueResults([]);
        return;
    }
    setIsSearchingVenues(true);
    try {
        const token = localStorage.getItem('vidita_token');
        const res = await fetch(`/api/v1/admin/venues/search?q=${encodeURIComponent(q)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const venues = await res.json();
            setVenueResults(venues);
        }
    } finally {
        setIsSearchingVenues(false);
    }
  };

  const handleRevokeRole = async (roleId: string) => {
    const token = localStorage.getItem('vidita_token');
    const res = await fetch(`/api/v1/admin/users/roles/${roleId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      handleSearchUsers(userSearch); // Refresh list
    }
  };

  const handleSavePromotion = async () => {
    if (!selectedVenueId) return;
    setIsSavingPromotion(true);
    try {
      const token = localStorage.getItem('vidita_token');
      const payload = { ...currentPromotion, venue_id: selectedVenueId };

      const res = await fetch('/api/v1/venue-admin/promotions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const promsRes = await fetch(`/api/v1/venue-admin/promotions?venue_id=${selectedVenueId}`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (promsRes.ok) setVenuePromotions(await promsRes.json());
        setIsEditingPromotion(false);
        setCurrentPromotion({
          type: 'suggestion',
          title: '',
          content: '',
          start_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to save promotion');
    } finally { 
      setIsSavingPromotion(false); 
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/venue-admin/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setVenuePromotions(venuePromotions.filter(p => p.id !== id));
      }
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleShortLinkScan = async (code: string) => {
    setShowScanner(false);
    setScannedCode(code);
    
    const existing = shortLinksList.find(sl => sl.code === code);
    if (existing) {
        setSelectedShortLink(existing);
    } else {
        setSelectedShortLink({ id: 'new', code, target_path: '/', description: '', created_at: '' });
    }
    setIsAssigningVenue(true);
  };

  const handleAssignShortLinkToVenue = async (venue: Venue) => {
    if (!selectedShortLink) return;
    
    setIsSavingShortLink(true);
    try {
        const token = localStorage.getItem('vidita_token');
        const updatedLink = {
            ...selectedShortLink,
            target_path: `/checkin?venue_id=${venue.id}`,
            description: `Check-in for ${venue.name}`
        };

        const res = await fetch(`/api/v1/admin/short-links/${selectedShortLink.id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedLink)
        });

        if (res.ok) {
            const refreshRes = await fetch('/api/v1/admin/short-links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (refreshRes.ok) setShortLinksList(await refreshRes.json());
            
            setIsAssigningVenue(false);
            setSelectedShortLink(null);
            setScannedCode(null);
            setVenueSearch('');
            setVenueResults([]);
            setCustomRedirectPath('');
        }
    } finally {
        setIsSavingShortLink(false);
    }
  };

  const handleAssignShortLinkToPath = async () => {
    if (!selectedShortLink || !customRedirectPath) return;
    
    setIsSavingShortLink(true);
    try {
        const token = localStorage.getItem('vidita_token');
        const updatedLink = {
            ...selectedShortLink,
            target_path: customRedirectPath.startsWith('/') ? customRedirectPath : `/${customRedirectPath}`,
            description: `Redirect to ${customRedirectPath}`
        };

        const res = await fetch(`/api/v1/admin/short-links/${selectedShortLink.id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedLink)
        });

        if (res.ok) {
            const refreshRes = await fetch('/api/v1/admin/short-links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (refreshRes.ok) setShortLinksList(await refreshRes.json());
            
            setIsAssigningVenue(false);
            setSelectedShortLink(null);
            setScannedCode(null);
            setVenueSearch('');
            setVenueResults([]);
            setCustomRedirectPath('');
        }
    } finally {
        setIsSavingShortLink(false);
    }
  };

  const handleAssignBlockToVenue = async (venue: Venue) => {
    if (!blockAssignment.start_code || !blockAssignment.end_code) return;
    
    setIsSavingShortLink(true);
    try {
        const token = localStorage.getItem('vidita_token');
        const res = await fetch('/api/v1/admin/short-links/assign-block', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...blockAssignment,
                target_path: `/checkin?venue_id=${venue.id}`,
                description: `Check-in for ${venue.name}`
            })
        });

        if (res.ok) {
            const refreshRes = await fetch('/api/v1/admin/short-links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (refreshRes.ok) setShortLinksList(await refreshRes.json());
            
            setIsAssigningBlock(false);
            setBlockAssignment({ start_code: '', end_code: '' });
            setVenueSearch('');
            setVenueResults([]);
            setCustomRedirectPath('');
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to assign block');
        }
    } finally {
        setIsSavingShortLink(false);
    }
  };

  const handleAssignBlockToPath = async () => {
    if (!blockAssignment.start_code || !blockAssignment.end_code || !customRedirectPath) return;
    
    setIsSavingShortLink(true);
    try {
        const token = localStorage.getItem('vidita_token');
        const res = await fetch('/api/v1/admin/short-links/assign-block', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...blockAssignment,
                target_path: customRedirectPath.startsWith('/') ? customRedirectPath : `/${customRedirectPath}`,
                description: `Redirect to ${customRedirectPath}`
            })
        });

        if (res.ok) {
            const refreshRes = await fetch('/api/v1/admin/short-links', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (refreshRes.ok) setShortLinksList(await refreshRes.json());
            
            setIsAssigningBlock(false);
            setBlockAssignment({ start_code: '', end_code: '' });
            setVenueSearch('');
            setVenueResults([]);
            setCustomRedirectPath('');
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to assign block');
        }
    } finally {
        setIsSavingShortLink(false);
    }
  };

  const handleSaveVenueTags = async () => {
    if (!selectedVenueId || !venueTagsConfig) return;
    setIsSavingVenueTags(true);
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/admin/tags/venue/${selectedVenueId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(venueTagsConfig.tags)
      });

      if (res.ok) {
        setIsEditingVenueTags(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingVenueTags(false);
    }
  };

  const handleResetVenueTags = async () => {
    if (!selectedVenueId) return;
    if (!confirm((t as any).reset_to_default + "?")) return;
    
    setIsSavingVenueTags(true);
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/admin/tags/venue/${selectedVenueId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([])
      });

      if (res.ok) {
        const refreshRes = await fetch(`/api/v1/admin/tags/venue/${selectedVenueId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (refreshRes.ok) {
          setVenueTagsConfig(await refreshRes.json());
        }
        setIsEditingVenueTags(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingVenueTags(false);
    }
  };

  const handleImpersonate = async (u: User) => {
    if (!isGlobalAdmin) return;
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/admin/users/${u.id}/impersonate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        startImpersonating(data.user, data.token);
        router.push('/');
      } else {
        alert('Impersonation failed: ' + res.status);
      }
    } catch (err) {
      console.error(err);
      alert('Impersonation failed: Network error');
    }
  };

  const handleSaveEquipment = async () => {
    if (!currentEquipment.name?.trim() || !currentEquipment.slug?.trim() || !currentEquipment.category?.trim()) {
      alert('Please fill in Internal ID, Slug, and Category.');
      return;
    }

    setIsSavingEquipment(true);
    try {
      const token = localStorage.getItem('vidita_token');
      const method = currentEquipment.id ? 'PUT' : 'POST';
      const url = currentEquipment.id ? `/api/v1/admin/equipment/${currentEquipment.id}` : '/api/v1/admin/equipment';
      
      const payload = { 
        ...currentEquipment, 
        purchaseLinks: showAddLinkInEquipment && newLinkInEquipment.url 
          ? [newLinkInEquipment] 
          : [] 
      };

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const eqRes = await fetch('/api/v1/admin/equipment', { headers: { 'Authorization': `Bearer ${token}` } });
        if (eqRes.ok) setEquipmentList(await eqRes.json());
        
        const linksRes = await fetch('/api/v1/admin/links', { headers: { 'Authorization': `Bearer ${token}` } });
        if (linksRes.ok) setLinks(await linksRes.json());

        setIsEditingEquipment(false);
        setShowAddLinkInEquipment(false);
        setNewLinkInEquipment({ description: '', url: '', countryCode: 'WW', price: 0 });
      }
    } catch (err) { 
      console.error(err);
    } finally { setIsSavingEquipment(false); }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Delete this item from catalog?')) return;
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/equipment/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setEquipmentList(equipmentList.filter((e: Equipment) => e.id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/admin/videos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setVideos(videos.filter((v: Video) => v.id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  const handleSaveVideo = async () => {
    setIsSavingVideo(true);
    try {
      const token = localStorage.getItem('vidita_token');
      const method = currentVideo.id ? 'PUT' : 'POST';
      const url = currentVideo.id ? `/api/v1/admin/videos/${currentVideo.id}` : '/api/v1/admin/videos';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(currentVideo)
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (currentVideo.id) {
          setVideos(videos.map((v: Video) => v.id === saved.id ? saved : v));
        } else {
          setVideos([...videos, saved]);
        }
        setIsEditingVideo(false);
      }
    } catch (err) { alert('Save failed'); }
    finally { setIsSavingVideo(false); }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Delete this affiliate link?')) return;
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/admin/links/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setLinks(links.filter((l: PurchaseLink) => l.id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  const handleSaveLink = async () => {
    if (!isCountryAdmin(currentLink.countryCode || 'WW')) {
      alert('No permission for this country.');
      return;
    }
    setIsSavingLink(true);
    try {
      const token = localStorage.getItem('vidita_token');
      const method = currentLink.id ? 'PUT' : 'POST';
      const url = currentLink.id ? `/api/v1/admin/links/${currentLink.id}` : '/api/v1/admin/links';
      
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(currentLink)
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (currentLink.id) {
          setLinks(links.map((l: PurchaseLink) => l.id === saved.id ? saved : l));
        } else {
          setLinks([...links, saved]);
        }
        setIsEditingLink(false);
      }
    } catch (err) { alert('Save failed'); }
    finally { setIsSavingLink(false); }
  };

  const handleSaveVenue = async () => {
    if (!isCountryAdmin(currentVenue.country_code || 'WW')) {
      alert('No permission for this country.');
      return;
    }
    setIsSavingVenue(true);
    try {
      const token = localStorage.getItem('vidita_token');
      const method = currentVenue.id ? 'PUT' : 'POST';
      const url = currentVenue.id ? `/api/v1/admin/venues/${currentVenue.id}` : '/api/v1/admin/venues';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(currentVenue)
      });

      if (res.ok) {
        const saved = await res.json();
        if (currentVenue.id) {
          setVenuesList(venuesList.map((v: Venue) => v.id === saved.id ? saved : v));
        } else {
          setVenuesList([saved, ...venuesList]);
        }
        setIsEditingVenue(false);
      }
    } catch (err) { alert('Save failed'); }
    finally { setIsSavingVenue(false); }
  };

  const handleDeleteVenue = async (id: string) => {
    if (!confirm('Delete this venue?')) return;
    try {
      const token = localStorage.getItem('vidita_token');
      const res = await fetch(`/api/v1/admin/venues/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setVenuesList(venuesList.filter((v: Venue) => v.id !== id));
    } catch (err) { alert('Delete failed'); }
  };

  const filteredVideos = filterLang === 'all' ? videos : videos.filter(v => v.language_code === filterLang);
  const filteredShortLinks = shortLinksList.filter(sl => 
    sl.code.toLowerCase().includes(shortLinkSearch.toLowerCase()) ||
    sl.target_path.toLowerCase().includes(shortLinkSearch.toLowerCase()) ||
    sl.description.toLowerCase().includes(shortLinkSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-coffee" size={32} />
        <p className="text-stone-500 font-bold animate-pulse">{t.authenticating}</p>
      </div>
    );
  }

  if (errorType || (!isOnlyVenueAdmin && !stats)) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-full">
          <AlertCircle className="text-red-600" size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">{t.login_failed}</h2>
          <p className="text-stone-500 max-w-xs mx-auto">Access denied or session expired.</p>
        </div>
        <button onClick={() => router.push('/')} className="bg-stone-900 text-white px-8 py-4 rounded-3xl font-black shadow-xl active:scale-95 transition-transform">{t.back_to_safety}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 pb-32 text-stone-900 dark:text-stone-100">
      <header className="flex items-center space-x-4 mb-8">
        <button onClick={() => router.back()} className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm text-stone-500 active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <h1 className="text-3xl font-black">{t.admin_dashboard}</h1>
      </header>

      <div className="bg-stone-200 dark:bg-stone-900 p-1 rounded-2xl flex mb-12 overflow-x-auto no-scrollbar">
        {needsGlobalData && (
          <>
            <button onClick={() => setActiveTab('stats')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'stats' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <BarChart3 size={16} className="mr-2" /> {t.admin_stats}
            </button>
            <button onClick={() => setActiveTab('catalog')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'catalog' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <Library size={16} className="mr-2" /> {t.admin_catalog}
            </button>
            <button onClick={() => setActiveTab('links')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'links' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <LinkIcon size={16} className="mr-2" /> {t.admin_links}
            </button>
            <button onClick={() => setActiveTab('videos')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'videos' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <PlayCircle size={16} className="mr-2" /> {t.admin_videos}
            </button>
            <button onClick={() => setActiveTab('users')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'users' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <Users size={16} className="mr-2" /> {t.admin_users}
            </button>
            <button onClick={() => setActiveTab('short-links')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'short-links' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <Globe size={16} className="mr-2" /> {t.admin_short_links}
            </button>
            <button onClick={() => setActiveTab('tags')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'tags' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <TagIcon size={16} className="mr-2" /> Tags
            </button>
            <button onClick={() => setActiveTab('venues')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'venues' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
              <MapPin size={16} className="mr-2" /> {(t as any).admin_venues || 'Venues'}
            </button>
          </>
        )}
        {isVenueAdmin && (
          <button onClick={() => setActiveTab('venue-dashboard')} className={cn("flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap", activeTab === 'venue-dashboard' ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300")}>
            <MapPin size={16} className="mr-2" /> {t.venue_dashboard}
          </button>
        )}
      </div>

      <div className="space-y-12">
        {activeTab === 'stats' && stats && <GlobalStats stats={stats} t={t} />}
        {activeTab === 'catalog' && (
          <EquipmentCatalog
            equipmentList={equipmentList}
            setCurrentEquipment={setCurrentEquipment}
            setIsEditingEquipment={setIsEditingEquipment}
            handleDeleteEquipment={handleDeleteEquipment}
            t={t}
          />
        )}
        {activeTab === 'links' && (
          <LinksManagement
            links={links}
            isGlobalAdmin={isGlobalAdmin as boolean}
            adminCountries={adminCountries}
            equipmentList={equipmentList}
            isCountryAdmin={isCountryAdmin}
            setCurrentLink={setCurrentLink}
            setIsEditingLink={setIsEditingLink}
            handleDeleteLink={handleDeleteLink}
            t={t}
          />
        )}
        {activeTab === 'videos' && (
          <VideosManagement
            filterLang={filterLang}
            setFilterLang={setFilterLang}
            filteredVideos={filteredVideos}
            setCurrentVideo={setCurrentVideo}
            setIsEditingVideo={setIsEditingVideo}
            handleDeleteVideo={handleDeleteVideo}
            t={t}
          />
        )}
        {activeTab === 'users' && (
          <UserManagement
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            handleSearchUsers={handleSearchUsers}
            usersList={usersList}
            isGlobalAdmin={isGlobalAdmin as boolean}
            adminCountries={adminCountries}
            handleImpersonate={handleImpersonate}
            setSelectedUser={setSelectedUser}
            setIsManagingRoles={setIsManagingRoles}
            t={t}
          />
        )}
        {activeTab === 'short-links' && (
          <ShortLinksManagement
            shortLinkSearch={shortLinkSearch}
            setShortLinkSearch={setShortLinkSearch}
            filteredShortLinks={filteredShortLinks}
            setIsAssigningBlock={setIsAssigningBlock}
            setShowScanner={setShowScanner}
            setSelectedShortLink={setSelectedShortLink}
            setIsAssigningVenue={setIsAssigningVenue}
            t={t}
          />
        )}
        {activeTab === 'venues' && (
          <VenuesManagement
            venuesList={venuesList}
            adminCountries={adminCountries}
            setCurrentVenue={setCurrentVenue}
            setIsEditingVenue={setIsEditingVenue}
            handleDeleteVenue={handleDeleteVenue}
            COUNTRIES={COUNTRIES}
            t={t}
          />
        )}
        {activeTab === 'venue-dashboard' && selectedVenueId && (
          <VenueDashboard
            venueRoles={venueRoles}
            selectedVenueId={selectedVenueId}
            setSelectedVenueId={setSelectedVenueId}
            statsPeriod={statsPeriod}
            setStatsPeriod={setStatsPeriod}
            venueStats={venueStats}
            venuePromotions={venuePromotions}
            venueTagsConfig={venueTagsConfig}
            setVenueTagsConfig={setVenueTagsConfig}
            allCategories={allCategories}
            lang={lang}
            t={t}
            isEditingVenueTags={isEditingVenueTags}
            setIsEditingVenueTags={setIsEditingVenueTags}
            isSavingVenueTags={isSavingVenueTags}
            handleSaveVenueTags={handleSaveVenueTags}
            handleResetVenueTags={handleResetVenueTags}
            setIsEditingPromotion={setIsEditingPromotion}
            setCurrentPromotion={setCurrentPromotion}
            handleDeletePromotion={handleDeletePromotion}
            setAllCategories={setAllCategories}
          />
        )}
        {activeTab === 'tags' && <TagsManager />}
      </div>

      {isManagingRoles && selectedUser && (
        <RoleManagementModal
            selectedUser={selectedUser}
            onClose={() => setIsManagingRoles(false)}
            handleRevokeRole={handleRevokeRole}
            handleAssignRole={handleAssignRole}
            venueSearch={venueSearch}
            handleSearchVenues={handleSearchVenues}
            isSearchingVenues={isSearchingVenues}
            venueResults={venueResults}
            isGlobalAdmin={isGlobalAdmin as boolean}
            t={t}
        />
      )}

      {isEditingVenue && (
        <VenueEditorModal
            currentVenue={currentVenue}
            setCurrentVenue={setCurrentVenue}
            onClose={() => setIsEditingVenue(false)}
            isSavingVenue={isSavingVenue}
            handleSaveVenue={handleSaveVenue}
            adminCountries={adminCountries}
            t={t}
        />
      )}

      {showScanner && (
        <QRScanner 
          onScan={handleShortLinkScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {isAssigningVenue && selectedShortLink && (
        <ShortLinkAssignmentModal
            selectedShortLink={selectedShortLink}
            onClose={() => { setIsAssigningVenue(false); setSelectedShortLink(null); setCustomRedirectPath(''); }}
            venueSearch={venueSearch}
            handleSearchVenues={handleSearchVenues}
            isSearchingVenues={isSearchingVenues}
            venueResults={venueResults}
            isSavingShortLink={isSavingShortLink}
            handleAssignShortLinkToVenue={handleAssignShortLinkToVenue}
            customRedirectPath={customRedirectPath}
            setCustomRedirectPath={setCustomRedirectPath}
            handleAssignShortLinkToPath={handleAssignShortLinkToPath}
            t={t}
        />
      )}

      {isAssigningBlock && (
        <ShortLinkBlockAssignmentModal
            onClose={() => { setIsAssigningBlock(false); setBlockAssignment({ start_code: '', end_code: '' }); setCustomRedirectPath(''); }}
            blockAssignment={blockAssignment}
            setBlockAssignment={setBlockAssignment}
            venueSearch={venueSearch}
            handleSearchVenues={handleSearchVenues}
            isSearchingVenues={isSearchingVenues}
            venueResults={venueResults}
            isSavingShortLink={isSavingShortLink}
            handleAssignBlockToVenue={handleAssignBlockToVenue}
            customRedirectPath={customRedirectPath}
            setCustomRedirectPath={setCustomRedirectPath}
            handleAssignBlockToPath={handleAssignBlockToPath}
            t={t}
        />
      )}

      {isEditingEquipment && (
        <EquipmentEditorModal
            currentEquipment={currentEquipment}
            setCurrentEquipment={setCurrentEquipment}
            onClose={() => { setIsEditingEquipment(false); setShowAddLinkInEquipment(false); }}
            isSavingEquipment={isSavingEquipment}
            handleSaveEquipment={handleSaveEquipment}
            editingLang={editingLang}
            setEditingLang={setEditingLang}
            showAddLinkInEquipment={showAddLinkInEquipment}
            setShowAddLinkInEquipment={setShowAddLinkInEquipment}
            newLinkInEquipment={newLinkInEquipment}
            setNewLinkInEquipment={setNewLinkInEquipment}
            t={t}
        />
      )}

      {isEditingLink && (
        <LinkEditorModal
            currentLink={currentLink}
            setCurrentLink={setCurrentLink}
            onClose={() => setIsEditingLink(false)}
            isSavingLink={isSavingLink}
            handleSaveLink={handleSaveLink}
            equipmentList={equipmentList}
            t={t}
        />
      )}

      {isEditingVideo && (
        <VideoEditorModal
            currentVideo={currentVideo}
            setCurrentVideo={setCurrentVideo}
            onClose={() => setIsEditingVideo(false)}
            isSavingVideo={isSavingVideo}
            handleSaveVideo={handleSaveVideo}
            t={t}
        />
      )}

      {isEditingPromotion && (
        <PromotionEditorModal
            currentPromotion={currentPromotion}
            setCurrentPromotion={setCurrentPromotion}
            onClose={() => setIsEditingPromotion(false)}
            isSavingPromotion={isSavingPromotion}
            handleSavePromotion={handleSavePromotion}
            t={t}
        />
      )}
    </div>
  );
}
