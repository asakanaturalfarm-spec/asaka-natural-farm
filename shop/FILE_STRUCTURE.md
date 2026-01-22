# ファイル構成提案書

## 実装済みファイル一覧

### 通知メールシステム（新規実装）

```
安積直売所オンライン/
│
├── email-service.js              # メール送信エンジン（278行）
│   ├── SendGrid送信機能
│   ├── Amazon SES送信機能
│   ├── メールアドレス検証
│   ├── レート制限（10通/分）
│   ├── 重複送信防止（24時間）
│   └── エラーハンドリング
│
├── notification-manager.js       # 通知管理・テンプレート（412行）
│   ├── EmailTemplates クラス
│   │   ├── orderConfirmation()      # 注文確定メール
│   │   ├── shippingNotification()   # 発送完了メール
│   │   └── paymentFailure()         # 支払失敗メール
│   ├── sendOrderConfirmation()
│   ├── sendShippingNotification()
│   └── sendPaymentFailureNotification()
│
├── .env.example                  # 環境変数テンプレート
│   ├── EMAIL_SERVICE（sendgrid/ses）
│   ├── EMAIL_FROM（order@asakanatural.jp）
│   ├── SENDGRID_API_KEY
│   └── AWS認証情報
│
└── NOTIFICATION_SETUP.md         # セットアップ手順書（400行超）
    ├── 前提条件・依存関係
    ├── SendGrid設定手順
    ├── Amazon SES設定手順
    ├── DNS設定（SPF/DKIM/DMARC）
    ├── 実装コード例
    ├── セキュリティチェックリスト
    ├── トラブルシューティング
    └── 本番運用前チェック
```

---

## システムアーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────────┐
│           フロントエンド層                    │
│   (checkout.html, cart.html, etc.)          │
└─────────────────┬───────────────────────────┘
                  │
                  │ 注文確定/発送完了/支払失敗
                  │
┌─────────────────▼───────────────────────────┐
│       notification-manager.js               │
│  ┌───────────────────────────────────────┐  │
│  │ EmailTemplates                        │  │
│  │  - HTML/テキスト生成                  │  │
│  │  - 特定商取引法対応                   │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │ 通知送信関数                          │  │
│  │  - 重複チェック                       │  │
│  │  - レート制限                         │  │
│  └───────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         email-service.js                    │
│  ┌───────────────────────────────────────┐  │
│  │ 送信プロバイダー選択                  │  │
│  │  - SendGrid                           │  │
│  │  - Amazon SES                         │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │ 検証・セキュリティ                    │  │
│  │  - メールアドレス検証                 │  │
│  │  - 環境変数検証                       │  │
│  │  - トラッキング無効化                 │  │
│  └───────────────────────────────────────┘  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        外部メールサービス                    │
│   SendGrid API  or  Amazon SES              │
└─────────────────┬───────────────────────────┘
                  │
                  │ SMTP配信
                  │
┌─────────────────▼───────────────────────────┐
│          顧客のメールボックス                │
│   Gmail / Yahoo / Outlook / その他           │
└─────────────────────────────────────────────┘
```

---

## 統合フロー

### 1. 注文確定フロー
```
[checkout.html]
    ↓ 注文確定ボタンクリック
[チェックアウトロジック]
    ↓ 在庫確認・決済処理
[注文データ生成]
    ↓
[notification-manager.sendOrderConfirmation()]
    ↓ 重複チェック → OK
    ↓ レート制限チェック → OK
    ↓ テンプレート生成（HTML + Text）
[email-service.sendEmail()]
    ↓ メールアドレス検証
    ↓ 環境変数検証
    ↓ SendGrid/SES送信
[顧客メール受信]
    ↓ 注文番号・明細・配送情報
    ↓ 特定商取引法リンク
```

### 2. 発送完了フロー
```
[admin-shipping.html]
    ↓ 追跡番号入力＋発送ボタンクリック
[発送データ生成]
    ↓ 注文ID・追跡番号・配送日
[notification-manager.sendShippingNotification()]
    ↓ テンプレート生成（追跡URLリンク付き）
