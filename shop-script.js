// ========================================
// グローバル変数
// ========================================

// 税率設定
const TAX_RATE = {
    STANDARD: 0.10,    // 標準税率10%
    REDUCED: 0.08      // 軽減税率8%（食品）
};

// 販売タイプ
const SALE_TYPE = {
    NORMAL: 'normal',              // 通常販売（在庫あり）
    PRE_ORDER: 'pre_order',        // 受注生産
    OUT_OF_STOCK: 'out_of_stock'   // 在庫切れ
};

// ============================================
// 同時購入ロック管理（二重販売防止）
// ============================================
const purchaseLocks = new Map(); // productId -> { userId, timestamp, quantity }
const LOCK_TIMEOUT = 10 * 60 * 1000; // 10分でロック自動解除

// 購入ロックを取得
function acquirePurchaseLock(productId, userId, quantity) {
    const now = Date.now();
    const existingLock = purchaseLocks.get(productId);
    
    // 既存のロックが期限切れかチェック
    if (existingLock && (now - existingLock.timestamp) > LOCK_TIMEOUT) {
        purchaseLocks.delete(productId);
    }
    
    const currentLock = purchaseLocks.get(productId);
    
    // 他のユーザーがロック中
    if (currentLock && currentLock.userId !== userId) {
        const remainingTime = Math.ceil((LOCK_TIMEOUT - (now - currentLock.timestamp)) / 1000);
        return {
            success: false,
            message: `他のお客様が購入手続き中です。\n${remainingTime}秒後に再度お試しください。`
        };
    }
    
    // ロックを取得
    purchaseLocks.set(productId, {
        userId: userId,
        timestamp: now,
        quantity: quantity
    });
    
    // 自動解放タイマー
    setTimeout(() => {
        const lock = purchaseLocks.get(productId);
        if (lock && lock.userId === userId) {
            purchaseLocks.delete(productId);
            console.log(`[購入ロック] ${productId} のロックを自動解放しました`);
        }
    }, LOCK_TIMEOUT);
    
    return { success: true };
}

// 購入ロックを解放
function releasePurchaseLock(productId, userId) {
    const lock = purchaseLocks.get(productId);
    if (lock && lock.userId === userId) {
        purchaseLocks.delete(productId);
        console.log(`[購入ロック] ${productId} のロックを解放しました`);
        return true;
    }
    return false;
}

// ============================================
// セッション管理（セキュリティ強化）
// ============================================
const SESSION_KEY = 'checkout_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

