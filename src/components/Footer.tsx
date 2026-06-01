import { Linkedin, Facebook, Instagram, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Language, translations } from '../translations';
import Logo from './Logo';
import { motion } from 'motion/react';
import bookingBg from '../assets/images/booking_bg_1780234782241.png';

interface FooterProps {
  lang: Language;
  logoStyle?: 'option1' | 'option2' | 'option3';
  onOpenAdmin?: () => void;
}

export default function Footer({ lang, logoStyle, onOpenAdmin }: FooterProps) {
  const t = translations[lang];

  const handleScrollTo = (id: string) => {
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

  return (
    <footer 
      role="contentinfo"
      className="bg-[#0D2B1E] text-white/75 pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/5 relative overflow-hidden"
    >
      {/* High-Contrast Luxury Abstract Animated Backdrop with extremely elegant floating motion */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <motion.img
          src={bookingBg}
          alt="Luxury fluid silk design layer 1"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.22] mix-blend-screen scale-[1.12]"
          referrerPolicy="no-referrer"
          animate={{
            scale: [1.12, 1.18, 1.12],
            x: [-12, 12, -12],
            y: [8, -8, 8],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.img
          src={bookingBg}
          alt="Luxury fluid silk design layer 2"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-color-dodge scale-[1.18] origin-center"
          referrerPolicy="no-referrer"
          animate={{
            scale: [1.18, 1.12, 1.18],
            x: [12, -12, 12],
            y: [-8, 8, -8],
            rotate: [1, -1, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Soft premium ambient light vignettes & depth constraints */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D2B1E] via-transparent to-[#0D2B1E]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D2B1E]/90 via-transparent to-transparent hidden lg:block" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Footers grid directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Brand details card */}
          <div className="reveal">
            <button
              onClick={() => handleScrollTo('hero')}
              className="flex items-center gap-2 mb-5 hover:opacity-85 transition-opacity focus:outline-none cursor-pointer"
              aria-label="Puhdas Tila Etusivu"
            >
              <Logo isScrolled={false} logoStyle={logoStyle} />
            </button>
            <p className="text-white/60 italic text-sm mb-3 text-left">
              &quot;{lang === 'fi' ? 'Siisti toimisto, selkeä mieli.' : 'Clean office, clear mind.'}&quot;
            </p>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6 text-left">
              {t.footerMutedText}
            </p>

            {/* Social handles index row */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Shortcuts */}
          <div className="reveal delay-100">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#95C4A1] mb-5 text-left">
              {t.footerNavTitle}
            </h3>
            <ul className="space-y-3 text-sm text-left">
              <li>
                <button 
                  onClick={() => handleScrollTo('palvelut')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.navServices}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollTo('miten')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.navProcess}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollTo('hinnat')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.navPricing}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollTo('meista')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.navAbout}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollTo('varaus')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {lang === 'fi' ? 'Varauslomake' : 'Booking Form'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Offerings Directory */}
          <div className="reveal delay-150">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#95C4A1] mb-5 text-left">
              {t.footerServicesTitle}
            </h3>
            <ul className="space-y-3 text-sm text-left">
              <li>
                <button 
                  onClick={() => handleScrollTo('palvelut')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.service1Title}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollTo('palvelut')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.service2Title}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollTo('palvelut')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.service3Title}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollTo('palvelut')} 
                  className="hover:text-white hover:underline transition-all text-left focus:outline-none cursor-pointer"
                >
                  {t.service4Title}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact details with icons */}
          <div className="reveal delay-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#95C4A1] mb-5 text-left">
              {t.footerContactTitle}
            </h3>
            <ul className="space-y-4 text-xs sm:text-sm text-left">
              <li className="flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-[#95C4A1] shrink-0" aria-hidden="true" />
                <a href="mailto:info@puhdastila.fi" className="hover:text-white focus:outline-none">info@puhdastila.fi</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4.5 h-4.5 text-[#95C4A1] shrink-0" aria-hidden="true" />
                <a href="tel:+358406345252" className="hover:text-white focus:outline-none">+358 40 634 5252</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#95C4A1] shrink-0" aria-hidden="true" />
                <span>{lang === 'fi' ? 'Espoo, Helsinki, Kauniainen, Kirkkonummi' : 'Espoo, Helsinki, Kauniainen, Kirkkonummi'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-[#95C4A1] shrink-0" aria-hidden="true" />
                <span>{t.footerHours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Separator row footer bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-white/45">
          <p>{t.footerCopyright}</p>
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex items-center gap-1.5 font-medium">
              <span>{t.footerUkkoNote}</span>
            </p>
            {onOpenAdmin && (
              <button 
                onClick={onOpenAdmin}
                className="hover:text-white hover:underline cursor-pointer font-bold border border-white/10 px-3 py-1 bg-white/[0.03] rounded transition-colors flex items-center gap-1"
                aria-label="Avaa ylläpitoportaali"
              >
                🔒 {lang === 'fi' ? 'Ylläpitoportaali' : 'Admin Portal'}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
