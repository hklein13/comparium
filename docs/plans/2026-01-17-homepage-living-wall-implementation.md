# Homepage "Living Wall" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current homepage sections with a dynamic Pinterest-style mosaic grid.

**Architecture:** A new `homepage-mosaic.js` script fetches community content (tanks, posts) and species data, applies tile selection logic with fallbacks, and renders a CSS Grid mosaic. The mosaic always looks full regardless of community content volume.

**Tech Stack:** Vanilla JavaScript, CSS Grid, existing Firebase APIs (`publicTankManager.getPublicTanks`, `firestoreGetPosts`), `fishDatabase` from fish-data.js.

---

## Task 1: Add Mosaic CSS Grid Styles

**Files:**
- Modify: `css/naturalist.css` (append at end, ~line 8500+)

**Step 1: Add the mosaic section and grid styles**

Add to end of `css/naturalist.css`:

```css
/* ==========================================================================
   HOMEPAGE MOSAIC - Living Wall
   ========================================================================== */

.mosaic-section {
  padding: 4rem 2rem;
  background: var(--ivory);
}

.mosaic-intro {
  text-align: center;
  margin-bottom: 3rem;
}

.mosaic-intro h2 {
  font-family: var(--font-serif);
  font-size: 2rem;
  color: var(--ink);
  margin-bottom: 0.5rem;
}

.mosaic-intro p {
  color: var(--ink-secondary);
  font-size: 1.1rem;
}

.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsive grid */
@media (max-width: 1024px) {
  .mosaic-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .mosaic-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .mosaic-grid {
    grid-template-columns: 1fr;
  }

  .mosaic-section {
    padding: 2rem 1rem;
  }
}
```

**Step 2: Verify CSS is valid**

Run: `npm run lint`
Expected: No errors related to CSS (linter only checks JS)

**Step 3: Commit**

```bash
git add css/naturalist.css
git commit -m "style(homepage): Add mosaic grid layout styles"
```

---

## Task 2: Add Mosaic Tile Styles

**Files:**
- Modify: `css/naturalist.css` (append after Task 1 styles)

**Step 1: Add tile base and size modifier styles**

```css
/* Tile base styles */
.mosaic-tile {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  min-height: 200px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mosaic-tile:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.mosaic-tile:focus {
  outline: 2px solid var(--forest);
  outline-offset: 2px;
}

/* Tile size modifiers */
.mosaic-tile--wide {
  grid-column: span 2;
}

.mosaic-tile--large {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 420px;
}

@media (max-width: 768px) {
  .mosaic-tile--large {
    grid-column: span 2;
    grid-row: span 1;
    min-height: 280px;
  }
}

@media (max-width: 480px) {
  .mosaic-tile--wide,
  .mosaic-tile--large {
    grid-column: span 1;
    grid-row: span 1;
    min-height: 200px;
  }
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(homepage): Add mosaic tile base and size styles"
```

---

## Task 3: Add Image Tile Styles (Tank, Species)

**Files:**
- Modify: `css/naturalist.css` (append after Task 2 styles)

**Step 1: Add image tile styles with overlay**

```css
/* Image tiles (tank photos, species) */
.mosaic-tile--image {
  background-size: cover;
  background-position: center;
  cursor: pointer;
}

.mosaic-tile--image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
  pointer-events: none;
}

.mosaic-tile--image:hover .mosaic-tile__image {
  transform: scale(1.05);
}

.mosaic-tile__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mosaic-tile__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 1;
  color: #fff;
}

.mosaic-tile__title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.mosaic-tile__subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.mosaic-tile__tag {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(homepage): Add image tile styles with overlay"
```

---

## Task 4: Add Post Preview and Tool Tile Styles

**Files:**
- Modify: `css/naturalist.css` (append after Task 3 styles)

**Step 1: Add text-based tile styles**

