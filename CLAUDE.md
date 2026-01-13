# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Context

**CRITICAL:** The user is a complete beginner to coding/programming with no prior knowledge.

- Explanations must be basic with no assumptions about technical knowledge
- Provide step-by-step instructions with copy-paste ready commands
- Define technical terms when unavoidable
- User works on Windows PC (path handling and command syntax differs from Mac/Linux)
- User's local folder: `C:\Users\HarrisonKlein\Downloads\comparium-live`

## ASK QUESTIONS - IMPORTANT

**ALWAYS ask questions when uncertain.** The user explicitly wants collaborative decision-making.

### When to Ask:
- Before making assumptions about data format or content
- When choosing between multiple valid approaches
- Before condensing, summarizing, or modifying source content
- When something seems wrong or inconsistent
- Before any significant change to existing functionality
- When Wikimedia/external services fail - ask if user wants to retry or use alternatives

### How to Ask:
- Be specific about what you're uncertain about
- Present options with pros/cons when applicable
- Don't assume - verify with the user first

### When User Pushes Back:
**CRITICAL:** If the user repeatedly questions Claude's explanation or diagnosis, this is a signal to STOP and re-verify assumptions. User confusion often indicates Claude's mental model is wrong. Don't double down - instead:
- Re-examine the evidence from scratch
- Verify assumptions against actual state (check GitHub directly, not just local git)
- Consider simpler explanations/solutions
- The user is not always right, but neither is Claude - collaborative verification prevents wasted time

**This helps ensure we think through everything in tandem.**

## Session Start Checklist

**Before starting work, check these gitignored files for additional context:**

```
.claude/
├── plans/              ← Active phase plans with step-by-step instructions
│   └── *.md            ← Read any plan files for current work details
├── user-context.md     ← Firebase credentials and account info
└── settings.json       ← Hooks configuration (already auto-loaded)
```

If a phase is in progress (see "Current Phase" below), there should be a plan file in `.claude/plans/` with detailed sub-phase instructions, validation commands, and notes from previous sessions.

## Project Overview

**Comparium** - Web-based platform for comparing aquarium species with Firebase backend.

- **Live Site:** https://comparium.net
- **Repository:** https://github.com/hklein13/comparium
- **Firebase Project:** `comparium-21b69`

**Current Stats:** 244 fish species (235 with images), 15 aquarium plants (14 with images)

**Current Phase:** Phase 3 In Progress (Content Expansion) - 3A-3D complete, 3G complete (Plants section deployed and live)

**Active Branch:** `main` (Phase 3G merged January 13, 2026)

## Commands

```bash
# Development - Local testing
http-server                      # Start local server at http://localhost:8080
http-server -c-1                 # Start with caching disabled (for testing changes)

# Migrations
npm install                      # Install dependencies
npm run migrate:glossary         # Sync fish-data.js to Firestore

# Image Pipeline
npm run images                   # Interactive image upload (y/n per species)
npm run images:preview           # Generate HTML preview (Wikimedia source)
npm run images:inaturalist       # Generate HTML preview (iNaturalist source - better for rare species)
npm run images:upload            # Batch upload (interactive JSON paste)
node scripts/upload-selected-images.js scripts/temp-selection.json  # Batch upload from file

# Testing
npm test                         # Run Playwright tests
npm run test:headed              # Run tests with visible browser
npm run test:all                 # Run data + rules + Playwright tests
npm run test:data                # Validate fish-data.js structure
npm run test:rules               # Analyze Firestore security rules
npm run test:function            # Simulate Cloud Function (dry-run)
npm run test:function:run        # Simulate Cloud Function (creates notifications)
npm run test:notifications       # Run notification E2E tests
npx playwright test tests/user-flow.spec.js  # Run single test file

# Notification Testing
npm run notify:create <userId>   # Create a test notification for a user
npm run notify:list <userId>     # List notifications for a user

# Code Quality
npm run lint                     # Check JS files for errors
npm run lint:fix                 # Auto-fix linting issues
npm run format                   # Format all code with Prettier
npm run format:check             # Check formatting without changing files

# Cloud Functions
cd functions && npm install      # Install function dependencies (first time only)
firebase deploy --only functions # Deploy Cloud Functions to Firebase
firebase functions:log           # View function logs
```

## Architecture

### Data Flow
```
fish-data.js (source of truth)
    ↓
glossary-generator.js (transforms data)
    ↓
├── glossary.js (frontend display)
├── species-detail.js (species pages)
└── migrate-glossary-to-firestore.js (Firestore sync)
```

### Key Files
- `js/fish-data.js` - Single source of truth for all fish species (244 entries)
- `js/fish-descriptions.js` - Curated descriptions for all 244 fish species
- `js/plant-data.js` - Plant database (15 entries with position, planting style, difficulty, lighting, water params)
- `js/plant-descriptions.js` - Curated descriptions for all 15 plants
- `js/plant-detail.js` - Plant detail page logic (similar to species-detail.js)
- `js/glossary-generator.js` - Reusable logic for generating glossary entries (fish + plants)
- `js/tank-manager.js` - Tank CRUD operations (used by dashboard) - **refactored January 2026**
- `js/maintenance-manager.js` - Event logging and schedule management for tanks
- `js/faq.js` - FAQ accordion toggle and search functionality
- `scripts/serviceAccountKey.json` - Firebase Admin credentials (gitignored, never commit)
- `scripts/upload-plant-images.js` - Plant image upload script (separate from fish images)
- `assets/hero-tank.mp4` - Homepage video background (bright planted aquarium, ~13MB)

