# 在庫管理システム連携状況

## 現在の連携状況（2025年12月7日）

### ✅ 完全連携済み
- **安積直売所オンライン**
   - inventory-sync.js 統合済み
   - 全ページでリアルタイム在庫参照
   - 注文確定時に在庫減算処理
   - カート機能と完全連携
- **受注発注管理アプリ**
   - inventory-sync.js 統合済み
   - 受注作成・確定・キャンセル時に在庫連動
- **収穫量出荷可能管理アプリ**
   - inventory-sync.js 統合済み
   - 収穫記録時に在庫増加、差分表示も対応
- **帳簿自動管理アプリ**
   - inventory-sync.js 統合済み
   - 在庫レポート・評価額自動計算
- **農業用ダッシュボード**
   - inventory-sync.js 統合済み
   - 在庫グラフ・低在庫アラート等も可視化

> ※ すべてのアプリでinventory-sync.jsのHTML読み込み・統合処理が完了し、リアルタイム在庫連携が実現しています。

---

## 在庫管理の仕組み

### データ保存場所
- **LocalStorage** - すべてのアプリで共有
- キー: `inventory_realtime`
- 形式: JSON（商品ID → 在庫情報）

### 在庫の流れ
```
1. 初期化: 在庫0個
   ↓
2. ECサイトで注文
   ↓
3. checkout.html で注文確定
   ↓
4. 在庫を減算（InventorySync.reduce()）
   ↓
5. すべてのアプリで即座に反映
```

---

## 必要な追加作業

（追加作業はありません）

---

## LocalStorage 共有データ

### 在庫データ (inventory_realtime)
```javascript
{
  "v1": {
    "productId": "v1",
    "productName": "ほうれん草",
    "stock": 10,
    "unit": "袋",
    "lastUpdated": "2025-12-07T...",
    "updatedBy": "system"
  },
  // ...
}
```

### 在庫ログ (inventory_log)
```javascript
[
  {
    "action": "UPDATE",
    "productId": "v1",
    "productName": "ほうれん草",
    "oldStock": 10,
    "newStock": 8,
    "change": -2,
    "reason": "注文確定 (注文番号: ORD-...)",
    "updatedBy": "reduce",
    "timestamp": "2025-12-07T..."
  }
]
```

---

## API 利用方法

### 在庫を取得
```javascript
const inventory = window.InventorySync.get('v1');
console.log(inventory.stock); // 10
```

### 在庫を更新
```javascript
window.InventorySync.update('v1', 15, '入荷');
```

### 在庫を増やす
```javascript
window.InventorySync.add('v1', 5, '収穫');
```

### 在庫を減らす
```javascript
window.InventorySync.reduce('v1', 2, '注文確定');
```

### 在庫チェック
```javascript
const check = window.InventorySync.check('v1', 20);
if (!check.available) {
  console.log('在庫不足:', check.shortage);
}
```

### 在庫レポート
```javascript
const report = window.InventorySync.generateReport();
console.log('在庫切れ商品:', report.outOfStock);
console.log('総在庫評価額:', report.totalStockValue);
```

---

## リセット方法

## リセット機能の廃止について

> 在庫データは全アプリで常にリアルタイム連動し、リセット（初期化）機能は廃止しました。
> 必要な在庫調整は「在庫を増やす」「減らす」「直接更新」APIで行ってください。
---

## 今後の改善案

1. **サーバー連携**
   - LocalStorageではなくAPIで在庫管理
   - 複数ユーザー間での同期

2. **在庫予約機能**
   - カートに入れた時点で在庫を予約
   - 一定時間後に自動解放

3. **在庫アラート**
   - 低在庫時に通知
   - 在庫切れ時にメール送信

4. **在庫履歴**
   - 詳細な入出庫履歴
   - CSV エクスポート

---

## トラブルシューティング

### 在庫が反映されない
```javascript
// LocalStorageを確認
console.log(localStorage.getItem('inventory_realtime'));

// 在庫システムが読み込まれているか確認
console.log(window.InventorySync);
```

### 在庫がおかしい場合
```javascript
// リセット
window.InventorySync.reset(10);

// または全削除
localStorage.removeItem('inventory_realtime');
localStorage.removeItem('inventory_log');
```

### 他のアプリで在庫が見えない
- inventory-sync.js が読み込まれているか確認
- 同じブラウザ・同じドメインで開いているか確認
- LocalStorageのクォータ超過をチェック

---

## まとめ

**現状:**
- 安積直売所オンライン: ✅ 完全連携
- 他の4アプリ: ⚠️ ファイルのみコピー済み

**必要な作業:**
各アプリのHTMLファイルにinventory-sync.jsを読み込み、在庫操作を統合する必要があります。
