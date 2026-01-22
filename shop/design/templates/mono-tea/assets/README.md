# テンプレート用アセットフォルダ

このフォルダにはテンプレート用の画像やその他のアセットを配置してください。

## フォルダ構造

```
assets/
├── seika/          # 青果（野菜・果物）の商品画像
│   └── *.jpg       # 例: tomato.jpg, eggplant.jpg
├── kakou/          # 加工品の商品画像
│   └── *.jpg       # 例: jam.jpg, sauce.jpg
├── fonts/          # フォントファイル（NIS_TAK.otf 等）
├── fv.jpg          # ヒーロ画像
└── profile.jpg     # プロフィール画像
```

## 使用方法

テンプレート (`design/templates/mono-tea/index.html`) から相対パスで参照します。

例:
```html
<img src="assets/seika/tomato.jpg" alt="トマト">
```

または商品データ JSON:
```json
{
  "name": "トマト",
  "category": "青果",
  "image": "assets/seika/tomato.jpg"
}
```

## プレースホルダ画像

実際の商品画像がない場合は、以下のようなプレースホルダサービスを利用できます:
- https://placehold.co/800x600/png?text=Product
- https://via.placeholder.com/800x600.png?text=Product

## 画像の準備

1. プロジェクトルートの `image/` フォルダから画像をコピー
2. または新規に撮影・編集した画像を配置
3. ファイル名を `data/products.json` と一致させる
