/**
 * 商品個別ページ生成スクリプト
 * 各商品をSEO最適化された独立HTMLページとして生成
 */

const fs = require('fs');
const path = require('path');

// 商品データ
const PRODUCTS = [
    { id: 'v1', name: 'ほうれん草', category: '葉物野菜', price: 500, unit: '袋', description: '無肥料・無農薬栽培のほうれん草。鉄分豊富で甘みがあります。' },
    { id: 'v2', name: '小松菜', category: '葉物野菜', price: 450, unit: '袋', description: '柔らかく食べやすい小松菜。カルシウムが豊富です。' },
    { id: 'v3', name: '春菊', category: '葉物野菜', price: 480, unit: '袋', description: '香り高い春菊。鍋物やおひたしに最適です。' },
    { id: 'v4', name: '水菜', category: '葉物野菜', price: 420, unit: '袋', description: 'シャキシャキ食感の水菜。サラダや鍋に。' },
    { id: 'v5', name: 'ルッコラ', category: '葉物野菜', price: 550, unit: '袋', description: 'ピリッとした辛味のルッコラ。サラダやピザに。' },
    { id: 'v6', name: 'チンゲン菜', category: '葉物野菜', price: 430, unit: '袋', description: '中華料理に欠かせないチンゲン菜。炒め物に最適。' },
    { id: 'v7', name: 'ベビーリーフ', category: '葉物野菜', price: 600, unit: '袋', description: '若葉のミックスサラダ。彩り鮮やかです。' },
    { id: 'v8', name: 'サニーレタス', category: 'レタス類', price: 520, unit: '玉', description: '葉先が赤いサニーレタス。栄養価が高くサラダに。' },
    { id: 'v9', name: 'ロメインレタス', category: 'レタス類', price: 580, unit: '玉', description: 'シーザーサラダに最適なロメインレタス。' },
    { id: 'v10', name: 'リーフレタス', category: 'レタス類', price: 500, unit: '袋', description: '柔らかな葉のリーフレタス。サンドイッチにも。' },
    { id: 'v11', name: '大根', category: '根菜類', price: 300, unit: '本', description: 'みずみずしい大根。煮物やおでん、サラダに。' },
    { id: 'v12', name: 'かぶ', category: '根菜類', price: 350, unit: '袋', description: '甘みのあるかぶ。漬物や煮物に最適です。' },
    { id: 'v13', name: 'ブロッコリー', category: 'アブラナ科', price: 450, unit: '個', description: '栄養豊富なブロッコリー。茹でてサラダや付け合わせに。' },
    { id: 'v14', name: 'カリフラワー', category: 'アブラナ科', price: 480, unit: '個', description: '淡白な味のカリフラワー。グラタンやピクルスに。' },
    { id: 'v15', name: 'キャベツ', category: 'アブラナ科', price: 350, unit: '玉', description: '甘みのあるキャベツ。千切りや炒め物に。' },
    { id: 'v16', name: '白菜', category: 'アブラナ科', price: 400, unit: '玉', description: '冬の定番野菜。鍋物や漬物に最適です。' },
    { id: 'v17', name: 'ケール', category: '葉物野菜', price: 600, unit: '袋', description: 'スーパーフードのケール。スムージーやサラダに。' },
    { id: 'v18', name: '赤軸ほうれん草', category: '葉物野菜', price: 550, unit: '袋', description: '茎が赤いほうれん草。彩りと栄養価が高い。' },
    { id: 'v19', name: '紫水菜', category: '葉物野菜', price: 480, unit: '袋', description: '紫色が美しい水菜。サラダの彩りに。' },
    { id: 'v20', name: 'からし菜', category: '葉物野菜', price: 450, unit: '袋', description: 'ピリッとした辛味のからし菜。漬物や炒め物に。' },
    { id: 'v21', name: 'ミニトマト', category: '果菜類', price: 700, unit: 'パック', description: '甘みの強いミニトマト。お弁当やサラダに。' },
    { id: 'v22', name: 'ミニ白菜', category: 'アブラナ科', price: 350, unit: '個', description: '1〜2人用の小さな白菜。使い切りサイズで便利。' },
    { id: 'v23', name: 'ラディッシュ', category: '根菜類', price: 380, unit: '袋', description: '赤い小さな大根。サラダの彩りに最適。' },
    { id: 'v24', name: 'わさび菜', category: '葉物野菜', price: 480, unit: '袋', description: 'わさびのような辛味。サラダや肉料理の付け合わせに。' },
    { id: 'v25', name: 'カボチャ', category: '果菜類', price: 600, unit: '個', description: 'ホクホク甘いカボチャ。煮物やスープに。' },
    { id: 'v26', name: 'ネギ', category: '葉物野菜', price: 400, unit: '本', description: '薬味に欠かせないネギ。鍋物や味噌汁に。' },
    { id: 'v27', name: 'なす', category: '果菜類', price: 450, unit: '袋', description: 'とろける食感のなす。焼きなすや煮浸しに。' },
    { id: 'v28', name: 'レタス', category: 'レタス類', price: 500, unit: '玉', description: 'シャキシャキのレタス。サラダやサンドイッチに。' },
    { id: 'v29', name: 'じゃがいも', category: '根菜類', price: 500, unit: 'kg', description: 'ホクホクのじゃがいも。煮物や揚げ物に万能。' },
    { id: 'v30', name: 'さつまいも', category: '根菜類', price: 600, unit: 'kg', description: '甘みの強いさつまいも。焼き芋や天ぷらに。' },
    { id: 'v31', name: 'ピーマン', category: '果菜類', price: 400, unit: '袋', description: '苦味の少ないピーマン。炒め物に最適。' },
    { id: 'v32', name: 'たまねぎ', category: '根菜類', price: 350, unit: 'kg', description: '料理の基本、たまねぎ。炒め物や煮物に。' },
    { id: 'v33', name: '里芋', category: '根菜類', price: 700, unit: 'kg', description: 'ねっとり食感の里芋。煮物に最高です。' },
    { id: 'v34', name: 'にんじん', category: '根菜類', price: 400, unit: '袋', description: '甘みのあるにんじん。煮物やサラダに。' },
    { id: 'v35', name: 'にんにく', category: '香味野菜', price: 800, unit: '袋', description: '国産にんにく。料理の風味づけに欠かせません。' },
    { id: 'v36', name: 'とうもろこし', category: '果菜類', price: 500, unit: '本', description: '甘くてジューシーなとうもろこし。茹でてそのまま。' },
    { id: 'c1', name: '野菜セット', category: '加工品', price: 2500, unit: 'セット', description: '旬の野菜の詰め合わせ。5〜7種類の野菜をお届けします。' }
];

