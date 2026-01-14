/**
 * Tank Manager - Consolidated tank management functionality
 * Used by dashboard.html for tank CRUD operations
 */

window.tankManager = {
  // State
  currentTankSpecies: [],
  currentTankPlants: [],
  editingTankId: null,
  isInitialized: false,
  currentPhotoFile: null, // File object for new photo to upload
  currentPhotoUrl: null, // Preview URL for display
  existingPhotoUrl: null, // URL of existing photo (for cleanup on replace)

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
   * Get the plant selector dropdown element
   */
  getPlantSelector() {
    return document.getElementById('plant-selector');
  },

  /**
   * Get the plants list element in the form
   */
  getPlantsList() {
    return document.getElementById('plants-list');
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
  // PHOTO HANDLING
  // ============================================

  /**
   * Handle photo file selection
   */
  handlePhotoSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      authManager?.showMessage?.('Invalid file type. Please use JPEG, PNG, or WebP.', 'error');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      authManager?.showMessage?.('File too large. Maximum size is 5MB.', 'error');
      return;
    }

    // Store file and create preview
    this.currentPhotoFile = file;
    this.currentPhotoUrl = URL.createObjectURL(file);
    this.showPhotoPreview(this.currentPhotoUrl);
  },

  /**
   * Remove selected photo
   */
  removePhotoSelection() {
    // Revoke object URL if it's a blob URL
    if (this.currentPhotoUrl && this.currentPhotoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentPhotoUrl);
    }

    this.currentPhotoFile = null;
    this.currentPhotoUrl = null;

    // Show placeholder, hide preview
    const placeholder = document.getElementById('photo-upload-placeholder');
    const preview = document.getElementById('photo-upload-preview');
    const fileInput = document.getElementById('tank-photo');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
  },

  /**
   * Show photo preview
   */
  showPhotoPreview(url) {
    const placeholder = document.getElementById('photo-upload-placeholder');
    const preview = document.getElementById('photo-upload-preview');
    const previewImg = document.getElementById('photo-preview-image');

    if (placeholder) placeholder.style.display = 'none';
    if (preview) preview.style.display = 'block';
    if (previewImg) previewImg.src = url;
  },

  /**
   * Reset photo state for new form
   */
  resetPhotoState() {
    if (this.currentPhotoUrl && this.currentPhotoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentPhotoUrl);
    }
    this.currentPhotoFile = null;
    this.currentPhotoUrl = null;
    this.existingPhotoUrl = null;

    // Reset UI
    const placeholder = document.getElementById('photo-upload-placeholder');
    const preview = document.getElementById('photo-upload-preview');
    const fileInput = document.getElementById('tank-photo');

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
  },

  /**
   * Setup drag-drop for photo upload zone
   */
  setupPhotoDragDrop() {
    const zone = document.getElementById('photo-upload-zone');
    const fileInput = document.getElementById('tank-photo');
    if (!zone || !fileInput) return;

    // Click to open file picker
    zone.addEventListener('click', e => {
      if (e.target.closest('.photo-remove-btn')) return; // Don't trigger on remove button
      fileInput.click();
    });

    // Drag and drop
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files?.[0];
      if (file) {
        // Simulate file input change
        // eslint-disable-next-line no-undef
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        this.handlePhotoSelect({ target: { files: [file] } });
      }
    });
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

  /**
   * Create an empty plants list item
   */
  createEmptyPlantsItem() {
    const li = document.createElement('li');
    li.className = 'species-list-empty';
    li.textContent = 'No plants added yet';
    return li;
  },

  // ============================================
  // TANK PORTRAIT COMPONENT HELPERS
  // ============================================

  /**
   * Get species images for mosaic display
   */
  getSpeciesImages(species, maxImages = 6) {
    if (!this.hasItems(species)) return [];
    return species
      .slice(0, maxImages)
      .map(key => fishDatabase[key]?.imageUrl)
      .filter(url => url);
  },

  /**
   * Create species mosaic HTML for tank portrait
   */
  createSpeciesMosaic(images) {
    const mosaic = document.createElement('div');
    mosaic.className = 'tank-portrait-mosaic';

    if (images.length === 0) {
      mosaic.classList.add('no-images');
      const placeholder = document.createElement('div');
      placeholder.className = 'tank-portrait-placeholder';
      placeholder.textContent = 'No species images';
      mosaic.appendChild(placeholder);
      return mosaic;
    }

    if (images.length <= 2) {
      mosaic.classList.add('single-image');
      const img = document.createElement('img');
      img.src = images[0];
      img.alt = 'Tank species';
      img.loading = 'lazy';
      mosaic.appendChild(img);
    } else {
      // Grid of images
      images.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Species';
        img.loading = 'lazy';
        mosaic.appendChild(img);
      });
    }

    return mosaic;
  },

  /**
   * Create size badge element
   */
  createSizeBadge(size) {
    const badge = document.createElement('div');
    badge.className = 'tank-portrait-badge';
    badge.textContent = `${size}g`;
    return badge;
  },

  /**
   * Create info overlay with tank name, species count, and plant count
   */
  createInfoOverlay(name, speciesCount, plantCount = 0) {
    const overlay = document.createElement('div');
    overlay.className = 'tank-portrait-overlay';

    const nameEl = document.createElement('h3');
    nameEl.className = 'tank-portrait-name';
    nameEl.textContent = name || 'Untitled Tank';
    overlay.appendChild(nameEl);

    const meta = document.createElement('span');
    meta.className = 'tank-portrait-meta';
    const parts = [];
    parts.push(`${speciesCount} species`);
    if (plantCount > 0) {
      parts.push(`${plantCount} plants`);
    }
    meta.textContent = parts.join(' • ');
    overlay.appendChild(meta);

    return overlay;
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
    this.populatePlantSelector();
    this.setupPhotoDragDrop();
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
    this.currentTankPlants = [];
    this.editingTankId = null;
    this.updateSpeciesList();
    this.updatePlantsList();

    // Reset photo state
    this.resetPhotoState();

    // Reset species search filter
    const searchInput = document.getElementById('species-search');
    if (searchInput) {
      searchInput.value = '';
      this.filterSpeciesSelector('');
    }

    // Reset plant search filter
    const plantSearchInput = document.getElementById('plant-search');
    if (plantSearchInput) {
      plantSearchInput.value = '';
      this.filterPlantSelector('');
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
    // Clean up blob URLs to prevent memory leaks
    if (this.currentPhotoUrl && this.currentPhotoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentPhotoUrl);
    }

    const formContainer = this.getFormContainer();
    if (formContainer) {
      formContainer.style.display = 'none';
    }
    this.currentTankSpecies = [];
    this.currentTankPlants = [];
    this.editingTankId = null;
    this.currentPhotoFile = null;
    this.currentPhotoUrl = null;
    this.existingPhotoUrl = null;
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

  // ============================================
  // PLANT SELECTOR METHODS
  // ============================================

  /**
   * Populate the plant selector dropdown
   */
  populatePlantSelector() {
    const selector = this.getPlantSelector();
    if (!selector || typeof plantDatabase === 'undefined') return;

    selector.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Choose a plant to add --';
    selector.appendChild(defaultOpt);

    // Sort plants by common name for easier selection
    const sortedKeys = Object.keys(plantDatabase).sort((a, b) => {
      const nameA = plantDatabase[a]?.commonName || '';
      const nameB = plantDatabase[b]?.commonName || '';
      return nameA.localeCompare(nameB);
    });

    sortedKeys.forEach(key => {
      const plant = plantDatabase[key];
      if (!plant) return;
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = plant.commonName;
      opt.dataset.searchable =
        plant.commonName.toLowerCase() + ' ' + (plant.scientificName || '').toLowerCase();
      selector.appendChild(opt);
    });
  },

  /**
   * Filter plant selector based on search input
   */
  filterPlantSelector(searchTerm) {
    const selector = this.getPlantSelector();
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
   * Add plant from dropdown to current tank
   */
  addPlantToTank() {
    const selector = this.getPlantSelector();
    const plantKey = selector?.value;

    if (!plantKey) return;

    this.addPlantToCurrentTank(plantKey);
    selector.value = '';
  },

  /**
   * Add a plant to the current tank being edited
   */
  addPlantToCurrentTank(plantKey) {
    if (!plantKey || typeof plantDatabase === 'undefined' || !plantDatabase[plantKey]) return;

    if (this.currentTankPlants.includes(plantKey)) {
      authManager.showMessage('Plant already added to this tank', 'info');
      return;
    }

    this.currentTankPlants.push(plantKey);
    this.updatePlantsList();
  },

  /**
   * Update the plants list display in the form
   */
  updatePlantsList() {
    const list = this.getPlantsList();
    if (!list) return;

    list.innerHTML = '';

    if (!this.hasItems(this.currentTankPlants)) {
      list.appendChild(this.createEmptyPlantsItem());
      return;
    }

    this.currentTankPlants.forEach(key => {
      const plant = plantDatabase[key];
      if (!plant) return;

      const li = document.createElement('li');
      li.className = 'fish-list-item';

      const infoDiv = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = plant.commonName;
      const br = document.createElement('br');
      const small = document.createElement('small');
      small.textContent = `${plant.position} • ${plant.difficulty}`;

      infoDiv.appendChild(strong);
      infoDiv.appendChild(br);
      infoDiv.appendChild(small);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'remove-fish-btn';
      btn.textContent = 'Remove';
      btn.onclick = () => this.removePlant(key);

      li.appendChild(infoDiv);
      li.appendChild(btn);
      list.appendChild(li);
    });
  },

  /**
   * Remove a plant from current tank
   */
  removePlant(plantKey) {
    this.currentTankPlants = this.currentTankPlants.filter(key => key !== plantKey);
    this.updatePlantsList();
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
    const isNewTank = !tankId;

    // Generate ID for new tanks (needed for photo upload path)
    const finalTankId = tankId || `tank_${Date.now()}`;

    let coverPhotoUrl = this.existingPhotoUrl || null;
    let newPhotoUploaded = false;

    // Handle photo upload if new photo selected
    if (this.currentPhotoFile) {
      authManager.showMessage('Uploading photo...', 'info');

      const uploadResult = await window.storageUploadTankPhoto(finalTankId, this.currentPhotoFile);

      if (uploadResult.success) {
        coverPhotoUrl = uploadResult.url;
        newPhotoUploaded = true;
        // Note: Don't delete old photo yet - wait until Firestore save succeeds
      } else {
        // Clean up blob URL on upload failure
        if (this.currentPhotoUrl && this.currentPhotoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(this.currentPhotoUrl);
        }
        this.currentPhotoFile = null;
        this.currentPhotoUrl = null;

        authManager.showMessage(`Photo upload failed: ${uploadResult.error}`, 'error');
        return;
      }
    }

    const tank = {
      id: isNewTank ? null : tankId,
      name: document.getElementById('tank-name')?.value || 'Untitled Tank',
      size: parseInt(document.getElementById('tank-size')?.value, 10) || 0,
      notes: document.getElementById('tank-notes')?.value || '',
      species: this.currentTankSpecies,
      plants: this.currentTankPlants,
      coverPhoto: coverPhotoUrl,
      updated: new Date().toISOString(),
    };

    // For new tanks, we need to pass the pre-generated ID
    if (isNewTank) {
      tank.id = finalTankId;
    }

    const result = await storageService.saveTank(uid, tank);

    if (result.success) {
      // Note: When replacing a photo, the new upload already overwrites the old file
      // at the same storage path (images/tanks/{tankId}.jpg), so no deletion needed.

      authManager.showMessage('Tank saved successfully!', 'success');
      this.cancelForm();
      await this.loadTanks();
      this.updateDashboardStats();
    } else {
      // Firestore save failed - clean up newly uploaded photo to avoid orphan
      if (newPhotoUploaded && coverPhotoUrl !== this.existingPhotoUrl) {
        await window.storageDeleteTankPhoto(finalTankId);
      }
      authManager.showMessage('Failed to save tank', 'error');
    }
  },

  /**
   * Load and display all tanks as portrait gallery
   */
  async loadTanks() {
    const container = this.getTanksContainer();
    if (!container) return;

    try {
      const uid = authManager.getCurrentUid();
      if (!uid) {
        container.innerHTML = '';
        container.appendChild(this.createGalleryEmptyState('Please log in to view your tanks.'));
        return;
      }

      const tanks = await storageService.getTanks(uid);

      if (!this.hasItems(tanks)) {
        container.innerHTML = '';
        container.appendChild(
          this.createGalleryEmptyState(
            'No tanks yet. Click the button above to create your first tank!'
          )
        );
        return;
      }

      container.innerHTML = '';
      tanks.forEach(tank => this.renderTankPortrait(container, tank));
    } catch (error) {
      console.error('Error loading tanks:', error);
      container.innerHTML = '';
      container.appendChild(
        this.createGalleryEmptyState('Error loading tanks. Please refresh the page.', true)
      );
    }
  },

  /**
   * Create empty state for gallery container
   */
  createGalleryEmptyState(message, isError = false) {
    const div = document.createElement('div');
    div.className = 'tank-gallery-empty';
    if (isError) div.classList.add('error');
    const p = document.createElement('p');
    p.textContent = message;
    div.appendChild(p);
    return div;
  },

  /**
   * Render a single tank as a portrait card
   */
  renderTankPortrait(container, tank) {
    const speciesCount = tank.species ? tank.species.length : 0;
    const plantCount = tank.plants ? tank.plants.length : 0;

    // Create portrait card
    const portrait = document.createElement('div');
    portrait.className = 'tank-portrait';
    portrait.onclick = () => window.openTankModal?.(tank.id);

    // Show cover photo if available, otherwise show species mosaic
    if (tank.coverPhoto) {
      const coverImg = document.createElement('div');
      coverImg.className = 'tank-portrait-cover';
      const img = document.createElement('img');
      img.src = tank.coverPhoto;
      img.alt = tank.name || 'Tank photo';
      img.loading = 'lazy';
      coverImg.appendChild(img);
      portrait.appendChild(coverImg);
    } else {
      const images = this.getSpeciesImages(tank.species);
      const mosaic = this.createSpeciesMosaic(images);
      portrait.appendChild(mosaic);
    }

    // Add size badge
    if (tank.size) {
      const badge = this.createSizeBadge(tank.size);
      portrait.appendChild(badge);
    }

    // Add info overlay
    const overlay = this.createInfoOverlay(tank.name, speciesCount, plantCount);
    portrait.appendChild(overlay);

    container.appendChild(portrait);
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
      this.currentTankPlants = tank.plants || [];
      this.editingTankId = tank.id;
      this.updateSpeciesList();
      this.updatePlantsList();

      // Handle existing photo
      this.resetPhotoState();
      if (tank.coverPhoto) {
        this.existingPhotoUrl = tank.coverPhoto;
        this.currentPhotoUrl = tank.coverPhoto;
        this.showPhotoPreview(tank.coverPhoto);
      }

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

    // Get tank to check for cover photo before deleting
    const tank = await storageService.getTank(uid, tankId);

    // Delete cover photo from storage if exists
    if (tank?.coverPhoto) {
      const deleteResult = await window.storageDeleteTankPhoto(tankId);
      if (!deleteResult.success) {
        console.warn('Failed to delete tank photo:', deleteResult.error);
        // Continue anyway - tank deletion is more important
      }
    }

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

function handlePhotoSelect(event) {
  window.tankManager.handlePhotoSelect(event);
}

function removePhotoSelection() {
  window.tankManager.removePhotoSelection();
}

function addPlantToTank() {
  window.tankManager.addPlantToTank();
}

function filterPlantSelector() {
  const searchInput = document.getElementById('plant-search');
  window.tankManager.filterPlantSelector(searchInput ? searchInput.value : '');
}
