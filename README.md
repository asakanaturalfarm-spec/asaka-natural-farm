# 安積自然農園 — 公式サイト（静的ホーム）

トップページ（`index.html`）1枚構成の静的サイトです。

## 構成

| パス | 役割 |
|------|------|
| `index.html` | トップページ |
| `home.css` | トップ専用スタイル |
| `fonts/` | NIS Tak（`NIS_TAK.otf`） |
| `image/` | 写真・ロゴ |
| `vercel.json` | Vercel デプロイ設定（ヘッダー・キャッシュ） |
| `robots.txt` / `sitemap.xml` | SEO |

## 最新ニュース（FV）

`index.html` 内の `.hero-news` ブロックを編集すると、FV 下部のお知らせ1件を更新できます（`href` / `datetime` / 表示日付 / タイトル）。

## デプロイ

**Vercel** で公開します。GitHub リポジトリを Vercel に連携し、Production ブランチ（通常 `main`）をデプロイ対象に設定してください。独自ドメイン `asakanatural.jp` は Vercel の DNS 指示に従って設定します。

## サイトマップ

- `sitemap.xml` … トップ（`https://asakanatural.jp/`）のみ
