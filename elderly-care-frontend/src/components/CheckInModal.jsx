import React, { useState, useEffect } from 'react';
import { Sunrise, PhoneCall } from 'lucide-react';

function CheckInModal({ onCheckIn }) {
  const [countdown, setCountdown] = useState(60); 

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onCheckIn('missed');
    }
  }, [countdown, onCheckIn]);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="checkin-modal" style={{ maxWidth: '500px', width: '100%', borderRadius: '32px' }}>
        
        <div className="checkin-icon">
           <Sunrise size={60} />
        </div>

        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '8px' }}>Good Morning!</h2>
        <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
          Are you feeling okay today?
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button 
            className="btn btn-success"
            onClick={() => onCheckIn('safe')}
            style={{ minHeight: '80px', fontSize: '1.6rem', padding: '0 24px' }}
          >
            Yes, I'm doing great!
          </button>
          
          <button 
             className="btn btn-danger"
             onClick={() => onCheckIn('missed')}
             style={{ minHeight: '80px', fontSize: '1.6rem', padding: '0 24px', background: '#FF3B30', color: 'white' }}
          >
             <PhoneCall size={28} /> I need help (SOS)
          </button>
        </div>

        <p style={{ marginTop: '32px', fontSize: '1.2rem', color: 'var(--danger)', fontWeight: 600 }}>
          Auto-alerting caregiver in {countdown}s...
        </p>
      </div>
    </div>
  );
}

export default CheckInModal;
