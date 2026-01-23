# 発送完了通知管理システム - 実装ガイド

## 概要

このシステムは、安積直売所の管理画面から発送完了通知を手動でメール送信できる機能と、受注発注管理アプリのデータとリアルタイム連携するシステムです。

## 機能一覧

### 1. **受注発注管理アプリとの連携** (`sync-with-orders.js`)
- 受注発注管理アプリのデータをリアルタイムで同期
- 顧客情報・注文情報・商品情報を一元管理
- 5分間のキャッシュで高速化
- 強制同期機能で最新データを取得可能

### 2. **発送完了通知管理画面** (`admin-notification.html`)
- 発送待ちの注文一覧表示
- 受注発注管理アプリから顧客・注文情報を自動取得
- メール送信機能
- 通知済み注文の管理

### 3. **管理者認証・通知管理** (`admin-notification-manager.js`)
- 管理者メール認証
- 発送完了通知メールの生成・送信
- 管理者への確認メール自動送信

## ファイル構成

```
shop/
├── admin-notification.html          # 発送通知管理画面（メイン）
├── sync-with-orders.js               # 受注発注管理アプリとの連携モジュール
├── admin-notification-manager.js    # 管理者通知管理システム
├── admin.html                        # 管理画面トップ（更新済み）
└── [既存ファイル]
```

## セットアップ手順

### ステップ1: ファイルの配置

以下のファイルを `shop/` ディレクトリに配置してください：

```bash
- sync-with-orders.js
- admin-notification.html
- admin-notification-manager.js
```

### ステップ2: `admin.html` の更新

管理画面トップにリンクを追加しました（既に実装済み）。

```html
<a href="admin-notification.html" class="menu-card">
    <div class="menu-icon">📧</div>
    <div class="menu-title">発送通知管理</div>
    <div class="menu-description">
        発送完了通知を手動送信・受注管理アプリと連携
    </div>
    <div class="priority-badge">新機能</div>
</a>
```

### ステップ3: スクリプト読み込み

`admin-notification.html` には以下が自動で読み込まれます：

```html
<script src="../asaka-hub.js"></script>          <!-- 共通モジュール -->
<script src="sync-with-orders.js"></script>       <!-- 連携モジュール -->
<script src="notification-system.js"></script>   <!-- 通知システム -->
<script src="admin-notification-manager.js"></script> <!-- 管理者管理 -->
```

### ステップ4: 環境設定

#### 管理者メール設定（`admin-notification-manager.js`）

```javascript
const AdminNotificationManager = {
    ADMIN_EMAIL: 'tanabe@asakanatural.jp',  // ← ここを変更
    ADMIN_NAME: '田辺'                       // ← ここを変更
};
```

#### メール送信サービス設定

システムは以下のメール送信方法に対応：

1. **SendGrid API** (推奨)
   ```javascript
   const notificationManager = window.NotificationSystem.initialize({
       provider: 'sendgrid',
       fromEmail: 'tanabe@asakanatural.jp',
       fromName: '安積自然農園'
   });
   ```

2. **メールバックエンド API**
   `admin-notification-manager.js` の `sendEmail()` メソッドを実装

## 使用方法

### 1. 発送完了通知管理画面へアクセス

1. 管理画面トップ（`admin.html`）にアクセス
2. 「📧 発送通知管理」をクリック
3. `admin-notification.html` が表示される

### 2. 注文情報の確認

#### 発送待ちタブ
- 発送待ちの注文一覧が表示されます
- 各注文に以下の情報が表示されます：
  - 顧客情報（名前、メール、電話、住所）
  - 注文内容（商品名、数量）
  - 合計金額
  - 支払方法

#### 通知済みタブ
- 既に発送完了通知を送信した注文
- 発送日・追跡番号が表示

#### すべての注文タブ
- ステータス・金額の統計表示

### 3. 発送完了通知の送信

#### 手順：

1. **発送待ちタブ** から対象の注文を探す
2. **「📧 通知を送信」ボタン** をクリック
3. 以下の情報を入力：
   - **配送業者**：ヤマト運輸 / 日本郵便 / 佐川急便など
   - **追跡番号**：配送業者から取得した番号（必須）
   - **発送日**：実際の発送日
   - **到着予定日**：配送業者の予定日

4. **「📧 通知を送信」ボタン** を押す
5. メール送信完了画面が表示される
6. 自動的に注文ステータスが「通知済み」に変更される

### 4. フィルター機能

#### 発送待ちタブのフィルター：
- **顧客フィルター**：特定の顧客の注文のみ表示
- **日付フィルター**：特定日付の注文のみ表示
- **フィルタークリア**：フィルター解除

### 5. データ同期

#### 自動同期
- システムは5分ごとに受注発注管理アプリからデータを自動同期
- ローカルキャッシュにより高速化

#### 強制同期
- 「🔄 強制同期」ボタンをクリック
- 最新データを即座に取得

## データフロー

```
受注発注管理アプリ
    ↓ (localStorage)
同期モジュール (sync-with-orders.js)
    ↓ (キャッシュ)
発送通知管理画面 (admin-notification.html)
    ↓ (フォーム入力)
管理者通知管理 (admin-notification-manager.js)
    ↓ (API)
メール送信サービス (SendGrid等)
    ↓
顧客メールボックス
```

## 技術詳細

