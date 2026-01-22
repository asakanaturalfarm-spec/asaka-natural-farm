# 画像フォルダ構成

このフォルダには商品画像やサイトで使用する画像を配置してください。

## フォルダ構造

```
image/
├── seika/          # 青果（野菜・果物）の商品画像
│   └── *.jpg       # 例: tomato.jpg, cucumber.jpg
├── kakou/          # 加工品の商品画像
│   └── *.jpg       # 例: jam.jpg, pickles.jpg
├── fv.jpg          # ヒーロセクション画像
└── profile.jpg     # 農園紹介画像
```

## 推奨画像仕様

- **形式**: JPG または WebP（次世代フォーマット）
- **サイズ**: 
  - 商品画像: 800×600px 程度（最大 1200×900px）
  - ヒーロ画像: 1920×1080px 程度
  - プロフィール画像: 800×800px 程度
- **圧縮**: 品質 80-90% で Web 最適化
- **ファイル名**: 半角英数字、ハイフン、アンダースコアのみ使用

## 画像の追加方法

1. 青果の画像 → `image/seika/` に配置
2. 加工品の画像 → `image/kakou/` に配置
3. `script.js` または商品データ（JSON）でファイル名を参照

例:
```json
{
  "name": "安積トマト",
  "category": "青果",
  "image": "image/seika/tomato.jpg"
}
```

## 画像最適化のヒント

- [TinyPNG](https://tinypng.com/) や [Squoosh](https://squoosh.app/) で圧縮
- 大きい画像は `srcset` 属性でレスポンシブ対応を推奨
- Alt 属性を必ず設定してアクセシビリティを確保
