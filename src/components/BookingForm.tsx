import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Mail, Phone, MapPin, Lock, Loader2, ArrowRight } from 'lucide-react';
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
    if (!formData.notes.trim()) {
      newErrors.notes = t.requiredError;
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
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  
                  {/* Field 1: Name & Company */}
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                      {t.fieldContact}
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder={t.fieldContactPl}
                      className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors duration-200 outline-none ${
                        errors.contactName ? 'border-[#C0392B] focus:border-[#C0392B]' : 'border-[#E0E4DC] focus:border-[#1B4332]'
                      }`}
                      required
                    />
                    {errors.contactName && (
                      <p className="text-[#C0392B] text-xs mt-1.5 font-medium">{errors.contactName}</p>
                    )}
                  </div>

                  {/* Field 2: Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                      {t.fieldEmail}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.fieldEmailPl}
                      className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors duration-200 outline-none ${
                        errors.email ? 'border-[#C0392B] focus:border-[#C0392B]' : 'border-[#E0E4DC] focus:border-[#1B4332]'
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="text-[#C0392B] text-xs mt-1.5 font-medium">{errors.email}</p>
                    )}
                  </div>

                  {/* Field 3: What do you need */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-bold text-[#1A1A1A] mb-1.5">
                      {t.fieldNotes}
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder={t.fieldNotesPl}
                      className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors duration-200 outline-none resize-none ${
                        errors.notes ? 'border-[#C0392B] focus:border-[#C0392B]' : 'border-[#E0E4DC] focus:border-[#1B4332]'
                      }`}
                      required
                    />
                    {errors.notes && (
                      <p className="text-[#C0392B] text-xs mt-1.5 font-medium">{errors.notes}</p>
                    )}
                  </div>

                  {/* Privacy note warning */}
                  <div className="flex gap-2.5 items-start text-xs text-[#7A7A7A] mt-2">
                    <Lock className="w-4 h-4 text-[#95C4A1] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{t.privacyWarning}</span>
                  </div>

                  {/* Submit driving CTA */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#1B4332] text-white font-bold py-4 px-6 rounded-full transition-all duration-300 hover:bg-[#2D6A4F] focus:outline-none disabled:bg-[#7A7A7A] disabled:cursor-not-allowed cursor-pointer"
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

                  {/* Sandbox / Developer Notice block if email delivery bypassed */}
                  {emailStatus.provider === 'none' && (
                    <div className="my-6 p-4 bg-amber-50 border border-amber-200/80 rounded-xl text-left text-amber-900 text-xs leading-relaxed max-w-md shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-sm shrink-0">💡</span>
                        <div>
                          <p className="font-bold mb-0.5 text-amber-950">
                            Kehittäjän huomautus (Sähköposti ohitettiin)
                          </p>
                          <p className="opacity-90 text-[11px] leading-normal">
                            Tiedot tallennettiin paikallisesti järjestelmän hallintapaneeliin, mutta sähköpostia ei lähetetty, koska palvelun sähköpostitunnuksia (<strong>RESEND_API_KEY</strong> tai <strong>VITE_WEB3FORMS_ACCESS_KEY</strong>) ei ole määritetty tekoälystudion Settings -&gt; Secrets -valikossa.
                          </p>
                          <p className="mt-2 text-[10px] opacity-75 font-mono leading-normal">
                            Developer Note: To test actual email delivery in your own inbox, click the <strong>Settings</strong> gear icon on the top right, open <strong>Secrets (Environment Variables)</strong>, and configure a valid <strong>RESEND_API_KEY</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success banner if Resend API delivered successfully */}
                  {emailStatus.provider === 'resend' && emailStatus.sent && (
                    <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-emerald-950 text-xs leading-relaxed max-w-md shadow-xs">
                       <div className="flex items-start gap-2.5">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <div>
                          <p className="font-bold text-emerald-900">Sähköposti lähetetty onnistuneesti!</p>
                          <p className="opacity-95 text-[11px] mt-0.5 leading-normal">
                            Varaustiedot välitettiin reaaliajassa sähköpostitse Resend API-integraation kautta ylläpitäjälle.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sandbox Informational Explainer if some deliveries were skipped under a Sandbox Key */}
                  {emailStatus.provider === 'resend' && emailStatus.sent && emailStatus.partialFailure && (
                    <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-amber-950 text-xs leading-relaxed max-w-md shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-amber-600 font-bold shrink-0 text-sm">ℹ</span>
                        <div>
                          <p className="font-bold text-amber-900">
                            Resend Sandbox-huomautus (Lähetys onnistui osittain)
                          </p>
                          <p className="opacity-95 text-[11px] mt-0.5 leading-normal">
                            Sähköposti toimitettiin onnistuneesti ylläpitäjän sähköpostiin <strong>(info@puhdas-tila.com)</strong>! <br /><br />
                            Koska käytössä on ilmainen Resend-kokeilutili (Sandbox), automaattinen vahvistusviesti asiakkaan omaan sähköpostiin (<code>{formData.email}</code>) ohitettiin, sillä Resend sallii sandboxissa viestien lähetyksen vain vahvistetulle omistajalle.
                          </p>
                          <p className="mt-2.5 text-[10px] opacity-80 font-mono leading-normal border-t border-amber-200/50 pt-2">
                            <strong>Ratkaisu vapaaseen lähetykseen:</strong> Vahvista oma verkkotunnuksesi (domain) Resend-hallintapaneelissasi, niin automaattiset vahvistusviestit lähetetään myös asiakkaille!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error banner if Resend API failed */}
                  {emailStatus.provider === 'resend' && !emailStatus.sent && emailStatus.error && (
                    <div className="my-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-left text-rose-950 text-xs leading-relaxed max-w-md shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-rose-600 font-bold shrink-0 text-sm">⚠️</span>
                        <div>
                          <p className="font-bold text-rose-900">Sähköpostin lähetys epäonnistui / Email Delivery Failed</p>
                          <p className="opacity-95 text-[11px] mt-0.5 leading-normal">
                            Teillä on API-avain asetettuna, mutta taustapalvelimen Resend-integraatio palautti virheen:
                          </p>
                          <p className="font-mono bg-white p-2.5 rounded-lg mt-1.5 text-[10px] break-all border border-rose-100 text-rose-800 leading-normal">
                            <strong>Kuvaus: </strong>{emailStatus.error}
                          </p>
                          {emailStatus.diagnostics && (
                            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700">
                              <p className="font-bold text-slate-900 mb-0.5">Vianmääritys (Server Diagnostics):</p>
                              <ul className="list-disc list-inside space-y-0.5 font-sans leading-tight text-[10px]">
                                <li>API-avain havaittu: <code>{emailStatus.diagnostics.hasApiKey ? 'Kyllä (Yes)' : 'Ei (No)'}</code></li>
                                <li>Pituus (Length): <code>{emailStatus.diagnostics.apiKeyLength} merkkiä</code></li>
                                <li>Alku (Prefix): <code>{emailStatus.diagnostics.apiKeyPrefix}...</code></li>
                                <li>Yritetyt vastaanottajat: <code>{JSON.stringify(emailStatus.diagnostics.recipientsAttempted)}</code></li>
                              </ul>
                            </div>
                          )}
                          <p className="mt-3 text-[11px] text-rose-950 leading-normal opacity-95">
                            <strong>Miksi tämä tapahtuu? (Crucial Troubleshooting):</strong><br />
                            Resendin ilmaisella kokeilutilillä (Sandbox) voit lähettää sähköposteja <strong>ainoastaan omalle rekisteröintiosoitteellesi</strong> (eli <code>kennedy.nam@gmail.com</code>). <br /><br />
                            Jos yrität lähettää muihin osoitteisiin kuten <code>info@puhdas-tila.com</code> ilman domainin vahvistusta, Resend estää sen ja antaa virhekoodin 403.<br />
                            <em>Ratkaisu: Voit määrittää ylläpitäjän sähköpostisaldoksesi Resend-rekisteröintisähköpostisi, tai vahvistaa oman verkkotunnuksesi Resend-hallintatyökalussa!</em>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success banner if Web3Forms delivered successfully */}
                  {emailStatus.provider === 'web3forms' && (
                    <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-emerald-950 text-xs leading-relaxed max-w-md shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <div>
                          <p className="font-bold text-emerald-900">Sähköposti toimitettu!</p>
                          <p className="opacity-95 text-[11px] mt-0.5 leading-normal">
                            Tarjouspyyntö toimitettiin onnistuneesti Web3Forms API-avaimella määritettyyn sähköpostilaatikkoon.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
