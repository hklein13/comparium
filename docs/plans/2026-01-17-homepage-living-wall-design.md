# Homepage "Living Wall" Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create implementation plan.

**Goal:** Replace the current template-style homepage with a dynamic Pinterest-style mosaic that feels like a living community.

**Design Approved:** 2026-01-17

---

## Design Principles

- **Feeling:** "This is a living community" - active, human, not a brochure
- **Content Mix:** 20-30% live community content, rest is database/tools
- **Primary CTA:** Join the community (signup)
- **Layout:** Dynamic mosaic with mixed-size tiles
- **Tools Access:** Integrated into mosaic, not separate sections

---

## Page Structure

```
┌─────────────────────────────────────────┐
│            HEADER (unchanged)            │
├─────────────────────────────────────────┤
│                                         │
│         HERO VIDEO (unchanged)          │
│     "The place for all things aquarium" │
│          [Get Started] button           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│     SECTION INTRO (new, minimal)        │
│  "See what the community is building"   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────┬─────────┬─────┐               │
│  │     │         │     │               │
│  │ tile│  tile   │tile │               │
│  │     │         │     │               │
│  ├─────┴────┬────┴─────┤    MOSAIC     │
│  │          │          │    GRID       │
│  │   tile   │   tile   │               │
│  │          │          │               │
│  ├────┬─────┴─────┬────┤               │
│  │tile│   tile    │tile│               │
│  └────┴───────────┴────┘               │
│                                         │
├─────────────────────────────────────────┤
│            FOOTER (unchanged)           │
└─────────────────────────────────────────┘
```

**Sections Removed:**
- "Demo Preview Section" (See how it works)
- "Browse Database" cards
- "Explore by Origin" cards

**Sections Added:**
- Minimal intro text above mosaic
- Unified mosaic grid

---

## Mosaic Tile Types

### 1. Tank Photo Tiles (community content)
- **Source:** Recent public tanks with cover photos
- **Display:** Full-bleed image, tank name overlay at bottom, author username
- **Click:** Goes to tank detail page (`tank.html?id=...`)
- **Sizes:** 1x1 (small) and 2x1 (wide)

### 2. Post Preview Tiles (community content)
- **Source:** Recent posts from community feed
- **Display:** Post text snippet (2-3 lines), category tag, author, like count
- **Click:** Opens post detail or community page
- **Size:** 1x1 only

### 3. Species Spotlight Tile (editorial)
- **Source:** Featured species (curated or rotated)
- **Display:** Large fish image, species name, one-line hook
- **Click:** Goes to species detail page
- **Size:** 2x2 (large anchor tile) - only one in grid

### 4. Tool Shortcut Tiles (navigation)
- **Types:** "Compare Species", "Browse Glossary", "Explore Plants"
- **Display:** Icon or illustration, tool name, brief tagline
- **Click:** Goes to respective tool page
- **Size:** 1x1 (scattered through grid)

### 5. Join CTA Tile (conversion)
- **Display:** Brief value prop, sign up button (no user count)
- **Click:** Goes to signup page
- **Size:** 2x1 (wide, placed mid-grid)

### 6. Species Preview Tiles (fallback)
- **Source:** Random species with images from database
- **Display:** Fish image, species name, care level tag
- **Click:** Goes to species detail page
- **Size:** 1x1
- **Purpose:** Backfill when community content is sparse

---

## Tile Mix (Target: 12 tiles)

| Type | Count | Size |
|------|-------|------|
| Tank Photos | up to 4 | 2 small, 2 wide |
| Post Previews | up to 3 | small |
| Species Spotlight | 1 | 2x2 large |
| Tool Shortcuts | 3 | small |
| Join CTA | 1 | wide |
| Species Previews | as needed | small (backfill) |

---

## Empty State Strategy

**Key Principle:** The mosaic never looks empty. The database (244 species, 235 with images) provides infinite fallback content.

### Scenario A: No community content
Grid fills with:
- 1 Species Spotlight (2x2)
- 3 Tool Shortcuts
- 1 Join CTA (2x1)
- 4-5 Species Preview tiles

