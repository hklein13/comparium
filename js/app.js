// Comparium - Application Logic

// ============================================================================
// FISH DATA LOADING - Firestore Integration
// ============================================================================
// fishDatabase will be populated either from:
// 1. Firestore (preferred) - loaded async on page load
// 2. fish-data.js (fallback) - if Firestore is unavailable
// ============================================================================

// fishDatabase is declared in fish-data.js and will be reassigned from Firestore if available

/**
 * Load fish species data from Firestore
 * @returns {Promise<Object>} Fish database object
 */
async function loadFishFromFirestore() {
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
      console.warn('Firebase not initialized, using fallback fish data');
      return fishDatabase; // Fallback to fish-data.js
    }

    // Wait for Firebase initialization to complete or timeout
    await Promise.race([window.firebaseAuthReady, firebaseTimeout]);

    // Import Firestore functions
    const { getFirestore, collection, getDocs } =
      await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = getFirestore();

    // Fetch all species from Firestore
    const speciesCollection = collection(db, 'species');
    const snapshot = await getDocs(speciesCollection);

    if (snapshot.empty) {
      console.warn('No species found in Firestore, using fallback data');
      return fishDatabase;
    }

    // Convert Firestore documents to fishDatabase format
    const firestoreData = {};
    snapshot.docs.forEach(doc => {
      firestoreData[doc.id] = doc.data();
    });

    console.log(`Loaded ${snapshot.size} species from Firestore`);
    return firestoreData;
  } catch (error) {
    console.error('Error loading from Firestore, using fallback data:', error);
    return fishDatabase;
  }
}

/**
 * Initialize the app - load data and build UI
 */
async function initializeApp() {
  try {
    // Show loading state
    const panels = document.querySelectorAll('.species-panel');
    panels.forEach(panel => {
      panel.innerHTML =
        '<div style="padding: 1rem; text-align: center; color: #999;">Loading species...</div>';
    });

    // Load fish data
    fishDatabase = await loadFishFromFirestore();

    // Verify we have data
    if (!fishDatabase || Object.keys(fishDatabase).length === 0) {
      throw new Error('No fish species data available');
    }

    // Build the UI with loaded data
    buildPanels();

    // Check for URL parameters to auto-load a comparison
    loadComparisonFromUrl();

    console.log('App initialized with', Object.keys(fishDatabase).length, 'species');
  } catch (error) {
    console.error('Error initializing app:', error);
    showAppErrorState(
      'Unable to load fish species data. Please <a href="javascript:location.reload()">refresh the page</a> or try again later.'
    );
  }
}

/**
 * Load comparison from URL parameters
 * URL format: compare.html?species=neonTetra,cardinalTetra,cherryBarb
 */
function loadComparisonFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const speciesParam = urlParams.get('species');

  if (!speciesParam) return;

  const speciesKeys = speciesParam.split(',').filter(key => fishDatabase[key]);

  if (speciesKeys.length < 2) {
    console.warn('URL species param needs at least 2 valid species keys');
    return;
  }

  // Auto-select the species (max 3)
  const panels = ['panel1', 'panel2', 'panel3'];
  speciesKeys.slice(0, 3).forEach((key, index) => {
    selectedSpecies[panels[index]] = key;

    // Visual selection - find and highlight the item
    const panel = document.getElementById(panels[index]);
    if (panel) {
      const item = panel.querySelector(`[data-key="${key}"]`);
      if (item) {
        item.classList.add('selected');
        // Open the parent details element
        const details = item.closest('.category-details');
        if (details) details.setAttribute('open', '');
      }
    }
  });

  // Run the comparison after a brief delay for DOM updates
  setTimeout(() => {
    compareSpecies();
  }, 100);
}

