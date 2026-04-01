import React, { useState, useEffect } from 'react';
import { BrainCircuit, RotateCcw, Play } from 'lucide-react';
import { motion } from 'framer-motion';

function Games() {
  const [activeGame, setActiveGame] = useState(null); // 'memory' or 'sequence'

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      <h2 className="card-title"><BrainCircuit size={36} /> Mind Care Hub</h2>
      
      {!activeGame ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveGame('memory')} className="btn" style={{ minHeight: '56px', fontSize: '1.1rem', maxWidth: '350px', width: '100%' }}>
              Play Memory Match
           </motion.button>
           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveGame('sequence')} className="btn" style={{ minHeight: '56px', fontSize: '1.1rem', maxWidth: '350px', width: '100%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', color: 'white' }}>
              Play Number Recall
           </motion.button>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn" style={{ width: 'auto', marginBottom: '24px', background: 'var(--text-muted)' }} onClick={() => setActiveGame(null)}>
              ← Back to Hub
           </motion.button>
           {activeGame === 'memory' ? <MemoryGame /> : <SequenceGame />}
        </div>
      )}
    </motion.div>
  );
}

function MemoryGame() {
  const emojis = ['🌞', '🌺', '🐶', '🍎', '🦋', '🎈', '🌞', '🌺', '🐶', '🍎', '🦋', '🎈'];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setCards(emojis.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  };

  const handleFlip = (i) => {
    if (flipped.length === 2 || flipped.includes(i) || solved.includes(i)) return;
    const newFlipped = [...flipped, i];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setTimeout(() => {
        if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
          setSolved(s => [...s, ...newFlipped]);
        }
        setFlipped([]);
      }, 1000);
    }
  };

  const won = solved.length === cards.length && cards.length > 0;

  return (
    <div style={{ textAlign: 'center' }}>
       <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '16px' }}>Memory Match</h3>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
         {cards.map((card, i) => (
           <div 
             key={i} 
             onClick={() => handleFlip(i)}
             style={{
               aspectRatio: '1',
               background: (flipped.includes(i) || solved.includes(i)) ? 'var(--surface)' : 'var(--primary)',
               border: '3px solid var(--primary)',
               borderRadius: '16px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '3rem',
               cursor: 'pointer',
               boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
               transition: 'all 0.3s'
             }}
           >
             {(flipped.includes(i) || solved.includes(i)) ? card : ''}
           </div>
         ))}
       </div>
       <p style={{ marginTop: '24px', fontSize: '1.4rem' }}>Moves: <strong>{moves}</strong></p>
       {won && (
         <div className="alert-card safe" style={{ marginTop: '24px', justifyContent: 'center' }}>
           Great job! You found all matches in {moves} moves.
         </div>
       )}
       <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={initGame} className="btn btn-outline" style={{ marginTop: '24px', width: 'auto' }}><RotateCcw /> Restart Game</motion.button>
    </div>
  );
}

function SequenceGame() {
  const [sequence, setSequence] = useState('');
  const [level, setLevel] = useState(3); // Start with 3 digits
  const [phase, setPhase] = useState('start'); // start, show, input, result
  const [inputVal, setInputVal] = useState('');

  const generateSequence = (len) => {
    let s = '';
    for(let i=0; i<len; i++) s += Math.floor(Math.random() * 10);
    setSequence(s);
    setPhase('show');
    setTimeout(() => {
      setPhase('input');
      setInputVal('');
    }, 3000 + (len * 500)); // Give slightly more time for longer sequences
  };

  const handleStart = () => {
    setLevel(3);
    generateSequence(3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPhase('result');
  };

  const handleNext = () => {
    if (inputVal === sequence) {
      setLevel(l => l + 1);
      generateSequence(level + 1);
    } else {
      handleStart(); // Reset
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
       <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '8px' }}>Number Recall</h3>
       <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px' }}>Level {level - 2}</p>

       {phase === 'start' && (
         <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-success" onClick={handleStart} style={{ maxWidth: '300px' }}><Play size={28} /> Start Game</motion.button>
       )}

       {phase === 'show' && (
         <div style={{ fontSize: '5rem', fontWeight: 'bold', letterSpacing: '8px', color: 'var(--primary)', padding: '50px 0' }}>
           {sequence}
         </div>
       )}

       {phase === 'input' && (
         <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
           <input
             type="number"
             className="form-control"
             style={{ fontSize: '2rem', textAlign: 'center', letterSpacing: '4px', height: '80px' }}
             value={inputVal}
             onChange={e => setInputVal(e.target.value)}
             autoFocus
           />
           <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="btn btn-primary" style={{ marginTop: '24px' }}>Submit</motion.button>
         </form>
       )}

       {phase === 'result' && (
         <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {inputVal === sequence ? (
               <div className="alert-card safe" style={{ justifyContent: 'center' }}>Correct! Excellent memory.</div>
            ) : (
               <div className="alert-card danger" style={{ justifyContent: 'center' }}>Not quite! The number was {sequence}.</div>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn" onClick={handleNext} style={{ marginTop: '24px' }}>
               {inputVal === sequence ? 'Next Level →' : 'Try Again'}
            </motion.button>
         </div>
       )}
    </div>
  );
}

export default Games;
