import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi, supportApi } from '../../services/api';
import { getSocket, joinAdminRoom } from '../../services/socket';
import Drawer from '../../components/Drawer';
import SignOutConfirmModal from '../../components/SignOutConfirmModal';
import Pagination from '../../components/Pagination';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Eye, 
  Users, 
  Stethoscope, 
  Sprout, 
  Activity, 
  ExternalLink,
  Search,
  AlertTriangle,
  Award,
  RefreshCw,
  Download,
  Building2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Shield,
  LayoutDashboard,
  QrCode,
  LogOut,
  Menu,
  X,
  Store,
  SlidersHorizontal,
  Server,
  Zap,
  Filter,
  Check,
  CreditCard,
  MessageSquare,
  DollarSign,
  Package,
  HeartPulse,
  UserCheck,
  ShoppingBag,
  RotateCcw,
  LifeBuoy
} from 'lucide-react';

// NOTE: Farmer and Seller are synonymous in this codebase (farmer hi seller hai).
// The UI displays "Seller" to administrators and users, while internal APIs and database queries reference FARMER.
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, startImpersonation } = useAuth();

  const handleEnterAsUser = async (targetUserId, role) => {
    try {
      setActionLoading(true);
      await startImpersonation(targetUserId);
      if (role === 'FARMER') {
        navigate('/farmer');
      } else if (role === 'DOCTOR') {
        navigate('/doctor');
      } else {
        navigate('/dashboard/patient');
      }
    } catch (err) {
      alert(err.message || 'Failed to switch into user dashboard');
    } finally {
      setActionLoading(false);
    }
  };

  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [doctorsRoster, setDoctorsRoster] = useState([]);
  const [farmersRoster, setFarmersRoster] = useState([]);
  const [chatsAudit, setChatsAudit] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  // Support Centre State
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportTotal, setSupportTotal] = useState(0);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSearch, setSupportSearch] = useState('');
  const [supportStatusFilter, setSupportStatusFilter] = useState('ALL');
  const [supportCategoryFilter, setSupportCategoryFilter] = useState('ALL');
  const [supportRoleFilter, setSupportRoleFilter] = useState('ALL');
  const [selectedTicketDrawer, setSelectedTicketDrawer] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('RESOLVED');
  const [replyingTicket, setReplyingTicket] = useState(false);

  // Pagination states
  const [patientsPage, setPatientsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [doctorsPage, setDoctorsPage] = useState(1);
  const [farmersPage, setFarmersPage] = useState(1);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [chatsPage, setChatsPage] = useState(1);
  const [supportPage, setSupportPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    platformCommission: 15,
    doctorCommission: 10,
    farmerCommission: 8,
    codEnabled: true,
    minPayoutAmount: 500,
    autoApproveDoctors: false,
    autoApproveFarmers: false
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Simplified friendly tabs
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'farmers', 'doctors', 'patients', 'orders', 'payouts', 'chats', 'support', 'settings'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Global & Per-section filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Left Sidebar Drawer State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 360° Inspection Drawers
  const [selectedFarmer360, setSelectedFarmer360] = useState(null);
  const [selectedDoctor360, setSelectedDoctor360] = useState(null);
  const [selectedPatient360, setSelectedPatient360] = useState(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Right Side Quick Controls & Settings Drawer
  const [controlsDrawerOpen, setControlsDrawerOpen] = useState(false);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileSidebarOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, usersRes, ordersRes, settingsRes, docsRosterRes, farmersRosterRes, chatsRes, payoutsRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ success: false })),
        adminApi.getPendingVerifications().catch(() => ({ success: false })),
        adminApi.getUsers().catch(() => ({ success: false })),
        adminApi.getOrders().catch(() => ({ success: false })),
        adminApi.getSettings().catch(() => ({ success: false })),
        adminApi.getDoctorsRoster().catch(() => ({ success: false })),
        adminApi.getFarmersRoster().catch(() => ({ success: false })),
        adminApi.getChatsAudit().catch(() => ({ success: false })),
        adminApi.getPayouts().catch(() => ({ success: false }))
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (pendingRes.success) {
        setPendingDoctors(pendingRes.doctors || []);
        setPendingFarmers(pendingRes.farmers || []);
      }
      if (usersRes.success) setAllUsers(usersRes.users || []);
      if (ordersRes.success) setAdminOrders(ordersRes.orders || []);
      if (docsRosterRes.success) setDoctorsRoster(docsRosterRes.doctors || []);
      if (farmersRosterRes.success) setFarmersRoster(farmersRosterRes.farmers || []);
      if (chatsRes.success) setChatsAudit(chatsRes);
      if (payoutsRes.success) setPayouts(payoutsRes.payouts || []);
      if (settingsRes.success && settingsRes.settings) {
        const map = {};
        if (Array.isArray(settingsRes.settings)) {
          settingsRes.settings.forEach(s => {
            try {
              map[s.key] = JSON.parse(s.value);
            } catch (e) {
              map[s.key] = s.value;
            }
          });
        } else if (typeof settingsRes.settings === 'object') {
          Object.assign(map, settingsRes.settings);
        }
        setSystemSettings(prev => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    setSupportLoading(true);
    try {
      const res = await supportApi.getAdminTickets({
        status: supportStatusFilter,
        category: supportCategoryFilter,
        userRole: supportRoleFilter,
        search: supportSearch,
        page: supportPage,
        limit: pageSize
      });
      if (res.success) {
        setSupportTickets(res.tickets || []);
        setSupportTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setSupportLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSupportTickets();
  }, [supportStatusFilter, supportCategoryFilter, supportRoleFilter, supportSearch, supportPage, pageSize]);

  // Real-time WebSocket connection for Super Admin
  useEffect(() => {
    const socket = getSocket();
    joinAdminRoom();

    const onTicketCreated = (data) => {
      fetchSupportTickets();
      setStatusMsg({ type: 'success', text: data.message || 'New support ticket received from user!' });
      setTimeout(() => setStatusMsg(null), 5000);
    };

    const onChatAudit = () => {
      adminApi.getChatsAudit().then(res => {
        if (res.success) setChatsAudit(res);
      }).catch(() => {});
    };

    socket.on('support_ticket_created', onTicketCreated);
    socket.on('chat_audit_update', onChatAudit);

    return () => {
      socket.off('support_ticket_created', onTicketCreated);
      socket.off('chat_audit_update', onChatAudit);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchData(), fetchSupportTickets()]);
      setStatusMsg({ type: 'success', text: 'All platform records, audits, and treasury metrics synced live from database!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to refresh records' });
    } finally {
      setRefreshing(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleReplyTicket = async (statusOverride = null) => {
    if (!selectedTicketDrawer) return;
    if (!adminReplyText.trim() && !statusOverride) {
      alert('Please enter an official admin response before sending.');
      return;
    }

    setReplyingTicket(true);
    try {
      const res = await supportApi.replyTicket(selectedTicketDrawer.id, {
        adminResponse: adminReplyText.trim(),
        status: statusOverride || replyStatus
      });
      setStatusMsg({ type: 'success', text: res.message });
      setSelectedTicketDrawer(null);
      setAdminReplyText('');
      fetchSupportTickets();
    } catch (err) {
      alert(err.message || 'Failed to update ticket');
    } finally {
      setReplyingTicket(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleVerify = async (userId, action, reason = null) => {
    setActionLoading(true);
    try {
      const res = await adminApi.verifyUser(userId, action, reason);
      setStatusMsg({ type: 'success', text: res.message });
      setSelectedFarmer360(null);
      setSelectedDoctor360(null);
      setShowRejectInput(false);
      setRejectionReason('');
      await fetchData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleSaveSystemRules = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await adminApi.updateSettings(systemSettings);
      setStatusMsg({ type: 'success', text: res.message || 'Platform rules and commission rates saved live to database!' });
      if (res.settings) {
        setSystemSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save system rules' });
    } finally {
      setSavingSettings(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleLogout = () => {
    setSignOutModalOpen(true);
  };

  const handleConfirmSignOut = () => {
    setSignOutModalOpen(false);
    logout();
    navigate('/portal', { replace: true });
  };

  const handleSettlePayout = async (payoutId) => {
    const txRef = prompt('Enter Bank UTR / NEFT Reference Number:', `NEFT-AYUR-${Date.now().toString().slice(-8)}`);
    if (!txRef) return;
    try {
      const res = await adminApi.settlePayout(payoutId, { action: 'SETTLED', transactionRef: txRef });
      setStatusMsg({ type: 'success', text: res.message });
      fetchData();
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      alert(err.message || 'Settlement failed');
    }
  };

  // Date range filter helper
  const isWithinDateRange = (itemDate) => {
    if (!itemDate) return true;
    const d = new Date(itemDate);
    if (isNaN(d.getTime())) return true;
    if (filterStartDate) {
      const s = new Date(filterStartDate);
      s.setHours(0, 0, 0, 0);
      if (d < s) return false;
    }
    if (filterEndDate) {
      const e = new Date(filterEndDate);
      e.setHours(23, 59, 59, 999);
      if (d > e) return false;
    }
    return true;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStartDate('');
    setFilterEndDate('');
    setStatusFilter('ALL');
  };

  // Clean, professional navigation tabs (No hardcoded numbers!)
  const navItems = [
    { 
      id: 'overview', 
      label: 'Platform Dashboard', 
      desc: 'Live Metrics & Growth',
      icon: LayoutDashboard
    },
    { 
      id: 'farmers', 
      label: 'Sellers & Sourcing', 
      desc: 'Seller Roster & Enter Mode',
      icon: Sprout
    },
    { 
      id: 'doctors', 
      label: 'Doctors & Clinics', 
      desc: 'AYUSH Roster & Enter Mode',
      icon: Stethoscope
    },
    { 
      id: 'patients', 
      label: 'Patient Health Directory', 
      desc: 'Case Records & Assigned Doctors',
      icon: Users
    },
    { 
      id: 'orders', 
      label: 'Orders & Deliveries', 
      desc: 'Patient & Seller Traceability',
      icon: Store
    },
    { 
      id: 'payouts', 
      label: 'Bank Payouts & Treasury', 
      desc: 'NEFT/RTGS Disbursements',
      icon: CreditCard
    },
    { 
      id: 'chats', 
      label: 'Chat Compliance Audit', 
      desc: 'Doctor-Patient Communication Logs',
      icon: MessageSquare
    },
    { 
      id: 'support', 
      label: 'Support Centre', 
      desc: 'User, Doctor & Seller Helpdesk',
      icon: LifeBuoy
    },
    { 
      id: 'settings', 
      label: 'System Rules & Commission', 
      desc: 'COD, Margins & Platform Rates',
      icon: SlidersHorizontal
    }
  ];

  // Helper for document tabs in 360 inspection
  const getInspectionDocuments = (entity, type) => {
    if (!entity) return [];
    const p = entity.profile || entity;
    if (type === 'DOCTOR') {
      return [
        { label: 'BHMS Medical Degree Certificate', url: p.degreeCertUrl || '/uploads/sample_bhms_degree.pdf' },
        { label: 'State Medical Council Registration Certificate', url: p.councilCertUrl || '/uploads/sample_council_reg.pdf' },
        { label: 'Government Photo ID Proof (Aadhaar/PAN)', url: p.idProofUrl || '/uploads/sample_govt_id.pdf' }
      ];
    } else {
      return [
        { label: 'FSSAI 14-Digit Food Safety License', url: p.fssaiCertUrl || '/uploads/sample_fssai_cert.pdf' },
        { label: 'NPOP Organic Farming Certificate', url: p.organicCertUrl || '/uploads/sample_npop_organic_cert.pdf' },
        { label: 'Land Revenue Record / Identity Proof', url: p.idProofUrl || '/uploads/sample_farmer_aadhaar.pdf' }
      ];
    }
  };

  // Combined Farmer List (Roster + Pending)
  const allFarmersList = React.useMemo(() => {
    const list = [...farmersRoster];
    pendingFarmers.forEach(pf => {
      if (!list.some(f => f.userId === pf.id || f.id === pf.id)) {
        list.unshift({
          id: pf.id,
          userId: pf.id,
          name: pf.name,
          email: pf.email,
          phone: pf.phone,
          status: pf.status || 'PENDING',
          createdAt: pf.createdAt,
          fpoOrFarmName: pf.profile?.fpoOrFarmName || `${pf.name}'s Organic Farm`,
          farmState: pf.profile?.farmState || 'Maharashtra',
          farmDistrict: pf.profile?.farmDistrict || 'Nashik',
          acreage: pf.profile?.acreage || 15,
          cropsGrown: pf.profile?.cropsGrown ? (typeof pf.profile.cropsGrown === 'string' ? JSON.parse(pf.profile.cropsGrown || '[]') : pf.profile.cropsGrown) : ['Ashwagandha', 'Brahmi'],
          fssaiNumber: pf.profile?.fssaiNumber || 'Pending Verification',
          organicCertNumber: pf.profile?.organicCertNumber || 'NPOP-PENDING',
          batchesCount: 0,
          totalStockKg: 0,
          totalSoldKg: 0,
          grossSales: 0,
          netFarmerPayout: 0,
          batches: []
        });
      }
    });
    return list;
  }, [farmersRoster, pendingFarmers]);

  // Filtered Farmers
  const filteredFarmers = React.useMemo(() => {
    return allFarmersList.filter(f => {
      if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
      if (!isWithinDateRange(f.createdAt)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (f.name || '').toLowerCase().includes(q);
        const matchFpo = (f.fpoOrFarmName || '').toLowerCase().includes(q);
        const matchPhone = (f.phone || '').includes(q);
        const matchState = (f.farmState || '').toLowerCase().includes(q);
        const matchDistrict = (f.farmDistrict || '').toLowerCase().includes(q);
        if (!matchName && !matchFpo && !matchPhone && !matchState && !matchDistrict) return false;
      }
      return true;
    });
  }, [allFarmersList, statusFilter, filterStartDate, filterEndDate, searchQuery]);

  // Combined Doctor List (Roster + Pending)
  const allDoctorsList = React.useMemo(() => {
    const list = [...doctorsRoster];
    pendingDoctors.forEach(pd => {
      if (!list.some(d => d.userId === pd.id || d.id === pd.id)) {
        list.unshift({
          id: pd.id,
          userId: pd.id,
          name: pd.name,
          email: pd.email,
          phone: pd.phone,
          status: pd.status || 'PENDING',
          createdAt: pd.createdAt,
          degree: pd.profile?.degree || 'BHMS',
          college: pd.profile?.college || 'National Institute of Homoeopathy',
          councilName: pd.profile?.councilName || 'Central Council of Homoeopathy',
          registrationNumber: pd.profile?.registrationNumber || 'DEL-BHMS-PENDING',
          experienceYears: pd.profile?.experienceYears || 5,
          specialization: pd.profile?.specialization ? (typeof pd.profile.specialization === 'string' ? JSON.parse(pd.profile.specialization || '[]') : pd.profile.specialization) : ['Chronic Care', 'PCOS'],
          consultationFee: pd.profile?.consultationFee || 499,
          totalConsultations: 0,
          uniquePatientsCount: 0,
          grossEarnings: 0,
          platformFeeDeducted: 0,
          netDoctorPayout: 0,
          consultations: []
        });
      }
    });
    return list;
  }, [doctorsRoster, pendingDoctors]);

  // Filtered Doctors
  const filteredDoctors = React.useMemo(() => {
    return allDoctorsList.filter(d => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (!isWithinDateRange(d.createdAt)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (d.name || '').toLowerCase().includes(q);
        const matchReg = (d.registrationNumber || '').toLowerCase().includes(q);
        const matchPhone = (d.phone || '').includes(q);
        const matchDegree = (d.degree || '').toLowerCase().includes(q);
        const matchCollege = (d.college || '').toLowerCase().includes(q);
        if (!matchName && !matchReg && !matchPhone && !matchDegree && !matchCollege) return false;
      }
      return true;
    });
  }, [allDoctorsList, statusFilter, filterStartDate, filterEndDate, searchQuery]);

  // Filtered Patients
  const filteredPatients = React.useMemo(() => {
    return allUsers.filter(u => {
      if (u.role !== 'PATIENT') return false;
      if (!isWithinDateRange(u.createdAt)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchPhone = (u.phone || '').includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [allUsers, filterStartDate, filterEndDate, searchQuery]);

  // Filtered Orders
  const filteredOrders = React.useMemo(() => {
    return adminOrders.filter(o => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (!isWithinDateRange(o.createdAt)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchUser = (o.user?.name || '').toLowerCase().includes(q);
        const matchPhone = (o.user?.phone || '').includes(q);
        const matchTrack = (o.trackingNumber || '').toLowerCase().includes(q);
        if (!matchId && !matchUser && !matchPhone && !matchTrack) return false;
      }
      return true;
    });
  }, [adminOrders, statusFilter, filterStartDate, filterEndDate, searchQuery]);

  // Filtered Payouts
  const filteredPayouts = React.useMemo(() => {
    return payouts.filter(p => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (!isWithinDateRange(p.requestedAt)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.userName || '').toLowerCase().includes(q);
        const matchBank = (p.bankName || '').toLowerCase().includes(q);
        const matchAcc = (p.bankAccountNo || '').includes(q);
        const matchRef = (p.transactionRef || '').toLowerCase().includes(q);
        if (!matchName && !matchBank && !matchAcc && !matchRef) return false;
      }
      return true;
    });
  }, [payouts, statusFilter, filterStartDate, filterEndDate, searchQuery]);

  const paginatedFarmers = React.useMemo(() => {
    return filteredFarmers.slice((farmersPage - 1) * pageSize, farmersPage * pageSize);
  }, [filteredFarmers, farmersPage, pageSize]);

  const paginatedDoctors = React.useMemo(() => {
    return filteredDoctors.slice((doctorsPage - 1) * pageSize, doctorsPage * pageSize);
  }, [filteredDoctors, doctorsPage, pageSize]);

  const paginatedPatients = React.useMemo(() => {
    return filteredPatients.slice((patientsPage - 1) * pageSize, patientsPage * pageSize);
  }, [filteredPatients, patientsPage, pageSize]);

  const paginatedOrders = React.useMemo(() => {
    return filteredOrders.slice((ordersPage - 1) * pageSize, ordersPage * pageSize);
  }, [filteredOrders, ordersPage, pageSize]);

  const paginatedPayouts = React.useMemo(() => {
    return filteredPayouts.slice((payoutsPage - 1) * pageSize, payoutsPage * pageSize);
  }, [filteredPayouts, payoutsPage, pageSize]);

  const paginatedChats = React.useMemo(() => {
    const list = (chatsAudit?.recentMessages || []).filter(m => {
      if (!isWithinDateRange(m.createdAt)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (m.senderName || '').toLowerCase().includes(q) || 
               (m.receiverName || '').toLowerCase().includes(q) || 
               (m.message || '').toLowerCase().includes(q);
      }
      return true;
    });
    return {
      total: list.length,
      items: list.slice((chatsPage - 1) * pageSize, chatsPage * pageSize)
    };
  }, [chatsAudit, searchQuery, filterStartDate, filterEndDate, chatsPage, pageSize]);

  // Reusable Filter Bar Component
  const renderFilterBar = (placeholder, showStatus = true, statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']) => (
    <div className="admin-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '220px', height: 'auto' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder={placeholder} 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b' }}>From:</span>
        <input 
          type="date" 
          value={filterStartDate} 
          onChange={e => setFilterStartDate(e.target.value)} 
          style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b' }}>To:</span>
        <input 
          type="date" 
          value={filterEndDate} 
          onChange={e => setFilterEndDate(e.target.value)} 
          style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
        />
      </div>

      {showStatus && (
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '700', color: '#334155' }}
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt === 'ALL' ? 'All Statuses' : opt}</option>
          ))}
        </select>
      )}

      {(searchQuery || filterStartDate || filterEndDate || statusFilter !== 'ALL') && (
        <button 
          onClick={clearFilters}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        >
          <RotateCcw size={12} /> Clear
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', backgroundColor: '#f8faf7', position: 'relative', width: '100%' }}>

      {/* Mobile Backdrop for Drawer */}
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

      {/* LEFT SIDEBAR NAVIGATION DRAWER */}
      <aside
        style={{
          width: sidebarCollapsed ? '80px' : '260px',
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
          boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
          transition: 'width 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0
        }}
        className={mobileSidebarOpen ? 'admin-drawer-open' : 'admin-sidebar-drawer'}
      >
        {/* Brand Header */}
        <div 
          style={{ 
            padding: sidebarCollapsed ? '18px 12px' : '18px 18px', 
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            gap: '10px'
          }}
        >
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(230, 215, 185, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E6D7B9', border: '1px solid rgba(230, 215, 185, 0.3)' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: '800', letterSpacing: '0.04em', color: '#ffffff' }}>
                  AYURVEDA
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Super Admin Desk
                </span>
              </div>
            </div>
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(230, 215, 185, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E6D7B9' }}>
              <ShieldCheck size={18} />
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#d1fae5',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '14px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  clearFilters();
                  setMobileSidebarOpen(false);
                }}
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                  padding: sidebarCollapsed ? '10px' : '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(34, 197, 94, 0.16)' : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  textAlign: 'left',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
                  <Icon size={17} color={isActive ? '#4ade80' : '#94a3b8'} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && (
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: isActive ? '800' : '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isActive ? '#ffffff' : '#e2e8f0' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '10px', color: isActive ? '#86efac' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.desc}
                      </div>
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#dc2626', color: '#ffffff', padding: '2px 7px', borderRadius: '9999px', flexShrink: 0 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer User Info & Sign Out */}
        <div 
          style={{ 
            padding: sidebarCollapsed ? '12px 8px' : '14px 14px', 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            backgroundColor: 'rgba(0,0,0,0.18)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2d5c38', border: '1.5px solid #E6D7B9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#E6D7B9', fontSize: '11px', flexShrink: 0 }}>
              SA
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Super Admin
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  admin@ayurveda.org
                </div>
              </div>
            )}
          </div>

          {!sidebarCollapsed ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <Link
                to="/"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px', 
                  padding: '7px 8px', 
                  borderRadius: '6px', 
                  backgroundColor: 'rgba(255,255,255,0.08)', 
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  textDecoration: 'none'
                }}
              >
                <Store size={12} /> Storefront
              </Link>
              <button
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px', 
                  padding: '7px 8px', 
                  borderRadius: '6px', 
                  backgroundColor: 'rgba(239, 68, 68, 0.18)', 
                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                  color: '#fca5a5', 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  cursor: 'pointer'
                }}
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Top Header Bar */}
        <header 
          className="admin-header-bar dashboard-app-header"
          style={{
            minHeight: '56px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div className="dashboard-header-title-box" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="admin-mobile-menu-btn"
              style={{
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#163321',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              title="Toggle Navigation Menu"
            >
              <Menu size={15} /> Menu
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
                Admin
              </span>
              <span style={{ color: '#cbd5e1' }}>/</span>
              <span className="dashboard-header-title" style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                {navItems.find(i => i.id === activeSection)?.label || 'Overview'}
              </span>
            </div>
          </div>

          <div className="dashboard-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="dashboard-action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '9999px',
                border: '1.5px solid #059669',
                backgroundColor: '#f0fdf4',
                color: '#065f46',
                fontSize: '12px',
                fontWeight: '800',
                cursor: (refreshing || loading) ? 'wait' : 'pointer',
                boxShadow: '0 1px 3px rgba(5,150,105,0.1)'
              }}
              title="Sync live records and treasury metrics directly from database"
            >
              <RefreshCw size={13} className={(refreshing || loading) ? 'animate-spin' : ''} /> 
              <span className="desktop-btn-text">{refreshing ? 'Syncing...' : 'Live Refresh'}</span>
              <span className="mobile-btn-text">{refreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            <Link
              to="/"
              className="dashboard-action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              <Store size={12} /> 
              <span className="desktop-btn-text">Storefront</span>
              <span className="mobile-btn-text">Store</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content-body" style={{ padding: '20px', flex: 1, maxWidth: '1440px', width: '100%', boxSizing: 'border-box' }}>
          
          {statusMsg && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', backgroundColor: statusMsg.type === 'success' ? '#ecfdf5' : '#fef2f2', color: statusMsg.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${statusMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700' }}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} color="#059669" /> : <AlertTriangle size={16} color="#dc2626" />}
              {statusMsg.text}
            </div>
          )}

          {/* =========================================================================
              SECTION 1: OVERVIEW
          ========================================================================= */}
          {activeSection === 'overview' && (
            <div>
              {/* Compact Sleek Banner */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #163321 0%, #285434 60%, #3e734c 100%)',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px rgba(22, 51, 33, 0.12)',
                  marginBottom: '18px'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(230, 215, 185, 0.22)', color: '#faeed2', padding: '3px 10px', borderRadius: '9999px', fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <ShieldCheck size={12} color="#E6D7B9" /> Super Admin Control Desk
                </div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  AyurSutra Platform Management Console
                </h1>
                <p style={{ color: '#d3e4d6', fontSize: '0.84rem', marginTop: '4px', maxWidth: '600px', margin: '4px 0 0 0' }}>
                  Real-time 360° audits for Sellers, Doctors, and Patients, live sales tracking, treasury payouts, and compliance oversight.
                </p>
              </div>

              {/* Normalized Proportional Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '22px' }}>
                {[
                  { label: 'Pending Sellers', count: pendingFarmers.length, icon: Sprout, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', onClick: () => setActiveSection('farmers') },
                  { label: 'Pending Doctors', count: pendingDoctors.length, icon: Stethoscope, color: '#d97706', bg: '#fffbeb', border: '#fde68a', onClick: () => setActiveSection('doctors') },
                  { label: 'Total Patients', count: allUsers.filter(u => u.role === 'PATIENT').length, icon: Users, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', onClick: () => setActiveSection('patients') },
                  { label: 'Store Orders', count: adminOrders.length, icon: Store, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', onClick: () => setActiveSection('orders') },
                  { label: 'Pending Payouts', count: payouts.filter(p => p.status === 'PENDING').length, icon: CreditCard, color: '#be123c', bg: '#fff1f2', border: '#fecdd3', onClick: () => setActiveSection('payouts') }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={item.onClick}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        border: `1.5px solid ${item.border}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                          {item.label}
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#1e293b' }}>
                        {loading ? '...' : item.count}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sprout size={16} color="#059669" /> Sellers Pending Verification ({pendingFarmers.length})
                  </h3>
                  {pendingFarmers.length === 0 ? (
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>All sellers verified & approved.</p>
                  ) : (
                    pendingFarmers.slice(0, 3).map(f => (
                      <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{f.name}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{f.profile?.fpoOrFarmName || 'Organic Farm'}</div>
                        </div>
                        <button
                          onClick={() => { setSelectedFarmer360(f); setActiveDocIndex(0); }}
                          style={{ padding: '5px 10px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Inspect 360°
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={16} color="#d97706" /> Doctors Pending Verification ({pendingDoctors.length})
                  </h3>
                  {pendingDoctors.length === 0 ? (
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>All doctors verified & approved.</p>
                  ) : (
                    pendingDoctors.slice(0, 3).map(d => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{d.name}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{d.profile?.degree} • Reg #{d.profile?.registrationNumber}</div>
                        </div>
                        <button
                          onClick={() => { setSelectedDoctor360(d); setActiveDocIndex(0); }}
                          style={{ padding: '5px 10px', borderRadius: '6px', backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Inspect 360°
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 2: FARMERS (360° AUDIT & SOURCING)
          ========================================================================= */}
          {activeSection === 'farmers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sprout size={18} color="#059669" /> Seller Sourcing & 360° Lot Audit
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Click any seller to inspect full farm/inventory details, FSSAI cert, listed shop batches, sales revenue, and payouts.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#065f46', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                  {filteredFarmers.length} Sellers Found
                </span>
              </div>

              {renderFilterBar('Search seller name, farm, district, or phone...')}

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '11px 14px' }}>Seller / Farm Name</th>
                        <th style={{ padding: '11px 14px' }}>Location & Land</th>
                        <th style={{ padding: '11px 14px' }}>FSSAI Lic #</th>
                        <th style={{ padding: '11px 14px' }}>Lots Listed</th>
                        <th style={{ padding: '11px 14px' }}>Stock (kg)</th>
                        <th style={{ padding: '11px 14px' }}>Gross Sales</th>
                        <th style={{ padding: '11px 14px' }}>Status</th>
                        <th style={{ padding: '11px 14px', textAlign: 'right' }}>360° Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarmers.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No sellers match your filters.</td></tr>
                      ) : (
                        paginatedFarmers.map(frm => (
                          <tr key={frm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>{frm.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{frm.fpoOrFarmName}</div>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ color: '#334155' }}>{frm.farmDistrict}, {frm.farmState}</div>
                              <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>{frm.acreage} Acres</div>
                            </td>
                            <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#475569' }}>
                              {frm.fssaiNumber || 'Pending'}
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '700' }}>
                              {frm.batchesCount || frm.batches?.length || 0} Lots
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '700', color: frm.totalStockKg === 0 ? '#dc2626' : '#1e293b' }}>
                              {frm.totalStockKg || 0} kg
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#16a34a' }}>
                              ₹{(frm.grossSales || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px', backgroundColor: frm.status === 'APPROVED' ? '#ecfdf5' : frm.status === 'PENDING' ? '#fffbeb' : '#fef2f2', color: frm.status === 'APPROVED' ? '#065f46' : frm.status === 'PENDING' ? '#b45309' : '#991b1b' }}>
                                ● {frm.status}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => handleEnterAsUser(frm.userId || frm.id, 'FARMER')}
                                  title="Open full Seller Dashboard mode as this grower"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 11px',
                                    borderRadius: '7px',
                                    backgroundColor: '#059669',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontSize: '11.5px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
                                  }}
                                >
                                  <ExternalLink size={12} /> Enter as Seller
                                </button>
                                <button
                                  onClick={() => { setSelectedFarmer360(frm); setActiveDocIndex(0); }}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '7px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  360° Data
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={farmersPage}
                  totalPages={Math.ceil(filteredFarmers.length / pageSize) || 1}
                  totalItems={filteredFarmers.length}
                  pageSize={pageSize}
                  onPageChange={setFarmersPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 3: DOCTORS (360° AUDIT & CLINICIANS)
          ========================================================================= */}
          {activeSection === 'doctors' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={18} color="#d97706" /> Doctor Roster & 360° Clinical Audit
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Click any doctor to inspect clinical credentials, council certificates, patient consultations history, and earnings.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#b45309', backgroundColor: '#fffbeb', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #fde68a' }}>
                  {filteredDoctors.length} Doctors Found
                </span>
              </div>

              {renderFilterBar('Search doctor name, degree, registration number, or college...')}

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '11px 14px' }}>Doctor Name & Degree</th>
                        <th style={{ padding: '11px 14px' }}>AYUSH Reg Number</th>
                        <th style={{ padding: '11px 14px' }}>Consultations</th>
                        <th style={{ padding: '11px 14px' }}>Unique Patients</th>
                        <th style={{ padding: '11px 14px' }}>Gross Revenue</th>
                        <th style={{ padding: '11px 14px' }}>Net Payout (85%)</th>
                        <th style={{ padding: '11px 14px' }}>Status</th>
                        <th style={{ padding: '11px 14px', textAlign: 'right' }}>360° Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No doctors match your filters.</td></tr>
                      ) : (
                        paginatedDoctors.map(doc => (
                          <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>{doc.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.degree} • {doc.college}</div>
                            </td>
                            <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#475569' }}>
                              {doc.registrationNumber}
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '700' }}>
                              {doc.totalConsultations || doc.consultations?.length || 0}
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '700', color: '#2563eb' }}>
                              {doc.uniquePatientsCount || 0} Patients
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#0f172a' }}>
                              ₹{(doc.grossEarnings || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#16a34a' }}>
                              ₹{(doc.netDoctorPayout || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px', backgroundColor: doc.status === 'APPROVED' ? '#ecfdf5' : doc.status === 'PENDING' ? '#fffbeb' : '#fef2f2', color: doc.status === 'APPROVED' ? '#065f46' : doc.status === 'PENDING' ? '#b45309' : '#991b1b' }}>
                                ● {doc.status}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => handleEnterAsUser(doc.userId || doc.id, 'DOCTOR')}
                                  title="Open full Doctor Dashboard mode as this clinician"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 11px',
                                    borderRadius: '7px',
                                    backgroundColor: '#d97706',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontSize: '11.5px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
                                  }}
                                >
                                  <ExternalLink size={12} /> Enter as Doctor
                                </button>
                                <button
                                  onClick={() => { setSelectedDoctor360(doc); setActiveDocIndex(0); }}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '7px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  360° Data
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={doctorsPage}
                  totalPages={Math.ceil(filteredDoctors.length / pageSize) || 1}
                  totalItems={filteredDoctors.length}
                  pageSize={pageSize}
                  onPageChange={setDoctorsPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 4: PATIENTS (360° PROFILE, HISTORY & ORDERS)
          ========================================================================= */}
          {activeSection === 'patients' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="#7c3aed" /> Patient Directory & 360° Health History
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Click any patient to inspect chronic conditions, past doctor consultations, medicine orders, and chat queries.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#6d28d9', backgroundColor: '#f5f3ff', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #ddd6fe' }}>
                  {filteredPatients.length} Patients
                </span>
              </div>

              {renderFilterBar('Search patient name, email, or phone number...', false)}

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '11px 14px' }}>Patient Name</th>
                        <th style={{ padding: '11px 14px' }}>Assigned Doctor</th>
                        <th style={{ padding: '11px 14px' }}>Contact Details</th>
                        <th style={{ padding: '11px 14px' }}>Demographics</th>
                        <th style={{ padding: '11px 14px' }}>Consultations</th>
                        <th style={{ padding: '11px 14px' }}>Store Orders</th>
                        <th style={{ padding: '11px 14px' }}>Registered On</th>
                        <th style={{ padding: '11px 14px', textAlign: 'right' }}>360° Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No patients match your search.</td></tr>
                      ) : (
                        paginatedPatients.map(pat => (
                          <tr key={pat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#0f172a' }}>
                              {pat.name}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Stethoscope size={13} color="#059669" />
                                <span style={{ fontWeight: '700', color: '#166534', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', border: '1px solid #bbf7d0' }}>
                                  {pat.assignedDoctor || (pat.patientConsultations?.[0]?.doctor?.user?.name) || 'Dr. Ananya Sharma, BHMS'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <div>{pat.email}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{pat.phone}</div>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ fontSize: '11.5px', color: '#334155' }}>
                                {pat.patientProfile?.age ? `${pat.patientProfile.age} yrs` : 'Age: N/A'} • {pat.patientProfile?.gender || 'Gender: N/A'}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '700', color: '#059669' }}>
                              {pat.patientConsultations?.length || 0} Consults
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '700', color: '#2563eb' }}>
                              {pat.orders?.length || 0} Orders
                            </td>
                            <td style={{ padding: '11px 14px', color: '#64748b' }}>
                              {new Date(pat.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedPatient360(pat)}
                                style={{ padding: '5px 12px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                View 360° Record
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={patientsPage}
                  totalPages={Math.ceil(filteredPatients.length / pageSize) || 1}
                  totalItems={filteredPatients.length}
                  pageSize={pageSize}
                  onPageChange={setPatientsPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 5: STORE ORDERS & PAYMENTS (WITH SOURCING FARMER)
          ========================================================================= */}
          {activeSection === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={18} color="#2563eb" /> E-Commerce Orders & Farmer-to-Patient Traceability
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Track verified herb orders, sourcing farm cluster, payment status, and courier tracking numbers.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
                  {filteredOrders.length} Orders
                </span>
              </div>

              {renderFilterBar('Search order ID, patient, phone, or tracking number...', true, ['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'PENDING'])}

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '11px 14px' }}>Order ID</th>
                        <th style={{ padding: '11px 14px' }}>Patient Customer</th>
                        <th style={{ padding: '11px 14px' }}>Sourcing Farmer & FPO</th>
                        <th style={{ padding: '11px 14px' }}>Items & Qty</th>
                        <th style={{ padding: '11px 14px' }}>Amount</th>
                        <th style={{ padding: '11px 14px' }}>Payment Mode</th>
                        <th style={{ padding: '11px 14px' }}>Tracking #</th>
                        <th style={{ padding: '11px 14px' }}>Date</th>
                        <th style={{ padding: '11px 14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No orders found.</td></tr>
                      ) : (
                        paginatedOrders.map(ord => (
                          <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#0f172a' }}>
                              #{ord.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <strong>{ord.patientName || ord.user?.name || 'Patient'}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{ord.patientPhone || ord.user?.phone || ord.patientEmail || ord.user?.email}</div>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Sprout size={13} color="#059669" />
                                <span style={{ fontWeight: '700', color: '#166534', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', border: '1px solid #bbf7d0' }}>
                                  {ord.sourcingFarmers || 'Ramesh Patel (Malwa Herbal FPO)'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', color: '#475569' }}>
                              {ord.items?.length || 1} Items
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#1e293b' }}>
                              ₹{ord.totalAmount}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: ord.paymentMethod === 'UPI_QR' ? '#f0fdf4' : '#fffbeb', color: ord.paymentMethod === 'UPI_QR' ? '#166534' : '#b45309' }}>
                                {ord.paymentMethod}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', fontSize: '11.5px', color: '#2563eb', fontWeight: '700' }}>
                              {ord.trackingId || ord.trackingNumber || 'BLU-882109'}
                            </td>
                            <td style={{ padding: '11px 14px', color: '#64748b' }}>
                              {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#065f46' }}>
                                ● {ord.status || 'CONFIRMED'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={ordersPage}
                  totalPages={Math.ceil(filteredOrders.length / pageSize) || 1}
                  totalItems={filteredOrders.length}
                  pageSize={pageSize}
                  onPageChange={setOrdersPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 6: TREASURY PAYOUTS
          ========================================================================= */}
          {activeSection === 'payouts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="#be123c" /> Central Treasury & Settlement Disbursements
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Audit withdrawal requests from Doctors and Farmers and enter bank NEFT / UTR confirmation.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#be123c', backgroundColor: '#fff1f2', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #fecdd3' }}>
                  {filteredPayouts.filter(p => p.status === 'PENDING').length} Pending Settlement
                </span>
              </div>

              {renderFilterBar('Search beneficiary name, bank, or UTR number...', true, ['ALL', 'PENDING', 'SETTLED', 'REJECTED'])}

              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '11px 14px' }}>Beneficiary</th>
                        <th style={{ padding: '11px 14px' }}>Role</th>
                        <th style={{ padding: '11px 14px' }}>Requested Amount</th>
                        <th style={{ padding: '11px 14px' }}>Bank Account & IFSC</th>
                        <th style={{ padding: '11px 14px' }}>Date</th>
                        <th style={{ padding: '11px 14px' }}>Status</th>
                        <th style={{ padding: '11px 14px', textAlign: 'right' }}>Treasury Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayouts.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No payouts match your filters.</td></tr>
                      ) : (
                        paginatedPayouts.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#0f172a' }}>{p.userName}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: '800', backgroundColor: p.userRole === 'DOCTOR' ? '#eff6ff' : '#ecfdf5', color: p.userRole === 'DOCTOR' ? '#1e40af' : '#065f46' }}>
                                {p.userRole}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '800', color: '#0f172a' }}>
                              ₹{p.amount.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ color: '#334155' }}>{p.bankName}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{p.bankAccountNo} • IFSC: {p.bankIfsc}</div>
                            </td>
                            <td style={{ padding: '11px 14px', color: '#64748b' }}>
                              {new Date(p.requestedAt).toLocaleDateString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px', backgroundColor: p.status === 'SETTLED' ? '#ecfdf5' : '#fef3c7', color: p.status === 'SETTLED' ? '#065f46' : '#92400e' }}>
                                ● {p.status}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                              {p.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleSettlePayout(p.id)}
                                  style={{ backgroundColor: '#15803d', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  Settle UTR
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', fontFamily: 'monospace' }}>
                                  {p.transactionRef || 'SETTLED'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={payoutsPage}
                  totalPages={Math.ceil(filteredPayouts.length / pageSize) || 1}
                  totalItems={filteredPayouts.length}
                  pageSize={pageSize}
                  onPageChange={setPayoutsPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 7: CHAT MONITOR (WITH SENDER & RECEIVER IDENTIFICATION)
          ========================================================================= */}
          {activeSection === 'chats' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="#2563eb" /> Doctor-Patient Chat Compliance Audit
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Complete audit trail showing exact conversations between Doctors and Patients with role tags and timestamps.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '9999px' }}>
                  {paginatedChats.total} Messages Logged
                </span>
              </div>

              {renderFilterBar('Filter messages by sender, receiver, or keyword...', false)}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paginatedChats.items.length === 0 ? (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '36px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                    No chat compliance logs match your search.
                  </div>
                ) : (
                  paginatedChats.items.map(msg => (
                    <div key={msg.id} style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
                          {msg.senderName}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', backgroundColor: msg.senderRole === 'DOCTOR' ? '#eff6ff' : '#ecfdf5', color: msg.senderRole === 'DOCTOR' ? '#1e40af' : '#065f46' }}>
                          {msg.senderRole}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '800' }}>➔ to ➔</span>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>
                          {msg.receiverName}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', backgroundColor: msg.receiverRole === 'DOCTOR' ? '#eff6ff' : '#ecfdf5', color: msg.receiverRole === 'DOCTOR' ? '#1e40af' : '#065f46' }}>
                          {msg.receiverRole}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {new Date(msg.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                        "{msg.message}"
                      </p>
                    </div>
                  ))
                )}

                <Pagination
                  currentPage={chatsPage}
                  totalPages={Math.ceil(paginatedChats.total / pageSize) || 1}
                  totalItems={paginatedChats.total}
                  pageSize={pageSize}
                  onPageChange={setChatsPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 8: SUPPORT CENTRE (LIVE HELPDESK FOR USERS, DOCTORS & FARMERS)
          ========================================================================= */}
          {activeSection === 'support' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LifeBuoy size={18} color="#059669" /> Support Centre • Central Helpdesk & Resolution Queue
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Real-time tickets raised by Farmers, Doctors, and Patients for payout settlements, clinical questions, or delivery issues.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#065f46', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                    {supportTotal} Total Tickets
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#991b1b', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #fecaca' }}>
                    {supportTickets.filter(t => t.status === 'OPEN').length} Open
                  </span>
                </div>
              </div>

              {/* Support Filter Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search ticket #, subject, user name, or email..." 
                    value={supportSearch} 
                    onChange={e => { setSupportSearch(e.target.value); setSupportPage(1); }}
                    style={{ width: '100%', padding: '7px 12px 7px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <select
                  value={supportStatusFilter}
                  onChange={e => { setSupportStatusFilter(e.target.value); setSupportPage(1); }}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '700', color: '#334155' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">OPEN (Unresolved)</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>

                <select
                  value={supportCategoryFilter}
                  onChange={e => { setSupportCategoryFilter(e.target.value); setSupportPage(1); }}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '700', color: '#334155' }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="PAYOUT">Bank Payouts & Settlement</option>
                  <option value="CONSULTATION">Doctor Consultations</option>
                  <option value="ORDER">Orders & BlueDart Delivery</option>
                  <option value="HARVEST_BATCH">Harvest Verification & QA</option>
                  <option value="TECHNICAL">Technical & App Issues</option>
                  <option value="OTHER">Other Inquiries</option>
                </select>

                <select
                  value={supportRoleFilter}
                  onChange={e => { setSupportRoleFilter(e.target.value); setSupportPage(1); }}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '700', color: '#334155' }}
                >
                  <option value="ALL">All User Roles</option>
                  <option value="PATIENT">Patients</option>
                  <option value="DOCTOR">Doctors</option>
                  <option value="FARMER">Farmers</option>
                </select>

                <button
                  onClick={fetchSupportTickets}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  <RefreshCw size={12} className={supportLoading ? 'animate-spin' : ''} /> Refresh Queue
                </button>
              </div>

              {/* Tickets Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '11px 14px' }}>Ticket # & Priority</th>
                        <th style={{ padding: '11px 14px' }}>Requester Profile</th>
                        <th style={{ padding: '11px 14px' }}>Role</th>
                        <th style={{ padding: '11px 14px' }}>Category</th>
                        <th style={{ padding: '11px 14px' }}>Subject & Description</th>
                        <th style={{ padding: '11px 14px' }}>Date</th>
                        <th style={{ padding: '11px 14px' }}>Status</th>
                        <th style={{ padding: '11px 14px', textAlign: 'right' }}>Resolution Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supportTickets.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>No support tickets found matching criteria.</td></tr>
                      ) : (
                        supportTickets.map(t => (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>#{t.ticketNumber}</div>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '800',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: t.priority === 'URGENT' || t.priority === 'HIGH' ? '#fef2f2' : '#f8fafc',
                                color: t.priority === 'URGENT' || t.priority === 'HIGH' ? '#dc2626' : '#64748b',
                                border: `1px solid ${t.priority === 'URGENT' || t.priority === 'HIGH' ? '#fecaca' : '#e2e8f0'}`
                              }}>
                                {t.priority}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <div style={{ fontWeight: '700', color: '#1e293b' }}>{t.userName}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{t.userEmail} {t.userPhone && `• ${t.userPhone}`}</div>
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: '800',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: t.userRole === 'DOCTOR' ? '#fffbeb' : t.userRole === 'FARMER' ? '#ecfdf5' : '#eff6ff',
                                color: t.userRole === 'DOCTOR' ? '#b45309' : t.userRole === 'FARMER' ? '#065f46' : '#1e40af'
                              }}>
                                {t.userRole}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', fontWeight: '700', color: '#475569' }}>
                              {t.category}
                            </td>
                            <td style={{ padding: '11px 14px', maxWidth: '300px' }}>
                              <div style={{ fontWeight: '800', color: '#1e293b', marginBottom: '2px' }}>{t.subject}</div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {t.description}
                              </div>
                            </td>
                            <td style={{ padding: '11px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {new Date(t.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td style={{ padding: '11px 14px' }}>
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: '800',
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                backgroundColor: t.status === 'RESOLVED' ? '#ecfdf5' : t.status === 'IN_PROGRESS' ? '#fffbeb' : '#fef2f2',
                                color: t.status === 'RESOLVED' ? '#065f46' : t.status === 'IN_PROGRESS' ? '#b45309' : '#b91c1c'
                              }}>
                                ● {t.status}
                              </span>
                            </td>
                            <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                              <button
                                onClick={() => {
                                  setSelectedTicketDrawer(t);
                                  setAdminReplyText(t.adminResponse || t.adminReply || '');
                                  setReplyStatus(t.status === 'OPEN' ? 'RESOLVED' : t.status);
                                }}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  backgroundColor: '#163321',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                Review & Reply
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={supportPage}
                  totalPages={Math.ceil(supportTotal / pageSize) || 1}
                  totalItems={supportTotal}
                  pageSize={pageSize}
                  onPageChange={setSupportPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 9: SYSTEM RULES & COMMISSION (PERSISTENT & INTERACTIVE)
          ========================================================================= */}
          {activeSection === 'settings' && (
            <div style={{ maxWidth: '820px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SlidersHorizontal size={20} color="#163321" /> Platform Rules, Fees & Treasury Commissions
                  </h2>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Configure nationwide platform margins, settlement rules, auto-approvals, and payment methods. Persisted directly to database.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSystemRules} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Financial Commissions Card */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} color="#059669" /> Revenue Sharing & Commission Structure
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Blended Platform Commission (%)
                      </label>
                      <input 
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={systemSettings.platformCommission}
                        onChange={e => setSystemSettings(prev => ({ ...prev, platformCommission: parseFloat(e.target.value) || 0 }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Applied to consolidated gross revenue</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Doctor Consultation Fee Split (%)
                      </label>
                      <input 
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={systemSettings.doctorCommission}
                        onChange={e => setSystemSettings(prev => ({ ...prev, doctorCommission: parseFloat(e.target.value) || 0 }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Deducted from teleconsultation earnings</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        Farmer Marketplace Fee Split (%)
                      </label>
                      <input 
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={systemSettings.farmerCommission}
                        onChange={e => setSystemSettings(prev => ({ ...prev, farmerCommission: parseFloat(e.target.value) || 0 }))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Deducted from herb batch wholesale orders</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                      Minimum Payout Disbursement Threshold (₹)
                    </label>
                    <input 
                      type="number"
                      min="100"
                      step="100"
                      value={systemSettings.minPayoutAmount}
                      onChange={e => setSystemSettings(prev => ({ ...prev, minPayoutAmount: parseFloat(e.target.value) || 500 }))}
                      style={{ maxWidth: '280px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Minimum wallet balance required for Doctors/Farmers to trigger bank NEFT payout</span>
                  </div>
                </div>

                {/* Operations & Verification Rules Card */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#2563eb" /> Operational Policies & Access Controls
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>Cash on Delivery (COD) Nationwide</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>Allow patients to pay post-receipt of certified herb consignments</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSystemSettings(prev => ({ ...prev, codEnabled: !prev.codEnabled }))}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          border: 'none',
                          backgroundColor: systemSettings.codEnabled ? '#059669' : '#94a3b8',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {systemSettings.codEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>Auto-Approve Doctor Registrations</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>Bypass manual 360° council document check (Recommended: DISABLED)</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSystemSettings(prev => ({ ...prev, autoApproveDoctors: !prev.autoApproveDoctors }))}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          border: 'none',
                          backgroundColor: systemSettings.autoApproveDoctors ? '#059669' : '#94a3b8',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {systemSettings.autoApproveDoctors ? 'AUTO-APPROVE' : 'MANUAL REVIEW'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>Auto-Approve Farmer FPO Onboarding</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>Bypass manual FSSAI and organic certificate verification</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSystemSettings(prev => ({ ...prev, autoApproveFarmers: !prev.autoApproveFarmers }))}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          border: 'none',
                          backgroundColor: systemSettings.autoApproveFarmers ? '#059669' : '#94a3b8',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {systemSettings.autoApproveFarmers ? 'AUTO-APPROVE' : 'MANUAL REVIEW'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: systemSettings.maintenanceMode ? '#fef2f2' : '#f8fafc', borderRadius: '10px', border: `1px solid ${systemSettings.maintenanceMode ? '#fecaca' : '#f1f5f9'}` }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: systemSettings.maintenanceMode ? '#991b1b' : '#1e293b' }}>Platform Maintenance Mode</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>Temporarily pause bookings and checkout for system upgrade</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSystemSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          border: 'none',
                          backgroundColor: systemSettings.maintenanceMode ? '#dc2626' : '#94a3b8',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {systemSettings.maintenanceMode ? 'ACTIVE LOCKDOWN' : 'OFFLINE'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      backgroundColor: '#163321',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: savingSettings ? 'wait' : 'pointer',
                      boxShadow: '0 4px 12px rgba(22, 51, 33, 0.2)'
                    }}
                  >
                    <Check size={16} />
                    {savingSettings ? 'Saving to Database...' : 'Save & Persist System Rules'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          360° INSPECTION DRAWER: SELLER (FARMER)
      ========================================================================= */}
      <Drawer
        isOpen={!!selectedFarmer360}
        onClose={() => setSelectedFarmer360(null)}
        width="660px"
        title={selectedFarmer360?.fpoOrFarmName || selectedFarmer360?.name || 'Seller 360° Audit'}
        subtitle={`Lead: ${selectedFarmer360?.name} • Status: ${selectedFarmer360?.status}`}
        badge="Seller 360°"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '10px' }}>
            {selectedFarmer360?.status === 'PENDING' ? (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => setShowRejectInput(!showRejectInput)}
                  style={{ padding: '8px 16px', borderRadius: '9999px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {showRejectInput ? 'Cancel' : 'Reject Application'}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedFarmer360.userId || selectedFarmer360.id, 'APPROVED')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '9999px', border: 'none', backgroundColor: '#059669', color: '#ffffff', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                >
                  <CheckCircle2 size={15} /> Approve & Grant Verified Sourcing Badge
                </button>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                ✓ Verified Agricultural Partner
              </span>
            )}
          </div>
        }
      >
        {selectedFarmer360 && (
          <div>
            <button
              onClick={() => handleEnterAsUser(selectedFarmer360.userId || selectedFarmer360.id, 'FARMER')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#059669',
                color: '#ffffff',
                padding: '11px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
              }}
            >
              <ExternalLink size={15} /> Enter Full Seller Dashboard Mode as {selectedFarmer360.name}
            </button>
            {showRejectInput && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', margin: '0 0 4px 0' }}>
                  Specify Regulatory Rejection Reason
                </h4>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. FSSAI certificate expired or blurred. Please upload valid certificate."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f87171', fontSize: '12px', boxSizing: 'border-box', marginBottom: '10px' }}
                />
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedFarmer360.userId || selectedFarmer360.id, 'REJECTED', rejectionReason)}
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                >
                  Confirm Rejection
                </button>
              </div>
            )}

            {/* Farm Profile Summary */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                1. Farm & Sourcing Profile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>FARM / FPO ENTITY</span>
                  <strong style={{ color: '#1e293b' }}>{selectedFarmer360.fpoOrFarmName}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>LEAD GROWER CONTACT</span>
                  <strong style={{ color: '#1e293b' }}>{selectedFarmer360.name}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedFarmer360.phone} • {selectedFarmer360.email}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>FARM LOCATION & ACREAGE</span>
                  <strong style={{ color: '#1e293b' }}>{selectedFarmer360.farmDistrict}, {selectedFarmer360.farmState}</strong>
                  <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700' }}>{selectedFarmer360.acreage} Acres Certified Organic</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>FSSAI 14-DIGIT LICENSE</span>
                  <strong style={{ color: '#059669', fontFamily: 'monospace' }}>{selectedFarmer360.fssaiNumber || 'Pending'}</strong>
                </div>
              </div>
            </div>

            {/* Shop Stock & Batches */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  2. Shop Stock & Herb Lots ({(selectedFarmer360.batches || []).length})
                </span>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                  Total Available: {selectedFarmer360.totalStockKg || 0} kg
                </span>
              </div>

              {(selectedFarmer360.batches || []).length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  No herb batches currently listed by this grower.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                        <th style={{ padding: '8px 10px' }}>Herb</th>
                        <th style={{ padding: '8px 10px' }}>Stock</th>
                        <th style={{ padding: '8px 10px' }}>Price/100g</th>
                        <th style={{ padding: '8px 10px' }}>Sold</th>
                        <th style={{ padding: '8px 10px' }}>Harvest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFarmer360.batches.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: '#1e293b' }}>
                            {b.herbName}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: b.quantityKg === 0 ? '#dc2626' : '#1e293b' }}>
                            {b.quantityKg} kg
                          </td>
                          <td style={{ padding: '8px 10px' }}>₹{b.pricePer100g}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>{b.soldQuantityKg || 0} kg</td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>
                            {b.harvestDate ? new Date(b.harvestDate).toLocaleDateString('en-IN') : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sales & Financial Details */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                3. Financial Revenue & Settlement Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>Gross Sales</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>₹{(selectedFarmer360.grossSales || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '10.5px', color: '#065f46' }}>Net Payout (95%)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>₹{(selectedFarmer360.netFarmerPayout || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>Platform Fee (5%)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#475569' }}>₹{Math.round((selectedFarmer360.grossSales || 0) * 0.05).toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                <strong>Bank Account:</strong> {selectedFarmer360.profile?.bankName || selectedFarmer360.bankName || 'State Bank of India'} • A/C: {selectedFarmer360.profile?.bankAccountNo || selectedFarmer360.bankAccountNo || '•••••• 8921'} (IFSC: {selectedFarmer360.profile?.bankIfsc || selectedFarmer360.bankIfsc || 'SBIN0001824'})
              </div>
            </div>

            {/* Regulatory PDF Certificates */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                4. Regulatory PDF Certificates
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '10px' }}>
                {getInspectionDocuments(selectedFarmer360, 'FARMER').map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDocIndex(idx)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: activeDocIndex === idx ? '2px solid #059669' : '1px solid #cbd5e1',
                      backgroundColor: activeDocIndex === idx ? '#ecfdf5' : '#ffffff',
                      color: activeDocIndex === idx ? '#065f46' : '#475569',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {doc.label.split(' ')[0]} {doc.label.split(' ')[1]}
                  </button>
                ))}
              </div>

              {getInspectionDocuments(selectedFarmer360, 'FARMER')[activeDocIndex] && (
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                  <FileText size={28} color="#059669" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                    {getInspectionDocuments(selectedFarmer360, 'FARMER')[activeDocIndex].label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    SHA-256 Validated Digital Proof
                  </div>
                  <a
                    href={getInspectionDocuments(selectedFarmer360, 'FARMER')[activeDocIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#059669', color: '#ffffff', padding: '6px 14px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: '700', textDecoration: 'none' }}
                  >
                    <Download size={13} /> View / Download PDF
                  </a>
                </div>
              )}
            </div>

          </div>
        )}
      </Drawer>

      {/* =========================================================================
          360° INSPECTION DRAWER: DOCTOR
      ========================================================================= */}
      <Drawer
        isOpen={!!selectedDoctor360}
        onClose={() => setSelectedDoctor360(null)}
        width="660px"
        title={selectedDoctor360?.name || 'Doctor 360° Audit'}
        subtitle={`Degree: ${selectedDoctor360?.degree || selectedDoctor360?.profile?.degree} • Reg #${selectedDoctor360?.registrationNumber || selectedDoctor360?.profile?.registrationNumber}`}
        badge="Doctor 360°"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '10px' }}>
            {selectedDoctor360?.status === 'PENDING' ? (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => setShowRejectInput(!showRejectInput)}
                  style={{ padding: '8px 16px', borderRadius: '9999px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {showRejectInput ? 'Cancel' : 'Reject Application'}
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedDoctor360.userId || selectedDoctor360.id, 'APPROVED')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '9999px', border: 'none', backgroundColor: '#059669', color: '#ffffff', fontSize: '12.5px', fontWeight: '800', cursor: 'pointer' }}
                >
                  <CheckCircle2 size={15} /> Approve & Grant AYUSH Verified Clinician Badge
                </button>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                ✓ AYUSH Verified Clinician
              </span>
            )}
          </div>
        }
      >
        {selectedDoctor360 && (
          <div>
            <button
              onClick={() => handleEnterAsUser(selectedDoctor360.userId || selectedDoctor360.id, 'DOCTOR')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#d97706',
                color: '#ffffff',
                padding: '11px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
              }}
            >
              <ExternalLink size={15} /> Enter Full Doctor Dashboard Mode as Dr. {selectedDoctor360.name}
            </button>
            {showRejectInput && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', margin: '0 0 4px 0' }}>
                  Specify Clinical Rejection Reason
                </h4>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Council certificate registration number does not match council registry."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f87171', fontSize: '12px', boxSizing: 'border-box', marginBottom: '10px' }}
                />
                <button
                  disabled={actionLoading}
                  onClick={() => handleVerify(selectedDoctor360.userId || selectedDoctor360.id, 'REJECTED', rejectionReason)}
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                >
                  Confirm Rejection
                </button>
              </div>
            )}

            {/* Doctor Clinical Profile */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                1. Clinical Qualifications & Registry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>MEDICAL DEGREE & COLLEGE</span>
                  <strong style={{ color: '#1e293b' }}>{selectedDoctor360.degree || selectedDoctor360.profile?.degree}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedDoctor360.college || selectedDoctor360.profile?.college}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>COUNCIL REGISTRATION NO.</span>
                  <strong style={{ color: '#059669', fontFamily: 'monospace' }}>{selectedDoctor360.registrationNumber || selectedDoctor360.profile?.registrationNumber}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedDoctor360.councilName || selectedDoctor360.profile?.councilName}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>EXPERIENCE & FEE</span>
                  <strong style={{ color: '#1e293b' }}>{selectedDoctor360.experienceYears || selectedDoctor360.profile?.experienceYears || 5} Years Experience</strong>
                  <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700' }}>₹{selectedDoctor360.consultationFee || selectedDoctor360.profile?.consultationFee || 499} per consultation</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>CONTACT</span>
                  <strong style={{ color: '#1e293b' }}>{selectedDoctor360.phone}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedDoctor360.email}</div>
                </div>
              </div>
            </div>

            {/* Consultations Roster */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  2. Patient Consultations History ({(selectedDoctor360.consultations || []).length})
                </span>
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>
                  Unique Patients: {selectedDoctor360.uniquePatientsCount || 0}
                </span>
              </div>

              {(selectedDoctor360.consultations || []).length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  No consultations conducted yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                        <th style={{ padding: '8px 10px' }}>Patient</th>
                        <th style={{ padding: '8px 10px' }}>Date</th>
                        <th style={{ padding: '8px 10px' }}>Fee Paid</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDoctor360.consultations.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: '#1e293b' }}>
                            {c.patient?.name || 'Patient'}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>
                            {new Date(c.scheduledAt).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: '#16a34a' }}>
                            ₹{c.feePaid || 499}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46' }}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Revenue Performance */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                3. Financial Revenue Breakdown
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>Gross Earnings</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>₹{(selectedDoctor360.grossEarnings || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '10.5px', color: '#065f46' }}>Net Payout (85%)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#059669' }}>₹{(selectedDoctor360.netDoctorPayout || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>Platform Cut (15%)</div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#475569' }}>₹{(selectedDoctor360.platformFeeDeducted || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Regulatory PDF Certificates */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                4. AYUSH Medical Certificates & Degrees
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '10px' }}>
                {getInspectionDocuments(selectedDoctor360, 'DOCTOR').map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDocIndex(idx)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: activeDocIndex === idx ? '2px solid #059669' : '1px solid #cbd5e1',
                      backgroundColor: activeDocIndex === idx ? '#ecfdf5' : '#ffffff',
                      color: activeDocIndex === idx ? '#065f46' : '#475569',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {doc.label.split(' ')[0]} {doc.label.split(' ')[1]}
                  </button>
                ))}
              </div>

              {getInspectionDocuments(selectedDoctor360, 'DOCTOR')[activeDocIndex] && (
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                  <FileText size={28} color="#059669" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                    {getInspectionDocuments(selectedDoctor360, 'DOCTOR')[activeDocIndex].label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    Council Verified Digital Record
                  </div>
                  <a
                    href={getInspectionDocuments(selectedDoctor360, 'DOCTOR')[activeDocIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#059669', color: '#ffffff', padding: '6px 14px', borderRadius: '9999px', fontSize: '11.5px', fontWeight: '700', textDecoration: 'none' }}
                  >
                    <Download size={13} /> View / Download PDF
                  </a>
                </div>
              )}
            </div>

          </div>
        )}
      </Drawer>

      {/* =========================================================================
          360° INSPECTION DRAWER: PATIENT
      ========================================================================= */}
      <Drawer
        isOpen={!!selectedPatient360}
        onClose={() => setSelectedPatient360(null)}
        width="660px"
        title={selectedPatient360?.name || 'Patient 360° Profile'}
        subtitle={`Enrolled: ${selectedPatient360?.createdAt ? new Date(selectedPatient360.createdAt).toLocaleDateString('en-IN') : 'Active'}`}
        badge="Patient 360°"
      >
        {selectedPatient360 && (
          <div>
            {/* Demographics & Medical Case History */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                1. Medical Demographics & Lifestyle
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>FULL LEGAL NAME</span>
                  <strong style={{ color: '#1e293b' }}>{selectedPatient360.name}</strong>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedPatient360.email} • {selectedPatient360.phone}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>AGE / GENDER / BLOOD GROUP</span>
                  <strong style={{ color: '#1e293b' }}>
                    {selectedPatient360.patientProfile?.age || '28'} Years • {selectedPatient360.patientProfile?.gender || 'Male'}
                  </strong>
                  <div style={{ fontSize: '11.5px', color: '#be123c', fontWeight: '700' }}>Blood Group: {selectedPatient360.patientProfile?.bloodGroup || 'B+'}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>DIET CONSTITUTION</span>
                  <strong style={{ color: '#059669' }}>{selectedPatient360.patientProfile?.dietType || 'Sattvic Vegetarian'}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>EMERGENCY CONTACT</span>
                  <strong style={{ color: '#1e293b' }}>{selectedPatient360.patientProfile?.emergencyContact || '+91 98765 00000'}</strong>
                </div>
              </div>
            </div>

            {/* Chronic Conditions & Allergies */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. Chronic Conditions & Known Allergies
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {(selectedPatient360.patientProfile?.existingConditions ? (typeof selectedPatient360.patientProfile.existingConditions === 'string' ? JSON.parse(selectedPatient360.patientProfile.existingConditions || '[]') : selectedPatient360.patientProfile.existingConditions) : ['Type 2 Diabetes', 'Acid Reflux / Pitta']).map((c, i) => (
                  <span key={i} style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                    ● {c}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                <strong>Allergies:</strong> {selectedPatient360.patientProfile?.allergies || 'None reported'} • <strong>Current Medications:</strong> {selectedPatient360.patientProfile?.currentMedications || 'Metformin 500mg, Triphala Churna'}
              </div>
            </div>

            {/* Doctor Consultations History */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                3. Doctor Consultations ({(selectedPatient360.patientConsultations || []).length})
              </div>

              {(selectedPatient360.patientConsultations || []).length === 0 ? (
                <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  No consultations booked yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff', color: '#64748b' }}>
                        <th style={{ padding: '8px 10px' }}>Doctor</th>
                        <th style={{ padding: '8px 10px' }}>Date</th>
                        <th style={{ padding: '8px 10px' }}>Fee</th>
                        <th style={{ padding: '8px 10px' }}>Prescription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatient360.patientConsultations.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '700', color: '#1e293b' }}>
                            {c.doctor?.user?.name || 'Doctor'}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>
                            {new Date(c.scheduledAt).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: '700' }}>₹{c.feePaid || 499}</td>
                          <td style={{ padding: '8px 10px', color: '#059669', fontWeight: '700' }}>
                            {c.prescription ? 'Rx Issued' : 'Pending Rx'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Store Orders History */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                4. Herb Store Orders ({(selectedPatient360.orders || []).length})
              </div>

              {(selectedPatient360.orders || []).length === 0 ? (
                <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  No store orders placed yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                        <th style={{ padding: '8px 10px' }}>Order ID</th>
                        <th style={{ padding: '8px 10px' }}>Date</th>
                        <th style={{ padding: '8px 10px' }}>Amount</th>
                        <th style={{ padding: '8px 10px' }}>Tracking</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatient360.orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', fontWeight: '700' }}>#{o.id.slice(0, 8).toUpperCase()}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          <td style={{ padding: '8px 10px', fontWeight: '800' }}>₹{o.totalAmount}</td>
                          <td style={{ padding: '8px 10px', color: '#2563eb' }}>{o.trackingNumber || 'BLU-882109'}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#065f46' }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </Drawer>

      {/* SUPPORT TICKET REVIEW & RESOLUTION DRAWER */}
      <Drawer
        isOpen={!!selectedTicketDrawer}
        onClose={() => setSelectedTicketDrawer(null)}
        width="540px"
        title={selectedTicketDrawer ? `Support Ticket #${selectedTicketDrawer.ticketNumber}` : 'Support Ticket'}
      >
        {selectedTicketDrawer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Ticket Header Card */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#e0e7ff', color: '#3730a3', textTransform: 'uppercase' }}>
                  {selectedTicketDrawer.userRole} SUPPORT
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  backgroundColor: selectedTicketDrawer.status === 'RESOLVED' ? '#ecfdf5' : '#fffbeb',
                  color: selectedTicketDrawer.status === 'RESOLVED' ? '#065f46' : '#92400e'
                }}>
                  ● {selectedTicketDrawer.status}
                </span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>
                {selectedTicketDrawer.userName}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {selectedTicketDrawer.userEmail} {selectedTicketDrawer.userPhone && `• ${selectedTicketDrawer.userPhone}`}
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>
                Raised on: {new Date(selectedTicketDrawer.createdAt).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Subject & Description */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Category: {selectedTicketDrawer.category} • Priority: {selectedTicketDrawer.priority}
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '4px 0 8px 0' }}>
                {selectedTicketDrawer.subject}
              </h4>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedTicketDrawer.description}
              </p>
            </div>

            {/* Existing Admin Response (if any) */}
            {selectedTicketDrawer.adminResponse && (
              <div style={{ backgroundColor: '#ecfdf5', borderRadius: '12px', padding: '14px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#065f46', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Previous Response from {selectedTicketDrawer.repliedBy || 'Super Admin'} ({selectedTicketDrawer.repliedAt ? new Date(selectedTicketDrawer.repliedAt).toLocaleDateString() : 'Recorded'}):
                </div>
                <div style={{ fontSize: '12.5px', color: '#064e3b', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {selectedTicketDrawer.adminResponse}
                </div>
              </div>
            )}

            {/* Response Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Update Ticket Status:
                </label>
                <select
                  value={replyStatus}
                  onChange={e => setReplyStatus(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="OPEN">OPEN (Under Investigation)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Working on Resolution)</option>
                  <option value="RESOLVED">RESOLVED (Action Completed)</option>
                  <option value="CLOSED">CLOSED (Case Terminated)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Official Super Admin Resolution / Response:
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed redressal or guidance for this user..."
                  value={adminReplyText}
                  onChange={e => setAdminReplyText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTicketDrawer(null)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12.5px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={replyingTicket}
                  onClick={handleReplyTicket}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#163321', fontSize: '12.5px', fontWeight: '800', color: '#ffffff', cursor: replyingTicket ? 'not-allowed' : 'pointer' }}
                >
                  {replyingTicket ? 'Saving...' : 'Submit Resolution'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* QUICK CONTROLS DRAWER */}
      <Drawer
        isOpen={controlsDrawerOpen}
        onClose={() => setControlsDrawerOpen(false)}
        width="440px"
        title="Quick Platform Controls"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', marginBottom: '12px' }}>
              System Configuration
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>Cash on Delivery</strong>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Allow pay-on-arrival</div>
              </div>
              <button
                onClick={() => handleSaveSetting('allowCod', !systemSettings.allowCod)}
                style={{ padding: '5px 12px', borderRadius: '9999px', border: 'none', backgroundColor: systemSettings.allowCod ? '#059669' : '#94a3b8', color: '#ffffff', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
              >
                {systemSettings.allowCod ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>Auto-Confirm Orders</strong>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Instant BlueDart dispatch</div>
              </div>
              <button
                onClick={() => handleSaveSetting('autoConfirmOrders', !systemSettings.autoConfirmOrders)}
                style={{ padding: '5px 12px', borderRadius: '9999px', border: 'none', backgroundColor: systemSettings.autoConfirmOrders ? '#059669' : '#94a3b8', color: '#ffffff', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
              >
                {systemSettings.autoConfirmOrders ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => { setActiveSection('farmers'); setControlsDrawerOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
            >
              <span>Audit Farmers ({pendingFarmers.length} pending)</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => { setActiveSection('doctors'); setControlsDrawerOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa', backgroundColor: '#fffbeb', color: '#92400e', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
            >
              <span>Audit Doctors ({pendingDoctors.length} pending)</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => { setActiveSection('orders'); setControlsDrawerOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1e40af', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
            >
              <span>Review Store Orders ({adminOrders.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Drawer>

      <style>{`
        .admin-mobile-menu-btn {
          display: none;
        }
        @media (max-width: 900px) {
          .admin-mobile-menu-btn {
            display: flex !important;
          }
          .admin-sidebar-drawer {
            position: fixed !important;
            left: -320px;
            top: 0;
            bottom: 0;
            width: 275px !important;
            transition: left 0.28s ease !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3) !important;
          }
          .admin-drawer-open {
            position: fixed !important;
            left: 0 !important;
            top: 0;
            bottom: 0;
            width: 275px !important;
            transition: left 0.28s ease !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3) !important;
          }
          .admin-header-bar {
            padding: 8px 12px !important;
          }
          .admin-content-body {
            padding: 12px 10px !important;
          }
          table {
            min-width: 650px !important;
          }
        }
        @media (min-width: 901px) {
          .admin-sidebar-drawer {
            display: flex !important;
          }
          .admin-mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .admin-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .admin-filter-bar > div {
            width: 100% !important;
            flex: none !important;
            height: auto !important;
            min-height: unset !important;
          }
          .admin-filter-bar input,
          .admin-filter-bar select {
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Super Admin Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        roleName="Super Admin"
      />
    </div>
  );
}
