# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Model Selection

**USE OPUS 4.5 ONLY.** Do not use Sonnet or Haiku unless the user explicitly requests it. This project requires the most capable model for accurate code changes and architectural decisions.

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

**Current Stats:** 238 fish species (all with images), 15 aquarium plants (all with images)

**Recent Features (January 2026):**
- Video generation system: Remotion-based "Guess the Fish" 3-clue format for TikTok/Shorts (20 species rendered)
- Guides section: Educational articles infrastructure (guides.html, guide.html, js/guides-data.js)
- Bookmarks redesign: Denormalized storage eliminates N+1 queries, `onPostDeleted` cleans up orphans
- Near-term improvements: Tank form validation (name/size required), dashboard nav hidden when logged out, compare tool expanded to 5 species
- Sentry error tracking: Live on all pages, captures JS errors from all users (org: `harrison-klein`, project: `comparium`)
- Glossary audit: Removed 6 duplicate species, added `alternateNames` field, fixed pleco diet classifications
- Homepage redesign: Featured Tank section + Join CTA (replaced static demo sections)
- Test consolidation: 9 new tests integrated into main flow (notification UI + maintenance CRUD)
- Favorites sub-tab: Dashboard Profile tab now has Overview, My Posts, Bookmarks, Favorites
- Debug logging: Firestore operations now log errors to console for debugging
- CSS Standardization: Zodiak + Figtree fonts, UI consistency fixes
- Phase 4.4: Enhanced profiles with tabs, bio, settings, notification preferences
- Phase 4.3: Follows & bookmarks on community
- Phase 4.2: Comments & likes on community posts
- Phase 4.1: Core posts - community feed with categories
- Phase 4 MVP: Tank sharing with Community gallery

**Current Phase:** No active development phase - ready for new work

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

# Video Generation (TikTok/YouTube Shorts)
cd video && npm install          # Install Remotion dependencies (first time only)
cd video && npm run start        # Launch Remotion Studio preview at localhost:3000
cd video && npm run render       # Render single video (default species)
cd video && npm run render:all   # Render all species with curated facts
cd video && npm run render:all -- --limit 5  # Render first 5 only
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
- `js/fish-data.js` - Single source of truth for all fish species (238 entries, supports `alternateNames` array)
- `js/fish-descriptions.js` - Curated descriptions for all 238 fish species
- `js/plant-data.js` - Plant database (15 entries with position, planting style, difficulty, lighting, water params)
- `js/plant-descriptions.js` - Curated descriptions for all 15 plants
- `js/guides-data.js` - Guide content storage (beginner guides, care articles)
- `js/guides.js` - Guides page frontend logic
- `js/tank-manager.js` - Tank CRUD operations with privacy Yes/No buttons
- `js/public-tank-manager.js` - Syncs tanks to/from publicTanks collection, creates posts when sharing (Phase 4)
- `js/post-manager.js` - Post CRUD operations and feed queries (Phase 4.1)
- `js/post-composer.js` - New post modal component (Phase 4.1)
- `js/post-detail.js` - Post detail page with comments (Phase 4.1)
- `js/comment-manager.js` - Comment CRUD and threading (Phase 4.2)
- `js/social-manager.js` - Likes, follows, bookmarks API (Phase 4.2-4.3)
- `js/community.js` - Community posts feed with category filtering (Phase 4)
- `js/maintenance-manager.js` - Event logging and schedule management for tanks
- `scripts/serviceAccountKey.json` - Firebase Admin credentials (gitignored, never commit)

### Video Generation System (`video/` folder)
Remotion-based video generation for TikTok/YouTube Shorts content.

```
video/
├── src/
│   ├── SpeciesSpotlight.jsx   # Main video template (3-clue "Guess the Fish" format)
│   ├── Root.jsx               # Composition config (1080x1920 vertical, 20s @ 30fps)
│   ├── video-facts.js         # Curated clues and reveal facts per species
│   └── index.js               # Remotion entry point
├── scripts/
│   └── render-all.js          # Batch render all species with video facts
├── output/                    # Rendered MP4s (gitignored)
└── README.md                  # Usage documentation
```

