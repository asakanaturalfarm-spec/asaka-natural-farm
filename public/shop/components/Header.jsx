import React, { useState } from 'react';

/**
 * Header Component
 * - Navigation menu (desktop & mobile)
 * - Logo and branding
 * - Cart and login buttons
 */
function Header({ onOpenLogin, scrolled }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">匠</div>
          <div className="logo-text">
            <h1>安積直売所</h1>
            <p>自然農法野菜</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-menu">
          <a href="#products" className="nav-link">商品</a>
          <a href="#about" className="nav-link">農園紹介</a>
          <a href="#shipping" className="nav-link">配送方法</a>
          <a href="#contact" className="nav-link">お問い合わせ</a>
        </nav>

        {/* Action Buttons */}
        <div className="nav-actions">
          <button 
            className="btn-secondary" 
            onClick={onOpenLogin}
            aria-label="ログイン"
          >
            ログイン
          </button>
          <button 
            className="btn-primary"
            aria-label="カート"
            onClick={() => alert('カート機能は別実装です。')}
          >
            <span className="cart-icon">🛒</span> カート
          </button>
        </div>

        {/* Hamburger Menu */}
        <button
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          id="hamburger"
          onClick={toggleMobileMenu}
          aria-controls="mobileMenu"
          aria-expanded={mobileMenuOpen}
          aria-label="メニューを開く"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="mobile-menu show" id="mobileMenu">
          <a 
            href="#products" 
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            商品
          </a>
          <a 
            href="#about" 
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            農園紹介
          </a>
          <a 
            href="#shipping" 
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            配送方法
          </a>
          <a 
            href="#contact" 
            className="mobile-link"
            onClick={closeMobileMenu}
          >
            お問い合わせ
          </a>
          <hr />
          <button 
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={() => {
              onOpenLogin();
              closeMobileMenu();
            }}
          >
            ログイン
          </button>
        </nav>
      )}
    </header>
  );
}

export default Header;
