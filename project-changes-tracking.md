# Project Changes Tracking

_This document tracks pending changes and improvements for the Comparium project._
_Last Updated: January 22, 2026_

---

## RECENTLY COMPLETED (Merged to Main - January 2026)

### Batch 1: Quick Polish
- [x] Remove "Data sourced from SeriouslyFish..." (removed entire origin note section)
- [x] Change tagline to "The place for all things aquarium."
- [x] "Species Encyclopedia" → "Encyclopedia" on glossary page
- [x] Mobile photo collage alignment - centered horizontally
- [x] Remove welcome message from header
- [x] Swap FAQ and Dashboard in header nav (Dashboard now rightmost)

### Batch 2: Notification UI Foundation (Phase 2A)
- [x] Add notification bell icon to dashboard header
- [x] Create notification dropdown with empty state ("Maintenance reminders will appear here")
- [x] Add settings gear icon next to bell icon
- [x] Create settings dropdown with account info and Log Out button
- [x] Move Logout from header to settings dropdown (dashboard only)
- [x] Click-outside handling to close dropdowns
- [x] Only one dropdown open at a time

### Batch 3: Click-Through Links + Security Fixes
- [x] Recent comparisons link to comparison results page
- [x] Favorite species link to species detail page
- [x] XSS security fixes (delegated event handlers instead of inline onclick)
- [x] URL encoding for species keys with special characters
- [x] Logout removed from header on ALL pages (only in dashboard settings)

### Scalability Assessment
- [x] Architecture review completed
- [x] Verdict: Production-ready for current and realistic future scale
- [x] No immediate changes needed - YAGNI principle applied

**All Playwright tests passing:** 7 passed, 4 skipped

---

## COMPLETED: Phase 2 - Notifications + FCM Push (MERGED)

**Status:** ✅ All features merged to main (January 6, 2026)
**Branch:** `claude/phase2-notifications` - can be deleted

### Phase 2A - Notification UI (Complete)
- [x] Notification bell icon in dashboard header
- [x] Settings gear icon with dropdown
- [x] Notification dropdown with empty state
- [x] Click-outside handling to close dropdowns
- [x] Only one dropdown open at a time

### Phase 2B - Notifications Backend (Complete)
- [x] `checkDueSchedules` Cloud Function (runs daily at 8 AM UTC)
- [x] Firestore security rules for notifications collection
- [x] Composite index for notifications queries
- [x] Dashboard `loadNotifications()` function
- [x] Notification click-through and mark-as-read
- [x] XSS protection for user content in notifications

### Phase 2C - Push Notifications (Complete)
- [x] Firebase Cloud Messaging (FCM) setup with VAPID key
- [x] `sendPushNotification` Cloud Function (triggered on notification create)
- [x] `cleanupExpiredNotifications` Cloud Function (weekly cleanup)
- [x] FCM token storage in `fcmTokens` collection
- [x] Push notification toggle in dashboard settings
- [x] Service worker for background notifications (`firebase-messaging-sw.js`)
- [x] Foreground notification handling
- [x] Firestore security rules for fcmTokens

### Bug Fixes Applied (January 2026)
- [x] Fixed `fcmIsEnabled()` to check Firestore tokens instead of browser permission
- [x] Removed broken Export Data feature (unused)
- [x] Implemented `markAllRead()` function with Promise.all() (was stub)
- [x] Added error handling to `removeFavorite()` with proper user param
- [x] Added error handling to Cloud Function `checkDueSchedules`
- [x] Added error handling to `editTank()` in tank-manager.js

### Test Commands
```bash
npm run test:all        # Data + rules + Playwright
npm run test:data       # Fish data validation
npm run test:rules      # Security rules analysis
npm run test:function   # Cloud Function simulation
npm run notify:create   # Create test notification
```

### How Notifications Work
1. User creates tank with maintenance schedule
2. When `nextDue` date passes, `checkDueSchedules` runs at 8 AM UTC
3. Function creates notification document in Firestore
4. `sendPushNotification` triggers → sends FCM push to user's devices
5. User sees notification in bell icon dropdown on dashboard
6. Clicking notification navigates to My Tanks and marks as read

---

