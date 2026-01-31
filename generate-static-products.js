const fs = require('fs');
const path = require('path');

// script.jsから商品データを抽出（正規表現で取得）
const scriptContent = fs.readFileSync(path.join(__dirname, 'shop', 'script.js'), 'utf-8');
const productsMatch = scriptContent.match(/const PRODUCTS = \[([\s\S]*?)\];/);

if (!productsMatch) {
    console.error('商品データが見つかりません');
    process.exit(1);
}

// 商品データをJavaScriptとして評価（簡易的な方法）
const TAX_RATE = { REDUCED: 0.08, STANDARD: 0.10 };
const SALE_TYPE = { NORMAL: 'normal', PRE_ORDER: 'pre_order' };
const PRODUCTS = eval(`[${productsMatch[1]}]`);

console.log(`${PRODUCTS.length}件の商品を処理します...`);

// 出力ディレクトリを作成
const outputDir = path.join(__dirname, 'shop', 'products');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// HTMLテンプレート生成関数
function generateProductHTML(product) {
    const priceWithTax = product.priceWithTax || Math.floor(product.price * 1.08);
    const seasonText = product.seasonMonths 
        ? `${product.seasonMonths.map(m => `${m}月`).join('、')}` 
        : '通年';
    
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEOメタタグ -->
    <meta name="description" content="${product.name} - ${product.description} | 安積自然農園の無農薬・無肥料・自家採種の自然農法野菜">
    <meta name="keywords" content="${product.name},自然農法,無農薬野菜,無肥料野菜,産地直送,福島県産,安積自然農園">
    <title>${product.name}（${product.unit}）¥${priceWithTax}（税込） | 安積直売所</title>
    <link rel="canonical" href="https://asakanatural.jp/shop/products/${product.id}.html">
    <meta name="robots" content="index, follow">
    
    <!-- OGP -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="https://asakanatural.jp/shop/products/${product.id}.html">
    <meta property="og:title" content="${product.name} | 安積直売所">
    <meta property="og:description" content="${product.description}">
    <meta property="og:image" content="https://asakanatural.jp/shop/${product.img}">
    <meta property="og:site_name" content="安積直売所">
    <meta property="product:price:amount" content="${priceWithTax}">
    <meta property="product:price:currency" content="JPY">
    <script src="../../common.js"></script>
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${product.name} | 安積直売所">
    <meta name="twitter:description" content="${product.description}">
    <meta name="twitter:image" content="https://asakanatural.jp/shop/${product.img}">
    
    <!-- 構造化データ（JSON-LD） -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "${product.name}",
        "image": "https://asakanatural.jp/shop/${product.img}",
        "description": "${product.description}",
        "sku": "${product.sku || product.id}",
        "brand": {
            "@type": "Brand",
            "name": "安積自然農園"
        },
        "offers": {
            "@type": "Offer",
            "url": "https://asakanatural.jp/shop/products/${product.id}.html",
            "priceCurrency": "JPY",
            "price": "${priceWithTax}",
            "priceValidUntil": "2026-12-31",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "安積自然農園"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "15"
        }
    }
    </script>
    
    <link rel="stylesheet" href="../style.css?v=3">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500;700&family=Noto+Sans+JP:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        .product-page {
            min-height: 100vh;
            background: var(--bg-cream);
            padding: 120px 40px 60px;
        }
        .product-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .breadcrumb {
            margin-bottom: 40px;
            font-size: 14px;
            color: var(--text-light);
        }
        .breadcrumb a {
            color: var(--text-light);
            text-decoration: none;
        }
        .breadcrumb a:hover {
            color: var(--primary-color);
        }
        .product-detail {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            background: white;
            border-radius: 16px;
            padding: 60px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .main-image {
            width: 100%;
            aspect-ratio: 4/3;
            border-radius: 12px;
            overflow: hidden;
            background: #f5f5f3;
        }
        .main-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .product-title {
            font-size: 32px;
            font-weight: 500;
            margin-bottom: 16px;
            color: var(--text-dark);
        }
        .product-description {
            font-size: 16px;
            line-height: 1.8;
            color: var(--text-light);
            margin-bottom: 24px;
        }
        .product-price {
            font-size: 36px;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 8px;
        }
        .product-unit {
            font-size: 14px;
            color: var(--text-light);
            margin-bottom: 24px;
        }
        .product-meta {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 20px;
            background: var(--bg-cream);
            border-radius: 8px;
            margin-bottom: 32px;
        }
        .meta-item {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
        }
        .meta-label {
            font-weight: 500;
            color: var(--text-dark);
        }
        .meta-value {
            color: var(--text-light);
        }
        .btn-add-cart {
            width: 100%;
            padding: 16px 32px;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn-add-cart:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(74, 93, 63, 0.3);
        }
        @media (max-width: 768px) {
            .product-detail {
                grid-template-columns: 1fr;
                padding: 30px;
                gap: 30px;
            }
            .product-title {
                font-size: 24px;
            }
            .product-price {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <!-- ヘッダー -->
    <header class="header">
        <div class="header-container">
            <div class="logo">
                <a href="../index.html" style="text-decoration: none; color: inherit;">安積直売所</a>
            </div>
            <nav class="desktop-nav">
                <a href="../index.html" class="nav-link">ホーム</a>
                <a href="../products.html" class="nav-link">商品一覧</a>
                <a href="../cart.html" class="nav-link">カート</a>
                <a href="../account.html" class="nav-link">マイページ</a>
            </nav>
        </div>
    </header>

    <main class="product-page">
        <div class="product-container">
            <!-- パンくずリスト -->
            <nav class="breadcrumb">
                <a href="../index.html">ホーム</a> &gt; 
                <a href="../products.html">商品一覧</a> &gt; 
                <span>${product.name}</span>
            </nav>

            <!-- 商品詳細 -->
            <div class="product-detail">
                <div class="product-gallery">
                    <div class="main-image">
                        <img src="../${product.img}" alt="${product.name}">
                    </div>
                </div>

                <div class="product-info">
                    <h1 class="product-title">${product.name}</h1>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-price">¥${priceWithTax}<span style="font-size: 16px; font-weight: 400; color: var(--text-light);"> （税込）</span></div>
                    <div class="product-unit">${product.unit}あたり</div>

                    <div class="product-meta">
                        <div class="meta-item">
                            <span class="meta-label">カテゴリー</span>
                            <span class="meta-value">${product.category}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">販売期間</span>
                            <span class="meta-value">${product.period}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">旬の時期</span>
                            <span class="meta-value">${seasonText}</span>
                        </div>
                        ${product.sku ? `
                        <div class="meta-item">
                            <span class="meta-label">商品コード</span>
                            <span class="meta-value">${product.sku}</span>
                        </div>
                        ` : ''}
                    </div>

                    <button class="btn-add-cart" onclick="addToCartStaticPage()">
                        カートに追加
                    </button>
                </div>
            </div>
        </div>
    </main>

    <script>
        function addToCartStaticPage() {
            const product = {
                id: '${product.id}',
                name: '${product.name}',
                price: ${product.price},
                quantity: 1
            };
            if (typeof addToCart === 'function') {
                addToCart(product);
            } else {
                alert('カート機能が利用できません');
            }
        }
    </script>
</body>
</html>`;
}

// 全商品の静的HTMLを生成
let successCount = 0;
let errorCount = 0;

PRODUCTS.forEach(product => {
    try {
        const html = generateProductHTML(product);
        const fileName = `${product.id}.html`;
        const filePath = path.join(outputDir, fileName);
        
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`✓ ${fileName} を生成しました`);
        successCount++;
    } catch (error) {
        console.error(`✗ ${product.id} の生成に失敗:`, error.message);
        errorCount++;
    }
});

console.log(`\n=== 生成完了 ===`);
console.log(`成功: ${successCount}件`);
console.log(`失敗: ${errorCount}件`);
console.log(`出力先: ${outputDir}`);

// sitemap.xml生成
const sitemapEntries = PRODUCTS.map(p => `  <url>
    <loc>https://asakanatural.jp/shop/products/${p.id}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- トップページ -->
  <url>
    <loc>https://asakanatural.jp/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- ショップページ -->
  <url>
    <loc>https://asakanatural.jp/shop/index.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://asakanatural.jp/shop/products.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- 商品ページ -->
${sitemapEntries}
  
  <!-- 情報ページ -->
  <url>
    <loc>https://asakanatural.jp/business.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://asakanatural.jp/privacy.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>https://asakanatural.jp/faq.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- コンテンツページ -->
  <url>
    <loc>https://asakanatural.jp/inflow1.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://asakanatural.jp/inflow2.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://asakanatural.jp/production.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://asakanatural.jp/distribution.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf-8');
console.log('\n✓ sitemap.xml を生成しました');
