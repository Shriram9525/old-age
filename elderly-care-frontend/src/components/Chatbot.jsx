import React, { useState } from 'react';
import { Sparkles, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

function Chatbot() {
  const [seed, setSeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!seed.trim()) return;

    setLoading(true);
    setResult('');
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: seed })
      });
      const data = await res.json();
      
      if (data.reply) {
        setResult(data.reply);
      } else {
        setError('Received an empty response from Cohere API.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to contact the backend API. Make sure the Node server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card" style={{ maxWidth: '800px', margin: '40px auto', minHeight: '600px', padding: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Sparkles size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <h2 className="boldonse-regular" style={{ fontSize: '2.5rem', marginBottom: '8px', color: "blue-800" }}>Paragraph Generator</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Powered by Cohere API command-r7b-12-2024</p>
      </div>

      <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Edit3 size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Enter a keyword (e.g. Health, Music...)" 
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={loading}
            style={{ fontSize: '1.2rem', padding: '16px 16px 16px 48px', width: '100%' }}
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading || !seed.trim()}
          style={{ fontSize: '1.2rem', padding: '0 32px', minWidth: '150px' }}
        >
          {loading ? 'Generating...' : 'Generate'}
        </motion.button>
      </form>

      {error && (
        <div style={{ padding: '20px', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Generated Output:</h3>
          <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </motion.div>
      )}
      
      {!result && !loading && !error && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px', padding: '40px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <p>Your Cohere generation results will appear here in raw paragraph format.</p>
        </div>
      )}
    </motion.div>
  );
}

export default Chatbot;
