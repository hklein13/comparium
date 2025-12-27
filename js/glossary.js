// ============================================================================
// GLOSSARY MODULE - Firestore-Ready Architecture
// ============================================================================
// This module manages the glossary data and UI.
// Data storage is designed to easily migrate to Firestore.
// ============================================================================

class GlossaryManager {
    constructor() {
        this.currentCategory = null;
        this.searchTerm = '';
        this.glossaryData = this.initializeGlossaryData();
        this.categories = this.initializeCategories();
        
        // Firestore configuration
        this.useFirestore = true; // Enable Firestore data fetching
        this.firestoreCollection = 'glossary'; // Collection name for Firestore
    }

    /**
     * Initialize glossary categories
     * Each category will have its own Firestore subcollection in the future
     */
    initializeCategories() {
        return [
            {
                id: 'species',
                title: 'Species',
                icon: '🐟',
                description: 'Fish species information and care guides',
                imageUrl: null,
                firestoreSubcollection: 'species_entries' // For future Firestore migration
            },
            {
                id: 'diseases',
                title: 'Diseases',
                icon: '🏥',
                description: 'Common fish diseases and treatments',
                imageUrl: null,
                firestoreSubcollection: 'disease_entries'
            },
            {
                id: 'equipment',
                title: 'Equipment',
                icon: '🔧',
                description: 'Aquarium equipment and supplies',
                imageUrl: null,
                firestoreSubcollection: 'equipment_entries'
            },
            {
                id: 'terminology',
                title: 'Terminology',
                icon: '📖',
                description: 'Aquarium terms and definitions',
                imageUrl: null,
                firestoreSubcollection: 'terminology_entries'
            }
        ];
    }

