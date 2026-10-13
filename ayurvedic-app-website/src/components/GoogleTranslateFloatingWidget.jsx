import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, X, Minus } from 'lucide-react';

export default function GoogleTranslateFloatingWidget() {
  const { 
    lang, 
    selectLanguage, 
    isWidgetVisible, 
    isWidgetCollapsed, 
    setIsWidgetCollapsed, 
    hideWidget, 
    showWidget 
  } = useLanguage();

  if (!isWidgetVisible) {
    // Hidden completely: Render small subtle toggle icon in bottom right corner
    return (
      <button
        onClick={showWidget}
        className="desktop-only-translate-widget"
        title="Open Language Translator (English / हिन्दी)"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99998,
          backgroundColor: '#1d3924',
          color: '#E6D7B9',
          border: '1.5px solid #2d5a37',
          borderRadius: '9999px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: '800',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        <Globe size={15} />
        <span>{lang === 'hi' ? '🇮🇳 हिन्दी' : '🌐 Translate'}</span>
      </button>
    );
  }

  if (isWidgetCollapsed) {
    // Minimized bubble mode
    return (
      <button
        onClick={() => setIsWidgetCollapsed(false)}
        className="desktop-only-translate-widget"
        title="Expand Language Selector"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99998,
          backgroundColor: '#1d3924',
          color: '#ffffff',
          border: '2px solid #059669',
          borderRadius: '9999px',
          padding: '9px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px',
          fontWeight: '800',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Globe size={16} color="#E6D7B9" />
        <span>{lang === 'hi' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
      </button>
    );
  }

  return (
    <>
      <div
        className="desktop-only-translate-widget"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99998,
          backgroundColor: '#ffffff',
          borderRadius: '9999px',
          border: '2px solid #1d3924',
          padding: '5px 8px 5px 14px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backdropFilter: 'blur(10px)',
          animation: 'fadeInUp 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '800', color: '#1d3924' }}>
          <Globe size={15} color="#059669" />
          <span>{lang === 'hi' ? 'भाषा' : 'Translate'}:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', borderRadius: '9999px', padding: '3px' }}>
          <button
            type="button"
            onClick={() => selectLanguage('en')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: lang === 'en' ? '#1d3924' : 'transparent',
              color: lang === 'en' ? '#ffffff' : '#334155',
              fontSize: '11.5px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            🇬🇧 English
          </button>

          <button
            type="button"
            onClick={() => selectLanguage('hi')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: lang === 'hi' ? '#059669' : 'transparent',
              color: lang === 'hi' ? '#ffffff' : '#334155',
              fontSize: '11.5px',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            🇮🇳 हिन्दी
          </button>
        </div>

        {/* Minimize / Hide Button */}
        <button
          onClick={() => setIsWidgetCollapsed(true)}
          title="Minimize Widget (Collapse into floating bubble)"
          style={{
            border: 'none',
            background: '#f1f5f9',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.15s ease'
          }}
        >
          <Minus size={14} />
        </button>

        {/* Close Completely Button */}
        <button
          onClick={hideWidget}
          title="Hide Translator"
          style={{
            border: 'none',
            background: 'transparent',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94a3b8',
            transition: 'all 0.15s ease'
          }}
        >
          <X size={15} />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only-translate-widget {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
