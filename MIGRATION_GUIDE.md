# Phase 2 Migration Guide: Reference Data to Firestore

**Date**: December 24, 2025
**Branch**: `claude/bugfix-pre-migration-oLWes`
**Purpose**: Migrate fish species and glossary data from static JavaScript files to Firestore

---

## Overview

This migration moves reference data (fish species and glossary) from hardcoded JavaScript files to Firestore. This allows you to:
- Update species and glossary entries without code deployment
- Add hundreds of new entries easily through Firebase Console
- Reduce code size and improve maintainability
- Enable future admin interface for content management

**What's migrated:**
- ✅ 99 fish species from `js/fish-data.js` → Firestore `species` collection
- ✅ 12 glossary entries from `js/glossary.js` → Firestore `glossary` collection

**What's NOT migrated:**
- ❌ User data (already in Firestore from Phase 1)
- ❌ Static site content

---

## Prerequisites

Before starting, ensure you have:
- [ ] Node.js installed (already have: check with `node --version`)
- [ ] Firebase CLI installed globally
- [ ] Firebase project access (comparium-21b69)
- [ ] At least one user account created in the app (yours)

---

## Step 1: Install Firebase CLI (if needed)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify project configuration
firebase projects:list
```

You should see `comparium-21b69` in the list.

---

## Step 2: Deploy Updated Firestore Rules

The Firestore security rules have been updated to include public read access for `species` and `glossary` collections, with admin-only write access.

```bash
# Deploy only Firestore rules (not hosting)
firebase deploy --only firestore:rules

# Expected output:
# ✔  Deploy complete!
#
# Firestore Rules:
# - Species collection: public read, admin write
# - Glossary collection: public read, admin write
```

**What this does:**
- Allows anyone to read fish species and glossary data (no auth required)
- Restricts writes to users with `admin: true` in their profile
- Maintains existing security for user profiles and usernames

---

## Step 3: Grant Yourself Admin Access

Before running migration scripts, you need admin privileges.

### 3a. Get Your User ID (UID)

Option 1: From Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **comparium-21b69**
3. Go to **Authentication** → **Users**
4. Find your user account
5. Copy the **User UID** (long string like `abc123xyz...`)

Option 2: From the app
1. Open browser console (F12)
2. Login to your Comparium account
3. Run: `console.log(firebase.auth().currentUser.uid)`
4. Copy the output

### 3b. Add Admin Role to Your Profile

1. In Firebase Console, go to **Firestore Database**
2. Navigate to: `users` collection
3. Find your document (the UID you copied)
4. Click **"Add field"**
   - Field name: `admin`
   - Type: `boolean`
   - Value: `true`
5. Click **Save**

**Verify:**
```javascript
// In browser console while logged in:
const profile = await window.firestoreGetProfile(firebase.auth().currentUser.uid);
console.log('Admin status:', profile.admin); // Should be true
```

---

## Step 4: Run Migration Scripts

Now you can migrate the data from JavaScript files to Firestore.

### 4a. Migrate Fish Species (99 species)

```bash
# Navigate to project directory
cd /home/user/comparium

# Login to the app in your browser FIRST
# Then run the migration script
npm run migrate:fish
```

**Expected output:**
```
╔════════════════════════════════════════════════╗
║   Fish Database Migration to Firestore        ║
╚════════════════════════════════════════════════╝

📖 Loading fish data from js/fish-data.js...
✅ Loaded 99 species

🚀 Starting migration to Firestore...

  ✅ neonTetra              → Neon Tetra
  ✅ guppy                  → Guppy
  ✅ angelfish              → Freshwater Angelfish
  ...
  [96 more species]
  ...

╔════════════════════════════════════════════════╗
║            Migration Complete!                 ║
╚════════════════════════════════════════════════╝

✅ Successfully migrated: 99 species
❌ Errors:               0 species

📋 Next Steps:
   1. Verify data in Firebase Console → Firestore → species collection
   2. Update Firestore rules to allow public read access ✅ (Already done)
   3. Update app.js to fetch species from Firestore ✅ (Already done)

