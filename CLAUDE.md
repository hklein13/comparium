# Comparium - Aquarium Species Comparison Platform

## User Context
**CRITICAL:** The user is a complete beginner to coding/programming with no prior knowledge.

### Communication Guidelines
- **Explanations must be basic** - No assumptions about technical knowledge
- **Step-by-step instructions** - Break everything down into simple, numbered steps
- **Define technical terms** - Explain jargon when it's unavoidable
- **Show exact commands** - Provide copy-paste ready examples
- **Verify understanding** - Check if user needs clarification

### AI-Driven Development Model
- **AI tools are the primary developers, critics, and reviewers**
- **User dictates design choices and additions**
- **User approves major changes** - Always explain trade-offs clearly
- **Focus on teaching** - Help user understand "why" not just "how"

---

## Project Overview
Web-based platform for comparing aquarium species with Firebase backend.

**Mission:** Build on a strong but fluid foundation, open to numerous planned additions, with ZERO technical debt.

**Current Status:** Glossary system refactored (eliminated 2,295 lines of duplication), migrated to Firestore.

---

## Core Principles (MANDATORY)

### 1. KISS (Keep It Simple, Stupid) - HIGHEST PRIORITY
- **Simplest solution always wins**
- If something feels complicated, it probably is - step back and simplify
- Proven solutions > novel solutions
- Don't fight with technology - use the straightforward approach

### 2. Avoid Over-Engineering
- **Only make changes that are directly requested or clearly necessary**
- Don't add features, refactor code, or make "improvements" without thorough review
- **Keep solutions simple and focused**
- A bug fix doesn't need surrounding code cleaned up
- A simple feature doesn't need extra configurability
- Don't add docstrings, comments, or type annotations to code you didn't change
- Three similar lines of code is better than a premature abstraction

### 3. DRY (Don't Repeat Yourself)
- Single source of truth: `fish-data.js` drives everything
- Reusable functions over copy-paste

### 4. SOLID Principles
- Separation of concerns
- Single responsibility per module

### 5. YAGNI (You Aren't Gonna Need It)
- Don't build for hypothetical future requirements
- Build what's needed now, refactor when actually needed

### 6. Zero Technical Debt
- Refactor before merging to main
- Code reviews catch issues early
- If it feels hacky, fix it now

---

## Tech Stack

### Frontend
- **Vanilla JavaScript (ES6)** - No frameworks
- Browser-native modules (import/export)
- No build process - runs directly in browser
- Firebase Client SDK for auth/data

### Backend
- **Firebase/Firestore** - Cloud database
- Firebase Admin SDK for migrations (Node.js)
- Security rules: admin-only write, public read

### Development
- Node.js for scripts/migrations
- Git for version control
- Windows environment (path handling matters)

---

## Project Structure

```
comparium/
├── js/                          # Frontend JavaScript
│   ├── fish-data.js            # ⭐ SINGLE SOURCE OF TRUTH (143 species)
│   ├── fish-descriptions.js    # Curated descriptions (63 species)
│   ├── glossary-generator.js   # Dynamic entry generator (reusable logic)
│   ├── glossary.js             # Glossary UI manager
│   ├── firebase-init.js        # Firebase Client SDK setup
│   └── ...
├── scripts/                     # Node.js scripts (server-side only)
│   ├── migrate-glossary-to-firestore.js  # Migration script
│   └── serviceAccountKey.json   # 🔒 Firebase Admin credentials (gitignored)
├── glossary.html               # Species glossary page
├── CLAUDE.md                   # ← This file (project context)
└── package.json                # Node dependencies
```

### Key Files Explained

**`fish-data.js`** - The single source of truth for all fish species data
- Contains 143 fish entries with attributes (temp, pH, size, care level, etc.)
- Used by glossary-generator.js to create dynamic entries
- Used by comparison tools, filters, search, etc.

**`glossary-generator.js`** - Reusable logic for generating glossary entries
- Converts fish-data.js into formatted glossary entries
- Merges with curated descriptions from fish-descriptions.js
- Used by both frontend (glossary.js) and backend (migration script)