### tank-manager.js Architecture (Refactored January 2026)
The tank manager was refactored for maintainability. Key patterns:

**Helper Methods:**
- `hasItems(arr)` - Consistent array empty check used throughout
- `getFormContainer()`, `getSpeciesSelector()`, etc. - Cached element getters
- `createEmptyState()`, `createErrorState()` - Centralized HTML templates

**Modular Card Rendering:**
```javascript
renderTankCard(container, tank) {
  const card = this.createCardElement(tank, speciesCount);
  this.addNotesSection(card, tank);
  this.addSpeciesPreview(card, tank, speciesCount);
  this.addActionButtons(card, tank.id);
  this.addMaintenanceSection(card, tank);
}
```

**CSS Classes (in naturalist.css):**
- `.empty-state-error` - Error state styling for empty states
- `.species-list-empty` - Empty species list item styling

### ⚠️ Critical: Glossary Entry Structure Sync
The migration script (`scripts/migrate-glossary-to-firestore.js`) has a **duplicated copy** of `generateGlossaryEntry()` (lines 180-196) that must stay in sync with `js/glossary-generator.js`.

**Why duplication exists:** The migration runs in Node.js and can't easily import browser-side JS.

**When modifying glossary entry structure:**
1. Update `js/glossary-generator.js` (browser-side)
2. Update `scripts/migrate-glossary-to-firestore.js` (Node-side, lines 180-196)
3. Run `npm run migrate:glossary` to update Firestore

**Key fields that must match:**
- `id` - kebab-case for Firestore document ID
- `fishKey` - original camelCase key for `fishDatabase` lookups and species.html links
- All other entry properties (title, tags, category, etc.)

### ⚠️ Critical: fish-data.js ↔ fish-descriptions.js Key Sync
The keys in `fish-descriptions.js` **MUST exactly match** the keys in `fish-data.js`. The site looks up descriptions by key - any mismatch means the description won't display.

**After adding/modifying species:**
1. Verify keys match exactly (case-sensitive, same spelling)
2. Run this validation command:
```bash
node -e "
const fs = require('fs');
const dataContent = fs.readFileSync('js/fish-data.js', 'utf8');
const descContent = fs.readFileSync('js/fish-descriptions.js', 'utf8');
const dataKeys = [...dataContent.matchAll(/^\\s{2}(\\w+):\\s*\\{/gm)].map(m => m[1]);
const descKeys = [...descContent.matchAll(/^\\s{2}(\\w+):/gm)].map(m => m[1]);
const missing = dataKeys.filter(k => !descKeys.includes(k));
const orphaned = descKeys.filter(k => !dataKeys.includes(k));
if (missing.length) console.log('MISSING descriptions:', missing);
if (orphaned.length) console.log('ORPHANED descriptions:', orphaned);
if (!missing.length && !orphaned.length) console.log('SUCCESS: All keys match!');
"
```

**Common typo patterns to watch for:**
- Double letters: `peppereddCory` vs `pepperedCory`
- Missing letters: `betaImbellis` vs `bettaImbellis`
- Wrong suffixes: `schwartzsCory` vs `schwartziCorydoras`

### Page Structure
- **index.html** - Landing page (video hero with looping aquarium background, demo CTA, species showcase, origin note)
- **compare.html** - Fish comparison tool (the main app functionality)
- **dashboard.html** - User hub with stats, comparisons, tank management, maintenance tracking (full CRUD), and favorites
- **glossary.html** - Encyclopedia with 5 categories: Species, Plants, Diseases, Equipment, Terminology
- **species.html** - Fish species detail page (loaded via `?species=fishKey`)
- **plant.html** - Plant detail page (loaded via `?plant=plantKey`)
- **my-tanks.html** - Redirects to dashboard#my-tanks-section (backward compat)
- **faq.html** - Static FAQ with accordion toggle and search (js/faq.js)

### Module Systems
- **Browser:** ES6 modules (import/export)
- **Node scripts:** ES6 modules (package.json has `"type": "module"`)

### Script Load Order (Critical for HTML pages)
```html
<!-- Firebase must load before auth-manager -->
<script type="module" src="js/firebase-init.js"></script>  <!-- 1. Firebase first -->
<script src="js/storage-service.js"></script>              <!-- 2. Storage service -->
<script src="js/auth-manager.js"></script>                 <!-- 3. Auth (needs Firebase) -->
<script src="js/fish-data.js"></script>                    <!-- 4. Data -->
<script src="js/theme-manager.js"></script>                <!-- 5. Theme last -->
```