function showAppErrorState(message) {
  const panels = document.querySelectorAll('.species-panel');
  panels.forEach(panel => {
    panel.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <p style="color: #dc3545; font-weight: bold; margin-bottom: 1rem;">Error</p>
                <p style="color: #666; margin: 0;">${message}</p>
            </div>
        `;
  });

  // Also show error in comparison grid if it exists
  const comparisonGrid = document.getElementById('comparisonGrid');
  if (comparisonGrid) {
    comparisonGrid.innerHTML = `
            <div class="empty-state">
                <h3>Unable to Load Data</h3>
                <p>${message}</p>
            </div>
        `;
  }
}

// Auto-initialize when DOM is ready with error handling
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => {
      console.error('Fatal initialization error:', error);
      showAppErrorState('Critical error loading application. Please refresh the page.');
    });
  });
} else {
  initializeApp().catch(error => {
    console.error('Fatal initialization error:', error);
    showAppErrorState('Critical error loading application. Please refresh the page.');
  });
}

// Fish categories for organized display
const fishCategories = {
  'Tetras & Characins': [
    'neonTetra',
    'cardinalTetra',
    'greenNeonTetra',
    'rummyNoseTetra',
    'emberTetra',
    'glowlightTetra',
    'blackSkirtTetra',
    'blackNeonTetra',
    'buenosAiresTetra',
    'bloodfinTetra',
    'congoTetra',
    'lemonTetra',
    'serpaeTetra',
    'diamondTetra',
    'xRayTetra',
    'penguinTetra',
    'silverDollar',
    'emperorTetra',
    'flameTetra',
    'pristellaTetra',
    'blackPhantomTetra',
    'redPhantomTetra',
  ],
  Barbs: [
    'cherryBarb',
    'tigerBarb',
    'rosyBarb',
    'goldBarb',
    'odessaBarb',
    'denisonBarb',
    'fiveBandedBarb',
    'blackRubyBarb',
    'tictoBarb',
    'checkerBarb',
    'pentazonaBarb',
  ],
  Danios: ['zebraDanio', 'pearlDanio', 'celestialPearlDanio', 'emeraldDwarfRasbora'],
  Rasboras: [
    'harlequinRasbora',
    'chiliRasbora',
    'exclamationPointRasbora',
    'microrasbora',
    'scissortailRasbora',
    'lambchopRasbora',
    'brilliantRasbora',
    'phoenixRasbora',
    'strawberryRasbora',
  ],
  Rainbowfish: [
    'boesemansRainbowfish',
    'dwarfNeonRainbowfish',
    'turquoiseRainbowfish',
    'redRainbowfish',
    'threadfinRainbowfish',
  ],
  Minnows: ['whiteCloudMinnow', 'goldWhiteCloud'],
  Livebearers: [
    'guppy',
    'molly',
    'balloonMolly',
    'blackMolly',
    'platy',
    'variatusPlaty',
    'swordtail',
    'endlersLivebearer',
    'leastKillifish',
    'sailfinMolly',
    'dalmatianMolly',
    'mosquitofish',
  ],
  'Bettas & Labyrinth Fish': ['bettaFish', 'bettaImbellis', 'paradiseFish'],
  Gouramis: [
    'dwarfGourami',
    'honeyGourami',
    'pearlGourami',
    'sparklingGourami',
    'threeSpotGourami',
    'chocolateGourami',
    'opalineGourami',
    'goldGourami',
    'blueGourami',
    'kissingGourami',
    'moonlightGourami',
  ],
  Cichlids: [
    'angelfish',
    'germanBlueRam',
    'bolivianRam',
    'kribensis',
    'cockatooDwarfCichlid',
    'electricBlueAcara',
    'firemouthCichlid',
    'convictCichlid',
    'africanButterflyCichlid',
    'discus',
    'apistogrammaAgassizii',
    'blueAcara',
    'severum',
    'oscar',
    'jackDempsey',
    'jewelCichlid',
    'peacockCichlid',
    'yellowLabCichlid',
    'keyholeCichlid',
  ],
  'Corydoras Catfish': [
    'corydoras',
    'pandaCory',
    'bronzeCory',
    'pepperedCory',
    'sterbaiCory',
    'juliiCory',
    'albinoCory',
    'pygmyCory',
    'saltAndPepperCory',
    'banditCory',
  ],
  Loaches: [
    'kuhliLoach',
    'yoyoLoach',
    'dwarfChainLoach',
    'zebraLoach',
    'clownLoach',
    'hillstreamLoach',
    'dojoLoach',
  ],
  'Plecos & Algae Eaters': [
    'otocinclus',
    'bristlenosePleco',
    'clownPleco',
    'commonPleco',
    'rubberLipPleco',
    'chineseAlgaeEater',
    'siameseAlgaeEater',
  ],
  'Other Catfish': [
    'stripedRaphaelCatfish',
    'glassCatfish',
    'upsideDownCatfish',
    'pictusCatfish',
    'twigCatfish',
    'dwarfPetricola',
  ],
  'Oddball Fish': [
    'africanButterflyFish',
    'senegalBichir',
    'peaPuffer',
    'elephantNoseFish',
    'ropeFish',
  ],
  'Other Fish': ['rainbowShark'],
  Shrimp: ['cherryShrimp', 'amanoShrimp', 'ghostShrimp', 'bambooShrimp', 'singaporeShrimp'],
  Snails: ['mysterySnail', 'neriteSnail', 'ramshornSnail'],
  Amphibians: ['africanDwarfFrog'],
};

// Track selected species
const selectedSpecies = {
  panel1: null,
  panel2: null,
  panel3: null,
};

// Build collapsible category panels
function buildPanels() {
  const panels = ['panel1', 'panel2', 'panel3'];
  panels.forEach(panelId => {
    const panel = document.getElementById(panelId);
    panel.innerHTML = '';

    // Build categories with details/summary
    for (const [category, fishKeys] of Object.entries(fishCategories)) {
      const details = document.createElement('details');
      details.className = 'category-details';

      const summary = document.createElement('summary');
      summary.innerHTML = `<span>${category} <span class="species-count">(${fishKeys.length})</span></span>`;
      details.appendChild(summary);

      const speciesList = document.createElement('div');
      speciesList.className = 'species-list';

      fishKeys.forEach(key => {
        if (fishDatabase[key]) {
          const item = document.createElement('div');
          item.className = 'species-item';
          item.dataset.key = key;
          item.dataset.commonName = fishDatabase[key].commonName.toLowerCase();
          item.dataset.scientificName = fishDatabase[key].scientificName.toLowerCase();
          item.innerHTML = `
                        <div class="species-common-name">${fishDatabase[key].commonName}</div>
                        <div class="species-scientific-name">${fishDatabase[key].scientificName}</div>
                    `;
          item.onclick = () => selectSpecies(panelId, key, item);
          speciesList.appendChild(item);
        }
      });

      details.appendChild(speciesList);
      panel.appendChild(details);
    }
  });
}

// Select a species
function selectSpecies(panelId, key, itemElement) {
  selectedSpecies[panelId] = key;

  // Update visual selection
  const panel = document.getElementById(panelId);
  panel.querySelectorAll('.species-item').forEach(item => {
    item.classList.remove('selected');
  });
  itemElement.classList.add('selected');
}

// Filter species based on search
function filterSpecies(panelId, searchId) {
  const searchTerm = document.getElementById(searchId).value.toLowerCase();
  const panel = document.getElementById(panelId);

  panel.querySelectorAll('.species-item').forEach(item => {
    const commonName = item.dataset.commonName;
    const scientificName = item.dataset.scientificName;

    if (commonName.includes(searchTerm) || scientificName.includes(searchTerm)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });

  // Show/hide category details based on visible items
  panel.querySelectorAll('.category-details').forEach(details => {
    const visibleItems = details.querySelectorAll('.species-item:not(.hidden)');
    if (visibleItems.length === 0) {
      details.style.display = 'none';
    } else {
      details.style.display = 'block';
      // Auto-open categories with search results
      if (searchTerm !== '') {
        details.setAttribute('open', '');
      }
    }
  });
}

function getAggressionBadge(aggression) {
  const level = aggression.toLowerCase();
  if (level.includes('peaceful')) return '<span class="badge peaceful">Peaceful</span>';
  if (level.includes('semi')) return '<span class="badge semi-aggressive">Semi-Aggressive</span>';
  if (level.includes('aggressive')) return '<span class="badge aggressive">Aggressive</span>';
  return aggression;
}

function compareSpecies() {
  const fish1Key = selectedSpecies.panel1;
  const fish2Key = selectedSpecies.panel2;
  const fish3Key = selectedSpecies.panel3;

  if (!fish1Key || !fish2Key) {
    alert('Please select at least two fish species to compare');
    return;
  }

  const selectedFish = [fish1Key, fish2Key];
  if (fish3Key) selectedFish.push(fish3Key);

  // Get fish data and attach the database key to each object
  const fishData = selectedFish.map(key => ({
    ...fishDatabase[key],
    _databaseKey: key, // Add the correct database key
  }));

  displayComparison(fishData);
  analyzeCompatibility(fishData);

  // Load favorite states for the comparison results
  if (authManager.isLoggedIn()) {
    loadFavoritesState();
  }
}

function displayComparison(fishData) {
  const grid = document.getElementById('comparisonGrid');

  let html = '<div class="comparison-header"><div></div>';
  fishData.forEach(fish => {
    // Use the correct database key attached in compareSpecies()
    const speciesKey = fish._databaseKey;
    html += `
            <div class="fish-column">
                <h3>${fish.commonName} ${addFavoriteButton(speciesKey)}</h3>
                <div class="scientific">${fish.scientificName}</div>
            </div>
        `;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Temperature Range</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.tempMin}-${fish.tempMax}${fish.tempUnit}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">pH Range</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.phMin}-${fish.phMax}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Water Hardness</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.waterHardness}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Minimum Tank Size</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.tankSizeMin} ${fish.tankSizeUnit}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Adult Size</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.maxSize} ${fish.sizeUnit}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Temperament</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${getAggressionBadge(fish.aggression)}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Diet</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.diet}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Social Needs</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.schooling}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Lifespan</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.lifespan}</div>`;
  });
  html += '</div>';

  html += '<div class="comparison-row"><div class="attribute-label">Care Level</div>';
  fishData.forEach(fish => {
    html += `<div class="attribute-value">${fish.careLevel}</div>`;
  });
  html += '</div>';

  grid.innerHTML = html;
  grid.classList.add('active');
}

