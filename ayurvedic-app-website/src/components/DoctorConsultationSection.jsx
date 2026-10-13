import React from 'react';
import { doctorsData } from '../data/mockData';
import { 
  Video, 
  Phone, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Star, 
  Clock, 
  CheckCircle,
  Stethoscope
} from 'lucide-react';

export default function DoctorConsultationSection({ onBookDoctor }) {
  return (
    <section 
      id="doctors"
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
            <span className="eyebrow-text">AYUSH Certified Practitioners</span>
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
            Consult Qualified BHMS Doctors Online
          </h2>

          <p style={{ color: '#4f6d57', fontSize: '1.05rem', maxWidth: '660px' }}>
            Get accurate root-cause diagnosis without rushed visits. Our registered homeopathic and Ayurvedic clinicians evaluate your constitution, reports, and daily habits.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
            marginBottom: '40px'
          }}
        >
          <div 
            className="glass-panel" 
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ backgroundColor: '#e6f3de', padding: '10px', borderRadius: '12px' }}>
              <Video size={20} color="#4e7e2c" />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a3322' }}>HD Video & Audio Calls</div>
              <div style={{ fontSize: '12px', color: '#597962' }}>Private, secure & encrypted</div>
            </div>
          </div>

          <div 
            className="glass-panel" 
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ backgroundColor: '#e6f3de', padding: '10px', borderRadius: '12px' }}>
              <FileText size={20} color="#4e7e2c" />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a3322' }}>Digital E-Prescription</div>
              <div style={{ fontSize: '12px', color: '#597962' }}>Herbs dosage + Diet chart</div>
            </div>
          </div>

          <div 
            className="glass-panel" 
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ backgroundColor: '#e6f3de', padding: '10px', borderRadius: '12px' }}>
              <ShieldCheck size={20} color="#4e7e2c" />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a3322' }}>Drug Conflict Safety</div>
              <div style={{ fontSize: '12px', color: '#597962' }}>Checked against allopathy</div>
            </div>
          </div>

          <div 
            className="glass-panel" 
            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ backgroundColor: '#e6f3de', padding: '10px', borderRadius: '12px' }}>
              <MessageSquare size={20} color="#4e7e2c" />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a3322' }}>Post-Visit Chat</div>
              <div style={{ fontSize: '12px', color: '#597962' }}>Direct queries for 14 days</div>
            </div>
          </div>
        </div>

        {/* Doctor Cards */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px'
          }}
        >
          {doctorsData.map((doc) => (
            <div 
              key={doc.id}
              className="glass-panel"
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--glass-shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
              }}
            >
              <div>
                {/* Doctor Avatar & Top Info */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '18px' }}>
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 12px rgba(45, 80, 55, 0.15)'
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#3f6c24', backgroundColor: '#e6f4dc', padding: '2px 8px', borderRadius: '9999px' }}>
                        {doc.experience}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 'bold', color: '#d99214' }}>
                        <Star size={12} fill="#d99214" /> {doc.rating}
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.22rem', fontWeight: '600', color: '#183120', marginTop: '4px' }}>
                      {doc.name}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: '#4d6e56', fontWeight: '500' }}>
                      {doc.specialization}
                    </div>
                  </div>
                </div>

                {/* AYUSH Registration Badge */}
                <div 
                  style={{
                    backgroundColor: 'rgba(235, 246, 239, 0.85)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    color: '#385d43',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={14} color="#5e9434" />
                  <span>{doc.registrationNo}</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#53715d', lineHeight: '1.5', marginBottom: '16px' }}>
                  {doc.about}
                </p>

                {/* Consultation Meta */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#65856e', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="#5e9434" />
                    <span>Next Slot: <strong>{doc.nextSlot}</strong></span>
                  </div>
                  <div>Languages: {doc.languages}</div>
                </div>
              </div>

              {/* Bottom Price and Book Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(110, 163, 67, 0.12)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#62816a' }}>Consultation Fee</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1b3422' }}>
                    ₹{doc.fee} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#73907c' }}>/ 25 mins</span>
                  </div>
                </div>

                <button
                  onClick={() => onBookDoctor(doc)}
                  className="btn-primary-pill"
                  style={{ padding: '10px 22px', fontSize: '13px' }}
                >
                  <Calendar size={14} /> Book Video Call
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
