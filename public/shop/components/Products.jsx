import React, { useState, useMemo } from 'react';

/**
 * Products Component
 * - Product grid display
 * - Dynamic product rendering
 * - Add to cart functionality
 */
function Products({ onViewSchedule }) {
  const PRODUCTS = useMemo(() => [
    {
      id: 'v1',
      category: 'vegetable',
      name: 'ほうれん草',
      price: 300,
      unit: '袋',
      period: '今期',
      img: 'image/sample1.jpg',
      description: '甘みが強く栄養満点'
    },
    {
      id: 'v2',
      category: 'vegetable',
      name: '水菜',
      price: 220,
      unit: '袋',
      period: '今期',
      img: 'image/sample2.jpg',
      description: 'シャキシャキ食感'
    },
    {
      id: 'v3',
      category: 'vegetable',
      name: 'たまねぎ',
      price: 180,
      unit: 'kg',
      period: '保存',
      img: 'image/sample3.jpg',
      description: '完熟の甘さ'
    },
    {
      id: 'c1',
      category: 'craft',
      name: '手作りピクルス（無添加）',
      price: 680,
      unit: '瓶',
      period: '通年',
      img: 'image/sample4.jpg',
      description: '農園産野菜100%使用'
    }
  ], []);

  const handleAddToCart = (product) => {
    alert(`${product.name}をカートに追加しました！`);
    // TODO: Implement actual cart functionality
  };

  const handleViewSchedule = (product) => {
    if (onViewSchedule) {
      onViewSchedule(product.id);
    }
  };

  return (
    <section id="products" className="products">
      <div className="container">
        <h3 className="section-title">今期のラインナップ</h3>
        <p className="section-subtitle">
          市場連動の自動変動システムにより価格は期ごとに更新されます
        </p>
        
        {/* Vegetables */}
        <div className="product-category">
          <h4 className="product-category-title">安積自然野菜 — Asaka Natural Vegetable</h4>
          <div className="products-grid">
            {PRODUCTS.filter(p => p.category === 'vegetable').map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-image">
                  <img 
                    src={product.img} 
                    alt={product.name}
                    loading="lazy"
                  />
                  <span className="product-badge">{product.period}</span>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">¥{product.price}</div>
                  <div className="product-unit">（{product.unit}）</div>
                  <div className="product-buttons">
                    <button 
                      className="btn-primary"
                      onClick={() => handleAddToCart(product)}
                      aria-label={`${product.name}をカートに追加`}
                    >
                      カートに追加
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleViewSchedule(product)}
                      aria-label={`${product.name}の栽培スケジュールを表示`}
                    >
                      栽培スケジュール
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Crafts / Processed Foods */}
        <div className="product-category">
          <h4 className="product-category-title">安積加工食品 — Asaka Natural Craft</h4>
          <div className="products-grid">
            {PRODUCTS.filter(p => p.category === 'craft').map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-image">
                  <img 
                    src={product.img} 
                    alt={product.name}
                    loading="lazy"
                  />
                  <span className="product-badge">{product.period}</span>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">¥{product.price}</div>
                  <div className="product-unit">（{product.unit}）</div>
                  <div className="product-buttons">
                    <button 
                      className="btn-primary"
                      onClick={() => handleAddToCart(product)}
                      aria-label={`${product.name}をカートに追加`}
                    >
                      カートに追加
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleViewSchedule(product)}
                      aria-label={`${product.name}の栽培スケジュールを表示`}
                    >
                      栽培スケジュール
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;
