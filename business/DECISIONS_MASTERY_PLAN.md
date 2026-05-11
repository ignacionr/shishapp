# Implementation Plan: The Path to Mastery

## Phase 1: Data Foundation (Database)
Create a `user_mastery` table to cache calculated scores and track milestones without re-scanning the entire `journal_entries` table on every request.

1.  **New Migration**: `032_add_mastery_system.sql`
    *   Table `user_mastery`: `user_id`, `total_score`, `current_level`, `precision_multiplier`, `last_updated`.
    *   Triggers: Update `user_mastery` on new `journal_entry` or `venue_checkin`.

## Phase 2: Backend Engine (C++)
Implement a `MasteryService` to handle the weighted logic.

1.  **MasteryService**:
    *   `calculateScore(userId)`: Runs the weighted algorithm.
    *   `checkUnlocks(userId)`: Returns boolean flags for feature gating (e.g., `verified_review_weight`).
2.  **Controller Update**:
    *   Enhance `/api/v1/auth/me` to include a `mastery` object in the response.

## Phase 3: UI Implementation (Web/Mobile)
1.  **State Management**: Update `User` type in `store/useStore.ts` to include mastery stats.
2.  **Profile Overhaul**:
    *   Implement the **Mastery Ring** (SVG-based) around the profile photo.
    *   Create a "Mastery Tab" in settings to show progress toward the next unlock.
3.  **Feature Gating**:
    *   Unlock method-specific tips and community features based on level.

## Phase 4: Validation & Feedback
1.  **Test Suite**: Add `MasteryTests.cpp` to verify score calculations.
2.  **Beta Toggle**: Deploy as a "Beta" feature to a subset of users (Admins first) to tune the algorithm weights.
