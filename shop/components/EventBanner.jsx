import React, { useEffect, useState } from 'react';

/**
 * EventBanner Component
 * - Fixed banner with survey CTA
 * - Auto-dismiss after user interaction
 * - Coupon offer display
 */
function EventBanner({ onOpenSurvey, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="event-banner" role="banner" aria-live="polite">
      <div className="banner-content">
        <p>🎁 アンケート回答で <strong>5%OFF クーポン</strong> をプレゼント中！</p>
        <div className="banner-actions">
          <button 
            className="btn-small" 
            onClick={onOpenSurvey}
            aria-label="アンケートに回答する"
          >
            回答する
          </button>
          <button 
            className="btn-close" 
            onClick={handleClose}
            aria-label="バナーを閉じる"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventBanner;
