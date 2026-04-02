import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

function AlertsScreen() {
  const [emails, setEmails] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/emergency-contacts')
      .then((r) => r.json())
      .then((d) => {
        if (d.contacts) setEmails(d.contacts.join(', '));
      })
      .catch(console.error);
  }, []);

  const handleSOS = async () => {
    try {
      await fetch('http://localhost:5000/api/trigger-sos', {
        method: 'POST',
      });
    } catch (e) {
      console.error('Failed to trigger backend SOS', e);
    }

    // 🔊 Alarm Sound
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();

    let isBuzzing = true;
    const pulseInterval = setInterval(() => {
      isBuzzing = !isBuzzing;
      gainNode.gain.setValueAtTime(isBuzzing ? 1 : 0, ctx.currentTime);
    }, 150);

    setTimeout(() => {
      clearInterval(pulseInterval);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      oscillator.stop();
      ctx.close();
      alert('SOS Triggered! Emergency Contacts Notified.');
    }, 4000);
  };

  const saveContacts = async () => {
    setSaving(true);
    const emailList = emails.split(',').map((e) => e.trim()).filter((e) => e);

    try {
      await fetch('http://localhost:5000/api/emergency-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList }),
      });
      alert('Contacts saved!');
    } catch (e) {
      console.error(e);
      alert('Failed to save contacts.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="card alerts-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>
        <AlertTriangle size={36} />
        Active Alerts
      </h2>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-danger sos-button"
        onClick={handleSOS}
      >
        SOS
      </motion.button>

      <div className="contacts-section">
        <input
          type="text"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="Enter emergency emails (comma separated)"
          className="contacts-input"
        />
        <button
          onClick={saveContacts}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving...' : 'Save Contacts'}
        </button>
      </div>
    </motion.div>
  );
}

export default AlertsScreen;