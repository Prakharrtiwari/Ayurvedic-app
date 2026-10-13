// NOTE: "Farmer" and "Seller" are synonymous in this platform (farmer hi seller hai).
// The UI displays "Seller Console", "Seller Profile", "Seller / Sourcing", etc. to the user,
// while internal backend routes (/farmer/...) and DB role 'FARMER' remain unchanged for seamless compatibility.
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { farmerApi, uploadImage, uploadPdf } from '../../services/api';
import Drawer from '../../components/Drawer';
import SignOutConfirmModal from '../../components/SignOutConfirmModal';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Clock, 
  CheckCircle2, 
  Plus, 
  QrCode, 
  FileText, 
  MapPin, 
  Award,
  Layers,
  Leaf,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Menu,
  X,
  Search,
  DollarSign,
  TrendingUp,
  Filter,
  LogOut,
  Store,
  Calendar,
  Truck,
  Droplets,
  Edit3,
  Trash2,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronDown,
  Building,
  CreditCard,
  Check,
  Package,
  Landmark,
  LifeBuoy
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import RaiseSupportTicketModal from '../../components/RaiseSupportTicketModal';
import useModalBackButton from '../../hooks/useModalBackButton';
import { getSocket, joinUserRoom } from '../../services/socket';

const DEFAULT_CATEGORIES = [
  'Roots',
  'Powders',
  'Whole Leaves',
  'Seeds',
  'Barks',
  'Decoctions (Kadhas)',
  'Cold-Pressed Oils',
  'Ayurvedic Kitchen Herbs'
];

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Navigation & Layout
  const [activeNav, setActiveNav] = useState('inventory'); // 'inventory', 'finances', 'categories', 'reviews', 'traceability', 'profile'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Farmer Profile & Bank Details State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    fpoOrFarmName: '',
    farmState: '',
    farmDistrict: '',
    farmVillage: '',
    acreage: '',
    bankName: '',
    bankAccountNo: '',
    bankIfsc: '',
    bankHolderName: '',
    upiId: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Search, Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('All'); // 'All', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const itemsPerPage = 6;

  // Add / Edit Herb Modal States (Unified: same options for Add & Edit)
  const [herbModalMode, setHerbModalMode] = useState('add'); // 'add' or 'edit'
  const [herbModalOpen, setHerbModalOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [herbForm, setHerbForm] = useState({
    category: 'Roots',
    name: '',
    botanicalName: '',
    harvestDate: new Date().toISOString().split('T')[0],
    quantityKg: '',
    pricePer100g: '',
    grade: 'AYUSH Grade-A (NABL Tested)',
    activeCompounds: '',
    organolepticNotes: '',
    rasa: '',
    virya: '',
    farmLocation: '',
    imageUrl: '',
    labReportUrl: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingPdfDoc, setUploadingPdfDoc] = useState(false);
  const [submittingHerb, setSubmittingHerb] = useState(false);

  // Category Overview Grid Search & Pagination
  const [categoryGridSearch, setCategoryGridSearch] = useState('');
  const [categoryGridPage, setCategoryGridPage] = useState(1);
  const categoriesGridPageSize = 6;

  // Traceability QR Tab Search & Pagination
  const [traceSearchQuery, setTraceSearchQuery] = useState('');
  const [tracePage, setTracePage] = useState(1);
  const tracePageSize = 6;

  // Reviews Tab Search, Date Filters & Pagination
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewDateFilter, setReviewDateFilter] = useState('today'); // 'today' | 'week' | 'month' | 'custom' | 'all'
  const [reviewCustomStart, setReviewCustomStart] = useState('');
  const [reviewCustomEnd, setReviewCustomEnd] = useState('');

  // Phone Settings Alerts Toggles
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);

  // Restock Modal
  const [restockModalBatch, setRestockModalBatch] = useState(null);
  const [restockAmount, setRestockAmount] = useState(50);
  const [submittingRestock, setSubmittingRestock] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(false);

  // QR Traceability Modal
  const [qrModalBatch, setQrModalBatch] = useState(null);

  // Category Creation Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

  // Category Edit & Delete States
  const [editCatModalOpen, setEditCatModalOpen] = useState(false);
  const [editingCatName, setEditingCatName] = useState('');
  const [editCatNewName, setEditCatNewName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [submittingEditCat, setSubmittingEditCat] = useState(false);

  const [deleteCatModalOpen, setDeleteCatModalOpen] = useState(false);
  const [deletingCatName, setDeletingCatName] = useState('');
  const [submittingDeleteCat, setSubmittingDeleteCat] = useState(false);

  // Category Drilldown Herb View & Pagination
  const [selectedCategoryView, setSelectedCategoryView] = useState(null);
  const [catHerbsPage, setCatHerbsPage] = useState(1);
  const [catHerbsPageSize, setCatHerbsPageSize] = useState(6);
  const [catHerbSearch, setCatHerbSearch] = useState('');

  // Payout / Settlement Request Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutBankName, setPayoutBankName] = useState('');
  const [payoutAccountNo, setPayoutAccountNo] = useState('');
  const [payoutIfsc, setPayoutIfsc] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Review Reply State
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [reviewReplyText, setReviewReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Sign Out Modal
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);

  // Back-button trapping: pressing browser Back closes modals instead of logging out
  useModalBackButton(herbModalOpen, () => setHerbModalOpen(false));
  useModalBackButton(categoryModalOpen, () => setCategoryModalOpen(false));
  useModalBackButton(editCatModalOpen, () => setEditCatModalOpen(false));
  useModalBackButton(deleteCatModalOpen, () => setDeleteCatModalOpen(false));
  useModalBackButton(payoutModalOpen, () => setPayoutModalOpen(false));
  useModalBackButton(!!restockModalBatch, () => setRestockModalBatch(null));
  useModalBackButton(!!deleteConfirmBatch, () => setDeleteConfirmBatch(null));
  useModalBackButton(!!qrModalBatch, () => setQrModalBatch(null));
  useModalBackButton(mobileSidebarOpen, () => setMobileSidebarOpen(false));

  // Toast / Alert Notification
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchFarmerData = async () => {
    try {
      const res = await farmerApi.getDashboardData();
      if (res.success) {
        setData(res);
        if (res.metrics?.pendingSettlement !== undefined) {
          setPayoutAmount(res.metrics.pendingSettlement);
        }
        if (res.farmer) {
          const p = res.farmer.profile || {};
          setProfileForm({
            name: res.farmer.name || user?.name || '',
            phone: res.farmer.phone || user?.phone || '',
            fpoOrFarmName: p.fpoOrFarmName || '',
            farmState: p.farmState || '',
            farmDistrict: p.farmDistrict || '',
            farmVillage: p.farmVillage || '',
            acreage: p.acreage || '',
            bankName: p.bankName || '',
            bankAccountNo: p.bankAccountNo || '',
            bankIfsc: p.bankIfsc || '',
            bankHolderName: p.bankHolderName || '',
            upiId: p.upiId || ''
          });
          if (p.bankName) setPayoutBankName(p.bankName);
          if (p.bankAccountNo) setPayoutAccountNo(p.bankAccountNo);
          if (p.bankIfsc) setPayoutIfsc(p.bankIfsc);
        }
      }
    } catch (err) {
      console.error('Farmer data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFarmerData();
    showToast('✓ Live farm data synchronized with database');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await farmerApi.updateProfile(profileForm);
      showToast(`✓ ${res.message || 'Profile & Bank Details updated successfully!'}`);
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Failed to update farmer profile');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
    if (user?.id) {
      const socket = getSocket();
      joinUserRoom(user.id);
    }
  }, [user]);

  // Filter & Search Logic
  const allBatches = data?.batches || [];
  const filteredBatches = allBatches.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.name.toLowerCase().includes(q) ||
      (b.botanicalName && b.botanicalName.toLowerCase().includes(q)) ||
      b.batchNumber.toLowerCase().includes(q);

    const matchesCategory = selectedCategoryFilter === 'All' || b.category === selectedCategoryFilter;

    let matchesStock = true;
    if (selectedStockFilter === 'IN_STOCK') matchesStock = (b.quantityKg > 15);
    else if (selectedStockFilter === 'LOW_STOCK') matchesStock = (b.quantityKg > 0 && b.quantityKg <= 15);
    else if (selectedStockFilter === 'OUT_OF_STOCK') matchesStock = (b.quantityKg === 0);

    let matchesDate = true;
    const bDate = new Date(b.harvestDate || b.createdAt || Date.now());
    if (filterStartDate) matchesDate = matchesDate && bDate >= new Date(filterStartDate);
    if (filterEndDate) matchesDate = matchesDate && bDate <= new Date(filterEndDate + 'T23:59:59');

    return matchesSearch && matchesCategory && matchesStock && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / itemsPerPage));
  const displayedBatches = filteredBatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const allPayouts = data?.payouts || [];
  const payoutsPerPage = 5;
  const totalPayoutPages = Math.max(1, Math.ceil(allPayouts.length / payoutsPerPage));
  const displayedPayouts = allPayouts.slice((payoutsPage - 1) * payoutsPerPage, payoutsPage * payoutsPerPage);

  // Category Overview Grid Filtered List & Pagination
  const allCategoriesList = data?.categories || DEFAULT_CATEGORIES;
  const filteredCategoriesList = allCategoriesList.filter(c =>
    !categoryGridSearch.trim() || c.toLowerCase().includes(categoryGridSearch.toLowerCase())
  );
  const totalCatGridPages = Math.max(1, Math.ceil(filteredCategoriesList.length / categoriesGridPageSize));
  const displayedCategoriesGrid = filteredCategoriesList.slice(
    (categoryGridPage - 1) * categoriesGridPageSize,
    categoryGridPage * categoriesGridPageSize
  );

  // Traceability QR Tab Filtered List & Pagination
  const filteredTraceBatches = allBatches.filter(b => {
    if (!traceSearchQuery.trim()) return true;
    const q = traceSearchQuery.toLowerCase();
    const name = (b.name || '').toLowerCase();
    const botName = (b.botanicalName || '').toLowerCase();
    const batchNum = (b.batchNumber || '').toLowerCase();
    const grade = (b.grade || '').toLowerCase();
    const cat = (b.category || '').toLowerCase();
    return name.includes(q) || botName.includes(q) || batchNum.includes(q) || grade.includes(q) || cat.includes(q);
  });
  const totalTracePages = Math.max(1, Math.ceil(filteredTraceBatches.length / tracePageSize));
  const displayedTraceBatches = filteredTraceBatches.slice(
    (tracePage - 1) * tracePageSize,
    tracePage * tracePageSize
  );

  // Reviews Tab Filtered List, Date Windowing & Pagination
  const allReviews = data?.reviews || [];
  const filteredReviews = allReviews.filter(rev => {
    // 1. Search Query
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      const matchName = rev.userName?.toLowerCase().includes(q);
      const matchTitle = rev.title?.toLowerCase().includes(q);
      const matchComment = rev.comment?.toLowerCase().includes(q);
      const matchCity = rev.userCity?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchComment && !matchCity) return false;
    }

    // 2. Date Filter
    if (reviewDateFilter === 'all') return true;
    const revDate = new Date(rev.createdAt);
    const now = new Date();

    if (reviewDateFilter === 'today') {
      const isSameDate = revDate.toDateString() === now.toDateString();
      const isWithin24Hours = (now.getTime() - revDate.getTime()) <= 24 * 60 * 60 * 1000 && (now.getTime() - revDate.getTime()) >= 0;
      return isSameDate || isWithin24Hours;
    }
    if (reviewDateFilter === 'week') {
      return (now.getTime() - revDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    }
    if (reviewDateFilter === 'month') {
      return (now.getTime() - revDate.getTime()) <= 31 * 24 * 60 * 60 * 1000;
    }
    if (reviewDateFilter === 'custom') {
      if (reviewCustomStart && revDate < new Date(reviewCustomStart + 'T00:00:00')) return false;
      if (reviewCustomEnd && revDate > new Date(reviewCustomEnd + 'T23:59:59')) return false;
      return true;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Latest First

  const reviewsPerPage = 5;
  const totalReviewPages = Math.max(1, Math.ceil(filteredReviews.length / reviewsPerPage));
  const displayedReviews = filteredReviews.slice((reviewsPage - 1) * reviewsPerPage, reviewsPage * reviewsPerPage);

  // Open Add Herb Form (Unified - Same fields as Edit with Category first)
  const handleOpenAdd = (preselectedCategory = null) => {
    setHerbModalMode('add');
    setEditingBatchId(null);
    setHerbForm({
      category: preselectedCategory || (data?.categories || DEFAULT_CATEGORIES)[0] || 'Roots',
      name: '',
      botanicalName: '',
      harvestDate: new Date().toISOString().split('T')[0],
      quantityKg: '',
      pricePer100g: '',
      imageUrl: '',
      labReportUrl: '',
      grade: 'AYUSH Grade-A (NABL Tested)',
      activeCompounds: '',
      organolepticNotes: '',
      rasa: '',
      virya: '',
      farmLocation: data?.farmer?.profile ? `${data.farmer.profile.farmDistrict || ''}, ${data.farmer.profile.farmState || ''}`.trim() : ''
    });
    setHerbModalOpen(true);
  };

  // Open Edit Herb Form
  const handleOpenEdit = (batch) => {
    setHerbModalMode('edit');
    setEditingBatchId(batch.id);
    setHerbForm({
      category: batch.category || 'Roots',
      name: batch.name,
      botanicalName: batch.botanicalName || '',
      harvestDate: new Date(batch.harvestDate).toISOString().split('T')[0],
      quantityKg: batch.quantityKg,
      pricePer100g: batch.pricePer100g,
      imageUrl: batch.imageUrl || '',
      labReportUrl: batch.labReportUrl || '',
      grade: batch.grade || 'AYUSH Grade-A (NABL Tested)',
      activeCompounds: batch.activeCompounds || '',
      organolepticNotes: batch.organolepticNotes || '',
      rasa: batch.rasa || '',
      virya: batch.virya || '',
      farmLocation: batch.farmLocation || ''
    });
    setHerbModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveHerb = async (e) => {
    e.preventDefault();
    if (!herbForm.name.trim() || !herbForm.category || !herbForm.quantityKg || !herbForm.pricePer100g) {
      alert('Please fill in Category, Herb Name, Quantity (Kg), and Price per 100g.');
      return;
    }
    setSubmittingHerb(true);
    try {
      const payload = {
        ...herbForm,
        quantityKg: parseFloat(herbForm.quantityKg),
        pricePer100g: parseFloat(herbForm.pricePer100g)
      };
      if (herbModalMode === 'add') {
        const res = await farmerApi.addBatch(payload);
        showToast(`✓ ${res.message || 'Herb registered successfully!'}`);
      } else {
        const res = await farmerApi.updateBatch(editingBatchId, payload);
        showToast(`✓ ${res.message || 'Herb updated successfully!'}`);
      }
      setHerbModalOpen(false);
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Failed to save herb batch');
    } finally {
      setSubmittingHerb(false);
    }
  };

  // Handle Photo Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await uploadImage(file);
      if (res.success && res.fileUrl) {
        setHerbForm(prev => ({ ...prev, imageUrl: res.fileUrl }));
        showToast('✓ Photo uploaded and stamped!');
      }
    } catch (err) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Lab PDF Upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdfDoc(true);
    try {
      const res = await uploadPdf(file);
      if (res.success && res.fileUrl) {
        setHerbForm(prev => ({ ...prev, labReportUrl: res.fileUrl }));
        showToast('✓ NABL Lab Certificate attached!');
      }
    } catch (err) {
      alert(err.message || 'Certificate upload failed');
    } finally {
      setUploadingPdfDoc(false);
    }
  };

  // Handle Restock Submit
  const handleConfirmRestock = async () => {
    if (!restockModalBatch) return;
    setSubmittingRestock(true);
    try {
      const res = await farmerApi.restockBatch(restockModalBatch.id, restockAmount);
      showToast(`✓ ${res.message}`);
      setRestockModalBatch(null);
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Restock failed');
    } finally {
      setSubmittingRestock(false);
    }
  };

  // Handle Delete Batch
  const handleConfirmDelete = async () => {
    if (!deleteConfirmBatch) return;
    setDeletingBatch(true);
    try {
      const res = await farmerApi.deleteBatch(deleteConfirmBatch.id);
      showToast(`✓ ${res.message}`);
      setDeleteConfirmBatch(null);
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Failed to delete batch');
    } finally {
      setDeletingBatch(false);
    }
  };

  // Handle Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSubmittingCat(true);
    try {
      const res = await farmerApi.createCategory({ name: newCatName, description: newCatDesc });
      showToast(`✓ ${res.message}`);
      setNewCatName('');
      setNewCatDesc('');
      setCategoryModalOpen(false);
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Failed to create category');
    } finally {
      setSubmittingCat(false);
    }
  };

  // Handle Edit Category
  const handleOpenEditCategory = (catName, e) => {
    if (e) e.stopPropagation();
    setEditingCatName(catName);
    setEditCatNewName(catName);
    setEditCatDesc('');
    setEditCatModalOpen(true);
  };

  const handleSaveEditCategory = async (e) => {
    e.preventDefault();
    if (!editCatNewName.trim()) return;
    setSubmittingEditCat(true);
    try {
      const res = await farmerApi.updateCategory(editingCatName, {
        name: editCatNewName.trim(),
        description: editCatDesc
      });
      showToast(`✓ ${res.message || 'Category updated!'}`);
      setEditCatModalOpen(false);
      if (selectedCategoryView === editingCatName) {
        setSelectedCategoryView(editCatNewName.trim());
      }
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Failed to update category');
    } finally {
      setSubmittingEditCat(false);
    }
  };

  // Handle Delete Category
  const handleOpenDeleteCategory = (catName, e) => {
    if (e) e.stopPropagation();
    setDeletingCatName(catName);
    setDeleteCatModalOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCatName) return;
    setSubmittingDeleteCat(true);
    try {
      const res = await farmerApi.deleteCategory(deletingCatName);
      showToast(`✓ ${res.message || 'Category deleted!'}`);
      setDeleteCatModalOpen(false);
      if (selectedCategoryView === deletingCatName) {
        setSelectedCategoryView(null);
      }
      setDeletingCatName('');
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setSubmittingDeleteCat(false);
    }
  };


  // Handle Request Settlement
  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setSubmittingPayout(true);
    try {
      const res = await farmerApi.requestSettlement({
        amount: payoutAmount,
        bankName: payoutBankName,
        bankAccountNo: payoutAccountNo,
        bankIfsc: payoutIfsc
      });
      showToast(`✓ ${res.message}`);
      setPayoutModalOpen(false);
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Payout request failed');
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Handle Review Reply
  const handleSendReviewReply = async (reviewId) => {
    if (!reviewReplyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await farmerApi.replyReview(reviewId, reviewReplyText);
      showToast(`✓ ${res.message}`);
      setReplyingReviewId(null);
      setReviewReplyText('');
      await fetchFarmerData();
    } catch (err) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Sign out confirmation handler
  const handleConfirmSignOut = () => {
    setSignOutModalOpen(false);
    logout();
    navigate('/portal', { replace: true });
  };

  const metrics = data?.metrics || {
    totalBatchesCount: 0,
    totalStockKg: 0,
    totalSoldKg: 0,
    inStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    grossSales: 0,
    platformFeeDeducted: 0,
    netEarnings: 0,
    settledAmount: 0,
    pendingSettlement: 0
  };

  return (
    <div style={{ display: 'flex', height: '100vh', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999999,
          backgroundColor: '#14532d',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          fontSize: '13.5px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        roleName="Seller / Producer"
      />

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

      {/* Sidebar Navigation - Fixed Non-scrolling */}
      <aside 
        className={mobileSidebarOpen ? 'farmer-drawer-open' : 'farmer-sidebar-drawer'}
        style={{
        width: sidebarCollapsed ? '78px' : '260px',
        backgroundColor: '#122619',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease, left 0.28s ease',
        zIndex: 9999,
        borderRight: '1px solid #1e3a27'
      }}>
        {/* Brand Header */}
        <div style={{ padding: '22px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e3a27' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sprout size={20} color="#ffffff" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>AYURVEDA</div>
                <div style={{ fontSize: '11px', color: '#86efac', fontWeight: '600' }}>Seller Console</div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Seller Info Pill */}
        {!sidebarCollapsed && (
          <div style={{ padding: '16px 18px', backgroundColor: '#193322', margin: '14px 12px', borderRadius: '14px', border: '1px solid #285437' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Building size={14} color="#86efac" />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {data?.farmer?.profile?.fpoOrFarmName || `${user?.name}'s Farm/Store`}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#a7f3d0' }}>
              {data?.farmer?.profile?.farmDistrict ? `${data.farmer.profile.farmDistrict}, ${data.farmer.profile.farmState}` : 'Verified Seller Sourcing'}
            </div>
          </div>
        )}

        {/* Nav Links - Prioritized by daily seller workflow */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'inventory', label: 'My Herbs & Stock', icon: Package },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'traceability', label: 'Traceability QR', icon: QrCode },
            { id: 'finances', label: 'Earnings & Payouts', icon: DollarSign },
            { id: 'reviews', label: 'Customer Reviews', icon: Star },
            { id: 'profile', label: 'Seller Profile & Settings', icon: Landmark }
          ].map(item => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  backgroundColor: active ? '#22c55e' : 'transparent',
                  color: active ? '#ffffff' : '#cbd5e1',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: active ? '700' : '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease'
                }}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with Sign Out */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e3a27' }}>
          <button
            onClick={() => setSignOutModalOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area - Scrollable */}
      <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        
        {/* Top Header Bar */}
        <header className="farmer-dashboard-header dashboard-app-header" style={{
          minHeight: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div className="dashboard-header-title-box" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="farmer-mobile-toggle"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#15803d',
                cursor: 'pointer',
                padding: '6px'
              }}
              title="Open Navigation"
            >
              <Menu size={22} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 className="dashboard-header-title" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {activeNav === 'inventory' && 'Herb Lots & Inventory Management'}
                {activeNav === 'finances' && 'Revenue & Payment Settlement Ledger'}
                {activeNav === 'profile' && 'Seller Profile & Bank Settlement Details'}
                {activeNav === 'categories' && 'Dynamic Herbal Categories'}
                {activeNav === 'reviews' && 'Patient Ratings & Producer Feedback'}
                {activeNav === 'traceability' && 'Farm-to-Cup QR Traceability Engine'}
              </h1>
              <p className="dashboard-header-sub" style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Organic FSSAI: {data?.farmer?.profile?.fssaiNumber || '10023011000456'} • NPOP Organic Verified Sourcing
              </p>
            </div>
          </div>

          <div className="dashboard-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Sync live records from database"
              className="dashboard-action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                color: '#334155',
                border: '1.5px solid #cbd5e1',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => setSupportModalOpen(true)}
              className="dashboard-action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1.5px solid #bbf7d0',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <LifeBuoy size={14} color="#15803d" />
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
                borderRadius: '10px',
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

        {/* Dashboard Body */}
        <main style={{ padding: '24px', flex: 1 }}>

          {/* TAB 1: INVENTORY MANAGEMENT & SUMMARY METRIC CARDS (Shown ONLY on Homepage) */}
          {activeNav === 'inventory' && (
            <div>
              {/* 4 Summary Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                
                {/* Card 1: Gross Sales */}
                <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700' }}>Gross Herb Sales</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                    ₹{metrics.grossSales.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
                    Platform fee 5% deducted: ₹{metrics.platformFeeDeducted.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Card 2: Net Sourcing Payout */}
                <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700' }}>Net Seller Earnings</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                    ₹{metrics.netEarnings.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: '600', marginTop: '4px' }}>
                    Pending payout: ₹{metrics.pendingSettlement.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Card 3: Total Stock in Storage */}
                <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700' }}>Active Available Stock</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
                    {metrics.totalStockKg} <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>kg</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
                    Across {metrics.totalBatchesCount} registered lots
                  </div>
                </div>

                {/* Card 4: Inventory Health Alerts */}
                <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700' }}>Stock Health Alerts</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={16} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '8px' }}>
                      {metrics.lowStockCount} Low Stock
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '8px' }}>
                      {metrics.outOfStockCount} Out of Stock
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    Restock with 1-click in the table below
                  </div>
                </div>

              </div>

              {/* TABLE CONTAINER */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              
              {/* Filter & Search Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                
                {/* Search Input */}
                <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by herb, botanical name, batch #..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Filter Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  
                  {/* Category Filter */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => { setSelectedCategoryFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#334155',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  >
                    <option value="All">All Categories</option>
                    {(data?.categories || DEFAULT_CATEGORIES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Stock Status Filter */}
                  <select
                    value={selectedStockFilter}
                    onChange={(e) => { setSelectedStockFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#334155',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="IN_STOCK">In Stock (&gt; 15kg)</option>
                    <option value="LOW_STOCK">Low Stock (&le; 15kg)</option>
                    <option value="OUT_OF_STOCK">Out of Stock (0kg)</option>
                  </select>

                  {/* Date Filters */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <Calendar size={14} />
                    <span>From:</span>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
                      style={{ padding: '7px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <span>To:</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
                      style={{ padding: '7px 10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>

                  {(searchQuery || selectedCategoryFilter !== 'All' || selectedStockFilter !== 'All' || filterStartDate || filterEndDate) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategoryFilter('All');
                        setSelectedStockFilter('All');
                        setFilterStartDate('');
                        setFilterEndDate('');
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: '1px solid #fecaca',
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  )}

                  <button
                    onClick={() => setCategoryModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    <Layers size={14} />
                    <span>+ New Category</span>
                  </button>

                  <button
                    onClick={() => handleOpenAdd()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 15px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
                    }}
                  >
                    <Plus size={15} />
                    <span>+ Add New Herb Batch</span>
                  </button>
                </div>
              </div>

              {/* Batches Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                      <th style={{ padding: '12px 14px' }}>Herb & Botanical</th>
                      <th style={{ padding: '12px 14px' }}>Category & Grade</th>
                      <th style={{ padding: '12px 14px' }}>Batch Number</th>
                      <th style={{ padding: '12px 14px' }}>Available Stock</th>
                      <th style={{ padding: '12px 14px' }}>Price / 100g</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedBatches.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          No herb batches match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedBatches.map(batch => {
                        const isOut = batch.quantityKg === 0;
                        const isLow = batch.quantityKg > 0 && batch.quantityKg <= 15;
                        return (
                          <tr key={batch.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}>
                            
                            {/* Herb & Image */}
                            <td style={{ padding: '14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={batch.imageUrl || 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=200&q=80'}
                                  alt={batch.name}
                                  style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                />
                                <div>
                                  <div style={{ fontWeight: '800', color: '#0f172a' }}>{batch.name}</div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic' }}>
                                    {batch.botanicalName || 'Withania Somnifera'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category & Grade */}
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: '700', color: '#334155' }}>{batch.category}</div>
                              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>
                                {batch.grade || 'AYUSH Grade-A'}
                              </div>
                            </td>

                            {/* Batch # */}
                            <td style={{ padding: '14px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: '700', backgroundColor: '#f1f5f9', padding: '3px 7px', borderRadius: '6px' }}>
                                {batch.batchNumber}
                              </span>
                            </td>

                            {/* Quantity */}
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: '900', color: isOut ? '#dc2626' : (isLow ? '#d97706' : '#0f172a'), fontSize: '14px' }}>
                                {batch.quantityKg} kg
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Sold: {batch.soldQuantityKg || 0} kg
                              </div>
                            </td>

                            {/* Price */}
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a' }}>₹{batch.pricePer100g}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>₹{Math.round(batch.pricePer100g * 2.5)} / 250g pack</div>
                            </td>

                            {/* Stock Badge */}
                            <td style={{ padding: '14px' }}>
                              {isOut ? (
                                <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '9999px' }}>
                                  OUT OF STOCK
                                </span>
                              ) : isLow ? (
                                <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '9999px' }}>
                                  LOW STOCK
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#065f46', padding: '3px 8px', borderRadius: '9999px' }}>
                                  IN STOCK
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td style={{ padding: '14px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                
                                {/* Restock Button */}
                                <button
                                  onClick={() => { setRestockModalBatch(batch); setRestockAmount(50); }}
                                  title="Restock Inventory"
                                  style={{
                                    backgroundColor: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    color: '#15803d',
                                    borderRadius: '8px',
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <RefreshCw size={13} />
                                  <span>Restock</span>
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => handleOpenEdit(batch)}
                                  title="Edit Batch"
                                  style={{
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #cbd5e1',
                                    color: '#334155',
                                    borderRadius: '8px',
                                    padding: '6px 9px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Edit3 size={14} />
                                </button>

                                {/* QR Traceability Modal */}
                                <button
                                  onClick={() => setQrModalBatch(batch)}
                                  title="View QR Certificate"
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    color: '#0f172a',
                                    borderRadius: '8px',
                                    padding: '6px 9px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <QrCode size={14} />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => setDeleteConfirmBatch(batch)}
                                  title="Delete Batch"
                                  style={{
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    borderRadius: '8px',
                                    padding: '6px 9px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={14} />
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

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredBatches.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />

              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS & PAYOUTS */}
          {activeNav === 'finances' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Prominent Settlement Summary Card */}
              <div style={{
                background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)',
                borderRadius: '18px',
                padding: '24px 28px',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(20, 83, 45, 0.16)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <DollarSign size={13} color="#86efac" /> Settlement Status & Bank Treasury
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#bbf7d0', fontWeight: '600' }}>
                    Settlement ke liye bacha hua balance (Available for Withdrawal)
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', marginTop: '2px' }}>
                    ₹{metrics.pendingSettlement.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#dcfce7', marginTop: '4px' }}>
                    Bank: <strong>{data?.farmer?.profile?.bankName || 'State Bank of India'}</strong> (A/C: •••• {data?.farmer?.profile?.bankAccountNo?.slice(-4) || '8921'}) • Zero platform deduction on payout
                  </div>
                </div>

                <button
                  onClick={() => setPayoutModalOpen(true)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#14532d',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <DollarSign size={16} /> Request Bank Settlement Now
                </button>
              </div>

              {/* 3 Metric Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b' }}>Kul Herb Bikri (Gross Sales)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                    ₹{metrics.grossSales.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>95% Producer Share</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b' }}>Bank me Bheji Gayi Rashi (Settled)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
                    ₹{metrics.settledAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', marginTop: '2px' }}>Completed via NEFT/RTGS</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1.5px solid #86efac', backgroundColor: '#f0fdf4', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#166534' }}>Abhi Bacha Hua Amount</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>
                    ₹{metrics.pendingSettlement.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', marginTop: '2px' }}>Eligible for Instant Payout</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Financial Ledger & Payout History */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Payout Requests History</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Direct bank settlements from AYUSH Super Admin Treasury</p>
                    </div>
                    <button
                      onClick={() => setPayoutModalOpen(true)}
                      style={{
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      + Request Payout
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {allPayouts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '13px' }}>
                        No payout requests yet. You have ₹{metrics.pendingSettlement.toLocaleString('en-IN')} eligible for withdrawal!
                      </div>
                    ) : (
                      displayedPayouts.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                              ₹{p.amount.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {p.bankName} • {p.bankAccountNo} • {new Date(p.requestedAt).toLocaleDateString('en-IN')}
                            </div>
                            {p.transactionRef && (
                              <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '700', fontFamily: 'monospace' }}>
                                UTR: {p.transactionRef}
                              </div>
                            )}
                          </div>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            backgroundColor: p.status === 'SETTLED' ? '#ecfdf5' : '#fef3c7',
                            color: p.status === 'SETTLED' ? '#065f46' : '#92400e'
                          }}>
                            {p.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {allPayouts.length > payoutsPerPage && (
                    <div style={{ marginTop: '16px' }}>
                      <Pagination
                        currentPage={payoutsPage}
                        totalPages={totalPayoutPages}
                        totalItems={allPayouts.length}
                        itemsPerPage={payoutsPerPage}
                        onPageChange={setPayoutsPage}
                      />
                    </div>
                  )}
                </div>

              {/* Revenue Breakdown */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>Revenue Economics</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748b' }}>Total Gross Batch Sales</span>
                    <strong style={{ color: '#0f172a' }}>₹{metrics.grossSales.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748b' }}>Platform Sourcing Facilitation (5%)</span>
                    <strong style={{ color: '#dc2626' }}>- ₹{metrics.platformFeeDeducted.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                    <strong style={{ color: '#0f172a' }}>Net Seller Cooperative Share</strong>
                    <strong style={{ color: '#15803d', fontSize: '18px' }}>₹{metrics.netEarnings.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748b' }}>Total Amount Settled to Bank</span>
                    <strong style={{ color: '#2563eb' }}>₹{metrics.settledAmount.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                    <span style={{ color: '#64748b' }}>Pending Settlement Balance</span>
                    <strong style={{ color: '#d97706' }}>₹{metrics.pendingSettlement.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <CheckCircle2 size={18} color="#15803d" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.5 }}>
                      <strong>Zero Hidden Fees:</strong> Sourcing payouts are directly credited via RTGS/NEFT to your registered agricultural bank account within 24-48 business hours.
                    </div>
                  </div>
                </div>
              </div>

              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES & CATEGORY-HERB CONNECTION */}
          {activeNav === 'categories' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
              
              {/* Category Drilldown View (When a Category is Selected) */}
              {selectedCategoryView ? (() => {
                const categoryBatches = allBatches.filter(b => b.category === selectedCategoryView);
                const filteredHerbs = categoryBatches.filter(b => {
                  if (!catHerbSearch.trim()) return true;
                  const q = catHerbSearch.toLowerCase();
                  return (
                    b.name?.toLowerCase().includes(q) ||
                    b.botanicalName?.toLowerCase().includes(q) ||
                    b.batchNumber?.toLowerCase().includes(q)
                  );
                });

                const totalPages = Math.ceil(filteredHerbs.length / catHerbsPageSize) || 1;
                const startIndex = (catHerbsPage - 1) * catHerbsPageSize;
                const currentHerbs = filteredHerbs.slice(startIndex, startIndex + catHerbsPageSize);

                return (
                  <div>
                    {/* Breadcrumbs & Navigation Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={() => { setSelectedCategoryView(null); setCatHerbsPage(1); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            padding: '7px 12px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <ChevronLeft size={16} />
                          <span>All Categories</span>
                        </button>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                              {selectedCategoryView}
                            </h3>
                            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '9999px' }}>
                              {categoryBatches.length} Herbs in Taxonomy
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                            Viewing all active raw herbal lots linked to category "{selectedCategoryView}"
                          </p>
                        </div>
                      </div>

                      {/* Actions: Add Herb + Edit Category + Delete Category */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={(e) => handleOpenEditCategory(selectedCategoryView, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#ffffff',
                            color: '#15803d',
                            border: '1.5px solid #86efac',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={14} />
                          <span>Rename Category</span>
                        </button>

                        <button
                          onClick={(e) => handleOpenDeleteCategory(selectedCategoryView, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#ffffff',
                            color: '#dc2626',
                            border: '1.5px solid #fca5a5',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Delete Category</span>
                        </button>

                        <button
                          onClick={() => handleOpenAdd(selectedCategoryView)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#15803d',
                            color: '#ffffff',
                            border: 'none',
                            padding: '9px 16px',
                            borderRadius: '10px',
                            fontSize: '12.5px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
                          }}
                        >
                          <Plus size={15} />
                          <span>+ Add Herb to {selectedCategoryView}</span>
                        </button>
                      </div>
                    </div>

                    {/* Search & Filter Toolbar inside Category */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
                        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                          type="text"
                          placeholder={`Search within ${selectedCategoryView}...`}
                          value={catHerbSearch}
                          onChange={(e) => { setCatHerbSearch(e.target.value); setCatHerbsPage(1); }}
                          style={{
                            width: '100%',
                            padding: '8px 10px 8px 32px',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '12.5px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Showing <strong>{filteredHerbs.length}</strong> matching herbs in this category
                      </div>
                    </div>

                    {/* Category Herbs Table */}
                    {filteredHerbs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                        <Leaf size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#334155', margin: '0 0 4px 0' }}>
                          No herbs found in this category yet
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
                          Add your first harvested lot under "{selectedCategoryView}"
                        </p>
                        <button
                          onClick={() => handleOpenAdd(selectedCategoryView)}
                          style={{
                            backgroundColor: '#15803d',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          + Add Herb Now
                        </button>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <th style={{ padding: '12px 14px' }}>Herb & Botanical Name</th>
                              <th style={{ padding: '12px 14px' }}>Batch Number</th>
                              <th style={{ padding: '12px 14px' }}>Available Stock</th>
                              <th style={{ padding: '12px 14px' }}>Price / 100g</th>
                              <th style={{ padding: '12px 14px' }}>Grade / Origin</th>
                              <th style={{ padding: '12px 14px' }}>Status</th>
                              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentHerbs.map(b => (
                              <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '14px' }}>
                                  <div style={{ fontWeight: '800', color: '#0f172a' }}>{b.name}</div>
                                  <div style={{ fontSize: '11.5px', color: '#059669', fontStyle: 'italic' }}>{b.botanicalName || 'Indigenous Cultivar'}</div>
                                </td>
                                <td style={{ padding: '14px' }}>
                                  <span style={{ fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f1f5f9', padding: '3px 7px', borderRadius: '6px', fontWeight: '700' }}>
                                    {b.batchNumber}
                                  </span>
                                </td>
                                <td style={{ padding: '14px' }}>
                                  <div style={{ fontWeight: '800', color: '#0f172a' }}>{b.quantityKg} kg</div>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>Sold: {b.soldQuantityKg || 0} kg</div>
                                </td>
                                <td style={{ padding: '14px' }}>
                                  <span style={{ fontWeight: '800', color: '#0f172a' }}>₹{b.pricePer100g}</span>
                                </td>
                                <td style={{ padding: '14px' }}>
                                  <div style={{ fontSize: '12px', color: '#334155', fontWeight: '600' }}>{b.grade || 'AYUSH Grade-A'}</div>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>{b.farmLocation || 'Madhya Pradesh'}</div>
                                </td>
                                <td style={{ padding: '14px' }}>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    padding: '3px 8px',
                                    borderRadius: '9999px',
                                    backgroundColor: b.quantityKg === 0 ? '#fee2e2' : (b.quantityKg <= 15 ? '#fef3c7' : '#ecfdf5'),
                                    color: b.quantityKg === 0 ? '#dc2626' : (b.quantityKg <= 15 ? '#b45309' : '#059669')
                                  }}>
                                    {b.quantityKg === 0 ? 'Out of Stock' : (b.quantityKg <= 15 ? 'Low Stock' : 'In Stock')}
                                  </span>
                                </td>
                                <td style={{ padding: '14px', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                                    <button
                                      onClick={() => { setRestockModalBatch(b); setRestockAmount(50); }}
                                      title="Restock this lot"
                                      style={{
                                        backgroundColor: '#f0fdf4',
                                        color: '#16a34a',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: '8px',
                                        padding: '5px 10px',
                                        fontSize: '11.5px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      + Restock
                                    </button>
                                    <button
                                      onClick={() => setQrModalBatch(b)}
                                      title="View Traceability QR"
                                      style={{
                                        backgroundColor: '#f8fafc',
                                        color: '#475569',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        padding: '5px 8px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <QrCode size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Page <strong>{catHerbsPage}</strong> of <strong>{totalPages}</strong> ({filteredHerbs.length} total herbs in category)
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            disabled={catHerbsPage === 1}
                            onClick={() => setCatHerbsPage(p => Math.max(1, p - 1))}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: catHerbsPage === 1 ? '#f8fafc' : '#ffffff',
                              color: catHerbsPage === 1 ? '#94a3b8' : '#334155',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: catHerbsPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                            <button
                              key={p}
                              onClick={() => setCatHerbsPage(p)}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: p === catHerbsPage ? 'none' : '1px solid #cbd5e1',
                                backgroundColor: p === catHerbsPage ? '#15803d' : '#ffffff',
                                color: p === catHerbsPage ? '#ffffff' : '#334155',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            disabled={catHerbsPage === totalPages}
                            onClick={() => setCatHerbsPage(p => Math.min(totalPages, p + 1))}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: catHerbsPage === totalPages ? '#f8fafc' : '#ffffff',
                              color: catHerbsPage === totalPages ? '#94a3b8' : '#334155',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: catHerbsPage === totalPages ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })() : (
                /* Overview: All Categories Grid View */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Botanical Herb Categories</h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                        Tap any category to view all linked herbs with dedicated stock tables & pagination
                      </p>
                    </div>
                    <button
                      onClick={() => setCategoryModalOpen(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      <span>Create Category</span>
                    </button>
                  </div>

                  {/* Category Search Filter Bar */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                      <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="Search botanical categories (e.g. Roots, Powders, Seeds)..."
                        value={categoryGridSearch}
                        onChange={(e) => { setCategoryGridSearch(e.target.value); setCategoryGridPage(1); }}
                        style={{
                          width: '100%',
                          padding: '9px 12px 9px 36px',
                          borderRadius: '10px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    {categoryGridSearch && (
                      <button
                        onClick={() => { setCategoryGridSearch(''); setCategoryGridPage(1); }}
                        style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Reset Filter
                      </button>
                    )}
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                      {filteredCategoriesList.length} Categories Found
                    </span>
                  </div>

                  {displayedCategoriesGrid.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                      <Layers size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#334155', margin: '0 0 4px 0' }}>No categories matched "{categoryGridSearch}"</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Try another keyword or create a new botanical category.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {displayedCategoriesGrid.map(cat => {
                        const countInCat = allBatches.filter(b => b.category === cat).length;
                        return (
                          <div
                            key={cat}
                            onClick={() => { setSelectedCategoryView(cat); setCatHerbsPage(1); setCatHerbSearch(''); }}
                            style={{
                              padding: '18px',
                              borderRadius: '16px',
                              backgroundColor: '#f8fafc',
                              border: '1.5px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#15803d';
                              e.currentTarget.style.backgroundColor = '#f0fdf4';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Leaf size={16} />
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>{cat}</div>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ffffff', color: '#059669', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
                                {countInCat} Herbs
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                              {countInCat > 0 ? `${countInCat} lots active in this category` : 'No batches uploaded yet'}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#15803d' }}>
                                <span>View Herbs</span>
                                <ChevronRight size={14} />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={(e) => handleOpenEditCategory(cat, e)}
                                  title={`Rename ${cat}`}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#15803d'; e.currentTarget.style.color = '#15803d'; }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                                >
                                  <Edit3 size={11} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={(e) => handleOpenDeleteCategory(cat, e)}
                                  title={`Delete ${cat}`}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                                >
                                  <Trash2 size={11} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Category Pagination Controls */}
                  {totalCatGridPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Showing page <strong>{categoryGridPage}</strong> of <strong>{totalCatGridPages}</strong> ({filteredCategoriesList.length} categories)
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          disabled={categoryGridPage === 1}
                          onClick={() => setCategoryGridPage(p => Math.max(1, p - 1))}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: categoryGridPage === 1 ? '#f8fafc' : '#ffffff',
                            color: categoryGridPage === 1 ? '#94a3b8' : '#334155',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: categoryGridPage === 1 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalCatGridPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setCategoryGridPage(p)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: p === categoryGridPage ? 'none' : '1px solid #cbd5e1',
                              backgroundColor: p === categoryGridPage ? '#15803d' : '#ffffff',
                              color: p === categoryGridPage ? '#ffffff' : '#334155',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          disabled={categoryGridPage === totalCatGridPages}
                          onClick={() => setCategoryGridPage(p => Math.min(totalCatGridPages, p + 1))}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: categoryGridPage === totalCatGridPages ? '#f8fafc' : '#ffffff',
                            color: categoryGridPage === totalCatGridPages ? '#94a3b8' : '#334155',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: categoryGridPage === totalCatGridPages ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REVIEWS & PATIENT FEEDBACK */}
          {activeNav === 'reviews' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Verified Customer Reviews & Feedback</h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '3px 0 0 0' }}>
                    Authentic feedback from patients and Ayurvedic clinicians across India
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#166534', backgroundColor: '#f0fdf4', padding: '6px 12px', borderRadius: '9999px', border: '1px solid #bbf7d0', fontWeight: '700' }}>
                  <TrendingUp size={14} />
                  <span>Sorted: Latest First</span>
                </div>
              </div>

              {/* Date Filter Pills Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                  <Filter size={13} /> Date Filter:
                </span>
                {[
                  { id: 'today', label: "Today's Reviews" },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month' },
                  { id: 'custom', label: 'Custom Date Range' },
                  { id: 'all', label: 'All Time' }
                ].map(tab => {
                  const isSel = reviewDateFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setReviewDateFilter(tab.id); setReviewsPage(1); }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: isSel ? '1.5px solid #15803d' : '1px solid #cbd5e1',
                        backgroundColor: isSel ? '#15803d' : '#f8fafc',
                        color: isSel ? '#ffffff' : '#334155',
                        fontSize: '12px',
                        fontWeight: isSel ? '800' : '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}

                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px', marginLeft: 'auto' }}>
                  {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'} Found
                </span>
              </div>

              {/* Custom Date Pickers (Shown when 'custom' is active) */}
              {reviewDateFilter === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                    <Calendar size={14} color="#15803d" />
                    <strong>From Date:</strong>
                    <input
                      type="date"
                      value={reviewCustomStart}
                      onChange={(e) => { setReviewCustomStart(e.target.value); setReviewsPage(1); }}
                      style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                    <strong>To Date:</strong>
                    <input
                      type="date"
                      value={reviewCustomEnd}
                      onChange={(e) => { setReviewCustomEnd(e.target.value); setReviewsPage(1); }}
                      style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  {(reviewCustomStart || reviewCustomEnd) && (
                    <button
                      onClick={() => { setReviewCustomStart(''); setReviewCustomEnd(''); }}
                      style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '11.5px', color: '#b91c1c', cursor: 'pointer' }}
                    >
                      Clear Range
                    </button>
                  )}
                </div>
              )}

              {/* Keyword Search Filter */}
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search reviews by reviewer name, city, comment or title keywords..."
                  value={reviewSearchQuery}
                  onChange={(e) => { setReviewSearchQuery(e.target.value); setReviewsPage(1); }}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <MessageSquare size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#334155', margin: '0 0 4px 0' }}>No Customer Reviews Found</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px 0' }}>
                      {reviewDateFilter === 'today'
                        ? "No reviews logged yet today. Try switching filter to 'This Week', 'This Month', or 'All Time'."
                        : 'No reviews match your current search or date filter.'}
                    </p>
                    {reviewDateFilter !== 'all' && (
                      <button
                        onClick={() => { setReviewDateFilter('all'); setReviewSearchQuery(''); setReviewsPage(1); }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        View All Customer Reviews
                      </button>
                    )}
                  </div>
                ) : (
                  displayedReviews.map(rev => (
                    <div key={rev.id} style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#0f172a', fontSize: '14.5px' }}>{rev.userName}</strong>
                            {rev.userCity && (
                              <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MapPin size={11} /> {rev.userCity}
                              </span>
                            )}
                            <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
                              VERIFIED BUYER
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Posted: {new Date(rev.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#fef3c7', padding: '4px 8px', borderRadius: '8px' }}>
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                          ))}
                          <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', marginLeft: '4px' }}>
                            {rev.rating || 5}.0
                          </span>
                        </div>
                      </div>

                      <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginBottom: '6px' }}>
                        {rev.title}
                      </div>
                      <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 14px 0', lineHeight: 1.55 }}>
                        "{rev.comment}"
                      </p>

                      {/* Farmer Reply if exists */}
                      {rev.replyText ? (
                        <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12.5px', color: '#065f46' }}>
                          <div style={{ fontWeight: '800', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <ShieldCheck size={14} color="#059669" /> Verified Farm Producer Reply:
                          </div>
                          <div>{rev.replyText}</div>
                          {rev.repliedAt && (
                            <div style={{ fontSize: '10.5px', color: '#047857', marginTop: '4px' }}>
                              Replied on {new Date(rev.repliedAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {replyingReviewId === rev.id ? (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <input
                                type="text"
                                placeholder="Write verified farm reply (e.g. Thank you! We sun-cure this lot for maximum potency)..."
                                value={reviewReplyText}
                                onChange={(e) => setReviewReplyText(e.target.value)}
                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12.5px', outline: 'none' }}
                              />
                              <button
                                disabled={submittingReply}
                                onClick={() => handleSendReviewReply(rev.id)}
                                style={{ backgroundColor: '#15803d', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                {submittingReply ? 'Sending...' : 'Reply'}
                              </button>
                              <button
                                onClick={() => { setReplyingReviewId(null); setReviewReplyText(''); }}
                                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReplyingReviewId(rev.id); setReviewReplyText(''); }}
                              style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
                            >
                              Reply to Patient
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Reviews Pagination Bar */}
              {totalReviewPages > 1 && (
                <div style={{ marginTop: '24px' }}>
                  <Pagination
                    currentPage={reviewsPage}
                    totalPages={totalReviewPages}
                    totalItems={filteredReviews.length}
                    itemsPerPage={reviewsPerPage}
                    onPageChange={setReviewsPage}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TRACEABILITY */}
          {activeNav === 'traceability' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Farm-to-Cup QR Traceability Engine</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Every lot carries a cryptographically verifiable provenance certificate</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534', backgroundColor: '#dcfce7', padding: '5px 12px', borderRadius: '9999px', border: '1px solid #bbf7d0' }}>
                  {filteredTraceBatches.length} Traceable Lots Found
                </span>
              </div>

              {/* Traceability QR Search Bar */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search lots by herb name, botanical name, batch #, grade, or category..."
                  value={traceSearchQuery}
                  onChange={(e) => {
                    setTraceSearchQuery(e.target.value);
                    setTracePage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 42px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#0f172a',
                    backgroundColor: '#f8fafc'
                  }}
                />
                {traceSearchQuery && (
                  <button
                    onClick={() => {
                      setTraceSearchQuery('');
                      setTracePage(1);
                    }}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#94a3b8'
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {displayedTraceBatches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                  <QrCode size={48} style={{ color: '#cbd5e1', margin: '0 auto 12px auto' }} />
                  <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>No Traceable Lots Found</div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    {traceSearchQuery ? `No lots match "${traceSearchQuery}". Try clearing search filters.` : 'Add your first herb batch in Inventory to generate verifiable QR codes.'}
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {displayedTraceBatches.map(b => (
                      <div key={b.id} style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <QrCode size={48} color="#15803d" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {b.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', fontWeight: '700' }}>
                            {b.batchNumber}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
                            {b.grade || 'NABL Tested'} • {b.category || 'Herb'}
                          </div>
                          <button
                            onClick={() => setQrModalBatch(b)}
                            style={{ marginTop: '6px', backgroundColor: '#15803d', color: '#ffffff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <QrCode size={13} /> Inspect Certificate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Traceability QR Pagination */}
                  <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <Pagination
                      currentPage={tracePage}
                      totalPages={totalTracePages}
                      totalItems={filteredTraceBatches.length}
                      pageSize={tracePageSize}
                      onPageChange={setTracePage}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 6: PHONE-SETTINGS STYLE FARMER PROFILE & SETTINGS */}
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
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '900',
                    boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)'
                  }}>
                    <Sprout size={32} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                        {profileForm.name || data?.farmer?.name || user?.name || 'Verified Ayurvedic Seller'}
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 9px', borderRadius: '9999px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> AYUSH Verified
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                      {profileForm.fpoOrFarmName || 'Direct Organic Herb Sourcing Partner'} • {profileForm.farmDistrict ? `${profileForm.farmDistrict}, ${profileForm.farmState}` : 'Central Hub'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#166534', backgroundColor: '#f0fdf4', padding: '6px 14px', borderRadius: '12px', border: '1px solid #bbf7d0', fontWeight: '700' }}>
                  <Award size={14} />
                  <span>NPOP Organic Producer</span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* SETTINGS GROUP 1: STATUTORY COMPLIANCE & LICENSES (IMMUTABLE / LOCKED) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <ShieldCheck size={16} color="#15803d" />
                      <span>Statutory Licensure & Verification (Locked)</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🔒 Audited by Super Admin
                    </span>
                  </div>

                  <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          FSSAI Central Food Safety License
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                            {data?.farmer?.profile?.fssaiNumber || 'FSSAI-MP-2024-884129'}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                            ✓ Verified
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                          NPOP Organic Producer Certificate
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                            {data?.farmer?.profile?.organicCertNumber || 'NPOP/NAB/2024/0912'}
                          </span>
                          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                            ✓ Certified
                          </span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      Statutory compliance IDs are locked to protect the integrity of the blockchain batch provenance. To submit updated documents, contact the Super Admin Desk.
                    </p>
                  </div>
                </div>

                {/* SETTINGS GROUP 2: FARM & PERSONAL OPERATIONS (EDITABLE) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={16} color="#059669" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Farm Profile & Contact Information (Editable)
                    </span>
                  </div>

                  <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Producer Full Name *</label>
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
                        placeholder="+91 98260 12345"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>FPO / Farm Estate Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.fpoOrFarmName}
                        onChange={(e) => setProfileForm({ ...profileForm, fpoOrFarmName: e.target.value })}
                        placeholder="e.g. Neemuch Organic Herb Cooperative"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>State *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.farmState}
                        onChange={(e) => setProfileForm({ ...profileForm, farmState: e.target.value })}
                        placeholder="e.g. Madhya Pradesh"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>District *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.farmDistrict}
                        onChange={(e) => setProfileForm({ ...profileForm, farmDistrict: e.target.value })}
                        placeholder="e.g. Neemuch"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Village / Tehsil</label>
                      <input
                        type="text"
                        value={profileForm.farmVillage}
                        onChange={(e) => setProfileForm({ ...profileForm, farmVillage: e.target.value })}
                        placeholder="e.g. Manasa Tehsil"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Cultivated Land (in Acres)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={profileForm.acreage}
                        onChange={(e) => setProfileForm({ ...profileForm, acreage: e.target.value })}
                        placeholder="e.g. 18.5"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SETTINGS GROUP 3: TREASURY SETTLEMENT BANK ACCOUNT (EDITABLE) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #86efac', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Landmark size={16} />
                      <span>Direct Payout & Treasury Bank Account</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700' }}>
                      Zero Middlemen Disbursal
                    </span>
                  </div>

                  <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '6px' }}>Bank Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.bankName}
                        onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                        placeholder="e.g. State Bank of India"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #86efac', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '6px' }}>Bank Account Number *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.bankAccountNo}
                        onChange={(e) => setProfileForm({ ...profileForm, bankAccountNo: e.target.value })}
                        placeholder="e.g. 382910482910"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #86efac', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '6px' }}>IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.bankIfsc}
                        onChange={(e) => setProfileForm({ ...profileForm, bankIfsc: e.target.value.toUpperCase() })}
                        placeholder="e.g. SBIN0001244"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #86efac', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '6px' }}>Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.bankHolderName}
                        onChange={(e) => setProfileForm({ ...profileForm, bankHolderName: e.target.value })}
                        placeholder="e.g. Ramesh Patel"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #86efac', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#166534', display: 'block', marginBottom: '6px' }}>UPI ID (Optional)</label>
                      <input
                        type="text"
                        value={profileForm.upiId}
                        onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                        placeholder="e.g. farmer@okhdfcbank"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #86efac', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SETTINGS GROUP 4: PHONE-STYLE TOGGLES (SMS & WHATSAPP) */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ padding: '16px 22px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} color="#059669" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Alerts & Dispatch Notifications
                    </span>
                  </div>

                  <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Toggle 1 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>SMS Alerts for Fresh Orders</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Receive instant SMS on your mobile when a patient or clinic books your batch</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
                        style={{
                          width: '48px',
                          height: '26px',
                          borderRadius: '9999px',
                          backgroundColor: smsAlertsEnabled ? '#15803d' : '#cbd5e1',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '3px',
                          left: smsAlertsEnabled ? '25px' : '3px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                    {/* Toggle 2 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>WhatsApp Settlement Confirmations</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Get automatic bank transfer receipts directly on WhatsApp</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWhatsappAlertsEnabled(!whatsappAlertsEnabled)}
                        style={{
                          width: '48px',
                          height: '26px',
                          borderRadius: '9999px',
                          backgroundColor: whatsappAlertsEnabled ? '#15803d' : '#cbd5e1',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '3px',
                          left: whatsappAlertsEnabled ? '25px' : '3px',
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

                {/* Phone Settings Bottom Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      padding: '13px 32px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)'
                    }}
                  >
                    {savingProfile ? 'Saving Settings...' : '✓ Save Profile & Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          MODALS
      ========================================================================= */}

      {/* 1. ADD / EDIT HERB MODAL */}
      {herbModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #f1f5f9' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {herbModalMode === 'add' ? 'Register New Herb Lot' : 'Edit Herb Lot Details'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Complete therapeutic, botanical, and agricultural provenance attributes
                </p>
              </div>
              <button onClick={() => setHerbModalOpen(false)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveHerb} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Category Taxonomy - FIRST FIELD AS REQUESTED */}
              <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '14px', border: '1.5px solid #86efac' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Leaf size={15} color="#15803d" />
                  <span>1. Select Botanical Category * (Select Category First)</span>
                </label>
                <select
                  required
                  value={herbForm.category}
                  onChange={(e) => setHerbForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #16a34a',
                    backgroundColor: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {(data?.categories || DEFAULT_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>
                  This batch will be taxonomically indexed under this category across customer marketplace & store search.
                </div>
              </div>

              {/* Herb Common Name & Botanical Scientific Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Herb Common Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nagori Ashwagandha Root"
                    value={herbForm.name}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Botanical Scientific Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Withania somnifera (L.) Dunal"
                    value={herbForm.botanicalName}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, botanicalName: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Quality Grade */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Quality / AYUSH Grade</label>
                <select
                  value={herbForm.grade}
                  onChange={(e) => setHerbForm(prev => ({ ...prev, grade: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="AYUSH Grade-A (NABL Tested)">AYUSH Grade-A (NABL Tested)</option>
                  <option value="Wild-Harvest Certified">Wild-Harvest Certified</option>
                  <option value="NPOP Certified Organic">NPOP Certified Organic</option>
                  <option value="Export Grade Botanical">Export Grade Botanical</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Stock Quantity (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    placeholder="e.g. 50"
                    value={herbForm.quantityKg}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, quantityKg: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Price per 100g (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 150"
                    value={herbForm.pricePer100g}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, pricePer100g: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Harvest Date</label>
                  <input
                    type="date"
                    value={herbForm.harvestDate}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Herb Photo (Upload or URL)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={herbForm.imageUrl}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <label style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <UploadCloud size={14} />
                    <span>{uploadingPhoto ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Lab Certificate Upload */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>NABL Lab CoA Certificate (PDF)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="/uploads/sample_lab_coA.pdf"
                    value={herbForm.labReportUrl}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, labReportUrl: e.target.value }))}
                    style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <label style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FileText size={14} />
                    <span>{uploadingPdfDoc ? 'Uploading...' : 'Upload PDF'}</span>
                    <input type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Therapeutic & Organoleptic Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Active Bioactives / Compounds</label>
                  <input
                    type="text"
                    placeholder="e.g. Withaferin-A > 1.8%, Glycosides"
                    value={herbForm.activeCompounds}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, activeCompounds: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Ayurveda Rasa & Virya</label>
                  <input
                    type="text"
                    placeholder="e.g. Tikta, Kashaya • Ushna"
                    value={herbForm.rasa}
                    onChange={(e) => setHerbForm(prev => ({ ...prev, rasa: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Organoleptic Notes */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Organoleptic Profile (Aroma, Taste, Texture)</label>
                <input
                  type="text"
                  placeholder="e.g. Characteristic sweet-bitter aroma, buff fracture"
                  value={herbForm.organolepticNotes}
                  onChange={(e) => setHerbForm(prev => ({ ...prev, organolepticNotes: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setHerbModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHerb}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {submittingHerb ? 'Saving Lot...' : (herbModalMode === 'add' ? 'Publish Batch' : 'Update Batch')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. RESTOCK MODAL */}
      {restockModalBatch && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Restock Herb Batch</h3>
              <button onClick={() => setRestockModalBatch(null)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>{restockModalBatch.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Current Available: {restockModalBatch.quantityKg} kg</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Add Stock (kg)</label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '15px', fontWeight: '800', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[10, 25, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRestockAmount(val)}
                    style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    +{val}kg
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRestockModalBatch(null)}
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={submittingRestock}
                onClick={handleConfirmRestock}
                style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                {submittingRestock ? 'Restocking...' : `Add +${restockAmount} kg`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deleteConfirmBatch && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Trash2 size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>Delete Herb Batch?</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                Are you sure you want to remove <strong>{deleteConfirmBatch.name}</strong> (#{deleteConfirmBatch.batchNumber})? It will also be delisted from the customer catalog.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmBatch(null)}
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={deletingBatch}
                onClick={handleConfirmDelete}
                style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                {deletingBatch ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. QR TRACEABILITY INSPECT MODAL */}
      {qrModalBatch && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '460px', padding: '28px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setQrModalBatch(null)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#f0fdf4', display: 'inline-block', marginBottom: '14px', border: '2px solid #bbf7d0' }}>
              <QrCode size={160} color="#15803d" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              {qrModalBatch.name}
            </h3>
            <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: '#15803d', backgroundColor: '#ecfdf5', padding: '3px 10px', borderRadius: '9999px', display: 'inline-block', marginBottom: '14px' }}>
              {qrModalBatch.batchNumber}
            </div>

            <div style={{ textAlign: 'left', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div><strong>Harvest Date:</strong> {new Date(qrModalBatch.harvestDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
              <div><strong>Farm Location:</strong> {qrModalBatch.farmLocation || 'Organic Valley Cooperative'}</div>
              <div><strong>NABL Test Status:</strong> Passed (Pesticide, Lead & Mercury Free)</div>
              <div><strong>Active Bioactives:</strong> {qrModalBatch.activeCompounds || 'Potency Verified'}</div>
            </div>

            <button
              onClick={() => setQrModalBatch(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 5. CREATE CATEGORY MODAL */}
      {categoryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Create Herbal Category</h3>
              <button onClick={() => setCategoryModalOpen(false)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wild Forest Resins, Sun-Dried Berries"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Description</label>
                <input
                  type="text"
                  placeholder="Description of herbs included..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {submittingCat ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5B. EDIT CATEGORY MODAL */}
      {editCatModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="#15803d" />
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Edit Category</h3>
              </div>
              <button onClick={() => setEditCatModalOpen(false)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={editCatNewName}
                  onChange={(e) => setEditCatNewName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  Renaming will automatically update all herbs currently in "{editingCatName}".
                </span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Botanical notes or classification..."
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditCatModalOpen(false)}
                  style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEditCat}
                  style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {submittingEditCat ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5C. DELETE CATEGORY CONFIRMATION MODAL */}
      {deleteCatModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                Delete "{deletingCatName}"?
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                Are you sure you want to delete this category? Any herbs currently in this category will be safely reassigned to "Ayurvedic Kitchen Herbs".
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteCatModalOpen(false)}
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={submittingDeleteCat}
                onClick={handleConfirmDeleteCategory}
                style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
              >
                {submittingDeleteCat ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 6. REQUEST SETTLEMENT PAYOUT MODAL */}
      {payoutModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '440px', padding: '26px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Request Payment Settlement</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Eligible balance: <strong>₹{metrics.pendingSettlement.toLocaleString('en-IN')}</strong>
                </p>
              </div>
              <button onClick={() => setPayoutModalOpen(false)} style={{ background: '#f8fafc', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>Payout Amount (₹) *</label>
                <input
                  type="number"
                  min="500"
                  max={metrics.pendingSettlement || 100000}
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
                  placeholder="e.g. State Bank of India"
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
                    placeholder="e.g. SBIN0001244"
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
                  style={{ padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#15803d', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {submittingPayout ? 'Submitting...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. UNIVERSAL SUPPORT TICKET MODAL */}
      <RaiseSupportTicketModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        userRole="FARMER"
      />

      {/* 100% Mobile Responsive Styles for Farmer Console */}
      <style>{`
        @media (max-width: 900px) {
          .farmer-mobile-toggle {
            display: flex !important;
          }
          .farmer-sidebar-drawer {
            position: fixed !important;
            left: -320px;
            top: 0;
            bottom: 0;
            width: 275px !important;
            transition: left 0.28s ease !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3) !important;
          }
          .farmer-drawer-open {
            position: fixed !important;
            left: 0 !important;
            top: 0;
            bottom: 0;
            width: 275px !important;
            transition: left 0.28s ease !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3) !important;
          }
          .farmer-dashboard-header {
            padding: 10px 14px !important;
            height: auto !important;
          }
        }
        @media (min-width: 901px) {
          .farmer-sidebar-drawer {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .farmer-dashboard-header h1 {
            font-size: 15px !important;
          }
        }
      `}</style>

    </div>
  );
}