// セッション作成
// 商品データ
const PRODUCTS = [
    {
        id: 'v7',
        name: '里芋',
        price: 380,
        unit: 'kg',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample1.jpg',
        description: 'ねっとりとした独特の食感',
        seasonMonths: [9, 10, 11, 12]
    },
    {
        id: 'v8',
        name: 'にんにく',
        price: 450,
        unit: '袋',
        period: '保存',
        category: '青果',
        img: 'image/seika/sample2.jpg',
        description: '風味豊かで料理の味を引き立てる',
        seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
        id: 'v9',
        name: '大根',
        price: 200,
        unit: '本',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample3.jpg',
        description: 'みずみずしく甘みたっぷり',
        seasonMonths: [11, 12, 1, 2, 3]
    },
    {
        id: 'v10',
        name: 'れんこん',
        price: 420,
        unit: 'kg',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample1.jpg',
        description: 'シャキシャキ食感が楽しめる',
        seasonMonths: [10, 11, 12, 1, 2]
    },
    {
        id: 'v11',
        name: 'ねぎ',
        price: 260,
        unit: '束',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample2.jpg',
        description: '甘みと香りが際立つ新鮮なねぎ',
        seasonMonths: [11, 12, 1, 2, 3]
    },
    {
        id: 'v12',
        name: 'ミニトマト',
        price: 380,
        unit: 'パック',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample3.jpg',
        description: '甘くてジューシーなミニトマト',
        seasonMonths: [6, 7, 8, 9]
    },
    {
        id: 'v13',
        name: '白菜',
        price: 280,
        unit: '株',
        period: '今期',
        category: '青果',
        img: 'image/seika/ハクサイ　イメージ.jpg',
        description: '鍋料理に最適な甘みのある白菜',
        seasonMonths: [11, 12, 1, 2]
    },
    {
        id: 'v14',
        name: 'トウモロコシ',
        price: 350,
        unit: '本',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample2.jpg',
        description: '粒がぎっしり詰まった甘いトウモロコシ',
        seasonMonths: [7, 8, 9]
    },
    {
        id: 'v15',
        name: 'にんじん',
        price: 240,
        unit: 'kg',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample3.jpg',
        description: '甘みが強くβカロテン豊富',
        seasonMonths: [10, 11, 12, 1, 2, 3]
    },
    {
        id: 'v16',
        name: 'なす',
        price: 290,
        unit: '袋',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample1.jpg',
        description: 'とろける食感が楽しめる',
        seasonMonths: [6, 7, 8, 9]
    },
    {
        id: 'v17',
        name: 'ブロッコリー',
        price: 320,
        unit: '株',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample2.jpg',
        description: '栄養価が高く食べ応えのあるブロッコリー',
        seasonMonths: [11, 12, 1, 2, 3]
    },
    {
        id: 'v18',
        name: '小松菜',
        price: 250,
        unit: '袋',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample3.jpg',
        description: 'カルシウム豊富な緑黄色野菜',
        seasonMonths: [11, 12, 1, 2, 3]
    },
    {
        id: 'v19',
        name: 'かぼちゃ',
        price: 300,
        unit: 'kg',
        period: '保存',
        category: '青果',
        img: 'image/seika/sample1.jpg',
        description: 'ホクホクで甘みの強いかぼちゃ',
        seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
        id: 'v20',
        name: 'ピーマン',
        price: 280,
        unit: '袋',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample2.jpg',
        description: '肉厚でビタミンC豊富',
        seasonMonths: [6, 7, 8, 9]
    },
    {
        id: 'v21',
        name: 'ショウガ',
        price: 400,
        unit: '袋',
        period: '保存',
        category: '青果',
        img: 'image/seika/sample3.jpg',
        description: '風味豊かで体を温める効果',
        seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
        id: 'v22',
        name: 'かぶ',
        price: 230,
        unit: '束',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample1.jpg',
        description: 'やわらかく甘みのあるかぶ',
        seasonMonths: [10, 11, 12, 1, 2, 3]
    },
    {
        id: 'v23',
        name: 'さつまいも',
        price: 310,
        unit: 'kg',
        period: '保存',
        category: '青果',
        img: 'image/seika/sample2.jpg',
        description: 'しっとり甘い自然の甘み',
        seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
        id: 'v24',
        name: 'ベビーリーフミックス',
        price: 350,
        unit: 'パック',
        period: '今期',
        category: '青果',
        img: 'image/seika/sample3.jpg',
        description: '色とりどりの若葉野菜ミックス',
        seasonMonths: [3, 4, 5, 6, 10, 11]
    },
    {
        id: 'c1',
        name: '手作りピクルス（無添加）',
        price: 680,
        unit: '瓶',
        period: '通年',
        category: '加工',
        img: 'image/kakou/sample4.jpg',
        description: '農園産野菜100%使用',
        seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
];

let couponGranted = localStorage.getItem('asaka_coupon_granted') === 'true';
let showAllSeika = false;
let showAllKakou = false;

// ========================================
// DOMの初期化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    renderProducts();
    setupEventListeners();
    checkCouponStatus();
});

// ========================================
// UI初期化
// ========================================

function initializeUI() {
    // モバイルメニューの初期状態
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.remove('show');

    // イベントバナーの表示
    if (!couponGranted) {
        showEventBanner();
    }
}

// ========================================
// 商品レンダリング
// ========================================

function renderProducts() {
    renderSeikaProducts();
    renderKakouProducts();
}

