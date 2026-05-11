# Vidita Cafe

The "Vidita Cafe" ecosystem for augmenting the coffee journey. A unified platform for coffee discovery, journaling, and brewing mastery.

## Features
- **Web PWA**: Fully implemented with Next.js, TypeScript, and Tailwind CSS. Features a paging discovery feed, equipment management, and offline-first journal.
- **High Performance Backend**: C++ server using Drogon and PostgreSQL, capable of serving the static frontend and high-speed API requests.
- **Discovery Engine**: Vertical video feed and personalized gear suggestions.
- **Brewing mastery**: Real-time timer and ratio calculator for multiple methods.
- **Social & B2B**: Coffee shop directory and QR-code-based check-in system for partners.

## Project Structure
- `backend/`: High-performance C++ API server (Drogon, Glaze, PostgreSQL).
- `web/`: Next.js PWA frontend.
- `business/`: Strategic documentation, business models, and feature plans.

## Quick Start
1. **Backend**: Navigate to `backend/`, run `nix develop`, then `cmake -B build -G Ninja` and `ninja -C build`.
2. **Web**: Navigate to `web/`, run `nix develop`, then `npm install` and `npm run dev`.

Refer to `SPECIFICATION.md` for feature details and `GEMINI.md` for the development roadmap.
