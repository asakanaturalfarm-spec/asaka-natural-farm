# 在庫管理システム - 実用版

## 概要
サーバーサイドAPI連携・全アプリ完全同期・リセット機能廃止済みの実用的な在庫管理システム。リアルタイム同期・2段階トランザクション・オフライン対応を実装。

## アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│  フロントエンド（ブラウザ）                      │
│  ┌──────────────────────────────────────────┐  │
│  │  inventory-api.js                        │  │
│  │  - キャッシュ管理（30秒TTL）              │  │
│  │  - 楽観的更新                             │  │
│  │  - オフライン対応                         │  │
│  │  - 未送信キュー                           │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │ HTTP/REST API
┌─────────────────▼───────────────────────────────┐
│  バックエンド（Node.js + Express）               │
│  ┌──────────────────────────────────────────┐  │
│  │  inventory-server.js                     │  │
│  │  - 在庫CRUD API                           │  │
│  │  - 2段階トランザクション                  │  │
│  │  - 予約管理（10分タイムアウト）           │  │
│  │  - ログ記録                               │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│  収穫量出荷可能管理アプリ                        │
│  - 収穫データ → 在庫データ変換                   │
│  - 定期同期（5分ごと）                          │
└─────────────────────────────────────────────────┘
```

## ファイル構成

```
安積直売所オンライン/
├── inventory-api.js          # フロントエンド在庫APIクライアント
├── inventory-server.js       # バックエンドAPIサーバー
├── package-inventory.json    # サーバー依存関係
├── .env.example              # 環境変数テンプレート
└── INVENTORY_SYSTEM.md       # このファイル
```

他アプリ（受注発注管理・収穫量出荷可能管理・帳簿自動管理・ダッシュボード）もinventory-api.jsをHTMLで読み込み、API連携で完全同期。

## セットアップ手順

### 1. サーバー側セットアップ
（従来通り package-inventory.json → package.json、npm install、.env作成、npm start）

### 2. フロントエンド側セットアップ
全アプリのindex.html等で inventory-api.js を読み込み、window.ENV でAPIエンドポイントを指定。

## API仕様

### 在庫取得
```javascript
// 全商品の在庫取得
const inventory = await window.InventoryAPI.getInventory();

// 特定商品の在庫取得
const stock = await window.InventoryAPI.getInventory('v1');
```

**エンドポイント**: `GET /api/inventory` または `GET /api/inventory/:productId`

**レスポンス例**:
```json
{
  "v1": {
    "productId": "v1",
    "stock": 45,
    "reserved": 5,
    "available": 40,
    "lastUpdated": "2026-01-22T10:30:00.000Z"
  }
}
```

### 在庫更新
```javascript
await window.InventoryAPI.updateInventory(
    'v1',      // 商品ID
    50,        // 新しい在庫数
    '入庫',    // 理由
    { source: 'manual' }  // メタデータ
);
```

**エンドポイント**: `PUT /api/inventory/:productId`

**リクエストボディ**:
```json
{
  "quantity": 50,
  "reason": "入庫",
  "metadata": { "source": "manual" }
}
```

### 在庫予約（注文時）
```javascript
const reservation = await window.InventoryAPI.reserveInventory(
    [
        { productId: 'v1', quantity: 2 },
        { productId: 'v2', quantity: 1 }
    ],
    'ORD20260122001'  // 注文ID
);
// → { reservationId: 'RSV1737547200000', status: 'reserved', expiresAt: '...' }
```

**エンドポイント**: `POST /api/inventory/reserve`

**特徴**:
- 在庫を一時的に予約（10分間）
- タイムアウトで自動解放
- 在庫不足時は即座にエラー

### 予約確定（決済完了時）
```javascript
await window.InventoryAPI.confirmReservation('RSV1737547200000');
```

**エンドポイント**: `POST /api/inventory/reserve/:reservationId/confirm`

**効果**:
- 予約在庫を確定減算
- 在庫数から差し引き

### 予約解放（キャンセル時）
```javascript
await window.InventoryAPI.releaseReservation('RSV1737547200000');
```

**エンドポイント**: `POST /api/inventory/reserve/:reservationId/release`

**効果**:
- 予約在庫を戻す
- 在庫が再び購入可能に

### 収穫量アプリとの同期
```javascript
await window.InventoryAPI.syncFromHarvestApp();
```

**エンドポイント**: `POST /api/inventory/sync-harvest`

**リクエストボディ例**:
```json
{
  "items": [
    {
      "productId": "v1",
      "availableQuantity": 50,
      "harvestDate": "2026-01-22",
      "expiryDate": "2026-01-29"
    }
  ]
}
```

### 低在庫アラート
```javascript
const lowStock = await window.InventoryAPI.checkLowStock(10);
// → [{ productId: 'v1', productName: 'ほうれん草', stock: 5, unit: '袋' }]
```

**エンドポイント**: `GET /api/inventory/alerts/low-stock?threshold=10`

### ログ取得
```bash
curl http://localhost:3000/api/inventory/logs?limit=100&action=UPDATE
```

**エンドポイント**: `GET /api/inventory/logs`

## 主要機能

### 主要機能（最新版）
- サーバーAPI連携（全アプリ共通）
- 30秒TTLキャッシュ・stale-while-revalidate
- 楽観的UI更新・自動ロールバック
- オフライン対応・未送信キュー
- 2段階トランザクション・在庫予約/確定/解放
- 収穫量アプリ等との完全同期
- イベント通知（inventoryUpdated, inventorySynced, lowStockAlert等）
- リセット機能廃止（在庫数は常にAPI・全アプリでリアルタイム連動）

## 統合例

### checkout.htmlでの使用
```javascript
async function placeOrder() {
    const items = getCartItems();
    const orderId = generateOrderId();
    
    try {
        // 1. 在庫予約
        const reservation = await window.InventoryAPI.reserveInventory(items, orderId);
        console.log('在庫予約成功:', reservation.reservationId);
        
        // 2. 決済処理
        const payment = await processPayment(orderId, total);
        
        if (payment.success) {
            // 3. 予約確定
            await window.InventoryAPI.confirmReservation(reservation.reservationId);
            console.log('在庫確定');
            
            // 注文完了
            window.location.href = 'order-complete.html';
        } else {
            // 決済失敗時は予約解放
            await window.InventoryAPI.releaseReservation(reservation.reservationId);
            alert('決済に失敗しました');
        }
    } catch (error) {
        console.error('注文処理エラー:', error);
        
        // エラー時も予約解放を試行
        if (reservation?.reservationId) {
            await window.InventoryAPI.releaseReservation(reservation.reservationId).catch(e => {
                console.error('予約解放失敗:', e);
            });
        }
        
        alert('在庫不足または通信エラーが発生しました');
    }
}
```

### products.htmlでの使用
```javascript
async function displayProducts() {
    try {
        // 在庫データ取得
        const inventory = await window.InventoryAPI.getInventory();
        
        products.forEach(product => {
            const stock = inventory[product.id];
            const available = stock?.available || 0;
            const isInStock = available > 0;
            const isLowStock = available < 10;
            
            // 商品カード生成
            const card = `
                <div class="product-card ${!isInStock ? 'sold-out' : ''}">
                    <h3>${product.name}</h3>
                    <p class="price">¥${product.price}</p>
                    <p class="stock ${isLowStock ? 'low' : ''}">
                        在庫: ${available}${product.unit}
                        ${isLowStock && isInStock ? '（残りわずか）' : ''}
                    </p>
                    <button ${!isInStock ? 'disabled' : ''}>
                        ${isInStock ? 'カートに追加' : '売り切れ'}
                    </button>
                </div>
            `;
            
            container.innerHTML += card;
        });
    } catch (error) {
        console.error('商品表示エラー:', error);
    }
}

