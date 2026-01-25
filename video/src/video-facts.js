/**
 * Curated Video Facts - 3-Clue "Guess the Fish" Format
 *
 * Each entry has:
 * - clues: Array of 3 hints (hard → easy)
 *   1. Obscure or technical fact
 *   2. Notable characteristic or behavior
 *   3. Most recognizable/famous trait (the giveaway)
 * - reveal: The interesting summary shown after species name
 */

export const videoFacts = {
  // === TRULY UNIQUE ABILITIES ===

  blindCaveTetra: {
    clues: [
      "This fish can store 4x more energy as fat than its surface-dwelling relatives",
      "Its babies are born with fully developed eyes that disappear within weeks",
      "This pink-white tetra navigates Mexican caves using water pressure—without any eyes"
    ],
    reveal: "Born with fully functional eyes that disappear within weeks, this Mexican cave-dweller traded vision for extraordinary water-pressure sensing and the ability to store four times more body fat than its surface relatives. These adaptations are essential for life in dark, food-scarce underground pools.",
  },

  archerFish: {
    clues: [
      "This fish has different color vision in the top and bottom halves of its retina",
      "Juveniles learn to hunt by watching experienced group members without practicing",
      "Can knock insects off branches up to 10 feet away by spitting jets of water"
    ],
    reveal: "Nature's sharpshooter compensates for light refraction between air and water to knock insects off branches up to 10 feet away, using a tongue-and-palate \"gun barrel\" that can fire seven shots per mouthful. Young fish learn this skill by watching experienced hunters without practicing themselves.",
  },

  peaPuffer: {
    clues: [
      "Unlike other puffers, this fish's teeth grow slowly enough that it never needs them trimmed",
      "Produces tetrodotoxin—the same neurotoxin found in blue-ringed octopuses",
      "At only one inch long, it holds the title of the world's smallest pufferfish"
    ],
    reveal: "The world's smallest pufferfish at just one inch long packs the same deadly tetrodotoxin found in blue-ringed octopuses—over 1,000 times more lethal than cyanide. Its teeth grow slowly enough that unlike larger puffers, it never needs them trimmed.",
  },

  elephantNoseFish: {
    clues: [
      "This fish is so sensitive to pollution that it's used to monitor water quality in German cities",
      "Ancient Egyptians worshipped this fish family at the temples of Oxyrhynchus",
      "Generates electric pulses through a trunk-like organ to 'see' in murky water"
    ],
    reveal: "Worshipped by ancient Egyptians and now used to monitor municipal water quality in Germany, this African fish generates electric pulses to create a 3D map of its surroundings. It is one of the few animals with both excellent eyesight and electrolocation, switching between them like humans switch between sight and touch.",
  },

  sparklingGourami: {
    clues: [
      "Females of this species 'purr' to initiate spawning - it is the only fish where females vocalize for courtship",
      "Males engage in hours-long vocal arguments, circling and croaking without touching",
      "Makes croaking sounds loud enough to hear from across the room"
    ],
    reveal: "This tiny iridescent fish produces surprisingly loud croaking sounds using specialized pectoral fin tendons. These sounds are audible from across a room, and it is the only known fish species where females \"purr\" to initiate courtship.",
  },

  // === INCREDIBLE PARENTING ===

  chocolateGourami: {
    clues: [
      "2024 research revealed decades of sex misidentification explained conflicting breeding reports",
      "Shares uniquely pear-shaped eggs with only one other gourami genus",
      "Unlike most gouramis, this blackwater species is a mouthbrooder, not a bubble nester"
    ],
    reveal: "For decades scientists argued whether this delicate blackwater gourami was a bubble-nester or mouthbrooder, with 2024 research finally revealing that what everyone thought were \"brooding females\" were actually males, meaning the species was never an exception to male parental care in gouramis after all.",
  },

  discus: {
    clues: [
      "Parents of this species transfer beneficial gut bacteria to fry through skin secretions, like mammalian milk",
      "Forms large social groups of dozens—unusual for American cichlids",
      "Both parents produce a 'milk' from their skin that fry feed on for their first month"
    ],
    reveal: "Called the \"King of the Aquarium,\" both discus parents produce a nutritious skin mucus that fry feed on exclusively for their first month. They transfer beneficial gut bacteria to their young much like mammalian milk, making their parental care more similar to birds and mammals than other fish.",
  },

  frontosaCichlid: {
    clues: [
      "Capturing it alive requires hours of decompression, as this fish lives 60-100 feet deep",
      "Releases mouthbrooded fry at depth rather than shallow water to reduce predation",
      "Develops a prominent fatty 'nuchal hump' on its forehead as it matures"
    ],
    reveal: "Living 60-100 feet deep in Lake Tanganyika, this gentle giant requires hours of careful decompression to be captured alive, and uniquely releases its mouthbrooded fry at depth rather than in shallow water to reduce predation on the vulnerable babies.",
  },

  // === DOG-LIKE INTELLIGENCE ===

  oscar: {
    clues: [
      "When it loses a fight, this species' eyes turn black. They can changes color based on mood",
      "Its tail eyespots may have evolved to deter fin-nipping by piranha",
      "Called 'water dogs' for recognizing owners and being trainable"
    ],
    reveal: "Nicknamed \"water dogs\" for their loyal personalities, Oscars recognize their owners, can be trained to do tricks, and express emotions through color changes—their eyes turn black when they lose a fight, while their tail eyespots may have evolved specifically to deter fin-nipping piranha.",
  },

  giantGourami: {
    clues: [
      "Its lineage split from other gouramis 20-25 million years ago",
      "The only vertebrate with lungs but no trachea",
      "Can reach 31 inches and survive outside water due to primitive lungs"
    ],
    reveal: "The only vertebrate with lungs but no trachea, this 31-inch fish can survive outside water for extended periods and represents an ancient lineage that split from other gouramis 20-25 million years ago—now farmed as food across Asia while intelligent enough to bond with aquarium owners.",
  },

  flowerhornCichlid: {
    clues: [
      "Some specimens have markings resembling Chinese characters—one reportedly showed lottery numbers",
      "Unlike most hybrid fish, this 1990s creation is fertile and can reproduce",
      "Its head hump symbolizes the Chinese God of Longevity in feng shui"
    ],
    reveal: "This fertile hybrid—unusual since most hybrid fish are sterile—was bred in 1990s Malaysia and became a feng shui sensation, with its nuchal hump resembling the Chinese God of Longevity and some specimens bearing side markings that reportedly translated to winning lottery numbers.",
  },

  // === WEIRD AND WONDERFUL ===

  goldenTetra: {
    clues: [
      "Was originally described as a separate species before scientists found the true cause",
      "Captive-bred specimens look dull gray—they lack something found in wild waters",
      "Its metallic gold color comes from guanin deposits triggered by a parasite"
    ],
    reveal: "This tetra's spectacular metallic gold sheen is actually a defense mechanism—guanin deposits triggered by a parasitic skin infection found only in wild waters—which is why captive-bred specimens appear dull gray and were once mistakenly described as a separate species.",
  },

  neonTetra: {
    clues: [
      "Its blue stripe may project 'mirror decoys' onto the water surface to confuse predators",
      "Named after neon signs popular in the 1930s when it was discovered",
      "About 2 million are still sold monthly in the US—and its colors fade gray at night"
    ],
    reveal: "Named after the neon signs popular when it was discovered in the 1930s, this Amazon icon's brilliant blue stripe may serve as a predator-confusing \"mirror decoy\" by reflecting off the water's surface—and two million are still sold monthly in the US alone nearly a century later.",
  },

  xRayTetra: {
    clues: [
      "Has a Weberian apparatus—bones connecting swim bladder to inner ear for exceptional hearing",
      "The only species in its genus, and tolerates slightly brackish water",
      "Its transparent skin reveals its entire skeleton, organs, and muscles"
    ],
    reveal: "The only species in its genus, this see-through fish has a Weberian apparatus—a chain of tiny bones connecting its swim bladder to its inner ear—giving it exceptional hearing to detect predators, while its transparent body helps it vanish among shimmering vegetation.",
  },

  bumblebeeCichlid: {
    clues: [
      "Cleans fish lice from a specific catfish, but betrays the relationship during spawning",
      "Can rapidly shift from yellow-and-black stripes to solid dark brown",
      "Named 'crabro' (Latin for wasp) for its stripes—switches colors to steal catfish eggs"
    ],
    reveal: "This Lake Malawi \"chameleon\" maintains a symbiotic cleaning relationship with the Kampango catfish—removing parasites in its yellow-striped form—but betrays its host by switching to dark camouflage to sneak into spawning caves and devour the catfish's eggs.",
  },

  redZebra: {
    clues: [
      "Orange-red males are only 1% of wild populations—early exporters selectively bred them",
      "Unusually for cichlids, females typically display richer colors than males",
      "Despite its name, wild males are usually blue while females are brown or orange"
    ],
    reveal: "Despite its name, this polymorphic mbuna features blue males and brown females in the wild, with the popular orange-red aquarium strain created by selectively breeding rare \"O morph\" individuals that represent only 1% of natural populations—and unusually, females typically outshine males in color intensity.",
  },

  // === HISTORY AND ORIGINS ===

  bettaFish: {
    clues: [
      "First domesticated at least 1,000 years ago—among the earliest fish bred by humans",
      "King Rama III of Thailand helped introduce it to the West in the 1800s",
      "Males build bubble nests and guard eggs—known as the 'Siamese fighting fish'"
    ],
    reveal: "Domesticated in Thailand at least 1,000 years ago—among the earliest fish ever bred by humans—bettas were originally raised for organized fighting matches before King Rama III helped introduce them to the West, where selective breeding transformed drab wild fish into the \"designer fish of the aquatic world.\"",
  },

  guppy: {
    clues: [
      "Females store sperm and can produce offspring long after a male's death",
      "One of the first vertebrates to demonstrate sex-linked inheritance",
      "Called the 'millionfish'—introduced worldwide as mosquito control"
    ],
    reveal: "Called the \"millionfish\" for good reason, female guppies store sperm and can produce offspring long after a male's death, while Trinidad's barrier waterfalls have created natural laboratories where populations above and below evolve dramatically different traits—making this live-bearer one of science's most important models for studying evolution in action.",
  },

  ornateBichir: {
    clues: [
      "When discovered in 1802, scientists couldn't decide if it was a fish or amphibian",
      "Juveniles have external gills like tadpoles that are absorbed as they mature",
      "A 'living fossil' with primitive lungs but no trachea—will drown without surface air"
    ],
    reveal: "A true \"living fossil\" whose relatives swam with dinosaurs 200 million years ago, this fish so confused early scientists that they couldn't decide if it was a fish or amphibian—it has primitive lungs (but no trachea), electroreceptors, fleshy lobe-like fins, and tadpole-like external gills as a juvenile that are absorbed with age.",
  },

  celestialPearlDanio: {
    clues: [
      "Before aquarists discovered it, locals sold it dried as cheap protein food",
      "When first photographed in 2006, hobbyists assumed the images were digitally faked",
      "Originally called 'galaxy rasbora'—its spots resemble a starry night sky"
    ],
    reveal: "When photographs of this Myanmar pond fish surfaced in 2006, hobbyists assumed they were digitally faked—no fish that beautiful could have been overlooked—yet locals had been drying and selling them as cheap protein for years, a can of 500 costing just two British pounds before the aquarium world discovered their galaxy-patterned splendor.",
  },
};

// Get all species keys that have video facts
export const getVideoSpeciesKeys = () => Object.keys(videoFacts);

// Get video fact for a species
export const getVideoFact = (key) => videoFacts[key];

// Check if a species has a video fact
export const hasVideoFact = (key) => key in videoFacts;
