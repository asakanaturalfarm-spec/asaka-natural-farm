// Infinite Loop Slider - Belt Conveyor Style Animation
(function() {
  'use strict';

  const sliders = document.querySelectorAll('.products-carousel');

  sliders.forEach(slider => {
    if (!slider.id) return;

    // Clone items for infinite loop effect
    const items = Array.from(slider.children);
    if (items.length === 0) return;

    // Add duplicates to enable seamless loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      slider.appendChild(clone);
    });

    // Get carousel controls
    const carouselType = slider.id.replace('-products', '');
    const controls = document.querySelector(`[data-carousel="${carouselType}"]`);
    if (!controls) return;

    const prevBtn = controls.querySelector('.carousel-prev');
    const nextBtn = controls.querySelector('.carousel-next');

    let currentIndex = 0;
    const itemWidth = items[0].offsetWidth + 24; // item width + gap
    const totalOriginalItems = items.length;

    // Scroll to item
    function scrollToIndex() {
      const scrollAmount = currentIndex * itemWidth;
      slider.scrollLeft = scrollAmount;
    }

    // Handle next button
    nextBtn?.addEventListener('click', () => {
      currentIndex++;
      scrollToIndex();

      // Reset to beginning when reaching the end for seamless loop
      if (currentIndex >= totalOriginalItems) {
        setTimeout(() => {
          slider.scrollLeft = 0;
          currentIndex = 0;
        }, 300);
      }
    });

    // Handle previous button
    prevBtn?.addEventListener('click', () => {
      if (currentIndex === 0) {
        currentIndex = totalOriginalItems - 1;
        setTimeout(() => {
          scrollToIndex();
        }, 10);
      } else {
        currentIndex--;
        scrollToIndex();
      }
    });

    // Optional: Auto-scroll (uncomment if desired)
    /*
    setInterval(() => {
      nextBtn?.click();
    }, 5000); // 5 seconds
    */
  });
})();
