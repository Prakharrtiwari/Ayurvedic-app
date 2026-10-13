import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeftCircle, CheckCircle } from 'lucide-react';

export default function ImpersonationBanner() {
  const { user, isImpersonating, impersonatedName, exitImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  const handleExit = async () => {
    try {
      await exitImpersonation();
      navigate('/admin');
    } catch (e) {
      navigate('/admin');
    }
  };

  return (
    <div style={{
      backgroundColor: '#78350f',
      color: '#ffffff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '13px',
      fontWeight: '700',
      zIndex: 999999,
      position: 'sticky',
      top: 0,
      width: '100%',
      boxSizing: 'border-box',
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      borderBottom: '2px solid #f59e0b'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f59e0b', color: '#78350f', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>
          <ShieldAlert size={14} /> Super Admin Ghost Mode
        </div>
        <span>
          Managing as <strong>{impersonatedName || user?.name}</strong> ({user?.role}). You have full read/write access to perform all operations.
        </span>
      </div>

      <button
        onClick={handleExit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#ffffff',
          color: '#78350f',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap'
        }}
      >
        <ArrowLeftCircle size={14} color="#78350f" /> Exit to Admin Desk
      </button>
    </div>
  );
}
