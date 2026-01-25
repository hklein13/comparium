# Comparium Video Generation

Programmatic video generation for Comparium social media content using [Remotion](https://remotion.dev).

## Quick Start

```bash
# Install dependencies
npm install

# Launch preview studio
npm run start
# Opens http://localhost:3000
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Launch Remotion Studio for live preview |
| `npm run render` | Render single video (default species) |
| `npm run render:all` | Render videos for all species with curated facts |
| `npm run render:all -- --limit 5` | Render first 5 species only |

## Video Template: "Guess the Fish" (20 seconds)

A 3-clue guessing game format for TikTok/YouTube Shorts/Instagram Reels.

**Format:** 1080x1920 (vertical) or 1080x1080 (square)

**Timeline:**
| Time | Event |
|------|-------|
| 0-3.3s | "Can You Guess the Fish" branded intro |
| 3.3s | Clue 1 fades in |
| 6.3s | Clue 2 fades in |
| 9.3s | Clue 3 fades in |
| 12.7s | Reveal: species name + fact + photo |
| 17.7s | CTA (comparium.net) |
| 20s | End |

## Content Files

### `src/video-facts.js`
Curated clues and reveal facts for each species. Edit this file to customize content:

```javascript
neonTetra: {
  clues: [
    "First clue text",
    "Second clue text",
    "Third clue text"
  ],
  reveal: "The interesting fact shown after the species name.",
},
```

Only species with entries in `video-facts.js` will be rendered by `render:all`.

### `src/Root.jsx`
Change `defaultSpecies` to preview different species in the studio.

## Output

Rendered videos are saved to `video/output/{speciesKey}.mp4`

## Customization

- **Colors:** Edit `colors` object in `src/SpeciesSpotlight.jsx`
- **Timing:** Adjust frame numbers in `Sequence from={}` and animation functions
- **Duration:** Modify `durationInFrames` in `src/Root.jsx` (30 fps, currently 600 frames = 20s)
- **Font:** Uses Playfair Display via `@remotion/google-fonts`

## Posting Workflow

1. Run `npm run render:all` to generate all videos
2. Upload MP4s from `output/` to Google Drive
3. Download to phone and post via TikTok/YouTube apps, or use Buffer for scheduling