```css
/* Post preview tiles */
.mosaic-tile--post {
  background: var(--white);
  border: 1px solid var(--border);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.mosaic-tile--post:hover {
  border-color: var(--forest);
}

.mosaic-tile--post .mosaic-tile__category {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--forest);
  margin-bottom: 0.5rem;
}

.mosaic-tile--post .mosaic-tile__text {
  font-size: 0.95rem;
  color: var(--ink);
  line-height: 1.5;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mosaic-tile--post .mosaic-tile__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--ink-secondary);
}

/* Tool shortcut tiles */
.mosaic-tile--tool {
  background: var(--stone);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  cursor: pointer;
  text-decoration: none;
  color: var(--ink);
}

.mosaic-tile--tool:hover {
  background: #e8e6e1;
}

.mosaic-tile--tool .mosaic-tile__icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.mosaic-tile--tool .mosaic-tile__title {
  font-family: var(--font-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
  text-shadow: none;
  margin-bottom: 0.25rem;
}

.mosaic-tile--tool .mosaic-tile__subtitle {
  font-size: 0.85rem;
  color: var(--ink-secondary);
  text-shadow: none;
}
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(homepage): Add post and tool tile styles"
```

---

## Task 5: Add Join CTA Tile Styles

**Files:**
- Modify: `css/naturalist.css` (append after Task 4 styles)

**Step 1: Add CTA tile styles**

```css
/* Join CTA tile */
.mosaic-tile--cta {
  background: var(--forest);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1.5rem;
  cursor: pointer;
}

.mosaic-tile--cta:hover {
  background: #1e3f32;
  box-shadow: 0 8px 24px rgba(35, 74, 58, 0.3);
}

.mosaic-tile--cta .mosaic-tile__title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  text-shadow: none;
  margin-bottom: 0.5rem;
}

.mosaic-tile--cta .mosaic-tile__subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.85);
  text-shadow: none;
  margin-bottom: 1rem;
}

.mosaic-tile--cta .btn {
  background: #fff;
  color: var(--forest);
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;
}

.mosaic-tile--cta .btn:hover {
  background: var(--ivory);
}

/* Staggered fade-in animation */
@keyframes mosaicFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mosaic-tile {
  opacity: 0;
  animation: mosaicFadeIn 0.4s ease forwards;
}

.mosaic-tile:nth-child(1) { animation-delay: 0ms; }
.mosaic-tile:nth-child(2) { animation-delay: 50ms; }
.mosaic-tile:nth-child(3) { animation-delay: 100ms; }
.mosaic-tile:nth-child(4) { animation-delay: 150ms; }
.mosaic-tile:nth-child(5) { animation-delay: 200ms; }
.mosaic-tile:nth-child(6) { animation-delay: 250ms; }
.mosaic-tile:nth-child(7) { animation-delay: 300ms; }
.mosaic-tile:nth-child(8) { animation-delay: 350ms; }
.mosaic-tile:nth-child(9) { animation-delay: 400ms; }
.mosaic-tile:nth-child(10) { animation-delay: 450ms; }
.mosaic-tile:nth-child(11) { animation-delay: 500ms; }
.mosaic-tile:nth-child(12) { animation-delay: 550ms; }
```

**Step 2: Commit**

```bash
git add css/naturalist.css
git commit -m "style(homepage): Add CTA tile and fade-in animation"
```

---

## Task 6: Create Homepage Mosaic JavaScript - Data Fetching

**Files:**
- Create: `js/homepage-mosaic.js`

**Step 1: Create the file with data fetching functions**

