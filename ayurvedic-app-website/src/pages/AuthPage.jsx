import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Stethoscope, 
  Sprout, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  UploadCloud,
  Sparkles,
  Info,
  Gift,
  Truck,
  Heart,
  Star,
  Phone,
  Mail,
  Zap,
  Check,
  ShoppingBag,
  ArrowLeft
} from 'lucide-react';
import PdfUploader from '../components/PdfUploader';
import { authApi } from '../services/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const roleParam = searchParams.get('role');

  // NOTE: Farmer and Seller are identical entities in this ecosystem (farmer hi seller hai).
  // The UI displays "Seller" to all users, while internal APIs and auth routes use registerFarmer / FARMER role.
  const { login, registerPatient, registerDoctor, registerFarmer, user } = useAuth();

  const [activeRole, setActiveRole] = useState(roleParam || 'patient'); // 'patient', 'doctor', 'farmer' (Seller), 'admin'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Patient E-commerce Login Type: 'email' or 'otp'
  const [patientLoginType, setPatientLoginType] = useState('email');
  const [patientPhoneInput, setPatientPhoneInput] = useState('+91 98765 43210');
  const [patientOtpSent, setPatientOtpSent] = useState(false);
  const [patientOtpInput, setPatientOtpInput] = useState('');

  // Shared Login State
  const [identifier, setIdentifier] = useState('patient.arav@ayurveda.org');
  const [password, setPassword] = useState('patient123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeRole, authMode]);

  // If already logged in, redirect immediately to user's role dashboard (no lingering on login)
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (user.role === 'DOCTOR') navigate('/doctor', { replace: true });
      else if (user.role === 'FARMER') navigate('/farmer', { replace: true });
      else navigate('/patient', { replace: true });
    }
  }, [user, navigate]);

  // Multi-step Registration Forms
  // 1. Patient Form
  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'B+',
    conditions: ''
  });

  // 2. Doctor Multi-step Form
  const [doctorStep, setDoctorStep] = useState(1);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    degree: 'BHMS',
    college: '',
    passingYear: 2018,
    councilName: 'Delhi Homoeopathic Council / NCH',
    registrationNumber: '',
    registrationYear: 2019,
    experienceYears: 5,
    specialization: 'Metabolic & Diabetes, Chronic Pain',
    consultationFee: 499,
    clinicAddress: '',
    degreeCertUrl: '/uploads/bhms_degree.pdf',
    councilCertUrl: '/uploads/ayush_council_cert.pdf',
    idProofUrl: '/uploads/doctor_govt_id.pdf'
  });

  // 3. Farmer Multi-step Form
  const [farmerStep, setFarmerStep] = useState(1);
  const [farmerForm, setFarmerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    fpoOrFarmName: '',
    farmState: 'Madhya Pradesh',
    farmDistrict: '',
    farmVillage: '',
    acreage: 15,
    cropsGrown: 'Nagori Ashwagandha, Wild Giloy',
    fssaiNumber: '',
    organicCertNumber: '',
    bankName: 'State Bank of India',
    bankAccountNo: '',
    bankIfsc: '',
    fssaiCertUrl: '/uploads/fssai_cert.pdf',
    organicCertUrl: '/uploads/npop_cert.pdf',
    idProofUrl: '/uploads/farmer_id.pdf'
  });

  // Quick Demo Auto-Fill helper
  const handleQuickDemoFill = (roleType) => {
    setActiveRole(roleType);
    setAuthMode('login');
    setErrorMsg(null);
    if (roleType === 'admin') {
      setIdentifier('admin@ayurveda.org');
      setPassword('admin123');
    } else if (roleType === 'doctor') {
      setIdentifier('dr.ananya@ayurveda.org');
      setPassword('doctor123');
    } else if (roleType === 'farmer') {
      setIdentifier('farmer.ramesh@ayurveda.org');
      setPassword('farmer123');
    } else if (roleType === 'patient') {
      setIdentifier('patient.arav@ayurveda.org');
      setPassword('patient123');
    }
  };

  const handleRedirect = (userRole) => {
    // Restore any pending action initiated from the marketing/showcase website
    try {
      const pendingRaw = localStorage.getItem('ayurveda_pending_action');
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        localStorage.removeItem('ayurveda_pending_action');
        if (pending.type === 'book_doctor') {
          navigate(`/patient?tab=doctors&doctorId=${pending.doctorId || ''}&book=true`, { replace: true });
          return;
        } else if (pending.type === 'buy_item') {
          navigate(`/patient?tab=store&buyItem=${pending.itemId || ''}`, { replace: true });
          return;
        } else if (pending.type === 'community') {
          navigate('/patient?tab=community', { replace: true });
          return;
        } else if (pending.type === 'chat') {
          navigate(`/patient?tab=chat&doctorId=${pending.doctorId || ''}`, { replace: true });
          return;
        }
      }
    } catch (e) {
      // quiet fallback
    }

    if (redirectParam) {
      navigate(redirectParam, { replace: true });
      return;
    }
    if (userRole === 'ADMIN') navigate('/admin', { replace: true });
    else if (userRole === 'DOCTOR') navigate('/doctor', { replace: true });
    else if (userRole === 'FARMER') navigate('/farmer', { replace: true });
    else navigate('/patient', { replace: true });
  };

  const handle1ClickPatientDirectLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const loggedUser = await login({
        identifier: 'patient.arav@ayurveda.org',
        password: 'patient123',
        role: 'PATIENT'
      });
      handleRedirect('PATIENT');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Real OTP generation state
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!patientPhoneInput || patientPhoneInput.length < 8) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    setSendingOtp(true);
    setErrorMsg(null);
    try {
      const res = await authApi.sendOtp(patientPhoneInput);
      if (res.success) {
        setPatientOtpSent(true);
        setGeneratedOtp(res.devOtp);
        setPatientOtpInput(res.devOtp); // Convenience auto-fill for testing
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // In Real OTP mode for patient
      if (activeRole === 'patient' && patientLoginType === 'otp') {
        const res = await authApi.verifyOtp({
          phone: patientPhoneInput,
          otp: patientOtpInput
        });
        if (res.success && res.token) {
          localStorage.setItem('ayurveda_token', res.token);
          if (redirectParam) {
            window.location.href = redirectParam;
          } else {
            window.location.href = '/patient';
          }
          return;
        }
      }

      const loggedUser = await login({
        identifier,
        password,
        role: activeRole.toUpperCase()
      });

      // Redirect to proper role dashboard or requested redirect
      handleRedirect(loggedUser.role);
    } catch (err) {
      setErrorMsg(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await registerPatient({
        name: patientForm.name,
        email: patientForm.email,
        phone: patientForm.phone,
        password: patientForm.password,
        age: patientForm.age || '28',
        gender: patientForm.gender || 'Male',
        bloodGroup: patientForm.bloodGroup || 'B+',
        existingConditions: patientForm.conditions ? [patientForm.conditions] : []
      });
      handleRedirect('PATIENT');
    } catch (err) {
      setErrorMsg(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const newUser = await registerDoctor({
        ...doctorForm,
        specialization: doctorForm.specialization.split(',').map(s => s.trim())
      });
      setSuccessInfo({
        role: 'Doctor',
        title: 'BHMS Clinician Profile Submitted!',
        description: `Your application with registration number ${doctorForm.registrationNumber} has been securely submitted to the Super Admin desk. You can now access your doctor workspace in verification mode.`
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const newUser = await registerFarmer({
        ...farmerForm,
        cropsGrown: farmerForm.cropsGrown.split(',').map(c => c.trim())
      });
      setSuccessInfo({
        role: 'Seller',
        title: 'Producer & Statutory Profile Submitted!',
        description: `Your seller profile for ${farmerForm.fpoOrFarmName} has been routed to the Super Admin desk for FSSAI & NPOP organic certificate validation.`
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '90vh', backgroundColor: '#fafbf9', padding: '28px 16px 80px 16px' }}>
      <div style={{ maxWidth: activeRole === 'patient' ? '1060px' : '680px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>

        {/* Professional Top Bar: Only shown for Doctor, Farmer, Admin portals */}
        {activeRole !== 'patient' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveRole('patient');
                  handleQuickDemoFill('patient');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#166534',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} /> ← Back to Simple Patient Login
              </button>
            </div>

            {/* 1-Click Quick Demo Login Top Bar for Professionals */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '14px 20px', marginBottom: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Sparkles size={14} color="#059669" /> 1-Click Professional Demo Auto-Fill
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Select test credentials</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('doctor')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: activeRole === 'doctor' ? '2px solid #2563eb' : '1px solid #d1d5db',
                    backgroundColor: activeRole === 'doctor' ? '#eff6ff' : '#f8fafc',
                    color: activeRole === 'doctor' ? '#1e40af' : '#1e293b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  🩺 Verified Doctor
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('farmer')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: activeRole === 'farmer' ? '2px solid #059669' : '1px solid #d1d5db',
                    backgroundColor: activeRole === 'farmer' ? '#ecfdf5' : '#f8fafc',
                    color: activeRole === 'farmer' ? '#065f46' : '#1e293b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  🌱 Pending Seller
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoFill('admin')}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: activeRole === 'admin' ? '2px solid #163321' : '1px solid #d1d5db',
                    backgroundColor: activeRole === 'admin' ? '#163321' : '#f8fafc',
                    color: activeRole === 'admin' ? '#ffffff' : '#1e293b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  👑 Super Admin
                </button>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                backgroundColor: '#e2e8f0',
                padding: '4px',
                borderRadius: '9999px',
                marginBottom: '24px'
              }}
            >
              {[
                { id: 'doctor', label: 'Doctor (BHMS)', icon: Stethoscope },
                { id: 'farmer', label: 'Seller (FPO)', icon: Sprout },
                { id: 'admin', label: 'Super Admin', icon: ShieldCheck }
              ].map(r => {
                const isSelected = activeRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setActiveRole(r.id);
                      setErrorMsg(null);
                      setSuccessInfo(null);
                      handleQuickDemoFill(r.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 4px',
                      borderRadius: '9999px',
                      border: 'none',
                      backgroundColor: isSelected ? '#1d3924' : 'transparent',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontSize: '12.5px',
                      fontWeight: isSelected ? '800' : '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <r.icon size={14} /> {r.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* =========================================================================
            A. PATIENT EXPERIENCE: STUNNING CONSUMER E-COMMERCE & HEALTH APP LOGIN
        ========================================================================= */}
        {activeRole === 'patient' && (
          <div 
            style={{ 
              maxWidth: '440px',
              margin: '20px auto 0 auto',
              backgroundColor: '#ffffff', 
              borderRadius: '24px', 
              border: '1.5px solid #e2e8f0', 
              boxShadow: '0 16px 40px -10px rgba(29, 57, 36, 0.08)', 
              padding: '36px 28px'
            }}
          >
            <div>
                {/* Header & Mode Switcher */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                      {authMode === 'login' ? 'Patient Sign In' : 'Create Patient Account'}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                      {authMode === 'login' ? 'Access your health records & orders' : 'Join and receive ₹100 welcome coins'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setErrorMsg(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {authMode === 'login' ? 'New here? Register' : 'Existing? Sign In'}
                  </button>
                </div>

                {/* Instant 1-Tap Demo Patient Login Button */}
                <button
                  type="button"
                  onClick={handle1ClickPatientDirectLogin}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    backgroundColor: '#fffbeb',
                    border: '2px solid #f59e0b',
                    color: '#92400e',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Zap size={18} color="#d97706" />
                  <span>⚡ Instant 1-Tap Login: Arav Patel (Demo Patient)</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>or sign in with credentials</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}

                {/* Sign In Form */}
                {authMode === 'login' ? (
                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Method Selector: Email vs Mobile OTP */}
                    <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setPatientLoginType('email')}
                        style={{
                          flex: 1,
                          padding: '7px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: patientLoginType === 'email' ? '#ffffff' : 'transparent',
                          color: patientLoginType === 'email' ? '#0f172a' : '#64748b',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Mail size={13} /> Email & Password
                      </button>
                      <button
                        type="button"
                        onClick={() => setPatientLoginType('otp')}
                        style={{
                          flex: 1,
                          padding: '7px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: patientLoginType === 'otp' ? '#ffffff' : 'transparent',
                          color: patientLoginType === 'otp' ? '#0f172a' : '#64748b',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Phone size={13} /> Mobile OTP (E-Commerce)
                      </button>
                    </div>

                    {patientLoginType === 'email' ? (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Email Address or Phone
                          </label>
                          <input 
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="e.g. patient.arav@ayurveda.org"
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase' }}>
                              Password
                            </label>
                            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is: patient123'); }} style={{ fontSize: '12px', color: '#059669', textDecoration: 'none', fontWeight: '700' }}>
                              Forgot password?
                            </a>
                          </div>
                          <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                            Enter 10-Digit Mobile Number
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="tel"
                              value={patientPhoneInput}
                              onChange={(e) => setPatientPhoneInput(e.target.value)}
                              placeholder="+91 98765 43210"
                              style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px' }}
                            />
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={sendingOtp}
                              style={{
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: '#059669',
                                color: '#ffffff',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                opacity: sendingOtp ? 0.7 : 1
                              }}
                            >
                              {sendingOtp ? 'Sending...' : (patientOtpSent ? 'Resend' : 'Send Real OTP')}
                            </button>
                          </div>
                        </div>

                        {patientOtpSent && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ backgroundColor: '#ecfdf5', border: '1.5px dashed #059669', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
                                  ✓ Instant OTP Generated
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: '900', color: '#065f46', letterSpacing: '0.1em' }}>
                                  {generatedOtp || '123456'}
                                </span>
                              </div>
                              <p style={{ fontSize: '11px', color: '#047857', margin: 0 }}>
                                Real code generated by AYUSH backend auth service. Auto-filled below:
                              </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label style={{ fontSize: '12px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
                                Enter 6-Digit Verification Code
                              </label>
                            </div>
                            <input 
                              type="text"
                              value={patientOtpInput}
                              onChange={(e) => setPatientOtpInput(e.target.value)}
                              maxLength={6}
                              placeholder="123456"
                              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #059669', fontSize: '20px', fontWeight: '800', textAlign: 'center', letterSpacing: '0.4em', backgroundColor: '#f0fdf4' }}
                            />
                          </div>
                        )}
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        backgroundColor: '#1d3924',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 16px rgba(29, 57, 36, 0.25)',
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {loading ? 'Entering Wellness Hub...' : 'Sign In & Access Dashboard'} <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* Register Form for Patient */
                  <form onSubmit={handlePatientRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Full Name *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Arav Patel"
                        value={patientForm.name}
                        onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Email Address *
                        </label>
                        <input 
                          type="email"
                          required
                          placeholder="arav@example.com"
                          value={patientForm.email}
                          onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Mobile Phone *
                        </label>
                        <input 
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={patientForm.phone}
                          onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Create Password *
                      </label>
                      <input 
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={patientForm.password}
                        onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Age
                        </label>
                        <input 
                          type="number"
                          placeholder="32"
                          value={patientForm.age}
                          onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Gender
                        </label>
                        <select
                          value={patientForm.gender}
                          onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Blood
                        </label>
                        <select
                          value={patientForm.bloodGroup}
                          onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px' }}
                        >
                          <option value="B+">B+</option>
                          <option value="O+">O+</option>
                          <option value="A+">A+</option>
                          <option value="AB+">AB+</option>
                          <option value="B-">B-</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '13px',
                        borderRadius: '10px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: '6px'
                      }}
                    >
                      {loading ? 'Creating Account...' : 'Sign Up & Claim ₹100 Herb Coins'}
                    </button>
                  </form>
                )}
              </div>

              {/* Subtle Switch to Doctor / Farmer / Admin */}
              <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole('doctor');
                    handleQuickDemoFill('doctor');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Doctor, Seller or Admin? <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Switch to Professional Portals →</span>
                </button>
              </div>

              {/* Bottom Trust Seal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '16px', marginTop: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} color="#059669" /> 100% AYUSH Certified
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} color="#059669" /> End-to-End Encrypted
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} color="#059669" /> NPOP Organic
                </span>
              </div>

            </div>
          )}

        {/* =========================================================================
            B. DOCTOR, SELLER, ADMIN EXPERIENCES: STATUTORY ENTERPRISE CONSOLE LOGIN
            NOTE: "Seller" corresponds to the FARMER role (farmer hi seller hai).
        ========================================================================= */}
        {activeRole !== 'patient' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', padding: '36px 32px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: activeRole === 'admin' ? '#163321' : activeRole === 'doctor' ? '#eff6ff' : '#ecfdf5', color: activeRole === 'admin' ? '#E6D7B9' : activeRole === 'doctor' ? '#2563eb' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                {activeRole === 'admin' ? <ShieldCheck size={24} /> : activeRole === 'doctor' ? <Stethoscope size={24} /> : <Sprout size={24} />}
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: 0 }}>
                {activeRole === 'admin' ? 'Super Admin Portal' : activeRole === 'doctor' ? 'BHMS Doctor Verification Console' : 'Seller & Producer Sourcing Registry'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
                {activeRole === 'admin' ? 'Platform management, regulatory approvals & audit trail' : 'Statutory registration & enterprise verification'}
              </p>
            </div>

            {/* Segmented Auth Mode Switcher (Sign In vs Register for Doctor/Seller) */}
            {activeRole !== 'admin' && !successInfo && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: authMode === 'login' ? '#1d3924' : 'transparent',
                      color: authMode === 'login' ? '#ffffff' : '#475569',
                      fontSize: '13px',
                      fontWeight: authMode === 'login' ? '800' : '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: authMode === 'register' ? '#1d3924' : 'transparent',
                      color: authMode === 'register' ? '#ffffff' : '#475569',
                      fontSize: '13px',
                      fontWeight: authMode === 'register' ? '800' : '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Register New {activeRole === 'doctor' ? 'Doctor (BHMS)' : 'Seller (FPO)'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            {/* Success Registration Confirmation */}
            {successInfo && (
              <div style={{ padding: '28px 24px', borderRadius: '16px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#15803d', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#14532d', margin: '0 0 6px 0' }}>
                  {successInfo.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#166534', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                  {successInfo.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessInfo(null);
                      setAuthMode('login');
                      if (activeRole === 'doctor') setIdentifier(doctorForm.email);
                      if (activeRole === 'farmer') setIdentifier(farmerForm.email);
                    }}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)'
                    }}
                  >
                    Proceed to {activeRole.toUpperCase()} Login →
                  </button>
                </div>
              </div>
            )}

            {/* A. Login Form */}
            {!successInfo && authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Email Identifier
                  </label>
                  <input 
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '6px'
                  }}
                >
                  {loading ? 'Authenticating...' : `Enter ${activeRole.toUpperCase()} Console`}
                </button>

                {activeRole !== 'admin' && (
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      style={{ background: 'none', border: 'none', color: '#166534', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      New {activeRole === 'doctor' ? 'Ayurvedic Doctor' : 'Herbal Producer'}? Click here to register your credentials →
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* B. Doctor Full Statutory Registration Form */}
            {!successInfo && authMode === 'register' && activeRole === 'doctor' && (
              <form onSubmit={handleDoctorRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '12.5px', color: '#1e40af' }}>
                  <strong>Mandatory Statutory Submission:</strong> As per Ministry of AYUSH guidelines, all practicing Vaidyas must provide their verified degree certificates and state/central medical council registration numbers.
                </div>

                {/* Section 1: Doctor Personal & Login Account */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
                    1. Clinician Identity & Portal Access
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Full Name (Dr.) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Ananya Sharma"
                        value={doctorForm.name}
                        onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Professional Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="doctor@ayurveda.org"
                        value={doctorForm.email}
                        onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Contact Mobile Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={doctorForm.phone}
                        onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Account Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Create strong password"
                        value={doctorForm.password}
                        onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Medical Education & Degree */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
                    2. Medical Education & Qualification
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Primary Medical Degree *</label>
                      <select
                        value={doctorForm.degree}
                        onChange={(e) => setDoctorForm({ ...doctorForm, degree: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      >
                        <option value="BHMS">BHMS (Homeopathic Medicine)</option>
                        <option value="BAMS">BAMS (Ayurvedic Medicine & Surgery)</option>
                        <option value="MD (Ayurveda)">MD (Ayurveda)</option>
                        <option value="BNYS">BNYS (Naturopathy & Yogic Sciences)</option>
                        <option value="BUMS">BUMS (Unani Medicine)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Medical College / University *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Nehru Homoeopathic Medical College"
                        value={doctorForm.college}
                        onChange={(e) => setDoctorForm({ ...doctorForm, college: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Passing Year</label>
                      <input
                        type="number"
                        min="1970"
                        max="2026"
                        value={doctorForm.passingYear}
                        onChange={(e) => setDoctorForm({ ...doctorForm, passingYear: parseInt(e.target.value) || 2018 })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Regulatory Council & Practice */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
                    3. Statutory Medical Council & Registration
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Medical Council Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Delhi Homoeopathic Council / NCH / CCIM"
                        value={doctorForm.councilName}
                        onChange={(e) => setDoctorForm({ ...doctorForm, councilName: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Statutory Registration Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 8412-DHC-2019"
                        value={doctorForm.registrationNumber}
                        onChange={(e) => setDoctorForm({ ...doctorForm, registrationNumber: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Consultation Fee (₹) *</label>
                      <input
                        type="number"
                        min="99"
                        max="5000"
                        required
                        value={doctorForm.consultationFee}
                        onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: parseInt(e.target.value) || 499 })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        value={doctorForm.experienceYears}
                        onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: parseInt(e.target.value) || 5 })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Physical Clinic Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="Clinic name, suite, street, city and pin code"
                        value={doctorForm.clinicAddress}
                        onChange={(e) => setDoctorForm({ ...doctorForm, clinicAddress: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Mandatory Document Uploads */}
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UploadCloud size={16} color="#2563eb" /> 4. Mandatory Document Uploads (PDF format)
                  </h4>

                  <PdfUploader
                    label="Medical Degree Certificate (PDF)"
                    value={doctorForm.degreeCertUrl}
                    onChange={(url) => setDoctorForm({ ...doctorForm, degreeCertUrl: url })}
                    required
                  />

                  <PdfUploader
                    label="AYUSH Council Registration Certificate (PDF)"
                    value={doctorForm.councilCertUrl}
                    onChange={(url) => setDoctorForm({ ...doctorForm, councilCertUrl: url })}
                    required
                  />

                  <PdfUploader
                    label="Government Identity Proof (Aadhaar / Voter ID)"
                    value={doctorForm.idProofUrl}
                    onChange={(url) => setDoctorForm({ ...doctorForm, idProofUrl: url })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#1d3924',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(29, 57, 36, 0.3)'
                  }}
                >
                  {loading ? 'Submitting Application...' : 'Submit Statutory Doctor Application →'}
                </button>
              </form>
            )}

            {/* C. Seller Statutory Registration Form */}
            {/* NOTE: "Farmer" is the internal DB role for "Seller" (farmer hi seller hai) */}
            {!successInfo && authMode === 'register' && activeRole === 'farmer' && (
              <form onSubmit={handleFarmerRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#ecfdf5', padding: '14px 18px', borderRadius: '12px', border: '1px solid #a7f3d0', fontSize: '12.5px', color: '#065f46' }}>
                  <strong>Seller / FPO Direct Sourcing Enrollment:</strong> Connect directly with the AYUSH Super Admin Treasury. Upload your FSSAI food safety license and organic certification documents for automated direct procurement payouts.
                </div>

                {/* Section 1: Seller Personal & Login Account */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
                    1. Seller Identity & Login Account
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Seller Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={farmerForm.name}
                        onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="seller@ayurveda.org"
                        value={farmerForm.email}
                        onChange={(e) => setFarmerForm({ ...farmerForm, email: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Contact Phone / Mobile *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98260 12345"
                        value={farmerForm.phone}
                        onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Account Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Create password"
                        value={farmerForm.password}
                        onChange={(e) => setFarmerForm({ ...farmerForm, password: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Farm & Production Details */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
                    2. Agricultural Estate & Crop Operations
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>FPO / Cooperative / Farm Estate Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Neemuch Organic Herb Cooperative"
                        value={farmerForm.fpoOrFarmName}
                        onChange={(e) => setFarmerForm({ ...farmerForm, fpoOrFarmName: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>State *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Madhya Pradesh"
                        value={farmerForm.farmState}
                        onChange={(e) => setFarmerForm({ ...farmerForm, farmState: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>District *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Neemuch"
                        value={farmerForm.farmDistrict}
                        onChange={(e) => setFarmerForm({ ...farmerForm, farmDistrict: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Village / Tehsil *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Manasa Tehsil"
                        value={farmerForm.farmVillage}
                        onChange={(e) => setFarmerForm({ ...farmerForm, farmVillage: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Cultivated Land (in Acres) *</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={farmerForm.acreage}
                        onChange={(e) => setFarmerForm({ ...farmerForm, acreage: parseFloat(e.target.value) || 10 })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Statutory License Numbers & Documents */}
                <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '14px', border: '1px solid #86efac' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> 3. Statutory Compliance Numbers & Certificate Uploads
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>FSSAI Food Safety License Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10024999000123"
                        value={farmerForm.fssaiNumber}
                        onChange={(e) => setFarmerForm({ ...farmerForm, fssaiNumber: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #86efac', backgroundColor: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>NPOP Organic Certification Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NPOP/NAB/00192"
                        value={farmerForm.organicCertNumber}
                        onChange={(e) => setFarmerForm({ ...farmerForm, organicCertNumber: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #86efac', backgroundColor: '#ffffff', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <PdfUploader
                    label="FSSAI License Certificate (PDF)"
                    value={farmerForm.fssaiCertUrl}
                    onChange={(url) => setFarmerForm({ ...farmerForm, fssaiCertUrl: url })}
                    required
                  />

                  <PdfUploader
                    label="NPOP / Jaivik Bharat Organic Certificate (PDF)"
                    value={farmerForm.organicCertUrl}
                    onChange={(url) => setFarmerForm({ ...farmerForm, organicCertUrl: url })}
                    required
                  />

                  <PdfUploader
                    label="Government ID Proof (Aadhaar / Voter ID)"
                    value={farmerForm.idProofUrl}
                    onChange={(url) => setFarmerForm({ ...farmerForm, idProofUrl: url })}
                    required
                  />
                </div>

                {/* Section 4: Bank Details for Treasury Disbursal */}
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
                    4. Direct Settlement Bank Account
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Bank Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. State Bank of India"
                        value={farmerForm.bankName}
                        onChange={(e) => setFarmerForm({ ...farmerForm, bankName: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Account Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 382910482910"
                        value={farmerForm.bankAccountNo}
                        onChange={(e) => setFarmerForm({ ...farmerForm, bankAccountNo: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>IFSC Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SBIN0001244"
                        value={farmerForm.bankIfsc}
                        onChange={(e) => setFarmerForm({ ...farmerForm, bankIfsc: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)'
                  }}
                >
                  {loading ? 'Registering Seller Account...' : 'Register Seller & Submit for FSSAI Audit →'}
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