**Key workflow:** Edit `video-facts.js` to add clues for new species, then run `npm run render:all` to generate videos.

### ⚠️ Critical: Glossary Entry Structure Sync
The migration script (`scripts/migrate-glossary-to-firestore.js`) has a **duplicated copy** of `generateGlossaryEntry()` (lines 223-251) that must stay in sync with `js/glossary-generator.js`.

**Why duplication exists:** The migration runs in Node.js and can't easily import browser-side JS.

**When modifying glossary entry structure:**
1. Update `js/glossary-generator.js` (browser-side)
2. Update `scripts/migrate-glossary-to-firestore.js` (Node-side, lines 223-251)
3. Run `npm run migrate:glossary` to update Firestore

**Migration cleanup:** The script automatically removes stale Firestore entries that no longer exist in source files.

**Key fields that must match:**
- `id` - kebab-case for Firestore document ID
- `fishKey` - original camelCase key for `fishDatabase` lookups and `/species` links
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
Clean URLs enabled - access pages without `.html` extension (e.g., `/community` instead of `/community.html`).

- **index.html** - Landing page (`/`) - video hero, demo CTA, species showcase
- **compare.html** - Fish comparison tool (`/compare`) - supports up to 5 species
- **dashboard.html** - User hub (`/dashboard`) - tanks, maintenance, favorites
- **glossary.html** - Encyclopedia (`/glossary`) - Species, Plants, Diseases, Equipment, Terminology
- **species.html** - Fish detail page (`/species?species=fishKey`)
- **plant.html** - Plant detail page (`/plant?plant=plantKey`)
- **community.html** - Public tank gallery (`/community`) - Phase 4
- **tank.html** - Public tank detail view (`/tank?id=tankId`) - Phase 4
- **profile.html** - User profile page (`/profile?user=username`) - Phase 4
- **guides.html** - Article listing page (`/guides`) - beginner guides, care articles
- **guide.html** - Individual guide view (`/guide?guide=slug`)
- **faq.html** - FAQ with accordion and search (`/faq`)

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
├── index.js         # All function definitions (9 functions)
└── .gitignore       # Ignores node_modules, secrets
```

**Current Functions (all deployed):**
| Function | Trigger | Purpose |
|----------|---------|---------|
| `helloComparium` | HTTP | Test function to verify deployment |
| `checkDueSchedules` | Schedule (8 AM UTC daily) | Creates notifications for due maintenance |
| `sendPushNotification` | Firestore onCreate (notifications) | Sends FCM push to user's devices |
| `cleanupExpiredNotifications` | Schedule (Sunday 2 AM UTC) | Deletes old notifications and invalid tokens |
| `onCommentCreated` | Firestore onCreate (comments) | Increment post/comment counts |
| `onCommentDeleted` | Firestore onDelete (comments) | Decrement post/comment counts |
| `onLikeCreated` | Firestore onCreate (likes) | Increment like counts |
| `onLikeDeleted` | Firestore onDelete (likes) | Decrement like counts |
| `onPostDeleted` | Firestore onDelete (posts) | Cascade delete comments, likes, bookmarks |

**Deployment:** `firebase deploy --only functions` (takes ~2 min)

## Design System

### Naturalist Theme (Current)
- **CSS:** `css/naturalist.css` - Single stylesheet for entire site (includes tank/maintenance/modal styles)
- **Fonts:** Zodiak (serif headings, from Fontshare), Figtree (sans-serif body, from Google Fonts)
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
| **Phase 3** | ✅ Complete | Content expansion - all 238 species + 15 plants have images |
| **Phase 4 MVP** | ✅ Complete | Tank sharing + Community gallery |
| **Phase 4.1** | ✅ Complete | Core posts - community feed with categories |
| **Phase 4.2** | ✅ Complete | Comments & likes on posts |
| **Phase 4.3** | ✅ Complete | Follows & bookmarks |
| **Phase 4.4** | ✅ Complete | Enhanced profiles (tabs, bio, settings) |
| **Phase 5** | ⏳ Planned | Diagnostic tool (fish health decision tree) |
| **Phase 6** | ⏳ Long-term | Native mobile app (iOS + Android) |

### Phase 4 MVP - Tank Sharing (January 2026)
**Branch:** `claude/phase4-tank-sharing`

**What's Implemented:**
- Users can share tanks publicly via Yes/No buttons in tank modal
- Community gallery page (`/community`) shows all public tanks
- Public tank detail view (`/tank?id=tankId`)
- Minimal user profile page (`/profile?user=username`)
- `publicTanks` Firestore collection with denormalized tank data
- Security rules deployed for public read, owner write

**Key Files:** `js/public-tank-manager.js`, `js/community.js`, `js/tank-detail.js`, `js/profile.js`

### Phase 4.1 - Core Posts (January 2026)
**Branch:** `claude/phase4-full-social`

**What's Implemented:**
- Community page shows unified posts feed (tanks + general posts)
- Post categories: Tanks, Help, Tips, Fish ID, Milestones
- Sharing a tank automatically creates a "Tanks" category post
- Post detail page (`/post?id=postId`)
- New post composer modal for logged-in users
- `posts` Firestore collection with category filtering and sorting
- Tank preview component renders in post cards for shared tanks

**Key Files:** `js/post-manager.js`, `js/post-composer.js`, `js/post-detail.js`

**Tests:** `tests/community-posts.spec.js` (5 tests for page structure, filtering, post cards)

### Phase 4.3 - Follows & Bookmarks (January 2026)
**Branch:** `claude/phase4-3-follows-bookmarks`

**What's Implemented:**
- Follow/unfollow users from their profile page
- Follower and following counts displayed on profiles
- Bookmark posts for later viewing (denormalized - stores post snapshot)
- Bookmarks tab on own profile (private to owner)
- `follows` and `bookmarks` Firestore collections with compound IDs
- Security rules for follows (public read, owner create/delete) and bookmarks (private)
- `onPostDeleted` Cloud Function cleans up orphaned bookmarks

**Bookmarks Architecture:** Bookmarks store denormalized post data (`content`, `category`, `authorUsername`) at bookmark time. This avoids N+1 queries but means bookmarks show content as it was when bookmarked (stale data accepted as tradeoff).

**Key Files:** `js/social-manager.js`, `js/profile.js`, `js/community.js`, `js/firebase-init.js` (firestoreToggleBookmark)

### Phase 4.4 - Enhanced Profiles (January 2026)
**Branch:** `claude/phase4-4-enhanced-profiles`

**What's Implemented:**
- Dashboard tabs: My Tanks, My Profile, Settings
- My Profile sub-tabs: Overview, My Posts, Bookmarks
- Profile editing: bio (500 chars), experience level, location
- Notification preferences: maintenance reminders, community activity, system updates
- Profile stats: post count, follower/following counts
- Account info display with email

**Key Files:** `dashboard.html`, `js/firebase-init.js` (firestoreUpdateProfile), `css/naturalist.css`

## Git Workflow

### CRITICAL RULE
**NEVER push directly to main.** Always use a staging branch and let the user merge via PR.

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
- ✅ Playwright tests passing (12 passed, 11 skipped)
- ✅ Data integrity tests passing (238 species validated)
- ✅ Security rules tests passing (25 checks)
- ✅ Cloud Function tests available (dry-run simulation)
- ✅ All 9 Cloud Functions deployed and operational
- ✅ Sentry error tracking live (test: `Sentry.captureMessage("test")` in browser console)
- ✅ Git line endings configured (`core.autocrlf=true`)
- ✅ **Phase 2 complete** - Notifications + FCM push
- ✅ **Phase 3 complete** - All 238 species + 15 plants have images (100%)
- ✅ **Phase 4 MVP complete** - Tank sharing + Community gallery
- ✅ **Phase 4.1 complete** - Core posts with categories (branch ready for merge)

### Claude Code Plugins (MCP Servers)
The following plugins enhance development workflow:

| Plugin | Purpose | When to Use |
|--------|---------|-------------|
| **sequential-thinking** | Step-by-step problem solving | Complex debugging, multi-step reasoning |
| **sentry** | Error tracking integration | `/getIssues` to view live errors, `/getIssues comparium` for project-specific |
| **code-simplifier** | Refactor code for clarity | After completing features, before major UI changes |
| **feature-dev** | Guided feature development | Planning new features with architecture focus |

### Custom Skills (Personal)
Skills stored in `~/.claude/skills/` for use across all projects:

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| **hindsight-refactor** | Fresh-eyes evaluation of completed features | After completing a feature (merged or not), to evaluate if a cleaner rebuild is warranted |

**Hindsight Refactor workflow:**
1. Describe the feature and provide branch name (if unmerged) or key files (if merged)
2. Agent captures behavior (tests + documented flows)
3. Agent produces fair critique with strengths, issues, and verdict
4. You decide: original wins / rebuild / hybrid
5. If rebuilding: agent creates competing branch, you compare side-by-side

Example: `Let's do a hindsight refactor on the bookmarks feature. Key files are js/social-manager.js and firestoreToggleBookmark in firebase-init.js.`

