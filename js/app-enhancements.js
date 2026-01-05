// ============================================================================
// APP ENHANCEMENTS - Add to existing app.js functionality
// ============================================================================
// This file enhances the main app with clickable species and visible favorites
// ============================================================================

/**
 * Escape special regex characters in a string
 * This allows species names with parentheses and other special chars to work correctly
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Make fish names clickable in comparison results
 * Call this after displaying results
 */
function makeSpeciesNamesClickable() {
  console.log('🔍 makeSpeciesNamesClickable started');

  // Find the comparison grid (not .results!)
  const resultsDiv = document.getElementById('comparisonGrid');
  if (!resultsDiv) {
    console.log('❌ No comparisonGrid found');
    return;
  }
  console.log('✅ Found comparisonGrid');

  // Safety check: ensure selectedSpecies exists
  if (typeof selectedSpecies === 'undefined') {
    console.log('❌ selectedSpecies is undefined');
    return;
  }
  console.log('✅ selectedSpecies exists:', selectedSpecies);

  // Get all the fish data from selected panels
  const fish1Key = selectedSpecies.panel1;
  const fish2Key = selectedSpecies.panel2;
  const fish3Key = selectedSpecies.panel3;

  const selectedFish = [fish1Key, fish2Key, fish3Key].filter(Boolean);
  console.log('🐟 Selected fish:', selectedFish);

  // Replace each fish name with clickable link
  selectedFish.forEach(fishKey => {
    const fish = fishDatabase[fishKey];
    if (!fish) {
      console.log('❌ Fish not found in database:', fishKey);
      return;
    }

    console.log('🔧 Processing:', fish.commonName, 'key:', fishKey);

    // Find all instances of this fish name in results
    // Escape special regex characters (fixes species with parentheses like "Bichir (Senegal)")
    const escapedName = escapeRegex(fish.commonName);
    // Only use trailing word boundary if name ends with a word character (fixes parentheses issue)
    const endsWithWordChar = /\w$/.test(fish.commonName);
    const fishNameRegex = new RegExp(`\\b${escapedName}${endsWithWordChar ? '\\b' : ''}`, 'g');

    const beforeHTML = resultsDiv.innerHTML;
    resultsDiv.innerHTML = resultsDiv.innerHTML.replace(
      fishNameRegex,
      `<a href="species.html?fish=${fishKey}" class="fish-name-link">${fish.commonName}</a>`
    );
    const afterHTML = resultsDiv.innerHTML;

    if (beforeHTML !== afterHTML) {
      console.log('✅ Replaced text for:', fish.commonName);
    } else {
      console.log('⚠️ No replacement occurred for:', fish.commonName);
    }
  });

  // Favorite stars are now added directly in displayComparison() in app.js
  // No need to add them here - prevents duplicate stars

  console.log('✅ makeSpeciesNamesClickable completed');
}

/**
 * Add favorite stars to results section
 */
function addFavoriteStarsToResults(selectedFish) {
  if (!authManager || !authManager.isLoggedIn()) return;

  const resultsDiv = document.getElementById('comparisonGrid'); // CHANGED
  if (!resultsDiv) return;

  selectedFish.forEach(fishKey => {
    const fish = fishDatabase[fishKey];
    if (!fish) return;

    // Find fish name links and add star after them
    const links = resultsDiv.querySelectorAll(
      `a.fish-name-link[href="species.html?fish=${fishKey}"]`
    );
    links.forEach(link => {
      if (
        link.nextSibling &&
        link.nextSibling.classList &&
        link.nextSibling.classList.contains('favorite-star')
      ) {
        return; // Already has star
      }

      const star = document.createElement('span');
      star.className = 'favorite-star';
      star.setAttribute('data-species', fishKey);
      star.textContent = '★';
      star.style.marginLeft = '0.5rem';
      star.style.fontSize = '1.2rem';
      star.style.cursor = 'pointer';
      star.onclick = function (e) {
        e.preventDefault();
        toggleFavorite(fishKey, this);
      };

      link.parentNode.insertBefore(star, link.nextSibling);
    });
  });

  // Load favorite states
  loadFavoriteStatesInResults();
}

/**
 * Load favorite states for stars in results
 */
