import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Medications from './components/Medications';
import Chatbot from './components/Chatbot';
import Games from './components/Games';
import Login from './components/Login';
import Register from './components/Register';
import BreathingExercise from './components/BreathingExercise';
import Settings from './components/Settings';
import CursorFollower from './components/CursorFollower';
import HoverToVoice from './components/HoverToVoice';
import Background3D from './components/Background3D';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

function ProtectedLayout({ token, setToken }) {
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <Navbar setToken={setToken} />
      <main>
         <Outlet />
      </main>
    </div>
  );
}

function AlertsScreen() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/emergency-contacts')
      .then(r => r.json())
      .then(d => {
        if(d.contacts) setEmails(d.contacts);
      })
      .catch(console.error);
  }, []);

  const handleSOS = async () => {
    // Trigger backend SOS to immediately dispatch emails
    try {
      await fetch('http://localhost:5000/api/trigger-sos', { method: 'POST' });
    } catch (e) { console.error('Failed to trigger backend SOS', e); }

    // Generate a harsh, synthetic distress buzzer natively via Web Audio API 
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'square'; // Very harsh buzzing tone
    oscillator.frequency.setValueAtTime(300, ctx.currentTime); // Pitch frequency
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();

    // Pulse the alarm algorithmically (on/off rhythm)
    let isBuzzing = true;
    const pulseInterval = setInterval(() => {
      isBuzzing = !isBuzzing;
      // Immediately turn volume to 1 or 0 for sharp beeps
      gainNode.gain.setValueAtTime(isBuzzing ? 1 : 0, ctx.currentTime);
    }, 150);

    // Stop exactly after 4 seconds
    setTimeout(() => {
      clearInterval(pulseInterval);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      oscillator.stop();
      ctx.close();
      alert("SOS Triggered! Emergency Contacts Notified.");
    }, 4000);
  };

  const addEmail = () => {
    if (!newEmail || !newEmail.includes('@')) return;
    if (emails.includes(newEmail)) return;
    const updated = [...emails, newEmail.trim()];
    setEmails(updated);
    setNewEmail("");
    saveToServer(updated);
  };

  const removeEmail = (em) => {
    const updated = emails.filter(e => e !== em);
    setEmails(updated);
    saveToServer(updated);
  };

  const saveToServer = async (emailList) => {
    setSaving(true);
    try {
      await fetch('http://localhost:5000/api/emergency-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList })
      });
    } catch(e) {
      console.error(e);
      alert('Failed to update emergency contacts.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', textAlign: 'center' }}>
       <h2 className="card-title" style={{ justifyContent: 'center' }}><AlertTriangle size={36}/> Active Alerts</h2>
       <p style={{color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '60px'}}>No emergency alerts right now. You are safe.</p>
       
       <motion.button 
         whileHover={{ scale: 1.05, boxShadow: '0 15px 40px rgba(255, 59, 48, 0.6)' }} 
         whileTap={{ scale: 0.95 }} 
         className="btn btn-danger" 
         style={{ 
           width: '220px', 
           height: '220px', 
           borderRadius: '50%', 
           fontSize: '3rem', 
           fontWeight: '800', 
           boxShadow: '0 10px 30px rgba(255, 59, 48, 0.4)',
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center',
           justifyContent: 'center'
         }}
         onClick={handleSOS}
       >
         SOS
       </motion.button>
       <p style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: '1.1rem' }}>Tap in case of emergency</p>

       <div style={{ marginTop: '60px', width: '100%', maxWidth: '400px', background: 'var(--surface)', padding: '24px', borderRadius: '16px' }}>
          <label style={{ display: 'block', marginBottom: '12px', textAlign: 'left', fontWeight: 'bold', fontSize: '1.2rem', color: "blue-800" }}>Emergency Contacts</label>
          <p style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Receive instant emails when SOS is triggered.</p>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {emails.map(e => (
              <li key={e} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--background)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '500' }}>{e}</span>
                <button onClick={() => removeEmail(e)} style={{ background: 'none', border: 'none', color: '#ff3b30', fontWeight: 'bold', cursor: 'pointer', padding: '4px' }}>X</button>
              </li>
            ))}
            {emails.length === 0 && <li style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>No contacts added yet.</li>}
          </ul>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="email" className="form-control" placeholder="e.g. doctor@clinic.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={saving} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={addEmail} disabled={saving} style={{ padding: '0 20px', minWidth: '90px' }}>{saving ? '...' : 'Add'}</motion.button>
          </div>
       </div>
    </motion.div>
  );
}

function AnimatedRoutes({ token, setToken }) {
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register setToken={setToken} />} />
        
        <Route element={<ProtectedLayout token={token} setToken={setToken} />}>
          <Route path="/" element={
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <header className="header">
                <motion.h1 className="boldonse-regular" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>{t('CareAssistant')}</motion.h1>
                <motion.p className="boldonse-regular" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>{t('Your daily companion for a healthy and safe life.')}</motion.p>
              </header>
              <Dashboard />
            </motion.div>
          } />
          <Route path="/medications" element={<Medications />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/games" element={<Games />} />
          <Route path="/alerts" element={<AlertsScreen />} />
          <Route path="/breathe" element={<BreathingExercise />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Background3D isAuth={!!token} />
        <CursorFollower />
        <HoverToVoice />
        <AnimatedRoutes token={token} setToken={setToken} />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
