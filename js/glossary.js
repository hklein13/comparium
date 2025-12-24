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
                firestoreSubcollection: 'species_entries' // For future Firestore migration
            },
            {
                id: 'diseases',
                title: 'Diseases',
                icon: '🏥',
                description: 'Common fish diseases and treatments',
                firestoreSubcollection: 'disease_entries'
            },
            {
                id: 'equipment',
                title: 'Equipment',
                icon: '🔧',
                description: 'Aquarium equipment and supplies',
                firestoreSubcollection: 'equipment_entries'
            },
            {
                id: 'terminology',
                title: 'Terminology',
                icon: '📖',
                description: 'Aquarium terms and definitions',
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
                    tags: ['Bacterial', 'Serious', 'Difficult to Treat', 'Quarantine'],
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
                    tags: ['Essential', 'Water Quality', 'Monitoring', 'Cycling'],
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
                    tags: ['Disease Prevention', 'Best Practice', 'Separate Tank', 'Health'],
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

        // Wait for Firebase to initialize
        if (!window.firebaseAuthReady) {
            console.warn('Firebase not initialized for glossary, using local data');
            return this.glossaryData[category] || [];
        }

        try {
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
    init() {
        this.renderCategories();
        this.renderContent();
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

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => glossaryManager.init());
} else {
    glossaryManager.init();
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