For glossary pages specifically:
```html
<script src="js/fish-data.js"></script>           <!-- 1. Data first -->
<script src="js/fish-descriptions.js"></script>   <!-- 2. Descriptions -->
<script src="js/glossary-generator.js"></script>  <!-- 3. Generator logic -->
<script type="module" src="js/firebase-init.js"></script>  <!-- 4. Firebase -->
<script src="js/glossary.js"></script>            <!-- 5. UI last -->
```

### Cross-Page Communication
- **Add to Tank flow:** species-detail.js sets `sessionStorage.addToTank`, dashboard's tankManager reads it

### Notification System Flow
```
tankSchedules (Firestore) → checkDueSchedules (Cloud Function, 8AM UTC daily)
    ↓
notifications (Firestore) → sendPushNotification (Cloud Function, on create)
    ↓                              ↓
dashboard.html              Browser push notification
loadNotifications()         (if FCM enabled)
    ↓
Bell icon dropdown → Click → markNotificationRead() + navigate
```

### FCM Push Notification Flow
```
User enables push → fcmRequestPermission() → getToken() → fcmSaveToken()
    ↓
fcmTokens (Firestore) ← sendPushNotification reads tokens
    ↓
firebase-messaging-sw.js handles background notifications
```

### Cloud Functions (`functions/` folder)
Separate Node.js project using CommonJS (not ES6 modules).

```
functions/
├── package.json     # Dependencies: firebase-admin, firebase-functions, firebase-messaging
├── index.js         # All function definitions (4 functions)
└── .gitignore       # Ignores node_modules, secrets
```

**Current Functions (all deployed):**
| Function | Trigger | Purpose |
|----------|---------|---------|
| `helloComparium` | HTTP | Test function to verify deployment |
| `checkDueSchedules` | Schedule (8 AM UTC daily) | Creates notifications for due maintenance |
| `sendPushNotification` | Firestore onCreate (notifications) | Sends FCM push to user's devices |
| `cleanupExpiredNotifications` | Schedule (Sunday 2 AM UTC) | Deletes old notifications and invalid tokens |

**Deployment:** `firebase deploy --only functions` (takes ~2 min)

## Design System

### Naturalist Theme (Current)
- **CSS:** `css/naturalist.css` - Single stylesheet for entire site (includes tank/maintenance/modal styles)
- **Fonts:** Darker Grotesque (display/body), Libre Baskerville (serif accents), Source Sans 3 (fallback)
- **No emojis** - Design uses typography and color for visual hierarchy
- **Color palette:** Forest green (`#234a3a`), ivory/stone backgrounds, ink text hierarchy

### Key CSS Classes
- `.hero-video` - Landing page video hero (looping aquarium background)
- `.hero-video__bg` - Video element with `object-fit: cover`
- `.hero-video__overlay` - Forest green gradient for text readability
- `.hero-video__content` - Centered text content container
- `.showcase-section` - Species grid display
- `.demo-section` - Feature preview sections
- `.btn-primary` / `.btn-ghost` - Button styles
- `.header` / `.footer` - Site-wide navigation

### Video Hero (index.html)
The homepage uses a looping video background with:
- **Video file:** `assets/hero-tank.mp4` (~13MB, bright planted aquarium)
- **Overlay:** Forest green gradient (40% top → 85% bottom) for text contrast
- **Mobile:** Reduced height (70vh) and smaller text (1rem paragraphs)
- **Attributes:** `autoplay muted loop playsinline preload="metadata"`

```html
<section class="hero-video">
  <video autoplay muted loop playsinline preload="metadata" class="hero-video__bg">
    <source src="assets/hero-tank.mp4" type="video/mp4" />
  </video>
  <div class="hero-video__overlay"></div>
  <div class="hero-video__content">
    <h1>The place for all things aquarium.</h1>
    <p>Research species. Check compatibility. Track maintenance.</p>
    <a href="compare.html" class="btn btn-primary">Get Started</a>
  </div>
</section>
```

### Glass Edge Highlights
Cards have subtle glass edge highlights mimicking aquarium glass:
- **Effect:** Inset white shadow on top-left edge
- **Applied to:** `.glossary-card`, `.tank-card`
- **Implementation:** Integrated into original card definitions (not separate rules)

```css
box-shadow:
  inset 1px 1px 0 rgba(255, 255, 255, 0.15),
  0 2px 8px rgba(0, 0, 0, 0.04);
```

### CSS Variables
```css
--forest: #234a3a;        /* Primary brand color */
--ink: #1a1a1a;           /* Primary text */
--ink-secondary: #4a4a4a; /* Secondary text */
--ivory: #faf9f6;         /* Light backgrounds */
--border: #e5e3de;        /* Borders and dividers */
```

## Project Roadmap

Development follows a phased approach. See `DATA-MODEL.md` for complete specifications.

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Tank management, maintenance events, schedules |
| **Phase 2** | ✅ Complete | Notifications system + FCM push notifications |
| **Phase 3** | 🔄 In Progress | Content expansion (species data, images, equipment) |
| **Phase 4** | ⏳ Planned | Social features (follows, posts, comments) |
| **Phase 5** | ⏳ Planned | Diagnostic tool (fish health decision tree) |
| **Phase 6** | ⏳ Long-term | **Native mobile app (iOS + Android)** - Ultimate goal |

