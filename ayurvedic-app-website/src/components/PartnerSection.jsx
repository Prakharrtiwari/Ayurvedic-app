import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sprout, 
  ShieldCheck, 
  FileSpreadsheet, 
  ArrowRight, 
  CheckCircle2,
  Users
} from 'lucide-react';

export default function PartnerSection() {
  const [partnerType, setPartnerType] = useState('doctor');
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [regOrFarm, setRegOrFarm] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      setRegOrFarm('');
    }, 4000);
  };

  return (
    <section 
      id="community"
      style={{
        paddingTop: '75px',
        paddingBottom: '85px',
        borderTop: '1px solid rgba(108, 153, 85, 0.16)',
        backgroundColor: '#f7faf8'
      }}
    >
      <div className="container-custom">
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '56px',
            alignItems: 'center'
          }}
        >
          {/* Left Info */}
          <div>
            {/* Editorial Eyebrow (Replaces AI rounded pill) */}
            <div className="editorial-eyebrow" style={{ justifyContent: 'flex-start' }}>
              <span className="eyebrow-accent" />
              <span className="eyebrow-glyph">✦</span>
              <span className="eyebrow-text">Ecosystem Partnerships</span>
              <span className="eyebrow-glyph">✦</span>
              <span className="eyebrow-accent" />
            </div>

            <h2 
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)',
                color: '#1e3325',
                fontWeight: '500',
                lineHeight: 1.25,
                marginBottom: '16px'
              }}
            >
              Join India's Most Transparent Ayurvedic Platform
            </h2>

            <p style={{ color: '#4d6e57', fontSize: '1rem', lineHeight: '1.65', marginBottom: '26px' }}>
              Whether you are a certified BHMS practitioner looking to scale teleconsultations, or an organic farmer cultivating authentic wild herbs with zero chemicals — we provide the digital platform, verified lab testing, and direct patient access.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#2d4c38' }}>
                <CheckCircle2 size={16} color="#6c9955" />
                <span><strong>For BHMS Doctors:</strong> Guaranteed consultations, electronic case history, e-prescriptions.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#2d4c38' }}>
                <CheckCircle2 size={16} color="#6c9955" />
                <span><strong>For Herbal Farmers:</strong> Fair pricing, batch QR code labeling, lab test certification support.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#2d4c38' }}>
                <CheckCircle2 size={16} color="#6c9955" />
                <span><strong>Super Admin Supervised:</strong> Strict compliance with AYUSH and FSSAI standards.</span>
              </div>
            </div>
          </div>

          {/* Right Registration Form (Clean, Open Editorial Layout, Card-free, Sharp Borders) */}
          <div 
            style={{
              padding: '10px 0',
              borderLeft: '1px solid rgba(94, 114, 71, 0.18)',
              paddingLeft: '32px'
            }}
          >
            {/* Toggle Switch */}
            <div 
              style={{
                display: 'flex',
                backgroundColor: 'var(--palette-cream-light, #F8F4EC)',
                borderRadius: '9999px',
                padding: '4px',
                marginBottom: '24px',
                border: '1px solid rgba(94, 114, 71, 0.16)'
              }}
            >
              <button
                type="button"
                onClick={() => setPartnerType('doctor')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  backgroundColor: partnerType === 'doctor' ? 'var(--palette-leaf, #5E7247)' : 'transparent',
                  color: partnerType === 'doctor' ? '#ffffff' : 'var(--palette-cypress, #283125)',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <Stethoscope size={14} /> Join as BHMS Doctor
              </button>

              <button
                type="button"
                onClick={() => setPartnerType('farmer')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  backgroundColor: partnerType === 'farmer' ? 'var(--palette-ochre, #948452)' : 'transparent',
                  color: partnerType === 'farmer' ? '#ffffff' : 'var(--palette-cypress, #283125)',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <Sprout size={14} /> Sell as Herbal Farmer
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    {partnerType === 'doctor' ? 'Doctor Full Name' : 'Farmer / Organic Estate Name'}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder={partnerType === 'doctor' ? 'e.g. Dr. Rajesh K., BHMS' : 'e.g. Shivalik Herbal Agro'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '4px',
                      border: '1px solid rgba(94, 114, 71, 0.28)',
                      fontSize: '13.5px',
                      color: 'var(--palette-cypress, #283125)',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '4px',
                      border: '1px solid rgba(94, 114, 71, 0.28)',
                      fontSize: '13.5px',
                      color: 'var(--palette-cypress, #283125)',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    {partnerType === 'doctor' ? 'BHMS Registration Number & State' : 'Primary Herbs Cultivated & Location'}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder={partnerType === 'doctor' ? 'e.g. 34891-UP' : 'e.g. Giloy, Ashwagandha - MP'}
                    value={regOrFarm}
                    onChange={(e) => setRegOrFarm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '4px',
                      border: '1px solid rgba(94, 114, 71, 0.28)',
                      fontSize: '13.5px',
                      color: 'var(--palette-cypress, #283125)',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary-pill"
                  style={{
                    width: '100%',
                    padding: '13px',
                    fontSize: '14px',
                    justifyContent: 'center',
                    backgroundColor: 'var(--palette-leaf, #5E7247)'
                  }}
                >
                  Submit for Super Admin Verification <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle2 size={42} color="var(--palette-leaf, #5E7247)" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '6px' }}>
                  Application Submitted!
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted, #5E6D5B)' }}>
                  Our Super Admin verification team will contact you within 24 hours to verify credentials and issue onboarding credentials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
