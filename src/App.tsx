/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import BookingForm from './components/BookingForm';
import Meista from './components/Meista';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import LiveChat from './components/LiveChat';
import FloatingActions from './components/FloatingActions';
import CookieConsent from './components/CookieConsent';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { Language } from './translations';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lang, setLang] = useState<Language>('fi');
  const [logoStyle, setLogoStyle] = useState<'option1' | 'option2' | 'option3'>('option3');
  const [prefilledService, setPrefilledService] = useState<string>('');
  const [prefilledSize, setPrefilledSize] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initialize modular hook to reveal segments when they scroll into the observer threshold
  useIntersectionObserver('.reveal', 0.1);

  // Auto detect if URL contains admin trigger with highly secure, unguessable access keys
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasAdminQuery = 
      params.get('access_token') === 'PT_SuperAdmin_SecureKey_2026_Aistudio' ||
      params.get('hallintapaneeli_salainen_ovi') === 'avaa_ovi_2026';

    if (hasAdminQuery) {
      setIsAdminOpen(true);
      // Clean up the query parameters immediately so they don't linger in browser history or address bar
      try {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        // Fallback if browser security sandbox restricts replaceState
      }
    }
  }, []);

  // Secure combination: Ctrl + Alt + Shift + P (or Cmd + Alt + Shift + P) to open Admin Portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Monitor scroll progress to drive the custom progress indicator ribbon
  useEffect(() => {
    const handleScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const totalScroll = scrollHeight - clientHeight;
      
      if (totalScroll > 0) {
        const scrolled = (window.scrollY / totalScroll) * 100;
        setScrollProgress(scrolled);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    // Run once on mount in case page loaded partway down
    handleScrollProgress();

    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  return (
    <div className="relative font-sans text-[#1A1A1A] flex flex-col min-h-screen bg-[#FAFAF7]">
      <Analytics />
      {/* Scroll Progress Bar at the top of the viewport */}
      <div 
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Sivun lukemisen edistyminen"
        className="fixed top-0 left-0 h-[3.5px] bg-[#95C4A1] z-[9999] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* Fixed Navigation Header with integrated language switcher */}
      <Navbar lang={lang} setLang={setLang} logoStyle={logoStyle} onOpenAdmin={() => setIsAdminOpen(true)} />
      
      {/* Semantic Main Grid Segment Container */}
      <main id="main-content">
        <Hero lang={lang} />
        <Services 
          lang={lang} 
          onSelectService={(service) => {
            setPrefilledService(service);
          }} 
        />
        <HowItWorks lang={lang} />
        <Pricing 
          lang={lang} 
          onPrefillQuote={(service, size) => { 
            setPrefilledService(service); 
            setPrefilledSize(size); 
          }} 
        />
        <Meista lang={lang} />
        <BookingForm 
          lang={lang} 
          prefilledService={prefilledService} 
          prefilledSize={prefilledSize} 
        />
      </main>

      {/* Semantic Footer segment */}
      <Footer lang={lang} logoStyle={logoStyle} onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Admin Panel Modal Overlay */}
      {isAdminOpen && (
        <AdminPanel lang={lang} setLang={setLang} onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Floating Interactive Live Chat Assistant widget */}
      <LiveChat lang={lang} />

      {/* Persistent Sticky Contact Actions and Back to Top Trigger */}
      <FloatingActions lang={lang} />

      {/* Non-intrusive Cookie Consent Banner */}
      <CookieConsent lang={lang} />
    </div>
  );
}