### Phase 3 In Progress (January 2026)
**Branch:** `claude/phase3-content-expansion`

**Goal:** Transform Comparium into a comprehensive aquarium reference with real informational value.

| Sub-Phase | Status | Description |
|-----------|--------|-------------|
| **3A** | ✅ Complete | Added 3 new fields to all species (`tankSizeRecommended`, `breedingNeeds`, `genderDifferentiation`) |
| **3B** | ✅ Complete | Initial 130 species images uploaded |
| **3C** | ✅ Complete | Added 103 new species (143 → 246) + updated ALL 246 descriptions to full versions |
| **3D** | ✅ Complete | 235/244 species have images (96.3%); 9 remaining need manual sourcing |
| **3E** | ⏳ Pending | Add disease reference images |
| **3F** | ⏳ Pending | Expand equipment entries (6 → 16) |
| **3G** | ✅ Complete | Plants section with 15 aquarium plants, detail pages, and 14/15 images |

**Sub-Phase 3C Completion Notes (January 8, 2026):**
- Added 103 new species to fish-data.js (now 246 total)
- Updated ALL 246 descriptions to full versions from source document
- **Lesson learned:** Don't condense/summarize source content without asking - user preferred the full descriptions
- All descriptions now include: size, native habitat, water conditions, behavior, and care requirements
- Code-reviewed and validated with `npm run test:data` and `npm run lint`

**Sub-Phase 3C Hotfix (January 9, 2026):**
- **Problem discovered:** 13 typos in fish-descriptions.js keys caused descriptions not to display
- **Root cause:** When adding 103 new species, description keys had typos that didn't match fish-data.js keys
- **Fixed:** 13 typos corrected, 5 orphaned descriptions removed, 4 missing descriptions added
- **Validation:** All 246 species now have matching descriptions (verified with key sync check)
- **Lesson learned:** ALWAYS validate key sync after bulk additions (see "Critical: fish-data.js ↔ fish-descriptions.js Key Sync" above)

**Sub-Phase 3D Progress (January 10, 2026):**
- Uploaded 83 additional species images in single batch
- **Total:** 213/246 species now have images (33 remaining)
- 1 failure: melanistiusCorydoras (Wikimedia returned PDF, not image - needs different URL)
- Previously failed species (sailfinMolly, yellowLabCichlid, banditCory, peaPuffer) now successfully uploaded
- **Rate limiting solved:** Increased delay to 2.5s between requests - zero rate limit failures

**Sub-Phase 3D Completion (January 12, 2026):**
- Used iNaturalist as alternative source after Wikimedia returned same rejected images
- Uploaded 22 additional images via iNaturalist search (17 initial + 5 deep search)
- **Deleted 2 invalid species entries:**
  - `corydoras` - Generic genus entry, redundant (replaced by specific species like bronzeCory, pandaCory)
  - `marginatedTetra` - Not a valid species (Hyphessobrycon marginatus is not recognized in aquarium trade)
- **Final count:** 244 species, 235 with images (96.3% coverage)
- **9 species still need manual sourcing** (aquarium morphs/hybrids not found in nature):
  1. balloonMolly, blackMolly, dalmatianMolly (captive-bred color morphs)
  2. goldWhiteCloud (captive-bred variant)
  3. platinumTetra (possibly captive variant)
  4. cumingsBarb, axelrodiRainbowfish (natural but rare on image APIs)
  5. bloodParrotCichlid, flowerhornCichlid (man-made hybrids)

**Glossary UI Redesign (January 11, 2026):**
- **Complete redesign** of glossary.html with visual gallery approach
- **New features:** Hero section with stats, category cards, species modal with "Add to Compare"
- **Bug fixes:** Fixed Add to Compare (now pre-populates species on compare page), simplified sorting to A-Z/Z-A
- **Code cleanup:** Removed ~220 lines of unused code (origin groups, old CSS)
- **Kept for future:** Toast notification system, contribute function, careLevel normalization
- **Files modified:** glossary.html, css/naturalist.css, js/glossary.js, js/app.js, js/glossary-generator.js

**Phase 3G: Plants Section (January 13, 2026):**
- **Added 15 aquarium plants** with full data: position, planting style, difficulty, lighting, water params, growth rate, propagation
- **Created plant detail pages** with `plant.html` and `plant-detail.js` (follows species-detail.js pattern)
- **Glossary integration:** Plants appear as 5th category card, click opens modal, "View Full Profile" links to detail page
- **Category cards grid:** Updated from 4 to 5 columns to accommodate new Plants category
- **Uploaded 14/15 images** to Firebase Storage (duckweed pending due to Wikimedia rate limiting)
- **XSS fixes:** Sanitized plant keys in onclick handlers and URL parameters (found by code-reviewer agent)
- **Files created:** plant-data.js, plant-descriptions.js, plant-detail.js, plant.html, upload-plant-images.js
- **Files modified:** glossary-generator.js, glossary.js, glossary.html, naturalist.css, eslint.config.js, migrate-glossary-to-firestore.js

