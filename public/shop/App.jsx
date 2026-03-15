import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Products from './components/Products';
import Shipping from './components/Shipping';
import Newsletter from './components/Newsletter';
import ScientificEvaluation from './components/ScientificEvaluation';
import Evidence from './components/Evidence';
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
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Handle survey submission
   */
  const handleSurveySubmit = useCallback((data) => {
    localStorage.setItem('asaka_coupon_granted', 'true');
    setCouponGranted(true);
    setBannerVisible(false);
    setShowSurveyModal(false);
    console.log('Survey submitted:', data);
  }, []);

  /**
   * Close survey modal
   */
  const closeSurveyModal = useCallback(() => {
    setShowSurveyModal(false);
  }, []);

  /**
   * Close event banner
   */
  const closeBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  /**
   * Handle products scroll
   */
  const handleScrollProducts = useCallback(() => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Handle view schedule
   */
  const handleViewSchedule = useCallback((productId) => {
    document.getElementById('cultivation-schedule')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const event = new CustomEvent('selectVegetable', { detail: { productId } });
      window.dispatchEvent(event);
    }, 100);
  }, []);

  return (
    <div className="app">
      <Header 
        onOpenLogin={() => alert('ログイン機能は別実装です。')}
        scrolled={scrolled}
      />

      <main id="main">
        <Hero onClickProducts={handleScrollProducts} />
        <Features />
        <About />
        <Products onViewSchedule={handleViewSchedule} />
        <CultivationSchedule />
        <Shipping />
        <ScientificEvaluation />
        <Evidence />
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
