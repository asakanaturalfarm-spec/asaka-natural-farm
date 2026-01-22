import React, { useState } from 'react';

/**
 * SurveyModal Component
 * - User survey form
 * - Form validation
 * - Coupon grant confirmation
 */
function SurveyModal({ onSubmit, onClose, couponGranted }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name && !formData.email) {
      newErrors.general = 'メールアドレスまたはお名前のいずれかを入力してください。';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください。';
    }

    return newErrors;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSubmit({
        ...formData,
        timestamp: new Date().toISOString()
      });

      // Reset form
      setFormData({ name: '', email: '', comment: '' });
      setErrors({});
    } catch (error) {
      console.error('Survey submission error:', error);
      setErrors({ general: 'エラーが発生しました。もう一度試してください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal show" role="dialog" aria-modal="true" aria-labelledby="survey-title">
      <div className="modal-content">
        <button 
          className="close" 
          onClick={onClose}
          aria-label="モーダルを閉じる"
        >
          &times;
        </button>

        <h3 id="survey-title">限定クーポンを獲得！</h3>
        <p>
          簡単なアンケートにお答えいただくと、<strong>5%OFF クーポン</strong>
          （上限¥10,000）をお配りしています。
        </p>

        {errors.general && (
          <div style={{ color: '#d32f2f', marginBottom: '16px', fontSize: '14px' }}>
            {errors.general}
          </div>
        )}

        <form className="survey-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">お名前（任意）</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="田辺"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
            />
            {errors.name && <span style={{ color: '#d32f2f', fontSize: '12px' }}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス（任意）</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span style={{ color: '#d32f2f', fontSize: '12px' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="comment">ご意見・ご感想（任意）</label>
            <textarea
              id="comment"
              name="comment"
              rows="4"
              placeholder="野菜について一言"
              value={formData.comment}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? '送信中...' : 'クーポンを受け取る'}
          </button>
        </form>

        {couponGranted && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #4caf50',
            borderRadius: '4px'
          }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
              ✓ クーポンを取得済みです。コード: <strong>ASAKA5OFF</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveyModal;
