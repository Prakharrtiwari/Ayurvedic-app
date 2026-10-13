import React, { useState, useRef } from 'react';
import { uploadPdf } from '../services/api';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Trash2, 
  Loader2 
} from 'lucide-react';

export default function PdfUploader({ 
  label, 
  sublabel = 'PDF format up to 15MB required for compliance review',
  value, 
  onChange,
  required = false 
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null); // { name, size }
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid format: Only official PDF documents are accepted for statutory compliance.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File too large: Document must be under 15MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const res = await uploadPdf(file);
      if (res.success && res.fileUrl) {
        setMeta({
          name: res.fileName || file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
        onChange(res.fileUrl);
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Could not upload PDF document');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setMeta(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#1e3827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label} {required && <span style={{ color: '#b91c1c' }}>*</span>}
        </label>
        {value && (
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle2 size={13} /> Verified PDF
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: isDragOver ? '2px dashed #059669' : '2px dashed #cbd5e1',
            borderRadius: '12px',
            backgroundColor: isDragOver ? '#f0fdf4' : '#fafcf9',
            padding: '16px 20px',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={24} className="animate-spin" color="#059669" />
              <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#1e3827' }}>
                Digitally hashing & uploading compliance PDF...
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e2f4e8', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UploadCloud size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3827', display: 'block' }}>
                  Click to Browse or Drag & Drop PDF
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {sublabel}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Uploaded Document Card */
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            border: '1.5px solid #a7f3d0',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '10px' }}>
              PDF
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3827', display: 'block' }}>
                {meta?.name || 'Compliance_Certificate.pdf'}
              </span>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                {meta?.size ? `${meta.size} • ` : ''}Digitally Attached & Stamped
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '9999px', backgroundColor: '#ecfdf5', color: '#065f46', fontSize: '11.5px', fontWeight: '700', textDecoration: 'none', border: '1px solid #a7f3d0' }}
            >
              <Eye size={13} /> View PDF
            </a>
            <button
              type="button"
              onClick={handleRemove}
              title="Remove and re-upload"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}
    </div>
  );
}
