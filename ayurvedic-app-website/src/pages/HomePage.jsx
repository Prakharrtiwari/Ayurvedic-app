import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Star, 
  Activity, 
  Stethoscope, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Leaf, 
  Video,
  FileCheck2,
  Clock
} from 'lucide-react';
import heroImage from '../assets/hero-products.webp';
import { rawHerbsData, doctorsData, chronicProgramsData, traceBatchSample } from '../data/mockData';
import PartnerSection from '../components/PartnerSection';
import MarqueeTicker from '../components/MarqueeTicker';

export default function HomePage({ onAddToCart }) {
  // Dynamic Showcase Engine: Automatically sorts herbs by highest popularity, rating & reviews
  const topShowcaseHerbs = React.useMemo(() => {
    return [...rawHerbsData]
      .sort((a, b) => ((b.rating || 0) * (b.reviewsCount || 1)) - ((a.rating || 0) * (a.reviewsCount || 1)))
      .slice(0, 4);
  }, []);

  // Dynamic Showcase Engine: Automatically spotlights highest rated & experienced doctors
  const topShowcaseDoctors = React.useMemo(() => {
    return [...doctorsData]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 2);
  }, []);

  return (
    <div>
      {/* 1. HERO VIEWPORT SECTION (Full viewport height, Marquee sticks to device bottom border on load) */}
      <section className="hero-viewport-section">
        <div className="hero-main-container container-custom">
          <div 
            className="hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.05fr 0.95fr',
              alignItems: 'center',
              gap: '48px',
              width: '100%'
            }}
          >
            {/* LEFT: Headline & Subtitle */}
            <div className="hero-content-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 2 }}>
              
              <h1 
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'clamp(2.6rem, 5.2vw, 4.3rem)',
                  fontWeight: '400',
                  color: 'var(--palette-cypress, #283125)',
                  lineHeight: '1.14',
                  letterSpacing: '-0.02em',
                  marginBottom: '26px'
                }}
              >
                {/* Highlight behind "Overall Wellness" as in user screenshot with palette cream */}
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
                      backgroundColor: 'var(--palette-cream, #E6D7B9)',
                      opacity: 0.85,
                      borderRadius: '4px',
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

              <p 
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(1.05rem, 1.35vw, 1.25rem)',
                  color: 'var(--color-text-muted, #5E6D5B)',
                  lineHeight: '1.55',
                  maxWidth: '480px',
                  marginBottom: '34px',
                  fontWeight: '400'
                }}
              >
                Complete switch to chemical-free products to nourish your soul.
              </p>

              {/* Action Buttons */}
              <div className="hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '38px', width: '100%' }}>
                <Link 
                  to="/shop"
                  className="btn-primary-pill hero-btn-main"
                  style={{
                    backgroundColor: 'var(--palette-leaf, #5E7247)',
                    fontSize: '1.02rem',
                    padding: '13px 32px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Explore More
                </Link>

                <Link 
                  to="/book-doctor"
                  className="btn-secondary-pill hero-btn-sub"
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.96rem',
                    padding: '12px 22px',
                    borderColor: 'var(--palette-sage, #8D9B8C)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Stethoscope size={16} color="var(--palette-leaf, #5E7247)" />
                  <span>Consult BHMS Doctor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div 
                className="hero-trust-badges"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '22px',
                  paddingTop: '18px',
                  borderTop: '1px solid rgba(94, 114, 71, 0.16)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={17} color="var(--palette-leaf, #5E7247)" />
                  <span style={{ fontSize: '13px', color: 'var(--palette-cypress, #283125)', fontWeight: '500' }}>
                    AYUSH & FSSAI Compliant
                  </span>
                </div>

                <Link 
                  to="/traceability"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <QrCode size={17} color="var(--palette-leaf, #5E7247)" />
                  <span style={{ fontSize: '13px', color: 'var(--palette-cypress, #283125)', fontWeight: '600', textDecoration: 'underline dotted' }}>
                    QR Batch Traceability
                  </span>
                </Link>

                <Link 
                  to="/programs"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <Activity size={17} color="var(--palette-leaf, #5E7247)" />
                  <span style={{ fontSize: '13px', color: 'var(--palette-cypress, #283125)', fontWeight: '500' }}>
                    30/60/90-Day Protocols
                  </span>
                </Link>
              </div>

            </div>

            {/* RIGHT: Pebble Blob Mask with User's Capture Image */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div 
                style={{
                  position: 'absolute',
                  width: '110%',
                  height: '110%',
                  background: 'radial-gradient(circle, rgba(162, 222, 174, 0.22) 0%, rgba(245, 250, 247, 0) 70%)',
                  filter: 'blur(30px)',
                  zIndex: 0
                }}
              />

              <div className="hero-blob-wrapper" style={{ zIndex: 1 }}>
                <div 
                  className="hero-blob-mask"
                  style={{
                    borderRadius: '45% 55% 62% 38% / 46% 45% 55% 54%',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <img 
                    src={heroImage} 
                    alt="Overall Wellness through Ayurveda Natural Products" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Floating Badge 1 */}
                <div 
                  className="floating-badge floating-badge-1"
                  style={{
                    position: 'absolute',
                    top: '6%',
                    right: '-10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(16px)',
                    padding: '9px 16px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 24px -4px rgba(45, 85, 60, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 3
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🌿</span>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1d3625' }}>100% Raw Herbs</div>
                    <div style={{ fontSize: '10px', color: '#567560' }}>Direct from Organic Farms</div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div 
                  className="floating-badge floating-badge-2"
                  style={{
                    position: 'absolute',
                    bottom: '8%',
                    left: '-12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(16px)',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 10px 26px -6px rgba(45, 85, 60, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    zIndex: 3,
                    animationDelay: '1.5s'
                  }}
                >
                  <div 
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      backgroundColor: '#eaf4ee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Stethoscope size={18} color="#5e9434" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1d3625' }}>BHMS Doctors</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#d99214', fontSize: '11px', fontWeight: 'bold' }}>
                        <Star size={10} fill="#d99214" /> 4.9
                      </div>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#567560' }}>Video & Digital Prescriptions</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* CONTINUOUS ANIMATED BOTANICAL MARQUEE TICKER (Anchors to device bottom border on load, scrolls up with page) */}
        <MarqueeTicker />
      </section>

      {/* 2. CARD-FREE EDITORIAL PILLARS (Clean Open Layout with User Circle Colors & Image Zoom) */}
      <section style={{ padding: '60px 0 80px 0', backgroundColor: 'var(--palette-cream-light, #F8F4EC)', borderBottom: '1px solid rgba(94, 114, 71, 0.14)' }}>
        <div className="container-custom">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px'
            }}
          >
            {/* Pillar 01 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-img-wrapper" style={{ height: '185px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px', backgroundColor: '#eaf4ee' }}>
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80" 
                  alt="Clinical BHMS Care" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span 
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--palette-leaf, #5E7247)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  01
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Certified Clinical Care
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '8px' }}>
                BHMS Doctor Teleconsultations
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.6' }}>
                Digital case history intake, unhurried 25-minute video consultations, customized water decoction dosages, and allopathic drug-interaction safety reviews.
              </p>
            </div>

            {/* Pillar 02 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-img-wrapper" style={{ height: '185px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px', backgroundColor: '#eaf4ee' }}>
                <img 
                  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80" 
                  alt="Farm Traceable Raw Herbs" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span 
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--palette-ochre, #948452)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  02
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--palette-ochre, #948452)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Native Soil Transparency
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '8px' }}>
                100% Farm-Traceable Raw Herbs
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.6' }}>
                Unpolished roots, whole stems, and low-temp powders. Every delivered pack carries a verifiable QR code linking to SGS lab test reports and farm origin.
              </p>
            </div>

            {/* Pillar 03 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-img-wrapper" style={{ height: '185px', borderRadius: '12px', overflow: 'hidden', marginBottom: '18px', backgroundColor: '#eaf4ee' }}>
                <img 
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" 
                  alt="Root Cause Protocols" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span 
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--palette-sage, #8D9B8C)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  03
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--palette-sage, #8D9B8C)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Root-Cause Protocols
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '8px' }}>
                30 / 60 / 90-Day Disease Programs
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.6' }}>
                Targeted chronic protocols for Type 2 Diabetes, PCOS, and Osteoarthritis combining monthly customized kits, Indian diet charts, and weekly follow-ups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: RAW HERBAL APOTHECARY (Module 4) - CLEAN PRODUCT CARDS WITH BOTTOM VIEW ALL BUTTON */}
      <section style={{ padding: '75px 0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px auto' }}>
            {/* Editorial Eyebrow (Replaces AI rounded pill) */}
            <div className="editorial-eyebrow">
              <span className="eyebrow-accent" />
              <span className="eyebrow-glyph">✦</span>
              <span className="eyebrow-text">Raw Botanical Sourcing</span>
              <span className="eyebrow-glyph">✦</span>
              <span className="eyebrow-accent" />
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '600', color: '#1e3325', marginTop: '6px' }}>
              Raw Herbal Product Catalog
            </h2>
            <p style={{ color: '#5a7764', fontSize: '0.96rem', marginTop: '8px' }}>
              Unadulterated medicinal botanicals straight from verified high-altitude organic cooperatives.
            </p>
          </div>

          {/* Clean Minimal Product Cards (ONLY in programs, doctors, and items) */}
          <div 
            className="products-grid-responsive"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px'
            }}
          >
            {topShowcaseHerbs.map((herb) => (
              <div 
                key={herb.id}
                className="minimal-card interactive-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Photo on Top with Smooth Zoom */}
                  <Link to={`/product/${herb.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div 
                      className="card-img-wrapper product-img-box"
                      style={{ 
                        height: '190px', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        position: 'relative', 
                        marginBottom: '12px', 
                        backgroundColor: '#f0f6f2' 
                      }}
                    >
                      <img 
                        src={herb.image} 
                        alt={herb.name} 
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--palette-cream, #E6D7B9)', color: 'var(--palette-cypress, #283125)', fontSize: '10.5px', fontWeight: '700', padding: '3px 9px', borderRadius: '4px' }}>
                        {herb.badge}
                      </span>
                    </div>
                  </Link>

                  <div style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--palette-ochre, #948452)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {herb.category}
                  </div>

                  <Link to={`/product/${herb.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.14rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '4px', marginBottom: '4px', lineHeight: '1.3' }}>
                      {herb.name}
                    </h3>
                  </Link>

                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5E6D5B)', marginBottom: '8px' }}>
                    <MapPin size={11} color="var(--palette-leaf, #5E7247)" style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{herb.farmSource}</span>
                  </div>
                </div>

                <div className="product-bottom-bar" style={{ paddingTop: '10px', borderTop: '1px solid rgba(94, 114, 71, 0.12)', marginTop: '6px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '6px' }}>
                    <span className="product-price" style={{ fontSize: '1.18rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>₹{herb.price}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--palette-sage, #8D9B8C)', textDecoration: 'line-through' }}>₹{herb.originalPrice}</span>
                  </div>

                  <button 
                    onClick={() => onAddToCart(herb)}
                    className="product-add-btn btn-primary-pill"
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      fontSize: '12.5px',
                      justifyContent: 'center',
                      backgroundColor: 'var(--palette-leaf, #5E7247)'
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button at the Bottom */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '42px' }}>
            <Link 
              to="/shop" 
              className="btn-secondary-pill"
              style={{ padding: '13px 36px', fontSize: '14.5px', fontWeight: '600', borderColor: 'var(--palette-sage, #8D9B8C)', color: 'var(--palette-cypress, #283125)' }}
            >
              <span>View All Herbs in Apothecary</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SECTION: BHMS CLINICAL TELECONSULTATIONS (Module 2) - CARDS & CLINICAL PHOTOGRAPHY */}
      <section style={{ padding: '75px 0', backgroundColor: '#f3f8f4' }}>
        <div className="container-custom">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '52px',
              alignItems: 'center',
              marginBottom: '32px'
            }}
          >
            {/* Left: Editorial Narrative & Clinical Photography */}
            <div>
              {/* Editorial Eyebrow (Replaces AI rounded pill) */}
              <div className="editorial-eyebrow" style={{ justifyContent: 'flex-start' }}>
                <span className="eyebrow-accent" />
                <span className="eyebrow-glyph">✦</span>
                <span className="eyebrow-text">Clinical Telemedicine</span>
                <span className="eyebrow-glyph">✦</span>
                <span className="eyebrow-accent" />
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '600', color: '#1e3325', lineHeight: '1.25', marginBottom: '16px' }}>
                Qualified BHMS Consultations with Root-Cause Diagnostics
              </h2>
              <p style={{ color: '#4d6e57', fontSize: '1rem', lineHeight: '1.65', marginBottom: '22px' }}>
                Unlike generic wellness apps that sell standard supplements, our registered BHMS medical practitioners examine your case history, ultrasound, and blood tests to prescribe customized herbal remedies with precise decoction timing.
              </p>

              {/* Clinical consultation photograph banner */}
              <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 8px 24px -6px rgba(45, 80, 55, 0.1)' }}>
                <img 
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=700&q=80" 
                  alt="Doctor Teleconsultation" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#2d4c38' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#6c9955" />
                  <span><strong>Encrypted Video Calls:</strong> 25-minute comprehensive constitutional interview.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#6c9955" />
                  <span><strong>E-Prescriptions:</strong> Exact raw herb ratios + regional Indian diet chart.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#6c9955" />
                  <span><strong>Drug-Interaction Checks:</strong> Verified against existing allopathic medicines.</span>
                </div>
              </div>
            </div>

            {/* Right: Minimal Doctor Cards (Only in doctors, programs, items) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {topShowcaseDoctors.map((doc) => (
                <div 
                  key={doc.id}
                  className="minimal-card interactive-card"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div className="card-img-wrapper" style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={doc.image} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', backgroundColor: 'var(--palette-cream, #E6D7B9)', padding: '2px 8px', borderRadius: '4px' }}>
                          {doc.experience}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--palette-ochre, #948452)', fontSize: '11.5px', fontWeight: 'bold' }}>
                          <Star size={11} fill="var(--palette-ochre, #948452)" /> {doc.rating}
                        </div>
                      </div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)' }}>
                        {doc.name}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5E6D5B)' }}>{doc.specialization}</div>
                      <div style={{ fontSize: '11px', color: 'var(--palette-sage, #8D9B8C)', marginTop: '2px' }}>{doc.registrationNo}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f0f6f2' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                      ₹{doc.fee} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--palette-sage, #8D9B8C)' }}>/ consult</span>
                    </span>
                    <Link 
                      to={`/book-doctor?docId=${doc.id}`}
                      className="btn-primary-pill"
                      style={{ padding: '8px 20px', fontSize: '12.5px', textDecoration: 'none', backgroundColor: 'var(--palette-leaf, #5E7247)' }}
                    >
                      <Video size={13} /> Book Consultation
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View All Doctors Button at the Bottom */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <Link 
              to="/book-doctor" 
              className="btn-secondary-pill"
              style={{ padding: '13px 36px', fontSize: '14.5px', fontWeight: '600', borderColor: 'var(--palette-sage, #8D9B8C)', color: 'var(--palette-cypress, #283125)' }}
            >
              <Stethoscope size={16} color="var(--palette-leaf, #5E7247)" />
              <span>View All BHMS Doctors & Available Slots</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SECTION: CHRONIC DISEASE PROGRAMS (Module 3) - MINIMAL PROGRAM CARDS */}
      <section style={{ padding: '75px 0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 44px auto' }}>
            {/* Editorial Eyebrow (Replaces AI rounded pill) */}
            <div className="editorial-eyebrow">
              <span className="eyebrow-accent" />
              <span className="eyebrow-glyph">✦</span>
              <span className="eyebrow-text">Structured Reversal Protocols</span>
              <span className="eyebrow-glyph">✦</span>
              <span className="eyebrow-accent" />
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '6px' }}>
              30 / 60 / 90-Day Disease Programs
            </h2>
            <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '0.96rem', marginTop: '8px' }}>
              Structured clinical timelines combining monthly customized raw herb boxes, doctor reviews, and regional diets.
            </p>
          </div>

          {/* Minimal Program Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {chronicProgramsData.slice(0, 3).map((prog, idx) => {
              const programImages = [
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
                'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=300&q=80',
                'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
              ];
              return (
                <div 
                  key={prog.id}
                  className="program-card-grid minimal-card interactive-card"
                  style={{
                    padding: '22px 26px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1.2fr 1fr auto',
                    gap: '24px',
                    alignItems: 'center'
                  }}
                >
                  <div className="program-img-box card-img-wrapper" style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f0f6f2' }}>
                    <img src={programImages[idx % 3]} alt={prog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ backgroundColor: 'var(--palette-leaf, #5E7247)', color: '#ffffff', fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                        {prog.duration}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', backgroundColor: 'var(--palette-cream-light, #F8F4EC)', padding: '2px 8px', borderRadius: '4px' }}>
                        {prog.tag}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.22rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)' }}>
                      {prog.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5E6D5B)', marginTop: '2px' }}>
                      Target: {prog.disease}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Clinical Inclusions:
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.5' }}>
                      • Dedicated BHMS Video Reviews<br />
                      • Monthly Custom Raw Herb Box<br />
                      • Indian Regional Meal & Vitals Planner
                    </div>
                  </div>

                  <div className="program-bottom-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '18px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--palette-cypress, #283125)' }}>₹{prog.totalPrice}</div>
                      <div style={{ fontSize: '11px', color: 'var(--palette-leaf, #5E7247)', fontWeight: '700' }}>Save ₹{prog.saveAmount}</div>
                    </div>

                    <Link 
                      to="/programs"
                      className="btn-secondary-pill"
                      style={{ padding: '9px 20px', fontSize: '12.5px', textDecoration: 'none', borderColor: 'var(--palette-sage, #8D9B8C)', color: 'var(--palette-cypress, #283125)' }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Programs Button at the Bottom */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <Link 
              to="/programs" 
              className="btn-secondary-pill"
              style={{ padding: '13px 36px', fontSize: '14.5px', fontWeight: '600', borderColor: 'var(--palette-sage, #8D9B8C)', color: 'var(--palette-cypress, #283125)' }}
            >
              <Activity size={16} color="var(--palette-leaf, #5E7247)" />
              <span>View All Chronic Disease Protocols</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SECTION: AI HEALTH DIAGNOSTIC & BATCH TRACEABILITY (CARD-FREE OPEN EDITORIAL LAYOUT) */}
      <section style={{ padding: '75px 0', backgroundColor: 'var(--palette-cream-light, #F8F4EC)', borderTop: '1px solid rgba(94, 114, 71, 0.14)', borderBottom: '1px solid rgba(94, 114, 71, 0.14)' }}>
        <div className="container-custom">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'start'
            }}
          >
            {/* Left Feature: AI Assessment (Card-free open layout) */}
            <div>
              <div className="card-img-wrapper" style={{ height: '210px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" 
                  alt="AI Health Diagnostic" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'var(--palette-cream, #E6D7B9)', padding: '3px 9px', borderRadius: '4px' }}>
                Diagnostic Engine
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '8px', marginBottom: '10px' }}>
                AI Health & Dosha Diagnostic Intake
              </h3>
              <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '0.96rem', lineHeight: '1.65', marginBottom: '24px' }}>
                A 2-minute clinical assessment that evaluates your symptoms, sleep patterns, and Agni metabolism to generate a personalized 3-herb synergy prescription with BHMS doctor review.
              </p>
              <Link 
                to="/ai-assessment"
                className="btn-primary-pill"
                style={{ padding: '12px 28px', fontSize: '13.5px', textDecoration: 'none', backgroundColor: 'var(--palette-leaf, #5E7247)' }}
              >
                <Sparkles size={15} /> Take Free AI Assessment
              </Link>
            </div>

            {/* Right Feature: QR Traceability (Card-free open layout with pulsing radar badge) */}
            <div>
              <div className="card-img-wrapper" style={{ height: '210px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', position: 'relative' }}>
                <img 
                  src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80" 
                  alt="Phytochemistry Testing" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'var(--palette-cypress, #283125)', color: 'var(--palette-cream, #E6D7B9)', padding: '5px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--palette-ochre, #948452)', animation: 'pulseRadar 2s infinite' }} />
                  Live Farm Traceability
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'var(--palette-cream, #E6D7B9)', padding: '3px 9px', borderRadius: '4px' }}>
                Quality Assurance
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '8px', marginBottom: '10px' }}>
                Verified Batch QR Code & Lab Testing
              </h3>
              {/* NOTE: Farmer is displayed as Seller throughout user-facing features (farmer hi seller hai) */}
              <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '0.96rem', lineHeight: '1.65', marginBottom: '14px' }}>
                Every delivered raw herb bottle features an immutable QR code linking directly to accredited lab analysis reports, moisture percentages, and lead seller collective coordinates.
              </p>
              <div style={{ fontSize: '12px', color: 'var(--palette-cypress, #283125)', marginBottom: '22px' }}>
                Sample Batch: <strong>{traceBatchSample.batchNumber}</strong> • Heavy Metals: <strong style={{ color: 'var(--palette-leaf, #5E7247)' }}>PASSED</strong> • Pesticides: <strong style={{ color: 'var(--palette-leaf, #5E7247)' }}>ZERO</strong>
              </div>
              <Link 
                to="/traceability"
                className="btn-secondary-pill"
                style={{ padding: '12px 28px', fontSize: '13.5px', textDecoration: 'none', borderColor: 'var(--palette-sage, #8D9B8C)', color: 'var(--palette-cypress, #283125)' }}
              >
                <QrCode size={15} color="var(--palette-leaf, #5E7247)" /> Verify Batch Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: PATIENT COMMUNITY & REVERSAL STORIES (CARD-FREE EDITORIAL TESTIMONIALS) */}
      <section style={{ padding: '75px 0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px auto' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Module 8 • Patient Community
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginTop: '6px' }}>
              Verified Reversal Journeys
            </h2>
            <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '0.96rem', marginTop: '8px' }}>
              Real patient case studies under continuous BHMS clinical supervision.
            </p>
          </div>

          {/* Card-Free Editorial Quotes */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px'
            }}
          >
            {/* Story 1 */}
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(94, 114, 71, 0.16)' }}>
              <div style={{ fontSize: '38px', color: 'var(--palette-ochre, #948452)', fontFamily: 'serif', lineHeight: 1, marginBottom: '6px' }}>“</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', marginBottom: '8px' }}>
                Type 2 Diabetes • HbA1c 8.8 → 6.2
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--palette-cypress, #283125)', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '18px' }}>
                "Sourced fresh Neem-Giloy and Jamun seed powder with Ritucharya meal timings. My fasting blood sugar stabilized at 95 mg/dL without energy crashes."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" 
                  alt="Sunita Mehra" 
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--palette-cream, #E6D7B9)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>Sunita Mehra, Pune</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--palette-sage, #8D9B8C)' }}>Supervised by Dr. Priya Sharma, BHMS</div>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(94, 114, 71, 0.16)' }}>
              <div style={{ fontSize: '38px', color: 'var(--palette-ochre, #948452)', fontFamily: 'serif', lineHeight: 1, marginBottom: '6px' }}>“</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', marginBottom: '8px' }}>
                PCOS & Cystic Acne • Cycle Restored to 30 Days
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--palette-cypress, #283125)', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '18px' }}>
                "Raw Shatavari and Kanchnar with real batch lab testing made a visible difference. Recent ultrasound confirmed complete absence of new cysts."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80" 
                  alt="Pooja Agarwal" 
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--palette-cream, #E6D7B9)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>Pooja Agarwal, Jaipur</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--palette-sage, #8D9B8C)' }}>Supervised by Dr. Ananya Roy, BHMS</div>
                </div>
              </div>
            </div>
          </div>

          {/* View All Stories Button at the Bottom */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <Link 
              to="/community" 
              className="btn-secondary-pill"
              style={{ padding: '13px 36px', fontSize: '14.5px', fontWeight: '600', borderColor: 'var(--palette-sage, #8D9B8C)', color: 'var(--palette-cypress, #283125)' }}
            >
              <Users size={16} color="var(--palette-leaf, #5E7247)" />
              <span>Read All Patient Reversal Stories</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. SECTION: PARTNER ONBOARDING (CARD-FREE EDITORIAL) */}
      <PartnerSection />
    </div>
  );
}
