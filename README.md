# Comparium - Fish Species Compatibility Tool

A web-based tool for comparing freshwater aquarium fish species and checking compatibility. Includes 99 species with detailed care requirements, predation warnings, and compatibility analysis.

## 🚀 Quick Start - Get Your Website Online in 15 Minutes

### Method 1: GitHub Pages (FREE - Recommended for Beginners)

**You'll need:**
- A GitHub account (free - create at github.com)
- These website files

**Step-by-Step Instructions:**

1. **Create a GitHub Account**
   - Go to https://github.com
   - Click "Sign up" in the top right
   - Follow the steps to create your free account

2. **Create a New Repository**
   - Once logged in, click the "+" icon in the top right
   - Select "New repository"
   - Name it: `Comparium` (or any name you like)
   - ✅ Check "Public"
   - ✅ Check "Add a README file"
   - Click "Create repository"

3. **Upload Your Website Files**
   - In your new repository, click "Add file" → "Upload files"
   - Drag and drop ALL files and folders from the `Comparium-website` folder:
     - index.html
     - about.html
     - css/ folder (with styles.css inside)
     - js/ folder (with fish-data.js and app.js inside)
   - Scroll down and click "Commit changes"

4. **Enable GitHub Pages**
   - In your repository, click "Settings" (top menu)
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Under "Branch", select "main" and "/ (root)"
   - Click "Save"

5. **Get Your Website Link**
   - Wait 2-3 minutes for GitHub to build your site
   - Refresh the Settings → Pages page
   - You'll see: "Your site is published at https://yourusername.github.io/Comparium/"
   - **That's your website link!** Share it with anyone!

---

## 🌐 Getting a Custom Domain (Optional)

Your free GitHub Pages site works great at `yourusername.github.io/Comparium`, but you can get a custom domain like `Comparium.com` for about $10-15/year.

### Step 1: Buy a Domain

**Recommended Registrars:**
- **Namecheap** (easiest for beginners) - https://www.namecheap.com
- **Google Domains** - https://domains.google
- **Cloudflare** (cheapest) - https://www.cloudflare.com/products/registrar/

**What to do:**
1. Search for your desired domain (e.g., "Comparium.com")
2. Add to cart and purchase (usually $10-15/year)
3. Complete registration

### Step 2: Connect Domain to GitHub Pages

**In your domain registrar:**
1. Find "DNS Settings" or "DNS Management"
2. Add these records:

   **For root domain (Comparium.com):**
   - Type: A Record
   - Host: @
   - Value: 185.199.108.153
   - TTL: Automatic

   Add 3 more A records with these IPs:
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

   **For www subdomain (www.Comparium.com):**
   - Type: CNAME
   - Host: www
   - Value: yourusername.github.io
   - TTL: Automatic

3. Save changes

