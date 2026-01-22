# ⑦ 通知システム（自動）実装完了

**「人力対応は必ず破綻する」**

## 📧 実装した通知タイプ

### 1. 注文確定メール
- **送信タイミング**: 決済成功後、自動送信
- **内容**:
  - 注文番号・注文日
  - 注文商品の詳細（商品名・数量・金額）
  - 小計・送料・消費税・合計金額
  - お支払い方法
  - お届け先住所
  - 配達希望日・時間帯

### 2. 発送完了通知
- **送信タイミング**: 管理画面（admin-shipping.html）から発送手続き時
- **内容**:
  - 注文番号
  - 発送日
  - 配送業者（ヤマト運輸クール便）
  - お問い合わせ番号（追跡番号）
  - 追跡URLリンク
  - 到着予定日
  - 発送商品一覧

### 3. 支払失敗通知
- **送信タイミング**: 決済失敗時、自動送信
- **内容**:
  - 注文番号
  - お支払い方法
  - エラー内容（わかりやすい日本語表記）
  - 対応方法（決済方法別のサポート手順）
  - 再試行URLリンク
  - お問い合わせ先

---

## 🔧 技術仕様

### セキュリティ原則
✅ **外部メールサービスを使用**
- SendGrid / AWS SES / Mailgun などを使用
- 自作SMTP実装は禁止（セキュリティリスク）
- APIキーはサーバーサイドで管理（フロントに露出させない）

✅ **個人情報の最小化**
- メール送信に必要な情報のみ送信
- 不要なデータは含めない
- 通知履歴はローカルストレージに最新100件のみ保存

✅ **自動リトライ機構**
- 送信失敗時、最大3回まで自動リトライ
- 指数バックオフ（5秒 → 10秒 → 20秒）
- リトライ状態を履歴に記録

---

## 📁 ファイル構成

### `notification-system.js` (768行)
通知システムのコアロジック

**主要クラス**:
- `EmailService`: メール送信サービス（SendGrid/SES/Mailgun対応）
- `NotificationManager`: 通知の送信・リトライ・履歴管理

**主要機能**:
- `sendOrderConfirmation()`: 注文確定メール送信
- `sendShippingNotification()`: 発送完了通知送信
- `sendPaymentFailureNotification()`: 支払失敗通知送信
- `processRetryQueue()`: 自動リトライ処理
- `saveNotificationHistory()`: 通知履歴保存（最新100件）

**HTMLテンプレート生成**:
- レスポンシブHTMLメール（モバイル対応）
- プレーンテキスト版も同時生成
- 企業カラー（緑系）を反映したデザイン

### `admin-shipping.html`
発送管理画面（管理者用）

**機能**:
- 注文一覧表示（発送待ち・発送済みフィルター）
- お問い合わせ番号（追跡番号）入力
- 発送日・到着予定日の指定
- ワンクリックで発送完了通知を送信
- 送信ステータスのリアルタイム表示

### 統合ファイル
- `payment-integration.js`: 決済成功時に注文確定メール、失敗時に支払失敗通知を自動送信
- `checkout.html`: notification-system.js を読み込み

---

## 🔄 通知フロー

### 注文確定メールの流れ
```
1. ユーザーが決済完了
    ↓
2. payment-integration.js の processPayment() 実行
    ↓
3. 決済成功
    ↓
4. NotificationManager.sendOrderConfirmation() 自動実行
    ↓
5. EmailService が /api/notifications/send にPOST
    ↓
6. サーバーが実際のメール送信（SendGrid API等）
    ↓
7. 成功/失敗を記録
    ↓
8. 失敗時は自動リトライキューに追加
```

### 発送完了通知の流れ
```
1. 管理者が admin-shipping.html にアクセス
    ↓
2. 発送待ち注文を確認
    ↓
3. お問い合わせ番号を入力
    ↓
4. 「発送完了 & 通知送信」ボタンをクリック
    ↓
5. NotificationManager.sendShippingNotification() 実行
    ↓
6. メール送信 & 注文ステータス更新
    ↓
7. 画面に送信結果を表示
```

### 支払失敗通知の流れ
```
1. ユーザーの決済が失敗
    ↓
2. payment-integration.js が rollback() 実行
    ↓
3. NotificationManager.sendPaymentFailureNotification() 自動実行
    ↓
4. エラー内容を日本語化（カード拒否、有効期限切れ等）
    ↓
5. 決済方法別のサポート手順を含めて送信
    ↓
6. 再試行URLリンクを提供
```

---

## 🚀 使い方

### 1. 初期化
```javascript
// 通知マネージャーを初期化
const notificationManager = window.NotificationSystem.initialize({
    provider: 'sendgrid',  // または 'ses', 'mailgun'
    fromEmail: 'noreply@asakanatural.jp',
    fromName: '安積自然農園'
});
```

### 2. 注文確定メールを送信
```javascript
await notificationManager.sendOrderConfirmation({
    orderId: 'ORD_20260122001',
    customerEmail: 'customer@example.com',
    customerName: '山田太郎',
    items: [
        { name: 'ほうれん草', quantity: 3, unitPrice: 300, subtotal: 900 }
    ],
    subtotal: 900,
    shippingFee: 500,
    tax: 72,
    total: 1472,
    paymentMethod: 'credit_card',
    shippingAddress: '〒963-0201 福島県郡山市大槻町字前畑60',
    deliveryDate: '2026-01-25',
    deliveryTimeSlot: '午前中'
});
```

### 3. 発送完了通知を送信
```javascript
await notificationManager.sendShippingNotification({
    orderId: 'ORD_20260122001',
    customerEmail: 'customer@example.com',
    customerName: '山田太郎',
    trackingNumber: '1234-5678-9012',
    carrier: 'ヤマト運輸クール便（冷蔵）',
    shippedDate: '2026-01-22',
    estimatedDeliveryDate: '2026-01-24',
    items: [
        { name: 'ほうれん草', quantity: 3 }
    ]
});
```