function analyzeCompatibility(fishData) {
  const grid = document.getElementById('comparisonGrid');
  const issues = [];
  const warnings = [];
  const positive = [];

  const tempRanges = fishData.map(f => ({ min: f.tempMin, max: f.tempMax, name: f.commonName }));
  const overlapMin = Math.max(...tempRanges.map(r => r.min));
  const overlapMax = Math.min(...tempRanges.map(r => r.max));

  if (overlapMin <= overlapMax) {
    const range = overlapMax - overlapMin;
    if (range >= 3) {
      positive.push(`Good temperature overlap: ${overlapMin}-${overlapMax}°F`);
    } else {
      warnings.push(
        `Narrow temperature overlap: ${overlapMin}-${overlapMax}°F. Monitor carefully.`
      );
    }
  } else {
    issues.push(
      'No overlapping temperature range - these species require incompatible temperatures'
    );
  }

  const phRanges = fishData.map(f => ({ min: f.phMin, max: f.phMax, name: f.commonName }));
  const phOverlapMin = Math.max(...phRanges.map(r => r.min));
  const phOverlapMax = Math.min(...phRanges.map(r => r.max));

  if (phOverlapMin <= phOverlapMax) {
    positive.push(`Compatible pH range: ${phOverlapMin.toFixed(1)}-${phOverlapMax.toFixed(1)}`);
  } else {
    issues.push('No overlapping pH range - water chemistry incompatibility');
  }

  // Check size compatibility and predation risk
  fishData.forEach((predator, i) => {
    fishData.forEach((prey, j) => {
      if (i !== j) {
        const sizeRatio = predator.maxSize / prey.maxSize;
        const isPredatory =
          predator.diet.toLowerCase().includes('carnivore') ||
          predator.diet.toLowerCase().includes('omnivore');

        // Shrimp/snails with fish
        if (
          prey.commonName.toLowerCase().includes('shrimp') ||
          prey.commonName.toLowerCase().includes('snail')
        ) {
          if (predator.maxSize >= 2.0 && isPredatory) {
            issues.push(
              `${predator.commonName} will likely eat ${prey.commonName} - invertebrates are seen as food by most fish`
            );
          }
        }
        // Tiny fish (<1 inch) with larger fish
        else if (prey.maxSize < 1.0 && predator.maxSize >= 2.0 && isPredatory) {
          issues.push(
            `${predator.commonName} (${predator.maxSize}") may prey on ${prey.commonName} (${prey.maxSize}") - size mismatch`
          );
        }
        // General size mismatch (3x+ ratio)
        else if (sizeRatio >= 3 && isPredatory) {
          warnings.push(
            `${predator.commonName} (${predator.maxSize}") could prey on ${prey.commonName} (${prey.maxSize}") if hungry - monitor carefully`
          );
        }
      }
    });
  });

  const aggressionLevels = fishData.map(f => ({
    name: f.commonName,
    level: f.aggression.toLowerCase(),
  }));

  const hasFullyAggressive = aggressionLevels.some(
    a =>
      a.level.includes('aggressive') && !a.level.includes('semi') && !a.level.includes('peaceful')
  );
  const hasSemiAggressive = aggressionLevels.some(a => a.level.includes('semi'));
  const hasPeaceful = aggressionLevels.some(a => a.level.includes('peaceful'));

  const fishNames = fishData.map(f => f.commonName.toLowerCase());
  const hasBetta = fishNames.some(n => n.includes('betta'));
  const hasRainbowShark = fishNames.some(n => n.includes('rainbow shark'));
  const hasTigerBarb = fishNames.some(n => n.includes('tiger barb'));
  const hasParadiseFish = fishNames.some(n => n.includes('paradise'));
  const hasConvictCichlid = fishNames.some(n => n.includes('convict'));
  const hasBuenosAiresTetra = fishNames.some(n => n.includes('buenos aires'));
  const hasSerpaeTetra = fishNames.some(n => n.includes('serpae'));
  const hasChineseAlgaeEater = fishNames.some(n => n.includes('chinese algae'));
  const hasCommonPleco = fishNames.some(n => n.includes('common pleco'));
  const hasClownLoach = fishNames.some(n => n.includes('clown loach'));
  const hasLongFinnedFish = fishNames.some(
    n => n.includes('betta') || n.includes('angelfish') || n.includes('gourami')
  );

  if (
    hasBetta &&
    (hasTigerBarb || hasRainbowShark || hasParadiseFish || hasBuenosAiresTetra || hasSerpaeTetra)
  ) {
    issues.push(
      'Bettas should NOT be kept with Tiger Barbs, Paradise Fish, Serpae Tetras, Buenos Aires Tetras, or Rainbow Sharks - extreme aggression and fin nipping likely'
    );
  }

  if (hasParadiseFish && aggressionLevels.length > 1) {
    issues.push(
      'Paradise Fish are AGGRESSIVE and will attack tankmates, especially long-finned species - species tank recommended'
    );
  }

  if (hasConvictCichlid) {
    warnings.push(
      'Convict Cichlids have EXTREME breeding aggression - will attack fish several times their size when protecting eggs/fry'
    );
  }

  if ((hasTigerBarb || hasBuenosAiresTetra || hasSerpaeTetra) && hasLongFinnedFish) {
    warnings.push(
      'Fin-nipping species present (Tiger Barb/Buenos Aires Tetra/Serpae Tetra) with long-finned fish - harassment likely'
    );
  }

  if (hasBuenosAiresTetra) {
    warnings.push('Buenos Aires Tetras destroy live plants - avoid planted tanks');
  }

  if (hasChineseAlgaeEater) {
    warnings.push(
      'Chinese Algae Eaters become increasingly aggressive with age - will latch onto flat-bodied fish (discus, angelfish)'
    );
  }

  if (hasCommonPleco) {
    warnings.push(
      'Common Plecos grow 18-24 inches and require 75-180+ gallon tanks - often mis-sold to beginners'
    );
  }

  if (hasClownLoach) {
    warnings.push(
      'Clown Loaches grow 10-12+ inches, live 20+ years, and need 125+ gallon tanks - long-term commitment required'
    );
  }

  if (hasRainbowShark && aggressionLevels.length > 1) {
    const otherFish = aggressionLevels.filter(a => !a.name.toLowerCase().includes('rainbow shark'));
    if (otherFish.length > 0) {
      warnings.push(
        'Rainbow Sharks are highly territorial and become increasingly aggressive with age - conflicts likely'
      );
    }
  }

  if (hasFullyAggressive && hasPeaceful) {
    issues.push('Aggressive and peaceful species should NOT be mixed - bullying and injury likely');
  } else if (hasFullyAggressive && hasSemiAggressive) {
    warnings.push(
      'Mixing aggressive and semi-aggressive species - monitor closely for territorial disputes'
    );
  } else if (hasSemiAggressive && hasPeaceful) {
    warnings.push(
      'Semi-aggressive species with peaceful tank mates - provide hiding spots and monitor behavior'
    );
  } else if (hasSemiAggressive && !hasPeaceful) {
    warnings.push(
      'Multiple semi-aggressive species - establish territories with decorations and monitor for conflicts'
    );
  } else if (hasPeaceful && !hasSemiAggressive && !hasFullyAggressive) {
    positive.push('All species are peaceful - good temperament match');
  }

  const maxTankSize = Math.max(...fishData.map(f => f.tankSizeMin));
  positive.push(`Recommended minimum tank size: ${maxTankSize} gallons`);

  let alertClass = 'good';
  if (issues.length > 0) alertClass = 'danger';
  else if (warnings.length > 0) alertClass = 'warning';

  let alertHtml = `<div class="compatibility-alert ${alertClass}">`;
  alertHtml += '<h3>Compatibility Analysis</h3>';

  if (positive.length > 0) {
    alertHtml += '<ul>';
    positive.forEach(item => {
      alertHtml += `<li class="compat-good">${item}</li>`;
    });
    alertHtml += '</ul>';
  }

  if (warnings.length > 0) {
    alertHtml += '<ul>';
    warnings.forEach(item => {
      alertHtml += `<li class="compat-warning">${item}</li>`;
    });
    alertHtml += '</ul>';
  }

  if (issues.length > 0) {
    alertHtml += '<ul>';
    issues.forEach(item => {
      alertHtml += `<li class="compat-critical">${item}</li>`;
    });
    alertHtml += '</ul>';
  }

  alertHtml += '</div>';
  grid.innerHTML += alertHtml;
}

