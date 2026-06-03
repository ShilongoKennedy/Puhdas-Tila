import { ArrowRight, ChevronDown, Sparkles, Check } from 'lucide-react';
import { Language, translations } from '../translations';
import heroImage from '../assets/images/hero_cleaning_1780177194159.png';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface HeroProps {
  lang: Language;
}

export default function Hero({ lang }: HeroProps) {
  const t = translations[lang];

  const wordsFi = ['joustavasti', 'reilusti', 'varmasti', 'puhtaasti', 'luotettavasti'];
  const wordsEn = ['flexibly', 'fairly', 'safely', 'pristinely', 'reliably'];
  const words = lang === 'fi' ? wordsFi : wordsEn;

  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    // Reset index when language changes
    setWordIndex(0);
  }, [lang]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [words.length]);

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
    <section
      id="hero"
      role="region"
      aria-label="Etusivu Esittely"
      className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center text-white overflow-hidden py-24 sm:py-32 px-4 bg-[#0D2B1E]"
    >
      {/* Background Image: Full-Bleed & Beautifully Out in the Open */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          src={heroImage} 
          alt={lang === 'fi' ? 'Ammattimainen toimistosiivooja työssään' : 'Professional office cleaner in action'} 
          className="w-full h-full object-cover object-[78%_center] xs:object-[74%_center] sm:object-[72%_center] md:object-[70%_center] lg:object-center select-none"
          referrerPolicy="no-referrer"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.82 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
        {/* Soft, premium, natural cinematic gradient overlay: no green tint overlay, preserving the authentic natural colors of the photographer's warm lighting and green plants, while elegantly framing the text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D2B1E]/75 via-black/25 to-[#0D2B1E]" />
        {/* Understated radial vignette to draw focus to the centered typography */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#0D2B1E]/60" />
      </div>

      {/* Dynamic Floating Ambient Light Blobs to add gentle depth and glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #95C4A1 0%, transparent 70%)',
            top: '15%',
            left: '20%',
          }}
          animate={{
            x: [0, 30, -10, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Centered Editorial Content Layout */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
        
        {/* Direct geographical market validation pill */}
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#95C4A1]/30 bg-[#1B4332]/75 hover:bg-[#1B4332]/90 transition-colors duration-300 backdrop-blur-md text-[#B7E4C7] text-[10px] sm:text-xs font-bold tracking-[0.18em] uppercase mb-8 shadow-md cursor-default"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <span className="w-1.5 h-1.5 bg-[#95C4A1] rounded-full animate-ping shrink-0" />
          <span>Helsinki • Espoo • Vantaa</span>
        </motion.div>

        {/* Masterful Bold Headline - Large, elegant, centered Serif */}
        <motion.h1 
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1] max-w-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          {t.heroTitlePrefix}
          <span className="relative inline-block text-[#B7E4C7] font-serif italic mx-2 sm:mx-3 whitespace-nowrap">
            <AnimatePresence mode="wait">
              <motion.span
                key={words[wordIndex]}
                className="inline-block relative z-10"
                initial={{ y: 24, opacity: 0, rotateX: -60 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                exit={{ y: -24, opacity: 0, rotateX: 60 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {words[wordIndex]}
              </motion.span>
            </AnimatePresence>
            
            {/* Inline subtle green border line context underneath the kinetic words */}
            <span className="absolute -bottom-1 inset-x-0 h-[2.5px] bg-[#95C4A1]/80 rounded-full" />
            
            {/* Elegant stellar sparkle icon decoration inline */}
            <motion.span 
              className="absolute -top-3 sm:-top-4 -right-4 sm:-right-5 text-[#95C4A1]/90"
              animate={{ rotate: 360, scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.span>
          </span>
          {t.heroTitleSuffix}
        </motion.h1>

        {/* Supportive subtitle copy positioned symmetrically with generous breathing room */}
        <motion.p 
          className="text-base sm:text-lg md:text-xl text-white/95 font-sans tracking-wide max-w-2xl mb-10 leading-relaxed font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          {t.heroSub}
        </motion.p>

        {/* Dynamic, responsive primary clean CTA button matched to theme and layout */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-12 w-full max-w-xs sm:max-w-none justify-center items-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.button
            onClick={() => handleScrollTo('varaus')}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#95C4A1] hover:bg-[#B7E4C7] text-[#0D2B1E] font-extrabold px-10 py-5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer text-base shadow-[0_15px_35px_rgba(149,196,161,0.25)] hover:shadow-[0_20px_45px_rgba(183,228,199,0.35)]"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.heroCtaPrimary}
            <motion.span
              className="inline-block shrink-0"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.span>
          </motion.button>
          
          <motion.button
            onClick={() => handleScrollTo('palvelut')}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-5 rounded-full border border-white/25 hover:border-white/50 transition-all duration-300 focus:outline-none cursor-pointer text-base backdrop-blur-md shadow-md"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {t.heroCtaSecondary}
          </motion.button>
        </motion.div>

        {/* Clean, high-contrast flat list of trust seals */}
        <motion.div 
          className="flex flex-wrap gap-y-3 gap-x-8 justify-center items-center text-xs sm:text-sm text-white/90 tracking-wider font-light drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
        >
          <span className="flex items-center gap-2 font-medium hover:text-white transition-colors duration-300 cursor-default">
            <Check className="w-4 h-4 text-[#95C4A1] shrink-0" strokeWidth={3} />
            <span>{t.heroBadgeInsured.replace(/^✓\s*/, '')}</span>
          </span>
          <span className="hidden md:inline text-white/25">|</span>
          <span className="flex items-center gap-2 font-medium hover:text-white transition-colors duration-300 cursor-default">
            <Check className="w-4 h-4 text-[#95C4A1] shrink-0" strokeWidth={3} />
            <span>{t.heroBadgeBilling.replace(/^✓\s*/, '')}</span>
          </span>
          <span className="hidden md:inline text-white/25">|</span>
          <span className="flex items-center gap-2 font-medium hover:text-white transition-colors duration-300 cursor-default">
            <Check className="w-4 h-4 text-[#95C4A1] shrink-0" strokeWidth={3} />
            <span>{t.heroBadgeContracts.replace(/^✓\s*/, '')}</span>
          </span>
        </motion.div>

      </div>

      {/* Floating scroll action arrow locator */}
      <button
        onClick={() => handleScrollTo('palvelut')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-transparent text-white/40 hover:text-white transition-colors duration-300 animate-bounce focus:outline-none cursor-pointer z-10"
        aria-label="Skrollaa palveluihin"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
