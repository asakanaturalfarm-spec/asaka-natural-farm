import React from 'react';

/**
 * Footer Component
 * - Company information
 * - Navigation links
 * - Social media links
 * - Copyright notice
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    menu: [
      { label: '商品一覧', href: '#products' },
      { label: '農園紹介', href: '#about' },
      { label: '配送方法', href: '#shipping' }
    ],
    social: [
      { label: 'Instagram', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Facebook', href: '#' }
    ]
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>安積直売所</h4>
            <p>自然農法で育てた野菜と加工食品を提供しています</p>
          </div>
          
          <div className="footer-section">
            <h5>メニュー</h5>
            <ul>
              {footerLinks.menu.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-section">
            <h5>フォロー</h5>
            <div className="social-links">
              {footerLinks.social.map((link, index) => (
                <a key={index} href={link.href}>{link.label}</a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} 安積直売所. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
