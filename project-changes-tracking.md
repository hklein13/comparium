# Project Changes Tracking

_This document tracks pending changes and improvements for the Comparium project._
_Last Updated: January 5, 2026_

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

## NEXT UP: Phase 2B - Notifications Backend

The notification UI is complete. Next step is making it functional:

### `checkDueSchedules` Cloud Function
- [ ] Create scheduled Cloud Function (runs daily)
- [ ] Query `tankSchedules` where `nextDue <= today` and `enabled == true`
- [ ] Create notification documents in `notifications` collection
- [ ] Deploy to Firebase: `firebase deploy --only functions`
- [ ] Test end-to-end flow

### Dashboard Notifications Read
- [ ] Add `loadNotifications()` function to query Firestore
- [ ] Wire up to existing `renderNotifications()` function
- [ ] Display notification count badge

**Key Files:**
- `functions/index.js` - Add checkDueSchedules function
- `dashboard.html` - Add loadNotifications() call
- `DATA-MODEL.md` - Reference for notifications collection schema

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

**Main Branch:** Up to date with all changes, deployed to comparium.net
**Live Site:** https://comparium.net
**Playwright Tests:** All passing

To start new work:
```bash
git checkout main
git pull origin main
git checkout -b claude/[feature-name]
```

---

## Architecture Notes

### Notification System (Phase 2)
```
tankSchedules (Firestore)
    ↓ [checkDueSchedules Cloud Function - runs daily]
notifications (Firestore)
    ↓ [dashboard.html loadNotifications()]
Notification dropdown UI (already built)
```

### Key Files for Notification Work
- `dashboard.html` - UI and JavaScript (toggleNotifications, renderNotifications, updateNotificationBadge)
- `css/naturalist.css` - Styles (.notification-*, .settings-*, .icon-btn, .header-dropdown)
- `functions/index.js` - Cloud Functions (checkDueSchedules to be added)
- `DATA-MODEL.md` - Firestore schema for notifications collection (Phase 2 section)

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