## FUTURE HARDENING PASS (Low Priority)

These issues were identified in code review but are low-risk. Address when time permits:

### Security Hardening
| Issue | File | Description |
|-------|------|-------------|
| XSS in species detail | `js/species-detail.js:60-70` | Fish data inserted without HTML escaping. Low risk (admin-controlled data). |
| Service worker URL validation | `firebase-messaging-sw.js:64-66` | Accepts any URL. Should validate starts with `/`. |
| Tank name in onclick | `js/maintenance-manager.js:478` | Use data attributes instead of inline onclick. |

### Robustness Improvements
| Issue | File | Description |
|-------|------|-------------|
| FCM retry logic | `functions/index.js:260-267` | Only invalidate tokens on specific error codes, not transient failures. |
| Batch limit handling | `functions/index.js:341-345` | Loop until all items processed (>500 scenario). |
| Tank form validation | `js/tank-manager.js:240-247` | Add JS validation for 0-gallon/empty-name tanks. |

### Nice-to-Have Polish
| Issue | File | Description |
|-------|------|-------------|
| "View all events" incomplete | `js/maintenance-manager.js:531` | Link exists but doesn't show all events. |
| Notification badge refresh | `dashboard.html:688-694` | Badge doesn't update immediately after click. |

---

## ACTIVE (Near-term Improvements)

### HOME PAGE
- ~~[ ] Change photos - no clown loach, no cherry barb~~ (Old design - homepage redesigned with Featured Tank section)

### DASHBOARD PAGE
- [ ] Make Dashboard nav link visually distinct (button style like Sign Up)

### GLOSSARY PAGE
- [ ] Add remaining photos (9 species need images)
- [x] Add hyperlinks to individual fish → species detail page

### SPECIES PAGES
- [ ] Add remaining photos

### COMPARE FISH PAGE
- [ ] Increase comparison limits from 3 to 5

---

## WAITING ON USER INPUT

- ~~[ ] Home page photo swap~~ (Old design - homepage redesigned)
- [x] Breeding information (completed in Phase 3A)
- [x] Gender differentiation info (completed in Phase 3A)

---

## DEFERRED TO PHASE 3 (Expanded Glossary)

- [ ] Add new terms for equipment (expand from 6 to 16 entries) - Sub-phase 3F
- [x] Add plants section (15 plants visible in glossary) - Sub-phase 3G complete
- [ ] Add example photos for diseases (23 entries) - Sub-phase 3E

---

## DEFERRED TO PHASE 5 (Diagnostic Tool)

- [ ] "Why did this happen?" diagnostic question tool

---

## PHASE 6: NATIVE MOBILE APP (Ultimate Goal)

**This is the long-term vision for Comparium.** Most users will be on mobile; a native app provides the best experience (especially iOS lock screen notifications).

