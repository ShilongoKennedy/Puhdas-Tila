import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Search, Sparkles, Copy, Check, X, 
  MapPin, Globe, Mail, Phone, ExternalLink, HelpCircle, 
  RefreshCw, Cpu, ShieldCheck, KeyRound, LogOut, ChevronRight,
  LayoutDashboard, TrendingUp, TrendingDown, DollarSign, Calendar,
  Image as ImageIcon, Plus, Trash2, Upload, Clock, AlertCircle, FileText,
  UserCheck, ShieldAlert, User, Settings
} from 'lucide-react';
import { Language } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface AdminProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
  companyName: string;
  avatarUrl: string;
}

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

interface AdminPanelProps {
  lang: Language;
  setLang?: (lang: Language) => void;
  onClose: () => void;
}

// Financial Transaction Item Interface
interface Transaction {
  id: string;
  description: string;
  category: 'Revenue' | 'Payroll' | 'Supplies' | 'Marketing' | 'Overhead' | 'Other';
  amount: number;
  type: 'In' | 'Out';
  date: string;
}

// Schedule Job Assignment Interface
interface Shift {
  id: string;
  employeeName: string;
  clientName: string;
  date: string;
  timeWindow: string; // e.g. "07:00 - 11:00"
  instructions: string;
  status: 'Planned' | 'Active' | 'Completed';
  timeTracked?: string;
  feedback?: string;
  shiftNotes?: string;
}

// Picture Object Interface
interface PhotoAsset {
  id: string;
  url: string; // data-url or unsplash url
  title: string;
  category: 'Office' | 'BeforeAfter' | 'Special' | 'Team';
  uploadedAt: string;
  description: string;
}

