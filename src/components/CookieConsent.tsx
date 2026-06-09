import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Check, Sliders, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { Language } from '../translations';

interface CookieConsentProps {
  lang: Language;
}

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
}

const cookieTranslations = {
  fi: {
    bannerTitle: 'Evästeasetukset',
    bannerText: 'Käytämme evästeitä parantaaksemme sivuston käyttökokemusta ja ymmärtääksemme sen käyttöä standardien mukaisesti.',
    acceptAll: 'Hyväksy kaikki',
    acceptNecessary: 'Vain välttämättömät',
    customize: 'Muokkaa asetuksia',
    saveSelection: 'Tallenna valinnat',
    back: 'Takaisin',
    essentialTitle: 'Välttämättömät evästeet',
    essentialDesc: 'Nämä evästeet ovat välttämättömiä sivuston perustoiminnoille, kuten valitsemallesi kielelle, selausasetuksille sekä tietoturvalle.',
    analyticsTitle: 'Analytiikka & tilastot',
    analyticsDesc: 'Auttaa meitä mittaamaan ja analysoimaan, miten vierailijat käyttävät sivustoa, jotta voimme kehittää palveluamme.',
    preferencesTitle: 'Käyttäjäasetukset',
    preferencesDesc: 'Käytetään muistamaan valintasi eri käyntikerroilla, kuten esitäytetyt kentät.',
    reopenTooltip: 'Muokkaa evästeasetuksia'
  },
  en: {
    bannerTitle: 'Cookie Policy',
    bannerText: 'We use cookies to improve your user experience and analyze site traffic in compliance with standard privacy rules.',
    acceptAll: 'Accept All',
    acceptNecessary: 'Necessary Only',
    customize: 'Customize settings',
    saveSelection: 'Save Selection',
    back: 'Back',
    essentialTitle: 'Essential Cookies',
    essentialDesc: 'Required for basic site functionality, such as your selected language state, preference configs, and general security.',
    analyticsTitle: 'Analytics & Statistics',
    analyticsDesc: 'Allows us to measure and understand how users explore and interact with the site to help optimize our content.',
    preferencesTitle: 'User Preferences',
    preferencesDesc: 'Remember settings you make during browsing sessions, such as contact details preferences.',
    reopenTooltip: 'Manage Cookie Settings'
  }
};

