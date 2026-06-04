import { useState } from 'react';
import { Shield, FileText, MapPin, RefreshCw, ChevronDown, ChevronUp, HelpCircle, Star } from 'lucide-react';
import { Language, translations } from '../translations';
import { motion } from 'motion/react';

interface MeistaProps {
  lang: Language;
}

export default function Meista({ lang }: MeistaProps) {
  const t = translations[lang];
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const trustRows = [
    {
      icon: Shield,
      title: t.trust1Title,
      description: t.trust1Desc,
    },
    {
      icon: FileText,
      title: t.trust2Title,
      description: t.trust2Desc,
    },
    {
      icon: MapPin,
      title: t.trust3Title,
      description: t.trust3Desc,
    },
    {
      icon: RefreshCw,
      title: t.trust4Title,
      description: t.trust4Desc,
    },
  ];

  const faqs = lang === 'fi' ? [
    {
      q: "Miten siivousajankohdan muuttaminen tai peruminen toimii?",
      a: "Ymmärrämme, että startup-toimistolla suunnitelmat muuttuvat nopeasti. Voit muuttaa tai perua varatun siivouskerran kuluitta ilmoittamalla siitä meille viimeistään 24 tuntia ennen sovittua ajankohtaa."
    },
    {
      q: "Miten siivousvälineet ja puhdistusaineet hoidetaan?",
      a: "Käytämme parhaan lopputuloksen saavuttamiseksi aina omia ekologisia, hajusteettomia ja täysin allergiaystävällisiä ammattitason pesuaineitamme sekä tuoreita välineitä, jotka sisältyvät hintaan. Jos haluatte käyttää omia välineitänne, sekin sopii joustavasti."
    },
    {
      q: "Miten avainhallinta ja turvallisuus järjestetään?",
      a: "Avaimia käsitellään korkeimmalla turvasuojauksella. Kirjoitamme aina virallisen avainsopimuksen ja säilytämme avaimia turvakaapissa. Siivoojamme huolehtivat hälytysten kytkemisestä ja ovien lukitsemisesta poikkeuksetta."
    },
    {
      q: "Miten säästötakuu (Best Value / Price Match) toimii käytännössä?",
      a: "Haluamme tarjota Espoon ylivertaisesti parhaan hinta-laatusuhteen ja olla helpoin valinta aloittaville yrityksille. Jos sinulla on voimassa oleva kirjallinen tarjous vakiintuneelta siivousyritykseltä pääkaupunkiseudulla vastaavasta siivouslaajuudesta, me vastaamme siihen tai alitamme sen, samalla kun tarjoamme joustavammat sopimusehdot ilman sitoutumispakkoja."
    },
    {
      q: "Onko sopimuksessa jokin pitkää sitoutumisaikaa tai määräaikaisuutta?",
      a: "Ei lainkaan! Kertatilaukset ovat täysin kertaluonteisia ilman mitään jatkosopimuksia. Myötäilee myös jatkuvassa säännöllisessä kuukausisopimuksessa noudatetaan erittäin reilua ja kevyttä 1 kuukauden irtisanomisaikaa. Voit siis skaalata tai muuttaa palvelua todella joustavasti liiketoimintasi kasvaessa."
    }
  ] : [
    {
      q: "How can we change or cancel a scheduled cleaning session?",
      a: "We understand that startup schedules change rapidly. You can reschedule or cancel any booked cleaning session free of charge by notifying us at least 24 hours in advance."
    },
    {
      q: "How are cleaning supplies and chemicals handled?",
      a: "We default to bringing our own professional, non-toxic, allergy-friendly, and ecological cleaning agents along with pristine microfiber utilities. If you prefer us to utilize your company's own existing equipment, we can accommodate that seamlessly."
    },
    {
      q: "How do you manage office security, alarm systems, and key holding?",
      a: "Security is our highest priority. All keys are managed under a strict legal check-in key covenant, securely coded, and kept locked when not on duties. Our cleaners are expert in managing local alarm protocols and locked premises meticulously."
    },
    {
      q: "How does your savings / price match guarantee work?",
      a: "We want to be the default choice and fit early budgets perfectly. If you have an active written quote from another registered service provider in Helsinki/Espoo for the same premises, we will match or beat the quote under simpler with no locked monthly obligation constraints."
    },
    {
      q: "Are there any rigid long-term locked B2B terms?",
      a: "No! Single one-off bookings are fully on-demand with zero future commitments. Even our regular monthly subscriptions operate on a premium-standard, flexible 1-month notification schedule, allowing dynamic changes as your start-up grows."
    }
  ];

  return (
    <section
      id="meista"
      role="region"
      aria-labelledby="meista-heading"
      className="bg-[#F2F4F0] py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E0E4DC]"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Core Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          
          {/* Left Column (Copy blocks) */}
          <motion.div 
            className="lg:col-span-6 text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#95C4A1] mb-2">
              {t.aboutBadge}
            </p>
            <h2
              id="meista-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 leading-tight"
            >
              {t.aboutTitle}
            </h2>
            
            <div className="space-y-4 text-[#4A4A4A] text-sm sm:text-base leading-relaxed">
              <p>
                {t.aboutPara1}
              </p>
              <p>
                {t.aboutPara2}
              </p>
              <p>
                {t.aboutPara3}
              </p>
            </div>
          </motion.div>

          {/* Right Column (Trust Rows Stack) */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <div className="space-y-6">
              {trustRows.map((row, index) => {
                const IconComponent = row.icon;
                return (
                  <motion.div 
                    key={row.title} 
                    className="flex gap-4 items-start p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-[#E0E4DC]/80 transition-all duration-300 hover:bg-white hover:border-[#95C4A1]/40 hover:shadow-md"
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Circle wrapper icon badge */}
                    <div className="w-12 h-12 bg-[#B7E4C7] text-[#1B4332] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <IconComponent className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                    </div>
                    
                    <div className="text-left">
                      <h3 className="font-bold text-base text-[#1A1A1A] mb-1">
                        {row.title}
                      </h3>
                      <p className="text-[#4A4A4A] text-xs sm:text-sm leading-relaxed">
                        {row.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>


        {/* Google Business Profile Trust Badge Banner */}
        <motion.div
          className="max-w-[840px] mx-auto bg-gradient-to-br from-[#1B4332] to-[#0D2B1E] text-white border border-[#2D6A4F]/30 rounded-3xl p-6 sm:p-8 shadow-md mb-12 text-left relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#95C4A1]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                {lang === 'fi' ? 'Löydät meidät nyt Googlessa!' : "We're Now on Google!"}
              </h3>
              <p className="text-xs sm:text-sm text-white/85 max-w-lg leading-relaxed">
                {lang === 'fi' 
                  ? 'Puhdas Tilan virallinen Google Business -profiili on avattu. Tule mukaan tukemaan kotimaista palvelua ja jätä meille palautetta ensimmäisten joukossa!'
                  : 'Puhdas Tila is now verified on Google Business! Support a high-trust local service by visiting our listing or leaving your feedback.'}
              </p>
            </div>
            <a
              href="https://share.google/eCXwFCDZ09xq98zIC"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#95C4A1] hover:bg-[#B7E4C7] text-[#0D2B1E] font-extrabold px-6 py-3.5 rounded-xl transition-all duration-300 text-sm focus:outline-none shrink-0 shadow-lg hover:scale-[1.02]"
            >
              <span>{lang === 'fi' ? 'Katso Google-profiili ↗' : 'View Google Profile ↗'}</span>
            </a>
          </div>
        </motion.div>


        {/* Elegant Accordion B2B Frequently Asked Questions Area */}
        <motion.div 
          className="max-w-[840px] mx-auto bg-white border border-[#E0E4DC] rounded-3xl p-6 sm:p-10 shadow-sm text-left"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#2D6A4F] bg-[#95C4A1]/15 px-3 py-1 rounded-full mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {lang === 'fi' ? 'Usein kysytyt kysymykset' : 'Frequently Asked Questions'}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6F63] mt-2 select-none">
              {lang === 'fi' 
                ? 'Katso vastaukset siivousaikatauluihin, avainturvallisuuteen ja laskutukseen liittyvissä kysymyksissä.'
                : 'Get swift, transparent answers regarding scheduling, key handling, and billing policies.'}
            </p>
          </div>

          <div className="divide-y divide-[#E0E4DC]" role="tablist" aria-label="FAQ">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <dt>
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      className="w-full flex justify-between items-center text-left text-sm sm:text-base font-bold text-[#1A1A1A] hover:text-[#1B4332] py-2 transition-colors cursor-pointer focus:outline-none"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#FAFAF7] hover:bg-[#F2F4F0] border border-[#D1D8D2] flex items-center justify-center transition-all">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#1B4332] stroke-[2.5]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#1B4332] stroke-[2.5]" />
                        )}
                      </span>
                    </button>
                  </dt>
                  <dd 
                    id={`faq-answer-${idx}`}
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed pb-2 pl-1 bg-[#FAFAF7]/40 rounded p-3 border-l-2 border-[#95C4A1]">
                      {faq.a}
                    </p>
                  </dd>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
