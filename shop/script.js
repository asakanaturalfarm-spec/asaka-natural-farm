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
const acquirePurchaseLock = (productId, userId, quantity) => {
    const now = Date.now();
    const existingLock = purchaseLocks.get(productId);
    // 既存のロックが期限切れかチェック
    if (existingLock && (now - existingLock.timestamp) > LOCK_TIMEOUT) purchaseLocks.delete(productId);
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
    purchaseLocks.set(productId, { userId, timestamp: now, quantity });
    // 自動解放タイマー
    setTimeout(() => {
        const lock = purchaseLocks.get(productId);
        if (lock && lock.userId === userId) {
            purchaseLocks.delete(productId);
            console.log(`[購入ロック] ${productId} のロックを自動解放しました`);
        }
    }, LOCK_TIMEOUT);
    return { success: true };
};

// 購入ロックを解放
const releasePurchaseLock = (productId, userId) => {
    const lock = purchaseLocks.get(productId);
    if (lock && lock.userId === userId) {
        purchaseLocks.delete(productId);
        console.log(`[購入ロック] ${productId} のロックを解放しました`);
        return true;
    }
    return false;
};

// ============================================
// セッション管理（セキュリティ強化）
// ============================================
const SESSION_KEY = 'checkout_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

// セッション作成
const createCheckoutSession = cartItems => {
    const sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // 共通ロジックは common.js で管理
    // <script src="../../common.js"></script> をHTMLで読み込んでください
    // ...existing code...
};

// 商品データ配列
const PRODUCTS = [
    {
        id: 'v6',
        name: 'じゃがいも',
        price: 400,
        unit: 'kg',
        period: '保存',
        category: '青果',
        img: 'image/seika/ジャガイモ　イメージ.jpg',
        description: 'ホクホクとした食感が楽しめる',
        seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
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

const couponGranted = localStorage.getItem('asaka_coupon_granted') === 'true';
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

const initializeUI = () => {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu && mobileMenu.classList.remove('show');
    !couponGranted && showEventBanner();
};

// ========================================
// 商品レンダリング
// ========================================

const renderProducts = () => {
    renderSeikaProducts();
    renderKakouProducts();
    setTimeout(initCarousels, 100);
};

const renderSeikaProducts = () => {
    const seikaProducts = PRODUCTS.filter(({ category }) => category === '青果');
    const seikaGrid = document.getElementById('seika-products');
    if (!seikaGrid) return;
    seikaGrid.innerHTML = seikaProducts.map(createProductCard).join('');
};

const renderKakouProducts = () => {
    const kakouProducts = PRODUCTS.filter(({ category }) => category === '加工');
    const kakouGrid = document.getElementById('kakou-products');
    if (!kakouGrid) return;
    kakouGrid.innerHTML = kakouProducts.map(createProductCard).join('');
};

const createProductCard = ({ id, img, name, period, description, price, unit }) => `
    <div class="product-card">
        <a href="product.html?id=${id}" style="text-decoration: none; color: inherit;">
            <div class="product-image">
                <img src="${img}" alt="${name}" loading="lazy">
                <span class="product-badge">${period}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name">${name}</h3>
                <p class="product-description">${description}</p>
                <div class="product-price">¥${price}</div>
                <div class="product-unit">（${unit}）</div>
            </div>
        </a>
        <div class="product-info" style="padding-top: 0;">
            <button class="btn-primary" onclick="addToCart('${id}')">
                カートに追加
            </button>
        </div>
    </div>
`;

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

  surveyBtn.addEventListener('click', () => surveyModal.classList.add('show'));
  closeModal.addEventListener('click', () => surveyModal.classList.remove('show'));
  surveyModal.addEventListener('click', e => e.target === surveyModal && surveyModal.classList.remove('show'));
  surveyForm.addEventListener('submit', e => { e.preventDefault(); submitSurvey(); });
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            try {
                if (window.Auth && typeof window.Auth.isLoggedIn === 'function' && window.Auth.isLoggedIn()) {
                    window.location.href = 'shop/index.html';
                    return;
                }
            } catch (e) {}
            alert('ログイン機能は別実装です。');
        });
    }
  const closeBanner = document.getElementById('closeBanner');
  closeBanner.addEventListener('click', closeEventBanner);
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', e => { e.preventDefault(); subscribeNewsletter(); });
  const cartBtn = document.getElementById('cartBtn');
  cartBtn.addEventListener('click', () => alert('カート機能は別実装です。'));
}

