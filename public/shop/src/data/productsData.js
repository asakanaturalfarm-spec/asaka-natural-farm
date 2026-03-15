/**
 * 共通品目マスターデータ
 * 農業用ダッシュボードと安積直売所オンラインで共有
 */

// 品目マスターデータ（25品目）
export const PRODUCTS_MASTER = {
    'トマト': { category: '果菜類', unit: 'kg', season: '夏', icon: '🍅' },
    'きゅうり': { category: '果菜類', unit: 'kg', season: '夏', icon: '🥒' },
    'ナス': { category: '果菜類', unit: 'kg', season: '夏', icon: '🍆' },
    'ピーマン': { category: '果菜類', unit: 'kg', season: '夏', icon: '🫑' },
    'ミニトマト': { category: '果菜類', unit: 'kg', season: '夏', icon: '🍅' },
    'とうもろこし': { category: '果菜類', unit: '本', season: '夏', icon: '🌽' },
    'かぼちゃ': { category: '果菜類', unit: 'kg', season: '秋', icon: '🎃' },
    '小松菜': { category: '葉菜類', unit: 'kg', season: '通年', icon: '🥬' },
    'ほうれん草': { category: '葉菜類', unit: 'kg', season: '冬春', icon: '🥬' },
    '水菜': { category: '葉菜類', unit: 'kg', season: '冬春', icon: '🥬' },
    'ルッコラ': { category: '葉菜類', unit: 'kg', season: '通年', icon: '🥬' },
    'リーフレタス': { category: '葉菜類', unit: 'kg', season: '春秋', icon: '🥬' },
    'レタス': { category: '葉菜類', unit: '個', season: '春秋', icon: '🥬' },
    '春菊': { category: '葉菜類', unit: 'kg', season: '冬春', icon: '🥬' },
    '白菜': { category: '葉菜類', unit: '個', season: '冬', icon: '🥬' },
    'キャベツ': { category: '葉菜類', unit: '個', season: '通年', icon: '🥬' },
    'ねぎ': { category: '葉菜類', unit: 'kg', season: '通年', icon: '🧅' },
    'じゃがいも': { category: '根菜類', unit: 'kg', season: '通年', icon: '🥔' },
    'さつまいも': { category: '根菜類', unit: 'kg', season: '秋', icon: '🍠' },
    '里芋': { category: '根菜類', unit: 'kg', season: '秋', icon: '🥔' },
    '人参': { category: '根菜類', unit: 'kg', season: '通年', icon: '🥕' },
    '大根': { category: '根菜類', unit: '本', season: '冬', icon: '🥕' },
    'たまねぎ': { category: '根菜類', unit: 'kg', season: '春夏', icon: '🧅' },
    'にんにく': { category: '根菜類', unit: 'kg', season: '夏', icon: '🧄' },
    'ブロッコリー': { category: '花菜類', unit: '個', season: '冬春', icon: '🥦' }
};

// カテゴリ一覧
export const CATEGORIES = {
    '果菜類': ['トマト', 'きゅうり', 'ナス', 'ピーマン', 'ミニトマト', 'とうもろこし', 'かぼちゃ'],
    '葉菜類': ['小松菜', 'ほうれん草', '水菜', 'ルッコラ', 'リーフレタス', 'レタス', '春菊', '白菜', 'キャベツ', 'ねぎ'],
    '根菜類': ['じゃがいも', 'さつまいも', '里芋', '人参', '大根', 'たまねぎ', 'にんにく'],
    '花菜類': ['ブロッコリー']
};

// 品目リスト取得（ソート済み）
export function getProductsList() {
    return Object.keys(PRODUCTS_MASTER).sort();
}

// カテゴリ別品目取得
export function getProductsByCategory(category) {
    return CATEGORIES[category] || [];
}

// 品目情報取得
export function getProductInfo(productName) {
    return PRODUCTS_MASTER[productName] || { 
        category: '未分類', 
        unit: 'kg', 
        season: '通年', 
        icon: '🌱' 
    };
}

// デフォルト価格設定（kg単位の場合の参考価格）
export const DEFAULT_PRICES = {
    'トマト': 600,
    'きゅうり': 400,
    'ナス': 450,
    'ピーマン': 500,
    'ミニトマト': 700,
    'とうもろこし': 350,
    'かぼちゃ': 300,
    '小松菜': 350,
    'ほうれん草': 300,
    '水菜': 220,
    'ルッコラ': 400,
    'リーフレタス': 350,
    'レタス': 250,
    '春菊': 350,
    '白菜': 200,
    'キャベツ': 200,
    'ねぎ': 350,
    'じゃがいも': 250,
    'さつまいも': 300,
    '里芋': 400,
    '人参': 250,
    '大根': 150,
    'たまねぎ': 180,
    'にんにく': 800,
    'ブロッコリー': 300
};

// Reactコンポーネント用に変換
export function convertToReactProducts(selectedProducts = null) {
    const products = selectedProducts || getProductsList();
    
    return products.map((productName, index) => {
        const info = PRODUCTS_MASTER[productName];
        const price = DEFAULT_PRICES[productName] || 300;
        
        return {
            id: `v${index + 1}`,
            category: 'vegetable',
            name: productName,
            price: price,
            unit: info.unit,
            period: info.season,
            img: `image/sample${(index % 4) + 1}.jpg`,
            description: `自然農法で育てた${productName}`,
            icon: info.icon,
            season: info.season,
            categoryJp: info.category
        };
    });
}
