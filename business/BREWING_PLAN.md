# Brewing Feature Parity Plan (Filtru & Aeromatic)

To obtain feature parity with **Filtru** and **Aeromatic**, Vidita Cafe will evolve its brewing section into a dynamic, interactive guide.

## Phase 1: Precision Calculations (Dynamic Engine)
- [x] **Dynamic Placeholders**: Replace hardcoded weights in translations (e.g., "15g") with `{{dose}}` and `{{water}}`.
- [x] **Real-time Scaling**: Update the frontend to calculate step targets dynamically based on user-selected dose/ratio.
- [x] **Interactive Ratio Slider**: Add a slider to adjust the brew intensity visually.

## Phase 2: The "Immersion" UI (Visual & Haptic)
- [x] **Circular Progress Timer**: Visual countdown for the current active step.
- [x] **Pouring Guidance**: A live target weight indicator (e.g., "Pour until 150g").
- [x] **Audio/Haptic Alerts**: Use Web Vibrate API and subtle chimes for step transitions.

## Phase 3: Content & Reference
- [x] **Grind Size Visuals**: Icons representing grind consistency (e.g., "Table Salt", "Coarse Sand").
- [x] **World Champion Recipes**: Add presets from famous brewers (James Hoffmann, Tetsu Kasuya).
- [ ] **In-Step Video Guidance**: Integrate the Georgian coffee videos as specific step tutorials.

## Phase 4: Advanced Features
- [ ] **Lock Screen Controls**: Explore Media Session API (Web) for background timer visibility.
