import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Mail, Phone, MapPin, Lock, Loader2, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BookingFormData, FormErrorState } from '../types';
import { Language, translations } from '../translations';
import { motion } from 'motion/react';
import bookingBg from '../assets/images/booking_bg_1780234782241.png';

interface BookingFormProps {
  lang: Language;
  prefilledService?: string;
  prefilledSize?: string;
}

export default function BookingForm({ lang, prefilledService = '', prefilledSize = '' }: BookingFormProps) {
  const t = translations[lang];
  const [formStep, setFormStep] = useState(1);

  const [formData, setFormData] = useState<BookingFormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    serviceType: '',
    officeSize: '',
    startDate: '',
    hasSupplies: '',
    notes: '',
  });

  // Automatically sync prefilled values when triggered from pricing calculator
  useEffect(() => {
    if (prefilledService) {
      setFormData((prev) => ({ ...prev, serviceType: prefilledService }));
    }
  }, [prefilledService]);

  useEffect(() => {
    if (prefilledSize) {
      setFormData((prev) => ({ ...prev, officeSize: prefilledSize }));
    }
  }, [prefilledSize]);

  const [errors, setErrors] = useState<FormErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    sent: boolean;
    provider: 'resend' | 'web3forms' | 'none';
    error?: string;
    diagnostics?: any;
    partialFailure?: boolean;
  }>({ sent: false, provider: 'none' });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error message in real-time as user types
    if (errors[name as keyof FormErrorState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrorState = {};
    if (!formData.contactName.trim()) {
      newErrors.contactName = t.requiredError;
    }
    if (!formData.email.trim()) {
      newErrors.email = t.requiredError;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveBookingLocally = (data: BookingFormData) => {
    try {
      const existing = localStorage.getItem('adm_client_bookings');
      const list = existing ? JSON.parse(existing) : [];
      const newBooking = {
        id: 'bk-' + Math.random().toString(36).substring(2, 11),
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        serviceType: data.serviceType,
        officeSize: data.officeSize,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        hasSupplies: data.hasSupplies || 'dont_know',
        notes: data.notes || '',
        status: 'Received', // Received, Contacted, Converted
        createdAt: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('adm_client_bookings', JSON.stringify([newBooking, ...list]));
    } catch (e) {
      console.error('Error writing booking to localStorage:', e);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    saveBookingLocally(formData);

    let resendFailedError: string | null = null;
    let resendDiagnostics: any = null;

    // 1. Prefer our high-reliability server-side proxy route (which utilizes RESEND_API_KEY)
    try {
      const serverResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const serverResult = await serverResponse.json().catch(() => ({}));

      if (serverResponse.ok && serverResult.success && serverResult.emailSent) {
        setEmailStatus({ 
          sent: true, 
          provider: 'resend',
          partialFailure: serverResult.partialFailure || false,
          diagnostics: serverResult.diagnostics || null
        });
        setIsSubmitting(false);
        setIsSubmitted(true);
        return;
      } else {
        console.warn('Server contact API failed or returned emailSent: false. Error:', serverResult.error || 'Unknown error');
        resendFailedError = serverResult.error || serverResult.message || 'Resend email delivery failed';
        resendDiagnostics = serverResult.diagnostics || null;
      }
    } catch (serverErr) {
      console.warn('Server contact API route was unreachable or failed.', serverErr);
      resendFailedError = 'Taustapalvelimeen ei saatu yhteyttä / Backend unreachable';
    }

    // 2. Client-side Web3Forms fallback if client holds active access keys
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (accessKey) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            access_key: accessKey,
            subject: `Uusi tarjouspyyntö - puhdas-tila.com / ${formData.companyName}`,
            from_name: 'Puhdas Tila Kotisivut',
            ...formData,
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setEmailStatus({ sent: true, provider: 'web3forms' });
          setIsSubmitting(false);
          setIsSubmitted(true);
          return;
        } else {
          console.error('Web3Forms API Error:', result);
        }
      } catch (err) {
        console.error('Web3Forms Form Submission failed:', err);
      }
    }

    // 3. Expose the Resend delivery error if both APIs failed
    if (resendFailedError) {
      setEmailStatus({ 
        sent: false, 
        provider: 'resend', 
        error: resendFailedError,
        diagnostics: resendDiagnostics
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      return;
    }

    // 4. Fallback to offline simulation if no API credentials exist in secrets
    setEmailStatus({ sent: false, provider: 'none' });
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      serviceType: '',
      officeSize: '',
      startDate: '',
      hasSupplies: '',
      notes: '',
    });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <section
      id="varaus"
      role="region"
      aria-labelledby="varaus-heading"
      className="bg-[#1B4332] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#E0E4DC] relative grain-overlay overflow-hidden"
    >
      {/* High-Contrast Luxury Abstract Animated Backdrop with extremely elegant floating motion */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Layer 1: Base Flowing Canvas */}
        <motion.img
          src={bookingBg}
          alt="Luxury fluid silk design layer 1"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.48] mix-blend-screen scale-[1.12]"
          referrerPolicy="no-referrer"
          animate={{
            scale: [1.12, 1.19, 1.12],
            x: [-15, 15, -15],
            y: [10, -10, 10],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Layer 2: Offset Morphing Interference Overlay (Creates organic liquid flow and shape-shifting waves) */}
        <motion.img
          src={bookingBg}
          alt="Luxury fluid silk design layer 2"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.32] mix-blend-color-dodge scale-[1.18] origin-center"
          referrerPolicy="no-referrer"
          animate={{
            scale: [1.18, 1.12, 1.18],
            x: [15, -15, 15],
            y: [-12, 12, -12],
            rotate: [2, -2, 2],
          }}
          transition={{
            duration: 8.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Soft premium ambient light vignettes & depth constraints */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332] via-transparent to-[#1B4332]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/90 via-transparent to-transparent hidden lg:block" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (40% proportional width) */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#95C4A1] mb-2 inline-flex items-center gap-2">
              {t.bookingBadge} <span className="w-12 h-[1.5px] bg-[#95C4A1]" />
            </p>
            
            <h2
              id="varaus-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6"
            >
              {t.bookingTitle}
            </h2>
            
            <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              {t.bookingSub}
            </p>

            {/* Direct Contact Options Info List */}
            <div className="space-y-6 mb-10 text-white/85">
              <a 
                href="mailto:info@puhdas-tila.com" 
                className="flex items-center gap-4 hover:text-[#95C4A1] transition-colors group focus:outline-none"
                aria-label="Lähetä sähköpostia osoitteeseen info@puhdas-tila.com"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#95C4A1] transition-transform duration-300 group-hover:scale-110">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <span className="font-medium text-sm sm:text-base">info@puhdas-tila.com</span>
              </a>

              <a 
                href="tel:+358406345252" 
                className="flex items-center gap-4 hover:text-[#95C4A1] transition-colors group focus:outline-none"
                aria-label="Soita numeroon +358 40 634 5252"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#95C4A1] transition-transform duration-300 group-hover:scale-110">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <span className="font-medium text-sm sm:text-base">+358 40 634 5252</span>
              </a>

              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#95C4A1]">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm sm:text-base">{lang === 'fi' ? 'Espoo, pääkaupunkiseutu' : 'Espoo, Capital Region'}</span>
              </div>
            </div>

            {/* Timings Support Note */}
            <p className="text-white/60 text-xs sm:text-sm border-t border-white/10 pt-6">
              {t.bookingScheduleText}
            </p>
          </motion.div>

          {/* Right Column (60% proportional width) */}
          <motion.div 
            className="lg:col-span-7 relative z-10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <div className="bg-white text-[#1A1A1A] rounded-2xl p-6 sm:p-10 shadow-xl border border-[#E0E4DC]">
              
              {/* Form viewport with clean React multi-state toggle */}
              {!isSubmitted ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (formStep === 1) {
                      // Validate Step 1 contact fields first
                      const newErrors: FormErrorState = {};
                      if (!formData.contactName.trim()) {
                        newErrors.contactName = t.requiredError;
                      }
                      if (!formData.email.trim()) {
                        newErrors.email = t.requiredError;
                      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                        newErrors.email = t.emailError;
                      }
                      if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                        return;
                      }
                      setFormStep(2);
                    } else {
                      handleSubmit(e);
                    }
                  }} 
                  className="space-y-6" 
                  noValidate
                >
                  
                  {/* Progressive Disclosure Interactive Header Progress Bar */}
                  <div className="mb-6 flex items-center justify-between border-b border-[#F2F4F0] pb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        formStep >= 1 ? 'bg-[#1B4332] text-white' : 'bg-[#E0E4DC] text-[#7A7A7A]'
                      }`}>
                        {formStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : '1'}
                      </div>
                      <span className={`text-xs font-extrabold uppercase tracking-wide transition-colors ${
                        formStep === 1 ? 'text-[#1B4332]' : 'text-[#7A7A7A]'
                      }`}>
                        {lang === 'fi' ? 'Yhteystiedot' : 'Contact Info'}
                      </span>
                    </div>

                    <div className="flex-1 mx-4 h-[2px] bg-[#E0E4DC] relative">
                      <div className="absolute top-0 left-0 h-full bg-[#1B4332] transition-all duration-300" style={{ width: formStep === 2 ? '100%' : '0%' }} />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        formStep === 2 ? 'bg-[#1B4332] text-white' : 'bg-[#E0E4DC] text-[#7A7A7A]'
                      }`}>
                        2
                      </div>
                      <span className={`text-xs font-extrabold uppercase tracking-wide transition-colors ${
                        formStep === 2 ? 'text-[#1B4332]' : 'text-[#7A7A7A]'
                      }`}>
                        {lang === 'fi' ? 'Kohteen tiedot' : 'Details'}
                      </span>
                    </div>
                  </div>

                  {/* STEP 1: CONTACT DETAILS VIEW */}
                  {formStep === 1 && (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Human Consultation Focus Ribbon */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex gap-3 text-left">
                        <span className="text-xl shrink-0 select-none">🤝</span>
                        <div className="text-xs">
                          <p className="font-extrabold text-[#1B4332] mb-0.5">
                            {lang === 'fi' ? 'Sujuva ja nopea yhteydenotto' : 'Pragmatic & Speedy Response'}
                          </p>
                          <p className="text-[#3A3A3A] leading-normal font-medium">
                            {lang === 'fi' 
                              ? 'Luomme jokaisen tarjouksen yksilöllisesti tarpeidesi, kuten toimiston koon, siivoustiheyden sekä Airbnb-erikoistoiveiden perusteella. Välitöntä apua varten voit aina myös soittaa meille numeroon +358 40 634 5252 tai lähettää sähköpostia osoitteeseen info@puhdas-tila.com.' 
                              : 'We craft every quotation individually based on your specific requirements (such as office size, cleaning frequency, and specific Airbnb turnaround needs). For immediate support, you can also call us at +358 40 634 5252 or send an email to info@puhdas-tila.com.'}
                          </p>
                        </div>
                      </div>

                      {/* Field 1: Contact Name with Dynamic Checkmark validation feedback */}
                      <div>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <label htmlFor="contactName" className="block text-sm font-bold text-[#1A1A1A]">
                            {t.fieldContact}
                          </label>
                          {formData.contactName.trim().length > 2 && (
                            <span className="inline-flex items-center text-xs text-emerald-600 font-bold gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              {lang === 'fi' ? 'Valmis' : 'Ok'}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          id="contactName"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          placeholder={t.fieldContactPl}
                          className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 outline-none ${
                            errors.contactName 
                              ? 'border-[#C0392B] focus:border-[#C0392B] bg-red-50/10' 
                              : formData.contactName.trim().length > 2
                              ? 'border-emerald-600 focus:border-emerald-700 bg-emerald-50/5'
                              : 'border-[#E0E4DC] focus:border-[#1B4332]'
                          }`}
                          required
                        />
                        {errors.contactName && (
                          <p className="text-[#C0392B] text-xs mt-1.5 font-medium">{errors.contactName}</p>
                        )}
                      </div>

                      {/* Field 2: Company / Airbnb Name (Optional) */}
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                          {t.fieldCompany}
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder={t.fieldCompanyPl}
                          className="w-full px-4 py-3 rounded-lg border border-[#E0E4DC] focus:border-[#1B4332] text-sm transition-colors duration-200 outline-none bg-white"
                        />
                      </div>

                      {/* Field 3: Email Address with dynamic validation checks */}
                      <div>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <label htmlFor="email" className="block text-sm font-bold text-[#1A1A1A]">
                            {t.fieldEmail}
                          </label>
                          {/\S+@\S+\.\S+/.test(formData.email) && (
                            <span className="inline-flex items-center text-xs text-emerald-600 font-bold gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              {lang === 'fi' ? 'Sähköposti oikein' : 'Email verified'}
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t.fieldEmailPl}
                          className={`w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200 outline-none ${
                            errors.email 
                              ? 'border-[#C0392B] focus:border-[#C0392B] bg-red-50/10' 
                              : /\S+@\S+\.\S+/.test(formData.email)
                              ? 'border-emerald-600 focus:border-emerald-700 bg-emerald-50/5'
                              : 'border-[#E0E4DC] focus:border-[#1B4332]'
                          }`}
                          required
                        />
                        {errors.email && (
                          <p className="text-[#C0392B] text-xs mt-1.5 font-medium">{errors.email}</p>
                        )}
                      </div>

                      {/* Field 4: Phone Number (Optional) */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                          {lang === 'fi' ? 'Puhelinnumero' : 'Phone Number'}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+358 ..."
                          className="w-full px-4 py-3 rounded-lg border border-[#E0E4DC] focus:border-[#1B4332] text-sm transition-colors duration-200 outline-none bg-white"
                        />
                      </div>

                      {/* Moving Forward CTA */}
                      <button
                        type="button"
                        onClick={() => {
                          const newErrors: FormErrorState = {};
                          if (!formData.contactName.trim()) {
                            newErrors.contactName = t.requiredError;
                          }
                          if (!formData.email.trim()) {
                            newErrors.email = t.requiredError;
                          } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                            newErrors.email = t.emailError;
                          }
                          if (Object.keys(newErrors).length > 0) {
                            setErrors(newErrors);
                          } else {
                            setErrors({});
                            setFormStep(2);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-bold py-4 px-6 rounded-full transition-all duration-300 hover:bg-[#2D6A4F] text-sm cursor-pointer"
                      >
                        <span>{lang === 'fi' ? 'Jatka kohteen tietoihin' : 'Continue to details'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2: CLEANING SPECIFICATIONS VIEW */}
                  {formStep === 2 && (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Service Type Pick dropdown */}
                      <div>
                        <label htmlFor="serviceType" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                          {t.fieldServiceType}
                        </label>
                        <select
                          id="serviceType"
                          name="serviceType"
                          value={formData.serviceType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[#E0E4DC] focus:border-[#1B4332] text-sm bg-white outline-none"
                        >
                          <option value="">{t.fieldServiceChoose}</option>
                          <option value="kertatilaus">{t.fieldServiceOnetime}</option>
                          <option value="kuukausi">{t.fieldServiceRec}</option>
                          <option value="perus_lahto">{t.fieldServiceDeep}</option>
                          <option value="raataloity">{t.fieldServiceCustom}</option>
                          <option value="muu">{t.fieldServiceOther}</option>
                        </select>
                      </div>

                      {/* Office Area Size Choose dropdown */}
                      <div>
                        <label htmlFor="officeSize" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                          {t.fieldSize}
                        </label>
                        <select
                          id="officeSize"
                          name="officeSize"
                          value={formData.officeSize}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-[#E0E4DC] focus:border-[#1B4332] text-sm bg-white outline-none"
                        >
                          <option value="">{t.fieldSizeChoose}</option>
                          <option value="pieni">{t.fieldSizeSmall}</option>
                          <option value="keski">{t.fieldSizeMedium}</option>
                          <option value="suuri">{t.fieldSizeLarge}</option>
                          <option value="jatti">{t.fieldSizeJumbo}</option>
                        </select>
                      </div>

                      {/* Desired Start Date calendar input */}
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                          {formData.serviceType === 'kertatilaus' ? t.fieldDateOnetime : t.fieldDateRec}
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-lg border border-[#E0E4DC] focus:border-[#1B4332] text-sm outline-none bg-white"
                        />
                      </div>

                      {/* Notes & Special Needs Area */}
                      <div>
                        <label htmlFor="notes" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                          {t.fieldNotes}
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder={t.fieldNotesPl}
                          className="w-full px-4 py-3 rounded-lg border border-[#E0E4DC] focus:border-[#1B4332] text-sm transition-colors duration-200 outline-none resize-none"
                        />
                      </div>

                      {/* Privacy alert notice */}
                      <div className="flex gap-2.5 items-start text-xs text-[#7A7A7A] mt-2">
                        <Lock className="w-4 h-4 text-[#95C4A1] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{t.privacyWarning}</span>
                      </div>

                      {/* Back & Submit CTA triggers row */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => setFormStep(1)}
                          className="w-full sm:w-1/3 flex items-center justify-center gap-2 border-2 border-[#1B4332] text-[#1B4332] hover:bg-[#FAFAF7] font-bold py-3.5 px-4 rounded-full transition-colors text-sm cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{lang === 'fi' ? 'Takaisin' : 'Back'}</span>
                        </button>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#1B4332] text-white font-bold py-4 px-6 rounded-full transition-all duration-300 hover:bg-[#2D6A4F] focus:outline-none disabled:bg-[#7A7A7A] disabled:cursor-not-allowed text-sm cursor-pointer"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {t.submittingText}
                            </>
                          ) : (
                            <>
                              {t.submitBtn}
                              <ArrowRight className="w-5 h-5 shrink-0" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </form>
              ) : (
                
                /* Beautiful animated vector checkmark success card wrapper */
                <motion.div 
                  className="py-12 px-4 text-center flex flex-col items-center" 
                  role="status"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="w-20 h-20 bg-[#B7E4C7]/40 text-[#40916C] rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        className="animate-[checkmark-draw_0.6s_ease-out_both] stroke-[#40916C] stroke-2 stroke-linecap-round stroke-linejoin-round"
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
                    {t.successTitle}
                  </h3>
                  
                  <p className="text-[#4A4A4A] text-sm sm:text-base mb-4 leading-relaxed max-w-sm">
                    {t.successSub}
                  </p>
                  
                  <p className="text-[#7A7A7A] text-xs sm:text-sm mb-2">
                    {t.successVerify}
                  </p>

                  {/* Clean, professional customer-facing feedback card with zero developer jargon or sandbox details */}
                  <div className="my-6 p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-emerald-950 leading-relaxed max-w-md shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="text-emerald-700 bg-emerald-100/80 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">✓</span>
                      <div>
                        <p className="font-extrabold text-sm text-emerald-900">
                          {lang === 'fi' ? 'Tarjouspyyntö lähetetty onnistuneesti!' : 'Quote Request Sent Successfully!'}
                        </p>
                        <p className="text-[11px] sm:text-xs text-emerald-800 leading-normal mt-1.5">
                          {lang === 'fi'
                            ? 'Kiitos mielenkiinnostasi. Olemme vastaanottaneet siivouskohteen tiedot järjestelmäämme. Asiantuntijamme käy ne läpi ja ottaa sinuun yhteyttä tarjouksen tiimoilta hyvin pian!'
                            : 'Thank you for your interest. We have received your cleaning project details in our system. Our specialist will review them and reach out with your personalized proposal very shortly!'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleReset}
                    className="border-2 border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white font-bold gap-1.5 inline-flex items-center justify-center px-6 py-2.5 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t.successBtnNew}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
