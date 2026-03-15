/**
 * script.js
 * 安積自然農園 サイト共通スクリプト
 * - 商品データ・UI初期化・イベント処理など
 *
 * 【編集・拡張方針】
 * - 商品データやUI仕様変更時は本ファイルを編集
 * - 共通化できる処理は asaka-hub.js, common.js へ
 */
// 商品データ（サンプル）
const PRODUCTS = [
    { id: 'v1', name: 'にんじん', img: 'image/seika/sample1.jpg', category: '青果', period: '今期', description: '甘みの強いにんじん', price: 200, unit: 'kg' },
    { id: 'v2', name: 'トマト', img: 'image/seika/sample2.jpg', category: '青果', period: '今期', description: 'ジューシーなトマト', price: 250, unit: 'kg' },
    { id: 'c1', name: 'ピクルス', img: 'image/kakou/sample3.jpg', category: '加工', period: '通年', description: '自家製ピクルス', price: 600, unit: '瓶' }
];

/**
 * Hamburger menu toggle (for all pages)
 */
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
        menuToggle.classList.toggle('active');
    });

    // Close menu on link click
    nav.querySelectorAll('.nav-link').forEach(link =>
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            menuToggle.classList.remove('active');
        })
    );
});

// --- 以降は共通ロジックを common.js で管理 ---
// <script src="common.js"></script> をHTMLで読み込んでください
// ...existing code...


/**
 * クーポン付与済みかどうか
 * @type {boolean}
 */
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


/**
 * UI初期化
 */
const initializeUI = () => {
        // モバイルメニューの初期状態
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu && mobileMenu.classList.remove('show');
        // イベントバナーの表示
        !couponGranted && showEventBanner();
};

// ========================================
// 商品レンダリング
// ========================================


/**
 * 商品リストを描画
 */
const renderProducts = () => {
    renderSeikaProducts();
    renderKakouProducts();
    // カルーセル初期化（レンダリング後に実行）
    setTimeout(initCarousels, 100);
};


/**
 * 青果商品を描画
 */
const renderSeikaProducts = () => {
    const seikaProducts = PRODUCTS.filter(({ category }) => category === '青果');
    const seikaGrid = document.getElementById('seika-products');
    if (!seikaGrid) return;
    seikaGrid.innerHTML = seikaProducts.map(createProductCard).join('');
};

/**
 * 加工商品を描画
 */
const renderKakouProducts = () => {
    const kakouProducts = PRODUCTS.filter(({ category }) => category === '加工');
    const kakouGrid = document.getElementById('kakou-products');
    if (!kakouGrid) return;
    kakouGrid.innerHTML = kakouProducts.map(createProductCard).join('');
};

/**
 * 商品カードHTML生成
 * @param {object} product
 * @returns {string}
 */
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
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('show');
        });
    }

    // モバイルメニュー内の全リンクで閉じる
    const mobileMenuLinks = document.querySelectorAll('#mobileMenu a, #mobileMenu .btn-secondary');
    if (hamburger && mobileMenu && mobileMenuLinks.length > 0) {
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('show');
            });
        });
    }

    // アンケートボタン

    const surveyBtn = document.getElementById('surveyBtn');
    const loginBtn = document.getElementById('loginBtn');
    const surveyModal = document.getElementById('surveyModal');
    const closeModal = document.getElementById('closeModal');
    const surveyForm = document.getElementById('surveyForm');

    if (surveyBtn && surveyModal) {
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
    }

    // ログインボタン
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            // すでにログイン済みならshop/index.htmlへ遷移
            try {
                if (window.Auth && typeof window.Auth.isLoggedIn === 'function' && window.Auth.isLoggedIn()) {
                    window.location.href = 'shop/index.html';
                    return;
                }
            } catch (e) {}
            alert('ログイン機能は別実装です。');
        });
    }

    // イベントバナークローズ
    const closeBanner = document.getElementById('closeBanner');
    if (closeBanner) {
        closeBanner.addEventListener('click', () => {
            closeEventBanner();
        });
    }

    // ニュースレター購読
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            subscribeNewsletter();
        });
    }

    // カートボタン
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            alert('カート機能は別実装です。');
        });
    }
}

// ========================================
// カート機能
// ========================================

// addToCartはcommon.jsのものを利用
// （ここでsetupEventListenersの関数本体終了）

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
    if (!banner) return;
    banner.classList.remove('hidden');
}

function closeEventBanner() {
    const banner = document.getElementById('eventBanner');
    if (!banner) return;
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

// showNotificationはcommon.jsのものを利用

// ========================================
// ユーティリティ関数
// ========================================

// isValidEmailはcommon.jsのものを利用

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
    if (!navbar) return;
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

function getVisibleCards() {
    const width = window.innerWidth;
    if (width < 480) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    return 4;
}

function createDots(type, container) {
    if (!container) return;
    const { totalPages } = carousels[type];
    container.innerHTML = '';
    
    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `ページ${i+1}` );
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToPage(type, i));
        container.appendChild(dot);
    }
}

function updateDots(type) {
    const dotsContainer = document.getElementById(`${type}-dots`);
    if (!dotsContainer) return;
    
    const { currentIndex, visibleCards, totalPages } = carousels[type];
    const currentPage = Math.floor(currentIndex / visibleCards);
    
    // �h�b�g�����ς�����ꍇ�͍Đ���
    const existingDots = dotsContainer.querySelectorAll('.carousel-dot');
    if (existingDots.length !== totalPages) {
        createDots(type, dotsContainer);
        return;
    }
    
    existingDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentPage);
    });
}

function moveCarousel(type, direction) {
    const { cards, currentIndex, visibleCards } = carousels[type];
    const maxIndex = cards.length - visibleCards;
    
    let newIndex = currentIndex + (direction * visibleCards);
    newIndex = Math.max(0, Math.min(newIndex, maxIndex));
    
    carousels[type].currentIndex = newIndex;
    updateCarousel(type);
    updateDots(type);
}

function goToPage(type, page) {
    const { visibleCards } = carousels[type];
    carousels[type].currentIndex = page * visibleCards;
    updateCarousel(type);
    updateDots(type);
}

function updateCarousel(type) {
    const { carousel, currentIndex, cardWidth } = carousels[type];
    const offset = -currentIndex * cardWidth;
    carousel.style.transform = `translateX(${offset}px)`;
}


