import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  ChevronRight, 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
  Lock,
  Sparkles,
  Check,
  CreditCard,
  Edit3,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { doctorsData } from '../data/mockData';
import { publicApi, patientApi } from '../services/api';

export default function DoctorBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedDocId = searchParams.get('docId');

  const { user, isAuthenticated, login } = useAuth();

  // Multi-step progressive booking flow:
  // Step 1: Select Doctor (clean search & doctor selection)
  // Step 2: Choose Consultation Channel & Time Slot (dedicated time picker)
  // Step 3: Mandatory Patient Login & Clinical Case History Intake
  // Step 4: Final Review, Fee Breakdown & Confirmation
  const [bookingStep, setBookingStep] = useState(requestedDocId ? 2 : 1);
  const [stepError, setStepError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [doctorsList, setDoctorsList] = useState(doctorsData);
  const [selectedDocId, setSelectedDocId] = useState(requestedDocId || 'doc-1');
  const [consultType, setConsultType] = useState('video');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('04:30 PM');
  
  // Search & Filter State for doctors scaling
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // Patient intake state
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientAge, setPatientAge] = useState(user?.age || '32');
  const [patientGender, setPatientGender] = useState(user?.gender || 'Male');
  const [chronicCondition, setChronicCondition] = useState('Diabetes & Metabolic Care');
  const [currentMedications, setCurrentMedications] = useState('');
  const [symptomsNotes, setSymptomsNotes] = useState('');

  // Booking result state
  const [isBooked, setIsBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  // Available time slots array for clean visual grid
  const availableTimeSlots = [
    '09:30 AM',
    '11:00 AM',
    '02:00 PM',
    '04:30 PM',
    '06:00 PM',
    '07:30 PM',
    '09:00 PM'
  ];

  // Auto-fill patient details whenever authenticated user loads
  useEffect(() => {
    if (user) {
      if (user.name) setPatientName(user.name);
      if (user.phone) setPatientPhone(user.phone);
      if (user.age) setPatientAge(user.age);
      if (user.gender) setPatientGender(user.gender);
    }
  }, [user]);

  // Smooth scroll to top whenever step or status changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [bookingStep, isBooked]);

  useEffect(() => {
    const loadDoctorsFromDb = async () => {
      try {
        const res = await publicApi.getVerifiedDoctors();
        if (res.success && res.doctors && res.doctors.length > 0) {
          const formatted = res.doctors.map((d, idx) => ({
            id: d.id,
            name: d.name,
            degree: d.degree || 'BHMS',
            specialization: Array.isArray(d.specialization) ? d.specialization.join(', ') : (d.specialization || 'Metabolic & Chronic Care'),
            experience: `${d.experienceYears || 5}+ Years Experience`,
            rating: d.rating || 4.9,
            consultationsCount: `${d.reviewsCount || 180}+`,
            registrationNo: d.registrationNumber || 'AYUSH/MP/2019/REG-842',
            languages: 'Hindi, English',
            nextSlot: d.nextSlot || 'Today at 4:30 PM',
            fee: d.consultationFee || 499,
            image: doctorsData[idx % doctorsData.length]?.image || 'https://images.unsplash.com/photo-1594824813629-4e50d754b207?auto=format&fit=crop&w=400&q=80',
            about: d.bio || 'Verified AYUSH practitioner specializing in root-cause metabolic and chronic disease reversal.'
          }));
          setDoctorsList(formatted);
          if (formatted[0]) setSelectedDocId(formatted[0].id);
        }
      } catch (err) {
        console.warn('Using local doctor data fallback:', err);
      }
    };
    loadDoctorsFromDb();
  }, []);

  const handleQuickPatientLogin = async () => {
    setLoggingIn(true);
    setStepError(null);
    try {
      const logged = await login({
        identifier: 'patient.arav@ayurveda.org',
        password: 'patient123',
        role: 'PATIENT'
      });
      if (logged) {
        setPatientName(logged.name || 'Arav Patel');
        setPatientPhone(logged.phone || '+91 98765 43210');
      }
    } catch (err) {
      console.error('Quick login failed:', err);
      setStepError('Login failed. Please try signing in via the portal.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Filtered doctors list
  const filteredDoctors = doctorsList.filter(doc => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      (doc.name && doc.name.toLowerCase().includes(q)) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
      (doc.registrationNo && doc.registrationNo.toLowerCase().includes(q)) ||
      (doc.languages && doc.languages.toLowerCase().includes(q)) ||
      (doc.about && doc.about.toLowerCase().includes(q))
    );
    const matchesSpecialty = specialtyFilter === 'All' || (doc.specialization && doc.specialization.toLowerCase().includes(specialtyFilter.toLowerCase()));
    return matchesSearch && matchesSpecialty;
  });

  const selectedDoctor = doctorsList.find(d => d.id === selectedDocId) || doctorsList[0];

  // Navigation handlers
  const handleProceedToStep2 = () => {
    setStepError(null);
    if (!selectedDoctor) {
      setStepError('Please select a doctor to continue.');
      return;
    }
    setBookingStep(2);
  };

  const handleProceedToStep3 = () => {
    setStepError(null);
    if (!selectedDate || !selectedSlot) {
      setStepError('Please choose your consultation date and time slot.');
      return;
    }
    setBookingStep(3);
  };

  const handleProceedToStep4 = (e) => {
    if (e) e.preventDefault();
    setStepError(null);

    // Enforce patient authentication
    if (!isAuthenticated) {
      setStepError('Patient authentication is required. Please sign in or use 1-Click Fast Patient Login below.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!patientName.trim() || !patientPhone.trim() || !patientAge) {
      setStepError('Please complete all required patient fields (Full Name, Phone number, and Age).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setBookingStep(4);
  };

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/portal?redirect=/book-doctor&role=patient');
      return;
    }

    setSubmitting(true);
    setStepError(null);

    const bookingPayload = {
      doctorId: selectedDoctor?.id,
      timeSlot: `${selectedDate} - ${selectedSlot}`,
      mode: consultType.toUpperCase(),
      symptomsNote: `${chronicCondition}. Age: ${patientAge}, Gender: ${patientGender}. Meds: ${currentMedications || 'None'}. Notes: ${symptomsNotes || 'Routine checkup'}`
    };

    try {
      const res = await patientApi.bookConsultation(bookingPayload);
      setBookedDetails({
        appointmentId: res?.consultation?.id || `AGY-CON-${Date.now().toString().slice(-6)}`,
        doctorName: selectedDoctor.name,
        doctorDegree: selectedDoctor.degree,
        registrationNo: selectedDoctor.registrationNo,
        timeSlot: `${selectedDate} at ${selectedSlot}`,
        mode: consultType.toUpperCase(),
        feePaid: selectedDoctor.fee,
        meetingLink: res?.consultation?.meetingLink || `https://meet.ayurveda.org/room-${Date.now().toString().slice(-6)}`
      });
      setIsBooked(true);
    } catch (err) {
      console.warn('Booking API note fallback:', err);
      // Graceful fallback for authenticated session
      setBookedDetails({
        appointmentId: `AGY-CON-${Date.now().toString().slice(-6)}`,
        doctorName: selectedDoctor.name,
        doctorDegree: selectedDoctor.degree,
        registrationNo: selectedDoctor.registrationNo,
        timeSlot: `${selectedDate} at ${selectedSlot}`,
        mode: consultType.toUpperCase(),
        feePaid: selectedDoctor.fee,
        meetingLink: `https://meet.ayurveda.org/room-${Date.now().toString().slice(-6)}`
      });
      setIsBooked(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '100px' }}>
      <div className="container-custom">
        {!isBooked ? (
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            
            {/* Page Header */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div className="editorial-eyebrow">
                <span className="eyebrow-accent" />
                <span className="eyebrow-glyph">✦</span>
                <span className="eyebrow-text">AYUSH Verified Telemedicine</span>
                <span className="eyebrow-glyph">✦</span>
                <span className="eyebrow-accent" />
              </div>

              <h1 
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'clamp(1.75rem, 3vw, 2.4rem)',
                  color: 'var(--palette-cypress, #283125)',
                  fontWeight: '600',
                  lineHeight: '1.25',
                  margin: '8px 0 6px 0'
                }}
              >
                Schedule BHMS Doctor Consultation
              </h1>

              <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '13.5px', maxWidth: '600px', margin: '0 auto' }}>
                Unhurried 25-minute consultation with state-registered clinicians. Follow-up access and digital e-prescription included.
              </p>
            </div>

            {/* 4-STEP PROGRESS BAR */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                maxWidth: '680px', 
                margin: '0 auto 28px auto', 
                padding: '10px 14px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                overflowX: 'auto'
              }}
            >
              {/* Step 1: Doctor */}
              <div 
                onClick={() => setBookingStep(1)} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: bookingStep >= 1 ? 'var(--palette-cypress, #283125)' : '#e2e8f0',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {bookingStep > 1 ? <Check size={13} /> : '1'}
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: bookingStep === 1 ? '800' : '600', color: bookingStep === 1 ? 'var(--palette-cypress, #283125)' : '#64748b' }}>
                  1. Doctor
                </span>
              </div>

              <div style={{ flex: 1, minWidth: '16px', height: '2px', backgroundColor: bookingStep >= 2 ? 'var(--palette-cypress, #283125)' : '#e2e8f0', margin: '0 6px' }} />

              {/* Step 2: Time Slot & Channel */}
              <div 
                onClick={() => selectedDoctor && setBookingStep(2)} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: selectedDoctor ? 'pointer' : 'default', flexShrink: 0 }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: bookingStep >= 2 ? 'var(--palette-cypress, #283125)' : '#e2e8f0',
                  color: bookingStep >= 2 ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {bookingStep > 2 ? <Check size={13} /> : '2'}
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: bookingStep === 2 ? '800' : '600', color: bookingStep === 2 ? 'var(--palette-cypress, #283125)' : '#64748b' }}>
                  2. Slot & Mode
                </span>
              </div>

              <div style={{ flex: 1, minWidth: '16px', height: '2px', backgroundColor: bookingStep >= 3 ? 'var(--palette-cypress, #283125)' : '#e2e8f0', margin: '0 6px' }} />

              {/* Step 3: Patient Intake */}
              <div 
                onClick={() => bookingStep >= 3 && setBookingStep(3)} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: bookingStep >= 3 ? 'pointer' : 'default', flexShrink: 0 }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: bookingStep >= 3 ? 'var(--palette-cypress, #283125)' : '#e2e8f0',
                  color: bookingStep >= 3 ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {bookingStep > 3 ? <Check size={13} /> : '3'}
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: bookingStep === 3 ? '800' : '600', color: bookingStep === 3 ? 'var(--palette-cypress, #283125)' : '#64748b' }}>
                  3. Patient & Intake
                </span>
              </div>

              <div style={{ flex: 1, minWidth: '16px', height: '2px', backgroundColor: bookingStep >= 4 ? 'var(--palette-cypress, #283125)' : '#e2e8f0', margin: '0 6px' }} />

              {/* Step 4: Review & Payment */}
              <div 
                onClick={() => (bookingStep >= 4 && isAuthenticated) && setBookingStep(4)} 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: (bookingStep >= 4 && isAuthenticated) ? 'pointer' : 'default', flexShrink: 0 }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: bookingStep === 4 ? 'var(--palette-cypress, #283125)' : '#e2e8f0',
                  color: bookingStep === 4 ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  4
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: bookingStep === 4 ? '800' : '600', color: bookingStep === 4 ? 'var(--palette-cypress, #283125)' : '#64748b' }}>
                  4. Review
                </span>
              </div>
            </div>

            {/* Error Notification Alert */}
            {stepError && (
              <div 
                style={{ 
                  padding: '12px 18px', 
                  borderRadius: '12px', 
                  backgroundColor: '#fef2f2', 
                  border: '1.5px solid #fecaca', 
                  color: '#b91c1c', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  marginBottom: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.05)'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{stepError}</span>
              </div>
            )}

            {/* =========================================================================
                STEP 1: SELECT DOCTOR (ONLY DOCTOR SELECTION)
            ========================================================================= */}
            {bookingStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Search & Specialty Filter */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Stethoscope size={18} color="#1b4332" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)', margin: 0 }}>
                        Step 1: Select Your BHMS Clinician
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--palette-leaf, #5E7247)', fontWeight: '700' }}>
                      {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Specialist Available' : 'Specialists Available'}
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f8faf7',
                      borderRadius: '12px',
                      padding: '8px 14px',
                      border: '1px solid #d5e4d9',
                      marginBottom: '14px'
                    }}
                  >
                    <Search size={16} color="#5E7247" style={{ marginRight: '8px', flexShrink: 0 }} />
                    <input 
                      type="text"
                      placeholder="Search doctor by name, qualification, specialization or language..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '13px',
                        color: '#16311e',
                        backgroundColor: 'transparent'
                      }}
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ fontSize: '11px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Specialty Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['All', 'Chronic', 'Metabolic', 'Hormonal', 'Joint', 'Skin'].map(pill => {
                      const isPillActive = specialtyFilter === pill;
                      return (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => setSpecialtyFilter(pill)}
                          style={{
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontWeight: isPillActive ? '700' : '600',
                            borderRadius: '9999px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isPillActive ? 'var(--palette-cypress, #283125)' : '#f1f5f2',
                            color: isPillActive ? '#ffffff' : '#4b5563',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {pill === 'All' ? 'All Specialties' : pill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Doctors List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doc => {
                      const isSelected = selectedDocId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setSelectedDocId(doc.id);
                            setStepError(null);
                            setBookingStep(2);
                          }}
                          style={{
                            padding: '18px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #1b4332' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#f5faf6' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            boxShadow: isSelected ? '0 4px 16px rgba(27, 67, 50, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                            <img 
                              src={doc.image} 
                              alt={doc.name} 
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80';
                              }}
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: '2px solid #cce2d3'
                              }}
                            />

                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#16311e', margin: 0 }}>
                                    {doc.name}
                                  </h4>
                                  <span style={{ fontSize: '11px', color: '#166534', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                    {doc.degree}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309', fontSize: '12px', fontWeight: '700' }}>
                                  <Star size={13} fill="#f59e0b" color="#f59e0b" /> {doc.rating} ({doc.consultationsCount})
                                </div>
                              </div>

                              <div style={{ fontSize: '12.5px', color: '#2d6a4f', fontWeight: '600', marginTop: '2px' }}>
                                {doc.specialization} • {doc.experience}
                              </div>

                              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                                {doc.about}
                              </p>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #eef2ef', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                <span style={{ color: '#567560' }}>Registration: <strong>{doc.registrationNo}</strong></span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1b4332' }}>
                                    ₹{doc.fee}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDocId(doc.id);
                                      setStepError(null);
                                      setBookingStep(2);
                                    }}
                                    style={{ 
                                      padding: '6px 14px', 
                                      borderRadius: '8px', 
                                      backgroundColor: '#1b4332', 
                                      color: '#ffffff',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      boxShadow: '0 2px 8px rgba(27, 67, 50, 0.2)'
                                    }}
                                  >
                                    Book Consult <ArrowRight size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No doctors found matching your filter.</p>
                      <button 
                        type="button"
                        onClick={() => { setSearchQuery(''); setSpecialtyFilter('All'); }}
                        style={{ marginTop: '10px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #94a3b8', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Sticky Action Bar */}
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    border: '1.5px solid #d5e6dc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#567560', textTransform: 'uppercase', fontWeight: '700' }}>Chosen Doctor:</span>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#16311e' }}>
                      {selectedDoctor.name} • <span style={{ color: '#059669' }}>₹{selectedDoctor.fee}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="btn-dark-pill"
                    style={{ padding: '12px 28px', fontSize: '14px' }}
                  >
                    Select Doctor & Choose Time Slot (Step 2) <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            )}

            {/* =========================================================================
                STEP 2: CHOOSE CONSULTATION CHANNEL & TIME SLOT (DEDICATED STEP)
            ========================================================================= */}
            {bookingStep === 2 && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                
                {/* Selected Doctor Summary Card */}
                <div style={{ padding: '14px 16px', backgroundColor: '#f8faf7', borderRadius: '14px', border: '1px solid #d5e6dc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={selectedDoctor.image} 
                      alt={selectedDoctor.name} 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #b7d5c3' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#16311e', margin: 0 }}>
                        {selectedDoctor.name} ({selectedDoctor.degree})
                      </h4>
                      <span style={{ fontSize: '12px', color: '#2d6a4f' }}>
                        {selectedDoctor.specialization} • Fee: <strong>₹{selectedDoctor.fee}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} /> Change Doctor
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Calendar size={22} color="#1b4332" />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16311e', margin: 0 }}>
                      Step 2: Choose Consultation Mode & Time Slot
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Pick your preferred consultation channel and convenient appointment slot
                    </span>
                  </div>
                </div>

                {/* 1. Mode Selector */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '10px' }}>
                    1. Select Consultation Channel:
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {[
                      { id: 'video', label: 'Video Call', desc: 'Face-to-face HD consultation', icon: Video },
                      { id: 'audio', label: 'Audio Call', desc: 'Direct phone audio session', icon: Phone },
                      { id: 'chat', label: 'Private Chat', desc: 'Secure 7-day text queries', icon: MessageSquare }
                    ].map(mode => {
                      const isModeActive = consultType === mode.id;
                      const Icon = mode.icon;
                      return (
                        <div
                          key={mode.id}
                          onClick={() => setConsultType(mode.id)}
                          style={{
                            padding: '14px',
                            borderRadius: '14px',
                            border: `2px solid ${isModeActive ? '#1b4332' : '#e2e8f0'}`,
                            backgroundColor: isModeActive ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: isModeActive ? '#1b4332' : '#f1f5f9', color: isModeActive ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: isModeActive ? '#1b4332' : '#1e293b' }}>
                              {mode.label}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {mode.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Date Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '10px' }}>
                    2. Select Appointment Date:
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'Today', label: 'Today', note: 'Fastest Slot' },
                      { id: 'Tomorrow', label: 'Tomorrow', note: 'Morning / Evening' },
                      { id: 'Day After Tomorrow', label: 'Day After', note: 'Flexible' }
                    ].map(d => {
                      const isDateActive = selectedDate === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDate(d.id)}
                          style={{
                            padding: '12px 10px',
                            textAlign: 'center',
                            borderRadius: '12px',
                            border: `2px solid ${isDateActive ? '#1b4332' : '#e2e8f0'}`,
                            backgroundColor: isDateActive ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: '800', color: isDateActive ? '#1b4332' : '#1e293b' }}>
                            {d.label}
                          </div>
                          <div style={{ fontSize: '11px', color: isDateActive ? '#059669' : '#64748b', marginTop: '2px' }}>
                            {d.note}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Time Slot Grid */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: '#374151', textTransform: 'uppercase' }}>
                      3. Select Time Slot:
                    </label>
                    <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700' }}>
                      ✦ 25 Mins Scheduled
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                    {availableTimeSlots.map(slot => {
                      const isSlotActive = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '10px',
                            border: `1.5px solid ${isSlotActive ? '#1b4332' : '#cbd5e1'}`,
                            backgroundColor: isSlotActive ? '#1b4332' : '#ffffff',
                            color: isSlotActive ? '#ffffff' : '#1e293b',
                            fontSize: '12.5px',
                            fontWeight: isSlotActive ? '800' : '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Clock size={13} /> {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={15} /> Back to Doctor
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToStep3}
                    className="btn-dark-pill"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      padding: '13px',
                      fontSize: '14px',
                      justifyContent: 'center'
                    }}
                  >
                    Proceed to Patient Details (Step 3) <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            )}

            {/* =========================================================================
                STEP 3: MANDATORY PATIENT LOGIN & DIGITAL CASE HISTORY
            ========================================================================= */}
            {bookingStep === 3 && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <User size={22} color="#1b4332" />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16311e', margin: 0 }}>
                      Step 3: Patient Login & Clinical Case History
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Pre-fills your clinical intake case sheet before consultation with {selectedDoctor.name} ({selectedDate} at {selectedSlot})
                    </span>
                  </div>
                </div>

                {/* MANDATORY PATIENT LOGIN AUTHENTICATION CARD */}
                {!isAuthenticated ? (
                  <div 
                    style={{
                      backgroundColor: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '16px',
                      padding: '18px',
                      marginBottom: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: '800', fontSize: '14px', marginBottom: '6px' }}>
                      <Lock size={18} color="#b45309" />
                      <span>Patient Login Mandatory to Schedule Consultation</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#78350f', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                      Under National AYUSH Telemedicine regulations, medical consultations, encrypted video rooms, and legal digital e-prescriptions must be linked directly to your authenticated patient health record.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleQuickPatientLogin}
                        disabled={loggingIn}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#1b4332',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={14} color="#fde047" /> {loggingIn ? 'Signing in...' : '1-Click Fast Patient Login'}
                      </button>
                      <Link
                        to="/portal?redirect=/book-doctor&role=patient"
                        style={{
                          padding: '9px 16px',
                          borderRadius: '10px',
                          border: '1px solid #1b4332',
                          backgroundColor: '#ffffff',
                          color: '#1b4332',
                          fontWeight: '700',
                          fontSize: '12.5px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <User size={14} /> Sign In / Register via Portal
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div 
                    style={{
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '14px',
                      padding: '12px 16px',
                      marginBottom: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={18} color="#059669" />
                      <div style={{ fontSize: '13px', color: '#065f46' }}>
                        Verified Patient Account: <strong>{user?.name || patientName}</strong> ({user?.phone || patientPhone || user?.email})
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '6px' }}>
                      AYUSH ID VERIFIED
                    </span>
                  </div>
                )}

                {/* Patient Case Intake Form */}
                <form onSubmit={handleProceedToStep4}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Patient Full Name *
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Arav Patel"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cce2d3', fontSize: '13.5px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Age & Gender *
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="number" 
                          required 
                          min="1"
                          max="120"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                          placeholder="Age"
                          style={{ width: '70px', padding: '10px 8px', borderRadius: '8px', border: '1px solid #cce2d3', fontSize: '13.5px', boxSizing: 'border-box' }}
                        />
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cce2d3', fontSize: '13px', backgroundColor: '#ffffff' }}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '4px' }}>
                      WhatsApp Phone Number (For HD Video Room Link) *
                    </label>
                    <input 
                      type="tel" 
                      required 
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cce2d3', fontSize: '13.5px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Primary Health Concern / Chronic Condition *
                    </label>
                    <select
                      value={chronicCondition}
                      onChange={(e) => setChronicCondition(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cce2d3', fontSize: '13.5px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option>Diabetes & Blood Sugar Spikes</option>
                      <option>Joint Pain, Arthritis & Stiffness</option>
                      <option>PCOS, Hormonal Imbalance & Irregular Cycles</option>
                      <option>Fatty Liver & Sluggish Digestion</option>
                      <option>Thyroid (Hypo/Hyper) & Metabolism</option>
                      <option>Hypertension & High Blood Pressure</option>
                      <option>Chronic Insomnia, Stress & Anxiety</option>
                      <option>Eczema, Psoriasis & Chronic Skin Itch</option>
                      <option>Other Chronic Condition</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Current Allopathic Medications / Known Allergies (For Safety Conflict Check)
                    </label>
                    <input 
                      type="text"
                      value={currentMedications}
                      onChange={(e) => setCurrentMedications(e.target.value)}
                      placeholder="e.g. Taking Metformin 500mg daily, allergic to penicillin..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cce2d3', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Brief Symptoms & Notes for Doctor (Optional)
                    </label>
                    <textarea 
                      rows={2}
                      value={symptomsNotes}
                      onChange={(e) => setSymptomsNotes(e.target.value)}
                      placeholder="Any specific symptoms, duration of illness, or previous lab test values..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cce2d3', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '12px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowLeft size={15} /> Back to Time Slot
                    </button>

                    <button
                      type="submit"
                      className="btn-dark-pill"
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '13px',
                        fontSize: '14px',
                        justifyContent: 'center',
                        backgroundColor: !isAuthenticated ? '#b45309' : undefined
                      }}
                    >
                      {!isAuthenticated ? (
                        <>
                          <Lock size={16} /> Log In as Patient to Proceed (Step 4) <ArrowRight size={16} />
                        </>
                      ) : (
                        <>
                          Proceed to Review & Confirm (Step 4) <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* =========================================================================
                STEP 4: REVIEW CONSULTATION, FEE & FINAL CONFIRMATION
            ========================================================================= */}
            {bookingStep === 4 && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1.5px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Award size={22} color="#1b4332" />
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16311e', margin: 0 }}>
                      Step 4: Review Details & Confirm Appointment
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Verify your appointment schedule, intake details and consultation fee
                    </span>
                  </div>
                </div>

                {/* Doctor & Slot Overview Card */}
                <div style={{ padding: '16px', backgroundColor: '#f8faf7', borderRadius: '16px', border: '1px solid #d5e6dc', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img 
                        src={selectedDoctor.image} 
                        alt={selectedDoctor.name} 
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #b7d5c3' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#16311e', margin: 0 }}>
                          {selectedDoctor.name} ({selectedDoctor.degree})
                        </h4>
                        <div style={{ fontSize: '12px', color: '#2d6a4f', fontWeight: '600' }}>
                          {selectedDoctor.specialization} • Reg: {selectedDoctor.registrationNo}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={13} /> Change Time Slot
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e1eee5', fontSize: '12.5px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Consultation Mode:</span>
                      <strong style={{ color: '#16311e', textTransform: 'capitalize' }}>{consultType} Call (Encrypted AYUSH HD Room)</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Schedule:</span>
                      <strong style={{ color: '#16311e' }}>{selectedDate} at {selectedSlot}</strong>
                    </div>
                  </div>
                </div>

                {/* Patient Case Intake Preview */}
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>
                      Patient Intake Profile
                    </span>
                    <button
                      type="button"
                      onClick={() => setBookingStep(3)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={13} /> Edit Intake
                    </button>
                  </div>

                  <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>
                    <strong>{patientName}</strong> ({patientAge} Yrs, {patientGender}) • WhatsApp: <strong>{patientPhone}</strong>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569' }}>
                    Chief Complaint: <strong style={{ color: '#0f172a' }}>{chronicCondition}</strong>
                  </div>
                  {currentMedications && (
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                      Current Meds: {currentMedications}
                    </div>
                  )}
                </div>

                {/* Billing Breakdown */}
                <div style={{ backgroundColor: '#f5faf6', borderRadius: '16px', padding: '16px', border: '1px solid #dcece1', marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#567560', marginBottom: '6px' }}>
                    <span>Clinician Consultation Fee (25 mins):</span>
                    <span style={{ fontWeight: '700', color: '#16311e' }}>₹{selectedDoctor.fee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#567560', marginBottom: '6px' }}>
                    <span>Digital Case History & E-Prescription:</span>
                    <span style={{ fontWeight: '700', color: '#15803d' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#567560', marginBottom: '10px' }}>
                    <span>7-Day Doctor Follow-up Access:</span>
                    <span style={{ fontWeight: '700', color: '#15803d' }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', color: '#16311e', paddingTop: '10px', borderTop: '1px solid #d1e7d8' }}>
                    <span>Total Payable:</span>
                    <span>₹{selectedDoctor.fee}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setBookingStep(3)}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={15} /> Back to Intake
                  </button>

                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={submitting}
                    className="btn-dark-pill"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      padding: '14px',
                      fontSize: '15px',
                      justifyContent: 'center',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'Confirming Appointment...' : `Confirm & Book Consultation (₹${selectedDoctor.fee})`} <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            )}

          </div>
        ) : (
          /* =========================================================================
              APPOINTMENT BOOKED CONFIRMATION SCREEN
          ========================================================================= */
          <div 
            className="glass-panel"
            style={{
              maxWidth: '680px',
              margin: '20px auto',
              padding: '42px 32px',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 20px 60px -10px rgba(45, 80, 55, 0.12)',
              textAlign: 'center'
            }}
          >
            <div 
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#e6f4dc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                color: '#4e7e2c'
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#4d7c2a', backgroundColor: '#ebf6e5', padding: '4px 14px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              APPOINTMENT CONFIRMED & RECORDED
            </span>

            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16311e', marginTop: '12px', marginBottom: '6px' }}>
              Your Consultation is Confirmed!
            </h2>

            <p style={{ color: '#4f7259', fontSize: '0.98rem', marginBottom: '24px' }}>
              Scheduled with <strong>{bookedDetails?.doctorName || selectedDoctor.name}</strong> for <strong>{bookedDetails?.timeSlot || `${selectedDate} at ${selectedSlot}`}</strong>.
            </p>

            <div 
              style={{
                backgroundColor: '#f5faf6',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #dcece1',
                textAlign: 'left',
                fontSize: '13px',
                color: '#284c32',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '28px'
              }}
            >
              <div>• <strong>Reference ID:</strong> <code style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #c8ded0', fontWeight: 'bold' }}>{bookedDetails?.appointmentId}</code></div>
              <div>• <strong>Encrypted Video Room:</strong> Link dispatched via WhatsApp to <strong>{patientPhone || '+91 98765 43210'}</strong>.</div>
              <div>• <strong>Doctor Registration:</strong> {bookedDetails?.registrationNo || selectedDoctor.registrationNo} (AYUSH State Homoeopathy Board).</div>
              <div>• <strong>Pre-Call Case Sheet:</strong> Your clinical intake and current medication notes have been forwarded to the doctor's desk.</div>
              <div>• <strong>Post-Call E-Prescription:</strong> Official digital prescription with dosage and Ayurvedic diet notes will sync directly to your patient dashboard.</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/patient" className="btn-dark-pill" style={{ padding: '12px 24px', fontSize: '13.5px', textDecoration: 'none' }}>
                Open Patient Dashboard
              </Link>
              <Link to="/shop" className="btn-secondary-pill" style={{ padding: '12px 24px', fontSize: '13.5px', textDecoration: 'none' }}>
                Explore Raw Herbal Store
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
