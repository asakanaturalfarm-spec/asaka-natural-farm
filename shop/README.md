# 安積直売所 - Reactプロジェクト

自然農法で育てた野菜のオンライン直売サイト（Reactコンポーネント版）

## 特徴

- ✅ Reactコンポーネント化（11個の機能的コンポーネント）
- ✅ SEO最適化（Meta tags、OG設定）
- ✅ アクセシビリティ対応（ARIA、Skip link）
- ✅ レスポンシブデザイン（モバイル最適化）
- ✅ 状態管理（useState、useEffect）
- ✅ フォーム検証付き
- ✅ LocalStorage対応（クーポン管理）

## プロジェクト構成

```
asaka-farm-shop/
├── public/
│   └── index.html          # React root mount point
├── components/
│   ├── Header.jsx          # ナビゲーション＆ロゴ
│   ├── Hero.jsx            # メインバナー
│   ├── Features.jsx        # 特徴セクション
│   ├── About.jsx           # 農園紹介
│   ├── Products.jsx        # 商品グリッド
│   ├── Shipping.jsx        # 配送情報
│   ├── Newsletter.jsx      # メール登録
│   ├── Footer.jsx          # フッター
│   ├── EventBanner.jsx     # 固定イベントバナー
│   └── SurveyModal.jsx     # アンケートモーダル
├── App.jsx                 # メインコンポーネント
├── index.js                # React entry point
├── style.css               # グローバルスタイル
├── package.json            # 依存関係
└── image/                  # 画像フォルダ
    ├── fv.jpg
    ├── profile.jpg
    └── sample1-4.jpg
```

## インストール＆実行

### 1. 依存パッケージをインストール

```bash
npm install
```

### 2. 開発サーバーを起動

```bash
npm start
```

ブラウザで http://localhost:3000 が自動で開きます。

### 3. 本番ビルド

```bash
npm build
```

## コンポーネント一覧

| コンポーネント | 責務 | 状態管理 |
|---|---|---|
| **App** | メイン・状態管理・レイアウト | useState, useEffect |
| **Header** | ナビゲーション、モバイルメニュー | useState |
| **Hero** | メインバナー、CTA | - |
| **Features** | 3つの特徴紹介 | - |
| **About** | 農園紹介 | - |
| **Products** | 商品グリッド、カート | useMemo |
| **Shipping** | 配送情報 | - |
| **Newsletter** | メール登録 | useState |
| **Footer** | フッター | - |
| **EventBanner** | クーポン告知バナー | useState |
| **SurveyModal** | アンケートフォーム | useState |

## 最適化機能

### SEO
- Meta description, OG tags, theme-color
- 構造化マークアップ対応

### アクセシビリティ
- ARIA labels and roles
- Skip link
- Focus visible style
- キーボード操作対応

### パフォーマンス
- 遅延ロード（lazy loading）
- useMemo で不要な再レンダリング防止
- Passive event listeners
- コード分割対応可能

### UX
- スムーススクロール
- フォーム検証
- LocalStorage クーポン管理
- リアルタイム通知

## 環境変数

（必要に応じて `.env` ファイルを作成）

```
REACT_APP_API_URL=https://api.example.com
```

## デプロイ

### GitHub Pages

```bash
npm install gh-pages --save-dev
```

`package.json` に以下を追加：

```json
{
  "homepage": "https://username.github.io/asaka-farm-shop",
  "scripts": {
    "deploy": "npm run build && gh-pages -d build"
  }
}
```

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

1. GitHub にプッシュ
2. Netlify に接続
3. ビルドコマンド: `npm run build`
4. パブリッシュディレクトリ: `build`

## トラブルシューティング

### 画像が表示されない
→ `public/` フォルダに `image/` ディレクトリを配置

### ポート 3000 が既に使用中
```bash
PORT=3001 npm start
```

### キャッシュの問題
```bash
npm start -- --reset-cache
```

## ライセンス

© 2025 安積直売所. All rights reserved.

## 今後の拡張予定

- [ ] ショッピングカート機能
- [ ] ユーザー認証
- [ ] 決済機能
- [ ] ブログセクション
- [ ] レビュー・評価機能
- [ ] 在庫管理システム
