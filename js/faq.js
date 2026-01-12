/**
 * FAQ Page JavaScript
 * Accordion toggle, search, and tab indicator functionality
 */

// Toggle FAQ accordion item
function toggleFAQ(button) {
  const card = button.closest('.faq-card');
  const wasOpen = card.classList.contains('open');

  // Close all other items (optional - remove these lines for multi-open)
  document.querySelectorAll('.faq-card.open').forEach(openCard => {
    if (openCard !== card) {
      openCard.classList.remove('open');
      const btn = openCard.querySelector('.faq-card__question');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Toggle clicked item
  if (wasOpen) {
    card.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  } else {
    card.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
  }
}

// Filter by category
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

  // Show/hide sections
  const sections = document.querySelectorAll('.faq-section');
  const cards = document.querySelectorAll('.faq-card');

  if (category === 'all') {
    sections.forEach(section => (section.style.display = 'block'));
    cards.forEach(card => card.classList.remove('hidden'));
  } else {
    sections.forEach(section => {
      if (section.dataset.section === category) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
    cards.forEach(card => card.classList.remove('hidden'));
  }

  // Hide no results message
  document.getElementById('faqNoResults').style.display = 'none';
}

// Search FAQ
function searchFAQ() {
  const searchTerm = document.getElementById('faqSearch').value.toLowerCase().trim();
  const cards = document.querySelectorAll('.faq-card');
  const sections = document.querySelectorAll('.faq-section');
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

    // Show all sections when searching
    sections.forEach(section => (section.style.display = 'block'));
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

  // Hide sections with no visible items
  sections.forEach(section => {
    const visibleCards = section.querySelectorAll('.faq-card:not(.hidden)');
    if (visibleCards.length === 0 && searchTerm) {
      section.style.display = 'none';
    }
  });

  // Show/hide no results message
  const noResults = document.getElementById('faqNoResults');
  if (visibleCount === 0 && searchTerm) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

// Update tab indicator position
function updateTabIndicator() {
  const activeTab = document.querySelector('.faq-nav__tab.active');
  const indicator = document.querySelector('.faq-nav__indicator');

  if (activeTab && indicator) {
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = activeTab.parentElement.getBoundingClientRect();

    indicator.style.left = activeTab.offsetLeft + 'px';
    indicator.style.width = activeTab.offsetWidth + 'px';
  }
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
});
