import React, { useState } from 'react';
import { traceBatchSample } from '../data/mockData';
import { 
  X, 
  QrCode, 
  MapPin, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function TraceabilityDemoModal({ isOpen, onClose, selectedHerb }) {
  if (!isOpen) return null;

  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const batch = traceBatchSample;
  const productName = selectedHerb ? selectedHerb.name : batch.productName;
  const batchNo = selectedHerb ? selectedHerb.batchNo : batch.batchNumber;
  const farmLocation = selectedHerb ? selectedHerb.farmSource : batch.sourceFarm;

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 40, 25, 0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '660px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 70px -15px rgba(25, 55, 35, 0.3)',
          padding: '32px',
          borderRadius: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#edf5ee',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2a4430',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div 
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#e6f3de',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4e7e2c'
            }}
          >
            <QrCode size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#57823e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              QR Batch Verification Certificate
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '600', color: '#16311e' }}>
              Farm-to-Bottle Traceability
            </h3>
          </div>
        </div>

        {/* Verification Success Pill */}
        <div 
          style={{
            backgroundColor: '#eef8eb',
            border: '1px solid #bce2b4',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#457829" />
            <div>
              <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#254b17' }}>
                Authentic & Verified Batch: {batchNo}
              </div>
              <div style={{ fontSize: '11.5px', color: '#4a7536' }}>
                {productName} • 100% Unadulterated Herb
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff', backgroundColor: '#5c9233', padding: '4px 10px', borderRadius: '9999px' }}>
            PASSED
          </span>
        </div>

        {/* Farm & Origin Metadata */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#385540', textTransform: 'uppercase', marginBottom: '12px' }}>
            1. Agricultural Origin & Farmer Profile
          </h4>
          <div 
            style={{
              backgroundColor: '#f6fbf8',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #e2efe6',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#688c71' }}>Origin Farm</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f3825' }}>{farmLocation}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#688c71' }}>Certified Farmer Partner</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f3825' }}>{batch.farmerPartner}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#688c71' }}>Harvest Date</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f3825' }}>{batch.harvestDate}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#688c71' }}>Drying Method</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f3825' }}>Low-Temp Solar Dehydration</div>
            </div>
          </div>
        </div>

        {/* Laboratory Analysis Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#385540', textTransform: 'uppercase' }}>
              2. Chemical & Heavy Metal Lab Analysis
            </h4>
            <span style={{ fontSize: '11px', color: '#5b8264' }}>
              Tested by: {batch.labReport.testingFacility}
            </span>
          </div>

          <div 
            style={{
              backgroundColor: '#f6fbf8',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #e2efe6',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#466750' }}>Heavy Metals (Lead, Cadmium, Arsenic):</span>
              <span style={{ fontWeight: '700', color: '#2b541d' }}>PASS (&lt; 0.05 ppm)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#466750' }}>Pesticide & Fungicide Residues:</span>
              <span style={{ fontWeight: '700', color: '#2b541d' }}>ZERO DETECTED</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#466750' }}>Moisture Content:</span>
              <span style={{ fontWeight: '700', color: '#2b541d' }}>{batch.moistureContent}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#466750' }}>Microbial Pathogen Screen:</span>
              <span style={{ fontWeight: '700', color: '#2b541d' }}>SAFE (E. Coli Absent)</span>
            </div>
          </div>
        </div>

        {/* Licenses and Download Button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', paddingTop: '16px', borderTop: '1px solid #e6f0e9' }}>
          <div style={{ fontSize: '11px', color: '#5c7e66' }}>
            AYUSH Lic: <strong>{batch.ayushLicenseNo}</strong> • FSSAI: <strong>{batch.fssaiNo}</strong>
          </div>

          <button
            onClick={handleDownloadReport}
            className="btn-primary-pill"
            style={{ padding: '10px 22px', fontSize: '13px' }}
          >
            {downloading ? (
              <span>Generating PDF...</span>
            ) : downloadSuccess ? (
              <span>✓ Certificate Downloaded</span>
            ) : (
              <>
                <Download size={14} /> Download Lab Report (COA)
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
