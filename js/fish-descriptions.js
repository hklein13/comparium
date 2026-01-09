// ============================================================================
// FISH DESCRIPTIONS - Comprehensive Database (246 Species)
// ============================================================================
// Phase 3C: All species descriptions from curated source data
// Each description is 2-3 sentences summarizing the species' key characteristics,
// native habitat, and care requirements.
// ============================================================================

const fishDescriptions = {
  // ============================================
  // TETRAS & CHARACINS
  // ============================================
  neonTetra:
    'An iconic schooling fish with brilliant iridescent blue horizontal stripe from nose to adipose fin paired with vivid red stripe from mid-body to tail. Native to Amazon basin blackwater and clearwater streams, they inhabit soft, acidic waters with dense vegetation. Hardy, peaceful, and timid by nature, these captive-bred favorites thrive in groups of 6+ in planted community tanks.',

  cardinalTetra:
    'A stunning South American schooling fish featuring an iridescent blue stripe paired with a brilliant cardinal-red band extending from head to tail. Native to upper Orinoco and Rio Negro river basins, they inhabit slow-moving blackwater and clearwater streams. Hardy and peaceful, these vibrant tetras tolerate warmer temperatures than neon tetras, making them popular companions for discus.',

  emberTetra:
    'A tiny, vibrant nano fish with brilliant ember-orange to red coloration resembling glowing coals. Native to Brazil\'s Araguaia River basin backwaters, they prefer slow-moving, heavily vegetated areas with minimal current. Hardy, peaceful, and remarkably outgoing for their size, these active schooling fish thrive in groups of 6-10+ in planted nano aquariums.',

  blackNeonTetra:
    'A striking schooling fish with bold black and white horizontal stripes and distinctive red-rimmed eyes. Native to Paraguay River basin streams in southern Brazil, they inhabit slow-moving, tea-stained waters rich in tannins. Hardy and peaceful, these active tetras display bolder swimming behavior than regular neon tetras.',

  rummyNoseTetra:
    'A distinctive schooling tetra with brilliant red head, silver body, and horizontally striped black-and-white caudal fin. Native to Amazon basin tributaries, they inhabit soft, acidic blackwater streams with tannin-stained water. Peaceful, sensitive to water quality, and exceptional schooling fish that swim in extremely tight formations.',

  congoTetra:
    'A large, stunning schooling tetra with males displaying iridescent rainbow colors and flowing finnage. Native to Central African Congo River basin, they inhabit shaded forest streams with moderate current and tannin-stained water. Peaceful, somewhat timid, and sensitive to water quality, these elegant fish thrive in groups of 6+.',

  serpaeTetra:
    'A small, blood-red tetra with black shoulder spot and red-orange fins. Native to Amazon basin tributaries, they inhabit slow-moving, heavily vegetated waters. Semi-aggressive with notable fin-nipping tendencies, these schooling fish display reduced aggression in larger groups of 10+.',

  buenosAiresTetra:
    'A large, silver tetra with red-tipped fins and subtle horizontal stripe. Native to Argentine and Brazilian river systems, they tolerate cooler temperatures than most tropical species. Semi-aggressive and notorious plant eaters that will devour soft vegetation, these hardy, active schoolers thrive in groups of 6+.',

  blackSkirtTetra:
    'A hardy tetra with tall, flowing black fins and silver-gray body that darkens with age. Native to South American rivers in Paraguay, Guapore, and lower Amazon basins. Peaceful when mature but can fin-nip when young or in small groups, these popular schoolers thrive in groups of 6+.',

  bloodfinTetra:
    'A sleek, active tetra with silver body and distinctive blood-red fins. Native to Argentine river systems, they tolerate cooler temperatures than most tetras. Peaceful, extremely hardy, and tolerant of temperature fluctuations, these fast-swimming schoolers thrive in groups of 6+.',

  glowlightTetra:
    'A peaceful tetra with translucent body and brilliant neon orange-red stripe from nose to tail. Native to Guyanese rivers, they inhabit shaded forest streams. Peaceful, hardy, and displaying glowing stripe under proper lighting, these popular schoolers thrive in groups of 6+.',

  diamondTetra:
    'A stunning tetra with males developing elongated fins and diamond-like sparkle from reflective scales. Native to Lake Valencia basin in Venezuela, they inhabit well-vegetated waters. Peaceful, hardy once established, and displaying spectacular iridescence under proper lighting.',

  flameTetra:
    'A small, fiery tetra with brilliant orange-red body and black-edged fins. Native to Brazilian coastal rivers near Rio de Janeiro, they inhabit slow-moving, well-vegetated waters. Peaceful, hardy, and displaying intense flame coloration, these active schoolers thrive in groups of 6+.',

  pristellaTetra:
    'A small, transparent tetra with silver translucent body revealing internal skeleton and distinctive black-and-yellow marked dorsal and anal fins. Native to South American coastal waters, they tolerate both fresh and brackish conditions. Peaceful, hardy, and extremely adaptable.',

  blackPhantomTetra:
    'A peaceful tetra with males displaying dark charcoal body and prominent black shoulder spot with white-edged fins. Native to Brazilian river tributaries, they inhabit soft, acidic waters. Peaceful, hardy, and displaying sexual dimorphism with colorful males and pinkish females.',

  redPhantomTetra:
    'A peaceful tetra with translucent reddish body, black shoulder spot, and red-edged fins. Native to Colombian and Venezuelan Orinoco River tributaries, they inhabit soft, acidic blackwater streams. Peaceful, somewhat timid, and displaying best colors in planted tanks with dark substrate.',

  emperorTetra:
    'A regal tetra with purple-gray body, yellow stripe, and impressive finnage with males developing flowing extensions. Native to Colombian river systems, they inhabit soft, acidic forest streams. Peaceful, hardy, and displaying royal purple iridescence, these attractive schoolers thrive in groups of 6+.',

  lemonTetra:
    'A peaceful tetra with lemon-yellow coloration and black-edged fins with bright yellow tips. Native to Brazilian Amazon tributaries, they inhabit slow-moving, well-vegetated waters. Peaceful, hardy once established, and displaying best yellow coloration in mature specimens.',

  greenNeonTetra:
    'A tiny tetra with brilliant neon-green stripe and less red than standard neon tetras. Native to upper Amazon basin tributaries in Colombia and Brazil, they inhabit soft, acidic blackwater streams. Peaceful, timid, and smaller than neon tetras.',

  penguinTetra:
    'A distinctive tetra with black and white coloration and characteristic swimming posture at an upward angle. Native to Amazon and Parana River basins, they inhabit slow-moving, well-vegetated waters. Peaceful, active, and hardy, these unique schooling fish display their namesake upward swimming behavior.',

  silvertipTetra:
    'A small, energetic schooling fish with distinctive silvery-white fin tips and coppery-orange males. Native to Brazil\'s Sao Francisco River basin, they are unusually bold and active for nano tetras. Hardy and adaptable, these lively fish display fascinating feeding frenzies and require groups of 8-10+.',

  headAndTailLightTetra:
    'A peaceful schooling tetra with distinctive iridescent copper-rimmed spots near head and tail resembling lights. Native to slow-moving rivers of the Amazon and Orinoco basins, they inhabit heavily vegetated areas with tannin-stained water. Hardy, beginner-friendly, and a classic community tank staple.',

  colombianTetra:
    'A striking medium tetra with iridescent blue-silver body and vibrant red fins creating spectacular contrast. Native to Colombia\'s Rio Acandi basin near the Caribbean coast. Hardy, bold, and active fish that became popular since 2003, these energetic schoolers require secure lids as they are enthusiastic jumpers.',

  rosyTetra:
    'A peaceful schooling tetra with rosy-pink body coloration and black-trimmed dorsal, anal, and pelvic fins. Native to slow-moving blackwater streams and flooded forests of Suriname and Brazil. Beautiful when mature with males displaying deep rose-pink hues.',

  yellowPhantomTetra:
    'A peaceful nano tetra with striking yellow body, black shoulder spot, and orange-blue fins with white tips. Native to slow-moving blackwater streams of French Guiana and upper Amazon. Hardy schooling fish that prefer subdued lighting and minimal current.',

  beckfordsPencilfish:
    'A slender surface-dwelling fish with golden-yellow to red body and horizontal black stripe from head to tail. Native to slow-moving blackwater streams and swamps of the Amazon and Guyana basins. Hardy, peaceful, and inquisitive, these elegant schoolers display fascinating swimming behavior.',

  goldenPencilfish:
    'A distinctive elongated surface-dweller that swims at a characteristic 45-degree diagonal angle. Native to slow-moving blackwater streams of the Amazon basin. Peaceful, shy, and unique in their oblique swimming posture, these delicate fish require heavily planted tanks.',

  blindCaveTetra:
    'A unique eyeless albino tetra that evolved in dark Mexican cave systems. Native to underground rivers and caves of the Sierra Madre Oriental. Hardy, active, and resilient despite blindness, these fascinating fish are often first to food and can be moderately aggressive at night.',

  garnetTetra:
    'A small peaceful tetra with warm ruby-garnet glow and black-trimmed fins. Native to slow-moving tributaries and flooded creeks of the upper Amazon basin. Shy, delicate schooling fish that display stunning coloration in proper conditions.',

  dwarfPencilfish:
    'A tiny surface-dwelling nano fish with silver body, two prominent black horizontal stripes, and red patch at tail base. Native to calm shallow blackwater streams and swamps of the Amazon basin. Peaceful, playful, and charming despite their diminutive size.',

  marginatedTetra:
    'A small peaceful schooling tetra with pale silver-gold body, black shoulder spot, and subtle horizontal stripe. Native to slow-moving tributaries and flooded forests of the Amazon and Orinoco basins. Hardy, active, and beginner-friendly.',

  flagTetra:
    'A beautiful tetra with silver body, prominent black horizontal stripe, iridescent green-yellow band above, and orange upper eye. Native to slow-moving Amazon tributaries and coastal drainages in Brazil. Peaceful, shy schooling fish that require groups of 8+.',

  costelloTetra:
    'A small schooling tetra from the Amazon basin. Native to slow-moving blackwater tributaries with dense vegetation. Peaceful, active, and ideal for nano community tanks.',

  platinumTetra:
    'A small silver tetra with metallic sheen from the Amazon basin. Native to blackwater streams with dense vegetation. Peaceful schooling fish that remain active in mid-water levels.',

  blackLineTetra:
    'A hardy beginner-friendly tetra with silver body and prominent black horizontal stripe from gill to tail. Native to clearwater rivers of the Amazon basin, they unusually prefer higher pH and clearer water than most South American tetras.',

  loretoTetra:
    'A rare nano tetra with subtle shimmer and delicate build from the Amazon basin of Peru. Native to slow-moving blackwater streams with overhanging vegetation. Peaceful, shy, and active schoolers best suited for experienced aquarists.',

  dawnTetra:
    'A striking nano tetra with bold black-and-white panda-like pattern. Native to slow-moving streams of Bolivia, Paraguay, and southern Brazil. Peaceful but can be fin nippers if kept in small groups, requiring schools of 12+.',

  kittyTetra:
    'A vibrant tetra with red-orange coloration along body and fins, prominent flag-like dorsal fin in males. Native to South American rivers. Peaceful, sociable, and colorful schooling fish that thrive in groups of 6+.',

  goldenTetra:
    'A shimmering tetra with golden-yellow metallic sheen from natural parasites acquired in wild populations. Native to Amazon basin streams and tributaries. Peaceful, hardy schooling fish suitable for beginners and experienced aquarists alike.',

  coralRedPencilfish:
    'A stunning nano surface-dweller with intense fire-engine red males and high-contrast black-striped females. Native to wild-caught populations in South American blackwater streams. Peaceful, shy surface fish that prefer top levels near floating plants.',

  rubyTetra:
    'A tiny jewel-like nano tetra with vibrant ruby-red body coloration. Native to slow-moving streams and tributaries of Colombia and Venezuela. Peaceful, slow-moving, and colorful schooling fish that pair well with other small peaceful species.',

  silverTetra:
    'A larger active tetra with silvery-gray rhomboid body shape. Native to South American rivers and hardy omnivorous fish adaptable to various water conditions. Too large and active for typical community tanks with gentle species but excellent for robust setups.',

  glassBloodfin:
    'A transparent elongated tetra with red-tipped fins. Native to South American rivers and streams. Active, hardy schooling fish that swim energetically in mid-water levels.',

  redeyeTetra:
    'A robust active tetra with silver body, subtle pink-orange hue, and striking bright red eye. Native to clear slow-moving rivers of Brazil, Paraguay, and Argentina. Peaceful, energetic schoolers requiring groups of 6+ in larger community tanks.',

  // ============================================
  // BARBS
  // ============================================
  tigerBarb:
    'An active, boisterous schooling fish with distinctive gold body and four bold black vertical bands. Native to Indonesian and Malaysian streams and rivers. Semi-aggressive with notorious fin-nipping behavior, these energetic swimmers must be kept in groups of 6+.',

  cherryBarb:
    'A peaceful, colorful cyprinid with males displaying stunning cherry-red coloration during spawning while females are more subdued golden-brown. Native to Sri Lanka\'s Kelani and Nilwala river basins. Hardy and beginner-friendly, these active schooling fish are notably less aggressive than other barb species.',

  roysyBarb:
    'A peaceful, hardy barb with males displaying rosy-red coloration especially during breeding. Native to northern Indian streams and rivers. Peaceful for barbs and suitable for community tanks, these active schoolers appreciate well-oxygenated water with moderate current.',

  goldBarb:
    'A small, peaceful barb with golden-yellow body and subtle dark markings. Native to Southeast Asian streams in southern China, Vietnam, and Laos. Peaceful, active, and significantly less aggressive than other barb species.',

  odessaBarb:
    'A striking barb with males developing brilliant red-orange lateral bands during maturity. Native to Myanmar streams with disputed wild origins. Peaceful for barbs and suitable for community tanks, these active schoolers display minimal fin-nipping.',

  denisonBarb:
    'A large, spectacular barb with red horizontal stripe from nose to tail and black-and-yellow striped tail. Native to fast-flowing Indian mountain streams in Western Ghats. Peaceful, active, and requiring high oxygen with strong current, sometimes called Roseline Sharks.',

  fiveBandedBarb:
    'A peaceful barb with five bold vertical black bands on golden body. Native to Southeast Asian streams in Malaysia, Singapore, and Indonesia. Peaceful, shy, and suitable for community tanks unlike many barbs.',

  pentazonaBarb:
    'A small, peaceful barb with striking pattern of five bold black vertical bands on golden-orange body. Native to Southeast Asian peat swamp forests in Borneo and Malaysia. Peaceful, shy, and suitable for community tanks unlike most barbs.',

  blackRubyBarb:
    'A stunning barb with males developing intense ruby-red and black coloration during breeding. Native to Sri Lankan hill streams with cool, well-oxygenated water. Peaceful for barbs with males displaying spectacular breeding colors.',

  checkerBarb:
    'A peaceful barb with distinctive checkerboard pattern of dark squares on golden body. Native to Indonesian streams in Sumatra. Peaceful, shy, and suitable for community tanks unlike most barbs.',

  tictoBarb:
    'A peaceful barb with silver-gold body and two distinctive black spots. Native to Sri Lankan streams and rivers. Peaceful for barbs and suitable for community tanks with minimal fin-nipping behavior.',

  tinfoilBarb:
    'A large active barb with bright silver metallic body and red-orange fin accents. Native to fast-flowing rivers and streams of Thailand, Sumatra, and Borneo. Peaceful, schooling, and herbivorous fish that jump readily and require very large aquariums.',

  aruliusBarb:
    'A medium-sized barb with silver-gold body, black vertical bars, and extended filamentous dorsal fin rays in mature males. Native to fast-flowing hill streams of southern India. Active, peaceful schooling fish that can be boisterous and nippy with long-finned tankmates.',

  melonBarb:
    'A colorful medium barb with pinkish-orange body resembling a melon and black spot near tail. Native to fast-flowing streams of southern India. Active, peaceful schooling fish that remain energetic and require spacious tanks.',

  tBarb:
    'A medium barb with distinctive T-shaped or two-spot pattern on sides. Native to fast-flowing streams and rivers of Southeast Asia. Active, schooling, and hardy fish that adapt well to aquarium life.',

  cumingsBarb:
    'A small attractive barb with golden-yellow body and distinct black markings. Native to streams of Sri Lanka. Peaceful, active schooling fish perfect for smaller community aquariums.',

  // ============================================
  // DANIOS
  // ============================================
  zebraDanio:
    'A small, active schooling fish with distinctive horizontal blue and gold stripes running the length of the body. Native to streams and rivers in India and Bangladesh. Extremely hardy, peaceful, and energetic, these beginner-friendly fish tolerate a wide range of conditions.',

  celestialPearlDanio:
    'A tiny peaceful nano fish with dark bodies scattered with golden spots and bright red-orange fins with black stripes. Native to shallow vegetated ponds in Myanmar\'s Shan Plateau. Recently discovered species from Southeast Asian hill streams.',

  pearlDanio:
    'A small, elongated danio with translucent body featuring pearlescent bluish scales and orange-red stripe. Native to Southeast Asian streams in Myanmar, Thailand, and Sumatra. Peaceful, hardy, and extremely active, these surface-dwelling schoolers tolerate cooler temperatures.',

  glowlightDanio:
    'A tiny vibrant danio with stunning bars, stripes, and spots in green, gold, red, and turquoise creating a glowing appearance. Native to clear fast-flowing streams of northern Myanmar. Peaceful, nervous, shy schooling fish that are rare and expensive.',

  giantDanio:
    'A large active danio with blue-green body and yellow-gold horizontal stripes. Native to fast-flowing streams and rivers of India, Sri Lanka, and Myanmar. Active, peaceful, boisterous schooling fish that jump readily and require secure lids.',

  malabarDanio:
    'A medium-sized active danio with silvery-blue body and horizontal stripes. Native to fast-flowing mountain streams of southwestern India. Energetic, peaceful schooling fish that are excellent jumpers requiring tight-fitting lids.',

  orangeFinnedDanio:
    'A small colorful danio with striking orange fins contrasting against silvery body. Native to streams and rivers of Southeast Asia. Peaceful, active, social schooling fish perfect for community aquariums.',

  // ============================================
  // RASBORAS
  // ============================================
  harlequinRasbora:
    'A distinctive schooling fish with pinkish-orange coloration and a bold black triangular wedge extending from mid-body to tail. Native to Southeast Asian peat swamp streams and blackwater habitats. Hardy, peaceful, and beginner-friendly, these active swimmers thrive in groups of 6-8+.',

  scissortailRasbora:
    'A large, active rasbora with silver body and deeply forked tail with black and white markings that move like scissors. Native to Southeast Asian rivers and streams. Peaceful, hardy, and extremely active, these fast-swimming schoolers require spacious tanks.',

  lambchopRasbora:
    'A small rasbora with distinctive lambchop-shaped black wedge narrower than harlequin rasbora\'s triangle. Native to Southeast Asian peat swamps in Thailand and Cambodia. Peaceful, hardy, and closely related to harlequin rasbora.',

  brilliantRasbora:
    'A small, colorful rasbora with pinkish body and brilliant blue-green iridescence. Native to Malaysian and Thai peat swamps and forest streams. Peaceful, active, and displaying stunning iridescence under proper lighting.',

  phoenixRasbora:
    'A tiny, brilliant nano fish with fiery red-orange coloration and dark lateral stripe. Native to Borneo peat swamp forests in blackwater habitats. Peaceful, delicate, and best suited for species-specific nano tanks.',

  strawberryRasbora:
    'A tiny nano fish with pinkish-red body and distinctive large black spot on side. Native to southern Borneo blackwater habitats in peat swamp forests. Peaceful, delicate, and best suited for species-specific nano tanks.',

  chiliRasbora:
    'A tiny, brilliant nano fish with deep red coloration in males. Native to southwestern Borneo peat swamp forests in blackwater habitats. Peaceful, delicate, and best suited for species-specific nano tanks.',

  exclamationPointRasbora:
    'A tiny nano fish with single bold black spot at tail base resembling an exclamation point. Native to Indonesian peat swamps in southern Borneo. Peaceful, delicate, and requiring species-specific nano setups.',

  kubotaiRasbora:
    'A beautiful nano rasbora with neon green-blue horizontal stripe and orange-red fins. Native to slow-moving streams and marshes of Thailand. Peaceful, active, tiny schooling fish perfect for nano aquariums.',

  leastRasbora:
    'A tiny nano rasbora with slender translucent body and subtle red-orange tones. Native to slow-moving blackwater habitats of Southeast Asia. Peaceful, delicate, miniature schooling fish perfect for nano aquariums.',

  dwarfSpottedRasbora:
    'A tiny nano rasbora with red-orange body and distinctive dark spots along sides. Native to slow-moving peat swamps, streams, and rivers of Southeast Asia. Peaceful, delicate, striking schooling fish ideal for nano aquariums.',

  redtailRasbora:
    'A slender active rasbora with silvery body and distinctive red tail fin. Native to streams and rivers of Southeast Asia. Peaceful, hardy schooling fish that swim actively in mid-water.',

  rummyNoseRasbora:
    'A distinctive nano rasbora with translucent silvery-green body and bright red snout resembling Rummy Nose Tetras. Native to high-altitude streams of Myanmar. Peaceful, active schooling fish that prefer cooler well-oxygenated flowing water.',

  microrasbora:
    'A tiny, stunning nano fish with dark blue body covered in pearl-white spots and brilliant orange-red fins. Native to shallow vegetated ponds in Myanmar\'s Shan Plateau. Peaceful, somewhat shy, and moderately easy to care for.',

  emeraldDwarfRasbora:
    'A tiny nano fish with emerald-green iridescence and orange-red fins with black markings. Native to Myanmar mountain streams. Peaceful, active, and displaying brilliant colors despite tiny size.',

  greenKubotaiRasbora:
    'A small, peaceful fish with green-bronze coloring and active schooling behavior. Native to densely planted tanks with soft substrate. Hardy nano fish perfect for planted community tanks.',

  // ============================================
  // RAINBOWFISH
  // ============================================
  boesmansRainbowfish:
    'A spectacular rainbowfish with males displaying blue-gray front half and orange-red rear half. Native to Vogelkop Peninsula lakes in West Papua, Indonesia. Active, peaceful, and displaying stunning bicolor pattern when mature.',

  turquoiseRainbowfish:
    'A stunning rainbowfish with males developing brilliant turquoise-blue coloration on upper body and yellow-orange lower body. Native to northern Australian streams in Arnhem Land. Peaceful, active, and displaying spectacular coloration when mature.',

  redRainbowfish:
    'A large, spectacular rainbowfish with males developing intense cherry-red coloration and deep bodies at maturity. Native to Lake Sentani in Papua, Indonesia. Active, peaceful, and striking when mature, requiring patience as juveniles develop color slowly.',

  threadfinRainbowfish:
    'A slender rainbowfish with males developing elongated threadlike dorsal and anal fin extensions. Native to northern Australian streams and rivers in Papua New Guinea. Peaceful, active, and displaying stunning fin extensions when mature.',

  dwarfNeonRainbowfish:
    'A tiny rainbowfish with brilliant neon-blue stripe and red-orange fins. Native to New Guinea streams. Peaceful, active, and perfect for smaller tanks unlike larger rainbowfish.',

  celebesRainbowfish:
    'A small, elegant rainbowfish with translucent yellow-green body and distinctive sail-like dorsal fin. Native to Sulawesi island streams in Indonesia. Peaceful, active, and slightly delicate.',

  bandedRainbowfish:
    'A colorful medium rainbowfish with distinctive vertical bands and iridescent blue-green body. Native to streams and rivers of Papua New Guinea. Active, peaceful schooling fish that display stunning colors when mature males compete.',

  lakeKutubuRainbowfish:
    'A spectacular rainbowfish with vibrant blue-green iridescent body and yellow-orange fins. Endemic to Lake Kutubu in Papua New Guinea. Active, peaceful, colorful schooling fish that develop intense coloration with maturity.',

  kamakaRainbowfish:
    'A stunning rainbowfish with electric blue body and yellow-orange fins. Native to fast-flowing streams of Papua New Guinea. Active, peaceful, brilliantly colored schooling fish that intensify in color with age.',

  axelrodiRainbowfish:
    'A beautiful smaller rainbowfish with blue-green iridescent body and red-orange fins. Native to clear streams of Papua New Guinea. Active, peaceful, colorful schooling fish that develop vibrant coloration with maturity.',

  // ============================================
  // LIVEBEARERS
  // ============================================
  guppy:
    'An extremely popular livebearer known for prolific breeding and stunning color variety. Native to South America and Caribbean streams, they adapt to diverse conditions. Hardy, peaceful, and beginner-friendly, these active surface-dwellers reproduce continuously with minimal intervention.',

  endlersLivebearer:
    'A tiny, brilliantly colored livebearer with males displaying striking metallic patterns in green, orange, blue, and yellow. Native to coastal lagoons in northeastern Venezuela. Peaceful, active, and extremely prolific breeders.',

  molly:
    'A popular livebearer available in numerous colors including black, orange, silver, and dalmatian patterns. Native to Central and South American coastal regions. Hardy, active, and generally peaceful, these adaptable fish benefit from occasional salt addition.',

  balloonMolly:
    'A selectively-bred livebearer characterized by its distinctive rounded, balloon-like body resulting from scoliosis. Peaceful, active fish that come in diverse color varieties including black, white, gold, and dalmatian patterns. Beginner-friendly community fish.',

  blackMolly:
    'A jet-black color variant of Poecilia sphenops developed through selective breeding. Originating from Central and South American habitats, these peaceful livebearers are notably effective at consuming filamentous algae and blue-green algae.',

  dalmatianMolly:
    'A color variant of common molly with white body covered in black spots resembling a dalmatian dog. Hardy, peaceful, and thriving in both freshwater and brackish conditions, these active livebearers reproduce prolifically.',

  sailfinMolly:
    'A larger molly variety with males displaying impressive sail-like dorsal fins. Native to coastal waters of the Gulf of Mexico region. Peaceful, active, and preferring slightly brackish conditions for optimal health.',

  platy:
    'A colorful, hardy livebearer available in numerous color varieties including red, orange, yellow, and blue. Native to Central American freshwater and brackish streams. Peaceful, active, and extremely beginner-friendly.',

  variatusPlaty:
    'A hardy livebearer with naturally occurring variable coloration including sunset and high-fin varieties. Native to Mexican rivers and streams in cooler highland regions. Peaceful, active, and tolerating lower temperatures than most livebearers.',

  swordtail:
    'A popular livebearer with males displaying distinctive sword-like tail extension available in multiple color varieties. Native to Central American rivers and streams. Hardy, active, and generally peaceful though males can be territorial.',

  leastKillifish:
    'A tiny livebearer reaching only 1.5 inches with females larger than males, among smallest livebearing fish. Native to southeastern United States freshwater and brackish habitats. Peaceful, hardy, and perfect for nano tanks.',

  mosquitofish:
    'A small, dull-gray livebearer introduced globally for mosquito control. Native to Mississippi River basin and Gulf Coast drainages. Extremely hardy but highly aggressive toward other fish with fin-nipping behavior, considered among the world\'s worst invasive species.',

  // ============================================
  // GOURAMIS
  // ============================================
  bettaFish:
    'The iconic Siamese fighting fish renowned for vibrant coloration and elaborate finnage developed through centuries of selective breeding. Native to Southeast Asia\'s shallow, slow-moving waters. Males display extreme territorial aggression toward one another but thrive in heated, filtered tanks.',

  betaImbellis:
    'A peaceful wild betta with iridescent green-blue body and red-orange fins. Native to southern Thailand and Malaysian peat swamps. Peaceful unlike splendens bettas and suitable for community tanks, these beautiful labyrinth fish can be kept in pairs or groups.',

  dwarfGourami:
    'A small, colorful labyrinth fish with males displaying brilliant blue and red striped patterns. Native to slow-moving waters and rice paddies in India and Bangladesh. Peaceful but males can be territorial, these beginner-friendly fish breathe atmospheric air.',

  honeyGourami:
    'A small, peaceful labyrinth fish with golden-honey coloration that becomes brilliant orange during breeding. Native to northeastern Indian slow-moving waters. Extremely peaceful, shy, and beginner-friendly, less territorial than other gourami species.',

  pearlGourami:
    'A medium-sized labyrinth fish with stunning pearl-like white spots covering a golden-brown body. Native to Southeast Asian peat swamps and shallow pools. Peaceful, shy, and elegant, these hardy fish develop long, thread-like pelvic fins.',

  threeSpotGourami:
    'A large labyrinth fish with blue-gray body and two distinct spots (third spot is the eye). Native to Southeast Asian slow-moving waters, marshes, and rice paddies. Semi-aggressive and territorial especially toward other gouramis.',

  opalineGourami:
    'A color variant of the three-spot gourami with marbled blue-gray pattern lacking distinct spots. Native to Southeast Asian slow-moving waters. Semi-aggressive and territorial especially toward other gouramis, these hardy labyrinth fish breathe atmospheric air.',

  blueGourami:
    'A large labyrinth fish with powder-blue body and two distinct spots. Native to Southeast Asian slow-moving waters, marshes, and rice paddies. Semi-aggressive and territorial especially toward other gouramis.',

  goldGourami:
    'A color variant of three-spot gourami with golden-yellow body lacking distinct spot pattern. Selectively bred morph, not found in wild. Semi-aggressive and territorial especially toward other gouramis.',

  moonlightGourami:
    'A peaceful, silvery labyrinth fish with subtle iridescent blue sheen and orange-tinted pelvic fins. Native to Southeast Asian slow-moving rivers and floodplains. Peaceful, hardy, and less territorial than most gouramis.',

  kissingGourami:
    'A large labyrinth fish with distinctive thick lips used for "kissing" behavior between individuals. Native to Southeast Asian slow-moving waters. Semi-aggressive with territorial lip-locking displays, requiring very large tanks.',

  paradiseFish:
    'A colorful, hardy labyrinth fish with striking blue and red vertical stripes. Native to East Asian rice paddies, ditches, and slow-moving waters. Aggressive and territorial especially toward conspecifics, tolerating wide temperature ranges.',

  chocolateGourami:
    'A delicate labyrinth fish with chocolate-brown body and vertical cream-yellow bands. Native to Southeast Asian peat swamps in Sumatra, Borneo, and Malaysia. Peaceful, sensitive, and requiring advanced care with pristine blackwater conditions.',

  sparklingGourami:
    'A tiny, beautiful labyrinth fish with iridescent spots and ability to produce croaking sounds. Native to Southeast Asian slow-moving waters. Peaceful, timid, and ideal for nano tanks, displaying unique vocalizations.',

  snakeskinGourami:
    'A large peaceful gourami with silvery-tan body covered in distinctive snake-like diagonal crosshatch pattern. Native to Mekong basin and surrounding river systems. Peaceful, hardy labyrinth fish making excellent centerpiece fish for large community tanks.',

  bandedGourami:
    'A medium-sized peaceful gourami with golden-brown body adorned with 3-5 vertical dark bands and blue-green iridescence. Native to northern India, Myanmar, and Thailand. Hardy, peaceful labyrinth fish with attractive banding pattern.',

  croakingGourami:
    'A small fascinating gourami with brown body, irregular spots, and unique ability to produce audible croaking sounds. Native to slow-moving waters, ponds, and rice paddies throughout Southeast Asia. Peaceful, hardy labyrinth fish named for their distinctive vocalizations.',

  thickLippedGourami:
    'A medium peaceful gourami with blue-green iridescent body and distinctively prominent enlarged lips. Native to Southeast Asia including Thailand. Hardy, peaceful labyrinth fish named for characteristic swollen lips.',

  licoriceGourami:
    'A tiny delicate gourami with dark brown-black body and subtle striping resembling licorice candy. Native to peat swamp forests and blackwater streams in Southeast Asia. Extremely sensitive, requiring pristine blackwater conditions.',

  giantGourami:
    'A massive peaceful gourami that can grow 20-28 inches with tan-silver body that develops distinctive patterns. Native to rivers, lakes, and swamps throughout Southeast Asia. Intelligent, personable, and surprisingly peaceful despite enormous size, requiring massive aquariums or ponds.',

  // ============================================
  // CICHLIDS - DWARF/SOUTH AMERICAN
  // ============================================
  angelfish:
    'A tall, graceful cichlid with distinctive triangular shape and elongated fins. Native to Amazon River basin slow-moving waters with dense vegetation. Semi-aggressive and territorial especially when breeding, these majestic centerpiece fish require tall tanks.',

  discus:
    'A large, disc-shaped cichlid with stunning color varieties and intricate patterns. Native to Amazon River basin slow-moving tributaries and flooded forests. Sensitive, peaceful, and requiring advanced care with pristine water quality and higher temperatures.',

  germanBlueRam:
    'A small, stunning dwarf cichlid with electric blue coloration and black markings. Native to Colombian and Venezuelan river basins. Peaceful for cichlids but territorial during breeding, these sensitive fish require pristine water quality.',

  bolivianRam:
    'A peaceful dwarf cichlid with golden-yellow body, red-orange fins, and black lateral spot. Native to Bolivian Amazon basin tributaries. Hardier and more adaptable than German Blue Rams, these personable bottom-dwellers form pairs.',

  kribensis:
    'A colorful dwarf cichlid with purple-pink belly and distinctive red-cherry belly in females. Native to West African coastal rivers and estuaries. Peaceful for cichlids and suitable for community tanks when not breeding.',

  apistogrammaAgassizii:
    'A small, colorful dwarf cichlid with males displaying vibrant yellows and distinctive horizontal belly stripe. Native to slow-moving blackwater streams throughout the Amazon basin. Curious bottom-dwellers that thrive in planted community tanks.',

  cockatooCichlid:
    'A distinctive dwarf cichlid with elongated dorsal fin rays resembling a cockatoo\'s crest. Native to Amazon and Orinoco river basins. Peaceful, shy, and harem-breeding with males maintaining territories with multiple females.',

  electricBlueAcara:
    'A medium-sized peaceful cichlid with stunning electric blue coloration and subtle vertical bars. Native to Colombian and Venezuelan river systems. Hardy, peaceful for cichlids, and beginner-friendly, these personable fish form breeding pairs.',

  blueAcara:
    'A peaceful medium cichlid with powder-blue body, orange highlights, and less intense coloration than electric blue acara. Native to Central and South American rivers. Peaceful for cichlids and suitable for community tanks with robust fish.',

  firemouthCichlid:
    'A medium-sized Central American cichlid with gray-blue body and brilliant orange-red throat and belly. Native to Mexican and Guatemalan rivers and cenotes. Semi-aggressive and territorial especially during breeding.',

  convictCichlid:
    'A small, hardy cichlid with bold black and white vertical stripes. Native to Central American rivers in Guatemala. Aggressive, territorial, and extremely prolific breeders with intense parental care.',

  keyholdCichlid:
    'A peaceful cichlid with distinctive keyhole-shaped black marking on sides. Native to South American rivers in Guyana. Peaceful, shy, and suitable for community tanks unlike most cichlids.',

  jewelCichlid:
    'A beautiful but aggressive cichlid with brilliant red coloration intensifying during breeding. Native to West African rivers and streams. Highly aggressive, territorial, and unsuitable for community tanks even when young.',

  jackDempsey:
    'A large, aggressive cichlid with iridescent blue spots on dark body named after famous boxer. Native to Central American rivers and lakes. Aggressive, territorial, and unsuitable for community tanks.',

  severum:
    'A large, peaceful cichlid with various color forms including green, gold, and red varieties. Native to Amazon and Orinoco River basins. Peaceful for large cichlids, these personable vegetarians will uproot plants while grazing.',

  silverDollar:
    'A large, disc-shaped schooling fish with silver body resembling a coin. Native to Amazon River basin tributaries. Peaceful, timid, and entirely herbivorous, these active schoolers will devour all live plants.',

  africanButterflyCichlid:
    'A peaceful dwarf cichlid with yellow body, black lateral stripe, and lyretail fin extensions in males. Native to West African rivers. Peaceful, shy, and suitable for community tanks unlike most cichlids.',

  texasCichlid:
    'A large robust cichlid with pearl-like spots covering blue-gray body and red eyes. Native to rivers of Texas and northern Mexico. Hardy, aggressive, territorial fish with personality and intelligence.',

  greenTerror:
    'An aptly-named large cichlid with iridescent green-blue coloration and orange trim on fins. Native to rivers of Ecuador and Peru. Beautiful, highly aggressive, territorial fish with intense personality.',

  salviniCichlid:
    'A medium aggressive cichlid with yellow body and black markings. Native to Central America from Mexico to Guatemala. Hardy, aggressive, colorful fish with bold personality.',

  nicaraguanCichlid:
    'A peaceful large cichlid with golden-yellow coloration and black markings. Native to lakes of Nicaragua and Costa Rica. Beautiful, relatively peaceful for size, personable fish with excellent parental care.',

  tBarCichlid:
    'A distinctive cichlid with vertical T-shaped or double-bar pattern. Native to rivers of Central America. Large, moderately aggressive, patterned fish with interesting territorial behavior.',

  bloodParrotCichlid:
    'A unique hybrid cichlid with round body shape and "parrot" beak mouth. Product of selective breeding, not found in nature. Endearing, peaceful, personable fish despite controversial hybrid origins.',

  flowerhornCichlid:
    'A large hybrid cichlid with massive nuchal hump and vibrant colors. Product of selective breeding popular in Asia. Colorful, aggressive, interactive fish with dog-like personality requiring massive solo tanks.',

  festivum:
    'A peaceful disc-shaped cichlid with subdued olive-gold coloration and black markings. Native to Amazon basin in slow-moving waters. Gentle, shy, underrated fish perfect for planted community tanks.',

  chocolateCichlid:
    'A large robust cichlid with dark chocolate-brown coloration and subtle patterns. Native to rivers and lakes of South America. Hardy, moderately aggressive, imposing fish with eartheater-type behavior.',

  pearlCichlid:
    'An unusual cichlid that constantly sifts sand through its gills searching for food. Native to rivers of Brazil and Guyana. Peaceful, fascinating, specialized fish with unique feeding behavior.',

  // ============================================
  // CICHLIDS - AFRICAN
  // ============================================
  peacockCichlid:
    'A colorful African cichlid with males displaying brilliant blue, yellow, or red coloration depending on species. Native to Lake Malawi rocky and sandy habitats. Peaceful for African cichlids, these beautiful fish use specialized sensory pits to detect prey.',

  yellowLabCichlid:
    'A bright yellow African cichlid with males developing striking egg spots on anal fin. Native to Lake Malawi rocky habitats. Less aggressive than most mbuna and suitable for all-male or mixed Lake Malawi community tanks.',

  oscar:
    'A large, intelligent cichlid with various color forms including tiger, albino, and red patterns. Native to Amazon River basin slow-moving tributaries. Aggressive, messy, and highly personable with dog-like recognition of owners.',

  redZebra:
    'A vibrant mbuna cichlid with brilliant orange-red coloration despite its misleading name. Endemic to rocky shores of Lake Malawi. Hardy, aggressive, and territorial with fascinating behavior including feeding on algae in nature.',

  bumblebeeCichlid:
    'A distinctive mbuna with yellow and black vertical bumblebee stripes capable of rapid color changes. Endemic to deep rocky caves of Lake Malawi. Hardy, highly aggressive, and fascinating with specialized cleaning behavior.',

  frontosaCichlid:
    'A majestic predatory cichlid with bold blue-white vertical banding and distinctive cranial hump in males. Native to deep rocky waters of Lake Tanganyika. Peaceful, slow-growing, long-lived fish with 25+ year lifespan.',

  tropheus:
    'A specialized algae-grazing mbuna with stunning regional color variants including yellows, reds, blues, and blacks. Endemic to rocky shores throughout Lake Tanganyika. Challenging, beautiful, and demanding fish best for experienced keepers.',

  julieCichlid:
    'A peaceful cave-dwelling cichlid with striking patterns including horizontal stripes and checkerboards. Native to rocky shores of Lake Tanganyika. Hardy, territorial but relatively peaceful, and fascinating with devoted parental care.',

  lemonCichlid:
    'A vibrant yellow cave-dwelling cichlid from Lake Tanganyika. Endemic to rocky areas, they occupy and defend cave territories aggressively. Colorful, hardy, territorial fish that form monogamous pairs.',

  princessCichlid:
    'A beautiful shell-dwelling cichlid from sandy areas of Lake Tanganyika. They live in and around empty snail shells, defending small territories. Small, peaceful, fascinating fish perfect for smaller Tanganyikan setups.',

  brevisCichlid:
    'A tiny shell-dwelling cichlid among the smallest cichlids in Lake Tanganyika. They inhabit sandy bottoms with empty snail shells. Miniature, peaceful, charming fish ideal for nano Tanganyikan setups.',

  eyeBiterCichlid:
    'An unusual predatory cichlid that specializes in feeding on the eyes and scales of other fish in Lake Tanganyika. Specialized, aggressive, fascinating fish requiring experienced keepers.',

  redEmpress:
    'A stunning haplochromine cichlid with males displaying vibrant red-orange coloration. Native to rocky and sandy areas of Lake Malawi. Colorful, active, less aggressive than mbuna.',

  venustus:
    'A large predatory cichlid with beautiful blue-yellow patterning that changes dramatically from juvenile to adult. Native to Lake Malawi. Large, predatory, striking fish that lie motionless playing dead to ambush prey.',

  blueDolphin:
    'A peaceful large cichlid with powder-blue coloration and distinctive nuchal hump resembling a dolphin\'s forehead. Native to deeper sandy areas of Lake Malawi. Beautiful, gentle, personable fish despite large size.',

  sunshinePeacock:
    'A dazzling peacock cichlid with brilliant yellow-orange coloration. Endemic to Lake Malawi\'s rocky areas. Stunning, active, moderately peaceful fish perfect for mixed Malawi peacock communities.',

  obPeacock:
    'A unique peacock cichlid with orange-blotched marbled pattern over blue background. Product of selective breeding from Lake Malawi peacocks. Colorful, active, popular designer cichlid.',

  demasoni:
    'A stunning but extremely aggressive mbuna with electric blue and black horizontal stripes. Endemic to a tiny area of Lake Malawi\'s Pombo Rocks. Beautiful, tiny, exceptionally aggressive fish requiring specialized care.',

  // ============================================
  // CORYDORAS
  // ============================================
  corydoras:
    'Small, armored catfish with numerous species displaying varied patterns from spotted to striped. Native to South American streams and rivers. Peaceful, social bottom-dwellers that thrive in groups of 6+.',

  bronzeCory:
    'The classic wild-type corydoras with bronze-olive body and metallic sheen. Native to South American rivers throughout much of the continent. Peaceful, extremely hardy, and beginner-friendly.',

  pandaCory:
    'A small, distinctive catfish with white body and bold black markings on eyes, dorsal fin, and caudal peduncle resembling a panda. Native to Peruvian Amazon tributaries with cool, oxygen-rich waters.',

  peppereddCory:
    'A classic, hardy catfish with pale body covered in dark pepper-like spots and mottled pattern. Native to South American rivers in Uruguay and Brazil. Peaceful, extremely hardy, and beginner-friendly.',

  sterbaiCory:
    'A popular catfish with distinctive pattern of white spots on dark brown to black body and bright orange pectoral fins. Native to Brazilian river systems. Peaceful, hardy, and attractive.',

  juliiCory:
    'A small, attractive catfish with intricate spotted pattern and black stripe through eye. Native to Brazilian coastal rivers. Peaceful, active, and frequently confused with trilineatus cory.',

  albinoCory:
    'A color variant of bronze corydoras with pale pink-white body, red eyes, and reduced pigmentation. Captive-bred mutations popular for their striking pale appearance contrasting with darker tankmates.',

  pygmyCory:
    'A tiny catfish with elongated body, horizontal black stripe, and more minnow-like swimming behavior than typical corydoras. Native to Brazilian Amazon tributaries. Unique among corydoras for swimming throughout the water column.',

  saltAndPepperCory:
    'A tiny catfish with salt-and-pepper speckling pattern across pale body. Native to Venezuelan and Colombian river systems. Peaceful, delicate, and ideal for nano tanks.',

  banditCory:
    'A peaceful, social catfish named for the distinctive black "bandit mask" stripe across its eyes. Native to the Meta River basin in Colombia. Hardy and beginner-friendly, these energetic bottom-dwellers thrive in groups of 6+.',

  duplicareusCorydoras:
    'A small, peaceful catfish with distinctive orange head patch and broader dark horizontal stripe. Native to upper Rio Negro tributaries in Brazil. Hardy and easier to breed than the similar C. adolfoi.',

  schwartzsCory:
    'A pearl-colored medium catfish with intricate pattern of spots, dashes, and twin bars. Native to Rio Purus tributaries in Brazil\'s Amazon basin. Hardy and peaceful but somewhat prone to barbel infections.',

  melanistiusCory:
    'A striking small catfish with pearly-white body decorated with dark blue-black spots and distinctive black "sail" dorsal fin. Native to coastal rivers of Guyana, French Guiana, and Suriname. Peaceful, nocturnal, and beautiful.',

  agassiziCorydoras:
    'A spotted medium catfish with complex pattern of dark spots covering cream-tan body. Native to Amazon River basin in Brazil and Peru. Hardy, peaceful, and adaptable with easier care requirements than many specialty cories.',

  threeStripeCory:
    'A beautiful small catfish with pale beige-silver body adorned with intricate reticulated pattern and three distinctive dark horizontal stripes. Native to central and Peruvian Amazon River basin. One of the easiest Corydoras to breed.',

  venezuelaCory:
    'A distinctive medium catfish with brownish-bronze body, large oval green-black shoulder patch, and bright copper-orange head patch. Native exclusively to northern Venezuela. Hardy, adaptable, and active despite restricted distribution.',

  // ============================================
  // LOACHES
  // ============================================
  kuhliLoach:
    'An elongated, eel-like bottom-dweller with distinctive yellow-orange and dark brown vertical bands. Native to Southeast Asian slow-moving streams. Peaceful, shy, and social, these unique scavengers thrive in groups of 3-6+.',

  clownLoach:
    'A large, social bottom-dweller with bright orange body and three bold black vertical bands. Native to Indonesian rivers and streams. Peaceful, playful, and highly social, these long-lived fish require very large tanks and groups of 5+.',

  yoyoLoach:
    'A medium-sized, active loach with intricate dark "Y-O-Y-O" pattern markings on silver-gray body. Native to Indian and Pakistani rivers. Peaceful, semi-nocturnal, and social, these energetic bottom-dwellers are excellent snail control.',

  zebraLoach:
    'A small, attractive loach with bold vertical black and white zebra-like banding. Native to Indian rivers and streams with rocky substrates. Peaceful, active during day unlike many loaches, and less shy than similar species.',

  dwarfChainLoach:
    'A tiny loach with chain-like pattern of connected dark markings along body. Native to Indian streams with rocky substrates. Peaceful, social, and ideal for nano and community tanks.',

  dojoLoach:
    'A large, eel-like loach with barbels around mouth and ability to predict weather changes. Native to East Asian rivers and rice paddies. Peaceful, hardy, and tolerating cold water down to 40 F, sometimes called Weather Loaches.',

  hillstreamLoach:
    'A flat, uniquely-shaped loach with sucker-like pectoral and pelvic fins for clinging to rocks. Native to fast-flowing Asian mountain streams with high oxygen. Peaceful, specialized, and requiring cooler water with strong current.',

  skunkBotia:
    'A small, active loach with pale pinkish-cream body and bold black stripe running from nose tip along spine. Native to Mekong, Chao Phraya, and Mae Klong river basins. Semi-aggressive snail-eaters requiring groups of 5+.',

  bengalLoach:
    'A striking medium loach with goldish-olive body adorned with 8-10 thick vertical dark bands. Native to Brahmaputra and Ganges river drainages in northern India, Bangladesh, and Bhutan. Semi-aggressive, active, and excellent snail-eaters.',

  polkaDotLoach:
    'A beautiful medium loach with yellowish-orange body covered in distinctive dark brown-black polka dots. Native to Ataran River basin headwaters in Myanmar. Social, active, and popular but requiring pristine water conditions.',

  horsefaceLoach:
    'An elongated bottom-dwelling loach with extended snout resembling a horse\'s face. Native to Southeast Asian river systems including Thailand. Peaceful, nocturnal burrowers requiring deep soft sand substrate.',

  reticulatedHillstreamLoach:
    'A specialized small loach with flattened body, intricate reticulated pattern, and ventral sucker adapted for fast-flowing waters. Native to fast-moving hillstreams in Southeast Asia. Peaceful algae-eaters requiring very specific conditions.',

  orangeFinnedLoach:
    'A large, boisterous loach with blue-gray body and distinctive bright orange-red fins. Native to rivers of Thailand and nearby Southeast Asian countries. Semi-aggressive, territorial, and very active with excellent snail-eating abilities.',

  // ============================================
  // PLECOS & ALGAE EATERS
  // ============================================
  bristlenosePleco:
    'A compact algae-eating catfish distinguished by distinctive bristle-like appendages on the head. Native to South American rivers and Panama. Hardy, peaceful, and nocturnal, these efficient algae consumers stay significantly smaller than common plecos.',

  commonPleco:
    'A large, armored catfish that can grow 12-24 inches with mottled brown pattern and powerful sucker mouth. Native to South American rivers and streams. Peaceful but massive and producing enormous waste, often outgrowing home aquariums.',

  rubberLipPleco:
    'A medium-sized algae-eating pleco with mottled brown pattern and distinctive rubber-lipped sucker mouth. Native to Venezuelan river systems. Peaceful, nocturnal, and hardy, these efficient algae eaters remain manageable throughout their lives.',

  clownPleco:
    'A small, colorful pleco with bold orange and black banding pattern. Native to Venezuelan river systems. Peaceful, wood-eating, and ideal for smaller tanks unlike most plecos.',

  twigCatfish:
    'An extremely elongated catfish with stick-like appearance perfect for camouflage among driftwood. Native to South American rivers and streams. Peaceful, delicate, and requiring pristine water quality with high oxygen.',

  chineseAlgaeEater:
    'An elongated bottom-dweller with sucker mouth and golden-brown body. Native to Southeast Asian rivers and streams. Peaceful when young but increasingly territorial and aggressive with age, losing interest in algae as adults.',

  siameseAlgaeEater:
    'An elongated, streamlined fish with horizontal black stripe running from nose to tail tip. Native to Southeast Asian rivers and streams. Peaceful when young but potentially territorial with age, effectively controlling black beard and hair algae.',

  royalPleco:
    'A large, impressive pleco with distinctive patterning of gray-brown body overlaid with yellow-tan lines forming intricate maze-like pattern. Native to Orinoco and Amazon river basins. Peaceful wood-eaters requiring driftwood as essential dietary component.',

  goldNuggetPleco:
    'A stunning medium-sized pleco with dark brown-black body covered in bright yellow-gold spots. Native to Xingu River and nearby tributaries in Brazil. Territorial, shy, and expensive specialty pleco requiring excellent water quality.',

  // ============================================
  // OTHER CATFISH
  // ============================================
  otocinclus:
    'A tiny algae-eating catfish with slender body and sucker mouth. Native to South American streams and rivers. Peaceful, social, and sensitive to water quality, these delicate schooling fish thrive in groups of 6+.',

  pictusCatfish:
    'A sleek, active catfish with silver body covered in black spots and extremely long white barbels. Native to South American rivers including the Amazon and Orinoco basins. Peaceful but predatory toward very small fish.',

  glassCatfish:
    'A transparent, ghostly catfish where internal organs and skeleton are clearly visible through translucent body. Native to Southeast Asian rivers in Thailand and Malaysia. Peaceful, timid, and extremely sensitive to water quality.',

  upsideDownCatfish:
    'A unique small catfish that habitually swims inverted with belly facing upward. Native to Central African rivers and streams including the Congo basin. Peaceful, nocturnal, and social, displaying unusual swimming behavior.',

  stripedRaphaelCatfish:
    'A robust, nocturnal catfish with distinctive white stripes on dark body and strong defensive pectoral spines. Native to Amazon and Orinoco River basins. Peaceful with similarly-sized fish and extremely hardy, producing audible croaking sounds when disturbed.',

  dwarfPetricola:
    'A small, active catfish with white body covered in black spots. Native to Lake Tanganyika rocky habitats in Africa. Peaceful, social, and requiring hard, alkaline water, much smaller than most synodontis species.',

  whiptailCatfish:
    'An elongated peaceful catfish with extremely slim body, extended whip-like tail extension, and armored plating. Native to rivers and streams throughout South America. Peaceful algae-eaters and aufwuchs grazers requiring mature tanks with driftwood.',

  spottedRafaelCatfish:
    'A hardy armored catfish with dark brown-black body covered in white-cream spots and strong pectoral spines. Native to rivers and flooded forests of Amazon and Orinoco basins. Peaceful, nocturnal, and capable of vocalizing.',

  talkingCatfish:
    'A peaceful armored catfish with brown mottled body and ability to produce audible sounds by grinding pectoral fin spines. Native to rivers and flooded forests throughout Amazon basin. Nocturnal, shy, and active scavengers at night.',

  banjoCatfish:
    'A cryptic bottom-dwelling catfish with extremely flattened guitar/banjo-shaped body and mottled brown coloration for camouflage. Native to rivers and slow-moving waters throughout South America. Peaceful, sedentary, and masters of camouflage.',

  featherffinSqueaker:
    'A peaceful African catfish with dark body, white spots, and dramatically elongated feather-like dorsal fin. Native to rivers and lakes throughout Central Africa including Congo basin. Peaceful, nocturnal, and capable of vocalizing.',

  // ============================================
  // ODDBALL FISH
  // ============================================
  elephantNoseFish:
    'An unusual fish with elongated chin extension used for electroreception to navigate and find food. Native to West and Central African rivers including Congo basin. Peaceful, intelligent, and extremely sensitive requiring pristine water.',

  africaButterflyFish:
    'A predatory surface-dwelling species with large, wing-like pectoral fins resembling a butterfly. Native to West and Central African slow-moving rivers and lakes. Peaceful toward similarly-sized fish but highly predatory toward anything small enough to swallow.',

  ropeFish:
    'An elongated, primitive fish with rope-like body, primitive lungs, and ability to breathe atmospheric air. Native to West and Central African slow-moving rivers and floodplains. Peaceful, nocturnal, and escape artists requiring tight-fitting lids.',

  senegalBichir:
    'A primitive, prehistoric fish with elongated body, armored ganoid scales, and primitive lungs for breathing air. Native to West African rivers and floodplains. Peaceful with similarly-sized fish but will eat anything small enough to swallow.',

  hatchetfish:
    'A uniquely shaped surface-dwelling fish with deep, hatchet-like body and wing-like pectoral fins. Native to South American Amazon basin tributaries. Peaceful, timid, and exceptional jumpers requiring tight-fitting lids.',

  rainbowShark:
    'A semi-aggressive freshwater shark with dark body and bright orange-red fins. Native to Southeast Asian rivers in Thailand. Territorial and aggressive toward similar-shaped fish, especially other rainbow sharks.',

  balaShark:
    'A large, active cyprinid with sleek silver body and black-edged fins creating shark-like appearance. Native to rivers and streams in Southeast Asia. Peaceful, social jumpers requiring very large tanks and groups of 5+.',

  blackShark:
    'A territorial bottom-dwelling cyprinid with velvety black body and vibrant orange-red tail and fins. Native to streams and rivers in Thailand. Highly territorial, aggressive toward similar species, requiring large individual territories.',

  iridescemtShark:
    'A massive catfish with silvery-iridescent body that loses shimmer with age and shark-like appearance. Native to Mekong and Chao Phraya river basins. Peaceful, nervous, fast-swimming giants unsuitable for home aquariums.',

  ornateBichir:
    'A prehistoric-looking predator with armored elongated body, distinctive dorsal finlets, and intricate spotted pattern. Native to rivers and floodplains throughout West and Central Africa. Peaceful predators with primitive air-breathing ability.',

  violetGoby:
    'An eel-like peaceful goby with purple-gray coloration and intimidating large jaws despite gentle nature. Native to brackish coastal waters of southeastern United States and Central America. Peaceful filter-feeding burrowers requiring brackish water.',

  indianGlassfish:
    'A small, transparent fish with clear body showing internal organs and skeleton. Native to brackish and fresh waters throughout India. Peaceful, fragile schoolers requiring brackish water for best health.',

  archerFish:
    'A fascinating surface-dwelling predator with compressed silver body and ability to "shoot" water at prey above water surface. Native to brackish mangrove swamps and river mouths throughout Southeast Asia. Semi-aggressive specialized hunters.',

  leafFish:
    'A master of camouflage with leaf-shaped flattened body mimicking dead leaves including stem-like lower jaw extension. Native to rivers and streams throughout Amazon basin. Sedentary ambush predators requiring live foods.',

  // ============================================
  // KILLIFISH
  // ============================================
  americanFlagfish:
    'A hardy colorful killifish with males displaying red, white, and blue flag-like coloration pattern. Native to Florida peninsula in United States. Semi-aggressive algae-eaters unusual among killifish, tolerating cooler temperatures.',

  goldenWonderKillifish:
    'A peaceful elongated killifish with brilliant golden-yellow body and spotted pattern. Native to India and Sri Lanka. Hardy, peaceful jumpers requiring tight-fitting lids, accepting varied foods more readily than most killifish.',

  gardneriKillifish:
    'A colorful annual killifish with males displaying brilliant blue body, red spots, and yellow-edged fins. Native to West Africa. Annual species with fascinating accelerated lifecycle completing full life in one year.',

  clownKillifish:
    'A tiny peaceful killifish with cream body and distinctive black-and-white striped tail resembling a rocket. Native to slow-moving streams and swamps in West Africa. Peaceful nano surface-dwellers perfect for planted nano tanks.',

  steelBlueKillifish:
    'A stunning semi-annual killifish with males displaying metallic steel-blue body and red-orange fins. Native to West Africa. Semi-annual species with 6-12 month lifecycle producing eggs requiring partial dry incubation.',

  // ============================================
  // SHRIMP & INVERTEBRATES
  // ============================================
  cherryShrimp:
    'A small, colorful freshwater shrimp with selective breeding producing red, orange, yellow, and blue varieties. Native to Taiwanese streams (wild-type brown). Peaceful, prolific, and extremely hardy.',

  amanoShrimp:
    'A large, transparent freshwater shrimp with distinctive dotted or dashed stripe pattern along sides. Native to Japanese streams and rivers. Peaceful, industrious, and exceptional algae eaters consuming hair algae and debris.',

  ghostShrimp:
    'A transparent freshwater shrimp with nearly invisible body showing internal organs. Native to North American rivers and streams. Peaceful, hardy, and excellent scavengers with short lifespans.',

  bambooShrimp:
    'A large freshwater shrimp distinguished by unique filter-feeding behavior using specialized fan-like appendages. Native to fast-flowing streams and rivers of Southeast Asia. Peaceful and fascinating to observe, requiring strong water circulation.',

  singaporeShrimp:
    'A large filter-feeding shrimp with fan-like appendages for capturing food from water current. Native to Southeast Asian streams and rivers. Peaceful, entirely harmless to fish and plants, requiring strong current for feeding.',

  mysterySnail:
    'A large, colorful freshwater snail with shells available in gold, blue, purple, and ivory varieties. Native to South American rivers and wetlands. Hardy, peaceful, and safe with fish and plants.',

  neriteSnail:
    'A small, beautifully patterned algae-eating snail with varieties including zebra, tiger, and horned patterns. Native to coastal streams and estuaries. Peaceful, hardy, and exceptional algae eaters that cannot reproduce in freshwater.',

  ramshornSnail:
    'A common freshwater snail with distinctive spiral shell resembling a ram\'s horn. Native to various worldwide locations. Peaceful, prolific, and controversial due to rapid reproduction.',

  africanDwarfFrog:
    'A fully aquatic frog with mottled olive-brown coloration and webbed feet. Native to Central African rivers and pools in Congo basin. Peaceful, social, and entirely aquatic, surfacing periodically to gulp air.',
};

// Export for use by glossary-generator.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = fishDescriptions;
}