// ========================================
// カート機能
// ========================================

const addToCart = productId => {
    const product = PRODUCTS.find(({ id }) => id === productId);
    product && alert(`${product.name}をカートに追加しました！`);
    // 実装時はここで実際のカート機能を実装
};

// ========================================
// アンケート機能
// ========================================

const submitSurvey = () => {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  // バリデーション
  if (!email && !name) return alert('メールアドレスまたはお名前のいずれかを入力してください。');
  localStorage.setItem('asaka_coupon_granted', 'true');
  couponGranted = true;
  document.getElementById('surveyModal').classList.remove('show');
  document.getElementById('surveyForm').reset();
  showNotification('✅ アンケートありがとうございます！', '5%OFF（上限¥10,000）のクーポンコード: ASAKA5OFF を進呈いたしました。');
  closeEventBanner();
  showCouponNotification();
};

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

const subscribeNewsletter = () => {
  const email = document.querySelector('.newsletter-form input').value;
  if (!email) return alert('メールアドレスを入力してください。');
  if (!isValidEmail(email)) return alert('有効なメールアドレスを入力してください。');
  document.querySelector('.newsletter-form input').value = '';
  showNotification('✅ 登録ありがとうございます！', `${email} に確認メールを送信しました。`);
};

// ========================================
// 通知表示
// ========================================

const showNotification = (title, message) => {
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

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ========================================
// カート機能（在庫制御・ロック機能付き）
// ========================================

// 在庫0の商品を非表示にする
const filterAvailableProducts = () =>
    PRODUCTS.filter(product => {
        const inventory = window.InventorySync ? window.InventorySync.get(product.id) : null;
        const currentStock = inventory?.stock || product.stock || 0;
        return product.saleType === SALE_TYPE.PRE_ORDER || !(product.autoHideWhenOutOfStock && currentStock === 0);
    });

// 販売可能かチェック（受注生産対応）
const checkProductAvailability = (productId, requestedQuantity = 1) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return { available: false, message: '商品が見つかりません' };
    if (product.saleType === SALE_TYPE.PRE_ORDER)
        return {
            available: true,
            type: 'pre_order',
            message: `受注生産商品です。発送まで約${product.preOrderLeadTime}日かかります。`,
            leadTime: product.preOrderLeadTime
        };
    const inventory = window.InventorySync ? window.InventorySync.get(productId) : null;
    const currentStock = inventory?.stock || product.stock || 0;
    if (currentStock === 0)
        return { available: false, type: 'out_of_stock', message: '申し訳ございません。現在在庫切れです。' };
    if (currentStock < requestedQuantity)
        return { available: false, type: 'insufficient_stock', message: `在庫が不足しています。\n現在の在庫：${currentStock}${product.unit}`, currentStock };
    if (requestedQuantity < product.minOrder)
        return { available: false, message: `最小注文数は${product.minOrder}${product.unit}です。` };
    if (requestedQuantity > product.maxOrder)
        return { available: false, message: `最大注文数は${product.maxOrder}${product.unit}です。` };
    return { available: true, type: 'normal', currentStock };
};

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
    const existingItem = cartItems.find(item => item.id === productId);
    const newQuantity = (existingItem?.quantity || 0) + 1;
    const recheckAvailability = checkProductAvailability(productId, newQuantity);
    if (!recheckAvailability.available) return releasePurchaseLock(productId, userId), alert(recheckAvailability.message);
    existingItem
      ? Object.assign(existingItem, { quantity: newQuantity, saleType: product.saleType, preOrderLeadTime: product.preOrderLeadTime })
      : cartItems.push({
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
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    showNotification(
      availability.type === 'pre_order'
        ? `${product.name}をカートに追加しました！\n※${availability.message}`
        : `${product.name}をカートに追加しました！`,
      availability.type === 'pre_order' ? 'info' : 'success'
    );
    setTimeout(() => releasePurchaseLock(productId, userId), LOCK_TIMEOUT);
}

// ========================================
// ページ読み込み時の処理
// ========================================

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  navbar.style.boxShadow = window.scrollY > 50
    ? '0 2px 12px rgba(0, 0, 0, 0.1)'
    : '0 2px 4px rgba(0, 0, 0, 0.05)';
});