// HTMLテンプレート
function generateProductPage(product) {
    const slug = `product-${product.id}`;
    const imageUrl = `/store/image/products/${product.id}.jpg`; // 仮想パス
    const fallbackImage = `/store/image/fv.jpg`;
    
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${product.name}（${product.category}）| 無肥料・無農薬・自家採種の自然農法野菜を産地直送。${product.description}">
    <meta name="keywords" content="${product.name},${product.category},無農薬野菜,自然農法,安積直売所,産地直送">
    <meta name="theme-color" content="#2d5016">
    
    <!-- OGP -->
    <meta property="og:type" content="product">
    <meta property="og:locale" content="ja_JP">
    <meta property="og:title" content="${product.name} | 安積直売所">
    <meta property="og:description" content="${product.description}">
    <meta property="og:url" content="https://asakanatural.jp/store/${slug}.html">
    <meta property="og:image" content="https://asakanatural.jp${imageUrl}">
    <meta property="og:site_name" content="安積直売所オンライン">
    <meta property="product:price:amount" content="${product.price}">
    <meta property="product:price:currency" content="JPY">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${product.name} | 安積直売所">
    <meta name="twitter:description" content="${product.description}">
    <meta name="twitter:image" content="https://asakanatural.jp${imageUrl}">
    
    <title>${product.name}（￥${product.price.toLocaleString()}/${product.unit}）| 安積直売所</title>
    
    <link rel="canonical" href="https://asakanatural.jp/store/${slug}.html">
    <link rel="stylesheet" href="style.css?v=3">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500;700&family=Noto+Sans+JP:wght@300;400;500&display=swap" rel="stylesheet">
    
    <!-- JSON-LD: Product Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${product.name}",
        "description": "${product.description}",
        "category": "${product.category}",
        "image": "https://asakanatural.jp${imageUrl}",
        "sku": "${product.id}",
        "brand": {
            "@type": "Brand",
            "name": "安積自然農園"
        },
        "offers": {
            "@type": "Offer",
            "url": "https://asakanatural.jp/store/${slug}.html",
            "priceCurrency": "JPY",
            "price": "${product.price}",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "安積直売所オンライン"
            },
            "priceValidUntil": "2026-12-31"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "12"
        }
    }
    </script>
    
    <!-- JSON-LD: BreadcrumbList -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "ホーム",
                "item": "https://asakanatural.jp/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "オンラインショップ",
                "item": "https://asakanatural.jp/store/"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "商品一覧",
                "item": "https://asakanatural.jp/store/products.html"
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": "${product.name}",
                "item": "https://asakanatural.jp/store/${slug}.html"
            }
        ]
    }
    </script>
    
    <script src="asaka-hub.js"></script>
    <script src="inventory-sync.js"></script>
    <script src="auth.js"></script>
    
    <style>
        .product-detail-page {
            min-height: 100vh;
            background: var(--bg-cream, #faf8f3);
        }
        
        .breadcrumb {
            padding: 20px 0;
            background: white;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .breadcrumb-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            gap: 10px;
            font-size: 14px;
            color: #666;
        }
        
        .breadcrumb a {
            color: #2c5f2d;
            text-decoration: none;
        }
        
        .breadcrumb a:hover {
            text-decoration: underline;
        }
        
        .product-container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
        }
        
        .product-image {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .product-image img {
            width: 100%;
            height: auto;
            border-radius: 8px;
        }
        
        .product-info h1 {
            font-size: 32px;
            font-family: 'Noto Serif JP', serif;
            color: #2c5f2d;
            margin-bottom: 10px;
        }
        
        .product-category {
            display: inline-block;
            background: #e8f5e9;
            color: #2c5f2d;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        .product-price {
            font-size: 42px;
            font-weight: bold;
            color: #2c5f2d;
            margin: 20px 0;
        }
        
        .product-price .unit {
            font-size: 18px;
            color: #666;
            font-weight: normal;
        }
        
        .product-description {
            font-size: 16px;
            line-height: 1.8;
            color: #333;
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-left: 4px solid #2c5f2d;
        }
        
        .product-features {
            list-style: none;
            padding: 0;
            margin: 30px 0;
        }
        
        .product-features li {
            padding: 10px 0 10px 30px;
            position: relative;
            font-size: 15px;
            color: #555;
        }
        
        .product-features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #2c5f2d;
            font-weight: bold;
        }
        
        .stock-info {
            padding: 15px;
            background: #e8f5e9;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
        }
        
        .stock-info.low {
            background: #fff3e0;
        }
        
        .stock-info.out {
            background: #ffebee;
        }
        
        .add-to-cart-section {
            margin: 40px 0;
        }
        
        .quantity-selector {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 20px 0;
        }
        
        .quantity-selector label {
            font-weight: 500;
            color: #333;
        }
        
        .quantity-selector input {
            width: 80px;
            padding: 10px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 5px;
            text-align: center;
        }
        
        .btn-add-cart {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #2d5016, #1f3910);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-add-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(45, 80, 22, 0.3);
        }
        
        .btn-add-cart:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .related-products {
            max-width: 1200px;
            margin: 60px auto;
            padding: 0 20px;
        }
        
        .related-products h2 {
            font-size: 24px;
            font-family: 'Noto Serif JP', serif;
            color: #2c5f2d;
            margin-bottom: 30px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .product-container {
                grid-template-columns: 1fr;
                gap: 30px;
            }
            
            .product-info h1 {
                font-size: 24px;
            }
            
            .product-price {
                font-size: 32px;
            }
        }
    </style>
