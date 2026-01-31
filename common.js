/**
 * common.js
 * 安積自然農園 共通ロジック集約
 * 主要な定数・関数を英語名で統一
 */

// 定数
/**
 * 税率定数
 */
const TAX_RATE = {
    STANDARD: 0.10,    // 標準税率10%
    REDUCED: 0.08      // 軽減税率8%
};

/**
 * 販売種別
 */
const SALE_TYPE = {
    NORMAL: 'normal',
    PRE_ORDER: 'pre_order',
    OUT_OF_STOCK: 'out_of_stock'
};

const LOCK_TIMEOUT = 10 * 60 * 1000; // 10分
const SESSION_KEY = 'checkout_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

// 購入ロック管理
/**
 * 購入ロック管理用Map
 * @type {Map<string, {userId: string, timestamp: number, quantity: number}>}
 */
const purchaseLocks = new Map();

/**
 * 購入ロックを取得
 * @param {string} productId
 * @param {string} userId
 * @param {number} quantity
 * @returns {{success: boolean, message?: string}}
 */
const acquirePurchaseLock = (productId, userId, quantity) => {
    const now = Date.now();
    const existingLock = purchaseLocks.get(productId);
    if (existingLock && now - existingLock.timestamp > LOCK_TIMEOUT) purchaseLocks.delete(productId);
    const currentLock = purchaseLocks.get(productId);
    if (currentLock && currentLock.userId !== userId) {
        const remainingTime = Math.ceil((LOCK_TIMEOUT - (now - currentLock.timestamp)) / 1000);
        return {
            success: false,
            message: `他のお客様が購入手続き中です。\n${remainingTime}秒後に再度お試しください。`
        };
    }
    purchaseLocks.set(productId, { userId, timestamp: now, quantity });
    setTimeout(() => {
        const lock = purchaseLocks.get(productId);
        if (lock?.userId === userId) purchaseLocks.delete(productId);
    }, LOCK_TIMEOUT);
    return { success: true };
};

/**
 * 購入ロックを解除
 * @param {string} productId
 * @param {string} userId
 * @returns {boolean}
 */
const releasePurchaseLock = (productId, userId) => {
    const lock = purchaseLocks.get(productId);
    return lock?.userId === userId ? (purchaseLocks.delete(productId), true) : false;
};

// セッション管理
/**
 * チェックアウトセッションを作成
 * @param {Array} cartItems
 * @returns {object}
 */
const createCheckoutSession = cartItems => {
    const sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
        id: sessionId,
        userId: window.Auth?.getCurrentUser()?.id || 'guest',
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TIMEOUT,
        cartItems,
        verified: false,
        calculationHash: null
    };
    sessionStorage.setItem(SESSION_KEY, btoa(JSON.stringify(session)));
    return session;
};
/**
 * チェックアウトセッションを取得
 * @returns {object|null}
 */
const getCheckoutSession = () => {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    try {
        const session = JSON.parse(atob(sessionData));
        if (Date.now() > session.expiresAt) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session;
    } catch {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
    }
};
/**
 * チェックアウトセッションを更新
 * @param {object} updates
 * @returns {object|null}
 */
const updateCheckoutSession = updates => {
    const session = getCheckoutSession();
    if (!session) return null;
    const updatedSession = { ...session, ...updates };
    sessionStorage.setItem(SESSION_KEY, btoa(JSON.stringify(updatedSession)));
    return updatedSession;
};
/**
 * チェックアウトセッションをクリア
 */
const clearCheckoutSession = () => sessionStorage.removeItem(SESSION_KEY);

// 金額計算
/**
 * 商品IDから商品情報を取得
 * @param {string} productId
 * @param {Array} products
 * @returns {object}
 */
const getProductById = (productId, products) => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error(`商品ID ${productId} が見つかりません`);
    return product;
};

/**
 * カート合計金額を再計算
 * @param {Array} cartItems
 * @param {Array} products
 * @returns {object}
 */