async function loadFavoriteStatesInResults() {
  if (!authManager || !authManager.isLoggedIn()) return;

  const uid = authManager.getCurrentUid();
  const favorites = await storageService.getFavorites(uid);

  document.querySelectorAll('.results .favorite-star').forEach(star => {
    const speciesKey = star.getAttribute('data-species');
    if (favorites.includes(speciesKey)) {
      star.classList.add('active');
    }
  });
}

/**
 * Enhanced compare function that adds clickable names
 * This wraps the existing compareSpecies function
 */
console.log('app-enhancements.js loaded');
console.log('compareSpecies exists?', typeof compareSpecies);

if (typeof compareSpecies !== 'undefined') {
  console.log('✅ Wrapping compareSpecies function');
  const originalCompareSpecies = compareSpecies;
  compareSpecies = function () {
    console.log('🎯 Enhanced compareSpecies called!');
    // Call original function
    const result = originalCompareSpecies();

    console.log('⏰ Scheduling makeSpeciesNamesClickable...');
    // Add enhancements after a brief delay to ensure DOM is updated
    setTimeout(() => {
      console.log('🔧 Calling makeSpeciesNamesClickable now');
      makeSpeciesNamesClickable();
    }, 100);

    return result;
  };
} else {
  console.log('❌ compareSpecies NOT FOUND - cannot wrap');
}

/**
 * Add favorite indicators to dropdown options
 * This makes favorites visible in the species selection dropdowns
 */
async function addFavoriteIndicatorsToDropdowns() {
  if (!authManager || !authManager.isLoggedIn()) return;

  const uid = authManager.getCurrentUid();
  const favorites = await storageService.getFavorites(uid);

  // Get all select elements
  const selects = document.querySelectorAll('select[id^="species"]');

  selects.forEach(select => {
    // Add star indicator to option text for favorites
    Array.from(select.options).forEach(option => {
      if (!option.value) return; // Skip empty option

      const speciesKey = option.value;
      if (favorites.includes(speciesKey)) {
        // Add star emoji if not already there
        if (!option.textContent.includes('★')) {
          option.textContent = '★ ' + option.textContent;
        }
      }
    });
  });
}

/**
 * Refresh dropdown favorites when favorite is toggled
 */
const originalToggleFavorite = typeof toggleFavorite !== 'undefined' ? toggleFavorite : null;
if (originalToggleFavorite) {
  toggleFavorite = async function (speciesKey, element) {
    // Call original function
    await originalToggleFavorite(speciesKey, element);

    // Refresh dropdowns to show/hide star
    setTimeout(() => {
      addFavoriteIndicatorsToDropdowns();
    }, 100);
  };
}

/**
 * Initialize enhancements on page load
 */
function initializeEnhancements() {
  // Add favorite indicators to dropdowns if logged in
  if (authManager && authManager.isLoggedIn()) {
    addFavoriteIndicatorsToDropdowns();
  }

  // Add event listener to show favorites when user logs in
  if (authManager) {
    const originalUpdateUIForLoggedInUser = authManager.updateUIForLoggedInUser;
    authManager.updateUIForLoggedInUser = function () {
      originalUpdateUIForLoggedInUser.call(authManager);
      setTimeout(() => {
        addFavoriteIndicatorsToDropdowns();
      }, 200);
    };
  }
}

// Run enhancements when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancements);
} else {
  initializeEnhancements();
}

/**
 * Add "View Details" button to each panel
 */
function addViewDetailsButtons() {
  const panels = document.querySelectorAll('.comparison-panel');

  panels.forEach((panel, index) => {
    // Check if button already exists
    if (panel.querySelector('.view-details-btn')) return;

    const panelNum = index + 1;
    const selectId = `species${panelNum}`;
    const select = document.getElementById(selectId);

    if (!select) return;

    // Create button
    const button = document.createElement('button');
    button.className = 'btn-small view-details-btn';
    button.textContent = '📖 View Details';
    button.style.marginTop = '1rem';
    button.style.width = '100%';
    button.style.display = 'none'; // Hidden until species selected

    button.onclick = function () {
      const selectedValue = select.value;
      if (selectedValue) {
        window.location.href = `species.html?fish=${selectedValue}`;
      }
    };

    // Add button after select
    select.parentNode.insertBefore(button, select.nextSibling);

    // Show button when species is selected
    select.addEventListener('change', function () {
      if (this.value) {
        button.style.display = 'block';
      } else {
        button.style.display = 'none';
      }
    });
  });
}

// Add view details buttons on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addViewDetailsButtons);
} else {
  addViewDetailsButtons();
}