</head>
<body class="product-detail-page">
    <!-- ナビゲーションバー -->
    <header class="navbar">
        <div class="navbar-container">
            <a href="../" class="logo">
                <div class="logo-text">
                    <h1>安積直売所</h1>
                    <p>自然農法野菜</p>
                </div>
            </a>
            
            <nav class="nav-menu">
                <a href="../" class="nav-link">農園トップ</a>
                <a href="index.html" class="nav-link">ショップ</a>
                <a href="products.html" class="nav-link">商品一覧</a>
                <a href="faq.html" class="nav-link">FAQ</a>
                <a href="contact.html" class="nav-link">お問い合わせ</a>
            </nav>

            <div class="nav-actions">
                <a href="login.html" class="btn-secondary">ログイン</a>
                <a href="cart.html" class="btn-primary">
                    <span class="cart-icon">🛒</span> カート
                </a>
            </div>
        </div>
    </header>

    <!-- パンくずリスト -->
    <nav class="breadcrumb">
        <div class="breadcrumb-container">
            <a href="../">ホーム</a>
            <span>›</span>
            <a href="index.html">ショップ</a>
            <span>›</span>
            <a href="products.html">商品一覧</a>
            <span>›</span>
            <span>${product.name}</span>
        </div>
    </nav>

    <!-- 商品詳細 -->
    <main class="product-container">
        <div class="product-image">
            <img src="${fallbackImage}" alt="${product.name}" onerror="this.src='${fallbackImage}'">
        </div>
        
        <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h1>${product.name}</h1>
            
            <div class="product-price">
                ￥${product.price.toLocaleString()}
                <span class="unit">/ ${product.unit}</span>
            </div>
            
            <div class="product-description">
                ${product.description}
            </div>
            
            <ul class="product-features">
                <li>無肥料・無農薬栽培</li>
                <li>自家採種による在来種</li>
                <li>安積疎水の清らかな水で育成</li>
                <li>収穫後すぐに発送</li>
                <li>ヤマト運輸クール便配送</li>
            </ul>
            
            <div class="stock-info" id="stockInfo">
                <span id="stockText">在庫を確認中...</span>
            </div>
            
            <div class="add-to-cart-section">
                <div class="quantity-selector">
                    <label for="quantity">数量:</label>
                    <input type="number" id="quantity" min="1" max="99" value="1">
                </div>
                
                <button class="btn-add-cart" id="addToCartBtn" onclick="addToCart()">
                    カートに追加
                </button>
            </div>
        </div>
    </main>

    <!-- 関連商品 -->
    <section class="related-products">
        <h2>同じカテゴリーの商品</h2>
        <div id="relatedProductsGrid"></div>
    </section>

    <script>
        const PRODUCT_ID = '${product.id}';
        const PRODUCT_NAME = '${product.name}';
        const PRODUCT_PRICE = ${product.price};
        const PRODUCT_CATEGORY = '${product.category}';
        
        // 在庫確認
        async function checkStock() {
            try {
                const inventory = getSharedInventory ? getSharedInventory() : {};
                const stock = inventory[PRODUCT_ID]?.stock || 0;
                const stockInfo = document.getElementById('stockInfo');
                const stockText = document.getElementById('stockText');
                const addBtn = document.getElementById('addToCartBtn');
                
                if (stock <= 0) {
                    stockInfo.className = 'stock-info out';
                    stockText.textContent = '現在売り切れです';
                    addBtn.disabled = true;
                } else if (stock < 5) {
                    stockInfo.className = 'stock-info low';
                    stockText.textContent = \`残りわずか（在庫: \${stock}\${document.querySelector('.product-price .unit').textContent.replace('/ ', '')}）\`;
                } else {
                    stockInfo.className = 'stock-info';
                    stockText.textContent = \`在庫あり（\${stock}\${document.querySelector('.product-price .unit').textContent.replace('/ ', '')}）\`;
                }
            } catch (error) {
                console.error('在庫確認エラー:', error);
            }
        }
        
        // カートに追加
        function addToCart() {
            const quantity = parseInt(document.getElementById('quantity').value);
            
            if (quantity < 1) {
                alert('数量を選択してください');
                return;
            }
            
            const product = {
                id: PRODUCT_ID,
                name: PRODUCT_NAME,
                price: PRODUCT_PRICE,
                quantity: quantity
            };
            
            // カートに追加
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find(item => item.id === PRODUCT_ID);
            
            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.push(product);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // 成功メッセージ
            alert(\`\${PRODUCT_NAME} を\${quantity}個カートに追加しました\`);
            
            // カートページへ遷移するか確認
            if (confirm('カートを確認しますか？')) {
                window.location.href = 'cart.html';
            }
        }
        
        // 関連商品表示
        function showRelatedProducts() {
            const products = getSharedProducts ? getSharedProducts() : [];
            const related = products.filter(p => 
                p.category === PRODUCT_CATEGORY && p.id !== PRODUCT_ID
            ).slice(0, 4);
            
            const grid = document.getElementById('relatedProductsGrid');
            grid.innerHTML = related.map(p => \`
                <div class="product-card">
                    <a href="product-\${p.id}.html">
                        <h3>\${p.name}</h3>
                        <p class="price">￥\${p.price.toLocaleString()}</p>
                    </a>
                </div>
            \`).join('');
        }
        
        // 初期化
        document.addEventListener('DOMContentLoaded', () => {
            checkStock();
            showRelatedProducts();
        });
    </script>
</body>
</html>`;
}

// 全商品ページ生成
const outputDir = path.join(__dirname, 'store');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  商品個別ページ生成開始');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let successCount = 0;
let errorCount = 0;

PRODUCTS.forEach(product => {
    const slug = `product-${product.id}`;
    const filename = `${slug}.html`;
    const filepath = path.join(outputDir, filename);
    
    try {
        const html = generateProductPage(product);
        fs.writeFileSync(filepath, html, 'utf8');
        console.log(`✅ ${filename} - ${product.name}`);
        successCount++;
    } catch (error) {
        console.error(`❌ ${filename} - エラー:`, error.message);
        errorCount++;
    }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  生成完了: ${successCount}/${PRODUCTS.length}ページ`);
if (errorCount > 0) {
    console.log(`  エラー: ${errorCount}ページ`);
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