### 4. 支払失敗通知を送信
```javascript
await notificationManager.sendPaymentFailureNotification({
    orderId: 'ORD_20260122001',
    customerEmail: 'customer@example.com',
    customerName: '山田太郎',
    paymentMethod: 'credit_card',
    failureReason: 'card_declined',
    amount: 1472,
    retryUrl: 'https://asakanatural.jp/store/payment-retry.html?orderId=ORD_20260122001'
});
```

---

## 📊 通知履歴の確認

### ブラウザのコンソールで確認
```javascript
// 通知履歴を取得
const history = notificationManager.getNotificationHistory();
console.log(history);

// 最新10件を表示
history.slice(-10).forEach(record => {
    console.log(`[${record.type}] ${record.to} - ${record.status}`);
});

// 送信失敗した通知を確認
const failed = history.filter(r => r.status === 'failed');
console.log('送信失敗:', failed);
```

### 通知ステータス
- `pending`: 送信待ち
- `sent`: 送信完了
- `failed`: 送信失敗（リトライ回数上限到達）
- `retry`: リトライ中

---

## ⚙️ サーバーサイド設定（重要）

### 必要なAPIエンドポイント
`POST /api/notifications/send`

**リクエストボディ**:
```json
{
  "provider": "sendgrid",
  "to": "customer@example.com",
  "subject": "【安積自然農園】ご注文確定のお知らせ",
  "htmlBody": "<html>...</html>",
  "textBody": "テキスト版メール本文",
  "from": {
    "email": "noreply@asakanatural.jp",
    "name": "安積自然農園"
  }
}
```

**レスポンス（成功）**:
```json
{
  "success": true,
  "messageId": "msg_abc123xyz"
}
```

**レスポンス（失敗）**:
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

### SendGrid設定例（Node.js）
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/notifications/send', async (req, res) => {
    const { to, subject, htmlBody, textBody, from } = req.body;
    
    const msg = {
        to: to,
        from: from,
        subject: subject,
        text: textBody,
        html: htmlBody,
    };
    
    try {
        await sgMail.send(msg);
        res.json({ success: true, messageId: 'generated_message_id' });
    } catch (error) {
        console.error('SendGrid error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
```

---

## 🎨 メールデザインのカスタマイズ

### 色の変更
`notification-system.js` 内のHTMLテンプレート生成関数を編集:

```javascript
// ヘッダー背景色
.header { background-color: #2c5f2d; }  // 緑系

// ボタン色
.button { background-color: #2c5f2d; }
```

### ロゴの追加
HTMLテンプレートの `<div class="header">` 内に画像を追加:
```html
<img src="https://asakanatural.jp/logo.png" alt="安積自然農園" style="max-width: 200px;">
```

---

## 🔍 トラブルシューティング

### メールが届かない
1. **スパムフォルダを確認**
   - 初回送信時はスパム判定されることがある
   
2. **送信履歴を確認**
   ```javascript
   const history = notificationManager.getNotificationHistory();
   const recent = history.slice(-5);
   console.log(recent);
   ```

3. **APIエンドポイントの確認**
   - `/api/notifications/send` が正しく実装されているか
   - CORSエラーが発生していないか
   - 認証トークンが正しいか

### リトライが動作しない
- ブラウザのコンソールで `processRetryQueue()` が実行されているか確認
- リトライキューの内容を確認:
  ```javascript
  console.log(notificationManager.retryQueue);
  ```

### 送信が遅い
- SendGrid/SESの送信レート制限を確認
- 大量送信する場合はキューイングシステムの導入を検討

---

## 📈 今後の拡張案

### 実装済み ✅
- [x] 注文確定メール
- [x] 発送完了通知
- [x] 支払失敗通知
- [x] 自動リトライ機構
- [x] 通知履歴管理
- [x] 発送管理画面

### 今後追加できる機能
- [ ] 支払期限リマインダー（コンビニ決済向け）
- [ ] 在庫切れアラート（管理者向け）
- [ ] 商品到着確認メール
- [ ] レビュー依頼メール
- [ ] LINE/SMS通知対応
- [ ] Webhook連携（Slack/Discord通知）
- [ ] 配送遅延通知
- [ ] キャンセル完了通知

---

## ⚠️ 注意事項

### 必ず守ること
1. **APIキーはサーバーサイドで管理**
   - フロントエンドに直接記述しない
   - 環境変数で管理する

2. **個人情報の取り扱い**
   - メール送信に必要な最小限の情報のみ
   - 通知履歴は定期的にクリーンアップ

3. **送信量の制限**
   - SendGridは無料プランで1日100通まで
   - 大量送信する場合は有料プラン検討

4. **テストメールの送信**
   - 本番環境デプロイ前に必ずテスト送信
   - 複数のメールクライアントで表示確認

---

## 📝 まとめ

**⑦ 通知システム（自動）の実装完了**

「人力対応は必ず破綻する」という原則に基づき、3つの重要な通知を自動化しました：

1. **注文確定メール** - 決済成功時に自動送信
2. **発送完了通知** - 管理画面から1クリックで送信
3. **支払失敗通知** - 決済失敗時に自動送信

すべての通知は：
- ✅ 外部サービス（SendGrid/SES/Mailgun）を使用
- ✅ 送信失敗時の自動リトライ（最大3回）
- ✅ 通知履歴の記録
- ✅ HTML & テキスト両形式に対応
- ✅ モバイルフレンドリーなデザイン

**デプロイ準備完了**: すべてのファイルは `公開用ファイル/` フォルダに配置済みです。
