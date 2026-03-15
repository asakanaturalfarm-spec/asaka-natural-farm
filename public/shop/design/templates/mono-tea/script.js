// Simple script to populate products and handle basic interactions
document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const scrollBtn = document.getElementById('scrollProductsBtn');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  // hamburger toggle
  hamburger && hamburger.addEventListener('click', () => {
    const expanded = mobileMenu.getAttribute('aria-hidden') === 'false';
    mobileMenu.setAttribute('aria-hidden', String(!expanded));
    mobileMenu.classList.toggle('open');
  });

  // scroll to products
  scrollBtn && scrollBtn.addEventListener('click', () => {
    const el = document.getElementById('products');
    el && el.scrollIntoView({behavior:'smooth'});
  });

  // load products.json
  fetch('data/products.json')
    .then(r => r.json())
    .then(list => {
      list.forEach(p => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="assets/${p.image}" alt="${p.name}">
          <div class="product-body">
            <h5>${p.name}</h5>
            <div class="price">${p.price}</div>
            <p class="unit">${p.unit || ''}</p>
          </div>`;
        productsGrid.appendChild(card);
      });
    })
    .catch(() => {
      productsGrid.innerHTML = '<p>商品情報を読み込めませんでした。</p>';
    });

  // newsletter simple handler
  const newsForm = document.getElementById('newsletterForm');
  if(newsForm){
    newsForm.addEventListener('submit', e => { e.preventDefault(); alert('購読ありがとうございます'); newsForm.reset(); });
  }
});
