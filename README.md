
# 安積自然農園ホームページ（2026年2月最新版）

このリポジトリは「安積自然農園」公式Webサイトおよび関連アプリの静的ファイル一式です。

## 主な内容
- 顧客向けホームページ・ショップ（cart.html, checkout.html など）
- 管理者用ページ（admin.html ほか）
- 通知システム・問い合わせ管理・在庫/帳簿連携
- 共通JS（asaka-hub.js, common.js など）

## 公開・運用方法（推奨: GitHub Pages）
1. GitHubで新規リポジトリを作成（アカウント: asakanatural-spase、リポジトリ名: asaka-natural-farm）
2. `git remote add origin https://github.com/asakanatural-spase/asaka-natural-farm.git` でリモート設定
3. `git push -u origin main` で初回公開
4. GitHub Pagesの設定で `main` ブランチの `/` を公開対象に指定
5. 公開URL例: `https://asakanatural-spase.github.io/asaka-natural-farm/`

CLIで一括公開する場合:
```
gh repo create asaka-natural-farm --public --source=. --remote=origin --push --confirm
```

## システム構成・連携
- 受注発注管理・統合ダッシュボード・収穫量管理・帳簿自動管理・問い合わせ管理と連携
- cross-app-sync.js/asaka-hub.jsで各アプリ間の在庫・取引・通知データを同期
- 通知メールはResend（order@asakanatural.jp）経由で自動送信

## サポート・ドキュメント
- システム全体の構成: PROJECT_OVERVIEW.md
- 通知システム仕様: NOTIFICATION_SYSTEM_COMPLETE.md
- セットアップ手順: NOTIFICATION_SETUP.md

## ファイル一覧・詳細
→ 詳細は `index.html` および各アプリのREADME/ドキュメントを参照してください。