// ========================================
// ヒーロー画像スライドショー
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
        let currentSlide = 0;
        const changeSlide = () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        };
        setInterval(changeSlide, 5000);
    }
    const scrollFeaturesBtn = document.getElementById('scrollFeaturesBtn');
    scrollFeaturesBtn && scrollFeaturesBtn.addEventListener('click', () => {
        const featuresSection = document.querySelector('.features');
        featuresSection && featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ========================================
// �J���[�Z���V�X�e��
// ========================================

const carousels = {};

function initCarousels() {
    // �ʃJ���[�Z��
    initCarousel('seika');
    // ���H�i�J���[�Z��
    initCarousel('kakou');
}

function initCarousel(type) {
    const carousel = document.getElementById(`${type}-products`);
    const prevBtn = document.querySelector(`[data-carousel="${type}"] .carousel-prev`);
    const nextBtn = document.querySelector(`[data-carousel="${type}"] .carousel-next`);
    const dotsContainer = document.getElementById(`${type}-dots`);
    
    if (!carousel || !prevBtn || !nextBtn) return;
    
    const cards = carousel.querySelectorAll('.product-card');
    if (cards.length === 0) return;
    
    // �J���[�Z����Ԃ�ۑ�
    carousels[type] = {
        carousel: carousel,
        cards: cards,
        currentIndex: 0,
        cardWidth: cards[0].offsetWidth + 24, // �J�[�h�� + gap
        visibleCards: getVisibleCards(),
        totalPages: Math.ceil(cards.length / getVisibleCards())
    };
    
    // �h�b�g����
    createDots(type, dotsContainer);
    
    // �{�^���C�x���g
    prevBtn.addEventListener('click', () => moveCarousel(type, -1));
    nextBtn.addEventListener('click', () => moveCarousel(type, 1));
    
    // �����ʒu�ݒ�
    updateCarousel(type);
    
    // ���T�C�Y�Ή�
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            carousels[type].visibleCards = getVisibleCards();
            carousels[type].totalPages = Math.ceil(cards.length / carousels[type].visibleCards);
            carousels[type].cardWidth = cards[0].offsetWidth + 24;
            updateCarousel(type);
            updateDots(type);
        }, 250);
    });
}

const getVisibleCards = () => {
    const width = window.innerWidth;
    return width < 480 ? 1 : width < 768 ? 2 : width < 1024 ? 3 : 4;
};

const createDots = (type, container) => {
    if (!container) return;
    const { totalPages } = carousels[type];
    container.innerHTML = '';
    Array.from({ length: totalPages }, (_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `ページ${i+1}`);
        dot.onclick = () => goToPage(type, i);
        i === 0 && dot.classList.add('active');
        container.appendChild(dot);
    });
};

const updateDots = type => {
  const dotsContainer = document.getElementById(`${type}-dots`);
  if (!dotsContainer) return;
  const { currentIndex, visibleCards, totalPages } = carousels[type];
  const currentPage = Math.floor(currentIndex / visibleCards);
  const existingDots = dotsContainer.querySelectorAll('.carousel-dot');
  if (existingDots.length !== totalPages) return createDots(type, dotsContainer);
  existingDots.forEach((dot, i) => dot.classList.toggle('active', i === currentPage));
};

const moveCarousel = (type, direction) => {
    const { cards, currentIndex, visibleCards } = carousels[type];
    const maxIndex = cards.length - visibleCards;
    const newIndex = Math.max(0, Math.min(currentIndex + direction * visibleCards, maxIndex));
    carousels[type].currentIndex = newIndex;
    updateCarousel(type);
    updateDots(type);
};

const goToPage = (type, page) => {
    const { visibleCards } = carousels[type];
    carousels[type].currentIndex = page * visibleCards;
    updateCarousel(type);
    updateDots(type);
};

const updateCarousel = type => {
    const { carousel, currentIndex, cardWidth } = carousels[type];
    const offset = -currentIndex * cardWidth;
    carousel.style.transform = `translateX(${offset}px)`;
};
