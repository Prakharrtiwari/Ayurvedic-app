import React from 'react';
import { 
  Stethoscope, 
  Leaf, 
  Clock, 
  Sparkles, 
  QrCode, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function CorePillarsSection({ 
  onOpenAiAssessment, 
  onOpenTraceability,
  onExploreStore,
  onExploreDoctors 
}) {
  const pillars = [
    {
      id: 'pillar-1',
      icon: <Stethoscope size={28} color="#4e7e2c" />,
      tag: 'Integrative Healing',
      title: 'BHMS Doctor Consultation',
      description: 'Audio, video & chat consultations with certified BHMS clinicians. Pre-filled case history, digital e-prescriptions & regular follow-ups.',
      actionText: 'Find Doctors',
      onClick: onExploreDoctors,
      badge: 'Registered AYUSH'
    },
    {
      id: 'pillar-2',
      icon: <QrCode size={28} color="#4e7e2c" />,
      tag: 'Zero Adulteration',
      title: '100% Farm-Traceable Herbs',
      description: 'Raw roots, whole barks, leaves & sun-dried herbs. Scan the QR code on every pack for farm source, harvest date & lab test purity report.',
      actionText: 'Test QR Traceability',
      onClick: onOpenTraceability,
      badge: 'Lab Certified'
    },
    {
      id: 'pillar-3',
      icon: <Clock size={28} color="#4e7e2c" />,
      tag: 'Root-Cause Care',
      title: '30 / 60 / 90-Day Programs',
      description: 'Targeted protocols for Diabetes, PCOS, Arthritis & Fatty Liver. Includes monthly herbal kits, personalized Indian diet charts & lifestyle tips.',
      actionText: 'View Protocols',
      onClick: onExploreStore,
      badge: 'Proven Results'
    },
    {
      id: 'pillar-4',
      icon: <Sparkles size={28} color="#4e7e2c" />,
      tag: 'Smart Diagnostic',
      title: 'AI Health Assessment',
      description: 'Take a quick 2-minute symptom check. AI analyzes dosha imbalances, lifestyle risk scores, and suggests tailored herbs with clinician review.',
      actionText: 'Start Assessment',
      onClick: onOpenAiAssessment,
      badge: 'Free Screening'
    }
  ];

  return (
    <section 
      style={{
        paddingTop: '40px',
        paddingBottom: '80px',
        position: 'relative'
      }}
    >
      <div className="container-custom">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 50px auto' }}>
          {/* Editorial Eyebrow (Replaces AI rounded pill) */}
          <div className="editorial-eyebrow">
            <span className="eyebrow-accent" />
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-text">The Integrative Ecosystem</span>
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-accent" />
          </div>

          <h2 
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
              color: '#1a3322',
              fontWeight: '500',
              lineHeight: 1.25,
              marginBottom: '14px'
            }}
          >
            More than just an herbal store.<br />
            A complete healing ecosystem.
          </h2>

          <p style={{ color: '#4f6d57', fontSize: '1.05rem' }}>
            We bridge authentic farm-sourced raw herbs with verified clinical BHMS consultations and structured chronic disease protocols.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {pillars.map((item) => (
            <div 
              key={item.id}
              className="glass-panel"
              style={{
                padding: '32px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={item.onClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 45px -10px rgba(45, 80, 55, 0.16)';
                e.currentTarget.style.borderColor = 'rgba(110, 163, 67, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div>
                {/* Top icon and badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                  <div 
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      backgroundColor: '#e6f3de',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 6px rgba(110, 163, 67, 0.15)'
                    }}
                  >
                    {item.icon}
                  </div>
                  <span 
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#4e7e2c',
                      backgroundColor: '#eaf4e5',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(110, 163, 67, 0.2)'
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <span style={{ fontSize: '12px', fontWeight: '600', color: '#688d71', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.tag}
                </span>

                <h3 
                  style={{
                    fontSize: '1.28rem',
                    fontWeight: '600',
                    color: '#1a3322',
                    marginTop: '6px',
                    marginBottom: '12px'
                  }}
                >
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.94rem', color: '#55725d', lineHeight: '1.55', marginBottom: '24px' }}>
                  {item.description}
                </p>
              </div>

              {/* Action Link */}
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  color: '#4c7c2a',
                  transition: 'gap 0.2s ease'
                }}
              >
                <span>{item.actionText}</span>
                <ArrowRight size={15} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