// Initialize panels on page load
buildPanels();

// ============================================================================
// USER FEATURES INTEGRATION
// ============================================================================

// Add favorites functionality to species selection
function addFavoriteButton(speciesKey) {
  // Always show star for feature discovery and to prevent race conditions
  // toggleFavorite() handles the login check if user tries to use it
  // Uses data-species attribute instead of inline onclick for XSS safety
  return `<span class="favorite-star" data-species="${speciesKey}">★</span>`;
}

// Delegated click handler for favorite stars (XSS-safe alternative to inline onclick)
document.getElementById('comparisonGrid').addEventListener('click', function (event) {
  const star = event.target.closest('.favorite-star');
  if (star && star.dataset.species) {
    toggleFavorite(star.dataset.species, star);
  }
});

// Toggle favorite species
async function toggleFavorite(speciesKey, element) {
  if (!authManager.isLoggedIn()) {
    authManager.showMessage('Please login to save favorites', 'info');
    return;
  }

  const uid = authManager.getCurrentUid();
  const isFavorite = await storageService.isFavorite(uid, speciesKey);

  if (isFavorite) {
    await storageService.removeFavorite(uid, speciesKey);
    element.classList.remove('active');
    authManager.showMessage('Removed from favorites', 'success');
  } else {
    await storageService.addFavorite(uid, speciesKey);
    element.classList.add('active');
    authManager.showMessage('Added to favorites!', 'success');
  }
}

