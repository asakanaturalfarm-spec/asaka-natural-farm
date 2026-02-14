# 安積直売所オンライン - ホームページ統合完了

## 📁 構造

```
安積自然農園ホームページ/
├── index.html              # ホームページ（ナビにストアリンク追加済み）
├── production.html
├── distribution.html　#企業向け問い合わせページ
├── style.css
├── script.js
├── sitemap.xml            # ストアページ追加済み
├── robots.txt
└── store/                 # ← ECサイト統合
    ├── index.html         # ショップトップ
    ├── products.html      # 商品一覧
    ├── cart.html          # カート
    ├── checkout.html      # チェックアウト
    ├── faq.html           # FAQ
    ├── shop-contact.html       # お問い合わせ
    ├── tokushoho.html     # 特定商取引法
    ├── privacy.html       # プライバシーポリシー
    ├── returns.html       # 返品ポリシー
    ├── login.html
    ├── account.html
    ├── orders.html
    ├── admin*.html        # 管理画面
    ├── style.css
    ├── asaka-hub.js
    ├── inventory-api.js   # 在庫管理（実用版）
    ├── notification-manager.js  # 通知メール
    ├── email-service.js
    └── ...（全44ファイル）
```

## 🔗 統合内容

### 1. ナビゲーション統一

**親サイト（index.html）**
```html
<nav class="nav">
    <a href="#philosophy">想い</a>
    <a href="#method">農法</a>
    <a href="#vegetables">野菜</a>
    <a href="#products">加工品</a>
    <a href="#location">農園</a>
    <a href="store/">オンラインショップ</a>  ← 追加
</nav>
```

**ストアページ（全ページ共通）**
```html
<nav class="nav-menu">
    <a href="../">農園トップ</a>           ← 親サイトへ
    <a href="index.html">ショップ</a>
    <a href="products.html">商品一覧</a>
    <a href="faq.html">FAQ</a>
    <a href="shop-contact.html">お問い合わせ</a>
</nav>
```

### 2. OGP統合

**親サイト（index.html）**
```html
<meta property="og:title" content="安積自然農園 | 無肥料無農薬栽培">
<meta property="og:description" content="福島県郡山市の安積疎水流域で、無肥料・無農薬・自家採種による自然農法を実践...">
<meta property="og:url" content="https://asakanatural.jp/">
<meta property="og:image" content="/無肥料.png">
```

**ストア（store/index.html）**
```html
<meta property="og:title" content="安積直売所 | 自然農法野菜・オンライン販売">
<meta property="og:description" content="肥料・農薬不使用の自然農法野菜を産地直送でお届けします。">
<meta property="og:url" content="https://asakanatural.jp/store/">
<meta property="og:image" content="/store/image/fv.jpg">
```

### 3. 構造化データ統合

**親サイト（index.html）**
```json
{
  "@type": "Organization",
  "name": "安積自然農園",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "安積直売所オンライン",
    "url": "https://asakanatural.jp/store/"
  },
  "potentialAction": {
    "@type": "BuyAction",
    "target": "https://asakanatural.jp/store/"
  }
}
```

**ストア（store/index.html）**
```json
{
  "@type": "Store",
  "name": "安積直売所オンライン",
  "description": "無肥料・無農薬・自家採種の自然農法野菜を産地直送...",
  "url": "https://asakanatural.jp/store/",
  "parentOrganization": {
    "@type": "Organization",
    "name": "安積自然農園",
    "url": "https://asakanatural.jp/"
  },
  "paymentAccepted": "Cash, Credit Card, Bank Transfer",
  "priceRange": "¥¥",
  "areaServed": "JP"
}
```

### 4. Sitemap統合

**sitemap.xml（親サイト）**
```xml
<!-- オンラインショップ -->
<url>
  <loc>https://asakanatural.jp/store/</loc>
  <priority>0.9</priority>
  <changefreq>weekly</changefreq>
</url>
<url>
  <loc>https://asakanatural.jp/store/products.html</loc>
  <priority>0.9</priority>
  <changefreq>daily</changefreq>
</url>
<url>
  <loc>https://asakanatural.jp/store/faq.html</loc>
  <priority>0.7</priority>
</url>
<!-- 法務ページ -->
<url>
  <loc>https://asakanatural.jp/store/tokushoho.html</loc>
  <priority>0.5</priority>
</url>
<url>
  <loc>https://asakanatural.jp/store/privacy.html</loc>
  <priority>0.5</priority>
</url>
<url>
  <loc>https://asakanatural.jp/store/returns.html</loc>
  <priority>0.5</priority>
</url>
```

## 🎯 統合効果

### SEO
- ✅ 単一ドメイン統合（asakanatural.jp）
- ✅ 構造化データで親子関係明示
- ✅ サイトマップ統合
- ✅ 内部リンク最適化

### UX
- ✅ シームレスなナビゲーション
- ✅ 農園情報とショップの自然な導線
- ✅ ブランド統一感

### 技術
- ✅ 静的HTMLとして配信可能
- ✅ GitHub Pages対応
- ✅ 相対パス対応
- ✅ 独立動作可能（API未接続でも表示OK）

## 🚀 デプロイ方法

### GitHub Pages
```bash
# リポジトリルート = 安積自然農園ホームページ
git add .
git commit -m "Add online store to /store/"
git push origin main

# GitHub Settings → Pages → main branch → Save
# → https://asakanaturalfarm-spec.github.io/asaka-natural-farm/
# → https://asakanaturalfarm-spec.github.io/asaka-natural-farm/store/
```

### カスタムドメイン設定
```
# GitHub Pages → Custom domain: asakanatural.jp
# DNS設定（お名前.com等）
# A レコード: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
# CNAME store.asakanatural.jp → asakanaturalfarm-spec.github.io

→ https://asakanatural.jp/
→ https://asakanatural.jp/store/
```

### Netlify/Vercel
```bash
# ビルド設定不要（静的HTML）
# Publish directory: /
# ドメイン: asakanatural.jp
```

## ✅ 完了チェックリスト

- [x] /store/ ディレクトリ作成
- [x] 全ECファイルコピー（44ファイル）
- [x] 親サイトナビゲーション更新
- [x] ストア全ページナビゲーション統一
- [x] OGP更新（親・子）
- [x] 構造化データ統合
- [x] Sitemap統合
- [x] 相対パス修正
- [x] ロゴリンク統一

## 📝 次のステップ

### 即実施
1. robots.txt確認（/store/をクロール許可）
2. 本番環境でテスト
3. Google Search Console登録
4. OGP画像確認

### 今後の改善
1. パンくずリスト追加
2. カノニカルURL設定
3. hreflang設定（多言語対応時）
4. パフォーマンス最適化（画像CDN等）

---

**統合完了日**: 2026年1月22日  
**ステータス**: デプロイ準備完了 ✅
