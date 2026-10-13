import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, patientApi } from '../../services/api';
import Drawer from '../../components/Drawer';
import VideoConsultationModal from '../../components/VideoConsultationModal';
import SignOutConfirmModal from '../../components/SignOutConfirmModal';
import Pagination from '../../components/Pagination';
import RaiseSupportTicketModal from '../../components/RaiseSupportTicketModal';
import useModalBackButton from '../../hooks/useModalBackButton';
import { getSocket, joinUserRoom } from '../../services/socket';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  FilePlus, 
  Video, 
  Award, 
  Plus, 
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  Activity,
  Heart,
  ChevronRight,
  Pill,
  BookOpen,
  Menu,
  X,
  Search,
  DollarSign,
  TrendingUp,
  Filter,
  LogOut,
  Store,
  ExternalLink,
  ChevronDown,
  PhoneCall,
  MessageSquare,
  FileText,
  CreditCard,
  RefreshCw,
  LifeBuoy,
  Building,
  Landmark,
  Check,
  Lock,
  Settings,
  Bell
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Sign Out Modal State
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const handleConfirmSignOut = () => {
    setSignOutModalOpen(false);
    logout();
    navigate('/portal', { replace: true });
  };

  // Support Ticket Modal State
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Appointment Filter Tab State
  const [appointmentFilter, setAppointmentFilter] = useState('today'); // 'today', 'upcoming', 'past', 'all'

  // High-Performance Pagination States
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [patientsPage, setPatientsPage] = useState(1);
  const [prescriptionsPage, setPrescriptionsPage] = useState(1);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Chat Auto-Scroll Ref
  const messagesEndRef = useRef(null);

  // Doctor Clinical Profile & Bank Settlement State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    clinicAddress: '',
    bio: '',
    consultationFee: 499,
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    bankHolderName: '',
    upiId: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [doctorPrefs, setDoctorPrefs] = useState({
    smsAlerts: true,
    whatsappRx: true,
    autoConfirmFollowups: true
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await doctorApi.updateProfile(profileForm);
      setSuccessMsg(res.message || 'Doctor Profile & Bank Details updated successfully!');
      fetchDoctorData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };


  // Doctor Payout Settlement Request Modal State
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutBankName, setPayoutBankName] = useState('');
  const [payoutAccountNo, setPayoutAccountNo] = useState('');
  const [payoutIfsc, setPayoutIfsc] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const handleRequestDoctorPayout = async (e) => {
    e.preventDefault();
    setSubmittingPayout(true);
    try {
      const res = await doctorApi.requestSettlement({
        amount: payoutAmount,
        bankName: payoutBankName,
        bankAccountNo: payoutAccountNo,
        bankIfsc: payoutIfsc
      });
      alert(`✓ ${res.message}`);
      setPayoutModalOpen(false);
      fetchDoctorData();
    } catch (err) {
      alert(err.message || 'Payout request failed');
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Navigation & Drawer States
  const [activeNav, setActiveNav] = useState('appointments'); // 'appointments', 'patients', 'messages', 'prescriptions', 'earnings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Back button interception for doctor modal states
  useModalBackButton(payoutModalOpen, () => setPayoutModalOpen(false));
  useModalBackButton(mobileSidebarOpen, () => setMobileSidebarOpen(false));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [chatSearch, setChatSearch] = useState('');

  // Prescription Drawer States
  const [rxDrawerOpen, setRxDrawerOpen] = useState(false);
  const [patientHistoryDrawer, setPatientHistoryDrawer] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    herbs: [
      { herb: '', dosage: '', timing: '', duration: '' }
    ],
    dietaryAdvice: '',
    lifestyleGuidelines: '',
    followUpDays: ''
  });
  const [submittingRx, setSubmittingRx] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileSidebarOpen]);

  // Real Video Consultation Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoRoomData, setVideoRoomData] = useState({ roomId: '', patientName: '' });

  // Real In-App Chat Messages State
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [activeChatPatientId, setActiveChatPatientId] = useState(null);
  const [activeChatPatientName, setActiveChatPatientName] = useState('Patient');
  const activeChatPatientIdRef = useRef(null);
  activeChatPatientIdRef.current = activeChatPatientId;
  const [sendingReply, setSendingReply] = useState(false);
  const [mobileChatViewActive, setMobileChatViewActive] = useState(false);

  const fetchDoctorMessages = async () => {
    try {
      const res = await doctorApi.getMessages();
      if (res.success && res.messages) {
        setChatMessages(res.messages);
        // Only auto-select top patient if no patient has been selected yet
        if (!activeChatPatientIdRef.current) {
          const lastPatientMsg = [...res.messages].reverse().find(m => m.senderRole === 'PATIENT');
          if (lastPatientMsg) {
            activeChatPatientIdRef.current = lastPatientMsg.senderId;
            setActiveChatPatientId(lastPatientMsg.senderId);
            setActiveChatPatientName(lastPatientMsg.senderName || 'Patient');
          }
        }
      }
    } catch (e) {
      console.warn('Chat load note:', e);
    }
  };

  useEffect(() => {
    fetchDoctorMessages();
    const interval = setInterval(() => {
      fetchDoctorMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
    }
  };

  useEffect(() => {
    if (activeNav === 'messages') {
      scrollToBottom(false);
      const timer = setTimeout(() => scrollToBottom(true), 80);
      return () => clearTimeout(timer);
    }
  }, [activeNav, activeChatPatientId, chatMessages.length]);

  const handleSendDoctorReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const targetPatientId = activeChatPatientId || data?.consultations?.[0]?.patientId || 'patient-1';
    setSendingReply(true);
    try {
      await doctorApi.sendMessage({
        patientId: targetPatientId,
        message: replyText.trim()
      });
      setReplyText('');
      await fetchDoctorMessages();
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      alert(err.message || 'Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Derive list of unique patients for doctor chat
  const patientConversations = React.useMemo(() => {
    const map = new Map();
    // Pre-populate with all registered patients for this doctor
    (data?.patients || []).forEach(p => {
      if (p.id) {
        map.set(p.id, {
          id: p.id,
          name: p.name,
          lastMsg: p.lastSymptoms ? `Symptoms: ${p.lastSymptoms.slice(0, 45)}...` : 'Active Ayurvedic Clinical Care',
          time: p.lastConsultDate ? new Date(p.lastConsultDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'
        });
      }
    });

    (data?.consultations || []).forEach(c => {
      const pId = c.patientId || c.patient?.id;
      const pName = c.patient?.name || c.patient?.user?.name || 'Patient';
      if (pId) {
        const existing = map.get(pId);
        map.set(pId, {
          id: pId,
          name: pName,
          lastMsg: c.symptomsNote || existing?.lastMsg || 'Consultation registered',
          time: new Date(c.scheduledAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    chatMessages.forEach(m => {
      const isDoc = m.senderRole === 'DOCTOR' || m.senderId === user?.id;
      const otherId = isDoc ? m.receiverId : m.senderId;
      const otherName = (!isDoc && m.senderName) ? m.senderName : 'Patient';

      if (otherId) {
        const existing = map.get(otherId);
        map.set(otherId, {
          id: otherId,
          name: (!isDoc && m.senderName) ? m.senderName : (existing?.name || otherName),
          lastMsg: m.message,
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    return Array.from(map.values());
  }, [data?.patients, data?.consultations, chatMessages, user?.id]);

  const filteredPatientConversations = React.useMemo(() => {
    if (!chatSearch.trim()) return patientConversations;
    const q = chatSearch.toLowerCase();
    return patientConversations.filter(p => p.name.toLowerCase().includes(q) || (p.lastMsg && p.lastMsg.toLowerCase().includes(q)));
  }, [patientConversations, chatSearch]);

  const currentPatientMessages = React.useMemo(() => {
    if (!activeChatPatientId) return chatMessages;
    const filtered = chatMessages.filter(m => 
      m.senderId === activeChatPatientId || 
      m.receiverId === activeChatPatientId
    );
    return filtered.length > 0 ? filtered : chatMessages;
  }, [chatMessages, activeChatPatientId]);

  // Real Community Q&A State
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [submittingReplyId, setSubmittingReplyId] = useState(null);
  const [communityFilter, setCommunityFilter] = useState('all'); // 'all', 'unanswered', 'answered'

  const fetchCommunityPosts = async () => {
    setLoadingCommunity(true);
    try {
      const res = await patientApi.getCommunityPosts();
      if (res.success && res.posts) {
        setCommunityPosts(res.posts);
      }
    } catch (err) {
      console.warn('Community posts fetch note:', err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    fetchCommunityPosts();
  }, []);

  useEffect(() => {
    if (activeNav === 'community') {
      fetchCommunityPosts();
    }
  }, [activeNav]);

  const handleDoctorReplySubmit = async (postId) => {
    const text = replyDrafts[postId]?.trim();
    if (!text) {
      alert('Please enter your clinical advice or herbal recommendations first.');
      return;
    }
    setSubmittingReplyId(postId);
    try {
      const res = await doctorApi.replyCommunityPost(postId, text);
      if (res.success) {
        setReplyDrafts(prev => ({ ...prev, [postId]: '' }));
        await fetchCommunityPosts();
        setSuccessMsg('Your AYUSH-verified clinical recommendation has been published to the community forum!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit clinical reply');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const res = await doctorApi.getDashboardData();
      if (res.success) {
        setData(res);
        if (res.consultations && res.consultations.length > 0) {
          setSelectedConsultation(res.consultations[0]);
        }
        if (res.doctor) {
          const doc = res.doctor;
          const prof = doc.profile || {};
          setProfileForm({
            name: doc.name || '',
            phone: doc.phone || '',
            clinicAddress: prof.clinicAddress || '',
            bio: prof.bio || '',
            consultationFee: prof.consultationFee || 499,
            bankName: prof.bankName || '',
            bankAccountNo: prof.bankAccountNo || '',
            bankIfsc: prof.bankIfsc || '',
            bankHolderName: prof.bankHolderName || '',
            upiId: prof.upiId || ''
          });
          if (prof.bankName) setPayoutBankName(prof.bankName);
          if (prof.bankAccountNo) setPayoutAccountNo(prof.bankAccountNo);
          if (prof.bankIfsc) setPayoutIfsc(prof.bankIfsc);
          if (res.metrics?.pendingSettlement) {
            setPayoutAmount(String(res.metrics.pendingSettlement));
          }
        }
      }
    } catch (err) {
      console.error('Doctor data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleAddHerbRow = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      herbs: [...prev.herbs, { herb: '', dosage: '', timing: '', duration: '30 Days' }]
    }));
  };

  const handleQuickHerbChip = (herbName, defaultDosage) => {
    setPrescriptionForm(prev => ({
      ...prev,
      herbs: [...prev.herbs, { herb: herbName, dosage: defaultDosage, timing: 'With warm water after food', duration: '30 Days' }]
    }));
  };

  const handleRemoveHerbRow = (idx) => {
    setPrescriptionForm(prev => ({
      ...prev,
      herbs: prev.herbs.filter((_, i) => i !== idx)
    }));
  };

  const handleHerbChange = (idx, field, value) => {
    setPrescriptionForm(prev => {
      const updated = [...prev.herbs];
      updated[idx][field] = value;
      return { ...prev, herbs: updated };
    });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedConsultation) {
      alert('Please select an active consultation first');
      return;
    }
    setSubmittingRx(true);
    try {
      const payload = {
        consultationId: selectedConsultation.id,
        patientId: selectedConsultation.patientId,
        diagnosis: prescriptionForm.diagnosis,
        herbs: prescriptionForm.herbs,
        herbsPrescribed: prescriptionForm.herbs,
        dietaryAdvice: prescriptionForm.dietaryAdvice,
        lifestyleGuidelines: prescriptionForm.lifestyleGuidelines,
        followUpDays: Number(prescriptionForm.followUpDays)
      };

      const res = await doctorApi.createPrescription(payload);
      setSuccessMsg(`Digital E-Prescription issued successfully for ${selectedConsultation.patient?.user?.name || 'Patient'}!`);
      setRxDrawerOpen(false);
      await fetchDoctorData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingRx(false);
    }
  };

  const isApproved = user?.status === 'APPROVED';

  const navItems = [
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: Calendar
    },
    { 
      id: 'patients', 
      label: 'My Patients', 
      icon: User
    },
    { 
      id: 'messages', 
      label: 'Live Chat', 
      icon: MessageSquare
    },
    { 
      id: 'prescriptions', 
      label: 'Prescriptions (Rx Archive)', 
      icon: FilePlus
    },
    { 
      id: 'earnings', 
      label: 'Earnings & Settlements', 
      icon: DollarSign
    },
    { 
      id: 'profile', 
      label: 'Profile & Bank Details', 
      icon: Landmark
    },
    { 
      id: 'community', 
      label: 'Community Q&A', 
      icon: Award
    }
  ];

  const filteredConsultations = (data?.consultations || []).filter(c => {
    const name = c.patient?.name || c.patient?.user?.name || '';
    const chief = c.symptomsNote || c.chiefComplaint || '';
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || name.toLowerCase().includes(q) || chief.toLowerCase().includes(q);

    let matchesDate = true;
    const cDate = new Date(c.scheduledAt || c.slotTime || c.createdAt || Date.now());
    if (filterStartDate) {
      matchesDate = matchesDate && cDate >= new Date(filterStartDate);
    }
    if (filterEndDate) {
      matchesDate = matchesDate && cDate <= new Date(filterEndDate + 'T23:59:59');
    }

    let matchesTab = true;
    const todayStr = new Date().toDateString();
    const isToday = cDate.toDateString() === todayStr;
    const isUpcoming = cDate > new Date() && !isToday;
    const isPast = cDate < new Date() && !isToday;

    if (appointmentFilter === 'today') {
      matchesTab = isToday;
    } else if (appointmentFilter === 'upcoming') {
      matchesTab = isUpcoming;
    } else if (appointmentFilter === 'past') {
      matchesTab = isPast;
    }

    return matchesSearch && matchesDate && matchesTab;
  });

  const filteredPatientsList = React.useMemo(() => {
    const list = data?.patients || [];
    return list.filter(p => {
      const name = p.name || '';
      const email = p.email || '';
      const phone = p.phone || '';
      const cond = typeof p.patientProfile?.existingConditions === 'string'
        ? p.patientProfile.existingConditions
        : JSON.stringify(p.patientProfile?.existingConditions || []);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || phone.includes(q) || cond.toLowerCase().includes(q);

      let matchesDate = true;
      if (p.lastConsultDate && filterStartDate) {
        matchesDate = matchesDate && new Date(p.lastConsultDate) >= new Date(filterStartDate);
      }
      if (p.lastConsultDate && filterEndDate) {
        matchesDate = matchesDate && new Date(p.lastConsultDate) <= new Date(filterEndDate + 'T23:59:59');
      }
      return matchesSearch && matchesDate;
    });
  }, [data?.patients, searchQuery, filterStartDate, filterEndDate]);

  return (
    <div style={{ display: 'flex', height: '100vh', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', backgroundColor: '#f8faf7', position: 'relative', width: '100%' }}>

      {/* =========================================================================
          1. PROFESSIONAL LEFT NAVIGATION DRAWER (Persistent Collapsible Sidebar)
      ========================================================================= */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 18, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9998
          }}
        />
      )}

      <aside
        style={{
          width: sidebarCollapsed ? '82px' : '285px',
          backgroundColor: '#163321',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          overflow: 'hidden',
          zIndex: 9999,
          boxShadow: '4px 0 28px rgba(0,0,0,0.15)',
          transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0
        }}
        className={mobileSidebarOpen ? 'admin-drawer-open' : 'admin-sidebar-drawer'}
      >
        {/* Drawer Brand Header */}
        <div 
          style={{ 
            padding: sidebarCollapsed ? '22px 14px' : '22px 20px', 
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            gap: '12px'
          }}
        >
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(230, 215, 185, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E6D7B9', border: '1px solid rgba(230, 215, 185, 0.3)' }}>
                <Stethoscope size={22} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.06em', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  AYURVEDA
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Clinical Practice
                </span>
              </div>
            </div>
          ) : (
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(230, 215, 185, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E6D7B9' }}>
              <Stethoscope size={20} />
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Clinical Drawer' : 'Collapse Drawer'}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#d1fae5',
              cursor: 'pointer',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
          >
            <Menu size={17} />
          </button>
        </div>



        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: sidebarCollapsed ? '0 0 10px 0' : '0 10px 10px 10px', textAlign: sidebarCollapsed ? 'center' : 'left' }}>
            {!sidebarCollapsed ? 'Clinical Workspace' : '•••'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const isCurrent = activeNav === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    padding: sidebarCollapsed ? '13px' : '11px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isCurrent ? 'rgba(230, 215, 185, 0.16)' : 'transparent',
                    color: isCurrent ? '#ffffff' : '#c3d6c7',
                    fontWeight: isCurrent ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    position: 'relative',
                    textAlign: 'left',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ color: isCurrent ? '#E6D7B9' : '#88ab92', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <Icon size={19} />
                    </div>
                    {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Prescription Action Button */}
        {!sidebarCollapsed && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            <button
              disabled={!isApproved}
              onClick={() => {
                if (data?.consultations?.[0]) setSelectedConsultation(data.consultations[0]);
                setRxDrawerOpen(true);
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: isApproved ? '#2d5a37' : 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: isApproved ? '1px solid rgba(230, 215, 185, 0.4)' : 'none',
                fontSize: '12.5px',
                fontWeight: '800',
                cursor: isApproved ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isApproved ? '0 4px 14px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <FilePlus size={16} color="#E6D7B9" /> Write Digital Rx
            </button>
          </div>
        )}

        {/* Bottom Doctor Profile Card & Actions */}
        <div 
          style={{ 
            padding: sidebarCollapsed ? '16px 10px' : '16px 16px', 
            borderTop: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: 'rgba(0,0,0,0.22)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', minWidth: 0, justifyContent: sidebarCollapsed ? 'center' : 'flex-start', boxSizing: 'border-box' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2d5a37', border: '1.5px solid #E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', color: '#ffffff', flexShrink: 0 }}>
              {user?.name ? user.name.charAt(0) : 'D'}
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div 
                  title={data?.doctor?.name || user?.name || 'Dr. Ananya Sharma'}
                  style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block', maxWidth: '100%' }}
                >
                  {data?.doctor?.name || user?.name || 'Dr. Ananya Sharma'}
                </div>
                <div 
                  title={data?.doctor?.profile?.degree || 'BHMS, MD (Ayur)'}
                  style={{ fontSize: '11px', color: '#a7f3d0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block', maxWidth: '100%' }}
                >
                  {data?.doctor?.profile?.degree || 'BHMS, MD (Ayur)'}
                </div>
              </div>
            )}
          </div>

          {!sidebarCollapsed ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
              <Link 
                to="/" 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 10px', 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(255,255,255,0.08)', 
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff', 
                  fontSize: '11.5px', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Store size={13} /> Storefront
              </Link>
              <button
                onClick={() => setSignOutModalOpen(true)}
                title="Sign Out from Clinical Desk"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.18)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSignOutModalOpen(true)}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                margin: '0 auto',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN CLINICAL DESK CONTENT (Top Bar + Dynamic Dashboards)
      ========================================================================= */}
      <main style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Top Control Bar */}
        <header 
          className="doc-dashboard-header dashboard-app-header"
          style={{
            minHeight: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 900,
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div className="dashboard-header-title-box" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#374151',
                cursor: 'pointer',
                padding: '6px'
              }}
              className="admin-mobile-toggle"
            >
              <Menu size={22} />
            </button>

            <div style={{ minWidth: 0 }}>
              <h1 className="dashboard-header-title" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {activeNav === 'appointments' && 'Teleconsultation Appointments Queue'}
                {activeNav === 'patients' && 'Clinical Patient Case Sheets'}
                {activeNav === 'messages' && 'Patient Consultation Chat'}
                {activeNav === 'prescriptions' && 'E-Prescription (Rx) Archive'}
                {activeNav === 'earnings' && 'Consultation Earnings & Bank Settlements'}
                {activeNav === 'profile' && 'Doctor Profile & Bank Details'}
                {activeNav === 'community' && 'Community Health Q&A'}
              </h1>
              <div className="dashboard-header-sub" style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>AYUSH Reg: <strong>{data?.doctor?.profile?.registrationNumber || 'BHMS-2024-Verified'}</strong></span>
                <span>•</span>
                <span style={{ color: isApproved ? '#059669' : '#d97706', fontWeight: '700' }}>
                  ● {isApproved ? 'Tele-Health Active' : 'Verification Under Review'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={async () => {
                setRefreshing(true);
                await Promise.all([fetchDoctorData(), fetchDoctorMessages()]);
                setRefreshing(false);
              }}
              title="Sync with Live Database"
              className="dashboard-action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={14} className={refreshing || loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setSupportModalOpen(true)}
              className="dashboard-action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#163321',
                color: '#ffffff',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 51, 33, 0.2)'
              }}
            >
              <LifeBuoy size={14} />
              <span className="desktop-btn-text">Contact Super Admin</span>
              <span className="mobile-btn-text">Support</span>
            </button>

            <button
              onClick={() => setSignOutModalOpen(true)}
              className="dashboard-action-btn"
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="doc-dashboard-content" style={{ padding: activeNav === 'messages' ? '12px 18px 18px 18px' : '28px 32px 60px 32px' }}>

          {/* Success Banner */}
          {successMsg && (
            <div style={{ padding: '16px 22px', borderRadius: '14px', marginBottom: '24px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1.5px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.08)' }}>
              <CheckCircle2 size={20} color="#059669" /> {successMsg}
            </div>
          )}

          {/* Approval Notice if Pending */}
          {!isApproved && (
            <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fde68a', borderRadius: '18px', padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#92400e', margin: 0 }}>
                  BHMS Credential Audit In-Progress
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#b45309', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                  Your AYUSH registration (<strong>{data?.doctor?.profile?.registrationNumber || 'Enrolled'}</strong>) is being audited by Super Admin. You can view demo consultations below. Digital prescription signing will be authorized upon Super Admin approval.
                </p>
              </div>
            </div>
          )}

          {/* View 1: Teleconsultations Schedule & Overview Metrics (Shown ONLY on Homepage) */}
          {activeNav === 'appointments' && (
            <div>
              {/* Compact Professional Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                
                {/* Card 1: Today's Appointments */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clinical Queue</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>
                      {data?.consultations?.length || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>Scheduled & Past Visits</div>
                  </div>
                </div>

                {/* Card 2: Active Patients */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Patients</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>
                      {data?.patients?.length || (data?.consultations?.length ? new Set(data.consultations.map(c => c.patientId)).size : 6)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>Verified Case Files</div>
                  </div>
                </div>

                {/* Card 3: E-Prescriptions Signed */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FilePlus size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>E-Prescriptions</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>
                      {(data?.consultations || []).filter(c => c.prescription).length || 6}
                    </div>
                    <div style={{ fontSize: '11px', color: '#d97706', fontWeight: '600', marginTop: '2px' }}>AYUSH Traceable Rx</div>
                  </div>
                </div>

                {/* Card 4: Clinical Revenue */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Consultation Fees</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginTop: '2px' }}>
                      ₹{(data?.metrics?.grossFeeCollected || ((data?.consultations?.length || 6) * 499)).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginTop: '2px' }}>85% Clinician Payout Share</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                    {appointmentFilter === 'today' ? "Today's Appointments Queue" : appointmentFilter === 'upcoming' ? "Upcoming Appointments" : appointmentFilter === 'past' ? "Past Consultations Archive" : "All Consultations"} ({filteredConsultations.length})
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Showing current date teleconsultations by default. Switch filter tabs to view upcoming visits or history.
                  </p>
                </div>
              </div>

              {/* Quick Appointment Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {[
                  { id: 'today', label: `Today's Appointments (${(data?.consultations || []).filter(c => new Date(c.scheduledAt || c.slotTime || c.createdAt).toDateString() === new Date().toDateString()).length})` },
                  { id: 'upcoming', label: `Upcoming (${(data?.consultations || []).filter(c => new Date(c.scheduledAt || c.slotTime || c.createdAt) > new Date() && new Date(c.scheduledAt || c.slotTime || c.createdAt).toDateString() !== new Date().toDateString()).length})` },
                  { id: 'past', label: `Past Consultations (${(data?.consultations || []).filter(c => new Date(c.scheduledAt || c.slotTime || c.createdAt) < new Date() && new Date(c.scheduledAt || c.slotTime || c.createdAt).toDateString() !== new Date().toDateString()).length})` },
                  { id: 'all', label: `All Consultations (${(data?.consultations || []).length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setAppointmentFilter(tab.id); setAppointmentsPage(1); }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: appointmentFilter === tab.id ? '1px solid #163321' : '1px solid #cbd5e1',
                      backgroundColor: appointmentFilter === tab.id ? '#163321' : '#ffffff',
                      color: appointmentFilter === tab.id ? '#ffffff' : '#334155',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search & Date Filter Bar */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by patient name or complaint..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setAppointmentsPage(1); }}
                    style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#1e293b' }}
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setAppointmentsPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <Calendar size={14} />
                    <span>From:</span>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => { setFilterStartDate(e.target.value); setAppointmentsPage(1); }}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <span>To:</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => { setFilterEndDate(e.target.value); setAppointmentsPage(1); }}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  {(searchQuery || filterStartDate || filterEndDate) && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterStartDate(''); setFilterEndDate(''); setAppointmentsPage(1); }}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {filteredConsultations.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <Calendar size={40} color="#9ca3af" style={{ margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#374151' }}>
                    {appointmentFilter === 'today' ? 'No appointments scheduled for today' : 'No consultations found'}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '14px' }}>
                    {appointmentFilter === 'today' ? 'There are no patient sessions on your schedule for today.' : 'No patient appointments matching your current search query.'}
                  </p>
                  {appointmentFilter === 'today' && (
                    <button
                      onClick={() => setAppointmentFilter('all')}
                      style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#163321', color: '#ffffff', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      View All Consultations ({(data?.consultations || []).length})
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                  {filteredConsultations.slice((appointmentsPage - 1) * pageSize, appointmentsPage * pageSize).map((c) => {
                    const patient = c.patient;
                    const patientName = patient?.name || patient?.user?.name || 'Patient';
                    const patientProfile = patient?.patientProfile || patient?.profile || {};
                    const existingConds = patientProfile?.existingConditions ? (
                      typeof patientProfile.existingConditions === 'string' ? JSON.parse(patientProfile.existingConditions) : patientProfile.existingConditions
                    ) : ['General Ayurvedic Care'];
                    const symptoms = c.symptomsNote || c.chiefComplaint || 'Consultation follow-up review';
                    const isCompleted = c.status === 'COMPLETED';

                    return (
                      <div 
                        key={c.id} 
                        style={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '18px', 
                          padding: '24px', 
                          border: isCompleted ? '1.5px solid #e2e8f0' : '1.5px solid #a7f3d0', 
                          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          {/* Card Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                                {patientName.charAt(0)}
                              </div>
                              <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                                  {patientName}
                                </h4>
                                <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>
                                  Age {patientProfile?.age || 35} ({patientProfile?.gender || 'N/A'}) • Blood Group {patientProfile?.bloodGroup || 'B+'}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px', backgroundColor: c.mode === 'VIDEO' ? '#eff6ff' : '#f5f3ff', color: c.mode === 'VIDEO' ? '#2563eb' : '#7c3aed', border: c.mode === 'VIDEO' ? '1px solid #bfdbfe' : '1px solid #ddd6fe' }}>
                                {c.mode || 'VIDEO'} • {c.timeSlot || '11:00 AM'}
                              </span>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px', backgroundColor: isCompleted ? '#f1f5f9' : '#ecfdf5', color: isCompleted ? '#475569' : '#065f46', border: isCompleted ? '1px solid #cbd5e1' : '1px solid #a7f3d0' }}>
                                ● {c.status || 'CONFIRMED'}
                              </span>
                            </div>
                          </div>

                          {/* Chief Complaint */}
                          <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                              Reported Symptoms & Case Summary
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: 1.45 }}>
                              &ldquo;{symptoms}&rdquo;
                            </div>
                          </div>

                          {/* Chronic Conditions Badges */}
                          <div style={{ marginBottom: '18px' }}>
                            <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                              Pre-existing Dosha Tags & Medical History:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {existingConds.map((cond, i) => (
                                <span key={i} style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '9999px' }}>
                                  {cond}
                                </span>
                              ))}
                              {c.prescription && (
                                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '9999px' }}>
                                  ✓ Digital Rx Signed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            onClick={() => {
                              setVideoRoomData({
                                roomId: `ayurveda-room-${(c.id || 'visit').slice(0, 8)}`,
                                patientName: patientName
                              });
                              setVideoModalOpen(true);
                            }}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              padding: '9px 12px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Video size={14} /> Join Video
                          </button>

                          <button
                            disabled={!isApproved}
                            onClick={() => {
                              setSelectedConsultation(c);
                              setRxDrawerOpen(true);
                            }}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              backgroundColor: isApproved ? '#1d3924' : '#9ca3af',
                              color: '#ffffff',
                              padding: '9px 12px',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: isApproved ? 'pointer' : 'not-allowed'
                            }}
                          >
                            <FilePlus size={14} /> Write Rx
                          </button>

                          <button
                            onClick={() => {
                              setActiveChatPatientId(c.patientId || patient?.id);
                              setActiveChatPatientName(patientName);
                              setActiveNav('messages');
                            }}
                            title="Open Direct Patient Chat"
                            style={{
                              padding: '9px 12px',
                              borderRadius: '10px',
                              border: '1px solid #a7f3d0',
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MessageSquare size={13} /> Chat
                          </button>

                          <button
                            onClick={() => setPatientHistoryDrawer(c)}
                            title="Inspect Patient Health History"
                            style={{
                              padding: '9px 12px',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            History
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Pagination
                currentPage={appointmentsPage}
                totalPages={Math.ceil(filteredConsultations.length / pageSize) || 1}
                totalItems={filteredConsultations.length}
                pageSize={pageSize}
                onPageChange={setAppointmentsPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}

          {/* View 2: Patient Health Directory */}
          {activeNav === 'patients' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                  Patient Clinical Records & Medical Histories
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Access deep patient case history forms, existing medications, known allergies, and dietary lifestyle patterns.
                </p>
              </div>

              {/* Patient Search & Date Filter Bar */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search patients by name, condition, or medication..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#1e293b' }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <Calendar size={14} />
                    <span>From:</span>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <span>To:</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  {(searchQuery || filterStartDate || filterEndDate) && (
                    <button
                      onClick={() => { setSearchQuery(''); setFilterStartDate(''); setFilterEndDate(''); }}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #e5e7eb' }}>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>Patient Name</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>Age & Blood</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>Chronic Conditions</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>Current Medications</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>Dietary Style</th>
                        <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatientsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8', fontSize: '13px' }}>
                            No patients found matching your search or filters.
                          </td>
                        </tr>
                      ) : (
                        filteredPatientsList.slice((patientsPage - 1) * pageSize, patientsPage * pageSize).map((p) => {
                          const prof = p.patientProfile || p.profile || {};
                          const conditions = prof.existingConditions ? (
                            typeof prof.existingConditions === 'string' ? JSON.parse(prof.existingConditions) : prof.existingConditions
                          ) : ['Active Patient'];

                          return (
                            <tr 
                              key={p.id} 
                              onClick={() => setPatientHistoryDrawer(p)}
                              title="Click to view full patient clinical records & prescription history"
                              style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e0e7ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                                    {p.name ? p.name.charAt(0) : 'P'}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '800', color: '#111827', fontSize: '13.5px' }}>{p.name}</div>
                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{p.email} • {p.phone || '+91 98112 34567'}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '12.5px', color: '#374151' }}>
                                Age {prof.age || 35} ({prof.gender || 'M'}) • <strong>{prof.bloodGroup || 'B+'}</strong>
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {conditions.map((cond, i) => (
                                    <span key={i} style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '9999px' }}>
                                      {cond}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '12px', color: '#4b5563' }}>
                                {prof.currentMedications || 'Herbal Supplements'}
                              </td>
                              <td style={{ padding: '16px 20px', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                                {prof.dietType || 'Sattvic Vegetarian'}
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPatientHistoryDrawer(p);
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: '1px solid #1d3924',
                                      backgroundColor: '#1d3924',
                                      color: '#ffffff',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Case Sheet
                                  </button>
                                  <button
                                    disabled={!isApproved}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const existing = (data?.consultations || []).find(c => c.patientId === p.id || c.patient?.id === p.id);
                                      if (existing) {
                                        setSelectedConsultation(existing);
                                      } else {
                                        setSelectedConsultation({
                                          id: `consult-${p.id}`,
                                          patientId: p.id,
                                          patient: p,
                                          symptomsNote: p.lastSymptoms || 'Direct Clinical Consultation'
                                        });
                                      }
                                      setRxDrawerOpen(true);
                                    }}
                                    title="Write Personal Prescription for this Patient"
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      border: '1px solid #fed7aa',
                                      backgroundColor: '#fff7ed',
                                      color: '#c2410c',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      cursor: isApproved ? 'pointer' : 'not-allowed'
                                    }}
                                  >
                                    Write Rx
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveChatPatientId(p.id);
                                      setActiveChatPatientName(p.name);
                                      setActiveNav('messages');
                                    }}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      border: '1px solid #a7f3d0',
                                      backgroundColor: '#ecfdf5',
                                      color: '#065f46',
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Chat
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={patientsPage}
                  totalPages={Math.ceil(filteredPatientsList.length / pageSize) || 1}
                  totalItems={filteredPatientsList.length}
                  pageSize={pageSize}
                  onPageChange={setPatientsPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* View 3: Digital E-Prescriptions Archive */}
          {activeNav === 'prescriptions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                    Official AYUSH E-Prescription Archive ({(data?.consultations || []).filter(c => c.prescription).length})
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Each digital prescription is strictly personal to that patient consultation, signed with your AYUSH registration credentials.
                  </p>
                </div>
                <button
                  disabled={!isApproved}
                  onClick={() => {
                    if (data?.consultations?.[0]) setSelectedConsultation(data.consultations[0]);
                    setRxDrawerOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: isApproved ? 'pointer' : 'not-allowed'
                  }}
                >
                  <FilePlus size={16} /> + Issue New Patient Rx
                </button>
              </div>

              {/* Rx Compliance Explanatory Alert */}
              <div style={{ backgroundColor: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <ShieldCheck size={26} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#065f46', margin: 0 }}>
                    How E-Prescriptions Work in Telemedicine
                  </h4>
                  <p style={{ fontSize: '12px', color: '#047857', margin: '3px 0 0 0', lineHeight: 1.5 }}>
                    Every prescription issued here is private and tied directly to the selected patient’s medical chart. Patients receive instant alerts in their patient portal, can download their authenticated AYUSH-stamped PDF, and can order the exact medicinal herbs and churnas directly from verified farms.
                  </p>
                </div>
              </div>

              {/* Search bar for prescriptions */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search prescriptions by patient name, diagnosis, or herb..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPrescriptionsPage(1); }}
                  style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#1e293b' }}
                />
              </div>

              {/* Prescription Cards Grid */}
              {(() => {
                const allRx = (data?.consultations || [])
                  .filter(c => {
                    if (!c.prescription) return false;
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    const pName = (c.patient?.name || c.patient?.user?.name || '').toLowerCase();
                    const diag = (c.prescription.diagnosis || '').toLowerCase();
                    return pName.includes(q) || diag.includes(q);
                  })
                  .sort((a, b) => {
                    const timeA = new Date(a.prescription?.createdAt || a.prescription?.updatedAt || a.createdAt || 0).getTime();
                    const timeB = new Date(b.prescription?.createdAt || b.prescription?.updatedAt || b.createdAt || 0).getTime();
                    return timeB - timeA;
                  });

                const paginatedRx = allRx.slice((prescriptionsPage - 1) * pageSize, prescriptionsPage * pageSize);

                if (allRx.length === 0) {
                  return (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                      <FilePlus size={40} color="#9ca3af" style={{ margin: '0 auto 12px auto' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#374151' }}>No Prescriptions Found</h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>You have not issued any digital prescriptions matching this search.</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                      {paginatedRx.map((c, idx) => {
                        const pName = c.patient?.name || c.patient?.user?.name || 'Patient';
                        const rx = c.prescription;
                        const herbsList = rx.herbsPrescribed ? (
                          typeof rx.herbsPrescribed === 'string' ? JSON.parse(rx.herbsPrescribed) : rx.herbsPrescribed
                        ) : [];

                        return (
                          <div key={rx.id || idx} style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '24px', border: '1.5px solid #d1fae5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
                                      Prescription #RX-{(rx.id || '2026').slice(-6).toUpperCase()}
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                      <Calendar size={11} color="#059669" />
                                      {new Date(rx.createdAt || c.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111827', margin: '3px 0 0 0' }}>Patient: {pName}</h4>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                                  ● ACTIVE REGIMEN
                                </span>
                              </div>

                              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '12px', marginBottom: '14px', border: '1px solid #bbf7d0' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Diagnosis & Ayurvedic Line of Treatment</div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#14532d', marginTop: '2px' }}>
                                  {rx.diagnosis}
                                </div>
                              </div>

                              <div style={{ marginBottom: '14px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                                  Prescribed Farm-Traceable Herbs ({herbsList.length}):
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {herbsList.map((h, i) => (
                                    <div key={i} style={{ padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                      <span style={{ fontWeight: '700', color: '#1f2937' }}>🌿 {h.herb}</span>
                                      <span style={{ color: '#059669', fontWeight: '700' }}>{h.dosage} • {h.timing || 'Daily'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {rx.dietaryAdvice && (
                                <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '10px', lineHeight: 1.4, backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px' }}>
                                  <strong style={{ color: '#166534' }}>Diet:</strong> {rx.dietaryAdvice}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280' }}>
                              <span>Follow-up: <strong>{rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString('en-IN') : '14 Days'}</strong></span>
                              <button
                                onClick={() => alert(`Official AYUSH digital signed PDF prescription issued by ${data?.doctor?.name || user?.name} for patient ${pName}. Downloading...`)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb',
                                  backgroundColor: '#ffffff',
                                  color: '#1d3924',
                                  fontWeight: '700',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Download Signed PDF
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Pagination
                      currentPage={prescriptionsPage}
                      totalPages={Math.ceil(allRx.length / pageSize) || 1}
                      totalItems={allRx.length}
                      pageSize={pageSize}
                      onPageChange={setPrescriptionsPage}
                      onPageSizeChange={setPageSize}
                    />
                  </>
                );
              })()}
            </div>
          )}

          {/* View 4: Clinical Fees, Earnings & Bank Settlements */}
          {activeNav === 'earnings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                    Consultation Fees & Bank Payout Settlements
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Transparent direct bank disbursements for completed tele-health consultations. Settled via NEFT/RTGS.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveNav('profile')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '9px 14px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Landmark size={15} /> Update Bank Details
                  </button>
                  <button
                    onClick={() => setPayoutModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#163321',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 18px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(22, 51, 33, 0.25)'
                    }}
                  >
                    <CreditCard size={15} /> Request Settlement
                  </button>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Gross Consultation Fees</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                    ₹{(data?.metrics?.grossFeeCollected || ((data?.consultations?.length || 6) * 499)).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
                    Fee: ₹{data?.doctor?.profile?.consultationFee || 499} per consultation
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Platform Share (15%)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#64748b', marginTop: '4px' }}>
                    ₹{(data?.metrics?.platformDeduction || Math.round(((data?.consultations?.length || 6) * 499) * 0.15)).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>Tele-health infrastructure & security</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Net Clinician Earnings (85%)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>
                    ₹{(data?.metrics?.doctorNetEarnings || Math.round(((data?.consultations?.length || 6) * 499) * 0.85)).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700', marginTop: '4px' }}>Your total clinical entitlement</div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '18px', border: '1.5px solid #86efac', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.05)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>Available for Payout</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#15803d', marginTop: '4px' }}>
                    ₹{(data?.metrics?.pendingSettlement ?? Math.round(((data?.consultations?.length || 6) * 499) * 0.85)).toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={() => setPayoutModalOpen(true)}
                    style={{ marginTop: '8px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#15803d', color: '#ffffff', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Withdraw to Bank →
                  </button>
                </div>
              </div>

              {/* Registered Bank Account Banner */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Landmark size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Registered Settlement Bank Account</div>
                    <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {data?.doctor?.profile?.bankName || 'HDFC Bank Ltd'} • {data?.doctor?.profile?.bankAccountNo || 'XXXX-XXXX-4512'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      IFSC: <strong>{data?.doctor?.profile?.bankIfsc || 'HDFC0001092'}</strong> • Holder: {data?.doctor?.profile?.bankHolderName || data?.doctor?.name || user?.name} • UPI: {data?.doctor?.profile?.upiId || 'doctor@upi'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveNav('profile')}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Edit Bank Info
                </button>
              </div>

              {/* Payout Settlements History Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Settlement Requests & Disbursal Ledger
                  </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px' }}>Request Date</th>
                        <th style={{ padding: '12px 16px' }}>Amount</th>
                        <th style={{ padding: '12px 16px' }}>Bank Account</th>
                        <th style={{ padding: '12px 16px' }}>UTR / Reference</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Settled Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.payouts || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            No past settlement requests. Click &ldquo;Request Settlement&rdquo; to initiate your first transfer.
                          </td>
                        </tr>
                      ) : (
                        (data.payouts || []).slice((payoutsPage - 1) * pageSize, payoutsPage * pageSize).map((p) => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>
                              {new Date(p.requestedAt || p.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                              ₹{p.amount.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#334155' }}>
                              {p.bankName} ({p.bankAccountNo})
                            </td>
                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#475569' }}>
                              {p.transactionRef || 'Pending NEFT UTR'}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                backgroundColor: p.status === 'SETTLED' ? '#ecfdf5' : '#fffbeb',
                                color: p.status === 'SETTLED' ? '#065f46' : '#92400e'
                              }}>
                                ● {p.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>
                              {p.settledAt ? new Date(p.settledAt).toLocaleDateString('en-IN') : 'In Processing'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={payoutsPage}
                  totalPages={Math.ceil((data?.payouts || []).length / pageSize) || 1}
                  totalItems={(data?.payouts || []).length}
                  pageSize={pageSize}
                  onPageChange={setPayoutsPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* View 5: PHONE-SETTINGS STYLE DOCTOR PROFILE & CLINICAL SETTINGS */}
          {activeNav === 'profile' && (
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              {/* Phone Settings: User Identity Card */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #e2e8f0',
                padding: '24px 28px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    backgroundColor: '#163321',
                    color: '#E6D7B9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: '900',
                    boxShadow: '0 4px 14px rgba(22, 51, 33, 0.25)',
                    border: '1.5px solid #2d5a37'
                  }}>
                    <Stethoscope size={32} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                        {profileForm.name || data?.doctor?.name || user?.name || 'Dr. Ananya Sharma'}
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 9px', borderRadius: '9999px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> AYUSH Verified
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                      {data?.doctor?.profile?.degree || 'BAMS, MD (Ayurveda)'} • {data?.doctor?.profile?.councilName || 'National Commission for Indian System of Medicine (NCISM)'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#166534', backgroundColor: '#f0fdf4', padding: '6px 14px', borderRadius: '12px', border: '1px solid #bbf7d0', fontWeight: '700' }}>
                  <Award size={14} />
                  <span>Licensed Clinical Practitioner</span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* SETTINGS GROUP 1: STATUTORY MEDICAL LICENSURE (IMMUTABLE / LOCKED) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Lock size={15} color="#15803d" />
                      <span>Statutory Medical Licensure (Locked & Audited)</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🔒 Audited by AYUSH Board
                    </span>
                  </div>

                  <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          AYUSH Central Registration Number
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                            {data?.doctor?.profile?.registrationNumber || 'BAMS-AYUSH-2024-Verified'}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                            ✓ Verified
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          Medical Degree & Qualification
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                            {data?.doctor?.profile?.degree || 'BAMS / MD (Ayurveda)'}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                            ✓ Confirmed
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          State / National Medical Council
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                            {data?.doctor?.profile?.councilName || 'National Commission for Indian System of Medicine (NCISM)'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          Council Registration Year & Clinical Tenure
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                            Reg: {data?.doctor?.profile?.registrationYear || 2018} • {data?.doctor?.profile?.experienceYears || 8} Yrs Practice
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      Statutory medical credentials are non-editable post-verification in accordance with Central Council of Indian Medicine (CCIM) and AYUSH Telemedicine Practice Guidelines. To amend degrees or registrations, submit an official review to Super Admin.
                    </p>
                  </div>
                </div>

                {/* SETTINGS GROUP 2: CLINICAL PRACTICE & CONTACT (EDITABLE) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={16} color="#059669" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Clinical Practice & Contact Information (Editable)
                    </span>
                  </div>

                  <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Doctor Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Contact Phone / Mobile *</label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Tele-Health Video Fee (₹) *</label>
                      <input
                        type="number"
                        min="99"
                        max="5000"
                        required
                        value={profileForm.consultationFee}
                        onChange={(e) => setProfileForm({ ...profileForm, consultationFee: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Physical Clinic / Hospital Address *</label>
                      <input
                        type="text"
                        placeholder="Clinic name, road/locality, city, state and PIN..."
                        value={profileForm.clinicAddress}
                        onChange={(e) => setProfileForm({ ...profileForm, clinicAddress: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Professional Bio & Clinical Specialties</label>
                      <textarea
                        rows={3}
                        placeholder="Detail your Ayurvedic clinical background, Panchakarma expertise, metabolic lifestyle management, and patient care approach..."
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SETTINGS GROUP 3: TREASURY SETTLEMENT BANK ACCOUNT (EDITABLE) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #93c5fd', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Landmark size={16} />
                      <span>Direct Payout & Clinical Settlement Bank Account</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '700' }}>
                      Weekly Automated Disbursal
                    </span>
                  </div>

                  <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
                        value={profileForm.bankName}
                        onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Bank Account Number</label>
                      <input
                        type="text"
                        placeholder="11-16 digit account number"
                        value={profileForm.bankAccountNo}
                        onChange={(e) => setProfileForm({ ...profileForm, bankAccountNo: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001092"
                        value={profileForm.bankIfsc}
                        onChange={(e) => setProfileForm({ ...profileForm, bankIfsc: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="Name on bank passbook"
                        value={profileForm.bankHolderName}
                        onChange={(e) => setProfileForm({ ...profileForm, bankHolderName: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>UPI ID (Instant Transfer)</label>
                      <input
                        type="text"
                        placeholder="e.g. doctor@okhdfcbank"
                        value={profileForm.upiId}
                        onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SETTINGS GROUP 4: PHONE-STYLE NOTIFICATION & PRACTICE PREFERENCES */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} color="#d97706" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Practice Alerts & Notification Preferences
                    </span>
                  </div>

                  <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    
                    {/* Toggle Row 1 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                          Instant SMS Video Consult Booking Alert
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Receive SMS notification immediately when a patient schedules a tele-consult
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDoctorPrefs(p => ({ ...p, smsAlerts: !p.smsAlerts }))}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '9999px',
                          backgroundColor: doctorPrefs.smsAlerts ? '#15803d' : '#cbd5e1',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          left: doctorPrefs.smsAlerts ? '22px' : '2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>

                    {/* Toggle Row 2 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                          WhatsApp Prescription Dispatch & Follow-up
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Automatically send digital PDF copy to patient's verified WhatsApp
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDoctorPrefs(p => ({ ...p, whatsappRx: !p.whatsappRx }))}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '9999px',
                          backgroundColor: doctorPrefs.whatsappRx ? '#15803d' : '#cbd5e1',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          left: doctorPrefs.whatsappRx ? '22px' : '2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>

                    {/* Toggle Row 3 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                          Auto-Confirm Follow-Up Consultations
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Permit verified chronic-care patients to book follow-up without manual review
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDoctorPrefs(p => ({ ...p, autoConfirmFollowups: !p.autoConfirmFollowups }))}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '9999px',
                          backgroundColor: doctorPrefs.autoConfirmFollowups ? '#15803d' : '#cbd5e1',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          left: doctorPrefs.autoConfirmFollowups ? '22px' : '2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#163321',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(22, 51, 33, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Check size={18} />
                    <span>{savingProfile ? 'Saving Clinical Settings...' : 'Save Clinical Profile & Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* View 5: Community Q&A Clinical Portal */}
          {activeNav === 'community' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '800', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                      AYUSH Telemedicine Portal
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#065f46', padding: '3px 10px', borderRadius: '9999px' }}>
                      Live Community Sync
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#111827', margin: '8px 0 4px 0' }}>
                    Patient Community Queries & Clinical Answers
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                    Provide verified medical recommendations on patient questions. Your replies will appear with your verified doctor badge on the patient forum.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#ffffff', padding: '4px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  {[
                    { id: 'all', label: `All (${communityPosts.length})` },
                    { id: 'unanswered', label: `Needs Doctor Reply (${communityPosts.filter(p => !p.doctorVerifiedReply).length})` },
                    { id: 'answered', label: `Answered (${communityPosts.filter(p => p.doctorVerifiedReply).length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCommunityFilter(tab.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: communityFilter === tab.id ? '#1d3924' : 'transparent',
                        color: communityFilter === tab.id ? '#ffffff' : '#4b5563',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingCommunity ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
                  <Activity className="animate-spin" size={32} style={{ margin: '0 auto 12px auto', color: '#1d3924' }} />
                  <p style={{ fontWeight: '600' }}>Loading patient questions from the database...</p>
                </div>
              ) : communityPosts.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '50px 24px', textAlign: 'center', border: '1.5px solid #e5e7eb' }}>
                  <MessageSquare size={44} color="#9ca3af" style={{ margin: '0 auto 14px auto' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1f2937' }}>No community questions yet</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Patients will post health questions here. Check back soon!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {communityPosts
                    .filter(post => {
                      if (communityFilter === 'unanswered') return !post.doctorVerifiedReply;
                      if (communityFilter === 'answered') return !!post.doctorVerifiedReply;
                      return true;
                    })
                    .map(post => {
                      const hasReply = !!post.doctorVerifiedReply;
                      const replyDraft = replyDrafts[post.id] || '';

                      return (
                        <div 
                          key={post.id}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '18px',
                            border: hasReply ? '1.5px solid #a7f3d0' : '1.5px solid #fed7aa',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                          }}
                        >
                          {/* Post Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#f3f4f6', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px' }}>
                                {post.authorName ? post.authorName.charAt(0) : 'P'}
                              </div>
                              <div>
                                <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#111827' }}>
                                  {post.authorName || 'Community Patient'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                  Category: <strong style={{ color: '#1d3924' }}>{post.category || 'General Health'}</strong> • {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: '800',
                              padding: '4px 12px',
                              borderRadius: '9999px',
                              backgroundColor: hasReply ? '#ecfdf5' : '#fff7ed',
                              color: hasReply ? '#065f46' : '#c2410c',
                              border: hasReply ? '1px solid #a7f3d0' : '1px solid #fed7aa',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              {hasReply ? <><ShieldCheck size={14} /> Verified Doctor Answered</> : <><Clock size={14} /> Awaiting Doctor Advice</>}
                            </span>
                          </div>

                          {/* Post Content */}
                          <div style={{ fontSize: '14.5px', lineHeight: '1.6', color: '#374151', backgroundColor: '#f9fafb', padding: '14px 18px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                            {post.content}
                          </div>

                          {/* Existing Doctor Answer */}
                          {hasReply && (
                            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '16px 20px', border: '1.5px solid #86efac' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <ShieldCheck size={18} color="#059669" />
                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#065f46' }}>
                                  AYUSH Clinical Recommendation by {post.doctorName || user?.name || 'Dr. Ananya Sharma (BHMS)'}
                                </span>
                              </div>
                              <p style={{ fontSize: '13.5px', color: '#14532d', margin: 0, lineHeight: '1.55', whiteSpace: 'pre-line' }}>
                                {post.doctorVerifiedReply}
                              </p>
                            </div>
                          )}

                          {/* Reply Box / Update Answer */}
                          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                              {hasReply ? 'Update or Append Clinical Guidance:' : 'Write Verified Doctor Recommendation:'}
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Prescribe dietary adjustments, specific herbal churnas (e.g. Giloy, Ashwagandha), or clinical cautions..."
                              value={replyDraft}
                              onChange={(e) => setReplyDrafts({ ...replyDrafts, [post.id]: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: '1.5px solid #d1d5db',
                                fontSize: '13.5px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                              <button
                                disabled={submittingReplyId === post.id}
                                onClick={() => handleDoctorReplySubmit(post.id)}
                                style={{
                                  backgroundColor: '#1d3924',
                                  color: '#ffffff',
                                  padding: '9px 20px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  fontSize: '13px',
                                  fontWeight: '800',
                                  cursor: submittingReplyId === post.id ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  boxShadow: '0 2px 8px rgba(29, 57, 36, 0.2)'
                                }}
                              >
                                <Send size={14} />
                                {submittingReplyId === post.id ? 'Publishing...' : hasReply ? 'Update Clinical Reply' : 'Publish Verified Clinical Reply'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* View 6: Patient Direct Clinical Chat & Follow-ups */}
          {activeNav === 'messages' && (
            <div style={{ height: 'calc(100vh - 110px)', minHeight: '580px', display: 'flex', flexDirection: 'column' }}>
              <div 
                className={`doc-chat-grid ${mobileChatViewActive ? 'mobile-chat-thread-active' : 'mobile-chat-list-active'}`}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '280px 1fr', 
                  gap: 0, 
                  backgroundColor: '#ffffff', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  overflow: 'hidden', 
                  flex: 1,
                  height: '100%',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {/* Patient Conversations Left Sidebar */}
                <div className="doc-chat-sidebar" style={{ borderRight: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Patients ({filteredPatientConversations.length})
                      </div>
                      <button
                        onClick={fetchDoctorMessages}
                        title="Sync patient messages"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
                        <span>Sync</span>
                      </button>
                    </div>
                    {/* Patient Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '8px' }}>
                      <Search size={13} color="#94a3b8" />
                      <input
                        type="text"
                        placeholder="Search patient..."
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%', color: '#1e293b' }}
                      />
                      {chatSearch && (
                        <button onClick={() => setChatSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {filteredPatientConversations.length === 0 ? (
                      <div style={{ padding: '24px 14px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                        No patients found
                      </div>
                    ) : (
                      filteredPatientConversations.map((p) => {
                        const isSelected = activeChatPatientId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              activeChatPatientIdRef.current = p.id;
                              setActiveChatPatientId(p.id);
                              setActiveChatPatientName(p.name);
                              setMobileChatViewActive(true);
                              setTimeout(() => scrollToBottom(true), 60);
                            }}
                            style={{
                              padding: '12px 14px',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#ecfdf5' : 'transparent',
                              borderLeft: isSelected ? '3px solid #059669' : '3px solid transparent',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: isSelected ? '800' : '700', color: isSelected ? '#065f46' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.name}
                              </span>
                              <span style={{ fontSize: '10.5px', color: '#94a3b8', flexShrink: 0 }}>{p.time}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.lastMsg}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Chat Thread Panel */}
                <div className="doc-chat-thread" style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                  {/* Chat Top Bar */}
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => setMobileChatViewActive(false)}
                        className="doc-mobile-back-btn"
                        style={{
                          display: 'none',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ← Patients
                      </button>

                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                        {activeChatPatientName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>{activeChatPatientName}</div>
                        <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '600' }}>● Active Tele-Health Thread</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {(() => {
                        const activePatientObj = (data?.patients || []).find(p => p.id === activeChatPatientId || (p.name && p.name.toLowerCase() === activeChatPatientName.toLowerCase())) ||
                          (data?.consultations || []).map(c => c.patient).filter(Boolean).find(p => p.id === activeChatPatientId || p.userId === activeChatPatientId || (p.name && p.name.toLowerCase() === activeChatPatientName.toLowerCase()));

                        return (
                          <button
                            onClick={() => {
                              if (activePatientObj) {
                                setPatientHistoryDrawer(activePatientObj);
                              } else {
                                setPatientHistoryDrawer({
                                  id: activeChatPatientId,
                                  name: activeChatPatientName,
                                  consultationCount: currentPatientMessages.length,
                                  lastConsultation: 'Active Thread'
                                });
                              }
                            }}
                            title="Open Patient Medical History & All Parchas"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              backgroundColor: '#f1f5f9',
                              color: '#1e293b',
                              border: '1px solid #cbd5e1',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            <User size={13} color="#059669" /> Patient Info
                          </button>
                        );
                      })()}

                      <button
                        onClick={() => {
                          const patientConsult = (data?.consultations || []).find(c => 
                            c.patientId === activeChatPatientId || 
                            c.patient?.id === activeChatPatientId ||
                            c.patient?.userId === activeChatPatientId ||
                            (c.patient?.name && c.patient.name.toLowerCase() === activeChatPatientName.toLowerCase())
                          ) || data?.consultations?.[0];
                          if (patientConsult) setSelectedConsultation(patientConsult);
                          setRxDrawerOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#1d3924',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <FilePlus size={13} /> Quick Rx
                      </button>
                      <button
                        onClick={() => {
                          setVideoRoomData({ roomId: `consult-${activeChatPatientId || '1'}`, patientName: activeChatPatientName });
                          setVideoModalOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <Video size={13} /> Video Call
                      </button>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc' }}>
                    {currentPatientMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8' }}>
                        <MessageSquare size={36} style={{ margin: '0 auto 8px auto', color: '#cbd5e1' }} />
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#475569' }}>No messages yet with {activeChatPatientName}</div>
                        <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0' }}>Type a clinical check-in or reply below.</p>
                      </div>
                    ) : (
                      currentPatientMessages.map((msg, idx) => {
                        const isDoctor = msg.senderRole === 'DOCTOR' || msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id || idx}
                            style={{
                              alignSelf: isDoctor ? 'flex-end' : 'flex-start',
                              maxWidth: '78%',
                              backgroundColor: isDoctor ? '#1d3924' : '#ffffff',
                              color: isDoctor ? '#ffffff' : '#1e293b',
                              borderRadius: isDoctor ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                              padding: '8px 14px',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              border: isDoctor ? 'none' : '1px solid #e2e8f0'
                            }}
                          >
                            <div style={{ fontSize: '10px', fontWeight: '800', color: isDoctor ? '#a7f3d0' : '#059669', marginBottom: '2px' }}>
                              {isDoctor ? 'You (Dr. Ananya Sharma)' : (msg.senderName || activeChatPatientName)}
                            </div>
                            <div style={{ fontSize: '12.5px', lineHeight: '1.45', whiteSpace: 'pre-line' }}>{msg.message}</div>
                            <div style={{ fontSize: '9.5px', color: isDoctor ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                              {new Date(msg.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Advice Chips */}
                  <div style={{ padding: '6px 14px', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {[
                      "Check fasting sugar & update.",
                      "Take Giloy churna on empty stomach.",
                      "Avoid curd & heavy meals at night.",
                      "How is your digestion today?"
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReplyText(chip)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px',
                          color: '#334155',
                          fontWeight: '600',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendDoctorReply} style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={`Reply to ${activeChatPatientName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        outline: 'none',
                        color: '#1e293b'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      style={{
                        padding: '9px 18px',
                        borderRadius: '10px',
                        backgroundColor: '#1d3924',
                        color: '#ffffff',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: sendingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0
                      }}
                    >
                      <Send size={13} /> {sendingReply ? '...' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* =========================================================================
          3. DIGITAL PRESCRIPTION WRITER RIGHT DRAWER
      ========================================================================= */}
      <Drawer
        isOpen={rxDrawerOpen}
        onClose={() => setRxDrawerOpen(false)}
        title={`Write Prescription: ${selectedConsultation?.patient?.user?.name || 'Patient'}`}
        width="560px"
      >
        <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Patient Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
              Target Patient Consultation *
            </label>
            <select
              value={selectedConsultation?.id || ''}
              onChange={(e) => {
                const found = (data?.consultations || []).find(c => c.id === e.target.value);
                if (found) setSelectedConsultation(found);
              }}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}
            >
              {(data?.consultations || []).map(c => {
                const pName = c.patient?.name || c.patient?.user?.name || 'Patient';
                return (
                  <option key={c.id} value={c.id}>
                    {pName} ({c.patient?.phone || 'Patient'}) — Case #{c.id.slice(-6).toUpperCase()}
                  </option>
                );
              })}
            </select>
            <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: '600' }}>
              🔒 Patient-Specific Rx: Prescriptions are linked strictly to this patient's private case record.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
              Clinical Diagnosis *
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Amlapitta (Hyperacidity) / Sandhivata (Joint Pain)"
              value={prescriptionForm.diagnosis}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px' }}
            />
          </div>

          {/* Prescribed Herbs Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase' }}>
                Prescribed Medicinal Herbs & Dosages ({prescriptionForm.herbs.length})
              </label>
              <button 
                type="button"
                onClick={handleAddHerbRow}
                style={{ background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Another Herb
              </button>
            </div>

            {/* Quick Quick Herbs Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280', alignSelf: 'center' }}>Quick Formulary:</span>
              {[
                { name: 'Purified Giloy Stem Powder', dosage: '3g with warm water' },
                { name: 'Nagori Ashwagandha Churna', dosage: '5g at bedtime' },
                { name: 'Pure Himalayan Shilajit Resin', dosage: '300mg in lukewarm milk' },
                { name: 'Triphala Kadha Churna', dosage: '5g before bedtime' }
              ].map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickHerbChip(h.name, h.dosage)}
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  + {h.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prescriptionForm.herbs.map((h, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: '8px', alignItems: 'center', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <input 
                    type="text" 
                    placeholder="Herb Name"
                    value={h.herb}
                    onChange={(e) => handleHerbChange(idx, 'herb', e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12.5px' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Dosage (e.g. 3g)"
                    value={h.dosage}
                    onChange={(e) => handleHerbChange(idx, 'dosage', e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12.5px' }}
                  />
                  <input 
                    type="text" 
                    placeholder="Timing"
                    value={h.timing}
                    onChange={(e) => handleHerbChange(idx, 'timing', e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12.5px' }}
                  />
                  {prescriptionForm.herbs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHerbRow(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
              Sattvic Dietary Advice & Ahara Guidelines
            </label>
            <textarea 
              rows={3}
              placeholder="e.g. Avoid sour, oily, and heavy foods. Favor warm water, moong dal, and cooked seasonal vegetables."
              value={prescriptionForm.dietaryAdvice}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dietaryAdvice: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
              Lifestyle, Vihara & Pranayama Guidance
            </label>
            <textarea 
              rows={2}
              placeholder="e.g. 20 mins morning Pranayama (Anulom-Vilom). Avoid daytime sleep and maintain regular meal timings."
              value={prescriptionForm.lifestyleGuidelines}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, lifestyleGuidelines: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
              Next Follow-up Review (Days)
            </label>
            <input 
              type="number"
              placeholder="e.g. 14"
              value={prescriptionForm.followUpDays}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, followUpDays: e.target.value })}
              style={{ width: '140px', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px' }}
            />
          </div>

          <button
            type="submit"
            disabled={submittingRx}
            style={{
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: '#1d3924',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '800',
              border: 'none',
              cursor: submittingRx ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(29, 57, 36, 0.25)',
              marginTop: '10px'
            }}
          >
            <Send size={16} /> {submittingRx ? 'Signing & Issuing...' : 'Sign & Issue Digital Prescription'}
          </button>
        </form>
      </Drawer>

      {/* =========================================================================
          4. PATIENT CLINICAL HISTORY RIGHT DRAWER
      ========================================================================= */}
      <Drawer
        isOpen={!!patientHistoryDrawer}
        onClose={() => setPatientHistoryDrawer(null)}
        title={`Patient Record: ${patientHistoryDrawer?.name || patientHistoryDrawer?.patient?.name || 'Patient'}`}
        width="660px"
      >
        {patientHistoryDrawer && (() => {
          const phPatient = patientHistoryDrawer?.patient || patientHistoryDrawer;
          const phProfile = phPatient?.patientProfile || phPatient?.profile || {};
          const phName = phPatient?.name || 'Patient';
          const phEmail = phPatient?.email || 'N/A';
          const phPhone = phPatient?.phone || '+91 98112 34567';
          const phAge = phProfile?.age || 35;
          const phGender = phProfile?.gender || 'N/A';
          const phBlood = phProfile?.bloodGroup || 'B+';
          const phDiet = phProfile?.dietType || 'Sattvic Vegetarian';
          const phAllergies = phProfile?.allergies || 'No drug or environmental allergies reported';
          const phMeds = phProfile?.currentMedications || 'None / Natural herbal regimen';
          const phConditions = phProfile?.existingConditions ? (
            typeof phProfile.existingConditions === 'string' ? JSON.parse(phProfile.existingConditions) : phProfile.existingConditions
          ) : [];

          // Find all prescriptions / follow-up parche for this patient (Latest First)
          const patientParchas = (data?.consultations || []).filter(c => 
            c.prescription && 
            (c.patientId === phPatient.id || c.patient?.id === phPatient.id || c.patient?.userId === phPatient.id || (phEmail !== 'N/A' && (c.patient?.email === phEmail || c.patient?.user?.email === phEmail)))
          ).sort((a, b) => 
            new Date(b.prescription?.createdAt || b.createdAt || 0) - new Date(a.prescription?.createdAt || a.createdAt || 0)
          );

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Quick Actions Header: Chat, Video Call, and New Rx */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => {
                    setActiveChatPatientId(phPatient.id);
                    setActiveChatPatientName(phName);
                    setPatientHistoryDrawer(null);
                    setActiveNav('messages');
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    border: '1.5px solid #a7f3d0',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageSquare size={15} /> Chat
                </button>

                <button
                  onClick={() => {
                    setVideoRoomData({
                      roomId: `ayurveda-room-${(phPatient.id || 'visit').slice(0, 8)}`,
                      patientName: phName
                    });
                    setVideoModalOpen(true);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1.5px solid #bfdbfe',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Video size={15} /> Video Call
                </button>

                <button
                  disabled={!isApproved}
                  onClick={() => {
                    const existing = (data?.consultations || []).find(c => c.patientId === phPatient.id || c.patient?.id === phPatient.id);
                    if (existing) {
                      setSelectedConsultation(existing);
                    } else {
                      setSelectedConsultation({
                        id: `consult-${phPatient.id}`,
                        patientId: phPatient.id,
                        patient: phPatient,
                        symptomsNote: phPatient.lastSymptoms || 'Direct Clinical Consultation'
                      });
                    }
                    setPatientHistoryDrawer(null);
                    setRxDrawerOpen(true);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: isApproved ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(29, 57, 36, 0.25)'
                  }}
                >
                  <FilePlus size={15} /> Write Rx
                </button>
              </div>

              {/* Patient Identity Card */}
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '14px', padding: '16px 18px', border: '1.5px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#15803d', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                    {phName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#14532d', margin: 0 }}>
                        {phName}
                      </h3>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 7px', borderRadius: '9999px', border: '1px solid #86efac' }}>
                        AYUSH Verified
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#166534', margin: '3px 0 0 0' }}>
                      Email: <strong>{phEmail}</strong> • Phone: <strong>{phPhone}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Vitals Quick Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Age & Gender</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827', marginTop: '2px' }}>
                    {phAge} Yrs • {phGender}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Blood Group</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827', marginTop: '2px' }}>
                    {phBlood}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Dietary Style</div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                    {phDiet}
                  </div>
                </div>
              </div>

              {/* Dosha & Conditions */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Diagnosed Chronic Conditions / Dosha Imbalance:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {phConditions.map((cond, i) => (
                    <span key={i} style={{ fontSize: '11.5px', fontWeight: '700', backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '9999px' }}>
                      {cond}
                    </span>
                  ))}
                  <span style={{ fontSize: '11.5px', fontWeight: '700', backgroundColor: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '9999px' }}>
                    Clinical Profile Complete
                  </span>
                </div>
              </div>

              {/* Allergies & Medications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Allergies & Sensitivities
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#fff1f2', borderRadius: '10px', border: '1px solid #fecdd3', color: '#9f1239', fontSize: '12px', fontWeight: '700' }}>
                    {phAllergies}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Active Medications
                  </div>
                  <div style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '12px', fontWeight: '600' }}>
                    {phMeds}
                  </div>
                </div>
              </div>

              {/* Prescriptions & Follow-up Parchas (Latest First) */}
              <div style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#059669" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      Clinical Prescriptions & Follow-up Parchas ({patientParchas.length})
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                    Latest on Top
                  </span>
                </div>

                {patientParchas.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <FilePlus size={28} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#475569' }}>No Prior Prescriptions on Record</div>
                    <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 10px 0' }}>Click below to issue the patient's first clinical prescription.</p>
                    <button
                      disabled={!isApproved}
                      onClick={() => {
                        setSelectedConsultation({
                          id: `consult-${phPatient.id}`,
                          patientId: phPatient.id,
                          patient: phPatient,
                          symptomsNote: phPatient.lastSymptoms || 'Direct Clinical Consultation'
                        });
                        setPatientHistoryDrawer(null);
                        setRxDrawerOpen(true);
                      }}
                      style={{ padding: '7px 14px', borderRadius: '8px', backgroundColor: '#1d3924', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      + Write First Parcha
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {patientParchas.map((c, idx) => {
                      const rx = c.prescription;
                      const rxDate = new Date(rx.createdAt || c.createdAt || Date.now());
                      const herbsList = rx.herbsPrescribed ? (
                        typeof rx.herbsPrescribed === 'string' ? JSON.parse(rx.herbsPrescribed) : rx.herbsPrescribed
                      ) : [];

                      return (
                        <div 
                          key={rx.id || idx} 
                          style={{ 
                            backgroundColor: idx === 0 ? '#f0fdf4' : '#ffffff', 
                            borderRadius: '14px', 
                            padding: '14px 16px', 
                            border: idx === 0 ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                                Parcha #RX-{(rx.id || '2026').slice(-6).toUpperCase()}
                              </span>
                              {idx === 0 && (
                                <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#15803d', color: '#ffffff', padding: '2px 7px', borderRadius: '4px' }}>
                                  LATEST RX
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                              <Calendar size={12} color="#059669" />
                              <span>{rxDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {rxDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          {/* Diagnosis */}
                          <div style={{ backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                            <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Diagnosis / Samprapti</div>
                            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                              {rx.diagnosis}
                            </div>
                          </div>

                          {/* Prescribed Herbs */}
                          {herbsList.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Prescribed Medicines & Herbs ({herbsList.length}):
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {herbsList.map((h, i) => (
                                  <div key={i} style={{ padding: '6px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                                    <strong style={{ color: '#1e293b' }}>🌿 {h.herb}</strong>
                                    <span style={{ color: '#059669', fontWeight: '700' }}>{h.dosage} • {h.timing || 'Daily'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dietary & Lifestyle Regimen */}
                          {rx.dietaryAdvice && (
                            <div style={{ fontSize: '11px', color: '#334155', marginBottom: '6px', lineHeight: 1.4, backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <strong style={{ color: '#166534' }}>Pathya (Diet Advice):</strong> {rx.dietaryAdvice}
                            </div>
                          )}

                          {/* Footer with Follow-up and Download */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '11.5px', color: '#64748b' }}>
                            <span>Follow-up: <strong style={{ color: '#0f172a' }}>{rx.followUpDate ? new Date(rx.followUpDate).toLocaleDateString('en-IN') : '14 Days'}</strong></span>
                            <button
                              onClick={() => alert(`Official signed PDF prescription for ${phName} downloaded.`)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#1d3924',
                                fontWeight: '700',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              Download Signed Parcha
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })()}
      </Drawer>

      {/* Real Live Encrypted Video Consultation Modal */}
      <VideoConsultationModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        roomName={videoRoomData.roomId}
        doctorName={data?.doctor?.name || user?.name || 'Dr. Ananya Sharma (BHMS)'}
        patientName={videoRoomData.patientName}
      />

      <style>{`
        @media (max-width: 900px) {
          .admin-mobile-toggle {
            display: block !important;
          }
          .admin-sidebar-drawer {
            position: fixed !important;
            left: -320px;
            top: 0;
            bottom: 0;
            width: 285px !important;
            transition: left 0.28s ease !important;
          }
          .admin-drawer-open {
            position: fixed !important;
            left: 0 !important;
            top: 0;
            bottom: 0;
            width: 285px !important;
            transition: left 0.28s ease !important;
          }
          .doc-dashboard-header {
            padding: 0 16px !important;
          }
          .doc-dashboard-content {
            padding: 16px !important;
          }
          .doc-top-search {
            width: 170px !important;
          }
        }
        @media (min-width: 901px) {
          .admin-sidebar-drawer {
            display: flex !important;
          }
        }
        @media (max-width: 768px) {
          .doc-dashboard-header {
            height: auto !important;
            min-height: 56px !important;
            padding: 10px 14px !important;
          }
          .doc-top-search {
            width: 140px !important;
          }
          .doc-dashboard-content {
            padding: 14px 12px 70px 12px !important;
          }
          .doc-cards-grid {
            grid-template-columns: 1fr !important;
        }
        @media (max-width: 820px) {
          .doc-chat-grid {
            grid-template-columns: 1fr !important;
            height: 520px !important;
          }
          .doc-chat-grid.mobile-chat-list-active .doc-chat-thread {
            display: none !important;
          }
          .doc-chat-grid.mobile-chat-thread-active .doc-chat-sidebar {
            display: none !important;
          }
          .doc-chat-grid.mobile-chat-thread-active .doc-mobile-back-btn {
            display: flex !important;
          }
          .doc-rx-herb-row {
            grid-template-columns: 1fr !important;
          }
          table {
            min-width: 580px !important;
          }
        }
      `}</style>

      {/* Doctor Payout Request Modal */}
      {payoutModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '440px', padding: '26px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Request Consultation Fee Payout</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Direct bank transfer from Central Platform Treasury</p>
              </div>
              <button onClick={() => setPayoutModalOpen(false)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleRequestDoctorPayout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Payout Amount (₹) *</label>
                <input
                  type="number"
                  min="500"
                  required
                  placeholder="e.g. 5000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '16px', fontWeight: '800', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank Ltd"
                  value={payoutBankName}
                  onChange={(e) => setPayoutBankName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Account No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789012"
                    value={payoutAccountNo}
                    onChange={(e) => setPayoutAccountNo(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001092"
                    value={payoutIfsc}
                    onChange={(e) => setPayoutIfsc(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#163321', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {submittingPayout ? 'Submitting...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      <RaiseSupportTicketModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        userRole="DOCTOR"
        onTicketCreated={() => {
          setSuccessMsg('Your support ticket has been submitted to Super Admin Helpdesk!');
          setTimeout(() => setSuccessMsg(null), 4000);
        }}
      />

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        roleName="Doctor Clinical"
      />
    </div>
  );
}
