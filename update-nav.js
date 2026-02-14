/**
 * update-nav.js
 * 安積自然農園 ナビゲーション統一スクリプト
 * - /store/配下の全HTMLファイルのナビゲーション・ロゴを統一
 *
 * 【編集・拡張方針】
 * - ナビゲーション仕様変更時は本ファイルを編集
 */
/**
 * 統一ナビゲーション更新スクリプト
 * /store/ 配下の全HTMLファイルのナビゲーションを統一
 */

const fs = require('fs');
const path = require('path');

const storeDir = 'c:\\Users\\dayet\\OneDrive\\安積自然農園ホームページ\\store';

// 統一ナビゲーション HTML
// グローバルナビゲーション・メニュー撤去済み
        unifiedLogo
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filename} - ナビゲーション更新完了`);
});

console.log('\n統一ナビゲーション更新完了！');
