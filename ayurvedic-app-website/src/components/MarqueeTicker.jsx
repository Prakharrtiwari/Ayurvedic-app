import React from 'react';

export default function MarqueeTicker() {
  const items = [
    { text: '100% Raw Uncut Botanicals', color: '#E6D7B9' },
    { text: 'Zero Chemical Adulteration', color: '#8D9B8C' },
    { text: 'Verified BHMS Teleconsultations', color: '#948452' },
    { text: 'HPLC Purity Tested & Heavy Metal Safe', color: '#5E7247' },
    { text: 'Immutable QR Batch Traceability', color: '#E6D7B9' },
    { text: '30 / 60 / 90-Day Root-Cause Reversal', color: '#948452' },
    { text: 'Direct Himalayan & Western Ghats Farm Cooperatives', color: '#8D9B8C' }
  ];

  // Repeat twice for seamless infinite marquee loop
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="marquee-container" aria-hidden="true">
      <div className="marquee-content">
        {displayItems.map((item, idx) => (
          <div key={idx} className="marquee-item">
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: item.color,
                display: 'inline-block',
                boxShadow: `0 0 8px ${item.color}`
              }}
            />
            <span style={{ color: '#F4EFE6' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
