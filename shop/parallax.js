// Parallax Scroll Effect - Smooth Performance
(function() {
  'use strict';

  // Detect if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const parallaxElements = document.querySelectorAll('[data-parallax]');
  if (parallaxElements.length === 0) return;

  let ticking = false;
  let scrollY = window.scrollY || window.pageYOffset;

  // Update parallax on scroll
  function updateParallax() {
    scrollY = window.scrollY || window.pageYOffset;

    parallaxElements.forEach(element => {
      const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
      const offset = scrollY * speed;

      // Use transform for better performance (GPU accelerated)
      if (element.classList.contains('parallax-layer')) {
        element.style.transform = `translateY(${offset}px)`;
      } else if (element.classList.contains('parallax-bg')) {
        element.style.backgroundPosition = `center ${offset * 0.3}px`;
      }
    });

    ticking = false;
  }

  // Request animation frame for smooth 60fps
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial calculation
  updateParallax();
})();
