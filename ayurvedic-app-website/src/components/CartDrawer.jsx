import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  items = [], 
  onUpdateQty, 
  onRemoveItem, 
  onCheckout 
}) {
  if (!isOpen) return null;

  const [isOrdered, setIsOrdered] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 || items.length === 0 ? 0 : 49;
  const total = subtotal + deliveryFee;

  const handleCheckoutClick = () => {
    setIsOrdered(true);
    setTimeout(() => {
      onCheckout();
    }, 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(20, 40, 25, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#fbfdfc',
          boxShadow: '-8px 0 35px rgba(25, 55, 35, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div 
          style={{
            padding: '24px',
            borderBottom: '1px solid #e2efe6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="#5e9434" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#16311e' }}>
              Your Herbal Cart
            </h3>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#4e7e2c', backgroundColor: '#e6f3de', padding: '2px 8px', borderRadius: '9999px' }}>
              {items.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#edf5ee',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2a4430',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{ backgroundColor: '#f0f9f2', padding: '10px 24px', fontSize: '12px', color: '#3b6143' }}>
          {subtotal >= 500 ? (
            <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#457829" /> You unlocked FREE Express Farm Shipping!
            </span>
          ) : (
            <span>Add ₹{500 - subtotal} more for FREE Express Shipping</span>
          )}
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#688c71' }}>
              <ShoppingBag size={48} strokeWidth={1.2} style={{ margin: '0 auto 14px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#25422d' }}>Your cart is empty</div>
              <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Explore authentic raw herbs & personalized monthly kits.</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '14px',
                  border: '1px solid #e5f0e9',
                  display: 'flex',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1b3823' }}>
                      {item.name}
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#8ca692', cursor: 'pointer', padding: '2px' }}
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#16311e' }}>
                      ₹{item.price * item.quantity}
                    </div>

                    {/* Quantity Selector */}
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#edf5ee',
                        borderRadius: '9999px',
                        padding: '3px 8px'
                      }}
                    >
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', color: '#2b4733', cursor: 'pointer', display: 'flex' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1b3823', minWidth: '14px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', color: '#2b4733', cursor: 'pointer', display: 'flex' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary Footer */}
        {items.length > 0 && (
          <div 
            style={{
              padding: '24px',
              borderTop: '1px solid #e2efe6',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#567560', marginBottom: '8px' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600', color: '#183421' }}>₹{subtotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#567560', marginBottom: '14px' }}>
              <span>Delivery Fee:</span>
              <span style={{ fontWeight: '600', color: deliveryFee === 0 ? '#4e7e2c' : '#183421' }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '700', color: '#15321d', marginBottom: '18px' }}>
              <span>Total Payable:</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={isOrdered}
              className="btn-primary-pill"
              style={{ width: '100%', padding: '13px', fontSize: '14px' }}
            >
              {isOrdered ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Order Placed! Dispatching...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Proceed to Secure Checkout <ArrowRight size={15} />
                </span>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
