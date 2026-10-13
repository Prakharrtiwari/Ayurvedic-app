import React, { useState } from 'react';
import { 
  rawHerbsData 
} from '../data/mockData';
import { 
  ShoppingBag, 
  Heart, 
  QrCode, 
  Check, 
  Star, 
  MapPin, 
  FileCheck2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HerbalStoreSection({ 
  onAddToCart, 
  onOpenTraceability,
  onOpenDoctorModal 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedItems, setAddedItems] = useState({});

  const categories = ['All', 'Roots', 'Stems', 'Powders', 'Leaves', 'Bark'];

  const filteredHerbs = selectedCategory === 'All' 
    ? rawHerbsData 
    : rawHerbsData.filter(item => item.category === selectedCategory);

  const handleAdd = (herb) => {
    onAddToCart(herb);
    setAddedItems(prev => ({ ...prev, [herb.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [herb.id]: false }));
    }, 1600);
  };

  return (
    <section 
      id="shop"
      style={{
        paddingTop: '60px',
        paddingBottom: '90px',
        position: 'relative'
      }}
    >
      <div className="container-custom">
        {/* Section Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
          {/* Editorial Eyebrow (Replaces AI rounded pill) */}
          <div className="editorial-eyebrow">
            <span className="eyebrow-accent" />
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-text">Farm Direct & Batch Verified</span>
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-accent" />
          </div>

          <h2 
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
              color: 'var(--palette-cypress, #283125)',
              fontWeight: '500',
              lineHeight: 1.25,
              marginBottom: '14px'
            }}
          >
            Authentic Raw Herbal Apothecary
          </h2>

          <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '1.05rem', maxWidth: '640px' }}>
            Unpolished, pure herbs sourced directly from verified Himalayan and Western Ghat farms. Every batch carries an immutable QR code with laboratory certificates.
          </p>

          {/* Category Filter Pills (Solid Dark Chips without Borders) */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '32px'
            }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`solid-chip ${isSelected ? 'active' : ''}`}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13.5px',
                    fontWeight: isSelected ? '700' : '600'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
          }}
        >
          {filteredHerbs.map((herb) => (
            <div 
              key={herb.id}
              className="glass-panel"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative'
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
              {/* Product Image Area */}
              <div style={{ position: 'relative', height: '210px', overflow: 'hidden', backgroundColor: '#e2ede6' }}>
                <img 
                  src={herb.image} 
                  alt={herb.name} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />

                {/* Badge (Farm Direct, Lab Certified, etc.) */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    color: '#345e22',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(110, 163, 67, 0.25)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {herb.badge}
                </div>

                {/* Doctor Recommended Tag */}
                {herb.doctorRecommended && (
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '14px',
                      backgroundColor: 'rgba(32, 60, 40, 0.82)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      fontSize: '10.5px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={12} color="#a6e680" />
                    <span>BHMS Doctor Prescribed</span>
                  </div>
                )}

                {/* Interactive QR Traceability Button */}
                <button
                  onClick={() => onOpenTraceability(herb)}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px',
                    borderRadius: '50%',
                    color: '#284630',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  title="Scan & View Batch Lab Report"
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <QrCode size={16} color="#457025" />
                </button>
              </div>

              {/* Product Content Details */}
              <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  {/* Category & Botanical */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#688c70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {herb.category} • <em>{herb.botanicalName}</em>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: '600', color: '#dd961b' }}>
                      <Star size={13} fill="#dd961b" />
                      <span>{herb.rating}</span>
                      <span style={{ color: '#799480', fontWeight: 'normal' }}>({herb.reviewsCount})</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a3322', marginBottom: '8px' }}>
                    {herb.name}
                  </h3>

                  <p style={{ fontSize: '0.88rem', color: '#526e59', lineHeight: '1.45', marginBottom: '16px' }}>
                    {herb.subtitle}
                  </p>

                  {/* Farm Source & Batch details (The core feature requested by user) */}
                  <div 
                    style={{
                      backgroundColor: 'rgba(235, 246, 239, 0.8)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      fontSize: '11.5px',
                      color: '#34553c',
                      marginBottom: '18px',
                      border: '1px solid rgba(110, 163, 67, 0.12)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <MapPin size={12} color="#5e9434" />
                      <span style={{ fontWeight: '700' }}>Sold by Seller:</span> {herb.sellerName || herb.farmerName || herb.farmSource || 'Satpura Herbal Cluster'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCheck2 size={12} color="#5e9434" />
                      <span style={{ fontWeight: '600' }}>Batch:</span> {herb.batchNo} ({herb.harvestDate})
                    </div>
                  </div>
                </div>

                {/* Price and Add to Cart action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid rgba(110, 163, 67, 0.12)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1e3825' }}>
                        ₹{herb.price}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#7c9484', textDecoration: 'line-through' }}>
                        ₹{herb.originalPrice}
                      </span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: '#5d8266' }}>250g Vacuum Sealed</span>
                  </div>

                  {/* Add to Cart Pill Button */}
                  <button
                    onClick={() => handleAdd(herb)}
                    style={{
                      backgroundColor: addedItems[herb.id] ? '#3b6127' : '#6ea343',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 6px 16px -2px rgba(110, 163, 67, 0.35)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {addedItems[herb.id] ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Personalized Monthly Herbal Kit Banner */}
        <div 
          className="glass-panel"
          style={{
            marginTop: '50px',
            padding: '36px',
            background: 'linear-gradient(135deg, rgba(240, 252, 244, 0.95) 0%, rgba(226, 245, 232, 0.8) 100%)',
            border: '1px solid rgba(110, 163, 67, 0.3)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          <div style={{ maxWidth: '650px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#4b7a29', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Tailored by Qualified BHMS Clinicians
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '600', color: '#16311e', marginTop: '6px', marginBottom: '8px' }}>
              Need a Personalised Monthly Herbal Kit?
            </h3>
            <p style={{ color: '#44644c', fontSize: '0.98rem', lineHeight: '1.5' }}>
              Stop guessing combinations. Our BHMS doctors evaluate your exact dosha, symptoms, and existing allopathic medicines to prescribe a safe monthly box (e.g. Giloy + Jamun + Methi for Diabetes).
            </p>
          </div>

          <button
            onClick={onOpenDoctorModal}
            className="btn-primary-pill"
            style={{ padding: '14px 30px', fontSize: '0.98rem', whiteSpace: 'nowrap' }}
          >
            Get Doctor-Prescribed Kit <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}
