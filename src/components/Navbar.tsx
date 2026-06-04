import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Languages, Lock, Phone } from 'lucide-react';
import { Language, translations } from '../translations';
import Logo from './Logo';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  logoStyle?: 'option1' | 'option2' | 'option3';
  onOpenAdmin?: () => void;
}

export default function Navbar({ lang, setLang, logoStyle, onOpenAdmin }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[lang];

  // Lock body scroll when mobile slider is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Scroll listener to toggle white/solid background after 80px scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitor which section is in view to underline the active nav menu
  useEffect(() => {
    const sections = ['hero', 'palvelut', 'miten', 'hinnat', 'varaus', 'meista'];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' }
      );
      observer.observe(el);
      return { el, observer };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.unobserve(obs.el);
        }
      });
    };
  }, []);

  const handleLinkClick = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 75; // compensate for header height
      
      const startPosition = window.pageYOffset;
      const distance = offsetTop - startPosition;
      const duration = 950; // Premium cinematic duration in milliseconds
      let startTime: number | null = null;

      // Luxurious EaseOutQuart physics for beautiful acceleration and deceleration
      const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        window.scrollTo(0, startPosition + distance * easeOutQuart(progress));

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'fi' ? 'en' : 'fi');
  };

  return (
    <>
      {/* Skip to Content Accessibility Link */}
      <a
        id="skip-link"
        href="#palvelut"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-[#1B4332] focus:px-6 focus:py-3 focus:rounded-full focus:shadow-lg focus:border-2 focus:border-[#95C4A1]"
      >
        {t.skipToContent}
      </a>

      <header
        role="banner"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-md text-[#1A1A1A] py-3 border-b border-[#E0E4DC]'
            : 'bg-transparent text-white py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Custom Logo Brand */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="flex items-center cursor-pointer focus:outline-none bg-transparent border-none"
            aria-label="Puhdas Tila Etusivu"
          >
            <Logo isScrolled={isScrolled} logoStyle={logoStyle} />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex space-x-10 items-center" aria-label="Päävalikko">
            <button
              onClick={() => handleLinkClick('palvelut')}
              className={`nav-link text-sm font-semibold tracking-wide hover:opacity-85 cursor-pointer bg-transparent border-none ${
                activeSection === 'palvelut' ? 'active font-bold' : ''
              }`}
            >
              {t.navServices}
            </button>
            <button
              onClick={() => handleLinkClick('miten')}
              className={`nav-link text-sm font-semibold tracking-wide hover:opacity-85 cursor-pointer bg-transparent border-none ${
                activeSection === 'miten' ? 'active font-bold' : ''
              }`}
            >
              {t.navProcess}
            </button>
            <button
              onClick={() => handleLinkClick('hinnat')}
              className={`nav-link text-sm font-semibold tracking-wide hover:opacity-85 cursor-pointer bg-transparent border-none ${
                activeSection === 'hinnat' ? 'active font-bold' : ''
              }`}
            >
              {t.navPricing}
            </button>
            <button
              onClick={() => handleLinkClick('meista')}
              className={`nav-link text-sm font-semibold tracking-wide hover:opacity-85 cursor-pointer bg-transparent border-none ${
                activeSection === 'meista' ? 'active font-bold' : ''
              }`}
            >
              {t.navAbout}
            </button>
            <button
              onClick={() => handleLinkClick('varaus')}
              className={`nav-link text-sm font-semibold tracking-wide hover:opacity-85 cursor-pointer bg-transparent border-none ${
                activeSection === 'varaus' ? 'active font-bold' : ''
              }`}
            >
              {t.navContact}
            </button>
          </nav>

          {/* Nav Right Action & Selector Button Area */}
          <div className="hidden xl:flex items-center gap-6">
            <a 
              href="tel:+358406345252" 
              className={`flex items-center gap-1.5 font-sans font-bold text-sm transition-all focus:outline-none ${
                isScrolled 
                  ? 'text-[#1B4332] hover:text-[#2D6A4F]' 
                  : 'text-white hover:text-[#95C4A1]'
              }`}
            >
              <Phone className="w-4.5 h-4.5 text-[#95C4A1]" />
              <span>+358 40 634 5252</span>
            </a>

            {/* Elegant Pill Language Switcher */}
            <div className="flex items-center bg-black/10 dark:bg-white/10 p-0.5 rounded-full border border-current/15 gap-0.5">
              <button
                onClick={() => setLang('fi')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all focus:outline-none cursor-pointer border-none ${
                  lang === 'fi' 
                    ? 'bg-[#1B4332] text-white shadow-sm' 
                    : 'text-current hover:opacity-80'
                }`}
              >
                FI
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all focus:outline-none cursor-pointer border-none ${
                  lang === 'en' 
                    ? 'bg-[#1B4332] text-white shadow-sm' 
                    : 'text-current hover:opacity-80'
                }`}
              >
                EN
              </button>
            </div>

            <button
               onClick={() => handleLinkClick('varaus')}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-305 focus:outline-none cursor-pointer border-none ${
                isScrolled
                  ? 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] hover:shadow-md'
                  : 'bg-white text-[#1B4332] hover:bg-opacity-90 hover:scale-[1.03]'
              }`}
            >
              {t.navBtnBook}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile UI Buttons (Hamb + Minified language switch representation) */}
          <div className="xl:hidden flex items-center gap-3">
            {/* Fast simple toggle language trigger label */}
            <button
              onClick={toggleLanguage}
              className={`px-3 py-1 text-xs font-black rounded-lg border focus:outline-none flex items-center gap-1 cursor-pointer bg-transparent ${
                isScrolled ? 'border-[#1B4332] text-[#1B4332]' : 'border-white text-white'
              }`}
              aria-label="Vaihda kieli / Toggle language"
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === 'fi' ? 'EN' : 'FI'}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 focus:outline-none cursor-pointer bg-transparent border-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Avaa valikko"
            >
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-[#1B4332]' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Smooth Slide-In Drawer with Backdrop Overlay under AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-md xl:hidden"
            />

            {/* Slider panel cabinet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="fixed top-0 right-0 bottom-0 z-[10001] w-full max-w-[340px] h-screen h-[100dvh] bg-white shadow-2xl flex flex-col xl:hidden text-[#1A1A1A] overflow-hidden"
            >
              {/* Drawer Header with Logo and Close trigger */}
              <div className="p-5 border-b border-[#E0E4DC] flex items-center justify-between bg-[#FAFAF8] shrink-0">
                <Logo isScrolled={true} logoStyle={logoStyle} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200/80 flex items-center justify-center text-[#1B4332] transition-colors focus:outline-none cursor-pointer border-none"
                  aria-label="Sulje valikko"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Staggered transition of Navigation routes */}
              <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1 bg-white" aria-label="Mobiilihaku ja navigointi">
                {[
                  { id: 'palvelut', label: t.navServices },
                  { id: 'miten', label: t.navProcess },
                  { id: 'hinnat', label: t.navPricing },
                  { id: 'meista', label: t.navAbout },
                  { id: 'varaus', label: t.navContact },
                ].map((item, index) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.button
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      key={item.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        // Slight timeout to let slider animate away nicely before scrolling
                        setTimeout(() => handleLinkClick(item.id), 280);
                      }}
                      className={`w-full text-left py-3.5 px-4 text-sm font-semibold rounded-xl transition-all flex items-center justify-between group focus:outline-none bg-transparent border-none ${
                        isActive 
                          ? 'bg-[#95C4A1]/15 text-[#1B4332] font-extrabold' 
                          : 'hover:bg-[#F2F4F0] text-gray-700'
                      }`}
                    >
                      <span className="tracking-wide">{item.label}</span>
                      <ArrowRight className={`w-4 h-4 transition-all ${
                        isActive 
                          ? 'opacity-100 translate-x-0 text-[#1B4332]' 
                          : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'
                      }`} />
                    </motion.button>
                  );
                })}
              </nav>

              {/* Bottom high-trust communication info & direct action items */}
              <div className="p-5 border-t border-[#E0E4DC] bg-[#FAFAF8] space-y-3.5 shrink-0">
                <div className="flex items-center justify-between text-xs text-gray-400 font-bold px-1 uppercase tracking-wider">
                  <span>{lang === 'fi' ? 'Vaihda kieli' : 'Settings'}</span>
                  <div className="flex bg-gray-200/60 p-0.5 rounded-lg border border-gray-300/30 gap-0.5">
                    <button
                      onClick={() => { setLang('fi'); setIsMobileMenuOpen(false); }}
                      className={`px-3 py-1 text-[10px] font-black rounded-md transition-all focus:outline-none cursor-pointer border-none ${
                        lang === 'fi' 
                          ? 'bg-[#1B4332] text-white shadow-2xs' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      FI
                    </button>
                    <button
                      onClick={() => { setLang('en'); setIsMobileMenuOpen(false); }}
                      className={`px-3 py-1 text-[10px] font-black rounded-md transition-all focus:outline-none cursor-pointer border-none ${
                        lang === 'en' 
                          ? 'bg-[#1B4332] text-white shadow-2xs' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <a 
                  href="tel:+358406345252" 
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#E0E4DC] bg-white text-[#1B4332] font-bold rounded-xl hover:bg-slate-50 transition-all focus:outline-none cursor-pointer text-sm shadow-3xs"
                >
                  <Phone className="w-4 h-4 text-[#95C4A1]" />
                  <span>+358 40 634 5252</span>
                </a>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTimeout(() => handleLinkClick('varaus'), 280);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#1B4332] text-white text-sm font-extrabold rounded-xl hover:bg-[#2D6A4F] transition-all duration-300 focus:outline-none cursor-pointer border-none shadow-md"
                >
                  <span>{t.navBtnBook}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
