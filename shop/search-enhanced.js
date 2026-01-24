// ============================================
// 安積直売所オンライン - 検索・フィルター機能
// ============================================

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    displayProductsWithInventory();
    enhanceCart();
});

// ===== 検索機能初期化 =====
function initializeSearch() {
    // 検索バーを追加
    const navbar = document.querySelector('.navbar');
    if (navbar && !document.getElementById('productSearchBar')) {
        const searchBar = document.createElement('div');
        searchBar.id = 'productSearchBar';
        searchBar.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            z-index: 999;
            background: white;
            padding: 15px 20px;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        searchBar.innerHTML = `
            <input type="text" 
                   id="searchInput" 
                   placeholder="商品名で検索..." 
                   style="flex: 1; border: none; outline: none; font-size: 16px; padding: 8px;">
            <select id="categoryFilter" 
                    style="border: none; outline: none; padding: 8px; background: #f3f4f6; border-radius: 8px; cursor: pointer;">
                <option value="all">すべて</option>
                <option value="野菜">野菜</option>
                <option value="果物">果物</option>
                <option value="加工品">加工品</option>
                <option value="その他">その他</option>
            </select>
            <button onclick="performSearch()" 
                    style="background: linear-gradient(135deg, #2d5016, #1f3910); color: white; border: none; padding: 10px 25px; border-radius: 25px; cursor: pointer; font-weight: bold;">
                🔍 検索
            </button>
        `;
        
        document.body.appendChild(searchBar);
        
        // Enterキーで検索
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        // カテゴリ変更で即座にフィルター
        document.getElementById('categoryFilter').addEventListener('change', performSearch);
    }
}

// ===== 検索実行 =====
function performSearch() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    
    const products = getSharedProducts();
    
    let filtered = products;
    
    // カテゴリでフィルター
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    // 検索語でフィルター
    if (searchTerm) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchTerm)) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }
    
    displayFilteredProducts(filtered);
}

// ===== フィルター結果表示 =====
function displayFilteredProducts(products) {
    const container = document.getElementById('productsGrid') || document.querySelector('.products-grid');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🔍</div>
                <h3 style="color: #666; margin-bottom: 10px;">商品が見つかりませんでした</h3>
                <p style="color: #999;">別のキーワードで検索してみてください</p>
            </div>
        `;
        return;
    }
    
    // 在庫情報を取得
    const inventory = typeof getSharedInventory === 'function' ? getSharedInventory() : {};

    const html = products.map(product => {
        const stock = inventory[product.id]?.stock || 0;
        const inStock = stock > 0;

        return `
            <div class="product-card" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s;" 
                 onmouseover="this.style.transform='translateY(-5px)'" 
                 onmouseout="this.style.transform='translateY(0)'">
                <div style="position: relative; padding-top: 75%; background: #f3f4f6; overflow: hidden;">
                    ${product.image ? `<img src="${product.image}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">` : `
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px;">🌾</div>
                    `}
                    ${!inStock ? '<div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">売切</div>' : ''}
                    ${stock > 0 && stock < 10 ? '<div style="position: absolute; top: 10px; right: 10px; background: #fbbf24; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">残少</div>' : ''}
                </div>
                <div style="padding: 15px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #333;">${product.name}</h3>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #666; min-height: 40px;">${product.description || '新鮮な農産物をお届けします'}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 22px; font-weight: bold; color: #2d5016;">¥${(product.price || 0).toLocaleString()}</span>
                        <span style="font-size: 13px; color: #999;">/ ${product.unit || 'kg'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #999; margin-bottom: 12px;">
                        <span>在庫: ${stock.toFixed(1)}${product.unit || 'kg'}</span>
                        <span>${product.category || '野菜'}</span>
                    </div>
                    <button onclick="addToCartEnhanced('${product.id}')" 
                            ${!inStock ? 'disabled' : ''}
                            style="width: 100%; padding: 12px; background: ${inStock ? 'linear-gradient(135deg, #2d5016, #1f3910)' : '#d1d5db'}; color: white; border: none; border-radius: 8px; cursor: ${inStock ? 'pointer' : 'not-allowed'}; font-weight: bold; transition: all 0.3s;">
                        ${inStock ? '🛒 カートに追加' : '売り切れ'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// ===== 在庫情報付き商品表示 =====
function displayProductsWithInventory() {
    if (typeof getSharedProducts !== 'function') return;
    
    const products = getSharedProducts();
    displayFilteredProducts(products);
}

// ===== カート機能強化 =====
function enhanceCart() {
    // カートアイコンに数量バッジを追加
    const cartLink = document.querySelector('a[href="cart.html"]');
    if (cartLink && !document.getElementById('cartBadge')) {
        const badge = document.createElement('span');
        badge.id = 'cartBadge';
        badge.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
        `;
        badge.textContent = '0';
        cartLink.style.position = 'relative';
        cartLink.appendChild(badge);
        
        updateCartBadge();
    }
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// ===== カート追加（改良版） =====
function addToCartEnhanced(productId) {
    if (typeof getSharedProducts !== 'function') return;
    
    const products = getSharedProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('商品が見つかりません');
        return;
    }
    
    // 在庫チェック
    const inventory = typeof getSharedInventory === 'function' ? getSharedInventory() : {};
    const stock = inventory[productId]?.stock || 0;
    
    if (stock <= 0) {
        alert('申し訳ございません。この商品は現在在庫切れです。');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // 既にカートにある場合は数量を増やす
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= stock) {
            alert('在庫数を超えて追加できません');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            unit: product.unit,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    // 追加通知
    showCartNotification(product.name);
}

// ===== カート追加通知 =====
function showCartNotification(productName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <span style="font-size: 24px;">✓</span>
        <div>
            <div style="font-weight: bold;">${productName}</div>
            <div style="font-size: 12px; opacity: 0.9;">カートに追加しました</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // アニメーション追加
    if (!document.getElementById('cartNotifStyle')) {
        const style = document.createElement('style');
        style.id = 'cartNotifStyle';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== エクスポート =====
window.performSearch = performSearch;
window.addToCartEnhanced = addToCartEnhanced;
window.displayProductsWithInventory = displayProductsWithInventory;
