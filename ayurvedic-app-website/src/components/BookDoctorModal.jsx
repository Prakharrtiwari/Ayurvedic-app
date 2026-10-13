import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

export default function BookDoctorModal({ isOpen, onClose, selectedDoctor }) {
  if (!isOpen) return null;

  const [consultType, setConsultType] = useState('video');
  const [selectedDate, setSelectedDate] = useState('Today (Within 2 Hours)');
  const [selectedTime, setSelectedTime] = useState('04:30 PM');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [primaryConcern, setPrimaryConcern] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  const doc = selectedDoctor || {
    name: 'Dr. Priya Sharma, BHMS, MD',
    specialization: 'Chronic Metabolic & PCOS Specialist',
    registrationNo: 'BHMS-REG-48910',
    fee: 499
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsBooked(true);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 40, 25, 0.55)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 70px -15px rgba(25, 55, 35, 0.3)',
          padding: '32px',
          borderRadius: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#edf5ee',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2a4430',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {!isBooked ? (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: '#e6f3de',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4e7e2c'
                }}
              >
                <Stethoscope size={24} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#57823e', textTransform: 'uppercase' }}>
                  Digital Clinical Consultation
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#16311e' }}>
                  Book with {doc.name}
                </h3>
              </div>
            </div>

            {/* Doctor Info Pill */}
            <div 
              style={{
                backgroundColor: '#f3faf4',
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid #d4ead9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#25442f' }}>
                  {doc.specialization}
                </div>
                <div style={{ fontSize: '11px', color: '#587a61' }}>
                  {doc.registrationNo} • AYUSH Registered
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a3a22' }}>
                ₹{doc.fee}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Consultation Type Selector */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '8px' }}>
                Select Mode:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setConsultType('video')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: consultType === 'video' ? '2px solid #6ea343' : '1px solid #dcece1',
                    backgroundColor: consultType === 'video' ? '#eef7ec' : '#f9fcf9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Video size={18} color="#4e7e2c" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1c3823' }}>Video Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultType('audio')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: consultType === 'audio' ? '2px solid #6ea343' : '1px solid #dcece1',
                    backgroundColor: consultType === 'audio' ? '#eef7ec' : '#f9fcf9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Phone size={18} color="#4e7e2c" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1c3823' }}>Audio Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultType('chat')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: consultType === 'chat' ? '2px solid #6ea343' : '1px solid #dcece1',
                    backgroundColor: consultType === 'chat' ? '#eef7ec' : '#f9fcf9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare size={18} color="#4e7e2c" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1c3823' }}>Private Chat</span>
                </button>
              </div>

              {/* Slot and Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Available Date
                  </label>
                  <select 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #dcece1',
                      backgroundColor: '#f9fcf9',
                      fontSize: '13px',
                      color: '#1f3825'
                    }}
                  >
                    <option>Today (Within 2 Hours)</option>
                    <option>Tomorrow (Morning Slot)</option>
                    <option>Day After Tomorrow</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Time Slot
                  </label>
                  <select 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #dcece1',
                      backgroundColor: '#f9fcf9',
                      fontSize: '13px',
                      color: '#1f3825'
                    }}
                  >
                    <option>04:30 PM</option>
                    <option>06:00 PM</option>
                    <option>08:15 PM</option>
                  </select>
                </div>
              </div>

              {/* Patient Details */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Patient Full Name
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ashwani Kumar"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #dcece1',
                    fontSize: '13.5px',
                    color: '#1f3825',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Mobile Number (For WhatsApp / SMS Video Link)
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #dcece1',
                    fontSize: '13.5px',
                    color: '#1f3825',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary-pill"
                style={{ width: '100%', padding: '13px', fontSize: '14px' }}
              >
                Confirm Appointment & Pay ₹{doc.fee}
              </button>
            </form>
          </div>
        ) : (
          /* Booking Confirmation State */
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#e6f4dc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto',
                color: '#4e7e2c'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: '600', color: '#16311e', marginBottom: '8px' }}>
              Consultation Confirmed!
            </h3>

            <p style={{ color: '#4f7259', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Your appointment with <strong>{doc.name}</strong> is scheduled for <strong>{selectedDate} at {selectedTime}</strong>.
            </p>

            <div 
              style={{
                backgroundColor: '#f3faf4',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid #d5ecd9',
                textAlign: 'left',
                fontSize: '12.5px',
                color: '#284d33',
                marginBottom: '24px'
              }}
            >
              <div>• A confidential video meeting link has been sent to <strong>{patientPhone || '+91 98765 43210'}</strong>.</div>
              <div style={{ marginTop: '6px' }}>• Please keep your previous blood reports / ultrasound handy for the doctor.</div>
              <div style={{ marginTop: '6px' }}>• Post-call E-prescription will be generated in your patient dashboard.</div>
            </div>

            <button
              onClick={onClose}
              className="btn-primary-pill"
              style={{ padding: '12px 34px', fontSize: '14px' }}
            >
              Done & Return to Site
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