function renderSeikaProducts() {
    const seikaProducts = PRODUCTS.filter(p => p.category === '青果');
    const seikaGrid = document.getElementById('seika-products');
    const seikaContainer = seikaGrid?.closest('.product-category');
    
    if (!seikaGrid) return;
    
    const displayProducts = showAllSeika ? seikaProducts : seikaProducts.slice(0, 3);
    const seikaHTML = displayProducts.map(product => createProductCard(product)).join('');
    seikaGrid.innerHTML = seikaHTML;
    
    // もっと見るボタンの表示/非表示
    updateMoreButton(seikaContainer, 'seika', seikaProducts.length, showAllSeika);
}

function renderKakouProducts() {
    const kakouProducts = PRODUCTS.filter(p => p.category === '加工');
    const kakouGrid = document.getElementById('kakou-products');
    const kakouContainer = kakouGrid?.closest('.product-category');
    
    if (!kakouGrid) return;
    
    const displayProducts = showAllKakou ? kakouProducts : kakouProducts.slice(0, 3);
    const kakouHTML = displayProducts.map(product => createProductCard(product)).join('');
    kakouGrid.innerHTML = kakouHTML;
    
    // もっと見るボタンの表示/非表示
    updateMoreButton(kakouContainer, 'kakou', kakouProducts.length, showAllKakou);
}

