/**
 * Tank Manager - Consolidated tank management functionality
 * Used by dashboard.html for tank CRUD operations
 */

window.tankManager = {
  // State
  currentTankSpecies: [],
  editingTankId: null,
  isInitialized: false,

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Check if an array has items (non-empty)
   */
  hasItems(arr) {
    return Array.isArray(arr) && arr.length > 0;
  },

  // ============================================
  // CACHED ELEMENT GETTERS
  // ============================================

  /**
   * Get the tank form container element
   */
  getFormContainer() {
    return document.getElementById('tank-form-container');
  },

  /**
   * Get the species selector dropdown element
   */
  getSpeciesSelector() {
    return document.getElementById('species-selector');
  },

  /**
   * Get the species list element in the form
   */
  getSpeciesList() {
    return document.getElementById('species-list');
  },

  /**
   * Get the tanks container element
   */
  getTanksContainer() {
    return document.getElementById('tanks-container');
  },

  /**
   * Get the tank section element
   */
  getTankSection() {
    return document.getElementById('my-tanks-section');
  },

  // ============================================
  // HTML TEMPLATE HELPERS
  // ============================================

  /**
   * Create an empty state element with a message
   */
  createEmptyState(message, isError = false) {
    const div = document.createElement('div');
    div.className = 'empty-state-small';
    if (isError) {
      div.classList.add('empty-state-error');
    }
    const p = document.createElement('p');
    p.textContent = message;
    div.appendChild(p);
    return div;
  },

  /**
   * Create an error state element with refresh link
   */
  createErrorState(errorMessage, helpMessage) {
    const div = document.createElement('div');
    div.className = 'empty-state-small empty-state-error';

    const errorP = document.createElement('p');
    errorP.className = 'error-text';
    errorP.textContent = errorMessage;
    div.appendChild(errorP);

    const helpP = document.createElement('p');
    const link = document.createElement('a');
    link.href = 'javascript:location.reload()';
    link.textContent = 'refresh the page';
    helpP.textContent = 'Please ';
    helpP.appendChild(link);
    helpP.appendChild(document.createTextNode('.'));
    div.appendChild(helpP);

    return div;
  },

  /**
   * Create an empty species list item
   */
  createEmptySpeciesItem() {
    const li = document.createElement('li');
    li.className = 'species-list-empty';
    li.textContent = 'No species added yet';
    return li;
  },

  // ============================================
  // TANK CARD COMPONENT HELPERS
  // ============================================

  /**
   * Create the base tank card element with name and meta
   */
  createCardElement(tank, speciesCount) {
    const card = document.createElement('div');
    card.className = 'tank-card';

    // Tank name
    const h3 = document.createElement('h3');
    h3.textContent = tank.name || 'Untitled Tank';
    card.appendChild(h3);

    // Meta info
    const meta = document.createElement('div');
    meta.className = 'tank-card-meta';
    meta.textContent = `${tank.size} gallons | ${speciesCount} species`;
    card.appendChild(meta);

    return card;
  },

  /**
   * Add notes section to a tank card (if notes exist)
   */
  addNotesSection(card, tank) {
    if (!tank.notes || !tank.notes.trim()) {
      return;
    }

    const notesContainer = document.createElement('div');
    notesContainer.className = 'tank-notes-container';

    const notes = document.createElement('div');
    notes.className = 'tank-notes';
    notes.textContent = tank.notes;
    notesContainer.appendChild(notes);

    // Add toggle if notes are long
    if (tank.notes.length > 100) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'tank-notes-toggle';
      toggle.textContent = 'Show more';
      toggle.onclick = e => {
        e.stopPropagation();
        notes.classList.toggle('expanded');
        toggle.textContent = notes.classList.contains('expanded') ? 'Show less' : 'Show more';
      };
      notesContainer.appendChild(toggle);
    }

    card.appendChild(notesContainer);
  },

  /**
   * Add species preview badges to a tank card
   */
  addSpeciesPreview(card, tank, speciesCount) {
    const speciesPreview = document.createElement('div');
    speciesPreview.className = 'tank-species-preview';

    if (this.hasItems(tank.species)) {
      tank.species.slice(0, 5).forEach(key => {
        const fish = fishDatabase[key];
        if (!fish) return;
        const span = document.createElement('span');
        span.className = 'species-badge';
        span.textContent = fish.commonName;
        speciesPreview.appendChild(span);
      });
      if (speciesCount > 5) {
        const more = document.createElement('span');
        more.className = 'species-badge';
        more.textContent = `+${speciesCount - 5} more`;
        speciesPreview.appendChild(more);
      }
    }

    card.appendChild(speciesPreview);
  },

  /**
   * Add action buttons (Edit, Delete) to a tank card
   */
  addActionButtons(card, tankId) {
    const actions = document.createElement('div');
    actions.className = 'tank-card-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-small';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => this.editTank(tankId);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-small btn-danger';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => this.deleteTank(tankId);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);
  },

  /**
   * Add maintenance section to a tank card (Phase 1)
   */
  addMaintenanceSection(card, tank) {
    if (window.maintenanceManager) {
      window.maintenanceManager.renderTankMaintenance(card, tank);
    }
  },

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize tank manager
   * Call this after auth is confirmed and DOM is ready
   */
  async init() {
    if (this.isInitialized) return;

    this.populateSpeciesSelector();
    await this.loadTanks();
    this.checkPendingSpecies();
    this.isInitialized = true;
  },

  /**
   * Check for pending species from species-detail page
   * Reads sessionStorage.addToTank set by species-detail.js
   */
  checkPendingSpecies() {
    const pendingSpecies = sessionStorage.getItem('addToTank');
    if (pendingSpecies) {
      sessionStorage.removeItem('addToTank');
      this.showNewTankForm();
      this.addSpeciesToCurrentTank(pendingSpecies);
      authManager.showMessage(
        `${fishDatabase[pendingSpecies]?.commonName || 'Species'} added to new tank`,
        'success'
      );
    }
  },

  /**
   * Add a species to the current tank being edited
   */
  addSpeciesToCurrentTank(speciesKey) {
    if (!speciesKey || !fishDatabase[speciesKey]) return;

    if (this.currentTankSpecies.includes(speciesKey)) {
      authManager.showMessage('Species already added to this tank', 'info');
      return;
    }

    this.currentTankSpecies.push(speciesKey);
    this.updateSpeciesList();
  },

  /**
   * Populate the species selector dropdown
   */
  populateSpeciesSelector() {
    const selector = this.getSpeciesSelector();
    if (!selector) return;

    selector.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Choose a species to add --';
    selector.appendChild(defaultOpt);

    // Sort fish by common name for easier selection
    const sortedKeys = Object.keys(fishDatabase).sort((a, b) => {
      const nameA = fishDatabase[a]?.commonName || '';
      const nameB = fishDatabase[b]?.commonName || '';
      return nameA.localeCompare(nameB);
    });

    sortedKeys.forEach(key => {
      const fish = fishDatabase[key];
      if (!fish) return;
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = fish.commonName;
      opt.dataset.searchable =
        fish.commonName.toLowerCase() + ' ' + (fish.scientificName || '').toLowerCase();
      selector.appendChild(opt);
    });
  },

  /**
   * Filter species selector based on search input
   */
  filterSpeciesSelector(searchTerm) {
    const selector = this.getSpeciesSelector();
    if (!selector) return;

    const term = (searchTerm || '').toLowerCase().trim();
    const options = selector.querySelectorAll('option');

    options.forEach(opt => {
      if (!opt.value) {
        // Always show the default option
        opt.style.display = '';
        return;
      }

      const searchable = opt.dataset.searchable || opt.textContent.toLowerCase();
      if (!term || searchable.includes(term)) {
        opt.style.display = '';
      } else {
        opt.style.display = 'none';
      }
    });
  },

  /**
   * Show the new tank form
   */
  showNewTankForm() {
    const formContainer = this.getFormContainer();
    if (!formContainer) return;

    formContainer.style.display = 'block';
    document.getElementById('form-title').textContent = 'Create New Tank';
    document.getElementById('tank-form').reset();
    document.getElementById('tank-id').value = '';
    this.currentTankSpecies = [];
    this.editingTankId = null;
    this.updateSpeciesList();

    // Reset species search filter
    const searchInput = document.getElementById('species-search');
    if (searchInput) {
      searchInput.value = '';
      this.filterSpeciesSelector('');
    }

    // Scroll to tank section
    const tankSection = this.getTankSection();
    if (tankSection) {
      tankSection.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   * Cancel/hide the tank form
   */
  cancelForm() {
    const formContainer = this.getFormContainer();
    if (formContainer) {
      formContainer.style.display = 'none';
    }
    this.currentTankSpecies = [];
    this.editingTankId = null;
  },

  /**
   * Add species from dropdown to current tank
   */
  addSpeciesToTank() {
    const selector = this.getSpeciesSelector();
    const speciesKey = selector?.value;

    if (!speciesKey) return;

    this.addSpeciesToCurrentTank(speciesKey);
    selector.value = '';
  },

  /**
   * Update the species list display in the form
   */
  updateSpeciesList() {
    const list = this.getSpeciesList();
    if (!list) return;

    list.innerHTML = '';

    if (!this.hasItems(this.currentTankSpecies)) {
      list.appendChild(this.createEmptySpeciesItem());
      return;
    }

    this.currentTankSpecies.forEach(key => {
      const fish = fishDatabase[key];
      if (!fish) return;

      const li = document.createElement('li');
      li.className = 'fish-list-item';

      const infoDiv = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = fish.commonName;
      const br = document.createElement('br');
      const small = document.createElement('small');
      small.textContent = `${fish.maxSize}" max size`;

      infoDiv.appendChild(strong);
      infoDiv.appendChild(br);
      infoDiv.appendChild(small);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'remove-fish-btn';
      btn.textContent = 'Remove';
      btn.onclick = () => this.removeSpecies(key);

      li.appendChild(infoDiv);
      li.appendChild(btn);
      list.appendChild(li);
    });
  },

  /**
   * Remove a species from current tank
   */
  removeSpecies(speciesKey) {
    this.currentTankSpecies = this.currentTankSpecies.filter(key => key !== speciesKey);
    this.updateSpeciesList();
  },

  /**
   * Save tank (create or update)
   */
  async saveTank(event) {
    if (event) event.preventDefault();

    const uid = authManager.getCurrentUid();
    if (!uid) {
      authManager.showMessage('Not logged in', 'error');
      return;
    }

    const tankId = document.getElementById('tank-id')?.value;

    const tank = {
      id: tankId || null,
      name: document.getElementById('tank-name')?.value || 'Untitled Tank',
      size: parseInt(document.getElementById('tank-size')?.value, 10) || 0,
      notes: document.getElementById('tank-notes')?.value || '',
      species: this.currentTankSpecies,
      updated: new Date().toISOString(),
    };

    const result = await storageService.saveTank(uid, tank);

    if (result.success) {
      authManager.showMessage('Tank saved successfully!', 'success');
      this.cancelForm();
      await this.loadTanks();
      this.updateDashboardStats();
    } else {
      authManager.showMessage('Failed to save tank', 'error');
    }
  },

  /**
   * Load and display all tanks
   */
  async loadTanks() {
    const container = this.getTanksContainer();
    if (!container) return;

    try {
      const uid = authManager.getCurrentUid();
      if (!uid) {
        container.innerHTML = '';
        container.appendChild(this.createEmptyState('Please log in to view your tanks.'));
        return;
      }

      const tanks = await storageService.getTanks(uid);

      if (!this.hasItems(tanks)) {
        container.innerHTML = '';
        container.appendChild(
          this.createEmptyState('No tanks yet. Click "Create New Tank" to get started!')
        );
        return;
      }

      container.innerHTML = '';
      tanks.forEach(tank => this.renderTankCard(container, tank));
    } catch (error) {
      console.error('Error loading tanks:', error);
      container.innerHTML = '';
      container.appendChild(this.createErrorState('Error loading tanks', 'refresh the page'));
    }
  },

  /**
   * Render a single tank card
   */
  renderTankCard(container, tank) {
    const speciesCount = tank.species ? tank.species.length : 0;

    // Create base card with name and meta
    const card = this.createCardElement(tank, speciesCount);

    // Add notes section (if present)
    this.addNotesSection(card, tank);

    // Add species preview badges
    this.addSpeciesPreview(card, tank, speciesCount);

    // Add action buttons
    this.addActionButtons(card, tank.id);

    // Append card to container
    container.appendChild(card);

    // Add maintenance section (Phase 1)
    this.addMaintenanceSection(card, tank);
  },

  /**
   * Edit an existing tank
   */
  async editTank(tankId) {
    const uid = authManager.getCurrentUid();
    if (!uid) return;

    try {
      const tank = await storageService.getTank(uid, tankId);

      if (!tank) {
        authManager.showMessage('Tank not found', 'error');
        return;
      }

      const formContainer = this.getFormContainer();
      if (formContainer) {
        formContainer.style.display = 'block';
      }
      document.getElementById('form-title').textContent = 'Edit Tank';
      document.getElementById('tank-id').value = tank.id;
      document.getElementById('tank-name').value = tank.name || '';
      document.getElementById('tank-size').value = tank.size || '';
      document.getElementById('tank-notes').value = tank.notes || '';
      this.currentTankSpecies = tank.species || [];
      this.editingTankId = tank.id;
      this.updateSpeciesList();

      // Scroll to form
      const tankSection = this.getTankSection();
      if (tankSection) {
        tankSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading tank:', error);
      authManager.showMessage('Failed to load tank', 'error');
    }
  },

  /**
   * Delete a tank
   */
  async deleteTank(tankId) {
    if (!confirm('Are you sure you want to delete this tank?')) {
      return;
    }

    const uid = authManager.getCurrentUid();
    if (!uid) return;

    const result = await storageService.deleteTank(uid, tankId);

    if (result.success) {
      authManager.showMessage('Tank deleted', 'success');
      await this.loadTanks();
      this.updateDashboardStats();
    } else {
      authManager.showMessage('Failed to delete tank', 'error');
    }
  },

  /**
   * Update dashboard stats after tank changes
   */
  async updateDashboardStats() {
    const uid = authManager.getCurrentUid();
    if (!uid) return;

    try {
      const profile = await window.firestoreGetProfile(uid);
      if (profile) {
        const tanks = profile.profile?.tanks || [];
        const tankCountEl = document.getElementById('tank-count');
        if (tankCountEl) {
          tankCountEl.textContent = tanks.length;
        }
      }
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
    }
  },
};

// Global function wrappers for onclick handlers in HTML
function showNewTankForm() {
  window.tankManager.showNewTankForm();
}

function cancelForm() {
  window.tankManager.cancelForm();
}

function addSpeciesToTank() {
  window.tankManager.addSpeciesToTank();
}

function saveTank(event) {
  window.tankManager.saveTank(event);
}

function filterSpeciesSelector() {
  const searchInput = document.getElementById('species-search');
  window.tankManager.filterSpeciesSelector(searchInput ? searchInput.value : '');
}
