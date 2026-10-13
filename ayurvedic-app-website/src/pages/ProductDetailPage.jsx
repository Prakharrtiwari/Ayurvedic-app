import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingBag, 
  QrCode, 
  Check, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Award, 
  Droplets, 
  FileText, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { rawHerbsData } from '../data/mockData';
import { publicApi } from '../services/api';

export default function ProductDetailPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dbProduct, setDbProduct] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await publicApi.getProducts();
        if (res.success && res.products) {
          const found = res.products.find(p => p.id === id || p.batchNo === id);
          if (found) setDbProduct(found);
        }
      } catch (err) {
        console.warn('Error fetching product detail:', err);
      }
    };
    loadProduct();
  }, [id]);

  // Find herb by database id or mock data fallback
  const herb = dbProduct || rawHerbsData.find(h => h.id === id) || rawHerbsData[0];

  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [activeTab, setActiveTab] = useState('overview');
  const [added, setAdded] = useState(false);

  // User reviews
  const [userReviews, setUserReviews] = useState([
    {
      id: 'rev-1',
      author: 'Rajeshwar Verma',
      location: 'Lucknow, Uttar Pradesh',
      rating: 5,
      date: '24 August 2026',
      verified: true,
      title: 'Remarkable potency compared to packaged capsules',
      content: 'I switched from store-bought extract pills to this raw, unpolished root for boiling my evening milk decoction. The difference in sleep depth and morning energy within 10 days is undeniable. The QR batch scan gave me full peace of mind regarding lead/heavy metal purity.'
    },
    {
      id: 'rev-2',
      author: 'Sunita Mehra',
      location: 'Bengaluru, Karnataka',
      rating: 5,
      date: '18 August 2026',
      verified: true,
      title: 'Authentic earthy aroma and clean vacuum packaging',
      content: 'Received directly with nitrogen sealing. You can smell the earthy wild aroma right upon opening. Prescribed by Dr. Priya in our BHMS video consultation for stress and cortisol regulation. Highly recommend!'
    },
    {
      id: 'rev-3',
      author: 'Dr. Vivek Swaminathan',
      location: 'Pune, Maharashtra',
      rating: 5,
      date: '05 August 2026',
      verified: true,
      title: 'Clinically pure botanical without starch filler',
      content: 'As an integrative practitioner, having laboratory COA spectrometry on every single pack with pesticide-free documentation is revolutionary. Excellent bioactive withanolide content.'
    }
  ]);

  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', location: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Weight pricing multiplier
  const weightMultiplier = selectedWeight === '500g' ? 1.85 : selectedWeight === '1kg' ? 3.4 : 1.0;
  const currentPrice = Math.round(herb.price * weightMultiplier);
  const currentOriginalPrice = Math.round(herb.originalPrice * weightMultiplier);

  const handleAddToCart = () => {
    onAddToCart({ ...herb, price: currentPrice, selectedWeight });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setUserReviews(prev => [
      {
        id: `rev-${Date.now()}`,
        author: newReview.name,
        location: newReview.location || 'India',
        rating: newReview.rating,
        date: 'Today',
        verified: true,
        title: 'Verified Customer Review',
        content: newReview.comment
      },
      ...prev
    ]);
    setReviewSubmitted(true);
    setNewReview({ name: '', rating: 5, comment: '', location: '' });
    setTimeout(() => {
      setReviewSubmitted(false);
      setShowReviewForm(false);
    }, 2000);
  };

  return (
    <div style={{ paddingTop: '16px', paddingBottom: '90px' }}>
      <div className="container-custom">
        {/* 1. TOP PRODUCT SHOWCASE (SEAMLESS CARD-FREE LAYOUT) */}
        <div 
          className="product-detail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.1fr',
            gap: '48px',
            alignItems: 'start',
            paddingBottom: '44px',
            borderBottom: '1px solid rgba(94, 114, 71, 0.16)'
          }}
        >
          {/* Left Column: Pure High-Res Photo (No surrounding box borders) */}
          <div>
            <div 
              className="product-gallery-box"
              style={{
                position: 'relative',
                width: '100%',
                height: '420px',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: 'var(--palette-cream-light, #F8F4EC)'
              }}
            >
              <img 
                src={herb.image} 
                alt={herb.name}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Badges Using User Palette */}
              <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span 
                  style={{
                    backgroundColor: 'var(--palette-cream, #E6D7B9)',
                    color: 'var(--palette-cypress, #283125)',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '9999px'
                  }}
                >
                  {herb.badge}
                </span>

                {herb.doctorRecommended && (
                  <span 
                    style={{
                      backgroundColor: 'var(--palette-cypress, #283125)',
                      color: 'var(--palette-cream, #E6D7B9)',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Sparkles size={12} /> BHMS Clinician Choice
                  </span>
                )}
              </div>

              {/* Instant QR Batch Verification Button */}
              <Link
                to={`/traceability?batch=${herb.batchNo}`}
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  backgroundColor: '#ffffff',
                  color: 'var(--palette-leaf, #5E7247)',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  border: '1px solid var(--palette-leaf, #5E7247)',
                  boxShadow: '0 4px 12px rgba(40,49,37,0.1)'
                }}
              >
                <QrCode size={15} color="var(--palette-leaf, #5E7247)" />
                <span>Verify COA</span>
              </Link>
            </div>

            {/* Seamless Trust Highlights Strip (Zero Boxes) */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginTop: '16px',
                padding: '12px 8px',
                borderTop: '1px solid rgba(94, 114, 71, 0.12)',
                fontSize: '12px',
                color: 'var(--palette-cypress, #283125)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={15} color="var(--palette-leaf, #5E7247)" />
                <span>100% Raw Uncut</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Award size={15} color="var(--palette-leaf, #5E7247)" />
                <span>AYUSH & FSSAI</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Droplets size={15} color="var(--palette-leaf, #5E7247)" />
                <span>Nitrogen Foil</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Botanical Narrative & Purchase */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Category & Botanical */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {herb.category} • <em>{herb.botanicalName}</em>
              </span>
              <span style={{ fontSize: '11px', color: 'var(--palette-cypress, #283125)', backgroundColor: 'var(--palette-cream, #E6D7B9)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                Grade A Purity
              </span>
            </div>

            {/* Title */}
            <h1 
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(1.9rem, 3.4vw, 2.5rem)',
                fontWeight: '600',
                color: 'var(--palette-cypress, #283125)',
                lineHeight: '1.2',
                marginBottom: '10px'
              }}
            >
              {herb.name}
            </h1>

            {/* Ratings Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--palette-ochre, #948452)' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={15} fill="var(--palette-ochre, #948452)" color="var(--palette-ochre, #948452)" />
                ))}
              </div>
              <span style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--palette-cypress, #283125)' }}>{herb.rating}</span>
              <span style={{ fontSize: '12.5px', color: 'var(--palette-sage, #8D9B8C)' }}>({herb.reviewsCount} verified reviews)</span>
            </div>

            {/* Subtitle */}
            <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '22px' }}>
              {herb.subtitle}. Naturally shade-dried to conserve vital adaptogenic withanolides, bio-alkaloids, and essential trace minerals without sulfur or radiation.
            </p>

            {/* Price Row (Seamless minimal bar) */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                paddingBottom: '16px',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(94, 114, 71, 0.12)'
              }}
            >
              <span style={{ fontSize: '2.1rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                ₹{currentPrice}
              </span>
              <span style={{ fontSize: '1.05rem', color: 'var(--palette-sage, #8D9B8C)', textDecoration: 'line-through' }}>
                ₹{currentOriginalPrice}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', backgroundColor: 'var(--palette-cream, #E6D7B9)', padding: '3px 8px', borderRadius: '4px' }}>
                Save ₹{currentOriginalPrice - currentPrice}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--palette-sage, #8D9B8C)', marginLeft: 'auto' }}>
                Taxes included
              </span>
            </div>

            {/* Weight Selection (Minimal Pills) */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '8px' }}>
                Package Size:
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['250g', '500g', '1kg'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedWeight(size)}
                    style={{
                      padding: '7px 18px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: selectedWeight === size ? '700' : '500',
                      backgroundColor: selectedWeight === size ? 'var(--palette-leaf, #5E7247)' : '#ffffff',
                      color: selectedWeight === size ? '#ffffff' : 'var(--palette-cypress, #283125)',
                      border: selectedWeight === size ? '1px solid var(--palette-leaf, #5E7247)' : '1px solid #d8e6dc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {size} {size === '250g' ? '(Standard)' : size === '500g' ? '(Popular)' : '(Apothecary)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart (Clean Full-Width Pill) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #c8ded0',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  padding: '2px 8px'
                }}
              >
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '8px 12px', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}
                >
                  -
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '14px', fontWeight: '700' }}>
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '8px 12px', background: 'transparent', border: 'none', fontSize: '16px', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary-pill"
                style={{
                  flex: 1,
                  padding: '13px 28px',
                  fontSize: '0.98rem',
                  fontWeight: '600',
                  backgroundColor: added ? 'var(--palette-cypress, #283125)' : 'var(--palette-leaf, #5E7247)'
                }}
              >
                {added ? (
                  <>
                    <Check size={17} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={17} /> Add to Cart • ₹{currentPrice * quantity}
                  </>
                )}
              </button>
            </div>

            {/* Farm Origin & Batch Note (Zero Card Borders) */}
            <div 
              style={{
                fontSize: '12.5px',
                color: 'var(--color-text-muted, #5E6D5B)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(94, 114, 71, 0.12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={13} color="var(--palette-leaf, #5E7247)" />
                  <span>Harvested at {herb.farmSource}</span>
                </div>
                <span>{herb.harvestDate}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Batch: <strong>{herb.batchNo}</strong></span>
                <Link 
                  to={`/traceability?batch=${herb.batchNo}`} 
                  style={{ color: 'var(--palette-leaf, #5E7247)', fontWeight: '700', textDecoration: 'underline' }}
                >
                  View COA Lab Analysis →
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* 2. IN-DEPTH BOTANICAL & CLINICAL DOSSIER (COMPLETELY CARD-FREE) */}
        <div style={{ paddingTop: '36px', paddingBottom: '48px', borderBottom: '1px solid rgba(94, 114, 71, 0.16)' }}>
          {/* Navigation Pill Bar */}
          <div 
            style={{
              display: 'flex',
              gap: '10px',
              paddingBottom: '20px',
              marginBottom: '28px',
              borderBottom: '1px solid rgba(94, 114, 71, 0.12)',
              overflowX: 'auto'
            }}
          >
            {[
              { key: 'overview', label: 'Clinical Actions & Benefits' },
              { key: 'ayurveda', label: 'Ayurvedic Dosha Energetics' },
              { key: 'usage', label: 'Decoction (Kwath) Guide' },
              { key: 'reviews', label: `Customer Reviews (${userReviews.length})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.key ? '700' : '500',
                  backgroundColor: activeTab === tab.key ? 'var(--palette-cypress, #283125)' : 'var(--palette-cream-light, #F8F4EC)',
                  color: activeTab === tab.key ? 'var(--palette-cream, #E6D7B9)' : 'var(--palette-cypress, #283125)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Benefits (Editorial Text & Natural Checkmarks) */}
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '16px' }}>
                Documented Bio-Actions & Clinical Indications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {herb.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--palette-cream, #E6D7B9)', color: 'var(--palette-cypress, #283125)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={13} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--palette-cypress, #283125)', fontSize: '14.5px' }}>{b}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #5E6D5B)', marginTop: '2px' }}>
                        Documented in Charaka Samhita and certified pure through HPLC spectrometry without heavy metal contaminants.
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                *Clinician Note: Raw whole herbs release their active secondary metabolites when simmered gently as an herbal decoction. Take consistently for 30 to 60 days for deep constitutional restoration.
              </p>
            </div>
          )}

          {/* Tab 2: Ayurvedic Energetics (Clean Horizontal Strips, No Box Cards) */}
          {activeTab === 'ayurveda' && (
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '16px' }}>
                Ayurvedic Constitutional Energetics
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ paddingBottom: '12px', borderBottom: '2px solid var(--palette-cream, #E6D7B9)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase' }}>Vata Dosha</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)', marginTop: '2px' }}>Pacifying (↓)</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5E6D5B)', marginTop: '4px' }}>Soothes neural restlessness & dryness</div>
                </div>

                <div style={{ paddingBottom: '12px', borderBottom: '2px solid var(--palette-cream, #E6D7B9)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase' }}>Pitta Dosha</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)', marginTop: '2px' }}>Neutral (↔)</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5E6D5B)', marginTop: '4px' }}>Best consumed with milk or ghee anupana</div>
                </div>

                <div style={{ paddingBottom: '12px', borderBottom: '2px solid var(--palette-cream, #E6D7B9)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase' }}>Kapha Dosha</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)', marginTop: '2px' }}>Pacifying (↓)</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5E6D5B)', marginTop: '4px' }}>Clears metabolic heaviness</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px', color: 'var(--palette-cypress, #283125)' }}>
                <div><strong>Rasa (Taste):</strong> Tikta, Kashaya</div>
                <div><strong>Virya (Energy):</strong> Ushna (Warm)</div>
                <div><strong>Vipaka:</strong> Madhura (Sweet)</div>
                <div><strong>Karma:</strong> Medhya Rasayana</div>
              </div>
            </div>
          )}

          {/* Tab 3: Decoction Ritual (Numbered List, No Cards) */}
          {activeTab === 'usage' && (
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '16px' }}>
                Classical Decoction Ritual (Kwath Method)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { step: '1', title: 'Portioning', text: 'Measure 3 to 5 grams (approx 1 rounded tsp) of dried root or coarse botanical.' },
                  { step: '2', title: 'Liquid Base', text: 'Add to 200ml of clean filtered water or warm whole A2 cow milk in a saucepan.' },
                  { step: '3', title: 'Gentle Reduction', text: 'Simmer over low flame until liquid reduces to 100ml. Strain through a fine mesh.' },
                  { step: '4', title: 'Evening Anupana', text: 'Drink warm 45 minutes before sleep with 1/2 tsp pure ghee or raw forest honey.' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--palette-leaf, #5E7247)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                      {item.step}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--palette-cypress, #283125)', fontSize: '14px' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #5E6D5B)', marginTop: '2px' }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Customer Reviews (Clean Borderless Comments) */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)' }}>
                    Verified Patient Reviews
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', color: 'var(--palette-ochre, #948452)' }}>
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="var(--palette-ochre, #948452)" color="var(--palette-ochre, #948452)" />)}
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--palette-cypress, #283125)', fontSize: '13.5px' }}>{herb.rating} / 5</span>
                    <span style={{ color: 'var(--palette-sage, #8D9B8C)', fontSize: '12.5px' }}>• {userReviews.length} Community Submissions</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-secondary-pill"
                  style={{ padding: '8px 20px', fontSize: '12.5px', borderColor: 'var(--palette-sage, #8D9B8C)' }}
                >
                  <MessageSquare size={14} color="var(--palette-leaf, #5E7247)" />
                  <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
                </button>
              </div>

              {/* Seamless Review Form */}
              {showReviewForm && (
                <form 
                  onSubmit={handleReviewSubmit}
                  style={{
                    padding: '20px 0',
                    marginBottom: '28px',
                    borderBottom: '1px solid rgba(94, 114, 71, 0.16)'
                  }}
                >
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)', marginBottom: '14px' }}>
                    Share Your Ayurvedic Experience
                  </h4>

                  {reviewSubmitted ? (
                    <div style={{ padding: '12px', backgroundColor: 'var(--palette-cream-light, #F8F4EC)', color: 'var(--palette-cypress, #283125)', fontWeight: '600' }}>
                      ✓ Thank you! Your review has been recorded.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--palette-cypress, #283125)', display: 'block', marginBottom: '4px' }}>
                          Full Name *
                        </label>
                        <input 
                          type="text"
                          required
                          value={newReview.name}
                          onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                          placeholder="e.g. Ramesh Chandra"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #c8ded0' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--palette-cypress, #283125)', display: 'block', marginBottom: '4px' }}>
                          City / State
                        </label>
                        <input 
                          type="text"
                          value={newReview.location}
                          onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                          placeholder="e.g. Jaipur"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #c8ded0' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--palette-cypress, #283125)', display: 'block', marginBottom: '4px' }}>
                          Rating
                        </label>
                        <select 
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #c8ded0' }}
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                          <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        </select>
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--palette-cypress, #283125)', display: 'block', marginBottom: '4px' }}>
                          Comment *
                        </label>
                        <textarea 
                          required
                          rows={2}
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Describe your preparation method and healing observed..."
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #c8ded0', fontFamily: 'inherit' }}
                        />
                      </div>

                      <div>
                        <button type="submit" className="btn-primary-pill" style={{ padding: '8px 24px', fontSize: '13px' }}>
                          Submit Review
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Clean Reviews List (Divider lines only, zero boxed cards) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {userReviews.map((rev) => (
                  <div 
                    key={rev.id}
                    style={{
                      paddingBottom: '18px',
                      borderBottom: '1px solid rgba(94, 114, 71, 0.12)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--palette-cypress, #283125)', fontSize: '14px' }}>{rev.author}</span>
                        {rev.verified && (
                          <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', backgroundColor: 'var(--palette-cream, #E6D7B9)', padding: '1px 6px', borderRadius: '3px' }}>
                            ✓ Verified Buyer
                          </span>
                        )}
                        <span style={{ fontSize: '11.5px', color: 'var(--palette-sage, #8D9B8C)' }}>• {rev.location}</span>
                      </div>

                      <div style={{ display: 'flex', color: 'var(--palette-ochre, #948452)' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="var(--palette-ochre, #948452)" color="var(--palette-ochre, #948452)" />
                        ))}
                      </div>
                    </div>

                    <div style={{ fontWeight: '600', color: 'var(--palette-cypress, #283125)', fontSize: '13px', marginBottom: '4px' }}>
                      "{rev.title}"
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #5E6D5B)', lineHeight: '1.55', margin: 0 }}>
                      {rev.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. EXPLORE MORE MEDICINAL HERBS (2-per-row on mobile, zero cut-off) */}
        <div style={{ paddingTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)' }}>
              Explore Other Farm-Direct Botanicals
            </h3>
            <Link to="/shop" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textDecoration: 'underline' }}>
              View All Apothecary →
            </Link>
          </div>

          <div 
            className="products-grid-responsive"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
              width: '100%'
            }}
          >
            {rawHerbsData.filter(h => h.id !== herb.id).slice(0, 4).map(otherHerb => (
              <div
                key={otherHerb.id}
                className="product-compact-card interactive-card"
                onClick={() => {
                  navigate(`/product/${otherHerb.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid rgba(94, 114, 71, 0.18)',
                  padding: '14px',
                  boxShadow: '0 4px 16px -4px rgba(40, 49, 37, 0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div 
                  className="product-img-box"
                  style={{
                    height: '160px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f0f6f2',
                    marginBottom: '10px'
                  }}
                >
                  <img 
                    src={otherHerb.image} 
                    alt={otherHerb.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--palette-leaf, #5E7247)', textTransform: 'uppercase' }}>
                  {otherHerb.category}
                </div>

                <h3 style={{ fontSize: '1.02rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', margin: '3px 0 6px 0' }}>
                  {otherHerb.name}
                </h3>

                <div className="product-bottom-bar" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span className="product-price" style={{ fontSize: '1.18rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                    ₹{otherHerb.price}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--palette-leaf, #5E7247)', fontWeight: '700' }}>
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
