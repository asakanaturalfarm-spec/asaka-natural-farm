// Scroll-Telling Effect with Fixed Background - Modern Intersection Observer
(function() {
  'use strict';

  // ========================================
  // Navbar Scroll Effect
  // ========================================

  const navbar = document.querySelector('.navbar');
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbarScroll() {
    const scrollY = window.scrollY;
    
    if (scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateNavbarScroll);
      ticking = true;
    }
  }, { passive: true });

  // ========================================
  // Intersection Observer for Elements
  // ========================================
  
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-triggered');
      }
    });
  }, observerOptions);

  // Observe all sections with data-parallax attribute
  document.querySelectorAll('[data-parallax]').forEach(element => {
    observer.observe(element);
  });

  // Stagger feature cards
  document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.12}s`;
    observer.observe(card);
  });

  // Stagger product cards
  document.querySelectorAll('.product-card').forEach((card, index) => {
    card.style.animationDelay = `${(index % 4) * 0.1}s`;
    observer.observe(card);
  });

  // ========================================
  // Smooth Scroll Behavior with Easing
  // ========================================

  document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for buttons
    const scrollButtons = document.querySelectorAll('[id*="Btn"]');
    scrollButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        const targetId = this.getAttribute('id').replace('Btn', '');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  });

  // ========================================
  // Optional: Parallax Background Effect (subtle)
  // Use only if background images are present
  // ========================================

  function updateParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax-bg]');
    
    parallaxElements.forEach(element => {
      const parallaxValue = parseFloat(element.getAttribute('data-parallax-bg')) || 0.5;
      const elementOffset = element.getBoundingClientRect().top;
      const offset = (window.innerHeight - elementOffset) * parallaxValue;
      
      // Only apply subtle offset for visible elements
      if (elementOffset < window.innerHeight) {
        element.style.backgroundPosition = `center ${offset * 0.3}px`;
      }
    });
  }

  // Enable only if data-parallax-bg is used
  if (document.querySelectorAll('[data-parallax-bg]').length > 0) {
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax(); // Initial call
  }
})();
