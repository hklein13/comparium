# Project Changes Tracking

_This document tracks pending changes and improvements for the Comparium project._
_Last Updated: January 6, 2026_

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

## READY FOR MERGE: Phase 2B - Notifications Backend

**Branch:** `claude/phase2-notifications`
**Status:** Tested locally, Cloud Function deployed, ready for user merge to main

### Completed Items
- [x] `checkDueSchedules` Cloud Function (runs daily at 8 AM UTC)
- [x] Firestore security rules for notifications collection
- [x] Composite index for notifications queries
- [x] Dashboard `loadNotifications()` function
- [x] Notification click-through and mark-as-read
- [x] XSS protection for user content in notifications
- [x] Comprehensive test suite (5 new test scripts)

### Test Commands Added
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
4. User sees notification in bell icon dropdown on dashboard
5. Clicking notification navigates to My Tanks and marks as read

---

## NEXT UP: Phase 2C - Push Notifications (FCM)

Optional enhancement to send browser push notifications:

### `sendPushNotification` Cloud Function
- [ ] Set up Firebase Cloud Messaging (FCM)
- [ ] Create function triggered on notification document create
- [ ] Store FCM tokens in `fcmTokens` collection
- [ ] Send push to user's registered devices
- [ ] Add notification permission prompt to dashboard

### `cleanupExpiredNotifications` Cloud Function
- [ ] Create weekly scheduled function
- [ ] Delete notifications where `expiresAt < now`
- [ ] Currently notifications persist indefinitely (low priority)

---

## ACTIVE (Near-term Improvements)

### HOME PAGE
- [ ] Change photos - no clown loach, no cherry barb (awaiting user species selection)

### DASHBOARD PAGE
- [ ] Make Dashboard nav link visually distinct (button style like Sign Up)

### GLOSSARY PAGE
- [ ] Add remaining photos
- [ ] Add hyperlinks to individual fish → species detail page

### SPECIES PAGES
- [ ] Add remaining photos

### COMPARE FISH PAGE
- [ ] Increase comparison limits from 3 to 5

---

## WAITING ON USER INPUT

- [ ] Home page photo swap (user picking replacement species)
- [ ] Breeding information (user providing data)
- [ ] Gender differentiation info (user providing data)

---

## DEFERRED TO PHASE 3 (Expanded Glossary)

- [ ] Add new terms for equipment, diseases, general
- [ ] Add plants section
- [ ] Add example photos for diseases

---

## DEFERRED TO PHASE 5 (Diagnostic Tool)

- [ ] "Why did this happen?" diagnostic question tool

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

## Current State

**Main Branch:** Up to date with Phase 2A (notification UI)
**Staging Branch:** `claude/phase2-notifications` (Phase 2B - backend)
**Live Site:** https://comparium.net
**Cloud Functions:** `checkDueSchedules` deployed and running daily

**Test Status:**
- Playwright: 7 passed, 11 skipped
- Data integrity: 143 species validated
- Security rules: 25 checks passed

To merge Phase 2B:
1. Go to https://github.com/hklein13/comparium/pull/new/claude/phase2-notifications
2. Create PR, review changes
3. Merge to main

To start new work after merge:
```bash
git checkout main
git pull origin main
git checkout -b claude/[feature-name]
```

---

## Architecture Notes

### Notification System (Phase 2) - IMPLEMENTED
```
tankSchedules (Firestore)
    ↓ [checkDueSchedules Cloud Function - 8 AM UTC daily]
notifications (Firestore)
    ↓ [dashboard.html loadNotifications()]
Notification dropdown UI
    ↓ [Click → handleNotificationClick()]
Mark as read + navigate to My Tanks
```

### Key Files
| File | Purpose |
|------|---------|
| `functions/index.js` | Cloud Functions (checkDueSchedules) |
| `dashboard.html` | Notification UI + JavaScript |
| `js/firebase-init.js` | Firestore helpers (firestoreGetNotifications, firestoreMarkNotificationRead) |
| `firestore.rules` | Security rules (notifications collection) |
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
