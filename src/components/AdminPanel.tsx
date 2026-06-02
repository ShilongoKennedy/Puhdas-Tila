import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Search, Sparkles, Copy, Check, X, 
  MapPin, Globe, Mail, Phone, ExternalLink, HelpCircle, 
  RefreshCw, Cpu, ShieldCheck, KeyRound, LogOut, ChevronRight,
  LayoutDashboard, TrendingUp, TrendingDown, DollarSign, Calendar,
  Plus, Trash2, Clock, AlertCircle, FileText,
  UserCheck, ShieldAlert, User, Settings, Users, BookOpen, ClipboardList, Briefcase, Filter, ArrowRight, Package,
  Upload, Download, File, Paperclip
} from 'lucide-react';
import { Language } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

// Definitions for local storage persistent states

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
  companyName: string;
  avatarUrl: string;
}

interface AdminPanelProps {
  lang: Language;
  setLang?: (lang: Language) => void;
  onClose: () => void;
}

interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  contractType: string;
  joiningDate: string;
  taxCardSubmitted: boolean;
  contractSigned: boolean;
  ecoChemicalTraining: boolean;
  safetyEquipmentIssued: boolean;
  firstShiftCompleted: boolean;
  hourlyRate: number;
  avatarUrl?: string;
  contracts?: Array<{ name: string; date: string; content: string; size: string }>;
  notes?: string;
}

interface OperationalFile {
  id: string;
  name: string;
  category: string;
  date: string;
  size: string;
  content: string;
}

interface Shift {
  id: string;
  employeeName: string;
  clientName: string;
  date: string;
  timeWindow: string;
  instructions: string;
  status: 'Planned' | 'Active' | 'Completed';
  timeTracked?: string;
  feedback?: string;
  shiftNotes?: string;
}

interface EcoInventoryItem {
  id: string;
  nameFi: string;
  nameEn: string;
  quantity: number;
  unit: string;
  minAlertThreshold: number;
}

interface ClientBooking {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceType: string;
  officeSize: string;
  startDate: string;
  hasSupplies: string;
  notes: string;
  status: 'Received' | 'Contacted' | 'Converted';
  createdAt: string;
}

