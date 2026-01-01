# 🧪 Local Testing Guide for Comparium

## Overview

This guide shows you how to test your website changes **on your computer** before merging to the live site (comparium.net).

**Why test locally?**
- ✅ See changes instantly without affecting the live site
- ✅ Catch bugs before they go to production
- ✅ Test multiple times without risk
- ✅ Merge to main with confidence

---

## 🔧 One-Time Setup (5 minutes)

You only need to do this once.

### Step 1: Install http-server

1. Open Command Prompt (Windows key + R → type `cmd` → Enter)
2. Run this command:
   ```cmd
   npm install -g http-server
   ```
3. Wait for installation to complete (you'll see "added X packages")

**What this does:** Installs a simple web server on your computer that can run your website locally.

**Troubleshooting:**
- If you get "npm not found" → You need to install Node.js first
- If you get "permission denied" → Close and reopen Command Prompt as Administrator

---

## 🚀 How to Test Your Changes (Every Time)

### Step 1: Start the Local Server

1. Open Command Prompt
2. Navigate to your project folder:
   ```cmd
   cd C:\Users\HarrisonKlein\Downloads\comparium-live
   ```
3. Start the server:
   ```cmd
   http-server
   ```

**You should see:**
```
Starting up http-server, serving ./

http-server version: 14.1.1

Available on:
  http://127.0.0.1:8080
  http://192.168.1.XXX:8080
Hit CTRL-C to stop the server
```

### Step 2: Open Your Website in a Browser

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to: **http://localhost:8080**
3. Your website should load!

### Step 3: Test Your Changes

Navigate through your website and test the changes you made:
- Click links
- Test forms
- Check that pages load correctly
- Look for errors in browser console (F12 → Console tab)

### Step 4: Make Changes and Refresh

If you need to fix something:
1. Edit your code files
2. **Save the file**
3. Go back to your browser
4. **Press F5** (or Ctrl+R) to refresh
5. See your changes instantly!

### Step 5: Stop the Server (When Done)

In the Command Prompt window:
- Press **Ctrl+C**
- Type **Y** when asked "Terminate batch job?"

---

## ✅ Testing Checklist

Before merging to main, test these areas:

### 🏠 **Homepage (index.html)**
- [ ] Page loads without errors
- [ ] All navigation links work
- [ ] Images load properly
- [ ] Dark mode toggle works (if applicable)

### 🐟 **Glossary Page (glossary.html)**
- [ ] Page loads and displays fish species
- [ ] Search functionality works
- [ ] Filter by category works (Species, Diseases, Equipment, Terminology)
- [ ] Click on a species shows details
- [ ] No JavaScript errors in console (F12 → Console)

### 🔗 **Species Links**
- [ ] Links to species pages work
- [ ] Parentheses in URLs are handled correctly
- [ ] No 404 errors when clicking species names

### 📱 **Mobile Responsiveness** (Optional)
- [ ] Press F12 → Click device icon (top left)
- [ ] Select "iPhone" or "iPad" from dropdown
- [ ] Check that layout looks good on mobile

### 🔥 **Firebase Integration**
- [ ] Open browser console (F12 → Console tab)
- [ ] Look for Firebase errors (red text)
- [ ] Check that data loads from Firestore (if applicable)

---

## 🎯 Common Testing Scenarios

### Scenario 1: Testing a New Fish Species Entry

**What to test:**
1. Go to glossary page: `http://localhost:8080/glossary.html`
2. Search for the new fish species by name
3. Verify it appears in search results
4. Click on the species
5. Check that all information displays correctly:
   - Common name
   - Scientific name
   - Description
   - Tags (care level, temperament, size, etc.)
   - Image (if present)
6. Verify tags are accurate (e.g., "Beginner Friendly", "Peaceful")

### Scenario 2: Testing a Link Fix

**What to test:**
1. Go to the page with the link
2. Click the link
3. Verify it goes to the correct destination
4. Check browser console for errors (F12 → Console)
5. Test with species that have special characters (parentheses, spaces, etc.)

### Scenario 3: Testing a Style/CSS Change

**What to test:**
1. Load the affected page
2. Verify the visual change looks correct
3. Test in different browser widths (resize window)
4. Check mobile view (F12 → device toggle)
5. Test dark mode (if applicable)

### Scenario 4: Testing Firebase Data Migration

**What to test:**
1. Open browser console (F12 → Console tab)
2. Load the page that uses Firestore data
3. Look for successful data fetch messages
4. Verify data displays correctly on page
5. Check for any Firebase authentication errors

---

## 🔍 How to Check for Errors

### Browser Console (Most Important!)

**How to open:**
1. Open your website in browser (http://localhost:8080)
2. Press **F12** (or right-click → Inspect)
3. Click the **Console** tab

**What to look for:**
- ❌ **Red text** = Errors (something is broken)
- ⚠️ **Yellow text** = Warnings (might be okay, but worth checking)
- ℹ️ **Blue/white text** = Information (usually fine)

**Common errors and what they mean:**

```
❌ "404 Not Found"
→ A file is missing (check file path)

❌ "Uncaught ReferenceError: fishDatabase is not defined"
→ Script loading order is wrong (check HTML script tags)

❌ "Failed to load resource"
→ File path is incorrect or file doesn't exist

❌ "CORS policy" error
→ Need to use http-server (can't just open HTML files directly)
```

### Network Tab (For Advanced Debugging)

**How to check:**
1. F12 → Network tab
2. Refresh page (F5)
3. Look for red items (failed requests)
4. Click on failed request to see details

---

## 🆚 Local vs. Live Site Differences

### What Works the Same:
- ✅ HTML/CSS rendering
- ✅ JavaScript functionality
- ✅ Links between pages
- ✅ Forms and user interactions

### What Might Be Different:
- ⚠️ **Firebase data** - Make sure you're using the production Firebase project
- ⚠️ **External APIs** - Some APIs might have different URLs for local vs. production
- ⚠️ **Authentication** - Login might work differently locally

**Important:** Always test Firebase features on the live site too, since local testing uses the same production database.

---

## 🐛 Troubleshooting

### "npm is not recognized"
**Problem:** Node.js is not installed
**Solution:**
1. Download Node.js from: https://nodejs.org/
2. Install it (choose all default options)
3. Close and reopen Command Prompt
4. Try `npm install -g http-server` again

### "Address already in use"
**Problem:** Port 8080 is being used by another program
**Solution:**
1. Stop the other server (Ctrl+C in that Command Prompt window)
2. OR use a different port: `http-server -p 8081`
3. Then go to: `http://localhost:8081`

### "Cannot GET /some-page.html"
**Problem:** File doesn't exist or wrong URL
**Solution:**
1. Check the file exists in your folder
2. Use correct filename (case-sensitive!)
3. Use correct path (e.g., `/glossary.html` not `/glossary`)

### Changes Don't Show Up
**Problem:** Browser is showing cached (old) version
**Solution:**
1. Press **Ctrl+Shift+R** (hard refresh)
2. Or open browser in incognito mode
3. Or clear browser cache

### Console Shows Firebase Errors
**Problem:** Firebase configuration might be wrong
**Solution:**
1. Check `js/firebase-init.js` has correct config
2. Verify serviceAccountKey.json is in `scripts/` folder
3. Check Firebase Console for service status

### Page Shows But Looks Broken
**Problem:** CSS or JavaScript not loading
**Solution:**
1. Open console (F12) and look for red errors
2. Check all `<link>` and `<script>` tags have correct paths
3. Verify files exist in the locations specified

---

## 📝 Testing Workflow Summary

```
1. Download latest code from GitHub
   ↓
2. Extract to comparium-live folder
   ↓
3. Open Command Prompt
   ↓
4. cd C:\Users\HarrisonKlein\Downloads\comparium-live
   ↓
5. http-server
   ↓
6. Open browser to http://localhost:8080
   ↓
7. Test your changes (use checklist above)
   ↓
8. Found bugs? Edit code → Save → Refresh browser
   ↓
9. Everything works? Stop server (Ctrl+C)
   ↓
10. Merge to main branch with confidence!
```

---

## 💡 Pro Tips

1. **Keep the server running** while you work - you can edit files and just refresh the browser

2. **Use browser console** (F12) every time - it catches errors you might miss visually

3. **Test in multiple browsers** if possible (Chrome, Firefox, Edge) - they sometimes behave differently

4. **Test mobile view** - Press F12 → click device icon → select phone/tablet

5. **Check before and after** - Test that you didn't break existing features while adding new ones

6. **Clear browser cache** if things look wrong - Press Ctrl+Shift+R for hard refresh

7. **Read error messages** - They usually tell you exactly what's wrong and where

8. **Start fresh** - If something seems weird, stop server (Ctrl+C) and start again

---

## 🎓 Learning Resources

### Understanding the Browser Console
- **What it is:** A tool that shows you what's happening behind the scenes
- **How to use:** Press F12, click Console tab, look for red errors
- **Why it matters:** Errors here tell you exactly what's broken

### Understanding Local Servers
- **What it is:** A program that runs your website on your computer
- **Why you need it:** Modern websites need a server (can't just open HTML files)
- **How it works:** http-server creates a mini web server at localhost:8080

### Understanding Testing
- **What it is:** Checking that your code works before going live
- **Why it matters:** Prevents breaking the live site
- **Best practice:** Test every change, no matter how small

---

## 📞 Quick Reference

**Start server:**
```cmd
cd C:\Users\HarrisonKlein\Downloads\comparium-live
http-server
```

**View site:**
```
http://localhost:8080
```

**Stop server:**
```
Ctrl+C
```

**Open console:**
```
F12 → Console tab
```

**Hard refresh:**
```
Ctrl+Shift+R
```

---

## ✨ Next Steps

Once you're comfortable with local testing:

1. **Update CLAUDE.md** - Add "Tested locally" to your workflow
2. **Create a pre-merge checklist** - List of things to test before merging
3. **Consider automated tests** - Scripts that test functionality automatically (future enhancement)

---

**Remember:** Testing locally gives you freedom to experiment without risk. Take your time, break things, fix them, and learn. The live site stays safe while you work!