```javascript
/**
 * Homepage Mosaic - Living Wall
 * Fetches community content and renders a dynamic tile grid
 *
 * Dependencies:
 * - firebase-init.js (firestoreGetPosts)
 * - public-tank-manager.js (publicTankManager.getPublicTanks)
 * - fish-data.js (fishDatabase)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const MOSAIC_CONFIG = {
  TARGET_TILES: 12,
  MAX_TANKS: 4,
  MAX_POSTS: 3,
  COMMUNITY_SLOTS: 7, // 12 total - 5 fixed (spotlight, cta, 3 tools)
};

// Featured species for spotlight (curated list - rotate or pick randomly)
const FEATURED_SPECIES = [
  'cardinalTetra',
  'bettaFish',
  'angelfish',
  'discus',
  'pearlGourami',
  'germanBlueRam',
];

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch public tanks with cover photos for mosaic
 * @param {number} maxCount - Maximum tanks to fetch
 * @returns {Promise<Array>} Array of tank objects
 */
async function fetchPublicTanks(maxCount) {
  if (!window.publicTankManager) {
    return [];
  }

  try {
    const result = await window.publicTankManager.getPublicTanks({
      limit: maxCount,
      sortBy: 'newest'
    });

    if (!result.success) {
      return [];
    }

    // Filter to only tanks with cover photos
    return result.tanks.filter(tank => tank.coverPhoto);
  } catch (e) {
    console.error('Failed to fetch tanks:', e);
    return [];
  }
}

/**
 * Fetch recent public posts for mosaic
 * @param {number} maxCount - Maximum posts to fetch
 * @returns {Promise<Array>} Array of post objects
 */
async function fetchRecentPosts(maxCount) {
  if (!window.firestoreGetPosts) {
    return [];
  }

  try {
    const result = await window.firestoreGetPosts({
      limit: maxCount,
      sortBy: 'newest'
    });

    if (!result.success) {
      return [];
    }

    // Exclude posts that are just tank shares (they show as tank tiles)
    return result.posts.filter(post => post.category !== 'tanks');
  } catch (e) {
    console.error('Failed to fetch posts:', e);
    return [];
  }
}

/**
 * Get random species with images from fishDatabase
 * @param {number} count - Number of species to return
 * @returns {Array} Array of species objects with key and data
 */
function getRandomSpeciesWithImages(count) {
  if (!window.fishDatabase) {
    return [];
  }

  const speciesWithImages = Object.entries(window.fishDatabase)
    .filter(([key, data]) => data.image)
    .map(([key, data]) => ({ key, ...data }));

  // Shuffle and take count
  const shuffled = speciesWithImages.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get a featured species for the spotlight tile
 * @returns {object|null} Species object with key and data
 */
function getFeaturedSpecies() {
  if (!window.fishDatabase) {
    return null;
  }

  // Pick random from curated list
  const randomKey = FEATURED_SPECIES[Math.floor(Math.random() * FEATURED_SPECIES.length)];
  const species = window.fishDatabase[randomKey];

  if (species && species.image) {
    return { key: randomKey, ...species };
  }

  // Fallback to any species with image
  const fallback = getRandomSpeciesWithImages(1);
  return fallback[0] || null;
}
```

**Step 2: Verify no syntax errors**

Run: `npm run lint`
Expected: PASS or only unrelated warnings

**Step 3: Commit**

```bash
git add js/homepage-mosaic.js
git commit -m "feat(homepage): Add mosaic data fetching functions"
```

---

## Task 7: Add Tile Building Logic

**Files:**
- Modify: `js/homepage-mosaic.js` (append after data fetching)

**Step 1: Add tile building functions**

Append to `js/homepage-mosaic.js`:

```javascript

// ============================================================================
// TILE BUILDING
// ============================================================================

/**
 * Build the complete mosaic tiles array
 * Handles priority: community content first, species fallback
 * @returns {Promise<Array>} Array of tile objects ready for rendering
 */
async function buildMosaicTiles() {
  // 1. Fetch community content in parallel
  const [tanks, posts] = await Promise.all([
    fetchPublicTanks(MOSAIC_CONFIG.MAX_TANKS),
    fetchRecentPosts(MOSAIC_CONFIG.MAX_POSTS)
  ]);

  // 2. Build fixed tiles
  const spotlight = getFeaturedSpecies();
  const fixedTiles = [
    {
      type: 'spotlight',
      size: 'large',
      data: spotlight,
      position: 0
    },
    {
      type: 'tool',
      size: 'small',
      data: { name: 'Compare Species', tagline: 'Check compatibility', href: 'compare.html', icon: '⚖️' },
      position: 3
    },
    {
      type: 'cta',
      size: 'wide',
      data: { title: 'Join the Community', tagline: 'Share your tanks and connect with aquarists' },
      position: 5
    },
    {
      type: 'tool',
      size: 'small',
      data: { name: 'Browse Glossary', tagline: 'Fish encyclopedia', href: 'glossary.html', icon: '📖' },
      position: 8
    },
    {
      type: 'tool',
      size: 'small',
      data: { name: 'Explore Plants', tagline: 'Aquatic plants guide', href: 'glossary.html?category=plants', icon: '🌿' },
      position: 11
    }
  ];

  // 3. Build community tiles
  const communityTiles = [];

  // Add tank tiles (alternate between small and wide)
  tanks.forEach((tank, i) => {
    communityTiles.push({
      type: 'tank',
      size: i % 2 === 0 ? 'small' : 'wide',
      data: tank
    });
  });

  // Add post tiles
  posts.forEach(post => {
    communityTiles.push({
      type: 'post',
      size: 'small',
      data: post
    });
  });

  // 4. Calculate backfill needed
  const filledSlots = communityTiles.length;
  const backfillNeeded = MOSAIC_CONFIG.COMMUNITY_SLOTS - filledSlots;

  // 5. Backfill with species previews
  if (backfillNeeded > 0) {
    const speciesPreviews = getRandomSpeciesWithImages(backfillNeeded);
    speciesPreviews.forEach(species => {
      communityTiles.push({
        type: 'species',
        size: 'small',
        data: species
      });
    });
  }

  // 6. Shuffle community tiles for organic feel
  const shuffledCommunity = communityTiles.sort(() => Math.random() - 0.5);

  // 7. Merge fixed and community tiles at positions
  const allTiles = [];
  let communityIndex = 0;

  for (let i = 0; i < MOSAIC_CONFIG.TARGET_TILES; i++) {
    const fixedTile = fixedTiles.find(t => t.position === i);
    if (fixedTile) {
      allTiles.push(fixedTile);
    } else if (communityIndex < shuffledCommunity.length) {
      allTiles.push(shuffledCommunity[communityIndex]);
      communityIndex++;
    }
  }

  return allTiles;
}

// Export for use
window.buildMosaicTiles = buildMosaicTiles;
```

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Commit**

