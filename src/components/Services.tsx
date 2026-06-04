import { useState, useEffect } from 'react';
import { Clock, Sparkles, Wand2, HeartHandshake, ArrowRight, X, Check } from 'lucide-react';
import { Language, translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesProps {
  lang: Language;
  onSelectService: (serviceId: string) => void;
}

const modalTranslations = {
  fi: {
    includedTitle: 'Mitä palveluun sisältyy?',
    includedSub: 'Yleiskuvaus ja tarkka tehtäväluettelo:',
    priceLabel: 'Hinta-arvio',
    closeBtn: 'Sulje',
    bookBtn: 'Varaa siivous tästä →',
    contactBtn: 'Ota yhteyttä →',
  },
  en: {
    includedTitle: 'What is included in this service?',
    includedSub: 'Overview and detailed cleaning task breakdown:',
    priceLabel: 'Price estimate',
    closeBtn: 'Close',
    bookBtn: 'Book this service →',
    contactBtn: 'Get in touch →',
  }
};

export default function Services({ lang, onSelectService }: ServicesProps) {
  const t = translations[lang];
  const [selectedService, setSelectedService] = useState<any | null>(null);

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedService(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock scroll when modal is active
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedService]);

  const servicesDetailed = [
    {
      id: "toimistosiivous",
      mappedServiceId: "kuukausi",
      icon: Clock,
      iconBg: "bg-[#B7E4C7] text-[#1B4332] group-hover:bg-[#95C4A1]/40",
      title: t.service1Title,
      description: t.service1Desc,
      price: t.priceFromMo,
      ctaText: t.service1Cta,
      longDescription: lang === 'fi' 
        ? "Säännöllinen toimistosiivous takaa stressivapaan ja edustavan työtilan työntekijöillesi ja vierailijoillesi. Räätälöimme siivoussuunnitelman ja käyntitiheyden juuri teidän toimitilojenne tarpeisiin sopivaksi."
        : "Regular office cleaning ensures a stress-free and professional workspace for your employees and visitors. We customize the plan and visit frequency to perfectly match your company's operational rhythm.",
      tasks: lang === 'fi' ? [
        {
          category: "Työpisteet ja yhteiset tilat",
          items: [
            "Pöytien ja vapaiden työtasojen kosteapyyhintä pölystä ja jalanjäljistä",
            "Roskakorien tyhjennys, pussien vaihto ja roskien vienti jäteastiaan",
            "Kosketuspintojen (ovikahvat, valokatkaisijat, kaiteet) huolellinen desinfiointi",
            "Sormenjälkien pyyhintä lasiovista ja lasipaneeleista",
            "Toimistotuolien ja muiden kalusteiden kevyt puhdistus"
          ]
        },
        {
          category: "Lattiat ja pintamateriaalit",
          items: [
            "Kovien lattiapintojen imurointi ja nihkeä- tai kosteapyyhintä mikrokuitulaitteilla",
            "Kokolattiamattojen ja irtomattojen tehokas imurointi hiukkassuodattimella",
            "Lattialistojen, kaapinpäällysten ja muiden vapaiden pintojen säännöllinen nihkeäpyyhintä"
          ]
        },
        {
          category: "Keittiö ja taukopalvelut",
          items: [
            "Tiskipöytien, altaiden ja hanojen puhdistus ja kuivaus",
            "Työtasojen ja ruokailupöytien puhdistus ja desinfiointi",
            "Astianpesukoneen tyhjennys ja täyttö (sopimuksen mukaan)",
            "Laitteiden (mikroaaltouuni, kahvinkeittimet, jääkaappi) ulkopintojen pyyhintä"
          ]
        },
        {
          category: "Saniteettitilat (WC)",
          items: [
            "Käsienpesualtaiden, hanojen ja tasojen tehokas desinfiointi",
            "WC-istuinten perusteellinen pesu, desinfiointi ja kiillotus",
            "Peilien, seinälaattojen ja kosketuspintojen pyyhintä kirkkaaksi",
            "Käsipapereiden, WC-papereiden ja saippuoiden täydentäminen"
          ]
        }
      ] : [
        {
          category: "Workstations & Common Areas",
          items: [
            "Damp wiping desks and free workspaces to remove dust and smudges",
            "Emptying trash and recycling bins, replacing liners, and disposal to main containers",
            "Thorough disinfection of high-touch surfaces (door handles, light switches, banisters)",
            "Removing smudges and fingerprints from glass doors and partition panels",
            "Light dusting and cleaning of office chairs and general furniture"
          ]
        },
        {
          category: "Floors & Surfaces",
          items: [
            "Vacuuming and damp microfiber mopping of all hard-surface floors",
            "Deep vacuuming of carpets, rugs, and high-traffic mat zones using HEPA filter units",
            "Regular dusting of baseboards, windowsills, and cabinet tops"
          ]
        },
        {
          category: "Kitchen & Breakrooms",
          items: [
            "Cleaning, sanitizing, and polishing sinks, faucets, and countertops",
            "Sanitizing dining tables and food preparation surfaces",
            "Loading and running the dishwasher (as per customized agreements)",
            "Wiping exterior surfaces of microwaves, fridges, and coffee makers"
          ]
        },
        {
          category: "Sanitation & Restrooms",
          items: [
            "Disinfecting wastebasins, faucets, counters, and surrounding areas",
            "Thorough deep-cleaning, sanitization, and polishing of toilets",
            "Polishing mirrors, washing wall tiles, and cleaning main touchpoints",
            "Replenishing paper towels, hand soap, and toilet roll supplies"
          ]
        }
      ]
    },
    {
      id: "kertatilaus",
      mappedServiceId: "kertatilaus",
      icon: Sparkles,
      iconBg: "bg-[#E3E8FF] text-[#3B4CA8] group-hover:bg-[#C7D1FF]",
      title: t.service2Title,
      description: t.service2Desc,
      price: t.priceFromH,
      ctaText: t.service2Cta,
      longDescription: lang === 'fi' 
        ? "Tarvitsetko toimiston tehopuhdistuksen ilman jatkuvaa sopimusta? Kertatilaus on täydellinen ratkaisu sesonkiluonteiseen siivoukseen, juhlia edeltävään suursiivoukseen tai kun haluat kokeilla palvelumme laatua huolettomasti."
        : "Need a thorough office deep clean without a continuous contract? A one-time cleaning is the perfect on-demand solution for seasonal needs, event prep, or when you simply want to test our service quality risk-free.",
      tasks: lang === 'fi' ? [
        {
          category: "Standardi tehopuhdistus",
          items: [
            "Pölyjen pyyhintä kaikilta saavutettavilta pintamateriaaleilta ja tasoilta",
            "Valokatkaisijoiden, ovien ja yleisten tarttumapintojen nihkeäpyyhintä",
            "Roskakorien tyhjentäminen ja roskapussien vaihto"
          ]
        },
        {
          category: "Lattiat ja matot",
          items: [
            "Kaikkien lattiapintojen perusteellinen imurointi kulmia myöten",
            "Kovien lattioiden nihkeäpyyhintä raikkaalla ja ympäristöystävällisellä pesuaineella",
            "Mattojen tarkka imurointi"
          ]
        },
        {
          category: "Yleiset tilat & Saniteetti",
          items: [
            "Taukotilan keittiöaltaan, hanojen ja työtasojen puhdistus erikseen",
            "Saniteettitilojen (WC) perusteellinen desinfiointi, altaiden ja hanojen kiillotus",
            "Peilipintojen pyyhintä kirkkaaksi"
          ]
        }
      ] : [
        {
          category: "Standard Power Clean",
          items: [
            "Thorough dusting of all reachable surfaces, shelves, and cabinets",
            "Wiping light switches, doors, and general physical handle touchpoints",
            "Emptying waste bins and replacing trash bags"
          ]
        },
        {
          category: "Floor & Carpet Care",
          items: [
            "Comprehensive vacuuming of all floor areas, corners, and under-desk spaces",
            "Damp mopping of hard floor surfaces utilizing fresh, eco-friendly detergents",
            "Detailed vacuuming of main rugs and entrance mats"
          ]
        },
        {
          category: "Kitchen & Sanitaries",
          items: [
            "Cleaning and sanitizing breakroom counters, kitchen sinks, and faucets",
            "Thorough descaling, washing, and sanitizing of main restroom objects",
            "Wiping and polishing mirrors and metallic bathroom accessories"
          ]
        }
      ]
    },
    {
      id: "perussiivous",
      mappedServiceId: "perus_lahto",
      icon: Wand2,
      iconBg: "bg-[#FFF2D4] text-[#8A6316] group-hover:bg-[#FFE3AC]",
      title: t.service3Title,
      description: t.service3Desc,
      price: t.priceQuote,
      ctaText: t.service3Cta,
      longDescription: lang === 'fi' 
        ? "Kun toimisto siirtyy uuteen tilaan, tyhjentyy muuton takia tai vaatii perusteellista syväpuhdistusta. Perussiivous on tavanomaista ylläpitosiivousta huomattavasti syvempi ja raskaampi prosessi, joka palauttaa tilan uutuudenkiillon."
        : "When an office moves to a new location, is cleared out, or simply requires a heavy deep clean. Our transition cleaning is a significantly deeper, more intensive process than regular maintenance cleaning, restoring the space's original shine.",
      tasks: lang === 'fi' ? [
        {
          category: "Syväpuhdistus ja suuret pinnat",
          items: [
            "Ikkunoiden sisäpintojen ja välien pesu (ulkopinnat sovittaessa erikseen)",
            "Pattereiden, putkien, ilmanvaihtoventtiilien ulkopintojen tarkka pölynpoisto",
            "Lattialistojen, ovien, karmien ja valokatkaisijoiden pesu/pyyhintä",
            "Valaisimien pintapyyhintä ja kaikkien korkeiden tasojen pölynpyyhintä"
          ]
        },
        {
          category: "Keittiön ja kaappien syväpuhdistus",
          items: [
            "Keittiökaappien ja laatikostojen imurointi ja pyyhintä sisältä ja ulkoa",
            "Kylmälaitteiden (jääkaappi, pakastin) tyhjennys, sulatus ja sisäpesu",
            "Uunin, mikron ja astianpesukoneen pintojen ja sisäpuolien syväpuhdistus",
            "Laattaseinien ja työtasojen tehopuhdistus rasvasta ja pinttyneestä liasta"
          ]
        },
        {
          category: "Saniteetti- ja märkätilat",
          items: [
            "WC-tilojen perusteellinen kuuraus: laattojen, saumojen ja hanojen kalkinpoisto",
            "Käsienpesualtaiden, suihkujen (jos olemassa) ja WC-istuinten täydellinen desinfiointi",
            "Poistoilmaventtiilien puhdistus"
          ]
        },
        {
          category: "Lattiat tehopuhdistuksella",
          items: [
            "Lattiapintojen koneellinen tai käsin tehty tehopesu poistaen pinttyneen lian",
            "Lattiahankaushoidot ja syväimeytyneiden tahrojen poisto"
          ]
        }
      ] : [
        {
          category: "Deep Clean & Structural High Areas",
          items: [
            "Washing interior windows and frames (external windows wash upon request)",
            "Detailed dust removal from heaters, ventilation valves, and pipes",
            "Washing and sanitizing baseboards, doors, doorframes, and light switches",
            "Wiping general light fixtures and removing thick dust from high ledges"
          ]
        },
        {
          category: "Full Kitchen & Cabinets Restore",
          items: [
            "Emptying, vacuuming, and washing interior and exterior of all kitchen cabinets",
            "Defrosting, thoroughly cleaning, and sanitizing refrigerators and freezers",
            "Intense deep cleaning of ovens, microwaves, and dishwasher interior edges",
            "Scrubbing worktops, tiles, and backsplash elements to remove grease and stains"
          ]
        },
        {
          category: "Wet Rooms & Restrooms Descaling",
          items: [
            "Thorough scrubbing of restroom environments, including detailed scale stripping from tiles, joints, and taps",
            "Full sanitization and deep-cleaning of toilet seats, sinks, and showers (where applicable)",
            "Cleaning ventilation extractors"
          ]
        },
        {
          category: "Intense Floor Treatments",
          items: [
            "Advanced floor cleaning (machine scrub or hard manual scrub) to remove built-up dirt",
            "Stain removal treatments on high-traffic floor pathways"
          ]
        }
      ]
    },
    {
      id: "raataloity",
      mappedServiceId: "raataloity",
      icon: HeartHandshake,
      iconBg: "bg-[#E0F2F1] text-[#00695C] group-hover:bg-[#B2DFDB]",
      title: t.service4Title,
      description: t.service4Desc,
      price: t.priceQuote,
      ctaText: t.service4Cta,
      longDescription: lang === 'fi' 
        ? "Isommille liiketiloille, monitilaympäristöihin tai yrityksille, joilla on erityisiä hygieniavaatimuksia, useampia kohteita tai vaihtelevia aukioloaikoja. Luomme teille dedikoidun siivouskonseptin."
        : "For larger corporate facilities, co-working premises, or businesses with specialist sanitary criteria, multiple office branches, or customized shift hours. We build a totally dedicated commercial facilities plan.",
      tasks: lang === 'fi' ? [
        {
          category: "Räätälöidyt lisäpalvelut",
          items: [
            "Huonekasvien ja toimistovihreyden ammattimainen hoito ja kastelu",
            "Saniteetti- ja keittiötarvikkeiden (pesuaineet, paperit, saippuat) täyttöservice tarvittaessa",
            "Tekstiilihuonekalujen, neuvotteluhuoneiden tuolien ja sohvien painehuuhtelut",
            "Mattojen vaihtopalvelun koordinointi ja ylläpito"
          ]
        },
        {
          category: "Joustavat sopimusajat & Tiheys",
          items: [
            "Siivoukset aukioloaikojen ulkopuolella: aikaisin aamulla, myöhään illalla tai viikonloppuisin",
            "Päivittäiset ylläpitokäynnit kriittisissä tiloissa (vastaanotto, pääkokoustilat)",
            "Päivystävä siivousapu erityistilanteisiin (esim. vesiroiskeet, vahingot)"
          ]
        },
        {
          category: "Laadunvalvonta & Turvallisuus",
          items: [
            "Nimetty kohdevastaava ja säännölliset laadunvalvontakeskustelut",
            "Turvakoodien, hälyttimien ja lukitusjärjestelmien tarkka noudattaminen yrityksenne ohjeiden mukaan",
            "Yhdenmukainen, koulutettu siivoustiimi tutulla kokoonpanolla"
          ]
        }
      ] : [
        {
          category: "Tailored Facility Support",
          items: [
            "Professional care and regular watering of office green plants and bio-walls",
            "Full pantry and restroom inventory stocking service (napkins, hand towels, sanitizers)",
            "Pressure-wash vacuuming of fabric chairs, couches, and presentation rooms",
            "Facilitating and changing entrance safety carpets"
          ]
        },
        {
          category: "Flexible Scheduling & Operations",
          items: [
            "Cleanings strictly outside core hours: early mornings, evening shifts, or weekend visits",
            "Daily micro-visits for high-density areas (reception counters, main boardrooms)",
            "On-demand emergency response for spillages, plumbing leaks, or event aftermaths"
          ]
        },
        {
          category: "Quality Assurance & Custom Security Protocols",
          items: [
            "A dedicated facility contact supervisor and regular audit reports",
            "Rigid compliance with your company's security codes, lock-up lists, and alarm procedures",
            "A highly trained, consistent cleaning crew assigned strictly to your workspace premises"
          ]
        }
      ]
    }
  ];

  return (
    <>
      <section
        id="palvelut"
        role="region"
        aria-labelledby="palvelut-heading"
        className="bg-[#FAFAF7] py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E0E4DC]"
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
              {t.servicesBadge}
            </p>
            <h2
              id="palvelut-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4"
            >
              {t.servicesTitle}
            </h2>
            <p className="text-[#4A4A4A] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {t.servicesSub}
            </p>
          </motion.div>

          {/* Services Cards Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[960px] mx-auto">
            {servicesDetailed.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="group relative bg-white border border-[#E0E4DC] rounded-xl p-8 cursor-pointer flex flex-col justify-between"
                  role="button"
                  tabIndex={0}
                  aria-label={lang === 'fi' ? `Palvelu: ${service.title}. Avaa tarkemmat tiedot klikkaamalla.` : `Service: ${service.title}. Click to view detailed tasks.`}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedService(service);
                     }
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                  whileHover={{
                    y: [0, -8, 2, -8],
                    scale: 1.03,
                    borderColor: "#95C4A1",
                    boxShadow: "0 20px 45px rgba(27, 67, 50, 0.12)",
                    transition: {
                      y: {
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 3,
                        ease: "easeInOut",
                      },
                      scale: { duration: 0.3, ease: "easeOut" },
                      borderColor: { duration: 0.3 },
                      boxShadow: { duration: 0.3 }
                    }
                  }}
                >


                  <div>
                    {/* Icon Wrapper badge */}
                    <div 
                      className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-300 ${service.iconBg}`}
                    >
                      <IconComponent className="w-8 h-8 stroke-[1.5]" aria-hidden="true" />
                    </div>

                    {/* Service Metadata */}
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] mt-5 mb-3 leading-tight text-left">
                      {service.title}
                    </h3>
                    
                    <p className="text-[#4A4A4A] text-sm sm:text-base leading-relaxed mb-6 text-left">
                      {service.description}
                    </p>
                  </div>

                  {/* Card footer price and action */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#F2F4F0] mt-4">
                    <div className="text-sm font-bold text-[#1B4332]" aria-label="Hinta">
                      {service.price}
                    </div>
                    
                    {/* Subtle Link arrow appears smoothly on hover */}
                    <span 
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4332] group-hover:opacity-100 group-hover:translate-x-1 opacity-60 transition-all duration-300"
                    >
                      {service.ctaText}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Animated Detailed Service Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
            {/* Backdrop: Fade in absolute overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#0D2B1E]/65 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedService(null)}
              aria-hidden="true"
            />

            {/* Modal Body: Slide & Fade up Card dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white border border-[#E0E4DC] rounded-xl flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(13,43,30,0.3)] z-10 max-h-[90vh] sm:max-h-[85vh] text-[#1A1A1A] select-text"
            >
              {/* Header Section with Close trigger X button */}
              <div className="flex items-center justify-between px-6 py-5 sm:px-8 border-b border-[#F2F4F0] bg-[#FAFAF8]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedService.iconBg}`}>
                    {(() => {
                      const IconComp = selectedService.icon;
                      return <IconComp className="w-6 h-6 stroke-[1.8]" />;
                    })()}
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#95C4A1]">
                      {selectedService.price}
                    </span>
                    <h3 id="modal-title" className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] leading-tight">
                      {selectedService.title}
                    </h3>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedService(null)}
                  className="w-10 h-10 hover:bg-[#F2F4F0] active:scale-95 text-[#7A7A7A] hover:text-[#1A1A1A] rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none"
                  aria-label={lang === 'fi' ? 'Sulje ikkuna' : 'Close modal'}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Main Content Container */}
              <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 space-y-6 flex-1 text-left">
                {/* Introduction Paragraph */}
                <div className="space-y-2">
                  <p className="text-[#4A4A4A] text-sm sm:text-base leading-relaxed">
                    {selectedService.longDescription}
                  </p>
                </div>

                {/* Grid or List of Cleaning Task Categories */}
                <div className="space-y-6">
                  <div className="border-b border-[#F2F4F0] pb-3">
                    <h4 className="font-serif text-base sm:text-lg font-bold text-[#1B4332]">
                      {modalTranslations[lang].includedTitle}
                    </h4>
                    <p className="text-xs text-[#7A7A7A] mt-0.5">
                      {modalTranslations[lang].includedSub}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {selectedService.tasks.map((cat: any, catIndex: number) => (
                      <div key={catIndex} className="space-y-3">
                        <h5 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] border-l-2 border-[#95C4A1] pl-2">
                          {cat.category}
                        </h5>
                        <ul className="space-y-2">
                          {cat.items.map((item: string, itemIndex: number) => (
                            <li key={itemIndex} className="flex items-start text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                              <Check className="w-4 h-4 text-[#95C4A1] shrink-0 mr-2 mt-0.5" strokeWidth={3} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Footer Bar with CTA drives */}
              <div className="px-6 py-5 sm:px-8 border-t border-[#F2F4F0] bg-[#FAFAF8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm font-bold text-[#1B4332] text-center sm:text-left">
                  <span className="text-xs text-[#7A7A7A] font-normal block text-left">
                    {modalTranslations[lang].priceLabel}
                  </span>
                  {selectedService.price}
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="w-full sm:w-auto px-5 py-3 border border-[#E0E4DC] hover:border-[#1A1A1A] text-xs sm:text-sm font-bold text-[#4A4A4A] hover:text-[#1A1A1A] rounded-full transition-all duration-200 bg-white cursor-pointer hover:bg-[#F2F4F0] focus:outline-none"
                  >
                    {modalTranslations[lang].closeBtn}
                  </button>
                  
                  <button
                    onClick={() => {
                      // Perform Parent Hook setting
                      onSelectService?.(selectedService.mappedServiceId);
                      
                      // Close first
                      setSelectedService(null);
                      
                      // Trigger luxurious smooth easeOutQuart kinetic scroll to form
                      setTimeout(() => {
                        const varaus = document.getElementById("varaus");
                        if (varaus) {
                          const offsetTop = varaus.getBoundingClientRect().top + window.pageYOffset - 75; // header offset
                          const startPosition = window.pageYOffset;
                          const distance = offsetTop - startPosition;
                          const duration = 950;
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
                      }, 150); // small delay to guarantee smooth execution after modal exit
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-xs sm:text-sm font-bold text-white rounded-full transition-all duration-200 cursor-pointer shadow-md focus:outline-none"
                  >
                    {selectedService.mappedServiceId === 'raataloity' || selectedService.mappedServiceId === 'perus_lahto'
                      ? modalTranslations[lang].contactBtn
                      : modalTranslations[lang].bookBtn
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
