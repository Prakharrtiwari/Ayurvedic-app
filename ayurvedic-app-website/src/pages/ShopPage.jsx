import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { rawHerbsData } from '../data/mockData';
import { 
  ShoppingBag, 
  QrCode, 
  Check, 
  Star, 
  MapPin, 
  FileCheck2, 
  Sparkles, 
  Search, 
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';

import { publicApi } from '../services/api';

export default function ShopPage({ onAddToCart }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState(rawHerbsData);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const res = await publicApi.getProducts();
        if (res.success && res.products && res.products.length > 0) {
          setProducts(res.products);
        }
      } catch (err) {
        console.warn('Using local herbs data fallback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDbProducts();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const categories = ['All', 'Roots', 'Stems', 'Powders', 'Leaves', 'Bark', 'Kits'];

  const filteredHerbs = products.filter(herb => {
    const q = searchQuery.toLowerCase().trim();
    const matchesCategory = selectedCategory === 'All' || herb.category === selectedCategory;
    const matchesSearch = !q || (
      (herb.name && herb.name.toLowerCase().includes(q)) ||
      (herb.botanicalName && herb.botanicalName.toLowerCase().includes(q)) ||
      (herb.subtitle && herb.subtitle.toLowerCase().includes(q)) ||
      (herb.farmSource && herb.farmSource.toLowerCase().includes(q)) ||
      (herb.category && herb.category.toLowerCase().includes(q))
    );
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (herb) => {
    onAddToCart(herb);
    setAddedItems(prev => ({ ...prev, [herb.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [herb.id]: false }));
    }, 1600);
  };

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '100px' }}>
      <div className="container-custom">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 40px auto' }}>
          {/* Editorial Eyebrow (Replaces AI rounded pill) */}
          <div className="editorial-eyebrow">
            <span className="eyebrow-accent" />
            <span className="eyebrow-glyph">✦</span>
            <span className="eyebrow-text">Farm-Direct Botanical Purity</span>
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
            Raw Herbal Products Catalog
          </h1>

          <p style={{ color: 'var(--color-text-muted, #5E6D5B)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Instead of mass-manufactured pills, we supply unpolished roots, whole stems, sun-dried leaves, and low-temperature powders directly from Himalayan and Western Ghat farms.
          </p>

          {/* Search & Filter Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '30px' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '9999px',
                padding: '8px 18px',
                border: '1.5px solid var(--palette-leaf, #5E7247)',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}
            >
              <Search size={16} color="var(--palette-leaf, #5E7247)" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input 
                type="text"
                className="bare-input"
                placeholder="Search by herb, farm, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  border: 'none', 
                  outline: 'none', 
                  fontSize: '13.5px', 
                  color: 'var(--palette-cypress, #283125)', 
                  width: '100%', 
                  background: 'transparent',
                  padding: '4px 0'
                }}
              />
            </div>

            {/* Category Filter Chips (Solid Dark Chips without Borders) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`solid-chip ${isSelected ? 'active' : ''}`}
                    style={{
                      padding: '8px 18px',
                      fontSize: '12.5px',
                      fontWeight: isSelected ? '700' : '600'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid or Empty Not Found State */}
        {filteredHerbs.length > 0 ? (
          <div 
            className="products-grid-responsive"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px',
              marginBottom: '60px',
              width: '100%'
            }}
          >
            {filteredHerbs.map((herb) => (
              <div 
                key={herb.id}
                className="minimal-card interactive-card product-compact-card"
                onClick={() => navigate(`/product/${herb.id}`)}
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ minWidth: 0, width: '100%' }}>
                  {/* Image on Top with Zoom & Non-Overlapping Badges */}
                  <div 
                    className="card-img-wrapper product-img-box"
                    style={{ 
                      position: 'relative', 
                      height: '190px', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      backgroundColor: '#f0f6f2', 
                      marginBottom: '10px' 
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

                    {/* Top Non-Overlapping Badges Header */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: '7px',
                        left: '7px',
                        right: '7px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '5px',
                        pointerEvents: 'none'
                      }}
                    >
                      <span 
                        style={{
                          backgroundColor: 'var(--palette-cream, #E6D7B9)',
                          color: 'var(--palette-cypress, #283125)',
                          fontSize: '9.5px',
                          fontWeight: '700',
                          padding: '3px 7px',
                          borderRadius: '4px',
                          maxWidth: '56%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          pointerEvents: 'auto',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                        }}
                        title={herb.badge}
                      >
                        {herb.badge}
                      </span>

                      <Link
                        to={`/traceability?batch=${herb.batchNo}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(4px)',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          color: 'var(--palette-leaf, #5E7247)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '9.5px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          pointerEvents: 'auto'
                        }}
                        title="Open batch laboratory analysis"
                      >
                        <QrCode size={11} /> {herb.batchNo}
                      </Link>
                    </div>
                  </div>

                  <div style={{ minWidth: 0, width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--palette-ochre, #948452)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {herb.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: '700', color: 'var(--palette-ochre, #948452)' }}>
                        <Star size={11} fill="var(--palette-ochre, #948452)" />
                        <span>{herb.rating}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--palette-cypress, #283125)', marginBottom: '4px', lineHeight: '1.25' }}>
                      {herb.name}
                    </h3>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5E6D5B)', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                      <MapPin size={10} color="var(--palette-leaf, #5E7247)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '100%' }}>{herb.farmSource}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Add to Cart (Clean full-width layout with 0 overflow) */}
                <div className="product-bottom-bar" style={{ paddingTop: '8px', borderTop: '1px solid #f0f6f2', marginTop: '6px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '6px' }}>
                    <span className="product-price" style={{ fontSize: '1.18rem', fontWeight: '700', color: 'var(--palette-cypress, #283125)' }}>
                      ₹{herb.price}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--palette-sage, #8D9B8C)', textDecoration: 'line-through' }}>
                      ₹{herb.originalPrice}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(herb);
                    }}
                    className="product-add-btn btn-primary-pill"
                    style={{
                      width: '100%',
                      padding: '7px 0',
                      fontSize: '12px',
                      justifyContent: 'center',
                      backgroundColor: addedItems[herb.id] ? 'var(--palette-cypress, #283125)' : 'var(--palette-leaf, #5E7247)'
                    }}
                  >
                    {addedItems[herb.id] ? (
                      <>
                        <Check size={13} /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={13} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '60px 24px', 
              backgroundColor: '#ffffff', 
              borderRadius: '20px', 
              border: '1.5px dashed rgba(94, 114, 71, 0.28)',
              marginBottom: '60px'
            }}
          >
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--palette-cream-light, #F8F4EC)', 
                color: 'var(--palette-leaf, #5E7247)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px auto' 
              }}
            >
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--palette-cypress, #283125)', fontWeight: '700', marginBottom: '8px' }}>
              No Herbs or Products Found
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted, #5E6D5B)', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
              {searchQuery ? `No botanical harvest matched "${searchQuery}".` : `No herbs available in "${selectedCategory}" category.`} Try checking for spelling, searching common herbs like "Ashwagandha" or "Giloy", or reset your filters.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="btn-secondary-pill"
              style={{ padding: '10px 26px', fontSize: '13px', cursor: 'pointer' }}
            >
              Clear Search & View All Herbs
            </button>
          </div>
        )}

        {/* Doctor Consultation Link Strip */}
        <div 
          style={{
            padding: '32px',
            backgroundColor: '#f3f8f4',
            borderRadius: '8px',
            border: '1px solid rgba(108, 153, 85, 0.2)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#447225', textTransform: 'uppercase' }}>
              Clinical Dosage Guidance
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '600', color: '#16311e', marginTop: '4px', marginBottom: '8px' }}>
              Unsure How to Prepare Decoctions & Dosages?
            </h3>
            <p style={{ color: '#44644c', fontSize: '0.96rem', lineHeight: '1.5' }}>
              Consult our registered BHMS medical practitioners online. Get personalized e-prescriptions detailing water decoction boiling time, meal timing, and drug interaction checks.
            </p>
          </div>

          <Link to="/book-doctor" className="btn-primary-pill" style={{ padding: '14px 32px', fontSize: '14px' }}>
            Book Consultation <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}
