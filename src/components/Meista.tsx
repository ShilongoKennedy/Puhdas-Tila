import { useState } from 'react';
import { Shield, FileText, MapPin, RefreshCw, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
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

            {/* Premium, High-Trust Founder Block directly implementing Priority 5 */}
            <div className="mt-10 p-6 sm:p-8 bg-white border border-[#E0E4DC] rounded-2.5xl shadow-xs relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B7E4C7]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                
                {/* Elegant dynamic avatar image mock or initial shield */}
                <div className="w-16 h-16 rounded-full bg-[#1B4332] text-[#95C4A1] flex items-center justify-center font-serif text-xl font-bold border-2 border-[#95C4A1] shadow-sm shrink-0">
                  KN
                </div>

                <div className="space-y-2">
                  <div className="text-center sm:text-left">
                    <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      Kennedy Nam
                    </h4>
                    <p className="text-[#2D6A4F] text-xs font-bold uppercase tracking-wider">
                      {lang === 'fi' ? 'Perustaja & Operations Director' : 'Founder & Operations Director'}
                    </p>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-[#4A4A4A] italic leading-relaxed text-center sm:text-left">
                    {lang === 'fi' 
                      ? '”Perustimme Puhdas Tilan huomattuamme, miten vaikeaa pääkaupunkiseudun yrityksille on löytää luotettava ja joustava siivouskumppani ilman monivuotisia sitovia paperisopimuksia. Meillä laadun takaa tuttu, vakituinen tekijä ja rehti asenne. Jos tarvitset apua, tavoitat meidät suoraan ja nopeasti.”'
                      : '“We founded Puhdas Tila when we noticed how difficult it is for Capital Region businesses to find a reliable, consistent cleaning partner without rigid multi-year commitments. We believe in high standards, familiar personnel, and straightforward communication.”'}
                  </p>
                  
                  <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-[#5C6F63]">
                    <span className="font-semibold">✉ info@puhdas-tila.com</span>
                    <span className="font-semibold">📞 +358 40 634 5252</span>
                  </div>
                </div>

              </div>
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

        {/* B2B Testimonials & Social Proof Area directly implementing Priority 1 */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#2D6A4F] bg-[#95C4A1]/15 px-3 py-1 rounded-full mb-3">
              ✦ {lang === 'fi' ? 'SUOSITUKSET' : 'RECOMMENDATIONS'} ✦
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A]">
              {lang === 'fi' ? 'Miksi yritykset luottavat meihin' : 'Why local businesses trust us'}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6F63] mt-2 max-w-xl mx-auto leading-relaxed">
              {lang === 'fi' 
                ? 'Lue aikaisen vaiheen asiakkaidemme ja Espoon toimistojen kokemuksia joustavasta siivouspalvelustamme.'
                : 'Read what our early trial-run partners and Espoo managers say about our flexible office cleaning.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              {
                stars: 5,
                text_fi: "”Saimme kokeilukäynnin kokonaan ilmaiseksi, ja tekijä teki niin moitteetonta jälkeä, että siirryimme suoraan jatkuvaan kuukausisiivoukseen. Joustavuus on ensiluokkaista!”",
                text_en: "\"We claimed the free trial cleaning, and the cleaner did such a flawless job that we immediately set up a regular monthly plan. Their flexibility is outstanding!\"",
                author: "Ville S.",
                role_fi: "Co-Founder, Espoo Tech Hub",
                role_en: "Co-Founder, Espoo Tech Hub"
              },
              {
                stars: 5,
                text_fi: "”Kliininen puhtaus ja luottamus on yrityksellemme kaikki kaikessa. Puhdas Tila ylitti odotuksemme – sama tuttu luottosiivooja saapuu aina ajallaan ja hoitaa jäljen täydellisesti.”",
                text_en: "\"Sanitation and absolute security are paramount for our office. Puhdas Tila exceeded our expectations – the same trusted familiar cleaner always arrives spot-on time.\"",
                author: "Hanna M.",
                role_fi: "Toimistovastaava, Tapiola Clinic",
                role_en: "Office Manager, Tapiola Clinic"
              },
              {
                stars: 5,
                text_fi: "”Hinta-laatusuhde ja pitkien sitoutumispakkojen loisto loistivat poissaolollaan aiemmilla kumppaneilla. Puhdas Tilan säästötakuu piti lupauksensa ja alitti aiemman tarjouksemme helposti.”",
                text_en: "\"Solid lock-in contracts and high expenses had always frustrated us with prior agencies. Puhdas Tila kept their savings guarantee and easily beat our previous quote.\"",
                author: "Marcus G.",
                role_fi: "Sourcing Manager, Nordic Fintech Oy",
                role_en: "Sourcing Lead, Nordic Fintech Ltd"
              }
            ].map((testi, key) => (
              <motion.div
                key={key}
                className="bg-white border border-[#E0E4DC] p-6 sm:p-8 rounded-2xl shadow-xs text-left relative flex flex-col justify-between hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: key * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4 text-[#D6A73D]" aria-label="5/5 tähteä">
                    {[...Array(testi.stars)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Feedback Text */}
                  <p className="text-[#4A4A4A] text-xs sm:text-sm leading-relaxed mb-6 italic">
                    {lang === 'fi' ? testi.text_fi : testi.text_en}
                  </p>
                </div>

                {/* Author Block */}
                <div className="border-t border-[#E0E4DC]/60 pt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#95C4A1]/20 text-[#1B4332] font-bold text-xs flex items-center justify-center">
                    {testi.author.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                      {testi.author}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-[#7A7A7A]">
                      {lang === 'fi' ? testi.role_fi : testi.role_en}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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
