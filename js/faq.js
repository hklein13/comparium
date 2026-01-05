/**
 * FAQ Page JavaScript
 * Simple accordion toggle and search functionality
 */

// Toggle FAQ accordion item
function toggleFAQ(button) {
  const item = button.closest('.faq-item');
  const wasOpen = item.classList.contains('open');

  // Close all other items (optional - remove these lines for multi-open)
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('open');
    }
  });

  // Toggle clicked item
  if (wasOpen) {
    item.classList.remove('open');
  } else {
    item.classList.add('open');
  }
}

// Filter by category
function filterCategory(category) {
  // Update active button
  document.querySelectorAll('.faq-category-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    }
  });

  // Clear search when switching categories
  document.getElementById('faqSearch').value = '';

  // Show/hide sections
  const sections = document.querySelectorAll('.faq-section');
  const items = document.querySelectorAll('.faq-item');

  if (category === 'all') {
    sections.forEach(section => (section.style.display = 'block'));
    items.forEach(item => item.classList.remove('hidden'));
  } else {
    sections.forEach(section => {
      if (section.dataset.section === category) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
    items.forEach(item => item.classList.remove('hidden'));
  }

  // Hide no results message
  document.getElementById('faqNoResults').style.display = 'none';
}

// Search FAQ
function searchFAQ() {
  const searchTerm = document.getElementById('faqSearch').value.toLowerCase().trim();
  const items = document.querySelectorAll('.faq-item');
  const sections = document.querySelectorAll('.faq-section');
  let visibleCount = 0;

  // Reset category buttons when searching
  if (searchTerm) {
    document.querySelectorAll('.faq-category-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
      }
    });

    // Show all sections when searching
    sections.forEach(section => (section.style.display = 'block'));
  }

  items.forEach(item => {
    const question = item.querySelector('.faq-question-text').textContent.toLowerCase();
    const answer = item.querySelector('.faq-answer-content').textContent.toLowerCase();
    const keywords = (item.dataset.keywords || '').toLowerCase();

    const matches =
      !searchTerm ||
      question.includes(searchTerm) ||
      answer.includes(searchTerm) ||
      keywords.includes(searchTerm);

    if (matches) {
      item.classList.remove('hidden');
      visibleCount++;
    } else {
      item.classList.add('hidden');
    }
  });

  // Hide sections with no visible items
  sections.forEach(section => {
    const visibleItems = section.querySelectorAll('.faq-item:not(.hidden)');
    if (visibleItems.length === 0 && searchTerm) {
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  // Close all accordions initially
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('open');
  });

  // Add keyboard support for accordion buttons
  document.querySelectorAll('.faq-question').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFAQ(this);
        this.setAttribute('aria-expanded', this.closest('.faq-item').classList.contains('open'));
      }
    });
  });
});
