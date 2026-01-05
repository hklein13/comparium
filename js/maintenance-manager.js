/**
 * Maintenance Manager - Tank event logging and schedule management
 * Phase 1: Enhanced Tank Management
 */

window.maintenanceManager = {
  // Event type definitions with icons and labels
  eventTypes: {
    waterChange: { icon: '💧', label: 'Water Change', quickLog: true },
    parameterTest: { icon: '🧪', label: 'Parameter Test', quickLog: true },
    filterMaintenance: { icon: '🔧', label: 'Filter Maintenance', quickLog: true },
    fishAdded: { icon: '🐟', label: 'Fish Added', quickLog: false },
    fishRemoved: { icon: '🐟', label: 'Fish Removed', quickLog: false },
    feeding: { icon: '🍽️', label: 'Special Feeding', quickLog: false },
    medication: { icon: '💊', label: 'Medication', quickLog: false },
    plantChange: { icon: '🌿', label: 'Plant Change', quickLog: false },
    equipmentChange: { icon: '⚙️', label: 'Equipment Change', quickLog: false },
    note: { icon: '📝', label: 'Note', quickLog: false },
  },

  // Cache for loaded events and schedules
  eventsCache: {},
  schedulesCache: {},

  /**
   * Initialize maintenance features for the dashboard
   */
  async init() {
    // Add modal container to body if not exists
    if (!document.getElementById('event-modal-container')) {
      const container = document.createElement('div');
      container.id = 'event-modal-container';
      document.body.appendChild(container);
    }
  },

  /**
   * Get formatted event type info
   */
  getEventTypeInfo(type) {
    return this.eventTypes[type] || { icon: '📌', label: type };
  },

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  },

  /**
   * Format due date for schedules
   */
  formatDueDate(dateString) {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.round((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, class: 'overdue' };
    } else if (diffDays === 0) {
      return { text: 'Due today', class: 'due-today' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', class: 'due-soon' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, class: 'due-soon' };
    } else {
      return { text: `Due in ${diffDays} days`, class: '' };
    }
  },

  /**
   * Load events for a tank
   */
  async loadTankEvents(tankId) {
    const uid = window.getFirebaseUid?.();
    if (!uid || !tankId) return [];

    try {
      const events = await window.firestoreGetTankEvents(uid, tankId, 10);
      this.eventsCache[tankId] = events;
      return events;
    } catch (e) {
      console.error('Error loading tank events:', e);
      return [];
    }
  },

  /**
   * Load schedules for a tank
   */
  async loadTankSchedules(tankId) {
    const uid = window.getFirebaseUid?.();
    if (!uid || !tankId) return [];

    try {
      const schedules = await window.firestoreGetTankSchedules(uid, tankId);
      this.schedulesCache[tankId] = schedules;
      return schedules;
    } catch (e) {
      console.error('Error loading tank schedules:', e);
      return [];
    }
  },

  /**
   * Quick log an event (water change, parameter test, etc.)
   */
  async quickLogEvent(tankId, eventType) {
    const uid = window.getFirebaseUid?.();
    if (!uid) {
      authManager?.showMessage?.('Please log in to track maintenance', 'error');
      return false;
    }

    try {
      const result = await window.firestoreAddTankEvent(uid, {
        tankId: tankId,
        type: eventType,
        date: new Date().toISOString(),
        notes: '',
        data: {},
      });

      if (result.success) {
        authManager?.showMessage?.(`${this.getEventTypeInfo(eventType).label} logged!`, 'success');
        // Refresh the tank card's event display
        await this.refreshTankMaintenance(tankId);
        return true;
      } else {
        throw new Error('Failed to log event');
      }
    } catch (e) {
      console.error('Error logging event:', e);
      authManager?.showMessage?.('Failed to log event', 'error');
      return false;
    }
  },

  /**
   * Open detailed event logging modal
   */
  openEventModal(tankId, tankName, preselectedType = null) {
    const container = document.getElementById('event-modal-container');
    if (!container) return;

    const modal = document.createElement('div');
    modal.className = 'event-modal-overlay';
    modal.onclick = e => {
      if (e.target === modal) this.closeEventModal();
    };

    modal.innerHTML = `
            <div class="event-modal">
                <div class="event-modal-header">
                    <h3>Log Event - ${tankName}</h3>
                    <button class="event-modal-close" onclick="maintenanceManager.closeEventModal()">&times;</button>
                </div>
                <div class="event-modal-body">
                    <form class="event-form" id="event-log-form">
                        <input type="hidden" id="event-tank-id" value="${tankId}">

                        <div class="form-group">
                            <label>Event Type</label>
                            <div class="event-type-grid" id="event-type-grid">
                                ${Object.entries(this.eventTypes)
                                  .map(
                                    ([key, info]) => `
                                    <label class="event-type-option ${preselectedType === key ? 'selected' : ''}" data-type="${key}">
                                        <input type="radio" name="eventType" value="${key}" ${preselectedType === key ? 'checked' : ''}>
                                        <span class="event-type-icon">${info.icon}</span>
                                        <span class="event-type-label">${info.label}</span>
                                    </label>
                                `
                                  )
                                  .join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="event-date">Date</label>
                            <input type="datetime-local" id="event-date" value="${new Date().toISOString().slice(0, 16)}">
                        </div>

                        <div class="form-group">
                            <label for="event-notes">Notes (Optional)</label>
                            <textarea id="event-notes" rows="3" placeholder="Any details to remember..."></textarea>
                        </div>

                        <div id="event-extra-fields"></div>
                    </form>
                </div>
                <div class="event-modal-footer">
                    <button type="button" class="btn-small" style="background: #6b7280;" onclick="maintenanceManager.closeEventModal()">Cancel</button>
                    <button type="button" class="btn-small" onclick="maintenanceManager.submitEventForm()">Log Event</button>
                </div>
            </div>
        `;

    container.innerHTML = '';
    container.appendChild(modal);

    // Add click handlers for event type selection
    modal.querySelectorAll('.event-type-option').forEach(option => {
      option.addEventListener('click', () => {
        modal.querySelectorAll('.event-type-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        option.querySelector('input').checked = true;
        this.updateExtraFields(option.dataset.type);
      });
    });

    // Initialize extra fields if preselected
    if (preselectedType) {
      this.updateExtraFields(preselectedType);
    }
  },

  /**
   * Update extra fields based on event type
   */
  updateExtraFields(eventType) {
    const container = document.getElementById('event-extra-fields');
    if (!container) return;

    let html = '';

    switch (eventType) {
      case 'waterChange':
        html = `
                    <div class="form-group">
                        <label for="water-percent">Percentage Changed</label>
                        <select id="water-percent">
                            <option value="10">10%</option>
                            <option value="20">20%</option>
                            <option value="25" selected>25%</option>
                            <option value="30">30%</option>
                            <option value="50">50%</option>
                            <option value="75">75%</option>
                            <option value="100">100%</option>
                        </select>
                    </div>
                `;
        break;

      case 'parameterTest':
        html = `
                    <div class="form-group">
                        <label>Test Results (Optional)</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <input type="number" id="param-ammonia" placeholder="Ammonia (ppm)" step="0.1" min="0">
                            <input type="number" id="param-nitrite" placeholder="Nitrite (ppm)" step="0.1" min="0">
                            <input type="number" id="param-nitrate" placeholder="Nitrate (ppm)" step="1" min="0">
                            <input type="number" id="param-ph" placeholder="pH" step="0.1" min="0" max="14">
                        </div>
                    </div>
                `;
        break;

      case 'fishAdded':
      case 'fishRemoved':
        html = `
                    <div class="form-group">
                        <label for="fish-species">Species</label>
                        <select id="fish-species">
                            <option value="">-- Select species --</option>
                            ${Object.entries(window.fishDatabase || {})
                              .sort((a, b) =>
                                (a[1].commonName || '').localeCompare(b[1].commonName || '')
                              )
                              .map(
                                ([key, fish]) =>
                                  `<option value="${key}">${fish.commonName}</option>`
                              )
                              .join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="fish-quantity">Quantity</label>
                        <input type="number" id="fish-quantity" value="1" min="1">
                    </div>
                    ${
                      eventType === 'fishRemoved'
                        ? `
                        <div class="form-group">
                            <label for="fish-reason">Reason</label>
                            <select id="fish-reason">
                                <option value="died">Died</option>
                                <option value="rehomed">Rehomed</option>
                                <option value="returned">Returned to store</option>
                                <option value="moved">Moved to another tank</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    `
                        : ''
                    }
                `;
        break;

      case 'medication':
        html = `
                    <div class="form-group">
                        <label for="med-name">Medication Name</label>
                        <input type="text" id="med-name" placeholder="e.g., API Melafix">
                    </div>
                    <div class="form-group">
                        <label for="med-dosage">Dosage</label>
                        <input type="text" id="med-dosage" placeholder="e.g., 5ml per 10 gallons">
                    </div>
                `;
        break;
    }

    container.innerHTML = html;
  },

  /**
   * Submit the event form
   */
  async submitEventForm() {
    const tankId = document.getElementById('event-tank-id')?.value;
    const eventType = document.querySelector('input[name="eventType"]:checked')?.value;
    const eventDate = document.getElementById('event-date')?.value;
    const notes = document.getElementById('event-notes')?.value;

    if (!tankId || !eventType) {
      authManager?.showMessage?.('Please select an event type', 'error');
      return;
    }

    const uid = window.getFirebaseUid?.();
    if (!uid) {
      authManager?.showMessage?.('Please log in to track maintenance', 'error');
      return;
    }

    // Build event data based on type
    const eventData = {
      tankId: tankId,
      type: eventType,
      date: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
      notes: notes || '',
      data: {},
    };

    // Add type-specific data
    switch (eventType) {
      case 'waterChange':
        const percent = document.getElementById('water-percent')?.value;
        if (percent) eventData.data.percentChanged = parseInt(percent);
        break;

      case 'parameterTest':
        const ammonia = document.getElementById('param-ammonia')?.value;
        const nitrite = document.getElementById('param-nitrite')?.value;
        const nitrate = document.getElementById('param-nitrate')?.value;
        const ph = document.getElementById('param-ph')?.value;
        if (ammonia) eventData.data.ammonia = parseFloat(ammonia);
        if (nitrite) eventData.data.nitrite = parseFloat(nitrite);
        if (nitrate) eventData.data.nitrate = parseFloat(nitrate);
        if (ph) eventData.data.ph = parseFloat(ph);
        break;

      case 'fishAdded':
      case 'fishRemoved':
        const species = document.getElementById('fish-species')?.value;
        const quantity = document.getElementById('fish-quantity')?.value;
        const reason = document.getElementById('fish-reason')?.value;
        if (species) eventData.data.speciesKey = species;
        if (quantity) eventData.data.quantity = parseInt(quantity);
        if (reason) eventData.data.reason = reason;
        break;

      case 'medication':
        const medName = document.getElementById('med-name')?.value;
        const dosage = document.getElementById('med-dosage')?.value;
        if (medName) eventData.data.medicationName = medName;
        if (dosage) eventData.data.dosage = dosage;
        break;
    }

    try {
      const result = await window.firestoreAddTankEvent(uid, eventData);

      if (result.success) {
        authManager?.showMessage?.(`${this.getEventTypeInfo(eventType).label} logged!`, 'success');
        this.closeEventModal();
        await this.refreshTankMaintenance(tankId);
      } else {
        throw new Error('Failed to save event');
      }
    } catch (e) {
      console.error('Error saving event:', e);
      authManager?.showMessage?.('Failed to log event', 'error');
    }
  },

  /**
   * Close the event modal
   */
  closeEventModal() {
    const container = document.getElementById('event-modal-container');
    if (container) {
      container.innerHTML = '';
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId, tankId) {
    if (!confirm('Delete this event?')) return;

    const uid = window.getFirebaseUid?.();
    if (!uid) return;

    try {
      const result = await window.firestoreDeleteTankEvent(uid, eventId);
      if (result.success) {
        authManager?.showMessage?.('Event deleted', 'success');
        await this.refreshTankMaintenance(tankId);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (e) {
      console.error('Error deleting event:', e);
      authManager?.showMessage?.('Failed to delete event', 'error');
    }
  },

  /**
   * Refresh the maintenance section of a tank card
   */
  async refreshTankMaintenance(tankId) {
    const maintenanceSection = document.getElementById(`tank-maintenance-${tankId}`);
    if (!maintenanceSection) return;

    const events = await this.loadTankEvents(tankId);
    this.renderRecentEvents(maintenanceSection.querySelector('.recent-events'), events, tankId);
  },

  /**
   * Render the maintenance section for a tank card
   */
  async renderTankMaintenance(container, tank) {
    const section = document.createElement('div');
    section.className = 'tank-maintenance';
    section.id = `tank-maintenance-${tank.id}`;

    // Header with "Log Event" button
    const header = document.createElement('div');
    header.className = 'tank-maintenance-header';
    header.innerHTML = `
            <h4>Maintenance</h4>
            <button class="btn-small" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;"
                    onclick="maintenanceManager.openEventModal('${tank.id}', '${tank.name.replace(/'/g, "\\'")}')">
                + Log Event
            </button>
        `;
    section.appendChild(header);

    // Schedules section
    await this.renderTankSchedules(section, tank);

    // Quick log buttons
    const quickButtons = document.createElement('div');
    quickButtons.className = 'quick-log-buttons';

    Object.entries(this.eventTypes)
      .filter(([_, info]) => info.quickLog)
      .forEach(([type, info]) => {
        const btn = document.createElement('button');
        btn.className = 'quick-log-btn';
        btn.innerHTML = `${info.icon} ${info.label}`;
        btn.onclick = () => this.quickLogEvent(tank.id, type);
        quickButtons.appendChild(btn);
      });

    section.appendChild(quickButtons);

    // Recent events container
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'recent-events';
    section.appendChild(eventsContainer);

    container.appendChild(section);

    // Load and render events
    const events = await this.loadTankEvents(tank.id);
    this.renderRecentEvents(eventsContainer, events, tank.id);
  },

  /**
   * Render recent events list
   */
  renderRecentEvents(container, events, tankId) {
    if (!container) return;

    if (!events || events.length === 0) {
      container.innerHTML = `
                <div class="events-empty">
                    No events logged yet. Use the buttons above to start tracking!
                </div>
            `;
      return;
    }

    container.innerHTML = events
      .slice(0, 5)
      .map(event => {
        const typeInfo = this.getEventTypeInfo(event.type);
        let details = '';

        // Add type-specific details
        if (event.data) {
          if (event.data.percentChanged) {
            details = `${event.data.percentChanged}% changed`;
          } else if (event.data.speciesKey && window.fishDatabase?.[event.data.speciesKey]) {
            const fish = window.fishDatabase[event.data.speciesKey];
            details = `${event.data.quantity || 1}x ${fish.commonName}`;
          } else if (event.data.ammonia !== undefined || event.data.ph !== undefined) {
            const parts = [];
            if (event.data.ammonia !== undefined) parts.push(`NH3: ${event.data.ammonia}`);
            if (event.data.ph !== undefined) parts.push(`pH: ${event.data.ph}`);
            details = parts.join(', ');
          }
        }

        return `
                <div class="event-item">
                    <div class="event-info">
                        <div class="event-type">${typeInfo.icon} ${typeInfo.label}</div>
                        <div class="event-date">${this.formatDate(event.date)}${details ? ' - ' + details : ''}</div>
                        ${event.notes ? `<div class="event-notes">${event.notes}</div>` : ''}
                    </div>
                    <button class="event-delete" onclick="maintenanceManager.deleteEvent('${event.id}', '${tankId}')" title="Delete">
                        &times;
                    </button>
                </div>
            `;
      })
      .join('');

    if (events.length > 5) {
      container.innerHTML += `
                <a href="#" class="view-all-link" onclick="maintenanceManager.openEventModal('${tankId}', 'Tank'); return false;">
                    View all ${events.length} events
                </a>
            `;
    }
  },

  // ==========================================
  // SCHEDULE MANAGEMENT
  // ==========================================

  // Schedule type definitions
  scheduleTypes: {
    waterChange: { icon: '💧', label: 'Water Change', defaultDays: 7 },
    parameterTest: { icon: '🧪', label: 'Parameter Test', defaultDays: 7 },
    filterMaintenance: { icon: '🔧', label: 'Filter Maintenance', defaultDays: 30 },
    feeding: { icon: '🍽️', label: 'Special Feeding', defaultDays: 7 },
    glassClean: { icon: '✨', label: 'Glass Cleaning', defaultDays: 7 },
    gravel: { icon: '🪨', label: 'Gravel Vacuum', defaultDays: 14 },
    plantTrim: { icon: '🌿', label: 'Plant Trimming', defaultDays: 14 },
    custom: { icon: '📋', label: 'Custom Task', defaultDays: 7 },
  },

  /**
   * Open schedule creation/edit modal
   */
  openScheduleModal(tankId, tankName, existingSchedule = null) {
    const container = document.getElementById('event-modal-container');
    if (!container) return;

    const isEdit = !!existingSchedule;
    const scheduleType = existingSchedule?.type || 'waterChange';
    const intervalDays =
      existingSchedule?.intervalDays || this.scheduleTypes[scheduleType]?.defaultDays || 7;
    const nextDue = existingSchedule?.nextDue
      ? new Date(existingSchedule.nextDue).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const customLabel = existingSchedule?.customLabel || '';
    const enabled = existingSchedule?.enabled !== false;

    const modal = document.createElement('div');
    modal.className = 'event-modal-overlay';
    modal.onclick = e => {
      if (e.target === modal) this.closeScheduleModal();
    };

    modal.innerHTML = `
            <div class="event-modal">
                <div class="event-modal-header">
                    <h3>${isEdit ? 'Edit' : 'New'} Schedule - ${tankName}</h3>
                    <button class="event-modal-close" onclick="maintenanceManager.closeScheduleModal()">&times;</button>
                </div>
                <div class="event-modal-body">
                    <form class="event-form" id="schedule-form">
                        <input type="hidden" id="schedule-tank-id" value="${tankId}">
                        <input type="hidden" id="schedule-id" value="${existingSchedule?.id || ''}">

                        <div class="form-group">
                            <label>Task Type</label>
                            <div class="schedule-type-grid" id="schedule-type-grid">
                                ${Object.entries(this.scheduleTypes)
                                  .map(
                                    ([key, info]) => `
                                    <label class="event-type-option ${scheduleType === key ? 'selected' : ''}" data-type="${key}">
                                        <input type="radio" name="scheduleType" value="${key}" ${scheduleType === key ? 'checked' : ''}>
                                        <span class="event-type-icon">${info.icon}</span>
                                        <span class="event-type-label">${info.label}</span>
                                    </label>
                                `
                                  )
                                  .join('')}
                            </div>
                        </div>

                        <div class="form-group" id="custom-label-group" style="display: ${scheduleType === 'custom' ? 'block' : 'none'};">
                            <label for="schedule-custom-label">Custom Task Name</label>
                            <input type="text" id="schedule-custom-label" value="${customLabel}" placeholder="e.g., Check CO2 levels">
                        </div>

                        <div class="form-group">
                            <label for="schedule-interval">Repeat Every</label>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <input type="number" id="schedule-interval" value="${intervalDays}" min="1" max="365" style="width: 80px;">
                                <span>days</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="schedule-next-due">Next Due Date</label>
                            <input type="date" id="schedule-next-due" value="${nextDue}">
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" id="schedule-enabled" ${enabled ? 'checked' : ''}>
                                <span>Schedule is active</span>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="event-modal-footer">
                    ${isEdit ? `<button type="button" class="btn-small btn-danger" onclick="maintenanceManager.deleteSchedule('${existingSchedule.id}', '${tankId}')">Delete</button>` : ''}
                    <button type="button" class="btn-small" style="background: #6b7280;" onclick="maintenanceManager.closeScheduleModal()">Cancel</button>
                    <button type="button" class="btn-small" onclick="maintenanceManager.submitScheduleForm()">${isEdit ? 'Save Changes' : 'Create Schedule'}</button>
                </div>
            </div>
        `;

    container.innerHTML = '';
    container.appendChild(modal);

    // Add click handlers for type selection
    modal.querySelectorAll('.event-type-option').forEach(option => {
      option.addEventListener('click', () => {
        modal.querySelectorAll('.event-type-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        option.querySelector('input').checked = true;

        const type = option.dataset.type;
        const customGroup = document.getElementById('custom-label-group');
        if (customGroup) {
          customGroup.style.display = type === 'custom' ? 'block' : 'none';
        }

        // Update default interval for new schedules
        if (!isEdit) {
          const intervalInput = document.getElementById('schedule-interval');
          if (intervalInput && this.scheduleTypes[type]) {
            intervalInput.value = this.scheduleTypes[type].defaultDays;
          }
        }
      });
    });
  },

  /**
   * Close schedule modal
   */
  closeScheduleModal() {
    const container = document.getElementById('event-modal-container');
    if (container) {
      container.innerHTML = '';
    }
  },

  /**
   * Submit schedule form
   */
  async submitScheduleForm() {
    const tankId = document.getElementById('schedule-tank-id')?.value;
    const scheduleId = document.getElementById('schedule-id')?.value;
    const type = document.querySelector('input[name="scheduleType"]:checked')?.value;
    const intervalDays = parseInt(document.getElementById('schedule-interval')?.value) || 7;
    const nextDue = document.getElementById('schedule-next-due')?.value;
    const customLabel = document.getElementById('schedule-custom-label')?.value;
    const enabled = document.getElementById('schedule-enabled')?.checked;

    if (!tankId || !type) {
      authManager?.showMessage?.('Please select a task type', 'error');
      return;
    }

    if (type === 'custom' && !customLabel?.trim()) {
      authManager?.showMessage?.('Please enter a custom task name', 'error');
      return;
    }

    const uid = window.getFirebaseUid?.();
    if (!uid) {
      authManager?.showMessage?.('Please log in', 'error');
      return;
    }

    const scheduleData = {
      id: scheduleId || null,
      tankId: tankId,
      type: type,
      customLabel: type === 'custom' ? customLabel.trim() : '',
      intervalDays: intervalDays,
      nextDue: nextDue ? new Date(nextDue).toISOString() : new Date().toISOString(),
      enabled: enabled,
    };

    try {
      const result = await window.firestoreSaveTankSchedule(uid, scheduleData);

      if (result.success) {
        const typeInfo = this.scheduleTypes[type];
        authManager?.showMessage?.(
          `${type === 'custom' ? customLabel : typeInfo.label} schedule ${scheduleId ? 'updated' : 'created'}!`,
          'success'
        );
        this.closeScheduleModal();
        await this.refreshTankSchedules(tankId);
      } else {
        throw new Error('Failed to save schedule');
      }
    } catch (e) {
      console.error('Error saving schedule:', e);
      authManager?.showMessage?.('Failed to save schedule', 'error');
    }
  },

  /**
   * Mark schedule as complete and calculate next due date
   */
  async markScheduleComplete(scheduleId, tankId, type) {
    const uid = window.getFirebaseUid?.();
    if (!uid) return;

    try {
      // Complete the schedule (this updates nextDue automatically)
      const result = await window.firestoreCompleteSchedule(uid, scheduleId);

      if (result.success) {
        const typeInfo = this.scheduleTypes[type] || { label: 'Task' };
        authManager?.showMessage?.(`${typeInfo.label} completed!`, 'success');

        // Also log an event for the completion
        await window.firestoreAddTankEvent(uid, {
          tankId: tankId,
          type: type === 'custom' ? 'note' : type,
          date: new Date().toISOString(),
          notes: 'Completed from schedule',
          data: { fromSchedule: scheduleId },
        });

        await this.refreshTankMaintenance(tankId);
        await this.refreshTankSchedules(tankId);
      } else {
        throw new Error('Failed to complete schedule');
      }
    } catch (e) {
      console.error('Error completing schedule:', e);
      authManager?.showMessage?.('Failed to mark complete', 'error');
    }
  },

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId, tankId) {
    if (!confirm('Delete this schedule?')) return;

    const uid = window.getFirebaseUid?.();
    if (!uid) return;

    try {
      const result = await window.firestoreDeleteTankSchedule(uid, scheduleId);
      if (result.success) {
        authManager?.showMessage?.('Schedule deleted', 'success');
        this.closeScheduleModal();
        await this.refreshTankSchedules(tankId);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (e) {
      console.error('Error deleting schedule:', e);
      authManager?.showMessage?.('Failed to delete schedule', 'error');
    }
  },

  /**
   * Refresh schedules display for a tank
   */
  async refreshTankSchedules(tankId) {
    const schedulesContainer = document.getElementById(`tank-schedules-${tankId}`);
    if (!schedulesContainer) return;

    const schedules = await this.loadTankSchedules(tankId);
    const tankName = schedulesContainer.dataset.tankName || 'Tank';
    this.renderSchedulePills(schedulesContainer, schedules, tankId, tankName);
  },

  /**
   * Render schedule pills for a tank
   */
  renderSchedulePills(container, schedules, tankId, tankName) {
    if (!container) return;

    if (!schedules || schedules.length === 0) {
      container.innerHTML = `
                <div class="schedules-empty">
                    No schedules set.
                    <a href="#" onclick="maintenanceManager.openScheduleModal('${tankId}', '${tankName.replace(/'/g, "\\'")}'); return false;">
                        Create one
                    </a>
                </div>
            `;
      return;
    }

    // Sort by nextDue date
    const sortedSchedules = [...schedules].sort(
      (a, b) => new Date(a.nextDue) - new Date(b.nextDue)
    );

    container.innerHTML = sortedSchedules
      .map(schedule => {
        const typeInfo = this.scheduleTypes[schedule.type] || { icon: '📋', label: 'Task' };
        const label =
          schedule.type === 'custom' && schedule.customLabel
            ? schedule.customLabel
            : typeInfo.label;
        const dueInfo = this.formatDueDate(schedule.nextDue);
        const isDisabled = schedule.enabled === false;

        return `
                <div class="schedule-pill ${dueInfo.class} ${isDisabled ? 'disabled' : ''}"
                     onclick="maintenanceManager.openScheduleModal('${tankId}', '${tankName.replace(/'/g, "\\'")}', ${JSON.stringify(schedule).replace(/"/g, '&quot;')})">
                    <span class="schedule-icon">${typeInfo.icon}</span>
                    <span class="schedule-label">${label}</span>
                    <span class="schedule-due">${isDisabled ? 'Paused' : dueInfo.text}</span>
                    ${
                      !isDisabled
                        ? `
                        <button class="schedule-complete-btn"
                                onclick="event.stopPropagation(); maintenanceManager.markScheduleComplete('${schedule.id}', '${tankId}', '${schedule.type}')"
                                title="Mark complete">
                            ✓
                        </button>
                    `
                        : ''
                    }
                </div>
            `;
      })
      .join('');

    // Add "Add Schedule" button
    container.innerHTML += `
            <button class="add-schedule-btn"
                    onclick="maintenanceManager.openScheduleModal('${tankId}', '${tankName.replace(/'/g, "\\'")}')">
                + Add
            </button>
        `;
  },

  /**
   * Render schedules section for a tank card (called from renderTankMaintenance)
   */
  async renderTankSchedules(container, tank) {
    const section = document.createElement('div');
    section.className = 'tank-schedules';
    section.id = `tank-schedules-${tank.id}`;
    section.dataset.tankName = tank.name;

    const header = document.createElement('div');
    header.className = 'schedules-header';
    header.innerHTML = `<h5>Schedules</h5>`;
    section.appendChild(header);

    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'schedule-pills';
    section.appendChild(pillsContainer);

    container.appendChild(section);

    // Load and render schedules
    const schedules = await this.loadTankSchedules(tank.id);
    this.renderSchedulePills(pillsContainer, schedules, tank.id, tank.name);
  },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  maintenanceManager.init();
});