[email-service.sendEmail()]
    ↓ 送信
[顧客メール受信]
    ↓ 追跡番号・ヤマト運輸リンク
    ↓ 配送予定日・返品ポリシー
```

### 3. 支払失敗フロー
```
[決済API（Stripe等）]
    ↓ Webhookで失敗通知受信
[支払失敗ハンドラー]
    ↓ 失敗理由解析
    ↓ 再試行URL生成
[notification-manager.sendPaymentFailureNotification()]
    ↓ テンプレート生成（再試行リンク付き）
[email-service.sendEmail()]
    ↓ 送信
[顧客メール受信]
    ↓ 失敗理由・再試行リンク
    ↓ お問い合わせリンク
```

---

## セキュリティ対策実装状況

| 対策項目 | 実装状況 | 詳細 |
|---------|---------|------|
| **APIキー保護** | ✅ 完了 | 環境変数管理、.gitignore対応 |
| **メールアドレス検証** | ✅ 完了 | 正規表現検証 |
| **レート制限** | ✅ 完了 | 10通/分、メモリベース |
| **重複送信防止** | ✅ 完了 | 注文ID+種別で24時間管理 |
| **SPF設定** | 📋 手順書 | DNS設定必要 |
| **DKIM設定** | 📋 手順書 | DNS設定必要 |
| **DMARC設定** | 📋 手順書 | DNS設定推奨 |
| **トラッキング無効** | ✅ 完了 | トランザクションメール設定 |
| **エラーログ** | ✅ 完了 | console.error（本番は外部サービス推奨） |
| **入力サニタイズ** | ⚠️ 部分 | テンプレートリテラル使用（XSS対策は別途） |

---

## 依存関係

### NPMパッケージ
```json
{
  "dependencies": {
    "@sendgrid/mail": "^7.7.0",      // SendGrid使用時
    "aws-sdk": "^2.1400.0",          // Amazon SES使用時
    "dotenv": "^16.0.3"              // 環境変数管理
  }
}
```

### インストールコマンド
```bash
# SendGrid使用の場合
npm install @sendgrid/mail dotenv

# Amazon SES使用の場合
npm install aws-sdk dotenv
```

---

## 環境変数マッピング

### 必須変数
| 変数名 | 値例 | 説明 |
|--------|------|------|
| `EMAIL_SERVICE` | `sendgrid` | プロバイダー選択 |
| `EMAIL_FROM` | `order@asakanatural.jp` | 送信元アドレス |
| `DOMAIN` | `https://asakanatural.jp/store` | ベースURL |
| `NODE_ENV` | `production` | 環境識別 |

### SendGrid用
| 変数名 | 値例 | 説明 |
|--------|------|------|
| `SENDGRID_API_KEY` | `SG.xxxx...` | APIキー |

### Amazon SES用
| 変数名 | 値例 | 説明 |
|--------|------|------|
| `AWS_REGION` | `ap-northeast-1` | AWSリージョン |
| `AWS_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` | アクセスキー |
| `AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/K7MDENG/...` | シークレットキー |

---

## 使用例

### サーバーサイド（Node.js）
```javascript
// サーバー起動時に読み込み
require('dotenv').config();
const { sendOrderConfirmation } = require('./notification-manager');

// APIエンドポイント
app.post('/api/orders', async (req, res) => {
    try {
        // 注文処理
        const order = processOrder(req.body);
        
        // 通知メール送信
        await sendOrderConfirmation(order);
        
        res.json({ success: true, orderId: order.orderId });
    } catch (error) {
        console.error('Order failed:', error);
        res.status(500).json({ error: error.message });
    }
});
```

### フロントエンド統合（既存のcheckout.html）
```javascript
// checkout.html内のplaceOrder()関数に追加
async function placeOrder() {
    // ... 既存の注文処理 ...
    
    // サーバーに注文データを送信
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    
    if (response.ok) {
        // 注文完了画面へ遷移
        window.location.href = 'order-complete.html';
    }
}
```

---

## テスト手順

