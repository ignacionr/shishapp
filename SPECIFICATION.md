# Vidita Cafe - Functional Specification

## 1. Project Overview
Vidita Cafe is a coffee discovery and journaling application designed to guide users through their coffee journey. It combines educational content, inventory management, a brewing parameter calculator, a sensory journal, and a curated directory of specialty coffee shops and roasters.

---

## 2. Navigation Architecture
The app uses a 5-tab bottom navigation structure with a central Navigation Manager for programmatic tab switching.

1.  **Home (Discovery Feed)**: Dynamic, infinite vertical feed.
2.  **Journey**: Sensory journal and experience history.
3.  **Brewing**: Parameter calculator, preset management, and real-time timer.
4.  **Equipment**: Inventory tracking and purchasing gear.
5.  **Search**: Directory of featured coffee shops and roasters, with keyword search.

---

## 3. Core Modules

### 3.1. Discovery Feed (Home)
*   **Interaction**: Full-screen vertical paging (snap-to-page).
*   **Onboarding Hint**: On first load, the feed performs a subtle "bounce" twice to signify vertical scrollability.
*   **PWA Onboarding**: If the app is not installed, a high-impact "Install Now" card is prepended. 
*   **Dynamic Content Engine**: Interleaves polymorphic cards from the database and local logic:
    *   **Insight Cards**: Personalized stats or a Welcome message.
    *   **Video Cards**: YouTube thumbnails with in-place autoplay.
    *   **Monetization / Suggestion Cards**: Personalized gear recommendations based on missing items:
        *   **Precision Pouring**: Suggested if the user lacks a gooseneck kettle.
        *   **Level Up Your Accuracy**: Suggested if the user lacks a digital scale.
        *   **Explore New Horizons**: Suggested when a user is exactly one brewer away from unlocking a new method.

### 3.2. Journey (Journal)
*   **Full CRUD**: Users can Create, View, Edit, and Delete their coffee experiences.
*   **Offline-First Strategy**: Optimistic UI with Background Sync and Atomic Sync Guarding.

### 3.3. Brewing Dashboard & Real-time Timer
*   **Categorization**:
    *   **Ready to Brew**: Methods where the user owns all required gear.
    *   **Other Methods**: Missing required gear; offers direct links to add or buy missing items.
*   **Availability Logic (Monetization)**: 
    *   **Optional Kettles**: Kettles are treated as "Optional" for availability checks. They do not block a method from appearing in "Ready to Brew", encouraging users to start brewing and then upgrade.
    *   **Direct Gear Links**: Blocked methods display exactly what is missing with deep-links to the catalog.
*   **Interactive Calculator**: Real-time ratio and instruction scaling.
*   **Immersive Timer**: Full-screen mode with circular progress, countdowns, and haptic feedback.

### 3.4. Equipment Inventory
*   **Deep-Linking**: Supports direct navigation to specific items via URL slugs (e.g., `/equipment?item=v60`).
*   **Affiliate Integration**: Equipment details feature localized purchase links tailored to the user's inferred or selected country.

### 3.5. Search — Coffee Shops & Roasters Discovery
The primary purpose of the Search tab is to **feature our partner coffee shops and roasters**, giving them visibility among engaged coffee enthusiasts.

*   **Primary Content**:
    *   **Featured Coffee Shops**: Curated partner cafés displayed as rich cards with name, location, photos, a short description, and a link to their profile or website.
    *   **Featured Roasters**: Specialty roasters with origin story, bean offerings, and purchase links.
*   **Proximity Search**: Users can search for nearby shops using GPS coordinates, returning results sorted by distance.
*   **Keyword Search**: Users can search by name, city, or style to filter the directory.
*   **Recent Searches**: Persisted locally so users can quickly return to previous queries.
*   **Localization**: Results are ranked by relevance to the user's inferred or selected country.
*   **Partner Onboarding**: The admin CMS (see §4) allows adding and managing featured shop/roaster listings.

### 3.6. Push Notifications (Planned)
*   **Unified Delivery**: Leverages Firebase Cloud Messaging (FCM) to reach users across all supported browsers and platforms.
*   **Engagement Triggers**: Notifications are intended for:
    *   **God Shot Alerts**: Notifications when a friend records a "God Shot".
    *   **New Content**: Alerts for new video guides or discovery content.
    *   **Brewing Reminders**: Encouragement to log experiences if inactive for a period.

---

## 4. Administration & Insights
Authorized administrators can access the **Admin Dashboard** for real-time stats, user growth analytics, content management (CMS) for the video feed, and management of featured coffee shop and roaster listings.

### 4.1. Role-Based Access Control (RBAC)
The system supports granular permissions based on roles:
*   **GLOBAL**: Full access to all administrative functions and stats across all countries.
*   **COUNTRY**: Access to stats and venue management for a specific country. Authorized to assign short-link blocks.
*   **VENUE**: Access to stats and promotion management for specific coffee shops.

---

## 5. Technical Requirements

### 5.1. User Country & Language
*   **Country Inference**: Inferred via `CF-IPCountry` **only for new user registrations**. Existing users always retain their manually selected or previously inferred country.
*   **Language Detection**: identified via `X-Vidita-Language` header or user profile.

### 5.2. PWA & Service Worker
*   **Aggressive Updates**: Service Worker (v3) uses `skipWaiting` and `clients.claim` for instant activation and auto-reload on update.
