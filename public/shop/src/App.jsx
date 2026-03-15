import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Products from './components/Products';
import Shipping from './components/Shipping';
import Newsletter from './components/Newsletter';
import ScientificEvaluation from './components/ScientificEvaluation';
import Footer from './components/Footer';
import EventBanner from './components/EventBanner';
import SurveyModal from './components/SurveyModal';
import CultivationSchedule from './components/CultivationSchedule';
import './style.css';

/**
 * Main App Component
 * - Central state management for modals and coupons
 * - Product data management
 * - Layout orchestration
 */
function App() {
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [couponGranted, setCouponGranted] = useState(() => {
    return localStorage.getItem('asaka_coupon_granted') === 'true';
  });
  const [bannerVisible, setBannerVisible] = useState(!couponGranted);

  // Scroll position for navbar shadow effect
  const [scrolled, setScrolled] = useState(false);

  // Initialize and restore coupon state from localStorage
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Handle survey submission
   * - Grant coupon
   * - Update localStorage
   * - Close modal and hide banner
   */
  const handleSurveySubmit = (data) => {
    localStorage.setItem('asaka_coupon_granted', 'true');
    setCouponGranted(true);
    setBannerVisible(false);
    setShowSurveyModal(false);
    
    console.log('Survey submitted:', data);
  };

  /**
   * Close survey modal
   */
  const closeSurveyModal = () => {
    setShowSurveyModal(false);
  };

  /**
   * Close event banner
   */
  const closeBanner = () => {
    setBannerVisible(false);
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        コンテンツにスキップ
      </a>

      <Header 
        onOpenLogin={() => alert('ログイン機能は別実装です。')}
        scrolled={scrolled}
      />

      <main id="main">
        <Hero 
          onClickProducts={() => {
            const productsSection = document.getElementById('products');
            productsSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        <Features />
        <About />
        <Products onViewSchedule={(productId) => {
          document.getElementById('cultivation-schedule')?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            const event = new CustomEvent('selectVegetable', { detail: { productId } });
            window.dispatchEvent(event);
          }, 100);
        }} />
        <CultivationSchedule />
        <Shipping />
        <ScientificEvaluation />
        <Newsletter />
      </main>

      <Footer />

      {bannerVisible && !couponGranted && (
        <EventBanner 
          onOpenSurvey={() => setShowSurveyModal(true)}
          onClose={closeBanner}
        />
      )}

      {showSurveyModal && (
        <SurveyModal
          onSubmit={handleSurveySubmit}
          onClose={closeSurveyModal}
          couponGranted={couponGranted}
        />
      )}
    </div>
  );
}

export default App;
