Mono テンプレート — 安積直売所

使い方:
-- `design/templates/mono-tea/index.html` をブラウザで開いてプレビューしてください。
-- テンプレートは既存プロジェクトの `style.css` と `ux.css` を参照するようになっています。
  プロジェクトルートからプレビューする場合（推奨）、追加操作なしで見た目が現行サイトに揃います。
  もし独立して確認したい場合は `design/templates/mono-tea/styles.css` を編集して置き換えてください。
- 静的アセット（`assets/`）にはプレビュー用の画像を入れてください。推奨画像:
  - `assets/fv.jpg` — ヒーロ画像
  - `assets/profile.jpg` — 農園主プロフィール
  - `assets/product01.jpg`, `product02.jpg`, `product03.jpg` — 商品画像
- 商品データは `data/products.json` にあります。実際の運用ではバックエンドから差し替えてください。

ローカルプレビュー:
```powershell
python -m http.server 8000
# ブラウザで http://localhost:8000/design/templates/mono-tea/index.html を開く
```

移行ノート:
- このテンプレートは現在のサイトのセクション構成（ナビ・ヒーロ・特徴・農園紹介・商品・配送・研究・ニュースレター・フッター）を保持しています。
- React コンポーネントへ分割する場合は `index.html` の各セクションを個別コンポーネント化し、`data/products.json` を props/フェッチで供給してください。
