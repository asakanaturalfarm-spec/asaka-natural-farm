import React from 'react';

/**
 * Hero Component
 * - Main headline and call-to-action
 * - Hero image with hover animation
 * - Primary action buttons
 */
function Hero({ onClickProducts }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>
          土と種だけで育つ<br />
          <span className="highlight">まっすぐな野菜</span>
        </h2>
        <p>
          化学肥料・農薬不使用。自然の力を信じて、丁寧に育てた野菜をお届けします。
        </p>
        <div className="hero-buttons">
          <button 
            className="btn-primary"
            onClick={onClickProducts}
            aria-label="商品セクションへスクロール"
          >
            商品を見る
          </button>
          <button 
            className="btn-outline"
            aria-label="詳しく知る"
          >
            詳しく知る
          </button>
        </div>
      </div>
      <div className="hero-image">
        <img 
          src="image/fv.jpg" 
          alt="安積直売所の自然農法野菜" 
          loading="eager"
        />
      </div>
    </section>
  );
}

export default Hero;
