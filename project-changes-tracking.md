# Project Changes Tracking

_This document tracks pending changes and improvements for the Comparium project._

---

## COMPLETED

- [x] Remove "Data sourced from SeriouslyFish, Aquarium Co-Op, and FishBase." (removed entire origin note)
- [x] Change tagline to "The place for all things aquarium."
- [x] "Species Encyclopedia" → "Encyclopedia" on glossary page
- [x] Mobile photo collage alignment - centered horizontally
- [x] Welcome message - already exists on dashboard ("Welcome back, [username]")
- [x] Remove welcome message from header (now only shows Logout)
- [x] Swap FAQ and Dashboard in header nav (Dashboard now rightmost)

---

## ACTIVE (Near-term)

### HOME PAGE
- [ ] Change photos - no clown loach, no cherry barb (awaiting user species selection)

### DASHBOARD PAGE
- [ ] Make Dashboard nav link visually distinct (button style like Sign Up)
- [ ] Make recent comparisons functional - show 3-5, link to comparison results
- [ ] Make favorited species clickable → species detail page
- [ ] Add settings section to dashboard
- [ ] Move "Logout" to settings section

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

## DEFERRED TO PHASE 2 (Notifications)

- [ ] Notification bell icon in dashboard header
- [ ] Notification dropdown UI
- [ ] checkDueSchedules Cloud Function

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

## Notes

Reorganized January 2026 based on development roadmap analysis. Items categorized by:
- **Active**: Ready to implement now
- **Waiting on User**: Blocked on content/decisions
- **Deferred**: Assigned to future phases per DATA-MODEL.md
- **Needs Design**: Requires planning before implementation
