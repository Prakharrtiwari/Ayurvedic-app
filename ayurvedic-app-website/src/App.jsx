import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GoogleTranslateFloatingWidget from './components/GoogleTranslateFloatingWidget';
import ImpersonationBanner from './components/ImpersonationBanner';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import TraceabilityPage from './pages/TraceabilityPage';
import AiAssessmentPage from './pages/AiAssessmentPage';
import DoctorBookingPage from './pages/DoctorBookingPage';
import ProgramsPage from './pages/ProgramsPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import CommunityPage from './pages/CommunityPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Dedicated Role Dashboards
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import FarmerDashboard from './pages/dashboards/FarmerDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';

// Helper component to reset scroll on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainAppLayout({ cart, handleAddToCart, handleUpdateCartQty, handleRemoveCartItem, handleClearCart, toastMessage }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // NOTE: Farmer and Seller are the exact same entity in this application.
  // The UI displays "Seller" to users, while internal system roles and models reference FARMER.
  // Dedicated Portals: Enterprise consoles (Admin, Doctor, Seller/Farmer) + Patient Portal
  const isEnterpriseConsole = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/dashboard/admin') ||
    location.pathname.startsWith('/doctor') || 
    location.pathname.startsWith('/dashboard/doctor') ||
    location.pathname.startsWith('/farmer') || 
    location.pathname.startsWith('/dashboard/farmer') ||
    location.pathname.startsWith('/seller') || 
    location.pathname.startsWith('/dashboard/seller');

  const isPatientPortal = 
    location.pathname.startsWith('/patient') || 
    location.pathname.startsWith('/dashboard/patient') ||
    location.pathname.startsWith('/profile');

  const isDedicatedPortal = isEnterpriseConsole || isPatientPortal;

  // Strict showcase separation:
  // 1. Logged in users CANNOT wander around showcase website. They are kept inside their dedicated console.
  // 2. Logged out guests cannot access portals; they are routed to /portal.
  useEffect(() => {
    if (!loading) {
      if (user && !isDedicatedPortal) {
        const role = user.role;
        if (role === 'ADMIN') navigate('/admin', { replace: true });
        else if (role === 'DOCTOR') navigate('/doctor', { replace: true });
        else if (role === 'FARMER') navigate('/farmer', { replace: true });
        else navigate('/patient', { replace: true });
      } else if (!user && isDedicatedPortal) {
        navigate('/portal', { replace: true });
      }
    }
  }, [user, loading, isDedicatedPortal, navigate]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Smooth loading state when resolving session on a dedicated portal
  if (loading && isDedicatedPortal) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8faf7',
        color: '#163321'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#15803d',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '-0.2px' }}>Connecting to AYUSH Portal...</div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Verifying secure session credentials</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      height: isEnterpriseConsole ? '100vh' : 'auto',
      maxHeight: isEnterpriseConsole ? '100vh' : 'none',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: isEnterpriseConsole ? 'hidden' : 'visible'
    }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: '#1d3924',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '9999px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            fontSize: '13.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeInUp 0.3s ease'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Super Admin Impersonation Top Banner */}
      <ImpersonationBanner />

      {/* Floating Google Translate Widget (English / Hindi with Minimize and Hide controls) */}
      <GoogleTranslateFloatingWidget />

      {/* Global Navigation Header (Hidden on Dedicated Consoles & Portals which have their own top bars and navigation) */}
      {!isDedicatedPortal && <Navbar cartCount={cartCount} wishlistCount={1} />}

      {/* Dynamic Dedicated Pages */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: isEnterpriseConsole ? '100%' : 'auto',
        overflow: isEnterpriseConsole ? 'hidden' : 'visible',
        minHeight: 0
      }}>
        <Routes>
          <Route path="/" element={<HomePage onAddToCart={handleAddToCart} />} />
          <Route path="/shop" element={<ShopPage onAddToCart={handleAddToCart} />} />
          <Route path="/product/:id" element={<ProductDetailPage onAddToCart={handleAddToCart} />} />
          <Route path="/traceability" element={<TraceabilityPage />} />
          <Route path="/ai-assessment" element={<AiAssessmentPage onAddToCart={handleAddToCart} />} />
          <Route path="/book-doctor" element={<DoctorBookingPage />} />
          <Route path="/programs" element={<ProgramsPage onAddToCart={handleAddToCart} />} />
          <Route 
            path="/cart" 
            element={
              <CartPage 
                items={cart} 
                onUpdateQty={handleUpdateCartQty} 
                onRemoveItem={handleRemoveCartItem} 
                onClearCart={handleClearCart} 
              />
            } 
          />
          <Route path="/portal" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/community" element={<CommunityPage />} />

          {/* Three Professional Partner/Admin Consoles (Admin, Doctor, Seller/Farmer) */}
          {/* NOTE: Farmer and Seller are the exact same entity. FarmerDashboard provides the Seller console. */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />

          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboard/doctor" element={<DoctorDashboard />} />

          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
          <Route path="/seller" element={<FarmerDashboard />} />
          <Route path="/dashboard/seller" element={<FarmerDashboard />} />

          {/* Consumer E-Commerce Patient Experience */}
          <Route path="/patient" element={<PatientDashboard onAddToCart={handleAddToCart} cart={cart} />} />
          <Route path="/dashboard/patient" element={<PatientDashboard onAddToCart={handleAddToCart} cart={cart} />} />
          <Route path="/profile" element={<PatientDashboard onAddToCart={handleAddToCart} cart={cart} />} />
        </Routes>
      </main>

      {/* Global Consumer Footer: Shown on Public Marketing Website, Hidden on Dedicated Consoles & Portals */}
      {!isDedicatedPortal && <Footer />}
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([
    {
      id: 'herb-1',
      name: 'Organic Ashwagandha Root',
      price: 349,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80'
    }
  ]);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image
        }
      ];
    });
    showToast(`✓ "${item.name}" added to your cart`);
  };

  const handleUpdateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
    } else {
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const handleRemoveCartItem = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <MainAppLayout 
            cart={cart}
            handleAddToCart={handleAddToCart}
            handleUpdateCartQty={handleUpdateCartQty}
            handleRemoveCartItem={handleRemoveCartItem}
            handleClearCart={handleClearCart}
            toastMessage={toastMessage}
          />
          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(12px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
