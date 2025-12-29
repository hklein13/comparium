# ⚡ QUICK START: Deploy to Production

**Time Required:** ~30 minutes
**Skill Level:** Intermediate

---

## 🎯 What You're Deploying

```
✅ 44 new species (99 → 143 total)
✅ 25 new diseases (3 → 28 total)
✅ 12 new glossary terms (new section!)
✅ 4 new equipment entries (2 → 6 total)
✅ All formatting fixes and validations
```

---

## 📋 Prerequisites (One-Time Setup)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Download Service Account Key
# Go to: https://console.firebase.google.com/project/comparium-21b69/settings/serviceaccounts
# Click: "Generate new private key"
# Save as: scripts/serviceAccountKey.json
```

---

## 🚀 Deployment Steps (30 Minutes)

### Step 1: Merge to Main (5 min)
```bash
# Create PR on GitHub
gh pr create --title "Add 81 new database entries" \
             --body "Species, diseases, and glossary additions"

# OR create via web:
# https://github.com/hklein13/comparium/compare/main...claude/add-species-diseases-GDWOb

# Merge the PR
# Pull latest main
git checkout main
git pull origin main
```

**Result:** ✅ Website auto-deploys to Firebase Hosting

---

### Step 2: Deploy Firestore Infrastructure (2 min)
```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy query indexes
firebase deploy --only firestore:indexes
```

**Result:** ✅ Firestore configured and ready

---

### Step 3: Grant Admin Access (3 min)
1. Go to live site: https://comparium-21b69.web.app
2. Sign up / Log in with your account
3. Go to [Firestore Console](https://console.firebase.google.com/project/comparium-21b69/firestore/data)
4. Navigate: **users** → *(your UID)* → **Add field**
   - Field: `admin`
   - Type: `boolean`
   - Value: `true`
5. Click Save

**Result:** ✅ You can now run migrations

---

### Step 4: Migrate Fish Data (5 min)
```bash
npm run migrate:fish
```

**Expected Output:**
```
✅ Successfully migrated: 143 entries
❌ Errors: 0 entries
```

**Verify:** [Firestore Console](https://console.firebase.google.com/project/comparium-21b69/firestore/data) → **species** → should see 143 documents

---

### Step 5: Migrate Glossary Data (5 min)
```bash
npm run migrate:glossary
```

**Expected Output:**
```
✅ Successfully migrated: 49 entries
❌ Errors: 0 entries
```

**Verify:** [Firestore Console](https://console.firebase.google.com/project/comparium-21b69/firestore/data) → **glossary** → should see 49 documents

---

### Step 6: Test Live Site (10 min)

#### Test Species (https://comparium-21b69.web.app)
- [ ] Select "Emperor Tetra" in dropdown → should appear
- [ ] Select "Black Ruby Barb" → should appear
- [ ] Select "African Butterfly Fish" → should appear
- [ ] Compare 3 species → data displays correctly

#### Test Glossary (https://comparium-21b69.web.app/glossary.html)
- [ ] Click "Diseases" tab → see 28 entries (including Columnaris, Velvet Disease)
- [ ] Click "Equipment" tab → see 6 entries (including Air Stone/Air Pump)
- [ ] Click "Terminology" tab → see 12 entries (including Tannins, GH)

#### Check Console (F12)
```
✅ Loaded 143 species entries from Firestore
✅ Loaded 28 diseases entries from Firestore
```

---

## ✅ Success Checklist

- [ ] Merged PR to main
- [ ] Firestore rules deployed
- [ ] Admin access granted
- [ ] Fish migration complete (143 species)
- [ ] Glossary migration complete (49 entries)
- [ ] Website loads new data
- [ ] All new species visible
- [ ] All new glossary entries visible
- [ ] No console errors

---

## 🐛 Quick Troubleshooting

### Migration fails with "Permission denied"
**Fix:** Grant admin access (Step 3)

### Website shows old data
**Fix:** Hard refresh browser (`Ctrl+Shift+R`)

### "Firebase initialization timeout"
**Fix:** Check `scripts/serviceAccountKey.json` exists and is valid JSON

### Species count wrong
**Fix:** Check Firestore Console → species collection → should have 143 documents

---

## 🔗 Quick Links

- **Live Site:** https://comparium-21b69.web.app
- **Firestore Console:** https://console.firebase.google.com/project/comparium-21b69/firestore/data
- **GitHub Repo:** https://github.com/hklein13/comparium
- **Full Guide:** See DEPLOYMENT_GUIDE.md

---

## 📞 If Something Goes Wrong

### Emergency Rollback (Disable Firestore)
Edit `js/glossary.js` line 16:
```javascript
this.useFirestore = false; // Falls back to local JS data
```
Commit and push to main.

---

**Last Updated:** December 28, 2025
**Estimated Time:** 30 minutes
**Difficulty:** Medium ⭐⭐⭐☆☆
