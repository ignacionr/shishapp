# Business Decisions

This file tracks the key business decisions for Vidita Cafe.

## Current Focus
- Focusing on Web PWA as the primary platform.
- Planning the Web and C++ Backend expansion.
- Establishing a monorepo for better ecosystem management.

## Architectural Decisions

- **Dependency Management:** Use Nix exclusively for C++ and web dependencies, avoiding redundant package managers like Conan or vcpkg.
- **Web Serving Strategy:** Use Next.js Static Export served directly by the C++ (Drogon) backend.
- **Caching & URL Structure:** Maintain strict URL boundaries:
    - `index.html` and `/*.html`: `no-cache, no-store, must-revalidate` (Ensure latest code version).
    - `/_next/static/` and `/static/`: Cache for 1 year (Priority 2, versioned assets).
    - `/api/v1/methods`, `/api/v1/equipment`: Cache for 1 hour at the Edge (Priority 1, surgical).
    - `/api/v1/auth/*`, `/api/v1/journal/*`: Explicitly bypass cache (Priority 0).
- **Asset Hosting:** Migrated core equipment images from external sources to local hosting within the backend's static directory to ensure long-term availability and performance.
- **API Flexibility:** Implemented alias routes (e.g., `/api/v1/methods`) for public endpoints to provide a more intuitive and concise developer experience.
- **Build Infrastructure:** Native builds on the target server are required to resolve `glibc` compatibility issues when using Nix-built binaries on non-NixOS Linux distributions.
- **Security:** Public ports are closed via UFW (except SSH); all application traffic is routed through a secure, outbound-only Cloudflare Tunnel.
- **Progressive Interaction:** Users must be able to interact with all non-personalized content (Brewing Methods, Equipment Metadata, Public Feed) without logging in. Authentication is only required for persistent data (Journal, Presets, Owned Equipment synchronization).
- **Context Inference:** Until a user logs in, their `country` and `language` will be inferred via GeoIP (provided by Cloudflare headers or Backend lookup). This ensures a localized experience (e.g., purchase links, units) without friction.
- **Social Auth Integration:** Adopt a "Token Exchange" flow for Google and Apple login.
    - **Frontend:** Handles the social handshake and receives an `id_token`.
    - **Backend:** Receives the `id_token`, verifies it against Google/Apple's public keys, and issues a native Vidita Cafe JWT for session management.
- **PWA Transition:** The web application is implemented as a Progressive Web App (PWA) to provide a mobile-native experience (Home Screen installation, splash screens, and basic offline persistence). This is critical for the "coffee shop" use case where connectivity might be intermittent.

---

## Monetization & Growth Strategy

- **Barbell Strategy for Inventory:** Use affiliate links to validate product demand. Transition to direct inventory only for high-converting items to maximize margin while minimizing capital risk.
- **B2B2C Acquisition Loop:** Utilize physical QR codes in coffee shops as the primary user acquisition channel.
- **Value-First QR Links:** QR codes must deep-link to a pre-populated journal entry with specific bean data (tasting notes, origin) to provide instant utility and reduce friction.
- **Gamified Partner Incentives:** Reward coffee shops with premium search placement and feed visibility based on the volume of journal entries (check-ins) they generate.
- **MRR via Consumables:** Leverage journal data (brewing frequency) to predictively notify users to restock consumables (filters, beans).
