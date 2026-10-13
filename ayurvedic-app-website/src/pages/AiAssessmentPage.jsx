import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Check,
  RotateCcw,
  Stethoscope,
  ShoppingBag,
  Activity,
  Moon,
  Droplets,
  Heart,
  ShieldCheck,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function AiAssessmentPage({ onAddToCart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState('Diabetes & High Sugar');
  const [openCondition, setOpenCondition] = useState('Diabetes & High Sugar');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [sleepHours, setSleepHours] = useState('6-7 hours');
  const [waterIntake, setWaterIntake] = useState('2-3 Litres');
  const [stressLevel, setStressLevel] = useState('Moderate');
  const [dietType, setDietType] = useState('Vegetarian / Indian Thali');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Auto-scroll to top smoothly whenever traversing between steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const toggleConditionOpen = (label) => {
    setOpenCondition(prev => (prev === label ? null : label));
    setSelectedCondition(label);
  };

  const conditions = [
    { id: 'diabetes', label: 'Diabetes & High Sugar', icon: '🩸', color: '#948452', bg: '#F8F3E6', border: '#D8C7A0' },
    { id: 'pcos', label: 'PCOS / Hormonal Acne', icon: '🌸', color: '#C26343', bg: '#FDF2EE', border: '#ECC0B2' },
    { id: 'arthritis', label: 'Joint Pain & Arthritis', icon: '🦴', color: '#5A6F59', bg: '#EFF5ED', border: '#BFD4BD' },
    { id: 'liver', label: 'Fatty Liver & Digestion', icon: '🍃', color: '#5E7247', bg: '#F2F7EC', border: '#C7D9B4' },
    { id: 'thyroid', label: 'Thyroid Imbalance', icon: '🦋', color: '#3F6578', bg: '#EDF5F9', border: '#B4D2E1' },
    { id: 'stress', label: 'Insomnia & Anxiety', icon: '🌙', color: '#68547C', bg: '#F4EFF8', border: '#CFBFDE' },
    { id: 'hair', label: 'Hair Thinning & Scalp Heat', icon: '🌿', color: '#436B40', bg: '#EDF5EC', border: '#B2D6AF' },
    { id: 'skin', label: 'Eczema & Psoriasis Itch', icon: '✨', color: '#915338', bg: '#FAF0EB', border: '#E2BCAC' }
  ];

  const symptomCatalog = {
    'Diabetes & High Sugar': ['Frequent Urination at Night', 'Unexplained Fatigue after meals', 'Tingling in Feet', 'Constant Sweet Cravings', 'Slow wound healing'],
    'PCOS / Hormonal Acne': ['Irregular Menstrual Cycles', 'Jawline Cystic Acne', 'Sudden Weight Gain', 'Mood Swings & Fatigue', 'Excess facial hair / Hirsutism'],
    'Joint Pain & Arthritis': ['Morning Joint Stiffness >30 mins', 'Swollen Knee or Finger joints', 'Cracking Sounds in Joints', 'Weather-triggered dull ache'],
    'Fatty Liver & Digestion': ['Bloating after light meals', 'Heaviness in right upper belly', 'Acid Reflux / GERD', 'Sluggish morning bowels', 'Coated white tongue'],
    'Thyroid Imbalance': ['Cold intolerance / chilly hands', 'Dry skin & brittle hair', 'Sluggish metabolism', 'Unexplained neck tightness', 'Brain fog'],
    'Insomnia & Anxiety': ['Racing mind before sleep', 'Waking up at 3 AM with palpitations', 'Shallow breathing under pressure', 'Muscle tension in shoulders'],
    'Hair Thinning & Scalp Heat': ['Excessive crown shedding', 'Burning sensation on scalp', 'Premature greying before 35', 'Oily dandruff flakes'],
    'Eczema & Psoriasis Itch': ['Red inflamed skin patches', 'Dry scaling aggravated by winter', 'Intense itching at night', 'Sensitive to chemical soaps']
  };

  const activeConditionObj = conditions.find(c => c.label === selectedCondition) || conditions[0];
  const currentSymptoms = symptomCatalog[selectedCondition] || symptomCatalog['Diabetes & High Sugar'];

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
  };

  const handleAddKit = () => {
    onAddToCart({
      id: 'ai-prescribed-kit',
      name: `${selectedCondition} Custom 3-Herb Synergy Kit`,
      price: 999,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      category: 'Kits'
    });
    navigate('/cart');
  };

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '100px' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto 36px auto' }}>
          {/* Editorial Eyebrow (Replaces AI rounded pill) */}
          <div className="editorial-eyebrow">
            <span className="eyebrow-accent" />
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-text">Integrative Health Intelligence</span>
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-accent" />
          </div>

          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              color: 'var(--palette-cypress, #283125)',
              fontWeight: '500',
              lineHeight: '1.2',
              marginBottom: '14px'
            }}
          >
            AI Dosha & Symptom Diagnostic
          </h1>

          <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '1.05rem', lineHeight: '1.55' }}>
            A 2-minute clinical intake that cross-correlates your physical symptoms with Ayurvedic bio-energies (Vata, Pitta, Kapha) and BHMS treatment pathways.
          </p>

          {/* Multi-Colored Stepper Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: step >= 1 ? '#948452' : 'var(--palette-cream, #E6D7B9)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: step >= 1 ? '0 2px 8px rgba(148, 132, 82, 0.35)' : 'none'
                }}
              >
                1
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: step >= 1 ? 'var(--palette-cypress, #283125)' : 'var(--palette-sage, #8D9B8C)' }}>
                Symptoms
              </span>
            </div>

            <div style={{ width: '44px', height: '2px', backgroundColor: step >= 2 ? '#C26343' : 'rgba(141, 155, 140, 0.3)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: step >= 2 ? '#C26343' : 'var(--palette-cream, #E6D7B9)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: step >= 2 ? '0 2px 8px rgba(194, 99, 67, 0.35)' : 'none'
                }}
              >
                2
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: step >= 2 ? 'var(--palette-cypress, #283125)' : 'var(--palette-sage, #8D9B8C)' }}>
                Lifestyle & Habits
              </span>
            </div>

            <div style={{ width: '44px', height: '2px', backgroundColor: step >= 3 ? '#5E7247' : 'rgba(141, 155, 140, 0.3)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: step >= 3 ? '#5E7247' : 'var(--palette-cream, #E6D7B9)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: step >= 3 ? '0 2px 8px rgba(94, 114, 71, 0.35)' : 'none'
                }}
              >
                3
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: step >= 3 ? 'var(--palette-cypress, #283125)' : 'var(--palette-sage, #8D9B8C)' }}>
                Report & Kit
              </span>
            </div>
          </div>
        </div>

        {/* Open Editorial Diagnostic Flow (Zero Bulky Cards) */}
        <div
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            padding: '10px 0'
          }}
        >
          {/* STEP 1: Interactive Master Cards with Inline Dropdown Symptoms */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', margin: 0 }}>
                  Step 1: Select Health Concerns & Symptoms
                </h2>
                {selectedSymptoms.length > 0 && (
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', backgroundColor: '#EEF7EB', padding: '4px 14px', borderRadius: '9999px' }}>
                    {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} recorded
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted, #5E6D5B)', marginBottom: '24px' }}>
                Click any health concern card below to open its symptoms dropdown and select what you are experiencing.
              </p>

              {/* Master Cards with Inline Dropdown Symptoms */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '28px'
                }}
              >
                {conditions.map(c => {
                  const isOpen = openCondition === c.label;
                  const conditionSymptoms = symptomCatalog[c.label] || [];
                  const selectedCount = conditionSymptoms.filter(sym => selectedSymptoms.includes(sym)).length;
                  const hasSelections = selectedCount > 0;

                  return (
                    <div
                      key={c.id}
                      className="assessment-dropdown-card pure-white-dropdown"
                      style={{
                        borderRadius: '16px',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        boxShadow: isOpen
                          ? '0 10px 28px -4px rgba(40, 49, 37, 0.08), 0 2px 8px rgba(0,0,0,0.02)'
                          : hasSelections
                            ? '0 3px 12px rgba(0, 0, 0, 0.05)'
                            : '0 1px 4px rgba(0,0,0,0.03)',
                        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {/* Master Card Clickable Header (Pure Crisp White) */}
                      <button
                        type="button"
                        onClick={() => toggleConditionOpen(c.label)}
                        className="assessment-dropdown-header pure-white-dropdown"
                        style={{
                          width: '100%',
                          padding: '16px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          backgroundColor: '#ffffff',
                          border: 'none',
                          borderBottom: isOpen ? '1px solid #ECECEC' : 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.22s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '22px',
                              width: '42px',
                              height: '42px',
                              borderRadius: '12px',
                              backgroundColor: '#F8F6F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                            }}
                          >
                            {c.icon}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', lineHeight: '1.3' }}>
                              {c.label}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--palette-sage, #8D9B8C)', marginTop: '2px' }}>
                              {conditionSymptoms.length} clinical indicators • {isOpen ? 'Tap to close' : 'Tap to open dropdown'}
                            </div>
                          </div>
                        </div>

                        {/* Right: Selected Count Badge & Chevron Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          {hasSelections && (
                            <span
                              style={{
                                backgroundColor: '#2E5A23',
                                color: '#ffffff',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(46, 90, 35, 0.22)'
                              }}
                            >
                              <Check size={11} strokeWidth={3.5} />
                              <span>{selectedCount} selected</span>
                            </span>
                          )}

                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: isOpen ? 'var(--palette-cypress, #283125)' : 'rgba(0, 0, 0, 0.06)',
                              color: isOpen ? '#ffffff' : 'var(--palette-cypress, #283125)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.22s ease'
                            }}
                          >
                            {isOpen ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                          </div>
                        </div>
                      </button>

                      {/* Dropdown Symptoms List Container (100% Pure White) */}
                      {isOpen && (
                        <div
                          className="assessment-dropdown-content pure-white-dropdown"
                          style={{
                            padding: '18px 20px 22px 20px',
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              Select your active symptoms for {c.label}:
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5E6D5B)' }}>
                              Choose all that apply
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {conditionSymptoms.map(sym => {
                              const checked = selectedSymptoms.includes(sym);
                              return (
                                <div
                                  key={sym}
                                  onClick={() => toggleSymptom(sym)}
                                  className="symptom-item-row pure-white-dropdown"
                                  style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: checked ? '1.5px solid var(--palette-leaf, #5E7247)' : '1px solid #EDEDED',
                                    backgroundColor: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    boxShadow: checked ? '0 3px 10px rgba(94, 114, 71, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                                    transform: checked ? 'translateY(-1px)' : 'none'
                                  }}
                                >
                                  <span style={{ fontSize: '13.5px', color: 'var(--palette-cypress, #283125)', fontWeight: checked ? '600' : '400' }}>
                                    {sym}
                                  </span>
                                  <div
                                    style={{
                                      width: '22px',
                                      height: '22px',
                                      borderRadius: '50%',
                                      border: checked ? 'none' : '1.5px solid #D5DCD5',
                                      backgroundColor: checked ? 'var(--palette-leaf, #5E7247)' : 'transparent',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#ffffff',
                                      transition: 'all 0.18s ease',
                                      flexShrink: 0
                                    }}
                                  >
                                    {checked && <Check size={12} strokeWidth={3.5} />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Summary & Next Step Action */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  border: '1px solid rgba(94, 114, 71, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                    {selectedSymptoms.length > 0 ? (
                      <span>✓ {selectedSymptoms.length} active symptoms recorded</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted, #5E6D5B)' }}>No symptoms selected yet</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted, #5E6D5B)', marginTop: '2px' }}>
                    {selectedSymptoms.length > 0
                      ? 'You can open other cards above or proceed to step 2'
                      : 'Open any card above and tap to select symptoms'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-primary-pill"
                  style={{
                    padding: '12px 28px',
                    fontSize: '14px',
                    backgroundColor: 'var(--palette-leaf, #5E7247)',
                    boxShadow: '0 4px 14px rgba(94, 114, 71, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  Proceed to Lifestyle & Habits <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && !isAnalyzing && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '8px' }}>
                Step 2: Circadian Rhythm & Digestion (Agni)
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted, #5E6D5B)', marginBottom: '28px' }}>
                Ayurveda views sleep, hydration, mental stress, and meal quality as the foundational regulatory pillars of health.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
                {/* Sleep - Twilight Theme */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#68547C', textTransform: 'uppercase', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: '#F4EFF8', padding: '5px', borderRadius: '50%', display: 'flex' }}>
                      <Moon size={15} color="#68547C" />
                    </span>
                    Night Sleep Duration (Nidra):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {['< 5.5 Hours (Broken)', '6-7 Hours (Restful)', '8+ Hours (Heavy/Lethargic)'].map(s => {
                      const sel = sleepHours === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSleepHours(s)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: sel ? '#EFE6F7' : '#ffffff',
                            fontSize: '13px',
                            fontWeight: sel ? '700' : '500',
                            color: sel ? '#471F5F' : 'var(--palette-cypress, #283125)',
                            cursor: 'pointer',
                            boxShadow: sel ? '0 4px 14px rgba(104, 84, 124, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hydration - Aquatic Slate Theme */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#3F6578', textTransform: 'uppercase', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: '#EDF5F9', padding: '5px', borderRadius: '50%', display: 'flex' }}>
                      <Droplets size={15} color="#3F6578" />
                    </span>
                    Daily Water Intake (Jala):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {['< 1.5 Litres (Dry throat)', '2-3 Litres (Balanced)', '4+ Litres (High)'].map(w => {
                      const sel = waterIntake === w;
                      return (
                        <button
                          key={w}
                          onClick={() => setWaterIntake(w)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: sel ? '#E1F2F8' : '#ffffff',
                            fontSize: '13px',
                            fontWeight: sel ? '700' : '500',
                            color: sel ? '#154457' : 'var(--palette-cypress, #283125)',
                            cursor: 'pointer',
                            boxShadow: sel ? '0 4px 14px rgba(63, 101, 120, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stress - Terracotta Coral Theme */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#C26343', textTransform: 'uppercase', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: '#FDF2EE', padding: '5px', borderRadius: '50%', display: 'flex' }}>
                      <Heart size={15} color="#C26343" />
                    </span>
                    Mental Pressure & Stress (Manas):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {['Low / Relaxed', 'Moderate Daily Tension', 'High / Anxious Burnout'].map(st => {
                      const sel = stressLevel === st;
                      return (
                        <button
                          key={st}
                          onClick={() => setStressLevel(st)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: sel ? '#FCECE5' : '#ffffff',
                            fontSize: '13px',
                            fontWeight: sel ? '700' : '500',
                            color: sel ? '#8A2E14' : 'var(--palette-cypress, #283125)',
                            cursor: 'pointer',
                            boxShadow: sel ? '0 4px 14px rgba(194, 99, 67, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Diet - Fresh Light Green Theme */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#5E7247', textTransform: 'uppercase', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: '#F0F7EE', padding: '5px', borderRadius: '50%', display: 'flex' }}>
                      <Activity size={15} color="#5E7247" />
                    </span>
                    Typical Daily Diet Style (Ahara):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {['Vegetarian / Indian Thali', 'Non-Vegetarian / High Protein', 'Frequent Dining Out / Spicy'].map(d => {
                      const sel = dietType === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setDietType(d)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: sel ? '#E8F4E4' : '#ffffff',
                            fontSize: '13px',
                            fontWeight: sel ? '700' : '500',
                            color: sel ? '#1C3B18' : 'var(--palette-cypress, #283125)',
                            cursor: 'pointer',
                            boxShadow: sel ? '0 4px 14px rgba(94, 114, 71, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={() => {
                    setStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-secondary-pill"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Back to Symptoms
                </button>
                <button
                  onClick={handleStartAnalysis}
                  className="btn-primary-pill"
                  style={{
                    flex: 2,
                    justifyContent: 'center',
                    fontSize: '15px',
                    backgroundColor: 'var(--palette-leaf, #5E7247)',
                    boxShadow: '0 4px 14px rgba(94, 114, 71, 0.35)'
                  }}
                >
                  <Sparkles size={18} /> Generate AI Diagnostic Report
                </button>
              </div>
            </div>
          )}

          {/* SPINNER */}
          {isAnalyzing && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div
                className="spin-loader"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '4px solid #e1efe5',
                  borderTopColor: 'var(--palette-leaf, #5E7247)',
                  margin: '0 auto 24px auto',
                  display: 'block'
                }}
              />
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '8px' }}>
                Synthesizing Clinical Dosha Map...
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted, #5E6D5B)', maxWidth: '560px', margin: '0 auto' }}>
                Cross-referencing {selectedSymptoms.length > 0 ? `${selectedSymptoms.length} recorded symptoms` : 'symptom markers'} across your selected health concerns against Charaka Samhita formulations & BHMS clinical guidelines.
              </p>
            </div>
          )}

          {/* STEP 3: RESULTS DOSSIER */}
          {step === 3 && !isAnalyzing && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: activeConditionObj.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Personalized Integrative Dossier
                  </span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '2px' }}>
                    Diagnostic Assessment for {selectedCondition}
                  </h2>
                </div>

                <button
                  onClick={() => { setStep(1); setSelectedSymptoms([]); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--palette-cream-light, #F8F4EC)',
                    border: '1px solid rgba(141, 155, 140, 0.3)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    color: 'var(--palette-cypress, #283125)',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  <RotateCcw size={13} /> Retake Assessment
                </button>
              </div>

              {/* Tri-Dosha Bio-Energy Spectrum (Multi-Colored Bespoke Editorial Cards - Zero Generic Progress Bars) */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--palette-leaf, #5E7247)' }}>
                      Bio-Energetic Constitution (Prakriti / Vikriti)
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '2px' }}>
                      Tri-Dosha Metabolic Distribution
                    </h3>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #5E6D5B)' }}>
                    Diagnostic Matrix: Charaka Samhita Nidanasthana
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                  {/* Vata Card - Slate Sky Tint */}
                  <div
                    style={{
                      backgroundColor: '#F1F6F9',
                      borderRadius: '18px',
                      padding: '22px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(45, 75, 95, 0.04)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2B5368' }}>
                          Vata • Air & Ether
                        </span>
                        <span style={{ fontSize: '18px' }}>💨</span>
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1B3C4E', fontFamily: "'Outfit', sans-serif", lineHeight: '1' }}>
                        28%
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#3A6378', marginTop: '6px' }}>
                        Sub-Normal (Dry / Erratic Agni)
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#4E6A7A', marginTop: '14px', lineHeight: '1.5', margin: '14px 0 0 0' }}>
                      Light kinetic energy with mild cellular dryness; requires warm grounding nourishment.
                    </p>
                  </div>

                  {/* Pitta Card - Elevated Imbalance (Solar Gold / Warm Terracotta) */}
                  <div
                    style={{
                      backgroundColor: '#FCF2EB',
                      borderRadius: '18px',
                      padding: '22px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: 'none',
                      position: 'relative',
                      boxShadow: '0 8px 24px rgba(194, 99, 67, 0.12)'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '16px',
                        backgroundColor: '#C26343',
                        color: '#ffffff',
                        fontSize: '9.5px',
                        fontWeight: '800',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        boxShadow: '0 2px 8px rgba(194, 99, 67, 0.3)'
                      }}
                    >
                      Dominant Imbalance
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9E3C1D' }}>
                          Pitta • Fire & Water
                        </span>
                        <span style={{ fontSize: '18px' }}>🔥</span>
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#C26343', fontFamily: "'Outfit', sans-serif", lineHeight: '1' }}>
                        56%
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#9E3C1D', marginTop: '6px' }}>
                        Hyper-Elevated (Metabolic Heat)
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#7E3E28', marginTop: '14px', lineHeight: '1.5', margin: '14px 0 0 0' }}>
                      Excess metabolic combustion and acid bile fluids disrupting liver glycogen synthesis.
                    </p>
                  </div>

                  {/* Kapha Card - Fresh Light Botanical Green */}
                  <div
                    style={{
                      backgroundColor: '#EAF5E6',
                      borderRadius: '18px',
                      padding: '22px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(45, 85, 35, 0.04)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#274D1E' }}>
                          Kapha • Earth & Water
                        </span>
                        <span style={{ fontSize: '18px' }}>🌿</span>
                      </div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#23461A', fontFamily: "'Outfit', sans-serif", lineHeight: '1' }}>
                        36%
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E5524', marginTop: '6px' }}>
                        Stable Baseline Reserve
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#44663A', marginTop: '14px', lineHeight: '1.5', margin: '14px 0 0 0' }}>
                      Adequate tissue hydration and density; channels require mild Ama clearance to prevent stagnation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinical Vaidya Synthesis & Bio-Markers (Multi-Colored Solid Badges, No Borders) */}
              <div
                style={{
                  backgroundColor: '#FAF8F4',
                  borderRadius: '20px',
                  padding: '26px 28px',
                  marginBottom: '32px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '1.22rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                    Clinical Synthesis: Pitta-Kapha Agni Mandya
                  </div>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--palette-leaf, #5E7247)' }}>
                    Etiology: Srotas Blockage (Micro-Channel Obstruction)
                  </span>
                </div>

                {/* Multi-Colored Solid Diagnostic Indicators (No dark outline borders!) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: '#E2EFE0', color: '#1B3E16', padding: '7px 15px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🍃</span>
                    <span>Sluggish Cellular Agni (Low Metabolic Fire)</span>
                  </div>
                  <div style={{ backgroundColor: '#FAF0DE', color: '#68480F', padding: '7px 15px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏺</span>
                    <span>Moderate Ama Residue (Channels Clogged)</span>
                  </div>
                  <div style={{ backgroundColor: '#FDE8E1', color: '#7E2C14', padding: '7px 15px', borderRadius: '9px', fontSize: '12.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚡</span>
                    <span>Ojas Depletion (Vital Energy Deficit)</span>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.7', margin: 0 }}>
                  Your selected clinical symptom profile reveals an underlying disparity: elevated systemic Pitta heat coupled with slow digestion (Mandagni). Irregular sleep ({sleepHours}) and daily stress ({stressLevel}) further impede cellular detoxification. Classical Ayurvedic pharmacopoeia prioritizes catalytic digestive stimulation (Deepana-Pachana) before rejuvenating cellular tissues.
                </p>
              </div>

              {/* Handcrafted Apothecary 3-Herb Synergy Cards */}
              <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--palette-leaf, #5E7247)' }}>
                      Targeted Botanical Formulation
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '2px' }}>
                      Prescribed 3-Herb Synergy Formulation
                    </h3>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--palette-leaf, #5E7247)', fontWeight: '600' }}>
                    ✓ 100% Traceable Single-Origin Extracts
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {/* Herb 1: Giloy - Fresh Light Green */}
                  <div
                    style={{
                      backgroundColor: '#EBF5E7',
                      borderRadius: '18px',
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(40, 80, 30, 0.04)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '24px', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          🍃
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#274B1E', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '9999px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                          Ama Pachana
                        </span>
                      </div>
                      <div style={{ fontSize: '1.14rem', fontWeight: '700', color: '#1B3514' }}>
                        Wild Giloy Stem
                      </div>
                      <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#4B6B40', marginTop: '2px' }}>
                        Tinospora cordifolia (Guduchi)
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#335029', marginTop: '10px', lineHeight: '1.5' }}>
                        Potent bitter immunomodulator that neutralizes metabolic toxins (Ama) and rekindles cellular Agni without provoking Pitta.
                      </p>
                    </div>
                    <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(46, 84, 35, 0.12)', fontSize: '11.5px', color: '#274B1E', fontWeight: '600' }}>
                      Origin: Western Ghats Wild Reserve
                    </div>
                  </div>

                  {/* Herb 2: Amla - Solar Honey Gold */}
                  <div
                    style={{
                      backgroundColor: '#FCF5E8',
                      borderRadius: '18px',
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(100, 70, 20, 0.04)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '24px', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          🌸
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#684512', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '9999px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                          Pitta Shamak
                        </span>
                      </div>
                      <div style={{ fontSize: '1.14rem', fontWeight: '700', color: '#4A2F09' }}>
                        Vedic Amla Slices
                      </div>
                      <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#7E5B28', marginTop: '2px' }}>
                        Phyllanthus emblica (Amalaki)
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#543810', marginTop: '10px', lineHeight: '1.5' }}>
                        Natural bio-available vitamin C and cooling tannins that soothe cellular Pitta heat and protect hepatic cellular membranes.
                      </p>
                    </div>
                    <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(104, 69, 18, 0.12)', fontSize: '11.5px', color: '#684512', fontWeight: '600' }}>
                      Origin: Pratapgarh Certified Groves
                    </div>
                  </div>

                  {/* Herb 3: Jamun Seed - Soft Herbal Amethyst Tint */}
                  <div
                    style={{
                      backgroundColor: '#F5EEF8',
                      borderRadius: '18px',
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(70, 30, 80, 0.04)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '24px', width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          🩸
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#4B2659', backgroundColor: '#ffffff', padding: '4px 12px', borderRadius: '9999px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                          Prameha Hara
                        </span>
                      </div>
                      <div style={{ fontSize: '1.14rem', fontWeight: '700', color: '#32153D' }}>
                        Jamun Seed Extract
                      </div>
                      <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#6A4579', marginTop: '2px' }}>
                        Syzygium cumini (Jambu Bija)
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#4A2A57', marginTop: '10px', lineHeight: '1.5' }}>
                        Concentrated jamboline glycosides that slow starch-to-sugar conversion and clear micro-vascular tissue obstructions.
                      </p>
                    </div>
                    <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(75, 38, 89, 0.12)', fontSize: '11.5px', color: '#4B2659', fontWeight: '600' }}>
                      Origin: Shimoga Biodiversity Belt
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 Action Pathways: Open 2-Column Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '36px' }}>
                {/* Pathway 1: Doctor Consult */}
                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1.5px solid rgba(141, 155, 140, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ backgroundColor: 'var(--palette-cream-light, #F8F4EC)', padding: '10px', borderRadius: '50%', border: '1px solid rgba(94, 114, 71, 0.16)' }}>
                        <Stethoscope size={18} color="var(--palette-leaf, #5E7247)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase' }}>
                          Matched BHMS Clinician
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                          Dr. Priya Sharma, BHMS, MD
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.6', marginBottom: '18px' }}>
                      Specialized in {selectedCondition}. Will review your case history, prescribe custom herbs with exact water decoction ratios, and examine lab reports.
                    </p>
                  </div>

                  <Link
                    to="/book-doctor"
                    className="btn-primary-pill"
                    style={{ padding: '11px', fontSize: '13.5px', justifyContent: 'center', backgroundColor: 'var(--palette-leaf, #5E7247)' }}
                  >
                    Book Video Consult (₹499)
                  </Link>
                </div>

                {/* Pathway 2: Curated Herbal Box */}
                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1.5px solid rgba(141, 155, 140, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ backgroundColor: '#F8F3E6', padding: '10px', borderRadius: '50%', border: '1px solid #D8C7A0' }}>
                        <ShoppingBag size={18} color="#948452" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#948452', textTransform: 'uppercase' }}>
                          Curated Synergy Box
                        </div>
                        <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                          Custom 3-Herb Pure Pack
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.5', marginBottom: '18px' }}>
                      Combines authentic wild-harvested raw herbs: <strong>Fresh Giloy Stem + Vedic Amla Powder + Jamun Seed Extract</strong>. 100% farm-traceable with batch QR certificates.
                    </p>
                  </div>

                  <button
                    onClick={handleAddKit}
                    className="btn-secondary-pill"
                    style={{ padding: '11px', fontSize: '13.5px', justifyContent: 'center' }}
                  >
                    Add 3-Herb Pack to Cart (₹999)
                  </button>
                </div>
              </div>

              {/* Ritucharya Lifestyle Chart Callout */}
              <div
                style={{
                  backgroundColor: 'var(--palette-cream-light, #F8F4EC)',
                  border: '1px dashed var(--palette-ochre, #948452)',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <FileCheck size={24} color="var(--palette-ochre, #948452)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: 'var(--palette-cypress, #283125)', lineHeight: '1.55' }}>
                  <strong style={{ color: 'var(--palette-ochre, #948452)' }}>Ritucharya Daily Recommendation:</strong> Drink 200ml warm water with 1 pinch of rock salt upon waking. Avoid heavy dairy or cold drinks after sunset to protect digestion.
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
