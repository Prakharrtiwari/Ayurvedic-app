import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chronicProgramsData } from '../data/mockData';
import { publicApi } from '../services/api';
import { 
  Leaf, 
  ChevronRight, 
  CheckCircle2, 
  Star, 
  Users, 
  Calendar, 
  ArrowRight, 
  Stethoscope, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function ProgramsPage({ onAddToCart }) {
  const navigate = useNavigate();
  const [programsList, setProgramsList] = useState(chronicProgramsData);

  useEffect(() => {
    const loadProgramsFromDb = async () => {
      try {
        const res = await publicApi.getPrograms();
        if (res.success && res.programs && res.programs.length > 0) {
          setProgramsList(res.programs);
        }
      } catch (err) {
        console.warn('Using local chronic programs fallback:', err);
      }
    };
    loadProgramsFromDb();
  }, []);

  const handleEnroll = (prog) => {
    onAddToCart({
      id: prog.id,
      name: prog.title,
      price: prog.totalPrice,
      image: prog.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      category: 'Chronic Care Protocol'
    });
    navigate('/cart');
  };

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '100px' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px auto' }}>
          {/* Editorial Eyebrow (Replaces AI rounded pill) */}
          <div className="editorial-eyebrow">
            <span className="eyebrow-accent" />
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-text">Integrative Lifestyle Protocols</span>
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-accent" />
          </div>

          <h1 
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              color: '#15311e',
              fontWeight: '500',
              lineHeight: '1.2',
              marginBottom: '16px'
            }}
          >
            Structured 30 / 60 / 90-Day Disease Protocols
          </h1>

          <p style={{ color: '#4c6c54', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Chronic conditions like Type 2 Diabetes, PCOS, and Osteoarthritis demand structured root-cause reversal. We combine BHMS clinical reviews, monthly farm-traceable raw herb boxes, Indian regional meal plans, and ongoing symptom tracking.
          </p>
        </div>

        {/* Detailed Program Sections (Open Editorial Layout, Zero Bulky Cards) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', marginBottom: '60px' }}>
          {programsList.map((prog, idx) => (
            <div 
              key={prog.id}
              style={{
                paddingBottom: '40px',
                borderBottom: '1px solid rgba(108, 153, 85, 0.2)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
                alignItems: 'center'
              }}
            >
              {/* Left Column: Details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: '#6c9955', color: '#ffffff', fontSize: '11.5px', fontWeight: '700', padding: '3px 12px', borderRadius: '4px' }}>
                    {prog.duration} Care Plan
                  </span>
                  <span style={{ backgroundColor: '#e4f2e7', color: '#385d45', fontSize: '11.5px', fontWeight: '700', padding: '3px 12px', borderRadius: '4px' }}>
                    {prog.tag}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#d99214', fontSize: '12px', fontWeight: 'bold', marginLeft: 'auto' }}>
                    <Star size={13} fill="#d99214" /> {prog.rating}
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#688c71', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Health Concern: {prog.disease}
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: '600', color: '#1e3325', marginTop: '6px', marginBottom: '14px' }}>
                  {prog.title}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#5a7764', marginBottom: '20px' }}>
                  <Users size={15} color="#6c9955" />
                  <span><strong>{prog.patientsEnrolled}</strong> Patients Enrolled & Monitored</span>
                </div>

                <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#385d45', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Complete Protocol Inclusions:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {prog.includes.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px', color: '#385d45', lineHeight: '1.5' }}>
                      <CheckCircle2 size={16} color="#6c9955" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Pricing & Commitment Minimal Card */}
              <div 
                className="minimal-card"
                style={{
                  backgroundColor: 'var(--palette-cream-light, #F8F4EC)',
                  borderRadius: '12px',
                  padding: '28px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--color-text-muted, #5E6D5B)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Protocol Investment
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginTop: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--palette-cypress, #283125)' }}>
                    ₹{prog.totalPrice}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--palette-leaf, #5E7247)', fontWeight: '700' }}>
                    (Save ₹{prog.saveAmount})
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #5E6D5B)', marginBottom: '20px' }}>
                  or monthly installment of ₹{prog.pricePerMonth} / month
                </div>

                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '12.5px',
                    color: 'var(--palette-cypress, #283125)',
                    textAlign: 'left',
                    marginBottom: '24px',
                    border: '1px solid rgba(94, 114, 71, 0.14)'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--palette-leaf, #5E7247)' }}>🌿 What happens after enrollment:</div>
                  <div>1. You are matched with a dedicated BHMS doctor.</div>
                  <div>2. Your 1st monthly customized raw herb box is dispatched.</div>
                  <div>3. Access daily vitals logging & Indian diet charts.</div>
                </div>

                <button
                  onClick={() => handleEnroll(prog)}
                  className="btn-primary-pill"
                  style={{ width: '100%', padding: '13px', fontSize: '14.5px', backgroundColor: 'var(--palette-leaf, #5E7247)' }}
                >
                  Enroll in {prog.duration} Protocol <ArrowRight size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* AI Symptom Assessment Callout */}
        <div 
          className="glass-panel"
          style={{
            padding: '36px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#16311e', marginBottom: '6px' }}>
              Want to verify which protocol fits your constitution?
            </h3>
            <p style={{ color: '#4c6c54', fontSize: '0.95rem' }}>
              Take our clinical 2-minute AI assessment to evaluate dosha imbalances, metabolism, and lifestyle risk factors.
            </p>
          </div>

          <Link to="/ai-assessment" className="btn-secondary-pill" style={{ padding: '12px 28px', fontSize: '14px' }}>
            <Sparkles size={16} color="#5e9434" /> Start AI Health Assessment
          </Link>
        </div>

      </div>
    </div>
  );
}
