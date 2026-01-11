/**
 * Scroll-triggered animations using IntersectionObserver
 * Provides staggered fade-in for cards as they enter the viewport
 */

/* global IntersectionObserver */

(function () {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // If user prefers reduced motion, make all elements visible immediately
    document.documentElement.classList.add('reduce-motion');
    return;
  }

  // Elements to animate on scroll
  const animatableSelectors = [
    '.glossary-item',
    '.tank-card',
    '.showcase-item',
    '.stat-card',
    '.feature-card',
    '.origin-tile',
    '.related-species-card',
    '.selector-card',
  ];

  // Create intersection observer for fade-in animations
  const fadeInObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add animation class with staggered delay based on position in view
          const element = entry.target;
          const delay = element.dataset.animationDelay || 0;
          element.style.animationDelay = `${delay}ms`;
          element.classList.add('animate-in');

          // Unobserve after animation (only animate once)
          fadeInObserver.unobserve(element);
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% visible
      rootMargin: '0px 0px -50px 0px', // Start slightly before fully in view
    }
  );

  // Initialize animations when DOM is ready
  function initScrollAnimations() {
    animatableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);

      elements.forEach((element, index) => {
        // Add base animation class
        element.classList.add('animate-on-scroll');

        // Calculate stagger delay based on position in row
        // Assuming 3-4 cards per row, stagger by 80ms
        const staggerDelay = (index % 4) * 80;
        element.dataset.animationDelay = staggerDelay;

        // Start observing
        fadeInObserver.observe(element);
      });
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }
})();
