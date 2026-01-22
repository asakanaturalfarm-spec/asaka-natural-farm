import React from 'react';

/**
 * Shipping Component
 * - Shipping information (cost, timing, sizes)
 * - Packaging guide
 * - Delivery details
 */
function Shipping() {
  const shippingInfo = [
    {
      title: '最低購入金額',
      value: '¥4,500 以上'
    },
    {
      title: '送料',
      value: '一律 ¥500（全国）'
    },
    {
      title: '発送日',
      value: '月・水・金（受注状況により変動）'
    }
  ];

  const packageSizes = [
    { size: 'S', description: '2-4商品' },
    { size: 'M', description: '5-10商品' },
    { size: 'L', description: '11商品以上' }
  ];

  return (
    <section id="shipping" className="shipping">
      <div className="container">
        <h3 className="section-title">配送方法・送料</h3>
        
        <div className="shipping-content">
          <div className="shipping-info">
            {shippingInfo.map((info, index) => (
              <div key={index} className="info-item">
                <h4>{info.title}</h4>
                <p>{info.value}</p>
              </div>
            ))}
          </div>

          <div className="shipping-guide">
            <h4>梱包サイズ</h4>
            <div className="size-cards">
              {packageSizes.map((pkg, index) => (
                <div key={index} className="size-card">
                  <h5>{pkg.size}</h5>
                  <p>{pkg.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Shipping;
