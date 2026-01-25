# Comparium Growth & Distribution Plan

> **Created:** January 2026
> **Status:** Ready for implementation
> **To execute:** Pull this plan into a Claude Code session and approve it
>
> **Note (Jan 2026):** Site changes may have been made in parallel sessions. Before implementing, run `git status` and review recent commits to check for updates that could affect this plan (especially community/post features, homepage featured tank logic, or auth flows).

## Overview

**Goal:** Launch Comparium to real users through automated social media content and community seeding, with a path toward monetization.

**Timeline:** 4 weeks (aggressive but systematic)

**Budget:** Minimal (~$25/month for video tool)

**Target Platforms:** TikTok, YouTube Shorts, Reddit

---

## Site Readiness Checklist (Pre-Launch)

Complete these items **before** starting marketing to ensure new visitors get a good first impression.

### Critical (Must Do)

| Item | Status | Details |
|------|--------|---------|
| **Seed community with 10-15 posts** | [ ] | Empty community (1 post) makes site look abandoned |
| **Remove/replace @harrison featured tank** | [ ] | Shows owner's name - obvious it's not organic activity |
| **Add diverse featured tanks** | [ ] | Rotate through seeded user tanks for social proof |

### High Priority (Should Do)

| Item | Status | Details |
|------|--------|---------|
| **Add "Why Sign Up?" messaging** | [ ] | Users can browse everything without account - unclear value of registration |
| **Create sign-up incentive** | [ ] | "Save your comparisons", "Track your tanks", "Get maintenance reminders" |
| **Build Guides section** | [ ] | Educational content for beginners (already in Phase 2) |

### Nice to Have (Consider)

| Item | Status | Details |
|------|--------|---------|
| **Add user count/stats** | [ ] | "Join 50+ aquarists" (once you have real users) |
| **Testimonial section** | [ ] | Can use seeded accounts initially |
| **"As seen on" badges** | [ ] | Add after Reddit/social traction |

### Site Inspection Results (January 2026)

**What's Working Well:**
- Homepage: Clean design, clear value proposition, video hero
- Compare Tool: Intuitive UX, works without login, delivers immediate value
- Glossary: 238 species with quality images, excellent browsing experience
- Species Detail: Comprehensive data (size, water params, behavior, breeding)
- Mobile: Fully responsive across all tested pages

**What Needs Attention:**
- Community page shows only 1 post (looks dead)
- Featured tank shows "@harrison" (obviously the owner)
- No clear reason to create an account vs. just browsing

---

## Phase 1: Foundation (Week 1)

### 1.1 Create Social Media Accounts
- [ ] TikTok: @comparium or @comparium.fish
- [ ] YouTube: Comparium channel
- [ ] Reddit: New account (needs karma building before promotion)

### 1.2 Build Content Export Script
**File:** `scripts/export-social-content.js`

Create a Node.js script that:
- Reads from `js/fish-data.js`
- Outputs CSV/JSON with: species name, 3 key facts, image URL, suggested hashtags
- Format ready for content calendar

### 1.3 Set Up Content Pipeline
- [ ] Create Google Sheet content calendar
- [ ] Set up Gemini integration for caption generation (via Google Workspace)
- [ ] Sign up for InVideo AI (~$25/month)
- [ ] Set up Buffer or Later free tier for scheduling

### 1.4 Create Seed Accounts on Comparium
Create 4-5 accounts with distinct personalities:

| Username | Persona | Post Style |
|----------|---------|------------|
| `tankbeginner23` | Beginner aquarist | Questions, first tank updates, celebrates wins |
| `planted_paul` | Plant-focused hobbyist | Aquascaping, plant tips, CO2 discussion |
| `fishkeeper_sam` | Experienced keeper | Answers questions, shares established tanks |
| `betta_breeder` | Breeding enthusiast | Breeding tips, fry updates, genetics |
| `aqua_helper` | Community welcomer | Responds to posts, welcomes newcomers |

### 1.5 Test Video Creation
- [ ] Create 5 test videos in InVideo AI
- [ ] Establish template/style for species spotlights
- [ ] Test export and upload workflow

---

## Phase 2: Content & Seeding (Week 2)

### 2.1 Build Guides Section
**New files needed:**
- `guides.html` - Article listing page
- `guide.html` - Individual article template (query param: `?guide=cycling`)
- `js/guides-data.js` - Guide content storage
- Update `naturalist.css` with article styles
- Add "Guides" link to site navigation