**Plant Image TODO (for later):**
- Retry `duckweed` image (rate limited)
- Replace `amazonSword`, `javaMoss`, `dwarfHairgrass` with better aquarium-context images

## Git Workflow

### CRITICAL RULE
**NEVER push directly to main.** Always use a staging branch and let the user merge via PR.

### Current State (January 2026)
**Active branch:** `claude/phase3d-species-images` (Phase 3D images + Glossary UI redesign)

**Main branch:** Up to date with Phase 2 + security audit merged (January 9, 2026)

### Workflow for Phase 3
```bash
# Already on feature branch
git checkout claude/phase3-content-expansion

# After each sub-phase: commit with descriptive message
git add <files>
git commit -m "Phase 3X: Description of changes"

# When sub-phases complete, push for user to merge
git push -u origin claude/phase3-content-expansion
```

### Deployment Flow
1. Claude creates branch from main, commits/pushes changes
2. Claude tells user the branch is ready
3. User creates PR on GitHub, reviews changes
4. User merges to main (auto-deploys to live site)
5. Claude runs `git checkout main && git pull` to sync

## Core Principles

### 1. KISS (Keep It Simple) - HIGHEST PRIORITY
- Simplest solution always wins
- If it feels complicated, step back and simplify
- Proven solutions over novel solutions

### 2. Avoid Over-Engineering
- Only make changes that are directly requested or clearly necessary
- Don't add features, refactor code, or make "improvements" beyond what's asked
- Three similar lines of code is better than a premature abstraction

### 3. Single Source of Truth
- `fish-data.js` drives everything - never duplicate species data elsewhere
- After modifying fish-data.js, run `npm run migrate:glossary` to sync Firestore

### 4. YAGNI
- Don't build for hypothetical future requirements
- Build what's needed now, refactor when actually needed

## Automation & Quality Tools

### Current Status (January 2026)
- ✅ ESLint configured and passing (0 errors)
- ✅ Prettier configured and all files formatted
- ✅ Claude Code hooks set up in `.claude/settings.json`
- ✅ Playwright tests passing (7 passed, 11 skipped)
- ✅ Data integrity tests passing (244 species validated)
- ✅ Security rules tests passing (25 checks)
- ✅ Cloud Function tests available (dry-run simulation)
- ✅ All 4 Cloud Functions deployed and operational
- ✅ **Phase 2 complete and merged to main**
- ✅ **Phase 3D complete** - 235/244 species have images (96.3%), 9 need manual sourcing
- ✅ **Glossary UI redesign complete** - hero section, category cards, species modal, Add to Compare
- ✅ **Code cleanup complete** - tank-manager.js refactored, ~220 lines unused code removed from glossary
- ✅ **Dashboard maintenance features complete** - full event/schedule CRUD from timeline and tank modal

### Dashboard Maintenance Features (January 2026)
The dashboard now has full maintenance CRUD capabilities:

**Timeline View (main dashboard):**
- "+ Log Event" and "+ Add Schedule" buttons with tank selector for multi-tank users
- Scheduled tasks show edit button (pencil icon) - clicking opens schedule modal for edit/delete
- Task info is also clickable for quick editing

**Tank Modal (click any tank card):**
- Schedule pills are clickable - opens schedule modal for edit/delete
- Logged events have × delete button with confirmation
- "+ Log Event" and "+ Add Schedule" buttons in section headers

**Key Functions (in dashboard.html):**
- `editScheduleFromTimeline(schedule)` - Opens schedule modal from timeline tasks
- `deleteEventFromModal(eventId, tankId)` - Deletes logged event with confirmation
- `openScheduleForEdit(tankId, tankName, scheduleData)` - Opens schedule modal in edit mode
- `showTankSelectorModal(actionType, tanks)` - Tank picker for multi-tank users

### Claude Code Plugins (MCP Servers)
The following plugins enhance development workflow:

| Plugin | Purpose | When to Use |
|--------|---------|-------------|
| **sequential-thinking** | Step-by-step problem solving | Complex debugging, multi-step reasoning |
| **sentry** | Error tracking integration | Monitor live site errors (requires Sentry account) |
| **code-simplifier** | Refactor code for clarity | After completing features, before major UI changes |
| **feature-dev** | Guided feature development | Planning new features with architecture focus |

**Note:** The `.claude/` folder is gitignored (contains local settings and hooks). Hooks are already configured and working.

### Context7 Integration (MANDATORY - READ THIS FIRST)
**ALWAYS use Context7 MCP tools to fetch current documentation before writing code that uses external libraries.**

This is NOT optional. Before writing or modifying code that uses Firebase SDK, Playwright, or any npm package:
1. Call `resolve-library-id` to find the library
2. Call `query-docs` to fetch current docs
3. Then write code using the fetched documentation

This prevents outdated API usage and ensures correct, working code on the first attempt.

