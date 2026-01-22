// ============================================================================
// FISH DESCRIPTIONS - Comprehensive Database (246 Species)
// ============================================================================
// Phase 3C: All species descriptions from curated source data
// Full descriptions matching the source document exactly.
// ============================================================================

const fishDescriptions = {
  // ============================================
  // TETRAS & CHARACINS
  // ============================================
  neonTetra:
    'An iconic schooling fish reaching 1.5 inches with a brilliant iridescent blue horizontal stripe from nose to adipose fin paired with a vivid red stripe from mid-body to tail. Native to Amazon basin blackwater and clearwater streams, they inhabit soft, acidic waters with dense vegetation. Hardy, peaceful, and timid by nature, these captive-bred favorites thrive in groups of 6+ in planted community tanks, though their colors fade to gray at night as a natural response to lighting conditions.',

  cardinalTetra:
    'A stunning South American schooling fish reaching up to 1.75 inches, featuring an iridescent blue stripe paired with a brilliant cardinal-red band extending from head to tail. Native to upper Orinoco and Rio Negro river basins, they inhabit slow-moving blackwater and clearwater streams. Hardy and peaceful, these vibrant tetras tolerate warmer temperatures than neon tetras, making them popular companions for discus and dwarf cichlids in densely planted community tanks with groups of 8-10+.',

  emberTetra:
    "A tiny, vibrant nano fish reaching only 0.8 inches with brilliant ember-orange to red coloration resembling glowing coals. Native to Brazil's Araguaia River basin backwaters, they prefer slow-moving, heavily vegetated areas with minimal current. Hardy, peaceful, and remarkably outgoing for their size, these active schooling fish thrive in groups of 6-10+ in planted nano aquariums, displaying stunning color intensity with dark substrates and tannin-stained water.",

  blackNeonTetra:
    'A striking schooling fish reaching 1.5 inches with bold black and white horizontal stripes and distinctive red-rimmed eyes. Native to Paraguay River basin streams in southern Brazil, they inhabit slow-moving, tea-stained waters rich in tannins. Hardy and peaceful, these active tetras display bolder swimming behavior than regular neon tetras, preferring groups of 6+ in planted tanks with darker substrates that enhance their stunning iridescent coloration.',

  rummyNoseTetra:
    'A distinctive schooling tetra reaching 2 inches with brilliant red head, silver body, and horizontally striped black-and-white caudal fin. Native to Amazon basin tributaries, they inhabit soft, acidic blackwater streams with tannin-stained water. Peaceful, sensitive to water quality, and exceptional schooling fish that swim in extremely tight formations, their head coloration intensity serves as an excellent water quality indicator.',

  congoTetra:
    'A large, stunning schooling tetra reaching 3 inches with males displaying iridescent rainbow colors and flowing finnage. Native to Central African Congo River basin, they inhabit shaded forest streams with moderate current and tannin-stained water. Peaceful, somewhat timid, and sensitive to water quality, these elegant fish thrive in groups of 6+ in spacious, well-planted tanks with subdued lighting.',

  serpaeTetra:
    'A small, blood-red tetra reaching 1.5 inches with black shoulder spot and red-orange fins. Native to Amazon basin tributaries, they inhabit slow-moving, heavily vegetated waters. Semi-aggressive with notable fin-nipping tendencies, these schooling fish display reduced aggression in larger groups of 10+ but should not be housed with long-finned or timid species, thriving best in species-specific setups.',

  buenosAiresTetra:
    'A large, silver tetra reaching 3 inches with red-tipped fins and subtle horizontal stripe. Native to Argentine and Brazilian river systems including the Parana River, they tolerate cooler temperatures than most tropical species. Semi-aggressive and notorious plant eaters that will devour soft vegetation, these hardy, active schoolers thrive in groups of 6+ and prefer unplanted or plastic-planted tanks with robust species.',

  blackSkirtTetra:
    'A hardy tetra reaching 2.5 inches with tall, flowing black fins and silver-gray body that darkens with age. Native to South American rivers in Paraguay, Guapore, and lower Amazon basins, they inhabit slow-moving waters. Peaceful when mature but can fin-nip when young or in small groups, these popular schoolers thrive in groups of 6+ and adapt to varied conditions, with long-finned varieties also available.',

  bloodfinTetra:
    'A sleek, active tetra reaching 2 inches with silver body and distinctive blood-red fins. Native to Argentine river systems including Parana basin, they tolerate cooler temperatures than most tetras. Peaceful, extremely hardy, and tolerant of temperature fluctuations, these fast-swimming schoolers thrive in groups of 6+ and can survive in unheated tanks, displaying vibrant fin coloration against planted backgrounds.',

  glowlightTetra:
    'A peaceful tetra reaching 1.5 inches with translucent body and brilliant neon orange-red stripe from nose to tail. Native to Guyanese rivers including Essequibo system, they inhabit shaded forest streams. Peaceful, hardy, and displaying glowing stripe under proper lighting, these popular schoolers thrive in groups of 6+ in planted tanks with subdued lighting enhancing their luminescent appearance.',

  diamondTetra:
    'A stunning tetra reaching 2.5 inches with males developing elongated fins and diamond-like sparkle from reflective scales. Native to Lake Valencia basin in Venezuela, they inhabit well-vegetated waters. Peaceful, hardy once established, and displaying spectacular iridescence under proper lighting, these attractive schoolers thrive in groups of 6+ in planted tanks with mature males developing impressive finnage.',

  flameTetra:
    'A small, fiery tetra reaching 1.5 inches with brilliant orange-red body and black-edged fins. Native to Brazilian coastal rivers near Rio de Janeiro, they inhabit slow-moving, well-vegetated waters. Peaceful, hardy, and displaying intense flame coloration, these active schoolers thrive in groups of 6+ in planted tanks and maintain vibrant colors with quality diet and proper water conditions.',

  xRayTetra:
    'A small, transparent tetra reaching 2 inches with silver translucent body revealing internal skeleton and distinctive black-and-yellow marked dorsal and anal fins. Native to South American coastal waters including Amazon and Orinoco basins, they tolerate both fresh and brackish conditions. Peaceful, hardy, and extremely adaptable, these active schoolers thrive in groups of 6+ and display unique transparency when viewed from the side.',

  blackPhantomTetra:
    'A peaceful tetra reaching 1.75 inches with males displaying dark charcoal body and prominent black shoulder spot with white-edged fins. Native to Brazilian river tributaries in Guapore and Paraguay basins, they inhabit soft, acidic waters. Peaceful, hardy, and displaying sexual dimorphism with colorful males and pinkish females, these attractive schoolers thrive in groups of 6+ in planted tanks with subdued lighting.',

  redPhantomTetra:
    'A peaceful tetra reaching 1.5 inches with translucent reddish body, black shoulder spot, and red-edged fins. Native to Colombian and Venezuelan Orinoco River tributaries, they inhabit soft, acidic blackwater streams. Peaceful, somewhat timid, and displaying best colors in planted tanks with dark substrate, these schooling fish thrive in groups of 6+ and prefer subdued lighting with tannin-stained water conditions.',

  emperorTetra:
    'A regal tetra reaching 2 inches with purple-gray body, yellow stripe, and impressive finnage with males developing flowing extensions. Native to Colombian river systems in San Juan and Atrato basins, they inhabit soft, acidic forest streams. Peaceful, hardy, and displaying royal purple iridescence, these attractive schoolers thrive in groups of 6+ in well-planted tanks with subdued lighting enhancing their coloration.',

  lemonTetra:
    'A peaceful tetra reaching 2 inches with lemon-yellow coloration and black-edged fins with bright yellow tips. Native to Brazilian Amazon tributaries, they inhabit slow-moving, well-vegetated waters. Peaceful, hardy once established, and displaying best yellow coloration in mature specimens, these attractive schoolers thrive in groups of 6+ in planted tanks with slightly acidic water and quality diet enhancing color.',

  greenNeonTetra:
    'A tiny tetra reaching 1 inch with brilliant neon-green stripe and less red than standard neon tetras. Native to upper Amazon basin tributaries in Colombia and Brazil, they inhabit soft, acidic blackwater streams. Peaceful, timid, and smaller than neon tetras, these delicate schoolers thrive in groups of 10+ in well-planted tanks with soft water and appreciate blackwater conditions with tannins.',

  penguinTetra:
    'A distinctive tetra reaching 3 inches with black and white coloration and characteristic swimming posture at an upward angle. Native to Amazon and Parana River basins, they inhabit slow-moving, well-vegetated waters. Peaceful, active, and hardy, these unique schooling fish thrive in groups of 6+ and display their namesake upward swimming behavior, particularly when exploring the upper water column.',

  silvertipTetra:
    "A small, energetic schooling fish reaching 2 inches with distinctive silvery-white fin tips and coppery-orange males. Native to Brazil's Sao Francisco River basin in both blackwater and clearwater environments, they are unusually bold and active for nano tetras. Hardy and adaptable to various water parameters, these lively fish display fascinating feeding frenzies and require groups of 8-10+ to minimize fin-nipping of long-finned tankmates, making them excellent community fish when properly housed.",

  headAndTailLightTetra:
    'A peaceful schooling tetra reaching 2 inches with distinctive iridescent copper-rimmed spots near head and tail resembling lights. Native to slow-moving rivers and streams of the Amazon and Orinoco basins throughout northern South America, they inhabit heavily vegetated areas with tannin-stained water. Hardy, beginner-friendly, and inexpensive, these attractive fish thrive in groups of 6+ and display best in dark-substrate planted tanks where their glowing markings catch the light, making them a classic community tank staple.',

  colombianTetra:
    "A striking medium tetra reaching 2.5 inches with iridescent blue-silver body and vibrant red fins creating a spectacular contrast. Native to Colombia's Rio Acandi basin near the Caribbean coast, they inhabit warm, slow-moving streams with dense vegetation. Hardy, bold, and active fish that became popular since 2003, these energetic schoolers display confident swimming behavior and can be semi-aggressive fin-nippers if kept in groups smaller than 6-8, requiring well-planted tanks with secure lids as they are enthusiastic jumpers.",

  rosyTetra:
    'A peaceful schooling tetra reaching 1.75 inches with rosy-pink body coloration and black-trimmed dorsal, anal, and pelvic fins. Native to slow-moving blackwater streams and flooded forests of Suriname and Brazil, they thrive in tannin-rich, soft acidic water with dense vegetation. Beautiful when mature with males displaying deep rose-pink hues, these hardy fish school actively and create stunning displays in planted tanks, preferring groups of 6+ with other peaceful community species.',

  yellowPhantomTetra:
    'A peaceful nano tetra reaching 2 inches with striking yellow body, black shoulder spot, and orange-blue fins with white tips. Native to slow-moving blackwater streams of French Guiana and upper Amazon, they thrive in soft acidic tannin-rich water with dense vegetation. Hardy schooling fish that prefer subdued lighting and minimal current, these attractive tetras display best in planted tanks with dark substrates where their golden coloration intensifies, requiring groups of 8-10+ for optimal behavior and confidence.',

  beckfordsPencilfish:
    'A slender surface-dwelling fish reaching 2 inches with golden-yellow to red body and horizontal black stripe from head to tail. Native to slow-moving blackwater streams and swamps of the Amazon and Guyana basins, they hover near the surface in heavily vegetated areas rich in tannins. Hardy, peaceful, and inquisitive, these elegant schoolers display fascinating swimming behavior and thrive in planted tanks with floating vegetation and subdued lighting, requiring groups of 6+ to feel secure and display natural behaviors.',

  goldenPencilfish:
    'A distinctive elongated surface-dweller reaching 1.5 inches that swims at a characteristic 45-degree diagonal angle. Native to slow-moving blackwater streams of the Amazon basin in Guyana and Colombia, they hover near the surface among dense vegetation and leaf litter. Peaceful, shy, and unique in their oblique swimming posture, these delicate fish require heavily planted tanks with minimal current and dim lighting, thriving in groups of 8-10+ where they display their unusual hovering behavior and subtle iridescence.',

  blindCaveTetra:
    'A unique eyeless albino tetra reaching 3.5 inches that evolved in dark Mexican cave systems. Native to underground rivers and caves of the Sierra Madre Oriental in Mexico, they navigate using heightened lateral line senses and smell. Hardy, active, and resilient despite blindness, these fascinating fish are often first to food and can be moderately aggressive at night, preferring cooler water than most tropical fish and thriving in groups of 6+ in dimly lit tanks with peaceful tankmates.',

  garnetTetra:
    'A small peaceful tetra reaching 1.5 inches with warm ruby-garnet glow and black-trimmed fins. Native to slow-moving tributaries and flooded creeks of the upper Amazon basin in Peru and Brazil, they inhabit soft acidic blackwater with dense leaf litter and vegetation. Shy, delicate schooling fish that display stunning coloration in proper conditions, requiring soft very clean water with minimal flow, dark substrate, tannins, and subdued lighting, thriving best in groups of 8-10+ where they school actively in mid-water levels.',

  dwarfPencilfish:
    'A tiny surface-dwelling nano fish reaching 1 inch with silver body, two prominent black horizontal stripes, and red patch at tail base. Native to calm shallow blackwater streams and swamps of the Amazon basin throughout Guyana, Suriname, Brazil, Peru, and Colombia, they navigate through dense vegetation in tannin-stained water. Peaceful, playful, and charming despite their diminutive size, these active schoolers zip around in groups, engaging in playful tag before gathering in tight shoals, requiring heavily planted tanks with floating plants and groups of 6+.',

  flagTetra:
    'A beautiful tetra reaching 2 inches with silver body, prominent black horizontal stripe, iridescent green-yellow band above, and orange upper eye. Native to slow-moving Amazon tributaries and coastal drainages in Brazil, they inhabit heavily vegetated blackwater and clearwater streams. Peaceful, shy schooling fish that require groups of 8+ for confidence and best coloration display, thriving in densely planted tanks with subdued lighting and gentle current where males show vibrant colors when competing for females.',

  costelloTetra:
    'A small schooling tetra reaching 1.5 inches from the Amazon basin. Native to slow-moving blackwater tributaries with dense vegetation, they prefer soft acidic tannin-rich water. Peaceful, active, and ideal for nano community tanks, these delicate fish thrive in groups of 6+ with subdued lighting and planted aquascapes where their subtle iridescence displays best in proper water conditions.',

  platinumTetra:
    'A small silver tetra reaching 1.5 inches with metallic sheen from the Amazon basin. Native to blackwater streams with dense vegetation, they prefer soft acidic water with tannins. Peaceful schooling fish that remain active in mid-water levels, thriving in planted tanks with groups of 6+ where their platinum coloration catches subdued lighting for best display.',

  blackLineTetra:
    'A hardy beginner-friendly tetra reaching 2 inches with silver body and prominent black horizontal stripe from gill to tail. Native to clearwater rivers of the Amazon basin, they unusually prefer higher pH and clearer water than most South American tetras. Peaceful, active schooling fish that acclimate well to various conditions, thriving in groups of 6+ with ample swimming space and gradually reducing hiding spots as confidence builds.',

  loretoTetra:
    'A rare nano tetra reaching 1.2 inches with subtle shimmer and delicate build from the Amazon basin of Peru. Native to slow-moving blackwater streams with overhanging vegetation and tannin-stained water, they are sensitive to water quality fluctuations. Peaceful, shy, and active schoolers requiring groups of 8-10+ in heavily planted tanks with subdued lighting and excellent water quality, best suited for experienced aquarists due to their delicate nature.',

  dawnTetra:
    'A striking nano tetra reaching 1.5 inches with bold black-and-white panda-like pattern. Native to slow-moving streams of Bolivia, Paraguay, and southern Brazil, they prefer soft slightly acidic water. Peaceful but can be fin nippers if kept in small groups, requiring schools of 12+ in 40+ gallon tanks to minimize aggression and display natural schooling behavior, creating stunning visual contrasts in planted aquariums.',

  kittyTetra:
    'A vibrant tetra reaching 1.75 inches with red-orange coloration along body and fins, prominent flag-like dorsal fin in males. Native to South American rivers, they prefer soft slightly acidic water with vegetation. Peaceful, sociable, and colorful schooling fish that thrive in groups of 6+ with equal male-female ratios, displaying dynamic colors and lively behavior in community tanks with subdued lighting and planted areas.',

  goldenTetra:
    'A shimmering tetra reaching 2 inches with golden-yellow metallic sheen from natural parasites acquired in wild populations. Native to Amazon basin streams and tributaries, they adapt well to various water conditions. Peaceful, hardy schooling fish suitable for beginners and experienced aquarists alike, thriving in groups of 6+ in community tanks where their unique golden glow displays best against dark substrates and planted backgrounds.',

  coralRedPencilfish:
    'A stunning nano surface-dweller reaching 1.2 inches with intense fire-engine red males and high-contrast black-striped females. Native to wild-caught populations in South American blackwater streams, they are delicate and require pristine stable water quality. Peaceful, shy surface fish that prefer top levels near floating plants with tight-fitting lids to prevent jumping, requiring groups of 8-10+ with 1 male to 2 female ratio to reduce territorial disputes.',

  rubyTetra:
    'A tiny jewel-like nano tetra reaching 0.75 inches with vibrant ruby-red body coloration. Native to slow-moving streams and tributaries of Colombia and Venezuela, they prefer calm environments with minimal flow. Peaceful, slow-moving, and colorful schooling fish that pair well with other small peaceful species like Pygmy Corydoras, thriving in groups of 6+ in heavily planted tanks with subdued lighting where their intense red coloration displays brilliantly.',

  glassBloodfin:
    'A transparent elongated tetra reaching 2.5 inches with red-tipped fins. Native to South American rivers and streams, they prefer well-oxygenated flowing water. Active, hardy schooling fish that swim energetically in mid-water levels, thriving in groups of 6+ in larger community tanks with current and open swimming space where their transparent bodies and colorful fin tips create elegant displays.',

  redeyeTetra:
    'A robust active tetra reaching 2.75 inches with silver body, subtle pink-orange hue, and striking bright red eye. Native to clear slow-moving rivers of Brazil, Paraguay, and Argentina with dense vegetation, they are hardy fish capable of asserting themselves without becoming prey. Peaceful, energetic schoolers requiring groups of 6+ in larger community tanks with ample swimming space, displaying graceful movements and dynamic schooling behavior with similarly-sized peaceful tankmates.',

  // ============================================
  // BARBS
  // ============================================
  tigerBarb:
    'An active, boisterous schooling fish reaching 3 inches with distinctive gold body and four bold black vertical bands. Native to Indonesian and Malaysian streams and rivers, they inhabit clear, well-oxygenated waters. Semi-aggressive with notorious fin-nipping behavior, these energetic swimmers must be kept in groups of 6+ to minimize aggression and should not be housed with long-finned or slow-moving species.',

  cherryBarb:
    "A peaceful, colorful cyprinid reaching 2 inches and endemic to Sri Lanka's Kelani and Nilwala river basins. Males display stunning cherry-red coloration during spawning while females are more subdued golden-brown; they inhabit heavily shaded, shallow streams with dense vegetation and leaf litter. Hardy and beginner-friendly, these active schooling fish thrive in groups of 6+ in planted community tanks and are notably less aggressive than other barb species.",

  rosyBarb:
    'A peaceful, hardy barb reaching 6 inches with males displaying rosy-red coloration especially during breeding. Native to northern Indian streams and rivers, they tolerate cooler temperatures and adapt to diverse conditions. Peaceful for barbs and suitable for community tanks, these active schoolers thrive in groups of 6+ and appreciate well-oxygenated water with moderate current, making excellent beginner fish.',

  goldBarb:
    'A small, peaceful barb reaching 3 inches with golden-yellow body and subtle dark markings. Native to Southeast Asian streams in southern China, Vietnam, and Laos, they inhabit well-vegetated areas. Peaceful, active, and significantly less aggressive than other barb species, these hardy schooling fish thrive in groups of 6+ and make excellent community tank inhabitants without the fin-nipping issues of their relatives.',

  odessaBarb:
    'A striking barb reaching 3 inches with males developing brilliant red-orange lateral bands during maturity. Native to Myanmar streams (with disputed wild origins), they prefer well-oxygenated waters. Peaceful for barbs and suitable for community tanks, these active schoolers thrive in groups of 6+ and display minimal fin-nipping compared to other barb species, developing best coloration in planted tanks.',

  denisonBarb:
    'A large, spectacular barb reaching 6 inches with red horizontal stripe from nose to tail and black-and-yellow striped tail. Native to fast-flowing Indian mountain streams in Western Ghats, they are endemic and threatened in wild. Peaceful, active, and requiring high oxygen with strong current, these impressive schoolers thrive in groups of 6+ in spacious tanks and are sometimes called Roseline Sharks.',

  fiveBandedBarb:
    'A peaceful barb reaching 3 inches with five bold vertical black bands on golden body. Native to Southeast Asian streams in Malaysia, Singapore, and Indonesia, they prefer well-vegetated areas. Peaceful, shy, and suitable for community tanks unlike many barbs, these attractive schoolers thrive in groups of 6+ in planted tanks with minimal aggression and fin-nipping behavior.',

  blackRubyBarb:
    'A stunning barb reaching 2.5 inches with males developing intense ruby-red and black coloration during breeding. Native to Sri Lankan hill streams with cool, well-oxygenated water, they prefer flowing conditions. Peaceful for barbs and suitable for community tanks, these color-changing schoolers thrive in groups of 6+ in cooler water than most tropical species, with males displaying spectacular breeding colors.',

  checkerBarb:
    'A peaceful barb reaching 2 inches with distinctive checkerboard pattern of dark squares on golden body. Native to Indonesian streams in Sumatra, they prefer well-vegetated soft water habitats. Peaceful, shy, and suitable for community tanks unlike most barbs, these attractive schoolers thrive in groups of 6+ in planted tanks with minimal fin-nipping behavior, displaying best colors in soft, slightly acidic conditions.',

  tictoBarb:
    'A peaceful barb reaching 4 inches with silver-gold body and two distinctive black spots (one mid-body, one near tail). Native to Sri Lankan streams and rivers, they prefer well-oxygenated flowing waters. Peaceful for barbs and suitable for community tanks, these active schoolers thrive in groups of 6+ with minimal fin-nipping behavior compared to other barb species, displaying subtle coloration that intensifies during breeding.',

  tinfoilBarb:
    'A large active barb reaching 14 inches with bright silver metallic body and red-orange fin accents. Native to fast-flowing rivers and streams of Thailand, Sumatra, and Borneo in Southeast Asia, they require very large aquariums with powerful filtration. Peaceful, schooling, and herbivorous fish that jump readily and eat live plants voraciously, best suited for species tanks or with other large peaceful fish, requiring groups of 5+ and 125+ gallon aquariums due to their massive adult size and high activity level.',

  aruliusBarb:
    'A medium-sized barb reaching 4.5 inches with silver-gold body, black vertical bars, and extended filamentous dorsal fin rays in mature males. Native to fast-flowing hill streams of southern India, they prefer well-oxygenated cooler water with current. Active, peaceful schooling fish that can be boisterous and nippy with long-finned tankmates, thriving in groups of 6+ in spacious tanks with strong filtration and plenty of swimming room alongside robust peaceful species.',

  melonBarb:
    'A colorful medium barb reaching 6 inches with pinkish-orange body resembling a melon and black spot near tail. Native to fast-flowing streams of southern India, they prefer well-oxygenated water with current. Active, peaceful schooling fish that remain energetic and require spacious tanks with strong filtration, thriving in groups of 6+ with other active peaceful species and plenty of open swimming areas for their boisterous nature.',

  tBarb:
    'A medium barb reaching 6 inches with distinctive T-shaped or two-spot pattern on sides. Native to fast-flowing streams and rivers of Southeast Asia, they prefer well-oxygenated water. Active, schooling, and hardy fish that adapt well to aquarium life, thriving in groups of 6+ in spacious tanks with current and robust peaceful tankmates that can match their energetic swimming behavior.',

  cumingsBarb:
    'A small attractive barb reaching 2 inches with golden-yellow body and distinct black markings. Native to streams of Sri Lanka, they prefer planted tanks with open swimming areas. Peaceful, active schooling fish perfect for smaller community aquariums, thriving in groups of 6+ with gentle water flow and plenty of plants for cover while maintaining areas for their energetic mid-water swimming behavior.',

  // ============================================
  // DANIOS
  // ============================================
  zebraDanio:
    'A small, active schooling fish reaching 2 inches with distinctive horizontal blue and gold stripes running the length of the body. Native to streams and rivers in India and Bangladesh, they inhabit both fast-flowing and slow-moving waters. Extremely hardy, peaceful, and energetic, these beginner-friendly fish thrive in groups of 6+ and tolerate a wide range of temperatures and water conditions, making them ideal for unheated tanks.',

  whiteCloudMinnow:
    'A small, hardy minnow reaching 1.5 inches with tan body, red-tipped fins, and neon stripe running horizontally. Native to Chinese mountain streams in the White Cloud Mountain region, they naturally inhabit cooler waters. Extremely peaceful, cold-tolerant, and beginner-friendly, these active schoolers thrive in unheated tanks or cool water setups and display brilliant colors at lower temperatures, making them ideal for temperate aquariums.',

  goldWhiteCloud:
    'A color variant of white cloud mountain minnow reaching 1.5 inches with golden body and red-tipped fins. Selectively bred from wild-type, not naturally occurring. Peaceful, cold-tolerant, and beginner-friendly, these attractive schoolers thrive in unheated tanks or cool water setups and display brilliant golden coloration at lower temperatures, making them ideal for temperate aquariums.',

  celestialPearlDanio:
    "A tiny, stunning nano fish reaching only 1 inch with dark blue body covered in pearl-white spots and brilliant orange-red fins with black striping. Native to shallow vegetated ponds in Myanmar's Shan Plateau, they were discovered in 2006 and rapidly became popular. Peaceful, somewhat shy, and moderately easy to care for, these miniature schooling fish thrive in groups of 6+ in densely planted tanks with soft, slightly acidic water and subdued lighting.",

  pearlDanio:
    'A small, elongated danio reaching 2.5 inches with translucent body featuring pearlescent bluish scales and orange-red stripe. Native to Southeast Asian streams in Myanmar, Thailand, and Sumatra, they inhabit both fast and slow-flowing waters. Peaceful, hardy, and extremely active, these surface-dwelling schoolers thrive in groups of 6+ and tolerate cooler temperatures than most tropical fish, making excellent community tank inhabitants.',

  glowlightDanio:
    "A tiny vibrant danio reaching 1 inch with stunning bars, stripes, and spots in green, gold, red, and turquoise creating a glowing appearance. Native to clear fast-flowing streams of northern Myanmar's Irrawaddy River drainage, they are endemic to only three localities. Peaceful, nervous, shy schooling fish that move fast and require groups of 6-8+ with small calm tankmates or species-only setups, thriving in planted tanks with current where their brilliant coloration makes them highly prized despite being rare and expensive.",

  giantDanio:
    'A large active danio reaching 4 inches with blue-green body and yellow-gold horizontal stripes. Native to fast-flowing streams and rivers of India, Sri Lanka, and Myanmar, they prefer well-oxygenated water with current. Active, peaceful, boisterous schooling fish that jump readily and require secure lids, thriving in groups of 6+ in large tanks with strong filtration and ample swimming space alongside other robust active species that can match their energetic behavior.',

  malabarDanio:
    'A medium-sized active danio reaching 6 inches with silvery-blue body and horizontal stripes. Native to fast-flowing mountain streams of southwestern India, they prefer well-oxygenated cooler water with strong current. Energetic, peaceful schooling fish that are excellent jumpers requiring tight-fitting lids, thriving in groups of 6+ in large tanks with powerful filtration and plenty of open swimming areas for their constant high-energy activity.',

  orangeFinnedDanio:
    'A small colorful danio reaching 1.5 inches with striking orange fins contrasting against silvery body. Native to streams and rivers of Southeast Asia, they adapt to various water conditions and can tolerate cooler temperatures. Peaceful, active, social schooling fish perfect for community aquariums, thriving in groups of 6+ in planted tanks with mix of open swimming areas and vegetation where their vibrant orange fins create beautiful displays in mid-water levels.',

  // ============================================
  // RASBORAS
  // ============================================
  harlequinRasbora:
    'A distinctive schooling fish reaching 2 inches with pinkish-orange coloration and a bold black triangular wedge extending from mid-body to tail. Native to Southeast Asian peat swamp streams and blackwater habitats in Thailand, Malaysia, and Indonesia, they prefer soft, acidic conditions with dense vegetation. Hardy, peaceful, and beginner-friendly, these active swimmers thrive in groups of 6-8+ in well-planted community tanks, displaying vibrant colors against dark substrates while swimming primarily in upper water levels.',

  scissortailRasbora:
    'A large, active rasbora reaching 6 inches with silver body and deeply forked tail with black and white markings that move like scissors. Native to Southeast Asian rivers and streams in Thailand, Malaysia, and Indonesia, they inhabit both flowing and still waters. Peaceful, hardy, and extremely active, these fast-swimming schoolers require spacious tanks and thrive in groups of 6+ with strong filtration, constantly moving throughout all water levels.',

  lambchopRasbora:
    "A small rasbora reaching 1.5 inches with distinctive lambchop-shaped black wedge narrower than harlequin rasbora's triangle. Native to Southeast Asian peat swamps in Thailand and Cambodia, they prefer soft, acidic blackwater conditions. Peaceful, hardy, and closely related to harlequin rasbora, these attractive schoolers thrive in groups of 6+ in well-planted tanks with subdued lighting and tannin-stained water.",

  brilliantRasbora:
    'A small, colorful rasbora reaching 1.5 inches with pinkish body and brilliant blue-green iridescence. Native to Malaysian and Thai peat swamps and forest streams, they inhabit soft, acidic blackwater conditions. Peaceful, active, and displaying stunning iridescence under proper lighting, these attractive schoolers thrive in groups of 8+ in well-planted tanks with dark substrate and tannin-stained water.',

  phoenixRasbora:
    'A tiny, brilliant nano fish reaching only 0.75 inches with fiery red-orange coloration and dark lateral stripe. Native to Borneo peat swamp forests in blackwater habitats, they inhabit extremely soft, acidic, tannin-stained waters. Peaceful, delicate, and best suited for species-specific nano tanks, these miniature schoolers display stunning coloration in groups of 10+ but require pristine water quality and gentle tank conditions.',

  strawberryRasbora:
    'A tiny nano fish reaching only 0.75 inches with pinkish-red body and distinctive large black spot on side. Native to southern Borneo blackwater habitats in peat swamp forests, they inhabit extremely soft, acidic waters with dense vegetation. Peaceful, delicate, and best suited for species-specific nano tanks, these miniature schoolers require pristine water quality and gentle conditions, displaying striking coloration in groups of 10+ in well-planted setups.',

  chiliRasbora:
    'A tiny, brilliant nano fish reaching only 0.75 inches with deep red coloration in males. Native to southwestern Borneo peat swamp forests in blackwater habitats, they inhabit extremely soft, acidic waters. Peaceful, delicate, and best suited for species-specific nano tanks, these miniature schoolers require pristine water quality and display intense coloration in groups of 10+ with dark substrate and heavy planting.',

  exclamationPointRasbora:
    'A tiny nano fish reaching only 0.75 inches with single bold black spot at tail base resembling an exclamation point. Native to Indonesian peat swamps in southern Borneo, they inhabit soft, acidic blackwater conditions. Peaceful, delicate, and requiring species-specific nano setups, these miniature schoolers thrive in groups of 10+ with pristine water quality and dense vegetation.',

  dwarfSpottedRasbora:
    'A tiny nano rasbora reaching 0.75 inches with red-orange body and distinctive dark spots along sides. Native to slow-moving peat swamps, streams, and rivers of Southeast Asia with heavy leaf litter and tannins, they inhabit soft acidic blackwater. Peaceful, delicate, striking schooling fish ideal for nano aquariums, thriving in groups of 8+ in heavily planted tanks with dark substrate and subdued lighting where their vibrant red coloration displays beautifully.',

  redtailRasbora:
    'A slender active rasbora reaching 2 inches with silvery body and distinctive red tail fin. Native to streams and rivers of Southeast Asia, they prefer well-planted tanks with open swimming areas. Peaceful, hardy schooling fish that swim actively in mid-water, thriving in groups of 6+ in community aquariums where their bright red tails create colorful accents as they dart through planted areas.',

  rummyNoseRasbora:
    'A distinctive nano rasbora reaching 1.5 inches with translucent silvery-green body and bright red snout resembling Rummy Nose Tetras. Native to high-altitude streams of Myanmar at elevations around 4000 feet, they prefer cooler well-oxygenated flowing water. Peaceful, active schooling fish that occupy mid-upper water levels, thriving in groups of 8+ in planted tanks with current and excellent water quality where their unique red noses create striking displays.',

  microrasbora:
    "A tiny, stunning nano fish reaching only 1 inch with dark blue body covered in pearl-white spots and brilliant orange-red fins with black striping. Native to shallow vegetated ponds in Myanmar's Shan Plateau, they were discovered in 2006 and rapidly became popular. Peaceful, somewhat shy, and moderately easy to care for, these miniature schooling fish thrive in groups of 6+ in densely planted tanks with soft, slightly acidic water and subdued lighting.",

  emeraldDwarfRasbora:
    'A tiny nano fish reaching 0.75 inches with emerald-green iridescence and orange-red fins with black markings. Native to Myanmar mountain streams, they inhabit cool, clear, well-oxygenated waters. Peaceful, active, and displaying brilliant colors despite tiny size, these miniature schoolers thrive in groups of 10+ in well-planted nano tanks with cooler temperatures than most tropical fish.',

  // ============================================
  // RAINBOWFISH
  // ============================================
  boesemansRainbowfish:
    'A spectacular rainbowfish reaching 4.5 inches with males displaying blue-gray front half and orange-red rear half. Native to Vogelkop Peninsula lakes in West Papua, Indonesia, they are endemic to limited regions. Active, peaceful, and displaying stunning bicolor pattern when mature, these impressive schoolers thrive in groups of 6+ in spacious tanks with moderate current and slightly hard, alkaline water.',

  turquoiseRainbowfish:
    'A stunning rainbowfish reaching 4 inches with males developing brilliant turquoise-blue coloration on upper body and yellow-orange lower body. Native to northern Australian streams in Arnhem Land, they inhabit clear, well-vegetated waters. Peaceful, active, and displaying spectacular coloration when mature, these hardy schoolers thrive in groups of 6+ in well-planted tanks with moderate current and slightly hard, neutral to alkaline water.',

  redRainbowfish:
    'A large, spectacular rainbowfish reaching 6 inches with males developing intense cherry-red coloration and deep bodies at maturity. Native to Lake Sentani in Papua, Indonesia, they are endemic to this single location. Active, peaceful, and striking when mature, these impressive schoolers thrive in groups of 6+ in spacious tanks with hard, alkaline water and strong filtration, requiring patience as juveniles are silver and develop color slowly.',

  threadfinRainbowfish:
    'A slender rainbowfish reaching 2 inches with males developing elongated threadlike dorsal and anal fin extensions. Native to northern Australian streams and rivers in Papua New Guinea, they inhabit clear, well-vegetated waters. Peaceful, active, and displaying stunning fin extensions when mature, these delicate schoolers thrive in groups of 6+ in well-planted tanks with moderate current and slightly hard, neutral to alkaline water.',

  dwarfNeonRainbowfish:
    'A tiny rainbowfish reaching only 2.5 inches with brilliant neon-blue stripe and red-orange fins. Native to New Guinea streams, they inhabit clear, well-vegetated waters. Peaceful, active, and perfect for smaller tanks unlike larger rainbowfish, these vibrant schoolers thrive in groups of 6+ with hard, alkaline water and display stunning coloration despite small size.',

  bandedRainbowfish:
    'A colorful medium rainbowfish reaching 5 inches with distinctive vertical bands and iridescent blue-green body. Native to streams and rivers of Papua New Guinea, they prefer well-oxygenated flowing water with vegetation. Active, peaceful schooling fish that display stunning colors when mature males compete, thriving in groups of 6+ with 2:1 female to male ratio in spacious tanks with good water movement and plenty of swimming room.',

  kamakaRainbowfish:
    'A stunning rainbowfish reaching 3.5 inches with electric blue body and yellow-orange fins. Native to fast-flowing streams of Papua New Guinea, they prefer well-oxygenated water with current. Active, peaceful, brilliantly colored schooling fish that intensify in color with age, thriving in groups of 6+ in well-maintained tanks with good water movement and quality where mature males display spectacular electric blue coloration.',

  axelrodiRainbowfish:
    'A beautiful smaller rainbowfish reaching 3 inches with blue-green iridescent body and red-orange fins. Native to clear streams of Papua New Guinea, they prefer well-oxygenated flowing water. Active, peaceful, colorful schooling fish that develop vibrant coloration with maturity, thriving in groups of 6+ in well-filtered tanks with moderate flow and open swimming areas where their brilliant colors create stunning displays.',

  // ============================================
  // LIVEBEARERS
  // ============================================
  guppy:
    'An extremely popular livebearer reaching 2 inches (males smaller with elaborate fins and colors, females larger and plainer), known for prolific breeding and stunning color variety. Native to South America and Caribbean streams, they adapt to diverse conditions including brackish water, originally introduced globally for mosquito control. Hardy, peaceful, and beginner-friendly despite weakened genetics from mass breeding, these active surface-dwellers thrive in groups with slightly hard, alkaline water and reproduce continuously with minimal intervention.',

  endlersLivebearer:
    'A tiny, brilliantly colored livebearer reaching only 1 inch (males smaller and more colorful than females). Native to coastal lagoons in northeastern Venezuela, they inhabit shallow, heavily vegetated waters. Peaceful, active, and extremely prolific breeders, these nano fish thrive in species-only or small community tanks and readily hybridize with guppies, requiring separation if maintaining pure strains.',

  molly:
    'A popular livebearer reaching 3-5 inches (depending on variety) available in numerous colors including black, orange, silver, and dalmatian patterns. Native to Central and South American coastal regions, they naturally inhabit both freshwater and brackish waters. Hardy, active, and generally peaceful though males can be persistent breeders, these adaptable fish thrive in community tanks with slightly hard, alkaline water and benefit from occasional salt addition.',

  balloonMolly:
    'A selectively-bred livebearer characterized by its distinctive rounded, balloon-like body resulting from scoliosis. These peaceful, active fish reach 3-4 inches and come in diverse color varieties including black, white, gold, and dalmatian patterns. Originally derived from Central and South American molly species, they adapt well to both freshwater and brackish conditions with slightly alkaline water, making them beginner-friendly community fish that prefer social groups.',

  blackMolly:
    'A jet-black color variant of Poecilia sphenops, reaching 3-4 inches and developed through selective breeding. Originating from Central and South American brackish and freshwater habitats, these peaceful livebearers are notably effective at consuming filamentous algae and blue-green algae. Social and hardy when kept in groups with slightly alkaline, harder water, though less tolerant of poor conditions than some molly varieties, they make attractive community fish with proper care.',

  dalmatianMolly:
    'A color variant of common molly reaching 3-4 inches with white body covered in black spots resembling a dalmatian dog. Selectively bred variant not found in wild, originating from standard mollies. Hardy, peaceful, and thriving in both freshwater and brackish conditions, these active livebearers reproduce prolifically and prefer slightly hard, alkaline water with occasional salt addition.',

  sailfinMolly:
    'A larger molly variety with males displaying impressive sail-like dorsal fins. Native to coastal waters of the Gulf of Mexico region, they inhabit both freshwater and brackish environments. Peaceful, active, and preferring slightly brackish conditions for optimal health, these attractive livebearers thrive in community tanks with slightly hard, alkaline water.',

  platy:
    'A colorful, hardy livebearer reaching 2-3 inches with numerous color varieties including red, orange, yellow, and blue developed through selective breeding. Native to Central American freshwater and brackish streams, they adapt well to diverse water conditions. Peaceful, active, and extremely beginner-friendly, these prolific breeders thrive in community tanks with slightly hard, alkaline water and readily accept varied diets while displaying minimal aggression.',

  variatusPlaty:
    'A hardy livebearer reaching 2.5 inches with naturally occurring variable coloration including sunset and high-fin varieties. Native to Mexican rivers and streams in cooler highland regions, they tolerate lower temperatures than most livebearers. Peaceful, active, and extremely adaptable, these prolific breeders thrive in community tanks with slightly hard, alkaline water and are hardier than common platies, tolerating temperatures down to 60F.',

  swordtail:
    'A popular livebearer reaching 4-5 inches (males with distinctive sword-like tail extension) available in multiple color varieties. Native to Central American rivers and streams, they prefer well-oxygenated water with moderate current. Hardy, active, and generally peaceful though males can be territorial, these prolific breeders thrive in community tanks with slightly hard, alkaline water and appreciate planted areas for refuge.',

  leastKillifish:
    'A tiny livebearer reaching only 1.5 inches with females larger than males, among smallest livebearing fish. Native to southeastern United States freshwater and brackish habitats, they inhabit heavily vegetated shallow waters. Peaceful, hardy, and perfect for nano tanks, these prolific breeders produce small broods continuously and thrive in planted tanks with peaceful tankmates, tolerating wide temperature ranges.',

  mosquitofish:
    "A small, dull-gray livebearer reaching 1.5-3 inches (females larger) introduced globally for mosquito control. Native to Mississippi River basin and Gulf Coast drainages, they inhabit shallow, vegetated fresh and brackish waters. Extremely hardy and adaptable but highly aggressive toward other fish with fin-nipping behavior, these prolific breeders are considered among the world's worst invasive species and should not be kept in community aquariums or released into natural waters.",

  // ============================================
  // GOURAMIS
  // ============================================
  bettaFish:
    "The iconic Siamese fighting fish, reaching 2.5-3 inches and native to Southeast Asia's shallow, slow-moving waters. Renowned for vibrant coloration and elaborate finnage developed through centuries of selective breeding, males display extreme territorial aggression toward one another. Hardy and adaptable thanks to their labyrinth organ allowing surface air breathing, they thrive in heated, filtered tanks with gentle water flow, making them popular beginner fish despite their solitary housing requirements.",

  bettaImbellis:
    'A peaceful wild betta reaching 2 inches with iridescent green-blue body and red-orange fins. Native to southern Thailand and Malaysian peat swamps, they inhabit shallow, acidic waters with dense vegetation. Peaceful unlike splendens bettas and suitable for community tanks, these beautiful labyrinth fish can be kept in pairs or groups in well-planted tanks with gentle tankmates, displaying elaborate courtship without excessive aggression.',

  dwarfGourami:
    'A small, colorful labyrinth fish reaching 2-3 inches with males displaying brilliant blue and red striped patterns. Native to slow-moving waters and rice paddies in India and Bangladesh, they build bubble nests at the surface. Peaceful but males can be territorial, these beginner-friendly fish breathe atmospheric air through their labyrinth organ and prefer planted tanks with calm water and floating plants.',

  honeyGourami:
    'A small, peaceful labyrinth fish reaching 2 inches with golden-honey coloration (males turning brilliant orange during breeding). Native to northeastern Indian slow-moving waters with dense vegetation, they inhabit shallow, heavily planted areas. Extremely peaceful, shy, and beginner-friendly, these miniature gouramis thrive in heavily planted community tanks and are less territorial than other gourami species.',

  pearlGourami:
    'A medium-sized labyrinth fish reaching 4-5 inches with stunning pearl-like white spots covering a golden-brown body. Native to Southeast Asian peat swamps, shallow pools, and lowland streams with dense vegetation, they prefer soft, acidic blackwater conditions. Peaceful, shy, and elegant, these hardy fish develop long, thread-like pelvic fins and males display brilliant orange coloration during breeding.',

  threeSpotGourami:
    'A large labyrinth fish reaching 5-6 inches with blue-gray body and two distinct spots (third spot is the eye). Native to Southeast Asian slow-moving waters, marshes, and rice paddies, they inhabit heavily vegetated areas. Semi-aggressive and territorial especially toward other gouramis, these hardy fish breathe atmospheric air and adapt to various conditions, thriving in well-planted tanks with calm surface areas for bubble nest building.',

  opalineGourami:
    'A color variant of the three-spot gourami reaching 5-6 inches with marbled blue-gray pattern lacking distinct spots. Native to Southeast Asian slow-moving waters, marshes, and rice paddies, they inhabit heavily vegetated areas. Semi-aggressive and territorial especially toward other gouramis, these hardy labyrinth fish breathe atmospheric air and prefer well-planted tanks with calm surface areas for bubble nest construction.',

  blueGourami:
    'A large labyrinth fish reaching 5-6 inches with powder-blue body and two distinct spots (third spot is the eye). Native to Southeast Asian slow-moving waters, marshes, and rice paddies, they inhabit heavily vegetated areas. Semi-aggressive and territorial especially toward other gouramis, these hardy fish breathe atmospheric air and adapt to various conditions, thriving in well-planted tanks with calm surface areas for bubble nest building.',

  goldGourami:
    'A color variant of three-spot gourami reaching 5-6 inches with golden-yellow body lacking distinct spot pattern. Selectively bred morph of blue gourami, not found in wild. Semi-aggressive and territorial especially toward other gouramis, these hardy labyrinth fish breathe atmospheric air and thrive in well-planted tanks with calm surface areas, displaying same care requirements as blue gourami.',

  moonlightGourami:
    'A peaceful, silvery labyrinth fish reaching 6 inches with subtle iridescent blue sheen and orange-tinted pelvic fins. Native to Southeast Asian slow-moving rivers and floodplains in Thailand and Cambodia, they inhabit thickly vegetated waters. Peaceful, hardy, and less territorial than most gouramis, these graceful swimmers thrive in community tanks with calm water and appreciate floating plants for bubble nest building.',

  kissingGourami:
    'A large labyrinth fish reaching 12 inches with distinctive thick lips used for "kissing" behavior between individuals. Native to Southeast Asian slow-moving waters and flooded areas in Thailand and Indonesia, they are primarily herbivorous. Semi-aggressive with territorial lip-locking displays, these massive fish require very large tanks and consume significant vegetation, thriving with strong filtration and vegetable-based diet.',

  paradiseFish:
    'A colorful, hardy labyrinth fish reaching 4 inches with striking blue and red vertical stripes. Native to East Asian rice paddies, ditches, and slow-moving waters in China, Korea, and Vietnam, they tolerate wide temperature ranges including unheated tanks. Aggressive and territorial especially toward conspecifics, these beautiful but belligerent fish require species-specific setups or carefully selected tankmates and can survive in suboptimal conditions.',

  chocolateGourami:
    'A delicate labyrinth fish reaching 2.5 inches with chocolate-brown body and vertical cream-yellow bands. Native to Southeast Asian peat swamps in Sumatra, Borneo, and Malaysia, they inhabit extremely soft, acidic blackwater conditions. Peaceful, sensitive, and requiring advanced care with pristine water quality, these beautiful fish are mouthbrooders with males incubating eggs and thrive only in species-specific setups mimicking their natural blackwater habitat.',

  sparklingGourami:
    'A tiny, beautiful labyrinth fish reaching only 1.5 inches with iridescent spots and ability to produce croaking sounds. Native to Southeast Asian slow-moving waters in Thailand, Cambodia, and Vietnam, they inhabit shallow, heavily vegetated areas. Peaceful, timid, and ideal for nano tanks, these charming fish thrive in species-specific setups or peaceful communities with dense planting, displaying unique vocalizations during courtship and territorial disputes.',

  snakeskinGourami:
    'A large peaceful gourami reaching 8-10 inches with silvery-tan body covered in distinctive snake-like diagonal crosshatch pattern and black lateral stripe. Native to Mekong basin and surrounding river systems in Southeast Asia (Thailand, Cambodia, Vietnam, Malaysia), they inhabit slow-moving rivers, flooded forests, and wetlands with dense vegetation. Peaceful, hardy labyrinth fish tolerating varied conditions, these impressive gouramis make excellent centerpiece fish for large community tanks and adapt well to most peaceful tankmates, making them popular choices for aquarists seeking large beautiful gouramis with peaceful temperaments and easy care requirements.',

  bandedGourami:
    'A medium-sized peaceful gourami reaching 4-5 inches with golden-brown body adorned with 3-5 vertical dark bands and blue-green iridescence. Native to northern India, Myanmar, and Thailand, they inhabit slow-moving rivers, streams, and wetlands with dense vegetation. Hardy, peaceful labyrinth fish with attractive banding pattern intensifying with age, these adaptable gouramis thrive in well-planted community tanks and tolerate varied water conditions, making them excellent mid-sized gouramis for aquarists seeking peaceful alternatives to more commonly kept species with interesting coloration and manageable size.',

  croakingGourami:
    'A small fascinating gourami reaching 2-3 inches with brown body, irregular spots, and unique ability to produce audible croaking sounds. Native to slow-moving waters, ponds, and rice paddies throughout Southeast Asia, they inhabit shallow heavily vegetated areas with low oxygen. Peaceful, hardy labyrinth fish capable of surviving in low oxygen due to labyrinth organ, these unusual small gouramis are named for their distinctive croaking sounds produced during courtship, making them interesting nano species for aquarists seeking unusual peaceful gouramis with intriguing vocalizations though males can be territorial toward each other.',

  thickLippedGourami:
    'A medium peaceful gourami reaching 3-4 inches with blue-green iridescent body and distinctively prominent enlarged lips giving them unique appearance. Native to Southeast Asia including Thailand and surrounding regions, they inhabit slow-moving waters with dense vegetation. Hardy, peaceful labyrinth fish named for characteristic swollen lips, these attractive gouramis display beautiful iridescent colors under proper lighting and adapt well to community tanks, making them interesting medium-sized alternatives to more common gouramis for aquarists seeking unusual peaceful species with distinctive physical features and manageable size requirements.',

  licoriceGourami:
    'A tiny delicate gourami reaching only 1.5 inches with dark brown-black body and subtle striping resembling licorice candy. Native to peat swamp forests and blackwater streams in Southeast Asia (Malaysia, Indonesia), they inhabit extremely soft, acidic, tannin-stained waters with heavy leaf litter. Extremely sensitive, requiring pristine blackwater conditions with very soft acidic water, these fragile micro-predators need species-only tanks with gentle filtration and mature setups, making them suitable only for expert aquarists seeking ultimate challenge of keeping delicate blackwater specialists in carefully controlled biotope aquariums with exacting parameters.',

  giantGourami:
    'A massive peaceful gourami reaching 20-28 inches with tan-silver body that develops distinctive patterns and humped forehead with age. Native to rivers, lakes, and swamps throughout Southeast Asia, they inhabit various freshwater environments and adapt to wide range of conditions. Intelligent, personable, and surprisingly peaceful despite enormous size, these gentle giants can recognize owners and be hand-fed but require massive aquariums or ponds, making them suitable only for dedicated aquarists with pond-sized setups (200+ gallons minimum) who can commit to their 15+ year lifespan and massive adult proportions.',

  // ============================================
  // CICHLIDS - DWARF/SOUTH AMERICAN
  // ============================================
  angelfish:
    'A tall, graceful cichlid reaching 6 inches in height with distinctive triangular shape and elongated fins. Native to Amazon River basin slow-moving waters with dense vegetation, they inhabit areas with vertical structures like submerged roots. Semi-aggressive and territorial especially when breeding, these majestic centerpiece fish require tall tanks with vertical swimming space and can prey on very small fish.',

  discus:
    'A large, disc-shaped cichlid reaching 8-10 inches with stunning color varieties and intricate patterns. Native to Amazon River basin slow-moving tributaries and flooded forests, they inhabit warm, soft, extremely acidic blackwater conditions. Sensitive, peaceful, and requiring advanced care with pristine water quality and higher temperatures, these majestic centerpiece fish thrive in species-specific setups or carefully selected communities, displaying complex social hierarchies and parental care behaviors.',

  germanBlueRam:
    'A small, stunning dwarf cichlid reaching 2-3 inches with electric blue coloration and black markings. Native to Colombian and Venezuelan river basins, they prefer warm, soft, acidic water with sandy substrates. Peaceful for cichlids but territorial during breeding, these sensitive fish require pristine water quality and higher temperatures than most community species, thriving in well-planted tanks.',

  bolivianRam:
    'A peaceful dwarf cichlid reaching 3 inches with golden-yellow body, red-orange fins, and black lateral spot. Native to Bolivian Amazon basin tributaries, they inhabit sandy-bottomed waters with gentle current. Hardier and more adaptable than German Blue Rams, these personable bottom-dwellers form pairs and thrive in community tanks with sand substrate and moderate temperatures, displaying curious, interactive behavior.',

  kribensis:
    'A colorful dwarf cichlid reaching 4 inches with purple-pink belly and distinctive red-cherry belly in females. Native to West African coastal rivers and estuaries in Nigeria and Cameroon, they tolerate brackish conditions. Peaceful for cichlids and suitable for community tanks when not breeding, these prolific cave-spawners become territorial when spawning and thrive in pairs with caves and slightly hard water.',

  apistogrammaAgassizii:
    'A small, colorful dwarf cichlid reaching 2-3 inches with males displaying vibrant yellows and a distinctive horizontal belly stripe. Native to slow-moving blackwater streams throughout the Amazon basin, they are curious bottom-dwellers with territorial but generally peaceful temperaments. Thrive in planted community tanks with sandy substrate and caves, making them an excellent "first Apistogramma" for aquarists.',

  cockatooDwarfCichlid:
    "A distinctive dwarf cichlid reaching 3 inches with elongated dorsal fin rays resembling a cockatoo's crest. Native to Amazon and Orinoco river basins in Peru, Colombia, and Brazil, they inhabit soft, acidic waters with leaf litter. Peaceful, shy, and harem-breeding with males maintaining territories with multiple females, these attractive cichlids thrive in well-planted tanks with caves and soft water conditions.",

  electricBlueAcara:
    'A medium-sized peaceful cichlid reaching 6 inches with stunning electric blue coloration and subtle vertical bars. Native to Colombian and Venezuelan river systems, they inhabit slow-moving waters with sandy substrates and scattered vegetation. Hardy, peaceful for cichlids, and beginner-friendly, these personable fish form breeding pairs and thrive in community tanks with other medium-sized peaceful species, displaying minimal aggression outside breeding periods.',

  blueAcara:
    'A peaceful medium cichlid reaching 6 inches with powder-blue body, orange highlights, and less intense coloration than electric blue acara. Native to Central and South American rivers including Panama, Colombia, and Venezuela, they inhabit slow-moving waters. Peaceful for cichlids and suitable for community tanks with robust fish, these hardy cichlids form pairs and display less aggression than most Central American species.',

  firemouthCichlid:
    'A medium-sized Central American cichlid reaching 6 inches with gray-blue body and brilliant orange-red throat and belly. Native to Mexican and Guatemalan rivers and cenotes, they inhabit rocky substrates with caves and territories. Semi-aggressive and territorial especially during breeding, these hardy cichlids display impressive threat displays with flared gills and can coexist with similar-sized robust species in adequately sized tanks.',

  convictCichlid:
    'A small, hardy cichlid reaching 4-5 inches with bold black and white vertical stripes. Native to Central American rivers in Guatemala, they inhabit rocky substrates with caves. Aggressive, territorial, and extremely prolific breeders with intense parental care, these tough cichlids thrive in species-specific or Central American cichlid tanks and will breed in almost any conditions, defending offspring vigorously.',

  keyholeCichlid:
    'A peaceful cichlid reaching 4-5 inches with distinctive keyhole-shaped black marking on sides. Native to South American rivers in Guyana and northern tributaries, they inhabit soft, acidic waters with wood and leaf litter. Peaceful, shy, and suitable for community tanks unlike most cichlids, these timid fish thrive in well-planted tanks with driftwood and peaceful tankmates, forming pairs without excessive aggression.',

  jewelCichlid:
    'A beautiful but aggressive cichlid reaching 6 inches with brilliant red coloration intensifying during breeding. Native to West African rivers and streams, they inhabit various freshwater habitats. Highly aggressive, territorial, and unsuitable for community tanks even when young, these stunning cichlids require species-specific setups and display extremely protective parental behavior, attacking any perceived threats to eggs or fry.',

  jackDempsey:
    'A large, aggressive cichlid reaching 10 inches with iridescent blue spots on dark body named after famous boxer. Native to Central American rivers and lakes in Mexico, Guatemala, and Honduras, they inhabit various habitats. Aggressive, territorial, and unsuitable for community tanks, these powerful cichlids require large tanks and can be kept with similarly aggressive Central American species, displaying intense breeding behavior.',

  severum:
    'A large, peaceful cichlid reaching 8-10 inches with various color forms including green, gold, and red varieties. Native to Amazon and Orinoco River basins in slow-moving tributaries, they inhabit heavily vegetated areas. Peaceful for large cichlids and suitable for community tanks with robust species, these personable vegetarians will uproot plants while grazing and require spacious tanks with strong filtration, forming pairs when mature.',

  silverDollar:
    'A large, disc-shaped schooling fish reaching 6 inches with silver body resembling a coin. Native to Amazon River basin tributaries, they inhabit slow-moving waters with heavy vegetation that they consume. Peaceful, timid, and entirely herbivorous, these active schoolers thrive in groups of 5+ in very large tanks and will devour all live plants, requiring vegetable-based diet and driftwood for grazing, displaying nervous behavior when startled.',

  africanButterflyCichlid:
    'A peaceful dwarf cichlid reaching 3 inches with yellow body, black lateral stripe, and lyretail fin extensions in males. Native to West African rivers in Sierra Leone, Liberia, and Guinea, they inhabit slow-moving forest streams. Peaceful, shy, and suitable for community tanks unlike most cichlids, these delicate fish thrive in pairs or small groups in well-planted tanks with soft, acidic water and dense cover.',

  texasCichlid:
    'A large robust cichlid reaching 12 inches with pearl-like spots covering blue-gray body and red eyes. Native to rivers of Texas and northern Mexico in warm flowing waters. Hardy, aggressive, territorial fish with personality and intelligence, these substrate spawners form pairs and require very large tanks with strong filtration, compatible only with similarly-sized robust fish that can handle their aggression, becoming increasingly territorial during breeding.',

  greenTerror:
    'An aptly-named large cichlid reaching 12 inches with iridescent green-blue coloration and orange trim on fins. Native to rivers of Ecuador and Peru in warm tropical waters. Beautiful, highly aggressive, territorial fish with intense personality, these substrate spawners form pairs and demand very large tanks with heavy filtration, best kept as pairs or with similarly aggressive large cichlids that can defend themselves.',

  salviniCichlid:
    'A medium aggressive cichlid reaching 6 inches with yellow body and black markings. Native to Central America from Mexico to Guatemala. Hardy, aggressive, colorful fish with bold personality, these substrate spawners form pairs and require spacious tanks with strong filtration, compatible with similarly-sized robust Central American species in adequately-sized setups with territories.',

  nicaraguanCichlid:
    'A peaceful large cichlid reaching 10 inches with golden-yellow coloration and black markings. Native to lakes of Nicaragua and Costa Rica. Beautiful, relatively peaceful for size, personable fish, these substrate spawners form devoted pairs and thrive in large community tanks with other peaceful large cichlids, displaying excellent parental care and manageable temperament despite imposing size.',

  tBarCichlid:
    'A distinctive cichlid reaching 12 inches with vertical T-shaped or double-bar pattern. Native to rivers of Central America. Large, moderately aggressive, patterned fish, these substrate spawners form pairs and require very spacious tanks with other similarly-sized robust Central American cichlids, displaying interesting territorial behavior and strong parental instincts.',

  bloodParrotCichlid:
    'A unique hybrid cichlid reaching 8 inches with round body shape and "parrot" beak mouth. Product of selective breeding, not found in nature. Endearing, peaceful, personable fish despite controversial hybrid origins, these substrate spawners (often sterile) thrive in community settings with peaceful similarly-sized fish, requiring appropriately-sized food due to deformed mouth and making excellent community cichlids with gentle disposition.',

  flowerhornCichlid:
    'A large hybrid cichlid reaching 12+ inches with massive nuchal hump and vibrant colors. Product of selective breeding popular in Asia. Colorful, aggressive, interactive fish with dog-like personality, these substrate spawners require massive solo tanks as they are too aggressive for most tankmates, displaying remarkable interaction with owners and requiring extensive space and filtration for their size and waste production.',

  festivum:
    'A peaceful disc-shaped cichlid reaching 6 inches with subdued olive-gold coloration and black markings. Native to Amazon basin in slow-moving waters with dense vegetation. Gentle, shy, underrated fish perfect for planted community tanks, these substrate spawners form pairs and thrive with other peaceful species in planted aquariums, making them one of the most peaceful South American cichlids suitable for larger community setups.',

  chocolateCichlid:
    'A large robust cichlid reaching 12 inches with dark chocolate-brown coloration and subtle patterns. Native to rivers and lakes of South America. Hardy, moderately aggressive, imposing fish, these substrate spawners form pairs and require very large tanks with strong filtration, compatible with similarly-sized robust species and displaying characteristic eartheater-type behavior of sifting substrate.',

  // ============================================
  // CICHLIDS - AFRICAN
  // ============================================
  peacockCichlid:
    'A colorful African cichlid reaching 4-6 inches with males displaying brilliant blue, yellow, or red coloration depending on species. Native to Lake Malawi rocky and sandy habitats, they use specialized sensory pits to detect prey. Peaceful for African cichlids with low aggression toward other species, these beautiful fish thrive in hard, alkaline water with rocky territories and sandy substrates for their unique hunting behavior.',

  yellowLabCichlid:
    'A bright yellow African cichlid reaching 4-5 inches with males developing striking egg spots on anal fin. Native to Lake Malawi rocky habitats in Africa, they are relatively peaceful mbuna cichlids. Less aggressive than most mbuna and suitable for all-male or mixed Lake Malawi community tanks, these striking fish thrive in hard, alkaline water with rocky territories and display vivid coloration against dark substrates.',

  oscar:
    'A large, intelligent cichlid reaching 12-14 inches with various color forms including tiger, albino, and red patterns. Native to Amazon River basin slow-moving tributaries and floodplains, they are opportunistic predators. Aggressive, messy, and highly personable with dog-like recognition of owners, these powerful fish require very large tanks and will eat any fish small enough to swallow, displaying complex behaviors and rearranging tank decorations.',

  redZebra:
    'A vibrant mbuna cichlid reaching 5 inches with brilliant orange-red coloration despite its misleading name. Endemic to rocky shores of Lake Malawi in East Africa, they are active rock-dwellers that constantly rearrange their territory by moving substrate and decorations with their mouths. Hardy, aggressive, and territorial with fascinating behavior including feeding on algae in nature, these mouth-brooding fish excel at interior decorating and require species-only or carefully planned African cichlid communities with one male to multiple females in heavily overcrowded mbuna setups with extensive rockwork.',

  bumblebeeCichlid:
    'A distinctive mbuna reaching 6 inches with yellow and black vertical bumblebee stripes capable of rapid color changes. Endemic to deep rocky caves of Lake Malawi where they live symbiotically with large bagrid catfish, they are unique cleaners that pick parasites from catfish then steal their eggs by changing to dark camouflage. Hardy, highly aggressive, and fascinating with specialized behavior, these territorial mouth-brooders require very spacious tanks with one male to several females in controlled-overcrowding mbuna setups, best for experienced keepers due to extreme aggression toward conspecifics.',

  frontosaCichlid:
    'A majestic predatory cichlid reaching 14 inches with bold blue-white vertical banding and distinctive cranial hump in males. Native to deep rocky waters of Lake Tanganyika at depths of 30-120 meters, they gather in massive aggregations of up to 1000 individuals hunting smaller fish at dusk. Peaceful, slow-growing, long-lived fish with 25+ year lifespan requiring patience and massive tanks, these impressive mouthbrooders school loosely and thrive in groups of 5+ with excellent filtration, forming natural hierarchies in spacious aquariums that accommodate their eventual enormous size.',

  tropheus:
    'A specialized algae-grazing mbuna reaching 5 inches with stunning regional color variants including yellows, reds, blues, and blacks. Endemic to rocky shores throughout Lake Tanganyika occupying algae-rich territories, they are highly aggressive herbivores with delicate digestive systems requiring specific vegetable-based diets. Challenging, beautiful, and demanding fish best for experienced keepers, these maternal mouthbrooders absolutely require very large overcrowded species-only setups with 15-30+ individuals to distribute aggression, pristine water quality, and primarily spirulina-based foods to prevent fatal digestive issues.',

  julieCichlid:
    'A peaceful cave-dwelling cichlid reaching 3-5 inches depending on species, with striking patterns including horizontal stripes, checkerboards, and golden hues. Native to rocky shores of Lake Tanganyika where they inhabit crevices and caves, they form strong monogamous pair bonds for life. Hardy, territorial but relatively peaceful, and fascinating with devoted parental care, these substrate spawners thrive in pairs or small groups with extensive rockwork creating territories, compatible with other peaceful Tanganyikan cichlids in spacious tanks with alkaline water.',

  lemonCichlid:
    'A vibrant yellow cave-dwelling cichlid reaching 4 inches with bright lemon-yellow coloration. Endemic to rocky areas of Lake Tanganyika, they occupy and defend cave territories aggressively. Colorful, hardy, territorial fish that form monogamous pairs, these substrate spawners require rocky aquascapes with multiple caves and thrive with other Tanganyikan cichlids of similar size and temperament in well-filtered alkaline water setups.',

  princessCichlid:
    'A beautiful shell-dwelling cichlid reaching 3 inches native to sandy areas of Lake Tanganyika. They live in and around empty snail shells, defending small territories. Small, peaceful, fascinating fish perfect for smaller Tanganyikan setups, these substrate spawners require sandy substrate with numerous empty shells and thrive in species colonies or with other peaceful shell-dwellers.',

  brevisCichlid:
    'A tiny shell-dwelling cichlid reaching only 2 inches, among the smallest cichlids in Lake Tanganyika. They inhabit sandy bottoms with empty snail shells. Miniature, peaceful, charming fish ideal for nano Tanganyikan setups, these shell spawners form colonies and require sandy substrate with abundant shells, thriving in species tanks or with other small peaceful shell-dwellers.',

  eyeBiterCichlid:
    'An unusual predatory cichlid reaching 6 inches that specializes in feeding on the eyes and scales of other fish in Lake Tanganyika. Native to open waters where they hunt in schools. Specialized, aggressive, fascinating fish requiring experienced keepers, these scale-eaters need very large tanks with robust tankmates and should only be kept by advanced aquarists who understand their unique dietary needs.',

  redEmpress:
    'A stunning haplochromine cichlid reaching 5-6 inches with males displaying vibrant red-orange coloration. Native to rocky and sandy areas of Lake Malawi. Colorful, active, less aggressive than mbuna, these peaceful cichlids thrive in groups with multiple females per male in spacious tanks with both rocks and open swimming areas alongside other peaceful Malawi haps and peacocks.',

  venustus:
    'A large predatory cichlid reaching 10 inches with beautiful blue-yellow patterning that changes dramatically from juvenile to adult. Native to Lake Malawi where they ambush prey. Large, predatory, striking fish that lie motionless playing dead to ambush prey, these mouthbrooders need very large tanks with careful tankmate selection as they will eat smaller fish, thriving with similarly-sized robust cichlids.',

  blueDolphin:
    "A peaceful large cichlid reaching 10 inches with powder-blue coloration and distinctive nuchal hump resembling a dolphin's forehead. Native to deeper sandy areas of Lake Malawi. Beautiful, gentle, personable fish despite large size, these slow-growing mouthbrooders thrive in groups in very spacious tanks with other peaceful Malawi haps, forming social hierarchies without excessive aggression.",

  sunshinePeacock:
    "A dazzling peacock cichlid reaching 5 inches with brilliant yellow-orange coloration. Endemic to Lake Malawi's rocky areas. Stunning, active, moderately peaceful fish perfect for mixed Malawi peacock communities, these colorful mouthbrooders display best in groups with proper male-to-female ratios in well-decorated tanks with rocks and open swimming areas.",

  obPeacock:
    'A unique peacock cichlid reaching 5 inches with orange-blotched (OB) marbled pattern over blue background. Product of selective breeding from Lake Malawi peacocks. Colorful, active, popular designer cichlid, these mouthbrooders thrive in peacock communities with proper ratios, displaying unique coloration patterns that vary individually in well-maintained alkaline setups.',

  demasoni:
    "A stunning but extremely aggressive mbuna reaching only 3 inches with electric blue and black horizontal stripes. Endemic to a tiny area of Lake Malawi's Pombo Rocks. Beautiful, tiny, exceptionally aggressive fish requiring specialized care, these territorial mouthbrooders must be kept in very large groups (12+) in spacious heavily-rocked tanks to distribute extreme aggression, best for experienced African cichlid keepers only.",

  // ============================================
  // CORYDORAS
  // ============================================
  bronzeCory:
    'The classic wild-type corydoras reaching 2.5 inches with bronze-olive body and metallic sheen. Native to South American rivers throughout much of the continent, they are among the most common corydoras. Peaceful, extremely hardy, and beginner-friendly, these prolific breeding catfish thrive in groups of 6+ with sandy substrate and are the foundation species from which albino and other color variants derive.',

  pandaCory:
    'A small, distinctive catfish reaching 2 inches with white body and bold black markings on eyes, dorsal fin, and caudal peduncle resembling a panda. Native to Peruvian Amazon tributaries with cool, oxygen-rich waters, they inhabit sandy substrates. Peaceful, social, and slightly more sensitive than other corydoras, these active bottom-dwellers thrive in groups of 6+ with fine sand substrate and cooler temperatures than typical tropical species.',

  pepperedCory:
    'A classic, hardy catfish reaching 2.5 inches with pale body covered in dark pepper-like spots and mottled pattern. Native to South American rivers in Uruguay and Brazil, they inhabit sandy and muddy substrates. Peaceful, extremely hardy, and beginner-friendly, these social bottom-dwellers thrive in groups of 6+ with sandy substrate and are among the most popular and adaptable corydoras species, tolerating cooler temperatures than most tropical fish.',

  sterbaiCory:
    'A popular catfish reaching 2.5 inches with distinctive pattern of white spots on dark brown to black body and bright orange pectoral fins. Native to Brazilian river systems including the Guapore River, they inhabit soft, slightly acidic waters. Peaceful, hardy, and attractive, these social bottom-dwellers thrive in groups of 6+ with sandy substrate and prefer slightly warmer temperatures than most corydoras species, displaying active foraging behavior.',

  juliiCory:
    'A small, attractive catfish reaching 2 inches with intricate spotted pattern and black stripe through eye. Native to Brazilian coastal rivers in lower Amazon tributaries, they inhabit sandy substrates. Peaceful, active, and frequently confused with trilineatus cory, these true julii corys thrive in groups of 6+ with sandy substrate and are less commonly available than similar-looking species.',

  albinoCory:
    'A color variant of bronze corydoras reaching 2.5 inches with pale pink-white body, red eyes, and reduced pigmentation. Native to South American rivers (wild-type), albino variants are captive-bred mutations. Peaceful, hardy, and identical in care to bronze corys, these social bottom-dwellers thrive in groups of 6+ with sandy substrate and are popular for their striking pale appearance contrasting with darker tankmates.',

  pygmyCory:
    'A tiny catfish reaching only 1 inch with elongated body, horizontal black stripe, and more minnow-like swimming behavior than typical corydoras. Native to Brazilian Amazon tributaries, they inhabit shallow, heavily vegetated waters. Peaceful, active, and unique among corydoras for swimming throughout the water column rather than only on the bottom, these nano schooling fish thrive in groups of 10+ in planted community tanks.',

  saltAndPepperCory:
    'A tiny catfish reaching only 1.25 inches with salt-and-pepper speckling pattern across pale body. Native to Venezuelan and Colombian river systems, they inhabit shallow, densely vegetated waters. Peaceful, delicate, and ideal for nano tanks, these miniature bottom-dwellers thrive in groups of 6+ with fine sand substrate and are among the smallest corydoras species, displaying active foraging behavior throughout the day.',

  banditCory:
    'A peaceful, social catfish reaching 2-2.5 inches, named for the distinctive black "bandit mask" stripe across its eyes and horizontal streak along its back. Native to the Meta River basin in Colombia, they inhabit slow-moving, clear waters with sandy substrates. Hardy and beginner-friendly, these energetic bottom-dwellers thrive in groups of 6+ and are ideal for planted community aquariums with soft, sandy substrate to protect their delicate barbels.',

  duplicareusCorydoras:
    'A small, peaceful catfish reaching 2.5 inches with distinctive orange head patch and broader dark horizontal stripe compared to similar C. adolfoi. Native to upper Rio Negro tributaries in Brazil, they inhabit pristine blackwater with rapid flow and dark tannin-stained water. Hardy and easier to breed than C. adolfoi, these attractive schooling catfish thrive in groups of 6+ in soft acidic water with fine sand substrate, making them excellent additions to planted community tanks though less commonly available than their close relative.',

  schwartziCorydoras:
    "A pearl-colored medium catfish reaching 2.5-3 inches with intricate pattern of spots, dashes, and twin bars creating an attractive reticulated appearance. Native to Rio Purus tributaries in Brazil's Amazon basin, they inhabit slow-moving waters with sandy substrates and dense vegetation. Hardy and peaceful but somewhat prone to barbel infections, these active schoolers require pristine water quality and groups of 5+ with fine sand substrate, making them suitable for experienced aquarists who can maintain their exacting water quality standards.",

  melanistiusCorydoras:
    'A striking small catfish reaching 2-2.5 inches with pearly-white body decorated with dark blue-black spots and distinctive black "sail" dorsal fin. Native to coastal rivers of Guyana, French Guiana, and Suriname in South America, they inhabit clear to slightly tannin-stained slow-moving waters with sandy substrates. Peaceful, nocturnal, and beautiful but more sensitive to water quality than many corydoras, these active schoolers require groups of 5-6+ and pristine conditions with mature filtration, making them better suited for experienced aquarists despite their hardy appearance.',

  agassiziCorydoras:
    'A spotted medium catfish reaching 2-2.5 inches with complex pattern of dark spots covering cream-tan body creating an attractive mottled appearance. Native to Amazon River basin in Brazil and Peru, they inhabit slow-moving tributaries with soft substrates and tannin-rich water. Hardy, peaceful, and adaptable with easier care requirements than many specialty cories, these active bottom-dwellers thrive in groups of 6+ and tolerate a wider range of water parameters, making them excellent community fish for aquarists of various experience levels.',

  threeStripeCorydoras:
    'A beautiful small catfish reaching 2.5 inches with pale beige-silver body adorned with intricate reticulated pattern and three distinctive dark horizontal stripes. Native to central and Peruvian Amazon River basin including Colombia, Brazil, and coastal Suriname rivers, they inhabit slow-moving waters with sandy substrates and dense vegetation. Hardy, peaceful, and often misidentified as Corydoras julii, these active schoolers are among the easiest Corydoras to breed and thrive in groups of 5+ with fine sand substrate, making them excellent community fish for beginners and experienced aquarists alike.',

  venezuelaCorydoras:
    'A distinctive medium catfish reaching 2.5 inches with brownish-bronze body, large oval green-black shoulder patch, and bright copper-orange head patch that intensifies with age. Native exclusively to Rio Cabriales and closed drainage systems of Rio Tuy and Lake Valencia in northern Venezuela, they inhabit crystal-clear cooler waters with moderate flow. Hardy, adaptable, and active despite their restricted distribution, these energetic schoolers prefer cooler temperatures (66-77F) and thrive in groups of 6+ with varied diet, making them attractive community fish though largely captive-bred due to limited wild collection.',

  // ============================================
  // LOACHES
  // ============================================
  kuhliLoach:
    'An elongated, eel-like bottom-dweller reaching 3-4 inches with distinctive yellow-orange and dark brown vertical bands. Native to Southeast Asian slow-moving streams with soft substrates and leaf litter, they are nocturnal burrowers. Peaceful, shy, and social, these unique scavengers thrive in groups of 3-6+ with fine sand substrate and plenty of hiding spots, often remaining hidden during daylight hours.',

  clownLoach:
    'A large, social bottom-dweller reaching 12+ inches with bright orange body and three bold black vertical bands. Native to Indonesian rivers and streams, they inhabit slow-moving waters with sandy substrates and submerged wood. Peaceful, playful, and highly social, these long-lived fish require very large tanks and must be kept in groups of 5+ as they develop complex social hierarchies and display interactive personalities.',

  yoyoLoach:
    'A medium-sized, active loach reaching 5-6 inches with intricate dark "Y-O-Y-O" pattern markings on silver-gray body. Native to Indian and Pakistani rivers, they inhabit rocky substrates with moderate current. Peaceful, semi-nocturnal, and social, these energetic bottom-dwellers thrive in groups of 3+ and are excellent snail control, displaying playful behavior including swimming upside-down and "clicking" sounds.',

  zebraLoach:
    'A small, attractive loach reaching 4 inches with bold vertical black and white zebra-like banding. Native to Indian rivers and streams with rocky substrates and moderate current, they are social bottom-dwellers. Peaceful, active during day unlike many loaches, and less shy than similar species, these playful schoolers thrive in groups of 5+ with sandy substrate and hiding spots, displaying constant activity and interactive behavior.',

  dwarfChainLoach:
    'A tiny loach reaching only 2 inches with chain-like pattern of connected dark markings along body. Native to Indian streams with rocky substrates, they inhabit well-oxygenated waters. Peaceful, social, and ideal for nano and community tanks, these active bottom-dwellers thrive in groups of 6+ with sandy substrate and display constant playful behavior unlike shy loach relatives.',

  dojoLoach:
    'A large, eel-like loach reaching 12 inches with barbels around mouth and ability to predict weather changes. Native to East Asian rivers and rice paddies in China, Japan, and Korea, they tolerate wide temperature ranges. Peaceful, hardy, and tolerating cold water down to 40F, these social bottom-dwellers thrive in groups and are famous for increased activity before storms, sometimes called Weather Loaches.',

  hillstreamLoach:
    'A flat, uniquely-shaped loach reaching 3 inches with sucker-like pectoral and pelvic fins for clinging to rocks. Native to fast-flowing Asian mountain streams with high oxygen, they inhabit rapids and torrents. Peaceful, specialized, and requiring cooler water with strong current and high oxygen, these algae-grazing loaches thrive on smooth river rocks in species-specific setups mimicking rapids.',

  skunkBotia:
    'A small, active loach reaching 4 inches with pale pinkish-cream body and bold black stripe running from nose tip along spine to caudal peduncle resembling a skunk. Native to Mekong, Chao Phraya, and Mae Klong river basins in Southeast Asia (Thailand, Laos, Cambodia, Vietnam), they inhabit both still and fast-moving waters of medium to large rivers. Semi-aggressive snail-eaters requiring groups of 5+ to spread territorial behavior, these feisty loaches need spacious tanks with robust tankmates and excellent oxygenation, making them unsuitable for general community aquariums despite their small size and attractive appearance.',

  bengalLoach:
    'A striking medium loach reaching 6 inches with goldish-olive body adorned with 8-10 thick vertical dark bands extending from behind eyes to tail. Native to Brahmaputra and Ganges river drainages in northern India, Bangladesh, and Bhutan, they inhabit clear mountain streams and rivers with moderate flow and sandy-silty substrates. Semi-aggressive, active, and excellent snail-eaters requiring groups of 5+, these robust loaches need spacious tanks with strong filtration and high oxygenation, making them suitable for experienced aquarists who can maintain their stringent water quality requirements with scaleless sensitive skin.',

  polkaDotLoach:
    'A beautiful medium loach reaching 4-6 inches with yellowish-orange body covered in distinctive dark brown-black polka dots creating an attractive spotted pattern that changes dramatically with age. Native to Ataran River basin headwaters in Myanmar, they inhabit clear fast-flowing streams with stony substrates. Social, active, and popular but requiring pristine water conditions, these lively loaches thrive in groups of 5+ in spacious mature tanks with sandy substrate and numerous hiding places, making them suitable for experienced aquarists who can maintain their exacting requirements despite their hardy appearance once established.',

  horsefaceLoach:
    "An elongated bottom-dwelling loach reaching 8-10 inches with extended snout resembling a horse's face and tan-brown body with darker mottling. Native to Southeast Asian river systems including Thailand and neighboring countries, they inhabit sandy-bottomed streams and rivers where they burrow extensively. Peaceful, nocturnal burrowers requiring deep soft sand substrate for their unique digging behavior, these specialized loaches are more active at night and prefer groups of 3-5 with ample swimming space, making them interesting additions for experienced aquarists with suitable large sand-bottomed setups.",

  orangeFinnedLoach:
    'A large, boisterous loach reaching 8-10 inches with blue-gray body and distinctive bright orange-red fins. Native to rivers of Thailand and nearby Southeast Asian countries, they inhabit moderate to fast-flowing waters with rocky substrates. Semi-aggressive, territorial, and very active with excellent snail-eating abilities, these robust loaches require very large tanks with groups of 5+ and sturdy tankmates, making them suitable only for experienced aquarists with spacious setups who can manage their aggressive tendencies and provide the swimming space they demand for their highly active nature.',

  // ============================================
  // PLECOS & ALGAE EATERS
  // ============================================
  bristlenosePleco:
    'A compact algae-eating catfish reaching 4-6 inches, distinguished by distinctive bristle-like appendages on the head (more pronounced in males). Native to South American rivers and Panama, they inhabit both swift-flowing and slow-moving waters with rocky substrates and driftwood. Hardy, peaceful, and nocturnal, these efficient algae consumers are ideal for community tanks, staying significantly smaller than common plecos while actively grazing on tank surfaces and requiring supplemental vegetable-based foods.',

  commonPleco:
    'A large, armored catfish reaching 12-24 inches with mottled brown pattern and powerful sucker mouth. Native to South American rivers and streams, they are prolific algae eaters when young. Peaceful but massive and producing enormous waste, these popular plecos quickly outgrow most home aquariums and require very large tanks as adults, often rehomed or released creating invasive populations in warm regions.',

  rubberLipPleco:
    'A medium-sized algae-eating pleco reaching 7 inches with mottled brown pattern and distinctive rubber-lipped sucker mouth. Native to Venezuelan river systems, they graze on algae, driftwood, and aufwuchs. Peaceful, nocturnal, and hardy, these efficient algae eaters thrive in well-oxygenated tanks with driftwood and caves, requiring supplemental vegetables and blanched foods alongside natural grazing.',

  clownPleco:
    'A small, colorful pleco reaching 3.5 inches with bold orange and black banding pattern. Native to Venezuelan river systems including Apure and Caroni, they inhabit driftwood-rich environments. Peaceful, wood-eating, and ideal for smaller tanks unlike most plecos, these attractive algae eaters require abundant driftwood as primary food source and thrive in well-oxygenated tanks with moderate current.',

  twigCatfish:
    'An extremely elongated catfish reaching 6 inches with stick-like appearance perfect for camouflage among driftwood. Native to South American rivers and streams, they are specialized algae grazers clinging to surfaces. Peaceful, delicate, and requiring pristine water quality with high oxygen, these unique fish thrive in well-established tanks with abundant driftwood and algae growth, supplementing diet with algae wafers and vegetables.',

  chineseAlgaeEater:
    'An elongated bottom-dweller reaching 10-11 inches with sucker mouth and golden-brown body with dark stripe when young. Native to Southeast Asian rivers and streams, they inhabit fast-flowing waters. Peaceful when young but increasingly territorial and aggressive with age, these algae eaters lose interest in algae as adults and can attack slow-moving fish, making them problematic in community tanks long-term.',

  siameseAlgaeEater:
    'An elongated, streamlined fish reaching 6 inches with horizontal black stripe running from nose to tail tip. Native to Southeast Asian rivers and streams in Thailand and Malaysia, they inhabit fast-flowing, well-oxygenated waters. Peaceful when young but potentially territorial with age, these active algae grazers effectively control black beard and hair algae but require supplemental feeding as they mature.',

  royalPleco:
    'A large, impressive pleco reaching 17+ inches with distinctive patterning of gray-brown body overlaid with yellow-tan lines forming intricate maze-like pattern. Native to Orinoco and Amazon river basins in Colombia, Venezuela, and Brazil, they inhabit fast-flowing rivers with submerged wood and rocks. Peaceful wood-eaters requiring driftwood as essential dietary component, these magnificent catfish need very large tanks with excellent filtration and high flow, making them suitable only for experienced aquarists with massive aquariums who can provide their specific wood-eating dietary needs and ample swimming space.',

  goldNuggetPleco:
    'A stunning medium-sized pleco reaching 6-9 inches with dark brown-black body covered in bright yellow-gold spots creating a spectacular appearance. Native to Xingu River and nearby tributaries in Brazil, they inhabit fast-flowing clear waters with rocky substrates and submerged wood. Territorial, shy, and expensive specialty pleco requiring excellent water quality with high oxygenation, these beautiful catfish need caves, driftwood, and pristine conditions in groups of one male to multiple females, making them prized but challenging fish for experienced aquarists willing to meet their demanding requirements.',

  // ============================================
  // OTHER CATFISH
  // ============================================
  otocinclus:
    'A tiny algae-eating catfish reaching only 1.5-2 inches with slender body and sucker mouth. Native to South American streams and rivers, they graze on soft algae, diatoms, and biofilm from surfaces. Peaceful, social, and sensitive to water quality, these delicate schooling fish thrive in groups of 6+ in established, planted tanks and require supplemental algae wafers when natural algae is insufficient.',

  pictusCatfish:
    'A sleek, active catfish reaching 5 inches with silver body covered in black spots and extremely long white barbels. Native to South American rivers including the Amazon and Orinoco basins, they inhabit open waters with moderate current. Peaceful but predatory toward very small fish, these fast-swimming nocturnal hunters thrive in groups and require spacious tanks with open swimming areas and hiding spots.',

  glassCatfish:
    'A transparent, ghostly catfish reaching 4-5 inches where internal organs and skeleton are clearly visible through translucent body. Native to Southeast Asian rivers in Thailand and Malaysia, they inhabit slow to moderate current areas. Peaceful, timid, and extremely sensitive to water quality, these unique schooling catfish must be kept in groups of 5+ and require pristine conditions, displaying stress through loss of transparency.',

  upsideDownCatfish:
    'A unique small catfish reaching 4 inches that habitually swims inverted with belly facing upward. Native to Central African rivers and streams including the Congo basin, they graze on algae and biofilm from underside of leaves and surfaces. Peaceful, nocturnal, and social, these quirky fish thrive in groups of 3+ with overhanging plants or decorations and display their unusual swimming behavior most prominently when feeding.',

  stripedRaphaelCatfish:
    'A robust, nocturnal catfish reaching 8 inches with distinctive white stripes on dark body and strong defensive pectoral spines. Native to Amazon and Orinoco River basins, they inhabit muddy substrates and submerged wood. Peaceful with similarly-sized fish and extremely hardy, these long-lived armored catfish thrive with caves and hiding spots, remaining hidden during day and emerging at night to scavenge, producing audible croaking sounds when disturbed.',

  dwarfPetricola:
    'A small, active catfish reaching 4 inches with white body covered in black spots and three dorsal fin stripes. Native to Lake Tanganyika rocky habitats in Africa, they inhabit crevices and caves. Peaceful, social, and requiring hard, alkaline water, these attractive synodontis catfish thrive in groups in African cichlid tanks and are much smaller than most synodontis species.',

  whiptailCatfish:
    'An elongated peaceful catfish reaching 5-6 inches with extremely slim body, extended whip-like filamentous tail extension, and armored plating. Native to rivers and streams throughout much of South America, they inhabit areas with wood, leaf litter, and moderate flow. Peaceful algae-eaters and aufwuchs grazers requiring mature tanks with driftwood and biofilm, these unique bottom-dwellers thrive in groups with fine sand substrate and good oxygenation, making them excellent peaceful community additions for aquarists who can provide their specific grazing needs and appreciate their unusual elongated appearance.',

  spottedRafaelCatfish:
    'A hardy armored catfish reaching 6-8 inches with dark brown-black body covered in white-cream spots and strong pectoral spines. Native to rivers and flooded forests of Amazon and Orinoco basins in South America, they inhabit areas with wood, leaf litter, and low flow. Peaceful, nocturnal, and capable of vocalizing by grinding pectoral spines, these tough catfish emerge at night to scavenge and can live 15+ years with proper care, making them interesting long-lived additions for aquarists seeking unusual armored catfish though they remain mostly hidden during daylight hours.',

  talkingCatfish:
    'A peaceful armored catfish reaching 4-6 inches with brown mottled body and ability to produce audible sounds by grinding pectoral fin spines. Native to rivers and flooded forests throughout Amazon basin in South America, they inhabit soft substrates with abundant cover. Nocturnal, shy, and named for distinctive croaking vocalizations produced when stressed or during courtship, these hardy catfish are active scavengers at night and can live 10+ years, making them interesting peaceful additions for aquarists seeking unusual sound-producing catfish though they remain mostly hidden during day.',

  banjoCatfish:
    'A cryptic bottom-dwelling catfish reaching 5-6 inches with extremely flattened guitar/banjo-shaped body and mottled brown coloration for camouflage. Native to rivers and slow-moving waters throughout much of South America, they inhabit soft muddy or sandy bottoms where they bury themselves. Peaceful, sedentary, and masters of camouflage that barely move except to feed, these unusual catfish spend most time buried with only eyes visible and require soft fine substrate, making them fascinating specialized additions for aquarists seeking unusual cryptic species though they provide little activity or visual interest.',

  featherfinSqueaker:
    'A peaceful African catfish reaching 6-8 inches with dark body, white spots, and dramatically elongated feather-like dorsal fin. Native to rivers and lakes throughout Central Africa including Congo basin, they inhabit rocky areas and submerged wood. Peaceful, nocturnal, and capable of vocalizing by grinding pectoral spines producing squeaking sounds, these attractive catfish are hardy and adaptable with striking appearance when fully grown, making them interesting African alternatives to South American catfish for aquarists seeking unusual vocalizing species though most active after lights out.',

  // ============================================
  // ODDBALL FISH
  // ============================================
  elephantNoseFish:
    'An unusual fish reaching 9 inches with elongated chin extension used for electroreception to navigate and find food. Native to West and Central African rivers including Congo basin, they inhabit murky waters. Peaceful, intelligent, and extremely sensitive requiring pristine water and low lighting, these nocturnal fish use weak electrical fields to communicate and navigate, thriving only with experienced keepers in species-specific setups.',

  africanButterflyFish:
    'A predatory surface-dwelling species reaching 5 inches with large, wing-like pectoral fins resembling a butterfly. Native to West and Central African slow-moving rivers and lakes, they lurk motionless at the surface hunting prey. Peaceful toward similarly-sized fish but highly predatory toward anything small enough to swallow, these unique ambush predators require species-specific care with tight-fitting lids to prevent escape jumps.',

  ropeFish:
    'An elongated, primitive fish reaching 12-15 inches with rope-like body, primitive lungs, and ability to breathe atmospheric air. Native to West and Central African slow-moving rivers and floodplains, they inhabit shallow, vegetated muddy waters. Peaceful, nocturnal, and escape artists requiring tight-fitting lids, these prehistoric survivors thrive with sandy substrate and hiding spots, consuming small fish and invertebrates while tolerating low oxygen conditions.',

  senegalBichir:
    'A primitive, prehistoric fish reaching 12-14 inches with elongated body, armored ganoid scales, and primitive lungs for breathing air. Native to West African rivers and floodplains including Senegal, Gambia, and Niger systems, they are nocturnal bottom-dwelling predators. Peaceful with similarly-sized fish but will eat anything small enough to swallow, these ancient survivors require secure lids as they can escape, tolerating poor water quality and low oxygen conditions.',

  rainbowShark:
    'A semi-aggressive freshwater shark reaching 6 inches with dark body and bright orange-red fins. Native to Southeast Asian rivers in Thailand, they inhabit fast-flowing, rocky streams. Territorial and aggressive toward similar-shaped fish especially other rainbow sharks, these active algae grazers require caves and territories with only one per tank recommended, displaying bold personalities and constant patrolling behavior.',

  balaShark:
    'A large, active cyprinid reaching 12-14 inches with sleek silver body and black-edged fins creating shark-like appearance. Native to rivers and streams in Southeast Asia (Thailand, Borneo, Sumatra), they inhabit clear to slightly turbid flowing waters. Peaceful, social jumpers requiring very large tanks and groups of 5+ for proper shoaling behavior, these beautiful fast-swimming fish need excellent water quality and tight-fitting lids, making them suitable only for aquarists with very large aquariums (150+ gallons) who understand they are not actual sharks but large peaceful cyprinids requiring massive swimming space.',

  blackShark:
    'A territorial bottom-dwelling cyprinid reaching 6 inches with velvety black body and vibrant orange-red tail and fins creating striking contrast. Native to streams and rivers in Thailand, they inhabit rocky fast-flowing waters with high oxygen. Highly territorial, aggressive toward similar species, requiring large individual territories, these stunning fish make beautiful centerpieces when kept as sole bottom-dweller with fast-swimming upper-level tankmates, making them suitable for experienced aquarists who can provide large tanks (55+ gallons) with only one Black Shark and understand their aggressive nature toward similar fish.',

  iridescentShark:
    'A massive catfish reaching 3-4 feet with silvery-iridescent body that loses shimmer with age and shark-like appearance. Native to Mekong and Chao Phraya river basins in Southeast Asia, they inhabit large rivers. Peaceful, nervous, fast-swimming giants that panic easily and require enormous aquariums or ponds, these migratory catfish are commonly sold as cute juveniles but grow to enormous proportions requiring 300+ gallon aquariums minimum, making them unsuitable for home aquariums and appropriate only for public aquariums or massive pond setups, though frequently missold to unsuspecting beginners.',

  ornateBichir:
    'A prehistoric-looking predator reaching 24+ inches with armored elongated body, distinctive dorsal finlets, and intricate spotted pattern. Native to rivers and floodplains throughout West and Central Africa, they inhabit slow-moving waters with vegetation. Peaceful predators with primitive air-breathing ability requiring tight-fitting lids and very large tanks, these fascinating living fossils are hardy carnivores that accept large meaty foods and can live 15+ years, making them impressive additions for experienced aquarists with very large aquariums (125+ gallons) seeking prehistoric species though they eat any fish small enough to swallow.',

  violetGoby:
    'An eel-like peaceful goby reaching 20+ inches with purple-gray coloration and intimidating large jaws despite gentle nature. Native to brackish coastal waters of southeastern United States, Central America, and northern South America, they inhabit muddy estuaries and mangrove areas. Peaceful filter-feeding burrowers requiring brackish water (though can adapt to freshwater), deep sand substrate for burrowing, and understanding of their specialized diet, these unusual fish filter-feed rather than hunt despite appearance, making them fascinating additions for experienced aquarists with brackish setups who understand their unique requirements and gentle temperament.',

  indianGlassfish:
    'A small, transparent fish reaching 3 inches with clear body showing internal organs and skeleton, though often artificially colored. Native to brackish and fresh waters throughout India and surrounding regions, they inhabit calm shallow areas with vegetation. Peaceful, fragile schoolers requiring brackish water for best health, these unique transparent fish are often artificially dyed causing health issues but wild-colored specimens make fascinating additions to proper brackish setups, making them suitable for experienced aquarists seeking unusual transparent species who can provide appropriate brackish conditions and avoid dyed specimens requiring groups of 6+.',

  archerFish:
    'A fascinating surface-dwelling predator reaching 10-12 inches with compressed silver body and ability to "shoot" water at prey above water surface. Native to brackish mangrove swamps and river mouths throughout Southeast Asia and northern Australia, they inhabit calm brackish waters near overhanging vegetation. Semi-aggressive specialized hunters requiring tall tanks with significant air space above water and brackish conditions, these intelligent fish can be trained but need expert care, making them fascinating challenging additions for experienced aquarists with specialized brackish setups who can accommodate their unique hunting behavior and provide appropriate aerial targets.',

  leafFish:
    'A master of camouflage reaching 3-4 inches with leaf-shaped flattened body mimicking dead leaves including stem-like lower jaw extension. Native to rivers and streams throughout Amazon basin in South America, they inhabit slow-moving waters with abundant leaf litter. Sedentary ambush predators requiring live foods and species-only or very careful community selection, these fascinating mimics float motionless resembling dead leaves until prey approaches, making them captivating specialized additions for experienced aquarists seeking unusual predatory species who can provide consistent live food and appreciate their incredible camouflage rather than active swimming behavior.',

  peaPuffer:
    'A tiny, fully freshwater puffer reaching only 1 inch with round body, large eyes, and ability to puff when threatened. Native to southwestern Indian rivers and streams in Kerala, they inhabit heavily vegetated slow-moving waters. Aggressive despite small size with territorial behavior and fin-nipping tendencies, these intelligent hunters require species-specific tanks or very careful tankmate selection, feeding exclusively on live/frozen meaty foods including snails for beak maintenance.',

  // ============================================
  // KILLIFISH
  // ============================================
  americanFlagfish:
    'A hardy colorful killifish reaching 2.5 inches with males displaying red, white, and blue flag-like coloration pattern. Native to Florida peninsula in United States, they inhabit slow-moving heavily vegetated waters including ponds, marshes, and ditches. Semi-aggressive algae-eaters unusual among killifish, these hardy native fish tolerate cooler temperatures (64-72F) and make excellent algae control in unheated tanks, making them interesting North American natives for aquarists seeking colorful hardwater killies who appreciate their patriotic coloration and useful algae-eating behavior though males can be territorial requiring adequate space.',

  goldenWonderKillifish:
    'A peaceful elongated killifish reaching 4 inches with brilliant golden-yellow body and spotted pattern. Native to India and Sri Lanka, they inhabit slow-moving vegetated waters. Hardy, peaceful jumpers requiring tight-fitting lids, these attractive surface-dwellers thrive in community tanks and accept varied foods more readily than most killifish, making them excellent beginner killifish for aquarists seeking beautiful hardy species though their jumping ability requires secure covers and they prefer dimmer lighting with floating plants providing shade and security.',

  gardneriKillifish:
    'A colorful annual killifish reaching 2.5 inches with males displaying brilliant blue body, red spots, and yellow-edged fins. Native to West Africa (Nigeria, Cameroon), they inhabit temporary pools and seasonal streams. Annual species with fascinating accelerated lifecycle completing full life in one year, these vibrant fish produce drought-resistant eggs that can survive dry periods, making them challenging specialty fish for experienced killifish keepers who understand their unique annual lifecycle and can maintain their specific breeding requirements including egg collection and dry storage.',

  clownKillifish:
    'A tiny peaceful killifish reaching only 1.5 inches with cream body and distinctive black-and-white striped tail resembling a rocket. Native to slow-moving streams and swamps in West Africa (Guinea, Sierra Leone, Liberia), they inhabit shallow heavily vegetated blackwater. Peaceful nano surface-dwellers perfect for planted nano tanks, these tiny killies display fascinating behavior and males show extended tail fins, making them excellent nano fish for experienced aquarists with small heavily planted tanks seeking tiny peaceful surface species though they require soft acidic water and small live foods for best coloration.',

  steelBlueKillifish:
    'A stunning semi-annual killifish reaching 2 inches with males displaying metallic steel-blue body and red-orange fins. Native to West Africa, they inhabit seasonal pools and streams. Semi-annual species with 6-12 month lifecycle, these gorgeous fish produce eggs requiring partial dry incubation, making them specialized killifish for experienced keepers who appreciate their brilliant metallic coloration and understand their semi-annual lifecycle including egg collection and incubation though less extreme than true annual species, requiring intermediate killifish-keeping experience and dedication.',

  // ============================================
  // SHRIMP & INVERTEBRATES
  // ============================================
  cherryShrimp:
    'A small, colorful freshwater shrimp reaching 1.5 inches with selective breeding producing red, orange, yellow, and blue varieties. Native to Taiwanese streams (wild-type brown), aquarium strains show vibrant colors. Peaceful, prolific, and extremely hardy, these popular invertebrates thrive in planted tanks and breed readily in freshwater, with females carrying visible eggs and producing constant offspring.',

  amanoShrimp:
    'A large, transparent freshwater shrimp reaching 2 inches with distinctive dotted or dashed stripe pattern along sides. Native to Japanese streams and rivers, they require brackish water for successful larval development. Peaceful, industrious, and exceptional algae eaters consuming hair algae and debris, these active scavengers thrive in established planted tanks but cannot reproduce in freshwater conditions, making population control simple.',

  ghostShrimp:
    'A transparent freshwater shrimp reaching 2 inches with nearly invisible body showing internal organs. Native to North American rivers and streams, they are often sold as feeder shrimp. Peaceful, hardy, and excellent scavengers, these inexpensive shrimp have short lifespans but breed readily in freshwater and serve dual purpose as cleanup crew or live food for larger fish.',

  bambooShrimp:
    'A large freshwater shrimp (2-3 inches) distinguished by its unique filter-feeding behavior using specialized fan-like appendages to capture particles from water flow. Native to fast-flowing streams and rivers of Southeast Asia, they display reddish-brown coloration with a cream stripe along the back. Peaceful and fascinating to observe, they require mature, established tanks with strong water circulation to thrive, making them suitable for aquarists willing to meet their specialized feeding needs.',

  singaporeShrimp:
    'A large filter-feeding shrimp reaching 3 inches with fan-like appendages for capturing food from water current. Native to Southeast Asian streams and rivers, they require moderate to strong water flow for feeding. Peaceful, entirely harmless to fish and plants, these unique shrimp thrive in established tanks with strong current where they perch conspicuously on decorations, using specialized fans to filter microorganisms from flowing water.',

  mysterySnail:
    'A large, colorful freshwater snail reaching 2 inches with shells available in gold, blue, purple, and ivory varieties. Native to South American rivers and wetlands, they are peaceful algae grazers with a breathing siphon for atmospheric air. Hardy, peaceful, and safe with fish and plants (unlike some snails), these active scavengers thrive in established tanks with calcium-rich water for shell health and require supplemental vegetables.',

  neriteSnail:
    'A small, beautifully patterned algae-eating snail reaching 1 inch with varieties including zebra, tiger, and horned patterns. Native to coastal streams and estuaries in Africa, Asia, and Pacific regions, they require brackish water for successful reproduction. Peaceful, hardy, and exceptional algae eaters that cannot reproduce in freshwater, these popular cleanup crew members thrive in established tanks with stable water parameters.',

  ramshornSnail:
    "A common freshwater snail with distinctive spiral shell resembling a ram's horn, reaching 1 inch in various colors including red, pink, and brown. Native to various worldwide locations, they inhabit ponds, lakes, and slow-moving waters with vegetation. Peaceful, prolific, and controversial due to rapid reproduction, these hermaphroditic algae eaters help clean tanks but can become pests if populations explode, thriving in any established aquarium.",

  africanDwarfFrog:
    'A fully aquatic frog reaching 2.5 inches with mottled olive-brown coloration and webbed feet. Native to Central African rivers and pools in Congo basin, they remain underwater their entire lives. Peaceful, social, and entirely aquatic unlike clawed frogs, these bottom-dwelling amphibians thrive in groups with slow-moving water and require meaty sinking foods, surfacing periodically to gulp air with primitive lungs.',
};

// Export for use by glossary-generator.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = fishDescriptions;
}