function updateMoreButton(container, category, totalCount, showingAll) {
    if (!container) return;
    
    let moreBtn = container.querySelector('.more-products-btn');
    
    if (totalCount <= 3) {
        // 3件以下ならボタン不要
        if (moreBtn) moreBtn.remove();
        return;
    }
    
    if (!moreBtn) {
        moreBtn = document.createElement('a');
        moreBtn.className = 'more-products-btn';
        moreBtn.href = 'products.html';
        moreBtn.style.textDecoration = 'none';
        moreBtn.style.display = 'block';
        container.appendChild(moreBtn);
    }
    
    moreBtn.textContent = `もっと見る (${totalCount}件) ▼`;
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                <div class="product-image">
                    <img src="${product.img}" alt="${product.name}" loading="lazy">
                    <span class="product-badge">${product.period}</span>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">¥${product.price}</div>
                    <div class="product-unit">（${product.unit}）</div>
                </div>
            </a>
            <div class="product-info" style="padding-top: 0;">
                <button class="btn-primary" onclick="addToCart('${product.id}')">
                    カートに追加
                </button>
            </div>
        </div>
    `;
}

// ========================================
// イベントリスナー設定
// ========================================

function setupEventListeners() {
    // ハンバーガーメニュー
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('show');
    });

    // モバイルメニューリンク
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('show');
        });
    });

    // アンケートボタン
    const surveyBtn = document.getElementById('surveyBtn');
    const loginBtn = document.getElementById('loginBtn');
    const surveyModal = document.getElementById('surveyModal');
    const closeModal = document.getElementById('closeModal');
    const surveyForm = document.getElementById('surveyForm');

    surveyBtn.addEventListener('click', () => {
        surveyModal.classList.add('show');
    });

    closeModal.addEventListener('click', () => {
        surveyModal.classList.remove('show');
    });

    surveyModal.addEventListener('click', (e) => {
        if (e.target === surveyModal) {
            surveyModal.classList.remove('show');
        }
    });

    surveyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitSurvey();
    });

    // ログインボタン
    loginBtn.addEventListener('click', () => {
        alert('ログイン機能は別実装です。');
    });

    // イベントバナークローズ
    const closeBanner = document.getElementById('closeBanner');
    closeBanner.addEventListener('click', () => {
        closeEventBanner();
    });

    // ニュースレター購読
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        subscribeNewsletter();
    });

    // カートボタン
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.addEventListener('click', () => {
        alert('カート機能は別実装です。');
    });
}

// ========================================
// カート機能
// ========================================

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
        alert(`${product.name}をカートに追加しました！`);
        // 実装時はここで実際のカート機能を実装
    }
}

// ========================================
// アンケート機能
// ========================================

function submitSurvey() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const comment = document.getElementById('comment').value;

    // バリデーション
    if (!email && !name) {
        alert('メールアドレスまたはお名前のいずれかを入力してください。');
        return;
    }

    // クーポン付与
    localStorage.setItem('asaka_coupon_granted', 'true');
    couponGranted = true;

    // モーダルクローズ
    document.getElementById('surveyModal').classList.remove('show');

    // フォームリセット
    document.getElementById('surveyForm').reset();

    // サンキューメッセージ
    showNotification(
        '✅ アンケートありがとうございます！',
        '5%OFF（上限¥10,000）のクーポンコード: ASAKA5OFF を進呈いたしました。'
    );

    // イベントバナー非表示
    closeEventBanner();

    // クーポン通知表示
    showCouponNotification();
}

// ========================================
// イベントバナー
// ========================================

function showEventBanner() {
    const banner = document.getElementById('eventBanner');
    banner.classList.remove('hidden');
}

function closeEventBanner() {
    const banner = document.getElementById('eventBanner');
    banner.classList.add('hidden');
}

// ========================================
// クーポン通知
// ========================================

function checkCouponStatus() {
    if (couponGranted) {
        showCouponNotification();
    }
}

function showCouponNotification() {
    // 既存の通知があれば削除
    const existing = document.getElementById('couponNotification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'couponNotification';
    notification.className = 'coupon-notification';
    notification.innerHTML = `
        <div class="coupon-card">
            <h4>🎁 クーポンを取得済みです</h4>
            <p>コード: <strong>ASAKA5OFF</strong></p>
            <p>5%OFF（上限¥10,000）をご利用いただけます</p>
        </div>
    `;

    document.body.appendChild(notification);

    // CSSを追加
    if (!document.getElementById('coupon-styles')) {
        const style = document.createElement('style');
        style.id = 'coupon-styles';
        style.textContent = `
            .coupon-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 140;
                animation: slideInRight 0.4s ease;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .coupon-card {
                background: linear-gradient(135deg, #4caf50, #45a049);
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-width: 300px;
            }

            .coupon-card h4 {
                margin: 0 0 12px 0;
                font-size: 16px;
            }

            .coupon-card p {
                margin: 6px 0;
                font-size: 14px;
            }

            @media (max-width: 768px) {
                .coupon-notification {
                    right: 10px;
                    left: 10px;
                    top: auto;
                    bottom: 100px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 5秒後に自動削除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 5000);
}

// ========================================
// ニュースレター購読
// ========================================

function subscribeNewsletter() {
    const email = document.querySelector('.newsletter-form input').value;

    if (!email) {
        alert('メールアドレスを入力してください。');
        return;
    }

    if (!isValidEmail(email)) {
        alert('有効なメールアドレスを入力してください。');
        return;
    }

    // フォームリセット
    document.querySelector('.newsletter-form input').value = '';

    // サンキューメッセージ
    showNotification(
        '✅ 登録ありがとうございます！',
        `${email} に確認メールを送信しました。`
    );
}

// ========================================
// 通知表示
// ========================================

function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    // スタイル追加
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 140;
                animation: slideInRight 0.4s ease;
            }

            .notification-content {
                background: white;
                color: var(--text-dark);
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-width: 350px;
                border-left: 4px solid var(--primary-color);
            }

            .notification-content h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
            }

            .notification-content p {
                margin: 0;
                font-size: 14px;
                color: var(--text-light);
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                .notification {
                    right: 10px;
                    left: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 5秒後に自動削除
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ========================================
// ユーティリティ関数
// ========================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// カート機能（在庫制御・ロック機能付き）
// ========================================

// 在庫0の商品を非表示にする
function filterAvailableProducts() {
    return PRODUCTS.filter(product => {
        // 在庫チェック
        const inventory = window.InventorySync ? window.InventorySync.get(product.id) : null;
        const currentStock = inventory?.stock || product.stock || 0;
        
        // 受注生産商品は常に表示
        if (product.saleType === SALE_TYPE.PRE_ORDER) {
            return true;
        }
        
        // 在庫0時自動非表示がONの場合
        if (product.autoHideWhenOutOfStock && currentStock === 0) {
            return false;
        }
        
        return true;
    });
}

// 販売可能かチェック（受注生産対応）
function checkProductAvailability(productId, requestedQuantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        return { available: false, message: '商品が見つかりません' };
    }
    
    // 受注生産の場合
    if (product.saleType === SALE_TYPE.PRE_ORDER) {
        return {
            available: true,
            type: 'pre_order',
            message: `受注生産商品です。発送まで約${product.preOrderLeadTime}日かかります。`,
            leadTime: product.preOrderLeadTime
        };
    }
    
    // 通常販売の在庫チェック
    const inventory = window.InventorySync ? window.InventorySync.get(productId) : null;
    const currentStock = inventory?.stock || product.stock || 0;
    
    if (currentStock === 0) {
        return {
            available: false,
            type: 'out_of_stock',
            message: '申し訳ございません。現在在庫切れです。'
        };
    }
    
    if (currentStock < requestedQuantity) {
        return {
            available: false,
            type: 'insufficient_stock',
            message: `在庫が不足しています。\n現在の在庫：${currentStock}${product.unit}`,
            currentStock: currentStock
        };
    }
    
    // 注文数制限チェック
    if (requestedQuantity < product.minOrder) {
        return {
            available: false,
            message: `最小注文数は${product.minOrder}${product.unit}です。`
        };
    }
    
    if (requestedQuantity > product.maxOrder) {
        return {
            available: false,
            message: `最大注文数は${product.maxOrder}${product.unit}です。`
        };
    }
    
    return {
        available: true,
        type: 'normal',
        currentStock: currentStock
    };
}

function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    // 1. 販売可能性チェック（受注生産対応）
    const availability = checkProductAvailability(productId, 1);
    
    if (!availability.available) {
        alert(availability.message);
        return;
    }
    
    // 2. 同時購入ロック取得（二重販売防止）
    const userId = window.Auth?.getCurrentUser()?.id || 'guest_' + Date.now();
    const lockResult = acquirePurchaseLock(productId, userId, 1);
    
    if (!lockResult.success) {
        alert(lockResult.message);
        return;
    }
    
    // 3. カートデータを取得
    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // 既存のカートアイテムを確認
    const existingItem = cartItems.find(item => item.id === productId);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentCartQuantity + 1;
    
    // 4. 再度在庫チェック（念のため）
    const recheckAvailability = checkProductAvailability(productId, newQuantity);
    if (!recheckAvailability.available) {
        releasePurchaseLock(productId, userId);
        alert(recheckAvailability.message);
        return;
    }
    
    // 5. カートに追加
    if (existingItem) {
        existingItem.quantity = newQuantity;
        existingItem.saleType = product.saleType;
        existingItem.preOrderLeadTime = product.preOrderLeadTime;
    } else {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            priceWithTax: product.priceWithTax,
            taxRate: product.taxRate,
            taxType: product.taxType,
            unit: product.unit,
            image: product.img,
            description: product.description,
            quantity: 1,
            saleType: product.saleType,
            preOrderLeadTime: product.preOrderLeadTime,
            stock: recheckAvailability.currentStock
        });
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // 6. 受注生産商品の場合は注意喚起
    if (availability.type === 'pre_order') {
        showNotification(`${product.name}をカートに追加しました！\n※${availability.message}`, 'info');
    } else {
        showNotification(`${product.name}をカートに追加しました！`, 'success');
    }
    
    // 7. ロック解放（カート追加後10分で自動解放）
    setTimeout(() => {
        releasePurchaseLock(productId, userId);
    }, LOCK_TIMEOUT);
}

// ========================================
// ページ読み込み時の処理
// ========================================

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
    }
});

// ========================================
// ヒーロー画像スライドショー
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
        let currentSlide = 0;
        
        function changeSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }
        
        // 5秒ごとに画像を切り替え
        setInterval(changeSlide, 5000);
    }
    
    // 「詳しく知る」ボタンのスクロール機能
    const scrollFeaturesBtn = document.getElementById('scrollFeaturesBtn');
    if (scrollFeaturesBtn) {
        scrollFeaturesBtn.addEventListener('click', () => {
            const featuresSection = document.querySelector('.features');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});
