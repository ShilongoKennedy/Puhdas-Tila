import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Languages, Lock, Phone } from 'lucide-react';
import { Language, translations } from '../translations';
import Logo from './Logo';

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
          <div className="hidden md:flex items-center gap-6">
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
          <div className="md:hidden flex items-center gap-3">
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 focus:outline-none cursor-pointer bg-transparent border-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Avaa valikko"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#95C4A1]" />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-[#1B4332]' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu showing clean translation layout map */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white text-[#1A1A1A] max-h-0 ${
            isMobileMenuOpen ? 'max-h-[420px] border-b border-[#E0E4DC]' : ''
          }`}
        >
          <div className="px-5 py-4 space-y-3 flex flex-col items-stretch">
            <button
              onClick={() => handleLinkClick('palvelut')}
              className="text-left py-2 text-base font-semibold px-2 rounded-md hover:bg-[#F2F4F0] focus:outline-none bg-transparent border-none"
            >
              {t.navServices}
            </button>
            <button
              onClick={() => handleLinkClick('miten')}
              className="text-left py-2 text-base font-semibold px-2 rounded-md hover:bg-[#F2F4F0] focus:outline-none bg-transparent border-none"
            >
              {t.navProcess}
            </button>
            <button
              onClick={() => handleLinkClick('hinnat')}
              className="text-left py-2 text-base font-semibold px-2 rounded-md hover:bg-[#F2F4F0] focus:outline-none bg-transparent border-none"
            >
              {t.navPricing}
            </button>
            <button
              onClick={() => handleLinkClick('meista')}
              className="text-left py-2 text-base font-semibold px-2 rounded-md hover:bg-[#F2F4F0] focus:outline-none bg-transparent border-none"
            >
              {t.navAbout}
            </button>
            <button
              onClick={() => handleLinkClick('varaus')}
              className="text-left py-2 text-base font-semibold px-2 rounded-md hover:bg-[#F2F4F0] focus:outline-none bg-transparent border-none"
            >
              {t.navContact}
            </button>
            <a 
              href="tel:+358406345252" 
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#1B4332] text-[#1B4332] font-semibold rounded-full hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer text-sm"
            >
              <Phone className="w-4 h-4 text-[#95C4A1]" />
              <span>+358 40 634 5252</span>
            </a>
            <button
              onClick={() => handleLinkClick('varaus')}
              className="w-full text-center py-3 bg-[#1B4332] text-white font-bold rounded-full hover:bg-[#2D6A4F] transition-colors focus:outline-none cursor-pointer border-none"
            >
              {t.navBtnBook} →
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