```bash
git add js/homepage-mosaic.js
git commit -m "feat(homepage): Add mosaic tile building logic with fallbacks"
```

---

## Task 8: Add Tile Rendering Functions

**Files:**
- Modify: `js/homepage-mosaic.js` (append after tile building)

**Step 1: Add rendering functions**

Append to `js/homepage-mosaic.js`:

```javascript

// ============================================================================
// TILE RENDERING
// ============================================================================

/**
 * Render a single tile to HTML
 * @param {object} tile - Tile object with type, size, data
 * @returns {string} HTML string
 */
function renderTile(tile) {
  const sizeClass = tile.size === 'large' ? 'mosaic-tile--large' :
                    tile.size === 'wide' ? 'mosaic-tile--wide' : '';

  switch (tile.type) {
    case 'spotlight':
      return renderSpotlightTile(tile.data, sizeClass);
    case 'tank':
      return renderTankTile(tile.data, sizeClass);
    case 'species':
      return renderSpeciesTile(tile.data, sizeClass);
    case 'post':
      return renderPostTile(tile.data, sizeClass);
    case 'tool':
      return renderToolTile(tile.data, sizeClass);
    case 'cta':
      return renderCtaTile(tile.data, sizeClass);
    default:
      return '';
  }
}

function renderSpotlightTile(species, sizeClass) {
  if (!species) return '';

  const name = species.commonName || species.key;
  const scientific = species.scientificName || '';
  const tagline = getSpeciesTagline(species);

  return `
    <a href="species.html?species=${species.key}" class="mosaic-tile mosaic-tile--image ${sizeClass}">
      <img src="${species.image}" alt="${name}" class="mosaic-tile__image" loading="lazy">
      <div class="mosaic-tile__content">
        <div class="mosaic-tile__title">${escapeHtml(name)}</div>
        <div class="mosaic-tile__subtitle">${escapeHtml(scientific)}</div>
        <span class="mosaic-tile__tag">${escapeHtml(tagline)}</span>
      </div>
    </a>
  `;
}

function renderTankTile(tank, sizeClass) {
  const name = tank.name || 'Unnamed Tank';
  const owner = tank.username || 'Anonymous';

  return `
    <a href="tank.html?id=${tank.tankId || tank.id}" class="mosaic-tile mosaic-tile--image ${sizeClass}">
      <img src="${tank.coverPhoto}" alt="${escapeHtml(name)}" class="mosaic-tile__image" loading="lazy">
      <div class="mosaic-tile__content">
        <div class="mosaic-tile__title">${escapeHtml(name)}</div>
        <div class="mosaic-tile__subtitle">by ${escapeHtml(owner)}</div>
      </div>
    </a>
  `;
}

function renderSpeciesTile(species, sizeClass) {
  const name = species.commonName || species.key;
  const careLevel = species.careLevel || 'Easy';

  return `
    <a href="species.html?species=${species.key}" class="mosaic-tile mosaic-tile--image ${sizeClass}">
      <img src="${species.image}" alt="${name}" class="mosaic-tile__image" loading="lazy">
      <div class="mosaic-tile__content">
        <div class="mosaic-tile__title">${escapeHtml(name)}</div>
        <span class="mosaic-tile__tag">${escapeHtml(careLevel)}</span>
      </div>
    </a>
  `;
}

function renderPostTile(post, sizeClass) {
  const category = post.category || 'general';
  const content = post.content || '';
  const author = post.author?.username || 'Anonymous';
  const likes = post.stats?.likeCount || 0;

  return `
    <a href="post.html?id=${post.id}" class="mosaic-tile mosaic-tile--post ${sizeClass}">
      <div class="mosaic-tile__category">${escapeHtml(category)}</div>
      <div class="mosaic-tile__text">${escapeHtml(content)}</div>
      <div class="mosaic-tile__meta">
        <span>${escapeHtml(author)}</span>
        <span>${likes > 0 ? likes + ' likes' : ''}</span>
      </div>
    </a>
  `;
}

function renderToolTile(tool, sizeClass) {
  return `
    <a href="${tool.href}" class="mosaic-tile mosaic-tile--tool ${sizeClass}">
      <div class="mosaic-tile__icon">${tool.icon}</div>
      <div class="mosaic-tile__title">${escapeHtml(tool.name)}</div>
      <div class="mosaic-tile__subtitle">${escapeHtml(tool.tagline)}</div>
    </a>
  `;
}

function renderCtaTile(cta, sizeClass) {
  return `
    <div class="mosaic-tile mosaic-tile--cta ${sizeClass}">
      <div class="mosaic-tile__title">${escapeHtml(cta.title)}</div>
      <div class="mosaic-tile__subtitle">${escapeHtml(cta.tagline)}</div>
      <a href="signup.html" class="btn">Sign Up Free</a>
    </div>
  `;
}

// ============================================================================
// HELPERS
// ============================================================================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getSpeciesTagline(species) {
  if (species.temperament === 'peaceful') return 'Community Favorite';
  if (species.careLevel === 'Easy') return 'Beginner Friendly';
  if (species.origin) return species.origin;
  return 'Featured Species';
}
```

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Commit**