// Load favorites state for displayed species
async function loadFavoritesState() {
  if (!authManager.isLoggedIn()) return;

  const uid = authManager.getCurrentUid();
  const favorites = await storageService.getFavorites(uid);

  document.querySelectorAll('.favorite-star').forEach(star => {
    const speciesKey = star.dataset.species;
    if (favorites.includes(speciesKey)) {
      star.classList.add('active');
    }
  });
}

// Save comparison to history
async function saveComparisonToHistory(fishData, isCompatible) {
  if (!authManager.isLoggedIn()) return;

  const uid = authManager.getCurrentUid();
  if (!uid) return;

  const comparison = {
    species: fishData.map(f => ({
      // Use the actual database key (attached in compareSpecies) for reliable URL linking
      key: f._databaseKey || f.commonName.toLowerCase().replace(/\s+/g, ''),
      name: f.commonName,
    })),
    compatible: isCompatible,
  };

  await storageService.saveComparison(uid, comparison);
}

// Enhanced compareSpecies to save history
const originalCompareSpecies = compareSpecies;
// eslint-disable-next-line no-func-assign -- Intentional wrapper to add history saving
compareSpecies = function () {
  const result = originalCompareSpecies();

  // After comparison, save if logged in
  if (authManager.isLoggedIn()) {
    const fish1Key = selectedSpecies.panel1;
    const fish2Key = selectedSpecies.panel2;
    const fish3Key = selectedSpecies.panel3;

    if (fish1Key && fish2Key) {
      const selectedFish = [fish1Key, fish2Key];
      if (fish3Key) selectedFish.push(fish3Key);

      // Include _databaseKey for proper URL linking in comparison history
      const fishData = selectedFish.map(key => ({
        ...fishDatabase[key],
        _databaseKey: key,
      }));

      // Determine if compatible (simplified check)
      const isCompatible = true; // Would need actual compatibility logic

      saveComparisonToHistory(fishData, isCompatible);
    }
  }

  return result;
};

// Load favorites when panels are built
const originalBuildPanels = buildPanels;
// eslint-disable-next-line no-func-assign -- Intentional wrapper to add favorites loading
buildPanels = function () {
  originalBuildPanels();

  // Add slight delay to ensure DOM is ready
  setTimeout(() => {
    loadFavoritesState();
  }, 100);
};
