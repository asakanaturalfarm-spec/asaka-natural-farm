# 通知メールシステム セットアップ手順

## 概要
安積直売所オンラインの通知メールシステム（注文確定・発送完了・支払失敗）のセットアップ手順書です。

## ファイル構成
```
安積直売所オンライン/
├── email-service.js          # メール送信エンジン（SendGrid/SES対応）
├── notification-manager.js   # 通知管理・テンプレート生成
├── .env.example              # 環境変数テンプレート
├── .env                      # 環境変数（作成必要・非公開）
└── NOTIFICATION_SETUP.md     # このファイル
```

---

## 前提条件

### 必須
- Node.js 14以上
- npm または yarn
- 独自ドメイン: `asakanatural.jp`
- 送信元メールアドレス: `order@asakanatural.jp`

### 選択（いずれか）
- **SendGrid**アカウント（推奨・簡単）
- **Amazon SES**アカウント（大量送信向け）

---

## セットアップ手順

### 1. 依存パッケージのインストール

#### SendGridを使用する場合
```bash
npm install @sendgrid/mail dotenv
```

#### Amazon SESを使用する場合
```bash
npm install aws-sdk dotenv
```

---

### 2. 環境変数の設定

#### 2-1. .envファイルの作成
```bash
cp .env.example .env
```

#### 2-2. .envファイルを編集

**SendGridを使用する場合:**
```env
EMAIL_SERVICE=sendgrid
EMAIL_FROM=order@asakanatural.jp
DOMAIN=https://asakanatural.jp/store
NODE_ENV=production
SENDGRID_API_KEY=SG.your_actual_api_key_here
```

**Amazon SESを使用する場合:**
```env
EMAIL_SERVICE=ses
EMAIL_FROM=order@asakanatural.jp
DOMAIN=https://asakanatural.jp/store
NODE_ENV=production
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_actual_access_key_here
AWS_SECRET_ACCESS_KEY=your_actual_secret_key_here
```

---

### 3. メールサービスの設定

#### Option A: SendGrid（推奨）

**3-1. SendGridアカウント作成**
- https://sendgrid.com/ でアカウント登録
- 無料プラン: 100通/日（テスト十分）
- エッセンシャルプラン: ¥2,000/月〜（本番推奨）

**3-2. APIキーの取得**
1. Settings → API Keys
2. 「Create API Key」をクリック
3. Full Accessを選択
4. APIキー（`SG.`で始まる）をコピー
5. `.env`の`SENDGRID_API_KEY`に貼り付け

**3-3. 送信元アドレスの認証**
1. Settings → Sender Authentication
2. 「Authenticate Your Domain」を選択
3. `asakanatural.jp`を入力
4. 表示されたDNSレコードをドメイン管理画面に追加
   ```
   種別: TXT / CNAME
   ホスト: em123.asakanatural.jp（SendGridが指定）
   値: SendGridが提供する値
   ```
5. 認証完了まで24-48時間待機

**3-4. 送信元メールアドレスの設定**
1. Settings → Sender Authentication → Single Sender Verification
2. `order@asakanatural.jp`を登録
3. 確認メールのリンクをクリック

---

#### Option B: Amazon SES

**3-1. AWSアカウント作成**
- https://aws.amazon.com/jp/ses/ でアカウント登録
- 料金: $0.10/1000通（非常に安価）

**3-2. IAMユーザーの作成**
1. IAM → Users → Add User
2. ユーザー名: `asaka-email-service`
3. アクセス種別: Programmatic access
4. 権限: `AmazonSESFullAccess`
5. Access Key IDとSecret Access Keyをコピー
6. `.env`に貼り付け

**3-3. 送信元アドレスの認証**
1. SES → Verified Identities → Create Identity
2. Identity type: Domain
3. Domain: `asakanatural.jp`
4. 表示されたDNSレコードをRoute 53または外部DNSに追加
   ```
   種別: TXT
   名前: _amazonses.asakanatural.jp
   値: AWSが提供する値
   ```
5. DKIM設定も同様に追加（3つのCNAMEレコード）

**3-4. サンドボックス解除（本番運用時必須）**
1. SES → Account dashboard
2. 「Request production access」をクリック
3. 用途を説明（例: ECサイトの注文確認メール）
4. 承認まで24時間

---

### 4. DNSレコード設定（重要・到達率向上）

ドメイン管理画面（お名前.com / ムームードメイン等）で以下を設定：

#### 4-1. SPFレコード
```
種別: TXT
名前: asakanatural.jp
値: v=spf1 include:sendgrid.net ~all
```
※SESの場合: `v=spf1 include:amazonses.com ~all`

#### 4-2. DKIMレコード
SendGrid/SESの管理画面に表示されるCNAMEレコードを追加

#### 4-3. DMARCレコード（推奨）
```
種別: TXT
名前: _dmarc.asakanatural.jp
値: v=DMARC1; p=quarantine; rua=mailto:postmaster@asakanatural.jp
```

---

### 5. 実装コード例

#### 5-1. 初期化
```javascript
require('dotenv').config();
const {
    sendOrderConfirmation,
    sendShippingNotification,
    sendPaymentFailureNotification
} = require('./notification-manager');
```

