import React from 'react';

/**
 * About Component
 * - Farm introduction and story
 * - Farmer's message
 * - Profile image
 */
function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h3 className="section-title">農園紹介</h3>
            <h4>無類の農業愛から生まれた<br />安心安全な食卓</h4>
            <p>
              安積自然農園の田辺です。私は農業を心から愛し、種から食卓に届けるまでの全ての過程に心を込めています。
            </p>
            <p>
              種から芽を出し、力強く育つ野菜たち。その一つ一つが本当に愛おしい存在です。自然農法という選択を通じて、食べる人の健康と、土の健康を両立させたいと考えています。
            </p>
            <p>
              <strong>
                加工食品についても、農園で採れた野菜や素材のみを使用し、完全無添加で仕上げています。
              </strong>
            </p>
          </div>
          <div className="about-image">
            <img 
              src="image/profile.jpg" 
              alt="安積自然農園 農園主 田辺" 
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
