import React, { useEffect, useState } from 'react';
import { Pill, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Medications() {
  const [meds, setMeds] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');

  const fetchMeds = () => {
    fetch('/api/medications')
      .then(res => res.json())
      .then(data => setMeds(data));
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleTake = async (id) => {
    await fetch(`/api/medications/${id}/take`, { method: 'POST' });
    fetchMeds();
  };

  const handleMiss = async (id) => {
    await fetch(`/api/medications/${id}/miss`, { method: 'POST' });
    fetchMeds();
  };

  const addMed = async (e) => {
    e.preventDefault();
    if (!newMedName || !newMedTime) return;
    await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMedName, time: newMedTime })
    });
    setNewMedName('');
    setNewMedTime('');
    fetchMeds();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="card-title" style={{ paddingLeft: '8px' }}>Today's Schedule</h2>
      
      <div style={{ marginBottom: '40px' }}>
        {meds.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <Pill size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No medications tracked yet.</p>
          </div>
        )}

        <AnimatePresence>
        {meds.map((med, index) => (
          <motion.div 
            key={med.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
            className={`med-card ${med.takenToday ? 'status-taken' : med.missedToday ? 'status-missed' : ''}`}
            whileHover={{ y: -4, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
          >
            
            <div className="med-info-group">
               <div className="med-icon-box">
                  <Pill size={32} />
               </div>
               <div className="med-details">
                  <h3>{med.name}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> {med.time}
                  </p>
               </div>
            </div>

            {med.takenToday ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 700, fontSize: '1.2rem' }}>
                    <CheckCircle2 size={28} /> Taken
                 </div>
              </div>
            ) : med.missedToday ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 700, fontSize: '1.2rem' }}>
                    <XCircle size={28} /> Missed
                 </div>
              </div>
            ) : (
              <div className="med-actions">
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleTake(med.id)} 
                  className="btn btn-success" 
                  style={{ minHeight: '50px', padding: '0 24px', fontSize: '1.1rem', borderRadius: '12px', width: 'auto' }}
                >
                  Mark Taken
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => handleMiss(med.id)} 
                  className="btn btn-danger" 
                  style={{ minHeight: '50px', padding: '0 24px', fontSize: '1.1rem', borderRadius: '12px', width: 'auto', background: 'var(--danger-bg)', color: 'var(--danger)' }}
                >
                  <XCircle size={20} /> Miss
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
        </AnimatePresence>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>+ Add New Medicine</h3>
        <form onSubmit={addMed}>
          <input 
            type="text" 
            placeholder="Medicine Name (e.g. Aspirin)" 
            className="form-control"
            value={newMedName}
            onChange={(e) => setNewMedName(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <input 
              type="time" 
              className="form-control"
              value={newMedTime}
              onChange={(e) => setNewMedTime(e.target.value)}
              style={{ flex: 1 }}
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="btn" style={{ flex: 1 }}>Save</motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default Medications;