- [ ] Choose framework (React Native vs Flutter)
- [ ] Apple Developer Account ($99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Build iOS app with core features
- [ ] Build Android app
- [ ] App Store submission and review

**Prerequisites:** Complete Phases 1-5 first. See `DATA-MODEL.md` Phase 6 section for full technical details.

---

## NEEDS DESIGN FIRST

- [ ] Calendar feature for maintenance (complexity TBD)
- [ ] FAQ "contribute" tool (needs moderation design)
- [ ] Blog page (needs content strategy)
- [ ] Recommendation tool (needs algorithm design)
- [ ] Aquarium setup guide (content page)

---

## MAINTENANCE/DEVOPS

- [ ] Remove convoluted code from repository
- [ ] Clean up old/unnecessary branches
- [ ] Add GitHub protection ruleset

---

## Current State (January 6, 2026)

**Main Branch:** ✅ Fully up to date - Phase 2 complete and merged
**Staging Branch:** None active (create `claude/phase3-glossary` for next work)
**Live Site:** https://comparium.net (auto-deploys from main)

**Cloud Functions (8 deployed):**
- `helloComparium` - Test/health check (HTTP)
- `checkDueSchedules` - Daily 8 AM UTC (scheduler)
- `sendPushNotification` - On notification create (Firestore trigger)
- `cleanupExpiredNotifications` - Weekly Sunday 2 AM UTC (scheduler)
- `onCommentCreated` - Increment post/comment counts (Firestore trigger)
- `onCommentDeleted` - Decrement post/comment counts (Firestore trigger)
- `onLikeCreated` - Increment like counts (Firestore trigger)
- `onLikeDeleted` - Decrement like counts (Firestore trigger)

**Test Status:**
- Playwright: 12 passed, 11 skipped
- Data integrity: 238 species validated
- Security rules: 25 checks passed

**Local uncommitted files (intentionally kept local):**
- `aquarium_fish_species_summaries.md` - Fish summaries reference
- `Tracking changes sheet.xlsx` - Excel tracking
- `landing-preview.html` - Preview page
- `scripts/temp-images/` - Temp folder

---

## Next Session: Start Phase 3

**Phase 3: Expanded Glossary** - Add equipment, plants, and diseases databases.

### To Start
```bash
git checkout main
git pull origin main
git checkout -b claude/phase3-glossary
```

### What to Build
See `DATA-MODEL.md` Phase 3 section for complete schemas:
1. `equipment` collection - Filters, heaters, lights with specs
2. `plants` collection - Aquarium plants with care info
3. `diseases` collection - Fish diseases with symptoms/treatment

### Key Files to Create/Modify
- `js/equipment-data.js` - Equipment source data (like fish-data.js)
- `js/plants-data.js` - Plants source data
- `js/diseases-data.js` - Diseases source data
- `scripts/migrate-equipment-to-firestore.js` - Migration script
- `glossary.html` - Add tabs/sections for new content types
- `firestore.rules` - Add rules for new collections

### CRITICAL: Git Workflow
**NEVER push directly to main.** Always:
1. Work on staging branch (`claude/phase3-glossary`)
2. Push to staging branch
3. Tell user branch is ready
4. User creates PR and merges to main

---

## Architecture Notes

### Notification System (Phase 2) - COMPLETE
```
tankSchedules (Firestore)
    ↓ [checkDueSchedules Cloud Function - 8 AM UTC daily]
notifications (Firestore)
    ├─→ [sendPushNotification Cloud Function - on create]
    │       ↓
    │   fcmTokens (Firestore) → FCM → Browser push notification
    │
    └─→ [dashboard.html loadNotifications()]
            ↓
        Notification dropdown UI
            ↓ [Click → handleNotificationClick()]
        Mark as read + navigate to My Tanks
```

### Key Files
| File | Purpose |
|------|---------|
| `functions/index.js` | Cloud Functions (4 functions: hello, checkDue, sendPush, cleanup) |
| `dashboard.html` | Notification UI + JavaScript + FCM toggle |
| `js/firebase-init.js` | Firestore helpers + FCM functions (fcmRequestPermission, fcmSaveToken, fcmIsEnabled) |
| `firebase-messaging-sw.js` | Service worker for background push notifications |
| `firestore.rules` | Security rules (notifications + fcmTokens collections) |
| `firestore.indexes.json` | Composite indexes |
| `css/naturalist.css` | Styles (.notification-*, .header-dropdown) |

### Test Scripts
| Script | Purpose |
|--------|---------|
| `scripts/test-create-notification.js` | Create manual test notifications |
| `scripts/test-cloud-function.js` | Simulate checkDueSchedules locally |
| `scripts/test-data-integrity.js` | Validate fish-data.js structure |
| `scripts/test-firestore-rules.js` | Analyze security rules |
| `tests/notifications.spec.js` | Playwright E2E tests |

---

## Quick Reference

| What | Where |
|------|-------|
| Project instructions | `CLAUDE.md` |
| Data model & roadmap | `DATA-MODEL.md` |
| Testing guide | `TESTING.md` |
| Cloud Functions | `functions/index.js` |
| Dashboard UI | `dashboard.html` |
| Main CSS | `css/naturalist.css` |

---

_Reorganized January 2026. Items categorized by:_
- **Recently Completed**: Merged to main, live
- **Next Up**: Clear next implementation step
- **Active**: Ready to implement when prioritized
- **Waiting on User**: Blocked on content/decisions
- **Deferred**: Assigned to future phases per DATA-MODEL.md
- **Needs Design**: Requires planning before implementation