✨ Migration script complete!
```

### 4b. Migrate Glossary Entries (12 entries)

```bash
# Still logged in to the app in your browser
npm run migrate:glossary
```

**Expected output:**
```
╔════════════════════════════════════════════════╗
║   Glossary Migration to Firestore             ║
╚════════════════════════════════════════════════╝

📖 Loading glossary data from js/glossary.js...
✅ Loaded 12 entries across 4 categories

🚀 Starting migration to Firestore...

📁 Category: SPECIES
──────────────────────────────────────────────────
  ✅ neon-tetra             → Neon Tetra
  ✅ betta-fish             → Betta Fish (Siamese Fighting Fish)
  ✅ corydoras-catfish      → Corydoras Catfish

📁 Category: DISEASES
──────────────────────────────────────────────────
  ✅ ich                    → Ich (White Spot Disease)
  ✅ fin-rot                → Fin Rot
  ✅ dropsy                 → Dropsy

📁 Category: EQUIPMENT
──────────────────────────────────────────────────
  ✅ filter                 → Aquarium Filter
  ✅ heater                 → Aquarium Heater
  ✅ test-kit               → Water Test Kit

📁 Category: TERMINOLOGY
──────────────────────────────────────────────────
  ✅ nitrogen-cycle         → Nitrogen Cycle
  ✅ bioload                → Bioload
  ✅ quarantine-tank        → Quarantine Tank

╔════════════════════════════════════════════════╗
║            Migration Complete!                 ║
╚════════════════════════════════════════════════╝

✅ Successfully migrated: 12 entries
❌ Errors:               0 entries

