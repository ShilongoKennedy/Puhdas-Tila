import { FileText, PhoneCall, Sparkles } from 'lucide-react';
import { Language, translations } from '../translations';
import { motion } from 'motion/react';

interface HowItWorksProps {
  lang: Language;
}

export default function HowItWorks({ lang }: HowItWorksProps) {
  const t = translations[lang];

  const steps = [
    {
      number: "01",
      icon: FileText,
      title: t.processStep1Title,
      description: t.processStep1Desc,
    },
    {
      number: "02",
      icon: PhoneCall,
      title: t.processStep2Title,
      description: t.processStep2Desc,
    },
    {
      number: "03",
      icon: Sparkles,
      title: t.processStep3Title,
      description: t.processStep3Desc,
    },
  ];

  return (
    <section
      id="miten"
      role="region"
      aria-labelledby="miten-heading"
      className="bg-[#F2F4F0] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E0E4DC]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#95C4A1] mb-2">
            {t.processBadge}
          </p>
          <h2
            id="miten-heading"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4"
          >
            {t.processTitle}
          </h2>
          <p className="text-[#4A4A4A] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {t.processSub}
          </p>
        </motion.div>

        {/* Steps Container Row */}
        <div className="relative max-w-[960px] mx-auto">
          {/* Connecting line on desktop layout */}
          <div 
            className="hidden md:block absolute top-[90px] left-1/6 right-1/6 h-[2px] border-t-2 border-dashed border-[#E0E4DC] -z-0" 
            style={{ width: '66.666%', left: '16.666%' }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.number}
                  className="relative z-10 flex flex-col items-center flex-1"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
                >
                  {/* Step Serif Number */}
                  <motion.div 
                    className="font-serif text-5xl sm:text-6xl font-bold text-[#95C4A1] opacity-60 leading-none mb-3"
                    aria-hidden="true"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Icon Badge container */}
                  <motion.div 
                    className="w-16 h-16 bg-[#1B4332] text-white rounded-full flex items-center justify-center shadow-md mb-5"
                    aria-label={`Vaihe ${step.number}`}
                    whileHover={{ scale: 1.1, backgroundColor: "#2D6A4F", rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent className="w-7 h-7 stroke-[1.75]" aria-hidden="true" />
                  </motion.div>

                  {/* Step description headers */}
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-[#4A4A4A] text-sm max-w-[260px] leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
