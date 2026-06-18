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

## GitHub への反映

このフォルダは GitHub リポジトリ（`asakanaturalfarm-spec/asaka-natural-farm`）と直接連携しています。

```bash
git add .
git commit -m "変更内容の説明"
git push origin main
```

## デプロイ

**Vercel** で公開します。`main` ブランチへの push で自動デプロイされます。独自ドメイン `asakanatural.jp` は Vercel の DNS 指示に従って設定します。

## サイトマップ

- `sitemap.xml` … トップ（`https://asakanatural.jp/`）のみ