**Sentry MCP Setup:** Connected to org `harrison-klein`. If disconnected, run: `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp --header "Authorization: Bearer <token>"` (get token from https://sentry.io/settings/auth-tokens/)

**Note:** The `.claude/` folder is gitignored (contains local settings and hooks). Hooks are already configured and working.

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
- `usernames` - Username → UID mapping for login (**IMMUTABLE**)
- `tankEvents` - Maintenance event logs (owner read/write)
- `tankSchedules` - Recurring maintenance schedules (owner read/write)
- `notifications` - Maintenance notifications (owner read, Cloud Functions create)
- `fcmTokens` - FCM push notification tokens (owner read/write)
- `publicTanks` - Shared tanks for community gallery (public read, owner write) - **Phase 4**
- `posts` - Community posts with categories (public read, owner write) - **Phase 4.1**
- `comments` - Comments on posts with threading (public read, owner write) - **Phase 4.2**
- `likes` - User likes on posts/comments (public read, owner create/delete) - **Phase 4.2**
- `follows` - User follow relationships (public read, owner create/delete) - **Phase 4.3**
- `bookmarks` - User bookmarked posts with denormalized post data (private to owner) - **Phase 4.3**

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

### Alternative: iNaturalist
Use `npm run images:inaturalist` when Wikimedia returns poor quality. Note: Aquarium morphs/hybrids (balloonMolly, bloodParrotCichlid, etc.) won't be found - need manual sourcing.

### Plant Images
Run `node scripts/upload-plant-images.js scripts/plant-selection.json` with JSON array of `{key, url}` objects from Wikimedia Commons.

### User Tank Photos
Tank cover photos stored at `images/tanks/{tankId}.jpg`. Key functions: `storageUploadTankPhoto()`, `storageDeleteTankPhoto()` in firebase-init.js. Tank schema includes `coverPhoto` URL field.

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
- Line ending noise (many files show modified) → Already configured: `git config core.autocrlf true`

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

## Key Behavioral Lessons

1. **Don't modify source content without asking** - preserving original text is usually better
2. **Validate key sync after bulk additions** - typos in fish-data ↔ fish-descriptions keys silently break the site
3. **User pushback = verification signal** - when user questions your diagnosis, STOP and re-verify assumptions
4. **Try simple solutions first** - re-running CI should be tried before complex debugging
5. **Local git ≠ remote GitHub** - verify on GitHub directly when debugging deploy issues
6. **Sanitize user inputs in dynamic HTML** - use `.replace(/[^a-zA-Z0-9]/g, '')` for keys in onclick handlers

**Image uploads:** Use 2.5s delay between Wikimedia requests. Use iNaturalist as alternative when Wikimedia fails.

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
