import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Stethoscope, 
  QrCode, 
  Star,
  Activity
} from 'lucide-react';
import heroImage from '../assets/hero-products.webp';

export default function HeroSection({ 
  onExploreMore, 
  onBookConsult, 
  onOpenAiChecker,
  onOpenTraceability 
}) {
  return (
    <section 
      id="home"
      style={{
        position: 'relative',
        paddingTop: '36px',
        paddingBottom: '80px',
        overflow: 'hidden'
      }}
    >
      <div className="container-custom">
        <div 
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            alignItems: 'center',
            gap: '48px',
            minHeight: 'calc(80vh - 100px)'
          }}
        >
          
          {/* LEFT: Text Content Matching Screenshot Exactly */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 2 }}>
            
            {/* Main Headline */}
            <h1 
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(2.6rem, 5.2vw, 4.4rem)',
                fontWeight: '400',
                color: '#1a3322',
                lineHeight: '1.14',
                letterSpacing: '-0.02em',
                marginBottom: '26px'
              }}
            >
              {/* Highlight behind "Overall Wellness" as seen in screenshot */}
              <span 
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  zIndex: 1
                }}
              >
                <span 
                  style={{
                    position: 'absolute',
                    top: '2%',
                    left: '-6px',
                    right: '-6px',
                    bottom: '6%',
                    backgroundColor: '#dceee2',
                    borderRadius: '8px',
                    zIndex: -1,
                    transform: 'rotate(-0.5deg)'
                  }}
                />
                Overall Wellness
              </span>
              <br />
              <span style={{ fontWeight: '400' }}>through Ayurveda</span>
              <br />
              <span style={{ fontWeight: '400' }}>is our muse</span>
            </h1>

            {/* Subheading as in screenshot */}
            <p 
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                color: '#496651',
                lineHeight: '1.55',
                maxWidth: '480px',
                marginBottom: '34px',
                fontWeight: '400'
              }}
            >
              Complete switch to chemical-free products to nourish your soul.
            </p>

            {/* Buttons Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              {/* Green Pill Explore More Button (Identical to screenshot) */}
              <button 
                onClick={onExploreMore}
                className="btn-primary-pill"
                style={{
                  backgroundColor: '#73a84e',
                  fontSize: '1.05rem',
                  padding: '14px 38px',
                  borderRadius: '9999px',
                  letterSpacing: '0.01em',
                  cursor: 'pointer'
                }}
              >
                Explore More
              </button>

              {/* Secondary Action: Book BHMS Doctor / AI Check */}
              <button 
                onClick={onBookConsult}
                className="btn-secondary-pill"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(10px)',
                  color: '#2a4a32',
                  fontSize: '0.98rem',
                  padding: '13px 26px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(110, 163, 67, 0.28)',
                  cursor: 'pointer'
                }}
              >
                <Stethoscope size={18} color="#6ea343" />
                <span>Consult BHMS Doctor</span>
              </button>
            </div>

            {/* Glassmorphic Feature Badges for Platform Credibility */}
            <div 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(110, 163, 67, 0.15)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#6ea343" />
                <span style={{ fontSize: '13px', color: '#43604c', fontWeight: '500' }}>
                  AYUSH & FSSAI Compliant
                </span>
              </div>

              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={onOpenTraceability}
                title="Click to see QR verification demo"
              >
                <QrCode size={18} color="#6ea343" />
                <span style={{ fontSize: '13px', color: '#43604c', fontWeight: '500', textDecoration: 'underline dotted' }}>
                  QR Farm-Batch Traceability
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#6ea343" />
                <span style={{ fontSize: '13px', color: '#43604c', fontWeight: '500' }}>
                  30/60/90-Day Disease Care
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: Blob Mask with User's Capture Image */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            
            {/* Ambient Background Aura */}
            <div 
              style={{
                position: 'absolute',
                width: '110%',
                height: '110%',
                background: 'radial-gradient(circle, rgba(162, 219, 175, 0.28) 0%, rgba(237, 247, 242, 0) 70%)',
                filter: 'blur(30px)',
                zIndex: 0
              }}
            />

            {/* The exact organic pebble / blob container */}
            <div className="hero-blob-wrapper" style={{ zIndex: 1 }}>
              <div 
                className="hero-blob-mask"
                style={{
                  borderRadius: '45% 55% 62% 38% / 46% 45% 55% 54%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 25px 60px -15px rgba(45, 80, 55, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.8)'
                }}
              >
                <img 
                  src={heroImage} 
                  alt="Overall Wellness through Ayurveda Natural Products" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                />
              </div>

              {/* Floating Glassmorphic Pill 1: Top Right */}
              <div 
                className="floating-badge"
                style={{
                  position: 'absolute',
                  top: '6%',
                  right: '-12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 28px -6px rgba(45, 80, 55, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 3
                }}
              >
                <span style={{ fontSize: '18px' }}>🌿</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f3b28' }}>100% Raw Herbs</div>
                  <div style={{ fontSize: '10px', color: '#577861' }}>Direct from Partner Farms</div>
                </div>
              </div>

              {/* Floating Glassmorphic Pill 2: Bottom Left */}
              <div 
                className="floating-badge"
                style={{
                  position: 'absolute',
                  bottom: '8%',
                  left: '-16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  padding: '12px 20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 14px 32px -8px rgba(45, 80, 55, 0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  zIndex: 3,
                  animationDelay: '1.5s'
                }}
              >
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#e6f4dc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Stethoscope size={18} color="#5e9434" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f3b28' }}>BHMS Doctors</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#e69a19', fontSize: '11px', fontWeight: 'bold' }}>
                      <Star size={11} fill="#e69a19" /> 4.9
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#577861' }}>Audio / Video & E-Prescription</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center;
          }
          .hero-grid > div:first-child {
            align-items: center !important;
          }
          .hero-grid p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-blob-wrapper {
            max-width: 420px !important;
          }
        }
      `}</style>
    </section>
  );
}
