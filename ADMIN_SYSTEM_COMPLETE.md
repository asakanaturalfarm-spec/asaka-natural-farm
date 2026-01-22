# ⑧ 管理画面（Admin）実装完了

**「フロントより重要」**

## 🎯 実装した機能

### 1. 注文一覧
- **全注文の一覧表示**
  - 注文番号（モノスペースフォント）
  - 注文日時（日本語形式）
  - 顧客名
  - 商品点数
  - 合計金額
  - 支払方法
  - ステータス

- **リアルタイム検索**
  - 注文番号での検索
  - 顧客名での検索
  - 入力と同時に絞り込み

- **フィルター機能**
  - ステータスフィルター（入金待ち・注文確定・発送済み・配達完了・キャンセル）
  - 日付範囲フィルター（開始日〜終了日）
  - フィルターリセット機能

### 2. ステータス変更
- **インライン編集**
  - 各行でステータスを直接変更
  - ドロップダウンから選択
  - 変更時に自動保存（サーバー連携想定）
  - 変更確認アラート表示

- **ステータス種類**
  - 入金待ち（pending）- 黄色バッジ
  - 注文確定（confirmed）- 青色バッジ
  - 発送済み（shipped）- 緑色バッジ
  - 配達完了（delivered）- 水色バッジ
  - キャンセル（cancelled）- 赤色バッジ

### 3. CSVエクスポート
- **完全なデータエクスポート**
  - BOM付きUTF-8（Excel対応）
  - 日本語完全対応
  - 商品明細も含む
  - ファイル名に日付自動付与（例: orders_2026-01-22.csv）

- **エクスポート項目**
  - 注文番号
  - 注文日時
  - ステータス
  - 顧客名
  - メールアドレス
  - 電話番号
  - 配送先住所
  - 配達希望日
  - 商品名・数量・単価・小計
  - 送料・消費税・合計金額
  - 支払方法
  - お問い合わせ番号

### 4. 統計ダッシュボード
- **リアルタイム集計**
  - 総注文数
  - 総売上（キャンセル除外）
  - 入金待ち件数
  - 発送済み件数
  - フィルター適用時は絞り込み結果を反映

### 5. 注文詳細モーダル
- **ワンクリックで詳細表示**
  - 注文情報
  - 顧客情報（名前・メール・電話・住所）
  - 配達希望日
  - 支払方法
  - お問い合わせ番号（発送済みの場合）
  - 商品明細（商品名・数量・単価・小計）
  - 金額詳細（小計・送料・消費税・合計）

---

## 📁 ファイル構成

### `admin.html` - 管理画面トップ
管理機能への入口

**機能**:
- 各管理機能へのナビゲーション
- 本日の統計表示（注文数・売上・入金待ち・発送待ち）
- 6つの管理メニュー
  - 📋 注文管理（優先度最高）
  - 📦 発送管理
  - 📊 在庫管理
  - 🥬 商品管理
  - 👥 顧客管理
  - 📈 レポート

**デザイン**:
- グリーン系のグラデーション背景
- カードベースのメニュー
- ホバーエフェクト
- レスポンシブ対応

### `admin-orders.html` - 注文管理画面
注文一覧・ステータス変更・CSVエクスポート

**UI設計**:
- **最低限・機能重視**
- テーブルレイアウト
- インライン編集
- モーダルで詳細表示

**主要機能**:
```javascript
// フィルター適用
function applyFilters() {
    // 検索・ステータス・日付でフィルタリング
}

// ステータス更新
function updateStatus(orderId, newStatus) {
    // サーバーに送信 -> /api/admin/orders/update-status
}

// CSVエクスポート
function exportCSV() {
    // BOM付きUTF-8で出力
    // Excel対応
}

// 詳細表示
function viewDetail(orderId) {
    // モーダルで注文詳細を表示
}
```

### `admin-shipping.html` - 発送管理画面
（既に実装済み）

