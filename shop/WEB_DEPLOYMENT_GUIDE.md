# 安積直売所オンライン - ウェブ公開ガイド

## 📦 公開準備完了

安積直売所オンラインサイトのウェブ公開に必要なファイルが揃いました。

## 🌐 公開に必要なファイル

### ✅ 作成済みファイル
- `robots.txt` - 検索エンジンクローラー制御
- `sitemap.xml` - サイト構造マップ（SEO対策）
- すべてのHTMLページ（index.html, products.html, etc.）
- CSS、JavaScript、画像ファイル

## 🚀 ウェブ公開手順

### オプション1: GitHub Pages（無料）

1. **GitHubリポジトリを作成**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 安積直売所オンライン"
   git branch -M main
   git remote add origin https://github.com/yourusername/asaka-shop.git
   git push -u origin main
   ```

2. **GitHub Pagesを有効化**
   - リポジトリの Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

3. **公開URL**
   - `https://yourusername.github.io/asaka-shop/`

### オプション2: Netlify（無料・推奨）

1. **Netlifyにサインアップ**
   - https://www.netlify.com/

2. **サイトをデプロイ**
   - "Add new site" → "Deploy manually"
   - フォルダ全体をドラッグ&ドロップ

3. **カスタムドメイン設定（オプション）**
   - Site settings → Domain management
   - 独自ドメインを追加可能

### オプション3: Vercel（無料）

1. **Vercelにサインアップ**
   - https://vercel.com/

2. **プロジェクトをインポート**
   - "Add New..." → "Project"
   - GitHubリポジトリをインポート

3. **自動デプロイ**
   - mainブランチへのpushで自動更新

### オプション4: 従来のホスティング（有料）

レンタルサーバー（さくら、Xserver、ロリポップなど）にFTPアップロード
1. FTPクライアント（FileZilla等）でサーバー接続
2. 全ファイルをpublic_html/にアップロード
3. ドメイン設定

## 📝 公開前チェックリスト

### 必須作業
- [ ] `sitemap.xml`のドメインURLを実際のドメインに変更
- [ ] `robots.txt`のドメインURLを実際のドメインに変更
- [ ] index.htmlのOG画像パスを絶対URLに変更
- [ ] すべてのメタタグを確認
- [ ] 問い合わせフォームのメール送信先を設定

### 推奨作業
- [ ] Google Analytics設定
- [ ] Google Search Console登録
- [ ] SSL証明書設定（HTTPS化）
- [ ] ファビコン追加
- [ ] 404ページ作成

## 🔧 公開後の設定

### 1. ドメイン変更
`sitemap.xml`と`robots.txt`内の`https://asaka-shop.example.com`を実際のドメインに置換：
```bash
# 例：https://asaka-farm.com に変更する場合
```

### 2. Google Search Console
- https://search.google.com/search-console
- サイトを追加してsitemap.xmlを送信

### 3. SSL証明書
ほとんどのモダンなホスティングサービス（Netlify、Vercel、GitHub Pages）は自動的にSSL証明書を提供します。

## 📊 技術仕様

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **依存関係**: なし（CDN経由でGoogle Fonts使用）
- **ブラウザ対応**: Chrome, Firefox, Safari, Edge（最新版）
- **モバイル対応**: レスポンシブデザイン

## 🔒 セキュリティ

- 管理画面は`robots.txt`でクロール対象外
- ログイン機能実装済み
- フォームバリデーション実装済み

## 💡 次のステップ

1. **決済システム統合**（Stripe、PayPal等）
2. **バックエンドAPI開発**（Node.js + Express推奨）
3. **データベース接続**（MongoDB、PostgreSQL等）
4. **メール通知機能**（SendGrid、AWS SES等）
5. **在庫管理システム統合**

---

**作成日**: 2026年1月22日
**バージョン**: 1.0
