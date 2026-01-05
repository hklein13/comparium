# Project Changes Tracking

_This document tracks pending changes and improvements for the Comparium project._
_Last Updated: January 2026_

---

## COMPLETED (This Session - Not Yet Pushed)

### Batch 1: Quick Polish
- [x] Remove "Data sourced from SeriouslyFish..." (removed entire origin note section)
- [x] Change tagline to "The place for all things aquarium."
- [x] "Species Encyclopedia" → "Encyclopedia" on glossary page
- [x] Mobile photo collage alignment - centered horizontally
- [x] Remove welcome message from header (now only shows Logout on non-dashboard pages)
- [x] Swap FAQ and Dashboard in header nav (Dashboard now rightmost)

### Batch 2: Notification UI Foundation (Phase 2A)
- [x] Add notification bell icon to dashboard header
- [x] Create notification dropdown with empty state ("Maintenance reminders will appear here")
- [x] Add settings gear icon next to bell icon
- [x] Create settings dropdown with account info and Log Out button
- [x] Move Logout from header to settings dropdown (dashboard only)
- [x] Click-outside handling to close dropdowns
- [x] Only one dropdown open at a time (clicking one closes the other)

**Files Modified (uncommitted):**
- `dashboard.html` - Bell icon, gear icon, dropdowns, JavaScript functions
- `css/naturalist.css` - Icon button styles, dropdown styles, notification/settings UI
- `js/auth-manager.js` - Hide header logout on dashboard page
- `index.html`, `glossary.html`, `about.html`, `compare.html`, `faq.html`, `login.html`, `signup.html`, `species.html` - Nav order swap

---

## COMPLETED (Previously Pushed)

- [x] Welcome message on dashboard ("Welcome back, [username]") - was already implemented

---

## IN PROGRESS

### Phase 2B: Firestore Notifications Read
- [ ] Add `loadNotifications()` function to query Firestore `notifications` collection
- [ ] Call from `loadDashboard()` after user authenticated
- [ ] Wire up `renderNotifications()` function (already written, just needs data)

**Note:** The notification UI is complete. It just needs the Cloud Function (`checkDueSchedules`) to create notifications in Firestore, then this read will populate the dropdown.

---

## ACTIVE (Near-term)

### HOME PAGE
- [ ] Change photos - no clown loach, no cherry barb (awaiting user species selection)

### DASHBOARD PAGE
- [ ] Make Dashboard nav link visually distinct (button style like Sign Up)
- [ ] Make recent comparisons functional - show 3-5, link to comparison results
- [ ] Make favorited species clickable → species detail page

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

## PHASE 2 REMAINING (Notifications)

- [ ] `checkDueSchedules` Cloud Function (daily scheduled function)
- [ ] Query `tankSchedules` where `nextDue <= today`
- [ ] Create notification documents in `notifications` collection
- [ ] Deploy and test

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

## Current Branch Status

**Branch:** `claude/fix-species-links-Hv5Zn`
**Last Pushed Commit:** `6038497` - "UI polish: update text, nav order, and add tracking doc"
**Uncommitted Changes:** Notification UI + Settings gear icon (Batch 2 work)

To commit current work:
```bash
git add dashboard.html css/naturalist.css js/auth-manager.js
git commit -m "Add notification bell and settings gear to dashboard header"
git push
```

---

## Architecture Notes

### Notification System (Phase 2)
```
tankSchedules (Firestore)
    ↓ [checkDueSchedules Cloud Function - runs daily]
notifications (Firestore)
    ↓ [dashboard.js loadNotifications()]
Notification dropdown UI
```

### Key Files for Notification Work
- `dashboard.html` - UI and JavaScript (toggleNotifications, renderNotifications, updateNotificationBadge)
- `css/naturalist.css` - Styles (.notification-*, .settings-*, .icon-btn, .header-dropdown)
- `functions/index.js` - Cloud Functions (checkDueSchedules to be added)
- `DATA-MODEL.md` - Firestore schema for notifications collection

---

## Notes

Reorganized January 2026 based on development roadmap analysis. Items categorized by:
- **Completed**: Done, may need commit/push
- **In Progress**: Partially done, clear next step
- **Active**: Ready to implement now
- **Waiting on User**: Blocked on content/decisions
- **Deferred**: Assigned to future phases per DATA-MODEL.md
- **Needs Design**: Requires planning before implementation
