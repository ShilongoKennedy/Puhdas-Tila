import { useState, useEffect } from 'react';
import { ChevronUp, Phone, Mail, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../translations';

interface FloatingActionsProps {
  lang: Language;
}

export default function FloatingActions({ lang }: FloatingActionsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const startPosition = window.pageYOffset;
    const distance = -startPosition;
    const duration = 800;
    let startTime: number | null = null;

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
  };

  const handleScrollToBooking = () => {
    const element = document.getElementById('varaus');
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 75;
      const startPosition = window.pageYOffset;
      const distance = offsetTop - startPosition;
      const duration = 900;
      let startTime: number | null = null;

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

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3 select-none pointer-events-none">
          {/* Expanded contact action pills with cascading entry animations */}
          <AnimatePresence>
            {isExpanded && (
              <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
                {/* Phone number link */}
                <motion.a
                  href="tel:+358406345252"
                  className="flex items-center gap-2 bg-white text-[#1B4332] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg border border-[#E0E4DC] hover:bg-[#FAFAF7]"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  title={lang === 'fi' ? 'Soita meille' : 'Call us'}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+358 40 634 5252</span>
                </motion.a>

                {/* Email link */}
                <motion.a
                  href="mailto:info@puhdas-tila.com"
                  className="flex items-center gap-2 bg-white text-[#1B4332] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg border border-[#E0E4DC] hover:bg-[#FAFAF7]"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  title={lang === 'fi' ? 'Lähetä sähköpostia' : 'Email us'}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>info@puhdas-tila.com</span>
                </motion.a>

                {/* Direct Tarjouspyyntö CTA */}
                <motion.button
                  onClick={handleScrollToBooking}
                  className="flex items-center gap-2 bg-[#95C4A1] text-[#1B4332] font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg border border-[#95C4A1] hover:bg-[#B7E4C7] cursor-pointer"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <span>{lang === 'fi' ? 'Pyydä tarjous free' : 'Get quotation'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            )}
          </AnimatePresence>

          {/* Main Floating Buttons Trigger Row */}
          <div className="flex gap-2.5 pointer-events-auto">
            {/* Quick Action Expanded Toggle */}
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg border text-white transition-all duration-300 cursor-pointer ${
                isExpanded 
                  ? 'bg-[#1B4332] border-[#1B4332] rotate-45' 
                  : 'bg-[#2D6A4F] border-[#2D6A4F] hover:bg-[#1B4332]'
              }`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              aria-label={lang === 'fi' ? 'Yhteystiedot ja pikavalinnat' : 'Contact channels and quick actions'}
              aria-expanded={isExpanded}
            >
              <Phone className="w-5 h-5 flex-shrink-0" />
            </motion.button>

            {/* Back to top scroll trigger */}
            <motion.button
              onClick={scrollToTop}
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-[#E0E4DC] text-[#1A1A1A] shadow-lg hover:bg-[#FAFAF7] hover:text-[#1B4332] cursor-pointer"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              aria-label={lang === 'fi' ? 'Takaisin ylös' : 'Scroll to top'}
            >
              <ChevronUp className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
