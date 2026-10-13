import React from 'react';

export default function Logo({ size = 'medium' }) {
  const isLarge = size === 'large';
  return (
    <div className="flex flex-col items-center justify-center cursor-pointer select-none group" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Exact Leaf Graphic from Screenshot */}
      <svg 
        width={isLarge ? "48" : "36"} 
        height={isLarge ? "32" : "24"} 
        viewBox="0 0 44 28" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(110, 163, 67, 0.25))' }}
      >
        {/* Left leaf */}
        <path 
          d="M21.5 24C11.5 23 2 15 2 4C14 4 21 12 21.5 24Z" 
          fill="var(--palette-leaf, #5E7247)" 
        />
        {/* Right leaf */}
        <path 
          d="M22.5 24C32.5 23 42 15 42 4C30 4 23 12 22.5 24Z" 
          fill="var(--palette-sage, #8D9B8C)" 
        />
        {/* Center vein stem */}
        <path 
          d="M22 24.5V11" 
          stroke="var(--palette-cypress, #283125)" 
          strokeWidth="1.6" 
          strokeLinecap="round" 
        />
        <path 
          d="M13 14C16.5 16 19.5 19 22 22" 
          stroke="var(--palette-leaf, #5E7247)" 
          strokeWidth="1" 
          strokeLinecap="round" 
          opacity="0.6" 
        />
        <path 
          d="M31 14C27.5 16 24.5 19 22 22" 
          stroke="var(--palette-leaf, #5E7247)" 
          strokeWidth="1" 
          strokeLinecap="round" 
          opacity="0.6" 
        />
      </svg>
      <span 
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: isLarge ? '15px' : '11px',
          fontWeight: '700',
          letterSpacing: '3.2px',
          color: 'var(--palette-cypress, #283125)',
          marginTop: '3px',
          textTransform: 'uppercase',
          lineHeight: 1
        }}
      >
        AYURVEDA
      </span>
    </div>
  );
}
