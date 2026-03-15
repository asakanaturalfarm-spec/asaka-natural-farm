import React, { useState, useCallback } from 'react';

/**
 * SurveyModal Component
 * - User survey form
 * - Form validation
 * - Coupon grant confirmation
 */

// Constants
const INITIAL_FORM_DATA = { name: '', email: '', comment: '' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR_MESSAGES = {
  general: 'メールアドレスまたはお名前のいずれかを入力してください。',
  email: '有効なメールアドレスを入力してください。',
  submission: 'エラーが発生しました。もう一度試してください。'
};

const STYLES = {
  errorText: { color: '#d32f2f', fontSize: '12px' },
  generalError: { color: '#d32f2f', marginBottom: '16px', fontSize: '14px' },
  couponBox: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    borderLeft: '4px solid #4caf50',
    borderRadius: '4px'
  },
  couponText: { margin: 0, color: '#166534', fontSize: '14px' }
};

function SurveyModal({ onSubmit, onClose, couponGranted }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = useCallback((email) => EMAIL_REGEX.test(email), []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name && !formData.email) {
      newErrors.general = ERROR_MESSAGES.general;
    } else if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = ERROR_MESSAGES.email;
    }

    return newErrors;
  }, [formData, isValidEmail]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSubmit({
        ...formData,
        timestamp: new Date().toISOString()
      });

      setFormData(INITIAL_FORM_DATA);
      setErrors({});
    } catch (error) {
      console.error('Survey submission error:', error);
      setErrors({ general: ERROR_MESSAGES.submission });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit]);

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
          <div style={STYLES.generalError}>
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
            {errors.name && <span style={STYLES.errorText}>{errors.name}</span>}
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
            {errors.email && <span style={STYLES.errorText}>{errors.email}</span>}
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
          <div style={STYLES.couponBox}>
            <p style={STYLES.couponText}>
              ✓ クーポンを取得済みです。コード: <strong>ASAKA5OFF</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurveyModal;