**`scripts/migrate-glossary-to-firestore.js`** - One-time migration script
- Uses Firebase Admin SDK (bypasses security rules)
- Runs locally via `npm run migrate:glossary`
- Never loaded by website - server-side only

---

## Firebase Setup

### Project Details
- **Project ID:** `comparium-21b69`
- **Console:** https://console.firebase.google.com/project/comparium-21b69

### Authentication
- **Admin SDK:** Used for migrations (superuser access, bypasses all security rules)
- **Client SDK:** Used by website (respects security rules, requires user login for writes)

### Service Account Key
- **Location:** `scripts/serviceAccountKey.json`
- **Purpose:** Authenticates Admin SDK for migrations
- **Security:** Gitignored - NEVER commit to repository
- **Download:** Firebase Console → Project Settings → Service Accounts → Generate New Private Key

### Security Rules
```javascript
// glossary collection
allow read: if true;  // Public read access
allow write: if isAuthenticated() && isAdmin();  // Admin-only writes
```

### Collections
- **`glossary`** - All glossary entries (species, diseases, equipment, terminology)
  - Document structure matches glossary.js entry format
  - Fields: id, title, description, tags, category, etc.

---

## Migration Rules (CRITICAL - Avoid Past Issues)

### Problem: Module Loading Complexity
**What happened:** Spent hours debugging ES6 import() vs CommonJS require() issues, fighting with Node.js module systems.

**Root cause:** Trying to load `glossary-generator.js` (CommonJS) from an ES6 module migration script.

**Final solution:** Inlined all generator functions directly into the migration script.

### Migration Best Practices

1. **KISS Principle for One-Time Scripts**
   - If it's a one-time migration, inline everything
   - Code duplication in scripts is acceptable (KISS > DRY for migrations)
   - Avoid dynamic imports, require(), eval() if possible

2. **Use Firebase Admin SDK for Migrations**
   - Admin SDK bypasses all security rules (superuser access)
   - Run locally via terminal: `npm run migrate:glossary`
   - Never use browser-based migration tools (Client SDK has permission restrictions)

3. **Service Account Key Location**
   - Must be at: `scripts/serviceAccountKey.json`
   - Script uses `__dirname` to find it: `join(__dirname, 'serviceAccountKey.json')`
   - If file not found, check Windows path with: `dir scripts\serviceAccountKey.json`