    /**
     * Initialize glossary data structure
     * In the future, this will be loaded from Firestore
     */
    initializeGlossaryData() {
        return {
            species: [
                {
                    id: 'neon-tetra',
                    title: 'Neon Tetra',
                    scientificName: 'Paracheirodon innesi',
                    description: 'A small, peaceful freshwater fish known for its bright blue and red coloration. Native to South American blackwater streams. Perfect for community tanks and schooling behavior.',
                    imageUrl: null,
                    tags: ['Beginner Friendly', 'Schooling Fish', 'Peaceful', 'Small'],
                    category: 'species',
                    author: 'System',
                    created: new Date().toISOString(),
                    // Firestore-ready fields
                    firestoreId: null,
                    userId: null, // Will be populated with Firebase Auth UID
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'betta-fish',
                    title: 'Betta Fish (Siamese Fighting Fish)',
                    scientificName: 'Betta splendens',
                    description: 'A colorful labyrinth fish known for its flowing fins and territorial behavior. Males are aggressive toward other males. Can breathe air from the surface. Prefers warm water (76-82°F).',
                    imageUrl: null,
                    tags: ['Colorful', 'Territorial', 'Labyrinth Fish', 'Easy Care'],
                    category: 'species',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'corydoras-catfish',
                    title: 'Corydoras Catfish',
                    scientificName: 'Corydoras spp.',
                    description: 'Bottom-dwelling catfish that help keep substrate clean. Social fish that should be kept in groups of 6+. Very peaceful and great for community tanks. Multiple species available.',
                    imageUrl: null,
                    tags: ['Bottom Dweller', 'Schooling Fish', 'Peaceful', 'Algae Eater'],
                    category: 'species',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                }
            ],
            diseases: [
                {
                    id: 'ich',
                    title: 'Ich (White Spot Disease)',
                    scientificName: 'Ichthyophthirius multifiliis',
                    description: 'A common parasitic disease that appears as white spots on fish bodies and fins. Caused by stress, poor water quality, or temperature fluctuations. Highly contagious but treatable with medication and temperature increase.',
                    imageUrl: null,
                    tags: ['Parasitic', 'Contagious', 'Treatable', 'Common'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'fin-rot',
                    title: 'Fin Rot',
                    scientificName: 'Various bacterial infections',
                    description: 'Bacterial infection causing fins to appear ragged, torn, or discolored. Often starts at the edges and progresses inward. Caused by poor water quality, stress, or injury. Treat with antibacterial medication and water changes.',
                    imageUrl: null,
                    tags: ['Bacterial', 'Water Quality', 'Treatable', 'Common'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'dropsy',
                    title: 'Dropsy',
                    scientificName: 'Various bacterial infections',
                    description: 'Serious condition where fish appear swollen with protruding scales (pinecone appearance). Usually caused by internal bacterial infection. Difficult to treat; often requires antibiotics and salt baths. Quarantine affected fish immediately.',
                    imageUrl: null,
                    tags: ['Bacterial', 'Serious', 'Difficult to Treat', 'Quarantine'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                }
            ,

                {
                    id: 'columnaris',
                    title: 'Columnaris (Cotton Mouth Disease)',
                    scientificName: 'Flavobacterium columnare',
                    description: 'Bacterial infection appearing as white/gray cottony growths on mouth, fins, and body. Often mistaken for fungus. Symptoms include frayed fins, skin ulcerations, gill necrosis, lethargy, and loss of appetite. Caused by poor water quality, stress, overcrowding, and injury. Treatment involves antibacterial medications (kanamycin, nitrofurazone), improved water quality, salt baths (for scale fish), and quarantine of infected fish. Highly contagious and can be fatal if untreated.',
                    imageUrl: null,
                    tags: ['Bacterial', 'Contagious', 'Serious', 'Treatable', 'Water Quality'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'popeye',
                    title: 'Popeye (Exophthalmia)',
                    scientificName: 'Various bacterial infections',
                    description: 'Swelling and protrusion of one or both eyes caused by fluid buildup behind the eye. Unilateral (one eye) cases usually result from injury or localized infection. Bilateral (both eyes) indicates systemic infection or poor water quality. Symptoms include bulging eyes, cloudy eyes, loss of vision, and lethargy. Caused by poor water quality, bacterial infection, internal parasites, or tuberculosis. Treatment includes water changes, antibacterial medications, Epsom salt baths (1-3 tsp/gallon), and addressing underlying causes. Prognosis is good if treated early.',
                    imageUrl: null,
                    tags: ['Bacterial', 'Water Quality', 'Treatable', 'Symptom'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'mouth-fungus',
                    title: 'Mouth Fungus',
                    scientificName: 'Flavobacterium columnare',
                    description: 'Despite its name, this is a bacterial infection (same as columnaris), not a fungal disease. Appears as white/gray cottony growth around mouth and lips. Symptoms include mouth rot, difficulty eating, white patches, fin deterioration, and behavioral changes. Caused by poor water quality, stress, injuries to mouth area, and weakened immune system. Treatment involves antibacterial medications (kanamycin, tetracycline), improved water conditions, salt baths for scale fish, and isolation of infected fish. Can rapidly spread in community tanks.',
                    imageUrl: null,
                    tags: ['Bacterial', 'Contagious', 'Common', 'Treatable', 'Misidentified'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'fish-tuberculosis',
                    title: 'Tuberculosis (Fish TB/Mycobacteriosis)',
                    scientificName: 'Mycobacterium marinum, M. fortuitum',
                    description: 'Chronic bacterial infection that is difficult to diagnose and treat. Symptoms include wasting despite eating, lethargy, skin lesions, loss of color, skeletal deformities, fin/tail rot, and popeye. Often progresses slowly over months. Caused by Mycobacterium bacteria present in contaminated water, substrate, or infected fish. Highly resistant to treatment; most cases are incurable. Prevention through quarantine and good hygiene is critical. ZOONOTIC WARNING: Can infect humans through open wounds (fish handler\'s disease). Wear gloves when maintaining tanks with suspected cases.',
                    imageUrl: null,
                    tags: ['Bacterial', 'Chronic', 'Difficult to Treat', 'Zoonotic', 'Fatal'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'hemorrhagic-septicemia',
                    title: 'Hemorrhagic Septicemia',
                    scientificName: 'Aeromonas, Pseudomonas, Vibrio species',
                    description: 'Acute bacterial infection causing internal and external bleeding. Symptoms include red streaks in fins and body, bloody patches, bulging eyes, bloating, lethargy, rapid breathing, and sudden death. Fish may have red/bloody eyes and lesions. Caused by poor water quality, stress, overcrowding, and compromised immune systems. Highly contagious. Treatment requires immediate antibiotic therapy (chloramphenicol, tetracycline), aggressive water changes, removal of infected fish, and improved husbandry. Can cause rapid die-offs if not addressed quickly.',
                    imageUrl: null,
                    tags: ['Bacterial', 'Serious', 'Contagious', 'Treatable', 'Acute'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'ulcer-disease',
                    title: 'Ulcer Disease',
                    scientificName: 'Aeromonas salmonicida, A. hydrophila',
                    description: 'Bacterial infection causing open sores and ulcers on the body. Symptoms include red, open wounds, raised scales around lesions, lethargy, loss of appetite, and secondary fungal infections. Ulcers typically start as red spots that develop into deep, crater-like wounds. Caused by Aeromonas bacteria entering through injuries, poor water quality, and stress. Treatment involves antibacterial medications (kanamycin, enrofloxacin), topical treatments for accessible ulcers, improved water quality, and salt baths. Severe cases may require veterinary care. Secondary infections are common.',
                    imageUrl: null,
                    tags: ['Bacterial', 'External', 'Treatable', 'Water Quality', 'Serious'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'velvet-disease',
                    title: 'Velvet Disease (Oodinium)',
                    scientificName: 'Oodinium pillularis',
                    description: 'Parasitic infection causing a golden or rust-colored dust-like coating on fish. Appears as a velvety sheen under light. Symptoms include scratching against objects, clamped fins, rapid breathing, lethargy, loss of appetite, and peeling skin. More deadly than ich if untreated. Caused by Oodinium dinoflagellate parasites. Treatment involves copper-based medications, raising temperature to 82-85°F, darkening the tank (parasites need light), salt baths, and quarantine. Remove carbon from filters during treatment. Highly contagious; treat entire tank.',
                    imageUrl: null,
                    tags: ['Parasitic', 'Contagious', 'Common', 'Treatable', 'Gold Dust'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'anchor-worms',
                    title: 'Anchor Worms',
                    scientificName: 'Lernaea species',
                    description: 'Crustacean parasites that burrow into fish skin, appearing as white/green thread-like worms (3-20mm) protruding from the body. Anchor their heads deep into muscle tissue. Symptoms include visible worms, red inflammation at attachment sites, scratching, lethargy, and secondary bacterial infections. More common in ponds but can occur in aquariums. Treatment involves manual removal with tweezers (followed by antiseptic), antiparasitic medications (potassium permanganate, organophosphates), and treating tank to kill free-swimming larvae. Multiple treatments needed to break lifecycle (2-3 weeks apart).',
                    imageUrl: null,
                    tags: ['Parasitic', 'External', 'Visible', 'Treatable', 'Crustacean'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'fish-lice',
                    title: 'Fish Lice',
                    scientificName: 'Argulus species',
                    description: 'Disc-shaped crustacean parasites (3-10mm) visible to the naked eye, appearing as translucent/green spots on fish. Use suckers to attach and feed on blood. Symptoms include visible lice, scratching, jumping, red inflammation, lethargy, flashing, and secondary infections. Can move between fish. Common in pond fish but can affect aquarium fish. Treatment involves manual removal, antiparasitic medications (potassium permanganate, organophosphates, salt dips), and treating water to kill eggs and juveniles. Quarantine new fish for 2-3 weeks.',
                    imageUrl: null,
                    tags: ['Parasitic', 'External', 'Visible', 'Treatable', 'Crustacean'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'gill-flukes',
                    title: 'Gill Flukes',
                    scientificName: 'Dactylogyrus species',
                    description: 'Microscopic flatworm parasites infesting gills, causing respiratory distress. Symptoms include rapid gill movement, gasping at surface, one or both gill covers held open, mucus production, pale gills, lethargy, and weight loss. Fish may scratch gills against objects. Heavy infestations can be fatal. Caused by Dactylogyrus flukes introduced via contaminated fish, plants, or equipment. Diagnosis requires microscopic examination of gill scraping. Treatment involves antiparasitic medications (praziquantel, formalin), salt baths (for scale fish), improved water quality and oxygenation. May require multiple treatments.',
                    imageUrl: null,
                    tags: ['Parasitic', 'Internal', 'Serious', 'Treatable', 'Microscopic'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'skin-flukes',
                    title: 'Skin Flukes',
                    scientificName: 'Gyrodactylus species',
                    description: 'Microscopic flatworm parasites attaching to skin, fins, and gills. Unlike gill flukes, Gyrodactylus gives live birth and can reproduce without a host. Symptoms include excessive slime coat, cloudy skin, scratching/flashing, torn fins, lethargy, and respiratory distress if gills are affected. Infected areas may appear gray or have a velvety appearance. Highly contagious. Caused by introduction via new fish, plants, or contaminated equipment. Treatment includes antiparasitic medications (praziquantel, formalin, salt baths for 5-30 minutes), and treating entire tank. Can be resistant to treatment; multiple rounds may be needed.',
                    imageUrl: null,
                    tags: ['Parasitic', 'External', 'Microscopic', 'Treatable', 'Contagious'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'camallanus-worms',
                    title: 'Camallanus Worms',
                    scientificName: 'Camallanus species',
                    description: 'Internal roundworm parasites living in the intestines. Red/orange worms (2-20mm) may protrude from anus. Symptoms include visible worms from vent, bloating, weight loss despite eating, stringy white feces, lethargy, and anal redness. Heavy infestations cause intestinal blockage and death. Transmitted through infected live foods (especially copepods) or contaminated fish. Treatment requires deworming medications (levamisole, fenbendazole, praziquantel via food), treating entire tank, and avoiding live foods from untrustworthy sources. Multiple treatments 2-3 weeks apart needed to break lifecycle.',
                    imageUrl: null,
                    tags: ['Parasitic', 'Internal', 'Visible', 'Serious', 'Difficult'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'hexamita',
                    title: 'Hexamita/Hole-in-the-Head',
                    scientificName: 'Hexamita/Spironucleus species',
                    description: 'Parasitic flagellate infection primarily affecting cichlids and other large fish. Symptoms include pitted holes/erosions on head and lateral line, white stringy feces, loss of appetite, weight loss, darkening of color, and lethargy. Holes may ooze and become secondarily infected. Often associated with poor nutrition (vitamin/mineral deficiency) and stress. Treatment involves antiparasitic medications (metronidazole), improved diet with vitamin supplements (especially vitamin C and D), enhanced water quality, and reducing stress. Early treatment is critical; advanced cases may leave permanent scarring.',
                    imageUrl: null,
                    tags: ['Parasitic', 'Internal', 'Chronic', 'Treatable', 'Cichlid Disease'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'chilodonella',
                    title: 'Chilodonella',
                    scientificName: 'Chilodonella cyprini',
                    description: 'Microscopic ciliated protozoan parasite affecting skin and gills. Most problematic in cooler water (50-68°F). Symptoms include gray/white cloudy film on skin, excessive mucus production, respiratory distress, lethargy, scratching, and appetite loss. Gills may appear pale or swollen. Can cause rapid death in heavy infestations, especially in fry and weakened fish. Diagnosis requires microscopic examination. Treatment includes raising water temperature to 78-82°F (if species appropriate), salt baths, antiparasitic medications (formalin, malachite green), and improved water quality. Highly contagious; treat entire system.',
                    imageUrl: null,
                    tags: ['Parasitic', 'External', 'Microscopic', 'Treatable', 'Cold Water'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'saprolegnia',
                    title: 'Saprolegnia (True Fungus)',
                    scientificName: 'Saprolegnia species',
                    description: 'True fungal infection appearing as white, cotton-wool-like growths on skin, fins, gills, and eyes. Usually a secondary infection following injury, parasites, or bacterial disease. Symptoms include fluffy white patches, mat-like growth, lethargy, and difficulty breathing if gills affected. Spores are ubiquitous in water but only infect damaged tissue or stressed fish. Not contagious to healthy fish. Treatment involves antifungal medications (methylene blue, malachite green), salt baths (1 tsp/gallon for freshwater fish), improved water quality, and addressing underlying cause. Gentle removal of fungal mat may help. Protect eggs with methylene blue.',
                    imageUrl: null,
                    tags: ['Fungal', 'Secondary Infection', 'Treatable', 'Cotton-wool', 'Common'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'branchiomycosis',
                    title: 'Branchiomycosis (Gill Rot)',
                    scientificName: 'Branchiomyces species',
                    description: 'Fungal infection specifically targeting gill tissue, causing necrosis and rot. More common in warm water with high organic load. Symptoms include rapid, labored breathing, gasping at surface, gill discoloration (red, then gray/white necrosis), patches of dead gill tissue, lethargy, and sudden death. Gills may have a mottled appearance. Fish essentially suffocate as functional gill tissue is destroyed. Caused by Branchiomyces fungi thriving in warm (77-86°F), oxygen-poor, organically rich water. Treatment is difficult; includes aggressive water changes, lowering temperature if possible, increasing aeration, antifungal medications, and reducing organic load. Mortality rate is high; prevention is key.',
                    imageUrl: null,
                    tags: ['Fungal', 'Serious', 'Gill Disease', 'Difficult to Treat', 'Rare'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'lymphocystis',
                    title: 'Lymphocystis',
                    scientificName: 'Lymphocystivirus',
                    description: 'Viral infection causing cauliflower-like growths or white/pink nodules on fins, skin, and mouth. Infected cells become greatly enlarged (up to 100,000x normal size), visible to naked eye. Symptoms include raspberry-like clusters, white nodules, rough texture, but fish otherwise healthy. Non-fatal and usually self-limiting; immune system eventually controls it. Caused by iridovirus spread through contact or contaminated water. No specific treatment exists; focus on supporting immune system through excellent water quality, good nutrition, reduced stress, and quarantine of affected fish. Lesions may persist for weeks to months but typically resolve. Can recur during stress. Surgical removal possible for severe cosmetic cases.',
                    imageUrl: null,
                    tags: ['Viral', 'Benign', 'Non-treatable', 'Self-limiting', 'Cosmetic'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'carp-pox',
                    title: 'Carp Pox (Koi Herpesvirus variant)',
                    scientificName: 'Cyprinid herpesvirus 1 (CyHV-1)',
                    description: 'Viral infection causing waxy, smooth, raised growths on skin and fins of carp, koi, and goldfish. Growths appear milky-white, pink, or gray with a candle-wax texture. Symptoms include smooth raised lesions, usually appearing in cooler water (below 68°F) and disappearing in warmer temperatures. Non-fatal; fish remain otherwise healthy. Not the same as Koi Herpesvirus Disease (KHV/CyHV-3), which is deadly. Caused by Cyprinid herpesvirus 1, often stress-triggered. Virus remains dormant in fish for life; lesions may recur. No treatment or cure; manage by maintaining optimal temperature (above 70°F), reducing stress, and good husbandry. Quarantine to prevent spread, though most koi populations already carry the virus.',
                    imageUrl: null,
                    tags: ['Viral', 'Benign', 'Non-treatable', 'Temperature-dependent', 'Carp Family'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'swim-bladder-disorder',
                    title: 'Swim Bladder Disease/Disorder',
                    scientificName: 'Various causes (not pathogenic)',
                    description: 'Dysfunction of the swim bladder causing buoyancy problems. Not a disease but a symptom of various conditions. Symptoms include floating upside down or sideways, sinking to bottom, difficulty maintaining position, swimming at odd angles. Fish may struggle to swim or feed. Causes include overfeeding/constipation (most common), gulping air, bacterial/parasitic infection, injury, genetic defects, or poor water quality. Treatment depends on cause: fast fish for 24-48 hours, feed blanched peas or daphnia for constipation, treat infections if present, improve water quality, lower water level for surface feeders. Some cases (genetic, severe injury) may be permanent. Fancy goldfish and bettas are especially prone.',
                    imageUrl: null,
                    tags: ['Environmental', 'Digestive', 'Symptom', 'Treatable', 'Common'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'ammonia-poisoning',
                    title: 'Ammonia Poisoning',
                    scientificName: 'NH₃/NH₄⁺ toxicity',
                    description: 'Toxic buildup of ammonia in aquarium water, highly poisonous to fish. Ammonia burns gills and damages organs. Symptoms include red/purple gills, gasping at surface, lethargy, loss of appetite, red streaks in fins, mucus overproduction, and sudden death. Fish may lie on bottom or hang at surface. Caused by uncycled tanks, overstocking, overfeeding, inadequate filtration, dead organic matter, or disrupted biological filter. Test water immediately; even 0.25 ppm is harmful. Treatment involves immediate 50% water change (dechlorinated, temperature-matched), ceasing feeding for 24-48 hours, dosing with ammonia detoxifier (Prime, AmQuel), adding beneficial bacteria, and testing daily. Address underlying cause. Permanent damage possible.',
                    imageUrl: null,
                    tags: ['Environmental', 'Water Quality', 'Serious', 'Treatable', 'Toxic'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'nitrite-poisoning',
                    title: 'Nitrite Poisoning',
                    scientificName: 'NO₂⁻ toxicity (Brown Blood Disease)',
                    description: 'Toxic accumulation of nitrite during nitrogen cycle, causing methemoglobinemia (brown blood disease). Nitrite prevents hemoglobin from carrying oxygen. Symptoms include brown/purple gills, rapid breathing, gasping, lethargy, hanging at surface, loss of appetite, and death. Blood may appear brown if tested. Common during tank cycling (nitrite spike). Caused by incomplete nitrogen cycle, overfeeding, inadequate filtration, or filter disturbance. Treatment includes immediate water changes (50% daily), adding aquarium salt (1 tsp/gallon reduces nitrite toxicity), ceasing feeding, dosing with beneficial bacteria, and maintaining high oxygenation. Use API Nitrite test kit to monitor; should be 0 ppm. Recovery possible if caught early.',
                    imageUrl: null,
                    tags: ['Environmental', 'Water Quality', 'Serious', 'Treatable', 'Cycling'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'gas-bubble-disease',
                    title: 'Gas Bubble Disease',
                    scientificName: 'Supersaturation of dissolved gases',
                    description: 'Condition caused by supersaturation of oxygen or nitrogen in water, forming gas bubbles in fish tissues, blood, and organs. Similar to "the bends" in divers. Symptoms include visible bubbles under skin or in eyes, popeye, buoyancy problems, erratic swimming, fin/tissue damage, and death. Bubbles may be visible in fins, gills, or eyes. Caused by rapid temperature increase, leaking air lines creating fine bubbles, excessive photosynthesis in heavily planted tanks, or pump cavitation. Treatment involves vigorous aeration to off-gas excess dissolved gases, gradual water changes with degassed water, and identifying/fixing gas source. Reduce plant lighting if cause. Can be fatal; permanent damage possible.',
                    imageUrl: null,
                    tags: ['Environmental', 'Physical', 'Rare', 'Treatable', 'Bubbles'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'ph-shock',
                    title: 'pH Shock',
                    scientificName: 'Rapid pH change stress',
                    description: 'Acute stress response to rapid pH changes, causing cellular and osmotic damage. Fish can often adapt to wide pH ranges if changed gradually, but rapid shifts (0.5+ pH units in hours) are harmful. Symptoms include erratic swimming, gasping, mucus overproduction, lying on bottom, loss of color, lethargy, and sudden death. May occur after large water changes with different pH or when CO₂ injected tanks lose gas overnight. Caused by improper water changes, substrate/decoration pH effects, CO₂ fluctuations, or medication/chemical additions. Prevention is key: always match new water pH to tank, acclimate slowly (drip method), test before water changes. Treatment involves stabilizing pH, gentle aeration, and supportive care. Damage may be irreversible.',
                    imageUrl: null,
                    tags: ['Environmental', 'Water Chemistry', 'Serious', 'Preventable', 'Acute'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'oxygen-deprivation',
                    title: 'Oxygen Deprivation (Hypoxia)',
                    scientificName: 'Hypoxia/Anoxia',
                    description: 'Insufficient dissolved oxygen in water causing respiratory distress and organ damage. Fish require 5+ ppm O₂; below 3 ppm is critical. Symptoms include gasping at surface, rapid gill movement, lethargy, loss of appetite, gathering near outflow/aeration, and death. Fish may hang vertically at surface. Nocturnal oxygen depletion common in heavily planted tanks (plants consume O₂ at night). Caused by high temperature (warm water holds less O₂), overstocking, inadequate surface agitation, decaying matter, algae blooms, medications (some reduce O₂), or power outages. Treatment includes immediate aeration, surface agitation, partial water change with cooler water, reducing stocking, removing dead/decaying matter. Emergency: hydrogen peroxide dosing (follow guidelines carefully). Prevention critical.',
                    imageUrl: null,
                    tags: ['Environmental', 'Serious', 'Acute', 'Preventable', 'Respiratory'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'malnutrition',
                    title: 'Malnutrition/Vitamin Deficiency',
                    scientificName: 'Various nutritional deficiencies',
                    description: 'Chronic health problems caused by inadequate nutrition or vitamin deficiencies. Different deficiencies cause different symptoms. General symptoms include weight loss, stunted growth, lethargy, color loss, weakened immune system, deformities, and increased disease susceptibility. Specific deficiencies: Vitamin C causes spinal deformities, poor wound healing, hemorrhaging; Vitamin A causes eye problems, fin erosion; Thiamine causes neurological issues, loss of equilibrium; Vitamin E causes reproductive failure, fatty liver. Caused by poor diet quality, feeding only one food type, old/stale food (vitamins degrade), improper diet for species (herbivore fed only meat), or overprocessing. Treatment involves varied, high-quality diet appropriate for species, vitamin-enriched foods, fresh/frozen foods, and supplements (garlic-soaked food, vitamin drops). Prevention through proper nutrition is key. Recovery can take weeks to months.',
                    imageUrl: null,
                    tags: ['Nutritional', 'Chronic', 'Preventable', 'Treatable', 'Diet'],
                    category: 'diseases',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                }
            ],
            equipment: [
                {
                    id: 'filter',
                    title: 'Aquarium Filter',
                    scientificName: null,
                    description: 'Essential equipment that removes debris and maintains water quality through mechanical, chemical, and biological filtration. Types include hang-on-back (HOB), canister, sponge, and internal filters. Choose based on tank size and bioload.',
                    imageUrl: null,
                    tags: ['Essential', 'Water Quality', 'Various Types', 'Maintenance'],
                    category: 'equipment',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'heater',
                    title: 'Aquarium Heater',
                    scientificName: null,
                    description: 'Device that maintains stable water temperature for tropical fish. Most tropical species need 75-80°F. Choose wattage based on tank size (typically 3-5 watts per gallon). Always use a thermometer to monitor temperature.',
                    imageUrl: null,
                    tags: ['Essential', 'Temperature Control', 'Tropical Fish', 'Safety'],
                    category: 'equipment',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'test-kit',
                    title: 'Water Test Kit',
                    scientificName: null,
                    description: 'Tools to measure water parameters including pH, ammonia, nitrite, and nitrate levels. Essential for monitoring water quality and cycling new tanks. Available in liquid (more accurate) or strip forms.',
                    imageUrl: null,
                    tags: ['Essential', 'Water Quality', 'Monitoring', 'Cycling'],
                    category: 'equipment',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                }
            ,

                {
                    id: 'air-stone-pump',
                    title: 'Air Stone/Air Pump',
                    scientificName: null,
                    description: 'Air pump pushes air through tubing to air stone, creating bubbles that increase surface agitation and gas exchange. Essential for tanks without adequate filtration movement, heavily stocked tanks, high temperatures (warm water holds less oxygen), or during medication (some reduce O₂). Also powers sponge filters and provides circulation. Choose pump rated for tank size. Noise can be reduced with check valves and dampening pads. Not needed in well-filtered, planted tanks with surface movement.',
                    imageUrl: null,
                    tags: ['Aeration', 'Oxygenation', 'Essential', 'Circulation'],
                    category: 'equipment',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'substrate',
                    title: 'Substrate',
                    scientificName: null,
                    description: 'Material covering aquarium bottom. Options include gravel (easy maintenance, inert), sand (natural look, fine grain good for burrowing fish like corydoras and loaches), soil (nutrient-rich for plants, lowers pH), bare bottom (easy cleaning, no aesthetic appeal). Substrate hosts beneficial bacteria critical for nitrogen cycle. Choose based on species needs: soft sand for bottom dwellers, plant substrate for planted tanks, larger gravel for ease of cleaning. Depth: 1-2 inches for gravel/sand, 2-3 inches for planted substrates. Rinse before adding to prevent cloudiness.',
                    imageUrl: null,
                    tags: ['Tank Setup', 'Beneficial Bacteria', 'Various Types', 'Aesthetics'],
                    category: 'equipment',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'protein-skimmer',
                    title: 'Protein Skimmer',
                    scientificName: null,
                    description: 'Device that removes dissolved organic compounds before they break down into ammonia. Uses fine bubbles to create foam that captures proteins, which is then collected in cup for disposal. Standard equipment in saltwater aquariums; rarely used in freshwater (only large, heavily stocked systems). Reduces bioload on biological filter, improves water clarity and quality, and lowers nitrate production. Not necessary for most freshwater setups; water changes and proper filtration are sufficient. Popular in reef tanks and high-bioload systems.',
                    imageUrl: null,
                    tags: ['Filtration', 'Advanced', 'Saltwater', 'Optional Freshwater'],
                    category: 'equipment',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                }
            ],
            terminology: [
                {
                    id: 'nitrogen-cycle',
                    title: 'Nitrogen Cycle',
                    scientificName: null,
                    description: 'The biological process where beneficial bacteria convert toxic ammonia (from fish waste) into nitrite, then into less toxic nitrate. Essential for establishing a healthy aquarium. Takes 4-8 weeks to complete in new tanks.',
                    imageUrl: null,
                    tags: ['Water Chemistry', 'Cycling', 'Essential Knowledge', 'Beneficial Bacteria'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'bioload',
                    title: 'Bioload',
                    scientificName: null,
                    description: 'The total amount of waste produced by all living organisms in the aquarium. Higher bioload requires better filtration and more frequent water changes. Measured by the "one inch of fish per gallon" rule (though this is oversimplified).',
                    imageUrl: null,
                    tags: ['Stocking', 'Water Quality', 'Filtration', 'Tank Management'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },
                {
                    id: 'quarantine-tank',
                    title: 'Quarantine Tank',
                    scientificName: null,
                    description: 'A separate tank used to isolate new fish or sick fish from the main display tank. Prevents disease spread and allows observation of new arrivals. Recommended to quarantine for 2-4 weeks before introducing fish to main tank.',
                    imageUrl: null,
                    tags: ['Disease Prevention', 'Best Practice', 'Separate Tank', 'Health'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                }
            ,

                {
                    id: 'general-hardness',
                    title: 'General Hardness (GH)',
                    scientificName: null,
                    description: 'Measure of dissolved minerals (primarily calcium and magnesium) in water, expressed in degrees (dGH) or ppm. Affects osmoregulation in fish. Soft water: 0-6 dGH, moderate: 6-12 dGH, hard: 12-18 dGH, very hard: 18+ dGH. Different species have evolved for different hardness levels. Test with GH test kit. Adjust with remineralization products or RO water blending.',
                    imageUrl: null,
                    tags: ['Water Chemistry', 'Essential Knowledge', 'Testing', 'Minerals'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'carbonate-hardness',
                    title: 'Carbonate Hardness (KH)',
                    scientificName: null,
                    description: 'Measure of water\'s buffering capacity (carbonates/bicarbonates), stabilizes pH. Expressed in dKH or ppm. Higher KH prevents pH crashes from nitrification acids. Ideal: 3-8 dKH for most freshwater. Low KH causes pH instability; high KH resists pH adjustment. Critical for planted tanks with CO₂ injection. Test with KH test kit. Raise with baking soda or crushed coral; lower with RO water or peat.',
                    imageUrl: null,
                    tags: ['Water Chemistry', 'pH Buffer', 'Testing', 'Stability'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'acclimation',
                    title: 'Acclimation',
                    scientificName: null,
                    description: 'Process of gradually adjusting new fish to tank water parameters to prevent shock. Drip acclimation is safest: float bag for temperature (15-20 min), then slowly add tank water via airline tubing at 2-4 drips/second for 1-2 hours. For sensitive species, extend to 3-4 hours. Never add store water to tank. After acclimation, net fish (don\'t pour water) into tank. Especially important for pH, temperature, and salinity differences. Rushing causes stress, disease, and death.',
                    imageUrl: null,
                    tags: ['Best Practice', 'Stocking', 'New Fish', 'Stress Reduction'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'osmotic-stress',
                    title: 'Osmotic Stress',
                    scientificName: null,
                    description: 'Physiological stress caused by imbalance between fish\'s internal salt concentration and surrounding water. Freshwater fish constantly absorb water and excrete dilute urine. Saltwater fish lose water and drink constantly. Sudden changes in salinity, pH, or mineral content force fish to expend energy regulating internal balance, weakening immune system and causing disease susceptibility. Prevented by proper acclimation, stable parameters, and species-appropriate water conditions.',
                    imageUrl: null,
                    tags: ['Water Chemistry', 'Fish Health', 'Essential Knowledge', 'Physiology'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'tannins',
                    title: 'Tannins',
                    scientificName: null,
                    description: 'Natural organic compounds released by driftwood, leaves (Indian almond, oak), and peat, tinting water yellow/brown. Create "blackwater" conditions mimicking natural habitats of many South American and Southeast Asian species (bettas, tetras, rasboras, Apistogramma). Lower pH, soften water, have mild antibacterial/antifungal properties. Beneficial for many species; purely aesthetic issue for others. Remove with activated carbon if unwanted. Add via botanicals, driftwood, or commercial blackwater extract.',
                    imageUrl: null,
                    tags: ['Water Chemistry', 'Natural', 'pH Reducer', 'Blackwater'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'labyrinth-organ',
                    title: 'Labyrinth Organ',
                    scientificName: null,
                    description: 'Specialized respiratory organ in anabantoid fish (bettas, gouramis) allowing them to breathe atmospheric air. Located in chamber above gills. Evolved for survival in oxygen-poor, stagnant waters of Southeast Asia. Fish must access surface regularly; cannot survive in sealed containers. Allows survival in smaller tanks and poor water conditions (though not ideal). Explains why bettas/gouramis gulp air at surface. These species still use gills but supplement with atmospheric oxygen. If prevented from reaching surface, they will suffocate despite gills functioning.',
                    imageUrl: null,
                    tags: ['Fish Anatomy', 'Respiration', 'Anabantoids', 'Special Adaptation'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'shoaling-vs-schooling',
                    title: 'Shoaling vs. Schooling',
                    scientificName: null,
                    description: 'Often confused terms. Schooling: fish swimming in tight, synchronized formation moving as one (defense mechanism, rarely seen in aquariums except when threatened). Shoaling: fish living in loose groups, staying near each other but swimming independently. Most aquarium fish (tetras, rasboras, corydoras) are shoaling species requiring groups of 6-10+ for security and natural behavior. Kept alone or in pairs, they become stressed, hide, lose color, or become aggressive. "School of 6+" in care guides means minimum shoal size for wellbeing. Larger groups show better coloration and more natural behavior.',
                    imageUrl: null,
                    tags: ['Fish Behavior', 'Stocking', 'Social Structure', 'Essential Knowledge'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'harem-stocking',
                    title: 'Harem Stocking',
                    scientificName: null,
                    description: 'Stocking strategy for polygamous species (many Apistogramma, African cichlids, some livebearers) where one male is kept with multiple females. Common ratio: 1 male to 3-5 females. Distributes male aggression among several females instead of focusing on one, reducing stress and injury. Males are often territorial and aggressive toward other males; multiple males in undersized tanks results in fighting and death. Females establish hierarchy but usually coexist peacefully. Essential for breeding groups of mbuna, peacock cichlids, and dwarf cichlids. Requires adequate territory and hiding spots for each female.',
                    imageUrl: null,
                    tags: ['Stocking', 'Breeding', 'Cichlids', 'Social Structure'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                },

                {
                    id: 'territorial-aggression',
                    title: 'Territorial Aggression',
                    scientificName: null,
                    description: 'Aggressive behavior defending a specific area (territory) from intruders, especially conspecifics (same species). Common in cichlids, bettas, some gouramis, and breeding pairs of many species. Triggers include breeding (most species become territorial when spawning), insufficient space, lack of visual barriers, or too few females in harem species. Symptoms: chasing, fin nipping, physical attacks, stressed/injured fish, or dead tankmates. Manage by providing adequate tank size, caves/territories for each fish, visual barriers (plants, decorations), proper male:female ratios, and avoiding overstocking. Some species (Oscars, Jack Dempseys) require species-only tanks.',
                    imageUrl: null,
                    tags: ['Fish Behavior', 'Aggression', 'Tank Management', 'Cichlids'],
                    category: 'terminology',
                    author: 'System',
                    created: new Date().toISOString(),
                    firestoreId: null,
                    userId: null,
                    upvotes: 0,
                    verified: true
                }
            ]
        };
    }

    /**
     * Load glossary entries from Firestore
     * @param {string} category - Category to load (species, diseases, equipment, terminology)
     * @returns {Promise<Array>}
     */
    async loadFromFirestore(category) {
        if (!this.useFirestore) {
            return this.glossaryData[category] || [];
        }

        try {
            // Wait for Firebase to initialize with timeout
            const firebaseTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Firebase initialization timeout')), 10000)
            );

            // Wait for firebaseAuthReady to be defined
            let attempts = 0;
            while (!window.firebaseAuthReady && attempts < 200) {
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
            }

            if (!window.firebaseAuthReady) {
                console.warn('Firebase not initialized for glossary, using local data');
                return this.glossaryData[category] || [];
            }

            // Wait for Firebase initialization to complete or timeout
            await Promise.race([
                window.firebaseAuthReady,
                firebaseTimeout
            ]);

            // Import Firestore functions dynamically
            const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const db = getFirestore();

            // Query glossary collection for entries in this category
            const glossaryCollection = collection(db, this.firestoreCollection);
            const categoryQuery = query(glossaryCollection, where('category', '==', category));
            const snapshot = await getDocs(categoryQuery);

            if (snapshot.empty) {
                console.warn(`No ${category} entries found in Firestore, using local data`);
                return this.glossaryData[category] || [];
            }

            // Convert Firestore documents to glossary entry format
            const entries = snapshot.docs.map(doc => ({
                firestoreId: doc.id,
                ...doc.data()
            }));

            console.log(`✅ Loaded ${entries.length} ${category} entries from Firestore`);
            return entries;

        } catch (error) {
            console.error(`Error loading ${category} from Firestore:`, error);
            // Fallback to local data on error
            return this.glossaryData[category] || [];
        }
    }

    /**
     * Save a glossary entry to Firestore (future implementation)
     * @param {Object} entry - Glossary entry to save
     * @returns {Promise<boolean>}
     */
    async saveToFirestore(entry) {
        if (!this.useFirestore || !window.firebaseFirestore) {
            return false;
        }

        try {
            // Future Firestore implementation
            // const categoryConfig = this.categories.find(c => c.id === entry.category);
            // const collection = categoryConfig.firestoreSubcollection;
            // const docRef = await addDoc(collection(firestore, this.firestoreCollection, collection), entry);
            // return true;
            
            return false;
        } catch (error) {
            console.error('Error saving to Firestore:', error);
            return false;
        }
    }

    /**
     * Initialize the glossary UI
     */
    async init() {
        try {
            this.renderCategories();
            await this.renderContent();
        } catch (error) {
            console.error('Error initializing glossary:', error);
            this.showGlossaryError('Unable to load glossary data. Please <a href="javascript:location.reload()">refresh the page</a>.');
        }
    }

    /**
     * Show error state in glossary UI
     */
    showGlossaryError(message) {
        const contentContainer = document.getElementById('glossaryContent');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h3>Error Loading Glossary</h3>
                    <p style="margin-top: 1rem;">${message}</p>
                </div>
            `;
        }

        const categoriesContainer = document.getElementById('glossaryCategories');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #dc3545;">
                    <p>Unable to load categories. Please refresh the page.</p>
                </div>
            `;
        }
    }

    /**
     * Render category cards
     */
    renderCategories() {
        const container = document.getElementById('glossaryCategories');
        if (!container) return;

        container.innerHTML = this.categories.map(category => {
            const count = (this.glossaryData[category.id] || []).length;
            const activeClass = this.currentCategory === category.id ? 'active' : '';
            
            return `
                <div class="category-card ${activeClass}" onclick="glossaryManager.selectCategory('${category.id}')">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-title">${category.title}</div>
                    <div class="category-count">${count} entries</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Select a category
     * @param {string} categoryId 
     */
    async selectCategory(categoryId) {
        this.currentCategory = categoryId;
        this.searchTerm = '';
        document.getElementById('glossarySearch').value = '';
        
        this.renderCategories();
        await this.renderContent();
    }

    /**
     * Render glossary content
     */
    async renderContent() {
        const container = document.getElementById('glossaryContent');
        if (!container) return;

        // Load data (from Firestore in the future)
        const entries = await this.loadFromFirestore(this.currentCategory);
        
        // Filter based on search term
        const filteredEntries = this.filterEntries(entries);

        if (!this.currentCategory && !this.searchTerm) {
            // Show empty state
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📖</div>
                    <h3>Select a category above to browse</h3>
                    <p>Or use the search bar to find specific terms</p>
                </div>
            `;
            return;
        }

        if (filteredEntries.length === 0) {
            // Show no results
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try a different search term or browse by category</p>
                </div>
            `;
            return;
        }

        // Get category info
        const category = this.categories.find(c => c.id === this.currentCategory);
        const categoryTitle = category ? category.title : 'Search Results';

        // Render entries
        container.innerHTML = `
            <h2 class="section-title">${categoryTitle}</h2>
            <div class="glossary-items">
                ${filteredEntries.map(entry => this.renderEntry(entry)).join('')}
            </div>
        `;
    }

    /**
     * Render a single glossary entry
     * @param {Object} entry 
     * @returns {string}
     */
    renderEntry(entry) {
        const scientificName = entry.scientificName 
            ? `<div class="glossary-item-meta">${entry.scientificName}</div>` 
            : '';
        
        const verifiedBadge = entry.verified 
            ? '<span title="Verified by Comparium team">✓</span>' 
            : '';

        const tags = entry.tags && entry.tags.length > 0
            ? `<div class="glossary-item-tags">
                ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
               </div>`
            : '';

        return `
            <div class="glossary-item">
                <div class="glossary-item-title">
                    ${entry.title}
                    ${verifiedBadge}
                </div>
                ${scientificName}
                <div class="glossary-item-description">${entry.description}</div>
                ${tags}
            </div>
        `;
    }

    /**
     * Filter entries based on search term
     * @param {Array} entries 
     * @returns {Array}
     */
    filterEntries(entries) {
        if (!this.searchTerm) return entries;

        const term = this.searchTerm.toLowerCase();
        return entries.filter(entry => {
            return entry.title.toLowerCase().includes(term) ||
                   entry.description.toLowerCase().includes(term) ||
                   (entry.scientificName && entry.scientificName.toLowerCase().includes(term)) ||
                   (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(term)));
        });
    }

    /**
     * Search across all categories
     * @param {string} term 
     */
    async search(term) {
        this.searchTerm = term.trim();
        
        if (!this.searchTerm) {
            // Reset to current category view
            await this.renderContent();
            return;
        }

        // Search across all categories
        this.currentCategory = null;
        this.renderCategories();
        
        const container = document.getElementById('glossaryContent');
        if (!container) return;

        // Collect all matching entries from all categories
        let allMatches = [];
        for (const category of this.categories) {
            const entries = await this.loadFromFirestore(category.id);
            const filtered = entries.filter(entry => {
                const searchTerm = this.searchTerm.toLowerCase();
                return entry.title.toLowerCase().includes(searchTerm) ||
                       entry.description.toLowerCase().includes(searchTerm) ||
                       (entry.scientificName && entry.scientificName.toLowerCase().includes(searchTerm)) ||
                       (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
            });
            allMatches = allMatches.concat(filtered);
        }

        if (allMatches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No results found for "${this.searchTerm}"</h3>
                    <p>Try a different search term or browse by category</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <h2 class="section-title">Search Results (${allMatches.length})</h2>
            <div class="glossary-items">
                ${allMatches.map(entry => this.renderEntry(entry)).join('')}
            </div>
        `;
    }
}

// Initialize glossary manager
const glossaryManager = new GlossaryManager();

// Wait for DOM to load with error handling
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        glossaryManager.init().catch(error => {
            console.error('Fatal glossary initialization error:', error);
            glossaryManager.showGlossaryError('Critical error loading glossary. Please refresh the page.');
        });
    });
} else {
    glossaryManager.init().catch(error => {
        console.error('Fatal glossary initialization error:', error);
        glossaryManager.showGlossaryError('Critical error loading glossary. Please refresh the page.');
    });
}

/**
 * Search function called from HTML
 */
function searchGlossary() {
    const searchInput = document.getElementById('glossarySearch');
    if (searchInput) {
        glossaryManager.search(searchInput.value);
    }
}

/**
 * Show contribution information
 */
function showContributeInfo() {
    if (window.authManager && !window.authManager.isLoggedIn()) {
        window.authManager.showMessage('Please log in to contribute to the glossary', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // Future: Open contribution form
    alert('Contribution feature coming soon! This will allow logged-in users to submit glossary entries for review. All contributions will be stored in Firestore and reviewed by the Comparium team before being published.');
}