### Scenario B: Sparse community content
- Show available tanks/posts
- Backfill remaining slots with Species Previews
- Minimum 8 tiles always shown

### Scenario C: Full community content
- Community tiles naturally displace Species Previews
- Species Previews only appear if < 7 community tiles

---

## Data Flow & Tile Priority

**Data Sources:**
1. `publicTanks` collection - public tanks with cover photos
2. `posts` collection - recent public posts
3. `fish-data.js` - species with images (client-side)

**Tile Selection Algorithm:**

```javascript
function buildMosaicTiles() {
  // 1. Fixed tiles (always present)
  const fixedTiles = [
    { type: 'spotlight', position: 0 },      // Top-left 2x2
    { type: 'joinCta', position: 5 },        // Mid-grid wide
    { type: 'tool', tool: 'compare', position: 3 },
    { type: 'tool', tool: 'glossary', position: 8 },
    { type: 'tool', tool: 'plants', position: 11 }
  ];

  // 2. Community tiles (priority fill)
  const communitySlots = 7; // 12 total - 5 fixed
  const tanks = await getPublicTanks(4);     // max 4
  const posts = await getRecentPosts(3);      // max 3

  // 3. Backfill with species
  const filled = tanks.length + posts.length;
  const speciesPreviews = getRandomSpecies(communitySlots - filled);

  // 4. Combine and position
  const dynamicTiles = [...tanks, ...posts, ...speciesPreviews];
  shuffle(dynamicTiles);

  // 5. Merge fixed + dynamic at correct positions
  return mergeTilesAtPositions(fixedTiles, dynamicTiles);
}
```

**Implementation Note:** This logic should live in one function for easier testing. Complex fallback = extra test coverage required.

---

## Grid System

**CSS Grid Configuration:**
- Auto-fit columns, base unit ~280px
- Gap: 16px
- Responsive breakpoints:
  - Desktop: 4 columns
  - Tablet: 3 columns
  - Mobile: 2 columns
  - Small mobile: 1 column

**Tile Sizes:**
- 1x1: 1 column, auto height (roughly square)
- 2x1: 2 columns, same row height
- 2x2: 2 columns, 2 rows

---

## Visual Styling

| Tile Type | Background | Border | Hover |
|-----------|------------|--------|-------|
| Tank Photo | Full image | None | Zoom 1.05, overlay darkens |
| Post Preview | White/ivory | Subtle border | Border accent |
| Species Spotlight | Full image | None | Ken Burns drift |
| Tool Shortcut | Stone/warm gray | None | Darken background |
| Join CTA | Forest green | None | Lift shadow |
| Species Preview | Full image | None | Zoom 1.05 |

**Corner radius:** 8px (consistent with existing)

**Typography:**
- Image tiles: White text, text-shadow, bottom gradient overlay
- Text tiles: Ink color, category in small caps
- Join CTA: White on green

---

## Animations

| Element | Animation |
|---------|-----------|
| Page load | Tiles fade in staggered (50ms delay each) |
| Tile hover | Scale 1.02 + shadow lift |
| Image zoom | 1.05 over 0.3s ease |
| Join CTA | Gentle pulse on first view (once) |

---

## Mobile Behavior

- Grid: 4 → 3 → 2 → 1 columns
- Spotlight (2x2): Becomes 2x1 on tablet, full-width on mobile
- No hover states on touch
- Join CTA: Full-width on mobile

---

## Accessibility

- All tiles are `<a>` or `<button>` (keyboard navigable)
- Images have descriptive alt text
- Text overlays have sufficient contrast (dark gradient)
- Focus states visible

---

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Remove 3 sections, add mosaic container |
| `css/naturalist.css` | Add mosaic grid styles, tile styles |
| `js/homepage-mosaic.js` | New file: tile selection logic, rendering |

---

## Summary

| Before | After |
|--------|-------|
| 4 distinct sections | 1 unified mosaic |
| Static content | Dynamic community + database mix |
| Explains features | Shows activity |
| Generic template feel | Organic Pinterest-style |
| No community on homepage | Tanks + posts visible |
| Separate tool sections | Tools integrated in grid |