// 5分ごとに在庫を自動更新
setInterval(() => {
    window.InventoryAPI.syncFromServer();
}, 300000);
```

## セキュリティ対策

### サーバー側
- CORS設定で許可オリジン制限
- レート制限実装推奨
- 認証トークン検証（JWT等）
- SQL injection対策（ORM使用）

### クライアント側
- APIキーを環境変数管理
- XSS対策（サニタイズ）
- HTTPS通信必須
- タイムアウト設定

## パフォーマンス最適化

### キャッシュ戦略
- 30秒TTL（調整可能）
- stale-while-revalidate方式
- ローカルストレージ活用

### バッチ処理
```javascript
// 複数商品を一括取得
const inventory = await window.InventoryAPI.getInventory();
// ✓ 1回のリクエスト

// ❌ 非効率
for (const product of products) {
    await window.InventoryAPI.getInventory(product.id);
}
// ✗ N回のリクエスト
```

### 定期同期
- 5分間隔でサーバー同期
- イベント駆動での即時更新
- WebSocket利用も検討可能

## トラブルシューティング

（従来通りのAPI・キャッシュ・同期・イベント通知で運用。リセットや初期化は不可）

## 本番環境デプロイ

### サーバー側
```bash
# PM2で起動
npm install -g pm2
pm2 start inventory-server.js --name asaka-inventory

# 環境変数設定
pm2 env asaka-inventory PORT=3000
pm2 env asaka-inventory NODE_ENV=production

# 自動再起動設定
pm2 startup
pm2 save
```

### フロントエンド側
```html
<!-- 本番環境設定 -->
<script>
window.ENV = {
    INVENTORY_API_URL: 'https://api.asakanatural.jp/api',
    HARVEST_APP_URL: 'https://harvest.asakanatural.jp/api'
};
</script>
<script src="inventory-api.js"></script>
```

### データベース移行
現在はメモリ内ストレージ。本番環境では：
- PostgreSQL / MySQL
- MongoDB
- Redis（キャッシュ層）

```javascript
// server側でDB接続例
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.get('/api/inventory', async (req, res) => {
    const result = await pool.query('SELECT * FROM inventory');
    res.json(result.rows);
});
```

## 次のステップ

### Phase 2: 高度な機能
- [ ] WebSocket リアルタイム通知
- [ ] GraphQL API
- [ ] 在庫予測AI
- [ ] 複数倉庫対応
- [ ] ロット管理

### Phase 3: 統合
- [ ] 収穫量アプリ完全連携
- [ ] 受注発注アプリ連携
- [ ] 帳簿アプリ連携
- [ ] 統合ダッシュボード表示

---

**実装日**: 2026年1月22日  
**バージョン**: 1.0.0  
**ステータス**: 実用版完成