4. **Windows Environment Issues**
   - Avoid spaces in folder paths (use `C:\Comparium\` not `C:\Comparium live\`)
   - Hidden file extensions - enable "File name extensions" in File Explorer
   - File might be named `serviceAccountKey.json.txt` (check full name)
   - Run commands from project root, not scripts folder

5. **Fresh Downloads**
   - User works from downloaded ZIPs (not git clone)
   - Always download latest code from correct branch
   - Close all terminals before running updated scripts (avoid caching)

6. **Node.js Module Caching**
   - Node caches `require()` calls - clear cache with: `delete require.cache[require.resolve(path)]`
   - Or use fresh download to avoid cached modules entirely

---

## Important Commands

### Migration
```bash
npm install                    # Install dependencies (firebase-admin)
npm run migrate:glossary       # Migrate glossary data to Firestore
```

### Development
```bash
# Open project folder (user's local folder is "comparium-live")
cd C:\Users\HarrisonKlein\Downloads\comparium-live

# Check service account key exists
dir scripts\serviceAccountKey.json
```

### Git (if using)
```bash
git status                     # Check current branch and changes
git pull                       # Get latest code
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push                       # Push to remote
```

---

## Current Branch
**`claude/fix-species-links-Hv5Zn`** - Species link fixes and glossary refactoring

**Recent Work:**
- ✅ Refactored glossary system (eliminated 2,295 lines of duplication)
- ✅ Created fish-descriptions.js (curated content)
- ✅ Created glossary-generator.js (reusable logic)
- ✅ Migrated 189 glossary entries to Firestore
- ✅ Fixed module loading issues in migration script

---

## Deployment Workflow

### How Code Gets to Production
1. **Claude Code creates staging branch** (e.g., `claude/fix-species-links-Hv5Zn`)
2. **User downloads latest code** from staging branch
3. **User tests changes locally** using http-server (see TESTING.md)
4. **User reviews and approves** changes
5. **User merges staging branch to main** via GitHub
6. **Live site updates automatically** when main branch changes

**CRITICAL:** Merging to main = live site deployment. Always test locally first!

### Local Testing Setup
- **Testing guide:** See `TESTING.md` for complete instructions
- **Tool:** http-server (Node.js local web server)
- **Quick start:**
  ```cmd
  cd C:\Users\HarrisonKlein\Downloads\comparium-live
  http-server
  ```
  Then open: http://localhost:8080
- **Testing checklist:** See TESTING.md for what to test before merging

---

## Known Issues & Preferences

### User Environment
- **Website:** comparium.net (live site domain)
- **Local folder:** `comparium-live` (contains latest code + serviceAccountKey.json)
- **Windows PC** - Path handling and command syntax differs from Mac/Linux
- **Working from downloaded ZIPs** - Not using git clone (manual updates required)
- **Beginner to coding** - Needs step-by-step instructions with explanations

### Technical Preferences
- **Code quality is critical** - Changes go straight to production when merged to main
- **Always verify changes don't break existing functionality**
- Test locally before deploying (need to set up local testing environment)
- When in doubt, ask before making major changes
- Explain trade-offs clearly (performance vs simplicity, etc.)

### Common Gotchas
- **File extensions hidden by default** - Enable in Windows File Explorer
- **Folder names with spaces** - Can cause path issues, use simple names
- **Old code in downloads** - Always re-download after git pushes
- **Module system conflicts** - ES6 in browser, CommonJS in Node scripts

---

## Code Guidelines

### Module Systems
- **Browser code:** ES6 modules (`import`/`export`)
- **Node scripts:** ES6 modules with `import` (package.json has `"type": "module"`)
- **Mixed compatibility:** Use defensive checks (`typeof module !== 'undefined'`)

### Load Order (Critical)
Scripts must load in this order in HTML:
```html
<script src="js/fish-data.js"></script>           <!-- 1. Data first -->
<script src="js/fish-descriptions.js"></script>   <!-- 2. Descriptions -->
<script src="js/glossary-generator.js"></script>  <!-- 3. Generator logic -->
<script type="module" src="js/firebase-init.js"></script>  <!-- 4. Firebase -->
<script src="js/glossary.js"></script>            <!-- 5. UI last -->
```

### Defensive Coding
Always check before using globals:
```javascript
const data = typeof fishDatabase !== 'undefined' ? fishDatabase : {};
const entries = typeof generateGlossaryEntries === 'function'
    ? generateGlossaryEntries(fishDatabase, fishDescriptions)
    : [];
```

### Fallback Strategy
- Provide fallback values if scripts fail to load
- Don't break entire page if one feature fails
- Log errors to console for debugging

---

## Decision-Making Framework

### When to ASK the User
- Multiple valid approaches exist
- Significant architectural decisions
- Trade-offs between simplicity and features
- Changes that might affect user's design vision
- Anything that feels like it needs approval

### When to PROCEED Without Asking
- Bug fixes with obvious solutions
- Small refactors that improve code quality
- Adding defensive checks/error handling
- Following established patterns in the codebase
- Implementing exactly what was requested

### When to STOP and Reconsider
- Solution feels complicated
- Fighting with technology (imports, modules, etc.)
- Adding code "just in case" (YAGNI violation)
- Creating abstractions for one use case
- More than 3 attempts to fix the same issue (step back, simplify)

---

## Common Tasks (Step-by-Step)

### Task: Download Latest Code from GitHub

1. Go to: https://github.com/hklein13/comparium/tree/claude/fix-species-links-Hv5Zn
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract to your working folder: `comparium-live`
5. Copy your `serviceAccountKey.json` to: `comparium-live\scripts\serviceAccountKey.json`

### Task: Test Changes Locally

**See TESTING.md for complete guide.** Quick version:

1. Open Command Prompt
2. Navigate to project: `cd C:\Users\HarrisonKlein\Downloads\comparium-live`
3. Start server: `http-server`
4. Open browser to: `http://localhost:8080`
5. Test your changes (click around, check console for errors with F12)
6. Stop server when done: Press `Ctrl+C`

**What to test:** See testing checklist in TESTING.md

### Task: Run Firestore Migration

**Prerequisites:**
- Latest code downloaded
- serviceAccountKey.json in `scripts/` folder
- Node.js installed

**Steps:**
1. Open Command Prompt (Windows key + R → type `cmd` → Enter)
2. Navigate to project: `cd C:\Users\HarrisonKlein\Downloads\comparium-live`
3. Install dependencies: `npm install`
4. Run migration: `npm run migrate:glossary`
5. Verify success: Check Firebase Console → Firestore Database → glossary collection

**Expected output:**
```
✅ Loaded 143 fish species
✅ Loaded 63 curated descriptions
✅ Generated 143 species entries
✅ Migration complete!
```

### Task: Check if Service Account Key is in the Right Place

1. Open Command Prompt
2. Navigate to project: `cd C:\Users\HarrisonKlein\Downloads\comparium-live`
3. Run: `dir scripts\serviceAccountKey.json`
4. Should show file details (not "File Not Found")

### Task: Enable File Extensions in Windows

1. Open File Explorer
2. Click **"View"** tab at top
3. Check the box: **"File name extensions"**
4. Now you'll see full filenames (e.g., `file.json.txt` instead of `file.json`)

---

## Recent Architecture Decisions

### Glossary Refactor (Completed)
**Problem:** 143 fish entries hardcoded in glossary.js - duplicated fish-data.js

**Solution:**
- Created `fish-descriptions.js` for curated content
- Created `glossary-generator.js` for reusable logic
- Refactored `glossary.js` to use dynamic generation

**Result:**
- Eliminated 2,295 lines of duplication
- Single source of truth: fish-data.js
- Easy to add new fish (just update fish-data.js)
- Firebase-ready architecture

### Migration Script Approach (Completed)
**Problem:** Module loading complexity (ES6 vs CommonJS)

**Solution:** Inline generator functions directly in migration script

**Trade-off:** Code duplication vs simplicity (chose simplicity for one-time script)

---

## Future Considerations

### Planned Additions (User Mentioned)
- User has "numerous additions planned"
- Architecture designed to be "fluid" and extensible
- Keep technical debt at zero to enable rapid iteration

### Potential Improvements (Not Urgent)
- Convert glossary-generator.js to ES6 exports (consistency)
- Add automated tests for tag generation logic
- Consider TypeScript for better type safety (only if user wants it)

---

## Emergency Troubleshooting

### "Migration script can't find service account key"
1. Check file location: `dir scripts\serviceAccountKey.json`
2. Check file has no hidden `.txt` extension (enable file extensions in Windows)
3. Move file to correct location if needed
4. Ensure no spaces in folder path

### "Module not found" errors
1. Run `npm install` to install dependencies
2. Check package.json exists in project root
3. Delete `node_modules/` folder and run `npm install` again

### "Permission denied" errors in Firestore
- Migration script should use Admin SDK (bypasses security rules)
- Browser tools use Client SDK (requires admin login)
- Always use terminal scripts for migrations, not browser tools

### "Old code is running" (line numbers don't match)
1. Close ALL Command Prompt windows
2. Download fresh ZIP from GitHub
3. Extract to NEW folder with different name
4. Run from new folder

---

## Notes for Claude

- User values transparency - explain what you're doing and why
- User prefers KISS over cleverness - simple solutions always win
- User is learning - take opportunities to teach, not just do
- User wants zero technical debt - refactor before merging
- User works on Windows - provide Windows-compatible commands/paths
- User downloads ZIPs - always mention "download latest code" after git pushes

**Remember:** This project is about building a strong foundation for future growth. Every decision should prioritize simplicity, maintainability, and the user's ability to understand what's happening.
