/**
 * Guides Data - Comprehensive aquarium guides
 *
 * Structure:
 * - slug: URL-safe identifier (?guide=slug)
 * - title: Display title
 * - description: Brief summary for cards
 * - category: beginner | care | compatibility | plants | health
 * - readTime: Estimated reading time in minutes
 * - featured: Boolean - show in featured section
 * - publishedAt: Date string
 * - sections: Array of content sections with headings and content
 */

var guidesData = {
  'beginners-guide': {
    slug: 'beginners-guide',
    title: "Complete Beginner's Guide to Your First Aquarium",
    description:
      'Everything you need to know to start your first aquarium successfully, from tank selection to your first fish.',
    category: 'beginner',
    readTime: 12,
    featured: true,
    publishedAt: '2026-01-25',
    sections: [
      {
        id: 'introduction',
        heading: 'Introduction',
        content: `
          <p>Starting an aquarium is one of the most rewarding hobbies you can pursue. Watching a thriving underwater ecosystem that you've created is incredibly satisfying. But let's be honest &mdash; it can also be overwhelming at first.</p>
          <p>This guide will walk you through everything you need to know, step by step. By the end, you'll have the knowledge to set up a healthy aquarium and keep your fish thriving for years to come.</p>
          <p><strong>The #1 rule in fishkeeping:</strong> Patience is everything. Rushing any step is the fastest way to lose fish. Take your time, and your fish will thank you.</p>
        `,
      },
      {
        id: 'choosing-tank',
        heading: 'Choosing Your Tank',
        content: `
          <p>Here's a surprising truth: <strong>bigger tanks are easier for beginners</strong>. While a small tank might seem less intimidating, larger volumes of water are more stable and forgiving of mistakes.</p>

          <h4>Recommended Sizes</h4>
          <ul>
            <li><strong>20 gallons</strong> &mdash; Ideal starter size. Stable water, room for a nice community</li>
            <li><strong>10 gallons</strong> &mdash; Minimum for most fish. Good for a single betta or small shrimp tank</li>
            <li><strong>5 gallons</strong> &mdash; Only for experienced keepers or single bettas</li>
          </ul>

          <h4>Glass vs. Acrylic</h4>
          <ul>
            <li><strong>Glass</strong> &mdash; Scratch-resistant, heavier, more affordable. Best for most beginners</li>
            <li><strong>Acrylic</strong> &mdash; Lighter, clearer, scratches easily. Better for large tanks</li>
          </ul>

          <p class="guide-tip"><strong>Tip:</strong> Always place your tank on a level, sturdy surface. A 20-gallon tank weighs about 200 pounds when full!</p>
        `,
      },
      {
        id: 'essential-equipment',
        heading: 'Essential Equipment',
        content: `
          <p>You don't need to spend a fortune, but you do need the right equipment. Here's what's essential:</p>

          <h4>Must-Have Equipment</h4>
          <ul>
            <li><strong>Filter</strong> &mdash; The heart of your aquarium. Get one rated for your tank size or slightly larger</li>
            <li><strong>Heater</strong> &mdash; For tropical fish. Rule of thumb: 5 watts per gallon</li>
            <li><strong>Thermometer</strong> &mdash; Digital stick-on or in-tank. Check daily at first</li>
            <li><strong>Water conditioner</strong> &mdash; Removes chlorine from tap water. Never skip this!</li>
            <li><strong>Test kit</strong> &mdash; API Master Test Kit is the gold standard. Strips are less accurate</li>
          </ul>

          <h4>Nice to Have</h4>
          <ul>
            <li><strong>Gravel vacuum</strong> &mdash; Makes water changes much easier</li>
            <li><strong>Bucket</strong> &mdash; Dedicated aquarium-only bucket (never use soap)</li>
            <li><strong>Net</strong> &mdash; For moving fish safely</li>
            <li><strong>Light timer</strong> &mdash; Consistent lighting schedule (8-10 hours)</li>
          </ul>

          <h4>Filter Types for Beginners</h4>
          <ul>
            <li><strong>Hang-on-back (HOB)</strong> &mdash; Easy to maintain, good filtration. Best for beginners</li>
            <li><strong>Sponge filter</strong> &mdash; Gentle flow, great for shrimp and fry. Needs air pump</li>
            <li><strong>Canister filter</strong> &mdash; Most powerful, more complex. For larger tanks</li>
          </ul>
        `,
      },
      {
        id: 'nitrogen-cycle',
        heading: 'The Nitrogen Cycle (Most Important!)',
        content: `
          <p><strong>This is the single most important concept in fishkeeping.</strong> Understanding it will prevent 90% of beginner problems.</p>

          <h4>What Is It?</h4>
          <p>Fish produce waste (ammonia), which is toxic. Beneficial bacteria convert this ammonia into nitrite (still toxic), then into nitrate (much less toxic). This process is called the nitrogen cycle.</p>

          <h4>The Cycle in Simple Terms</h4>
          <ol>
            <li>Fish waste and uneaten food create <strong>ammonia</strong> (toxic)</li>
            <li>Bacteria convert ammonia to <strong>nitrite</strong> (still toxic)</li>
            <li>Other bacteria convert nitrite to <strong>nitrate</strong> (less toxic)</li>
            <li>You remove nitrates with <strong>water changes</strong></li>
          </ol>

          <h4>Cycling Your Tank (Fishless Method)</h4>
          <ol>
            <li>Set up your tank with filter running</li>
            <li>Add ammonia source (fish food or bottled ammonia)</li>
            <li>Test water every few days</li>
            <li>Wait for ammonia spike, then nitrite spike</li>
            <li>When both read 0 and nitrates are present &mdash; you're cycled!</li>
          </ol>

          <p class="guide-warning"><strong>Warning:</strong> This takes 4-8 weeks. There are no shortcuts. Adding fish to an uncycled tank is the #1 cause of fish death for beginners.</p>

          <h4>Target Water Parameters</h4>
          <ul>
            <li><strong>Ammonia:</strong> 0 ppm (always)</li>
            <li><strong>Nitrite:</strong> 0 ppm (always)</li>
            <li><strong>Nitrate:</strong> Under 40 ppm (lower is better)</li>
          </ul>
        `,
      },
      {
        id: 'choosing-fish',
        heading: 'Choosing Your First Fish',
        content: `
          <p>Once your tank is cycled (ammonia and nitrite at 0), it's time for the exciting part &mdash; fish!</p>

          <h4>Best Beginner Fish</h4>
          <p>These species are hardy, forgiving, and beautiful:</p>
          <ul>
            <li><strong>Neon Tetras</strong> &mdash; Classic, peaceful schooling fish. Keep 6+</li>
            <li><strong>Corydoras Catfish</strong> &mdash; Adorable bottom dwellers. Keep 4-6</li>
            <li><strong>Guppies</strong> &mdash; Colorful, active, breed readily</li>
            <li><strong>Platies</strong> &mdash; Hardy, peaceful, come in many colors</li>
            <li><strong>Betta Fish</strong> &mdash; Beautiful, but keep alone or carefully chosen tankmates</li>
            <li><strong>White Cloud Minnows</strong> &mdash; Great for unheated tanks, peaceful</li>
          </ul>

          <h4>Fish to Avoid as a Beginner</h4>
          <ul>
            <li><strong>Common Plecos</strong> &mdash; Grow to 2 feet! Need 100+ gallons</li>
            <li><strong>Goldfish</strong> &mdash; Need much more space than most think (40+ gallons)</li>
            <li><strong>Oscars</strong> &mdash; Aggressive, grow huge, need 75+ gallons</li>
            <li><strong>Arowana</strong> &mdash; Grow massive, need 250+ gallon tanks</li>
          </ul>

          <h4>Stocking Tips</h4>
          <ul>
            <li>Add fish slowly &mdash; 2-3 at a time, wait a week between additions</li>
            <li>Research adult size, not purchase size</li>
            <li>Match temperature and pH requirements</li>
            <li>Use our <a href="/compare">Compare tool</a> to check compatibility</li>
          </ul>

          <p class="guide-tip"><strong>Tip:</strong> Understocking is always better than overstocking. Your fish will be healthier and your maintenance easier.</p>
        `,
      },
      {
        id: 'maintenance',
        heading: 'Basic Maintenance Schedule',
        content: `
          <p>A healthy aquarium needs regular maintenance. Here's a simple schedule:</p>

          <h4>Daily</h4>
          <ul>
            <li>Check temperature</li>
            <li>Make sure all fish are present and acting normal</li>
            <li>Feed fish (once or twice daily, only what they eat in 2-3 minutes)</li>
          </ul>

          <h4>Weekly</h4>
          <ul>
            <li><strong>25% water change</strong> &mdash; The most important maintenance task</li>
            <li>Vacuum gravel while changing water</li>
            <li>Test water parameters</li>
            <li>Clean algae from glass if needed</li>
          </ul>

          <h4>Monthly</h4>
          <ul>
            <li>Rinse filter media in old tank water (never tap water!)</li>
            <li>Replace filter cartridge if using disposable type</li>
            <li>Trim any dead plant leaves</li>
          </ul>

          <h4>Water Change Tips</h4>
          <ul>
            <li>Match new water temperature to tank water</li>
            <li>Always add dechlorinator to new water</li>
            <li>Use a gravel vacuum to remove debris</li>
            <li>Never replace all the water at once</li>
          </ul>
        `,
      },
      {
        id: 'common-mistakes',
        heading: 'Common Beginner Mistakes',
        content: `
          <p>Learn from others' mistakes! Here are the most common pitfalls:</p>

          <h4>1. Not Cycling the Tank</h4>
          <p>Adding fish to a new tank without cycling causes ammonia poisoning. This kills more fish than anything else. Always wait for the cycle to complete.</p>

          <h4>2. Overfeeding</h4>
          <p>Fish need far less food than you think. Uneaten food rots and pollutes the water. Feed only what they can eat in 2-3 minutes, once or twice daily.</p>

          <h4>3. Overstocking</h4>
          <p>Too many fish overwhelms your filter and leads to poor water quality. Start with fewer fish than you think you need.</p>

          <h4>4. Skipping Water Changes</h4>
          <p>Regular water changes are non-negotiable. Even in a "stable" tank, nitrates build up and need to be removed.</p>

          <h4>5. Buying Fish Impulsively</h4>
          <p>That cool fish at the store might grow huge, be aggressive, or have special requirements. Always research before you buy.</p>

          <h4>6. Trusting Pet Store Advice</h4>
          <p>Sadly, pet store employees are often poorly trained. Do your own research. This site and online forums are your friends.</p>

          <h4>7. Replacing All Filter Media at Once</h4>
          <p>Your filter media houses beneficial bacteria. Replacing it all at once can crash your cycle. Rinse, don't replace, when possible.</p>
        `,
      },
      {
        id: 'next-steps',
        heading: 'Next Steps',
        content: `
          <p>Congratulations! You now know more than most first-time fishkeepers. Here's what to do next:</p>

          <ol>
            <li><strong>Get your tank and equipment</strong> &mdash; Set up and start cycling</li>
            <li><strong>While cycling:</strong> Research fish species, plan your community</li>
            <li><strong>Use our tools:</strong> <a href="/compare">Compare species</a> for compatibility</li>
            <li><strong>Test regularly:</strong> Track your cycle progress with your test kit</li>
            <li><strong>Be patient:</strong> A 4-week wait is nothing compared to years of enjoyment</li>
          </ol>

          <p>Once you've successfully kept your first tank for 6 months, you'll understand why this hobby is so addictive. Welcome to fishkeeping!</p>

          <div class="guide-cta">
            <h4>Ready to Plan Your Tank?</h4>
            <p>Use our Compare tool to check fish compatibility and plan your perfect community.</p>
            <a href="/compare" class="btn btn-primary">Compare Fish Species</a>
          </div>
        `,
      },
    ],
  },

  'nitrogen-cycle': {
    slug: 'nitrogen-cycle',
    title: 'How to Cycle Your Aquarium Tank',
    description:
      'A deep dive into the nitrogen cycle, the most important concept every fishkeeper must understand.',
    category: 'beginner',
    readTime: 8,
    featured: false,
    publishedAt: '2026-01-25',
    sections: [
      {
        id: 'introduction',
        heading: 'Why the Nitrogen Cycle Matters',
        content: `
          <p>If you take away one thing from this guide, let it be this: <strong>the nitrogen cycle is the difference between a thriving aquarium and a fish graveyard.</strong></p>
          <p>New fishkeepers often lose fish in their first few weeks because they don't understand this process. The good news? Once you understand it, it's straightforward to manage.</p>
        `,
      },
      {
        id: 'the-cycle-explained',
        heading: 'The Cycle Explained',
        content: `
          <p>The nitrogen cycle is a natural biological process where beneficial bacteria convert toxic waste into less harmful substances.</p>

          <h4>Stage 1: Ammonia (NH3)</h4>
          <p>Fish waste, uneaten food, and decaying plant matter produce ammonia. This is <strong>highly toxic to fish</strong> &mdash; even small amounts cause stress and gill damage. At higher levels, it's fatal within days.</p>

          <h4>Stage 2: Nitrite (NO2)</h4>
          <p>Bacteria called <em>Nitrosomonas</em> consume ammonia and produce nitrite as a byproduct. Nitrite is <strong>also toxic</strong> &mdash; it prevents fish blood from carrying oxygen, essentially suffocating them.</p>

          <h4>Stage 3: Nitrate (NO3)</h4>
          <p>Bacteria called <em>Nitrobacter</em> convert nitrite into nitrate. Nitrate is <strong>much less toxic</strong> &mdash; fish can tolerate levels up to 40 ppm, though lower is better. You remove nitrate through water changes.</p>
        `,
      },
      {
        id: 'fishless-cycling',
        heading: 'Fishless Cycling Method',
        content: `
          <p>This is the humane and recommended approach. No fish suffer while you establish your bacteria colonies.</p>

          <h4>What You Need</h4>
          <ul>
            <li>Set up tank with filter running</li>
            <li>Heater set to 75-82°F (bacteria grow faster in warmth)</li>
            <li>Ammonia source (fish food or pure ammonia)</li>
            <li>Test kit (API Master Test Kit recommended)</li>
          </ul>

          <h4>Step-by-Step Process</h4>
          <ol>
            <li><strong>Day 1:</strong> Add ammonia until test reads 2-4 ppm</li>
            <li><strong>Days 2-7:</strong> Test every few days. Ammonia stays high</li>
            <li><strong>Week 2-3:</strong> Ammonia starts dropping, nitrite appears and rises</li>
            <li><strong>Week 3-4:</strong> Nitrite peaks, nitrate starts appearing</li>
            <li><strong>Week 4-8:</strong> Ammonia and nitrite drop to 0, nitrate rises</li>
            <li><strong>Cycle complete!</strong> When ammonia and nitrite are both 0 ppm within 24 hours of adding ammonia</li>
          </ol>

          <p class="guide-tip"><strong>Tip:</strong> If using fish food as an ammonia source, add a small pinch daily. It takes longer to break down than pure ammonia.</p>
        `,
      },
      {
        id: 'fish-in-cycling',
        heading: 'Fish-In Cycling (Emergency Only)',
        content: `
          <p>Sometimes you inherit a tank or can't return fish. If you must do fish-in cycling:</p>

          <h4>Minimize Harm</h4>
          <ul>
            <li>Stock very lightly &mdash; 1-2 small, hardy fish only</li>
            <li>Test water daily (ammonia and nitrite)</li>
            <li>Do 25-50% water changes whenever ammonia or nitrite exceeds 0.25 ppm</li>
            <li>Use a water conditioner that detoxifies ammonia (like Seachem Prime)</li>
            <li>Feed sparingly &mdash; every other day at most</li>
          </ul>

          <p class="guide-warning"><strong>Warning:</strong> Fish-in cycling stresses fish and can cause permanent damage. Fishless cycling is always preferred.</p>
        `,
      },
      {
        id: 'speeding-up',
        heading: 'Speeding Up the Cycle',
        content: `
          <p>While there's no instant solution, you can accelerate the process:</p>

          <h4>Effective Methods</h4>
          <ul>
            <li><strong>Seeded media:</strong> Borrow filter media from an established tank. This adds live bacteria instantly</li>
            <li><strong>Bottled bacteria:</strong> Products like Tetra SafeStart or Fritz TurboStart can help, though results vary</li>
            <li><strong>Live plants:</strong> Help absorb ammonia and may carry beneficial bacteria</li>
            <li><strong>Higher temperature:</strong> Keep at 80-84°F to speed bacteria growth</li>
          </ul>

          <h4>What Doesn't Work</h4>
          <ul>
            <li>Adding more fish (just creates more ammonia)</li>
            <li>Most "instant cycle" products (most are ineffective)</li>
            <li>Skipping the wait (bacteria need time to multiply)</li>
          </ul>
        `,
      },
      {
        id: 'maintaining-cycle',
        heading: 'Maintaining Your Cycle',
        content: `
          <p>Once cycled, your tank needs ongoing care to stay healthy:</p>

          <h4>Don'ts</h4>
          <ul>
            <li>Don't replace all filter media at once</li>
            <li>Don't rinse media in tap water (chlorine kills bacteria)</li>
            <li>Don't let the tank run without ammonia source for weeks</li>
            <li>Don't use medications that kill bacteria without reason</li>
          </ul>

          <h4>Do's</h4>
          <ul>
            <li>Rinse filter media in old tank water during water changes</li>
            <li>Keep filter running 24/7</li>
            <li>Test water weekly, especially after changes</li>
            <li>Add new fish slowly to let bacteria populations adjust</li>
          </ul>
        `,
      },
    ],
  },

  'fish-compatibility': {
    slug: 'fish-compatibility',
    title: 'Fish Compatibility 101',
    description: 'Learn what makes fish compatible and how to build a harmonious community tank.',
    category: 'compatibility',
    readTime: 10,
    featured: false,
    publishedAt: '2026-01-25',
    sections: [
      {
        id: 'introduction',
        heading: 'Building a Peaceful Community',
        content: `
          <p>A well-planned community tank is a beautiful thing &mdash; fish of different species coexisting peacefully, each occupying their own niche. But throw incompatible fish together, and you'll have stress, aggression, and death.</p>
          <p>This guide will teach you the key factors that determine compatibility.</p>
        `,
      },
      {
        id: 'temperament',
        heading: 'Temperament: The Most Important Factor',
        content: `
          <p>Fish temperaments generally fall into three categories:</p>

          <h4>Peaceful</h4>
          <p>These fish rarely cause problems. They may defend their space but don't actively harass others. Examples: most tetras, rasboras, corydoras, otocinclus, guppies.</p>

          <h4>Semi-Aggressive</h4>
          <p>May chase, nip fins, or claim territory. Usually fine with similar temperament fish, but will bully timid species. Examples: barbs, some cichlids, bettas (males), gouramis.</p>

          <h4>Aggressive</h4>
          <p>Actively territorial, may kill tankmates. Usually need species-only tanks or very specific companions. Examples: most cichlids, arowanas, large predatory fish.</p>

          <p class="guide-warning"><strong>Rule:</strong> Never mix aggressive fish with peaceful species. Semi-aggressive fish need careful planning.</p>
        `,
      },
      {
        id: 'size-matters',
        heading: 'Size: If It Fits, It Eats',
        content: `
          <p>A general rule in fishkeeping: <strong>if a fish can fit another fish in its mouth, it probably will try.</strong></p>

          <h4>Guidelines</h4>
          <ul>
            <li>Avoid large size differences between tankmates</li>
            <li>Consider adult size, not current size</li>
            <li>Even "peaceful" large fish may eat small tankmates</li>
            <li>Small fish with large fish = expensive live food</li>
          </ul>

          <p class="guide-tip"><strong>Example:</strong> A peaceful angelfish will happily eat neon tetras once it grows large enough. Despite both being "peaceful," they're incompatible due to size.</p>
        `,
      },
      {
        id: 'water-parameters',
        heading: 'Water Parameters',
        content: `
          <p>Fish have evolved for specific water conditions. Mixing fish with drastically different needs stresses everyone.</p>

          <h4>Temperature</h4>
          <p>Tropical fish need 75-82°F. Coldwater fish (goldfish, white clouds) need 65-72°F. Never mix these!</p>

          <h4>pH</h4>
          <p>Some fish need acidic water (pH 6-7), others alkaline (pH 7.5-8.5). While many species adapt, extreme differences cause problems.</p>

          <h4>Hardness</h4>
          <p>Soft water fish (tetras, rams) and hard water fish (livebearers, African cichlids) often don't mix well.</p>

          <p>Use our <a href="/compare">Compare tool</a> to check if species have overlapping parameter ranges.</p>
        `,
      },
      {
        id: 'swimming-levels',
        heading: 'Swimming Levels',
        content: `
          <p>Different fish occupy different water levels. A good community uses all three:</p>

          <h4>Top Dwellers</h4>
          <p>Hatchetfish, surface-feeding killifish, some rainbowfish. Need floating plants and secure lids.</p>

          <h4>Mid-Level</h4>
          <p>Most tetras, barbs, rasboras, gouramis, angelfish. The busiest zone in most tanks.</p>

          <h4>Bottom Dwellers</h4>
          <p>Corydoras, loaches, plecos, otocinclus. Need hiding spots and appropriate substrate.</p>

          <p class="guide-tip"><strong>Tip:</strong> A tank with fish at all levels looks more natural and reduces competition for space.</p>
        `,
      },
      {
        id: 'special-considerations',
        heading: 'Special Considerations',
        content: `
          <h4>Fin Nippers</h4>
          <p>Some fish (tiger barbs, serpae tetras) nip at long fins. Never keep them with bettas, guppies, or angelfish.</p>

          <h4>Schooling Requirements</h4>
          <p>Many fish need groups of 6+ to feel secure. A lonely tetra is a stressed tetra, which leads to odd behavior and health issues.</p>

          <h4>Breeding Aggression</h4>
          <p>Even peaceful fish can become aggressive when breeding. Cichlids especially will defend their territory fiercely.</p>

          <h4>Species-Specific Issues</h4>
          <ul>
            <li><strong>Male bettas:</strong> Will fight to the death with other male bettas</li>
            <li><strong>African cichlids:</strong> Need specific setups, usually species-only</li>
            <li><strong>Shrimp:</strong> Many fish will eat them. Research carefully</li>
          </ul>
        `,
      },
      {
        id: 'using-compare',
        heading: 'Check Compatibility with Compare',
        content: `
          <p>Our Compare tool makes compatibility research easy:</p>

          <ol>
            <li>Select up to 5 species you're considering</li>
            <li>Compare temperature, pH, and tank size requirements</li>
            <li>Check aggression levels and schooling needs</li>
            <li>See if parameter ranges overlap</li>
          </ol>

          <div class="guide-cta">
            <h4>Plan Your Community</h4>
            <p>Use Compare to check if your dream fish can live together safely.</p>
            <a href="/compare" class="btn btn-primary">Compare Fish Species</a>
          </div>
        `,
      },
    ],
  },
};

// Category metadata for display
var guideCategories = {
  beginner: { label: 'Beginner', color: '#2d5a47' },
  care: { label: 'Care', color: '#4a6b5a' },
  compatibility: { label: 'Compatibility', color: '#3d5a3d' },
  plants: { label: 'Plants', color: '#3d6a3d' },
  health: { label: 'Health', color: '#8b3a3a' },
};