### Automated Quality Hooks
The following run automatically (configured in `.claude/settings.json`):

| Hook | When | What It Does |
|------|------|--------------|
| `lint-on-edit.sh` | After each JS file edit | Runs ESLint to catch errors immediately |
| `final-checks.sh` | When Claude finishes | Full lint + format check on project |

These hooks never block work - they report issues but always continue.

### Pre-Deployment Checklist
Before merging to main:
1. Run `npm test` - Playwright tests must pass
2. Run `npm run lint` - No ESLint errors
3. Run `npm run format:check` - Code is formatted

## Firebase Setup

- **Project ID:** `comparium-21b69`
- **Admin SDK:** Used for migrations (bypasses security rules)
- **Client SDK:** Used by website (respects security rules)
- **Service Account Key:** `scripts/serviceAccountKey.json` (gitignored)

### Security Rules
```javascript
// glossary collection
allow read: if true;              // Public read
allow write: if isAdmin();        // Admin-only writes
```

### Firestore Collections
- `glossary` - Species data (public read, admin write)
- `users` - User profiles, tanks, favorites (owner read/write)
- `usernames` - Username → UID mapping for login
- `tankEvents` - Maintenance event logs (owner read/write)
- `tankSchedules` - Recurring maintenance schedules (owner read/write)
- `notifications` - Maintenance notifications (owner read, Cloud Functions create)
- `fcmTokens` - FCM push notification tokens (owner read/write, Cloud Functions read)

## Image System

Images are stored in Firebase Storage:
- **Fish species:** `images/species/{fishKey}.jpg`
- **Plants:** `images/plants/{plantKey}.jpg`
- **User tank photos:** `images/tanks/{tankId}.jpg`

### Adding Images Workflow
1. `npm run images:preview` - Generates `image-preview.html` showing species without images
2. Open preview in browser, select quality images, click "Export Selected"
3. Save JSON to `scripts/temp-selection.json` (for backup/retry)
4. `npm run images:upload` - Paste the JSON, uploads to Firebase, updates fish-data.js
5. `npm run migrate:glossary` - Sync to Firestore
6. Commit changes: `git add js/fish-data.js && git commit -m "Add images" && git push`

**CRITICAL:** Steps 4-6 must ALL be completed. If interrupted, images won't appear on live site.

### Alternative: iNaturalist Image Source
When Wikimedia returns poor quality or duplicate images, use iNaturalist as an alternative:

1. `npm run images:inaturalist` - Generates `image-preview-inaturalist.html`
2. Open preview in browser, select quality images, click "Export Selected"
3. Same upload workflow as above (steps 3-6)

**When to use iNaturalist:**
- Wikimedia search returns same images that were previously rejected
- Species is rare or not well-represented on Wikimedia
- Need higher quality wildlife photography

**Limitations:**
- **Aquarium morphs/hybrids won't be found** - iNaturalist only has wild species observations
- Examples: balloonMolly, bloodParrotCichlid, flowerhornCichlid (man-made varieties)
- For these, user must manually source images from other licensed sources

**Scripts:**
- `scripts/generate-inaturalist-preview.js` - Primary iNaturalist search (uses scientificName)
- `scripts/deep-inaturalist-search.js` - Deeper search using observations API + multiple query strategies

### Image URLs in fish-data.js
```javascript
fishKey: {
    commonName: "Fish Name",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/comparium-21b69.firebasestorage.app/o/images%2Fspecies%2FfishKey.jpg?alt=media",
    // ... other attributes
}
```

### Plant Images Workflow
Plant images use a separate upload script that stores to `images/plants/`:

1. User provides Wikimedia Commons URLs (copy from search results)
2. Save URLs to `scripts/plant-selection.json`:
```json
[
  {"key": "javaFern", "url": "https://upload.wikimedia.org/..."},
  {"key": "javaMoss", "url": "https://upload.wikimedia.org/..."}
]
```
3. Run: `node scripts/upload-plant-images.js scripts/plant-selection.json`
4. Run: `npm run migrate:glossary`
5. Commit and push

**Plant Image URLs in plant-data.js:**
```javascript
javaFern: {
    commonName: "Java Fern",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/comparium-21b69.firebasestorage.app/o/images%2Fplants%2FjavaFern.jpg?alt=media",
    // ... other attributes
}
```

**Wikimedia Search Links for Plants:**
Use direct Wikimedia Commons search: `https://commons.wikimedia.org/w/index.php?search={scientificName}&title=Special:MediaSearch&type=image`

### User Tank Photo Uploads (January 2026)
Users can upload a single cover photo per tank that replaces the species mosaic on portrait cards.

**Storage Path:** `images/tanks/{tankId}.jpg`
- Matches species images pattern
- One photo per tank (overwrites on replace)
- Deleted automatically when tank is deleted

**Tank Schema with Photo:**
```javascript
{
  id: "tank_1736261234567",
  name: "Community Tank",
  size: 55,
  notes: "...",
  species: ["neonTetra", "cardinalTetra"],
  coverPhoto: "https://firebasestorage.../images%2Ftanks%2Ftank_1736261234567.jpg?alt=media",
  created: "2026-01-12T...",
  updated: "2026-01-12T..."
}
```