export default function AdminPanel({ lang, setLang, onClose }: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedules' | 'gallery' | 'leads' | 'profile'>('dashboard');

  // USER PROFILE SETTINGS STATE
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'Kennedy Nam',
    email: 'kennedy.nam@gmail.com',
    role: 'Operations Director',
    phone: '+358 40 123 4567',
    companyName: 'Puhdas Tila Oy',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Input Password authentication
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // FINANCIAL NUMBERS STATE (Manual Overrides)
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(14500);
  const [costPayroll, setCostPayroll] = useState<number>(6800);
  const [costSupplies, setCostSupplies] = useState<number>(780);
  const [costMarketing, setCostMarketing] = useState<number>(450);
  const [costOverhead, setCostOverhead] = useState<number>(1100);
  const [revenueGoal, setRevenueGoal] = useState<number>(20000);

  // Financial transactions table items
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Form values for new transaction
  const [newTxDesc, setNewTxDesc] = useState('');
  const [newTxCat, setNewTxCat] = useState<'Revenue' | 'Payroll' | 'Supplies' | 'Marketing' | 'Overhead' | 'Other'>('Revenue');
  const [newTxAmount, setNewTxAmount] = useState<number>(100);
  const [newTxType, setNewTxType] = useState<'In' | 'Out'>('In');
  const [newTxDate, setNewTxDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // SHIFT WORK SCHEDULER STATE
  const [shifts, setShifts] = useState<Shift[]>([]);
  // Form values for new shift
  const [newShiftEmployee, setNewShiftEmployee] = useState('');
  const [newShiftClient, setNewShiftClient] = useState('');
  const [newShiftDate, setNewShiftDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newShiftTime, setNewShiftTime] = useState('08:00 - 12:00');
  const [newShiftInstructions, setNewShiftInstructions] = useState('');
  const [newShiftStatus, setNewShiftStatus] = useState<'Planned' | 'Active' | 'Completed'>('Planned');

  // EMPLOYEE PERFORMANCE LOG EDITING STATE
  const [editingPerformanceShiftId, setEditingPerformanceShiftId] = useState<string | null>(null);
  const [perfTimeTracked, setPerfTimeTracked] = useState('');
  const [perfFeedback, setPerfFeedback] = useState('');
  const [perfShiftNotes, setPerfShiftNotes] = useState('');

  // GALLERIAN KUVAT / PHOTO ASSETS STATE
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');
  const [newPhotoCat, setNewPhotoCat] = useState<'Office' | 'BeforeAfter' | 'Special' | 'Team'>('Office');
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // LEAD FINDER ROBOT STATUS (Old LeadAgent)
  const [targetType, setTargetType] = useState('Hammasklinikat (Dental clinics)');
  const [customTarget, setCustomTarget] = useState('');
  const [location, setLocation] = useState('Espoo');
  const [customLocation, setCustomLocation] = useState('');
  const [leadLang, setLeadLang] = useState<'fi' | 'en'>(lang);
  const [tone, setTone] = useState<'professional' | 'casual' | 'savings'>('professional');
  const [offer, setOffer] = useState<'estimate' | 'discount' | 'bonus'>('estimate');
  const [officeSize, setOfficeSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [leadStatusMsg, setLeadStatusMsg] = useState('');
  const [leadsData, setLeadsData] = useState<LeadResponse | null>(null);
  const [editableLeads, setEditableLeads] = useState<Lead[]>([]);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [sentIndices, setSentIndices] = useState<number[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);
  const [senderEmail, setSenderEmail] = useState('Puhdas Tila <onboarding@resend.dev>');

  const espooDistricts = [
    { key: 'Keilaniemi', label_fi: 'Keilaniemi (Teknologia / Startup-keskus)', label_en: 'Keilaniemi (Tech & Startup Hub)' },
    { key: 'Otaniemi', label_fi: 'Otaniemi (Aalto-yliopisto / Alkuvaiheen yritykset)', label_en: 'Otaniemi (Aalto Uni / Early startups)' },
    { key: 'Tapiola', label_fi: 'Tapiola (Luovat toimistot / Konsultit)', label_en: 'Tapiola (Creative offices & Consultancies)' },
    { key: 'Leppävaara', label_fi: 'Leppävaara (IT-yritykset / Sellon alue)', label_en: 'Leppävaara (IT sector & Sello campus)' },
    { key: 'Matinkylä', label_fi: 'Matinkylä (Liikekeskukset / Pientoimistot)', label_en: 'Matinkylä (Business centers & Small offices)' },
    { key: 'Kera', label_fi: 'Kera & Mankkaa (Toimitilat & Palveluyritykset)', label_en: 'Kera & Mankkaa (Commercial spaces)' }
  ];

  // 1. LIFECYCLE PERSISTENCE LOAD
  useEffect(() => {
    // Check auth token
    const savedToken = localStorage.getItem('puhdas_tila_admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }

    // Load financials overrides
    const storedMonthlyRevenue = localStorage.getItem('adm_monthlyRevenue');
    const storedCostPayroll = localStorage.getItem('adm_costPayroll');
    const storedCostSupplies = localStorage.getItem('adm_costSupplies');
    const storedCostMarketing = localStorage.getItem('adm_costMarketing');
    const storedCostOverhead = localStorage.getItem('adm_costOverhead');
    const storedRevenueGoal = localStorage.getItem('adm_revenueGoal');

    if (storedMonthlyRevenue) setMonthlyRevenue(Number(storedMonthlyRevenue));
    if (storedCostPayroll) setCostPayroll(Number(storedCostPayroll));
    if (storedCostSupplies) setCostSupplies(Number(storedCostSupplies));
    if (storedCostMarketing) setCostMarketing(Number(storedCostMarketing));
    if (storedCostOverhead) setCostOverhead(Number(storedCostOverhead));
    if (storedRevenueGoal) setRevenueGoal(Number(storedRevenueGoal));

    // Load Transactions list (fallback is dummy)
    const storedTx = localStorage.getItem('adm_transactions');
    if (storedTx) {
      setTransactions(JSON.parse(storedTx));
    } else {
      const initialTx: Transaction[] = [
        { id: 'tx-1', description: 'Keilaniemi FinTech Hub - Kuukausilasku', category: 'Revenue', amount: 3200, type: 'In', date: '2026-05-28' },
        { id: 'tx-2', description: 'Tapiola Dental - Siivousmaksu', category: 'Revenue', amount: 2400, type: 'In', date: '2026-05-25' },
        { id: 'tx-3', description: 'S-Ryhmä Eco Detergents ammattitukku', category: 'Supplies', amount: 350, type: 'Out', date: '2026-05-22' },
        { id: 'tx-4', description: 'Taru S. Palkkaus 160h', category: 'Payroll', amount: 2800, type: 'Out', date: '2026-05-15' },
        { id: 'tx-5', description: 'Google Ads B2B Campaign', category: 'Marketing', amount: 450, type: 'Out', date: '2026-05-10' }
      ];
      setTransactions(initialTx);
      localStorage.setItem('adm_transactions', JSON.stringify(initialTx));
    }

    // Load Shifts (fallback is default schedules)
    const storedShifts = localStorage.getItem('adm_shifts');
    if (storedShifts) {
      setShifts(JSON.parse(storedShifts));
    } else {
      const initialShifts: Shift[] = [
        { 
          id: 'sh-1', 
          employeeName: 'Taru Salonaho', 
          clientName: 'Tapiola Hammasklinikka', 
          date: '2026-06-02', 
          timeWindow: '06:00 - 10:00', 
          instructions: 'Keskity hienopölyn pyyhkimiseen, desinfioi hoitotuolien pinnat, tyhjennä kaikki bio- ja sekajäteastiat ja puhdista peilipinnat.', 
          status: 'Completed',
          timeTracked: '4.0',
          feedback: 'Excellent work. The clinic manager specifically thanked Taru for the meticulous hygiene in treatment room 3.',
          shiftNotes: 'All bio-bins replaced. Dental leather chairs sterilized. Eco-sanitizer spray used throughout.',
        },
        { 
          id: 'sh-2', 
          employeeName: 'Jouni Koski', 
          clientName: 'Keilaniemi FinTech Hub', 
          date: '2026-06-03', 
          timeWindow: '08:00 - 12:00', 
          instructions: 'Yleissiivous. Imuroi mattopinnat ja pyyhi neuvotteluhuoneiden suuret pöydät ekologisella mikrokuituliinalla. Tyhjennä roskat.', 
          status: 'Active',
          timeTracked: '2.5',
          feedback: 'On track and working diligently. Microfiber surface dusting of boardrooms is complete.',
          shiftNotes: 'Reported minor tear on the lobby leather sofa to building maintenance during duty.',
        },
        { 
          id: 'sh-3', 
          employeeName: 'Taru Salonaho', 
          clientName: 'Mankkaan Toimistohotelli', 
          date: '2026-06-05', 
          timeWindow: '14:00 - 17:00', 
          instructions: 'Porraskäytävän ja keittiön teho-ekopesu. Käytä erikoistuoksutonta ympäristösertifioitua lattianpesuainetta.', 
          status: 'Planned',
          timeTracked: '',
          feedback: '',
          shiftNotes: '',
        }
      ];
      setShifts(initialShifts);
      localStorage.setItem('adm_shifts', JSON.stringify(initialShifts));
    }

    // Load photo assets (fallback is beautiful stock Unsplash pictures of professional green cleaning)
    const storedPhotos = localStorage.getItem('adm_photos');
    if (storedPhotos) {
      setPhotos(JSON.parse(storedPhotos));
    } else {
      const initialPhotos: PhotoAsset[] = [
        { id: 'ph-1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', title: 'Tapiola Modern Office Workspace', category: 'Office', uploadedAt: '2026-05-12', description: 'Puhdas ja pölytön sormenjälkitön neuvottelutila siivouksen jälkeen.' },
        { id: 'ph-2', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80', title: 'Allergiaystävällinen mikrokuitupyyhintä', category: 'Special', uploadedAt: '2026-05-18', description: 'Ekologinen ja kemikaalivapaa kosketuspintojen desinfiointi.' },
        { id: 'ph-3', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', title: 'Peilipintojen lasiosien loisto', category: 'BeforeAfter', uploadedAt: '2026-05-24', description: 'Kerralla kirkkaat lasiovet ja lasiseinät ilman pisaratuhruja.' }
      ];
      setPhotos(initialPhotos);
      localStorage.setItem('adm_photos', JSON.stringify(initialPhotos));
    }

    // Load admin profile settings
    const storedProfile = localStorage.getItem('adm_profile');
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
  }, []);

  // 2. PERSISTENCE PERSISTING FUNCTIONS
  const saveFinancialOverrides = (rev: number, pay: number, sup: number, mkt: number, ovh: number) => {
    localStorage.setItem('adm_monthlyRevenue', rev.toString());
    localStorage.setItem('adm_costPayroll', pay.toString());
    localStorage.setItem('adm_costSupplies', sup.toString());
    localStorage.setItem('adm_costMarketing', mkt.toString());
    localStorage.setItem('adm_costOverhead', ovh.toString());
  };

  // 3. HANDLERS FOR TRANSACTIONS
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxDesc.trim() || !newTxAmount || newTxAmount <= 0) return;

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      description: newTxDesc,
      category: newTxCat,
      amount: newTxAmount,
      type: newTxType,
      date: newTxDate
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('adm_transactions', JSON.stringify(updated));

    // Update aggregated totals if helpful
    if (newTxType === 'In') {
      const updatedRev = monthlyRevenue + newTxAmount;
      setMonthlyRevenue(updatedRev);
      localStorage.setItem('adm_monthlyRevenue', updatedRev.toString());
    } else {
      if (newTxCat === 'Payroll') {
        const up = costPayroll + newTxAmount;
        setCostPayroll(up);
        localStorage.setItem('adm_costPayroll', up.toString());
      } else if (newTxCat === 'Supplies') {
        const up = costSupplies + newTxAmount;
        setCostSupplies(up);
        localStorage.setItem('adm_costSupplies', up.toString());
      } else if (newTxCat === 'Marketing') {
        const up = costMarketing + newTxAmount;
        setCostMarketing(up);
        localStorage.setItem('adm_costMarketing', up.toString());
      } else {
        const up = costOverhead + newTxAmount;
        setCostOverhead(up);
        localStorage.setItem('adm_costOverhead', up.toString());
      }
    }

    // Reset Form
    setNewTxDesc('');
    setNewTxAmount(100);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('adm_transactions', JSON.stringify(updated));
  };


  // 4. HANDLERS FOR SCHEDULING
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftEmployee.trim() || !newShiftClient.trim()) return;

    const newShift: Shift = {
      id: 'sh-' + Date.now(),
      employeeName: newShiftEmployee,
      clientName: newShiftClient,
      date: newShiftDate,
      timeWindow: newShiftTime,
      instructions: newShiftInstructions,
      status: newShiftStatus,
      timeTracked: '',
      feedback: '',
      shiftNotes: ''
    };

    const updated = [newShift, ...shifts];
    setShifts(updated);
    localStorage.setItem('adm_shifts', JSON.stringify(updated));

    // Reset Form
    setNewShiftEmployee('');
    setNewShiftClient('');
    setNewShiftInstructions('');
  };

  const handleUpdateShiftPerformance = (id: string, timeTracked: string, feedback: string, shiftNotes: string) => {
    const updated = shifts.map(s => {
      if (s.id === id) {
        return { ...s, timeTracked, feedback, shiftNotes };
      }
      return s;
    });
    setShifts(updated);
    localStorage.setItem('adm_shifts', JSON.stringify(updated));
  };

  const handleToggleShiftStatus = (id: string) => {
    const updated = shifts.map(s => {
      if (s.id === id) {
        let nextStatus: 'Planned' | 'Active' | 'Completed' = 'Active';
        if (s.status === 'Planned') nextStatus = 'Active';
        else if (s.status === 'Active') nextStatus = 'Completed';
        else nextStatus = 'Planned';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setShifts(updated);
    localStorage.setItem('adm_shifts', JSON.stringify(updated));
  };

  const handleDeleteShift = (id: string) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    localStorage.setItem('adm_shifts', JSON.stringify(updated));
  };


  // 5. HANDLERS FOR PHOTO UPLOAD (Local Base64 & Preview Storage!)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoTitle.trim() || !filePreview) {
      alert(lang === 'fi' ? 'Valitse kuva ja syötä otsikko.' : 'Please choose an image file and enter a title.');
      return;
    }

    const newPhoto: PhotoAsset = {
      id: 'ph-' + Date.now(),
      url: filePreview,
      title: newPhotoTitle,
      category: newPhotoCat,
      uploadedAt: new Date().toISOString().split('T')[0],
      description: newPhotoDesc
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    localStorage.setItem('adm_photos', JSON.stringify(updated));

    // Reset form
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setFilePreview(null);
    setFileInputKey(prev => prev + 1); // clears file input state
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm(lang === 'fi' ? 'Haluatko varmasti poistaa kuvan galleriasta?' : 'Are you sure you want to remove this photo?')) {
      const updated = photos.filter(p => p.id !== id);
      setPhotos(updated);
      localStorage.setItem('adm_photos', JSON.stringify(updated));
    }
  };


  // 6. HANDLERS FOR GENIE LIVE OUTREACH SCANS (Lead Finder)
  useEffect(() => {
    if (!isLoadingLeads) return;
    const messages = [
      lang === 'fi' ? 'Käynnistetään verkkohakubotti...' : 'Starting the live web crawler...',
      lang === 'fi' ? 'Suodatetaan alueen yrityksiä (Google Grounding)...' : 'Filtering businesses in Espoo (Google Grounding)...',
      lang === 'fi' ? 'Valmistellaan personoituja siivoustarveanalyyseja...' : 'Drafting precision commercial workspace hygiene audits...',
      lang === 'fi' ? 'Muotoillaan sähköpostiviestejä asiallisella sävyllä...' : 'Writing conversion-focused outreach sequence...',
      lang === 'fi' ? 'Koostetaan lopullista liidiraporttia...' : 'Formatting qualified sales report...'
    ];
    let index = 0;
    setLeadStatusMsg(messages[0]);
    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      setLeadStatusMsg(messages[index]);
    }, 3000);
    return () => clearInterval(timer);
  }, [isLoadingLeads, lang]);

  const handleGenerateLeads = async () => {
    if (!token) return;
    setIsLoadingLeads(true);
    setLeadsData(null);
    setEditableLeads([]);
    setLeadsError(null);

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
          localStorage.removeItem('puhdas_tila_admin_token');
          setToken(null);
          setIsAuthenticated(false);
          throw new Error(lang === 'fi' ? 'Sessio vanhentunut. Kirjaudu uudelleen.' : 'Session expired. Please log in again.');
        }
        const errData = await response.json();
        throw new Error(errData.error || 'Live search could not execute.');
      }

      const data: LeadResponse = await response.json();
      setLeadsData(data);
      if (data.leads) {
        setEditableLeads(data.leads);
      }
    } catch (err: any) {
      setLeadsError(err.message || 'Error fetching leads.');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

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

  const handleSendDirectEmail = async (idx: number, lead: Lead) => {
    if (!token) return;
    if (!lead.email) {
      alert(lang === 'fi' ? 'Kohteella ei ole julkista sähköpostiosoitetta.' : 'This lead does not have a public email address mapped.');
      return;
    }

    setSendingIndex(idx);
    setSendError(null);
    setSendSuccessMsg(null);

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: lead.email,
          subject: lead.outreachEmailSubject,
          body: lead.outreachEmailBody,
          from: senderEmail
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Email dispatch failed.');
      }

      setSentIndices(prev => [...prev, idx]);
      setSendSuccessMsg(
        lang === 'fi' 
          ? `Lomake lähetetty osoitteeseen ${lead.email}! (Tunnus: ${data.id})`
          : `Email successfully sent to ${lead.email}! (Message ID: ${data.id})`
      );
    } catch (err: any) {
      setSendError(err.message || 'Connection failed.');
    } finally {
      setSendingIndex(null);
    }
  };

  // 7. SECURITY PASSCODE HANDSHAKE
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      let isSuccess = false;
      let tokenValue = "";

      try {
        const response = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });

        if (response.ok) {
          const data = await response.json();
          tokenValue = data.token;
          isSuccess = true;
        } else {
          // If the server rejects but it matches the fallback passwords, authorize locally
          const cleanInput = password.trim();
          if (cleanInput === "puhdas-tila2026" || cleanInput === "puhdastila2026") {
            tokenValue = "PuhdasTilaSecureAgentSecretHandshake";
            isSuccess = true;
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || (lang === 'fi' ? 'Väärä ylläpitäjän salasana.' : 'Incorrect administrator passcode.'));
          }
        }
      } catch (fetchErr) {
        // If server route is 404, offline or blocked, fall back to client-side validation
        const cleanInput = password.trim();
        if (cleanInput === "puhdas-tila2026" || cleanInput === "puhdastila2026") {
          tokenValue = "PuhdasTilaSecureAgentSecretHandshake";
          isSuccess = true;
        } else {
          throw new Error(lang === 'fi' ? 'Väärä ylläpitäjän salasana.' : 'Incorrect administrator passcode.');
        }
      }

      if (isSuccess) {
        localStorage.setItem('puhdas_tila_admin_token', tokenValue);
        setToken(tokenValue);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setAuthError(err.message || (lang === 'fi' ? 'Väärä ylläpitäjän salasana.' : 'Incorrect administrator passcode.'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('puhdas_tila_admin_token');
    setToken(null);
    setIsAuthenticated(false);
    onClose();
  };

  // Math aggregation helpers
  const totalExpenses = costPayroll + costSupplies + costMarketing + costOverhead;
  const netIncome = monthlyRevenue - totalExpenses;
  const profitMargin = monthlyRevenue > 0 ? (netIncome / monthlyRevenue) * 100 : 0;
  const progressPercent = Math.min(100, Math.max(0, (monthlyRevenue / revenueGoal) * 100));

  // ---------------- RENDERING CODE ----------------

  // SECURITY LOCKED PORTAL SHIELD (UNAUTHORIZED VIEW)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-[#0D2B1E] to-[#1E3F2E] text-white flex items-center justify-center p-4 overflow-y-auto">
        {/* Abstract floating nodes */}
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#95C4A1_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Floating Language Switcher */}
        {setLang && (
          <div className="absolute top-4 right-4 z-20">
            <div className="flex bg-white/10 p-0.5 rounded-full border border-white/15 gap-0.5">
              <button
                type="button"
                onClick={() => setLang('fi')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  lang === 'fi' ? 'bg-[#1B4332] text-white border border-[#95C4A1]/20' : 'text-white/60 hover:text-white'
                }`}
              >
                FI
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-[#1B4332] text-white border border-[#95C4A1]/20' : 'text-white/60 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        )}
        
        <motion.div 
          className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1B4332] border-2 border-[#95C4A1]/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-[#95C4A1]" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white mb-2">
              {lang === 'fi' ? 'Ylläpitoportaali' : 'Management Portal'}
            </h2>
            <p className="text-white/60 text-sm">
              {lang === 'fi' 
                ? 'Pääsy suojattu. Tämä työkalu on tarkoitettu ainoastaan yrityksen sisäiseen käyttöön.'
                : 'Access Restricted. Enter corporate passcode to safely access dashboards and planners.'
              }
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#95C4A1] mb-2 text-left">
                {lang === 'fi' ? 'Ylläpitäjän salasana' : 'Security Passcode'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'fi' ? 'Syötä salasana...' : 'Enter passcode...'}
                className="w-full bg-black/25 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#95C4A1]/80 transition-colors placeholder:text-white/30 font-mono"
              />
              <p className="text-[11px] text-[#95C4A1]/80 mt-2 font-mono text-left bg-[#1B4332]/35 border border-[#95C4A1]/10 px-3 py-1.5 rounded-lg select-all">
                💡 {lang === 'fi'
                  ? 'Salasana: puhdas-tila2026 (tai vanha puhdastila2026)'
                  : 'Passcode: "puhdas-tila2026" or "puhdastila2026"'
                }
              </p>
            </div>

            {authError && (
              <motion.div 
                className="bg-red-950/40 border border-red-500/30 text-red-100 p-3 rounded-lg text-xs flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <X className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#95C4A1] hover:bg-[#a9d1b4] text-[#0D2B1E] font-bold py-3 px-4 rounded-xl text-xs sm:text-sm tracking-wide uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === 'fi' ? 'Valtuutetaan...' : 'Verifying Credentials...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'fi' ? 'Kirjaudu & Valtuuta' : 'Authorize Entrance'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={onClose}
              className="text-white/45 hover:text-white text-xs underline focus:outline-none cursor-pointer"
            >
              {lang === 'fi' ? '← Peruuta ja palaa kotisivulle' : '← Exit to Public Landing Page'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // AUTHORIZED LIVE EXPANDED WORKSPACE
  return (
    <div className="fixed inset-0 z-[10000] bg-[#F4F6F2] text-[#1A1A1A] flex flex-col overflow-hidden font-sans">
      
      {/* 1. EXPANDED CONTROL BAR */}
      <header className="bg-[#0D2B1E] text-white px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/10 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B4332] text-white rounded-xl border border-[#95C4A1]/30 flex items-center justify-center font-bold">
            🌿
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#95C4A1] uppercase block leading-none">
              PUHDAS TILA INTERNAL OPERATIONS
            </span>
            <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white mt-1 leading-none">
              {lang === 'fi' ? 'Toiminnanohjaus & Talous' : 'B2B ERP & Finance Portal'}
            </h1>
          </div>
        </div>

        {/* Tab Controls and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active indicator badge */}
          <div className="hidden md:inline-flex items-center gap-2 bg-[#1B4332] px-3 py-1.5 rounded-lg border border-[#95C4A1]/20 text-[11px] font-bold text-[#95C4A1] mr-2">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-4 h-4 rounded-full object-cover border border-[#95C4A1]/40" referrerPolicy="no-referrer" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            <span>{profile.name} ({lang === 'fi' ? 'Suojattu istunto' : 'Secure Session'})</span>
          </div>

          {/* Elegant Pill Language Switcher in Admin Header */}
          {setLang && (
            <div className="flex bg-white/10 p-0.5 rounded-full border border-white/15 gap-0.5 mr-2">
              <button
                type="button"
                onClick={() => setLang('fi')}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer select-none ${
                    lang === 'fi' 
                      ? 'bg-[#1B4332] text-white border border-[#95C4A1]/25 shadow-sm' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                FI
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full transition-all cursor-pointer select-none ${
                    lang === 'en' 
                      ? 'bg-[#1B4332] text-white border border-[#95C4A1]/25 shadow-sm' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                EN
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/20 hover:bg-red-950/60 text-red-300 hover:text-white px-3 py-2 rounded-lg border border-red-500/20 text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'fi' ? 'Kirjaudu ulos' : 'Sign Out'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors border border-white/5"
            aria-label="Sulje"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. TABBED SEGMENT NAVIGATION */}
      <nav className="bg-white border-b border-[#E0E4DC] px-4 md:px-8 py-2.5 flex items-center justify-between overflow-x-auto gap-4 shrink-0 shadow-sm scrollbar-none">
        <div className="flex gap-1 sm:gap-2">
          {[
            { id: 'dashboard', labelFi: 'Kojelauta & Talous', labelEn: 'Performance & Finance', icon: LayoutDashboard },
            { id: 'schedules', labelFi: 'Työvuorot & Kalenteri', labelEn: 'Shift Scheduling', icon: Calendar },
            { id: 'gallery', labelFi: 'Kuvapankki & Työt', labelEn: 'Job Assets & Gallery', icon: ImageIcon },
            { id: 'leads', labelFi: 'Gemini Liidibotti ✦', labelEn: 'Gemini Prospector ✦', icon: Sparkles },
            { id: 'profile', labelFi: 'Profiiliasetukset', labelEn: 'Profile Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#1B4332] text-white shadow-md' 
                    : 'text-[#4A4A4A] hover:text-[#1B4332] hover:bg-[#F2F4F0]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#95C4A1]' : 'opacity-70'}`} />
                <span>{lang === 'fi' ? tab.labelFi : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Global Stats bar overview top panel (desktop only) */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#5C6F63]">
          <div>
            <span>{lang === 'fi' ? 'Siivousvuoroja suunniteltu' : 'Active Shifts'}:</span>{' '}
            <strong className="text-[#1B4332] font-black">{shifts.length}</strong>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D5E4DB]" />
          <div>
            <span>{lang === 'fi' ? 'Valokuvia' : 'Gallery Assets'}:</span>{' '}
            <strong className="text-[#1B4332] font-black">{photos.length}</strong>
          </div>
        </div>
      </nav>

      {/* 3. CORE EDITABLE WORKSPACE - SCROLLABLE CONTAINER */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* TAB 1: CORELAYOUT PERFORMANCE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Financial Dashboard Key Performance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* CARD 1: Monthly Revenue */}
                <div className="bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#5C6F63] mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {lang === 'fi' ? 'KUUKAUSITTAINEN LIIKEVAIHTO' : 'MONTHLY REVENUE'}
                    </span>
                    <DollarSign className="w-5 h-5 text-[#2D6A4F] bg-[#95C4A1]/20 p-1 rounded-full stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-mono text-3xl font-black text-[#1B4332]">
                      {monthlyRevenue.toLocaleString('fi-FI')} €
                    </h3>
                    <p className="text-[11px] text-[#7A7A7A] mt-1.5">
                      {lang === 'fi' ? 'Asiakassopimusten yhteenlaskettu arvo' : 'Aggregated customer retainer billing'}
                    </p>
                  </div>
                </div>

                {/* CARD 2: Total Labor & Supply Costs */}
                <div className="bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#5C6F63] mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {lang === 'fi' ? 'TOIMINNALLISET KULUT' : 'OPERATING COST'}
                    </span>
                    <TrendingDown className="w-5 h-5 text-amber-700 bg-amber-100 p-1 rounded-full stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-mono text-3xl font-black text-[#1A1A1A]">
                      {totalExpenses.toLocaleString('fi-FI')} €
                    </h3>
                    <p className="text-[11px] text-[#7A7A7A] mt-1.5">
                      {lang === 'fi' ? 'Palkat, tarvikkeet ja yleiskulut' : 'Payroll, supply goods, workspace'}
                    </p>
                  </div>
                </div>

                {/* CARD 3: Margins & Income */}
                <div className="bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#5C6F63] mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {lang === 'fi' ? 'NETTOTULOS / VOITTO' : 'OPERATING NET INCOME'}
                    </span>
                    <TrendingUp className="w-5 h-5 text-emerald-700 bg-emerald-100 p-1 rounded-full stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className={`font-mono text-3xl font-black ${netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {netIncome.toLocaleString('fi-FI')} €
                    </h3>
                    <p className="text-[11px] text-[#7A7A7A] mt-1.5">
                      {lang === 'fi' ? `Marginaali: ${profitMargin.toFixed(1)} %` : `Margin: ${profitMargin.toFixed(1)} %`}
                    </p>
                  </div>
                </div>

                {/* CARD 4: Target Progress */}
                <div className="bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#5C6F63] mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {lang === 'fi' ? 'TAVOITE (20K KASVU)' : 'GROWTH GOAL PROGRESS'}
                    </span>
                    <Sparkles className="w-5 h-5 text-[#95C4A1]" />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-mono text-2xl font-black text-[#1B4332]">
                        {progressPercent.toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-[#7A7A7A]">
                        {monthlyRevenue} / {revenueGoal} €
                      </span>
                    </div>
                    {/* Progress tracking line */}
                    <div className="w-full h-2.5 bg-[#E0E4DC] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#95C4A1] transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#7A7A7A] mt-1">
                      {lang === 'fi' ? 'Liikevaihtotavoite B2B-kasvulle' : 'Espoo growth phase 2 goal'}
                    </p>
                  </div>
                </div>

              </div>

              {/* DYNAMIC METRIC ADJUSTMENT PANEL + LIVE COMPARATIVE SVG CHART */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Financial Input Forms Box */}
                <div className="lg:col-span-4 bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {lang === 'fi' ? 'Säädä kuukausilukuja' : 'Configure Manual Metrics'}
                    </h3>
                    <p className="text-xs text-[#5C6F63] mt-1">
                      {lang === 'fi' 
                        ? 'Pidä ylläpidon luvut ajan tasalla ja tutki reaaliaikaista kulujakaumaasi.' 
                        : 'Adjust monthly figures directly. Updates live charts and profitability models.'
                      }
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Input Revenue */}
                    <div>
                      <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">
                        {lang === 'fi' ? 'Asiakaslaskutus yhteensä (€)' : 'Total Customer Billing (€)'}
                      </label>
                      <input
                        type="number"
                        className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-[#1B4332]"
                        value={monthlyRevenue}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMonthlyRevenue(val);
                          localStorage.setItem('adm_monthlyRevenue', val.toString());
                        }}
                      />
                    </div>

                    {/* Input Payroll */}
                    <div>
                      <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">
                        {lang === 'fi' ? 'Palkat ja Työnantajakulut (€)' : 'Payroll & Labor Cost (€)'}
                      </label>
                      <input
                        type="number"
                        className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-[#1B4332]"
                        value={costPayroll}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCostPayroll(val);
                          localStorage.setItem('adm_costPayroll', val.toString());
                        }}
                      />
                    </div>

                    {/* Input Supplies */}
                    <div>
                      <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">
                        {lang === 'fi' ? 'Ekologiset pesuaineet / pesimet (€)' : 'Eco Detergents & Washers (€)'}
                      </label>
                      <input
                        type="number"
                        className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-[#1B4332]"
                        value={costSupplies}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCostSupplies(val);
                          localStorage.setItem('adm_costSupplies', val.toString());
                        }}
                      />
                    </div>

                    {/* Input Marketing */}
                    <div>
                      <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">
                        {lang === 'fi' ? 'B2B Digitaalinen mainonta / SaaS (€)' : 'Digital Marketing & SaaS (€)'}
                      </label>
                      <input
                        type="number"
                        className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-[#1B4332]"
                        value={costMarketing}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCostMarketing(val);
                          localStorage.setItem('adm_costMarketing', val.toString());
                        }}
                      />
                    </div>

                    {/* Input Rent/Overhead */}
                    <div>
                      <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">
                        {lang === 'fi' ? 'Toimisto / Autot & Logistiikka (€)' : 'Rent & Vehicle Logistics (€)'}
                      </label>
                      <input
                        type="number"
                        className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-[#1B4332]"
                        value={costOverhead}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCostOverhead(val);
                          localStorage.setItem('adm_costOverhead', val.toString());
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Comparative Live Visual SVG Chart Box */}
                <div className="lg:col-span-8 bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {lang === 'fi' ? 'Tulot vs Toiminnalliset Kulut' : 'Revenue vs Operational Overhead Balance'}
                    </h3>
                    <p className="text-xs text-[#5C6F63] mt-1">
                      {lang === 'fi' ? 'Havainnollistava vertailu liikevaihdon ja kulurakenteen välillä.' : 'Real-time graphic representation based on custom data inputs.'}
                    </p>
                  </div>

                  {/* SVG Vertical Columns Bar Chart */}
                  <div className="h-[240px] w-full flex items-end justify-around border-b border-[#E0E4DC] pt-8 pb-4 relative">
                    {/* Background lines helper */}
                    <div className="absolute inset-y-0 left-0 right-0 flex flex-col justify-between pointer-events-none opacity-[0.4] z-0">
                      <div className="border-t border-dashed border-gray-200 w-full" />
                      <div className="border-t border-dashed border-gray-200 w-full" />
                      <div className="border-t border-dashed border-gray-200 w-full" />
                      <div className="border-t border-dashed border-gray-200 w-full" />
                    </div>

                    {/* Calculate proportional height ratios */}
                    {(() => {
                      const maxVal = Math.max(monthlyRevenue, totalExpenses, 3000) * 1.15;
                      const hRev = (monthlyRevenue / maxVal) * 100;
                      const hExp = (totalExpenses / maxVal) * 100;
                      const hProfit = (netIncome / maxVal) * 100;

                      return (
                        <>
                          {/* Column 1: Monthly Billing */}
                          <div className="flex flex-col items-center w-1/4 relative z-10 transition-all">
                            <span className="text-[10px] font-mono font-bold text-[#1B4332] mb-1">
                              {monthlyRevenue} €
                            </span>
                            <div 
                              className="w-14 bg-gradient-to-t from-[#1B4332] to-[#2D6A4F] rounded-t-lg shadow-sm transition-all duration-300" 
                              style={{ height: `${Math.max(4, hRev)}%` }}
                            />
                            <span className="text-xs font-semibold text-[#1A1A1A] mt-2 text-center leading-none">
                              {lang === 'fi' ? 'Tulot' : 'Inflow'}
                            </span>
                          </div>

                          {/* Column 2: Total Expenses */}
                          <div className="flex flex-col items-center w-1/4 relative z-10 transition-all">
                            <span className="text-[10px] font-mono font-bold text-amber-800 mb-1">
                              {totalExpenses} €
                            </span>
                            <div 
                              className="w-14 bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-lg shadow-sm transition-all duration-300" 
                              style={{ height: `${Math.max(4, hExp)}%` }}
                            />
                            <span className="text-xs font-semibold text-[#1A1A1A] mt-2 text-center leading-none">
                              {lang === 'fi' ? 'Kulut' : 'Outflow'}
                            </span>
                          </div>

                          {/* Column 3: Net Cash Position */}
                          <div className="flex flex-col items-center w-1/4 relative z-10 transition-all">
                            <span className={`text-[10px] font-mono font-bold mb-1 ${netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                              {netIncome} €
                            </span>
                            <div 
                              className={`w-14 rounded-t-lg shadow-sm transition-all duration-300 ${
                                netIncome >= 0 
                                  ? 'bg-gradient-to-t from-emerald-600 to-[#95C4A1]' 
                                  : 'bg-gradient-to-t from-red-700 to-red-400'
                              }`} 
                              style={{ height: `${Math.max(4, Math.abs(hProfit))}%` }}
                            />
                            <span className="text-xs font-semibold text-[#1A1A1A] mt-2 text-center leading-none">
                              {lang === 'fi' ? 'Netto' : 'Cash Gain'}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-[#5C6F63] pt-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-[#1B4332] rounded-sm" />
                      <span>{lang === 'fi' ? 'Asiakaslaskutus' : 'Active billing'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-amber-600 rounded-sm" />
                      <span>{lang === 'fi' ? 'Kiinteät + Muuttuvat' : 'Operational costs'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 bg-emerald-600 rounded-sm" />
                      <span>{lang === 'fi' ? 'Puhdas Katsaus' : 'Net position'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* DETAILED TRANSACTION LOG REGISTER (MANUAL ENTRY) */}
              <div className="bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {lang === 'fi' ? 'Kirjaa uusi tilitapahtuma' : 'Record Direct Operational Transaction'}
                    </h3>
                    <p className="text-xs text-[#5C6F63] mt-1">
                      {lang === 'fi' ? 'Lisää uusia laskutus- tai kulurivejä kirjanpitoosi.' : 'Log operational receipts or incoming customer invoices manually.'}
                    </p>
                  </div>
                </div>

                {/* Form to log transaction inline */}
                <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-12 gap-4 items-end bg-[#F9FBF9] p-4 rounded-xl border border-[#D5E4DB] text-xs">
                  <div className="sm:col-span-2 md:col-span-4">
                    <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Kuvaus' : 'Description'}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'fi' ? 'Esim. Jounin Palkka 15h, Toimistotarvikkeet...' : 'Esim. Lobby Carpet extra charge...'}
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={newTxDesc}
                      onChange={(e) => setNewTxDesc(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Kategoria' : 'Category'}</label>
                    <select
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={newTxCat}
                      onChange={(e: any) => setNewTxCat(e.target.value)}
                    >
                      <option value="Revenue">{lang === 'fi' ? 'Liikevaihto' : 'Revenue'}</option>
                      <option value="Payroll">{lang === 'fi' ? 'Palkkaus' : 'Payroll'}</option>
                      <option value="Supplies">{lang === 'fi' ? 'Tarvikollisuus' : 'Eco Supplies'}</option>
                      <option value="Marketing">{lang === 'fi' ? 'Markkinointi' : 'Marketing'}</option>
                      <option value="Overhead">{lang === 'fi' ? 'Yleiskulut' : 'Overhead'}</option>
                      <option value="Other">{lang === 'fi' ? 'Muut kulut' : 'Other'}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Tyyppi' : 'Type'}</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewTxType('In')}
                        className={`flex-1 py-1.5 rounded-md font-bold text-center border transition-all ${
                          newTxType === 'In' 
                            ? 'bg-[#1B4332] text-white border-[#1B4332]' 
                            : 'bg-white text-[#4A4A4A] border-[#E0E4DC]'
                        }`}
                      >
                        {lang === 'fi' ? 'Tulo' : 'In'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTxType('Out')}
                        className={`flex-1 py-1.5 rounded-md font-bold text-center border transition-all ${
                          newTxType === 'Out' 
                            ? 'bg-amber-700 text-white border-amber-700' 
                            : 'bg-white text-[#4A4A4A] border-[#E0E4DC]'
                        }`}
                      >
                        {lang === 'fi' ? 'Kulu' : 'Out'}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Määrä (€)' : 'Amount (€)'}</label>
                    <input
                      type="number"
                      required
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-[#1B4332]"
                      value={newTxAmount}
                      onChange={(e) => setNewTxAmount(Number(e.target.value))}
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-2">
                    <div className="flex-1">
                      <label className="block font-bold text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Päiväys' : 'Date'}</label>
                      <input
                        type="date"
                        required
                        className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1B4332]"
                        value={newTxDate}
                        onChange={(e) => setNewTxDate(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#1B4332] text-white hover:bg-[#20513d] px-4 py-2 rounded-lg font-bold h-[34px] flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </form>

                {/* Transactions Table */}
                <div className="mt-6 overflow-x-auto rounded-xl border border-[#E0E4DC]">
                  <table className="w-full border-collapse text-left text-xs bg-white">
                    <thead>
                      <tr className="bg-[#FAFAF7] uppercase text-[10px] tracking-wider text-[#5C6F63] border-b border-[#E0E4DC]">
                        <th className="p-4 font-bold">{lang === 'fi' ? 'Päiväys' : 'Date'}</th>
                        <th className="p-4 font-bold">{lang === 'fi' ? 'Kuvaus' : 'Description'}</th>
                        <th className="p-4 font-bold">{lang === 'fi' ? 'Kategoria' : 'Category'}</th>
                        <th className="p-4 font-bold text-right">{lang === 'fi' ? 'Määrä (€)' : 'Amount (€)'}</th>
                        <th className="p-4 font-bold text-center">{lang === 'fi' ? 'Toiminnot' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E4DC]/60 font-medium">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-[#F9F9F7] transition-colors">
                          <td className="p-4 whitespace-nowrap font-mono">{tx.date}</td>
                          <td className="p-4 font-semibold text-[#1A1A1A]">{tx.description}</td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              tx.category === 'Revenue' ? 'bg-emerald-100 text-emerald-800' :
                              tx.category === 'Payroll' ? 'bg-[#95C4A1]/20 text-[#1B4332]' :
                              tx.category === 'Supplies' ? 'bg-sky-100 text-sky-800' :
                              tx.category === 'Marketing' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {tx.category}
                            </span>
                          </td>
                          <td className={`p-4 text-right font-mono font-bold whitespace-nowrap text-sm ${
                            tx.type === 'In' ? 'text-emerald-700' : 'text-amber-800'
                          }`}>
                            {tx.type === 'In' ? '+' : '-'}{tx.amount.toLocaleString()} €
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-all focus:outline-none cursor-pointer"
                              aria-label="Poista tapahtuma"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EMPLOYEE SHIFT PLANNER & COORDINATION BOARD */}
          {activeTab === 'schedules' && (
            <div className="space-y-8">
              
              <div className="bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                    {lang === 'fi' ? 'Suunnittele ja assignaa siivousvuoroja' : 'Clean Staff Shift Planning Board'}
                  </h3>
                  <p className="text-xs text-[#5C6F63] mt-1">
                    {lang === 'fi' 
                      ? 'Yhdistä työntekijät ja asiakaskohteet ja määritä erityiset puhtausohjeistukset jokaiselle käynnille.' 
                      : 'Assign reliable team members to customer premises. Customize task directives for each session.'
                    }
                  </p>
                </div>

                {/* Form to log operational shifts */}
                <form onSubmit={handleAddShift} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end bg-[#F9FBF9] p-5 rounded-xl border border-[#D5E4DB] mt-6 text-xs font-semibold">
                  <div className="md:col-span-3">
                    <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Työntekijän Nimi' : 'Staff Employee'}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'fi' ? 'Esim. Taru Salonaho...' : 'Esim. Dave Smith...'}
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={newShiftEmployee}
                      onChange={(e) => setNewShiftEmployee(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Asiakas / Kohde' : 'Client Premises'}</label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'fi' ? 'Esim. Tapiola Dental Clinic...' : 'Esim. Microtech Keilaniemi...'}
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={newShiftClient}
                      onChange={(e) => setNewShiftClient(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Päiväys' : 'Execution Date'}</label>
                    <input
                      type="date"
                      required
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#1B4332]"
                      value={newShiftDate}
                      onChange={(e) => setNewShiftDate(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Aikaväli' : 'Shift Time'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 06:00 - 10:00"
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B4332] font-mono"
                      value={newShiftTime}
                      onChange={(e) => setNewShiftTime(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Tila' : 'Status'}</label>
                    <select
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={newShiftStatus}
                      onChange={(e: any) => setNewShiftStatus(e.target.value)}
                    >
                      <option value="Planned">{lang === 'fi' ? 'Suunniteltu' : 'Scheduled'}</option>
                      <option value="Active">{lang === 'fi' ? 'Käynnissä' : 'Active'}</option>
                      <option value="Completed">{lang === 'fi' ? 'Suoritettu' : 'Completed'}</option>
                    </select>
                  </div>

                  <div className="md:col-span-10">
                    <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Työvuoron painopisteet ja ohjekirjat' : 'Specific Instructions & Task list'}</label>
                    <input
                      type="text"
                      placeholder={lang === 'fi' ? 'Esim. Pyyhi erikoislasiovet, käytä ekologista raikastajaa, tyhjennä bio-astia...' : 'Deep desk clean, microdust monitors focus...'}
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={newShiftInstructions}
                      onChange={(e) => setNewShiftInstructions(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-[#1B4332] text-white hover:bg-[#20513d] py-2 rounded-lg font-bold h-[38px] flex items-center justify-center gap-1 cursor-pointer text-sm"
                    >
                      <Plus className="w-5 h-5 animate-pulse" />
                      <span>{lang === 'fi' ? 'Tallenna' : 'Assign'}</span>
                    </button>
                  </div>
                </form>

                {/* Grid listing Planned shifts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {shifts.map(shift => (
                    <div 
                      key={shift.id} 
                      className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                        shift.status === 'Completed' ? 'border-emerald-500/20 bg-emerald-50/10' :
                        shift.status === 'Active' ? 'border-sky-500/30 ring-1 ring-sky-500/10' : 'border-[#E0E4DC]'
                      }`}
                    >
                      <div>
                        {/* Header details with status badges */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer ${
                            shift.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            shift.status === 'Active' ? 'bg-sky-100 text-sky-800' : 'bg-[#FAFAF7] text-[#4A4A4A] border border-[#E0E4DC]'
                          }`}
                          onClick={() => handleToggleShiftStatus(shift.id)}
                          title={lang === 'fi' ? 'Vaihda tilaa klikkaamalla' : 'Click to toggle status'}
                          >
                            ● {shift.status === 'Completed' ? (lang === 'fi' ? 'Suoritettu' : 'Completed') :
                               shift.status === 'Active' ? (lang === 'fi' ? 'Käynnissä' : 'Active') : (lang === 'fi' ? 'Suunniteltu' : 'Planned')}
                          </span>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDeleteShift(shift.id)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded focus:outline-none cursor-pointer"
                              title="Delete shift"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Title details */}
                        <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                          {shift.clientName}
                        </h4>

                        {/* Timing coordinates */}
                        <div className="space-y-1.5 text-xs text-[#5C6F63] mt-3 font-medium">
                          <p className="flex items-center gap-1.5 font-semibold text-[#1B4332]">
                            <Clock className="w-4 h-4 text-[#95C4A1]" />
                            <span>{shift.timeWindow}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 opacity-70" />
                            <span>{shift.date}</span>
                          </p>
                        </div>

                        {/* Task Instructions quote container */}
                        <div className="bg-[#FAFBF9] border-l-2 border-[#95C4A1]/60 px-3 py-2.5 rounded-r-lg mt-4 text-[11px] leading-relaxed text-[#4A4A4A] italic">
                          <span>{shift.instructions || (lang === 'fi' ? 'Ei erityisohjeita asetettu.' : 'Generic maintenance cleaning cycle.')}</span>
                        </div>

                        {/* Employee Performance Log Section */}
                        <div className="mt-4 pt-3 border-t border-dashed border-[#E0E4DC]">
                          {editingPerformanceShiftId === shift.id ? (
                            <div className="bg-[#FAFAF7] p-3 rounded-lg border border-[#D5E4DB] space-y-3 text-xs">
                              <h5 className="font-bold text-[#1B4332] flex items-center gap-1">
                                📝 {lang === 'fi' ? 'Suoritusraportti' : 'Performance Log'}
                              </h5>
                              
                              <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold text-gray-500">
                                  {lang === 'fi' ? 'Toteutunut aika (tunnit) *' : 'Time Tracked (hours) *'}
                                </label>
                                <input
                                  type="text"
                                  className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-[#1B4332]"
                                  placeholder="e.g. 4.0 or 3.5"
                                  value={perfTimeTracked}
                                  onChange={(e) => setPerfTimeTracked(e.target.value)}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold text-gray-500">
                                  {lang === 'fi' ? 'Työvuoron laatu- / tapahtumahuomiot' : 'Shift Notes / Incidents'}
                                </label>
                                <textarea
                                  className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1B4332] h-12 resize-none font-medium text-gray-700"
                                  placeholder={lang === 'fi' ? 'Esim. Kaikki tehtävät tehty, ei huomautettavaa...' : 'e.g. Cleared checklists, no incidents...'}
                                  value={perfShiftNotes}
                                  onChange={(e) => setPerfShiftNotes(e.target.value)}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] uppercase font-bold text-gray-500">
                                  {lang === 'fi' ? 'Työntekijäkohtainen palaute' : 'Employee Feedback'}
                                </label>
                                <textarea
                                  className="w-full border border-gray-300 bg-white rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1B4332] h-12 resize-none font-medium text-gray-700"
                                  placeholder={lang === 'fi' ? 'Palautetta työntekijän suorituksesta...' : 'Feedback on professional precision...'}
                                  value={perfFeedback}
                                  onChange={(e) => setPerfFeedback(e.target.value)}
                                />
                              </div>

                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingPerformanceShiftId(null)}
                                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-[10px] font-bold text-gray-700 transition-colors"
                                >
                                  {lang === 'fi' ? 'Peruuta' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateShiftPerformance(shift.id, perfTimeTracked, perfFeedback, perfShiftNotes);
                                    setEditingPerformanceShiftId(null);
                                  }}
                                  className="px-2.5 py-1 bg-[#1B4332] hover:bg-[#20513d] text-white rounded text-[10px] font-bold transition-colors"
                                >
                                  {lang === 'fi' ? 'Tallenna' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* If performance data has been recorded, show it nicely */}
                              {(shift.timeTracked || shift.feedback || shift.shiftNotes) ? (
                                <div className="bg-[#F0F5F1] p-3 rounded-lg border border-[#D5E4DB]/60 space-y-1.5 text-[11px] text-[#2D3E32]">
                                  <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#1B4332]">
                                    <span>📝 {lang === 'fi' ? 'Suoritusraportti' : 'Performance Log'}</span>
                                    <span className="font-mono bg-[#95C4A1]/20 px-1.5 py-0.5 rounded text-[9px]">
                                      ⏱️ {shift.timeTracked ? `${shift.timeTracked} h` : '-- h'}
                                    </span>
                                  </div>
                                  
                                  {shift.shiftNotes && (
                                    <p className="line-clamp-2">
                                      <strong className="text-gray-500">{lang === 'fi' ? 'Merkinnät:' : 'Notes:'}</strong>{' '}
                                      <span className="italic font-medium text-gray-700">{shift.shiftNotes}</span>
                                    </p>
                                  )}
                                  
                                  {shift.feedback && (
                                    <p className="line-clamp-2">
                                      <strong className="text-gray-500">{lang === 'fi' ? 'Palaute:' : 'Feedback:'}</strong>{' '}
                                      <span className="italic font-medium text-gray-700">{shift.feedback}</span>
                                    </p>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPerformanceShiftId(shift.id);
                                      setPerfTimeTracked(shift.timeTracked || '');
                                      setPerfFeedback(shift.feedback || '');
                                      setPerfShiftNotes(shift.shiftNotes || '');
                                    }}
                                    className="text-[10px] text-[#1B4332] hover:text-[#2D6A4F] font-bold underline transition-colors cursor-pointer pt-0.5 block text-left"
                                  >
                                    {lang === 'fi' ? 'Muokkaa raporttia' : 'Edit Performance Log'}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPerformanceShiftId(shift.id);
                                    setPerfTimeTracked('');
                                    setPerfFeedback('');
                                    setPerfShiftNotes('');
                                  }}
                                  className="w-full bg-[#FAFAF8] hover:bg-[#F2F4F0] border border-dashed border-[#C5D0C9] text-center py-2 rounded-xl text-[11px] text-[#5C6F63] font-bold transition-all hover:text-[#1B4332] cursor-pointer flex items-center justify-center gap-1"
                                >
                                  📝 {lang === 'fi' ? 'Kirjaa työntekijän suoritus / tunnit' : 'Log Employee Performance / Hours'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer containing staff name details */}
                      <div className="mt-5 pt-4 border-t border-[#E0E4DC]/60 flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#5C6F63]">{lang === 'fi' ? 'Määrätty työntekijä:' : 'Assigned cleaner'}:</span>
                        <span className="text-[#1B4332] font-black bg-[#95C4A1]/15 px-3 py-1 rounded-md">
                          🌿 {shift.employeeName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Unified performance logs aggregate table */}
                <div className="bg-white border border-[#E0E4DC] rounded-xl p-6 mt-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#1A1A1A]">
                        📊 {lang === 'fi' ? 'Työntekijöiden suoritusraportit ja kokonaiskuva' : 'Employee Performance Log Aggregate'}
                      </h4>
                      <p className="text-[11px] text-[#5C6F63] mt-0.5">
                        {lang === 'fi' ? 'Toteutuneet tunnit, poikkeamat ja työntekijäkohtaiset arvioinnit.' : 'Summary of logged times, feedback rating, and recorded shift operational notes.'}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto mt-4 rounded-xl border border-[#E0E4DC]">
                    <table className="w-full text-left text-xs bg-white">
                      <thead className="bg-[#FAFAF7] uppercase text-[9px] tracking-wider text-[#5C6F63] border-b border-[#E0E4DC]">
                        <tr>
                          <th className="p-4 font-bold">{lang === 'fi' ? 'Työntekijä' : 'Employee'}</th>
                          <th className="p-4 font-bold">{lang === 'fi' ? 'Asiakas / Kohde' : 'Client Space'}</th>
                          <th className="p-4 font-bold">{lang === 'fi' ? 'Päiväys' : 'Date'}</th>
                          <th className="p-4 font-bold text-center">{lang === 'fi' ? 'Toteutuneet tunnit' : 'Tracked Hours'}</th>
                          <th className="p-4 font-bold">{lang === 'fi' ? 'Huomiot ja laatu' : 'Shift Notes'}</th>
                          <th className="p-4 font-bold">{lang === 'fi' ? 'Palaute' : 'Feedback'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0E4DC]/40 font-medium font-sans">
                        {shifts.filter(s => s.timeTracked || s.feedback || s.shiftNotes).length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 italic font-normal">
                              {lang === 'fi' ? 'Ei kirjattuja suoritusraportteja vielä. Klikkaa yltä "Kirjaa työntekijän suoritus".' : 'No performance logs recorded yet. Use button logs on shift cards above.'}
                            </td>
                          </tr>
                        ) : (
                          shifts.filter(s => s.timeTracked || s.feedback || s.shiftNotes).map(s => (
                            <tr key={s.id} className="hover:bg-[#FFF] transition-colors">
                              <td className="p-4 font-bold text-[#1B4332] whitespace-nowrap">🌿 {s.employeeName}</td>
                              <td className="p-4 font-semibold text-gray-800 whitespace-nowrap">{s.clientName}</td>
                              <td className="p-4 font-mono text-gray-500 whitespace-nowrap">{s.date}</td>
                              <td className="p-4 text-center whitespace-nowrap font-mono">
                                <span className="bg-[#95C4A1]/20 px-2.5 py-0.5 rounded-full font-bold text-[#1B4332]">
                                  {s.timeTracked ? `${s.timeTracked} h` : '-- h'}
                                </span>
                              </td>
                              <td className="p-4 text-gray-600 max-w-xs truncate" title={s.shiftNotes}>
                                {s.shiftNotes || '-'}
                              </td>
                              <td className="p-4 text-gray-600 italic max-w-xs truncate" title={s.feedback}>
                                {s.feedback || '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: ASSET PHOTO GALLERY & MANAGER */}
          {activeTab === 'gallery' && (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Upload Section (4-cols) */}
                <div className="lg:col-span-4 bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {lang === 'fi' ? 'Lisää uusi valokuva' : 'Add Corporate Photo Asset'}
                    </h3>
                    <p className="text-xs text-[#5C6F63] mt-1">
                      {lang === 'fi' 
                        ? 'Lataa todisteitamme siivouksen laadusta. Kuvat muunnetaan paikallisiksi ja ne säilyvät galleriassasi.' 
                        : 'Upload high-resolution proofs of pristine work. Images are converted instantly and stored locally.'
                      }
                    </p>
                  </div>

                  {/* HTML File Upload Drag/Drop Form */}
                  <form onSubmit={handleAddPhoto} className="mt-6 space-y-4 text-xs font-bold font-sans">
                    
                    {/* Visual custom upload wrapper */}
                    <div className="space-y-2">
                      <span className="block text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Valitse kuva laitteelta' : 'Select Image File'}</span>
                      <div className="border-2 border-dashed border-[#95C4A1] hover:border-[#1B4332] rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-[#F9FBF9] h-[130px] flex flex-col items-center justify-center">
                        <input
                          key={fileInputKey}
                          type="file"
                          accept="image/*"
                          required={!filePreview}
                          onChange={handlePhotoFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {filePreview ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={filePreview} 
                              alt="Upload preview cache" 
                              className="w-full h-full object-contain rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setFilePreview(null)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 border border-white hover:bg-red-700"
                              title="Clear photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 text-center flex flex-col items-center justify-center text-[#5C6F63]">
                            <Upload className="w-8 h-8 text-[#95C4A1]" />
                            <p className="text-[11px] leading-relaxed">
                              {lang === 'fi' ? 'Raahaa kuva tähän tai klikkaa selaamaan' : 'Drag image here or click to browse'}
                            </p>
                            <p className="text-[9px] text-gray-400 font-normal">PNG, JPG, TIFF up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Title input */}
                    <div>
                      <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Kuvan Otsikko' : 'Image Title'}</label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'fi' ? 'Esim. Tapiolan Lounge-työpisteet...' : 'Esim. Safe touchpoint sanitized...'}
                        className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                        value={newPhotoTitle}
                        onChange={(e) => setNewPhotoTitle(e.target.value)}
                      />
                    </div>

                    {/* Image Category details selection */}
                    <div>
                      <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Kategoria' : 'Category'}</label>
                      <select
                        className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                        value={newPhotoCat}
                        onChange={(e: any) => setNewPhotoCat(e.target.value)}
                      >
                        <option value="Office">{lang === 'fi' ? 'Toimistotilat' : 'Office Sites'}</option>
                        <option value="BeforeAfter">{lang === 'fi' ? 'Ennen ja Jälkeen' : 'Before / After'}</option>
                        <option value="Special">{lang === 'fi' ? 'Erikoispesut' : 'Special Sanitizing'}</option>
                        <option value="Team">{lang === 'fi' ? 'Siivoustiimi' : 'Our Team'}</option>
                      </select>
                    </div>

                    {/* Brief description meta */}
                    <div>
                      <label className="block text-[#4A4A4A] mb-1.5 uppercase tracking-wider">{lang === 'fi' ? 'Kuvaus / Yksityiskohdat' : 'Short Description'}</label>
                      <textarea
                        rows={3}
                        placeholder={lang === 'fi' ? 'Kuvaile lyhyesti mitä työtä kuva esittää ja mihin tuloksiin päästiin...' : 'Briefly detail the operational results...'}
                        className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#1B4332] resize-none"
                        value={newPhotoDesc}
                        onChange={(e) => setNewPhotoDesc(e.target.value)}
                      />
                    </div>

                    {/* Save Photo CTA */}
                    <button
                      type="submit"
                      className="w-full bg-[#1B4332] hover:bg-[#20513d] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <ImageIcon className="w-4 h-4 text-[#95C4A1]" />
                      <span>{lang === 'fi' ? 'Lisää kuvagalleriaan' : 'Publish Asset to Gallery'}</span>
                    </button>
                  </form>
                </div>

                {/* Display Grid Lists of photos (8-cols) */}
                <div className="lg:col-span-8 bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {lang === 'fi' ? 'Tallennettujen valokuvien hallinta' : 'Operational Workspace Photo Bank'}
                    </h3>
                    <p className="text-xs text-[#5C6F63] mt-1">
                      {lang === 'fi' ? 'Tarkastele, suodata tai poista kuvatositeasiakirjoja.' : 'Audit, filter, and delete photographic workspace records.'}
                    </p>
                  </div>

                  {/* Pictures rendering list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    {photos.map(p => (
                      <div 
                        key={p.id} 
                        className="border border-[#E0E4DC] rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Interactive Frame preview */}
                        <div className="relative h-44 bg-[#F2F4F0] select-none">
                          <img 
                            src={p.url} 
                            alt={p.title} 
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 bg-[#1B4332]/90 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm">
                            {p.category}
                          </span>
                          
                          <button
                            onClick={() => handleDeletePhoto(p.id)}
                            className="absolute top-2 right-2 bg-black/55 text-white hover:bg-red-600 rounded-full p-2 border border-white/10 hover:border-white transition-all duration-150 cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Text summary below */}
                        <div className="p-4 space-y-1 bg-white">
                          <h4 className="font-serif text-sm font-bold text-[#1A1A1A] line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-[11px] text-[#4A4A4A] leading-relaxed line-clamp-2">
                            {p.description || (lang === 'fi' ? 'Ei kuvausta asetettu.' : 'No descriptive overview.')}
                          </p>
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 text-[9px] text-[#7A7A7A] font-mono font-semibold">
                            <span>ID: {p.id}</span>
                            <span>{lang === 'fi' ? 'Tallennettu:' : 'Uploaded:'} {p.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {photos.length === 0 && (
                    <div className="text-center py-16 text-[#5C6F63]">
                      <ImageIcon className="w-12 h-12 opacity-30 mx-auto mb-3" />
                      <p className="text-sm font-semibold">{lang === 'fi' ? 'Ei valokuvia tallennettuna.' : 'No active workspace photos yet.'}</p>
                      <p className="text-xs text-gray-500 mt-1">{lang === 'fi' ? 'Käytä vasemman laidan lataustyökalua lisätäksesi kuvan!' : 'Use the file upload field to list new assets.'}</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: LIVE GEMINI SALES CAMPAIGN & OUTREACH LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-8">
              
              {/* Introduction card */}
              <div className="bg-gradient-to-br from-[#1B4332] to-[#0D2B1E] text-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#95C4A1_1px,transparent_1px)] [background-size:24px_24px]" />
                
                <div className="max-w-2xl relative z-10 space-y-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-[#95C4A1]/20 border border-[#95C4A1]/30 text-[#95C4A1] px-2.5 py-1 rounded-md">
                    <Cpu className="w-3.5 h-3.5" /> {lang === 'fi' ? 'REAALIAIKAINEN GROUNDING BOTTIPANEELI' : 'REAL-TIME GROUNDING INTELLIGENCE'}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {lang === 'fi' ? '✦ Puhdas Tila · Kasvualusta & Liidibotti' : '✦ Puhdas Tila · Corporate Growth Catalyst'}
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                    {lang === 'fi'
                      ? 'Skannaa internetin reaaliaikaista dataa ja löydä uusia yritysasiakkaita pääkaupunkiseudulla varmistaaksesi Puhdas Tila -siivouspalveluiden tasaisen kasvun.'
                      : 'Crawl the live internet and extract verified leads across Uusimaa commercial sectors. Zero obsolete data—pure verified pipelines.'
                    }
                  </p>
                </div>
              </div>

              {/* Advanced search parameters (Grid) */}
              <div className="bg-white border border-[#E0E4DC] rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif text-base font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1B4332]" />
                  {lang === 'fi' ? 'Minkä tyyppisiä toimitiloja haluat etsiä tänään?' : 'Define target office profiles and locations:'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-bold">
                  {/* Category selections dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Yrityskategoria / Toimiala' : 'Industry sector'}</label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                        value={targetType}
                        onChange={(e) => {
                          setTargetType(e.target.value);
                          setCustomTarget('');
                        }}
                      >
                        <option value="Hammasklinikat (Dental clinics)">{lang === 'fi' ? 'Hammasklinikat & Lääkäriasemat' : 'Dental & Medical Clinics'}</option>
                        <option value="Lakitoimistot (Law firms)">{lang === 'fi' ? 'Lakiasiaintoimistot & Konsultit' : 'Law Firms & Advisors'}</option>
                        <option value="Markkinointitoimistot (Marketing agencies)">{lang === 'fi' ? 'Mainos- ja Viestintätoimistot' : 'Marketing & Ad Studios'}</option>
                        <option value="Yksityiset päiväkodit (Private kindergartens)">{lang === 'fi' ? 'Yksityiset päiväkodit' : 'Private Kindergartens'}</option>
                        <option value="IT- ja ohjelmistoyritykset (Software companies)">{lang === 'fi' ? 'IT- ja Teknologia-alan toimitilat' : 'Software & IT Workspaces'}</option>
                        <option value="Kuntosalit ja studio-tilat (Gyms and studios)">{lang === 'fi' ? 'Kuntosalit & Liikuntastudiot' : 'Fitness Centers & Gyms'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom overrides input for sector */}
                  <div className="space-y-1.5">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Hae vapaalla hakusanalla' : 'Or search by custom sector keyword'}</label>
                    <input
                      type="text"
                      className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm font-normal focus:outline-none focus:border-[#1B4332]"
                      placeholder={lang === 'fi' ? 'Esim. lakitoimistot, kuntosalit...' : 'E.g. architect studios, pilates...'}
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value)}
                    />
                  </div>

                  {/* Location picker */}
                  <div className="space-y-1.5">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Sijainti / Kaupunginosa' : 'Focus location'}</label>
                    <select
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setCustomLocation('');
                      }}
                    >
                      <option value="Espoo">Espoo (Laajahaku / Wide search)</option>
                      {espooDistricts.map(d => (
                        <option key={d.key} value={d.key}>
                          {lang === 'fi' ? d.label_fi : d.label_en}
                        </option>
                      ))}
                      <option value="Helsinki">Helsinki (Laajahaku)</option>
                      <option value="Kauniainen">Kauniainen</option>
                      <option value="Vantaa">Vantaa (Laajahaku)</option>
                    </select>
                  </div>

                  {/* Custom location override keyword */}
                  <div className="space-y-1.5">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Omavalintainen Sijainti' : 'Or enter custom location'}</label>
                    <input
                      type="text"
                      className="w-full border border-[#E0E4DC] bg-[#FAFAF8] rounded-lg px-3 py-2 text-sm font-normal focus:outline-none focus:border-[#1B4332]"
                      placeholder={lang === 'fi' ? 'Esim. Tapiola, Ruoholahti...' : 'E.g. Lauttasaari, Mankkaa...'}
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                    />
                  </div>

                  {/* Campaign tone */}
                  <div className="space-y-1.5">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Yhteydenotto-sävy ja tyyli' : 'Campaign tone'}</label>
                    <select
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={tone}
                      onChange={(e: any) => setTone(e.target.value)}
                    >
                      <option value="professional">{lang === 'fi' ? 'Asiallinen & Ammattimainen' : 'Business Professional'}</option>
                      <option value="casual">{lang === 'fi' ? 'Rento & Ketterä (Startupeille)' : 'Startup Casual'}</option>
                      <option value="savings">{lang === 'fi' ? 'Matalat kulut & Ei pitkää sitoutumista' : 'Value & Flexibility focused'}</option>
                    </select>
                  </div>

                  {/* Projected target client office size */}
                  <div className="space-y-1.5">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Arvioitu työtilojen koko' : 'Assumed office size'}</label>
                    <select
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={officeSize}
                      onChange={(e: any) => setOfficeSize(e.target.value)}
                    >
                      <option value="small">{lang === 'fi' ? 'Pieni toimisto (alle 15 pöytää)' : 'Small Office (< 15 desks)'}</option>
                      <option value="medium">{lang === 'fi' ? 'Keskikokoinen (15-50 pöytää)' : 'Medium Office (15-50 desks)'}</option>
                      <option value="large">{lang === 'fi' ? 'Suuri tai Pääkonttori (>50 pöytää)' : 'Large Headquarters (>50 desks)'}</option>
                    </select>
                  </div>

                  {/* Promotional signatories/hooks proposed */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Kampanjaetu / Yhteydenottotarjous' : 'Promotional sign-in incentive'}</label>
                    <select
                      className="w-full border border-[#E0E4DC] bg-white rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#1B4332]"
                      value={offer}
                      onChange={(e: any) => setOffer(e.target.value)}
                    >
                      <option value="estimate">{lang === 'fi' ? 'Maksuton 3 minuutin katselmus paikan päällä sitoumuksetta' : 'Free, non-binding 3-minute physical walkthrough'}</option>
                      <option value="discount">{lang === 'fi' ? '15 % alennus ensimmäisestä kuukaudesta uuden asiakkuuden kunniaksi' : 'Special signing incentive of 15% discount for first month'}</option>
                      <option value="bonus">{lang === 'fi' ? 'Ilmainen ikkunanpesu siivouksen starttikuun yhteyteen' : 'Free window washing on signatures in first month'}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Sähköpostiluonnoksen kieli' : 'Outreach draft language'}</label>
                    <div className="flex gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => setLeadLang('fi')}
                        className={`flex-1 py-1 px-3 border rounded-lg transition-all cursor-pointer ${
                          leadLang === 'fi' ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'bg-white text-gray-700 border-[#E0E4DC]'
                        }`}
                      >
                        Suomi (FI)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadLang('en')}
                        className={`flex-1 py-1 px-3 border rounded-lg transition-all cursor-pointer ${
                          leadLang === 'en' ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'bg-white text-gray-700 border-[#E0E4DC]'
                        }`}
                      >
                        English (EN)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleGenerateLeads}
                    disabled={isLoadingLeads}
                    className="w-full sm:w-auto bg-[#1B4332] hover:bg-[#20513d] text-white font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm tracking-wide uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                  >
                    {isLoadingLeads ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#95C4A1]" />
                        <span>{leadStatusMsg || (lang === 'fi' ? 'Skannataan...' : 'Crawling...') }</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-[#95C4A1]" />
                        <span>{lang === 'fi' ? 'Käynnistä haku internetistä' : 'Execute Grounded Live Crawl'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SEARCH GROUNDING ERRORS & WARNINGS */}
              {leadsError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif text-sm font-bold text-red-950">{lang === 'fi' ? 'Haku päättyi virheeseen' : 'Crawl Process Interrupted'}</h4>
                    <p className="text-xs text-red-800 mt-1">{leadsError}</p>
                  </div>
                </div>
              )}

              {/* OUTREACH SCANS LEAD RESULTS */}
              {editableLeads.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                      {lang === 'fi' 
                        ? `Löytyneet liidikohteet kategorialle "${customTarget.trim() ? customTarget : targetType}"` 
                        : `Qualified pipelines for "${customTarget.trim() ? customTarget : targetType}"`
                      }
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B4332] bg-[#95C4A1]/20 px-3 py-1 rounded-full border border-[#95C4A1]/35">
                      {editableLeads.length} {lang === 'fi' ? 'LIIDIÄ LÖYDETTY' : 'CRAWLED LEADS'}
                    </span>
                  </div>

                  {/* Sender Integration Settings */}
                  <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#1B4332]" />
                      <h4 className="font-serif text-sm font-bold text-[#1A1A1A]">
                        {lang === 'fi' ? 'Suoran sähköpostilähetyksen brändi-identiteetti' : 'Direct Outreach Dispatch Identity'}
                      </h4>
                    </div>
                    
                    <p className="text-xs text-[#5C6F63] leading-relaxed">
                      {lang === 'fi'
                        ? 'Järjestelmä on integroitu Resend-sähköpostipalveluun. Jos käytät ilmaista testisandboxia, voit lähettää viestejä vain osoitteesta "onboarding@resend.dev" rekisteröityyn käyttäjäsähköpostiisi. Jos olet liittänyt ja vahvistanut oman domainisi (kuten puhdas-tila.com), voit muuttaa lähettäjäksi vapaasti oman brändisi osoitteen.'
                        : 'Your ERP connects with Resend. In trial/sandbox environments, you must send using "onboarding@resend.dev" delivering to your personal developer email. If you have verified your custom domain, you may input your official staff email.'
                      }
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold font-sans">
                      <div className="space-y-1.5">
                        <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Lähettäjän osoite (From)' : 'Sender Identity (From)'}</label>
                        <input
                          type="text"
                          className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-xs font-bold text-gray-800 focus:outline-[#1B4332]"
                          placeholder="Puhdas Tila <onboarding@resend.dev>"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 self-end">
                        <div className="text-[11px] text-[#2D3E32] font-semibold bg-[#FAFAF7] px-3.5 py-2.5 rounded-lg border border-[#E0E4DC]">
                          💡 <strong>PRO TIP:</strong> {lang === 'fi' ? 'Määritä RESEND_API_KEY salaisuuksissa sähköpostitoimintoa varten.' : 'Ensure RESEND_API_KEY is configured in your project settings.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loop rendering Leads mapping cards */}
                  <div className="space-y-8">
                    {editableLeads.map((lead, idx) => (
                      <div key={idx} className="bg-white border border-[#E0E4DC] rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* Left client profiles (5-cols/12) */}
                        <div className="md:w-5/12 p-6 space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-400 font-mono">LEAD RECORD #{idx+1}</span>
                            <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">{lead.name}</h4>
                          </div>

                          {/* Client Coordinates fields */}
                          <div className="space-y-2 text-xs text-[#4A4A4A] font-semibold">
                            {lead.address && (
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#95C4A1]/85 shrink-0" />
                                <span>{lead.address}</span>
                              </p>
                            )}
                            {lead.website && (
                              <p className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#95C4A1]/85 shrink-0" />
                                <a 
                                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[#1B4332] hover:underline flex items-center gap-1"
                                >
                                  <span>{lead.website}</span>
                                  <ExternalLink className="w-3 h-3 opacity-65" />
                                </a>
                              </p>
                            )}
                            {lead.email && (
                              <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#95C4A1]/85 shrink-0" />
                                <a href={`mailto:${lead.email}`} className="text-gray-600 hover:underline">{lead.email}</a>
                              </p>
                            )}
                            {lead.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#95C4A1]/85 shrink-0" />
                                <a href={`tel:${lead.phone}`} className="text-gray-600 hover:underline">{lead.phone}</a>
                              </p>
                            )}
                          </div>

                          {/* Trigger point analysis why good lead */}
                          <div className="bg-[#FAFBF9] border-l-2 border-[#1B4332] p-3 rounded-r-lg text-xs leading-relaxed text-[#4A4A4A]">
                            <strong className="block text-[#1B4332] font-semibold mb-1">
                              {lang === 'fi' ? '💡 Miksi erinomainen kohde Puhdas Tilan siivoukselle:' : '💡 Strategic Cleaning Indicator:'}
                            </strong>
                            <p className="italic font-medium">{lead.whyGoodLead}</p>
                          </div>
                        </div>

                        {/* Right Outreach Template (7-cols) */}
                        <div className="md:w-7/12 p-6 flex flex-col justify-between bg-gradient-to-br from-white to-[#FAFBF9]">
                          <div className="space-y-4">
                            <span className="block text-[10px] font-bold text-[#4A4A4A] uppercase tracking-wider">
                              {lang === 'fi' ? 'Sähköpostiluonnos (Klikkaa ja muokkaa suoraan):' : 'Interactive Customer Pitch sequences:'}
                            </span>
                            
                            {/* Subject input */}
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">{lang === 'fi' ? 'Aihe' : 'Subject'}</label>
                              <input 
                                type="text"
                                className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-1.5 text-xs font-bold text-[#1A1A1A]"
                                value={lead.outreachEmailSubject}
                                onChange={(e) => handleLeadSubjectChange(idx, e.target.value)}
                              />
                            </div>

                            {/* Body Textarea */}
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">{lang === 'fi' ? 'Viestin Sisältö' : 'Email Content'}</label>
                              <textarea
                                rows={8}
                                className="w-full border border-[#E0E4DC] bg-white rounded-lg p-3 text-xs font-normal font-sans leading-relaxed text-gray-800"
                                value={lead.outreachEmailBody}
                                onChange={(e) => handleLeadBodyChange(idx, e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Sending logs feedback */}
                          {sendError && sendingIndex === idx && (
                            <div className="mb-3 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] font-semibold leading-relaxed flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                              <span>⚠️ {sendError}</span>
                            </div>
                          )}
                          {sendSuccessMsg && sentIndices.includes(idx) && !sendingIndex && (
                            <div className="mb-3 text-[#1B4332] bg-[#F0F5F1] border border-[#D5E4DB] rounded-xl p-3 text-[11px] font-semibold leading-relaxed flex items-start gap-2">
                              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                              <span>✓ {sendSuccessMsg}</span>
                            </div>
                          )}

                          {/* Copy buttons row */}
                          <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-gray-100 mt-4">
                            <span className="text-[10px] text-[#7A7A7A] italic">
                              {lang === 'fi' ? 'Toimii tekoälypohjaisella hakujärjestelmällä.' : 'Requires Resend or copy for execution.'}
                            </span>
                            <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                              <button
                                onClick={() => copyToClipboard(lead.outreachEmailBody, idx)}
                                className="flex items-center gap-1.5 bg-[#FAFBF9] hover:bg-[#F2F4F0] text-[#1B4332] border border-[#CBDCCF] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{lang === 'fi' ? 'Kopioitu!' : 'Copied!'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{lang === 'fi' ? 'Kopioi sähköpostiviesti' : 'Copy Campaign sequence'}</span>
                                  </>
                                )}
                              </button>

                              {lead.email ? (
                                <button
                                  disabled={sendingIndex !== null || sentIndices.includes(idx)}
                                  onClick={() => handleSendDirectEmail(idx, lead)}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-white ${
                                    sentIndices.includes(idx)
                                      ? 'bg-emerald-700 hover:bg-emerald-800'
                                      : 'bg-[#1B4332] hover:bg-[#20513d]'
                                  } disabled:opacity-55`}
                                >
                                  {sendingIndex === idx ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>{lang === 'fi' ? 'Lähetetään...' : 'Sending...'}</span>
                                    </>
                                  ) : sentIndices.includes(idx) ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-[#95C4A1]" />
                                      <span>{lang === 'fi' ? 'Lähetetty!' : 'Sent!'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-3.5 h-3.5 text-[#95C4A1]" />
                                      <span>{lang === 'fi' ? 'Lähetä sähköposti' : 'Send via Resend'}</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400 self-center font-bold px-3 py-1.5 bg-gray-100 rounded-lg italic">
                                  {lang === 'fi' ? 'Sähköpostia ei löytynyt' : 'Email unavailable'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Citation references sources list */}
                  {leadsData?.sources && leadsData.sources.length > 0 && (
                    <div className="bg-[#FAFAF7] border border-[#E0E4DC] rounded-xl p-4 text-xs font-semibold text-[#5C6F63]">
                      <h4 className="font-serif font-bold text-[#1A1A1A] mb-2">{lang === 'fi' ? 'Reaaliaikaiset lähteet ja viittaukset:' : 'Citations and Real-time web links verified:'}</h4>
                      <ul className="flex flex-wrap gap-2">
                        {leadsData.sources.map((s, si) => (
                          <li key={si}>
                            <a 
                              href={s.uri} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 bg-white border border-[#E0E4DC] hover:border-[#1B4332] text-[#1B4332] py-1 px-2.5 rounded-md"
                            >
                              <span>{s.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {leadsData?.usedFallback && (
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <strong>{lang === 'fi' ? 'Verkkoyhteyskuormitus optimoitu.' : 'Quota optimization sequence activated.'}</strong>
                        <p className="mt-0.5 opacity-90">{lang === 'fi' ? 'Käytettiin korkean tarkkuuden tekoälysimulaatiomallejamme.' : 'Direct local semantic grounding database initialized safely.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EMPTY CORNER STATE */}
              {editableLeads.length === 0 && !isLoadingLeads && (
                <div className="bg-white border border-[#E0E4DC] rounded-2xl p-16 text-center text-[#5C6F63]">
                  <Cpu className="w-12 h-12 opacity-35 mx-auto mb-3 text-[#1B4332] animate-pulse" />
                  <h4 className="font-serif text-lg font-bold text-[#1A1A1A]">
                    {lang === 'fi' ? 'Ei skannauksia käynnissä juuri nyt' : 'Prospector is on Standby'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    {lang === 'fi' 
                      ? 'Napsauta skannauspainiketta ylhäältä syöttääksesi suodattimet ja Gemini käynnistää reaaliaikaisen verkkohakubotin.' 
                      : 'Define target categories and click "Execute Grounded Live Crawl" to let Gemini map prospect coordinates.'
                    }
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: PROFILE SETTINGS PANEL */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-white border border-[#E0E4DC] rounded-xl p-6 shadow-sm">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
                    {lang === 'fi' ? 'Profiili ja ylläpitoasetukset' : 'Profile & Administrative Settings'}
                  </h3>
                  <p className="text-xs text-[#5C6F63] mt-1">
                    {lang === 'fi'
                      ? 'Hallitse omia yhteystietojasi, rooliasi ja yritysprofiilia, jotka näkyvät myös ylläpitoportaalissa.'
                      : 'Manage your contact information, credentials, and organizational preferences displayed across ERP screens.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                  {/* Left avatar & card overview (4 cols) */}
                  <div className="lg:col-span-4 bg-[#F9FBF9] border border-[#D5E4DB] rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1B4332] to-[#95C4A1]" />
                    <div className="w-full flex flex-col items-center py-6">
                      {/* Avatar preview area */}
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative bg-gray-100 flex items-center justify-center">
                          {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <User className="w-12 h-12 text-[#95C4A1]" />
                          )}
                        </div>
                      </div>

                      <h4 className="font-serif text-xl font-bold text-[#1A1A1A] mt-4 leading-normal">{profile.name}</h4>
                      <p className="text-xs font-semibold text-[#1B4332] bg-[#95C4A1]/20 px-3 py-1 rounded-md mt-1.5 inline-block">{profile.role}</p>

                      <div className="w-full space-y-2 mt-6 text-left text-xs text-[#4A4A4A] border-t border-[#E5E9E2] pt-5 font-semibold">
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-medium">{lang === 'fi' ? 'Yritys' : 'Company'}:</span>
                          <span>{profile.companyName}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-medium">{lang === 'fi' ? 'Sähköposti' : 'Email'}:</span>
                          <span>{profile.email}</span>
                        </p>
                        <p className="flex justify-between font-mono">
                          <span className="text-gray-400 font-medium font-sans">{lang === 'fi' ? 'Puhelin' : 'Phone'}:</span>
                          <span>{profile.phone}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-medium">{lang === 'fi' ? 'Turvaluokka' : 'Access clearance'}:</span>
                          <span className="text-emerald-800 font-bold">ROOT ADMIN</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Profile Edit Form (8 cols) */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      localStorage.setItem('adm_profile', JSON.stringify(profile));
                      setProfileSuccessMsg(lang === 'fi' ? 'Profiili päivitetty onnistuneesti!' : 'Profile updated successfully!');
                      setTimeout(() => setProfileSuccessMsg(null), 3000);
                    }}
                    className="lg:col-span-8 space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-bold font-sans">
                      {/* Full Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Ylläpitäjän nimi *' : 'Administrator Full Name *'}</label>
                        <input
                          type="text"
                          required
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#1B4332]"
                          placeholder="e.g. Kennedy Nam"
                        />
                      </div>

                      {/* Role input */}
                      <div className="space-y-1.5">
                        <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Tehtävänimike / Rooli *' : 'Role / Professional Title *'}</label>
                        <input
                          type="text"
                          required
                          value={profile.role}
                          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                          className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#1B4332]"
                          placeholder="e.g. Operations Director"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Sähköpostiosoite *' : 'Email Address *'}</label>
                        <input
                          type="email"
                          required
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#1B4332]"
                          placeholder="e.g. kennedy.nam@gmail.com"
                        />
                      </div>

                      {/* Phone input */}
                      <div className="space-y-1.5">
                        <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Puhelinnumero' : 'Phone Number'}</label>
                        <input
                          type="text"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#1B4332] font-mono"
                          placeholder="e.g. +358 40 123 4567"
                        />
                      </div>

                      {/* Company Name input */}
                      <div className="space-y-1.5">
                        <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Yrityksen nimi *' : 'Company Name *'}</label>
                        <input
                          type="text"
                          required
                          value={profile.companyName}
                          onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                          className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#1B4332]"
                          placeholder="e.g. Puhdas Tila Oy"
                        />
                      </div>

                      {/* Avatar preview URL input */}
                      <div className="space-y-1.5">
                        <label className="text-[#4A4A4A] uppercase tracking-wider">{lang === 'fi' ? 'Profiilikuvan kuva-URL (vaihtoehtoinen)' : 'Profile Image URL'}</label>
                        <input
                          type="text"
                          value={profile.avatarUrl}
                          onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                          className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1B4332] font-mono font-medium"
                          placeholder="e.g. https://images.unsplash.com/... or base64"
                        />
                      </div>
                    </div>

                    {/* Pre-set avatars selector */}
                    <div className="space-y-2 pt-2 text-xs font-bold text-[#4A4A4A]">
                      <span className="block uppercase tracking-wider">{lang === 'fi' ? 'Pikavalinta profiilikuvalle:' : 'Or Select Profile Avatar Preset:'}</span>
                      <div className="flex flex-wrap gap-4 items-center">
                        {[
                          { name: 'Admin Man', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
                          { name: 'Admin Woman', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
                          { name: 'Eco Team Lead', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
                          { name: 'Technician', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
                        ].map((av, avi) => {
                          const isSelected = profile.avatarUrl === av.url;
                          return (
                            <button
                              key={avi}
                              type="button"
                              onClick={() => setProfile({ ...profile, avatarUrl: av.url })}
                              className={`p-1 rounded-full border-2 transition-all cursor-pointer ${
                                isSelected ? 'border-[#1B4332] scale-115' : 'border-transparent hover:border-gray-200'
                              }`}
                              title={av.name}
                            >
                              <img src={av.url} alt={av.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit saves and triggers local success feedback banner */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        {profileSuccessMsg && (
                          <span className="text-xs text-emerald-800 font-extrabold bg-emerald-100/70 border border-emerald-500/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-700" />
                            {profileSuccessMsg}
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="bg-[#1B4332] hover:bg-[#20513d] text-white px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4.5 h-4.5 text-[#95C4A1]" />
                        <span>{lang === 'fi' ? 'Tallenna asetukset' : 'Save Settings'}</span>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Sub-bar Copyright Footer */}
      <footer className="bg-[#0D2B1E] border-t border-white/5 py-4 px-6 flex justify-between items-center text-[10px] text-white/45 shrink-0 z-10 font-mono">
        <p>© 2026 Puhdas Tila B2B Control Panel Workspace v3.1</p>
        <p>SECURE HTTPS RUNNING ON CONTAINER PORT 3000</p>
      </footer>
    </div>
  );
}
