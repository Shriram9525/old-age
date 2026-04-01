import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Flame, ShieldCheck, HeartPulse, Smile, Meh, Frown } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);

  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
         setStats(data);
         // Check if already logged today
         const today = new Date().toISOString().split('T')[0];
         const todayLog = data.moodLogs.find(l => l.date === today);
         if (todayLog) {
            setHasLoggedToday(true);
            setSelectedMood(todayLog.mood);
            if (todayLog.note) setNote(todayLog.note);
         }
      });
  }, []);

  const handleLogMood = async () => {
    if (!selectedMood) return;
    try {
      await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'safe', mood: selectedMood, note })
      });
      // Refresh Dashboard Stats Immediately
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setStats(data);
      setHasLoggedToday(true);
    } catch(err) {
      console.error(err);
    }
  };

  if (!stats) return <p style={{ fontSize: '1.2rem', textAlign: 'center', padding: '40px' }}>Loading health data...</p>;

  const moodMap = { 'Happy': 100, 'Neutral': 50, 'Lonely': 20, 'Sad': 10, 'Stressed': 5 };
  
  const chartData = stats.moodLogs.map(log => ({
    name: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
    moodValue: moodMap[log.mood] || 50,
    mood: log.mood
  }));

  const healthScore = Math.round((stats.medicationAdherence + (stats.streak > 0 ? 100 : 50)) / 2);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants}>
      <h2 className="card-title" style={{ paddingLeft: '8px' }}>Today's Status</h2>
      <div className="dashboard-grid">
        <motion.div className="stat-card" variants={cardVariants} style={{ background: 'var(--accent)' }}>
          <Flame size={48} color="#FF9500" />
          <p className="stat-val" style={{ color: 'var(--primary)' }}>{stats.streak}</p>
          <p style={{ color: 'var(--secondary)', fontWeight: 600 }}>Days Safe</p>
        </motion.div>
        
        <motion.div className="stat-card" variants={cardVariants} style={{ background: stats.medicationAdherence < 100 ? 'var(--warning-bg)' : 'var(--success-bg)' }}>
          <ShieldCheck size={48} color={stats.medicationAdherence < 100 ? 'var(--warning)' : 'var(--success)'} />
          <p className="stat-val" style={{ color: stats.medicationAdherence < 100 ? 'var(--warning)' : 'var(--success)' }}>
            {stats.medicationAdherence}%
          </p>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Med Compliance</p>
        </motion.div>

        <motion.div className="stat-card" variants={cardVariants} style={{ gridColumn: '1 / -1', background: 'var(--surface)' }}>
           <HeartPulse size={56} color="#FF2D55" style={{ marginBottom: '16px' }} />
           <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Overall Health Score
           </p>
           <p className="stat-val" style={{ fontSize: '4.5rem', color: 'var(--primary)', margin: 0 }}>
             {healthScore}
           </p>
           <div style={{ width: '100%', maxWidth: '300px', height: '12px', background: '#E5E5EA', borderRadius: '6px', overflow: 'hidden', marginTop: '24px' }}>
              <div style={{ width: `${healthScore}%`, height: '100%', background: 'linear-gradient(90deg, #FF9500, #34C759)', borderRadius: '6px' }} />
           </div>
        </motion.div>
      </div>

    <motion.div className="card" variants={cardVariants}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', color: 'var(--text-main)' }}>Mood Trend</h3>
        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
              <XAxis dataKey="name" fontSize={14} tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                 cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 30 }}
                 content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                        <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '4px' }}>{payload[0].payload.name}</p>
                        <p style={{ fontSize: '1.1rem' }}>Mood: {payload[0].payload.mood}</p>
                      </div>
                    );
                  }
                  return null;
              }} />
              <Line type="basis" dataKey="moodValue" stroke="var(--primary)" strokeWidth={5} dot={{ r: 6, fill: 'var(--primary)', stroke: 'white', strokeWidth: 3 }} activeDot={{ r: 10 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Persistant Mood Logger Card */}
      <motion.div className="card" variants={cardVariants} style={{ background: 'rgba(255, 255, 255, 0.95)', marginTop: '32px' }}>
         <h3 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginBottom: '24px', textAlign: 'center' }}>
           {hasLoggedToday ? "Update how you are feeling today:" : "How are you feeling today?"}
         </h3>
         
         <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
            <motion.button 
               whileHover={{ scale: 1.1 }} 
               whileTap={{ scale: 0.9 }} 
               onClick={() => setSelectedMood('Happy')}
               style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                  background: selectedMood === 'Happy' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(0,0,0,0.03)',
                  border: selectedMood === 'Happy' ? '3px solid var(--success)' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
               }}
            >
               <Smile size={48} color={selectedMood === 'Happy' ? 'var(--success)' : 'var(--text-muted)'} />
            </motion.button>

            <motion.button 
               whileHover={{ scale: 1.1 }} 
               whileTap={{ scale: 0.9 }} 
               onClick={() => setSelectedMood('Neutral')}
               style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                  background: selectedMood === 'Neutral' ? 'rgba(255, 204, 0, 0.15)' : 'rgba(0,0,0,0.03)',
                  border: selectedMood === 'Neutral' ? '3px solid var(--warning)' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
               }}
            >
               <Meh size={48} color={selectedMood === 'Neutral' ? 'var(--warning)' : 'var(--text-muted)'} />
            </motion.button>

            <motion.button 
               whileHover={{ scale: 1.1 }} 
               whileTap={{ scale: 0.9 }} 
               onClick={() => setSelectedMood('Sad')}
               style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                  background: selectedMood === 'Sad' ? 'rgba(10, 132, 255, 0.15)' : 'rgba(0,0,0,0.03)',
                  border: selectedMood === 'Sad' ? '3px solid var(--secondary)' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
               }}
            >
               <Frown size={48} color={selectedMood === 'Sad' ? 'var(--secondary)' : 'var(--text-muted)'} />
            </motion.button>
         </div>

         <input 
            type="text" 
            placeholder="Add a note (optional)" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="form-control"
            style={{ marginBottom: '24px', background: 'rgba(0,0,0,0.02)' }}
         />
         
         <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={handleLogMood}
            className="btn btn-success"
            style={{ width: '100%', borderRadius: '16px', minHeight: '60px', opacity: selectedMood ? 1 : 0.5 }}
            disabled={!selectedMood}
         >
            {hasLoggedToday ? "Update Mood" : "Log Mood"}
         </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
