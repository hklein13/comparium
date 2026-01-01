# Fish Species Image System Implementation Plan

**Project:** Comparium (comparium.net)
**Created:** January 2026
**Planning Model:** Claude Opus 4.5
**Status:** Approved for Implementation

---

## Executive Summary

This plan recommends a **phased, pragmatic approach** to adding images for 143 fish species on Comparium. The recommended strategy prioritizes:

1. **Wikimedia Commons** as the primary image source - free, legally clear, high-quality images with proper licensing
2. **Firebase Storage** for image hosting - already configured in the project, generous free tier, and seamless integration
3. **Manual curation with simple tooling** - given the user's beginner level, manual image selection with a simple upload workflow is more maintainable than complex automation

The approach uses the existing architecture patterns (single source of truth, DRY principles) and extends the current `imageUrl` field already present in `fish-data.js`. Total estimated cost: **$0 for typical usage** within Firebase's free tier. Implementation can begin with ~20 priority species and scale up over time.

---

## Table of Contents

1. [Image Sourcing Strategy](#1-image-sourcing-strategy)
2. [Image Storage & Hosting](#2-image-storage--hosting)
3. [Technical Implementation](#3-technical-implementation)
4. [User Experience](#4-user-experience)
5. [Data Migration](#5-data-migration)
6. [Maintenance & Scalability](#6-maintenance--scalability)
7. [Implementation Phases](#7-implementation-phases)
8. [Risk Analysis](#8-risk-analysis)
9. [Cost Estimate](#9-cost-estimate)
10. [Specific Recommendations](#10-specific-recommendations)
11. [Alternative Image Sources](#11-alternative-image-sources)

---

## 1. Image Sourcing Strategy

### Primary Recommendation: Wikimedia Commons

**Why Wikimedia Commons is the best choice:**

| Factor | Wikimedia Commons | Stock Photo Sites | Fish Database APIs | User Uploads |
|--------|-------------------|-------------------|-------------------|--------------|
| Cost | Free | $1-10/image | Often limited/paid | Free |
| Legal clarity | Excellent (clear licenses) | Requires purchase | Variable | Risk of copyright |
| Quality | Good-Excellent | Excellent | Variable | Variable |
| Coverage | ~90% of species | ~60% | ~70% | N/A |
| Effort | Manual search | Manual search | API integration | Community building |

### Sourcing Workflow

**1. Search Priority Order:**
- Wikimedia Commons (search by scientific name, e.g., "Paracheirodon innesi")
- FishBase (links to Wikimedia images with licensing info)
- Public domain aquarium photography sites

**2. Quality Requirements:**
- Minimum resolution: 800x600 pixels (for responsive display)
- Preferred resolution: 1200x800 pixels or larger
- Clear, well-lit photograph showing species characteristics
- No watermarks or text overlays
- Fish should be the primary subject (not obscured by plants/decorations)

**3. Acceptable Licenses (in order of preference):**
- CC0 (Public Domain) - No attribution required
- CC BY (Attribution) - Attribution required
- CC BY-SA (Attribution-ShareAlike) - Attribution required
- Public Domain (PD-USGov, etc.)

**4. Attribution Requirements:**
- Store attribution data with each image
- Display credits on species detail page
- Maintain attribution spreadsheet for records

**5. Fallback Strategy for Missing Images:**
- Use category-based placeholder (silhouette by fish family)
- Display "Photo coming soon" message (current behavior)
- Prioritize commonly searched species first

### Species Prioritization for Image Collection

**Phase 1 (20 species) - Most Popular/Beginner Fish:**
- Betta Fish, Neon Tetra, Guppy, Molly, Platy, Corydoras, Angelfish, Cardinal Tetra, Cherry Barb, Zebra Danio, White Cloud Minnow, Endler's Livebearer, Swordtail, Pearl Gourami, Dwarf Gourami, Bristlenose Pleco, Kuhli Loach, Otocinclus, Siamese Algae Eater, Honey Gourami

**Phase 2 (40 species) - Popular Community Fish:**
- Remaining tetras, barbs, rasboras, livebearers

**Phase 3 (43 species) - Specialty/Advanced Fish:**
- Cichlids, loaches, rare species

**Phase 4 (40 species) - Complete Coverage:**
- Remaining species

---

## 2. Image Storage & Hosting

### Recommended Solution: Firebase Storage

**Why Firebase Storage:**

1. **Already configured** - Project has `storageBucket: "comparium-21b69.firebasestorage.app"` in firebase-init.js
2. **Free tier is generous** - 5GB storage, 1GB/day downloads
3. **Seamless integration** - Same Firebase project, consistent authentication
4. **CDN included** - Fast global delivery
5. **Simple security rules** - Already familiar pattern from Firestore

### Cost Analysis

| Usage Level | Storage | Downloads/month | Monthly Cost |
|-------------|---------|-----------------|--------------|
| 143 images at 200KB avg | ~30MB | 10,000 | **$0** (free tier) |
| 143 images at 200KB avg | ~30MB | 50,000 | **$0** (free tier) |
| 143 images at 200KB avg | ~30MB | 100,000 | ~$1-2 |

**Free tier limits (Spark plan):**
- Storage: 5GB (need only ~30-50MB)
- Downloads: 1GB/day (~5,000 image loads/day at 200KB each)
- Uploads: 1GB/day

**Conclusion:** Project will stay within free tier unless it becomes extremely popular.

### Storage Structure

```
Firebase Storage
└── fish-images/
    ├── neon-tetra.jpg           # kebab-case matching fish-data.js keys
    ├── betta-fish.jpg
    ├── angelfish.jpg
    └── ...
```

### Naming Convention
- Use kebab-case version of `fish-data.js` key
- Already have `toKebabCase()` function in `glossary-generator.js`
- Example: `neonTetra` -> `neon-tetra.jpg`

### Image Optimization Strategy

| Format | Use Case | Target Size |
|--------|----------|-------------|
| WebP | Primary (modern browsers) | 100-150KB |
| JPEG | Fallback (older browsers) | 150-200KB |

**Optimization Process (before upload):**
1. Resize to 1200x800 max
2. Convert to WebP (80% quality) and JPEG (85% quality)
3. Use WebP with JPEG fallback via `<picture>` element

**Simple Tool for User:**
- TinyPNG (https://tinypng.com) - free online compression
- Squoosh (https://squoosh.app) - free online, supports WebP

---

## 3. Technical Implementation

### 3.1 Data Structure Updates

**Option A (Recommended): Keep fish-data.js as source of truth**

Update `fish-data.js` to include Firebase Storage URLs:

```javascript
angelfish: {
    commonName: "Freshwater Angelfish",
    scientificName: "Pterophyllum scalare",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/comparium-21b69.firebasestorage.app/o/fish-images%2Fangelfish.jpg?alt=media",
    // ... other fields
}
```

**Pros:** Single source of truth, simple, no runtime lookup
**Cons:** Must update fish-data.js when adding images

**Option B: Dynamic URL generation**

Generate URLs at runtime from a convention:

```javascript
function getFishImageUrl(fishKey) {
    const kebabKey = toKebabCase(fishKey);
    return `https://firebasestorage.googleapis.com/v0/b/comparium-21b69.firebasestorage.app/o/fish-images%2F${kebabKey}.jpg?alt=media`;
}
```

**Pros:** Don't need to update fish-data.js for each image
**Cons:** Assumes image exists (need fallback handling)

**Recommendation:** Use Option A (explicit URLs) for simplicity and reliability.

### 3.2 UI Component Updates

**species-detail.js - Replace placeholder with actual image:**

```javascript
// Current (lines 64-69):
<div class="species-image-placeholder">
    <div class="image-placeholder">
        🐠
        <p>Photo coming soon!</p>
    </div>
</div>

// Updated:
<div class="species-image-container">
    ${fish.imageUrl
        ? `<img
            src="${fish.imageUrl}"
            alt="${fish.commonName}"
            class="species-image"
            loading="lazy"
            onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><span>🐠</span><p>Photo coming soon!</p></div>';"
           />`
        : `<div class="image-placeholder">
            🐠
            <p>Photo coming soon!</p>
           </div>`
    }
</div>
```

**Key Implementation Details:**

1. **Lazy Loading:** `loading="lazy"` defers loading until image is near viewport
2. **Error Handling:** `onerror` falls back to placeholder if image fails
3. **Alt Text:** Uses common name for accessibility
4. **Graceful Degradation:** Shows placeholder if `imageUrl` is null

### CSS for species images

```css
.species-image-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    background: var(--bg-secondary);
    border-radius: 12px;
    overflow: hidden;
}

.species-image {
    width: 100%;
    height: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 12px;
}

/* Loading state with skeleton */
.species-image-container.loading {
    background: linear-gradient(90deg,
        var(--bg-secondary) 25%,
        var(--bg-card) 50%,
        var(--bg-secondary) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

### 3.3 Glossary Integration

**glossary.js - Update renderEntry() method:**

The `renderEntry()` method at line 1026 should be updated to display images:

```javascript
renderEntry(entry) {
    const scientificName = entry.scientificName
        ? `<div class="glossary-item-meta">${entry.scientificName}</div>`
        : '';

    const imageHtml = entry.imageUrl
        ? `<img
            src="${entry.imageUrl}"
            alt="${entry.title}"
            class="glossary-item-image"
            loading="lazy"
            onerror="this.style.display='none';"
           />`
        : '';

    // ... rest of method
}
```

### 3.4 Performance Considerations

1. **Image Optimization:**
   - Target file size: 100-200KB per image
   - Dimensions: 1200x800 maximum
   - Format: WebP preferred, JPEG fallback

2. **Lazy Loading:**
   - Native browser lazy loading: `loading="lazy"`
   - Images below fold load only when scrolled into view

3. **Caching Strategy:**
   - Firebase Storage includes CDN caching
   - Browser cache: images cached by default
   - Consider adding version parameter if images updated: `?v=1`

4. **Responsive Images (Phase 2 enhancement):**

```html
<picture>
    <source
        media="(max-width: 600px)"
        srcset="image-400w.webp"
        type="image/webp">
    <source
        media="(max-width: 600px)"
        srcset="image-400w.jpg">
    <source
        srcset="image-800w.webp"
        type="image/webp">
    <img
        src="image-800w.jpg"
        alt="Fish name"
        loading="lazy">
</picture>
```

**Recommendation:** Start with single-size images; add responsive variants in Phase 2 if needed.

---

## 4. User Experience

### 4.1 Placeholder/Fallback Images

**Three-tier fallback strategy:**

1. **Actual image** - Display species photo from Firebase Storage
2. **Category placeholder** - Fish family silhouette (optional, Phase 2)
3. **Generic placeholder** - Current fish emoji with "Photo coming soon"

**Recommended CSS for placeholder:**

```css
.image-placeholder {
    width: 100%;
    height: 300px;
    background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #0097a7;
}

.image-placeholder span {
    font-size: 4rem;
}

.image-placeholder p {
    font-size: 1rem;
    margin-top: 1rem;
    opacity: 0.7;
}

[data-theme="dark"] .image-placeholder {
    background: linear-gradient(135deg, #1a3a3d 0%, #1a2a3a 100%);
    color: #4dd0e1;
}
```

### 4.2 Loading States

**Skeleton loader while image loads:**

```javascript
// Add loading class initially
const imageContainer = document.createElement('div');
imageContainer.className = 'species-image-container loading';

// Remove loading class when image loads
const img = new Image();
img.onload = () => imageContainer.classList.remove('loading');
img.src = fish.imageUrl;
```

### 4.3 Accessibility

1. **Alt text:** Always use species common name
2. **ARIA labels:** Add descriptive labels for screen readers
3. **Color contrast:** Ensure placeholder text is readable
4. **Focus management:** Images should not interfere with keyboard navigation

### 4.4 Image Zoom (Optional, Phase 2)

Simple lightbox for full-size viewing:

```javascript
function showImageLightbox(imageUrl, altText) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <div class="lightbox-content">
            <img src="${imageUrl}" alt="${altText}">
            <button class="lightbox-close" onclick="closeLightbox()">×</button>
        </div>
    `;
    overlay.onclick = closeLightbox;
    document.body.appendChild(overlay);
}
```

**Recommendation:** Defer lightbox to Phase 2; basic images are sufficient for MVP.

---

## 5. Data Migration

### 5.1 Firebase Storage Setup

**Security Rules for Firebase Storage:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Fish images - public read, admin write
    match /fish-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.email == 'hklein13@outlook.com';
    }
  }
}
```

### 5.2 Image Upload Workflow

**For the user (simple manual process):**

1. **Find image on Wikimedia Commons**
   - Search: `https://commons.wikimedia.org/`
   - Use scientific name for best results
   - Verify license is CC0, CC BY, or CC BY-SA

2. **Download and optimize**
   - Right-click, save full-resolution image
   - Go to https://squoosh.app
   - Resize to 1200x800 max
   - Export as JPEG at 85% quality
   - Target: under 200KB

3. **Upload to Firebase Storage**
   - Go to Firebase Console: https://console.firebase.google.com/project/comparium-21b69/storage
   - Navigate to `fish-images/` folder
   - Click "Upload file"
   - Name file: `kebab-case-key.jpg` (e.g., `neon-tetra.jpg`)

4. **Get the public URL**
   - Click on uploaded file
   - Copy the "File location" URL
   - Update `fish-data.js` with the URL

5. **Update fish-data.js**
   - Open `js/fish-data.js`
   - Find the species entry
   - Change `imageUrl: null` to `imageUrl: "copied-url"`

6. **Re-run migration (if using Firestore for glossary)**
   - Run `npm run migrate:glossary` to update Firestore entries

### 5.3 Batch Update Strategy

**Create a simple Node.js script for batch URL generation:**

```javascript
// scripts/generate-image-urls.js
import { readdirSync } from 'fs';

const BUCKET = 'comparium-21b69.firebasestorage.app';

// List all images in the fish-images folder (after upload)
const images = readdirSync('./uploaded-images');

images.forEach(filename => {
    const key = filename.replace('.jpg', '').replace('.webp', '');
    const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/fish-images%2F${filename}?alt=media`;
    console.log(`${key}: "${url}",`);
});
```

### 5.4 Firestore Migration Update

After adding image URLs to `fish-data.js`, re-run the existing migration script:

```bash
npm run migrate:glossary
```

This will update all glossary entries in Firestore with the new `imageUrl` values.

### 5.5 Testing Before Production

1. **Local testing:**
   - Start local server: `http-server`
   - Visit `http://localhost:8080/species.html?fish=neonTetra`
   - Verify image loads correctly
   - Test error fallback (temporarily use wrong URL)
   - Check dark mode appearance
   - Test on mobile viewport

2. **Verify in Firebase Console:**
   - Check storage usage
   - Verify files are publicly readable
   - Test direct URL access

3. **Checklist before merging to main:**
   - [ ] Images display on species detail page
   - [ ] Fallback placeholder shows for missing images
   - [ ] Images lazy load correctly
   - [ ] Dark mode looks correct
   - [ ] Mobile responsive
   - [ ] Alt text present for accessibility
   - [ ] No console errors

### 5.6 Rollback Plan

If issues occur after deployment:

1. **Quick fix:** Set `imageUrl: null` for problematic entries
2. **Full rollback:** Revert fish-data.js to previous commit
3. **Storage cleanup:** Delete problematic images from Firebase Storage

---

## 6. Maintenance & Scalability

### 6.1 Adding New Fish Images (Ongoing Workflow)

**Simple checklist for user:**

1. Find quality image (Wikimedia Commons preferred)
2. Verify license allows usage
3. Download, optimize (Squoosh), target <200KB
4. Upload to Firebase Storage `fish-images/` folder
5. Update `imageUrl` in `fish-data.js`
6. Run `npm run migrate:glossary` to sync Firestore
7. Test locally before merging

### 6.2 Image Update Process

If better quality image becomes available:

1. Upload new image with same filename (overwrites old)
2. Clear browser cache to see changes
3. Consider adding version parameter: `?v=2` to URL

### 6.3 Monitoring

**Manual monitoring (simple approach):**
- Periodically check Firebase Console for storage usage
- Monitor for broken images in browser console

**Automated monitoring (Phase 2):**
- Script to check all imageUrls are valid
- Alert if images return 404

### 6.4 Long-term Sustainability

| Concern | Mitigation |
|---------|------------|
| Storage costs increase | Monitor usage; optimize image sizes; consider CDN if needed |
| Images become outdated | Maintain attribution spreadsheet; periodic review |
| Broken image links | Robust error handling with fallbacks |
| Adding many new species | Documented workflow; possible automation later |

---

## 7. Implementation Phases

### Phase 1: Foundation (MVP)
**Duration:** 1-2 days of development work

**Tasks:**
1. Set up Firebase Storage security rules
2. Update `species-detail.js` to display images with fallback
3. Add CSS for image container and placeholder
4. Upload first 5 test images (popular species)
5. Update `fish-data.js` with URLs for test images
6. Test locally on all pages
7. Document the image upload workflow

**Deliverables:**
- Working image display on species detail page
- Fallback placeholder for missing images
- 5 species with actual images
- Written workflow guide for adding more

### Phase 2: Core Coverage
**Duration:** User-paced (2-4 weeks)

**Tasks:**
1. Source and upload 20 priority species images
2. Add skeleton loading animation
3. Update glossary entry display to show images
4. Create attribution tracking spreadsheet

**Deliverables:**
- 20 species with images
- Glossary shows images for species entries
- Attribution records maintained

### Phase 3: Expanded Coverage
**Duration:** User-paced (1-2 months)

**Tasks:**
1. Source remaining ~120 species images
2. Add responsive image sizes (optional)
3. Consider image zoom/lightbox feature

**Deliverables:**
- 100+ species with images
- Optional responsive images
- Optional lightbox feature

### Phase 4: Optimization (If Needed)
**Duration:** As needed

**Tasks:**
1. Implement WebP with JPEG fallback
2. Add responsive image variants
3. Optimize for Core Web Vitals
4. Consider CDN if traffic grows significantly

---

## 8. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Copyright violation** | Medium | High | Use only verified Wikimedia Commons images with clear licenses |
| **Firebase Storage costs exceed free tier** | Low | Low | Monitor usage; optimize image sizes; 143 images at 200KB = 30MB (well under 5GB limit) |
| **Image loading slows page** | Medium | Medium | Lazy loading, proper sizing, optimization |
| **Broken image URLs** | Low | Medium | Robust error handling with fallback placeholders |
| **User struggles with upload process** | Medium | Medium | Clear step-by-step documentation; simple manual process |
| **Images look bad on mobile** | Medium | Medium | Test responsive design; use object-fit: cover |
| **Wikimedia images unavailable for some species** | Medium | Low | Use placeholder; try alternative sources; prioritize common species |

---

## 9. Cost Estimate

| Item | One-Time Cost | Monthly Cost |
|------|---------------|--------------|
| Firebase Storage (free tier) | $0 | $0 |
| Image sourcing (Wikimedia Commons) | $0 | $0 |
| Image optimization (free tools) | $0 | $0 |
| Development time | User time | User time |
| **TOTAL** | **$0** | **$0** |

**Note:** Project will likely stay within Firebase free tier indefinitely. If traffic grows substantially:
- 50,000 image loads/month: Still free
- 100,000+ image loads/month: ~$1-5/month

---

## 10. Specific Recommendations

1. **Start small:** Begin with 5-10 popular species to validate the workflow before scaling up.

2. **Use Wikimedia Commons:** Best balance of quality, legality, and cost. Search by scientific name for best results.

3. **Keep images consistent:** Use similar aspect ratios (16:10 or 4:3) and similar framing for visual consistency.

4. **Optimize before upload:** Use Squoosh (free) to compress images to under 200KB. This keeps storage costs minimal and pages fast.

5. **Track attributions:** Create a simple spreadsheet with columns: Species Key, Image URL, Source URL, License, Photographer. This protects against future copyright claims.

6. **Test error handling thoroughly:** Ensure the fallback placeholder displays correctly when images fail to load.

7. **Document everything:** Create a simple guide the user can follow to add new images independently.

8. **Consider batch processing:** Once the workflow is validated, images for similar species can be processed in batches.

---

## 11. Alternative Image Sources

### Overview

While Wikimedia Commons is the primary recommendation for fish species, there are several alternative sources for different content types and edge cases. This section covers options for:

1. Fish species not on Wikimedia Commons
2. Disease/medical condition photos
3. Equipment photos
4. Plant photos
5. Other aquarium-related imagery

---

### A. Alternative Sources for Fish Species

**When Wikimedia Commons doesn't have the species:**

#### 1. FishBase (fishbase.org)
**What it is:** The world's largest fish database with 34,000+ species

**Pros:**
- Comprehensive coverage of rare/exotic species
- Scientific accuracy (maintained by researchers)
- Often links to Wikimedia images
- Provides species information for cross-referencing

**Cons:**
- Images have varying licenses (check each)
- Some images are copyrighted research photos
- Quality varies

**Usage:**
1. Search for species: `https://www.fishbase.se/`
2. Click on "Pictures" tab
3. Check license for each image (look for CC-BY or public domain)
4. Contact photographer if needed

**License types found on FishBase:**
- CC-BY (can use with attribution)
- CC-BY-SA (can use with attribution + share-alike)
- Research photos (often require permission)

#### 2. iNaturalist (inaturalist.org)
**What it is:** Community science platform with user-submitted nature photos

**Pros:**
- Excellent coverage of wild-caught fish
- High-quality photos from photographers
- Most use CC-BY or CC0 licenses
- Can filter by license type

**Cons:**
- Primarily wild fish (not always aquarium specimens)
- Quality varies (need to curate)
- Attribution required for most

**Usage:**
1. Search: `https://www.inaturalist.org/observations?taxon_name=[scientific name]`
2. Filter: Click "Filters" → "License" → select "CC0" or "CC-BY"
3. Choose best quality image
4. Download and note photographer for attribution

#### 3. Flickr (with Creative Commons filter)
**What it is:** Photo sharing platform with CC licensing options

**Pros:**
- Many aquarium hobbyists share photos
- Can filter by license type
- Often high-quality aquarium specimens
- Large collection

**Cons:**
- Need to verify license carefully
- Quality varies significantly
- Some "CC" images actually aren't (verify)

**Usage:**
1. Search: `https://www.flickr.com/search/?text=[fish name]`
2. Click "Any license" → Select "Commercial use allowed" or "Public domain"
3. Verify license on individual photo page
4. Download and attribute photographer

**IMPORTANT:** Always verify the license on the actual photo page, not just search filters.

#### 4. Public Domain Image Resources

**Biodiversity Heritage Library (biodiversitylibrary.org):**
- Historical scientific illustrations
- All public domain
- Artistic but not always photographic
- Good for vintage aesthetic

**NOAA Photo Library (noaa.gov):**
- U.S. government photos (public domain)
- Marine species coverage
- Free to use, no attribution required

**U.S. Fish & Wildlife Service Digital Library:**
- Government photos (public domain)
- Native North American species
- Free to use

#### 5. Paid Stock Photo Options (Last Resort)

**When to consider:** Rare species with no free options available

**iStock / Shutterstock:**
- Cost: $10-30 per image
- Quality: Professional
- License: Clear usage rights
- Use for: High-priority species with no free alternative

**Alamy:**
- Cost: $20-100 per image
- Quality: Very high
- License: Various options
- Use for: Premium content needs

**Recommendation:** Only purchase for critical species where free alternatives exhausted.

---

### B. Disease & Medical Condition Photos

**Unique challenges:**
- Medical photography has copyright issues
- Need accurate diagnostic photos
- Educational use may have exemptions

#### Recommended Sources:

**1. Wikimedia Commons - Medical Category**
- Search: "ich white spot disease fish"
- Many aquarium diseases documented
- Educational photos often available

**2. University & Research Institution Archives**
- Often published under CC-BY for educational use
- Contact university extension offices
- Aquaculture programs may share images

**3. Veterinary Journals (Open Access)**
- Many use CC-BY licenses
- High-quality diagnostic photos
- Search: Google Scholar + "Creative Commons fish disease"

**4. Create Your Own (Best Option)**
- Take photos of documented cases (with permission if not your fish)
- Release under CC-BY for community benefit
- Most accurate for educational purposes

**5. Partner with Aquatic Vets**
- Reach out to fish veterinarians
- Offer attribution/link exchange
- Many willing to share for educational purposes

**Example Outreach:**
> "Hi [Vet Name], I'm building a free educational resource for aquarium hobbyists at comparium.net. Would you be willing to share some diagnostic photos of common fish diseases for educational use? We'll provide full attribution and link to your practice."

---

### C. Equipment Photos

**Challenge:** Most equipment is trademarked/copyrighted product photography

#### Recommended Sources:

**1. Manufacturer Press Kits**
- Many manufacturers provide press photos for editorial use
- Contact marketing departments
- Often available for non-commercial educational use

**Example Request:**
> "Hi [Company], I'm creating an educational aquarium resource (comparium.net). May I use product photos from your press kit to help hobbyists identify equipment? I'll include your branding and link to your website."

**2. Amazon Affiliate Program**
- Amazon allows product images for affiliates
- Can earn commission on equipment sales
- Terms of service allow image use in product reviews/guides

**Process:**
1. Join Amazon Associates program (free)
2. Use product images with affiliate links
3. Disclose affiliate relationship

**3. Create Your Own**
- Photograph equipment you own
- Simple white background setup
- Most reliable long-term solution

**Setup:**
- White poster board background
- Natural window light or LED panel
- Smartphone camera (modern phones excellent for products)

**4. Alibaba/AliExpress (for generic equipment)**
- Generic equipment illustrations
- Often no copyright claims on standard items (filters, heaters, etc.)
- Not branded products

**Note:** Use only for non-branded, generic equipment types.

**5. Technical Diagrams (Public Domain)**
- Patent drawings (U.S. patents are public domain)
- Technical manuals (older equipment)
- Search: Google Patents + equipment type

---

### D. Aquatic Plant Photos

**Generally good coverage on free sources:**

#### Recommended Sources:

**1. Wikimedia Commons**
- Excellent botanical photography
- Search by scientific name (e.g., "Anubias barteri")
- Most aquarium plants well-documented

**2. Tropica Aquarium Plants (press kit)**
- World's largest aquarium plant producer
- Provides press photos
- Contact for educational use permission

**3. Plant Databases:**
- **FlowGrow (flowgrow.de)** - Aquatic plant database
- **The Planted Tank forums** - User-submitted photos (verify license)
- **APC (aquaticplantcentral.com)** - Plant profiles with photos

**4. Botanical Gardens (public domain collections)**
- Missouri Botanical Garden
- Royal Botanic Gardens, Kew
- Often have aquatic plant collections photographed

**5. Create Your Own**
- Easiest content to photograph
- Plants relatively inexpensive
- Build plant portfolio over time

---

### E. General Aquarium Imagery

**For backgrounds, aquascapes, etc.:**

**1. Pexels (pexels.com)**
- Free high-quality photos
- CC0 license (no attribution required)
- Search: "aquarium" "fish tank" "underwater"

**2. Unsplash (unsplash.com)**
- Free high-resolution photos
- Unsplash License (free for commercial use)
- Premium aesthetic quality

**3. Pixabay (pixabay.com)**
- Free images and videos
- Pixabay License (free for commercial use)
- Good for generic aquarium scenes

---

### F. Licensing Quick Reference

| License Type | Can Use? | Attribution Required? | Can Modify? | Commercial Use? |
|--------------|----------|----------------------|-------------|-----------------|
| CC0 / Public Domain | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| CC-BY | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| CC-BY-SA | ✅ Yes | ✅ Yes | ✅ Yes (must share alike) | ✅ Yes |
| CC-BY-NC | ⚠️ Maybe | ✅ Yes | ✅ Yes | ❌ No (non-commercial only) |
| CC-BY-ND | ⚠️ Maybe | ✅ Yes | ❌ No | ✅ Yes |
| Copyright / All Rights Reserved | ❌ No | N/A | ❌ No | ❌ No |

**Recommendation:** Stick to CC0, CC-BY, and CC-BY-SA for simplest compliance.

---

### G. Attribution Best Practices

**Create an Attribution Spreadsheet:**

| Content Type | Item Name | Image URL | Source | License | Photographer/Creator | Attribution Text |
|--------------|-----------|-----------|--------|---------|---------------------|------------------|
| Fish | Neon Tetra | firebase.url | Wikimedia | CC-BY | John Doe | Photo by John Doe (CC-BY) |
| Disease | Ich | firebase.url | iNaturalist | CC-BY | Jane Smith | Photo by Jane Smith (CC-BY) via iNaturalist |
| Equipment | Canister Filter | firebase.url | Own Photo | CC0 | Comparium | Original photo |

**Display Attribution:**
- On species detail page (small text below image)
- On dedicated "Photo Credits" page
- In image alt text when appropriate

**Example Attribution Display:**

```html
<div class="image-attribution">
    Photo: <a href="[source-url]">Photographer Name</a>
    (<a href="[license-url]">CC-BY</a>)
</div>
```

---

### H. Species Without Available Images

**Fallback Strategy Hierarchy:**

1. **Related species placeholder**
   - Use similar fish from same genus
   - Label: "Representative image: [similar species]"
   - Example: No Corydoras julii → use Corydoras paleatus

2. **Scientific illustration**
   - Search Biodiversity Heritage Library
   - Historical illustrations often available
   - Artistic alternative to photo

3. **Silhouette by family**
   - Create simple SVG silhouettes
   - Cichlid shape, tetra shape, etc.
   - Professional placeholder

4. **Generic placeholder**
   - Current "Photo coming soon" approach
   - Most honest when no alternative exists

**Example Silhouette Sources:**
- Noun Project (many free SVGs with attribution)
- Flaticon (free with attribution)
- Create custom with Inkscape (free tool)

---

### I. Copyright Risk Mitigation

**To minimize legal risk:**

1. **Document everything**
   - Save source URL for each image
   - Screenshot license page
   - Keep attribution spreadsheet updated

2. **When in doubt, reach out**
   - Contact photographer/creator
   - Get permission in writing (email is fine)
   - Offer attribution/link exchange

3. **Respond quickly to takedown requests**
   - Include contact email on site
   - Remove image immediately if requested
   - Replace with alternative

4. **Review periodically**
   - Check links still work annually
   - Verify licenses haven't changed
   - Update attributions as needed

5. **Consider disclaimers**
   - "All images used with permission or under Creative Commons licenses"
   - "Contact us if you believe your copyright has been violated"

---

### J. Recommended Workflow for Non-Wikimedia Content

**For Disease Photos:**
1. Search Wikimedia Commons first
2. Search Google Scholar + "Creative Commons"
3. Contact aquatic veterinarians
4. Consider creating own documentation

**For Equipment:**
1. Join Amazon Associates
2. Request manufacturer press kits
3. Photograph own equipment
4. Use only if can obtain clear license

**For Plants:**
1. Wikimedia Commons (excellent coverage)
2. Contact Tropica for press kit
3. Photograph own plants (easiest)

**For Rare Fish:**
1. FishBase + check individual licenses
2. iNaturalist with CC filter
3. Flickr with CC filter
4. Consider offering photographer credit + site exposure in exchange for permission

---

### K. Long-term Strategy

**Phase 1:** Wikimedia Commons only (lowest risk, fastest implementation)

**Phase 2:** Expand to iNaturalist, FishBase for gaps

**Phase 3:** Partner outreach (manufacturers, vets, researchers)

**Phase 4:** Build original content library (photograph own specimens)

**Phase 5:** Community contributions (with rights agreement)

---

### L. Community Contributions (Future)

**If you want user-submitted photos eventually:**

**Requirements:**
1. Upload form with license agreement
2. User grants irrevocable license to use
3. User confirms they own rights
4. Moderation before publication
5. Attribution to contributor

**Example License Agreement:**
> "By uploading this image, I confirm that I am the copyright holder and grant Comparium a non-exclusive, royalty-free, worldwide license to use this image. I understand my contribution will be credited as [username]."

**Pros:**
- Free, unlimited content
- Community engagement
- Species coverage for rare fish

**Cons:**
- Need moderation system
- Copyright verification difficult
- Quality control required

**Recommendation:** Consider only after establishing baseline with verified free images.

---

## Summary Table: Best Sources by Content Type

| Content Type | 1st Choice | 2nd Choice | 3rd Choice | Last Resort |
|--------------|------------|------------|------------|-------------|
| **Common Fish** | Wikimedia Commons | iNaturalist (CC filter) | Flickr (CC filter) | Stock photo purchase |
| **Rare Fish** | FishBase (check license) | iNaturalist | Contact researchers | Commission photography |
| **Diseases** | Wikimedia Commons | University archives | Vet partnerships | Create own |
| **Equipment** | Manufacturer press kits | Amazon Associates | Own photos | Generic diagrams |
| **Plants** | Wikimedia Commons | Tropica press kit | Own photos | Botanical databases |
| **Backgrounds** | Pexels/Unsplash | Own photos | Wikimedia Commons | Stock photos |

---

## Critical Files for Implementation

| File | Purpose |
|------|---------|
| `/home/user/comparium/js/fish-data.js` | Update `imageUrl` fields with Firebase Storage URLs (single source of truth) |
| `/home/user/comparium/js/species-detail.js` | Modify `loadSpeciesDetail()` function to display images with fallback handling |
| `/home/user/comparium/js/glossary.js` | Update `renderEntry()` method to show species images in glossary |
| `/home/user/comparium/species.html` | Add CSS for image container, loading states, and placeholders |
| `/home/user/comparium/scripts/migrate-glossary-to-firestore.js` | Re-run after updating fish-data.js to sync images to Firestore |
| `Firebase Storage Rules` | Configure security rules for fish-images folder |
| `Attribution Spreadsheet` | Track all image sources, licenses, and photographers |

---

## Appendix: Useful Links

### Image Sources
- Wikimedia Commons: https://commons.wikimedia.org/
- FishBase: https://www.fishbase.se/
- iNaturalist: https://www.inaturalist.org/
- Flickr CC Search: https://www.flickr.com/creativecommons/
- Pexels: https://www.pexels.com/
- Unsplash: https://unsplash.com/
- Biodiversity Heritage Library: https://www.biodiversitylibrary.org/

### Tools
- Squoosh (image optimization): https://squoosh.app/
- TinyPNG (compression): https://tinypng.com/
- Inkscape (SVG editor): https://inkscape.org/

### License Information
- Creative Commons Licenses: https://creativecommons.org/licenses/
- License Compatibility: https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/

### Firebase
- Firebase Console: https://console.firebase.google.com/project/comparium-21b69
- Firebase Storage Documentation: https://firebase.google.com/docs/storage

---

**End of Plan - Ready for Implementation**