発送手続きと発送完了通知の送信

---

## 🎨 UI設計思想

### 「UIは最低限でいい」を徹底
✅ **装飾は最小限**
- 不要なアニメーションなし
- シンプルな配色（緑・白・グレー）
- フラットデザイン

✅ **機能優先**
- すべての操作が2クリック以内
- キーボードショートカット対応（検索ボックス）
- リアルタイムフィルタリング

✅ **視認性重視**
- 大きめのフォントサイズ
- 明確な色分け（ステータスバッジ）
- 十分な行間とパディング

✅ **レスポンシブ対応**
- タブレット・PCで快適
- グリッドレイアウト

---

## 🔧 技術仕様

### データ構造
```javascript
{
    orderId: 'ORD_20260122001',          // 注文番号
    orderDate: '2026-01-22T10:30:00',    // 注文日時（ISO 8601）
    customerName: '山田太郎',             // 顧客名
    customerEmail: 'yamada@example.com', // メールアドレス
    customerPhone: '090-1234-5678',      // 電話番号
    items: [                              // 商品配列
        {
            name: 'ほうれん草',
            quantity: 3,
            unitPrice: 300,
            subtotal: 900
        }
    ],
    subtotal: 1340,                       // 小計
    shippingFee: 500,                     // 送料
    tax: 147,                             // 消費税
    total: 1987,                          // 合計
    paymentMethod: 'クレジットカード',    // 支払方法
    status: 'confirmed',                  // ステータス
    shippingAddress: '〒963-0201...',    // 配送先
    deliveryDate: '2026-01-25',          // 配達希望日
    trackingNumber: '1234-5678-9012'     // お問い合わせ番号
}
```

### ステータス管理
```javascript
const STATUS_DEFINITIONS = {
    pending: {
        label: '入金待ち',
        color: '#fff3cd',
        textColor: '#856404',
        description: '決済待ち・コンビニ支払待ち'
    },
    confirmed: {
        label: '注文確定',
        color: '#cce5ff',
        textColor: '#004085',
        description: '決済完了・発送準備中'
    },
    shipped: {
        label: '発送済み',
        color: '#d4edda',
        textColor: '#155724',
        description: '商品発送完了・配送中'
    },
    delivered: {
        label: '配達完了',
        color: '#d1ecf1',
        textColor: '#0c5460',
        description: '配達完了・取引終了'
    },
    cancelled: {
        label: 'キャンセル',
        color: '#f8d7da',
        textColor: '#721c24',
        description: 'キャンセル処理済み'
    }
};
```

---

## 🚀 使い方

### 1. 管理画面にアクセス
```
https://asakanatural.jp/store/admin.html
```

### 2. 注文管理画面へ
「📋 注文管理」カードをクリック

### 3. 注文を検索・フィルター
```javascript
// 検索ボックスに入力
// → リアルタイムで絞り込み

// ステータスフィルター選択
// → 特定ステータスのみ表示

// 日付範囲を指定
// → 期間内の注文のみ表示
```

### 4. ステータス変更
各注文行のドロップダウンから新しいステータスを選択
→ 自動保存 → 確認アラート表示

### 5. CSVエクスポート
「📥 CSVエクスポート」ボタンをクリック
→ 現在のフィルター結果をCSVダウンロード

### 6. 注文詳細を確認
「詳細」ボタンをクリック
→ モーダルで全情報を表示

---

## 🔄 サーバー連携（実装例）

### ステータス更新API
```javascript
// フロントエンド（admin-orders.html）
async function updateStatus(orderId, newStatus) {
    const response = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
    });
    
    if (!response.ok) {
        alert('ステータス更新に失敗しました');
        return;
    }
    
    // UI更新
    updateStats();
}
```