### 2.2 Write Priority Guide #1
**"Complete Beginner's Guide to Your First Aquarium"**
- Tank selection and setup
- The nitrogen cycle (overview)
- Choosing first fish (link to Compare tool)
- Basic maintenance schedule
- Common beginner mistakes

### 2.3 Seed Community Posts

| Category | Count | Content Examples |
|----------|-------|------------------|
| Tanks | 4-5 | "My 29g community tank build", "First planted tank" |
| Help | 3-4 | "Is my tank cycled?", "Fish acting weird" with helpful replies |
| Tips | 2-3 | "Always drip acclimate", "Test water weekly" |
| Milestones | 2 | "First successful fry!", "6 months no fish loss" |
| Fish ID | 1-2 | "What species is this?" with answer in comments |

**Guidelines for authentic seeding:**
- Stagger post dates across several days
- Add comments and likes between accounts
- Use casual tone, minor typos okay
- Reference site tools naturally

### 2.4 Launch Video Posting
- Generate 14+ videos (one week buffer)
- Begin posting: 2/day TikTok, 1/day YouTube Shorts
- Cross-post same content to both platforms

### 2.5 Reddit Karma Building
- Join r/Aquariums, r/PlantedTank, r/bettafish
- Answer questions helpfully (no self-promotion)
- Upvote and engage with community
- Target: 100+ karma before any site mentions

---

## Phase 3: Scale & Learn (Week 3)

### 3.1 Write Guides #2-3
**"How to Cycle Your Tank"**
- What is the nitrogen cycle
- Fishless cycling method
- Fish-in cycling (emergency)
- Testing and timeline
- Signs your tank is cycled

**"Fish Compatibility 101"**
- What makes fish compatible
- Aggression levels explained
- Temperature/pH matching
- Tank size considerations
- CTA: Use our Compare tool

### 3.2 Continue Content Production
- Maintain daily posting schedule
- Batch-create videos weekly (7-14 at a time)
- Test different content types:
  - Species spotlights
  - "Did you know" facts
  - Compatibility checks
  - Quick care tips

### 3.3 First Analytics Review
Check weekly metrics:
- TikTok: Views, followers, engagement rate
- YouTube: Views, subscribers, click-through
- Site: GA4 traffic, referral sources, sign-ups

**Questions to answer:**
- Which content type performs best?
- Which platform drives site visits?
- Are visitors signing up or just browsing?

### 3.4 Reddit Soft Launch
- If karma sufficient (100+), make relevant helpful comments mentioning Comparium
- "I actually built a tool for this..." approach
- Only when genuinely helpful, never spammy

---

## Phase 4: Optimize & Expand (Week 4)

### 4.1 Write Guides #4-6
- "Why Are My Fish Dying?" (troubleshooting)
- "Best Beginner Fish Species" (listicle)
- "Live Plants for Beginners" (leverages plant database)

### 4.2 Content Optimization
Based on Week 3 analytics:
- Double down on what works
- Cut or reduce what doesn't
- Refine video style, hooks, CTAs

### 4.3 Reddit "I Made This" Post
If karma and engagement are good:
- Post to r/Aquariums: "I built a free fish compatibility tool"
- Show screenshots/demo
- Be responsive to feedback
- Don't be defensive about criticism

### 4.4 Month 1 Review
Document:
- Total reach (views across platforms)
- Site traffic increase
- Sign-up count
- Top performing content
- Lessons learned
- Month 2 strategy adjustments

---

## Technical Implementation Details

### Content Export Script
```
Location: scripts/export-social-content.js

Inputs: js/fish-data.js
Outputs: scripts/social-content.csv

Fields per species:
- commonName
- scientificName
- fact1 (temperature + pH range)
- fact2 (tank size + schooling)
- fact3 (unique trait from description)
- imageUrl
- hashtags (#fishtok #[speciesname] #aquarium)
```

### Guides Page Structure
```
guides.html
├── Header with search/filter
├── Featured guide (beginner's guide)
├── Guide cards grid
│   ├── Title
│   ├── Description
│   ├── Read time estimate
│   └── Category tag
└── Footer

guide.html?guide=[slug]
├── Article header (title, author, date)
├── Table of contents (auto-generated)
├── Article content (sections with IDs)
├── Related guides
└── CTA (Compare tool, sign up)
```

### Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| `scripts/export-social-content.js` | Create | Export species for social posts |
| `guides.html` | Create | Guide listing page |
| `guide.html` | Create | Individual guide page |
| `js/guides-data.js` | Create | Guide content storage |
| `css/naturalist.css` | Modify | Add article/guide styles |
| `index.html` | Modify | Add Guides nav link |
| `glossary.html` | Modify | Add Guides nav link |
| `compare.html` | Modify | Add Guides nav link |
| `community.html` | Modify | Add Guides nav link |
| `dashboard.html` | Modify | Add Guides nav link |

---

## Content Types & Templates

### TikTok/YouTube Shorts Templates

**Species Spotlight**
```
Hook: "This fish can [surprising ability]"
Body: 3 quick facts with text overlay
CTA: "Follow for more fish facts"
Duration: 15-30 seconds
```

**Did You Know**
```
Hook: "Did you know [fish name]..."
Body: Single surprising fact with explanation
CTA: "What fish fact surprised you?"
Duration: 10-20 seconds
```

**Compatibility Check**
```
Hook: "Can you keep [Fish A] with [Fish B]?"
Body: Quick compatibility breakdown
CTA: "Check compatibility at comparium.net"
Duration: 20-30 seconds
```

### Reddit Post Templates

**Helpful Comment (Karma Building)**
```
[Genuine answer to their question]
[Additional context or tips]
[No link or self-promotion]
```

**"I Made This" Post**
```
Title: "I built a free fish compatibility tool - would love feedback"
Body:
- What it does
- Why I built it
- Screenshot/demo
- Link
- Ask for feedback
```

---

## Measurement & Targets

### Month 1 Targets
| Metric | Target | Tool |
|--------|--------|------|
| TikTok views | 10,000+ | TikTok Analytics |
| YouTube views | 5,000+ | YouTube Studio |
| Site visitors | 500+ unique | Google Analytics |
| Sign-ups | 20-50 | Firebase Console |
| Reddit karma | 200+ | Reddit profile |

### Weekly Tracking Sheet
Create Google Sheet with columns:
- Week ending date
- TikTok: followers, views, top post
- YouTube: subscribers, views, top video
- Reddit: karma, notable interactions
- Site: unique visitors, sign-ups
- Notes: what worked, what to try

---

## Tools & Costs

| Tool | Purpose | Cost |
|------|---------|------|
| InVideo AI | Video generation | ~$25/month |
| Buffer/Later | Scheduling | Free tier |
| Google Workspace | Scripts, Sheets, Gemini | Already have |
| Canva | Thumbnails, images | Free tier |
| **Total** | | **~$25/month** |

---

## Risk Mitigation

**If TikTok doesn't gain traction:**
- Analyze what's not working (hooks? content? timing?)
- Try different content styles
- Consider TikTok ads ($50 test budget) if organic fails

**If Reddit community is hostile:**
- Don't push it - Reddit can smell self-promotion
- Focus on genuine participation
- Consider Reddit ads as alternative

**If no sign-ups despite traffic:**
- Review landing page value proposition
- Add clearer CTAs
- Consider what's blocking conversion

**If video creation is too time-consuming:**
- Batch more aggressively (2 weeks at once)
- Simplify templates
- Consider hiring Fiverr editor ($5-10/video)

---

## Success Criteria

**Month 1 Success:**
- Established presence on 2+ platforms
- 500+ site visitors from social referrals
- 20+ real user sign-ups
- Community feels "alive" with seeded + real content
- Clear data on what content works

**Month 3 Vision:**
- 1,000+ followers across platforms
- 100+ registered users
- Organic community activity (real posts without seeding)
- SEO traffic from guides
- Clear monetization path identified

---

## Monetization Paths (Future)

Evaluate after establishing user base:

1. **Affiliate links** - Link to aquarium products on Amazon/Chewy
2. **Sponsored content** - Partner with aquarium brands
3. **Premium features** - Advanced tools, ad-free experience
4. **Display ads** - Google AdSense once traffic justifies
5. **Digital products** - Comprehensive guides, tank planning tools

---

## How to Execute This Plan

1. Start a new Claude Code session
2. Say: "Let's implement the growth plan from docs/plans/growth-distribution-plan.md"
3. Claude will read the plan and begin execution phase by phase
