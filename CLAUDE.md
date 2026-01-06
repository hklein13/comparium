# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## User Context

**CRITICAL:** The user is a complete beginner to coding/programming with no prior knowledge.

- Explanations must be basic with no assumptions about technical knowledge
- Provide step-by-step instructions with copy-paste ready commands
- Define technical terms when unavoidable
- User works on Windows PC (path handling and command syntax differs from Mac/Linux)
- User's local folder: `C:\Users\HarrisonKlein\Downloads\comparium-live`

## Project Overview

**Comparium** - Web-based platform for comparing aquarium species with Firebase backend.

- **Live Site:** https://comparium.net
- **Repository:** https://github.com/hklein13/comparium
- **Firebase Project:** `comparium-21b69`

**Current Stats:** 143 species in database, 94 with images from Wikimedia Commons

**Current Phase:** Phase 2 Complete (Notifications + FCM Push) - Ready for Phase 3

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
npm run images:preview           # Generate HTML preview of all species needing images
npm run images:upload            # Batch upload from preview selection (paste JSON)

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
- `js/fish-data.js` - Single source of truth for all species (143 entries with attributes)
- `js/fish-descriptions.js` - Curated descriptions (63 species)
- `js/glossary-generator.js` - Reusable logic for generating glossary entries
- `js/tank-manager.js` - Tank CRUD operations (used by dashboard)
- `js/maintenance-manager.js` - Event logging and schedule management for tanks
- `js/faq.js` - FAQ accordion toggle and search functionality
- `scripts/serviceAccountKey.json` - Firebase Admin credentials (gitignored, never commit)

### Page Structure
- **index.html** - Landing page (split hero with fish collage, demo CTA, species showcase, origin note)
- **compare.html** - Fish comparison tool (the main app functionality)
- **dashboard.html** - User hub with stats, comparisons, tank management, maintenance tracking, and favorites
- **glossary.html** - Species database with search and filtering
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
- `.hero-split` - Landing page hero with two columns
- `.fish-collage` - Asymmetric image arrangement
- `.showcase-section` - Species grid display
- `.demo-section` - Feature preview sections
- `.btn-primary` / `.btn-ghost` - Button styles
- `.header` / `.footer` - Site-wide navigation

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
| **Phase 3** | ⏳ Planned | Expanded glossary (equipment, plants, diseases) |
| **Phase 4** | ⏳ Planned | Social features (follows, posts, comments) |
| **Phase 5** | ⏳ Planned | Diagnostic tool (fish health decision tree) |
| **Phase 6** | ⏳ Long-term | **Native mobile app (iOS + Android)** - Ultimate goal |

### Phase 2 Complete (January 2026)
All Phase 2 features implemented, deployed, and **merged to main**:
- ✅ Notification UI (bell icon, dropdowns, settings gear)
- ✅ `checkDueSchedules` Cloud Function (runs daily 8 AM UTC)
- ✅ `sendPushNotification` Cloud Function (FCM on notification create)
- ✅ `cleanupExpiredNotifications` Cloud Function (weekly cleanup)
- ✅ FCM token management (save, validate, cleanup)
- ✅ Push notification toggle in dashboard settings
- ✅ Service worker for background notifications

### Phase 3: Next Up
**Expanded Glossary** - Add three new reference databases:

| Collection | Description | Key Fields |
|------------|-------------|------------|
| `equipment` | Filters, heaters, lights, test kits | specs, pros/cons, bestFor |
| `plants` | Aquarium plants | careLevel, light, CO2, placement |
| `diseases` | Fish diseases | symptoms, treatment, prevention |

See `DATA-MODEL.md` for complete collection schemas.

## Git Workflow

### CRITICAL RULE
**NEVER push directly to main.** Always use a staging branch and let the user merge via PR.

### Current State (January 2026)
- **Main branch:** Fully up to date with Phase 2 complete
- **Phase 2 branch:** `claude/phase2-notifications` - merged and can be deleted
- **Next work:** Create new branch for Phase 3

### Starting New Work
```bash
git checkout main
git pull origin main
git checkout -b claude/phase3-glossary
# Make changes, commit, push
git push -u origin claude/phase3-glossary
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
- ✅ Data integrity tests passing (143 species validated)
- ✅ Security rules tests passing (25 checks)
- ✅ Cloud Function tests available (dry-run simulation)
- ✅ All 4 Cloud Functions deployed and operational
- ✅ **Phase 2 complete and merged to main**
- ⏳ Phase 3 ready to start (expanded glossary)

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

Images are stored in Firebase Storage at `images/species/{fishKey}.jpg`

### Adding Images Workflow
1. `npm run images:preview` - Generates `image-preview.html` showing species without images
2. Open preview in browser, select quality images, click "Export Selected"
3. `npm run images:upload` - Paste the JSON, uploads to Firebase, updates fish-data.js
4. `npm run migrate:glossary` - Sync to Firestore

### Image URLs in fish-data.js
```javascript
fishKey: {
    commonName: "Fish Name",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/comparium-21b69.firebasestorage.app/o/images%2Fspecies%2FfishKey.jpg?alt=media",
    // ... other attributes
}
```

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

## Related Documentation

- `DATA-MODEL.md` - **Firestore structure and Phase 2-5 roadmap** (comprehensive)
- `TESTING.md` - Comprehensive local testing guide with checklists
- `README.md` - User-facing documentation, hosting guide, customization