### サーバーサイド（Node.js例）
```javascript
app.post('/api/admin/orders/update-status', authenticate, async (req, res) => {
    const { orderId, status } = req.body;
    
    // バリデーション
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    // DB更新
    await db.orders.update(
        { status: status, updatedAt: new Date() },
        { where: { orderId: orderId } }
    );
    
    // ログ記録
    await db.statusLogs.create({
        orderId: orderId,
        oldStatus: currentStatus,
        newStatus: status,
        updatedBy: req.user.id,
        timestamp: new Date()
    });
    
    res.json({ success: true });
});
```

---

## 📊 統計機能

### リアルタイム集計
```javascript
function updateStats() {
    // 総注文数
    const totalOrders = filteredOrders.length;
    
    // 総売上（キャンセル除外）
    const totalSales = filteredOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
    
    // ステータス別件数
    const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;
    const shippedCount = filteredOrders.filter(o => o.status === 'shipped').length;
    
    // UI更新
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSales').textContent = '¥' + totalSales.toLocaleString('ja-JP');
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('shippedCount').textContent = shippedCount;
}
```

---

## 🔐 セキュリティ

### 管理者認証（実装必須）
```javascript
// ページ読み込み時に認証チェック
function checkAdminAuth() {
    const token = sessionStorage.getItem('admin_token');
    
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // トークン検証（サーバーサイド）
    fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(response => {
        if (!response.ok) {
            sessionStorage.removeItem('admin_token');
            window.location.href = 'admin-login.html';
        }
    });
}

// 全管理画面で実行
checkAdminAuth();
```

### IPアドレス制限（推奨）
```javascript
// サーバーサイドでIP制限
app.use('/api/admin/*', (req, res, next) => {
    const allowedIPs = ['192.168.1.100', '10.0.0.5'];
    const clientIP = req.ip;
    
    if (!allowedIPs.includes(clientIP)) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
});
```

---

## 📈 今後の拡張

### 実装済み ✅
- [x] 注文一覧表示
- [x] リアルタイム検索
- [x] ステータス変更
- [x] CSVエクスポート
- [x] 注文詳細モーダル
- [x] 統計ダッシュボード
- [x] 日付範囲フィルター

### 今後追加できる機能
- [ ] 一括ステータス変更（複数選択 → 一括処理）
- [ ] 注文編集機能
- [ ] 注文キャンセル処理
- [ ] 返金処理
- [ ] 印刷機能（納品書・領収書）
- [ ] PDFエクスポート
- [ ] 在庫管理画面
- [ ] 商品管理画面
- [ ] 顧客管理画面
- [ ] 売上レポート
- [ ] メール一括送信
- [ ] 配送ラベル印刷

---

## ⚠️ 重要な注意事項

### 1. 管理画面は必ず認証を実装
- **現在は認証なし（デモ用）**
- 本番環境では必ず管理者ログイン機能を実装
- セッション管理・トークン検証必須

### 2. サーバーサイド処理必須
- **現在はフロントエンドのみ（サンプルデータ）**
- ステータス変更・データ取得は必ずサーバー経由
- 直接DBアクセスは禁止

### 3. バックアップ必須
- 注文データは最重要
- 定期的なバックアップ
- エクスポート機能の活用

### 4. ログ記録
- すべての操作を記録
- 誰が・いつ・何をしたか
- トラブル発生時の追跡用

---

## 🎯 まとめ

**⑧ 管理画面（Admin）実装完了**

「フロントより重要」という原則に基づき、実務で必要な機能を実装しました：

1. **注文一覧** - リアルタイム検索・フィルター機能
2. **ステータス変更** - インライン編集・即座に反映
3. **CSVエクスポート** - Excel対応・完全なデータ出力

**UI設計**:
- ✅ 最低限のデザイン
- ✅ 機能優先
- ✅ 視認性重視
- ✅ 2クリック以内で操作完了

**次のステップ**:
- サーバーサイドAPI実装
- 管理者認証機能の追加
- 在庫管理・商品管理画面の実装

すべてのファイルは `公開用ファイル/` フォルダに配置済みです。
