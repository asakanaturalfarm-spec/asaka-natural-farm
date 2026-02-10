
# 発送完了通知管理システム - 実装ガイド（2026年2月最新版・Resend対応）

## 概要
受注発注管理アプリとリアルタイム連携し、発送完了通知メールをResend（order@asakanatural.jp）経由で自動送信するシステムです。

## 主な機能

### 1. 受注発注管理アプリとの連携（sync-with-orders.js）
- 受注・顧客・商品データをリアルタイム同期（5分キャッシュ/強制同期）
- 顧客・注文情報の一元管理

### 2. 発送完了通知管理画面（admin-notification.html）
- 発送待ち/通知済み/全注文のタブ表示
- 顧客・注文情報の自動取得
- 通知メール自動送信・履歴管理

### 3. 管理者認証・通知管理（admin-notification-manager.js）
- 管理者認証・履歴管理
- 管理者への確認メール自動送信

## ファイル構成

```
shop/
├── admin-notification.html          # 発送通知管理画面
├── sync-with-orders.js              # 受注発注管理アプリ連携
├── admin-notification-manager.js    # 管理者通知管理
├── admin.html                       # 管理画面トップ
└── notification-system.js           # 通知システム
```

## セットアップ手順

1. 上記ファイルを `shop/` ディレクトリに配置
2. `admin.html` に「発送通知管理」リンクを追加（実装済み）
3. `admin-notification.html` で以下スクリプトを自動読み込み
   - asaka-hub.js, sync-with-orders.js, notification-system.js, admin-notification-manager.js
4. `admin-notification-manager.js` の管理者メール/名前を編集
   ```javascript
   const AdminNotificationManager = {
     ADMIN_EMAIL: 'tanabe@asakanatural.jp',
     ADMIN_NAME: '田辺'
   };
   ```
5. メール送信サービスはResendを利用
   ```javascript
   const notificationManager = window.NotificationSystem.initialize({
     provider: 'resend',
     fromEmail: 'order@asakanatural.jp',
     fromName: '安積自然農園'
   });
   ```

## 使い方

1. 管理画面トップ（admin.html）から「発送通知管理」をクリック
2. 発送待ちタブで注文を選択し「通知を送信」
3. 配送業者・追跡番号・発送日・到着予定日を入力し送信
4. 通知済みタブで履歴・追跡番号を確認
5. 強制同期ボタンで最新データ取得

※ 通知メールはシステムが自動送信します。手動メール送信は想定していません。

## データフロー

```
受注発注管理アプリ
    ↓ (localStorage)
sync-with-orders.js
    ↓ (キャッシュ)
admin-notification.html
    ↓ (フォーム入力)
admin-notification-manager.js
    ↓ (API)
Resend（order@asakanatural.jp）
    ↓
顧客メールボックス
```

## 技術詳細

### sync-with-orders.js
- OrderSyncManager.syncFromOrdersApp() でデータ同期
- getOrderById, getCustomerById, getOrderStats など各種取得API
- キャッシュクリア/強制同期対応

### admin-notification-manager.js
- isAdminAuthenticated, setAdminAuth, sendShippingNotificationAsAdmin, generateShippingNotificationEmail など
- 通知データ形式は { orderId, customerEmail, ... } 形式

## メール送信の実装（Resend例）

```javascript
// backend/routes/send-email.js
const { Resend } = require('@resend/node');
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/send-email', async (req, res) => {
  try {
    const result = await resend.emails.send({
      from: req.body.from.email,
      to: req.body.to,
      subject: req.body.subject,
      html: req.body.html,
      text: req.body.text
    });
    res.json({ id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### .env例
```
RESEND_API_KEY=rs_xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=order@asakanatural.jp
```

## トラブルシューティング

- データが表示されない: 受注発注管理アプリの保存・localStorage・強制同期を確認
- メール送信失敗: Resend APIキー・fromアドレス・追跡番号必須
- 同期が古い: 強制同期ボタンで即時更新

## セキュリティ・運用注意

1. 管理者認証はサーバーサイド検証・セッションタイムアウト・HTTPS必須
2. メール送信はResend利用・APIキーは環境変数管理・HTMLサニタイズ
3. アクセス制御（管理者認証・監査ログ）
4. 顧客メールアドレス暗号化・注文データ保護・GDPR等対応

## 拡張例

- 複数配送業者対応（セレクトボックス）
- テンプレートメール機能（EmailTemplates管理）
- 一括送信機能（sendBulkNotifications）

## まとめ

このシステムにより以下が実現します：


✅ 受注発注管理アプリとのリアルタイム連携
✅ 顧客・注文情報の一元管理
✅ 自動配信メール機能（Resendによる自動送信）
✅ 通知履歴の管理

サポートが必要な場合は、コンソールでエラーメッセージを確認し、本ガイドのトラブルシューティングを参照してください。
