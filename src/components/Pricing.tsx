import { useState, useEffect } from 'react';
import { Check, Shield, Sliders, ChevronRight, Calculator, Award } from 'lucide-react';
import { Language, translations } from '../translations';
import { motion } from 'motion/react';
import bookingBg from '../assets/images/booking_bg_1780234782241.png';

interface PricingProps {
  lang: Language;
  onPrefillQuote: (service: string, size: string) => void;
}

type FrequencyType = 'onetime' | 'biweekly' | 'weekly' | 'twice_weekly' | 'thrice_weekly';

export default function Pricing({ lang, onPrefillQuote }: PricingProps) {
  const t = translations[lang];

  // Calculator State values
  const [size, setSize] = useState<number>(75);
  const [frequency, setFrequency] = useState<FrequencyType>('weekly');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [estHours, setEstHours] = useState<number>(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(true);

  // Dynamic formula to approximate office cleaning pricing in Helsinki region
  useEffect(() => {
    // 1. Calculate realistic cleaning hours needed per visit based on size (m²)
    let hours = 1.0;
    if (size <= 50) {
      hours = 1.2 + (size * 0.012); // ~1.5h for 25m², 1.8h for 50m²
    } else if (size <= 150) {
      hours = 1.8 + ((size - 50) * 0.01); // 2.3h for 100m², 2.8h for 150m²
    } else if (size <= 300) {
      hours = 2.8 + ((size - 150) * 0.008); // 3.6h for 250m²
    } else {
      hours = 4.0 + ((size - 300) * 0.006); // 4.6h for 400m²
    }

    // Keep safe minimum hours for logistics & prep
    hours = Math.max(1.5, Math.round(hours * 10) / 10);
    setEstHours(hours);

    // 2. Map frequency to visits per month and calculate hourly rates with bulk discount
    let visitsPerMonth = 1;
    let rateMin = 25;
    let rateMax = 30;

    switch (frequency) {
      case 'onetime':
        visitsPerMonth = 1;
        rateMin = 26;
        rateMax = 32;
        break;
      case 'biweekly':
        visitsPerMonth = 2;
        rateMin = 25;
        rateMax = 29;
        break;
      case 'weekly':
        visitsPerMonth = 4;
        rateMin = 24;
        rateMax = 28;
        break;
      case 'twice_weekly':
        visitsPerMonth = 8;
        rateMin = 23;
        rateMax = 27;
        break;
      case 'thrice_weekly':
        visitsPerMonth = 12;
        rateMin = 22;
        rateMax = 26;
        break;
    }

    // Calculate range
    const minCalculated = Math.round(hours * rateMin * visitsPerMonth);
    const maxCalculated = Math.round(hours * rateMax * visitsPerMonth);

    setMinPrice(minCalculated);
    setMaxPrice(maxCalculated);
  }, [size, frequency]);

  // Map choices to BookingForm selection codes and initiate smooth transition
  const handleCalculateCTA = () => {
    // Map m² size value to the select dropdown keys
    let sizeCode = 'keski';
    if (size < 50) sizeCode = 'pieni';
    else if (size <= 150) sizeCode = 'keski';
    else if (size <= 300) sizeCode = 'suuri';
    else sizeCode = 'jatti';

    // Map frequency choice to serviceType select dropdown keys
    const serviceCode = frequency === 'onetime' ? 'kertatilaus' : 'kuukausi';

    // Prefill state in parent App.tsx
    onPrefillQuote(serviceCode, sizeCode);

    // Smooth scroll transition
    const targetElement = document.getElementById('varaus');
    if (targetElement) {
      const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 75; // compensate for header height
      
      const startPosition = window.pageYOffset;
      const distance = offsetTop - startPosition;
      const duration = 950; // Premium cinematic duration in milliseconds
      let startTime: number | null = null;

      // Luxurious EaseOutQuart physics for beautiful deceleration dynamics
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
      id="hinnat"
      role="region"
      aria-labelledby="hinnat-heading"
      className="bg-[#FAFAF7] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E0E4DC]"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#95C4A1] mb-2.5">
            {t.pricingBadge}
          </p>
          <h2
            id="hinnat-heading"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4 tracking-tight"
          >
            {t.pricingTitle}
          </h2>
          <p className="text-[#4A4A4A] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.pricingSub}
          </p>
        </motion.div>

        {/* Large Interactive Multi-Column Estimator Card */}
        <motion.div 
          className="max-w-[1040px] mx-auto bg-white border border-[#E0E4DC] rounded-3xl shadow-sm overflow-hidden mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Box (Input controls: sliders & toggles) */}
            <div className="lg:col-span-7 p-8 sm:p-10 select-none border-b lg:border-b-0 lg:border-r border-[#E0E4DC]">
              <div className="flex items-center gap-2.5 mb-8 text-[#1B4332]">
                <Sliders className="w-5 h-5 stroke-[2]" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A]">
                  {t.calcTitle}
                </h3>
              </div>

              {/* Slider 1: Office Floor Area Size (m²) */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-baseline">
                  <label htmlFor="size-range" className="text-sm font-bold text-[#4A4A4A]">
                    {t.calcSizeLabel}
                  </label>
                  <span className="font-mono text-xl font-black text-[#1B4332] bg-[#95C4A1]/15 px-3 py-1 rounded-lg">
                    {size} m²
                  </span>
                </div>

                <div className="relative pt-2">
                  <input
                    id="size-range"
                    type="range"
                    min="15"
                    max="450"
                    step="5"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#E0E4DC] rounded-lg appearance-none cursor-pointer accent-[#1B4332] outline-none"
                    aria-valuemin={15}
                    aria-valuemax={450}
                    aria-valuenow={size}
                  />
                  <div className="flex justify-between text-[10px] text-[#7A7A7A] mt-2 font-mono">
                    <span>15 m²</span>
                    <span>150 m²</span>
                    <span>300 m²</span>
                    <span>450 m²</span>
                  </div>
                </div>

                {/* Quick preset selector chips */}
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {[
                    { label: '30 m²', value: 30 },
                    { label: '90 m²', value: 90 },
                    { label: '180 m²', value: 180 },
                    { label: '320 m²', value: 320 },
                  ].map((preset) => (
                    <motion.button
                      key={preset.value}
                      onClick={() => setSize(preset.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        size === preset.value
                          ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                          : 'bg-[#FAFAF7] border-[#E0E4DC] text-[#4A4A4A] hover:border-gray-400'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {preset.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Selector 2: Cleaning Schedule Frequency */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-[#4A4A4A]">
                  {t.calcFreqLabel}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                  {[
                    { id: 'onetime', label: t.calcFreq1 },
                    { id: 'biweekly', label: t.calcFreq2 },
                    { id: 'weekly', label: t.calcFreq3 },
                    { id: 'twice_weekly', label: t.calcFreq4 },
                    { id: 'thrice_weekly', label: t.calcFreq5 },
                  ].map((option) => {
                    const isSelected = frequency === option.id;
                    return (
                      <motion.button
                        key={option.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setFrequency(option.id as FrequencyType)}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-center ${
                          isSelected
                            ? 'bg-[#1B4332]/5 border-[#1B4332]/80 ring-1 ring-[#1B4332]/10'
                            : 'bg-white border-[#E0E4DC]/70 hover:border-gray-400'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#1B4332]' : 'text-[#1A1A1A]'}`}>
                          {option.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Promo Discount Toggle Segment */}
              <div className="mt-8 pt-6 border-t border-[#E0E4DC]">
                <div 
                  onClick={() => setIsDiscountApplied(!isDiscountApplied)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    isDiscountApplied 
                      ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs' 
                      : 'bg-[#FAFAF7] border-[#E0E4DC] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎉</span>
                    <div className="text-left">
                      <p className={`text-xs font-bold leading-tight ${isDiscountApplied ? 'text-emerald-950' : 'text-[#1A1A1A]'}`}>
                        {t.calcDiscountToggle}
                      </p>
                      <p className="text-[10px] text-[#7A7A7A] mt-1 leading-normal max-w-sm">
                        {lang === 'fi' 
                          ? 'Säästät 15% ensimmäisen kuukauden tai kertatilauksen hinnoista!' 
                          : 'Save 15% on your first month or one-time cleaning session!'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Switch toggle control style */}
                  <div className="relative shrink-0 ml-2">
                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${isDiscountApplied ? 'bg-[#1B4332]' : 'bg-gray-200'}`} />
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-xs transition-transform duration-200 ${isDiscountApplied ? 'translate-x-4' : ''}`} />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Box (Visual feedback & dynamic estimates) */}
            <div className="lg:col-span-5 bg-[#1B4332] text-white p-8 sm:p-10 flex flex-col justify-between relative grain-overlay overflow-hidden">
              
              {/* High-Contrast Luxury Abstract Animated Backdrop with extremely elegant floating motion */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                <motion.img
                  src={bookingBg}
                  alt="Luxury fluid silk design layer 1"
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.38] mix-blend-screen scale-[1.12]"
                  referrerPolicy="no-referrer"
                  animate={{
                    scale: [1.12, 1.18, 1.12],
                    x: [-10, 10, -10],
                    y: [8, -8, 8],
                    rotate: [0, 2, 0],
                  }}
                  transition={{
                    duration: 11,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.img
                  src={bookingBg}
                  alt="Luxury fluid silk design layer 2"
                  className="absolute inset-0 w-full h-full object-cover opacity-[0.24] mix-blend-color-dodge scale-[1.18] origin-center"
                  referrerPolicy="no-referrer"
                  animate={{
                    scale: [1.18, 1.12, 1.18],
                    x: [10, -10, 10],
                    y: [-8, 8, -8],
                    rotate: [1, -1, 1],
                  }}
                  transition={{
                    duration: 8.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332] via-[#1B4332]/40 to-[#1B4332]" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[#95C4A1] text-xs font-bold tracking-widest uppercase mb-6">
                  <Calculator className="w-4 h-4" />
                  <span>{t.calcTitle}</span>
                </div>

                <p className="text-white/60 text-xs mb-1.5 uppercase font-bold tracking-wider">
                  {t.calcEstimateLabel}
                </p>

                {isDiscountApplied ? (
                  <div className="space-y-1 mb-4">
                    {/* Struck-through original price */}
                    <p className="text-white/40 text-xs line-through font-semibold">
                      {frequency === 'onetime' ? `${minPrice} €` : `${minPrice} - ${maxPrice} €`}
                    </p>
                    {/* Big beautiful discounted price */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#F4E185] drop-shadow-sm">
                        {frequency === 'onetime' 
                          ? `${Math.round(minPrice * 0.85)} €` 
                          : `${Math.round(minPrice * 0.85)} - ${Math.round(maxPrice * 0.85)} €`
                        }
                      </span>
                      <span className="text-[#95C4A1] text-xs sm:text-sm font-semibold select-none">
                        {frequency === 'onetime' ? t.calcEstimateUnitHour : t.calcEstimateUnit}
                      </span>
                    </div>
                    {/* Custom active badge */}
                    <span className="inline-block bg-[#F4E185]/20 text-[#F4E185] border border-[#F4E185]/30 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-sm mt-1">
                      ✦ {t.calcDiscountApplied}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#B7E4C7]">
                      {frequency === 'onetime' ? `${minPrice} €` : `${minPrice} - ${maxPrice} €`}
                    </span>
                    <span className="text-[#95C4A1] text-xs sm:text-sm font-semibold select-none">
                      {frequency === 'onetime' ? t.calcEstimateUnitHour : t.calcEstimateUnit}
                    </span>
                  </div>
                )}

                {/* Simulated estimate parameters info block */}
                <span className="text-white/50 text-[11px] block leading-normal mb-6 pb-6 border-b border-white/10">
                  {lang === 'fi' 
                    ? `* Arvioitu työaika ${estHours} h per siivouskerta · Suositeltu solo-yrittäjähinta.`
                    : `* Estimated duration ~${estHours} hrs per cleaning session · Suggested lean rates.`
                  }
                </span>

                {/* Inclusions checklist cards */}
                <p className="text-xs font-black text-white/90 uppercase tracking-widest mb-4">
                  {t.pricingStdInclusionsTitle}
                </p>

                <ul className="space-y-3.5 mb-8" aria-label="Jokaiseen siivoukseen sisältyy aina">
                  {[
                    t.pricingInclusion1,
                    t.pricingInclusion2,
                    t.pricingInclusion3,
                    t.pricingInclusion4,
                  ].map((inc, index) => (
                    <li key={index} className="flex gap-2.5 text-xs text-white/90 leading-relaxed">
                      <Check className="w-4 h-4 text-[#95C4A1] shrink-0 stroke-[2.5]" aria-hidden="true" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button & Note */}
              <div className="space-y-4 relative z-10">
                <motion.button
                  onClick={handleCalculateCTA}
                  className="w-full bg-[#95C4A1] hover:bg-[#B7E4C7] text-[#1B4332] font-extrabold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-sm text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{t.calcCtaBtn}</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>

                <p className="text-[10px] text-white/50 leading-relaxed text-center">
                  {t.calcEstimateNote}
                </p>
              </div>

            </div>

          </div>
        </motion.div>

        {/* Säästötakuu / Price Match Guarantee Trust Banner (Exactly as configured by user) */}
        <motion.div 
          className="max-w-[840px] mx-auto bg-white border border-[#95C4A1]/35 rounded-2xl p-6 sm:p-8 md:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-12 shadow-sm focus:outline-none"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1B4332] flex items-center justify-center shrink-0 shadow-sm relative">
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 text-[#95C4A1]"
              fill="currentColor"
            >
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
            </svg>
            <div className="absolute -top-1 -right-1 bg-[#95C4A1] text-[#1B4332] font-sans font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-white">
              %
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#2D6A4F] bg-[#95C4A1]/15 px-3 py-1 rounded-full">
              {t.pricingGuaranteeLabel}
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug">
              {t.pricingGuaranteeHeadline}
            </h3>
            <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
              {t.pricingGuaranteeText}
            </p>
          </div>
        </motion.div>

        {/* Pricing disclaimer text footer notes */}
        <p className="max-w-2xl mx-auto text-center text-xs text-[#7A7A7A] leading-relaxed">
          {t.pricingDisclaimer}
        </p>

      </div>
    </section>
  );
}
