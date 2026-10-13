import React from 'react';
import { chronicProgramsData } from '../data/mockData';
import { 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Users, 
  Star, 
  ArrowRight,
  ShieldAlert,
  Leaf
} from 'lucide-react';

export default function DiseaseProgramsSection({ onSelectProgram, onOpenAiAssessment }) {
  return (
    <section 
      id="programs"
      style={{
        paddingTop: '60px',
        paddingBottom: '90px',
        position: 'relative'
      }}
    >
      <div className="container-custom">
        {/* Section Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '50px' }}>
          {/* Editorial Eyebrow (Replaces AI rounded pill) */}
          <div className="editorial-eyebrow">
            <span className="eyebrow-accent" />
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-text">Integrative Lifestyle Protocols</span>
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
            30 / 60 / 90-Day Chronic Disease Protocols
          </h2>

          <p style={{ color: '#4f6d57', fontSize: '1.05rem', maxWidth: '680px' }}>
            Chronic conditions can rarely be cured by random supplements alone. Our clinically guided protocols combine BHMS reviews, tailored raw herbs, regional diet charts, and daily vitals tracking.
          </p>
        </div>

        {/* Programs Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px'
          }}
        >
          {chronicProgramsData.map((prog) => (
            <div 
              key={prog.id}
              className="glass-panel"
              style={{
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                position: 'relative',
                border: '1px solid rgba(110, 163, 67, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = 'var(--glass-shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
              }}
            >
              <div>
                {/* Top Duration and Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span 
                    style={{
                      backgroundColor: '#6ea343',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 10px rgba(110, 163, 67, 0.25)'
                    }}
                  >
                    {prog.duration} Program
                  </span>

                  <span 
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#49732d',
                      backgroundColor: '#eaf4e5',
                      padding: '4px 10px',
                      borderRadius: '9999px'
                    }}
                  >
                    {prog.tag}
                  </span>
                </div>

                <div style={{ fontSize: '12px', fontWeight: '700', color: '#668a6f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {prog.disease}
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#16311e', marginTop: '4px', marginBottom: '12px' }}>
                  {prog.title}
                </h3>

                {/* Rating and Enrolled Social Proof */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#567760', marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#d99214', fontWeight: 'bold' }}>
                    <Star size={13} fill="#d99214" /> {prog.rating}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} color="#5e9434" />
                    <span>{prog.patientsEnrolled} Patients Completed</span>
                  </div>
                </div>

                {/* What's Included List */}
                <div style={{ marginBottom: '26px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#314e38', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Protocol Inclusions:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {prog.includes.map((inc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#46644f', lineHeight: '1.45' }}>
                        <CheckCircle2 size={15} color="#5e9434" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Enrollment CTA */}
              <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(110, 163, 67, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#688972' }}>All-inclusive protocol</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#173420' }}>
                        ₹{prog.totalPrice}
                      </span>
                      <span style={{ fontSize: '12px', color: '#567e41', fontWeight: '600' }}>
                        (Save ₹{prog.saveAmount})
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#608169' }}>
                    or ₹{prog.pricePerMonth}/mo
                  </span>
                </div>

                <button
                  onClick={() => onSelectProgram(prog)}
                  className="btn-primary-pill"
                  style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                >
                  Enroll in Program <ArrowRight size={15} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* AI Symptom Checker Banner */}
        <div 
          className="glass-panel"
          style={{
            marginTop: '46px',
            padding: '30px',
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#e6f3de',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={24} color="#5e9434" />
            </div>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#16301d' }}>
                Unsure which protocol fits your constitution?
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#52715b' }}>
                Take our 2-minute clinical AI assessment. Get instant dosha analysis and risk indicators.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAiAssessment}
            className="btn-secondary-pill"
            style={{ padding: '11px 24px', fontSize: '13.5px' }}
          >
            Check My Symptoms Free <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
}