**In GitHub:**
1. Go to your repository Settings → Pages
2. Under "Custom domain", enter your domain (e.g., Comparium.com)
3. Click "Save"
4. ✅ Check "Enforce HTTPS" (wait a few minutes if it's not available yet)

**Wait 24-48 hours** for DNS propagation. Your site will then be available at your custom domain!

---

## 📊 Add Google Analytics (Track Visitors)

1. **Create Google Analytics Account**
   - Go to https://analytics.google.com
   - Sign in with your Google account
   - Click "Start measuring"
   - Fill in your website details
   - Get your Measurement ID (looks like "G-XXXXXXXXXX")

2. **Add to Your Website**
   - Open `index.html` in a text editor (Notepad, TextEdit, or VS Code)
   - Find this section near the top (around line 26):
   ```html
   <!-- Google Analytics - Replace GA_MEASUREMENT_ID with your actual ID -->
   ```
   - Remove the `<!--` at the beginning and `-->` at the end
   - Replace `GA_MEASUREMENT_ID` with your actual ID (twice)
   - Save the file
   - Upload the updated file to GitHub

3. **Repeat for about.html** so analytics tracks both pages

---

## ✏️ Customization Guide

### Change Your Email Address
**Where:** `index.html` and `about.html`
**Find:** `your-email@example.com`
**Replace with:** Your actual email address

### Change Colors
**Where:** `css/styles.css`
**Find:** (around line 16)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
**Change the color codes** to your preferred colors:
- Use a color picker: https://htmlcolorcodes.com/color-picker/

### Add Your Logo
1. Save your logo image as `logo.png`
2. Create an `images` folder in your website directory
3. Put `logo.png` inside the `images` folder
4. Open `index.html` and `about.html`
5. Find `<h1>🐠 Comparium</h1>`
6. Replace with:
   ```html
   <img src="images/logo.png" alt="Comparium Logo" style="height: 60px;">
   ```
7. Upload all files to GitHub

### Add a Favicon (Browser Tab Icon)
1. Create a 32x32 pixel icon and save as `favicon.ico`
2. Upload it to the root folder of your website (same level as index.html)
3. It will automatically appear in browser tabs!

---

## 📁 File Structure

```
Comparium-website/
├── index.html          # Main comparison page
├── about.html          # Help and information page
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── fish-data.js    # Database of 99 fish species
│   └── app.js          # Application logic
├── favicon.ico         # (You'll add this)
└── README.md           # This file
```

---

## 🐟 Adding More Fish Species

Want to add more fish to the database?

**Open:** `js/fish-data.js`

**Add a new fish** following this template:

```javascript
newFishKey: {
    commonName: "Common Name",
    scientificName: "Genus species",
    tempMin: 72,
    tempMax: 82,
    tempUnit: "°F",
    phMin: 6.5,
    phMax: 7.5,
    tankSizeMin: 20,
    tankSizeUnit: "gallons",
    maxSize: 3.0,
    sizeUnit: "inches",
    aggression: "Peaceful",
    diet: "Omnivore",
    schooling: "School of 6+",
    waterHardness: "5-15 dGH",
    lifespan: "5 years",
    careLevel: "Easy"
},
```

**Then open:** `js/app.js`

**Find the `fishCategories` object** and add your fish key to the appropriate category array.

---

## 🔧 Troubleshooting

### Website not showing up after GitHub Pages setup?
- Wait 5-10 minutes for GitHub to build your site
- Make sure you uploaded ALL files and folders
- Check that index.html is in the root directory (not in a subfolder)

### Fish categories not collapsing?
- Make sure all three JS files are uploaded correctly
- Check browser console for errors (F12 → Console tab)

### Custom domain not working?
- DNS changes can take up to 48 hours
- Double-check your A and CNAME records
- Make sure you entered the domain correctly in GitHub Settings

### Search not finding fish?
- Make sure fish-data.js uploaded correctly
- Try clearing your browser cache (Ctrl+F5)

---

## 📈 Future Enhancements (Ideas for Later)

- Add fish images for visual identification
- Create individual species profile pages
- Add a "share this comparison" button with URL parameters
- Build a full tank stocking calculator
- Add user accounts to save favorite comparisons
- Create a mobile app version

---

## 📧 Support

Questions? Issues? Suggestions?

Contact: your-email@example.com

---

## 🙏 Credits

**Data Sources:**
- SeriouslyFish.com
- Aquarium Co-Op
- FishLore
- Aqueon
- FishBase
- PlanetCatfish

**Built for aquarists, by aquarists.**

---

## 📄 License

This project is free to use and modify for personal or educational purposes. If you use this code, please credit Comparium and the original data sources.

**Important:** Fish care data is educational only. Always research thoroughly before adding fish to your aquarium.

---

## ✨ Quick Checklist

Before going live, make sure you've:

- [ ] Uploaded all files to GitHub
- [ ] Enabled GitHub Pages in repository settings
- [ ] Tested the website link
- [ ] Updated email addresses in index.html and about.html
- [ ] Added Google Analytics (optional)
- [ ] Set up custom domain (optional)
- [ ] Added favicon.ico (optional)
- [ ] Shared your website with fellow aquarists!

**Congratulations! Your website is live! 🎉**
