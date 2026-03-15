import React, { useState } from 'react';

/**
 * Newsletter Component
 * - Email subscription form
 * - Form validation
 * - Success notification
 */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('メールアドレスを入力してください。');
      return;
    }

    // Simulate API call
    console.log('Newsletter signup:', email);
    setEmail('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-content">
          <h3>新着情報をお受け取りください</h3>
          <p>季節ごとの新商品や農園情報をメールでお知らせします</p>
          
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              id="newsletterEmail"
              name="email"
              type="email"
              placeholder="メールアドレスを入力"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="メールアドレス入力"
            />
            <button type="submit" className="btn-primary">
              購読する
            </button>
          </form>

          {submitted && (
            <p style={{ marginTop: '12px', color: '#4caf50', fontSize: '14px' }}>
              ✓ 登録ありがとうございます！
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