```bash
git add js/homepage-mosaic.js
git commit -m "feat(homepage): Add mosaic tile rendering functions"
```

---

## Task 9: Add Mosaic Initialization

**Files:**
- Modify: `js/homepage-mosaic.js` (append at end)

**Step 1: Add init function**

Append to `js/homepage-mosaic.js`:

```javascript

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize and render the mosaic grid
 */
async function initMosaic() {
  const container = document.getElementById('mosaic-grid');
  if (!container) {
    return; // Not on homepage
  }

  // Show loading state
  container.innerHTML = '<div class="mosaic-loading">Loading...</div>';

  try {
    // Wait for Firebase to initialize (may not be ready immediately)
    await waitForFirebase();

    // Build and render tiles
    const tiles = await buildMosaicTiles();
    const html = tiles.map(tile => renderTile(tile)).join('');
    container.innerHTML = html;
  } catch (e) {
    console.error('Mosaic init failed:', e);
    // Fallback: render species-only tiles
    renderFallbackMosaic(container);
  }
}

/**
 * Wait for Firebase to be available
 * @returns {Promise<void>}
 */
function waitForFirebase() {
  return new Promise((resolve) => {
    if (window.firebaseFirestore) {
      resolve();
      return;
    }

    // Check periodically for up to 3 seconds
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.firebaseFirestore || attempts > 30) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

/**
 * Render fallback mosaic when Firebase unavailable
 * Uses only local fish-data.js
 */
function renderFallbackMosaic(container) {
  const spotlight = getFeaturedSpecies();
  const speciesTiles = getRandomSpeciesWithImages(6);

  const tiles = [
    { type: 'spotlight', size: 'large', data: spotlight },
    { type: 'tool', size: 'small', data: { name: 'Compare Species', tagline: 'Check compatibility', href: 'compare.html', icon: '⚖️' } },
    ...speciesTiles.map(s => ({ type: 'species', size: 'small', data: s })),
    { type: 'cta', size: 'wide', data: { title: 'Join the Community', tagline: 'Share your tanks and connect with aquarists' } },
    { type: 'tool', size: 'small', data: { name: 'Browse Glossary', tagline: 'Fish encyclopedia', href: 'glossary.html', icon: '📖' } },
    { type: 'tool', size: 'small', data: { name: 'Explore Plants', tagline: 'Aquatic plants guide', href: 'glossary.html?category=plants', icon: '🌿' } },
  ];

  const html = tiles.map(tile => renderTile(tile)).join('');
  container.innerHTML = html;
}

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMosaic);
} else {
  initMosaic();
}
```

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 3: Commit**

