import React, { useState } from 'react';
import { X, Search, ArrowRight, QrCode } from 'lucide-react';
import { rawHerbsData } from '../data/mockData';

export default function SearchModal({ isOpen, onClose, onSelectHerb, onOpenTraceability }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const filtered = query.trim() === '' 
    ? rawHerbsData.slice(0, 4) 
    : rawHerbsData.filter(h => 
        h.name.toLowerCase().includes(query.toLowerCase()) || 
        h.category.toLowerCase().includes(query.toLowerCase()) ||
        h.benefits.some(b => b.toLowerCase().includes(query.toLowerCase()))
      );

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 40, 25, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5f0e9', gap: '12px' }}>
          <Search size={20} color="#5e9434" />
          <input 
            type="text"
            autoFocus
            placeholder="Search raw herbs, symptoms (e.g. Diabetes, Ashwagandha, Joint Pain)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: '#1a3322'
            }}
          />
          <button 
            onClick={onClose}
            style={{ background: '#edf5ee', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} color="#35553e" />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#688c71', textTransform: 'uppercase', marginBottom: '10px' }}>
            {query.trim() === '' ? 'Popular Raw Herbs & Formulations' : `Matching Results (${filtered.length})`}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted, #5E6D5B)' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--palette-cream-light, #F8F4EC)', color: 'var(--palette-leaf, #5E7247)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                <Search size={20} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--palette-cypress, #283125)', marginBottom: '4px' }}>
                Herb Not Found
              </div>
              <div style={{ fontSize: '12.5px', maxWidth: '280px', margin: '0 auto', lineHeight: '1.4' }}>
                No botanical item matched "{query}". Try searching "Ashwagandha", "Giloy", or "Amla".
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filtered.map(herb => (
                <div 
                  key={herb.id}
                  onClick={() => {
                    onClose();
                    onOpenTraceability(herb);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fcf9',
                    border: '1px solid #e7f2eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eef8f1'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fcf9'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={herb.image} alt={herb.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1b3823' }}>{herb.name}</div>
                      <div style={{ fontSize: '11px', color: '#608169' }}>{herb.category} • ₹{herb.price}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#4e7e2c', fontWeight: '600' }}>
                    <QrCode size={14} /> Batch Report
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