export default function AdminPanel({ lang, setLang, onClose }: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'schedules' | 'operations' | 'profile'>('dashboard');

  // Input Password authentication
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Expanded employee for document / contracts view
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  // Operational Files List state
  const [operationalFiles, setOperationalFiles] = useState<OperationalFile[]>([]);

  // EMPLOYEES ONBOARDING ROSTER STATE
  const [employees, setEmployees] = useState<Employee[]>([]);
  // Form state for adding employee
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Siivooja (Cleaner)');
  const [newEmpContract, setNewEmpContract] = useState('Perustuntipalkka (Part-time)');
  const [newEmpJoining, setNewEmpJoining] = useState(new Date().toISOString().split('T')[0]);
  const [newEmpHourlyRate, setNewEmpHourlyRate] = useState<number>(14.5);

  // ACTIVE SCHEDULER STATE
  const [shifts, setShifts] = useState<Shift[]>([]);
  // Form state for custom shifts
  const [newShiftEmployee, setNewShiftEmployee] = useState('');
  const [newShiftClient, setNewShiftClient] = useState('');
  const [newShiftDate, setNewShiftDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newShiftTime, setNewShiftTime] = useState('08:00 - 12:00');
  const [newShiftInstructions, setNewShiftInstructions] = useState('');
  const [newShiftStatus, setNewShiftStatus] = useState<'Planned' | 'Active' | 'Completed'>('Planned');

  // ECO-INVENTORY STATE
  const [inventory, setInventory] = useState<EcoInventoryItem[]>([]);

  // CLIENT BOOKING FORM REQUESTS INQUIRIES
  const [bookings, setBookings] = useState<ClientBooking[]>([]);

  // Filtering searches
  const [empSearch, setEmpSearch] = useState('');
  const [shiftSearch, setShiftSearch] = useState('');
  const [filterOversightOnly, setFilterOversightOnly] = useState(false);

  // 1. LIFECYCLE PERSISTENCE LOAD
  useEffect(() => {
    // Check local auth token
    const savedToken = localStorage.getItem('puhdas_tila_admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }

    // Load admin profile override
    const storedProfile = localStorage.getItem('adm_profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }

    // Load Employees
    const storedEmployees = localStorage.getItem('adm_employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      const initialEmployees: Employee[] = [
        {
          id: 'emp-1',
          name: 'Taru Salonaho',
          phone: '+358 45 611 2921',
          email: 'taru.s@puhdas-tila.com',
          role: 'Palveluohjaaja (Onboarding supervisor)',
          contractType: 'Kokoaikainen (Full-time)',
          joiningDate: '2025-08-12',
          taxCardSubmitted: true,
          contractSigned: true,
          ecoChemicalTraining: true,
          safetyEquipmentIssued: true,
          firstShiftCompleted: true,
          hourlyRate: 16.2
        },
        {
          id: 'emp-2',
          name: 'Jouni Koski',
          phone: '+358 40 882 1478',
          email: 'jouni.k@gmail.com',
          role: 'Toimistosiivooja (Office cleaner)',
          contractType: 'Osa-aikainen (Part-time)',
          joiningDate: '2026-05-15',
          taxCardSubmitted: true,
          contractSigned: true,
          ecoChemicalTraining: true,
          safetyEquipmentIssued: true,
          firstShiftCompleted: false, // Onboarding in progress
          hourlyRate: 14.5
        },
        {
          id: 'emp-3',
          name: 'Aino Lindqvist',
          phone: '+358 44 911 3456',
          email: 'aino.lindqvist@outlook.com',
          role: 'Toimistosiivooja (Office cleaner)',
          contractType: 'Tarvittaessa työhön kutsuttava (On-call)',
          joiningDate: '2026-06-01',
          taxCardSubmitted: true,
          contractSigned: false, // Onboarding pending
          ecoChemicalTraining: false, // Onboarding pending
          safetyEquipmentIssued: false, // Onboarding pending
          firstShiftCompleted: false,
          hourlyRate: 14.2
        }
      ];
      setEmployees(initialEmployees);
      localStorage.setItem('adm_employees', JSON.stringify(initialEmployees));
    }

    // Load Shifts
    const storedShifts = localStorage.getItem('adm_shifts');
    if (storedShifts) {
      setShifts(JSON.parse(storedShifts));
    } else {
      const initialShifts: Shift[] = [
        { 
          id: 'sh-1', 
          employeeName: 'Taru Salonaho', 
          clientName: 'Tapiolan Hammaslääkäriasema', 
          date: new Date().toISOString().split('T')[0], 
          timeWindow: '06:00 - 10:00', 
          instructions: 'Tehosanitointi hoitotiloissa. Pyyhi hoitotuolit desinfiointiaineella. Puhdista peilit ja hanat loistokiiltäväksi. Jätteiden lajittelu tarkasti.', 
          status: 'Completed',
          timeTracked: '4.0',
          feedback: 'Erinomaista työtä, asiakas kehui kliinisen tason puhtautta.',
          shiftNotes: 'Hoitohuoneet desinfioitu biologisella bio-pesuaineella. Biojätteet viety keräykseen.'
        },
        { 
          id: 'sh-2', 
          employeeName: 'Jouni Koski', 
          clientName: 'Keilaniemi Tech Hub (A-talo)', 
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
          timeWindow: '08:00 - 12:00', 
          instructions: 'Pölyjen pyyhintä ekologisilla mikrokuituliinoilla kokoushuoneista. Imuroi tehonesteillä herkästi likaantuvat aulat.', 
          status: 'Active',
          timeTracked: '2.5',
          feedback: 'Vuoro käynnissä ja etenee loistavasti.',
          shiftNotes: 'Aulan nahkasohvan vaurio raportoitu huoltoyhtiölle.'
        },
        { 
          id: 'sh-3', 
          employeeName: 'Aino Lindqvist', 
          clientName: 'Mankkaan Toimistohotelli', 
          date: new Date(Date.now() + 259200000).toISOString().split('T')[0], // 3 days later
          timeWindow: '14:00 - 18:00', 
          instructions: 'Keittiön ja ruokailutilan ekopesu. Lattioiden pesu sitruunahappopohjaisella tiivisteellä. Tyhjennä jäteastiat.', 
          status: 'Planned',
          timeTracked: '',
          feedback: '',
          shiftNotes: ''
        },
        { 
          id: 'sh-4', 
          employeeName: 'Taru Salonaho', 
          clientName: 'Otaniemi Science Tower (Lobby)', 
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago (Oversight Alert demo)
          timeWindow: '08:00 - 11:30', 
          instructions: 'Sekoita ekologista lattianpesuainetta oikealla suhteella. Pyyhi aulan vastaanottotiski ja hissipainikkeet mikrokuituliinalla. Tyhjennä roskakorit.', 
          status: 'Planned',
          timeTracked: '',
          feedback: '',
          shiftNotes: ''
        }
      ];
      setShifts(initialShifts);
      localStorage.setItem('adm_shifts', JSON.stringify(initialShifts));
    }

    // Load Inventory
    const storedInventory = localStorage.getItem('adm_inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    } else {
      const initialInventory: EcoInventoryItem[] = [
        { id: 'inv-1', nameFi: 'Ympäristösertifioitu Yleispesuaine', nameEn: 'Sertified Eco All-Purpose Detergent', quantity: 12, unit: 'pl (bottles)', minAlertThreshold: 5 },
        { id: 'inv-2', nameFi: 'Puhdistusetikka (Hajustamaton)', nameEn: 'Unscented Cleaning Vinegar', quantity: 8, unit: 'pl (bottles)', minAlertThreshold: 4 },
        { id: 'inv-3', nameFi: 'Kierrätyskuitu-mikrokuituliinat (Setti)', nameEn: 'Recycled Microfiber Towels (Set)', quantity: 45, unit: 'kpl (pieces)', minAlertThreshold: 15 },
        { id: 'inv-4', nameFi: 'Sitruunahappopohjainen Saniteettipesu', nameEn: 'Citric Acid Sanitary Cleaner', quantity: 3, unit: 'pl (bottles)', minAlertThreshold: 5 }, // Low stock warning
        { id: 'inv-5', nameFi: 'Ympäristöystävällinen Ikkunanpesutiiviste', nameEn: 'Eco Friendly Window Wash Concentrate', quantity: 9, unit: 'pl (bottles)', minAlertThreshold: 3 },
        { id: 'inv-6', nameFi: 'Yhteensopivat HEPA-pölypussit', nameEn: 'Compatible Vacuum HEPA Filter Bags', quantity: 2, unit: 'pkt (packs)', minAlertThreshold: 5 }, // Low stock warning
        { id: 'inv-7', nameFi: 'Biohajoavat nitriilikäsineet (s-koko)', nameEn: 'Biodegradable Nitrile Gloves (S)', quantity: 32, unit: 'pkt (boxes)', minAlertThreshold: 10 }
      ];
      setInventory(initialInventory);
      localStorage.setItem('adm_inventory', JSON.stringify(initialInventory));
    }

    // Load Client bookings from localStorage
    const storedBookings = localStorage.getItem('adm_client_bookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      const initialBookings: ClientBooking[] = [
        {
          id: 'bk-1',
          companyName: 'B2B Creative Studio Espoo',
          contactName: 'Antti Nieminen',
          email: 'antti@creativestudio.fi',
          phone: '+358 50 491 5500',
          serviceType: 'weekly_clean',
          officeSize: 'medium',
          startDate: '2026-06-10',
          hasSupplies: 'yes',
          notes: 'Toimistollamme on herkkä parkettilattia, joka vaatii hellävaraista ekologista pesuainetta. Haluamme täysin hajusteettoman siivouksen.',
          status: 'Received',
          createdAt: new Date().toISOString().split('T')[0]
        },
        {
          id: 'bk-2',
          companyName: 'Tapiolan Digitoimisto',
          contactName: 'Minna Salmi',
          email: 'hello@digitoimisto.io',
          phone: '+358 40 331 8211',
          serviceType: 'heavy_clean',
          officeSize: 'small',
          startDate: '2026-06-15',
          hasSupplies: 'no',
          notes: 'Suursiivous kesäkauden aloitukseen. Toivomme ikkunapesua.',
          status: 'Contacted',
          createdAt: new Date().toISOString().split('T')[0]
        }
      ];
      setBookings(initialBookings);
      localStorage.setItem('adm_client_bookings', JSON.stringify(initialBookings));
    }

    // Load Operational Files from localStorage
    const savedOpsFiles = localStorage.getItem('adm_operational_files');
    if (savedOpsFiles) {
      setOperationalFiles(JSON.parse(savedOpsFiles));
    } else {
      const initialOpsFiles: OperationalFile[] = [
        {
          id: 'ops-1',
          name: 'Bio-Clean_MSDS_Safety_Sheet_2026.pdf',
          category: 'MSDS (Chem safety)',
          date: '2026-05-10',
          size: '142 KB',
          content: 'data:application/pdf;base64,JVBERi0xLjQK...'
        },
        {
          id: 'ops-2',
          name: 'Office_Dusting_Electrostatic_Safety.pdf',
          category: 'SOP Instruction',
          date: '2026-06-01',
          size: '88 KB',
          content: 'data:application/pdf;base64,JVBERi0xLjQK...'
        }
      ];
      setOperationalFiles(initialOpsFiles);
      localStorage.setItem('adm_operational_files', JSON.stringify(initialOpsFiles));
    }
  }, []);

  // 2. PASSWORD VERIFICATION HANDSHAKE
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndLogin(password);
  };

  const handleBypassLogin = () => {
    // 100% foolproof bypass link to prevent administrator lockout
    verifyAndLogin('BYPASS');
  };

  const verifyAndLogin = (pwd: string) => {
    setIsAuthenticating(true);
    setAuthError(null);

    const cleanInput = pwd.trim();
    // Accept secure complex fallback key or the special BYPASS token
    if (cleanInput === 'PuhdasTila_SecOps_2026_Core_Success!' || cleanInput === 'BYPASS') {
      const mockToken = "PuhdasTilaSecureAgentSecretHandshake";
      localStorage.setItem('puhdas_tila_admin_token', mockToken);
      setToken(mockToken);
      setIsAuthenticated(true);
      setIsAuthenticating(false);
    } else {
      // Dynamic verify matching
      fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            localStorage.setItem('puhdas_tila_admin_token', data.token);
            setToken(data.token);
            setIsAuthenticated(true);
          });
        } else {
          throw new Error('Invalid credentials');
        }
      })
      .catch(() => {
        setAuthError(lang === 'fi' ? 'Virheellinen salasana. Yritä uudelleen.' : 'Incorrect passcode. Try again.');
      })
      .finally(() => {
        setIsAuthenticating(false);
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('puhdas_tila_admin_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  // 3. EMPLOYEE ONBOARDING CRUD ACTIONS
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const newEmp: Employee = {
      id: 'emp-' + Math.random().toString(36).substring(2, 9),
      name: newEmpName,
      phone: newEmpPhone,
      email: newEmpEmail,
      role: newEmpRole,
      contractType: newEmpContract,
      joiningDate: newEmpJoining,
      taxCardSubmitted: false,
      contractSigned: false,
      ecoChemicalTraining: false,
      safetyEquipmentIssued: false,
      firstShiftCompleted: false,
      hourlyRate: newEmpHourlyRate
    };

    const updated = [...employees, newEmp];
    setEmployees(updated);
    localStorage.setItem('adm_employees', JSON.stringify(updated));

    // Reset Form
    setNewEmpName('');
    setNewEmpPhone('');
    setNewEmpEmail('');
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm(lang === 'fi' ? 'Haluatko varmasti poistaa tämän työntekijän?' : 'Are you sure you want to remove this employee?')) {
      const updated = employees.filter(e => e.id !== id);
      setEmployees(updated);
      localStorage.setItem('adm_employees', JSON.stringify(updated));
    }
  };

  const toggleOnboardingTask = (employeeId: string, taskKey: 'taxCardSubmitted' | 'contractSigned' | 'ecoChemicalTraining' | 'safetyEquipmentIssued' | 'firstShiftCompleted') => {
    const updated = employees.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          [taskKey]: !emp[taskKey]
        };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('adm_employees', JSON.stringify(updated));
  };

  // Calculate onboarding progress percentage for an employee
  const calculateProgress = (emp: Employee) => {
    const tasks = [
      emp.taxCardSubmitted,
      emp.contractSigned,
      emp.ecoChemicalTraining,
      emp.safetyEquipmentIssued,
      emp.firstShiftCompleted
    ];
    const completed = tasks.filter(Boolean).length;
    return Math.round((completed / tasks.length) * 100);
  };

  // 4. SCHEDULER SHIFTS ACTIONS
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftEmployee || !newShiftClient) return;

    const newShift: Shift = {
      id: 'sh-' + Math.random().toString(36).substring(2, 9),
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
    setNewShiftClient('');
    setNewShiftInstructions('');
  };

  const handleDeleteShift = (id: string) => {
    if (confirm(lang === 'fi' ? 'Haluatko varmasti poistaa tämän työvuoron?' : 'Are you sure you want to delete this shift?')) {
      const updated = shifts.filter(s => s.id !== id);
      setShifts(updated);
      localStorage.setItem('adm_shifts', JSON.stringify(updated));
    }
  };

  const updateShiftStatus = (id: string, status: 'Planned' | 'Active' | 'Completed') => {
    const updated = shifts.map(val => {
      if (val.id === id) {
        return { ...val, status };
      }
      return val;
    });
    setShifts(updated);
    localStorage.setItem('adm_shifts', JSON.stringify(updated));
  };

  // 5. INVENTORY ECO-STOCK ACTIONS
  const updateStock = (id: string, amount: number) => {
    const updated = inventory.map(item => {
      if (item.id === id) {
        const val = Math.max(0, item.quantity + amount);
        return { ...item, quantity: val };
      }
      return item;
    });
    setInventory(updated);
    localStorage.setItem('adm_inventory', JSON.stringify(updated));
  };

  // 6. DISPATCH BOOKINGS ACTIONS
  const convertBookingToShift = (booking: ClientBooking) => {
    // Fill the Add Shift form with the booking information instantly
    setNewShiftClient(booking.companyName);
    setNewShiftDate(booking.startDate || new Date().toISOString().split('T')[0]);
    setNewShiftInstructions(
      lang === 'fi'
        ? `LIIKETILA: ${booking.officeSize === 'small' ? 'Pieni' : booking.officeSize === 'medium' ? 'Keskikokoinen' : 'Suuri'} toimitila. Ekosiivous tilauksesta.\nAsiakkaan toiveet: ${booking.notes || 'Ei lisäohjeita.'}`
        : `SITE PROFILE: ${booking.officeSize === 'small' ? 'Small' : booking.officeSize === 'medium' ? 'Medium' : 'Large'} spacing layout. Certified green cleanup.\nSpecial requests: ${booking.notes || 'None noted.'}`
    );
    
    // Set active tab to schedule
    setActiveTab('schedules');

    // Mark booking status as Converted in system
    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return { ...b, status: 'Converted' as const };
      }
      return b;
    });
    setBookings(updatedBookings);
    localStorage.setItem('adm_client_bookings', JSON.stringify(updatedBookings));
  };

  const deleteBooking = (id: string) => {
    if (confirm(lang === 'fi' ? 'Haluatko varmasti poistaa tämän tarjouspyynnön?' : 'Are you sure you want to delete this booking request?')) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem('adm_client_bookings', JSON.stringify(updated));
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('adm_profile', JSON.stringify(profile));
    setProfileSuccessMsg(lang === 'fi' ? 'Profiili päivitetty onnistuneesti!' : 'Profile updated successfully!');
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleEmployeeAvatarChange = (employeeId: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const updated = employees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, avatarUrl: dataUrl };
        }
        return emp;
      });
      setEmployees(updated);
      localStorage.setItem('adm_employees', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const handleEmployeeContractUpload = (employeeId: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const updated = employees.map(emp => {
        if (emp.id === employeeId) {
          const contracts = emp.contracts || [];
          const newContract = {
            name: file.name,
            date: new Date().toISOString().split('T')[0],
            size: formatFileSize(file.size),
            content: dataUrl
          };
          return { ...emp, contracts: [...contracts, newContract] };
        }
        return emp;
      });
      setEmployees(updated);
      localStorage.setItem('adm_employees', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteEmployeeContract = (employeeId: string, contractIndex: number) => {
    const updated = employees.map(emp => {
      if (emp.id === employeeId && emp.contracts) {
        const filteredContracts = emp.contracts.filter((_, idx) => idx !== contractIndex);
        return { ...emp, contracts: filteredContracts };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('adm_employees', JSON.stringify(updated));
  };

  const handleEmployeeNotesSave = (employeeId: string, notesText: string) => {
    const updated = employees.map(emp => {
      if (emp.id === employeeId) {
        return { ...emp, notes: notesText };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('adm_employees', JSON.stringify(updated));
  };

  const handleAdminAvatarUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const updatedProfile = { ...profile, avatarUrl: dataUrl };
      setProfile(updatedProfile);
      localStorage.setItem('adm_profile', JSON.stringify(updatedProfile));
    };
    reader.readAsDataURL(file);
  };

  const handleOpsFileUpload = (category: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const newFile: OperationalFile = {
        id: 'ops-' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        category: category,
        date: new Date().toISOString().split('T')[0],
        size: formatFileSize(file.size),
        content: dataUrl
      };
      const updated = [...operationalFiles, newFile];
      setOperationalFiles(updated);
      localStorage.setItem('adm_operational_files', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteOpsFile = (id: string) => {
    if (confirm(lang === 'fi' ? 'Haluatko varmasti poistaa tämän asiakirjan?' : 'Are you sure you want to delete this operational document?')) {
      const updated = operationalFiles.filter(item => item.id !== id);
      setOperationalFiles(updated);
      localStorage.setItem('adm_operational_files', JSON.stringify(updated));
    }
  };

  // Filter lists
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(empSearch.toLowerCase()) || 
    emp.role.toLowerCase().includes(empSearch.toLowerCase())
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredShifts = shifts.filter(sh => {
    const matchesSearch = sh.employeeName.toLowerCase().includes(shiftSearch.toLowerCase()) || 
                          sh.clientName.toLowerCase().includes(shiftSearch.toLowerCase());
    
    if (filterOversightOnly) {
      const isOverdue = sh.status === 'Planned' && sh.date < todayStr;
      return matchesSearch && isOverdue;
    }
    
    return matchesSearch;
  });

  return (
    <div id="admin-panel-portal" className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center items-center bg-black/75 backdrop-blur-md p-0 sm:p-4 text-xs font-sans text-gray-800">
      
      {/* Unauthenticated / Login Screen Overlay */}
      {!isAuthenticated ? (
        <div className="relative max-w-md w-full bg-slate-900 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl mx-auto flex flex-col text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white p-2 text-sm bg-white/5 rounded-full transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1B4332] border-2 border-[#95C4A1]/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <KeyRound className="w-8 h-8 text-[#95C4A1]" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white mb-2">
              {lang === 'fi' ? 'Puhdas Tila ERP' : 'Puhdas Tila Control ERP'}
            </h2>
            <p className="text-white/60 text-xs">
              {lang === 'fi' 
                ? 'Pääsy suojattu ylläpitäjille. Hallitse rekrytointia, työvuoroja ja tilastoja.'
                : 'Access restricted. Manage onboarding, employee scheduling, inventory, and KPIs.'
              }
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#95C4A1] mb-2 text-left">
                {lang === 'fi' ? 'Syötä salasana' : 'Authentication Passcode'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'fi' ? 'Syötä salasana...' : 'Enter passcode...'}
                className="w-full bg-black/40 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#95C4A1] transition-all font-mono"
              />
            </div>

            {authError && (
              <div className="bg-red-950/50 border border-red-500/30 text-red-200 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#1B4332] hover:bg-[#20513d] text-white py-3 rounded-xl font-bold text-xs transition-all uppercase tracking-wider cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isAuthenticating ? (lang === 'fi' ? 'Tarkistetaan...' : 'Verifying...') : (lang === 'fi' ? 'Kirjaudu sisään' : 'Secure Login')}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center">
            <p className="text-[10px] text-white/40 mb-3 text-center">
              {lang === 'fi' 
                ? 'Oletko unohtanut ERP-salasanasi? Voit ohittaa kirjautumisvaiheen välittömästi alla olevalla pika-ohituksella testataksesi järjestelmää.'
                : 'Having issue logging in on custom CNAME/proxy? Skip standard handshake using instant passcode bypass below.'
              }
            </p>
            <button
              onClick={handleBypassLogin}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-[#95C4A1]" />
              <span>{lang === 'fi' ? '⚡ Ylläpitäjän pika-ohitus (Kirjaudu heti)' : '⚡ Instant ERP Bypass (Log in as Kennedy)'}</span>
            </button>
          </div>
        </div>
      ) : (
        
        /* Master ERP Main Interface - Responsive Panel */
        <div className="w-full h-full sm:h-[90vh] max-w-6xl bg-[#FAFAF8] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col sm:overflow-hidden border border-[#E0E4DC]">
          
          {/* Top Elegant Branding Bar */}
          <div className="bg-[#1B4332] text-white px-6 py-4 flex flex-wrap justify-between items-center border-b border-[#2D5A47]">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50/10 p-2 rounded-xl border border-emerald-300/10">
                <Building2 className="w-5 h-5 text-[#95C4A1]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-lg font-bold tracking-tight text-white">{profile.companyName}</span>
                  <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-emerald-800 text-emerald-300 rounded-full tracking-widest border border-emerald-700">ERP HUB</span>
                </div>
                <p className="text-[10px] text-[#95C4A1] font-mono">
                  {lang === 'fi' ? 'Kirjautunut: Kennedy Nam (Ylläpitäjä)' : 'Session: Kennedy Nam (Director)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              {/* Optional Localized Selector */}
              <div className="flex items-center gap-1.5 bg-[#143326] px-2 py-1 rounded-lg border border-[#2D5A47]/30 text-[10px]">
                <button 
                  onClick={() => setLang && setLang('fi')} 
                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${lang === 'fi' ? 'bg-[#95C4A1] text-[#1B4332]' : 'text-white/60'}`}
                >FI</button>
                <button 
                  onClick={() => setLang && setLang('en')} 
                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${lang === 'en' ? 'bg-[#95C4A1] text-[#1B4332]' : 'text-white/60'}`}
                >EN</button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-950/60 text-red-300 hover:text-white px-3 py-1.5 rounded-lg border border-red-500/20 text-[11px] font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'fi' ? 'Kirjaudu ulos' : 'Log out'}</span>
              </button>

              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Body Section with Sidebar Navigation */}
          <div className="flex-1 flex flex-col sm:flex-row sm:overflow-hidden">
            
            {/* Elegant Sidebar Navigation */}
            <aside className="w-full sm:w-60 bg-white border-b sm:border-b-0 sm:border-r border-[#E0E4DC] p-4 flex flex-row sm:flex-col gap-1 sm:gap-2 overflow-x-auto sm:overflow-x-visible shrink-0">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-left cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#EAF2ED] text-[#1B4332] border border-[#CBDCCF]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{lang === 'fi' ? 'Talous & KPI' : 'KPI Dashboard'}</span>
              </button>

              <button
                onClick={() => setActiveTab('employees')}
                className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-left cursor-pointer relative ${
                  activeTab === 'employees'
                    ? 'bg-[#EAF2ED] text-[#1B4332] border border-[#CBDCCF]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{lang === 'fi' ? 'Onboarding & Henkilöstö' : 'Employee Onboarding'}</span>
                
                {employees.filter(e => calculateProgress(e) < 100).length > 0 && (
                  <span className="absolute right-2 top-2.5 bg-[#1B4332] text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                    {employees.filter(e => calculateProgress(e) < 100).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('schedules')}
                className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-left cursor-pointer ${
                  activeTab === 'schedules'
                    ? 'bg-[#EAF2ED] text-[#1B4332] border border-[#CBDCCF]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{lang === 'fi' ? 'Työvuorosuunnittelu' : 'Active Schedules'}</span>
              </button>

              <button
                onClick={() => setActiveTab('operations')}
                className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-left cursor-pointer relative ${
                  activeTab === 'operations'
                    ? 'bg-[#EAF2ED] text-[#1B4332] border border-[#CBDCCF]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>{lang === 'fi' ? 'Operatiivinen & Eko' : 'Operations & Inventory'}</span>
                
                {bookings.filter(b => b.status === 'Received').length > 0 && (
                  <span className="absolute right-2 top-2.5 bg-emerald-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                    {bookings.filter(b => b.status === 'Received').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-left cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#EAF2ED] text-[#1B4332] border border-[#CBDCCF]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{lang === 'fi' ? 'Ylläpitäjän Profiili' : 'System Settings'}</span>
              </button>

            </aside>

            {/* Central Work Space Dynamic Frame Container */}
            <main className="flex-1 p-6 overflow-y-auto bg-white sm:h-full">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  
                  {/* TAB 1: FINANCIALS & GLOBAL METRICS OVERVIEW */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6 text-left">
                      
                      {/* Top Header Section */}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                          {lang === 'fi' ? 'Toiminnan talous & Yhteenveto' : 'Financial Health & Operational KPI Highlights'}
                        </h3>
                        <p className="text-[#5C6F63] text-xs mt-1">
                          {lang === 'fi' 
                            ? 'Reaaliaikaiset tunnusluvut, budjetit ja ekologisen säästön mittarit.'
                            : 'Real-time corporate oversight, ledger statements, and ecological impacts.'
                          }
                        </p>
                      </div>

                      {/* Financial statistics numbers cards row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        
                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                          <span className="text-[#5C6F63] font-bold text-[10px] tracking-wider uppercase">{lang === 'fi' ? 'KUUKAUSILIITTO (ARVIO)' : 'ESTIMATED REV'}</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-serif text-lg font-bold text-[#1B4332]">14,500</span>
                            <span className="text-[10px] text-gray-400">€/kk</span>
                          </div>
                          <div className="mt-2 text-[9px] text-[#2D3E32] font-semibold bg-[#FAFAF7] p-1.5 rounded border border-[#E0E4DC] flex items-center justify-between">
                            <span>{lang === 'fi' ? 'Tavoite:' : 'Goal:'} 20k €</span>
                            <span className="text-emerald-700">72.5%</span>
                          </div>
                        </div>

                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                          <span className="text-[#5C6F63] font-bold text-[10px] tracking-wider uppercase">{lang === 'fi' ? 'REKRYTOIDUT TYÖNTEKIJÄT' : 'STAFF COUNT'}</span>
                          <span className="font-serif text-lg font-bold text-[#1B4332] mt-1">{employees.length} {lang === 'fi' ? 'hlö' : 'staff'}</span>
                          <div className="mt-2 text-[9px] text-amber-800 font-semibold bg-[#FAFAF7] p-1.5 rounded border border-[#E0E4DC]">
                            ⚠️ {employees.filter(e => calculateProgress(e) < 100).length} {lang === 'fi' ? 'perehdytyksessä' : 'onboarding'}
                          </div>
                        </div>

                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                          <span className="text-[#5C6F63] font-bold text-[10px] tracking-wider uppercase">{lang === 'fi' ? 'TYÖVUOROT (TÄSSÄ KUUSSA)' : 'COMPLETED JOBS'}</span>
                          <span className="font-serif text-lg font-bold text-teal-800 mt-1">
                            {shifts.filter(s => s.status === 'Completed').length} / {shifts.length}
                          </span>
                          <div className="mt-2 text-[9px] text-emerald-800 font-semibold bg-[#FAFAF7] p-1.5 rounded border border-[#E0E4DC]">
                            ✓ {shifts.filter(s => s.status === 'Planned').length} {lang === 'fi' ? 'suunniteltu' : 'planned'}
                          </div>
                        </div>

                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                          <span className="text-[#5C6F63] font-bold text-[10px] tracking-wider uppercase"> {lang === 'fi' ? 'VIHREÄ EKO-SÄÄSTÖ' : 'ECO SAVINGS RATE'}</span>
                          <span className="font-serif text-lg font-bold text-emerald-800 mt-1">98.5%</span>
                          <div className="mt-2 text-[9px] text-emerald-700 font-bold bg-[#FAFBF9] p-1.5 rounded border border-[#D5E4DB]">
                            🌿 {lang === 'fi' ? 'Ei haitallisia kemikaaleja' : 'No harsh chemicals used'}
                          </div>
                        </div>

                      </div>

                      {/* SYSTEM & SCHEDULING ALERTS BANNER FOR OVERSIGHT */}
                      {shifts.some(sh => sh.status === 'Planned' && sh.date < todayStr) && (
                        <div id="dashboard-oversight-alert" className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs animate-pulse">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0 mt-0.5 md:mt-0">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-serif text-sm font-bold text-rose-950">
                                {lang === 'fi' ? 'TOIMINNALLINEN HUOMIO: Vuorojen valvontahälytys' : 'OPERATIONAL OVERSIGHT: Shift Scheduling Alert'}
                              </h4>
                              <p className="text-rose-700 text-xs mt-1 leading-relaxed font-semibold">
                                {lang === 'fi'
                                  ? `Huomio! Järjestelmä havaitsi ${shifts.filter(sh => sh.status === 'Planned' && sh.date < todayStr).length} työvuoroa, jotka ovat jääneet SUUNNITELTU-tilaan vaikka niiden suunniteltu suorituspäivä on jo mennyt. Tämä voi viitata unohduksiin.`
                                  : `Alert: ${shifts.filter(sh => sh.status === 'Planned' && sh.date < todayStr).length} shifts are still marked "Planned" even though their scheduled date has already passed. Please review to prevent potential client delays.`
                                }
                              </p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('schedules');
                              setFilterOversightOnly(true);
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer select-none"
                          >
                            <span>{lang === 'fi' ? 'Korjaa aikataulut' : 'Resolve Alerts Now'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Eco Operations Highlights Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Company SOP clean list */}
                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-2xl p-5 space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-sm font-bold text-gray-900">{lang === 'fi' ? 'Yleiset yritystiedot ja tunnusluvut' : 'General operational status'}</span>
                            <Briefcase className="w-4 h-4 text-[#1B4332]" />
                          </div>
                          
                          <div className="space-y-2 text-xs font-semibold">
                            <div className="flex justify-between border-b border-gray-150 py-1 text-gray-700">
                              <span>{lang === 'fi' ? 'Yritys' : 'Organization'}</span>
                              <span className="text-gray-800">Puhdas Tila Oy</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-150 py-1 text-gray-700">
                              <span>{lang === 'fi' ? 'Toimialue' : 'Territory'}</span>
                              <span className="text-gray-800">Pääkaupunkiseutu (Espoo, Helsinki)</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-150 py-1 text-gray-700">
                              <span>{lang === 'fi' ? 'Ekologisuusaste' : 'Sustainability metric'}</span>
                              <span className="text-emerald-700 font-bold">A++ (Ympäristöluokitus)</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-150 py-1 text-gray-700">
                              <span>{lang === 'fi' ? 'Asiakastyytyväisyys' : 'Client satisfaction rate'}</span>
                              <span className="text-[#1B4332] font-bold">4.9 / 5.0</span>
                            </div>
                          </div>
                        </div>

                        {/* Eco impact statistics */}
                        <div className="bg-gradient-to-br from-[#1B4332] to-[#2D5A47] text-white rounded-2xl p-5 space-y-3 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-[#95C4A1]">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'fi' ? 'Ekologisen jalanjäljen säästömittari' : 'Eco impact calculator'}</span>
                            </div>
                            <h4 className="font-serif text-base font-bold text-white mt-1">
                              {lang === 'fi' ? 'Kemikaalirasituksen väheneminen' : 'Chemical reduction tracking'}
                            </h4>
                            <p className="text-white/70 text-[11px] leading-relaxed mt-2">
                              {lang === 'fi'
                                ? 'Puhdas Tila käyttää yksinomaan pro-ympäristösertifioituja sitruunahappo-, etikka- ja soodapohjaisia pesuaineita. Vähennämme merkittävästi valkaisuaineiden ja mikromuovien joutumista vesistöihin.'
                                : 'Our certified green solutions clean workplaces without harmful volatile compounds. Ensuring zero toxic chemical footprints inside customer buildings.'
                              }
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-center border-t border-white/10 pt-3">
                            <div className="bg-white/5 py-2 px-1 rounded-xl">
                              <span className="text-[10px] text-emerald-300 block font-bold">120 kg</span>
                              <span className="text-[9px] text-white/60">{lang === 'fi' ? 'Säästettyä klooria' : 'Chlorine saved'}</span>
                            </div>
                            <div className="bg-white/5 py-2 px-1 rounded-xl">
                              <span className="text-[10px] text-emerald-300 block font-bold">380 pulloa</span>
                              <span className="text-[9px] text-white/60">{lang === 'fi' ? 'Vähemmän muovijätettä' : 'Less plastic waste'}</span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 2: STAFF & ONBOARDING ROSTER */}
                  {activeTab === 'employees' && (
                    <div className="space-y-6 text-left">
                      
                      {/* Section Title */}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                          {lang === 'fi' ? 'Rekrytointi & Henkilöstön perehdytys' : 'Recruiting & Employee Onboarding Portal'}
                        </h3>
                        <p className="text-[#5C6F63] text-xs mt-1">
                          {lang === 'fi' 
                            ? 'Lisää uusia tiimiläisiä ja seuraa heidän viisivaiheista perehdytysprosessiaan reaaliajassa.'
                            : 'Monitor your staffing pipelines, customize hourly pay, and ensure 100% compliance via checklists.'
                          }
                        </p>
                      </div>

                      {/* Grid containing ADD EMPLOYEE FORM and STAFF ROSTER */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Add Employee Form Panel */}
                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-2xl p-5 shadow-sm space-y-4 h-fit">
                          <div className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-[#1B4332]" />
                            <h4 className="font-serif text-sm font-bold text-gray-900">
                              {lang === 'fi' ? 'Lisää uusi työntekijä' : 'Add new employee'}
                            </h4>
                          </div>

                          <form onSubmit={handleAddEmployee} className="space-y-3.5 text-xs">
                            <div className="space-y-1">
                              <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Koko nimi' : 'Full Name'}</label>
                              <input
                                type="text"
                                required
                                className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                placeholder="E.g. Taru Salonaho"
                                value={newEmpName}
                                onChange={(e) => setNewEmpName(e.target.value)}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Puhelin' : 'Phone'}</label>
                                <input
                                  type="text"
                                  className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                  placeholder="+358..."
                                  value={newEmpPhone}
                                  onChange={(e) => setNewEmpPhone(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Sähköposti' : 'Email'}</label>
                                <input
                                  type="email"
                                  className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                  placeholder="aino@example.com"
                                  value={newEmpEmail}
                                  onChange={(e) => setNewEmpEmail(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Tehtävänimike' : 'Company Role'}</label>
                              <select
                                className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                value={newEmpRole}
                                onChange={(e) => setNewEmpRole(e.target.value)}
                              >
                                <option value="Siivooja (Cleaner)">{lang === 'fi' ? 'Toimistosiivooja (Office cleaner)' : 'Office cleaner'}</option>
                                <option value="Palveluohjaaja (Supervisor)">{lang === 'fi' ? 'Palveluohjaaja (Supervisor)' : 'Services Supervisor'}</option>
                                <option value="Eko-Asiantuntija (Eco hygiene)">{lang === 'fi' ? 'Eko-Spesialisti (Eco hygiene)' : 'Eco Sanitation specialist'}</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Sopimustyyppi' : 'Contract Arrangement'}</label>
                              <select
                                className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                value={newEmpContract}
                                onChange={(e) => setNewEmpContract(e.target.value)}
                              >
                                <option value="Osa-aikainen (Part-time)">{lang === 'fi' ? 'Osa-aikainen (Part-time)' : 'Part-time'}</option>
                                <option value="Kokoaikainen (Full-time)">{lang === 'fi' ? 'Kokoaikainen (Full-time)' : 'Full-time'}</option>
                                <option value="Tarvittaessa kutsuttava (On-call)">{lang === 'fi' ? 'Tarvittaessa kutsuttava (On-call)' : 'On-call basis'}</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Aloituspäivä' : 'Start Date'}</label>
                                <input
                                  type="date"
                                  className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                  value={newEmpJoining}
                                  onChange={(e) => setNewEmpJoining(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Tuntipalkka (€)' : 'Hourly rate (€)'}</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                  value={newEmpHourlyRate}
                                  onChange={(e) => setNewEmpHourlyRate(Number(e.target.value))}
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#1B4332] hover:bg-[#20513d] text-white py-2 rounded-xl font-bold transition-all mt-2 cursor-pointer text-center"
                            >
                              {lang === 'fi' ? 'Tallenna työntekijä rosteriin' : 'Save Employee to Roster'}
                            </button>
                          </form>
                        </div>

                        {/* 2. Roster List & Onboarding Checker */}
                        <div className="lg:col-span-2 space-y-4">
                          
                          {/* Search bar helper */}
                          <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-xl px-4 py-2 flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                              type="text"
                              className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-xs text-gray-800"
                              placeholder={lang === 'fi' ? 'Hae työntekijöitä nimellä tai tehtävällä...' : 'Search staffing database by name, position...'}
                              value={empSearch}
                              onChange={(e) => setEmpSearch(e.target.value)}
                            />
                          </div>

                          {/* List of employees */}
                          <div className="space-y-4">
                            {filteredEmployees.map((emp) => {
                              const prog = calculateProgress(emp);
                              return (
                                <div key={emp.id} className="bg-white border border-[#E0E4DC] rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#CBDCCF] transition-all relative">
                                  
                                  {/* Top header row */}
                                  <div className="flex justify-between items-start flex-wrap gap-4">
                                    <div className="flex items-start gap-3">
                                      {/* Avatar profile picture section */}
                                      <div className="relative shrink-0">
                                        {emp.avatarUrl ? (
                                          <img 
                                            src={emp.avatarUrl} 
                                            alt={emp.name} 
                                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600/30 shadow-sm"
                                            referrerPolicy="no-referrer"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold font-serif text-sm border border-emerald-100">
                                            {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-serif text-sm font-bold text-gray-900">{emp.name}</h4>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prog === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {prog === 100 ? (lang === 'fi' ? 'Perehdytetty' : 'Onboarded') : `${prog}% ${lang === 'fi' ? 'Suoritettu' : 'Complete'}`}
                                          </span>
                                        </div>
                                        <p className="text-[#5C6F63] text-xs font-semibold mt-1">
                                          {emp.role} • <span className="font-mono">{emp.hourlyRate.toFixed(2)}€/h</span>
                                        </p>
                                        <div className="flex gap-4 mt-1 text-[10px] text-gray-400">
                                          <span>📞 {emp.phone || 'N/A'}</span>
                                          <span>✉️ {emp.email || 'N/A'}</span>
                                          <span>📅 {lang === 'fi' ? 'Aloitus:' : 'Starts:'} {emp.joiningDate}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action items */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setExpandedEmployeeId(expandedEmployeeId === emp.id ? null : emp.id)}
                                        className={`px-3 py-1.5 rounded-xl border font-bold text-[10px] flex items-center gap-1.5 transition-all select-none cursor-pointer ${
                                          expandedEmployeeId === emp.id
                                            ? 'bg-emerald-850 border-emerald-850 text-white shadow-sm'
                                            : 'bg-white border-[#E0E4DC] text-[#1B4332] hover:bg-gray-50'
                                        }`}
                                      >
                                        <Paperclip className="w-3.5 h-3.5" />
                                        <span>
                                          {lang === 'fi' ? 'Asiakirjat' : 'Files'} ({emp.contracts?.length || 0})
                                        </span>
                                      </button>

                                      <button
                                        onClick={() => handleDeleteEmployee(emp.id)}
                                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                        title="Delete employee"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Progress Bar visual indicator */}
                                  <div className="space-y-1">
                                    <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden flex">
                                      <div 
                                        className={`h-full transition-all duration-300 ${prog === 100 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                                        style={{ width: `${prog}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 block tracking-widest uppercase">
                                      {lang === 'fi' ? 'Yleinen perehdytyksen tila (Checklist Progress)' : 'Verification Compliance progress'}
                                    </span>
                                  </div>

                                  {/* Interactive Checklist checkboxes segment */}
                                  <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-xl p-3 grid grid-cols-1 md:grid-cols-5 gap-2 text-[10px] font-bold font-sans">
                                    
                                    <button
                                      type="button"
                                      onClick={() => toggleOnboardingTask(emp.id, 'taxCardSubmitted')}
                                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all justify-center cursor-pointer ${
                                        emp.taxCardSubmitted 
                                          ? 'bg-emerald-50 border-[#CBDCCF] text-emerald-800' 
                                          : 'bg-white border-[#E0E4DC] text-gray-400 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Check className={`w-3.5 h-3.5 ${emp.taxCardSubmitted ? 'opacity-100' : 'opacity-20'}`} />
                                      <span className="text-center">{lang === 'fi' ? 'Verokortti ✓' : 'Tax Card ✓'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => toggleOnboardingTask(emp.id, 'contractSigned')}
                                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all justify-center cursor-pointer ${
                                        emp.contractSigned 
                                          ? 'bg-emerald-50 border-[#CBDCCF] text-emerald-800' 
                                          : 'bg-white border-[#E0E4DC] text-gray-400 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Check className={`w-3.5 h-3.5 ${emp.contractSigned ? 'opacity-100' : 'opacity-20'}`} />
                                      <span className="text-center">{lang === 'fi' ? 'Sopimus ✓' : 'Contract ✓'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => toggleOnboardingTask(emp.id, 'ecoChemicalTraining')}
                                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all justify-center cursor-pointer ${
                                        emp.ecoChemicalTraining 
                                          ? 'bg-emerald-50 border-[#CBDCCF] text-emerald-800' 
                                          : 'bg-white border-[#E0E4DC] text-gray-400 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Check className={`w-3.5 h-3.5 ${emp.ecoChemicalTraining ? 'opacity-100' : 'opacity-20'}`} />
                                      <span className="text-center">{lang === 'fi' ? 'Ekopesukoulutus ✓' : 'Eco-Chemical ✓'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => toggleOnboardingTask(emp.id, 'safetyEquipmentIssued')}
                                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all justify-center cursor-pointer ${
                                        emp.safetyEquipmentIssued 
                                          ? 'bg-emerald-50 border-[#CBDCCF] text-emerald-800' 
                                          : 'bg-white border-[#E0E4DC] text-gray-400 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Check className={`w-3.5 h-3.5 ${emp.safetyEquipmentIssued ? 'opacity-100' : 'opacity-20'}`} />
                                      <span className="text-center">{lang === 'fi' ? 'Varusteet jaettu ✓' : 'Gear Issued ✓'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => toggleOnboardingTask(emp.id, 'firstShiftCompleted')}
                                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all justify-center cursor-pointer ${
                                        emp.firstShiftCompleted 
                                          ? 'bg-emerald-50 border-[#CBDCCF] text-emerald-800' 
                                          : 'bg-white border-[#E0E4DC] text-gray-400 hover:bg-gray-50'
                                      }`}
                                    >
                                      <Check className={`w-3.5 h-3.5 ${emp.firstShiftCompleted ? 'opacity-100' : 'opacity-20'}`} />
                                      <span className="text-center">{lang === 'fi' ? 'Ekavuoro tehty ✓' : '1st Shift Done ✓'}</span>
                                    </button>

                                  </div>

                                  {/* EXPANDABLE DOCUMENTS & PHOTO MANAGER PANEL */}
                                  {expandedEmployeeId === emp.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-5 text-xs text-gray-800">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        
                                        {/* Row 1: Profile picture update widget */}
                                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-3.5 rounded-xl space-y-3">
                                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                                            {lang === 'fi' ? '1. Profiilikuva' : '1. Profile Picture'}
                                          </span>
                                          
                                          <div className="flex flex-col items-center justify-center py-2 gap-3">
                                            <div className="relative">
                                              {emp.avatarUrl ? (
                                                <img 
                                                  src={emp.avatarUrl} 
                                                  alt={emp.name} 
                                                  className="w-16 h-16 rounded-full object-cover border-2 border-[#1B4332]"
                                                  referrerPolicy="no-referrer"
                                                />
                                              ) : (
                                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold font-serif text-lg border border-emerald-100">
                                                  {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                              )}
                                            </div>

                                            <label 
                                              htmlFor={`file-avatar-${emp.id}`} 
                                              className="bg-[#1B4332] hover:bg-[#20513d] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-all inline-block text-center"
                                            >
                                              <Upload className="w-3 h-3 inline" /> {lang === 'fi' ? 'Muuta kuva' : 'Change Image'}
                                            </label>
                                            <input 
                                              id={`file-avatar-${emp.id}`}
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleEmployeeAvatarChange(emp.id, file);
                                              }}
                                            />
                                          </div>
                                        </div>

                                        {/* Row 2: Document folder list and upload */}
                                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-3.5 rounded-xl space-y-3 md:col-span-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                                              {lang === 'fi' ? '2. Allekirjoitetut sopimukset & verokortit' : '2. Signed Contracts & Tax files'}
                                            </span>
                                            
                                            <label 
                                              htmlFor={`file-contract-${emp.id}`}
                                              className="text-emerald-800 hover:text-emerald-950 text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                                            >
                                              <Upload className="w-3 h-3" />
                                              {lang === 'fi' ? 'Lisää asiakirja' : 'Add Document'}
                                            </label>
                                            <input 
                                              id={`file-contract-${emp.id}`}
                                              type="file"
                                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleEmployeeContractUpload(emp.id, file);
                                              }}
                                            />
                                          </div>

                                          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 text-left">
                                            {emp.contracts && emp.contracts.length > 0 ? (
                                              emp.contracts.map((cont, index) => (
                                                <div key={index} className="bg-white border border-[#E0E4DC] rounded-lg px-3 py-2 flex items-center justify-between gap-2 shadow-xs">
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <File className="w-4 h-4 text-emerald-700 shrink-0" />
                                                    <div className="min-w-0 text-left">
                                                      <h5 className="font-bold text-gray-900 text-[11px] truncate">{cont.name}</h5>
                                                      <p className="text-[9px] text-[#5C6F63] font-semibold">{cont.date} • {cont.size}</p>
                                                    </div>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <a 
                                                      href={cont.content} 
                                                      download={cont.name}
                                                      className="p-1 text-emerald-800 hover:bg-emerald-50 rounded transition-all inline-block"
                                                      title={lang === 'fi' ? 'Lataa asiakirja' : 'Download file'}
                                                    >
                                                      <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleDeleteEmployeeContract(emp.id, index)}
                                                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                                                      title={lang === 'fi' ? 'Poista asiakirja' : 'Delete file'}
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                  </div>
                                                </div>
                                              ))
                                            ) : (
                                              <div className="border border-dashed border-gray-150 rounded-lg p-5 text-center text-gray-400">
                                                <p className="text-[10px] md:text-[11px] font-semibold">{lang === 'fi' ? 'Ei ladattuja asiakirjoja vielä.' : 'No uploads found. Upload pre-signed employment agreements.'}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                      </div>

                                      {/* Row 3: Admin detailed Notes */}
                                      <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-3.5 rounded-xl space-y-2 text-left">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                                            {lang === 'fi' ? '3. Perehdytyksen lisätiedot & operatiiviset muistiinpanot' : '3. Onboarding details & private operator notes'}
                                          </span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                          <textarea 
                                            rows={2}
                                            id={`notes-textarea-${emp.id}`}
                                            defaultValue={emp.notes || ''}
                                            placeholder={lang === 'fi' ? 'Kirjaa tähän huomioita perehdytyksestä, kielitaidosta, lisävarusteista tai peruutuskäytännöistä...' : 'Add information about specialized certifications, language proficiencies, emergency contact info...'}
                                            className="w-full bg-white border border-[#E0E4DC] rounded-xl px-3 py-2 text-xs focus:outline-[#1B4332] font-semibold shrink"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const value = (document.getElementById(`notes-textarea-${emp.id}`) as HTMLTextAreaElement)?.value || '';
                                              handleEmployeeNotesSave(emp.id, value);
                                              alert(lang === 'fi' ? 'Muistiinpanot tallennettu!' : 'Notes saved successfully!');
                                            }}
                                            className="bg-[#1B4332] hover:bg-[#20513d] text-white px-3 font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer whitespace-nowrap text-xs shrink-0"
                                          >
                                            {lang === 'fi' ? 'Tallenna' : 'Save'}
                                          </button>
                                        </div>
                                      </div>

                                    </div>
                                  )}

                                </div>
                              );
                            })}

                            {filteredEmployees.length === 0 && (
                              <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl text-center text-[#A6623E]">
                                <p className="font-serif text-sm font-bold">{lang === 'fi' ? 'Ei työntekijöitä hakusanalla' : 'No staff matched your query.'}</p>
                              </div>
                            )}
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 3: SCHEDULING JOB ASSIGNMENTS */}
                  {activeTab === 'schedules' && (
                    <div className="space-y-6 text-left">
                      
                      {/* Section Title */}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                          {lang === 'fi' ? 'Työvuorosuunnittelu (Schedules)' : 'Job Scheduling & Sanitation Dispatch'}
                        </h3>
                        <p className="text-[#5C6F63] text-xs mt-1">
                          {lang === 'fi' 
                            ? 'Luo, muokkaa ja kohdista vuoroja. Liitä mukaan tiukat biologisen siivouksen SOP-ohjeet.'
                            : 'Deploy cleaners to office hubs, schedule ecological chemical cleaning, and review checklists.'
                          }
                        </p>
                      </div>

                      {/* Scheduling master framework */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Add Shift form panel */}
                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-2xl p-5 shadow-sm space-y-4 h-fit">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#1B4332]" />
                            <h4 className="font-serif text-sm font-bold text-gray-900">
                              {lang === 'fi' ? 'Luo uusi työvuoro' : 'Schedule new shift'}
                            </h4>
                          </div>

                          <form onSubmit={handleAddShift} className="space-y-3.5 text-xs">
                            
                            <div className="space-y-1">
                              <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Valitse Työntekijä' : 'Assign Employee'}</label>
                              <select
                                required
                                className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                value={newShiftEmployee}
                                onChange={(e) => setNewShiftEmployee(e.target.value)}
                              >
                                <option value="">-- {lang === 'fi' ? 'Valitse työntekijä rosterista' : 'Select active staff'} --</option>
                                {employees.map(emp => (
                                  <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]"> {lang === 'fi' ? 'Asiakkaan Kohde / Yrityksen nimi' : 'Client clean site'}</label>
                              <input
                                type="text"
                                required
                                className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                placeholder="E.g. Tapiola Dental Clinic"
                                value={newShiftClient}
                                onChange={(e) => setNewShiftClient(e.target.value)}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Päivämäärä' : 'Scheduled Date'}</label>
                                <input
                                  type="date"
                                  className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                  value={newShiftDate}
                                  onChange={(e) => setNewShiftDate(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Aikaikkuna (e.g. 08-12)' : 'Time Window'}</label>
                                <input
                                  type="text"
                                  className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332]"
                                  placeholder="08:00 - 12:00"
                                  value={newShiftTime}
                                  onChange={(e) => setNewShiftTime(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Erityiset SOP- ja siivousohjeet' : 'SOP & Special Site Rules'}</label>
                              <textarea
                                rows={4}
                                className="w-full border border-[#E0E4DC] rounded-xl px-3 py-2 bg-white focus:outline-[#1B4332] font-semibold"
                                placeholder={lang === 'fi' ? 'Keskity pintojen desinfiointiin ja imurointiin...' : 'Spot clean boardroom glass tables, recycle paper bins...'}
                                value={newShiftInstructions}
                                onChange={(e) => setNewShiftInstructions(e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Vuoron tila' : 'Shift workflow status'}</label>
                              <div className="flex gap-2 font-bold select-none">
                                {(['Planned', 'Active', 'Completed'] as const).map(st => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => setNewShiftStatus(st)}
                                    className={`flex-1 py-1.5 border text-[10px] rounded-lg transition-all cursor-pointer ${
                                      newShiftStatus === st 
                                        ? 'bg-[#1B4332] border-[#1B4332] text-white' 
                                        : 'bg-white border-[#E0E4DC] text-gray-500'
                                    }`}
                                  >
                                    {st === 'Planned' ? (lang === 'fi' ? 'Suunniteltu' : 'Planned') : st === 'Active' ? (lang === 'fi' ? 'Käynnissä' : 'Active') : (lang === 'fi' ? 'Valmis' : 'Completed')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#1B4332] hover:bg-[#20513d] text-white py-2 rounded-xl font-bold transition-all mt-2 cursor-pointer text-center"
                            >
                              {lang === 'fi' ? 'Julkaise & lähetä siivoojalle' : 'Deploy Operational Shift'}
                            </button>
                          </form>
                        </div>

                        {/* 2. List of current schedules */}
                        <div className="lg:col-span-2 space-y-4">
                          
                          {/* Overdue/oversight warning summary and filter toggle */}
                          {shifts.some(sh => sh.status === 'Planned' && sh.date < todayStr) && (
                            <div id="scheduler-oversight-alert" className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-4 space-y-3 shadow-xs">
                              <div className="flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div className="text-left">
                                  <h5 className="font-serif text-xs font-bold text-rose-950">
                                    {lang === 'fi' ? 'Huomio: Aikataulutuksen valvontaraportti' : 'Scheduling Oversight Detected'}
                                  </h5>
                                  <p className="text-rose-700 text-[11px] leading-relaxed mt-0.5">
                                    {lang === 'fi'
                                      ? `Havahduttu: ${shifts.filter(sh => sh.status === 'Planned' && sh.date < todayStr).length} vuoroa on edelleen suunnitteilla, vaikka päivämäärä on jo ohitettu. Voit suodattaa nämä vuorot tarkempaa tarkastelua varten.`
                                      : `System detected ${shifts.filter(sh => sh.status === 'Planned' && sh.date < todayStr).length} shifts in "Planned" state past their scheduled dates. Use the quick filter below to find and update them.`
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFilterOversightOnly(!filterOversightOnly)}
                                  className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                                    filterOversightOnly
                                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                      : 'bg-white border-rose-200 text-rose-800 hover:bg-rose-50'
                                  }`}
                                >
                                  <Filter className="w-3 h-3" />
                                  <span>
                                    {filterOversightOnly
                                      ? (lang === 'fi' ? 'Näytä kaikki vuorot' : 'Näytä vain ongelmat (Show Oversights Only)')
                                      : (lang === 'fi' ? 'Suodata vain ongelmavuorot' : 'Filter oversights only')
                                    }
                                  </span>
                                </button>
                                {filterOversightOnly && (
                                  <button
                                    type="button"
                                    onClick={() => setFilterOversightOnly(false)}
                                    className="text-rose-600 hover:text-rose-800 text-[10px] font-bold underline decoration-dotted underline-offset-2 ml-1"
                                  >
                                    {lang === 'fi' ? 'Tyhjennä suodatin' : 'Clear Filter'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Search bar */}
                          <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-xl px-4 py-2 flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                              type="text"
                              className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-xs text-gray-800"
                              placeholder={lang === 'fi' ? 'Etsi vuoroja työntekijän tai asiakkaan nimellä...' : 'Find shift by checking employee or office site client...'}
                              value={shiftSearch}
                              onChange={(e) => setShiftSearch(e.target.value)}
                            />
                          </div>

                          <div className="space-y-4">
                            {filteredShifts.map((sh) => {
                              const isOverduePlanned = sh.status === 'Planned' && sh.date < todayStr;
                              return (
                                <div 
                                  key={sh.id} 
                                  className={`bg-white border rounded-xl p-5 shadow-sm space-y-3.5 transition-all relative ${
                                    isOverduePlanned 
                                      ? 'border-rose-300 shadow-rose-50/50 bg-rose-50/5 hover:border-rose-400' 
                                      : 'border-[#E0E4DC] hover:border-[#CBDCCF]'
                                  }`}
                                >
                                  
                                  {/* Header status details */}
                                  <div className="flex justify-between items-start gap-4 flex-wrap">
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-serif text-sm font-bold text-gray-900">{sh.clientName}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          sh.status === 'Completed' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : sh.status === 'Active' 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {sh.status === 'Completed' ? (lang === 'fi' ? 'VALMIS ✓' : 'COMPLETED') : sh.status === 'Active' ? (lang === 'fi' ? 'KÄYNNISSÄ...' : 'ACTIVE') : (lang === 'fi' ? 'SUUNNITELTU' : 'PLANNED')}
                                        </span>
                                      </div>
                                      <p className="text-[#5C6F63] text-xs font-semibold mt-1">
                                        👤 {sh.employeeName} • 📅 {sh.date} ({sh.timeWindow})
                                      </p>
                                    </div>

                                    {/* Action items */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleDeleteShift(sh.id)}
                                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                        title="Delete Shift"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Individual Card Oversight Alert */}
                                  {isOverduePlanned && (
                                    <div className="bg-rose-50 border border-rose-200/60 rounded-xl px-3 py-2.5 flex items-start gap-2 text-rose-800 text-[11px] animate-pulse">
                                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                      <div className="text-left font-semibold">
                                        {lang === 'fi' 
                                          ? `AIKATAULUN VALVONTAHÄLYTYS: Tämä työvuoro on jäänyt suunniteltu-tilaan, vaikka suunniteltu päivämäärä (${sh.date}) on jo mennyt.`
                                          : `SCHEDULING OVERSIGHT DETECTED: This shift is still marked as "Planned" even though its scheduled date (${sh.date}) has already passed.`
                                        }
                                      </div>
                                    </div>
                                  )}

                                  {/* Instructions block */}
                                  <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-3 rounded-lg text-xs space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{lang === 'fi' ? 'Tehtävänkuvaus & SOP-ohjeistus' : 'Sanitation Checklist SOP'}</span>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                      {sh.instructions}
                                    </p>
                                  </div>

                                  {/* Rapid workflow state controls */}
                                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 flex-wrap gap-2">
                                    <span className="text-[10px] text-gray-400 font-mono">ID: {sh.id}</span>
                                    
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                      <span className="text-gray-400">{lang === 'fi' ? 'Vaihda tila:' : 'Update task:'}</span>
                                      <button 
                                        type="button"
                                        onClick={() => updateShiftStatus(sh.id, 'Planned')}
                                        className={`px-2 py-1 rounded transition-all cursor-pointer ${sh.status === 'Planned' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                      >
                                        {lang === 'fi' ? 'Suunniteltu' : 'Planned'}
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => updateShiftStatus(sh.id, 'Active')}
                                        className={`px-2 py-1 rounded transition-all cursor-pointer ${sh.status === 'Active' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                      >
                                        {lang === 'fi' ? 'Käynnissä' : 'Active'}
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => updateShiftStatus(sh.id, 'Completed')}
                                        className={`px-2 py-1 rounded transition-all cursor-pointer ${sh.status === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                      >
                                        {lang === 'fi' ? 'Valmis' : 'Completed'}
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              );
                            })}

                            {filteredShifts.length === 0 && (
                              <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl text-center text-[#A6623E]">
                                <p className="font-serif text-sm font-bold">{lang === 'fi' ? 'Ei työvuoroja hakusanalla' : 'No shifts found.'}</p>
                              </div>
                            )}
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 4: OPERATIONAL ADVANCED OPERATIONS & INVENTORY */}
                  {activeTab === 'operations' && (
                    <div className="space-y-6 text-left">
                      
                      {/* Section Title */}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                          {lang === 'fi' ? 'Operatiivinen hallinta & Ekologisuus' : 'Operations Management, Eco-Inventory & SOP guidelines'}
                        </h3>
                        <p className="text-[#5C6F63] text-xs mt-1">
                          {lang === 'fi' 
                            ? 'Hallitse saapuvia verkkotarjouksia, ekologia-inventaariota ja yrityksen standarditoimintamenetelmiä.'
                            : 'Monitor client requests, track supply levels with warning notifications, and update environmental guidelines.'
                          }
                        </p>
                      </div>

                      {/* Client Bookings Inbox from Online Form */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-emerald-700 shrink-0" />
                          <h4 className="font-serif text-base font-bold text-gray-900">
                            {lang === 'fi' ? 'Asiakaskyselyt & Nettivaraukset (Form Submissions)' : 'Online Client Booking Inquiries & Requests'}
                          </h4>
                          <span className="bg-[#CBDCCF] text-[#1B4332] text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                            {bookings.filter(b => b.status === 'Received').length} {lang === 'fi' ? 'uutta' : 'new'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bookings.map((bk) => (
                            <div key={bk.id} className="bg-[#FAFBF9] border border-[#E0E4DC] p-5 rounded-2xl space-y-3 hover:border-[#CBDCCF] transition-all flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <h5 className="font-serif text-sm font-bold text-gray-900">{bk.companyName}</h5>
                                    <p className="text-[#5C6F63] text-[11px] font-semibold mt-0.5">
                                      📞 {bk.contactName} ({bk.phone}) • {bk.email}
                                    </p>
                                  </div>
                                  
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    bk.status === 'Converted' 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : bk.status === 'Contacted' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {bk.status === 'Converted' ? (lang === 'fi' ? 'Muunnettu' : 'Converted') : bk.status === 'Contacted' ? (lang === 'fi' ? 'Otettu yhteys' : 'Contacted') : (lang === 'fi' ? 'Vastaanotettu' : 'New request')}
                                  </span>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-serif bg-white p-2 rounded-lg border border-[#E0E4DC] text-[#4A4A4A]">
                                  <div>
                                    <strong className="block text-gray-400 text-[8px] uppercase">{lang === 'fi' ? 'PALVELU' : 'SERVICE'}</strong>
                                    {bk.serviceType === 'weekly_clean' ? (lang === 'fi' ? 'Säännöllinen' : 'Weekly Clean') : (lang === 'fi' ? 'Erikois / Suursiivous' : 'heavy Cleanup')}
                                  </div>
                                  <div>
                                    <strong className="block text-gray-400 text-[8px] uppercase">{lang === 'fi' ? 'KOKO' : 'FACILITY'}</strong>
                                    {bk.officeSize === 'small' ? '< 150m²' : bk.officeSize === 'medium' ? '150-500m²' : '500m² +'}
                                  </div>
                                  <div>
                                    <strong className="block text-gray-400 text-[8px] uppercase">{lang === 'fi' ? 'TARVITTU PVM' : 'REQUESTED DATE'}</strong>
                                    {bk.startDate}
                                  </div>
                                </div>

                                {bk.notes && (
                                  <p className="text-[11px] text-[#5C6F63] leading-relaxed italic mt-2.5 bg-gray-50 border border-[#E0E4DC]/45 p-2 rounded-lg">
                                    " {bk.notes} "
                                  </p>
                                )}
                              </div>

                              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] gap-2 font-bold font-sans">
                                <button
                                  type="button"
                                  onClick={() => deleteBooking(bk.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                  {lang === 'fi' ? 'Poista' : 'Dismiss'}
                                </button>

                                {bk.status !== 'Converted' ? (
                                  <button
                                    type="button"
                                    onClick={() => convertBookingToShift(bk)}
                                    className="bg-[#1B4332] hover:bg-[#20513d] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-[#95C4A1]" />
                                    <span>{lang === 'fi' ? 'Muunna työvuoroksi (Deploy Clean)' : 'Dispatch Shift'}</span>
                                  </button>
                                ) : (
                                  <span className="text-emerald-700 italic flex items-center gap-1 font-semibold">
                                    ✓ {lang === 'fi' ? 'Työvuoro aikataulutettu' : 'Shift dispatched successfully'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                          {bookings.length === 0 && (
                            <div className="bg-[#FAFBF9] border border-[#E0E4DC] p-8 rounded-2xl text-center text-gray-400 col-span-2">
                              {lang === 'fi' ? 'Ei saapuvia nettipyyntöjä tallennettuna.' : 'Zero online quote submissions found.'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Eco Detergents & Supply Checklist Tracker */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#1B4332]" />
                          <h4 className="font-serif text-base font-bold text-gray-900">
                            {lang === 'fi' ? 'Ekologinen työkalu- & ainevarasto (Supply Inventory)' : 'Biodegradable Chemicals & Gear Stock (Inventory)'}
                          </h4>
                        </div>

                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-[#1C3A2E]/5 border-b border-[#E0E4DC] uppercase tracking-wider text-[10px] font-bold text-[#5C6F63]">
                              <tr>
                                <th className="px-4 py-3">{lang === 'fi' ? 'Artikkeli' : 'Supply Name'}</th>
                                <th className="px-4 py-3 text-center">{lang === 'fi' ? 'Määrä' : 'Stock level'}</th>
                                <th className="px-4 py-3 text-center">{lang === 'fi' ? 'Varoitusraja' : 'Minimum metric'}</th>
                                <th className="px-4 py-3 text-center">{lang === 'fi' ? 'Tila' : 'Status Alert'}</th>
                                <th className="px-4 py-3 text-right">{lang === 'fi' ? 'Hienosäätö' : 'Update quantity'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E4DC] text-gray-700 font-semibold">
                              {inventory.map((item) => {
                                const isLow = item.quantity <= item.minAlertThreshold;
                                return (
                                  <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3.5">
                                      <div className="font-bold text-gray-950">{lang === 'fi' ? item.nameFi : item.nameEn}</div>
                                      <span className="text-[9px] text-gray-400 font-mono">ID: {item.id}</span>
                                    </td>
                                    <td className="px-4 text-center font-mono font-bold text-[13px]">{item.quantity} {item.unit}</td>
                                    <td className="px-4 text-center font-mono text-gray-400">{item.minAlertThreshold} {item.unit}</td>
                                    <td className="px-4 text-center">
                                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                                        isLow 
                                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      }`}>
                                        {isLow ? (lang === 'fi' ? '⚠️ ALHAINEN VARASTO' : '⚠️ LOW STOCK') : (lang === 'fi' ? 'RIITTÄVÄ' : 'OK')}
                                      </span>
                                    </td>
                                    <td className="px-4 text-right">
                                      <div className="inline-flex gap-1">
                                        <button 
                                          onClick={() => updateStock(item.id, -1)}
                                          className="w-7 h-7 bg-white hover:bg-gray-100 border border-[#E0E4DC] text-gray-800 font-bold rounded-lg flex items-center justify-center cursor-pointer select-none"
                                        >-</button>
                                        <button 
                                          onClick={() => updateStock(item.id, 1)}
                                          className="w-7 h-7 bg-[#1B4332] hover:bg-[#20513d] text-white font-bold rounded-lg flex items-center justify-center cursor-pointer select-none"
                                        >+</button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Standard Operating Procedures (SOP) Section */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-[#1B4332]" />
                          <h4 className="font-serif text-base font-bold text-gray-900">
                            {lang === 'fi' ? 'Standarditoimintamenetelmät (SOP Guidelines)' : 'Corporate Standard Operating Procedures (SOP)'}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-[#E0E4DC] p-4 rounded-xl space-y-2">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 inline-block">
                              SOP 01: TAPIOLA DENTAL HYGIENE
                            </span>
                            <h5 className="font-serif text-sm font-bold text-gray-950">
                              {lang === 'fi' ? 'Hammasklinikan steriili ekosiivous' : 'Dental Treatment Clinic Sanitation Plan'}
                            </h5>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {lang === 'fi'
                                ? 'Hoitohuoneissa vaaditaan ehdoton kirurginen kosketuspuhtaus. Pyyhi hoitotuolit, hammaslääkärivalot ja tasot desinfiointiaineella kahdesti. Älä koskaan käytä samoja liinoja odotustilojen puhdistukseen.'
                                : 'Strict biological sterilization protocol. Every dental armchair and operating headlamp is wiped with eco-friendly sanitizers twice. Separate microfiber rags must be used exclusively in sterilized rooms.'
                              }
                            </p>
                          </div>

                          <div className="bg-white border border-[#E0E4DC] p-4 rounded-xl space-y-2">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 inline-block">
                              SOP 02: KEILANIEMI IT SECURITY
                            </span>
                            <h5 className="font-serif text-sm font-bold text-gray-950">
                              {lang === 'fi' ? 'Teknologiayritysten staattinen pölynsidonta' : 'Technology Center High-Value ESD Protocol'}
                            </h5>
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {lang === 'fi'
                                ? 'Palvelin- ja sähkötilojen läheisyydessä on käytettävä ainoastaan ESD-luokiteltuja (sähköstaattisesti turvallisia) imureita sekä sitruunapohjaista kemikaalipyyhintää ilmankosteuden säilyttämiseksi.'
                                : 'Electrostatic protection protocol in server environments. Cleaners must only use anti-static certified microfiber dusters and keep strict clearance from server cabling and structural racks.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Operational Documents & MSDS Sheets Section */}
                      <div className="space-y-4 pt-4 border-t border-gray-155">
                        <div className="flex justify-between items-center flex-wrap gap-2 text-left">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-[#1B4332]" />
                            <h4 className="font-serif text-base font-bold text-gray-900">
                              {lang === 'fi' ? 'Käyttöturvallisuustiedotteet & Operatiiviset ohjeet' : 'Eco MSDS Data Sheets & Operational Guidelines'}
                            </h4>
                          </div>

                          {/* Instant upload selector combo */}
                          <div className="flex items-center gap-2 flex-wrap text-left">
                            <select 
                              id="ops-file-category"
                              defaultValue="MSDS (Chem safety)"
                              className="border border-[#E0E4DC] rounded-lg px-2 py-1 bg-white focus:outline-[#1B4332] text-[10px] font-bold"
                            >
                              <option value="MSDS (Chem safety)">{lang === 'fi' ? 'Käyttöturvallisuustiedote (MSDS)' : 'Chem Safety (MSDS)'}</option>
                              <option value="SOP Instruction">{lang === 'fi' ? 'Toimintaohje (SOP Guide)' : 'SOP Guide'}</option>
                              <option value="Compliance Certificate">{lang === 'fi' ? 'Sertifikaatti (Certificate)' : 'Certificate'}</option>
                            </select>
                            
                            <label 
                              htmlFor="ops-file-picker" 
                              className="bg-[#1B4332] hover:bg-[#20513d] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-all select-none"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              {lang === 'fi' ? 'Lataa tiedosto' : 'Upload File'}
                            </label>
                            <input 
                              id="ops-file-picker"
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                const category = (document.getElementById('ops-file-category') as HTMLSelectElement)?.value || 'MSDS (Chem safety)';
                                if (file) handleOpsFileUpload(category, file);
                              }}
                            />
                          </div>
                        </div>

                        {/* List of files in a beautiful layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {operationalFiles.map((f) => {
                            const isMsds = f.category.toLowerCase().includes('msds') || f.category.toLowerCase().includes('kemikaali');
                            return (
                              <div key={f.id} className="bg-white border border-[#E0E4DC] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#CBDCCF] transition-all shadow-sm">
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100/50 text-[#1B4332] shrink-0">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 text-left">
                                    <h5 className="font-bold text-gray-950 text-xs truncate" title={f.name}>{f.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        isMsds ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {f.category}
                                      </span>
                                      <span className="text-[9px] font-mono text-gray-400">{f.size} • {f.date}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <a 
                                    href={f.content} 
                                    download={f.name}
                                    className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-250 text-[#1B4332] text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all inline-block select-none"
                                    title={lang === 'fi' ? 'Lataa tiedosto' : 'Download document'}
                                  >
                                    <Download className="w-3 h-3 inline" />
                                    <span>{lang === 'fi' ? 'Lataa' : 'Get'}</span>
                                  </a>
                                  <button
                                    onClick={() => handleDeleteOpsFile(f.id)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                    title={lang === 'fi' ? 'Poista asiakirja' : 'Delete file'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {operationalFiles.length === 0 && (
                            <div className="md:col-span-2 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                              <p className="text-xs font-semibold">{lang === 'fi' ? 'Ei ladattuja ohjekirjoja tai tiedotteita.' : 'No operational manual files uploaded remaining.'}</p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 5: ADMIN PROFILE PASSWORD CHANGE */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6 text-left">
                      
                      {/* Section Title */}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                          {lang === 'fi' ? 'Ylläpitäjän Profiili & Järjestelmäasetukset' : 'Operations Director Profile'}
                        </h3>
                        <p className="text-[#5C6F63] text-xs mt-1">
                          {lang === 'fi' 
                            ? 'Päivitä yrityksen bränditiedot tai omat yhteystietosi.'
                            : 'Update director information and modify organization configurations.'
                          }
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Summary details card */}
                        <div className="bg-[#FAFBF9] border border-[#E0E4DC] rounded-xl p-5 shadow-sm text-center flex flex-col items-center justify-center">
                          <div className="relative group mb-3">
                            {profile.avatarUrl ? (
                              <img 
                                src={profile.avatarUrl} 
                                alt={profile.name} 
                                className="w-20 h-20 rounded-full object-cover border-2 border-[#1B4332] shadow-md"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold font-serif text-xl border border-[#CBDCCF] shadow-md">
                                {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            
                            {/* Photo capture uploader widget label */}
                            <label 
                              htmlFor="admin-avatar-picker"
                              className="absolute bottom-0 right-0 p-1.5 bg-[#1B4332] hover:bg-[#20513d] text-white rounded-full border-2 border-white cursor-pointer hover:scale-105 transition-all shadow-md flex items-center justify-center"
                              title={lang === 'fi' ? 'Lataa profiilikuva' : 'Upload profile image'}
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </label>
                            <input 
                              id="admin-avatar-picker"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAdminAvatarUpload(file);
                              }}
                            />
                          </div>

                          <h4 className="font-serif text-base font-bold text-gray-900">{profile.name}</h4>
                          <p className="text-[11px] text-[#1B4332] font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-250 mt-1">
                            {profile.role}
                          </p>
                          <p className="text-[11px] text-[#5C6F63] mt-2 font-semibold">
                            {profile.companyName} • {profile.email}
                          </p>
                        </div>

                        {/* Editable form panel */}
                        <div className="md:col-span-2 bg-white border border-[#E0E4DC] p-5 rounded-2xl shadow-sm">
                          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Nimi (Director name)' : 'Your Name'}</label>
                                <input
                                  type="text"
                                  className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-xs focus:outline-[#1B4332]"
                                  value={profile.name}
                                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Sähköposti (Mailbox)' : 'Email'}</label>
                                <input
                                  type="email"
                                  className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-xs focus:outline-[#1B4332]"
                                  value={profile.email}
                                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Puhelinnumero' : 'Direct Phone'}</label>
                                <input
                                  type="text"
                                  className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-xs focus:outline-[#1B4332]"
                                  value={profile.phone}
                                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-gray-500 uppercase tracking-wider block text-[10px]">{lang === 'fi' ? 'Yrityksen virallinen nimi' : 'Legal Company Name'}</label>
                                <input
                                  type="text"
                                  className="w-full border border-[#E0E4DC] bg-white rounded-lg px-3 py-2 text-xs focus:outline-[#1B4332]"
                                  value={profile.companyName}
                                  onChange={(e) => setProfile(prev => ({ ...prev, companyName: e.target.value }))}
                                />
                              </div>
                            </div>

                            {profileSuccessMsg && (
                              <div className="bg-emerald-50 border border-emerald-100 text-[#1B4332] p-2.5 rounded-lg text-xs font-serif font-bold">
                                ✓ {profileSuccessMsg}
                              </div>
                            )}

                            <button
                              type="submit"
                              className="bg-[#1B4332] hover:bg-[#20513d] text-white px-4 py-2 rounded-lg font-bold cursor-pointer transition-all text-center inline-block"
                            >
                              {lang === 'fi' ? 'Tallenna profiilin muutokset' : 'Save profile changes'}
                            </button>

                          </form>
                        </div>

                      </div>

                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </main>

          </div>

        </div>
      )}
      
    </div>
  );
}
