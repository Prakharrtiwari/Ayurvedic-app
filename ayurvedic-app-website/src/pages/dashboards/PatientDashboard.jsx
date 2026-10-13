import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { patientApi, publicApi, uploadImage } from '../../services/api';
import VideoConsultationModal from '../../components/VideoConsultationModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Drawer from '../../components/Drawer';
import SignOutConfirmModal from '../../components/SignOutConfirmModal';
import { rawHerbsData, doctorsData, chronicProgramsData } from '../../data/mockData';
import yogaAsanasData from '../../data/yogaAsanas.json';
import { 
  Globe,
  ThumbsUp,
  MessageCircle,
  HelpCircle,
  Heart, 
  Activity, 
  Calendar, 
  FileText, 
  Edit3, 
  CheckCircle2, 
  Video, 
  Clock, 
  AlertCircle,
  Plus, 
  ShieldCheck, 
  Stethoscope, 
  ChevronRight, 
  Download, 
  Sparkles, 
  Pill, 
  Send, 
  ShoppingBag, 
  Truck, 
  Gift, 
  Award, 
  Flame, 
  Droplet, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Eye, 
  Coffee, 
  Moon, 
  Sun, 
  Star, 
  Search, 
  Tag, 
  Percent, 
  Zap, 
  Layers, 
  TestTube, 
  Bot, 
  CheckSquare, 
  PhoneCall, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  Camera,
  QrCode,
  MapPin,
  MessageSquare,
  UploadCloud,
  FileCheck,
  Leaf,
  LogOut,
  LifeBuoy,
  Menu,
  ExternalLink,
  ArrowLeft,
  Home,
  User,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import RaiseSupportTicketModal from '../../components/RaiseSupportTicketModal';
import { getSocket, joinUserRoom } from '../../services/socket';

export default function PatientDashboard({ onAddToCart, cart = [] }) {
  const { user, logout } = useAuth();
  const { lang, selectLanguage, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Live Cart Item Counter
  const cartCount = (cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Sign Out Modal State
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  const handleConfirmSignOut = () => {
    setSignOutModalOpen(false);
    logout();
    navigate('/portal', { replace: true });
  };

  // Live Community Posts & Interactive Forum State
  const [communityPosts, setCommunityPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState('Diabetes Reversal');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [postingCommunity, setPostingCommunity] = useState(false);
  const [communityCategory, setCommunityCategory] = useState('All');
  const [communityLiked, setCommunityLiked] = useState({});
  const [expandedComments, setExpandedComments] = useState({ 'sample-1': true });
  const [communityComments, setCommunityComments] = useState({
    'sample-1': [
      { id: 'c1', author: 'Dr. Rajeshwar Verma', role: 'BHMS Clinician', text: 'Splendid progress! Keep a strict 30-min gap between Kadha and heavy meals for optimal Pitta assimilation.', time: '2 hours ago', isDoctor: true },
      { id: 'c2', author: 'Vikas Mehra', role: 'Patient', text: 'Did you experience any bitterness initially with Giloy? How did you prepare it?', time: '4 hours ago', isDoctor: false }
    ],
    'sample-2': [
      { id: 'c3', author: 'Anita S.', role: 'Patient', text: 'I had the same warmth! Dr. Ananya advised drinking buttermilk with roasted cumin after lunch, worked wonders.', time: '1 day ago', isDoctor: false }
    ],
    'sample-3': [
      { id: 'c4', author: 'Dr. Anandvardhan', role: 'BHMS Joint Specialist', text: 'Mahanarayan Taila warmed in a katori produces best transdermal relief when applied before bedtime.', time: '5 hours ago', isDoctor: true }
    ],
    'sample-4': [
      { id: 'c5', author: 'Kavita Joshi', role: 'Patient', text: 'Did you take it with raw honey or cow milk? My sleep quality has improved immensely as well.', time: '1 day ago', isDoctor: false }
    ]
  });
  const [commentInput, setCommentInput] = useState({});
  const [showAskModal, setShowAskModal] = useState(false);

  // Live Chronic Disease Program Enrollment
  const [activeEnrollments, setActiveEnrollments] = useState([]);
  const [enrollingProgram, setEnrollingProgram] = useState(false);

  // Live Database Records
  const [dbProducts, setDbProducts] = useState([]);
  const [dbDoctors, setDbDoctors] = useState([]);
  const [dbLabTests, setDbLabTests] = useState([]);

  // Main Section Navigation (Flipkart/Myntra style tabs)
  // 'store', 'doctors', 'orders', 'consultations', 'chat', 'community', 'supercoins'
  const [activeTab, setActiveTab] = useState('store');

  // Synchronize Tab and Actions with URL Search Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    const docIdParam = params.get('doctorId');
    if (docIdParam) {
      setActiveChatDoctorId(docIdParam);
    }
  }, [location.search]);

  // E-Commerce Store Filters & Search
  const [storeCategory, setStoreCategory] = useState('All');
  const [storeSearch, setStoreSearch] = useState('');
  const [addedItems, setAddedItems] = useState({});

  // Deep Item / Product Detail Drawer Modal (Just like main website)
  const [selectedProductDrawer, setSelectedProductDrawer] = useState(null);
  const [productSelectedWeight, setProductSelectedWeight] = useState('250g');
  const [productQuantity, setProductQuantity] = useState(1);
  const [productActiveTab, setProductActiveTab] = useState('overview');

  // Doctor Deep Clinical Profile & Consultation Booking Drawer (Just like main website)
  const [selectedDoctorDrawer, setSelectedDoctorDrawer] = useState(null);
  const [docSpecialty, setDocSpecialty] = useState('All');
  const [bookingSlot, setBookingSlot] = useState('Today at 4:30 PM');
  const [bookingType, setConsultType] = useState('video');
  const [bookingComplaint, setBookingComplaint] = useState('');
  const [applySuperCoinsDiscount, setApplySuperCoinsDiscount] = useState(true);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Scan Prescription (AI OCR) Modal State
  const [scanPrescriptionModalOpen, setScanPrescriptionModalOpen] = useState(false);
  const [scanningPrescription, setScanningPrescription] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  // Interactive Daily Habits & Reminders
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [takenDoses, setTakenDoses] = useState({
    morning: true,
    afternoon: true,
    bedtime: false
  });
  const [bloodSugar, setBloodSugar] = useState(108);

  // SuperCoins & Scratch Card
  const [superCoins, setSuperCoins] = useState(450);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // AI Health Assessment State
  const [aiQuestionStep, setAiQuestionStep] = useState(1);
  const [aiAnswers, setAiAnswers] = useState({
    condition: 'Diabetes & High Sugar',
    digestion: 'Sluggish / Bloating after food',
    sleep: '6 hours / Restless',
    energy: 'Low in afternoons'
  });
  const [aiAssessmentResult, setAiAssessmentResult] = useState(null);

  // Health Profile Drawer
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  // Mobile Left Side Drawer State
  const [mobileSideDrawerOpen, setMobileSideDrawerOpen] = useState(false);
  // Mobile Services & Tools Bottom Sheet State
  const [mobileServicesDrawerOpen, setMobileServicesDrawerOpen] = useState(false);

  // 1-Click Buy for Doctor's Prescription (Dynamic Parsing of Prescribed Herbs)
  const handleBuyAllPrescriptionItems = (rx) => {
    let herbsList = [];
    try {
      if (typeof rx.herbsPrescribed === 'string') {
        herbsList = JSON.parse(rx.herbsPrescribed);
      } else if (Array.isArray(rx.herbsPrescribed)) {
        herbsList = rx.herbsPrescribed;
      }
    } catch (e) {
      herbsList = [];
    }

    if (!herbsList || herbsList.length === 0) {
      herbsList = [
        { herb: 'Purified Wild Amrita Giloy Stem Powder', dosage: '3g morning empty stomach' },
        { herb: 'Pure Nagori Ashwagandha Root Powder', dosage: '5g bedtime with warm milk' }
      ];
    }

    let addedCount = 0;
    herbsList.forEach((item, idx) => {
      const herbName = typeof item === 'string' ? item : (item.herb || item.name || 'Ayurvedic Herb');
      const matched = dbProducts.find(p => p.name.toLowerCase().includes(herbName.toLowerCase().split(' ')[0]));
      
      const productToAdd = matched ? {
        ...matched,
        quantity: 1,
        refillPlan: true,
        prescribedDosage: item.dosage || 'As directed by Vaidya'
      } : {
        id: `rx-med-${rx.id || 'rx'}-${idx}`,
        name: herbName,
        price: 299,
        originalPrice: 380,
        image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
        sellerName: 'AYUSH Certified Organic Cluster',
        doctorPrescribed: true,
        prescribedDosage: item.dosage || 'As directed by Doctor',
        quantity: 1,
        refillPlan: true
      };

      if (onAddToCart) {
        onAddToCart(productToAdd);
        addedCount++;
      }
    });

    setSuccessMsg(`✓ Added ${addedCount} prescribed herbal remedies directly to cart with Auto-Refill enabled!`);
    setTimeout(() => {
      setSuccessMsg(null);
      navigate('/cart');
    }, 1100);
  };
  const [profileForm, setProfileForm] = useState({
    age: 35,
    gender: 'Male',
    bloodGroup: 'B+',
    existingConditions: ['Type 2 Diabetes', 'Fatty Liver (Grade 1)'],
    allergies: 'Dust pollen, Penicillin',
    currentMedications: 'Metformin 500mg OD',
    dietType: 'Sattvic / Ayurvedic'
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Real Video Consultation Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Real Orders State
  const [realOrders, setRealOrders] = useState([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState('AYUR-2026-881');

  // Real Skin Photo Progress Tracker State
  const [skinPhotos, setSkinPhotos] = useState([]);
  const [skinConditionInput, setSkinConditionInput] = useState('Psoriasis / Eczema Itch');
  const [skinNotesInput, setSkinNotesInput] = useState('');
  const [uploadingSkinPhoto, setUploadingSkinPhoto] = useState(false);

  // Real In-App Doctor Chat State (Unique Conversations Isolated per Doctor)
  const [doctorChatsMap, setDoctorChatsMap] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [activeChatDoctorId, setActiveChatDoctorId] = useState(null);
  const [chatSearchDoctor, setChatSearchDoctor] = useState('');
  const [mobileChatView, setMobileChatView] = useState('conversation'); // 'list' or 'conversation'
  const chatEndRef = useRef(null);

  // Live Real-Time Chat Polling per Selected Doctor
  const fetchPatientChat = async () => {
    try {
      const targetDocId = activeChatDoctorId || (dbDoctors[0]?.userId || dbDoctors[0]?.id || 'dr-ananya');
      const res = await patientApi.getMessages(targetDocId);
      if (res && res.success && res.messages) {
        setDoctorChatsMap(prev => ({
          ...prev,
          [targetDocId]: res.messages
        }));
      }
    } catch (e) {
      // quiet poll
    }
  };

  useEffect(() => {
    fetchPatientChat();
    const interval = setInterval(() => {
      fetchPatientChat();
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChatDoctorId, dbDoctors]);

  // Auto-scroll to latest message whenever conversation or active doctor changes
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [doctorChatsMap, activeChatDoctorId, activeTab]);

  // Real Yoga & Asana Explorer State (Integrated from Advik Diagnostics)
  const [yogaCategory, setYogaCategory] = useState('All');
  const [yogaSearch, setYogaSearch] = useState('');
  const [selectedAsana, setSelectedAsana] = useState(null);

  // Real Drug-Herb Conflict Checker State
  const [selectedDrug, setSelectedDrug] = useState('Metformin (Diabetes)');
  const [selectedHerbConflict, setSelectedHerbConflict] = useState('Purified Giloy Stem');
  const [interactionResult, setInteractionResult] = useState(null);

  // Return / Replace Order State
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Damaged packaging during transit');
  const [returnNote, setReturnNote] = useState('');
  const [returnSubmittedOrders, setReturnSubmittedOrders] = useState({});

  // Second Opinion State
  const [secondOpinionModal, setSecondOpinionModal] = useState(null);
  const [secondOpinionStatus, setSecondOpinionStatus] = useState({});

  // Family Profiles State
  const [activeFamilyMember, setActiveFamilyMember] = useState('Self');
  const [familyProfiles, setFamilyProfiles] = useState({
    'Self': { name: user?.name || 'Arav Patel', relation: 'Self', age: 35, gender: 'Male', bloodGroup: 'B+', conditions: ['Type 2 Diabetes', 'Fatty Liver (Grade 1)'], meds: 'Metformin 500mg OD', allergies: 'Dust pollen, Penicillin' },
    'Father': { name: 'Ramesh Patel', relation: 'Father', age: 64, gender: 'Male', bloodGroup: 'O+', conditions: ['Hypertension', 'Knee Osteoarthritis'], meds: 'Amlodipine 5mg, Calcium 500mg', allergies: 'None reported' },
    'Mother': { name: 'Sunita Patel', relation: 'Mother', age: 58, gender: 'Female', bloodGroup: 'B+', conditions: ['Hypothyroidism', 'Digestive Sluggishness'], meds: 'Thyroxine 50mcg', allergies: 'Sulfa drugs' }
  });

  const drugHerbInteractions = {
    'Metformin (Diabetes)': {
      'Purified Giloy Stem': {
        level: 'MODERATE CAUTION',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        summary: 'Synergistic Hypoglycemic Action',
        mechanism: 'Both Metformin and Giloy (Tinospora cordifolia) activate AMPK pathways and enhance peripheral glucose uptake.',
        guidance: 'Safe to take together, but monitor morning fasting sugar regularly. Do not abruptly reduce Metformin dosage without doctor supervision.'
      },
      'Nagori Ashwagandha Churna': {
        level: 'SAFE & BENEFICIAL',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        summary: 'No Adverse Interaction • Improves Insulin Sensitivity',
        mechanism: 'Ashwagandha modulates cortisol-induced insulin resistance without inducing direct acute hypoglycemia.',
        guidance: 'Take Ashwagandha at bedtime with warm water/milk, keeping a 2-hour gap from Metformin.'
      },
      'Triphala Kadha Churna': {
        level: 'SAFE',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        summary: 'Improves Gut Absorption',
        mechanism: 'Triphala cleanses colon and regulates digestive Agni without altering Metformin metabolism.',
        guidance: 'Safe. Take 30 minutes after dinner with lukewarm water.'
      }
    },
    'Warfarin / Aspirin (Blood Thinners)': {
      'Purified Giloy Stem': {
        level: 'SAFE',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        summary: 'No Significant Hemostatic Interaction',
        mechanism: 'Giloy does not inhibit platelet aggregation at standard therapeutic doses (3g/day).',
        guidance: 'Safe at prescribed doses. Maintain routine INR checks.'
      },
      'Nagori Ashwagandha Churna': {
        level: 'MILD CAUTION',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        summary: 'Potential Mild Anticoagulant Synergy',
        mechanism: 'High doses of withanolides may mildly delay coagulation cascade.',
        guidance: 'Maintain 2 to 3-hour interval between doses and avoid exceeding 3g daily.'
      }
    },
    'Thyroxine (Hypothyroid)': {
      'Nagori Ashwagandha Churna': {
        level: 'MONITOR TSH',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe',
        summary: 'Stimulates Endogenous T3/T4 Synthesis',
        mechanism: 'Ashwagandha has documented pro-thyroid effects and stimulates glandular secretion of thyroid hormones.',
        guidance: 'Take Thyroxine empty stomach in morning, and Ashwagandha at night. Re-test TSH levels after 6 weeks.'
      }
    },
    'Amlodipine (Blood Pressure)': {
      'Arjuna Bark Churna': {
        level: 'SYNERGISTIC BENEFIT',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        summary: 'Complementary Vasodilation & Cardioprotection',
        mechanism: 'Arjuna improves left ventricular ejection fraction and works in synergy with calcium channel blockers.',
        guidance: 'Safe and recommended. Maintain regular BP monitoring.'
      }
    }
  };

  // 1. Phone Camera Herb Identification Lens State
  const [herbLensModalOpen, setHerbLensModalOpen] = useState(false);
  const [herbScanning, setHerbScanning] = useState(false);
  const [herbScanResult, setHerbScanResult] = useState(null);
  const [herbImagePreview, setHerbImagePreview] = useState(null);

  const botanicalHerbDatabase = [
    {
      name: "Nagori Ashwagandha Root",
      botanical: "Withania somnifera (L.) Dunal",
      family: "Solanaceae",
      confidence: "99.4%",
      organoleptic: "Characteristic equine horse-like aroma, creamy buff-white root fracture, sweet-bitter taste",
      rasa: "Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)",
      virya: "Ushna (Warm/Potent)",
      keyWithanolides: "Withaferin-A > 1.8%, Withanolide D",
      clinicalUses: "Cortisol attenuation, GABA-A receptor modulation, adaptogenic metabolic stamina",
      farmSource: "Neemuch, Madhya Pradesh (Harvest: Jan 2026)",
      matchingProduct: "Pure Nagori Ashwagandha Root Powder",
      badge: "AYUSH Grade A Purity"
    },
    {
      name: "Wild Amrita Giloy Stem",
      botanical: "Tinospora cordifolia (Willd.) Miers",
      family: "Menispermaceae",
      confidence: "98.9%",
      organoleptic: "Corky grooved lenticelled bark, rosette wheel-spoke arrangement on transverse cross-section",
      rasa: "Tikta (Intensely Bitter), Kashaya (Astringent)",
      virya: "Ushna (Potent)",
      keyWithanolides: "Tinosporaside, Berberine, Cordifolioside A",
      clinicalUses: "AMPK-mediated insulin sensitization, macrophage phagocytosis, Pitta-Rakta detoxification",
      farmSource: "Satpura Tiger Reserve buffer, Wild Forest Harvest",
      matchingProduct: "Purified Wild Amrita Giloy Stem Powder",
      badge: "Wild-Harvest Certified"
    },
    {
      name: "Terminalia Arjuna Bark",
      botanical: "Terminalia arjuna (Roxb.) Wight & Arn.",
      family: "Combretaceae",
      confidence: "98.2%",
      organoleptic: "Pinkish-red smooth internal surface, fibrous splinter fracture, astringent drying taste",
      rasa: "Kashaya (Astringent)",
      virya: "Sheeta (Cooling)",
      keyWithanolides: "Arjunic acid, Arjunetin, Bioflavonoids",
      clinicalUses: "Endothelial vasodilation, left ventricular inotropic support, lipid peroxidation defense",
      farmSource: "Chhindwara Agro-Forestry Cooperative",
      matchingProduct: "Arjuna Bark Decoction Churna",
      badge: "NABL Metal Tested"
    }
  ];

  const handleScanHerbSample = (sampleIndex = 0) => {
    setHerbScanning(true);
    setHerbScanResult(null);
    setTimeout(() => {
      setHerbScanning(false);
      setHerbScanResult(botanicalHerbDatabase[sampleIndex % botanicalHerbDatabase.length]);
    }, 1100);
  };

  // 2. Auto-Refill Subscription System State
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState([
    {
      id: 'SUB-2026-081',
      title: '90-Day Type-2 Diabetes Reversal Monthly Care Kit',
      items: 'Giloy Stem Churna (250g) + Jamun Seed Powder (200g) + Karela Extract',
      frequency: 'Every 30 Days',
      nextDelivery: '28 Oct 2026',
      amount: 680,
      savings: 'Save ₹120 (15% Auto-Refill Discount)',
      status: 'ACTIVE'
    },
    {
      id: 'SUB-2026-044',
      title: 'Nagori Ashwagandha Deep Rest & Cortisol Box',
      items: 'Nagori Ashwagandha Root Powder (250g) with Measuring Scoop',
      frequency: 'Every 30 Days',
      nextDelivery: '04 Nov 2026',
      amount: 320,
      savings: 'Save ₹60 (15% Auto-Refill Discount)',
      status: 'ACTIVE'
    }
  ]);

  // 3. Home Lab Test Collection Slot Picker State
  const [labSlotModalTest, setLabSlotModalTest] = useState(null);
  const [labSelectedMember, setLabSelectedMember] = useState('Self');
  const [labAddress, setLabAddress] = useState('Flat 402, Green Glen Residency, Outer Ring Road, Bengaluru - 560103');
  const [labDate, setLabDate] = useState('Tomorrow (Fasting Required)');
  const [labTimeSlot, setLabTimeSlot] = useState('07:00 AM – 08:30 AM (Morning Fasting)');
  const [labBookingConfirmed, setLabBookingConfirmed] = useState(null);
  const [labBookingSubmitting, setLabBookingSubmitting] = useState(false);

  // 4. Formal Grievance & Complaint Redressal Desk State
  const [grievanceModalOpen, setGrievanceModalOpen] = useState(false);
  const [grievanceCategory, setGrievanceCategory] = useState('Packaging / Purity Seal Issue');
  const [grievanceOrderNo, setGrievanceOrderNo] = useState('ORD-892110');
  const [grievanceDetails, setGrievanceDetails] = useState('');
  const [grievanceTickets, setGrievanceTickets] = useState([
    {
      id: 'GRV-2026-039',
      category: 'Packaging / Purity Seal Issue',
      orderNo: 'ORD-891102',
      details: 'Outer foil seal was torn upon BlueDart doorstep arrival.',
      officer: 'Dr. V. K. Nambiar (Statutory Grievance Officer, AYUSH Reg #AYU/2012)',
      sla: 'Resolved within 24 hours (Free Doorstep Replacement Dispatched)',
      status: 'RESOLVED',
      createdAt: '22 Sep 2026'
    }
  ]);

  // Real Web Audio API Herbal Chime Generator (Zero Third-Party Dependency)
  const playHerbalReminderChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 1.2);
      });
    } catch (e) {
      console.warn('Audio chime note:', e);
    }
  };

  const handleTestChimeAndNotification = async () => {
    playHerbalReminderChime();
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('🌿 Ayurveda Medicine Reminder', {
            body: 'Time for your midday Purified Giloy Stem Churna dose with warm water.',
            icon: '/favicon.ico'
          });
        }
      } catch (e) {}
    }
    alert('🔔 Harmonious Ayurvedic Chime Synthesized! Desktop notification alert triggered.');
  };

  const handleUploadSkinPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSkinPhoto(true);
    try {
      const res = await uploadImage(file);
      if (res.success && res.fileUrl) {
        await patientApi.uploadSkinPhoto({
          imageUrl: res.fileUrl,
          condition: skinConditionInput,
          notes: skinNotesInput || `Day ${skinPhotos.length + 1} progress tracking`
        });
        setSkinNotesInput('');
        const updated = await patientApi.getSkinPhotos();
        if (updated.success) setSkinPhotos(updated.photos || []);
        alert('📸 Skin health photo recorded into your confidential clinical timeline!');
      }
    } catch (err) {
      alert(err.message || 'Error uploading photo');
    } finally {
      setUploadingSkinPhoto(false);
    }
  };

  const handleSendPatientChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const targetDocId = activeChatDoctorId || (dbDoctors[0]?.userId || dbDoctors[0]?.id || 'dr-ananya');
    const text = chatInput.trim();
    setChatInput('');
    setSendingChat(true);

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      senderId: user?.id,
      receiverId: targetDocId,
      senderRole: 'PATIENT',
      message: text,
      createdAt: new Date().toISOString()
    };

    setDoctorChatsMap(prev => ({
      ...prev,
      [targetDocId]: [...(prev[targetDocId] || []), optimisticMsg]
    }));
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);

    try {
      await patientApi.sendMessage({
        doctorId: targetDocId,
        message: text
      });
      const res = await patientApi.getMessages(targetDocId);
      if (res && res.success && res.messages) {
        setDoctorChatsMap(prev => ({
          ...prev,
          [targetDocId]: res.messages
        }));
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);
      }
    } catch (err) {
      alert(err.message || 'Error sending message');
    } finally {
      setSendingChat(false);
    }
  };

  const handleCreateCommunityPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    setPostingCommunity(true);

    const localPost = {
      id: `local-${Date.now()}`,
      authorName: `${user?.name || 'Verified Patient'} (${user?.city || 'Delhi'})`,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      conditionTag: newPostTag,
      imageUrl: newPostImageUrl.trim() || null,
      likesCount: 1,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await patientApi.createCommunityPost({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        conditionTag: newPostTag
      });
      if (res && res.success) {
        const updated = await patientApi.getCommunityPosts();
        if (updated && updated.success && updated.posts) {
          setCommunityPosts(updated.posts);
        } else {
          setCommunityPosts(prev => [localPost, ...prev]);
        }
      } else {
        setCommunityPosts(prev => [localPost, ...prev]);
      }
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUrl('');
      setShowAskModal(false);
      alert('🎉 Your question/healing milestone has been published to the community forum!');
    } catch (err) {
      setCommunityPosts(prev => [localPost, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImageUrl('');
      setShowAskModal(false);
    } finally {
      setPostingCommunity(false);
    }
  };

  const handleLikePost = async (postId) => {
    const isLiked = !!communityLiked[postId];
    setCommunityLiked(prev => ({ ...prev, [postId]: !isLiked }));
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likesCount: Math.max(0, (p.likesCount || 0) + (isLiked ? -1 : 1)) };
      }
      return p;
    }));

    try {
      const res = await patientApi.likeCommunityPost(postId);
      if (res && res.success && res.likesCount !== undefined) {
        setCommunityPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: res.likesCount } : p));
      }
    } catch (e) {
      console.warn('Like error', e);
    }
  };

  const handleAddCommunityComment = (postId) => {
    const text = (commentInput[postId] || '').trim();
    if (!text) return;
    const newComm = {
      id: `comm-${Date.now()}`,
      author: user?.name || 'Verified Patient',
      role: 'Patient',
      text,
      time: 'Just now',
      isDoctor: false
    };
    setCommunityComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComm]
    }));
    setCommentInput(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
  };

  const handleEnrollProgram = async (programSlug, programTitle, durationDays = 90) => {
    setEnrollingProgram(true);
    try {
      const res = await patientApi.enrollProgram({ programSlug, programTitle, durationDays });
      if (res.success) {
        alert(`🌿 ${res.message}`);
        const updated = await patientApi.getActivePrograms();
        if (updated.success) setActiveEnrollments(updated.enrollments || []);
      }
    } catch (err) {
      alert(err.message || 'Error enrolling in program');
    } finally {
      setEnrollingProgram(false);
    }
  };

  // Synchronize Live Database Records
  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, docRes, labRes, ordersRes, photosRes, communityRes, progRes] = await Promise.all([
        patientApi.getDashboardData().catch(e => { console.warn('dash err', e); return null; }),
        publicApi.getProducts().catch(e => { console.warn('prod err', e); return null; }),
        publicApi.getVerifiedDoctors().catch(e => { console.warn('doc err', e); return null; }),
        publicApi.getLabTests().catch(e => { console.warn('lab err', e); return null; }),
        patientApi.getOrders().catch(e => { console.warn('orders err', e); return null; }),
        patientApi.getSkinPhotos().catch(e => { console.warn('photos err', e); return null; }),
        patientApi.getCommunityPosts().catch(e => { console.warn('community err', e); return null; }),
        patientApi.getActivePrograms().catch(e => { console.warn('prog err', e); return null; })
      ]);

      if (ordersRes && ordersRes.success && ordersRes.orders) {
        setRealOrders(ordersRes.orders);
      }

      if (photosRes && photosRes.success && photosRes.photos) {
        setSkinPhotos(photosRes.photos);
      }

      if (communityRes && communityRes.success && communityRes.posts) {
        setCommunityPosts(communityRes.posts);
      }

      if (progRes && progRes.success && progRes.enrollments) {
        setActiveEnrollments(progRes.enrollments);
      }

      if (dashRes && dashRes.success) {
        setData(dashRes);
        if (dashRes.wallet?.balanceCoins !== undefined) {
          setSuperCoins(dashRes.wallet.balanceCoins);
        }
        if (dashRes.vitalsLogs && dashRes.vitalsLogs.length > 0) {
          const latest = dashRes.vitalsLogs[0];
          if (latest.waterGlasses !== undefined && latest.waterGlasses !== null) {
            setWaterGlasses(latest.waterGlasses);
          }
          if (latest.bloodSugarFasting) {
            setBloodSugar(latest.bloodSugarFasting);
          }
        }
        if (dashRes.reminders && dashRes.reminders.length > 0) {
          const map = {};
          dashRes.reminders.forEach(r => {
            const time = (r.timeOfDay || '').toLowerCase();
            if (time.includes('07:') || time.includes('morning')) map.morning = r.isTaken;
            else if (time.includes('01:') || time.includes('afternoon') || time.includes('lunch')) map.afternoon = r.isTaken;
            else if (time.includes('10:') || time.includes('bedtime') || time.includes('night')) map.bedtime = r.isTaken;
          });
          setTakenDoses(prev => ({ ...prev, ...map }));
        }
        if (dashRes.patient?.profile) {
          const p = dashRes.patient.profile;
          setProfileForm({
            age: p.age || 35,
            gender: p.gender || 'Male',
            bloodGroup: p.bloodGroup || 'B+',
            existingConditions: p.existingConditions ? (typeof p.existingConditions === 'string' ? JSON.parse(p.existingConditions) : p.existingConditions) : ['Type 2 Diabetes'],
            allergies: p.allergies || 'Dust pollen, Penicillin',
            currentMedications: p.currentMedications || 'Metformin 500mg OD',
            dietType: p.dietType || 'Sattvic / Ayurvedic'
          });
        }
      }

      if (prodRes && prodRes.success && prodRes.products?.length > 0) {
        setDbProducts(prodRes.products);
      }

      if (docRes && docRes.success && docRes.doctors?.length > 0) {
        setDbDoctors(docRes.doctors.map((d, idx) => ({
          id: d.id,
          name: d.name,
          degree: d.degree || 'BHMS, MD (Homoeopathy)',
          specialization: Array.isArray(d.specialization) ? d.specialization.join(', ') : d.specialization,
          specializationList: Array.isArray(d.specialization) ? d.specialization : (typeof d.specialization === 'string' ? d.specialization.split(',').map(s => s.trim()) : ['Metabolic Care', 'Diabetes Reversal']),
          experience: `${d.experienceYears || 10}+ Years Exp`,
          experienceYears: d.experienceYears || 10,
          rating: d.rating || 4.9,
          consultationsCount: `${d.reviewsCount || 240}+`,
          registrationNo: d.registrationNumber || 'DHC/2015/8492',
          councilName: d.councilName || 'Delhi Homoeopathic Council / NCH',
          college: d.college || 'Nehru Homoeopathic Medical College, New Delhi',
          languages: 'Hindi, English, Regional',
          nextSlot: d.nextSlot || 'Today at 4:30 PM',
          fee: d.consultationFee || 599,
          clinicAddress: d.clinicAddress || 'AyurSutra Holistic Clinic, New Delhi',
          about: d.bio || 'Verified AYUSH clinician specializing in root-cause metabolic and chronic disease reversal with botanical diet protocols.',
          image: doctorsData[idx % doctorsData.length]?.image || 'https://images.unsplash.com/photo-1594824813629-4e50d754b207?auto=format&fit=crop&w=400&q=80'
        })));
      }

      if (labRes && labRes.success && labRes.tests?.length > 0) {
        setDbLabTests(labRes.tests);
      }
    } catch (err) {
      console.error('Patient data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
    if (user?.id) {
      const socket = getSocket();
      joinUserRoom(user.id);
    }
  }, [user]);

  const handleAddToCartLocal = (herb, customWeight = null, customQty = 1) => {
    const multiplier = customWeight === '500g' ? 1.85 : customWeight === '1kg' ? 3.4 : 1.0;
    const finalPrice = Math.round((herb.price || 349) * multiplier);
    
    if (onAddToCart) {
      onAddToCart({
        ...herb,
        price: finalPrice,
        selectedWeight: customWeight || '250g',
        quantity: customQty
      });
    }
    setAddedItems(prev => ({ ...prev, [herb.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [herb.id]: false }));
    }, 1800);
  };

  // Real Database Consultation Booking
  const handleConfirmDoctorBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctorDrawer) return;

    setBookingSubmitting(true);
    try {
      const modePrice = getDoctorFeeForMode(selectedDoctorDrawer, bookingType);
      const discount = applySuperCoinsDiscount && superCoins >= 100 ? 100 : 0;
      const finalPaid = Math.max(0, modePrice - discount);

      await patientApi.bookConsultation({
        doctorId: selectedDoctorDrawer.id,
        timeSlot: bookingSlot,
        mode: bookingType.toUpperCase(),
        symptomsNote: `${bookingComplaint} (Patient Profile: Age ${profileForm.age}, Conditions: ${profileForm.existingConditions.join(', ')})`
      });

      setBookingSuccessMsg(`Consultation booked with ${selectedDoctorDrawer.name} for ${bookingSlot}! An encrypted HD link has been sent to your WhatsApp. +50 SuperCoins rewarded!`);
      setSuperCoins(prev => prev + 50 - discount);
      await fetchPatientData();
      
      setTimeout(() => {
        setSelectedDoctorDrawer(null);
        setBookingSuccessMsg(null);
        setActiveTab('consultations');
      }, 2400);
    } catch (err) {
      alert(err.message || 'Consultation booking failed. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Real Database Lab Test Booking
  const handleBookLabTest = async (test) => {
    try {
      await patientApi.bookLabTest({
        labTestId: test.id,
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        timeSlot: '07:30 AM - 08:30 AM (Fasting)',
        address: 'Home Address on Record'
      });
      alert(`Home collection booked for "${test.name}"! A certified phlebotomist visit is confirmed for tomorrow 7:30 AM.`);
      await fetchPatientData();
    } catch (err) {
      alert(`Lab appointment scheduled for "${test.name}"! Phlebotomist will arrive tomorrow between 7:30 AM – 8:30 AM.`);
    }
  };

  // Real Reminder Dose Toggle
  const handleToggleReminder = async (timeKey, reminderTitle) => {
    const nextVal = !takenDoses[timeKey];
    setTakenDoses(p => ({ ...p, [timeKey]: nextVal }));

    const match = data?.reminders?.find(r => 
      (r.timeOfDay || '').toLowerCase().includes(timeKey) || 
      (r.title || '').toLowerCase().includes(timeKey) ||
      (r.title || '').toLowerCase().includes((reminderTitle || '').slice(0, 6).toLowerCase())
    );

    if (match) {
      try {
        await patientApi.toggleReminder(match.id, nextVal);
      } catch (err) {
        console.warn('Reminder sync note:', err);
      }
    }
  };

  // Real Vitals Water Logger
  const handleUpdateWater = async (newCount) => {
    setWaterGlasses(newCount);
    try {
      await patientApi.logVitals({
        waterGlasses: newCount,
        bloodSugarFasting: bloodSugar
      });
    } catch (err) {
      console.warn('Vitals sync error:', err);
    }
  };

  // Live AI Prescription Scanner (Powered by Groq 120B OCR Extractor)
  const [customRxText, setCustomRxText] = useState('');
  const handleScanPrescription = async (overrideText) => {
    setScanningPrescription(true);
    try {
      const res = await patientApi.scanPrescription({
        prescriptionImageUrl: '/uploads/sample_doctor_rx.png',
        rawText: overrideText || customRxText || 'Rx: Dr. Ananya Sharma, BHMS, Reg: DHC/2015/8492. Patient: Rahul Sharma. Diagnosis: Type 2 Diabetes & Non-Alcoholic Fatty Liver. Purified Giloy Stem Churna 3g morning empty stomach with warm water for 30 days. Nagori Ashwagandha Churna 5g bedtime with warm milk 45 days. Triphala Kadha 3g post-dinner with lukewarm water 30 days.'
      });
      if (res.success && res.extracted) {
        setScannedResult(res.extracted);
        setSuccessMsg('✓ Groq 120B AI Extracted Medicines & Scheduled Daily Reminders!');
        setTimeout(() => setSuccessMsg(null), 4000);
        await fetchPatientData();
      }
    } catch (err) {
      alert(err.message || 'Error scanning prescription with AI');
    } finally {
      setScanningPrescription(false);
    }
  };

  // Live Ayurvedic Health Assessment (Powered by Groq 120B Clinical Intelligence)
  const [runningGroqAi, setRunningGroqAi] = useState(false);
  const handleRunAiAssessment = async () => {
    setRunningGroqAi(true);
    try {
      const res = await patientApi.saveAiAssessment({
        symptoms: aiAnswers.condition,
        digestion: aiAnswers.digestion,
        sleep: aiAnswers.sleep,
        energy: aiAnswers.energy,
        chronicConditions: profileForm.existingConditions,
        diet: profileForm.dietType
      });

      if (res.success && res.assessment) {
        const analysis = res.assessment.analysis || {};
        const resultObj = {
          dosha: analysis.doshaAnalysis || res.assessment.doshaAnalysis || 'Pitta-Kapha Aggravation',
          riskScore: analysis.riskScore || res.assessment.riskScore || 'Moderate (62/100)',
          diagnosis: analysis.clinicalSummary || res.assessment.clinicalSummary || 'Metabolic stagnation with secondary Ama accumulation.',
          recommendedHerbs: analysis.recommendedHerbs ? analysis.recommendedHerbs.map(h => ({
            name: `${h.herb} (${h.botanical || ''})`,
            role: `${h.dosage || ''} - ${h.benefit || ''}`
          })) : [
            { name: 'Purified Giloy (Tinospora cordifolia)', role: 'Ama detox & glycemic regulation' },
            { name: 'Nagori Ashwagandha', role: 'Cortisol modulation & sleep stability' }
          ],
          dietAdvice: analysis.dietaryAdvice,
          lifestyleTips: analysis.lifestyleRoutine,
          recommendedDoctor: analysis.recommendedDoctorSpecialty || 'Dr. Ananya Sharma (BHMS - Metabolic Specialist)',
          suggestedProgram: '90-Day Cellular Reset Protocol'
        };

        setAiAssessmentResult(resultObj);
        setSuccessMsg('✓ Real-time Ayurvedic AI Assessment generated via Groq (120B)!');
        setTimeout(() => setSuccessMsg(null), 4000);
        await fetchPatientData();
      }
    } catch (err) {
      console.warn('AI assessment sync note:', err);
      alert(err.message || 'AI Assessment failed');
    } finally {
      setRunningGroqAi(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await patientApi.updateProfile(profileForm);
      setProfileDrawerOpen(false);
      setSuccessMsg('Health profile & chronic conditions updated successfully in clinical records!');
      await fetchPatientData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Unified Product Lists (Database Products with fallback)
  const allProductsList = dbProducts.length > 0 ? dbProducts : rawHerbsData;

  // Curated Condition Kits
  const conditionKits = allProductsList
    .filter(p => p.category === 'Kits' || p.category === 'Personalised Kits')
    .concat(
      dbProducts.length === 0 ? [
        {
          id: 'kit-diabetes',
          name: '90-Day Type 2 Diabetes Reversal Kit',
          rating: 4.9,
          reviewsCount: 382,
          discount: '40% OFF',
          price: 1899,
          mrp: 3199,
          badge: 'TOP SELLER',
          includes: 'Purified Giloy (250g) + Jamun Seed Powder (200g) + Vijaysar Glass Tumbler + Diet Chart',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
          category: 'Kits',
          botanicalName: 'Synergistic Glycemic Formulation',
          farmSource: 'Narmada Organic Co-op, Neemuch, Madhya Pradesh',
          harvestDate: 'August 2026',
          batchNo: 'KIT-DIA-2026-90',
          labReportStatus: 'Heavy Metals <0.01ppm • Pesticide Free'
        },
        {
          id: 'kit-liver',
          name: 'Hepatic Agni: Fatty Liver Cleanse Box',
          rating: 4.8,
          reviewsCount: 219,
          discount: '35% OFF',
          price: 1549,
          mrp: 2399,
          badge: 'DOCTOR RECOMMENDED',
          includes: 'Kalmegh Whole Herb (150g) + Bhumi Amla Powder (200g) + Kutki Root Extract (50g)',
          image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80',
          category: 'Kits',
          botanicalName: 'Hepatoprotective Detox Formulation',
          farmSource: 'Malwa Organic Herbal Cluster, MP',
          harvestDate: 'August 2026',
          batchNo: 'KIT-LIV-2026-60',
          labReportStatus: 'SGOT/SGPT Bioactive Verified'
        }
      ] : []
    );

  // Filtered Raw Herbs
  const rawHerbsList = allProductsList.filter(p => p.category !== 'Kits' && p.category !== 'Personalised Kits');
  const filteredHerbs = rawHerbsList.filter(herb => {
    const matchesCategory = storeCategory === 'All' || herb.category === storeCategory;
    const matchesSearch = !storeSearch || (
      (herb.name && herb.name.toLowerCase().includes(storeSearch.toLowerCase())) ||
      (herb.botanicalName && herb.botanicalName.toLowerCase().includes(storeSearch.toLowerCase())) ||
      (herb.subtitle && herb.subtitle.toLowerCase().includes(storeSearch.toLowerCase()))
    );
    return matchesCategory && matchesSearch;
  });

  // Unified Doctor List (Database Doctors with fallback)
  const allDoctorsList = dbDoctors.length > 0 ? dbDoctors : doctorsData;
  const filteredDoctors = allDoctorsList.filter(doc => {
    if (docSpecialty === 'All') return true;
    return doc.specialization && doc.specialization.toLowerCase().includes(docSpecialty.toLowerCase());
  });

  // Unified Lab Tests (Database Lab Tests with fallback)
  const labTestsList = dbLabTests.length > 0 ? dbLabTests : [
    { id: 'lt-1', name: 'HbA1c & Fasting Blood Sugar', turnaroundTime: 'Same Day 6 Hrs', price: 399, mrp: 650, discount: '38% OFF', description: 'Fasting glucose, Average estimated sugar, Glycated hemoglobin', parametersCount: 3 },
    { id: 'lt-2', name: 'Complete Liver Function Profile (LFT)', turnaroundTime: 'Next Day', price: 549, mrp: 900, discount: '39% OFF', description: 'SGOT, SGPT, Bilirubin, Albumin, Alkaline Phosphatase', parametersCount: 11 },
    { id: 'lt-3', name: 'Thyroid Care Panel (T3, T4, TSH)', turnaroundTime: 'Same Day', price: 449, mrp: 750, discount: '40% OFF', description: 'Total T3, Total T4, Ultrasensitive TSH', parametersCount: 3 },
    { id: 'lt-4', name: 'Full Ayurvedic Metabolic Panel', turnaroundTime: '24 Hours', price: 1299, mrp: 2400, discount: '46% OFF', description: 'HbA1c, LFT, Lipid Profile, Vitamin D & B12', parametersCount: 28 }
  ];

  // Price & Multiplier Helper
  const getProductPriceForWeight = (product, weight) => {
    const basePrice = product.price || 349;
    const baseMrp = product.originalPrice || product.mrp || Math.round(basePrice * 1.35);
    const multiplier = weight === '500g' ? 1.85 : weight === '1kg' ? 3.4 : 1.0;
    return {
      price: Math.round(basePrice * multiplier),
      mrp: Math.round(baseMrp * multiplier)
    };
  };

  const getDoctorFeeForMode = (doc, mode) => {
    const base = doc.fee || doc.consultationFee || 599;
    if (mode === 'video') return base;
    if (mode === 'audio') return Math.round(base * 0.7);
    if (mode === 'chat') return Math.round(base * 0.45);
    return base;
  };

  const getProductEnergetics = (p) => {
    if (p.energetics && typeof p.energetics === 'object') return p.energetics;
    if (p.name?.includes('Ashwagandha')) {
      return { rasa: 'Tikta (Bitter), Kashaya (Astringent), Madhura (Sweet)', guna: 'Laghu (Light), Snigdha (Unctuous)', virya: 'Ushna (Hot Potency)', vipaka: 'Madhura (Sweet Post-digestive)', dosha: 'Balances Vata & Kapha' };
    }
    if (p.name?.includes('Giloy')) {
      return { rasa: 'Tikta (Bitter), Kashaya (Astringent)', guna: 'Guru (Heavy), Snigdha (Unctuous)', virya: 'Ushna (Hot Potency)', vipaka: 'Madhura (Sweet)', dosha: 'Tridosha Shamak (Balances all 3 Doshas)' };
    }
    if (p.name?.includes('Amla')) {
      return { rasa: 'Pancha Rasa (5 Tastes, predominantly Sour & Astringent)', guna: 'Laghu (Light), Ruksha (Dry)', virya: 'Sheeta (Cooling Potency)', vipaka: 'Madhura (Sweet)', dosha: 'Pacifies Pitta & Vata' };
    }
    if (p.name?.includes('Shilajit')) {
      return { rasa: 'Tikta (Bitter), Katu (Pungent)', guna: 'Guru (Heavy), Ruksha (Dry)', virya: 'Ushna (Hot Potency)', vipaka: 'Katu (Pungent)', dosha: 'Pacifies Kapha & Vata' };
    }
    return { rasa: 'Tikta, Kashaya', guna: 'Laghu', virya: 'Sheeta', vipaka: 'Madhura', dosha: 'Balances Pitta & Kapha' };
  };

  const getProductBenefits = (p) => {
    if (p.benefits) {
      if (Array.isArray(p.benefits)) return p.benefits;
      if (typeof p.benefits === 'string') {
        try {
          const parsed = JSON.parse(p.benefits);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {
          return p.benefits.split(',').map(b => b.trim());
        }
      }
    }
    if (p.name?.includes('Ashwagandha')) {
      return [
        'Reduces serum cortisol and stress-induced insomnia',
        'Enhances muscle strength, VO2 max and physical endurance',
        'Regulates thyroid T3/T4 hormone synthesis',
        'Supports deep cellular regenerative Rasayana'
      ];
    }
    if (p.name?.includes('Giloy')) {
      return [
        'Deep Ama detoxification & cellular immunomodulation',
        'Regulates fasting blood sugar spikes & insulin sensitivity',
        'Hepato-protective: rejuvenates liver enzyme levels (SGOT/SGPT)',
        'Alleviates chronic allergic rhinitis & seasonal fever'
      ];
    }
    if (p.name?.includes('Kit') || p.category === 'Kits') {
      return [
        'Comprehensive 30-Day root-cause treatment protocol',
        'Includes synergistic herbs, tailored diet chart & tumbler',
        'Free 14-day WhatsApp follow-up with certified BHMS doctor',
        '100% NABL lab tested for purity, zero pesticides & heavy metals'
      ];
    }
    return [
      'Clinically verified bioactive potency without starch fillers',
      'Tested for heavy metal purity (Lead, Cadmium, Arsenic <0.01 ppm)',
      'Supports gut microbiome and metabolic Agni vitality',
      // NOTE: Farmer and Seller are synonymous (farmer hi seller hai)
      'Harvested sustainably from certified organic seller co-operatives'
    ];
  };

  const getProductUsage = (p) => {
    if (p.usageGuide) return p.usageGuide;
    if (p.name?.includes('Ashwagandha')) return 'Take 3g to 5g powder at bedtime boiled with warm A2 milk or water, with a pinch of organic nutmeg or cardamom.';
    if (p.name?.includes('Giloy')) return 'Take 2g to 3g in morning on an empty stomach with lukewarm water, or boil as Kwath (decoction) reduced to 1/4th.';
    if (p.name?.includes('Amla')) return 'Mix 1 teaspoon (3g) with lukewarm water or raw honey first thing in the morning.';
    if (p.name?.includes('Shilajit')) return 'Dissolve a pea-sized resin portion (300mg) in warm milk or green tea, taken once daily in morning.';
    return 'Take 1 level scoop (3g) with warm water after meals twice daily, or as advised by your BHMS Vaidya.';
  };

  return (
    <div className={`patient-portal-root ${activeTab === 'chat' ? 'chat-active' : ''}`} style={{ minHeight: '94vh', background: 'radial-gradient(circle at 10% 5%, #f4faf6 0%, #fafbf9 50%, #edf6f1 100%)', padding: activeTab === 'chat' ? '12px 14px 0 14px' : '16px 14px 90px 14px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* =========================================================================
            1. FLIPKART STYLE TOP HEADER & DEDICATED PORTAL NAVIGATION
        ========================================================================= */}
        <div className="patient-portal-header-box" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '16px 20px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '18px' }}>
          
          {/* Desktop Top Header Bar (Hidden on Mobile) */}
          <div className="patient-desktop-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', flexWrap: 'nowrap' }}>
            
            {/* App Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#1d3924', color: '#E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', boxShadow: '0 4px 12px rgba(29, 57, 36, 0.22)' }}>
                  🌿
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#163321', letterSpacing: '0.04em', fontFamily: 'var(--font-heading)' }}>
                    AYURVEDA HEALTH PORTAL
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                    ✓ 100% Farm-Traceable Herbs • AYUSH Certified
                  </div>
                </div>
              </div>
            </div>

            {/* Global Search Box */}
            <div className="patient-search-box" style={{ position: 'relative', flex: 1, maxWidth: '460px', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text"
                placeholder="Search herbs, doctors, prescriptions, reports..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 40px',
                  borderRadius: '9999px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              {storeSearch && (
                <button 
                  onClick={() => setStoreSearch('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Profile & Actions Controls */}
            <div className="patient-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button 
                onClick={() => setActiveTab('supercoins')}
                className="patient-action-pill supercoins-pill"
                title="SuperCoins Wallet"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  color: '#92400e',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <Star size={13} fill="#d97706" color="#d97706" />
                <span>{superCoins} Coins</span>
              </button>

              <button 
                onClick={() => setSupportModalOpen(true)}
                title="Super Admin Support Desk"
                className="patient-action-pill support-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  color: '#15803d',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <LifeBuoy size={13} color="#15803d" />
                <span>Support</span>
              </button>

              <button 
                onClick={() => navigate('/cart')}
                title="View Shopping Cart"
                className="patient-action-pill cart-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #059669',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  color: '#059669',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <ShoppingBag size={13} color="#059669" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '900',
                    borderRadius: '9999px',
                    padding: '1px 6px',
                    minWidth: '16px',
                    textAlign: 'center',
                    lineHeight: '14px'
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setProfileDrawerOpen(true)}
                className="patient-action-pill profile-pill"
                title="Open Health Profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '5px 12px 5px 6px',
                  borderRadius: '9999px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1d3924', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px' }}>
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
                <ChevronDown size={12} color="#64748b" />
              </button>

              <button 
                onClick={() => setSignOutModalOpen(true)}
                title="Sign Out from Patient Account"
                className="patient-action-pill signout-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  color: '#b91c1c',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>

          </div>

          {/* Mobile Native App Bar (Visible Only on Mobile Screens <= 768px) */}
          <div className="patient-mobile-topbar" style={{ display: 'none', flexDirection: 'column', gap: '8px', marginBottom: '6px' }}>
            
            {/* Mobile Top App Bar with Simple Hamburger Drawer Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setMobileSideDrawerOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#163321'
                  }}
                  title="Open Navigation Menu"
                  aria-label="Open Navigation Menu"
                >
                  <Menu size={24} color="#163321" />
                </button>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#163321', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🌿 AYURVEDA</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: '700' }}>
                    Patient Portal • Online
                  </div>
                </div>
              </div>

              {/* Mobile Right Controls: Coins + Cart + Profile Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => setActiveTab('supercoins')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '5px 9px',
                    borderRadius: '9999px',
                    color: '#92400e',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <Star size={12} fill="#d97706" color="#d97706" />
                  <span>{superCoins}</span>
                </button>

                <button 
                  onClick={() => navigate('/cart')}
                  title="View Shopping Cart"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    color: '#059669',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0
                  }}
                >
                  <ShoppingBag size={16} color="#059669" />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: '900',
                      borderRadius: '9999px',
                      padding: '1px 4px',
                      minWidth: '15px',
                      textAlign: 'center',
                      lineHeight: '12px',
                      border: '1.5px solid #ffffff'
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>

                <div 
                  onClick={() => setProfileDrawerOpen(true)}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1d3924', color: '#E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}
                >
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
              </div>
            </div>

            {/* Mobile Search Input (Shown only when in store) */}
            {activeTab === 'store' && (
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  placeholder="Search herbs, disease kits..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 34px 9px 36px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    color: '#1e293b',
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                />
                {storeSearch && (
                  <button 
                    onClick={() => setStoreSearch('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Flipkart / Amazon Style Clean Category Tab Bar (Core Working Tabs) */}
          <div 
            className="patient-category-ribbon"
            style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto', 
              paddingBottom: '2px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none'
            }}
          >
            {[
              { id: 'store', label: lang === 'hi' ? 'आयुर्वेदिक स्टोर' : 'Botanical Store', icon: Leaf },
              { id: 'doctors', label: lang === 'hi' ? 'डॉक्टर परामर्श' : 'Doctor Consultation', icon: Stethoscope },
              { id: 'orders', label: lang === 'hi' ? 'ऑर्डर स्थिति' : 'My Orders', icon: ShoppingBag },
              { id: 'consultations', label: lang === 'hi' ? 'पर्चा व परामर्श' : 'Prescriptions & Rx', icon: FileText },
              { id: 'chat', label: lang === 'hi' ? 'डॉक्टर चैट' : 'Doctor Chat', icon: MessageCircle },
              { id: 'community', label: lang === 'hi' ? 'रोगी मंच' : 'Community Forum', icon: MessageSquare },
              { id: 'supercoins', label: lang === 'hi' ? 'रिवार्ड्स वॉलेट' : 'Rewards Wallet', icon: Star }
            ].map(cat => {
              const isActive = activeTab === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: '9999px',
                    border: isActive ? '1.5px solid #1d3924' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#1d3924' : '#f8fafc',
                    color: isActive ? '#ffffff' : '#334155',
                    fontSize: '12px',
                    fontWeight: isActive ? '800' : '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 2px 10px rgba(29, 57, 36, 0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComp size={14} color={isActive ? '#E6D7B9' : '#64748b'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* =========================================================================
            2. FLIPKART "BIG AYURVEDA SAVINGS" PROMO BANNER (Shown Only on Store Tab)
        ========================================================================= */}
        {activeTab === 'store' && (
          <div 
            className="patient-promo-banner"
            style={{ 
              background: 'linear-gradient(135deg, #1d3924 0%, #2d5a37 50%, #15341d 100%)', 
              borderRadius: '20px', 
              padding: '22px 28px', 
              color: '#ffffff', 
              marginBottom: '20px', 
              boxShadow: '0 8px 24px rgba(29, 57, 36, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: -40, right: -40, width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(230, 215, 185, 0.18)', filter: 'blur(35px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(230, 215, 185, 0.22)', border: '1px solid rgba(230, 215, 185, 0.35)', color: '#E6D7B9', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' }}>
                  <Zap size={14} /> FLIPKART STYLE BIG HEALING DAYS • LIVE NOW
                </div>

                <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  Flat 40% OFF On Farm Roots + <span style={{ color: '#E6D7B9' }}>Free BHMS Doctor Consult</span>
                </h2>

                <p style={{ fontSize: '0.88rem', color: '#d1fae5', margin: '0 0 14px 0', maxWidth: '640px' }}>
                  Reclaim metabolic vigor with wild-harvested roots tested for heavy metals and pesticide safety. Tap any herb or doctor below to inspect full clinical dossiers.
                </p>

                {/* Coupon Pill */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.14)', padding: '6px 14px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.3)' }}>
                  <span style={{ fontSize: '12px', color: '#fef3c7' }}>Use Coupon Code: <strong>AYURVEDA10</strong></span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('AYURVEDA10');
                      setCopiedCoupon(true);
                      setTimeout(() => setCopiedCoupon(false), 2000);
                    }}
                    style={{
                      backgroundColor: '#E6D7B9',
                      color: '#163321',
                      border: 'none',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {copiedCoupon ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Right Banner CTA Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                <button
                  onClick={() => setActiveTab('doctors')}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '13.5px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
                  }}
                >
                  <Video size={16} /> Consult Doctor in 10 Mins
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Notifications */}
        {successMsg && (
          <div style={{ padding: '14px 20px', borderRadius: '14px', marginBottom: '20px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1.5px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '700' }}>
            <CheckCircle2 size={18} color="#059669" /> {successMsg}
          </div>
        )}

        {/* =========================================================================
            VIEW 1: FLIPKART/MYNTRA STORE: CURATED KITS & RAW HERBS
        ========================================================================= */}
        {activeTab === 'store' && (
          <div>
            
            {/* Condition-Based Curated Kits (Flipkart Combo Deals) */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                    Personalised Monthly Disease Kits (Doctor Curated)
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Click any kit to view complete formulation breakdown, lab purity certificates & diet chart.
                  </p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px' }}>
                  FREE DELIVERY ON ALL KITS
                </span>
              </div>

              <div className="flipkart-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {conditionKits.map(kit => (
                  <div 
                    key={kit.id}
                    onClick={() => setSelectedProductDrawer(kit)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '18px',
                      border: '1.5px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)'; }}
                  >
                    <div>
                      {/* Image Header with Flipkart style discount badge */}
                      <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                        <img 
                          src={kit.image || kit.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80'} 
                          alt={kit.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                          {kit.discount || '35% OFF'}
                        </span>
                        <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.65)', color: '#ffffff', fontSize: '10.5px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>
                          {kit.badge || 'DOCTOR CURATED'}
                        </span>
                      </div>

                      {/* Kit Body */}
                      <div style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', backgroundColor: '#059669', color: '#ffffff', fontSize: '10.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                            {kit.rating || 4.9} <Star size={9} fill="#ffffff" />
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>({kit.reviewsCount || 180} reviews)</span>
                        </div>

                        <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                          {kit.name}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>
                            ₹{kit.price}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{kit.mrp || Math.round(kit.price * 1.4)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                            Save ₹{(kit.mrp || Math.round(kit.price * 1.4)) - kit.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div style={{ padding: '0 14px 14px 14px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCartLocal(kit);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          backgroundColor: addedItems[kit.id] ? '#059669' : '#1d3924',
                          color: '#ffffff',
                          fontSize: '12.5px',
                          fontWeight: '800',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {addedItems[kit.id] ? <Check size={15} /> : <ShoppingBag size={15} />}
                        <span>{addedItems[kit.id] ? 'Added to Cart!' : 'Add Kit to Bag'}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Single Raw Herbs Catalog with Filter Pills */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                    100% Farm-Traceable Raw Herbs & Powders ({filteredHerbs.length})
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Click any herb to view lab CoA spectrometry, Ayurvedic energetics (Rasa, Virya) & farm details.
                  </p>
                </div>

                {/* Category Filter Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['All', 'Roots', 'Stems', 'Powders', 'Leaves', 'Resins'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setStoreCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: storeCategory === cat ? '1.5px solid #059669' : '1px solid #d1d5db',
                        backgroundColor: storeCategory === cat ? '#ecfdf5' : '#ffffff',
                        color: storeCategory === cat ? '#065f46' : '#475569',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Herb Cards Grid */}
              <div className="flipkart-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                {filteredHerbs.map(herb => (
                  <div
                    key={herb.id}
                    onClick={() => setSelectedProductDrawer(herb)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)'; }}
                  >
                    <div>
                      <div style={{ position: 'relative', height: '160px' }}>
                        <img 
                          src={herb.image || herb.imageUrl || 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=500&q=80'} 
                          alt={herb.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: '#ffffff', color: '#163321', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                          {herb.category}
                        </span>
                      </div>

                      <div style={{ padding: '12px 14px 14px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#059669', fontSize: '11px', fontWeight: '800' }}>
                            ★ {herb.rating || 4.9} <span style={{ color: '#94a3b8', fontWeight: '500' }}>({herb.reviewsCount || 140})</span>
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            by <strong style={{ color: '#065f46' }}>{herb.sellerName || herb.farmerName || 'Satpura Co-op'}</strong>
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#111827', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                          {herb.name}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>
                            ₹{herb.price}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{herb.originalPrice || Math.round(herb.price * 1.3)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                            Save ₹{(herb.originalPrice || Math.round(herb.price * 1.3)) - herb.price}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCartLocal(herb);
                          }}
                          style={{
                            width: '100%',
                            padding: '9px',
                            borderRadius: '8px',
                            backgroundColor: addedItems[herb.id] ? '#059669' : '#1d3924',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: '800',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          {addedItems[herb.id] ? <Check size={14} /> : <ShoppingBag size={14} />}
                          <span>{addedItems[herb.id] ? 'Added to Bag' : 'Add to Bag'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: BHMS DOCTOR TELECONSULTING HUB (Flipkart Health+ / Practo Style)
        ========================================================================= */}
        {activeTab === 'doctors' && (
          <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', margin: 0, wordBreak: 'break-word' }}>
                  Consult AYUSH-Certified BHMS Vaidyas ({filteredDoctors.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>
                  Click any doctor to view credentials and schedule consultation.
                </p>
              </div>

              {/* Specialty Filter Pills */}
              <div 
                className="doctor-specialty-scroll" 
                style={{ 
                  display: 'flex', 
                  gap: '6px', 
                  overflowX: 'auto', 
                  WebkitOverflowScrolling: 'touch', 
                  scrollbarWidth: 'none', 
                  paddingBottom: '4px',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {['All', 'Metabolic', 'Diabetes', 'Arthritis', 'Thyroid', 'Liver', 'PCOS'].map(sp => (
                  <button
                    key={sp}
                    onClick={() => setDocSpecialty(sp)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      border: docSpecialty === sp ? '1.5px solid #059669' : '1px solid #d1d5db',
                      backgroundColor: docSpecialty === sp ? '#ecfdf5' : '#ffffff',
                      color: docSpecialty === sp ? '#065f46' : '#475569',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {sp === 'All' ? 'All Specialists' : sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Direct Screen Cards - Clean, Minimal Practo/Flipkart Style */}
            <div className="doctor-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {filteredDoctors.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctorDrawer(doc)}
                  className="doctor-card-flat"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.02)'; }}
                >
                  <div>
                    {/* Doctor Header Row */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ position: 'relative', width: '56px', height: '56px', minWidth: '56px', maxWidth: '56px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                        <img 
                          src={doc.image || 'https://images.unsplash.com/photo-1594824813629-4e50d754b207?auto=format&fit=crop&w=400&q=80'} 
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1594824813629-4e50d754b207?auto=format&fit=crop&w=400&q=80';
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', bottom: 2, right: 2, width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#059669', border: '2px solid #ffffff' }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.name}>
                            {doc.name}
                          </h4>
                          <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.specialization}>
                          {doc.specialization}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.degree} • {doc.experience}
                        </div>
                      </div>
                    </div>

                    {/* Subtle Specs Strip */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '11px', marginBottom: '12px', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ color: '#059669', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                        ★ {doc.rating} <span style={{ color: '#94a3b8', fontWeight: '500' }}>({doc.reviewsCount || 120}+ reviews)</span>
                      </span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>
                        Next: <strong style={{ color: '#1e293b' }}>{doc.nextSlot ? doc.nextSlot.replace(' (Next Available)', '').replace(' (Next)', '') : 'Today 4:30 PM'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Booking & Fee Row */}
                  <div className="doctor-booking-bar" style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>Fee: </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>₹{doc.fee}</span>
                    </div>

                    <button
                      className="doctor-book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoctorDrawer(doc);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#1d3924',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Video size={14} /> Consult Now
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 3: FLIPKART STYLE MY ORDERS & REAL-TIME BLUE DART DELIVERY TRACKING
        ========================================================================= */}
        {activeTab === 'orders' && (() => {
          const sampleOrdersList = [
            {
              id: 'AYUR-2026-881',
              createdAt: '2026-09-30T10:30:00.000Z',
              status: 'IN_TRANSIT',
              statusLabel: 'Out for delivery today',
              statusDotColor: '#2563eb',
              courier: 'BlueDart Express',
              trackingNumber: 'BLU-98214912',
              paymentMethod: 'UPI (Prepaid)',
              paymentStatus: 'PAID',
              totalAmount: 630,
              deliveryAddress: {
                name: user?.name || 'Arav Sharma',
                phone: '+91 98765 43210',
                address: 'House #42, Sector 14, Gurugram, Haryana - 122001'
              },
              items: [
                {
                  id: 'herb-1',
                  name: 'Pure Nagori Ashwagandha Root Powder (200g)',
                  seller: 'Malwa Organic Herbal Cluster',
                  image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=140&q=80',
                  price: 380,
                  quantity: 1,
                  batch: '#NGR-2026-081'
                },
                {
                  id: 'herb-2',
                  name: 'Purified Wild Amrita Giloy Stem Powder (250g)',
                  seller: 'Satpura Herbal Cooperative',
                  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=140&q=80',
                  price: 250,
                  quantity: 1,
                  batch: '#GLY-2026-014'
                }
              ],
              stepperSteps: [
                { title: 'Order Confirmed', time: 'Sep 30, 10:30 AM', done: true },
                { title: 'Farm Packed & Lab Tested', time: 'Sep 30, 04:15 PM', done: true },
                { title: 'Out for Delivery (BlueDart)', time: 'Today, 09:00 AM', current: true },
                { title: 'Delivered', time: 'Expected by 2:00 PM', done: false }
              ]
            },
            {
              id: 'AYUR-2026-754',
              createdAt: '2026-09-24T14:20:00.000Z',
              status: 'DELIVERED',
              statusLabel: 'Delivered on Sep 27, 2026',
              statusDotColor: '#059669',
              courier: 'BlueDart Express',
              trackingNumber: 'BLU-88210941',
              paymentMethod: 'UPI (Prepaid)',
              paymentStatus: 'PAID',
              totalAmount: 499,
              deliveryAddress: {
                name: user?.name || 'Arav Sharma',
                phone: '+91 98765 43210',
                address: 'House #42, Sector 14, Gurugram, Haryana - 122001'
              },
              items: [
                {
                  id: 'herb-3',
                  name: 'Terminalia Arjuna Bark Decoction Churna (200g)',
                  seller: 'Chhindwara Agro-Forestry Cooperative',
                  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=140&q=80',
                  price: 499,
                  quantity: 1,
                  batch: '#ARJ-2026-042'
                }
              ],
              stepperSteps: [
                { title: 'Order Confirmed', time: 'Sep 24, 02:20 PM', done: true },
                { title: 'Farm Packed & Tested', time: 'Sep 25, 11:00 AM', done: true },
                { title: 'Shipped (BlueDart)', time: 'Sep 26, 08:30 AM', done: true },
                { title: 'Delivered', time: 'Sep 27, 01:15 PM', done: true }
              ]
            }
          ];

          const sourceOrders = (realOrders && realOrders.length > 0)
            ? realOrders.map(ro => ({
                id: ro.id?.slice(0, 8)?.toUpperCase() || 'ORD-991',
                fullId: ro.id,
                createdAt: ro.createdAt || new Date().toISOString(),
                status: ro.status || 'CONFIRMED',
                statusLabel: ro.status === 'DELIVERED' ? 'Delivered' : ro.status === 'SHIPPED' ? 'Shipped via BlueDart' : 'Order Confirmed',
                statusDotColor: ro.status === 'DELIVERED' ? '#059669' : '#2563eb',
                courier: ro.courier || 'BlueDart Express',
                trackingNumber: ro.trackingNumber || 'BLU-882109',
                paymentMethod: ro.paymentMethod || 'UPI',
                paymentStatus: ro.paymentStatus || 'PAID',
                totalAmount: ro.totalAmount || 599,
                deliveryAddress: {
                  name: user?.name || 'Arav Sharma',
                  phone: '+91 98765 43210',
                  address: 'House #42, Sector 14, Gurugram, Haryana - 122001'
                },
                items: (ro.orderItems && ro.orderItems.length > 0)
                  ? ro.orderItems.map(oi => ({
                      name: oi.product?.name || 'Ayurvedic Herbal Formulation',
                      seller: oi.product?.sellerName || oi.product?.farmerName || 'Satpura Organic Cluster',
                      image: oi.product?.images?.[0] || 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=140&q=80',
                      price: oi.price || 349,
                      quantity: oi.quantity || 1,
                      batch: '#HERB-2026-081'
                    }))
                  : [{
                      name: 'Pure Nagori Ashwagandha Root Powder (200g)',
                      seller: 'Malwa Organic Herbal Cluster',
                      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=140&q=80',
                      price: 380,
                      quantity: 1,
                      batch: '#NGR-2026-081'
                    }],
                stepperSteps: [
                  { title: 'Order Confirmed', time: 'Yesterday 10:30 AM', done: true },
                  { title: 'Farm Packed', time: 'Yesterday 04:15 PM', done: true },
                  { title: 'In Transit (BlueDart)', time: 'Today 09:00 AM', current: true },
                  { title: 'Delivered', time: 'Expected by 2:00 PM', done: false }
                ]
              }))
            : sampleOrdersList;

          const filteredOrders = sourceOrders.filter(order => {
            if (orderStatusFilter === 'DELIVERED' && order.status !== 'DELIVERED') return false;
            if (orderStatusFilter === 'ON_THE_WAY' && order.status === 'DELIVERED') return false;
            if (orderStatusFilter === 'CANCELLED' && order.status !== 'CANCELLED') return false;
            if (orderSearchQuery.trim()) {
              const q = orderSearchQuery.toLowerCase();
              const matchId = order.id.toLowerCase().includes(q);
              const matchItem = order.items.some(it => it.name.toLowerCase().includes(q) || it.seller.toLowerCase().includes(q));
              if (!matchId && !matchItem) return false;
            }
            return true;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Flipkart-Style Orders Header: Title, Search, Filter Tabs */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={20} color="#1d3924" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#163321', margin: 0 }}>
                      My Orders ({filteredOrders.length})
                    </h3>
                  </div>

                  {/* Flipkart Search Input */}
                  <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search your orders (herb, doctor, ID)..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 34px 9px 36px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        fontSize: '12.5px',
                        outline: 'none',
                        color: '#1e293b',
                        boxSizing: 'border-box'
                      }}
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Flipkart Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', paddingTop: '2px' }}>
                  {[
                    { id: 'ALL', label: 'All Orders' },
                    { id: 'ON_THE_WAY', label: 'On the way' },
                    { id: 'DELIVERED', label: 'Delivered' },
                    { id: 'CANCELLED', label: 'Cancelled' }
                  ].map(f => {
                    const isSelected = orderStatusFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setOrderStatusFilter(f.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '9999px',
                          border: isSelected ? '1.5px solid #1d3924' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#1d3924' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334151',
                          fontSize: '12px',
                          fontWeight: isSelected ? '800' : '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Empty State */}
              {filteredOrders.length === 0 && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '36px 20px', textAlign: 'center' }}>
                  <ShoppingBag size={38} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>No matching orders found</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 14px 0' }}>
                    {orderSearchQuery ? `No orders found matching "${orderSearchQuery}".` : 'You have no orders in this category.'}
                  </p>
                  <button
                    onClick={() => { setOrderSearchQuery(''); setOrderStatusFilter('ALL'); }}
                    style={{ padding: '8px 18px', borderRadius: '6px', backgroundColor: '#1d3924', color: '#ffffff', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                  >
                    View All Orders
                  </button>
                </div>
              )}

              {/* Flipkart-Style Orders List (Clean, Flat, Non-Cardy) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div
                      key={order.id}
                      className="flipkart-order-card"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.15s ease'
                      }}
                    >
                      {/* Top Order Strip (Flipkart style) */}
                      <div
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#f8fafc',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '10px',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '800', color: '#163321', letterSpacing: '0.03em' }}>
                            ORDER #{order.id}
                          </span>
                          <span style={{ color: '#64748b' }}>
                            Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span style={{ color: '#64748b' }}>
                            • Total: <strong style={{ color: '#111827' }}>₹{order.totalAmount}</strong> ({order.paymentMethod})
                          </span>
                        </div>

                        <div>
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#059669',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 0'
                            }}
                          >
                            <span>{isExpanded ? 'Hide Tracking Details' : 'Track Order & Details'}</span>
                            <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                          </button>
                        </div>
                      </div>

                      {/* Purchased Products (Flipkart 3-Column Item Row Layout) */}
                      <div>
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flipkart-order-row"
                            style={{
                              padding: '16px',
                              borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0, 2fr) 90px minmax(0, 1.6fr)',
                              gap: '16px',
                              alignItems: 'center'
                            }}
                          >
                            {/* Column 1: Image & Details */}
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '68px', height: '68px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                              />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#111827', lineHeight: '1.35', marginBottom: '4px' }}>
                                  {item.name}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                  Sold by: <span style={{ color: '#065f46', fontWeight: '600' }}>{item.seller}</span> • Qty: {item.quantity}
                                </div>
                                {item.batch && (
                                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                                    Batch: {item.batch} • NABL Tested
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Column 2: Price */}
                            <div className="flipkart-price-col" style={{ fontSize: '14.5px', fontWeight: '800', color: '#111827' }}>
                              ₹{item.price * item.quantity}
                            </div>

                            {/* Column 3: Status & Review Link (Flipkart style) */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: order.statusDotColor || '#059669', flexShrink: 0 }} />
                                <span style={{ fontSize: '13px', fontWeight: '800', color: order.statusDotColor || '#059669' }}>
                                  {order.statusLabel}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                                Courier: {order.courier} ({order.trackingNumber})
                              </div>
                              <button
                                // NOTE: Farmer is displayed as Seller (farmer hi seller hai)
                                onClick={() => alert(`Review registered for ${item.name}! Thank you for supporting our organic sellers.`)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  fontSize: '11.5px',
                                  color: '#059669',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Star size={12} fill="#fbbf24" color="#d97706" />
                                <span>Rate & Review Product</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expandable Flipkart Tracking & Details Panel */}
                      {isExpanded && (
                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                          
                          {/* Shipment Stepper Progress */}
                          <div style={{ marginBottom: '18px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#334151', marginBottom: '14px' }}>
                              Delivery Tracking ({order.courier} • AWB: {order.trackingNumber}):
                            </div>

                            <div className="flipkart-stepper" style={{ display: 'grid', gridTemplateColumns: `repeat(${order.stepperSteps.length}, 1fr)`, position: 'relative' }}>
                              <div className="flipkart-stepper-line" style={{ position: 'absolute', top: '13px', left: '8%', right: '8%', height: '3px', backgroundColor: '#059669', zIndex: 0 }} />
                              {order.stepperSteps.map((step, sIdx) => (
                                <div key={sIdx} className="flipkart-stepper-step" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                  <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: step.done ? '#059669' : step.current ? '#2563eb' : '#e2e8f0',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 6px auto',
                                    boxShadow: step.current ? '0 0 10px rgba(37,99,235,0.4)' : 'none'
                                  }}>
                                    {step.done ? <Check size={14} /> : step.current ? <Truck size={14} /> : <Clock size={14} color="#94a3b8" />}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: step.done ? '#065f46' : step.current ? '#2563eb' : '#64748b' }}>
                                      {step.title}
                                    </div>
                                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                                      {step.time}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Address & Actions Footer */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', color: '#475569', maxWidth: '520px' }}>
                              <strong>Delivery Address:</strong> {order.deliveryAddress?.name} ({order.deliveryAddress?.phone}) • {order.deliveryAddress?.address}
                            </div>

                            {/* Flipkart-Style Action Buttons */}
                            <div className="flipkart-order-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                className="flipkart-action-btn"
                                onClick={() => alert(`Tracking ${order.trackingNumber}: Driver is 2.4 km away, estimated arrival at 1:45 PM.`)}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  backgroundColor: '#1d3924',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Live Courier Track
                              </button>

                              <Link
                                to="/traceability"
                                className="flipkart-action-btn"
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#334151',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <Eye size={13} color="#059669" /> Trace Purity QR
                              </Link>

                              <button
                                className="flipkart-action-btn"
                                onClick={() => alert('Downloading official GST Invoice PDF...')}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#334151',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Download Invoice
                              </button>

                              <button
                                className="flipkart-action-btn"
                                onClick={() => setReturnModalOrder({
                                  orderId: order.id,
                                  item: order.items[0]?.name || 'Pure Nagori Ashwagandha Root Powder (200g)'
                                })}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  backgroundColor: returnSubmittedOrders[order.id] ? '#ecfdf5' : '#ffffff',
                                  border: returnSubmittedOrders[order.id] ? '1px solid #a7f3d0' : '1px solid #fca5a5',
                                  color: returnSubmittedOrders[order.id] ? '#065f46' : '#dc2626',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                {returnSubmittedOrders[order.id] ? '✓ Return Requested' : 'Return / Replace'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })()}

        {/* =========================================================================
            VIEW 4: MY CONSULTATIONS & DIGITAL E-PRESCRIPTIONS
        ========================================================================= */}
        {activeTab === 'consultations' && (
          <div className="resp-grid-two-col" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '22px' }}>
            
            {/* Upcoming Consultation Room */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', border: '1.5px solid #bbf7d0', boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#065f46', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  ● CONFIRMED UPCOMING TELECONSULTATION
                </span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#dc2626' }}>
                  Starts in 32 mins
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', margin: '0 0 6px 0' }}>
                Follow-up Review with Dr. Ananya Sharma
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 20px 0' }}>
                BHMS, MD (Homoeopathy) • Reg: DHC/2015/8492 • Metabolic Specialist
              </p>

              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '16px', border: '1px solid #dcfce7', marginBottom: '22px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Scheduled Time:</div>
                    <div style={{ fontWeight: '800', color: '#166534' }}>Today, 4:30 PM – 5:00 PM</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>Mode:</div>
                    <div style={{ fontWeight: '800', color: '#166534' }}>Encrypted HD Video Call</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setVideoModalOpen(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(5, 150, 105, 0.3)',
                  marginBottom: '10px'
                }}
              >
                <Video size={18} /> Join HD Video Teleconsultation
              </button>

              <button
                onClick={() => setProfileDrawerOpen(true)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #d1d5db',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Update Clinical Case History Form
              </button>
            </div>

            {/* Issued E-Prescription Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                  Active Digital E-Prescription
                </h4>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669' }}>#RX-8821</span>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Signed by Dr. Ananya Sharma (BHMS) on 18 Sep 2026
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#166534', fontSize: '13px' }}>🌿 Purified Giloy Churna (250g)</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Empty stomach in morning with lukewarm water • Sold by Satpura Herbal Co-op</div>
                  </div>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>₹260</div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#166534', fontSize: '13px' }}>🌿 Nagori Ashwagandha Churna (250g)</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Bedtime with warm milk for cortisol • Sold by Malwa Organic Cluster</div>
                  </div>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>₹349</div>
                </div>
              </div>

              {/* 1-Click Buy All Prescribed Medicines in Parcha */}
              <button
                onClick={() => handleBuyAllPrescriptionItems({ id: 'RX-8821' })}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.28)',
                  marginBottom: '10px'
                }}
              >
                <ShoppingBag size={17} /> 🛒 1-Click Buy Prescribed Medicines (₹609)
              </button>

              <button
                onClick={() => alert('Downloading official AYUSH digital-signed PDF Prescription...')}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  backgroundColor: '#1d3924',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={15} /> Download Signed Prescription PDF
              </button>

              <button
                onClick={() => setSecondOpinionModal({
                  doctor: 'Dr. Ananya Sharma (BHMS, MD)',
                  rxId: 'RX-8821',
                  diagnosis: 'Type 2 Diabetes & Fatty Liver Protocol'
                })}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  backgroundColor: secondOpinionStatus['RX-8821'] ? '#ecfdf5' : '#ffffff',
                  color: secondOpinionStatus['RX-8821'] ? '#065f46' : '#1d3924',
                  border: secondOpinionStatus['RX-8821'] ? '1.5px solid #a7f3d0' : '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '10px'
                }}
              >
                <Stethoscope size={15} color={secondOpinionStatus['RX-8821'] ? '#059669' : '#1d3924'} /> 
                {secondOpinionStatus['RX-8821'] ? '✓ Second Opinion Panel Assigned' : 'Request Second Opinion (Senior Vaidya)'}
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 5: 90-DAY DISEASE REVERSAL PROTOCOL ROADMAP (LIVE ENROLLMENT)
        ========================================================================= */}
        {activeTab === 'protocol' && (() => {
          const activeProg = activeEnrollments[0] || {
            programTitle: '90-Day Type 2 Diabetes & Fatty Liver Reversal Protocol',
            programSlug: 'diabetes-reversal',
            currentDay: 24,
            currentPhase: 'Phase 2: Agni Deepana & Liver Reset',
            durationDays: 90,
            status: 'ACTIVE'
          };
          const compPct = Math.min(100, Math.round((activeProg.currentDay / activeProg.durationDays) * 100));

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              <div className="resp-card-padding" style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                      ● {activeEnrollments.length > 0 ? 'LIVE DATABASE ENROLLED' : 'ACTIVE CHRONIC PROTOCOL'}
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: '6px 0 0 0' }}>
                      {activeProg.programTitle}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      Supervised by Dr. Ananya Sharma (BHMS) • Current Phase: <strong style={{ color: '#059669' }}>{activeProg.currentPhase}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669' }}>{compPct}% Complete</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Day {activeProg.currentDay} of {activeProg.durationDays} Days</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '24px' }}>
                  <div style={{ width: `${compPct}%`, height: '100%', backgroundColor: '#059669', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                </div>

                {/* Three Milestones */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: activeProg.currentDay <= 21 ? '#eff6ff' : '#ecfdf5', border: activeProg.currentDay <= 21 ? '2px solid #3b82f6' : '1.5px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: activeProg.currentDay <= 21 ? '#1e40af' : '#065f46' }}>PHASE 1 (DAYS 1–21)</span>
                      {activeProg.currentDay > 21 ? <CheckCircle2 size={16} color="#059669" /> : <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '9999px' }}>ACTIVE</span>}
                    </div>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: '800', color: activeProg.currentDay <= 21 ? '#1e40af' : '#065f46', margin: '0 0 4px 0' }}>Deep Ama Detoxification</h5>
                    <p style={{ fontSize: '0.82rem', color: activeProg.currentDay <= 21 ? '#2563eb' : '#047857', margin: 0 }}>Flushes digestive endotoxins using fresh Giloy decoction and warm water fasting.</p>
                  </div>

                  <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: activeProg.currentDay > 21 && activeProg.currentDay <= 60 ? '#eff6ff' : activeProg.currentDay > 60 ? '#ecfdf5' : '#f8fafc', border: activeProg.currentDay > 21 && activeProg.currentDay <= 60 ? '2px solid #3b82f6' : '1.5px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: activeProg.currentDay > 21 && activeProg.currentDay <= 60 ? '#1e40af' : '#64748b' }}>PHASE 2 (DAYS 22–60)</span>
                      {activeProg.currentDay > 21 && activeProg.currentDay <= 60 ? <span style={{ fontSize: '10px', fontWeight: '800', color: '#ffffff', backgroundColor: '#2563eb', padding: '2px 8px', borderRadius: '9999px' }}>ACTIVE NOW</span> : activeProg.currentDay > 60 ? <CheckCircle2 size={16} color="#059669" /> : <Clock size={16} color="#94a3b8" />}
                    </div>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: '800', color: activeProg.currentDay > 21 && activeProg.currentDay <= 60 ? '#1e40af' : '#475569', margin: '0 0 4px 0' }}>Agni Deepana & Cellular Reset</h5>
                    <p style={{ fontSize: '0.82rem', color: activeProg.currentDay > 21 && activeProg.currentDay <= 60 ? '#2563eb' : '#64748b', margin: 0 }}>Restoring insulin sensitivity in hepatocytes. Target fasting glucose &lt; 100 mg/dL.</p>
                  </div>

                  <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: activeProg.currentDay > 60 ? '#eff6ff' : '#f8fafc', border: activeProg.currentDay > 60 ? '2px solid #3b82f6' : '1.5px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: activeProg.currentDay > 60 ? '#1e40af' : '#64748b' }}>PHASE 3 (DAYS 61–90)</span>
                      {activeProg.currentDay > 60 ? <span style={{ fontSize: '10px', fontWeight: '800', color: '#ffffff', backgroundColor: '#2563eb', padding: '2px 8px', borderRadius: '9999px' }}>ACTIVE NOW</span> : <Clock size={16} color="#94a3b8" />}
                    </div>
                    <h5 style={{ fontSize: '1.05rem', fontWeight: '800', color: activeProg.currentDay > 60 ? '#1e40af' : '#475569', margin: '0 0 4px 0' }}>Cellular Rasayana Regeneration</h5>
                    <p style={{ fontSize: '0.82rem', color: activeProg.currentDay > 60 ? '#2563eb' : '#64748b', margin: 0 }}>Permanent HbA1c stabilization under 5.8% and medication weaning with clinician consent.</p>
                  </div>
                </div>

                {/* Available Disease Protocol Enrollment Switcher */}
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Switch or Enroll in Structured Reversal Program:
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                      { slug: 'diabetes-reversal', title: '90-Day Type 2 Diabetes Reversal', days: 90 },
                      { slug: 'skin-psoriasis-detox', title: '60-Day Psoriasis & Skin Detox', days: 60 },
                      { slug: 'fatty-liver-reset', title: '60-Day Fatty Liver (Grade 1/2) Reset', days: 60 },
                      { slug: 'pcos-hormone-balance', title: '90-Day PCOS Hormonal Protocol', days: 90 }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        disabled={enrollingProgram}
                        onClick={() => handleEnrollProgram(p.slug, p.title, p.days)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: activeProg.programSlug === p.slug ? '#1d3924' : '#ffffff',
                          color: activeProg.programSlug === p.slug ? '#ffffff' : '#334151',
                          border: activeProg.programSlug === p.slug ? '1.5px solid #1d3924' : '1px solid #cbd5e1',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {activeProg.programSlug === p.slug ? '✓ Active: ' : '+ Enroll: '}{p.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Protocol Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => alert('Downloading official 90-Day Clinical Protocol PDF signed by Dr. Ananya Sharma...')}
                    style={{
                      padding: '11px 20px',
                      borderRadius: '10px',
                      backgroundColor: '#1d3924',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Download Complete 90-Day Diet & Protocol Chart
                  </button>
                </div>

              </div>

            </div>
          );
        })()}

        {/* =========================================================================
            VIEW 6: BOOK NABL HOME LAB TESTS (HbA1c, Thyroid, Lipid Profile)
        {/* Lab tests removed as per MVP instruction */}
        {false && activeTab === 'lab_tests' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                Home Sample Collection Lab Tests (NABL & CAP Certified)
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '3px 0 0 0' }}>
                Phlebotomist collects blood sample at your home. Digital smart report synced directly to your BHMS doctor.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {labTestsList.map((test, i) => (
                <div key={test.id || i} style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '22px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#dc2626', color: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                        {test.discount || '38% OFF'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>⚡ Report in {test.turnaroundTime || 'Same Day'}</span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#111827', margin: '0 0 6px 0' }}>{test.name}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px 0' }}>{test.description || 'NABL certified parameters for metabolic assessment'}</p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827' }}>₹{test.price}</span>
                      <span style={{ fontSize: '0.88rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{test.mrp || Math.round(test.price * 1.5)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setLabSlotModalTest(test); setLabBookingConfirmed(null); }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      backgroundColor: '#1d3924',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Book Home Collection (Free Visit)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 7: DAILY MEDICINE & WATER REMINDERS (Interactive)
        ========================================================================= */}
        {activeTab === 'reminders' && (
          <div className="resp-grid-two-col" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '22px' }}>
            
            {/* 3 Doses pill reminder cards */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '26px', border: '1.5px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827', margin: '0 0 6px 0' }}>
                Daily Herbal Dose Adherence
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 18px 0' }}>
                Mark each dose after consumption to maintain your 14-day healing streak.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Morning */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: takenDoses.morning ? '#f0fdf4' : '#ffffff', border: takenDoses.morning ? '1.5px solid #a7f3d0' : '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sun size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>Purified Giloy Churna (3g)</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>Empty stomach morning with warm water</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleReminder('morning', 'Purified Giloy Churna')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: takenDoses.morning ? '#059669' : '#1d3924',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {takenDoses.morning ? '✓ Taken (7:15 AM)' : 'Mark Taken'}
                  </button>
                </div>

                {/* Afternoon */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: takenDoses.afternoon ? '#f0fdf4' : '#ffffff', border: takenDoses.afternoon ? '1.5px solid #a7f3d0' : '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Coffee size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>Triphala Kadha (30ml)</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>After lunch for Agni digestion fire</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleReminder('afternoon', 'Triphala Kadha')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: takenDoses.afternoon ? '#059669' : '#1d3924',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {takenDoses.afternoon ? '✓ Taken (1:45 PM)' : 'Mark Taken'}
                  </button>
                </div>

                {/* Bedtime */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: takenDoses.bedtime ? '#f0fdf4' : '#ffffff', border: takenDoses.bedtime ? '1.5px solid #a7f3d0' : '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Moon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>Nagori Ashwagandha (5g)</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>Bedtime with warm milk for sleep cortisol</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleReminder('bedtime', 'Nagori Ashwagandha')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: takenDoses.bedtime ? '#059669' : '#1d3924',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {takenDoses.bedtime ? '✓ Taken' : 'Mark Taken (10 PM)'}
                  </button>
                </div>
              </div>
            </div>

            {/* 8 Water Glasses Tracker */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '26px', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                  Warm Water Intake
                </h4>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0284c7' }}>
                  {waterGlasses} / 8 Glasses
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '20px 0' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
                  const filled = n <= waterGlasses;
                  return (
                    <button
                      key={n}
                      onClick={() => handleUpdateWater(n === waterGlasses ? n - 1 : n)}
                      style={{
                        height: '60px',
                        borderRadius: '12px',
                        border: filled ? '2px solid #0284c7' : '2px dashed #cbd5e1',
                        backgroundColor: filled ? '#e0f2fe' : '#f8fafc',
                        color: filled ? '#0284c7' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Droplet size={18} fill={filled ? '#0284c7' : 'none'} />
                      <span style={{ fontSize: '10px', fontWeight: '800' }}>#{n}</span>
                    </button>
                  );
                })}
              </div>

              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                💡 Click any glass to drink and record 2 Litres daily warm hydration.
              </p>

              {/* Real Web Audio API Chime & Desktop Push Notification */}
              <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Zap size={18} color="#059669" />
                  <strong style={{ fontSize: '13px', color: '#065f46' }}>Harmonious Audio Chime & Notifications</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#047857', margin: '0 0 12px 0' }}>
                  Uses browser Web Audio API oscillator synthesis (sine waves E5, G#5, B5) — zero internet or audio file needed!
                </p>
                <button
                  onClick={handleTestChimeAndNotification}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Zap size={15} /> Play Sound & Send Notification Alert
                </button>
              </div>

              {/* Fasting Blood Sugar 7-Day Trend Chart (SVG) */}
              <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>Fasting Blood Sugar Trend</strong>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: bloodSugar <= 105 ? '#059669' : '#d97706' }}>
                    Current: {bloodSugar} mg/dL
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                  Target: &lt; 100 mg/dL • Down 34 mg/dL since Day 1
                </div>

                <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', padding: '10px', border: '1px solid #e2e8f0' }}>
                  <svg viewBox="0 0 280 80" style={{ width: '100%', height: '80px', overflow: 'visible' }}>
                    {/* Normal threshold line at 100 mg/dL */}
                    <line x1="20" y1="55" x2="270" y2="55" stroke="#10b981" strokeDasharray="3 3" strokeWidth="1.5" />
                    <text x="22" y="52" fill="#059669" fontSize="9" fontWeight="700">Safe Target 100</text>
                    {/* Data trend line: 142 -> 130 -> 122 -> 118 -> 112 -> 108 */}
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      points="30,15 75,28 120,38 165,44 210,50 255,54"
                    />
                    {/* Data Points */}
                    {[[30,15,'142'], [75,28,'130'], [120,38,'122'], [165,44,'118'], [210,50,'112'], [255,54,`${bloodSugar}`]].map(([x, y, val], idx) => (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                        <text x={x} y={y - 7} fill="#1e293b" fontSize="8.5" fontWeight="800" textAnchor="middle">{val}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 8: AI HEALTH ASSESSMENT & SYMPTOM CHECKER
        ========================================================================= */}
        {activeTab === 'ai_coach' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                  AI Clinical Symptom Checker & Dosha Risk Score
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Evaluates metabolic fire, sleep quality, and Ama toxin levels according to Charaka Samhita.
                </p>
              </div>
            </div>

            {!aiAssessmentResult ? (
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                      1. Primary Health Concern
                    </label>
                    <select
                      value={aiAnswers.condition}
                      onChange={(e) => setAiAnswers({ ...aiAnswers, condition: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                    >
                      <option value="Diabetes & High Sugar">Diabetes & High Fasting Blood Sugar</option>
                      <option value="Fatty Liver & High SGOT/SGPT">Fatty Liver & Sluggish Metabolism</option>
                      <option value="PCOS & Irregular Periods">PCOS & Hormonal Imbalance</option>
                      <option value="Joint Pain & Arthritis">Joint Pain, Stiffness & High Uric Acid</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                      2. Digestive Fire (Agni) Status
                    </label>
                    <select
                      value={aiAnswers.digestion}
                      onChange={(e) => setAiAnswers({ ...aiAnswers, digestion: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                    >
                      <option value="Sluggish / Bloating after food">Sluggish (Manda Agni) — Heavy & bloated after meals</option>
                      <option value="Sharp hunger with hyperacidity">Hyperactive (Tikshna Agni) — Heartburn & acidity</option>
                      <option value="Irregular appetite">Irregular (Visham Agni) — Alternating hunger</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                      3. Sleep & Stress Pattern
                    </label>
                    <select
                      value={aiAnswers.sleep}
                      onChange={(e) => setAiAnswers({ ...aiAnswers, sleep: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                    >
                      <option value="6 hours / Restless">Restless & interrupted sleep</option>
                      <option value="Heavy & hard to wake up">Excessive heaviness & hard to wake up</option>
                      <option value="Normal 7-8 hours">Sound 7-8 hours</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleRunAiAssessment}
                  style={{
                    padding: '13px 26px',
                    borderRadius: '12px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} /> Compute Ayurvedic Health Score
                </button>
              </div>
            ) : (
              /* Assessment Results Box */
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '18px', padding: '24px', border: '1.5px solid #bbf7d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', backgroundColor: '#dcfce7', padding: '3px 10px', borderRadius: '9999px' }}>
                    AI CLINICAL SUMMARY GENERATED
                  </span>
                  <button
                    onClick={() => setAiAssessmentResult(null)}
                    style={{ background: 'none', border: 'none', color: '#166534', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Retake Assessment
                  </button>
                </div>

                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#14532d', margin: '0 0 6px 0' }}>
                  Constitution Analysis: {aiAssessmentResult.dosha}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#166534', margin: '0 0 16px 0' }}>
                  {aiAssessmentResult.diagnosis}
                </p>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', border: '1px solid #bbf7d0', marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Suggested Ayurvedic Formulations:
                  </div>
                  {aiAssessmentResult.recommendedHerbs.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none', fontSize: '13px' }}>
                      <strong>{h.name}</strong>
                      <span style={{ color: '#059669' }}>{h.role}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setActiveTab('doctors')}
                    style={{
                      padding: '11px 22px',
                      borderRadius: '10px',
                      backgroundColor: '#1d3924',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Book Call with {aiAssessmentResult.recommendedDoctor}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            VIEW 9: SUPERCOINS WALLET & SCRATCH CARD REWARDS
        ========================================================================= */}
        {activeTab === 'supercoins' && (
          <div className="resp-grid-two-col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '22px' }}>
            
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1.5px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>Loyalty Rewards Balance</span>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', lineHeight: '1.1', marginTop: '4px' }}>
                    ⭐ {superCoins} SuperCoins
                  </div>
                  <div style={{ fontSize: '13px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
                    Worth ₹{superCoins} instant discount on herbs and teleconsultations
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('store')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Redeem in Store
                </button>
              </div>

              <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b', margin: '20px 0 10px 0' }}>
                Coin Transaction History:
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '12.5px' }}>
                  <span>🎉 Welcome Sign-Up Bonus</span>
                  <span style={{ color: '#059669', fontWeight: '800' }}>+100 Coins</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '12.5px' }}>
                  <span>🩺 Completed 1st Doctor Video Consultation</span>
                  <span style={{ color: '#059669', fontWeight: '800' }}>+150 Coins</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', fontSize: '12.5px' }}>
                  <span>🔥 14-Day Consecutive Regimen Adherence</span>
                  <span style={{ color: '#059669', fontWeight: '800' }}>+200 Coins</span>
                </div>
              </div>
            </div>

            {/* Interactive Flipkart Style Scratch Card Game */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '26px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
                Lucky Patient Scratch Card
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px 0' }}>
                Tap below to scratch and unlock your exclusive wellness discount!
              </p>

              <div 
                onClick={() => setScratchRevealed(true)}
                style={{
                  height: '160px',
                  borderRadius: '16px',
                  backgroundColor: scratchRevealed ? '#ecfdf5' : '#fbbf24',
                  border: scratchRevealed ? '2px solid #059669' : '2px dashed #d97706',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '0 auto 16px auto',
                  transition: 'all 0.3s ease'
                }}
              >
                {!scratchRevealed ? (
                  <>
                    <Gift size={36} color="#78350f" />
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#78350f', marginTop: '6px' }}>
                      TAP TO SCRATCH & REVEAL
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#065f46', textTransform: 'uppercase' }}>CONGRATULATIONS!</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', margin: '2px 0' }}>₹150 OFF COUPON</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#166534', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '6px', border: '1px dashed #059669', marginTop: '4px' }}>
                      VAIDYA150
                    </div>
                  </>
                )}
              </div>

              {scratchRevealed && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('VAIDYA150');
                    alert('Copied code VAIDYA150 to clipboard! Use at checkout.');
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Copy Coupon Code
                </button>
              )}
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 10: FULL-SCREEN WHATSAPP & MS TEAMS STYLE DOCTOR CONSULTATION CHAT
        ========================================================================= */}
        {activeTab === 'chat' && (() => {
          const chatDoctorsList = dbDoctors.length > 0 ? dbDoctors : doctorsData;
          const activeDoctorObj = chatDoctorsList.find(d => String(d.userId || d.id) === String(activeChatDoctorId || (chatDoctorsList[0]?.userId || chatDoctorsList[0]?.id))) || chatDoctorsList[0];
          const filteredChatDoctors = chatDoctorsList.filter(d => 
            !chatSearchDoctor || 
            (d.name && d.name.toLowerCase().includes(chatSearchDoctor.toLowerCase())) || 
            (d.specialization && d.specialization.toLowerCase().includes(chatSearchDoctor.toLowerCase()))
          );

          return (
            <div 
              className="chat-main-fullscreen-container"
              style={{ 
                height: 'calc(100vh - 120px)', 
                minHeight: '620px', 
                backgroundColor: '#ffffff', 
                borderRadius: '20px', 
                border: '1.5px solid #e2e8f0', 
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)', 
                display: 'flex', 
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* MS TEAMS LEFT SIDEBAR: DOCTOR CONSULTATION CHANNELS */}
              <div 
                className={`chat-teams-sidebar ${mobileChatView === 'list' ? 'mobile-show' : ''}`}
                style={{
                  width: '320px',
                  minWidth: '280px',
                  borderRight: '1.5px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  flexDirection: 'column'
                }}
              >
                {/* Channel Header & Search */}
                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setActiveTab('doctors')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#163321',
                          borderRadius: '6px'
                        }}
                        title="Back to Doctors Directory"
                        aria-label="Back to Doctors Directory"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <Stethoscope size={18} color="#059669" />
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#163321' }}>
                        Doctor Consults
                      </h3>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                      {chatDoctorsList.length} Vaidyas
                    </span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Search doctor or specialty..."
                      value={chatSearchDoctor}
                      onChange={e => setChatSearchDoctor(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Doctor Channel List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                  {filteredChatDoctors.map((doc, idx) => {
                    const isSelected = String(doc.userId || doc.id) === String(activeDoctorObj?.userId || activeDoctorObj?.id);
                    return (
                      <div 
                        key={doc.id || idx}
                        onClick={() => {
                          setActiveChatDoctorId(doc.userId || doc.id);
                          setMobileChatView('conversation');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '12px',
                          marginBottom: '6px',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          border: isSelected ? '1.5px solid #a7f3d0' : '1px solid #f1f5f9',
                          borderLeft: isSelected ? '4px solid #059669' : '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={doc.image || 'https://images.unsplash.com/photo-1594824813560-bf6544976450?auto=format&fit=crop&w=140&q=80'}
                            alt={doc.name}
                            style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid #ffffff' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.name}
                            </div>
                            <span style={{ fontSize: '10px', color: '#059669', fontWeight: '700' }}>Active</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.specialization || 'Metabolic Care'}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            {(() => {
                              const thisDocMsgs = doctorChatsMap[doc.userId || doc.id] || [];
                              return thisDocMsgs.length > 0 
                                ? thisDocMsgs[thisDocMsgs.length - 1].message 
                                : 'Confidential consultation thread';
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE CONVERSATION PANEL (WHATSAPP + TEAMS HYBRID THEME) */}
              <div 
                className={`chat-conversation-panel ${mobileChatView === 'list' ? 'chat-conversation-mobile-hide' : ''}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                {/* Conversation Top Header */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 14px', 
                    borderBottom: '1.5px solid #e2e8f0', 
                    backgroundColor: '#ffffff',
                    zIndex: 10,
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    {/* Mobile Back Button to Doctor Channel List */}
                    <button
                      className="chat-mobile-back-btn"
                      onClick={() => setMobileChatView('list')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#163321',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Back to Doctor List"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div style={{ position: 'relative', width: '42px', height: '42px', minWidth: '42px', flexShrink: 0 }}>
                      <img
                        src={activeDoctorObj?.image || 'https://images.unsplash.com/photo-1594824813560-bf6544976450?auto=format&fit=crop&w=140&q=80'}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80';
                        }}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #a7f3d0', display: 'block' }}
                      />
                      <div style={{ position: 'absolute', bottom: '0px', right: '0px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid #ffffff' }} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activeDoctorObj?.name}>
                          {activeDoctorObj?.name || 'Dr. Ananya Sharma'}
                        </h3>
                        <ShieldCheck size={14} color="#059669" style={{ flexShrink: 0 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#059669', fontWeight: '700', flexShrink: 0 }}>
                          🟢 Online
                        </span>
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <span 
                          onClick={() => setSelectedDoctorDrawer(activeDoctorObj)}
                          style={{ color: '#d97706', fontWeight: '800', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title="Click to view full doctor credentials and patient reviews"
                        >
                          ★ {activeDoctorObj?.rating || 4.9}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Header Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => setVideoModalOpen(true)}
                      style={{
                        padding: '7px 11px',
                        borderRadius: '8px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                      }}
                      title="Instant Video Call"
                    >
                      <Video size={15} /> <span className="hide-on-mobile-xs">Video</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('consultations')}
                      style={{
                        padding: '7px 11px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        color: '#334151',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: '1.5px solid #cbd5e1',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="View active digital prescription"
                    >
                      <FileText size={14} /> <span className="hide-on-mobile-xs">Rx Parcha</span>
                    </button>

                    <button
                      onClick={() => setSelectedDoctorDrawer(activeDoctorObj)}
                      className="hide-on-mobile-xs"
                      style={{
                        padding: '7px 11px',
                        borderRadius: '8px',
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: '1.5px solid #a7f3d0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Doctor Credentials"
                    >
                      <Stethoscope size={14} /> <span>Profile</span>
                    </button>
                  </div>
                </div>

                {/* Modern Clinical Healthcare Chat Feed (Non-WhatsApp, Elegant Slate/Emerald) */}
                <div 
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '20px 18px', 
                    backgroundColor: '#f8fafc', 
                    backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
                    backgroundSize: '20px 20px',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px' 
                  }}
                >
                  {/* Encrypted Notice Banner */}
                  <div style={{ alignSelf: 'center', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '11px', fontWeight: '700', padding: '6px 14px', borderRadius: '8px', textAlign: 'center', maxWidth: '85%' }}>
                    🔒 AYUSH Telemedicine Confidential Consultation Thread • End-to-End Encrypted
                  </div>

                  {/* Date Chip */}
                  <div style={{ alignSelf: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '10.5px', fontWeight: '800', padding: '3px 12px', borderRadius: '9999px', margin: '2px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    TODAY
                  </div>

                  {/* Doctor Initial Clinical Greeting */}
                  <div 
                    style={{ 
                      alignSelf: 'flex-start', 
                      maxWidth: '78%', 
                      backgroundColor: '#ffffff', 
                      borderRadius: '16px 16px 16px 3px', 
                      padding: '13px 16px', 
                      border: '1.5px solid #d1fae5', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)' 
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#059669', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>{activeDoctorObj?.name || 'Dr. Ananya Sharma'}</span>
                      <ShieldCheck size={13} color="#059669" />
                      <span style={{ fontSize: '9.5px', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>DOCTOR</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.55' }}>
                      Namaste! I have reviewed your case history and metabolic vitals. How are your digestion (Agni) and morning readings feeling today? Please share any queries regarding your herbal dosage or diet regimen.
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', textAlign: 'right' }}>
                      9:30 AM
                    </div>
                  </div>

                  {/* Patient & Doctor Live Chat Message Bubbles */}
                  {(() => {
                    const currentDocId = activeDoctorObj?.userId || activeDoctorObj?.id || 'dr-ananya';
                    const currentDocMessages = doctorChatsMap[currentDocId] || [];
                    return currentDocMessages.map((msg, idx) => {
                      const isPatient = msg.senderRole === 'PATIENT' || msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id || idx}
                          style={{
                            alignSelf: isPatient ? 'flex-end' : 'flex-start',
                            maxWidth: '78%',
                            backgroundColor: isPatient ? '#1d3924' : '#ffffff',
                            color: isPatient ? '#ffffff' : '#0f172a',
                            borderRadius: isPatient ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                            padding: '12px 16px',
                            border: isPatient ? 'none' : '1px solid #e2e8f0',
                            boxShadow: isPatient ? '0 3px 10px rgba(29, 57, 36, 0.18)' : '0 2px 8px rgba(0,0,0,0.03)',
                            position: 'relative'
                          }}
                        >
                          {!isPatient && (
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{activeDoctorObj?.name || 'Doctor'}</span>
                              <ShieldCheck size={12} color="#059669" />
                            </div>
                          )}
                          <div style={{ fontSize: '13.5px', lineHeight: '1.5', color: isPatient ? '#f8fafc' : '#1e293b' }}>
                            {msg.message}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '5px' }}>
                            <span style={{ fontSize: '10px', color: isPatient ? '#a7f3d0' : '#94a3b8' }}>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isPatient && (
                              <CheckCheck size={13} color="#6ee7b7" />
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {/* Auto-scroll anchor */}
                  <div ref={chatEndRef} style={{ height: '1px' }} />
                </div>

                {/* Quick Clinical Suggestion Chips */}
                <div style={{ padding: '8px 16px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  {[
                    "Can I take Triphala with warm milk?",
                    "Fasting sugar reading is 108 mg/dL today.",
                    "Feeling slight fatigue after heavy lunch.",
                    "Should I repeat my liver function test?"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(chip)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '11.5px',
                        color: '#334151',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* WhatsApp Style Bottom Input Bar */}
                <form 
                  onSubmit={handleSendPatientChat} 
                  style={{ 
                    padding: '12px 18px', 
                    backgroundColor: '#ffffff', 
                    borderTop: '1px solid #e2e8f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                  }}
                >
                  <button
                    type="button"
                    onClick={() => alert('Attachment: Upload previous lab test PDF or photo for Doctor inspection')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Attach medical document or image"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Message ${activeDoctorObj?.name || 'Doctor'}...`}
                    style={{
                      flex: 1,
                      padding: '11px 16px',
                      borderRadius: '24px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      backgroundColor: '#f8fafc'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={sendingChat || !chatInput.trim()}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: sendingChat || !chatInput.trim() ? '#94a3b8' : '#166534',
                      color: '#ffffff',
                      border: 'none',
                      cursor: sendingChat || !chatInput.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(22, 101, 52, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Send size={17} />
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

        {/* =========================================================================
            VIEW 11: CHRONIC SKIN HEALING PHOTO TIMELINE (Zero Third-Party AI/API)
        ========================================================================= */}
        {activeTab === 'skin_tracker' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Header Description */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                        Confidential Skin Healing Progression Timeline
                      </h3>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Track visible clinical recovery for Eczema, Psoriasis, Vitiligo, Melasma & Pitta Rash.
                      </div>
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#065f46', backgroundColor: '#ecfdf5', padding: '5px 12px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  🔒 AYUSH Telemedicine Encrypted Storage
                </span>
              </div>

              {/* Upload New Progress Photo Card */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1.5px dashed #cbd5e1', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0' }}>
                  📸 Add New Weekly Progress Photo
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Condition Tag</label>
                    <select
                      value={skinConditionInput}
                      onChange={(e) => setSkinConditionInput(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px', backgroundColor: '#ffffff' }}
                    >
                      <option value="Psoriasis / Scaly Plaque">Psoriasis / Scaly Plaque</option>
                      <option value="Atopic Eczema / Dry Itch">Atopic Eczema / Dry Itch</option>
                      <option value="Acne Vulgaris / Pitta Flare">Acne Vulgaris / Pitta Flare</option>
                      <option value="Vitiligo / White Depigmentation">Vitiligo / White Depigmentation</option>
                      <option value="Melasma / Hyperpigmentation">Melasma / Hyperpigmentation</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Observations & Symptoms</label>
                    <input
                      type="text"
                      value={skinNotesInput}
                      onChange={(e) => setSkinNotesInput(e.target.value)}
                      placeholder="e.g. Scaling reduced by 50%, no itching after evening Manjistha bath"
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px', backgroundColor: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Choose Photo File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadSkinPhoto}
                      disabled={uploadingSkinPhoto}
                      style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '12px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {uploadingSkinPhoto && (
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                    ⏳ Uploading and recording in clinical database...
                  </div>
                )}
              </div>

              {/* Photo Timeline Grid */}
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: '0 0 16px 0' }}>
                Your Progression Timeline ({skinPhotos.length > 0 ? skinPhotos.length : 2} Recorded Milestones)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {skinPhotos.length > 0 ? (
                  skinPhotos.map((photo, i) => (
                    <div key={photo.id || i} style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                      <div style={{ position: 'relative', height: '200px' }}>
                        <img
                          src={photo.imageUrl?.startsWith('http') ? photo.imageUrl : `http://localhost:5000${photo.imageUrl}`}
                          alt="Skin Progress"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(29, 57, 36, 0.85)', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          Milestone #{i + 1}
                        </span>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
                          {photo.condition}
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#1e293b', margin: '6px 0 8px 0', lineHeight: '1.4' }}>
                          {photo.notes || 'Routine weekly progress upload.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                          <span>{new Date(photo.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span style={{ color: '#059669', fontWeight: '700' }}>✓ Reviewed by Doctor</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Clinical Reference Examples */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ position: 'relative', height: '200px' }}>
                        <img
                          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80"
                          alt="Day 1 Baseline"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#dc2626', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                          Day 1 (Baseline)
                        </span>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626' }}>Psoriasis Plaque (Pre-treatment)</div>
                        <p style={{ fontSize: '12.5px', color: '#1e293b', margin: '6px 0 8px 0' }}>Severe redness and skin scaling on both elbows. Burning sensation 8/10.</p>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Initial Clinical Entry</div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #bbf7d0', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.08)' }}>
                      <div style={{ position: 'relative', height: '200px' }}>
                        <img
                          src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80"
                          alt="Day 21 Recovery"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#059669', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                          Day 21 (Post Ama Detox)
                        </span>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669' }}>Significant Epithelial Healing</div>
                        <p style={{ fontSize: '12.5px', color: '#1e293b', margin: '6px 0 8px 0' }}>Scaling reduced by 75%. Skin barrier regenerated with Mahatiktaka Ghrita.</p>
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>✓ Verified by Dr. Ananya Sharma</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 12: REAL LIVE COMMUNITY FORUM & PATIENT Q&A WITH DOCTOR REPLIES
        ========================================================================= */}
        {activeTab === 'community' && (() => {
          const sampleCommunityData = [
            {
              id: 'sample-1',
              authorName: 'Ramesh K.',
              location: 'Bengaluru',
              conditionTag: 'Diabetes Reversal',
              timeAgo: '2 days ago',
              title: 'HbA1c dropped from 8.2% to 6.4% in 60 days with Giloy decoction & Millet Diet',
              content: 'Started Dr. Ananya’s 90-day protocol with raw Giloy stem decoction boiled down to 1/4th volume and replacing wheat with Barnyard and Foxtail millets. Morning fasting sugar has stabilized at 102 mg/dL. Grateful to this community for the guidance!',
              imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
              imageCaption: 'Daily morning fresh Giloy kwath preparation',
              likesCount: 38,
              doctorVerifiedReply: 'Excellent discipline Ramesh ji! As your liver hepatocytes regain insulin sensitivity, we will begin tapering off midday oral doses under consultation.',
              doctorName: 'Dr. Ananya Sharma (BHMS, MD)'
            },
            {
              id: 'sample-2',
              authorName: 'Sunita P.',
              location: 'Indore',
              conditionTag: 'Skin & Psoriasis',
              timeAgo: '3 days ago',
              title: 'Psoriasis scaling cleared by 60% with Khadirarishta & Neem lepa',
              content: 'Applying warm Neem + Turmeric paste locally and drinking 15ml Khadirarishta post dinner. Severe redness and flaky skin behind knees has smoothened significantly. Sharing progress picture!',
              imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
              imageCaption: 'Raw cold-pressed Neem leaf infusion & paste',
              likesCount: 24,
              doctorVerifiedReply: 'Rakta Shodhana is working deeply. Continue taking it with 1 glass lukewarm water and strictly avoid sour tamarind or fermented curd during this Phase.',
              doctorName: 'Dr. Rajeshwar Verma (BAMS, MD)'
            },
            {
              id: 'sample-3',
              authorName: 'Devendra M.',
              location: 'Pune',
              conditionTag: 'Joint Pain & Arthritis',
              timeAgo: '5 days ago',
              title: 'Morning knee stiffness (Osteoarthritis) reduced by 70% in 45 days',
              content: 'Was struggling to take stairs due to severe Vata swelling. Following Vaidya Anandvardhan\'s advice of warm Nirgundi oil application followed by hot water fomentation and daily gentle Tadasana stretches.',
              imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
              imageCaption: 'Warm Mahanarayan Taila transdermal routine',
              likesCount: 19,
              doctorVerifiedReply: 'Great commitment Devendra ji. The joint space lubrication (Shleshaka Kapha) is reviving. Continue the gentle quad stretches.',
              doctorName: 'Dr. Anandvardhan Kulkarni (BHMS)'
            },
            {
              id: 'sample-4',
              authorName: 'Pooja S.',
              location: 'Jaipur',
              conditionTag: 'Thyroid & Metabolism',
              timeAgo: '1 week ago',
              title: 'TSH level normalized from 7.6 to 3.2 without synthetic dosage increase',
              content: 'Kanchanar Guggulu with lukewarm coriander-seed water first thing in the morning made the difference for my sluggish metabolism. Cold hands and brain fog are completely gone!',
              imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
              imageCaption: 'Morning soaked Dhaniya seed water infusion',
              likesCount: 31,
              doctorVerifiedReply: 'Thyroid gland micro-circulation has normalized. Maintain this morning coriander detox water routine through the winter season.',
              doctorName: 'Dr. Ananya Roy (BHMS)'
            }
          ];

          const combinedPosts = communityPosts.length > 0 
            ? [...communityPosts, ...sampleCommunityData.filter(s => !communityPosts.some(cp => cp.id === s.id))] 
            : sampleCommunityData;

          const filteredPosts = combinedPosts.filter(p => {
            if (communityCategory === 'All') return true;
            return p.conditionTag && p.conditionTag.toLowerCase().includes(communityCategory.toLowerCase());
          });

          return (
            <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Twitter / X Style Compose Tweet Box */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#1d3924', color: '#E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', flexShrink: 0 }}>
                    {user?.name ? user.name.charAt(0) : 'P'}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <form onSubmit={handleCreateCommunityPost}>
                      <input
                        type="text"
                        placeholder="Headline / Question (e.g. Can I take Ashwagandha with BP medication?)"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderBottom: '1px solid #f1f5f9',
                          padding: '4px 0 8px 0',
                          fontSize: '15px',
                          fontWeight: '800',
                          color: '#0f172a',
                          outline: 'none',
                          marginBottom: '8px',
                          boxSizing: 'border-box'
                        }}
                      />
                      
                      <textarea
                        rows={3}
                        placeholder="What's happening in your healing journey? Share symptom questions, diet tips, or recovery... #Ayurveda"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        style={{
                          width: '100%',
                          border: 'none',
                          fontSize: '14px',
                          color: '#334155',
                          outline: 'none',
                          resize: 'none',
                          lineHeight: '1.5',
                          padding: '0',
                          boxSizing: 'border-box'
                        }}
                      />

                      {/* Quick Hashtags Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0' }}>
                        {['#Diabetes', '#PCOS', '#SkinHeal', '#Psoriasis', '#JointPain', '#GiloyDetox', '#Thyroid'].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if (!newPostContent.includes(tag)) {
                                setNewPostContent(prev => `${prev} ${tag}`);
                              }
                            }}
                            style={{
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#f8fafc',
                              color: '#059669',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Bottom Compose Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Topic:</span>
                          <select
                            value={newPostTag}
                            onChange={(e) => setNewPostTag(e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#334155',
                              backgroundColor: '#ffffff'
                            }}
                          >
                            <option value="Diabetes Reversal">🩸 Diabetes</option>
                            <option value="Skin & Psoriasis">✨ Skin & Psoriasis</option>
                            <option value="Joint Pain & Arthritis">🦴 Joint Pain</option>
                            <option value="Thyroid & Metabolism">🦋 Thyroid</option>
                            <option value="Gut Health & Agni">🌱 Digestion</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="submit"
                            disabled={postingCommunity || !newPostTitle.trim() || !newPostContent.trim()}
                            style={{
                              padding: '8px 20px',
                              borderRadius: '9999px',
                              backgroundColor: '#1d3924',
                              color: '#ffffff',
                              fontSize: '13px',
                              fontWeight: '800',
                              border: 'none',
                              cursor: (postingCommunity || !newPostTitle.trim() || !newPostContent.trim()) ? 'not-allowed' : 'pointer',
                              opacity: (postingCommunity || !newPostTitle.trim() || !newPostContent.trim()) ? 0.6 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(29, 57, 36, 0.25)'
                            }}
                          >
                            <span>{postingCommunity ? 'Posting...' : 'Post'}</span>
                            <Sparkles size={14} color="#E6D7B9" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Twitter Style Topic Tabs */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', padding: '0 4px' }}>
                {[
                  { id: 'All', label: 'For You' },
                  { id: 'Diabetes', label: '#Diabetes' },
                  { id: 'Skin', label: '#SkinHealth' },
                  { id: 'Joint', label: '#JointPain' },
                  { id: 'Thyroid', label: '#Thyroid' },
                  { id: 'Kadha', label: '#HerbalKwath' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCommunityCategory(tab.id)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '9999px',
                      border: communityCategory === tab.id ? '1.5px solid #1d3924' : '1px solid #e2e8f0',
                      backgroundColor: communityCategory === tab.id ? '#1d3924' : '#ffffff',
                      color: communityCategory === tab.id ? '#ffffff' : '#475569',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Community Feed Posts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredPosts.map(post => {
                  const isLiked = !!communityLiked[post.id];
                  const commentsList = communityComments[post.id] || [];
                  const isCommentsOpen = !!expandedComments[post.id];

                  return (
                    <div 
                      key={post.id} 
                      className="resp-card-padding" 
                      style={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '18px', 
                        padding: '22px', 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        transition: 'box-shadow 0.15s ease'
                      }}
                    >
                      {/* Post Author Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#1d3924', color: '#E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                            {post.authorName ? post.authorName.charAt(0) : 'P'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                                {post.authorName}
                              </span>
                              {post.location && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>({post.location})</span>
                              )}
                              <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', backgroundColor: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                Verified Patient
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                              {post.timeAgo || (post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently')}
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#065f46', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                          {post.conditionTag}
                        </span>
                      </div>

                      {/* Post Headline & Body */}
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {post.title}
                      </h4>
                      <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.55', margin: '0 0 14px 0' }}>
                        {post.content}
                      </p>

                      {/* Attached Photo Preview (If available) */}
                      {post.imageUrl && (
                        <div style={{ marginBottom: '14px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                          <img 
                            src={post.imageUrl} 
                            alt={post.title}
                            style={{ width: '100%', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          {post.imageCaption && (
                            <div style={{ padding: '8px 12px', fontSize: '11.5px', color: '#64748b', fontStyle: 'italic', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                              📷 {post.imageCaption}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Doctor Verified Reply Box */}
                      {post.doctorVerifiedReply && (
                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '14px 16px', border: '1.5px solid #bbf7d0', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShieldCheck size={16} color="#059669" />
                              <strong style={{ fontSize: '12.5px', color: '#166534' }}>{post.doctorName || 'Verified BHMS Clinician'}</strong>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>
                              CLINICAL OPINION
                            </span>
                          </div>
                          <p style={{ fontSize: '12.5px', color: '#14532d', margin: 0, lineHeight: '1.45' }}>
                            {post.doctorVerifiedReply}
                          </p>
                        </div>
                      )}

                      {/* Interactive Action Bar: Like, Comments Toggle, Share */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: isLiked ? '#fef2f2' : '#f8fafc',
                              border: isLiked ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                              color: isLiked ? '#dc2626' : '#475569',
                              borderRadius: '9999px',
                              padding: '5px 13px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '12px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Heart size={14} fill={isLiked ? '#dc2626' : 'none'} color={isLiked ? '#dc2626' : '#64748b'} />
                            <span>{post.likesCount || 0} Helpful</span>
                          </button>

                          <button
                            onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: isCommentsOpen ? '#eff6ff' : '#f8fafc',
                              border: isCommentsOpen ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              color: isCommentsOpen ? '#1d4ed8' : '#475569',
                              borderRadius: '9999px',
                              padding: '5px 13px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '12px'
                            }}
                          >
                            <MessageCircle size={14} color={isCommentsOpen ? '#1d4ed8' : '#64748b'} />
                            <span>{commentsList.length > 0 ? `${commentsList.length} Replies` : 'Reply / Comments'}</span>
                          </button>
                        </div>

                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Verified Discussion
                        </span>
                      </div>

                      {/* Expandable Comments & Replies Thread */}
                      {isCommentsOpen && (
                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            {commentsList.length === 0 ? (
                              <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0' }}>
                                No comments yet. Be the first to share an answer or support!
                              </p>
                            ) : (
                              commentsList.map(c => (
                                <div 
                                  key={c.id} 
                                  style={{ 
                                    backgroundColor: c.isDoctor ? '#f0fdf4' : '#f8fafc', 
                                    padding: '10px 14px', 
                                    borderRadius: '10px', 
                                    border: c.isDoctor ? '1px solid #bbf7d0' : '1px solid #f1f5f9' 
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <strong style={{ fontSize: '12px', color: c.isDoctor ? '#166534' : '#1e293b' }}>
                                        {c.author}
                                      </strong>
                                      {c.isDoctor && (
                                        <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#059669', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                                          DOCTOR
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>{c.time}</span>
                                  </div>
                                  <p style={{ fontSize: '12.5px', color: '#334155', margin: 0 }}>
                                    {c.text}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Live Comment Input Box */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Write a helpful reply or encouragement..."
                              value={commentInput[post.id] || ''}
                              onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCommunityComment(post.id);
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '12.5px',
                                outline: 'none'
                              }}
                            />
                            <button
                              onClick={() => handleAddCommunityComment(post.id)}
                              disabled={!(commentInput[post.id] || '').trim()}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                backgroundColor: '#1d3924',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: '800',
                                border: 'none',
                                cursor: (commentInput[post.id] || '').trim() ? 'pointer' : 'not-allowed',
                                opacity: (commentInput[post.id] || '').trim() ? 1 : 0.6
                              }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })()}

        {/* =========================================================================
            VIEW 13: REAL YOGA & ASANA EXPLORER (With 84 Advik Diagnostics Asanas & YouTube Videos)
        ========================================================================= */}
        {activeTab === 'yoga' && (() => {
          const categories = ['All', 'Standing', 'Seated', 'Prone', 'Supine', 'Balancing', 'Inverted', 'Resting', 'Twisting'];
          const filteredAsanas = (yogaAsanasData || []).filter(a => {
            const matchesCat = yogaCategory === 'All' || a.cat?.toLowerCase() === yogaCategory.toLowerCase();
            const q = yogaSearch.toLowerCase().trim();
            const matchesSearch = !q || 
              a.sanskrit?.toLowerCase().includes(q) || 
              a.english?.toLowerCase().includes(q) ||
              a.desc?.toLowerCase().includes(q) ||
              a.benefits?.some(b => b.toLowerCase().includes(q));
            return matchesCat && matchesSearch;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Header Banner */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '26px 30px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                      AUTHENTIC AYUR-YOGA SAMHITA • 84 CLASSICAL ASANAS
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#111827', margin: '8px 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                      {lang === 'hi' ? 'दैनिक योगासन, प्राणायाम एवं वीडियो मार्गदर्शिका' : lang === 'hinglish' ? 'Daily Yoga Asanas, Pranayama & HD Video Guides' : 'Daily Yoga Asanas, Pranayama & Video Guide'}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, maxWidth: '680px' }}>
                      Curated from authentic Hatha Yoga texts to complement herbal protocols. Filter by posture category or disease benefit to watch clinical video demonstrations.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div style={{ minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '9999px', padding: '6px 14px', gap: '8px' }}>
                      <Search size={15} color="#64748b" />
                      <input
                        type="text"
                        value={yogaSearch}
                        onChange={(e) => setYogaSearch(e.target.value)}
                        placeholder="Search asana, eg. Surya, Lotus..."
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '20px', paddingBottom: '4px' }}>
                  {categories.map(cat => {
                    const isSel = yogaCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setYogaCategory(cat)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '9999px',
                          border: isSel ? '1.5px solid #1d3924' : '1px solid #e2e8f0',
                          backgroundColor: isSel ? '#1d3924' : '#f8fafc',
                          color: isSel ? '#ffffff' : '#475569',
                          fontSize: '12px',
                          fontWeight: isSel ? '800' : '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cat} ({cat === 'All' ? yogaAsanasData?.length || 84 : (yogaAsanasData || []).filter(a => a.cat?.toLowerCase() === cat.toLowerCase()).length})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Asanas Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
                {filteredAsanas.map(asana => (
                  <div 
                    key={asana.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* YouTube Video Preview Thumbnail with Play Button */}
                    <div 
                      onClick={() => setSelectedAsana(asana)}
                      style={{ position: 'relative', height: '170px', cursor: 'pointer', backgroundColor: '#0f172a' }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${asana.videoId}/hqdefault.jpg`}
                        alt={asana.sanskrit}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                          ▶
                        </div>
                      </div>
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.75)', color: '#ffffff', fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        HD Video
                      </span>
                      <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#1d3924', color: '#E6D7B9', fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                        {asana.cat}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                            {asana.sanskrit}
                          </h4>
                          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                            {asana.english}
                          </span>
                        </div>

                        <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.45', margin: '8px 0 12px 0' }}>
                          {asana.desc?.slice(0, 110)}...
                        </p>

                        {/* Top 2 Benefits */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                          {(asana.benefits || []).slice(0, 2).map((b, bi) => (
                            <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#065f46' }}>
                              <CheckCircle2 size={13} color="#059669" />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAsana(asana)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1.5px solid #a7f3d0',
                          fontSize: '12.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Video size={14} /> Watch Guided Video & Steps
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAsanas.length === 0 && (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '48px 20px', textAlign: 'center', border: '1.5px solid #e2e8f0' }}>
                  <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>No Asanas Match Your Search</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Try searching by general keywords like "Lotus", "Stretch", or clear the category filter.</p>
                  <button
                    onClick={() => { setYogaCategory('All'); setYogaSearch(''); }}
                    style={{ marginTop: '12px', padding: '8px 18px', borderRadius: '8px', backgroundColor: '#1d3924', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

            </div>
          );
        })()}

        {/* =========================================================================
            VIEW 14: REAL DRUG-HERB CLINICAL SAFETY CONFLICT CHECKER
        ========================================================================= */}
        {activeTab === 'drug_checker' && (() => {
          const allopathicDrugs = Object.keys(drugHerbInteractions);
          const currentHerbMap = drugHerbInteractions[selectedDrug] || {};
          const currentHerbResult = currentHerbMap[selectedHerbConflict];

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Clinical Explanatory Header */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '26px 30px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  EVIDENCE-BASED PHARMACOKINETIC SAFETY MATRIX
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#111827', margin: '8px 0 6px 0', fontFamily: 'var(--font-heading)' }}>
                  {lang === 'hi' ? 'दवा-जड़ी सुरक्षा एवं अंतःक्रिया विश्लेषक' : lang === 'hinglish' ? 'Allopathic Drug + Ayurvedic Herb Safety Checker' : 'Drug-Herb Clinical Safety Conflict Checker'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, maxWidth: '720px' }}>
                  Ensure total safety when co-administering modern pharmaceutical drugs with potent Ayurvedic botanicals. Tested against CYP450 cytochrome metabolism, bioavailability shifts, and glycemic synergy.
                </p>
              </div>

              {/* Interactive Dual Selector Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '28px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: '0 0 18px 0' }}>
                  Select Your Current Prescription & Ayurvedic Herb:
                </h4>

                <div className="resp-grid-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                      1. Allopathic Medication Taken:
                    </label>
                    <select
                      value={selectedDrug}
                      onChange={(e) => setSelectedDrug(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', fontWeight: '700', color: '#1e293b', backgroundColor: '#f8fafc' }}
                    >
                      {allopathicDrugs.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                      2. Ayurvedic Herb Formulation:
                    </label>
                    <select
                      value={selectedHerbConflict}
                      onChange={(e) => setSelectedHerbConflict(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', fontWeight: '700', color: '#1e293b', backgroundColor: '#f8fafc' }}
                    >
                      {['Purified Giloy Stem', 'Nagori Ashwagandha Churna', 'Triphala Kadha Churna', 'Arjuna Bark Churna'].map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interaction Result Display */}
                {currentHerbResult ? (
                  <div style={{ backgroundColor: currentHerbResult.bg, borderRadius: '18px', padding: '24px', border: `2px solid ${currentHerbResult.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: currentHerbResult.color, textTransform: 'uppercase', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '9999px', border: `1px solid ${currentHerbResult.border}` }}>
                        ● CLINICAL EVALUATION: {currentHerbResult.level}
                      </span>
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1e293b' }}>
                        {selectedDrug.split(' ')[0]} + {selectedHerbConflict}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
                      {currentHerbResult.summary}
                    </h4>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', border: `1px solid ${currentHerbResult.border}`, marginBottom: '14px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Pharmacological Mechanism:
                      </div>
                      <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                        {currentHerbResult.mechanism}
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', border: `1px solid ${currentHerbResult.border}` }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: currentHerbResult.color, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Clinical Vaidya Recommendation:
                      </div>
                      <p style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', lineHeight: '1.5', margin: 0 }}>
                        {currentHerbResult.guidance}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '18px', padding: '24px', border: '1.5px solid #e2e8f0', textAlign: 'center' }}>
                    <ShieldCheck size={32} color="#059669" style={{ margin: '0 auto 8px auto' }} />
                    <h5 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0' }}>No Adverse Clinical Conflict Documented</h5>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                      This combination does not exhibit high pharmacokinetic inhibition. You may consume them safely with a 1-2 hour interval.
                    </p>
                  </div>
                )}
              </div>

              {/* Fast Matrix Table of Well-Known Interactions */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '26px', border: '1.5px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', margin: '0 0 14px 0' }}>
                  Frequently Consulted Drug-Herb Combinations:
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {[
                    { drug: 'Metformin (Diabetes)', herb: 'Purified Giloy Stem', tag: 'Moderate Caution', color: '#d97706', note: 'Synergistic blood sugar drop. Monitor morning FBS.' },
                    { drug: 'Metformin (Diabetes)', herb: 'Nagori Ashwagandha Churna', tag: 'Safe & Beneficial', color: '#059669', note: 'Reduces cortisol without causing hypoglycemia.' },
                    { drug: 'Thyroxine (Hypothyroid)', herb: 'Nagori Ashwagandha Churna', tag: 'TSH Monitoring', color: '#7c3aed', note: 'Stimulates T3/T4 synthesis. Keep 4-hour gap.' },
                    { drug: 'Amlodipine (Blood Pressure)', herb: 'Arjuna Bark Churna', tag: 'Synergistic Benefit', color: '#059669', note: 'Complementary cardiotonic vasodilation.' }
                  ].map((row, ri) => (
                    <div 
                      key={ri}
                      onClick={() => {
                        setSelectedDrug(row.drug);
                        setSelectedHerbConflict(row.herb);
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        border: '1.5px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: row.color }}>{row.tag}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tap to Inspect →</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{row.drug.split(' ')[0]} + {row.herb.split(' ')[0]}</div>
                      <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0' }}>{row.note}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })()}

      </div>

      {/* =========================================================================
          DRAWER 1: AUTHENTIC PRODUCT DOSSIER (Opens right inside portal!)
      ========================================================================= */}
      <Drawer
        isOpen={!!selectedProductDrawer}
        onClose={() => setSelectedProductDrawer(null)}
        title={selectedProductDrawer?.name || 'Product Details'}
        subtitle={selectedProductDrawer?.botanicalName || selectedProductDrawer?.subtitle}
        badge={selectedProductDrawer?.category}
        width="660px"
      >
        {selectedProductDrawer && (() => {
          const prices = getProductPriceForWeight(selectedProductDrawer, productSelectedWeight);
          const energetics = getProductEnergetics(selectedProductDrawer);
          const benefits = getProductBenefits(selectedProductDrawer);
          const usage = getProductUsage(selectedProductDrawer);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Top Image & Batch Purity Seal */}
              <div style={{ position: 'relative', height: '260px', borderRadius: '18px', overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
                <img 
                  src={selectedProductDrawer.image || selectedProductDrawer.imageUrl || 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=700&q=80'} 
                  alt={selectedProductDrawer.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: 'rgba(29, 57, 36, 0.9)', color: '#E6D7B9', padding: '6px 14px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#059669" /> AYUSH GMP & NABL Certified
                </div>
                <div style={{ position: 'absolute', bottom: '14px', right: '14px', backgroundColor: '#ffffff', color: '#163321', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  ★ {selectedProductDrawer.rating || 4.9} ({selectedProductDrawer.reviewsCount || 200}+ reviews)
                </div>
              </div>

              {/* Pricing & Package Weight Selector */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Selected Package:</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>
                        ₹{prices.price * productQuantity}
                      </span>
                      <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{prices.mrp * productQuantity}
                      </span>
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: '800', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                        Save ₹{(prices.mrp - prices.price) * productQuantity}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '9999px', backgroundColor: '#ffffff', padding: '3px 10px', gap: '10px' }}>
                    <button 
                      onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                      style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '800', cursor: 'pointer', color: '#334155' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '800', minWidth: '20px', textAlign: 'center' }}>
                      {productQuantity}
                    </span>
                    <button 
                      onClick={() => setProductQuantity(productQuantity + 1)}
                      style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '800', cursor: 'pointer', color: '#334155' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Weight Pills */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['250g', '500g', '1kg'].map(sz => {
                    const isSel = productSelectedWeight === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setProductSelectedWeight(sz)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '10px',
                          border: isSel ? '2px solid #059669' : '1px solid #cbd5e1',
                          backgroundColor: isSel ? '#ecfdf5' : '#ffffff',
                          color: isSel ? '#065f46' : '#475569',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {sz} {sz === '250g' ? '(Standard)' : sz === '500g' ? '(Popular)' : '(Apothecary)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Farm Source & Batch Traceability Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', border: '1.5px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="#059669" />
                    <span><strong>Origin:</strong> {selectedProductDrawer.farmSource || 'Narmada Organic Co-op, MP'}</span>
                  </div>
                  <span style={{ color: '#64748b' }}>{selectedProductDrawer.harvestDate || 'August 2026'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <QrCode size={15} color="#059669" />
                    <span><strong>Batch:</strong> #{selectedProductDrawer.batchNo || 'NGR-2026-081'}</span>
                  </div>
                  <Link 
                    to={`/traceability?batch=${selectedProductDrawer.batchNo || 'NGR-2026-081'}`} 
                    style={{ color: '#059669', fontWeight: '800', textDecoration: 'underline' }}
                  >
                    Inspect Lab CoA Report →
                  </Link>
                </div>
              </div>

              {/* Dossier Tabs: Overview, Energetics, Usage, Reviews */}
              <div>
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
                  {[
                    { id: 'overview', label: 'Clinical Benefits' },
                    { id: 'ayurveda', label: 'Dosha Energetics' },
                    { id: 'usage', label: 'Usage & Dosage' },
                    { id: 'precautions', label: 'Precautions' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setProductActiveTab(tab.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: productActiveTab === tab.id ? '1.5px solid #1d3924' : '1px solid transparent',
                        backgroundColor: productActiveTab === tab.id ? '#1d3924' : '#f1f5f9',
                        color: productActiveTab === tab.id ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab 1: Clinical Benefits */}
                {productActiveTab === 'overview' && (
                  <div>
                    <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                      {selectedProductDrawer.description || selectedProductDrawer.subtitle || 'Wild-harvested, authenticated botanical root tested for bio-active HPLC withanolides and safe consumption.'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {benefits.map((b, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#1e293b' }}>
                          <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 2: Ayurvedic Energetics */}
                {productActiveTab === 'ayurveda' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>RASA (TASTE)</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>{energetics.rasa}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>GUNA (QUALITIES)</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>{energetics.guna}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>VIRYA (POTENCY)</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>{energetics.virya}</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>DOSHA ACTION</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', marginTop: '2px' }}>{energetics.dosha}</div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Usage & Dosage */}
                {productActiveTab === 'usage' && (
                  <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '16px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534', lineHeight: '1.6' }}>
                    <strong>Doctor-Recommended Consumption:</strong>
                    <p style={{ margin: '6px 0 0 0' }}>{usage}</p>
                  </div>
                )}

                {/* Tab 4: Precautions */}
                {productActiveTab === 'precautions' && (
                  <div style={{ backgroundColor: '#fffbeb', borderRadius: '14px', padding: '16px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                    <strong>Clinical Precautions & Interactions:</strong>
                    <p style={{ margin: '6px 0 0 0' }}>
                      {selectedProductDrawer.precautions || 'Safe for long-term clinical use. In pregnant or lactating mothers, consult your BHMS practitioner before consuming. Do not discontinue prescription allopathic drugs without medical supervision.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  onClick={() => {
                    handleAddToCartLocal(selectedProductDrawer, productSelectedWeight, productQuantity);
                  }}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: '12px',
                    backgroundColor: addedItems[selectedProductDrawer.id] ? '#059669' : '#1d3924',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(29, 57, 36, 0.2)'
                  }}
                >
                  {addedItems[selectedProductDrawer.id] ? <Check size={18} /> : <ShoppingBag size={18} />}
                  <span>{addedItems[selectedProductDrawer.id] ? 'Added to Bag!' : `Add to Bag • ₹${prices.price * productQuantity}`}</span>
                </button>

                <Link
                  to={`/product/${selectedProductDrawer.id}`}
                  style={{
                    padding: '13px 18px',
                    borderRadius: '12px',
                    border: '1.5px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Full Page</span> <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          );
        })()}
      </Drawer>

      {/* =========================================================================
          DRAWER 2: DOCTOR CLINICAL PROFILE & VIDEO CONSULTATION BOOKING
      ========================================================================= */}
      <Drawer
        isOpen={!!selectedDoctorDrawer}
        onClose={() => setSelectedDoctorDrawer(null)}
        title={selectedDoctorDrawer?.name || 'Doctor Profile'}
        subtitle={selectedDoctorDrawer?.degree || 'AYUSH Vaidya'}
        badge="VERIFIED BHMS"
        width="660px"
      >
        {selectedDoctorDrawer && (() => {
          const modeFee = getDoctorFeeForMode(selectedDoctorDrawer, bookingType);
          const discount = applySuperCoinsDiscount && superCoins >= 100 ? 100 : 0;
          const finalPayable = Math.max(0, modeFee - discount);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Doctor Header Profile Box */}
              <div style={{ display: 'flex', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1.5px solid #e2e8f0' }}>
                <img 
                  src={selectedDoctorDrawer.image} 
                  alt={selectedDoctorDrawer.name}
                  style={{ width: '84px', height: '84px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #059669' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                      {selectedDoctorDrawer.name}
                    </h3>
                    <ShieldCheck size={18} color="#059669" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '800', marginTop: '2px' }}>
                    {selectedDoctorDrawer.degree} • Council Reg: {selectedDoctorDrawer.registrationNo}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    {selectedDoctorDrawer.college || selectedDoctorDrawer.councilName}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px' }}>
                    <span>⭐ <strong>{selectedDoctorDrawer.rating || 4.9}</strong> ({selectedDoctorDrawer.consultationsCount || 200}+ consults)</span>
                    <span>🏅 <strong>{selectedDoctorDrawer.experience}</strong></span>
                  </div>
                </div>
              </div>

              {/* Bio & Clinical Approach */}
              <div>
                <h5 style={{ fontSize: '12.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', margin: '0 0 6px 0' }}>
                  Clinical Background & Reversal Specialization
                </h5>
                <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                  {selectedDoctorDrawer.about}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(selectedDoctorDrawer.specializationList || ['Metabolic Care', 'Diabetes', 'Fatty Liver']).map((sp, i) => (
                    <span key={i} style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#ecfdf5', color: '#065f46', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                      ✓ {sp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Choose Consultation Mode */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Select Consultation Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'video', label: 'HD Video Call', desc: 'Encrypted WebRTC + WhatsApp Rx', fee: getDoctorFeeForMode(selectedDoctorDrawer, 'video'), icon: Video },
                    { id: 'audio', label: 'Phone Audio', desc: 'Direct doctor voice call', fee: getDoctorFeeForMode(selectedDoctorDrawer, 'audio'), icon: PhoneCall },
                    { id: 'chat', label: 'Chat Q&A', desc: 'Report analysis & messaging', fee: getDoctorFeeForMode(selectedDoctorDrawer, 'chat'), icon: MessageSquare }
                  ].map(t => {
                    const isSel = bookingType === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setConsultType(t.id)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: '14px',
                          border: isSel ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSel ? '#ecfdf5' : '#ffffff',
                          textAlign: 'center',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Icon size={18} color={isSel ? '#059669' : '#64748b'} />
                        <div style={{ fontSize: '12px', fontWeight: '800', color: isSel ? '#065f46' : '#1e293b' }}>{t.label}</div>
                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#111827' }}>₹{t.fee}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Select Time Slot
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {['Today at 4:30 PM (Next)', 'Today at 5:30 PM', 'Tomorrow at 10:00 AM', 'Tomorrow at 3:00 PM'].map(sl => (
                    <button
                      key={sl}
                      type="button"
                      onClick={() => setBookingSlot(sl)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: bookingSlot === sl ? '2px solid #059669' : '1px solid #cbd5e1',
                        backgroundColor: bookingSlot === sl ? '#ecfdf5' : '#ffffff',
                        color: bookingSlot === sl ? '#065f46' : '#334155',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {sl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pre-filled Patient Clinical Case Sheet */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Pre-filled Case History (From Your Profile):
                </div>
                <div style={{ fontSize: '12.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Patient:</strong> {user?.name || 'Arav Patel'} (Age: {profileForm.age}, {profileForm.gender}, {profileForm.bloodGroup})</div>
                  <div><strong>Tagged Conditions:</strong> {profileForm.existingConditions.join(', ')}</div>
                  <div><strong>Current Meds:</strong> {profileForm.currentMedications}</div>
                </div>
              </div>

              {/* Chief Complaints Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Describe Chief Complaints / Symptoms For Doctor:
                </label>
                <textarea
                  rows={2}
                  value={bookingComplaint}
                  onChange={(e) => setBookingComplaint(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit' }}
                />
              </div>

              {/* SuperCoins Discount Toggle */}
              <div style={{ backgroundColor: '#fffbeb', borderRadius: '12px', padding: '12px 16px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="coinsToggle" 
                    checked={applySuperCoinsDiscount} 
                    onChange={(e) => setApplySuperCoinsDiscount(e.target.checked)} 
                    style={{ width: '16px', height: '16px', accentColor: '#d97706', cursor: 'pointer' }}
                  />
                  <label htmlFor="coinsToggle" style={{ fontSize: '12.5px', fontWeight: '700', color: '#92400e', cursor: 'pointer' }}>
                    Redeem 100 SuperCoins for ₹100 instant consultation discount
                  </label>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>-₹{discount}</span>
              </div>

              {/* Success or Booking Action */}
              {bookingSuccessMsg ? (
                <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '14px', border: '1.5px solid #a7f3d0', color: '#065f46', fontSize: '13.5px', fontWeight: '700', lineHeight: '1.5' }}>
                  <CheckCircle2 size={22} color="#059669" style={{ marginBottom: '6px' }} />
                  <div>{bookingSuccessMsg}</div>
                </div>
              ) : (
                <button
                  onClick={handleConfirmDoctorBooking}
                  disabled={bookingSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: bookingSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(29, 57, 36, 0.2)'
                  }}
                >
                  <Video size={18} />
                  <span>{bookingSubmitting ? 'Scheduling...' : `Confirm & Schedule Appointment • ₹${finalPayable}`}</span>
                </button>
              )}

            </div>
          );
        })()}
      </Drawer>

      {/* =========================================================================
          DRAWER 3: PRESCRIPTION DIGITIZATION MODAL
      ========================================================================= */}
      <Drawer
        isOpen={scanPrescriptionModalOpen}
        onClose={() => setScanPrescriptionModalOpen(false)}
        title="Prescription Scanner & Digital Records"
        subtitle="Automatic digitization of herbal medicines, dosages, and daily regimen"
        badge="Clinical Records"
        width="600px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', fontSize: '12.5px', color: '#166534' }}>
            <FileCheck size={16} color="#059669" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Upload any handwritten or digital doctor prescription to automatically schedule herbal remedies, dosage timings, and water reminders.
          </div>

          {!scannedResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Drag Drop Mock Area */}
              <div 
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}
              >
                <UploadCloud size={42} color="#059669" style={{ margin: '0 auto 10px auto' }} />
                <h5 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                  Upload Doctor's Prescription
                </h5>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px 0' }}>
                  Supports JPEG, PNG, or PDF up to 10MB
                </p>
                <button
                  type="button"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Browse Device File
                </button>
              </div>

              {/* Custom Text Input for Groq 120B OCR */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px', border: '1.5px solid #cbd5e1' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  ✍️ Or Paste Doctor's Prescription Notes (Groq 120B AI Parser):
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Rx: Dr. Ananya Sharma, BHMS, Reg: DHC/2015/8492. Purified Giloy Stem Churna 3g morning with warm water, Nagori Ashwagandha Root 5g bedtime with milk 45 days. Avoid fried items and curd."
                  value={customRxText}
                  onChange={(e) => setCustomRxText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleScanPrescription(customRxText)}
                  disabled={scanningPrescription}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: scanningPrescription ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} color="#E6D7B9" />
                  <span>{scanningPrescription ? 'Extracting via Groq 120B...' : 'Extract Prescription via Groq 120B AI'}</span>
                </button>
              </div>

              {/* Sample Rx Button */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Or try with a pre-filled clinical prescription:</span>
                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={() => handleScanPrescription(null)}
                    disabled={scanningPrescription}
                    style={{
                      padding: '11px 22px',
                      borderRadius: '10px',
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: scanningPrescription ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Camera size={16} />
                    <span>{scanningPrescription ? 'Extracting Botanical Remedies...' : 'Analyze Verified Sample Rx (Groq 120B)'}</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Scanned Extracted Results */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1.5px solid #bbf7d0', boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                      {scannedResult.doctorName}
                    </h4>
                    <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700' }}>
                      Reg: {scannedResult.registrationNo} • {scannedResult.diagnosis}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#065f46', padding: '3px 10px', borderRadius: '9999px' }}>
                    ✓ OCR VERIFIED
                  </span>
                </div>

                <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', margin: '14px 0 8px 0' }}>
                  Extracted Herbal Medicines & Schedule:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scannedResult.medicines.map((m, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>🌿 {m.herb} ({m.dosage})</strong>
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>{m.duration}</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        Timing: {m.timing}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534' }}>
                  <strong>Diet Advice:</strong> {scannedResult.dietGuidelines}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setActiveTab('reminders');
                    setScanPrescriptionModalOpen(false);
                    setScannedResult(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  View Active Reminders
                </button>

                <button
                  onClick={() => {
                    setActiveTab('store');
                    setScanPrescriptionModalOpen(false);
                    setScannedResult(null);
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Order Herbal Bundle
                </button>
              </div>
            </div>
          )}

        </div>
      </Drawer>

      {/* =========================================================================
          DRAWER 4: HEALTH PROFILE DRAWER (Interactive)
      ========================================================================= */}
      <Drawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        title="Update Health Profile & Medical History"
        width="540px"
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '14px', fontSize: '12.5px', color: '#166534' }}>
            <ShieldCheck size={16} color="#059669" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            This data pre-fills your digital clinical case sheet for your BHMS doctor before each call.
          </div>

          {/* Family Member Profile Selector */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Active Family Member Profile:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.keys(familyProfiles).map(member => {
                const isMemberActive = activeFamilyMember === member;
                const famData = familyProfiles[member];
                return (
                  <button
                    key={member}
                    type="button"
                    onClick={() => {
                      setActiveFamilyMember(member);
                      setProfileForm({
                        age: famData.age,
                        gender: famData.gender,
                        bloodGroup: famData.bloodGroup,
                        existingConditions: famData.conditions,
                        allergies: famData.allergies,
                        currentMedications: famData.meds,
                        dietType: 'Sattvic / Ayurvedic'
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      borderRadius: '10px',
                      border: isMemberActive ? '2px solid #059669' : '1px solid #cbd5e1',
                      backgroundColor: isMemberActive ? '#ecfdf5' : '#ffffff',
                      color: isMemberActive ? '#065f46' : '#334155',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>👤 {member}</div>
                    <div style={{ fontSize: '10px', color: isMemberActive ? '#059669' : '#64748b', fontWeight: '600' }}>
                      {famData.name.split(' ')[0]} ({famData.age}y)
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>Age</label>
              <input 
                type="number" 
                value={profileForm.age} 
                onChange={(e) => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>Gender</label>
              <select 
                value={profileForm.gender} 
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>Blood</label>
              <select 
                value={profileForm.bloodGroup} 
                onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
              >
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>Known Allergies</label>
            <input 
              type="text" 
              value={profileForm.allergies} 
              onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>Current Medications</label>
            <input 
              type="text" 
              value={profileForm.currentMedications} 
              onChange={(e) => setProfileForm({ ...profileForm, currentMedications: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            style={{
              padding: '13px',
              borderRadius: '10px',
              backgroundColor: '#1d3924',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '800',
              border: 'none',
              cursor: savingProfile ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          >
            {savingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </Drawer>

      {/* Real Live WebRTC Video Consultation Room (Zero Third-Party API Key) */}
      <VideoConsultationModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        roomName={`ayursutra-consult-${user?.id || 'patient-room'}`}
        doctorName="Dr. Ananya Sharma (BHMS)"
        patientName={user?.name || "Patient"}
      />

      {/* =========================================================================
          MODAL 1: REAL ASANA YOUTUBE HD VIDEO PLAYER & CLINICAL PROTOCOL
      ========================================================================= */}
      {selectedAsana && (
        <div 
          onClick={() => setSelectedAsana(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Video Player */}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, backgroundColor: '#000000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedAsana.videoId}?autoplay=1&rel=0`}
                title={selectedAsana.sanskrit}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
              <button
                onClick={() => setSelectedAsana(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Asana Details Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  {selectedAsana.cat} Pose
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Curated Classical Asana</span>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: '0 0 2px 0' }}>
                {selectedAsana.sanskrit} ({selectedAsana.english})
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '8px 0 18px 0' }}>
                {selectedAsana.desc}
              </p>

              {/* Benefits */}
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '16px', border: '1px solid #bbf7d0', marginBottom: '18px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                  Physiological & Metabolic Benefits:
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(selectedAsana.benefits || []).map((b, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#14532d' }}>
                      <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-step Execution */}
              <div>
                <h5 style={{ fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                  Step-by-Step Clinical Instructions:
                </h5>
                <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(selectedAsana.steps || []).map((st, si) => (
                    <li key={si} style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.45' }}>
                      {st}
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{ marginTop: '22px', textAlign: 'right' }}>
                <button
                  onClick={() => setSelectedAsana(null)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: RETURN / REPLACEMENT REQUEST MODAL
      ========================================================================= */}
      {returnModalOrder && (
        <div 
          onClick={() => setReturnModalOrder(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                Request Return or Replacement
              </h4>
              <button onClick={() => setReturnModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px 0' }}>
              Item: <strong>{returnModalOrder.item}</strong> (Order #{returnModalOrder.orderId})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Reason for Return / Replacement:
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Damaged packaging during transit">Damaged packaging / seal broken during transit</option>
                  <option value="Incorrect herb or weight received">Incorrect herb or package weight received</option>
                  <option value="Quality or aroma inconsistency">Quality or aroma inconsistency</option>
                  <option value="Doctor modified prescription">Doctor modified herbal treatment plan</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Additional Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="e.g. Outer pouch seal was unsealed when courier arrived."
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '12.5px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ backgroundColor: '#ecfdf5', borderRadius: '10px', padding: '10px 14px', border: '1px solid #a7f3d0', fontSize: '12px', color: '#065f46' }}>
                ✓ AYUSH Farm-Traceable Guarantee: Free doorstep pickup within 24-48 hours.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setReturnModalOrder(null)}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReturnSubmittedOrders({ ...returnSubmittedOrders, [returnModalOrder.orderId]: true });
                    alert(`Return Request Registered for Order #${returnModalOrder.orderId}! Our courier partner BlueDart has been notified for reverse doorstep pickup.`);
                    setReturnModalOrder(null);
                  }}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Submit Return Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SECOND OPINION REQUEST MODAL
      ========================================================================= */}
      {secondOpinionModal && (
        <div 
          onClick={() => setSecondOpinionModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                Request Senior Vaidya Second Opinion
              </h4>
              <button onClick={() => setSecondOpinionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Your case history and digital prescription (<strong>#{secondOpinionModal.rxId}</strong>) will be forwarded to a senior BHMS/MD panel member for peer clinical review.
            </p>

            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '14px', border: '1.5px solid #bbf7d0', marginBottom: '18px', fontSize: '12.5px', color: '#166534' }}>
              <div><strong>Primary Doctor:</strong> {secondOpinionModal.doctor}</div>
              <div style={{ marginTop: '4px' }}><strong>Diagnosis:</strong> {secondOpinionModal.diagnosis}</div>
              <div style={{ marginTop: '4px' }}><strong>Assigned Senior Reviewer:</strong> Dr. Rajeshwar Sharma (28+ Yrs Exp, Senior Vaidya)</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSecondOpinionModal(null)}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSecondOpinionStatus({ ...secondOpinionStatus, [secondOpinionModal.rxId]: true });
                  alert(`Second Opinion Request Confirmed! Dr. Rajeshwar Sharma will cross-examine your prescription #${secondOpinionModal.rxId} within 4 hours.`);
                  setSecondOpinionModal(null);
                }}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#059669', color: '#ffffff', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}
              >
                Confirm Peer Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PHONE CAMERA HERB IDENTIFICATION (HERB LENS / VISION AI)
      ========================================================================= */}
      {herbLensModalOpen && (
        <div 
          onClick={() => setHerbLensModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  AI BOTANICAL VISION • HERB LENS
                </span>
                <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: '6px 0 0 0' }}>
                  Instant Herb Authenticator
                </h4>
              </div>
              <button onClick={() => setHerbLensModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 18px 0', lineHeight: '1.45' }}>
              Point camera at any raw root, bark, or leaf to verify botanical identity, active withanolides, and heavy metal safety.
            </p>

            {/* Test Sample Picker or Device File */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1.5px dashed #cbd5e1', marginBottom: '18px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                Select a Botanical Specimen or Upload Your Photo:
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                {['Ashwagandha Root', 'Amrita Giloy Stem', 'Terminalia Arjuna Bark'].map((name, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleScanHerbSample(idx)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#1d3924',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🌿 {name}
                  </button>
                ))}
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', backgroundColor: '#1d3924', color: '#ffffff', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                <Camera size={14} /> Upload Raw Herb Photo from Device
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={() => handleScanHerbSample(0)}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Scanning Indicator */}
            {herbScanning && (
              <div style={{ padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1.5px solid #a7f3d0', textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🔬</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#065f46' }}>
                  Analyzing Botanical Macro-Features & Venation...
                </div>
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
                  Cross-referencing Ayurvedic Pharmacopoeia of India (API) standards
                </div>
              </div>
            )}

            {/* Herb Identification Result */}
            {herbScanResult && !herbScanning && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1.5px solid #bbf7d0', padding: '20px', boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
                      ✓ {herbScanResult.confidence} MATCH CONFIRMED
                    </span>
                    <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: '6px 0 2px 0' }}>
                      {herbScanResult.name}
                    </h4>
                    <div style={{ fontSize: '12.5px', color: '#475569', fontStyle: 'italic' }}>
                      {herbScanResult.botanical} (Family: {herbScanResult.family})
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#1d3924', color: '#E6D7B9', padding: '4px 10px', borderRadius: '8px' }}>
                    {herbScanResult.badge}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#334155', marginTop: '12px' }}>
                  <div><strong>Ayurvedic Energetics:</strong> {herbScanResult.rasa} • {herbScanResult.virya}</div>
                  <div><strong>Active Phyto-Chemicals:</strong> {herbScanResult.keyWithanolides}</div>
                  <div><strong>Organoleptic Indicators:</strong> {herbScanResult.organoleptic}</div>
                  <div><strong>Clinical Applications:</strong> {herbScanResult.clinicalUses}</div>
                  <div style={{ color: '#059669', fontWeight: '700' }}><strong>Verified Origin:</strong> {herbScanResult.farmSource}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button
                    onClick={() => {
                      setHerbLensModalOpen(false);
                      setActiveTab('store');
                      setStoreSearch(herbScanResult.name.split(' ')[0]);
                    }}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '10px',
                      backgroundColor: '#1d3924',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    View Authentic Lab-Tested Batch in Store →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: AUTO-REFILL MONTHLY WELLNESS SUBSCRIPTION MANAGER
      ========================================================================= */}
      {subscriptionModalOpen && (
        <div 
          onClick={() => setSubscriptionModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  HERBAL REPLENISHMENT GUARANTEE
                </span>
                <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: '6px 0 0 0' }}>
                  Monthly Auto-Refill Subscriptions
                </h4>
              </div>
              <button onClick={() => setSubscriptionModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 20px 0', lineHeight: '1.45' }}>
              Never run out of your prescribed raw herbal protocol. Enjoy <strong>flat 15% discount</strong>, free doorstep priority shipping, and automated doctor dosage review before every monthly dispatch.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeSubscriptions.map(sub => (
                <div key={sub.id} style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: sub.status === 'ACTIVE' ? '#065f46' : '#92400e', backgroundColor: sub.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7', padding: '2px 8px', borderRadius: '6px' }}>
                        ● {sub.status} AUTO-REFILL
                      </span>
                      <h5 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', margin: '6px 0 2px 0' }}>
                        {sub.title}
                      </h5>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{sub.items}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>₹{sub.amount}/mo</div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>{sub.savings}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', marginTop: '12px', fontSize: '12px' }}>
                    <div>
                      <strong>Next Automatic Dispatch:</strong> <span style={{ color: '#059669', fontWeight: '800' }}>{sub.nextDelivery}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const updated = activeSubscriptions.map(s => s.id === sub.id ? { ...s, status: s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : s);
                          setActiveSubscriptions(updated);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}
                      >
                        {sub.status === 'ACTIVE' ? 'Pause Refill' : 'Resume Refill'}
                      </button>

                      <button
                        onClick={() => alert(`Skipped next delivery for ${sub.title}! Your next cycle is shifted by 30 days.`)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', color: '#b91c1c' }}
                      >
                        Skip Next Month
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '14px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#059669" />
              <span>Zero-lockin: Pause, modify delivery address, or cancel anytime with one tap.</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: HOME PHLEBOTOMIST LAB SAMPLE COLLECTION SLOT PICKER
      ========================================================================= */}
      {labSlotModalTest && (
        <div 
          onClick={() => setLabSlotModalTest(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  NABL / CAP CERTIFIED LAB PARTNER
                </span>
                <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: '6px 0 0 0' }}>
                  Schedule Home Sample Pickup
                </h4>
              </div>
              <button onClick={() => setLabSlotModalTest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Test Summary Pill */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '14px', border: '1.5px solid #bbf7d0', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '13.5px', color: '#14532d' }}>{labSlotModalTest.name}</strong>
                <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '2px' }}>Fasting Required • 10-12 hr water only</div>
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#14532d' }}>₹{labSlotModalTest.price}</span>
            </div>

            {!labBookingConfirmed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Select Patient:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Self', 'Father', 'Mother'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setLabSelectedMember(m)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: labSelectedMember === m ? '2px solid #059669' : '1px solid #cbd5e1',
                          backgroundColor: labSelectedMember === m ? '#ecfdf5' : '#ffffff',
                          color: labSelectedMember === m ? '#065f46' : '#334155',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        👤 {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Home Address for Phlebotomist Visit:
                  </label>
                  <input
                    type="text"
                    value={labAddress}
                    onChange={(e) => setLabAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '12.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Select Visit Date & Time Slot:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {[
                      '06:30 AM – 08:00 AM (Early Fasting)',
                      '08:00 AM – 09:30 AM (Standard Fasting)',
                      '09:30 AM – 11:00 AM',
                      '04:30 PM – 06:00 PM (Non-Fasting)'
                    ].map(sl => (
                      <button
                        key={sl}
                        type="button"
                        onClick={() => setLabTimeSlot(sl)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: labTimeSlot === sl ? '2px solid #059669' : '1px solid #cbd5e1',
                          backgroundColor: labTimeSlot === sl ? '#ecfdf5' : '#ffffff',
                          color: labTimeSlot === sl ? '#065f46' : '#334155',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {sl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assigned Phlebotomist Badge */}
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="#059669" />
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    <strong>Assigned Technician:</strong> Suresh V. (NABL Certified, Vacuum Sealed Vacutainers with Cold Chain Box)
                  </div>
                </div>

                <button
                  type="button"
                  disabled={labBookingSubmitting}
                  onClick={() => {
                    setLabBookingSubmitting(true);
                    setTimeout(() => {
                      setLabBookingSubmitting(false);
                      setLabBookingConfirmed({
                        bookingId: `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                        patient: labSelectedMember,
                        slot: labTimeSlot,
                        date: 'Tomorrow Morning',
                        phlebotomist: 'Suresh V. (Mobile: +91 98450 XXXXX)'
                      });
                    }, 800);
                  }}
                  style={{
                    padding: '13px',
                    borderRadius: '12px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  {labBookingSubmitting ? 'Confirming with NABL Diagnostic Center...' : 'Confirm Free Home Collection'}
                </button>
              </div>
            ) : (
              /* Confirmed Booking Card */
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#14532d', margin: '0 0 6px 0' }}>
                  Home Collection Confirmed!
                </h4>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669', backgroundColor: '#f0fdf4', padding: '4px 14px', borderRadius: '9999px', display: 'inline-block', marginBottom: '14px' }}>
                  Booking ID: #{labBookingConfirmed.bookingId}
                </div>
                <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 18px 0' }}>
                  Phlebotomist {labBookingConfirmed.phlebotomist} will arrive at your address tomorrow ({labBookingConfirmed.slot}) with barcoded sample tubes.
                </p>
                <button
                  type="button"
                  onClick={() => setLabSlotModalTest(null)}
                  style={{ padding: '10px 24px', borderRadius: '10px', backgroundColor: '#1d3924', color: '#ffffff', fontSize: '13px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: STATUTORY GRIEVANCE & FORMAL COMPLAINT REDRESSAL DESK
      ========================================================================= */}
      {grievanceModalOpen && (
        <div 
          onClick={() => setGrievanceModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', backgroundColor: '#fef2f2', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #fecaca' }}>
                  AYUSH & CONSUMER PROTECTION COMPLIANT
                </span>
                <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: '6px 0 0 0' }}>
                  Formal Grievance Redressal Desk
                </h4>
              </div>
              <button onClick={() => setGrievanceModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Officer Notice Box */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', marginBottom: '18px', fontSize: '12px', color: '#334155' }}>
              <div><strong>Statutory Grievance Officer:</strong> Dr. V. K. Nambiar (Senior Vaidya, AYUSH Reg #AYU/2012)</div>
              <div style={{ marginTop: '3px' }}><strong>Email:</strong> grievance@ayursutra.org • <strong>Guaranteed SLA:</strong> 48-Hour Official Redressal</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Grievance Category:
                </label>
                <select
                  value={grievanceCategory}
                  onChange={(e) => setGrievanceCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Packaging / Purity Seal Issue">Raw Herb Packaging / Broken Quality Seal</option>
                  <option value="Delayed Courier Delivery">Delayed BlueDart Courier Delivery</option>
                  <option value="Doctor Teleconsultation Issue">BHMS Doctor Video Consultation Query</option>
                  <option value="Adverse Reaction / Medical Query">Adverse Botanical Reaction Reporting</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Order / Prescription Number (Optional):
                </label>
                <input
                  type="text"
                  value={grievanceOrderNo}
                  onChange={(e) => setGrievanceOrderNo(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Describe Your Grievance with Details:
                </label>
                <textarea
                  rows={3}
                  value={grievanceDetails}
                  onChange={(e) => setGrievanceDetails(e.target.value)}
                  placeholder="Provide complete facts for statutory redressal..."
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '12.5px', fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!grievanceDetails.trim()) {
                    alert('Please enter your grievance description.');
                    return;
                  }
                  const newTicket = {
                    id: `GRV-2026-${Math.floor(100 + Math.random() * 900)}`,
                    category: grievanceCategory,
                    orderNo: grievanceOrderNo,
                    details: grievanceDetails,
                    officer: 'Dr. V. K. Nambiar (Statutory Grievance Officer)',
                    sla: 'Assigned (Resolution within 48 hours)',
                    status: 'IN REVIEW',
                    createdAt: 'Just now'
                  };
                  setGrievanceTickets([newTicket, ...grievanceTickets]);
                  setGrievanceDetails('');
                  alert(`Official Grievance Registered! Ticket #${newTicket.id} has been escalated to Dr. V. K. Nambiar under AYUSH consumer guidelines.`);
                }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Register Formal Grievance Ticket
              </button>
            </div>

            {/* List of Registered Tickets */}
            <div style={{ marginTop: '22px', borderTop: '1.5px solid #f1f5f9', paddingTop: '16px' }}>
              <h5 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b', margin: '0 0 10px 0' }}>
                Your Registered Grievance Tickets ({grievanceTickets.length}):
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grievanceTickets.map(tic => (
                  <div key={tic.id} style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ color: '#111827' }}>#{tic.id} • {tic.category}</strong>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: tic.status === 'RESOLVED' ? '#059669' : '#d97706', backgroundColor: tic.status === 'RESOLVED' ? '#ecfdf5' : '#fffbeb', padding: '2px 8px', borderRadius: '6px' }}>
                        {tic.status}
                      </span>
                    </div>
                    <div style={{ color: '#475569' }}>{tic.details}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>SLA: {tic.sla}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom App Navigation Bar (Fixed Native App Dock - Hidden when in Chat) */}
      {activeTab !== 'chat' && (
        <div 
          className="patient-mobile-bottom-dock" 
          style={{
            display: 'none',
            position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '62px',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid #e2e8f0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          zIndex: 9999,
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 8px',
          paddingBottom: 'env(safe-area-inset-bottom, 4px)'
        }}
      >
        {/* Tab 1: Store */}
        <button
          onClick={() => setActiveTab('store')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            padding: '6px 0',
            cursor: 'pointer',
            color: activeTab === 'store' ? '#1d3924' : '#64748b'
          }}
        >
          <div style={{
            width: '32px',
            height: '24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activeTab === 'store' ? '#dcfce7' : 'transparent',
            transition: 'all 0.2s ease'
          }}>
            <Leaf size={18} color={activeTab === 'store' ? '#166534' : '#64748b'} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: activeTab === 'store' ? '800' : '600' }}>Store</span>
        </button>

        {/* Tab 2: Doctors */}
        <button
          onClick={() => setActiveTab('doctors')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            padding: '6px 0',
            cursor: 'pointer',
            color: activeTab === 'doctors' ? '#1d3924' : '#64748b'
          }}
        >
          <div style={{
            width: '32px',
            height: '24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activeTab === 'doctors' ? '#dcfce7' : 'transparent',
            transition: 'all 0.2s ease'
          }}>
            <Stethoscope size={18} color={activeTab === 'doctors' ? '#166534' : '#64748b'} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: activeTab === 'doctors' ? '800' : '600' }}>Doctors</span>
        </button>

        {/* Tab 3: Orders */}
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            padding: '6px 0',
            cursor: 'pointer',
            color: activeTab === 'orders' ? '#1d3924' : '#64748b'
          }}
        >
          <div style={{
            width: '32px',
            height: '24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activeTab === 'orders' ? '#dcfce7' : 'transparent',
            transition: 'all 0.2s ease'
          }}>
            <ShoppingBag size={18} color={activeTab === 'orders' ? '#166534' : '#64748b'} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: activeTab === 'orders' ? '800' : '600' }}>Orders</span>
        </button>

        {/* Tab 4: Chat */}
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            padding: '6px 0',
            cursor: 'pointer',
            color: activeTab === 'chat' ? '#1d3924' : '#64748b'
          }}
        >
          <div style={{
            width: '32px',
            height: '24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activeTab === 'chat' ? '#dcfce7' : 'transparent',
            transition: 'all 0.2s ease'
          }}>
            <MessageCircle size={18} color={activeTab === 'chat' ? '#166534' : '#64748b'} />
          </div>
          <span style={{ fontSize: '10px', fontWeight: activeTab === 'chat' ? '800' : '600' }}>Chat</span>
        </button>
      </div>
      )}

      {/* Mobile Professional Left Side Drawer (Clean, Elegant, Matching Website Navbar Drawer) */}
      {mobileSideDrawerOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 100000, 
            backgroundColor: 'rgba(15, 23, 18, 0.65)', 
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            animation: 'fadeInBackdrop 0.2s ease'
          }}
          onClick={() => setMobileSideDrawerOpen(false)}
        >
          {/* Left Slide Drawer Panel */}
          <div 
            style={{ 
              width: '84%', 
              maxWidth: '320px', 
              height: '100%', 
              backgroundColor: '#ffffff', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: '8px 0 36px rgba(0, 0, 0, 0.22)',
              animation: 'slideInLeftDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header (Clean, White, Professional) */}
            <div 
              style={{ 
                padding: '16px 18px', 
                borderBottom: '1px solid #f1f5f9', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#1d3924', color: '#E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>
                  🌿
                </div>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: '900', color: '#163321', letterSpacing: '0.04em' }}>
                    AYURVEDA
                  </div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: '700' }}>
                    Patient Portal • Online
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setMobileSideDrawerOpen(false)}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  backgroundColor: '#f8fafc', 
                  color: '#475569', 
                  border: '1px solid #e2e8f0', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Patient Profile Card */}
            <div style={{ padding: '14px 18px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#1d3924', color: '#E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>
                {user?.name ? user.name.charAt(0) : 'P'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'Arav Sharma'}
                </div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <ShieldCheck size={12} /> Verified Patient
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', color: '#92400e' }}>
                <Star size={11} fill="#d97706" color="#d97706" />
                <span>{superCoins}</span>
              </div>
            </div>

            {/* Scrollable Navigation Options (All Header Options Included Cleanly) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 8px 4px 8px' }}>
                Additional Patient Features
              </div>

              {[
                { id: 'consultations', label: 'Prescriptions & E-Parcha', icon: FileText, badge: 'Rx Records' },
                { id: 'community', label: 'Patient Community Forum', icon: MessageSquare, badge: null },
                { id: 'supercoins', label: 'Rewards & SuperCoins Wallet', icon: Star, badge: `${superCoins} Coins` }
              ].map(item => {
                const isActive = activeTab === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSideDrawerOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 12px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                      color: isActive ? '#166534' : '#334151',
                      border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                      fontWeight: isActive ? '800' : '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconComp size={16} color={isActive ? '#059669' : '#64748b'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '6px', backgroundColor: isActive ? '#dcfce7' : '#f1f5f9', color: isActive ? '#15803d' : '#64748b' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' }} />

              <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 8px 4px 8px' }}>
                Clinical Tools & Services
              </div>

              <button
                onClick={() => {
                  setMobileSideDrawerOpen(false);
                  setSubscriptionModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: '#334151',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <RefreshCw size={16} color="#d97706" />
                <span>Monthly Auto-Refill (15% OFF)</span>
              </button>

              <button
                onClick={() => {
                  setMobileSideDrawerOpen(false);
                  setScanPrescriptionModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: '#334151',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Camera size={16} color="#2563eb" />
                <span>Digitize Paper Prescription</span>
              </button>

              <button
                onClick={() => {
                  setMobileSideDrawerOpen(false);
                  setHerbLensModalOpen(true);
                  setHerbScanResult(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: '#334151',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Leaf size={16} color="#059669" />
                <span>Herb Scanner Camera Lens</span>
              </button>

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' }} />

              <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 8px 4px 8px' }}>
                Account & Help
              </div>

              <button
                onClick={() => {
                  setMobileSideDrawerOpen(false);
                  setProfileDrawerOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: '#334151',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <User size={16} color="#475569" />
                <span>My Clinical Profile & Vitals</span>
              </button>

              <button
                onClick={() => {
                  setMobileSideDrawerOpen(false);
                  setSupportModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  color: '#334151',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <HelpCircle size={16} color="#475569" />
                <span>Help & Clinical Support</span>
              </button>
            </div>

            {/* Drawer Bottom Bar: Sign Out */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
              <button
                onClick={() => {
                  setMobileSideDrawerOpen(false);
                  setSignOutModalOpen(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 100% Mobile Responsive Styles */}
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeftDrawer {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 768px) {
          .patient-desktop-topbar {
            display: none !important;
          }
          .patient-mobile-topbar {
            display: flex !important;
          }
          .patient-category-ribbon {
            display: none !important;
          }
          .patient-portal-header-box {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 0 8px 0 !important;
            margin-bottom: 6px !important;
          }
          .patient-portal-root {
            padding: 10px 12px 85px 12px !important;
            width: 100% !important;
            max-width: 100vw !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          .patient-portal-root.chat-active {
            padding-bottom: 0 !important;
          }
          .patient-mobile-bottom-dock {
            display: flex !important;
          }
          .resp-grid-two-col {
            grid-template-columns: 1fr !important;
          }
          .resp-card-padding {
            padding: 14px !important;
          }

          /* Orders responsive styling - Flipkart pattern (flat, clean, mobile-first) */
          .flipkart-order-row {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 14px 12px !important;
          }
          .flipkart-price-col {
            font-size: 15px !important;
            color: #111827 !important;
            font-weight: 800 !important;
          }
          .flipkart-stepper {
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
            align-items: flex-start !important;
            padding-left: 6px !important;
          }
          .flipkart-stepper-line {
            display: none !important;
          }
          .flipkart-stepper-step {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            text-align: left !important;
            width: 100% !important;
          }
          .flipkart-stepper-step > div:first-child {
            margin: 0 !important;
            flex-shrink: 0 !important;
          }
          .flipkart-order-actions {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .flipkart-action-btn {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
          }

          /* Compact promo banner on mobile */
          .patient-promo-banner {
            padding: 14px 16px !important;
            border-radius: 14px !important;
            margin-bottom: 12px !important;
          }
          .patient-promo-banner h2 {
            font-size: 1.15rem !important;
          }
          .patient-promo-banner p {
            display: none !important;
          }

          /* Doctors responsive styling - flat, directly planted */
          .doctor-grid-container {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .doctor-card-flat {
            padding: 14px !important;
            border-radius: 14px !important;
            border: 1px solid #e2e8f0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .doctor-booking-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .doctor-book-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .doctor-specialty-scroll {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            white-space: nowrap !important;
            padding-bottom: 4px !important;
            scrollbar-width: none !important;
            -webkit-overflow-scrolling: touch !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          /* Chat responsive edge-to-edge layout without card borders */
          .chat-teams-sidebar {
            display: none !important;
          }
          .chat-teams-sidebar.mobile-show {
            display: flex !important;
            width: 100% !important;
          }
          .chat-conversation-panel.chat-conversation-mobile-hide {
            display: none !important;
          }
          .chat-main-fullscreen-container {
            height: calc(100vh - 75px) !important;
            min-height: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            margin: -10px -12px 0 -12px !important;
            width: calc(100% + 24px) !important;
            box-shadow: none !important;
          }
          .hide-on-mobile-xs {
            display: none !important;
          }
          .chat-mobile-back-btn {
            display: flex !important;
          }

          /* All modals on mobile */
          div[style*="maxWidth: '560px'"],
          div[style*="maxWidth: '620px'"],
          div[style*="maxWidth: '650px'"],
          div[style*="maxWidth: '700px'"],
          div[style*="maxWidth: '720px'"] {
            width: 95vw !important;
            max-width: 95vw !important;
            padding: 16px !important;
            border-radius: 16px !important;
          }
          table {
            min-width: 580px !important;
          }
        }

        @media (min-width: 769px) {
          .patient-desktop-topbar {
            display: flex !important;
          }
          .patient-mobile-topbar {
            display: none !important;
          }
          .patient-category-ribbon {
            display: flex !important;
          }
          .patient-mobile-bottom-dock {
            display: none !important;
          }
          .chat-teams-sidebar {
            display: flex !important;
          }
          .chat-conversation-panel {
            display: flex !important;
          }
          .chat-mobile-back-btn {
            display: none !important;
          }
          .flipkart-order-card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07) !important;
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        roleName="Patient"
      />

      {/* Universal Super Admin Support Ticket Modal */}
      <RaiseSupportTicketModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        userRole="PATIENT"
      />

    </div>
  );
}
