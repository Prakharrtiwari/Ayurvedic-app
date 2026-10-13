import React, { useState } from 'react';
import { X, User, Stethoscope, Sprout, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [role, setRole] = useState('patient');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (mobile) setOtpSent(true);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setOtpSent(false);
      setMobile('');
      onClose();
    }, 1500);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 40, 25, 0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 70px -15px rgba(25, 55, 35, 0.3)',
          padding: '32px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#edf5ee',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2a4430',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {!isSuccess ? (
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#16311e', marginBottom: '4px' }}>
              Portal Sign In
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#567560', marginBottom: '20px' }}>
              Access your medical records, consultations & prescriptions.
            </p>

            {/* Role Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', backgroundColor: '#edf5ee', padding: '4px', borderRadius: '12px', marginBottom: '22px' }}>
              <button
                type="button"
                onClick={() => { setRole('patient'); setOtpSent(false); }}
                style={{
                  padding: '7px 4px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: role === 'patient' ? '#6ea343' : 'transparent',
                  color: role === 'patient' ? '#ffffff' : '#395741',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => { setRole('doctor'); setOtpSent(false); }}
                style={{
                  padding: '7px 4px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: role === 'doctor' ? '#6ea343' : 'transparent',
                  color: role === 'doctor' ? '#ffffff' : '#395741',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                BHMS Doctor
              </button>
              <button
                type="button"
                onClick={() => { setRole('vendor'); setOtpSent(false); }}
                style={{
                  padding: '7px 4px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: role === 'vendor' ? '#6ea343' : 'transparent',
                  color: role === 'vendor' ? '#ffffff' : '#395741',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Farmer/Vendor
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Registered Mobile Number
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1px solid #dcece1',
                      fontSize: '14px',
                      color: '#1f3825',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary-pill"
                  style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                >
                  Send OTP <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify}>
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase' }}>
                      Enter 4-Digit OTP
                    </label>
                    <span style={{ fontSize: '11px', color: '#4e7e2c', cursor: 'pointer' }} onClick={() => setOtpSent(false)}>
                      Change number
                    </span>
                  </div>
                  <input 
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1 2 3 4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1px solid #dcece1',
                      fontSize: '18px',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      color: '#1f3825',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#668971', marginTop: '6px', textAlign: 'center' }}>
                    Sent to {mobile} • (Use any 4 digits to test)
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary-pill"
                  style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                >
                  Verify & Open Dashboard <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={40} color="#5e9434" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '1.25rem', color: '#16311e' }}>Welcome Back!</h4>
            <p style={{ fontSize: '0.88rem', color: '#567560' }}>Redirecting to your {role} dashboard...</p>
          </div>
        )}

      </div>
    </div>
  );
}
