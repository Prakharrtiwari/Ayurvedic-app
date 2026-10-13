import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, 
  Sparkles, 
  QrCode,
  LogOut,
  ShieldCheck,
  Stethoscope,
  Sprout,
  Home,
  Layers,
  Globe
} from 'lucide-react';

export default function Navbar({ cartCount = 0, wishlistCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, role, logout } = useAuth();
  const { lang, selectLanguage } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 30) {
        setIsScrolled(true);
      } else if (scrollY < 10) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll whenever mobile drawer is open so home page never scrolls underneath
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [mobileMenuOpen]);

  const leftLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Doctors', path: '/book-doctor' },
    { name: 'Programs', path: '/programs' }
  ];

  const rightLinks = [
    { name: 'Traceability', path: '/traceability' },
    { name: 'AI Assessment', path: '/ai-assessment' }
  ];

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'DOCTOR') return '/doctor';
    if (role === 'FARMER') return '/farmer';
    return '/patient';
  };

  const getRoleBadge = () => {
    // NOTE: FARMER role is displayed as "Seller" across the UI (farmer hi seller hai).
    if (role === 'ADMIN') return { label: 'Admin', bg: '#283125', color: '#ffffff' };
    if (role === 'DOCTOR') return { label: 'Doctor', bg: '#5E7247', color: '#ffffff' };
    if (role === 'FARMER') return { label: 'Seller', bg: '#8D9B8C', color: '#ffffff' };
    return { label: 'Patient', bg: '#E6D7B9', color: '#283125' };
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/shop?q=${encodeURIComponent(quickSearch)}`);
      setIsSearchActive(false);
      setQuickSearch('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Bottom Navigation Bar tabs for mobile app experience
  const bottomNavTabs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Doctors', path: '/book-doctor', icon: Stethoscope },
    { label: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { 
      label: isAuthenticated ? (role === 'PATIENT' ? 'Profile' : 'Desk') : 'Account', 
      path: isAuthenticated ? getDashboardPath() : '/portal', 
      icon: User 
    }
  ];

  return (
    <>
      {/* =========================================================================
          1. TOP APP BAR
          Desktop: 3-column Grid (Links, Logo, Actions)
          Mobile (<= 768px): ONLY Logo on Left + Three Lines (☰) on Right
      ========================================================================= */}
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          paddingTop: '12px',
          paddingBottom: '12px',
          transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          backgroundColor: isScrolled ? 'rgba(247, 250, 248, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: isScrolled ? '1px solid rgba(20, 56, 35, 0.08)' : '1px solid rgba(20, 56, 35, 0.04)',
          boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.04)' : 'none'
        }}
      >
        <div className="container-custom">
          
          {/* DESKTOP NAVBAR LAYOUT (> 768px) */}
          <div 
            className="navbar-desktop-row"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto 1fr', 
              alignItems: 'center' 
            }}
          >
            {/* Desktop Left Nav Links */}
            <nav 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '26px', 
                justifyContent: 'flex-start'
              }}
            >
              {leftLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    style={{
                      fontSize: '13.5px',
                      fontWeight: isActive ? '700' : '500',
                      color: isActive ? 'var(--palette-leaf, #5E7247)' : 'var(--palette-cypress, #283125)',
                      textDecoration: 'none',
                      position: 'relative',
                      padding: '4px 0',
                      letterSpacing: '-0.01em',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {link.name}
                    {isActive && (
                      <span 
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          left: '0',
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'var(--palette-leaf, #5E7247)',
                          borderRadius: '2px'
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Center: Logo */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Logo size="normal" />
            </div>

            {/* Desktop Right: Actions, Search, Dashboard & Cart */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '14px', 
                justifyContent: 'flex-end'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px', 
                  marginRight: '8px'
                }}
              >
                {rightLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? '700' : '500',
                        color: isActive ? 'var(--palette-leaf, #5E7247)' : 'var(--palette-cypress, #283125)',
                        textDecoration: 'none',
                        position: 'relative',
                        padding: '4px 0',
                        letterSpacing: '-0.01em',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {link.name}
                      {isActive && (
                        <span 
                          style={{
                            position: 'absolute',
                            bottom: '-2px',
                            left: '0',
                            width: '100%',
                            height: '2px',
                            backgroundColor: 'var(--palette-leaf, #5E7247)',
                            borderRadius: '2px'
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Quick Search */}
              {!isSearchActive ? (
                <button
                  onClick={() => setIsSearchActive(true)}
                  className="nav-icon-btn"
                  style={{
                    color: 'var(--palette-cypress, #283125)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--palette-cream-light, #F8F4EC)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(141, 155, 140, 0.18)',
                    cursor: 'pointer'
                  }}
                  title="Search Herbs"
                >
                  <Search size={16} strokeWidth={2} />
                </button>
              ) : (
                <form 
                  className="search-form"
                  onSubmit={handleSearchSubmit}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    border: '1.5px solid var(--palette-leaf, #5E7247)',
                    boxShadow: '0 4px 14px rgba(40, 49, 37, 0.1)'
                  }}
                >
                  <Search size={13} color="var(--palette-leaf, #5E7247)" style={{ marginRight: '6px', flexShrink: 0 }} />
                  <input 
                    type="text"
                    className="bare-input"
                    autoFocus
                    placeholder="Search herbs..."
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    style={{ 
                      fontSize: '12.5px', 
                      width: '120px', 
                      color: 'var(--palette-cypress, #283125)'
                    }}
                    onBlur={() => {
                      if (!quickSearch) setIsSearchActive(false);
                    }}
                  />
                </form>
              )}

              {/* User Session / Role Dashboard Button */}
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    to={getDashboardPath()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      backgroundColor: getRoleBadge().bg,
                      color: getRoleBadge().color,
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    <User size={13} /> {user?.name?.split(' ')[0]} ({getRoleBadge().label})
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Logout"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d4ded3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7a3e3e',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/portal"
                  className="nav-icon-btn"
                  style={{
                    color: 'var(--palette-cypress, #283125)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--palette-cream-light, #F8F4EC)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(141, 155, 140, 0.18)'
                  }}
                  title="Sign In / Register Portal"
                >
                  <User size={17} strokeWidth={2} />
                </Link>
              )}

              {/* Shopping Bag Icon */}
              <Link
                to="/cart"
                className="nav-icon-btn"
                style={{
                  color: 'var(--palette-cypress, #283125)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--palette-cream-light, #F8F4EC)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: '1px solid rgba(141, 155, 140, 0.18)'
                }}
                title="View Cart"
              >
                <ShoppingBag size={17} strokeWidth={2} />
                {cartCount > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: 'var(--palette-cypress, #283125)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '800',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* MOBILE APP BAR LAYOUT (<= 768px):
              - Left: ONLY 3 lines (☰) with no heavy box/border
              - Center: Ayurveda Logo in the exact middle
              - Right: Balanced spacer / Cart icon
          */}
          <div 
            className="navbar-mobile-row"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0 4px'
            }}
          >
            {/* 1. Left: ONLY 3 lines hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--palette-cypress, #283125)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px'
              }}
              aria-label="Open Menu Drawer"
            >
              <Menu size={26} strokeWidth={2.4} />
            </button>

            {/* 2. Center: Ayurveda Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Logo size="normal" />
            </div>

            {/* 3. Right: Balanced Cart icon to keep Logo centered */}
            <div style={{ width: '38px', display: 'flex', justifyContent: 'flex-end' }}>
              <Link 
                to="/cart" 
                style={{ 
                  color: 'var(--palette-cypress, #283125)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textDecoration: 'none',
                  position: 'relative',
                  padding: '4px'
                }}
                aria-label="Cart"
              >
                <ShoppingBag size={21} strokeWidth={2} />
                {cartCount > 0 && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-4px',
                      backgroundColor: 'var(--palette-cypress, #283125)',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: '800',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* =========================================================================
          2. MOBILE DRAWER MENU: Simple Toggle, Small Login Buttons, No Search
      ========================================================================= */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal((
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            height: '100dvh',
            maxHeight: '100dvh',
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 18, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'flex-start',
            overflow: 'hidden',
            overscrollBehavior: 'none',
            animation: 'fadeInBackdrop 0.2s ease'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            style={{
              width: '85%',
              maxWidth: '320px',
              height: '100vh',
              height: '100dvh',
              maxHeight: '100dvh',
              backgroundColor: '#ffffff',
              boxShadow: '8px 0 36px rgba(0, 0, 0, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              overscrollBehavior: 'contain',
              animation: 'slideInLeftDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header (Fixed at top) */}
            <div 
              style={{ 
                padding: '16px 18px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '8px',
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}
            >
              <Logo size="small" />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Language Toggle */}
                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#f1f5f2',
                    padding: '2px',
                    borderRadius: '20px',
                    border: '1px solid #d5e2d8'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectLanguage('en')}
                    style={{
                      padding: '3px 9px',
                      borderRadius: '16px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backgroundColor: lang === 'en' ? 'var(--palette-cypress, #283125)' : 'transparent',
                      color: lang === 'en' ? '#ffffff' : '#4b5563',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => selectLanguage('hi')}
                    style={{
                      padding: '3px 9px',
                      borderRadius: '16px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backgroundColor: lang === 'hi' ? 'var(--palette-cypress, #283125)' : 'transparent',
                      color: lang === 'hi' ? '#ffffff' : '#4b5563',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    हिन्दी
                  </button>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ 
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#f8fafc', 
                    color: '#475569', 
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  aria-label="Close Navigation"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Drawer Body (Scrollable with touch momentum) */}
            <div 
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Account Quick Status */}
              {isAuthenticated ? (
                <div 
                  style={{ 
                    backgroundColor: '#f8faf7', 
                    padding: '10px 12px', 
                    borderRadius: '10px', 
                    border: '1px solid #d4ded3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '9.5px', color: '#5E7247', fontWeight: '800', textTransform: 'uppercase' }}>{role}</span>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#283125' }}>{user?.name}</div>
                  </div>
                  <Link 
                    to={getDashboardPath()} 
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ fontSize: '11.5px', fontWeight: '700', color: '#166534', textDecoration: 'none' }}
                  >
                    Dashboard →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Link
                    to="/portal?mode=login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      backgroundColor: 'var(--palette-cypress, #283125)',
                      color: '#ffffff',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    <User size={13} /> Log In
                  </Link>
                  <Link
                    to="/portal?mode=register"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      color: '#1f2937',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Herbal Shop', path: '/shop' },
                  { name: 'Book BHMS Doctor', path: '/book-doctor' },
                  { name: 'Chronic Disease Programs', path: '/programs' },
                  { name: 'QR Herb Traceability', path: '/traceability' },
                  { name: 'Clinical Health Assessment', path: '/ai-assessment' },
                  { name: 'Community Q&A Forum', path: '/community' },
                  { name: 'Shopping Cart', path: '/cart', badge: cartCount > 0 ? cartCount : null },
                  isAuthenticated 
                    ? { name: `My ${role === 'FARMER' ? 'Seller' : role} Dashboard`, path: getDashboardPath() } 
                    : { name: 'Doctor / Patient / Seller Portal', path: '/portal' }
                ].map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? '700' : '500',
                        color: isActive ? '#166534' : '#334155',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span 
                          style={{
                            fontSize: '10.5px',
                            fontWeight: '700',
                            backgroundColor: '#166534',
                            color: '#ffffff',
                            padding: '1px 7px',
                            borderRadius: '9999px'
                          }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer (Fixed at bottom) */}
            <div 
              style={{ 
                padding: '14px 16px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                <ShieldCheck size={14} color="#166534" />
                <span>100% Certified Authentic Botanical Herbs</span>
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    textAlign: 'left', 
                    padding: '4px 0', 
                    color: '#dc2626', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideInLeftDrawer {
              from {
                transform: translateX(-100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      ), document.body)}

      {/* =========================================================================
          3. NATIVE MOBILE BOTTOM NAVIGATION BAR (App-like experience)
          Only displayed when user is logged in as a patient on <= 768px screens.
          Unauthenticated users see the clean normal website flow.
      ========================================================================= */}
      {isAuthenticated && (role?.toLowerCase() === 'patient' || !role || role?.toLowerCase() === 'user') && (
        <nav 
          className="mobile-bottom-app-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 998,
            height: '62px',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(20, 56, 35, 0.1)',
            display: 'none', // Controlled by media queries below
            alignItems: 'center',
            justifyContent: 'space-around',
            boxShadow: '0 -4px 18px rgba(0, 0, 0, 0.05)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          {bottomNavTabs.map((tab) => {
            const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--palette-cypress, #283125)' : '#64748b',
                  position: 'relative',
                  flex: 1,
                  padding: '6px 0',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 1.8} 
                    color={isActive ? 'var(--palette-cypress, #283125)' : '#64748b'} 
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-9px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        fontSize: '9.5px',
                        fontWeight: '800',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 2px'
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span 
                  style={{ 
                    fontSize: '10.5px', 
                    fontWeight: isActive ? '800' : '600',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '2px',
                      width: '16px',
                      height: '3px',
                      backgroundColor: 'var(--palette-leaf, #5E7247)',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Responsive Media Query Styles */}
      <style>{`
        @media (max-width: 768px) {
          .navbar-desktop-row {
            display: none !important;
          }
          .navbar-mobile-row {
            display: flex !important;
          }
          .mobile-bottom-app-bar {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .navbar-desktop-row {
            display: grid !important;
          }
          .navbar-mobile-row {
            display: none !important;
          }
          .mobile-bottom-app-bar {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