**Key Files:**
| File | What It Does |
|------|--------------|
| `js/firebase-init.js` | `storageUploadTankPhoto()`, `storageDeleteTankPhoto()` helpers |
| `js/tank-manager.js` | Photo state, upload on save, display logic |
| `dashboard.html` | File input UI with drag-drop zone |
| `css/naturalist.css` | `.photo-upload-zone`, `.tank-portrait-cover` styles |

**⚠️ Important:** Photo replacement uses Firebase overwrite (same path). No manual deletion needed - the new upload automatically replaces the old file.

### Wikimedia Rate Limiting - SOLVED
Wikimedia Commons returns HTML error pages instead of images when rate limited.

**Symptoms:**
- Upload script reports: `FAILED: Invalid response: expected image, got text/html`
- `scripts/temp-images/` contains small HTML files instead of JPG images

**Solution (January 2026):**
The upload script was improved with proper rate limiting:
- **Delay between requests:** 2.5 seconds (was 500ms)
- **Batch size:** 80+ images work fine with proper delays
- **Retry logic:** 3 attempts with exponential backoff (1s, 2s, 3s)
- **Failure tracking:** Failures saved to `scripts/failed-uploads.json` for easy retry
- **File argument:** Can now run `node scripts/upload-selected-images.js path/to/file.json`

**Result:** 83 images uploaded in single batch with zero rate limit failures.

## Decision-Making

### ASK the User When:
- Multiple valid approaches exist
- Significant architectural decisions
- Trade-offs between simplicity and features

### PROCEED Without Asking When:
- Bug fixes with obvious solutions
- Implementing exactly what was requested
- Following established patterns

### STOP and Reconsider When:
- Solution feels complicated
- Fighting with technology (imports, modules, etc.)
- More than 3 attempts to fix the same issue

## Common Issues

### Windows Environment
- Enable "File name extensions" in File Explorer (hidden by default)
- Avoid spaces in folder paths
- Use `dir` instead of `ls` for checking files

### Browser Caching
- Use `http-server -c-1` to disable caching
- Or hard refresh with `Ctrl+Shift+R`

### Git Issues
- "Uncommitted changes" → `git stash`, then `git pull`, then `git stash pop`
- "Not a git repository" → User is in wrong folder or used ZIP download

### Migration Issues
- Service account key must be at `scripts/serviceAccountKey.json`
- Run from project root, not scripts folder
- **Glossary links broken after migration?** Check that `fishKey` field exists in both:
  - `js/glossary-generator.js` (generateGlossaryEntry function)
  - `scripts/migrate-glossary-to-firestore.js` (generateGlossaryEntry function, lines 180-196)
  - These are duplicates that must stay in sync (see "Critical: Glossary Entry Structure Sync" above)

### Image Upload Issues
- **Images not showing after merge?** The upload workflow may have been interrupted
- Check if `fish-data.js` has actual URLs (not `null`) for the species
- Ensure `npm run migrate:glossary` was run after updating fish-data.js
- Ensure changes were committed and pushed

## Lessons Learned (Phase 3)

### What Worked Well
- Code-reviewer agent catches issues before merge
- Validation scripts (`npm run test:data`, `npm run lint`) catch problems early
- Saving selections to `temp-selection.json` allows retry after failures
- Key sync validation script catches description/data mismatches immediately
- **Code-simplifier plugin** makes refactoring safe - run before UI changes to make edits easier
- **2.5s delay between Wikimedia requests** - eliminated rate limiting entirely, 83 images uploaded in one batch
- **iNaturalist as alternative source** - Found 22 additional images when Wikimedia returned duplicates (Jan 12)
- **Code-reviewer + code-simplifier combo** - Running both after completing work catches orphaned references