✨ Migration script complete!
```

---

## Step 5: Verify Data in Firebase Console

1. Go to **Firestore Database** in Firebase Console
2. You should see two new collections:
   - `species` (99 documents)
   - `glossary` (12 documents)

### Verify Species Collection:
- Click on `species` collection
- Check a few documents (e.g., `neonTetra`, `guppy`)
- Verify fields: `commonName`, `scientificName`, `tempMin`, `tempMax`, `phMin`, `phMax`, etc.

### Verify Glossary Collection:
- Click on `glossary` collection
- Check documents by category (e.g., `neon-tetra`, `ich`, `filter`)
- Verify fields: `title`, `description`, `category`, `tags`, etc.

---

## Step 6: Test the App

Now test that the app loads data from Firestore correctly.

### 6a. Test Fish Species Loading

1. Open **index.html** (Compare Fish page)
2. Open browser console (F12)
3. Look for these log messages:
   ```
   ✅ Loaded 99 species from Firestore
   ✅ App initialized with 99 species
   ```
4. Verify that all fish species appear in the selection panels
5. Try comparing a few species to ensure compatibility checking still works

### 6b. Test Glossary Loading

1. Open **glossary.html**
2. Open browser console (F12)
3. Click on each category (Species, Diseases, Equipment, Terminology)
4. Look for log messages like:
   ```
   ✅ Loaded 3 species entries from Firestore
   ✅ Loaded 3 diseases entries from Firestore
   ...
   ```
5. Verify that all glossary entries display correctly

### 6c. Test Offline Behavior

To verify fallback works:
1. Disconnect from internet
2. Reload the page
3. Should see warning: "Firebase not initialized, using fallback fish data"
4. App should still load with data from `fish-data.js` and `glossary.js`

**This confirms graceful degradation is working!**

---

## Step 7: Add New Content (Test Admin Functionality)

Test that you can add new content as an admin.

### Add a New Fish Species (via Firebase Console)

1. Go to **Firestore** → `species` collection
2. Click **"Add document"**
3. Document ID: `testFish` (use camelCase like other species)
4. Add fields (copy structure from existing fish):
   ```
   commonName: "Test Fish"
   scientificName: "Testus fishicus"
   tempMin: 72
   tempMax: 78
   tempUnit: "°F"
   phMin: 6.5
   phMax: 7.5
   tankSizeMin: 10
   tankSizeUnit: "gallons"
   maxSize: 2
   sizeUnit: "inches"
   aggression: "Peaceful"
   diet: "Omnivore"
   schooling: "School of 6+"
   waterHardness: "5-12 dGH"
   lifespan: "3-5 years"
   careLevel: "Easy"
   ```
5. Click **Save**
6. Reload **index.html** in your browser
7. Search for "Test Fish" - it should appear!
8. Delete the test fish from Firestore when done

### Add a New Glossary Entry (via Firebase Console)

1. Go to **Firestore** → `glossary` collection
2. Click **"Add document"**
3. Document ID: `test-entry`
4. Add fields:
   ```
   id: "test-entry"
   title: "Test Entry"
   scientificName: null
   description: "This is a test glossary entry to verify admin functionality."
   tags: ["Test", "Admin"]
   category: "terminology"
   author: "System"
   created: "2025-12-24T00:00:00.000Z"
   firestoreId: null
   userId: null
   upvotes: 0
   verified: true
   ```
5. Click **Save**
6. Reload **glossary.html**
7. Click on **Terminology** category
8. Your test entry should appear!
9. Delete when done testing

---

## Step 8: Update fishCategories in app.js (Important!)

After migration, if you add new species to Firestore, you need to update the `fishCategories` object in `app.js` to include them in the UI.

**Current categories:** Tetras, Barbs, Danios, Rasboras, Rainbowfish, Livebearers, Bettas, Gouramis, Cichlids, Corydoras, Loaches, Plecos, Other Catfish, Other Fish, Shrimp, Snails, Amphibians

**Future improvement:** Load categories dynamically from Firestore or generate them from species data.

---

## Troubleshooting

### Migration Script Fails with "Permission Denied"

**Cause:** You don't have `admin: true` in your user profile, or you're not logged in.

**Fix:**
1. Make sure you're logged into the app in your browser
2. Check Firebase Console → Firestore → users → [your UID] → verify `admin: true` exists
3. Reload browser page and try migration again

### No Data Appears After Migration

**Cause:** Firestore rules not deployed, or browser cache issue.

**Fix:**
1. Verify rules deployed: `firebase deploy --only firestore:rules`
2. Check Firestore Console that rules show public read for species/glossary
3. Clear browser cache and hard reload (Ctrl+Shift+R)
4. Check browser console for errors

### App Shows "Loading species..." Forever

**Cause:** Firebase not initialized or network error.

**Fix:**
1. Check browser console for errors
2. Verify Firebase is initialized: `console.log(window.firebaseAuthReady)`
3. Check internet connection
4. If offline, app should fallback to `fish-data.js` - if not, check console for errors

### Migration Script Shows 0 Species Loaded

**Cause:** `fish-data.js` file parsing issue.

**Fix:**
1. Verify `js/fish-data.js` exists and is valid JavaScript
2. Check the script can find the file: `ls -la js/fish-data.js`
3. Review migration script error messages

---

## Post-Migration Cleanup (Future)

After 30 days of successful Firestore usage, you can optionally:
1. Remove or comment out `fish-data.js` and `glossary.js` (keep as backups)
2. Remove fallback logic from `app.js` and `glossary.js` (force Firestore-only)
3. Archive migration scripts (move to `scripts/archive/`)

**Don't rush this!** Keep fallbacks for now to ensure reliability.

---

## Summary

After completing this migration:
- ✅ All fish species served from Firestore
- ✅ All glossary entries served from Firestore
- ✅ Public can read data without authentication
- ✅ Only admins can write/modify data
- ✅ You can add new species and glossary entries via Firebase Console
- ✅ App has graceful fallback if Firestore is unavailable
- ✅ Future admin UI can be built easily

---

## Next Steps

1. **Monitor for 24-48 hours** - Watch for any errors or issues
2. **Add more content** - Start adding new fish species and glossary entries
3. **Plan admin interface** - Design UI for adding/editing content without Firebase Console
4. **Optimize queries** - Add Firestore indexes for complex queries if needed
5. **Consider caching** - Implement client-side caching for better performance

---

## Questions?

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console → Firestore for data
3. Review this guide's troubleshooting section
4. Verify all steps were completed in order

**All code changes committed. Migration ready to run! 🚀**
