import React, { useState, useEffect } from 'react';
import { supportApi } from '../services/api';
import useModalBackButton from '../hooks/useModalBackButton';
import { 
  LifeBuoy, 
  X, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function RaiseSupportTicketModal({ isOpen, onClose, userRole = 'PATIENT', userName = '' }) {
  useModalBackButton(isOpen, onClose);
  const [activeTab, setActiveTab] = useState('raise'); // 'raise' | 'history'
  const [category, setCategory] = useState('PAYOUT');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [fetchingTickets, setFetchingTickets] = useState(false);

  // Dynamic default category based on role
  useEffect(() => {
    if (userRole === 'FARMER' || userRole === 'DOCTOR') {
      setCategory('PAYOUT');
    } else {
      setCategory('CONSULTATION');
    }
  }, [userRole]);

  const loadMyTickets = async () => {
    setFetchingTickets(true);
    try {
      const res = await supportApi.getMyTickets();
      if (res.success) {
        setMyTickets(res.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load my tickets:', err);
    } finally {
      setFetchingTickets(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMyTickets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in both Subject and Detailed Description.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await supportApi.createTicket({
        category,
        subject,
        description,
        priority,
        phone
      });

      setStatusMsg({ type: 'success', text: res.message });
      setSubject('');
      setDescription('');
      loadMyTickets();
      setTimeout(() => {
        setActiveTab('history');
        setStatusMsg(null);
      }, 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to submit support ticket.' });
    } finally {
      setLoading(false);
    }
  };

  const categories = userRole === 'FARMER' ? [
    { value: 'PAYOUT', label: 'Bank Payout & Settlement Inquiry' },
    { value: 'HARVEST_BATCH', label: 'Herb Batch Verification & Lab QA' },
    { value: 'STORE_ORDER', label: 'Orders & Transport Logistics' },
    { value: 'TECHNICAL', label: 'Portal or Technical Issue' },
    { value: 'OTHER', label: 'General Super Admin Inquiry' }
  ] : userRole === 'DOCTOR' ? [
    { value: 'PAYOUT', label: 'Consultation Fee Payout & Settlement' },
    { value: 'PATIENT_CASE', label: 'Patient Appointment / Clinical Issue' },
    { value: 'COUNCIL_VERIFY', label: 'Degree & NCH Council Verification' },
    { value: 'TECHNICAL', label: 'E-Prescription Pad or Chat Issue' },
    { value: 'OTHER', label: 'Direct Desk Assistance' }
  ] : [
    { value: 'CONSULTATION', label: 'Doctor Consultation & Appointment' },
    { value: 'ORDER', label: 'Herb Delivery / BlueDart Order' },
    { value: 'PRESCRIPTION', label: 'Doctor Prescription Clarification' },
    { value: 'PAYMENT', label: 'Payment / Refund Issue' },
    { value: 'OTHER', label: 'General Help' }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 18, 0.72)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#163321',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(230, 215, 185, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#E6D7B9'
            }}>
              <LifeBuoy size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                Contact Super Admin Support Desk
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#a7f3d0' }}>
                Direct priority ticket channel for {userName || userRole}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={() => setActiveTab('raise')}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              borderBottom: activeTab === 'raise' ? '3px solid #163321' : '3px solid transparent',
              backgroundColor: activeTab === 'raise' ? '#ffffff' : 'transparent',
              color: activeTab === 'raise' ? '#163321' : '#64748b',
              cursor: 'pointer'
            }}
          >
            ✍️ Raise New Ticket
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid #163321' : '3px solid transparent',
              backgroundColor: activeTab === 'history' ? '#ffffff' : 'transparent',
              color: activeTab === 'history' ? '#163321' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            📋 My Ticket History {myTickets.length > 0 && `(${myTickets.length})`}
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {statusMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '12.5px',
              fontWeight: '600',
              backgroundColor: statusMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${statusMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: statusMsg.type === 'success' ? '#166534' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {statusMsg.text}
            </div>
          )}

          {activeTab === 'raise' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Category <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Priority Urgency
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="LOW">Low (General Query)</option>
                    <option value="MEDIUM">Medium (Standard)</option>
                    <option value="HIGH">High (Urgent Settlement/Order)</option>
                    <option value="URGENT">Critical (Immediate Assistance)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Direct Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Ticket Subject <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.g. Bank payout not received for Batch #3 or Consultation fee inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Detailed Description & Reference Details <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide all relevant details: order ID, batch number, bank UTR, patient name, or specific issue so Super Admin can resolve promptly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#163321',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  {loading ? 'Submitting Ticket...' : 'Submit to Super Admin'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Realtime status of all tickets raised by you
                </div>
                <button
                  onClick={loadMyTickets}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#059669',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} className={fetchingTickets ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              {myTickets.length === 0 ? (
                <div style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <LifeBuoy size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
                    No support tickets raised yet
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Click "Raise New Ticket" to report any issue to Super Admin.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myTickets.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            backgroundColor: '#e2e8f0',
                            color: '#1e293b',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            #{t.ticketNumber}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                            {t.category}
                          </span>
                        </div>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: t.status === 'RESOLVED' ? '#dcfce7' : t.status === 'IN_PROGRESS' ? '#fef3c7' : '#fee2e2',
                          color: t.status === 'RESOLVED' ? '#15803d' : t.status === 'IN_PROGRESS' ? '#b45309' : '#b91c1c'
                        }}>
                          {t.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b' }}>
                        {t.subject}
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        {t.description}
                      </div>

                      {/* Admin Reply */}
                      {(t.adminResponse || t.adminReply) && (
                        <div style={{
                          marginTop: '6px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          fontSize: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#166534', marginBottom: '2px' }}>
                            <ShieldCheck size={14} /> Official Super Admin Response:
                          </div>
                          <div style={{ color: '#14532d', lineHeight: 1.4 }}>
                            {t.adminResponse || t.adminReply}
                          </div>
                          {t.repliedAt && (
                            <div style={{ fontSize: '10px', color: '#15803d', marginTop: '4px' }}>
                              Replied on {new Date(t.repliedAt).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ fontSize: '10.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> Created on {new Date(t.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
