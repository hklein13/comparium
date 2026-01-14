/**
 * FAQ Page JavaScript
 * Accordion toggle, search, and tab indicator functionality
 * Updated January 2026 for flat grid layout
 */

// Toggle FAQ accordion item
function toggleFAQ(button) {
  const card = button.closest('.faq-card');
  const wasOpen = card.classList.contains('open');

  // Close all other items (single-open behavior)
  document.querySelectorAll('.faq-card.open').forEach(openCard => {
    if (openCard !== card) {
      openCard.classList.remove('open');
      const btn = openCard.querySelector('.faq-card__question');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Toggle clicked item
  card.classList.toggle('open', !wasOpen);
  button.setAttribute('aria-expanded', !wasOpen ? 'true' : 'false');
}

// Filter by category - simplified for flat grid (no section wrappers)
function filterCategory(category) {
  // Update active tab
  const tabs = document.querySelectorAll('.faq-nav__tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.category === category) {
      tab.classList.add('active');
    }
  });

  // Update tab indicator
  updateTabIndicator();

  // Clear search when switching categories
  document.getElementById('faqSearch').value = '';

  // Filter cards directly (flat grid, no sections)
  const cards = document.querySelectorAll('.faq-card');
  let visibleCount = 0;

  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Show/hide no results message
  const noResults = document.getElementById('faqNoResults');
  noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

// Search FAQ - simplified for flat grid
function searchFAQ() {
  const searchTerm = document.getElementById('faqSearch').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.faq-card');
  let visibleCount = 0;

  // Reset category tabs when searching
  if (searchTerm) {
    document.querySelectorAll('.faq-nav__tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.category === 'all') {
        tab.classList.add('active');
      }
    });
    updateTabIndicator();
  }

  cards.forEach(card => {
    const question = card.querySelector('.faq-card__text').textContent.toLowerCase();
    const answer = card.querySelector('.faq-card__answer-inner').textContent.toLowerCase();
    const keywords = (card.dataset.keywords || '').toLowerCase();

    const matches =
      !searchTerm ||
      question.includes(searchTerm) ||
      answer.includes(searchTerm) ||
      keywords.includes(searchTerm);

    if (matches) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Show/hide no results message
  const noResults = document.getElementById('faqNoResults');
  noResults.style.display = visibleCount === 0 && searchTerm ? 'block' : 'none';
}

// Update tab indicator position
function updateTabIndicator() {
  const activeTab = document.querySelector('.faq-nav__tab.active');
  const indicator = document.querySelector('.faq-nav__indicator');

  if (activeTab && indicator) {
    indicator.style.left = activeTab.offsetLeft + 'px';
    indicator.style.width = activeTab.offsetWidth + 'px';
  }
}

// Placeholder for future contribution system
function showContributionModal() {
  // TODO: Implement Firebase question submission in Phase 4
  // This will open a modal with a form for:
  // - Question text
  // - Category selection
  // - Optional email for follow-up
  // Submissions will go to Firestore 'faqSubmissions' collection
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  // Close all accordions initially
  document.querySelectorAll('.faq-card').forEach(card => {
    card.classList.remove('open');
  });

  // Initialize tab indicator
  updateTabIndicator();

  // Update indicator on window resize
  window.addEventListener('resize', updateTabIndicator);

  // Add keyboard support for accordion buttons
  document.querySelectorAll('.faq-card__question').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFAQ(this);
      }
    });
  });

  // Attach contribution button handler (disabled for now)
  const askBtn = document.getElementById('askQuestionBtn');
  if (askBtn) {
    askBtn.addEventListener('click', showContributionModal);
  }
});
