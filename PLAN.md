# MyShisha.vip - Adaptation Plan

This document outlines the transformation of the Vidita Cafe PWA into **MyShisha.vip**, a dedicated platform for shisha lovers.

## 1. Brand & Metadata
- [ ] **Project Rename**: Update all instances of "Vidita Cafe" to "MyShisha.vip" in `package.json`, `README.md`, and code comments.
- [ ] **PWA Manifest**: Update `web/public/manifest.json` with new name, short_name, and icons.
- [ ] **Icons & Logos**: Replace coffee-related icons in `web/public/static/images` and `web/public/favicon.ico`.
- [ ] **Color Palette**: Shift from coffee browns to a shisha-appropriate theme (e.g., Deep Blue/Purple for smoke or Charcoal Grey/Amber).

## 2. Terminology & Content (The "Shisha-fication")
- [ ] **Translations**: Systematic replacement in `web/src/translations/index.ts`:
    - "Brewing" -> "Session Setup"
    - "Coffee" -> "Shisha"
    - "Beans/Roast" -> "Tobacco/Flavor"
    - "Roaster" -> "Brand"
    - "Coffee Shop" -> "Shisha Lounge"
    - "Cup" -> "Session"
- [ ] **Video Feed**: Replace coffee brewing tutorials with shisha packing and heat management guides.
- [ ] **Legal**: Update `web/src/translations/legal.ts` to reflect shisha context (and include necessary health warnings if applicable).

## 3. Core Module Adaptations

### 3.1. Session Journal (formerly Journey)
- [ ] **Fields**: Adapt the journal to capture:
    - Tobacco Brand & Flavor.
    - Bowl Type (Phunnel, Vortex, Egyptian).
    - Packing Style (Fluffy, Dense, Semi-dense).
    - Liquid in base (Water, Milk, Juice).
    - Heat Management (HMD, Foil, Charcoal type/count).
- [ ] **Sensory Profile**: Change "Acidity/Body" to "Cloud Density/Smoothness/Flavor Intensity".

### 3.2. Setup Guide & Timer (formerly Brewing)
- [ ] **Calculators**: Adapt for:
    - Water level recommendations based on hookah size.
    - Charcoal heat-up timer.
    - Session duration tracker.
- [ ] **Step-by-Step**: Create guides for different packing techniques.

### 3.3. Equipment Inventory
- [ ] **Categories**: Replace coffee gear with:
    - Hookahs (Stems).
    - Bowls.
    - HMDs (Heat Management Devices).
    - Charcoal.
    - Hoses & Accessories.

### 3.4. Search (Lounge Discovery)
- [ ] **Venues**: Update search filters to focus on "Shisha Lounges" and "Tobacco Shops".

## 4. Backend & Database
- [ ] **Migrations**: Update seed data in `backend/migrations` to provide shisha equipment and methods by default.
- [ ] **API**: Ensure all endpoints (e.g., `/brewing` -> `/sessions`) are renamed or aliased if necessary for domain consistency.

## 5. Deployment & Safety
- [ ] **CI/CD**: (Completed) Removed original Vidita Cafe workflows to prevent accidental deployments.
- [ ] **Infrastructure**: Set up new endpoints and database instance specifically for MyShisha.vip.
