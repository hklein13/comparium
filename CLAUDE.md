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

**Current Stats:** 246 species in database, 130 with images (116 still need images)

**Current Phase:** Phase 3 In Progress (Content Expansion) - Sub-Phases 3A, 3B (partial), 3C complete + hotfix

**Active Branch:** `claude/phase3-content-expansion`

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
- `js/fish-data.js` - Single source of truth for all species (246 entries, 17 fields including `tankSizeRecommended`, `breedingNeeds`, `genderDifferentiation`)
- `js/fish-descriptions.js` - Curated descriptions for ALL 246 species (full descriptions from source document)
- `js/glossary-generator.js` - Reusable logic for generating glossary entries
- `js/tank-manager.js` - Tank CRUD operations (used by dashboard)
- `js/maintenance-manager.js` - Event logging and schedule management for tanks
- `js/faq.js` - FAQ accordion toggle and search functionality
- `scripts/serviceAccountKey.json` - Firebase Admin credentials (gitignored, never commit)

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
| **3B** | 🔄 Partial | 131/246 species have images; 4 failed due to Wikimedia rate limits |
| **3C** | ✅ Complete | Added 103 new species (143 → 246) + updated ALL 246 descriptions to full versions |
| **3D** | ⏳ Pending | Add images for remaining 115 species |
| **3E** | ⏳ Pending | Add disease reference images |
| **3F** | ⏳ Pending | Expand equipment entries (6 → 16) |
| **3G** | ⏸️ Deferred | Plants section (waiting on user) |

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

**Sub-Phase 3B Status (January 8, 2026):**
- 130 species have images, 116 still need images
- 4 species failed upload due to Wikimedia rate limiting: sailfinMolly, yellowLabCichlid, banditCory, peaPuffer
- Retry these later or find alternative Wikimedia URLs

## Git Workflow

### CRITICAL RULE
**NEVER push directly to main.** Always use a staging branch and let the user merge via PR.

### Current State (January 2026)
**Active branch:** `claude/phase3-content-expansion` (Phase 3 content expansion in progress)

**Main branch:** Fully up to date with Phase 2 complete (merged)

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
- ✅ Data integrity tests passing (246 species validated)
- ✅ Security rules tests passing (25 checks)
- ✅ Cloud Function tests available (dry-run simulation)
- ✅ All 4 Cloud Functions deployed and operational
- ✅ **Phase 2 complete and merged to main**
- 🔄 **Phase 3 in progress** (3A complete, 3B partial, 3C complete)

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
3. Save JSON to `scripts/temp-selection.json` (for backup/retry)
4. `npm run images:upload` - Paste the JSON, uploads to Firebase, updates fish-data.js
5. `npm run migrate:glossary` - Sync to Firestore
6. Commit changes: `git add js/fish-data.js && git commit -m "Add images" && git push`

**CRITICAL:** Steps 4-6 must ALL be completed. If interrupted, images won't appear on live site.

### Image URLs in fish-data.js
```javascript
fishKey: {
    commonName: "Fish Name",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/comparium-21b69.firebasestorage.app/o/images%2Fspecies%2FfishKey.jpg?alt=media",
    // ... other attributes
}
```

### Wikimedia Rate Limiting Issues
Wikimedia Commons returns HTML error pages instead of images when rate limited.

**Symptoms:**
- Upload script reports: `FAILED: Invalid response: expected image, got text/html`
- `scripts/temp-images/` contains small HTML files instead of JPG images

**Solutions:**
1. Wait 1 hour and retry
2. Process images in smaller batches (10-15 at a time)
3. Find alternative Wikimedia URLs for the same species
4. The upload script has built-in retry logic (3 attempts with delays)

**Currently failed (need retry):** sailfinMolly, yellowLabCichlid, banditCory, peaPuffer

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

### What Went Wrong & Fixes
| Issue | What Happened | Fix |
|-------|---------------|-----|
| **Descriptions condensed** | Claude summarized source content without asking | Always use FULL source content unless user explicitly asks to condense |
| **Images not showing** | Upload workflow interrupted - temp-selection.json created but upload never run | Complete ALL steps: upload → migrate → commit → push |
| **Wikimedia rate limits** | Too many image downloads in quick succession | Process 10-15 images at a time, wait 1 hour between batches |
| **Description key typos** | 13 typos in fish-descriptions.js keys caused descriptions not to display (e.g., `betaImbellis` vs `bettaImbellis`) | ALWAYS run key sync validation after bulk additions to fish-descriptions.js |

### Key Takeaways
1. **Don't modify source content without asking** - preserving original text is usually better
2. **Verify each step completed** - especially multi-step workflows like image upload
3. **Ask questions when uncertain** - collaborative decision-making prevents rework
4. **Validate key sync after bulk additions** - typos in description keys silently break the site

## Related Documentation

- `DATA-MODEL.md` - **Firestore structure and Phase 2-5 roadmap** (comprehensive)
- `TESTING.md` - Comprehensive local testing guide with checklists
- `README.md` - User-facing documentation, hosting guide, customization
