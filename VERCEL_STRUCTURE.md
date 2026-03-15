# Vercel公開向け パス設計・フォルダ設計

このプロジェクトは既存のフラット構成（`*.html` がルート直下）を維持しながら、Vercelで段階移行できるように設計します。

## 1) 目標
- 既存リンクを壊さない
- 拡張子なしURL（クリーンURL）で公開
- 意味的なURLに統一（例: `/products/v1`）
- 将来的に `api/` と `public/` へ整理しやすい状態にする

## 2) 現在採用した公開パス設計
`vercel.json` で以下を設定済みです。

- `cleanUrls: true`
  - `/products.html` を `/products` で配信
- 旧URL → 新URL の301系リダイレクト
  - `/product-v1.html` → `/products/v1`
  - `/admin-orders.html` → `/admin/orders`
  - `/admin-shipping.html` → `/admin/shipping`
- 新URL → 既存ファイル のリライト
  - `/products/:id` → `/product-:id.html`
  - `/admin/orders` → `/admin-orders.html`
  - `/admin/shipping` → `/admin-shipping.html`
  - `/legal/privacy` → `/privacy.html`
  - `/legal/tokushoho` → `/tokushoho.html`
  - `/legal/store-tokushoho` → `/store-tokushoho.html`
  - `/shop/contact` → `/shop-contact.html`

## 3) 推奨フォルダ設計（段階移行）
最終的には以下へ整理するのがVercel運用に適しています。

- `public/`
  - `assets/css/`
  - `assets/js/`
  - `assets/img/`
  - `fonts/`
- `pages/` または `site/`（静的ページ原本）
  - `products/[id].html` 相当
  - `admin/orders.html` など
- `api/`（Serverless Functions）
  - `api/inventory/*.js`
  - `api/notifications/*.js`
- `docs/`
  - 運用手順・連携仕様

## 4) APIパス設計方針
フロントの在庫APIは `localhost` 固定を廃止し、同一オリジン基準に変更済みです。

- `inventory-api.js`
- `shop/inventory-api.js`

どちらもデフォルトは以下です。
- `apiBaseUrl: '/api'`
- `harvestAppUrl: '/api/harvest'`

本番ではVercelの環境変数 (`window.ENV`) で上書きできます。

## 5) 次の移行ステップ（任意）
1. `api/` に在庫APIのServerless実装を追加
2. HTML内のリンクを順次クリーンURLへ更新
3. 画像・CSS・JSを `public/assets/` へ集約
4. 未使用ファイルを `archive/` に退避

この手順なら、公開URLを維持したまま安全に構造改善できます。
