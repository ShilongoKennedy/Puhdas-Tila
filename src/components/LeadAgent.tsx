import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Sparkles, Copy, Check, X, 
  MapPin, Globe, Mail, Phone, ExternalLink, HelpCircle, 
  RefreshCw, Cpu, ShieldCheck, KeyRound, LogOut, ChevronRight
} from 'lucide-react';
import { Language } from '../translations';

interface Lead {
  name: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  whyGoodLead: string;
  outreachEmailSubject: string;
  outreachEmailBody: string;
}

interface LeadResponse {
  leads: Lead[];
  searchSummary?: string;
  sources?: { title: string; uri: string }[];
  usedFallback?: boolean;
  fallbackReason?: string;
}

interface LeadAgentProps {
  lang: Language;
}

export default function LeadAgent({ lang }: LeadAgentProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [targetType, setTargetType] = useState('Hammasklinikat (Dental clinics)');
  const [customTarget, setCustomTarget] = useState('');
  const [location, setLocation] = useState('Espoo');
  const [customLocation, setCustomLocation] = useState('');
  const [leadLang, setLeadLang] = useState<'fi' | 'en'>(lang);
  
  // Custom B2B campaign filters and live-editing state
  const [tone, setTone] = useState<'professional' | 'casual' | 'savings'>('professional');
  const [offer, setOffer] = useState<'estimate' | 'discount' | 'bonus'>('estimate');
  const [officeSize, setOfficeSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [editableLeads, setEditableLeads] = useState<Lead[]>([]);

  // Espoo micro-local districts list for precise localized sales prospecting
  const espooDistricts = [
    { key: 'Keilaniemi', label_fi: 'Keilaniemi (Teknologia / Startup-keskus)', label_en: 'Keilaniemi (Tech & Startup Hub)' },
    { key: 'Otaniemi', label_fi: 'Otaniemi (Aalto-yliopisto / Alkuvaiheen yritykset)', label_en: 'Otaniemi (Aalto Uni / Early startups)' },
    { key: 'Tapiola', label_fi: 'Tapiola (Luovat toimistot / Konsultit)', label_en: 'Tapiola (Creative offices & Consultancies)' },
    { key: 'Leppävaara', label_fi: 'Leppävaara (IT-yritykset / Sellon alue)', label_en: 'Leppävaara (IT sector & Sello campus)' },
    { key: 'Matinkylä', label_fi: 'Matinkylä (Liikekeskukset / Pientoimistot)', label_en: 'Matinkylä (Business centers & Small offices)' },
    { key: 'Kera', label_fi: 'Kera & Mankkaa (Toimitilat & Palveluyritykset)', label_en: 'Kera & Mankkaa (Commercial spaces)' }
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [leadsData, setLeadsData] = useState<LeadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isFabVisible, setIsFabVisible] = useState(false);

  // Authentication states
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Inline model live-editing helper handlers
  const handleLeadSubjectChange = (idx: number, newSubject: string) => {
    setEditableLeads(prev => {
      const updated = [...prev];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], outreachEmailSubject: newSubject };
      }
      return updated;
    });
  };

  const handleLeadBodyChange = (idx: number, newBody: string) => {
    setEditableLeads(prev => {
      const updated = [...prev];
      if (updated[idx]) {
        updated[idx] = { ...updated[idx], outreachEmailBody: newBody };
      }
      return updated;
    });
  };

  // Security and admin detection hook
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasAdminQuery = params.get('admin') === 'true' || params.get('admin') === '1';
    const savedToken = localStorage.getItem('puhdas_tila_admin_token');

    // Load active credentials session if present
    if (savedToken) {
      setToken(savedToken);
    }

    // Set visibility state. Visible only if explicitly in admin mode url or already logged in
    if (hasAdminQuery || savedToken) {
      setIsAdmin(true);
      setIsFabVisible(true);
      
      // Auto open modal on active admin-directed visit to make it friendly
      if (hasAdminQuery && !savedToken) {
        setIsOpen(true);
      }
    } else {
      setIsAdmin(false);
      setIsFabVisible(false);
    }
  }, []);

  // Status message rotation to keep loading experience super alive and interesting
  useEffect(() => {
    if (!isLoading) return;
    
    const messages = [
      lang === 'fi' ? 'Valmistellaan verkkohakua...' : 'Preparing live web scans...',
      lang === 'fi' ? 'Skannataan reaaliaikaista Google-dataa yrityksistä...' : 'Scanning real-time Google business intelligence...',
      lang === 'fi' ? 'Suodatetaan aktiivisia toimistoja alueella...' : 'Filtering active office spaces in the area...',
      lang === 'fi' ? 'Analysoidaan kohteiden siivoustarpeita...' : 'Analyzing commercial footprint cleaning indicators...',
      lang === 'fi' ? 'Tuotetaan liidikohtaisia personoituja sähköpostiluonnoksia...' : 'Generating tailored B2B outreach email copies...',
      lang === 'fi' ? 'Viimeistellään ammattitason liidiraporttia...' : 'Putting final touches on qualified sales leads...'
    ];

    let index = 0;
    setStatusMessage(messages[0]);
    
    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      setStatusMessage(messages[index]);
    }, 3505);

    return () => clearInterval(timer);
  }, [isLoading, lang]);

  // Sync state language with context lang changes
  useEffect(() => {
    setLeadLang(lang);
  }, [lang]);

  // Secure API key login submission
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error(lang === 'fi' ? 'Väärä ylläpitäjän salasana.' : 'Invalid administrator passcode.');
      }

      const data = await response.json();
      localStorage.setItem('puhdas_tila_admin_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('puhdas_tila_admin_token');
    setToken(null);
    setIsOpen(false);
    setIsAdmin(false);
    setIsFabVisible(false);
    
    // Clear URL parameters to restore clean main application layout
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  };

  const handleGenerate = async () => {
    if (!token) return;
    setIsLoading(true);
    setLeadsData(null);
    setEditableLeads([]);
    setError(null);

    const finalTarget = customTarget.trim() ? customTarget : targetType;
    const finalLocation = customLocation.trim() ? customLocation : location;

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target: finalTarget,
          location: finalLocation,
          language: leadLang,
          tone,
          offer,
          officeSize
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Token got revoked or stale
          localStorage.removeItem('puhdas_tila_admin_token');
          setToken(null);
          throw new Error(lang === 'fi' ? 'Istunto vanhentunut. Kirjaudu sisään uudelleen.' : 'Session expired. Please log in again.');
        }
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to scan internet.');
      }

      const data: LeadResponse = await response.json();
      setLeadsData(data);
      if (data.leads) {
        setEditableLeads(data.leads);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Skip rendering altogether for unauthenticated general traffic!
  if (!isAdmin) {
    return null;
  }

  // Translations specifically for this Lead Agent dashboard
  const text = {
    fi: {
      fabBtn: 'Myyntihaku',
      title: '✦ Puhdas Tila · Kasvualusta & Liidibotti',
      subtitle: 'Skannaa internetin reaaliaikaista dataa ja löydä yritysasiakkaita pääkaupunkiseudulla varmistaaksesi Puhdas Tila -siivouspalveluiden tasaisen kasvun.',
      introPrompt: 'Minkä tyyppisiä toimitiloja haluat etsiä tänään?',
      targetLabel: 'Yrityskategoria / Toimiala',
      locationLabel: 'Sijainti / Kaupunginosa',
      langLabel: 'Sähköpostiluonnoksen kieli',
      btnScan: 'Skannaa internet & tuota liidit ✦',
      loaderHeadline: 'Skannaus käynnissä...',
      placeholderCustomTarget: 'Esim. lakitoimistot, kuntosalit...',
      placeholderCustomLoc: 'Esim. Tapiola, Ruoholahti...',
      sourcesHeader: 'Reaaliaikaiset lähteet ja viittaukset:',
      copied: 'Kopioitu leikepöydälle!',
      copyBtn: 'Kopioi sähköpostiluonnos',
      whyLeadTitle: '💡 Miksi erinomainen kohde Puhdas Tila -siivoukselle:',
      emailSubjectLabel: 'Aihe:',
      noResults: 'Ei tuloksia. Kokeile muuttaa hakuehtoja.',
      recentBadge: 'REAALIAIKAINEN GROUNDING LIVE-HAKU',
      backBtn: 'Takaisin hakuun',
      resultsTitle: 'Löytyneet liidit kohteelle',
      credits: 'Toimii Gemini-teknologialla haku-varmennuksella.',
      
      // New filters FI translations
      toneLabel: 'Myyntisävy ja lähestymistapa',
      toneProfessional: 'Asiallinen & Ammattimainen',
      toneCasual: 'Rento & Ketterä (Startupeille)',
      toneSavings: 'Säästöt & Ei sitovaa sopimusta',
      
      sizeLabel: 'Arvioitu työtilojen koko',
      sizeSmall: 'Pieni toimisto (alle 15 pöytää)',
      sizeMedium: 'Keskikokoinen (15-50 pöytää)',
      sizeLarge: 'Suuri tai Pääkonttori (>50 pöytää)',
      
      offerLabel: 'Ehdotettu yhteydenottotarjous',
      offerEstimate: 'Maksuton 3 minuutin katselmus paikan päällä',
      offerDiscount: '15 % alennus ensimmäisestä kuukaudesta',
      offerBonus: 'Ilmainen ikkunanpesu ensimmäisen siivouksen ohessa',

      editHeadline: 'Sähkopostiluonnos (Klikkaa ja muokkaa suoraan):',
      
      // Admin specific translations
      adminAuthTitle: 'Ylläpidon tunnistautuminen',
      adminAuthSubtitle: 'Tämä työkalu on suojattu yrityksen sisäistä käyttöä varten siivousliidien hakuun. Syötä sovelluksen ylläpitäjän salasana jatkaaksesi.',
      passwordPlaceholder: 'Syötä salasana...',
      btnAuth: 'Kirjaudu & valtuuta ✦',
      authProgress: 'Valtuutetaan...',
      authSuccess: 'Valtuutus onnistui!',
      authFail: 'Väärä salasana, yritä uudelleen.',
      signOut: 'Kirjaudu ulos'
    },
    en: {
      fabBtn: 'Lead Finder',
      title: '✦ Puhdas Tila · Inside B2B Sales Agent',
      subtitle: 'Identify and qualify fresh hyper-local commercial office cleaning leads dynamically using active search grounding metrics.',
      introPrompt: 'What kind of business footprints are we targeting today?',
      targetLabel: 'Industry or Footprint Category',
      locationLabel: 'Location or Suburb',
      langLabel: 'Email drafting language',
      btnScan: 'Scan Internet & Qualify Leads ✦',
      loaderHeadline: 'Scanning live web indexes...',
      placeholderCustomTarget: 'e.g. law offices, gym studios...',
      placeholderCustomLoc: 'e.g. Tapiola, Ruoholahti...',
      sourcesHeader: 'Live verified references:',
      copied: 'Copied to clipboard!',
      copyBtn: 'Copy outreach email draft',
      whyLeadTitle: '💡 Cleaning Needs Analysis:',
      emailSubjectLabel: 'Subject:',
      noResults: 'No leads found. Try refitting search params.',
      recentBadge: 'REAL-TIME GROUNDING LIVE-SCAN',
      backBtn: 'Back to Search',
      resultsTitle: 'Targeted accounts matching',
      credits: 'Powered by Gemini with active Google Search Grounding.',

      // New filters EN translations
      toneLabel: 'Outreach Tone / Pitch Approach',
      toneProfessional: 'Professional & Corporate',
      toneCasual: 'Casual & Approachable (Startups)',
      toneSavings: 'Flexibility & Cleaning Savings',
      
      sizeLabel: 'Arvioitu Workspace Size Class',
      sizeSmall: 'Small workspace (<15 workstations)',
      sizeMedium: 'Medium workspace (15-50 workstations)',
      sizeLarge: 'Large facility / HQ (>50 workstations)',
      
      offerLabel: 'Proposed Campaign Offer Hook',
      offerEstimate: 'Free, quick 3-minute physical estimate',
      offerDiscount: '15% discount on the first month',
      offerBonus: 'Complimentary window washing signature bonus',

      editHeadline: 'Outreach Mail Template (Click & edit live):',
 
      // Admin specific translations
      adminAuthTitle: 'Internal Growth Authentication',
      adminAuthSubtitle: 'This professional prospecting panel is restricted for internal sales operations. Enter your passcode to unlock.',
      passwordPlaceholder: 'Enter security password...',
      btnAuth: 'Login & Authenticate ✦',
      authProgress: 'Authorizing session...',
      authSuccess: 'Access granted!',
      authFail: 'Invalid password. Try again.',
      signOut: 'Logout session'
    }
  }[lang];

  return (
    <>
      {/* Floating Action Button (FAB) - Screen indicator visible ONLY in admin mode */}
      {isFabVisible && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9990] bg-[#1B4332] text-white hover:bg-[#2D6A4F] px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-sm border-2 border-[#95C4A1]/40 transition-all duration-300 hover:scale-105"
          id="lead-agent-fab"
        >
          <Cpu className="w-4 h-4 text-[#95C4A1]" />
          <span>{text.fabBtn}</span>
        </button>
      )}

      {/* Main Fullscreen Dashboard Backdrop Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0F1E19]/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 sm:p-6"
          id="lead-agent-overlay"
        >
          <div 
            className="bg-[#FAFAF7] w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl border border-[#E0E4DC] flex flex-col overflow-hidden max-h-[850px]"
            id="lead-agent-dashboard"
          >
            {/* Modal Header Bar with Emerald Branding */}
            <div className="bg-[#1B4332] text-white px-6 py-4 flex items-center justify-between border-b border-[#2D6A4F]">
              <div className="flex items-center gap-3">
                <div className="bg-[#2D6A4F] p-2 rounded-lg text-[#95C4A1]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg sm:text-xl tracking-tight leading-none text-white">{text.title}</h2>
                  <p className="text-xs text-[#95C4A1] mt-1 hidden sm:block font-medium">{text.credits}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {token && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F] text-[#EBF2EE] hover:bg-red-900 hover:text-white rounded-lg text-xs font-semibold border border-transparent transition-all cursor-pointer"
                    title={text.signOut}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{text.signOut}</span>
                  </button>
                )}
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/85 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal scrollable area */}
            <div className="flex-1 overflow-y-auto px-6 py-6" id="lead-agent-body">
              
              {/* STAGE A: Authentication Passcode Gate */}
              {!token ? (
                <div className="h-full flex flex-col items-center justify-center py-12 max-w-md mx-auto text-center" id="lead-agent-gate">
                  <div className="bg-[#EBF2EE] p-4 rounded-full text-[#1B4332] mb-6 border border-[#95C4A1]/40">
                    <KeyRound className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1B4332] tracking-tight">{text.adminAuthTitle}</h3>
                  <p className="text-sm text-[#5C6F63] mt-2 mb-6">
                    {text.adminAuthSubtitle}
                  </p>

                  <form onSubmit={handleAuth} className="w-full space-y-4">
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={text.passwordPlaceholder}
                        disabled={isAuthenticating}
                        className="w-full text-center tracking-widest text-base font-semibold bg-white border border-[#D1D8D2] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#95C4A1] focus:border-[#1B4332]"
                        autoFocus
                      />
                    </div>

                    {authError && (
                      <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
                        {authError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-3 px-6 rounded-lg text-sm tracking-wide shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                    >
                      {isAuthenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{text.authProgress}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#95C4A1]" />
                          <span>{text.btnAuth}</span>
                        </>
                      )}
                    </button>
                  </form>
                  
                  <div className="mt-8 text-[11px] text-[#8A9C91] max-w-xs font-semibold">
                    {lang === 'fi' 
                      ? 'Huom: Syötä ylläpitosalasana, jonka määritit environment-paneelissa.'
                      : 'Note: Provide the secure applet passcode specified in your settings panel.'}
                  </div>
                </div>
              ) : (
                /* STAGE B: Verified Lead Panel Workspace */
                <>
                  {/* Scenario B1: Scanning Lead Loader */}
                  {isLoading && (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-[#E2E8F0] border-t-[#1B4332] animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-[#1B4332]">
                          <Search className="w-7 h-7" />
                        </div>
                      </div>
                      <h3 className="font-bold text-xl text-[#1B4332] tracking-tight">{text.loaderHeadline}</h3>
                      <div className="mt-3 text-sm text-[#5C6F63] font-medium bg-[#EBF2EE] px-4 py-2 rounded-full border border-[#D5E4DB] max-w-sm mx-auto shadow-sm animate-pulse">
                        {statusMessage}
                      </div>
                      <p className="text-xs text-[#8A9C91] mt-8 max-w-xs">
                        {lang === 'fi' ? 'Haku kestää noin 10-15 sekuntia, sillä suoritamme reaaliaikaisia kyselyitä internetistä.' : 'Taking roughly 10-15 seconds to fetch live active references.'}
                      </p>
                    </div>
                  )}

                  {/* Scenario B2: Lead Search Creation Panel */}
                  {!isLoading && !leadsData && !error && (
                    <div className="space-y-6">
                      <div className="bg-white p-5 rounded-xl border border-[#E0E4DC] max-w-3xl mx-auto shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="text-[#1B4332] bg-[#EBF2EE] p-2.5 rounded-lg shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#1B4332] text-base">{lang === 'fi' ? 'Tehokas B2B-liidibotti siivouspalveluiden myyntiin' : 'Hyper-Targeted B2B Commercial Prospecting Agent'}</h3>
                            <p className="text-sm text-[#5C6F63] mt-1">{text.subtitle}</p>
                          </div>
                        </div>
                      </div>

                      <div className="max-w-xl mx-auto space-y-5 bg-white p-6 sm:p-8 rounded-xl border border-[#E0E4DC] shadow-sm">
                        {/* Industry Category select field */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-2">{text.targetLabel}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            {[
                              'Hammasklinikat (Dental clinics)',
                              'Lakiasiaintoimistot (Law groups)',
                              'Aloittavat yritykset & Pientoimistot (Startups & small offices)',
                              'Teknologiastartupit (Tech startups)',
                              'Luovat studiot & Pelitalot (Creative studios & game devs)',
                              'Kuntosalit & Liikuntatilat (Gyms & fitness)'
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  setTargetType(preset);
                                  setCustomTarget('');
                                }}
                                className={`px-3 py-2.5 rounded-lg border text-left text-xs font-semibold leading-relaxed transition-all ${
                                  targetType === preset && !customTarget
                                    ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                                    : 'bg-[#FAFAF7] hover:bg-[#F2F4F0] text-[#1A1A1A] border-[#D1D8D2]'
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={customTarget}
                            onChange={(e) => setCustomTarget(e.target.value)}
                            placeholder={text.placeholderCustomTarget}
                            className="w-full text-sm bg-[#FAFAF7] border border-[#D1D8D2] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#95C4A1] focus:border-[#1B4332]"
                          />
                        </div>

                        {/* Location geography target */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-2">{text.locationLabel}</label>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {['Espoo', 'Helsinki', 'Vantaa'].map((city) => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setLocation(city);
                                  setCustomLocation('');
                                }}
                                className={`px-3 py-2 rounded-lg border text-center text-xs font-bold tracking-wide transition-all ${
                                  location === city && !customLocation
                                    ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                                    : 'bg-[#FAFAF7] hover:bg-[#F2F4F0] text-[#1A1A1A] border-[#D1D8D2]'
                                }`}
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={customLocation}
                            onChange={(e) => setCustomLocation(e.target.value)}
                            placeholder={text.placeholderCustomLoc}
                            className="w-full text-sm bg-[#FAFAF7] border border-[#D1D8D2] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#95C4A1] focus:border-[#1B4332]"
                          />
                          
                          {location === 'Espoo' && (
                            <div className="mt-3 bg-[#EBF2EE] p-4 rounded-xl border border-[#D5E4DB] space-y-2 text-left">
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#1B4332] flex items-center gap-1.5 justify-start">
                                <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                                {lang === 'fi' ? 'Tarkenna Espoon kaupunginosaa / startup-keskittymää:' : 'Refine local Espoo district / startup hub:'}
                              </span>
                              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                                {espooDistricts.map((d) => {
                                  const isSelected = customLocation === `${d.key}, Espoo`;
                                  return (
                                    <button
                                      key={d.key}
                                      type="button"
                                      onClick={() => setCustomLocation(`${d.key}, Espoo`)}
                                      className={`px-3 py-2 rounded-lg border text-left text-xs font-semibold leading-relaxed transition-all flex items-center justify-between ${
                                        isSelected
                                          ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                                          : 'bg-white hover:bg-[#F2F4F0] text-[#1D3526] border-[#D1D8D2]'
                                      }`}
                                    >
                                      <span>{lang === 'fi' ? d.label_fi : d.label_en}</span>
                                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#95C4A1]' : 'opacity-40'}`} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Output writing language */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-2">{text.langLabel}</label>
                          <div className="flex gap-2">
                            {[
                              { key: 'fi', label: 'Suomi (Finnish)' },
                              { key: 'en', label: 'Englanti (English)' }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setLeadLang(opt.key as 'fi' | 'en')}
                                className={`flex-1 px-3 py-2 rounded-lg border text-center text-xs font-bold transition-all ${
                                  leadLang === opt.key
                                    ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                                    : 'bg-[#FAFAF7] hover:bg-[#F2F4F0] text-[#1A1A1A] border-[#D1D8D2]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom campaign parameters: Tone Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-2">
                            {text.toneLabel}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { key: 'professional', label: text.toneProfessional },
                              { key: 'casual', label: text.toneCasual },
                              { key: 'savings', label: text.toneSavings }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setTone(opt.key as any)}
                                className={`px-2.5 py-2.5 rounded-lg border text-center text-xs font-semibold leading-relaxed transition-all ${
                                  tone === opt.key
                                    ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                                    : 'bg-[#FAFAF7] hover:bg-[#F2F4F0] text-[#1A1A1A] border-[#D1D8D2]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom campaign parameters: Workspace context Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-2">
                            {text.sizeLabel}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { key: 'small', label: text.sizeSmall },
                              { key: 'medium', label: text.sizeMedium },
                              { key: 'large', label: text.sizeLarge }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setOfficeSize(opt.key as any)}
                                className={`px-2.5 py-2.5 rounded-lg border text-center text-xs font-semibold leading-relaxed transition-all ${
                                  officeSize === opt.key
                                    ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                                    : 'bg-[#FAFAF7] hover:bg-[#F2F4F0] text-[#1A1A1A] border-[#D1D8D2]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom campaign parameters: Lead Offer Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-2">
                            {text.offerLabel}
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { key: 'estimate', label: text.offerEstimate },
                              { key: 'discount', label: text.offerDiscount },
                              { key: 'bonus', label: text.offerBonus }
                            ].map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => setOffer(opt.key as any)}
                                className={`px-3 py-2.5 rounded-lg border text-left text-xs font-semibold leading-relaxed transition-all flex items-center justify-between ${
                                  offer === opt.key
                                    ? 'bg-[#1B4332] border-[#1B4332] text-white shadow-sm'
                                    : 'bg-[#FAFAF7] hover:bg-[#F2F4F0] text-[#1A1A1A] border-[#D1D8D2]'
                                }`}
                              >
                                <span>{opt.label}</span>
                                {offer === opt.key && <Sparkles className="w-3.5 h-3.5 text-[#95C4A1]" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Submit crawler triggers */}
                        <button
                          type="button"
                          onClick={handleGenerate}
                          className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold py-3.5 px-6 rounded-lg text-sm tracking-wide shadow-lg border-2 border-transparent transition-all flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.01] cursor-pointer"
                        >
                          <Sparkles className="w-5 h-5 text-[#95C4A1]" />
                          <span>{text.btnScan}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scenario B3: Grounded Lead List Result View */}
                  {!isLoading && leadsData && (
                    <div className="space-y-6">
                      {/* Summary statistics */}
                      <div className="bg-white rounded-xl border border-[#E0E4DC] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#EBF2EE] text-[#1B4332] border border-[#95C4A1]/30">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{text.recentBadge}</span>
                          </div>
                          <h3 className="font-bold text-lg text-[#1B4332] mt-2 tracking-tight">
                            {text.resultsTitle}: <span className="text-[#3E7D5F] font-semibold">{customTarget.trim() ? customTarget : targetType}</span> — {customLocation.trim() ? customLocation : location}
                          </h3>
                          {leadsData.searchSummary && (
                            <p className="text-xs text-[#5C6F63] mt-1 font-medium italic">
                              "{leadsData.searchSummary}"
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => setLeadsData(null)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D1D8D2] text-[#1B4332] hover:bg-[#F2F4F0] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{text.backBtn}</span>
                        </button>
                      </div>

                      {/* Fallback Warning Alert Banner */}
                      {leadsData.usedFallback && (
                        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 flex gap-3 text-[#78350F] text-sm shadow-sm">
                          <Cpu className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">
                              {lang === 'fi' 
                                ? 'Huomautus: Live-hakukiintiö saavutettu testiympäristössä' 
                                : 'Note: Live search quota reached in demo environment'}
                            </p>
                            <p className="text-xs text-[#92400E] mt-1 leading-relaxed">
                              {lang === 'fi' 
                                ? 'Google Live Search -kiintiöraja on täyttynyt tässä testiympäristössä. Työnkulun turvaamiseksi tekoäly tuotti automaattisesti korkealaatuisia, realistisia kohde-toimialan esimerkkejä ja tarjousmalleja keskeytyksettä.' 
                                : 'The Google Live Search grounding quota limits have been reached in this demo environment. To prevent interruption, the AI has automatically generated high-fidelity, realistic prospective leads and outreach templates for you.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Leads map looping */}
                      {editableLeads && editableLeads.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                          {editableLeads.map((lead, idx) => (
                            <div 
                              key={idx} 
                              className="bg-white rounded-xl border border-[#E0E4DC] overflow-hidden shadow-sm flex flex-col lg:flex-row hover:border-[#95C4A1] transition-all"
                            >
                              {/* Left details panel */}
                              <div className="p-6 lg:w-5/12 border-b lg:border-b-0 lg:border-r border-[#E0E4DC] bg-[#FAFAF7]/50 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-bold text-lg text-[#1B4332] tracking-tight">{lead.name}</h4>
                                    <span className="bg-[#1B4332]/10 text-[#1B4332] rounded px-2 py-0.5 text-xs font-extrabold">
                                      #{idx + 1} Lead
                                    </span>
                                  </div>
 
                                  <div className="mt-4 space-y-2">
                                    {lead.address && (
                                      <div className="flex items-center gap-2 text-xs text-[#5C6F63]">
                                        <MapPin className="w-4 h-4 text-[#95C4A1] shrink-0" />
                                        <span>{lead.address}</span>
                                      </div>
                                    )}
                                    {lead.website && (
                                      <div className="flex items-center gap-2 text-xs">
                                        <Globe className="w-4 h-4 text-[#95C4A1] shrink-0" />
                                        <a 
                                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                                          target="_blank" 
                                          rel="noreferrer referrer" 
                                          className="text-[#1B4332] font-semibold hover:underline flex items-center gap-1 focus:outline-none"
                                        >
                                          <span>{lead.website.replace(/^(https?:\/\/)?(www\.)?/, '')}</span>
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      </div>
                                    )}
                                    {(lead.email || lead.phone) && (
                                      <div className="pt-2 border-t border-[#E8ECE7] mt-2 space-y-1.5">
                                        {lead.email && (
                                          <div className="flex items-center gap-2 text-xs text-[#1B4332] font-semibold">
                                            <Mail className="w-3.5 h-3.5 text-[#95C4A1] shrink-0" />
                                            <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                                          </div>
                                        )}
                                        {lead.phone && (
                                          <div className="flex items-center gap-2 text-xs text-[#1B4332] font-semibold">
                                            <Phone className="w-3.5 h-3.5 text-[#95C4A1] shrink-0" />
                                            <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
 
                                  <div className="mt-5 bg-white p-4 rounded-lg border border-[#E0E4DC]">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#5C6F63] flex items-center gap-1.5">
                                      <span>{text.whyLeadTitle}</span>
                                    </h5>
                                    <p className="text-xs mt-2 text-[#2D3A32] leading-relaxed">
                                      {lead.whyGoodLead}
                                    </p>
                                  </div>
                                </div>
                              </div>
 
                              {/* Right copywriting action panel */}
                              <div className="p-6 lg:w-7/12 flex flex-col justify-between bg-white text-sm">
                                <div>
                                  <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE7] mb-4">
                                    <span className="text-xs font-bold text-[#5C6F63] uppercase tracking-wider">
                                      {lang === 'fi' ? 'Personosidun sähköpostin muokkaus' : 'Interactive Email Copywriting Draft'}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(`Subject: ${lead.outreachEmailSubject}\n\n${lead.outreachEmailBody}`, idx)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                        copiedIndex === idx
                                          ? 'bg-[#EBF2EE] text-[#1B4332] border-[#95C4A1]'
                                          : 'bg-white hover:bg-[#FAFAF7] text-[#1B4332] border-[#D1D8D2]'
                                      } cursor-pointer`}
                                    >
                                      {copiedIndex === idx ? (
                                        <>
                                          <Check className="w-3.5 h-3.5" />
                                          <span>{text.copied}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>{text.copyBtn}</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
 
                                  <div className="bg-[#FAFAF7] rounded-lg p-4 text-xs border border-[#E0E4DC] leading-relaxed text-[#1A1A1A] space-y-4">
                                    <div className="text-[10px] font-bold text-[#2D6A4F] flex items-center gap-1 uppercase tracking-wide">
                                      <Sparkles className="w-3 h-3 text-[#3E7D5F]" />
                                      <span>{text.editHeadline}</span>
                                    </div>
                                    
                                    {/* Subject Edit Field */}
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-bold text-[#5C6F63] uppercase tracking-wider">
                                        {lang === 'fi' ? 'Sähköpostin Aiherivi (Subject)' : 'Email Subject Line'}
                                      </label>
                                      <input 
                                        type="text" 
                                        value={lead.outreachEmailSubject || ''} 
                                        onChange={(e) => handleLeadSubjectChange(idx, e.target.value)}
                                        className="w-full font-sans font-bold text-xs text-[#1B4332] bg-white border border-[#D1D8D2] rounded px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#95C4A1]/40 focus:border-[#1B4332]"
                                      />
                                    </div>

                                    {/* Body Textarea, resizable with custom rows */}
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-bold text-[#5C6F63] uppercase tracking-wider">
                                        {lang === 'fi' ? 'Sähköpostin Viestiosa (Body)' : 'Email Body message'}
                                      </label>
                                      <textarea 
                                        value={lead.outreachEmailBody || ''} 
                                        onChange={(e) => handleLeadBodyChange(idx, e.target.value)}
                                        rows={11}
                                        className="w-full font-sans text-xs text-[#2D3A32] bg-white border border-[#D1D8D2] rounded p-3 focus:outline-none focus:ring-2 focus:ring-[#95C4A1]/40 focus:border-[#1B4332] resize-y leading-relaxed"
                                      />
                                    </div>
                                  </div>
                                </div>
 
                                <div className="text-[11px] text-[#8A9C91] mt-4 italic font-medium">
                                  {lang === 'fi' 
                                    ? '* Vinkki: Klikkaa luonnostekstiä vapaaseen hienosäätöön, sitten kopioi leikepöydälle yhdellä napsautuksella yrityssähköposteja varten.'
                                    : '* Hook Tip: Feel free to click directly inside the template block to tweak or refine names, then hit copy to grab your personalized copy.'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white p-12 text-center rounded-xl border border-[#E0E4DC]">
                          <HelpCircle className="w-12 h-12 text-[#95C4A1] mx-auto mb-3" />
                          <p className="text-[#5C6F63]">{text.noResults}</p>
                        </div>
                      )}

                      {/* Display live grounding citations */}
                      {leadsData.sources && leadsData.sources.length > 0 && (
                        <div className="bg-white p-5 rounded-xl border border-[#E0E4DC] shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6F63] mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#95C4A1]" />
                            <span>{text.sourcesHeader}</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {leadsData.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noreferrer referrer"
                                className="inline-flex items-center gap-1.5 text-[11px] bg-[#EBF2EE] text-[#1B4332] px-3 py-1.5 rounded-full border border-[#95C4A1]/20 hover:bg-[#D5E6DC] transition-colors focus:outline-none font-semibold"
                                title={src.title}
                              >
                                <span className="max-w-[180px] truncate">{src.title}</span>
                                <ExternalLink className="w-3 h-3 text-[#95C4A1]" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scenario B4: Search Error feedback rendering */}
                  {error && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center max-w-lg mx-auto py-10" id="lead-agent-error">
                      <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-800 font-bold mb-1">{lang === 'fi' ? 'Skannaus keskeytyi virheellisesti' : 'Scan failed to complete'}</p>
                      <p className="text-sm text-red-600 mb-6 font-medium">{error}</p>
                      
                      <div className="flex gap-2 justify-center font-bold text-xs">
                        <button
                          onClick={handleGenerate}
                          className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white py-2.5 px-5 rounded-lg transition-all cursor-pointer"
                        >
                          {lang === 'fi' ? 'Yritä uudelleen' : 'Retry Scanning'}
                        </button>
                        <button
                          onClick={() => {
                            setError(null);
                            setLeadsData(null);
                          }}
                          className="bg-white border border-red-300 hover:bg-red-50 text-red-800 py-2.5 px-5 rounded-lg transition-all cursor-pointer"
                        >
                          {text.backBtn}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
            
            {/* Modal Bottom Footer bar */}
            <div className="bg-[#F2F4F0] px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-[#E0E4DC] text-xs text-[#5C6F63] font-medium gap-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3E7D5F]" />
                <span>{lang === 'fi' ? 'Puhdas Tila on turvallinen, GDPR-yhteensopiva hakutyökalu.' : 'Puhdas Tila is secure and GDPR-compliant.'}</span>
              </div>
              <div>
                © 2026 Puhdas Tila · {lang === 'fi' ? 'Sisäinen liiditiimi' : 'Internal Growth'}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
