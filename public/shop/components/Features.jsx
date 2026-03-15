import React from 'react';

/**
 * Features Component
 * - Three key value propositions
 * - Icon-based design
 * - Hover animations
 */
function Features() {
  const features = [
    {
      icon: '🌱',
      title: '無農薬・無肥料',
      description: '化学薬品を一切使わず、自然の営みを大切にした栽培方法'
    },
    {
      icon: '🌾',
      title: '自家採種',
      description: '毎年自分たちで種を採取。野菜本来の力を引き出しています'
    },
    {
      icon: '📦',
      title: '新鮮配送',
      description: '収穫から配送まで最短。旬の野菜を新鮮なままお届け'
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <h3 className="section-title">安積直売所の特徴</h3>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" aria-label={feature.title}>
                {feature.icon}
              </div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