### 1. ユニットテスト（推奨）
```javascript
// test/email-service.test.js
const { validateEmail } = require('../email-service');

test('有効なメールアドレス', () => {
    expect(validateEmail('test@example.com')).toBe(true);
});

test('無効なメールアドレス', () => {
    expect(validateEmail('invalid')).toBe(false);
});
```

### 2. 統合テスト
```bash
# テストモードで送信
NODE_ENV=test node -e "
require('dotenv').config();
const { sendOrderConfirmation } = require('./notification-manager');
sendOrderConfirmation({
    orderId: 'TEST001',
    customerName: 'テスト太郎',
    customerEmail: 'your-email@example.com',
    items: [{ name: 'テスト商品', quantity: 1, price: 1000 }],
    subtotal: 1000,
    shipping: 500,
    tax: 120,
    total: 1620,
    paymentMethod: 'テスト',
    deliveryDate: '2026年1月25日'
});
"
```

### 3. 到達率テスト
```bash
# Mail Testerでスコア確認
# 1. https://www.mail-tester.com/ にアクセス
# 2. 表示されたメールアドレスにテスト送信
# 3. スコア8点以上を確認
```

---

## 本番デプロイメント

### Vercel/Netlifyの場合
```bash
# 環境変数を管理画面で設定
# Settings → Environment Variables
EMAIL_SERVICE=sendgrid
EMAIL_FROM=order@asakanatural.jp
SENDGRID_API_KEY=SG.your_actual_key
DOMAIN=https://asakanatural.jp/store
NODE_ENV=production
```

### AWS/VPSの場合
```bash
# .env.productionファイル作成（非公開）
echo "EMAIL_SERVICE=sendgrid" > .env.production
echo "EMAIL_FROM=order@asakanatural.jp" >> .env.production
echo "SENDGRID_API_KEY=$YOUR_API_KEY" >> .env.production

# プロセスマネージャーで起動
pm2 start server.js --env production
```

---

## 監視・メンテナンス

### 推奨監視項目
- [ ] 送信成功率（目標: 99%以上）
- [ ] 平均送信時間（目標: 3秒以内）
- [ ] エラー発生率（目標: 1%以下）
- [ ] バウンス率（目標: 5%以下）
- [ ] SPAM報告率（目標: 0.1%以下）

### ログ保存（推奨）
```javascript
// 本番環境では外部ログサービスを使用
// 例: Sentry, Loggly, AWS CloudWatch

const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'your_dsn_here' });

try {
    await sendEmail(...);
} catch (error) {
    Sentry.captureException(error);
}
```

---

## 次のステップ（オプション）

### 拡張機能案
1. **送信履歴管理**
   - データベースに送信ログを保存
   - 管理画面で送信履歴を確認

2. **再送機能**
   - 失敗メールの手動再送
   - 管理画面から操作可能

3. **テンプレートカスタマイズ**
   - 季節ごとのデザイン変更
   - キャンペーン告知の追加

4. **配信時間最適化**
   - 顧客の開封率データから最適時間に送信
   - A/Bテストによる件名最適化

5. **多言語対応**
   - 英語・中国語テンプレート追加
   - ユーザー設定に基づく言語選択

---

## まとめ

### 実装完了項目
✅ メール送信エンジン（SendGrid/SES対応）  
✅ 通知管理システム（3種類のメール）  
✅ セキュリティ対策（検証・レート制限・重複防止）  
✅ エラーハンドリング  
✅ 環境変数管理  
✅ 詳細な設定手順書  

### 残タスク（運用者が実施）
📋 SendGrid/SESアカウント作成  
📋 APIキー取得  
📋 DNS設定（SPF/DKIM/DMARC）  
📋 ドメイン認証  
📋 送信元メールアドレス認証  
📋 テスト送信・到達率確認  

### 本番運用開始条件
- [ ] DNSレコード設定完了
- [ ] ドメイン認証完了
- [ ] テストメール正常受信確認
- [ ] SPAMスコア8点以上
- [ ] 本番環境に環境変数設定
- [ ] エラー監視体制構築

---

**実装者**: GitHub Copilot  
**実装日**: 2026年1月22日  
**バージョン**: 1.0.0
