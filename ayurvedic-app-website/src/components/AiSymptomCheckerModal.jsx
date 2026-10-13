import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  Stethoscope, 
  ShoppingBag, 
  Activity,
  Heart,
  Moon,
  Droplets
} from 'lucide-react';

export default function AiSymptomCheckerModal({ isOpen, onClose, onBookDoctor, onAddToCart }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState('Diabetes & Sugar');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [sleepHours, setSleepHours] = useState('6-7 hours');
  const [waterIntake, setWaterIntake] = useState('2-3 Litres');
  const [stressLevel, setStressLevel] = useState('Moderate');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const conditions = [
    { id: 'diabetes', label: 'Diabetes & High Sugar', icon: '🩸' },
    { id: 'pcos', label: 'PCOS / Hormonal Acne', icon: '🌸' },
    { id: 'arthritis', label: 'Joint Pain & Arthritis', icon: '🦴' },
    { id: 'liver', label: 'Fatty Liver & Digestion', icon: '🍃' },
    { id: 'thyroid', label: 'Thyroid Imbalance', icon: '🦋' },
    { id: 'stress', label: 'Insomnia & Anxiety', icon: '🌙' }
  ];

  const symptomOptions = {
    'Diabetes & Sugar': ['Frequent Urination at Night', 'Unexplained Fatigue after meals', 'Tingling in Feet', 'Constant Sweet Cravings'],
    'PCOS / Hormonal Acne': ['Irregular Menstrual Cycles', 'Jawline Cystic Acne', 'Sudden Weight Gain', 'Mood Swings & Fatigue'],
    'Joint Pain & Arthritis': ['Morning Joint Stiffness >30 mins', 'Swollen Knee or Finger joints', 'Cracking Sounds in Joints', 'Weather-triggered pain'],
    'Fatty Liver & Digestion': ['Bloating after light meals', 'Heaviness in right upper belly', 'Acid Reflux / GERD', 'Sluggish morning bowels'],
    'Thyroid Imbalance': ['Cold intolerance / chilly hands', 'Dry skin & brittle hair', 'Sluggish metabolism', 'Unexplained neck tenderness'],
    'Insomnia & Anxiety': ['Racing mind before sleep', 'Waking up at 3 AM with palpitations', 'Shallow breathing under pressure', 'Muscle tension in shoulders']
  };

  const currentSymptoms = symptomOptions[selectedCondition] || symptomOptions['Diabetes & Sugar'];

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(3);
    }, 1500);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedSymptoms([]);
    setIsAnalyzing(false);
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
          maxWidth: '640px',
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
        {/* Close button */}
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

        {/* Step 1: Condition & Symptoms */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sparkles size={22} color="#5e9434" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#16311e' }}>
                AI Health & Dosha Assessment
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#567560', marginBottom: '22px' }}>
              Step 1 of 2: Select your primary health concern and recent symptoms.
            </p>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#3b5843', textTransform: 'uppercase', marginBottom: '8px' }}>
              Primary Concern:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '22px' }}>
              {conditions.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCondition(c.label);
                    setSelectedSymptoms([]);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: selectedCondition === c.label ? '2px solid #6ea343' : '1px solid #dcece1',
                    backgroundColor: selectedCondition === c.label ? '#eef7ec' : '#f9fcf9',
                    color: '#213a27',
                    fontSize: '13px',
                    fontWeight: selectedCondition === c.label ? '600' : '500',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#3b5843', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Active Symptoms:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              {currentSymptoms.map(sym => {
                const checked = selectedSymptoms.includes(sym);
                return (
                  <div
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: checked ? '1.5px solid #6ea343' : '1px solid #e3efe7',
                      backgroundColor: checked ? '#f0f8ed' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '13.5px', color: '#25422d' }}>{sym}</span>
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: checked ? 'none' : '1.5px solid #a3c4ab',
                        backgroundColor: checked ? '#6ea343' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                      }}
                    >
                      {checked && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary-pill"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              Continue to Lifestyle Check <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Lifestyle Assessment */}
        {step === 2 && !isAnalyzing && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Activity size={22} color="#5e9434" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#16311e' }}>
                Lifestyle & Vitals Calibration
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#567560', marginBottom: '22px' }}>
              Step 2 of 2: Ayurvedic doshas are heavily governed by circadian rhythms and water intake.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Moon size={14} /> Average Sleep Duration:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['< 5 hours', '6-7 hours', '8+ hours'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSleepHours(s)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: sleepHours === s ? '2px solid #6ea343' : '1px solid #dcece1',
                        backgroundColor: sleepHours === s ? '#eef7ec' : '#fcfefc',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Droplets size={14} /> Daily Water Hydration:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['< 1.5 Litres', '2-3 Litres', '3.5+ Litres'].map(w => (
                    <button
                      key={w}
                      onClick={() => setWaterIntake(w)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: waterIntake === w ? '2px solid #6ea343' : '1px solid #dcece1',
                        backgroundColor: waterIntake === w ? '#eef7ec' : '#fcfefc',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Heart size={14} /> Perceived Stress Level:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Low', 'Moderate', 'High / Burnout'].map(st => (
                    <button
                      key={st}
                      onClick={() => setStressLevel(st)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: stressLevel === st ? '2px solid #6ea343' : '1px solid #dcece1',
                        backgroundColor: stressLevel === st ? '#eef7ec' : '#fcfefc',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                className="btn-secondary-pill"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Back
              </button>
              <button
                onClick={handleStartAnalysis}
                className="btn-primary-pill"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <Sparkles size={16} /> Run AI Ayurvedic Evaluation
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isAnalyzing && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '4px solid #e0efe4',
                borderTopColor: '#6ea343',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px auto'
              }}
            />
            <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#183421', marginBottom: '8px' }}>
              Synthesizing Ayurvedic Doshas...
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#577962' }}>
              Correlating reported symptoms with classical BHMS & Charaka Samhita herbal synergies.
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Step 3: AI Diagnosis Report */}
        {step === 3 && !isAnalyzing && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#4a7a28', textTransform: 'uppercase' }}>
                  AI Clinical Diagnostic Summary
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: '#16311e' }}>
                  Target Assessment: {selectedCondition}
                </h3>
              </div>
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4e7556',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={13} /> Retake
              </button>
            </div>

            {/* Dosha & Risk Score Box */}
            <div 
              style={{
                backgroundColor: '#f2f9f3',
                borderRadius: '16px',
                padding: '18px',
                border: '1px solid #cfe5d4',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3825' }}>
                  Dosha Profile: Pitta-Kapha Agni Dysfunction
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#e2733d', color: '#ffffff', padding: '3px 8px', borderRadius: '6px' }}>
                  Moderate Imbalance
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#4a6b53', lineHeight: '1.5' }}>
                Your symptoms point toward poor metabolism (Manda Agni) and toxic bio-waste accumulation (Ama), intensified by irregular sleep ({sleepHours}).
              </p>
            </div>

            {/* Recommended Action 1: Doctor Consultation */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dcece0',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: '#e8f5df', padding: '10px', borderRadius: '12px' }}>
                  <Stethoscope size={20} color="#4e7e2c" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#183421' }}>
                    Recommended BHMS Doctor Consultation
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#577861' }}>
                    Dr. Priya Sharma • Specializes in {selectedCondition}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onBookDoctor();
                }}
                className="btn-primary-pill"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Book (₹499)
              </button>
            </div>

            {/* Recommended Action 2: Personalised 3-Herb Synergy Box */}
            <div 
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dcece0',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: '#e8f5df', padding: '10px', borderRadius: '12px' }}>
                  <ShoppingBag size={20} color="#4e7e2c" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#183421' }}>
                    Suggested Monthly Raw Herbal Trio
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#577861' }}>
                    Pure Giloy Stem + Vedic Amla + Jamun Seed Powder
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart({
                    id: 'custom-kit-ai',
                    name: `${selectedCondition} Custom Herbal Kit`,
                    price: 899,
                    category: 'Kits'
                  });
                  onClose();
                }}
                className="btn-secondary-pill"
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Add Kit (₹899)
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: '#668770' }}>
              *This AI assessment is an educational screening and does not substitute a licensed BHMS medical examination.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
