import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  Check, 
  Heart,
  QrCode
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <footer 
      style={{
        backgroundColor: 'var(--palette-cypress, #283125)',
        borderTop: '1px solid rgba(230, 215, 185, 0.15)',
        paddingTop: '70px',
        paddingBottom: '40px',
        position: 'relative',
        color: '#E6EAE5'
      }}
    >
      <div className="container-custom">
        {/* Main 4 Column Layout */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '50px'
          }}
        >
          {/* Col 1: Brand & Mission */}
          <div>
            <div style={{ display: 'inline-block', marginBottom: '16px' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Logo size="medium" />
              </Link>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#B6C4B8', lineHeight: '1.6', marginBottom: '18px' }}>
              An integrative healthcare platform bridging authentic farm-traceable raw herbs with certified BHMS doctor teleconsultations and personalized chronic care protocols.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--palette-cream, #E6D7B9)' }}>
              <Lock size={14} color="var(--palette-leaf, #5E7247)" />
              <span>256-Bit SSL Encrypted Health Portal</span>
            </div>
          </div>

          {/* Col 2: Dedicated Pages */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--palette-cream, #E6D7B9)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>
              Integrative Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <li><Link to="/shop" style={{ color: '#C5D2C7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E6D7B9'} onMouseLeave={(e) => e.currentTarget.style.color = '#C5D2C7'}>Raw Herbs Apothecary</Link></li>
              <li><Link to="/book-doctor" style={{ color: '#C5D2C7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E6D7B9'} onMouseLeave={(e) => e.currentTarget.style.color = '#C5D2C7'}>BHMS Teleconsultations</Link></li>
              <li><Link to="/programs" style={{ color: '#C5D2C7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E6D7B9'} onMouseLeave={(e) => e.currentTarget.style.color = '#C5D2C7'}>30/60/90-Day Disease Protocols</Link></li>
              <li><Link to="/traceability" style={{ color: '#C5D2C7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E6D7B9'} onMouseLeave={(e) => e.currentTarget.style.color = '#C5D2C7'}>QR Batch Traceability Portal</Link></li>
              <li><Link to="/ai-assessment" style={{ color: '#C5D2C7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E6D7B9'} onMouseLeave={(e) => e.currentTarget.style.color = '#C5D2C7'}>AI Health & Dosha Diagnostic</Link></li>
              <li><Link to="/community" style={{ color: '#C5D2C7', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E6D7B9'} onMouseLeave={(e) => e.currentTarget.style.color = '#C5D2C7'}>Patient Reversal Stories</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform Mobile Apps */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--palette-cream, #E6D7B9)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>
              Ecosystem Applications
            </h4>
            <p style={{ fontSize: '12.5px', color: '#B6C4B8', lineHeight: '1.5', marginBottom: '14px' }}>
              Download our mobile apps for daily symptom logging, medicine reminders, and instant video consults.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                to="/portal"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(230, 215, 185, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'}
              >
                <Smartphone size={18} color="var(--palette-cream, #E6D7B9)" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>Patient Mobile App</div>
                  <div style={{ fontSize: '10.5px', color: '#B6C4B8' }}>Vitals Tracker & Telemedicine</div>
                </div>
              </Link>

              <Link 
                to="/portal"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(230, 215, 185, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'}
              >
                <Smartphone size={18} color="var(--palette-cream, #E6D7B9)" />
                <div>
                  {/* NOTE: Farmer is displayed as Seller across all user-facing UI (farmer hi seller hai) */}
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>Doctor & Seller Portals</div>
                  <div style={{ fontSize: '10.5px', color: '#B6C4B8' }}>Digital RX & Inventory Dispatch</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--palette-cream, #E6D7B9)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>
              Ritucharya Bulletin
            </h4>
            <p style={{ fontSize: '12.5px', color: '#B6C4B8', lineHeight: '1.5', marginBottom: '14px' }}>
              Subscribe for doctor-authored seasonal wellness insights and raw herb decoctions.
            </p>

            <form onSubmit={handleSubscribe}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="email" 
                  required
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(230, 215, 185, 0.3)',
                    fontSize: '13px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--palette-leaf, #5E7247)',
                    color: '#ffffff',
                    padding: '9px 18px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <div style={{ fontSize: '11.5px', color: 'var(--palette-cream, #E6D7B9)', fontWeight: '600' }}>
                  ✓ Welcome! You will receive our monthly Ritucharya guide.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Regulatory Compliance & AYUSH Disclaimer */}
        <div 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '18px 24px',
            border: '1px solid rgba(230, 215, 185, 0.16)',
            marginBottom: '32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={16} color="var(--palette-leaf, #5E7247)" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--palette-cream, #E6D7B9)' }}>
              Medical & Regulatory Compliance Notice (India):
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#B6C4B8', lineHeight: '1.5' }}>
            Consultations on this platform are conducted exclusively by state-registered BHMS (Bachelor of Homeopathic Medicine and Surgery) medical practitioners. Raw herbal products are sourced under FSSAI and AYUSH manufacturing standards with verifiable laboratory testing. Content on this website is for educational purposes and is not a substitute for clinical examinations.
          </p>
        </div>

        {/* Bottom Bar */}
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '12px',
            color: '#8D9B8C'
          }}
        >
          <div>
            © {new Date().getFullYear()} AYURVEDA Health Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/community" style={{ color: '#8D9B8C', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/community" style={{ color: '#8D9B8C', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/community" style={{ color: '#8D9B8C', textDecoration: 'none' }}>Grievance Redressal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
