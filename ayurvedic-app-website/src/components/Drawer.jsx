import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import useModalBackButton from '../hooks/useModalBackButton';

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  badge,
  width = '580px', 
  children,
  footer
}) {
  // Trap browser/mobile Back button so pressing Back dismisses the drawer
  useModalBackButton(isOpen, onClose);
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const drawerContent = (
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
        display: 'flex',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        overscrollBehavior: 'none',
        animation: 'fadeInBackdrop 0.2s ease'
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      />

      {/* Drawer Container */}
      <div 
        className="app-slide-drawer"
        style={{
          position: 'relative',
          width: width,
          maxWidth: '100vw',
          height: '100vh',
          height: '100dvh',
          maxHeight: '100dvh',
          backgroundColor: '#ffffff',
          boxShadow: '-8px 0 36px rgba(15, 23, 42, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100000,
          overflow: 'hidden',
          overscrollBehavior: 'contain',
          animation: 'slideInDrawer 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header: Clean & Professional */}
        <div 
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            flexShrink: 0
          }}
        >
          <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
            {badge && (
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  padding: '2px 8px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase', 
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px', 
                  ...(typeof badge === 'object' ? badge.style : {}) 
                }}
              >
                {typeof badge === 'object' && badge.icon && <badge.icon size={12} />}
                <span>{typeof badge === 'object' ? badge.text : badge}</span>
              </div>
            )}
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Drawer Body (Scrollable within container) */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '24px 20px 48px 20px',
            backgroundColor: '#ffffff'
          }}
        >
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div 
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              flexShrink: 0
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInDrawer {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeInBackdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (max-width: 768px) {
          .app-slide-drawer {
            width: 100vw !important;
            max-width: 100vw !important;
          }
        }
      `}</style>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
}
