# 通知メールシステム セットアップ手順

## 概要
```
安積直売所オンライン/
 - APIキーは環境変数管理（SendGrid/SES/Resend共通）
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
- **Resend**アカウント（シンプル・高到達率・個人事業主も利用可）

---

## セットアップ手順

### 1. 依存パッケージのインストール
（Resend: @resend/node dotenv）
＊SendGridは企業向けで個人事業主は利用不可
---

### 2. 環境変数の設定

#### .envファイル例（Resend推奨）
```env
EMAIL_SERVICE=resend
EMAIL_FROM=order@asakanatural.jp
DOMAIN=https://asakanatural.jp/store
NODE_ENV=production
RESEND_API_KEY=rs_xxxxxxxx
```

---

### 3. メールサービスの設定



### 4. DNSレコード設定（重要・到達率向上）

ドメイン管理画面でSPF/DKIM/DMARCを必ず設定。迷惑メール対策・到達率向上に必須。

#### 4-1. SPFレコード
```
種別: TXT
名前: asakanatural.jp
値: v=spf1 include:sendgrid.net ~all
```
※SESの場合: `v=spf1 include:amazonses.com ~all`

#### 4-2. DKIMレコード
Resend管理画面に表示されるCNAMEレコードを追加

#### 4-3. DMARCレコード（推奨）
```
種別: TXT
名前: _dmarc.asakanatural.jp
値: v=DMARC1; p=quarantine; rua=mailto:postmaster@asakanatural.jp
```

---

### 5. 実装コード例

#### 主要API例（2026年2月最新版）
```javascript
// 初期化
require('dotenv').config();
const { Resend } = require('@resend/node');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
	from: 'order@asakanatural.jp',
	to: 'customer@example.com',
	subject: 'ご注文確定のお知らせ',
	html: '<p>注文内容...</p>'
});
```

---

## セキュリティチェックリスト

### 必須
- .envは必ず.gitignore
- APIキーは環境変数管理
- SPF/DKIM/DMARC必須
- メールアドレス検証・レート制限・重複防止（24h）必須

### 推奨
- エラーログ外部送信
- 送信履歴DB保存
- 再送・バウンス監視
- 購読解除（マーケティング用途）

---

## トラブルシューティング

### メールが届かない場合
- SPAMフォルダ・DNS設定・APIキー・SendGrid/SESログを必ず確認

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

### 本番前チェック
- テストメール受信・HTML表示・リンク・追跡番号・スマホ表示・日本語・SPAM判定を必ず確認
- mail-tester.comでSPAMスコア8点以上推奨

---

## パフォーマンス最適化

### 推奨設定
- レート制限10通/分・再送防止24h・タイムアウト30秒・リトライ3回
- バッチ送信時は6秒以上間隔を空ける

---

## サポート・お問い合わせ

### サポート
- Resend: https://resend.com/docs / https://resend.com/support

### 法令対応
- 通知メールには販売業者名・連絡先・返品ポリシー・特商法表記リンクを必ず記載

---

## 更新履歴
- 2026-02-10: 最新版に整理