```bash
git add js/homepage-mosaic.js
git commit -m "feat(homepage): Add mosaic initialization with fallback"
```

---

## Task 10: Update index.html - Remove Old Sections

**Files:**
- Modify: `index.html`

**Step 1: Remove the three old sections**

In `index.html`, delete these sections (approximately lines 95-188):
- `<!-- Demo Preview Section -->` (lines 95-105)
- `<!-- Browse Database Categories -->` (lines 107-128)
- `<!-- Explore by Origin Section -->` (lines 130-188)

Keep:
- Header
- Hero Video section
- Footer

**Step 2: Add the new mosaic section**

After the hero video closing `</section>` tag (around line 93), add:

```html

    <!-- Mosaic Section -->
    <section class="mosaic-section">
      <div class="mosaic-intro">
        <h2>See what the community is building</h2>
        <p>Tanks, tips, and species from aquarists like you</p>
      </div>
      <div id="mosaic-grid" class="mosaic-grid">
        <!-- Tiles rendered by homepage-mosaic.js -->
      </div>
    </section>
```

**Step 3: Add the mosaic script before closing body tag**

Before `</body>`, add:

```html
    <script src="js/homepage-mosaic.js"></script>
```

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(homepage): Replace old sections with mosaic grid"
```

---

## Task 11: Visual Testing

**Files:** None (manual testing)

**Step 1: Start local server**

```bash
cd .worktrees/homepage-living-wall
http-server -c-1
```

**Step 2: Test in browser**

Open: `http://localhost:8080`

**Verify:**
- [ ] Hero video still plays
- [ ] Mosaic grid appears below hero
- [ ] Tiles fade in with stagger animation
- [ ] 12 tiles visible (spotlight + tools + species fallbacks)
- [ ] Tiles are clickable and link correctly
- [ ] Hover effects work (scale, shadow)
- [ ] Responsive: resize browser to check 4→3→2→1 columns

**Step 3: Test mobile**

Use browser dev tools (F12) → Toggle device toolbar
Check at:
- 375px (iPhone SE)
- 768px (iPad)
- 1024px (laptop)

**Step 4: Document any issues**

If issues found, fix before proceeding.

---

## Task 12: Run Automated Tests

**Files:** None

**Step 1: Run Playwright tests**

```bash
npm test
```

**Step 2: Verify homepage tests pass**

Expected: Tests that load index.html should still pass.
The homepage structure changed, so if any tests assert on removed elements, they need updating.

**Step 3: Run lint**

```bash
npm run lint
```

Expected: PASS

**Step 4: Run format check**

```bash
npm run format:check
```

If fails, run: `npm run format`

---

## Task 13: Final Commit and Push

**Files:** All changes

**Step 1: Check status**

```bash
git status
```

**Step 2: Ensure all changes committed**

If any uncommitted files:
```bash
git add .
git commit -m "chore(homepage): Final cleanup and formatting"
```

**Step 3: Push to remote**

```bash
git push -u origin claude/homepage-living-wall
```

**Step 4: Report ready for PR**

Branch `claude/homepage-living-wall` is ready for pull request.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Mosaic grid CSS | naturalist.css |
| 2 | Tile base CSS | naturalist.css |
| 3 | Image tile CSS | naturalist.css |
| 4 | Post/tool tile CSS | naturalist.css |
| 5 | CTA tile + animation CSS | naturalist.css |
| 6 | JS: Data fetching | homepage-mosaic.js |
| 7 | JS: Tile building | homepage-mosaic.js |
| 8 | JS: Tile rendering | homepage-mosaic.js |
| 9 | JS: Initialization | homepage-mosaic.js |
| 10 | HTML: Replace sections | index.html |
| 11 | Visual testing | (manual) |
| 12 | Automated tests | (npm test) |
| 13 | Push branch | (git) |
