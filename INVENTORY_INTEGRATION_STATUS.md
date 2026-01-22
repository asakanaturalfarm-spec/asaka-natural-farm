# 在庫管理システム連携状況

## 現在の連携状況（2025年12月7日）

### ✅ 完全連携済み
- **安積直売所オンライン**
  - inventory-sync.js 統合済み
  - 全ページでリアルタイム在庫参照
  - 注文確定時に在庫減算処理
  - カート機能と完全連携

### ⚠️ 部分連携（ファイルコピー済み）
以下のアプリにinventory-sync.jsをコピーしました：
- **受注発注管理アプリ**
- **収穫量出荷可能管理アプリ**  
- **帳簿自動管理アプリ**
- **農業用ダッシュボード**

**ただし、各HTMLファイルへの読み込みと統合処理は未実装**

---

## 在庫管理の仕組み

### データ保存場所
- **LocalStorage** - すべてのアプリで共有
- キー: `inventory_realtime`
- 形式: JSON（商品ID → 在庫情報）

### 在庫の流れ
```
1. 初期化: 全商品10個
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

### 1. 受注発注管理アプリ
**目的:** 受注時に在庫を確認・予約

**実装項目:**
- [ ] index.html, orders.html に inventory-sync.js を読み込み
- [ ] 受注作成時に在庫チェック
- [ ] 受注確定時に在庫を減らす
- [ ] 受注キャンセル時に在庫を戻す

### 2. 収穫量出荷可能管理アプリ
**目的:** 収穫時に在庫を増やす

**実装項目:**
- [ ] index.html に inventory-sync.js を読み込み
- [ ] 収穫記録時に在庫を増やす（InventorySync.add()）
- [ ] 収穫予定と実在庫の差分表示

### 3. 帳簿自動管理アプリ
**目的:** 在庫評価額を自動計算

**実装項目:**
- [ ] index.html に inventory-sync.js を読み込み
- [ ] 在庫レポートの表示
- [ ] 在庫評価額の自動計算

### 4. 農業用ダッシュボード
**目的:** 在庫状況のリアルタイム可視化

**実装項目:**
- [ ] index.html に inventory-sync.js を読み込み
- [ ] 在庫グラフ・チャートの表示
- [ ] 低在庫アラートの表示

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

### reset-all-data.html を使用
1. `安積直売所オンライン/reset-all-data.html` を開く
2. 「すべてリセットする」ボタンをクリック
3. 確認してOK
4. すべてのアプリのデータが初期化される

### コンソールから手動リセット
```javascript
// 全在庫を10個に初期化
window.InventorySync.reset(10);

// 全在庫を0に
window.InventorySync.reset(0);

// 特定商品のみ
window.InventorySync.update('v1', 50);
```

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