#### 5-2. 注文確定時
```javascript
// 注文処理後に実行
const order = {
    orderId: 'ORD20260122001',
    customerName: '山田太郎',
    customerEmail: 'customer@example.com',
    items: [
        { name: '有機トマト', quantity: 2, price: 1600 },
        { name: '有機きゅうり', quantity: 1, price: 800 }
    ],
    subtotal: 2400,
    shipping: 500,
    tax: 232,
    total: 3132,
    paymentMethod: 'クレジットカード',
    deliveryDate: '2026年1月25日（月）午前中'
};

try {
    const result = await sendOrderConfirmation(order);
    console.log('注文確定メール送信成功:', result);
} catch (error) {
    console.error('メール送信失敗:', error);
    // エラー処理（管理者通知など）
}
```

#### 5-3. 発送完了時
```javascript
const shipment = {
    orderId: 'ORD20260122001',
    customerName: '山田太郎',
    customerEmail: 'customer@example.com',
    trackingNumber: '123456789012',
    carrier: 'ヤマト運輸クール便',
    estimatedDelivery: '2026年1月25日（月）午前中',
    items: [
        { name: '有機トマト', quantity: 2 },
        { name: '有機きゅうり', quantity: 1 }
    ]
};

try {
    const result = await sendShippingNotification(shipment);
    console.log('発送通知メール送信成功:', result);
} catch (error) {
    console.error('メール送信失敗:', error);
}
```

#### 5-4. 支払失敗時
```javascript
const payment = {
    orderId: 'ORD20260122001',
    customerName: '山田太郎',
    customerEmail: 'customer@example.com',
    paymentMethod: 'クレジットカード',
    failureReason: 'カードの有効期限が切れています',
    retryUrl: 'https://asakanatural.jp/store/payment-retry?order=ORD20260122001',
    amount: 3132
};

try {
    const result = await sendPaymentFailureNotification(payment);
    console.log('支払失敗メール送信成功:', result);
} catch (error) {
    console.error('メール送信失敗:', error);
}
```

---

## セキュリティチェックリスト

### 必須対応
- [ ] `.env`ファイルを`.gitignore`に追加
- [ ] APIキーを環境変数で管理（コードに直接書かない）
- [ ] 本番環境ではサーバー側の環境変数を使用
- [ ] SPF/DKIM/DMARCレコードを設定
- [ ] メールアドレス検証を実装済み
- [ ] レート制限を設定済み（10通/分）
- [ ] 重複送信防止を実装済み（24時間）

### 推奨対応
- [ ] エラーログを外部サービス（Sentry等）に送信
- [ ] 送信履歴をデータベースに保存
- [ ] 再送機能の実装
- [ ] バウンスメールの監視
- [ ] 購読解除機能（マーケティングメールの場合）

---

## トラブルシューティング

### メールが届かない場合

**1. SPAMフォルダを確認**
- Gmail: 迷惑メールフォルダをチェック
- Yahoo: 確認→迷惑メール

**2. DNS設定を確認**
```bash
# SPFレコード確認
nslookup -type=TXT asakanatural.jp

# DKIMレコード確認（SendGridの場合）
nslookup -type=CNAME em123._domainkey.asakanatural.jp
```

**3. SendGrid/SESのログを確認**
- SendGrid: Activity → Email Activity
- SES: CloudWatch Logs → SES関連ログ

**4. APIキーが正しいか確認**
```bash
# 環境変数が読み込まれているか確認
node -e "require('dotenv').config(); console.log(process.env.SENDGRID_API_KEY)"
```

### エラーコード対応

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `401 Unauthorized` | APIキーが無効 | APIキーを再生成 |
| `403 Forbidden` | ドメイン未認証 | ドメイン認証を完了 |
| `429 Too Many Requests` | レート制限超過 | 送信間隔を空ける |
| `MessageRejected` (SES) | サンドボックス中 | 本番アクセスを申請 |
| `InvalidParameterValue` | メールアドレス不正 | 形式を確認 |

---

## 本番運用前の確認事項

### テスト送信
```javascript
// テストモードで送信（実際には送信されない）
process.env.NODE_ENV = 'test';
await sendOrderConfirmation(testOrder);
```

### チェックポイント
1. [ ] テストメールが正常に受信できる
2. [ ] HTMLメールが正しく表示される
3. [ ] リンクが正しく動作する
4. [ ] 追跡番号のリンクが正しい
5. [ ] スマートフォンで正しく表示される
6. [ ] 日本語が文字化けしない
7. [ ] SPAMフィルターに引っかからない

### SPAMスコアチェック
- https://www.mail-tester.com/ でメールを送信
- スコア8点以上を目標

---

## パフォーマンス最適化

### 推奨設定
- **レート制限**: 10通/分（実装済み）
- **再送防止**: 24時間（実装済み）
- **タイムアウト**: 30秒
- **リトライ**: 3回（指数バックオフ）

### 大量送信時の対応
```javascript
// バッチ処理で順次送信
const orders = [...]; // 複数の注文

for (const order of orders) {
    try {
        await sendOrderConfirmation(order);
        await new Promise(resolve => setTimeout(resolve, 6000)); // 6秒待機
    } catch (error) {
        console.error(`Failed for ${order.orderId}:`, error);
    }
}
```

---

## サポート・お問い合わせ

### SendGrid
- ドキュメント: https://docs.sendgrid.com/
- サポート: https://support.sendgrid.com/

### Amazon SES
- ドキュメント: https://docs.aws.amazon.com/ses/
- サポート: AWS サポートセンター

### 特定商取引法対応
- 通知メールには以下を含めること（実装済み）:
  - 販売業者名
  - 連絡先（メール・電話）
  - 返品ポリシーへのリンク
  - 特定商取引法表記へのリンク

---

## 更新履歴
- 2026-01-22: 初版作成