export default function CookieConsent({ lang }: CookieConsentProps) {
  const t = cookieTranslations[lang];
  const [showBanner, setShowBanner] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    essential: true,
    analytics: true,
    preferences: true
  });

  // Check storage on mount
  useEffect(() => {
    const storedConsent = localStorage.getItem('puhdas_tila_cookie_consent');
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        if (parsed && typeof parsed.essential === 'boolean') {
          setConsent(parsed);
          return;
        }
      } catch (e) {
        // Fallback if corrupted parse
      }
    }
    // Show banner after a tiny delay
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    const allConsent: ConsentState = {
      essential: true,
      analytics: true,
      preferences: true
    };
    setConsent(allConsent);
    localStorage.setItem('puhdas_tila_cookie_consent', JSON.stringify(allConsent));
    setShowBanner(false);
    setIsCustomizing(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryConsent: ConsentState = {
      essential: true,
      analytics: false,
      preferences: false
    };
    setConsent(necessaryConsent);
    localStorage.setItem('puhdas_tila_cookie_consent', JSON.stringify(necessaryConsent));
    setShowBanner(false);
    setIsCustomizing(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem('puhdas_tila_cookie_consent', JSON.stringify(consent));
    setShowBanner(false);
    setIsCustomizing(false);
  };

  const toggleToggle = (key: 'analytics' | 'preferences') => {
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            id="cookie-consent-banner"
            className="fixed bottom-6 left-6 z-[95] w-[calc(100%-3rem)] max-w-[420px] rounded-3xl bg-white border border-[#E0E4DC] p-6 sm:p-7 shadow-2xl text-left select-none"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          >
            {/* Top branding indicator */}
            <div className="flex items-center gap-2 mb-3.5" id="cookie-header">
              <div className="w-8 h-8 rounded-full bg-[#1B4332]/5 text-[#1B4332] flex items-center justify-center">
                <Cookie className="w-4 h-4 stroke-[2]" />
              </div>
              <h3 className="font-sans font-bold text-sm tracking-tight text-[#1A1A1A]">
                {t.bannerTitle}
              </h3>
            </div>

            <AnimatePresence mode="wait">
              {!isCustomizing ? (
                // VIEW 1: SIMPLE ACCORD
                <motion.div
                  key="simple-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-[#5A5A5A] leading-relaxed">
                    {t.bannerText}
                  </p>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      id="cookie-accept-all-btn"
                      onClick={handleAcceptAll}
                      className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-bold text-xs py-3 rounded-full hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                    >
                      <span>{t.acceptAll}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="cookie-accept-necessary-btn"
                        onClick={handleAcceptNecessary}
                        className="w-full border border-[#E0E4DC] hover:border-[#4A4A4A] text-[#4A4A4A] font-bold text-[11px] py-2.5 rounded-full bg-white transition-colors cursor-pointer truncate"
                      >
                        {t.acceptNecessary}
                      </button>

                      <button
                        id="cookie-customize-btn"
                        onClick={() => setIsCustomizing(true)}
                        className="w-full border border-[#E0E4DC] hover:border-[#1B4332] text-[#1B4332] font-semibold text-[11px] py-2.5 rounded-full bg-[#95C4A1]/5 hover:bg-[#95C4A1]/10 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Sliders className="w-3 h-3 shrink-0" />
                        <span className="truncate">{t.customize}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // VIEW 2: GRANULAR CUSTOMIZATION
                <motion.div
                  key="custom-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {/* 1. Essential Category */}
                    <div className="p-3 rounded-xl border border-[#F2F4F0] bg-[#FAFAF8] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500 fill-current" />
                          {t.essentialTitle}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#7A7A7A] bg-[#E0E4DC] px-2 py-0.5 rounded">
                          Ok
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7A7A7A] leading-relaxed">
                        {t.essentialDesc}
                      </p>
                    </div>

                    {/* 2. Analytics Category */}
                    <div className="p-3 rounded-xl border border-[#F2F4F0] bg-white text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5 font-sans">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                          {t.analyticsTitle}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleToggle('analytics')}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                            consent.analytics ? 'bg-[#1B4332]' : 'bg-[#E0E4DC]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                              consent.analytics ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#7A7A7A] leading-relaxed">
                        {t.analyticsDesc}
                      </p>
                    </div>

                    {/* 3. Preferences Category */}
                    <div className="p-3 rounded-xl border border-[#F2F4F0] bg-white text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#95C4A1]" />
                          {t.preferencesTitle}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleToggle('preferences')}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                            consent.preferences ? 'bg-[#1B4332]' : 'bg-[#E0E4DC]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                              consent.preferences ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#7A7A7A] leading-relaxed">
                        {t.preferencesDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      id="cookie-back-btn"
                      onClick={() => setIsCustomizing(false)}
                      className="border border-[#E0E4DC] hover:border-[#4A4A4A] text-[#4A4A4A] font-bold text-xs px-4 py-2.5 rounded-full bg-white transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t.back}</span>
                    </button>

                    <button
                      id="cookie-save-btn"
                      onClick={handleSaveCustom}
                      className="flex-1 bg-[#1B4332] text-white font-bold text-xs py-2.5 rounded-full hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                    >
                      {t.saveSelection}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RE-OPEN TRIGGER (appears elegantly in bottom-left when consent is already set & banner is hidden) */}
      <AnimatePresence>
        {!showBanner && (
          <motion.button
            id="cookie-reopen-trigger"
            onClick={() => {
              setShowBanner(true);
              setIsCustomizing(false);
            }}
            className="fixed bottom-6 left-6 z-40 bg-white border border-[#E0E4DC] p-2.5 sm:p-3 rounded-full shadow-lg text-[#4A4A4A] hover:text-[#1B4332] hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
            title={t.reopenTooltip}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ y: -2 }}
          >
            <Cookie className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-12" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