const recalculateOrderTotal = (cartItems, products) => {
    if (!Array.isArray(cartItems) || !cartItems.length) throw new Error('カートが空です');
    let subtotal = 0, totalTax = 0, totalWithTax = 0;
    const itemDetails = cartItems.map(cartItem => {
        const productData = getProductById(cartItem.id, products);
        const quantity = parseInt(cartItem.quantity);
        if (isNaN(quantity) || quantity < 1) throw new Error(`${productData.name}の数量が不正です`);
        const itemSubtotal = productData.price * quantity;
        const itemTax = Math.floor(itemSubtotal * productData.taxRate);
        const itemTotal = itemSubtotal + itemTax;
        subtotal += itemSubtotal;
        totalTax += itemTax;
        totalWithTax += itemTotal;
        return { ...productData, quantity, subtotal: itemSubtotal, tax: itemTax, total: itemTotal };
    });
    return { items: itemDetails, subtotal, totalTax, totalWithTax, finalTotal: totalWithTax };
};

/**
 * 注文金額の検証
 * @param {number} clientTotal
 * @param {object} serverCalculation
 * @returns {object}
 */
const verifyOrderAmount = (clientTotal, serverCalculation) => {
    const difference = Math.abs(clientTotal - serverCalculation.finalTotal);
    return difference > 1
        ? { valid: false, message: '金額に不整合があります。カートを確認してください。', tampering: true }
        : { valid: true, serverCalculation };
};

/**
 * 通知表示（実装は各画面で上書き可）
 * @param {string} title
 * @param {string} message
 */
function showNotification(title, message) {
    // ...既存のshowNotification実装を移植...
}

/**
 * メールアドレスバリデーション
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 必要に応じて他の共通関数もここに追加

/**
 * 検索ページ用カート追加（productId指定）
 * @param {string} productId
 */
const addToCartEnhancedCommon = productId => {
    if (typeof getSharedProducts !== 'function') return;
    const products = getSharedProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return alert('商品が見つかりません');
    const inventory = typeof getSharedInventory === 'function' ? getSharedInventory() : {};
    const stock = inventory[productId]?.stock || 0;
    if (stock <= 0) return alert('申し訳ございません。この商品は現在在庫切れです。');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        if (existingItem.quantity >= stock) return alert('在庫数を超えて追加できません');
        existingItem.quantity++;
    } else {
        cart.push({
            productId,
            name: product.name,
            price: product.price,
            unit: product.unit,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
    showCartNotificationCommon(product.name);
};

/**
 * 検索ページ用通知
 * @param {string} productName
 */
const showCartNotificationCommon = productName => {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:15px 25px;border-radius:12px;box-shadow:0 4px 16px rgba(16,185,129,.4);z-index:10000;display:flex;align-items:center;gap:10px;animation:slideIn .3s ease-out;`;
    notification.innerHTML = `
        <span style="font-size:24px;">✓</span>
        <div><div style="font-weight:bold;">${productName}</div><div style="font-size:12px;opacity:.9;">カートに追加しました</div></div>
    `;
    document.body.appendChild(notification);
    if (!document.getElementById('cartNotifStyle')) {
        const style = document.createElement('style');
        style.id = 'cartNotifStyle';
        style.textContent = `@keyframes slideIn{from{transform:translateX(100px);opacity:0;}to{transform:translateX(0);opacity:1;}}`;
        document.head.appendChild(style);
    }
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

/**
 * カート追加（product: {id, name, price, quantity}）
 * @param {object} product
 */
const addToCart = product => {
        if (!product?.id || !product?.name || !product?.price || !product?.quantity) return alert('商品情報が不正です');
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === product.id);
        existing ? existing.quantity += product.quantity : cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification(`${product.name} を${product.quantity}個カートに追加しました`, 'info');
        confirm('カートを確認しますか？') && (window.location.href = 'cart.html');
};
