// ============================================================================
// FISH DESCRIPTIONS - Curated Content
// ============================================================================
// This file contains researched, high-quality descriptions for fish species.
// Descriptions are merged with fish-data.js attributes by glossary-generator.js
//
// Add curated descriptions here as key-value pairs.
// Key must match the key in fish-data.js
// ============================================================================

const fishDescriptions = {
    // Core species
    neonTetra: 'A small, peaceful freshwater fish known for its bright blue and red coloration. Native to South American blackwater streams, they thrive in schools of 6+ and display stunning iridescent colors under proper lighting. Perfect for community tanks with soft, acidic water.',

    bettaFish: 'A colorful labyrinth fish known for its flowing fins and territorial behavior toward other males. Can breathe atmospheric air from the surface using their labyrinth organ. Prefers warm water (76-82°F) and does best in filtered, heated tanks with gentle flow.',

    corydoras: 'Bottom-dwelling catfish that help keep substrate clean through their constant foraging behavior. Social fish that should be kept in groups of 6+ for proper wellbeing. Very peaceful and great for community tanks, with dozens of species available in various patterns and colors.',

    // Researched batch 1-10
    angelfish: 'Distinctive triangular-shaped cichlids with long, flowing fins and natural striping patterns. Peaceful when not mating but form territorial monogamous pairs during breeding in vegetation-rich environments. Can live 7+ years in well-maintained aquariums with warm water (75-86°F).',

    pearlDanio: 'Iridescent purple-bodied fish with striking orange lateral stripe and neon eyes, growing 2.4-2.8 inches. Active shoaling species that prefer cooler tropical temperatures and thrive in groups of six or more. Hardy and adaptable to various conditions (73-77°F).',

    celestialPearlDanio: 'Tiny peaceful nano fish with dark bodies scattered with golden spots and bright red-orange fins with black stripes. Males spar with rivals and court females; they prefer densely vegetated shallow waters. Recently discovered species from Southeast Asian hill streams.',

    guppy: 'Colorful livebearer with males displaying vibrant flowing fins while females are larger and less colorful. Active and peaceful, they thrive in planted tanks with vegetation and prefer moderate warmth (72-82°F). Hardy with 2-3 year lifespan and suitable for beginners.',

    molly: 'Colorful livebearer with flattened body and varied fin shapes, available in 8+ color morphs from black to red. Active and sociable but best kept mostly female to prevent harassment. Hardy and prefer warm tropical water (75-82°F) with dense vegetation.',

    platy: 'Small peaceful livebearer available in 130+ color variations including Mickey Mouse and sunburst patterns. Males smaller with pointed anal fins; females rounder and larger. Very hardy and undemanding, thriving in community tanks with 3-4 year lifespan (72-82°F).',

    swordtail: 'Named for males\' distinctive elongated lower tail lobe resembling a sword, available in 50+ color morphs. Peaceful and active swimmers preferring heavily vegetated environments. Hardy adaptable livebearers with 3-5 year lifespan, best with 2+ females per male.',

    endlersLivebearer: 'Tiny peaceful livebearer with males displaying striking metallic patterns in green, orange, blue, and yellow. Active schooling fish where males constantly court females with elaborate displays. Very easy breeders producing live fry every 23-30 days in community tanks.',

    whiteCloudMinnow: 'Small hardy minnow with greenish-bronze body, iridescent blue stripe, and red fins reaching 1.5 inches. Peaceful shoaling fish thriving in groups of five or more with improved color and confidence. Remarkably cold-hardy, surviving 41°F and thriving at 65-77°F.',

    cardinalTetra: 'Small peaceful tetra with striking iridescent blue stripe running nose to tail and bright red band below. Must be kept in schools of eight or more to show confidence and vibrant coloration. Sensitive to water chemistry changes, preferring slightly acidic water (75-80°F).',

    // Researched batch 51-100
    odessaBarb: 'The Odessa Barb is a stunning barb with vibrant red coloring and dark stripes, making it one of the most visually striking barbs available. These active swimmers prefer to school with others and do well in planted tanks with moderate water flow. They\'re generally hardy and good for intermediate aquarists.',

    denisonBarb: 'Denison Barbs are large, impressive fish featuring striking red and black markings that make them highly sought after by aquarists. They require spacious tanks, good water movement, and thrive in groups of six or more. These fish are semi-aggressive and need careful tankmate selection due to their size and temperament.',

    fiveBandedBarb: 'The Five-Banded Barb displays five distinctive dark vertical bands across its golden-yellow body, creating a beautiful striped pattern. These peaceful schooling fish are ideal for planted community tanks and do well in groups of 8-12 individuals. They prefer slightly acidic water and enjoy areas with dense vegetation for security.',

    boesmansRainbowfish: 'Boeseman\'s Rainbowfish is a colorful species featuring blue-green coloring with red and yellow bands on its body and fins. They\'re peaceful schooling fish that prefer slightly acidic water and benefit from group living. These fish are hardy and adapt well to planted community tanks with moderate care requirements.',

    dwarfNeonRainbowfish: 'Dwarf Neon Rainbowfish are small, peaceful fish with subtle blue, red, and yellow coloring that become more vibrant under good lighting. They\'re perfect for nano and planted tanks, schooling peacefully in groups of 8-12. These hardy fish are excellent community inhabitants for intermediate aquarists seeking colorful, active swimmers.',

    turquoiseRainbowfish: 'Turquoise Rainbowfish display stunning turquoise-blue coloring with yellow-orange accents, becoming more intense with age and proper care. They\'re peaceful, active schooling fish that prefer larger tanks with good water movement and stable parameters. These fish are moderately hardy and create impressive visual displays in mature aquascapes.',

    redRainbowfish: 'Red Rainbowfish are vibrant fish featuring brilliant red-orange coloring throughout their bodies, with intensely colored dorsal and anal fins. These peaceful schoolers thrive in groups and prefer tanks with plenty of swimming space and moderate water flow. They do well in planted tanks and are relatively hardy for experienced aquarists.',

    threadfinRainbowfish: 'Threadfin Rainbowfish are delicate, peaceful fish with slender bodies and elegant thread-like fin extensions. They\'re ideal for planted nano tanks, schooling in groups of 6-8, and prefer soft, slightly acidic water. These gentle fish are sensitive to water quality changes and require careful acclimation and stable tank conditions.',

    exclamationPointRasbora: 'Exclamation Point Rasboras are tiny, peaceful fish featuring dark bodies with a distinctive bright red spot and tail stripe resembling an exclamation mark. They thrive in densely planted nano tanks in groups of 10-15, creating dazzling visual effects. These fish are excellent for shrimp tanks and micro community setups with stable water conditions.',

    greenKubotaiRasbora: 'Green Kubotai Rasboras are small, peaceful fish with green-bronze coloring and active schooling behavior. They prefer densely planted tanks with soft substrate and thrive in groups of 8-12. These hardy nano fish are perfect for planted community tanks and do well alongside invertebrates like shrimp.',

    balloonMolly: 'Balloon Mollies are peaceful, hardy livebearers with balloon-shaped bodies derived from selective breeding of standard Mollies. They\'re versatile in brackish and freshwater tanks, though they prefer slightly higher pH and salinity for optimal health. These easy-care fish are excellent for beginners and community tanks.',

    variatusPlaty: 'Variatus Platies are colorful, hardy livebearers featuring variable coloration including yellow, red, and blue patterns. They\'re peaceful, easy to care for, and produce readily in community tanks, making them excellent for beginners. These adaptable fish do well in various water conditions and are perfect starter fish.',

    blackMolly: 'Black Mollies are melanistic variants of the Molly, displaying sleek black coloring from selective breeding. They\'re peaceful, hardy livebearers that do well in brackish or freshwater with neutral to slightly alkaline pH. These easy-care fish are prolific breeders and good community inhabitants for intermediate aquarists.',

    leastKillifish: 'Least Killifish are the smallest livebearing fish, with adults measuring just one inch long, making them ideal for nano tanks. These peaceful, colorful fish prefer densely planted setups and do well in small groups or pairs. They\'re hardy and excellent for shrimp tanks, though they require stable conditions and quality food.',

    threeSpotGourami: 'Three Spot Gouramis are labyrinth fish featuring blue coloring with three dark spots and aggressive territorial behavior toward other males. They\'re hardy and adaptable, doing well in planted tanks with subdued lighting and plenty of hiding spaces. Males are highly territorial; females are more peaceful and suitable for community settings.',

    chocolateGourami: 'Chocolate Gouramis are shy, peaceful labyrinth fish displaying brown coloring with attractive stripe patterns. They require heavily planted tanks, warm water, and soft substrate to thrive, making them challenging for beginners. These fish are sensitive to water quality and do best in established tanks with gentle tankmates.',

    paradiseFish: 'Paradise Fish are beautiful labyrinth fish with vibrant red and blue coloring, but display aggressive territorial behavior toward other males. They\'re hardy and adaptable to various conditions, thriving in planted tanks with cover. These fish are excellent for experienced aquarists seeking single-specimen displays in smaller tanks.',

    peacefulBetta: 'Peaceful Bettas are less aggressive than Siamese Fighting Fish, displaying beautiful coloration without the extreme male aggression. They\'re still territorial and require individual tanks or very carefully selected community setups. These hardy fish make excellent solo specimens and are suitable for intermediate aquarists.',

    kribensis: 'Kribensis are stunning small cichlids featuring red bellies and colorful body patterns, with distinct gender dimorphism. They\'re semi-aggressive and pairs should be kept together in planted tanks with caves for breeding. These hardy fish are good for intermediate aquarists and add interesting breeding behavior to established tanks.',

    bolivianRam: 'Bolivian Rams are peaceful dwarf cichlids with metallic gold coloring and striking pink and black markings. They\'re less aggressive than German Rams and do well in planted community tanks with soft substrate. These moderately hardy fish thrive in small groups and add peaceful activity to well-established tanks.',

    cockatooCichlid: 'Cockatoo Dwarf Cichlids are beautiful small cichlids with yellow bodies and red-tipped dorsal fins resembling a cockatoo\'s crest. They\'re semi-aggressive during breeding and prefer established, planted tanks with hiding spots. These moderately hardy fish make excellent additions to medium community tanks and display interesting behaviors.',

    electricBlueAcara: 'Electric Blue Acaras are stunning cichlids displaying brilliant electric blue coloring throughout their bodies and fins. They\'re semi-aggressive and require larger tanks with plants and hiding spaces for territorial behavior. These moderately hardy fish are excellent for experienced aquarists seeking dramatic, colorful centerpieces.',

    firemouthCichlid: 'Firemouth Cichlids are named for their vibrant red coloring on their mouths and throats, contrasted with blue gill covers. They\'re aggressive during breeding and territorial with other fish, but remain peaceful in established tanks with ample space. These hardy fish make excellent centerpieces for medium to large community tanks.',

    convictCichlid: 'Convict Cichlids are hardy, aggressive fish with striking black and white vertical stripe patterns and high breeding tendency. They\'re extremely hardy and adaptable but require careful tankmate selection due to aggressive behavior and spawning activity. These fish are excellent for experienced aquarists and educational purposes.',

    africanButterflyFish: 'African Butterfly Cichlids are small, peaceful, and attractive cichlids with elaborate courtship displays and pair bonding. They\'re semi-aggressive during breeding but generally peaceful with compatible tankmates in established tanks. These hardy fish are suitable for intermediate aquarists and add interesting behavioral displays.',

    discus: 'Discus fish are highly prized for their round, flattened body shape and intricate color patterns in various morphs. They\'re peaceful but require pristine water conditions, frequent water changes, and warm temperatures for optimal health. These challenging fish are best kept by experienced aquarists in larger tanks with compatible peaceful tankmates.',

    yoyoLoach: 'Yoyo Loaches are active, playful bottom-dwellers featuring spotted patterns resembling Y-O-Y-O markings on their bodies. They\'re semi-aggressive and may harass smaller fish or each other, requiring careful group management. These hardy, entertaining fish do well in larger tanks with caves and hiding spaces.',

    dwarfChainLoach: 'Dwarf Chain Loaches are small, peaceful loaches displaying chain-like patterns and active schooling behavior. They require groups of 8-12, soft substrate, and plenty of hiding places to feel secure. These hardy fish are excellent for established community tanks and enjoy foraging in sand substrates.',

    zebraLoach: 'Zebra Loaches feature distinctive horizontal stripes and peaceful, schooling behavior in groups of 6-8 or more. They prefer soft substrate, caves, and dim lighting, becoming active during dawn and dusk hours. These hardy fish are excellent for larger community tanks and display interesting social hierarchies.',

    clownLoach: 'Clown Loaches are large, colorful loaches with striking orange and black banding and playful, social behavior. They reach substantial sizes requiring large tanks and do best in groups, creating entertaining displays. These hardy fish are excellent centerpieces but require experienced care and long-term commitment.',

    hillstreamLoach: 'Hillstream Loaches have flattened bodies adapted to fast-flowing waters, featuring beautiful markings and peaceful temperaments. They require high water flow, strong aeration, and cool temperatures, thriving in specialized hillstream setups. These unique fish are excellent for experienced aquarists with appropriate tank conditions.',

    pepperedCory: 'Peppered Corydoras are peaceful bottom-dwellers with spotted gray coloring, playing crucial cleanup roles in established tanks. They require soft substrate for foraging, require groups of 6 or more, and prefer cool to moderate water temperatures. These hardy fish are excellent for planted community tanks and help maintain substrate health.',

    sterbaiCory: 'Sterbai Corydoras display vibrant orange spots and stripes with peaceful, industrious behavior that benefits tank substrate. They prefer soft substrate, moderate warmth, and groups of 6-12 for optimal social behavior. These hardy, colorful fish are excellent for planted community tanks and establish well in various setups.',

    juliiCory: 'Julii Corydoras feature intricate spotting patterns and peaceful, active foraging behavior along tank substrates. They require soft substrate, groups of 6 or more, and appreciate gentle water flow. These hardy fish are excellent for established community tanks and help maintain clean, healthy substrates.',

    albinoCory: 'Albino Corydoras are pale yellow variants displaying peaceful temperament and valuable cleanup behavior in community tanks. They require soft substrate for barbel health, groups of 6-12, and moderate water temperatures. These hardy, visible variants are excellent for monitoring water quality and substrate conditions.',

    saltAndPepperCory: 'Salt and Pepper Corydoras are small, peaceful fish with spotted gray coloring, thriving in groups of 6-12 in soft substrate. They actively forage, helping maintain substrate health and cleanliness in established tanks. These hardy, easy-care fish are perfect for planted community tanks and nano setups.',

    chineseAlgaeEater: 'Chinese Algae Eaters are efficient algae consumers when young, but become aggressive and territorial as they mature. They\'re hardy and adaptable but may damage plants and harass peaceful fish despite their initial usefulness. These fish require careful monitoring and are best reserved for larger tanks with experienced aquarists.',

    stripedRaphaelCatfish: 'Striped Raphael Catfish are nocturnal, armored catfish with striped patterns and peaceful temperament despite their intimidating appearance. They\'re hardy, hide during the day in caves, and emerge at night to forage. These interesting fish are excellent for establishing nighttime activity and adding diversity to mature tanks.',

    glassCatfish: 'Glass Catfish are transparent fish featuring visible skeletons and internal organs, displaying ethereal, peaceful behavior. They\'re schooling fish that prefer groups of 6-8, stable water conditions, and soft substrate. These delicate-looking fish are sensitive to water quality and require gentle handling and acclimation.',

    upsideDownCatfish: 'Upside-Down Catfish display unique behavior of swimming upside-down, featuring spotted patterns and peaceful temperament. They\'re nocturnal bottom-dwellers preferring caves, dim lighting, and stable water parameters. These hardy, entertaining fish add behavioral interest and nocturnal activity to established community tanks.',

    commonPleco: 'Common Plecos are large suckermouth catfish growing to substantial sizes and displaying nocturnal, bottom-dwelling behavior. They\'re hardy and efficient algae eaters when young, but become less useful and more destructive as they grow. These fish require very large tanks and are best reserved for experienced aquarists.',

    rubberLipPleco: 'Rubber Lip Plecos are smaller alternatives to Common Plecos, featuring distinctive thick lips and peaceful behavior. They\'re effective algae eaters, nocturnal foragers, and remain manageable in larger community tanks throughout their lives. These hardy, helpful fish are excellent additions to established tanks with moderate to large sizes.',

    bambooShrimp: 'Bamboo Shrimp are large, peaceful filter-feeders displaying impressive coloring and gentle temperament in community tanks. They require strong water flow for feeding success and do well in groups, creating striking visual displays. These hardy freshwater shrimp are excellent for established tanks with stable conditions and adequate feeding.',

    singaporeShrimp: 'Singapore Shrimp are small, peaceful creatures displaying subtle coloring and excellent cleanup behavior in community tanks. They require stable water conditions and do well in groups, contributing to overall tank cleanliness. These hardy freshwater shrimp are perfect for planted tanks and aquascapes with fine substrates.',

    ramshornSnail: 'Ramshorn Snails are colorful, peaceful gastropods displaying spiral shells in various colors from red to brown. They\'re excellent algae eaters, reproduce readily in warm conditions, and require calcium for healthy shell development. These hardy snails are beneficial additions to most aquariums, though population control may be necessary.',

    africanDwarfFrog: 'African Dwarf Frogs are tiny, peaceful amphibians displaying aquatic behavior and unique personality in planted tanks. They\'re carnivorous bottom-dwellers requiring groups of 2-3, soft substrate, and gentle tankmates. These fascinating creatures add diversity and interesting nocturnal behavior to established community tanks.',

    emperorTetra: 'Emperor Tetras are striking fish displaying distinctive black markings and peaceful schooling behavior in groups of 8-12. They prefer planted tanks with subdued lighting that highlights their coloration and black-tipped dorsal fins. These hardy, beautiful fish are excellent for established community tanks with moderate care requirements.',

    flameTetra: 'Flame Tetras display vibrant red coloring with contrasting black markings and peaceful schooling behavior in groups of 10-15. They prefer planted tanks with soft water and do well alongside other peaceful community fish. These hardy, colorful fish are excellent for intermediate aquarists seeking dramatic red-colored schooling displays.',

    pristellaTetra: 'Pristella Tetras feature black and white striped dorsal and anal fins creating elegant, distinctive patterns. They\'re peaceful schooling fish thriving in groups of 8-12 in planted community tanks. These hardy, visually interesting fish are excellent for established tanks and pair well with other peaceful community species.',

    blackPhantomTetra: 'Black Phantom Tetras are peaceful schooling fish with dark coloring and distinctive black dorsal fins creating dramatic displays. They thrive in groups of 8-12 in planted tanks with subdued lighting. These hardy fish are excellent for community tanks and display interesting schooling behavior with proper group sizes.'
};

// Export for use by glossary-generator.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = fishDescriptions;
}
