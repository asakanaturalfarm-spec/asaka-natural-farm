# 在庫連携システム

## 概要

安積直売所オンライン、受注発注管理アプリ、収穫量出荷可能管理アプリの3つのシステムを連携し、注文時に自動的に在庫を管理するシステムです。

## 機能

### 1. 注文完了時のカートリセット

- 注文が確定すると、カート（`localStorage.cartItems`）が自動的にクリアされます
- 注文完了ページでも二重チェックを実施

### 2. 在庫の自動減算

注文完了時に以下の処理が自動的に実行されます：

#### 安積直売所オンライン（顧客注文）
1. 注文データを作成
2. **在庫システムに出荷予定を登録**（`onlineOrderShipments`）
3. **受注発注管理アプリに注文を連携**（`orderManagement_orders`）
4. カートをクリア
5. 注文完了ページへ遷移

#### 受注発注管理アプリ（取引先からの発注）
1. 新規注文を作成
2. **在庫システムに出荷予定を登録**（`onlineOrderShipments`）
3. 注文一覧に反映

### 3. 在庫可用量の計算

収穫量出荷可能管理アプリでは、以下の要素を考慮して在庫可用量を計算：

```
在庫可用量 = 収穫量 - 通常出荷量 - 廃棄量 - オンライン注文出荷予定量
```

## データ構造

### onlineOrderShipments（出荷予定データ）

```javascript
{
  id: "SHIP-1234567890-abc123",
  date: "2025-12-05",
  productName: "ほうれん草",
  shipmentAmount: 5,
  destination: "直売所オンライン",
  orderId: "ORD-1234567890",
  orderNumber: "AZK12345678",
  customerName: "山田 太郎",
  shippingAddress: "福島県郡山市安積町1-2-3",
  status: "出荷予定",
  createdAt: "2025-12-05T10:30:00.000Z",
  source: "online-store" // または "order-management"
}
```

### orderManagement_orders（受注データ）

```javascript
{
  id: "ORD-1234567890",
  orderNumber: "AZK12345678",
  orderDate: "2025-12-05T10:30:00.000Z",
  customerId: "CUST-ONLINE-1234567890",
  customerName: "山田 太郎",
  customerEmail: "yamada@example.com",
  customerPhone: "090-1234-5678",
  items: [
    {
      productId: "v1",
      productName: "ほうれん草",
      quantity: 5,
      unitPrice: 300,
      unit: "袋",
      subtotal: 1500
    }
  ],
  subtotal: 4500,
  shippingFee: 500,
  tax: 0,
  totalAmount: 5000,
  paymentMethod: "クレジットカード",
  paymentStatus: "pending",
  shippingAddress: {
    postalCode: "963-0201",
    prefecture: "福島県",
    city: "郡山市",
    address: "安積町1-2-3",
    note: ""
  },
  status: "受注",
  source: "online-store",
  createdAt: "2025-12-05T10:30:00.000Z",
  updatedAt: "2025-12-05T10:30:00.000Z"
}
```

## 使用方法

### システム統合の有効化

各HTMLファイルに`system-integration.js`を読み込むだけで自動的に有効になります：

```html
<script src="system-integration.js"></script>
```

### 関数の使用例

#### 在庫を確認する

```javascript
// 在庫可用量を計算（収穫量出荷可能管理アプリ）
const inventory = window.calculateAvailableInventory();
console.log(inventory);
// [
//   {
//     productName: "ほうれん草",
//     harvest: 100,
//     shipped: 20,
//     waste: 5,
//     onlineOrders: 15,
//     available: 60
//   },
//   ...
// ]
```

#### 注文を作成して在庫を減らす（受注発注管理アプリ）

```javascript
const orderData = {
  orderNumber: 'ORD-' + Date.now(),
  customerName: '取引先A',
  items: [
    { productName: 'ほうれん草', quantity: 10 }
  ],
  // ... その他の注文情報
};

window.createOrderWithInventoryUpdate(orderData);
```

#### 在庫の可用性をチェック（安積直売所オンライン）

```javascript
const items = [
  { name: 'ほうれん草', quantity: 5 },
  { name: '水菜', quantity: 3 }
];

const availability = window.checkInventoryAvailability(items);
if (!availability.available) {
  console.log('在庫不足の商品:', availability.unavailableItems);
}
```

## 注文フロー

### 1. 顧客がオンラインで注文

```
1. 商品をカートに追加
2. レジ画面で配送先・支払い情報を入力
3. 住所バリデーション実施
4. 「注文を確定する」ボタンをクリック
   ↓
5. 住所の実在性を確認
6. 在庫を確認（オプション）
7. 注文データを作成
8. 在庫システムに出荷予定を登録 ★
9. 受注発注管理アプリに注文を連携 ★
10. カートをクリア ★
11. 注文完了ページへ遷移
```

### 2. 取引先からの発注を受ける

```
1. 受注発注管理アプリで新規注文を作成
2. 注文情報を入力
3. 「登録」ボタンをクリック
   ↓
4. 注文データを作成
5. 在庫システムに出荷予定を登録 ★
6. 注文一覧に反映
```

### 3. 在庫状況の確認

```
1. 収穫量出荷可能管理アプリを開く
2. 在庫状況を表示
   ↓
3. 収穫量、通常出荷、廃棄量に加えて
   オンライン注文の出荷予定も考慮した
   正確な在庫可用量が表示される ★
```

## LocalStorageキー一覧

| キー | 説明 | 管理アプリ |
|-----|------|----------|
| `cartItems` | カート内の商品 | 安積直売所オンライン |
| `lastOrder` | 最後の注文データ（一時） | 安積直売所オンライン |
| `onlineOrderShipments` | オンライン注文の出荷予定 | **全アプリ共通** |
| `orderManagement_orders` | 受注データ | 受注発注管理アプリ |
| `harvestRecords` | 収穫記録 | 収穫量出荷可能管理アプリ |
| `shipmentRecords` | 出荷記録 | 収穫量出荷可能管理アプリ |
| `wasteRecords` | 廃棄記録 | 収穫量出荷可能管理アプリ |

## トラブルシューティング

### Q. 注文したのにカートが残っている

A. ブラウザの開発者ツール（F12）を開き、Consoleで以下を実行：
```javascript
localStorage.removeItem('cartItems');
```

### Q. 在庫が正しく減っていない

A. 以下を確認：
1. `system-integration.js`が正しく読み込まれているか
2. ブラウザのConsoleにエラーが出ていないか
3. `onlineOrderShipments`に出荷予定が登録されているか：
```javascript
console.log(JSON.parse(localStorage.getItem('onlineOrderShipments')));
```

### Q. 在庫データをリセットしたい

A. 開発者ツールのConsoleで以下を実行：
```javascript
localStorage.removeItem('onlineOrderShipments');
localStorage.removeItem('harvestRecords');
localStorage.removeItem('shipmentRecords');
localStorage.removeItem('wasteRecords');
```

## 今後の拡張予定

- [ ] 在庫不足時の自動アラート
- [ ] 在庫予約機能（カートに入れた時点で仮予約）
- [ ] 在庫の自動補充提案
- [ ] 在庫履歴レポート
- [ ] APIサーバーとの連携（現在はローカルストレージのみ）

## 注意事項

- 現在はlocalStorageを使用しているため、ブラウザのデータをクリアすると全てのデータが失われます
- 本番環境では必ずバックエンドAPIと連携してください
- 複数のブラウザやデバイス間ではデータは同期されません