### モジュール: `sync-with-orders.js`

#### 主要関数：

```javascript
// データを同期して取得
OrderSyncManager.syncFromOrdersApp()
  → { customers: [], orders: [], products: [] }

// 注文IDから注文を取得
OrderSyncManager.getOrderById(orderId)
  → { id, customerName, items, ... }

// 顧客情報を取得
OrderSyncManager.getCustomerById(customerId)
  → { id, name, email, phone, address, ... }

// 顧客の注文履歴を取得
OrderSyncManager.getCustomerOrders(customerId)
  → [{ id, orderDate, total, ... }]

// 注文に顧客情報を付加
OrderSyncManager.getOrderWithCustomer(orderId)
  → { ...order, customerInfo: { ...customer } }

// 統計情報を取得
OrderSyncManager.getOrderStats()
  → { totalOrders, pendingOrders, shippedOrders, totalRevenue, ... }

// キャッシュをクリア（強制同期時）
OrderSyncManager.clearCache()
```

#### ストレージキー：

```javascript
orderManagement_customers     // 顧客マスター
unified_orders               // 統一注文データ
orderManagement_products     // 商品マスター
order_sync_cache            // キャッシュデータ
order_sync_timestamp        // キャッシュタイムスタンプ
```

### モジュール: `admin-notification-manager.js`

#### 主要関数：

```javascript
// 管理者認証チェック
AdminNotificationManager.isAdminAuthenticated()
  → true | false

// 管理者認証を設定
AdminNotificationManager.setAdminAuth(password)
  → true | false

// 発送完了通知を送信
AdminNotificationManager.sendShippingNotificationAsAdmin(notificationData)
  → { status: 'sent', id: '...', timestamp: '...', customerEmail: '...' }

// 通知メールHTMLを生成
AdminNotificationManager.generateShippingNotificationEmail(data)
  → { subject: '...', html: '...', text: '...' }
```

#### 通知データ形式：

```javascript
{
    orderId: 'ORD_20260122001',
    customerEmail: 'customer@example.com',
    customerName: '山田太郎',
    trackingNumber: '1234567890123',
    carrier: 'ヤマト運輸',
    shippedDate: '2026-01-22',
    estimatedDeliveryDate: '2026-01-24',
    items: [
        { name: 'ほうれん草', quantity: 3 },
        { name: '水菜', quantity: 2 }
    ],
    adminName: '田辺'
}
```

## メール送信の実装

### SendGrid API 実装例

```javascript
// backend/routes/send-email.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-email', async (req, res) => {
    try {
        const msg = {
            to: req.body.to,
            from: req.body.from.email,
            subject: req.body.subject,
            html: req.body.html,
            text: req.body.text
        };
        
        await sgMail.send(msg);
        res.json({ id: msg.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### 環境変数設定

```bash
# .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=tanabe@asakanatural.jp
```

## トラブルシューティング

### データが表示されない

1. 受注発注管理アプリでデータが保存されているか確認
2. ブラウザコンソールで以下を実行：
   ```javascript
   console.log(window.OrderSyncManager.syncFromOrdersApp());
   ```
3. データが返されない場合はlocalStorageを確認

### メール送信に失敗

1. メール送信サービスの認証情報を確認
2. ブラウザコンソールでエラーを確認
3. 追跡番号が入力されているか確認（必須項目）

### 同期が古いデータを表示

「🔄 強制同期」ボタンで最新データを取得してください

## セキュリティに関する注意

### 本番環境での推奨事項

1. **管理者認証**
   - パスワードはサーバーサイドで検証
   - セッションタイムアウト設定
   - HTTPS通信の強制

2. **メール送信**
   - SendGrid等のセキュアなサービスを使用
   - API キーを環境変数で管理
   - メール本体のXSS対策（HTML生成時にサニタイズ）

3. **アクセス制御**
   - 管理者認証の確認
   - ユーザーロール管理
   - 監査ログの記録

4. **データ保護**
   - 顧客メールアドレスの暗号化
   - 注文データのアクセス制限
   - GDPR等への対応

## 拡張機能の実装例

### 複数の配送業者に対応

```javascript
// admin-notification.html の配送業者セレクトボックス
<select id="carrier_${order.id}">
    <option value="ヤマト運輸">ヤマト運輸</option>
    <option value="日本郵便">日本郵便</option>
    <option value="佐川急便">佐川急便</option>
    <option value="Amazon配送">Amazon配送</option>
</select>
```

### テンプレートメール機能

```javascript
// メールテンプレートの管理
const EmailTemplates = {
    shipping: { subject: '発送完了', body: '...' },
    delivery: { subject: '配達完了', body: '...' },
    delay: { subject: '遅延のお知らせ', body: '...' }
};
```

### 一括送信機能

```javascript
// 複数注文への一括通知
async function sendBulkNotifications(orderIds, settings) {
    for (const orderId of orderIds) {
        await sendShippingNotification(orderId, settings);
    }
}
```

## まとめ

このシステムにより以下が実現します：

✅ 受注発注管理アプリとのリアルタイム連携  
✅ 管理者からの手動メール送信機能  
✅ 顧客・注文情報の一元管理  
✅ 自動配信メール機能  
✅ 通知履歴の管理  

サポートが必要な場合は、コンソールでエラーメッセージを確認し、above のトラブルシューティングを参照してください。
