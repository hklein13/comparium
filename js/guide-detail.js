/**
 * Guide Detail Page JavaScript
 *
 * Handles:
 * - Loading guide content from URL param
 * - Rendering article sections
 * - Generating table of contents
 * - Showing related guides
 */

/* global guidesData, guideCategories */

/**
 * Initialize guide detail page
 */
function initGuideDetail() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('guide');

  if (!slug || !guidesData[slug]) {
    showNotFound();
    return;
  }

  const guide = guidesData[slug];
  renderGuide(guide);
  renderRelatedGuides(guide);
  updateMetaTags(guide);
}

/**
 * Show not found message
 */
function showNotFound() {
  document.getElementById('guideTitle').textContent = 'Guide Not Found';
  document.getElementById('guideContent').innerHTML = `
    <p>Sorry, we couldn't find the guide you're looking for.</p>
    <p><a href="/guides">Browse all guides</a></p>
  `;
  document.getElementById('guideToc').style.display = 'none';
  document.getElementById('relatedGuides').style.display = 'none';
}

/**
 * Render the guide content
 */
function renderGuide(guide) {
  const category = guideCategories[guide.category] || { label: guide.category, color: '#4a4a4a' };

  // Update header
  document.getElementById('guideCategory').textContent = category.label;
  document.getElementById('guideCategory').style.color = category.color;
  document.getElementById('guideTitle').textContent = guide.title;
  document.getElementById('guideTime').textContent = `${guide.readTime} min read`;
  document.getElementById('guideDate').textContent = formatDate(guide.publishedAt);

  // Update page title
  document.title = `${guide.title} | Comparium`;

  // Render table of contents
  renderTableOfContents(guide.sections);

  // Render content sections
  const content = document.getElementById('guideContent');
  content.innerHTML = guide.sections
    .map(
      section => `
    <section class="guide-section" id="${section.id}">
      <h2>${section.heading}</h2>
      ${section.content}
    </section>
  `
    )
    .join('');
}

/**
 * Render table of contents from sections
 */
function renderTableOfContents(sections) {
  const tocList = document.getElementById('tocList');
  tocList.innerHTML = sections
    .map(
      section => `
    <li><a href="#${section.id}">${section.heading}</a></li>
  `
    )
    .join('');
}

/**
 * Render related guides (same category, excluding current)
 */
function renderRelatedGuides(currentGuide) {
  const related = Object.values(guidesData)
    .filter(g => g.slug !== currentGuide.slug)
    .filter(g => g.category === currentGuide.category)
    .slice(0, 3);

  const container = document.getElementById('relatedGuides');

  if (related.length === 0) {
    // Show other guides if none in same category
    const others = Object.values(guidesData)
      .filter(g => g.slug !== currentGuide.slug)
      .slice(0, 3);

    if (others.length === 0) {
      document.querySelector('.guide-related').style.display = 'none';
      return;
    }

    container.innerHTML = others.map(guide => createRelatedCard(guide)).join('');
    return;
  }

  container.innerHTML = related.map(guide => createRelatedCard(guide)).join('');
}

/**
 * Create HTML for a related guide card
 */
function createRelatedCard(guide) {
  const category = guideCategories[guide.category] || { label: guide.category, color: '#4a4a4a' };

  return `
    <a href="/guide?guide=${guide.slug}" class="guide-card guide-card--small">
      <div class="guide-card__content">
        <span class="guide-card__category" style="color: ${category.color}">${category.label}</span>
        <h3 class="guide-card__title">${guide.title}</h3>
        <span class="guide-card__time">${guide.readTime} min read</span>
      </div>
    </a>
  `;
}

/**
 * Update meta tags for SEO
 */
function updateMetaTags(guide) {
  // Update description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = guide.description;

  // Update OG tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = `${guide.title} | Comparium`;

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = guide.description;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = `https://comparium.net/guide?guide=${guide.slug}`;

  // Update Twitter tags
  const twTitle = document.querySelector('meta[property="twitter:title"]');
  if (twTitle) twTitle.content = `${guide.title} | Comparium`;

  const twDesc = document.querySelector('meta[property="twitter:description"]');
  if (twDesc) twDesc.content = guide.description;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initGuideDetail);