### What Went Wrong & Fixes
| Issue | What Happened | Fix |
|-------|---------------|-----|
| **Descriptions condensed** | Claude summarized source content without asking | Always use FULL source content unless user explicitly asks to condense |
| **Images not showing** | Upload workflow interrupted - temp-selection.json created but upload never run | Complete ALL steps: upload → migrate → commit → push |
| **Wikimedia rate limits** | 500ms delay too aggressive, caused HTML error responses | **FIXED:** Increased delay to 2.5s - now supports 80+ image batches |
| **Description key typos** | 13 typos in fish-descriptions.js keys caused descriptions not to display (e.g., `betaImbellis` vs `bettaImbellis`) | ALWAYS run key sync validation after bulk additions to fish-descriptions.js |
| **Wikimedia same images** | Re-running `npm run images:preview` returned identical images that were already rejected for poor quality | **FIXED:** Use iNaturalist as alternative source (`npm run images:inaturalist`) |
| **Wrong species list** | Manual regex to find species without images returned incorrect results | Use existing script patterns: `new Function(code + '; return fishDatabase;')()` |
| **Invalid species in database** | `corydoras` (generic genus) and `marginatedTetra` (invalid species name) were in database | Deleted both; always verify species validity before adding |
| **Orphaned references** | Deleted species were still referenced in app.js categories and image-pipeline.js | ALWAYS run code-reviewer after deletions to find orphaned references |
| **Wikipedia API 403** | Wikipedia REST API blocked automated requests with 403 Forbidden (Jan 13) | Use Wikimedia Commons search instead, or provide user with direct search links for manual selection |
| **Batch rate limiting** | After uploading 14 plant images, Wikimedia returned HTTP 429 for remaining requests | Wait ~1 hour for rate limit reset, or manually retry with `node scripts/upload-plant-images.js scripts/duckweed-retry.json` |
| **XSS in plant code** | Plant keys interpolated directly into onclick handlers; URL params used unsanitized | Sanitize keys with `.replace(/[^a-zA-Z0-9]/g, '')` and use data attributes for onclick handlers |
| **Deployment debugging rabbit hole** | Spent hours on wrong diagnosis. Claude insisted "merge succeeded, only deploy failed" when user kept questioning. Trusted `git log` over user's observation that GitHub showed no plant PR. Led user through manual Firebase deploy which didn't help. **Actual fix:** Re-run GitHub Actions (took seconds). | **CRITICAL:** When user repeatedly questions Claude's explanation, STOP and verify more thoroughly. User confusion is often a signal Claude's mental model is wrong. Don't conflate local git state with remote GitHub state. Simple solutions (re-run CI) should be tried before complex debugging. |

### Key Takeaways
1. **Don't modify source content without asking** - preserving original text is usually better
2. **Verify each step completed** - especially multi-step workflows like image upload
3. **Ask questions when uncertain** - collaborative decision-making prevents rework
4. **Validate key sync after bulk additions** - typos in description keys silently break the site
5. **Respect external API rate limits** - 2.5s delays for Wikimedia; batch sizes of 80+ work fine with proper delays
6. **Use alternative image sources** - When one source fails, try iNaturalist before manual sourcing
7. **Run code-reviewer after deletions** - Catches orphaned references in category arrays, priority lists, etc.
8. **Aquarium morphs won't be on wildlife APIs** - balloonMolly, bloodParrotCichlid, flowerhornCichlid need manual sourcing
9. **Run code-reviewer + code-simplifier before merging** - Catches XSS vulnerabilities and redundant code patterns
10. **Wikipedia API may block requests** - Use Wikimedia Commons API or provide direct search links for manual selection
11. **Batch uploads can hit rate limits mid-batch** - Save progress; use retry JSON files for failed items
12. **User pushback = verification signal** - When user repeatedly questions Claude's diagnosis, that's a sign to STOP and verify assumptions more carefully, not double down
13. **Try simple solutions first** - Re-running GitHub Actions should be tried before complex debugging like manual Firebase deployments
14. **Local git ≠ remote GitHub** - `git log` showing commits doesn't guarantee remote is in expected state; verify on GitHub directly when debugging deploy issues

### Image Sourcing Decision Tree
```
Need species image?
├── Run npm run images:preview (Wikimedia)
│   ├── Good quality images found → Select and upload
│   └── Poor quality OR same as rejected images
│       └── Run npm run images:inaturalist (iNaturalist)
│           ├── Found CC-licensed images → Select and upload
│           └── No results (likely aquarium morph/hybrid)
│               └── Manual sourcing required
```

## Security Notes

### Current Security Status (January 2026)
- **Overall posture:** GOOD (7/10)
- **Firestore rules:** Comprehensive with ownership checks
- **Service account key:** Properly gitignored
- **Cloud Functions:** Secure (scheduled triggers, proper scoping)
- **Console logging:** Removed from production code

### Storage Rules - TEMPORARY STATE
**File:** `scripts/storage.rules`

Current rule allows **all authenticated users** to write to images folder:
```javascript
allow write: if request.auth != null;
```

**TODO after Phase 3:** Change to admin-only pattern to match Firestore:
```javascript
allow write: if request.auth != null &&
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.admin == true;
```

### Phase 4 Security Hardening Checklist
| Item | Status | Notes |
|------|--------|-------|
| Storage rules to admin-only | Pending | Do after Phase 3 completes |
| Strengthen password requirements | Pending | Phase 5 (8+ chars, mixed case) |
| Add DOMPurify for dynamic content | Pending | XSS prevention |
| Implement email verification | Pending | Multi-user admin setup |
| Add rate limiting to Cloud Functions | Pending | Prevent abuse |

### Security Best Practices
1. **Never commit secrets** - `serviceAccountKey.json` must stay gitignored
2. **Rotate keys periodically** - VAPID key, service account key via Firebase Console
3. **No console logging in production** - Removed all debug statements
4. **Migrations use Admin SDK** - Service account bypasses rules, no permissive rules needed

## Related Documentation

- `DATA-MODEL.md` - **Firestore structure and Phase 2-5 roadmap** (comprehensive)
- `TESTING.md` - Comprehensive local testing guide with checklists
- `README.md` - User-facing documentation, hosting guide, customization
