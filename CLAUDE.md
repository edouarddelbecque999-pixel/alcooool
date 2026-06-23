# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SafeDrink — React Native Expo app for tracking alcohol consumption and estimating BAC in real-time. French-language UI with gamification (XP, levels, chests/collection, social leaderboards). Backend is FastAPI + MongoDB.

## Key Commands

```bash
# Frontend (from /frontend)
yarn install                          # Install deps (requires cmd-guard.js to be executable)
npx expo start --web                  # Start web dev server (port 19006)
npx expo start                        # Start with device/simulator options
yarn lint                              # Run ESLint

# Backend (from /backend)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload   # Start API server
pytest                                                  # Run all backend tests
pytest backend/tests/test_safedrink_api.py::test_name   # Run single test
```

## Architecture

### Frontend (Expo Router)

- **File-based routing**: `app/` directory maps to routes. `(tabs)/` contains the 4 main tabs (dashboard, bar, coach, profile). `stats` is a hidden tab (no FAB).
- **Auth flow**: `AuthProvider` in `src/lib/auth.tsx` wraps the entire app at `_layout.tsx`. Uses Emergent OAuth — redirects to `auth.emergentagent.com`, receives `session_id` in URL hash, exchanges for session token. Token stored in `expo-secure-store` (mobile) or `localStorage` (web).
- **API client**: `src/lib/api.ts` exports a typed `api` object with all endpoints. Token is attached via `Authorization: Bearer <token>`. Base URL from `EXPO_PUBLIC_BACKEND_URL` env var.
- **State patterns**: `useFocusEffect` to reload data when screen gains focus. Quick-add flow uses `QuickAddProvider` context to coordinate FAB press → open add modal on dashboard.
- **Theme**: `src/theme.ts` — central colors, spacing, radius tokens. Gold (`#d4af37`) brand color, dark surface backgrounds.

### Backend (FastAPI + Motor)

- **Single-file API**: `backend/server.py` contains all routes (~1000 lines). MongoDB via Motor (async). Collections: `users`, `user_sessions`, `drinks`, `water_logs`, `chat_messages`, `chests`, `collection`, `friendships`, `safe_ride_events`, `sobriety_tests`. Indexes created on startup.
- **Auth**: Session tokens validated against `user_sessions` collection. Tokens expire after 7 days (TTL index). `get_current_user()` dependency extracts user from `Authorization` header.
- **BAC calculation**: Widmark formula in `widmark_bac()`. Requires `weight_kg` and `sex` from profile. Decay rate 0.15 g/L/hour. Returns `bac`, `sober_in_hours`, color-coded `level` (green <0.2, orange <0.5, red >=0.5 — French legal limit).
- **AI Coach**: `emergentintegrations` library calls Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) via `EMERGENT_LLM_KEY`. Chat history persisted in `chat_messages` collection, keyed by `user_id + session_id`.
- **Drink Scan**: GPT-4o vision endpoint. Expects base64 image, returns JSON `{name, type, alcohol_pct, volume_ml}`.

### Key Data Flows

1. **Drink logging**: Dashboard quick-add → `api.addDrink()` → saves to `drinks` collection → BAC recalculated on next `bacCurrent()` call.
2. **BAC reset**: Sets `bac_reset_at` timestamp on user document — drinks before this time are excluded from BAC calculation.
3. **Chests/collection**: Every 3 drinks earns a chest. Opening rolls rarity-weighted random, adds item to `collection`. Lab fuses 3 same-rarity items into 1 higher-rarity.
4. **Gamification XP**: `spirit` 20, `cocktail` 15, `wine` 12, `beer` 10, water 5, safe-ride 15 XP. Levels unlock bar decoration items.

## Environment Variables

Frontend (`frontend/.env` or `VITE_` prefix):
- `EXPO_PUBLIC_BACKEND_URL` — Backend API base URL

Backend (`backend/.env`):
- `MONGO_URL` — MongoDB connection string
- `DB_NAME` — Database name
- `EMERGENT_LLM_KEY` — API key for Claude/OpenAI via Emergent

## Important Patterns

- **Platform storage**: `src/utils/storage/` has platform-specific implementations (web vs native). Token storage must use this abstraction.
- **Test fixtures**: `backend/tests/conftest.py` sets up test user/session via direct DB insert. Tests use `auth_headers` fixture for authenticated requests.
- **Drink presets**: Hardcoded in `GET /api/presets`, 3 presets per type (beer/wine/cocktail/spirit).

## Legal Disclaimer

The disclaimer "Estimations indicatives. Ne remplacent jamais un éthylotest homologué." must appear on auth, dashboard, onboarding, and profile screens.
