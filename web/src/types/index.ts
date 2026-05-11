export type FeedItemType = 'insight' | 'video' | 'suggestion' | 'quiz' | 'native_video';

export interface FeedCard {
  id: string;
  type: FeedItemType;
  title: string;
  content: string;
  metadata?: string;
  media?: string;
  destination?: string;
}

export interface UserMastery {
  total_score: number;
  current_level: number;
  journal_count: number;
  method_count: number;
  venue_count: number;
  precision_count: number;
  last_updated: string;
}

export interface UserRole {
  id: string;
  role_type: 'GLOBAL' | 'COUNTRY' | 'VENUE';
  target_id?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  country: string;
  language: string;
  is_admin?: boolean;
  created_at?: string;
  mastery?: UserMastery;
  roles?: UserRole[];
}

export interface JournalEntry {
  id: string;
  user_id?: string;
  date: number;
  coffee_name: string;
  brewing_method?: string;
  location: string;
  location_type?: 'home' | 'shop';
  venue?: string;
  venue_id?: string;
  rating: number;
  tags: string[];
  is_synced?: boolean;
}

export interface PurchaseLink {
  id: string;
  equipmentName: string;
  description: string;
  url: string;
  countryCode: string;
  price: number;
}

export interface TranslationEntry {
  name: string;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  internal_name: string;
  slug: string;
  category: string;
  description: string;
  isOwned: boolean;
  imageUrl?: string;
  purchaseLinks?: PurchaseLink[];
  translations?: Record<string, TranslationEntry>;
}

export interface BrewingStep {
  id: string;
  order_index: number;
  duration: number; // seconds
  target_water?: number;
  target_temp?: number;
  instruction: string;
}

export interface BrewingMethod {
  id: string;
  name?: string; // name is optional as backend uses displayName
  displayName: string;
  description: string;
  requiredEquipment: string[];
  optionalEquipment: string[];
  consumables: string[];
  steps?: BrewingStep[];
}

export interface BrewingPreset {
  id: string;
  user_id?: string;
  name: string;
  method_id: string;
  coffee_dose: number;
  water_yield: number;
  ratio?: number;
  temperature: number;
  grind_size: string;
  created_at?: number;
}

export interface Video {
  id: string;
  slug: string;
  title: string;
  description: string;
  language_code: string;
}

export interface ShortLink {
  id: string;
  code: string;
  target_path: string;
  description: string;
  created_at: string;
}

export interface Venue {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  tags: string[];
  address: string;
  city: string;
  country_code: string;
  created_at?: string;
}

export interface VenuePromotion {
  id: string;
  venue_id: string;
  type: string;
  title: string;
  content: string;
  image_url?: string;
  youtube_id?: string;
  start_date: string;
  end_date?: string;
}

export interface Tag {
  id: string;
  name: string;
  display_name: string;
  display_order: number;
}

export interface TagCategory {
  id: string;
  name: string;
  display_name: string;
  display_order: number;
  tags: Tag[];
}

export interface FullTag {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  translations: Record<string, string>;
}

export interface FullTagCategory {
  id: string;
  name: string;
  display_order: number;
  translations: Record<string, string>;
  tags: FullTag[];
}

export interface ContextTagSelection {
  tag_id: string;
  display_order: number;
}

export interface VenueTagConfig {
  venue_id: string;
  tags: ContextTagSelection[]; // Overrides
  inherited_tags: ContextTagSelection[];
}

export interface StatEntry {
  name: string;
  count: number;
  average_rating?: number;
}

export interface UserBasic {
  id: string;
  name: string;
  email: string;
  country: string;
  created_at: string;
}

export interface VenueStats {
  checkins_count: number;
  average_rating: number;
  tags_cloud: StatEntry[];
  checkins_over_time: StatEntry[];
  rating_over_time: StatEntry[];
}

export interface AdminStats {
  total_users: number;
  total_journals: number;
  total_presets: number;
  popular_coffee: StatEntry[];
  popular_methods: StatEntry[];
  popular_venues: StatEntry[];
  users_by_country: StatEntry[];
  recent_users: UserBasic[];
}
