# The Path to Mastery: Professional Progression

## Core Philosophy: Mastery over Gamification
Vidita Cafe rejects traditional "cheap" gamification (flashing lights, generic badges, and leaderboards) in favor of **Professional Progression**. The system is designed to mirror the journey of a specialty coffee professional or a dedicated home barista.

### Design Principles
1. **Quiet Authority**: Progression is visible but never intrusive. No pop-ups or "level-up" interruptions.
2. **Utility-Driven Unlocks**: Rewards are functional (advanced data, community weight) rather than purely cosmetic.
3. **Data Integrity**: Rewards are tied to the *quality* and *completeness* of data logged, not just the quantity.

---

## Levels of Mastery

| Level | Title | Requirement (Estimate) | Key Unlock |
| :--- | :--- | :--- | :--- |
| 1 | **Novice** | 1st Logged Brew | Basic Journaling |
| 2 | **Enthusiast** | 10 Brews + 2 Methods | Method-specific Tips |
| 3 | **Specialist** | 50 Brews + 4 Methods + 3 Venues | Verified Review Weight |
| 4 | **Master** | 200 Brews + 5 Venues + 80% Detail | Global Venue Moderation |
| 5 | **Authority** | 500+ Brews + Community Contribution | Featured Profile |

---

## Mastery Score (The "Extraction" Algorithm)
A user's progression is calculated by a weighted score of:
*   **Brew Volume (30%)**: Number of logs.
*   **Method Breadth (20%)**: Variety of equipment used.
*   **Precision (40%)**: Percentage of entries including optional variables (Grind size, Temperature, Ratio).
*   **Exploration (10%)**: Unique venue check-ins.

---

## Implementation Status
- [x] **Phase 1: Database Foundation** - Table `user_mastery` and triggers implemented.
- [x] **Phase 2: Backend Engine** - Model integration and mastery fetching in AuthController.
- [x] **Phase 3: UI Implementation** - Mastery Ring and Stats Dashboard added to Profile.
