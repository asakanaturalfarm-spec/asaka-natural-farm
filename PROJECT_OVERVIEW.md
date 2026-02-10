# 安積自然農園システム 構成・機能まとめ

## 1. 全体概要
安積自然農園のWebサイトおよび関連アプリは、以下の主要なシステムで構成されています。

- ホームページ（ショップ含む）
- 受注発注管理アプリ
- 統合管理ダッシュボード
- 収穫量出荷可能管理アプリ
- 問い合わせ管理
- 帳簿自動管理アプリ（会計・取引・在庫連動）

各システムは帳簿とも連携し、取引・在庫・売上・経費などのデータを自動で統合・記録します。

## 2. 各システムの役割・機能

### ホームページ（安積自然農園ホームページ）
- 顧客向けの情報発信・商品販売（ショップ）
- 主なページ：
  - トップページ
  - 商品一覧・カート・注文（cart.html, checkout.html など）
  - FAQ・お問い合わせ（faq.html, contact.html）
  - 管理者用ページ（admin.html, admin-orders.html, admin-shipping.html など）
- 共通JS：common.js, asaka-hub.js, auth.js など

### 受注発注管理アプリ
- 受注・発注・在庫・顧客管理
- 主なページ：
  - 受注一覧・発注一覧（orders.html, invoice.html など）
  - 顧客管理（customers.html）
  - 分析・ダッシュボード（analytics.html, dashboard.js）
- 共通JS：asaka-hub.js, cross-app-sync.js など

### 統合管理ダッシュボード
- 複数アプリのデータ統合・可視化
- 主なページ：
  - ダッシュボード（index.html, app.js）
  - カレンダー・商品管理（calendar.js, products.js）
- 共通JS：asaka-hub.js, sync-manager.js など

### 収穫量出荷可能管理アプリ
- 収穫量・在庫・出荷可能量の管理
- 主なページ：
  - 収穫入力・在庫管理（harvest-input.html, harvest-inventory.html）
  - 年間収穫量・生産管理（harvest-annual.html, harvest-production.html）
- 共通JS：asaka-hub.js, cross-app-sync.js など

### 問い合わせ管理
- 顧客からの問い合わせ対応・管理
- 主なページ：
  - 問い合わせ一覧・対応（index.html, app.js）

## 3. 各システム間の関係性
- 各アプリは asaka-hub.js などの共通JSでデータ連携
- cross-app-sync.js で在庫・受注情報・帳簿データを同期
- 帳簿自動管理アプリが全取引・在庫・売上・経費を自動記録
- 管理者は統合ダッシュボードから全体を把握

## 4. コード整理・コメント方針
- 各ファイルの冒頭に機能説明コメントを追加
- セクションごとにコメントで区切り
- 変数・関数には用途説明コメントを付与
- 共通処理は共通JSに集約

---

このドキュメントはWebデザイナー・エンジニア向けの引き継ぎ資料です。