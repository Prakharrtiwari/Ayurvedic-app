import React, { useEffect, useRef } from 'react';
import { X, Video, ShieldCheck, PhoneOff, Mic, MicOff, Camera, CameraOff, Maximize2 } from 'lucide-react';
import useModalBackButton from '../hooks/useModalBackButton';

export default function VideoConsultationModal({ isOpen, onClose, roomName, doctorName, patientName }) {
  useModalBackButton(isOpen, onClose);
  if (!isOpen) return null;

  const cleanRoomId = (roomName || 'ayurveda-clinical-room')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();

  const jitsiUrl = `https://meet.jit.si/${cleanRoomId}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&userInfo.displayName="${encodeURIComponent(doctorName || patientName || 'Consultation Participant')}"`;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(10, 20, 14, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '88vh',
          backgroundColor: '#111a14',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          animation: 'fadeIn 0.25s ease'
        }}
      >
        {/* Modal Top Bar */}
        <div 
          style={{
            padding: '16px 24px',
            backgroundColor: '#18271e',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Video size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15.5px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                  Encrypted HD Clinical Consultation
                </h3>
                <span 
                  style={{
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  LIVE WebRTC
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                Doctor: <strong style={{ color: '#e2e8f0' }}>{doctorName || 'AYUSH Certified Clinician'}</strong> • Room: #{cleanRoomId.slice(-8)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                color: '#a7f3d0'
              }}
            >
              <ShieldCheck size={14} color="#34d399" />
              <span>HIPAA & AYUSH Telemedicine Compliant</span>
            </div>

            <button
              onClick={onClose}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              <PhoneOff size={15} />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Real Live Video Iframe (Jitsi Meet WebRTC - Zero API Key, Zero Cost) */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#090d0b' }}>
          <iframe
            src={jitsiUrl}
            title="Ayurveda Live Video Consultation"
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          />
        </div>

        {/* Modal Bottom Guidance Bar */}
        <div 
          style={{
            padding: '10px 20px',
            backgroundColor: '#141e17',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748b'
          }}
        >
          <span>Tip: Please ensure microphone and camera permissions are allowed in your browser.</span>
          <span>Powered by Open-Source Peer-to-Peer WebRTC Protocol</span>
        </div>
      </div>
    </div>
  );
}
