/**
 * 統一ナビゲーション更新スクリプト
 * /store/ 配下の全HTMLファイルのナビゲーションを統一
 */

const fs = require('fs');
const path = require('path');

const storeDir = 'c:\\Users\\dayet\\OneDrive\\安積自然農園ホームページ\\store';

// 統一ナビゲーション HTML
const unifiedNav = `            <nav class="nav-menu">
                <a href="../" class="nav-link">農園トップ</a>
                <a href="index.html" class="nav-link">ショップ</a>
                <a href="products.html" class="nav-link">商品一覧</a>
                <a href="faq.html" class="nav-link">FAQ</a>
                <a href="shop-contact.html" class="nav-link">お問い合わせ</a>
            </nav>`;

// ロゴのリンク先を親サイトに変更
const unifiedLogo = `            <a href="../" class="logo">`;

// 対象ファイル
const files = [
    'products.html',
    'shop-contact.html',
    'orders.html',
    'account.html',
    'cart.html',
    'checkout.html',
    'faq.html'
];

files.forEach(filename => {
    const filePath = path.join(storeDir, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${filename} が見つかりません`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // ナビゲーション置換
    content = content.replace(
        /<nav class="nav-menu">[\s\S]*?<\/nav>/,
        unifiedNav
    );
    
    // ロゴリンク置換
    content = content.replace(
        /<a href="[^"]*" class="logo">/,
        unifiedLogo
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filename} - ナビゲーション更新完了`);
});

console.log('\n統一ナビゲーション更新完了！');
