import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  Calculator,
  Eye,
  Smile,
  Wind,
  Grid3x3,
  Volume2,
  Maximize2,
  Hand,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  Activity,
  Heart,
  Battery,
  Star,
} from "lucide-react";

// ==================== CORE GAMES ====================

// 1. Memory Match Game
const MemoryMatchGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const symbols = ["🐕", "🐈", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, matched: false }));
    setCards(shuffledCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameComplete(false);
    setStartTime(Date.now());
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || cards[index].matched || flipped.includes(index))
      return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setMoves(moves + 1);

    if (newFlipped.length === 2) {
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];

      if (card1.symbol === card2.symbol) {
        setTimeout(() => {
          const newMatched = [...matched, card1.id, card2.id];
          setMatched(newMatched);
          setScore(score + 10);
          setFlipped([]);

          if (newMatched.length === cards.length) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            setGameComplete(true);
            localStorage.setItem(
              "memory_score",
              JSON.stringify({
                score: score + 10,
                moves: moves + 1,
                time: timeSpent,
                date: new Date().toISOString(),
              }),
            );
          }
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const getMemoryInsight = () => {
    if (gameComplete) {
      const avgMoves = moves;
      if (avgMoves < 16)
        return "Excellent memory! Your brain is very active! 🧠✨";
      if (avgMoves < 24)
        return "Good memory! Keep practicing to stay sharp! 👍";
      return "Regular practice will improve your memory. Keep playing! 💪";
    }
    return null;
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🧠 Memory Match Game</h2>
        <div className="game-stats">
          <div className="stat">Moves: {moves}</div>
          <div className="stat">Score: {score}</div>
        </div>
      </div>

      <div className="memory-grid">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            className={`memory-card ${flipped.includes(index) || matched.includes(card.id) ? "flipped" : ""}`}
            onClick={() => handleCardClick(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={matched.includes(card.id)}
            style={{ fontSize: "2rem", width: "80px", height: "80px" }}
          >
            {flipped.includes(index) || matched.includes(card.id)
              ? card.symbol
              : "❓"}
          </motion.button>
        ))}
      </div>

      {gameComplete && (
        <div className="game-complete">
          <h3>🎉 Congratulations!</h3>
          <p>You completed the game in {moves} moves!</p>
          <p className="insight">{getMemoryInsight()}</p>
          <button onClick={initializeGame} className="btn-secondary">
            Play Again
          </button>
        </div>
      )}

      <div className="game-instructions">
        <p>
          💡 <strong>How to play:</strong> Click on cards to reveal them. Match
          pairs of identical symbols.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> This game improves short-term
          memory and helps detect early signs of memory decline.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Large symbols, high contrast, no
          color dependency.
        </p>
      </div>
    </div>
  );
};

// 2. Reaction Time Game
const ReactionTimeGame = () => {
  const [gameState, setGameState] = useState("waiting");
  const [reactionTime, setReactionTime] = useState(null);
  const [scores, setScores] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [flash, setFlash] = useState(false);
  const timeoutRef = useRef(null);

  const startGame = () => {
    setGameState("waiting");
    setReactionTime(null);
    setFlash(false);

    const delay = Math.random() * 3000 + 1000;
    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      setStartTime(Date.now());
      setFlash(true);

      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }

      setTimeout(() => setFlash(false), 100);
    }, delay);
  };

  const handleClick = () => {
    if (gameState === "ready") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setScores([...scores, time]);
      setGameState("clicked");
      clearTimeout(timeoutRef.current);

      localStorage.setItem(
        "reaction_score",
        JSON.stringify({
          time: time,
          date: new Date().toISOString(),
        }),
      );
    } else if (gameState === "waiting") {
      alert("Wait for the flash!");
      clearTimeout(timeoutRef.current);
      startGame();
    }
  };

  const averageTime =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const getReactionQuality = (time) => {
    if (time < 250) return "Excellent! ⚡ (Very alert)";
    if (time < 400) return "Good! 👍 (Normal reaction)";
    if (time < 600) return "Average 👌 (Could be faster)";
    return "Take your time. Regular practice will improve reflexes! 💪";
  };

  const getFatigueLevel = () => {
    if (scores.length < 3) return null;
    const recent = scores.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / 3;
    if (avg > 500)
      return "⚠️ Your reactions are slower than usual. This might indicate fatigue or stress. Take a break!";
    return null;
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>⚡ Reaction Time Game</h2>
        <div className="game-stats">
          <div className="stat">Best: {Math.min(...scores, 999)}ms</div>
          <div className="stat">Average: {averageTime}ms</div>
          <div className="stat">Tests: {scores.length}</div>
        </div>
      </div>

      <motion.div
        className={`reaction-area ${gameState} ${flash ? "flash" : ""}`}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          backgroundColor:
            gameState === "ready"
              ? "#34C759"
              : gameState === "clicked"
                ? "#FF3B30"
                : "#5856D6",
          transition: "all 0.2s",
        }}
      >
        {gameState === "waiting" && (
          <div>
            <p>⏳ Wait for the flash...</p>
            <button onClick={startGame} className="btn-primary">
              Start Game
            </button>
          </div>
        )}
        {gameState === "ready" && (
          <div>
            <p>🔴 TAP NOW!</p>
            <p className="reaction-flash">⚡⚡⚡</p>
          </div>
        )}
        {gameState === "clicked" && reactionTime && (
          <div>
            <p>✅ Reaction Time: {reactionTime}ms</p>
            <p>{getReactionQuality(reactionTime)}</p>
            <button onClick={startGame} className="btn-primary">
              Try Again
            </button>
          </div>
        )}
      </motion.div>

      {getFatigueLevel() && (
        <div className="warning-message">{getFatigueLevel()}</div>
      )}

      <div className="game-instructions">
        <p>
          💡 <strong>How to play:</strong> Click "Start Game", wait for the
          screen to flash green, then tap as fast as you can!
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Measures alertness and reflexes.
          Can detect fatigue, stress, or neurological issues.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Screen flash + vibration (for
          hearing impaired), large tap area.
        </p>
      </div>
    </div>
  );
};

// 3. Math Logic Game
const MathLogicGame = () => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [useVoice, setUseVoice] = useState(false);

  useEffect(() => {
    startNewGame();
    const preferences = localStorage.getItem("accessibility_preferences");
    if (preferences) {
      const prefs = JSON.parse(preferences);
      setUseVoice(prefs.voiceEnabled || false);
    }
  }, []);

  const generateProblem = () => {
    const operations = ["+", "-", "×"];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer, question;

    if (operation === "+") {
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
    } else if (operation === "-") {
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
    } else {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
    }

    return { question, answer };
  };

  const startNewGame = () => {
    const problem = generateProblem();
    setCurrentProblem(problem);
    setUserAnswer("");
    setFeedback("");
    setScore(0);
    setQuestionCount(0);
    setCorrectCount(0);

    if (useVoice && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(problem.question);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = () => {
    if (!currentProblem) return;

    const isCorrect = parseInt(userAnswer) === currentProblem.answer;

    if (isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      setCorrectCount(correctCount + 1);
      setFeedback("✅ Correct! Great job!");

      localStorage.setItem(
        "logic_score",
        JSON.stringify({
          score: newScore,
          correct: correctCount + 1,
          total: questionCount + 1,
          date: new Date().toISOString(),
        }),
      );
    } else {
      setFeedback(`❌ Oops! The answer was ${currentProblem.answer}`);
    }

    setTimeout(() => {
      const newProblem = generateProblem();
      setCurrentProblem(newProblem);
      setUserAnswer("");
      setFeedback("");
      setQuestionCount(questionCount + 1);

      if (useVoice && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(newProblem.question);
        window.speechSynthesis.speak(utterance);
      }
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const getCognitiveInsight = () => {
    if (questionCount > 5) {
      const accuracy = (correctCount / questionCount) * 100;
      if (accuracy > 80)
        return "Excellent cognitive function! Your brain is working well! 🧠✨";
      if (accuracy > 60)
        return "Good! Keep practicing to maintain mental sharpness! 👍";
      return "Regular practice will help improve thinking speed. Don't give up! 💪";
    }
    return null;
  };

  if (!currentProblem) {
    return (
      <div className="game-wrapper">
        <div className="game-header">
          <h2>🔢 Math Logic Game</h2>
        </div>
        <button onClick={startNewGame} className="btn-primary">
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🔢 Math Logic Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">
            Accuracy:{" "}
            {questionCount > 0
              ? Math.round((correctCount / questionCount) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      <div className="math-problem">
        <div className="problem-display">
          <h3 style={{ fontSize: "2rem", textAlign: "center" }}>
            {currentProblem.question}
          </h3>
        </div>

        <input
          type="number"
          className="math-input"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your answer"
          autoFocus
          style={{ fontSize: "1.5rem", padding: "15px", textAlign: "center" }}
        />

        <button onClick={handleSubmit} className="btn-primary">
          Check Answer
        </button>

        {feedback && (
          <motion.div
            className="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: "1.2rem", marginTop: "20px" }}
          >
            {feedback}
          </motion.div>
        )}
      </div>

      {getCognitiveInsight() && (
        <div className="insight-message">{getCognitiveInsight()}</div>
      )}

      <div className="game-instructions">
        <p>
          💡 <strong>How to play:</strong> Solve simple math problems. Type your
          answer and press Enter.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Maintains thinking ability and
          detects mental slowdown.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Voice reading available for low
          vision, simple interface for cognitive ease.
        </p>
        {useVoice && (
          <p>
            🔊 <strong>Voice mode active:</strong> Questions are read aloud.
          </p>
        )}
      </div>
    </div>
  );
};

// 4. Attention / Focus Game
const AttentionGame = () => {
  const [items, setItems] = useState([]);
  const [targetItem, setTargetItem] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [round, setRound] = useState(1);
  const [difficulty, setDifficulty] = useState(1);

  const shapes = ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠", "🔶", "🔷"];
  const patterns = ["●", "▲", "■", "◆", "★", "♥"];

  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      localStorage.setItem(
        "attention_score",
        JSON.stringify({
          score: score,
          round: round,
          date: new Date().toISOString(),
        }),
      );
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score, round]);

  const initializeGame = () => {
    const usePatterns = localStorage.getItem("color_blind_mode") === "true";
    const itemsList = usePatterns ? patterns : shapes;

    const target = itemsList[Math.floor(Math.random() * itemsList.length)];
    setTargetItem(target);

    const gridSize = difficulty === 1 ? 9 : difficulty === 2 ? 16 : 25;
    const grid = [];
    const targetPosition = Math.floor(Math.random() * gridSize);

    for (let i = 0; i < gridSize; i++) {
      if (i === targetPosition) {
        grid.push(target);
      } else {
        let randomItem;
        do {
          randomItem = itemsList[Math.floor(Math.random() * itemsList.length)];
        } while (randomItem === target);
        grid.push(randomItem);
      }
    }

    setItems(grid);
    setGameActive(true);
    setTimeLeft(30);
    setRound(1);
  };

  const handleItemClick = (item, index) => {
    if (!gameActive) return;

    if (item === targetItem) {
      const pointsEarned = 10 * difficulty;
      setScore(score + pointsEarned);
      setRound(round + 1);

      if (round % 5 === 0) {
        setDifficulty(Math.min(3, difficulty + 1));
      }

      const usePatterns = localStorage.getItem("color_blind_mode") === "true";
      const itemsList = usePatterns ? patterns : shapes;
      const newTarget = itemsList[Math.floor(Math.random() * itemsList.length)];
      setTargetItem(newTarget);

      const gridSize = difficulty === 1 ? 9 : difficulty === 2 ? 16 : 25;
      const newGrid = [];
      const targetPosition = Math.floor(Math.random() * gridSize);

      for (let i = 0; i < gridSize; i++) {
        if (i === targetPosition) {
          newGrid.push(newTarget);
        } else {
          let randomItem;
          do {
            randomItem =
              itemsList[Math.floor(Math.random() * itemsList.length)];
          } while (randomItem === newTarget);
          newGrid.push(randomItem);
        }
      }

      setItems(newGrid);
    } else {
      setScore(Math.max(0, score - 2));
    }
  };

  const getConcentrationLevel = () => {
    if (round > 10) {
      return "Excellent concentration! Your focus is very strong! 🎯✨";
    }
    if (round > 5) {
      return "Good focus! Keep practicing to improve attention span! 👍";
    }
    if (timeLeft < 10 && score < 50) {
      return "⚠️ Your attention might be fading. Take a short break if needed.";
    }
    return null;
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🎯 Find the Target!</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
          <div className="stat">Time: {timeLeft}s</div>
          <div className="stat">Level: {difficulty}</div>
        </div>
      </div>

      {!gameActive && timeLeft === 0 ? (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          <p>Rounds Completed: {round}</p>
          <p className="insight">{getConcentrationLevel()}</p>
          <button onClick={initializeGame} className="btn-primary">
            Play Again
          </button>
        </div>
      ) : !gameActive ? (
        <div className="game-start">
          <p>Find the target shape as fast as you can!</p>
          <p>
            Target:{" "}
            <span className="target-emoji" style={{ fontSize: "3rem" }}>
              {targetItem}
            </span>
          </p>
          <button onClick={initializeGame} className="btn-primary">
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="target-display">
            <p>Find this shape:</p>
            <div className="target-emoji-large" style={{ fontSize: "4rem" }}>
              {targetItem}
            </div>
          </div>

          <div className={`attention-grid grid-${difficulty}`}>
            {items.map((item, index) => (
              <motion.button
                key={index}
                className="attention-item"
                onClick={() => handleItemClick(item, index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontSize:
                    difficulty === 1
                      ? "2.5rem"
                      : difficulty === 2
                        ? "2rem"
                        : "1.5rem",
                  width: "100%",
                  padding: "20px",
                }}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {getConcentrationLevel() && gameActive && (
        <div className="insight-message">{getConcentrationLevel()}</div>
      )}

      <div className="game-instructions">
        <p>
          💡 <strong>How to play:</strong> Find and click on the target shape as
          quickly as possible.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Improves concentration and detects
          cognitive fatigue.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> High contrast shapes, no color
          dependency for color-blind users.
        </p>
      </div>
    </div>
  );
};

// 5. Emotion Selection Game
const EmotionGame = () => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [stressLevel, setStressLevel] = useState(0);
  const [useVoice, setUseVoice] = useState(false);

  const emotions = [
    {
      emoji: "😊",
      name: "Happy",
      level: 0,
      message: "Wonderful! Happiness is good for your heart and mind.",
    },
    {
      emoji: "😌",
      name: "Calm",
      level: 0,
      message: "Peaceful and calm - perfect for your well-being.",
    },
    {
      emoji: "😐",
      name: "Neutral",
      level: 2,
      message: "It's okay to feel neutral. Every feeling is valid.",
    },
    {
      emoji: "😔",
      name: "Sad",
      level: 3,
      message: "It's okay to feel sad. Would you like to talk about it?",
    },
    {
      emoji: "😟",
      name: "Worried",
      level: 4,
      message: "Feeling worried? Take a deep breath. You're safe here.",
    },
    {
      emoji: "😤",
      name: "Frustrated",
      level: 4,
      message: "Frustration is normal. Let's try a breathing exercise.",
    },
    {
      emoji: "😰",
      name: "Anxious",
      level: 5,
      message: "Anxiety can be tough. Our AI companion is here to help.",
    },
  ];

  useEffect(() => {
    const preferences = localStorage.getItem("accessibility_preferences");
    if (preferences) {
      const prefs = JSON.parse(preferences);
      setUseVoice(prefs.voiceEnabled || false);
    }

    const savedHistory = localStorage.getItem("emotion_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
      calculateStressLevel(JSON.parse(savedHistory));
    }
  }, []);

  const calculateStressLevel = (historyData) => {
    if (historyData.length < 3) return;
    const recent = historyData.slice(-7);
    const avgStress =
      recent.reduce((sum, item) => sum + item.level, 0) / recent.length;
    setStressLevel(avgStress);

    if (avgStress > 3) {
      setMessage(
        "💡 I notice you've been feeling stressed lately. Would you like to try a relaxation exercise?",
      );
    }
  };

  const handleEmotionSelect = (emotion) => {
    setCurrentEmotion(emotion);
    const newHistory = [
      ...history,
      {
        emotion: emotion.name,
        level: emotion.level,
        timestamp: new Date().toISOString(),
      },
    ];
    setHistory(newHistory);
    localStorage.setItem("emotion_history", JSON.stringify(newHistory));
    setMessage(emotion.message);
    calculateStressLevel(newHistory);

    if (useVoice && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(emotion.message);
      window.speechSynthesis.speak(utterance);
    }

    localStorage.setItem(
      "emotion_score",
      JSON.stringify({
        emotion: emotion.name,
        stressLevel: emotion.level,
        date: new Date().toISOString(),
      }),
    );
  };

  const getEmotionTrend = () => {
    if (history.length < 7) return null;
    const recent = history.slice(-7);
    const positiveEmotions = recent.filter((e) =>
      ["Happy", "Calm"].includes(e.emotion),
    ).length;

    if (positiveEmotions >= 5) {
      return "You've been feeling positive lately! Keep up the good spirits! 🌟";
    } else if (positiveEmotions <= 2) {
      return "💙 Your emotional well-being matters. Our AI companion is here to support you anytime.";
    }
    return "Your emotions are varied, which is completely normal. Remember to take care of yourself! 💙";
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>😊 How are you feeling today?</h2>
        <p>Select your current emotion</p>
      </div>

      {stressLevel > 3 && (
        <div
          className="warning-message"
          style={{ backgroundColor: "#FFE5E5", color: "#FF3B30" }}
        >
          ⚠️ Your stress level is elevated. Consider taking a break or trying
          our breathing exercise.
        </div>
      )}

      <div
        className="emotion-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "15px",
        }}
      >
        {emotions.map((emotion, index) => (
          <motion.button
            key={index}
            className="emotion-button"
            onClick={() => handleEmotionSelect(emotion)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ padding: "20px", textAlign: "center" }}
          >
            <div className="emotion-emoji" style={{ fontSize: "3rem" }}>
              {emotion.emoji}
            </div>
            <div
              className="emotion-name"
              style={{ marginTop: "10px", fontWeight: "bold" }}
            >
              {emotion.name}
            </div>
          </motion.button>
        ))}
      </div>

      {message && (
        <motion.div
          className="emotion-feedback"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#E8F0FE",
            borderRadius: "12px",
          }}
        >
          <p>{message}</p>
        </motion.div>
      )}

      {getEmotionTrend() && (
        <div
          className="emotion-trend"
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#F0F0F0",
            borderRadius: "12px",
          }}
        >
          <h4>📊 Your Emotional Trend</h4>
          <p>{getEmotionTrend()}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="emotion-history" style={{ marginTop: "20px" }}>
          <h4>Recent Check-ins:</h4>
          <div className="history-list">
            {history
              .slice(-5)
              .reverse()
              .map((item, index) => (
                <div
                  key={index}
                  className="history-item"
                  style={{ padding: "5px", borderBottom: "1px solid #E5E5EA" }}
                >
                  {item.emotion} -{" "}
                  {new Date(item.timestamp).toLocaleDateString()}{" "}
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="game-instructions">
        <p>
          💡 <strong>Purpose:</strong> Regular emotion tracking helps detect
          stress, anxiety, and mood patterns over time.
        </p>
        <p>
          🤝 <strong>Remember:</strong> You can always talk to our AI chatbot if
          you need someone to listen.
        </p>
        {useVoice && (
          <p>
            🔊 <strong>Voice mode active:</strong> Responses will be read aloud.
          </p>
        )}
      </div>
    </div>
  );
};

// 6. Breathing / Relaxation Game
const BreathingGame = () => {
  const [phase, setPhase] = useState("inhale");
  const [timer, setTimer] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [stressReduction, setStressReduction] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (phase === "inhale") {
              setPhase("hold");
              if ("vibrate" in navigator) {
                navigator.vibrate(100);
              }
              return 4;
            } else if (phase === "hold") {
              setPhase("exhale");
              if ("vibrate" in navigator) {
                navigator.vibrate(100);
              }
              return 6;
            } else {
              setPhase("inhale");
              setCycles((c) => {
                const newCycles = c + 1;
                setStressReduction(Math.min(100, newCycles * 10));
                return newCycles;
              });
              if ("vibrate" in navigator) {
                navigator.vibrate(100);
              }
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase]);

  const startBreathing = () => {
    setIsActive(true);
    setPhase("inhale");
    setTimer(4);
    setCycles(0);
    setStressReduction(0);
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (cycles > 0) {
      localStorage.setItem(
        "relaxation_score",
        JSON.stringify({
          cycles: cycles,
          stressReduction: stressReduction,
          date: new Date().toISOString(),
        }),
      );
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      default:
        return "Ready";
    }
  };

  const getCircleSize = () => {
    switch (phase) {
      case "inhale":
        return 250;
      case "hold":
        return 250;
      case "exhale":
        return 100;
      default:
        return 180;
    }
  };

  const getColor = () => {
    switch (phase) {
      case "inhale":
        return "#34C759";
      case "hold":
        return "#FF9F0A";
      case "exhale":
        return "#64D2FF";
      default:
        return "#5856D6";
    }
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🌬️ Breathing Exercise</h2>
        <p>Relax and focus on your breath</p>
      </div>

      <div className="breathing-container" style={{ textAlign: "center" }}>
        {!isActive ? (
          <div className="breathing-start">
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              Take a moment to relax and focus on your breathing
            </p>
            <p style={{ marginBottom: "20px" }}>
              This exercise will help reduce stress and anxiety
            </p>
            <button onClick={startBreathing} className="btn-primary">
              Start Exercise
            </button>
          </div>
        ) : (
          <>
            <motion.div
              className="breathing-circle"
              animate={{
                width: getCircleSize(),
                height: getCircleSize(),
                scale:
                  phase === "inhale"
                    ? [1, 1.3]
                    : phase === "exhale"
                      ? [1.3, 0.8]
                      : 1,
              }}
              transition={{
                duration: phase === "inhale" ? 4 : phase === "exhale" ? 6 : 0,
                repeat: 0,
              }}
              style={{
                backgroundColor: getColor(),
                borderRadius: "50%",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  {getInstruction()}
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  {timer}
                </div>
              </div>
            </motion.div>

            <div className="breathing-stats" style={{ marginTop: "30px" }}>
              <div>Cycles Completed: {cycles}</div>
              <div>Stress Reduction: {stressReduction}%</div>
              <button
                onClick={stopBreathing}
                className="btn-secondary"
                style={{ marginTop: "15px" }}
              >
                Stop Exercise
              </button>
            </div>
          </>
        )}
      </div>

      {cycles >= 5 && (
        <div
          className="success-message"
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#E8F5E9",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          🌟 Great job! You've completed {cycles} breathing cycles. Your stress
          level has decreased significantly!
        </div>
      )}

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to do it:</strong> Follow the circle animation. Breathe
          in for 4 seconds, hold for 4 seconds, breathe out for 6 seconds.
        </p>
        <p>
          🎯 <strong>Benefits:</strong> Reduces stress, lowers blood pressure,
          improves mental clarity and emotional balance.
        </p>
        <p>
          🧘 <strong>Tip:</strong> Try to do this for 5 minutes daily for best
          results.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Visual animation + vibration
          feedback for hearing impaired, slow and gentle pace.
        </p>
      </div>
    </div>
  );
};

// ==================== SPECIAL GAMES ====================

// 7. Pattern Match Game (Color-Blind)
const PatternMatchGame = () => {
  const [patterns, setPatterns] = useState([]);
  const [targetPattern, setTargetPattern] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState("");

  const patternShapes = [
    { shape: "●●●", name: "Three Dots", pattern: "..." },
    { shape: "▲▲▲", name: "Triangles", pattern: "▲▲▲" },
    { shape: "■■■", name: "Squares", pattern: "■■■" },
    { shape: "◆◆◆", name: "Diamonds", pattern: "◆◆◆" },
    { shape: "★☆★", name: "Star Pattern", pattern: "★☆★" },
    { shape: "♥♡♥", name: "Heart Pattern", pattern: "♥♡♥" },
    { shape: "●○●", name: "Circle Pattern", pattern: "●○●" },
    { shape: "▲△▲", name: "Triangle Pattern", pattern: "▲△▲" },
  ];

  useEffect(() => {
    initializeRound();
  }, [round]);

  const initializeRound = () => {
    const target =
      patternShapes[Math.floor(Math.random() * patternShapes.length)];
    setTargetPattern(target);

    const options = [target];
    while (options.length < 4) {
      const randomShape =
        patternShapes[Math.floor(Math.random() * patternShapes.length)];
      if (!options.includes(randomShape)) {
        options.push(randomShape);
      }
    }

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    setPatterns(options);
  };

  const handlePatternSelect = (selected) => {
    if (selected.shape === targetPattern.shape) {
      const pointsEarned = 10;
      setScore(score + pointsEarned);
      setFeedback("✅ Correct! Great job!");

      localStorage.setItem(
        "pattern_score",
        JSON.stringify({
          score: score + pointsEarned,
          round: round,
          date: new Date().toISOString(),
        }),
      );

      setTimeout(() => {
        setRound(round + 1);
        setFeedback("");
      }, 1000);
    } else {
      setFeedback(`❌ The correct pattern was ${targetPattern.name}`);
      setTimeout(() => {
        setFeedback("");
      }, 1500);
    }
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🎨 Pattern Match Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          🌈 Color-Blind Friendly Mode
        </div>
      </div>

      <div className="pattern-match-container" style={{ textAlign: "center" }}>
        <div className="target-pattern" style={{ marginBottom: "30px" }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
            Match this pattern:
          </p>
          <div
            className="target-shape"
            style={{ fontSize: "3rem", fontFamily: "monospace" }}
          >
            {targetPattern?.shape}
          </div>
          <p className="shape-name" style={{ marginTop: "10px" }}>
            {targetPattern?.name}
          </p>
        </div>

        <div
          className="pattern-options"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
          }}
        >
          {patterns.map((pattern, index) => (
            <motion.button
              key={index}
              className="pattern-option"
              onClick={() => handlePatternSelect(pattern)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "20px",
                textAlign: "center",
                backgroundColor: "#F5F5F5",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  fontFamily: "monospace",
                  marginBottom: "10px",
                }}
              >
                {pattern.shape}
              </div>
              <div>{pattern.name}</div>
            </motion.button>
          ))}
        </div>

        {feedback && (
          <motion.div
            className="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "20px", fontSize: "1.2rem" }}
          >
            {feedback}
          </motion.div>
        )}
      </div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Match the pattern shown to one of the
          options below.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Tests memory without color
          confusion, fair for color-blind users.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Uses patterns and shapes instead of
          colors for complete accessibility.
        </p>
      </div>
    </div>
  );
};

// 8. Audio Memory Game (Low Vision)
const AudioMemoryGame = () => {
  const [currentItem, setCurrentItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState("listen");

  const items = [
    { name: "Dog", sound: "🐕", audio: "Woof woof!" },
    { name: "Cat", sound: "🐈", audio: "Meow meow!" },
    { name: "Bird", sound: "🐦", audio: "Chirp chirp!" },
    { name: "Cow", sound: "🐄", audio: "Moo moo!" },
    { name: "Clock", sound: "⏰", audio: "Tick tock!" },
    { name: "Bell", sound: "🔔", audio: "Ring ring!" },
    { name: "Rain", sound: "🌧️", audio: "Pitter patter!" },
    { name: "Wind", sound: "💨", audio: "Whoosh!" },
  ];

  useEffect(() => {
    startNewRound();
  }, [round]);

  const playAudio = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startNewRound = () => {
    const target = items[Math.floor(Math.random() * items.length)];
    setCurrentItem(target);

    const otherItems = items.filter((item) => item.name !== target.name);
    const randomOptions = [target];
    while (randomOptions.length < 3) {
      const randomItem =
        otherItems[Math.floor(Math.random() * otherItems.length)];
      if (!randomOptions.includes(randomItem)) {
        randomOptions.push(randomItem);
      }
    }

    for (let i = randomOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomOptions[i], randomOptions[j]] = [
        randomOptions[j],
        randomOptions[i],
      ];
    }

    setOptions(randomOptions);
    setGameMode("listen");

    setTimeout(() => {
      playAudio(`Listen carefully. ${target.audio}`);
      setIsPlaying(true);
      setTimeout(() => {
        setIsPlaying(false);
        setGameMode("recall");
        playAudio(`Now, which one did you hear?`);
      }, 3000);
    }, 500);
  };

  const handleOptionSelect = (selected) => {
    if (gameMode !== "recall") return;

    if (selected.name === currentItem.name) {
      setScore(score + 10);
      setFeedback("✅ Correct! Well remembered!");

      localStorage.setItem(
        "audio_memory_score",
        JSON.stringify({
          score: score + 10,
          round: round,
          date: new Date().toISOString(),
        }),
      );

      setTimeout(() => {
        setRound(round + 1);
        setFeedback("");
      }, 1500);
    } else {
      setFeedback(`❌ The correct answer was ${currentItem.name}`);
      setTimeout(() => {
        setFeedback("");
        playAudio(
          `The correct answer was ${currentItem.name}. Let's try again!`,
        );
        setTimeout(() => startNewRound(), 2000);
      }, 1500);
    }
  };

  const repeatAudio = () => {
    if (currentItem && gameMode === "recall") {
      playAudio(`The sound was ${currentItem.audio}. Which one was it?`);
    } else if (gameMode === "listen") {
      playAudio(currentItem.audio);
    }
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🎧 Audio Memory Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          👁️ Low Vision Friendly - Audio Based
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px" }}>
        {gameMode === "listen" && (
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "20px" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "10px" }}>🎧</div>
            <p style={{ fontSize: "1.2rem" }}>Listening to sound...</p>
            <p style={{ color: "#666" }}>
              {isPlaying ? "Playing audio..." : "Get ready!"}
            </p>
          </motion.div>
        )}

        {gameMode === "recall" && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <button
                onClick={repeatAudio}
                className="btn-secondary"
                style={{ marginRight: "10px" }}
              >
                🔁 Repeat Sound
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              {options.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleOptionSelect(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "20px",
                    fontSize: "1.2rem",
                    backgroundColor: "#F5F5F5",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "5px" }}>
                    {item.sound}
                  </div>
                  {item.name}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "20px",
              fontSize: "1.2rem",
              padding: "10px",
              backgroundColor: "#E8F0FE",
              borderRadius: "8px",
            }}
          >
            {feedback}
          </motion.div>
        )}
      </div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Listen to the sound, then select the
          correct object from the options.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Tests memory without relying on
          vision, perfect for low vision users.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Completely audio-based gameplay
          with large buttons for easy interaction.
        </p>
      </div>
    </div>
  );
};

// 9. Big Icon Tap Game (Low Vision)
const BigIconTapGame = () => {
  const [targetIcon, setTargetIcon] = useState(null);
  const [icons, setIcons] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [hits, setHits] = useState(0);

  const iconList = [
    { emoji: "🐕", name: "Dog", size: "large" },
    { emoji: "🐈", name: "Cat", size: "large" },
    { emoji: "🐭", name: "Mouse", size: "large" },
    { emoji: "🐹", name: "Hamster", size: "large" },
    { emoji: "🐰", name: "Rabbit", size: "large" },
    { emoji: "🦊", name: "Fox", size: "large" },
  ];

  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      localStorage.setItem(
        "big_tap_score",
        JSON.stringify({
          score: score,
          hits: hits,
          date: new Date().toISOString(),
        }),
      );
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score, hits]);

  const startGame = () => {
    setScore(0);
    setHits(0);
    setTimeLeft(30);
    setGameActive(true);
    nextRound();
  };

  const nextRound = () => {
    const randomIcon = iconList[Math.floor(Math.random() * iconList.length)];
    setTargetIcon(randomIcon);

    const gridIcons = [randomIcon];
    while (gridIcons.length < 4) {
      const otherIcon = iconList[Math.floor(Math.random() * iconList.length)];
      if (!gridIcons.includes(otherIcon)) {
        gridIcons.push(otherIcon);
      }
    }

    for (let i = gridIcons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gridIcons[i], gridIcons[j]] = [gridIcons[j], gridIcons[i]];
    }

    setIcons(gridIcons);
  };

  const handleIconTap = (icon) => {
    if (!gameActive) return;

    if (icon.name === targetIcon.name) {
      const pointsEarned = 10;
      setScore(score + pointsEarned);
      setHits(hits + 1);
      nextRound();

      if ("vibrate" in navigator) {
        navigator.vibrate(100);
      }
    } else {
      setScore(Math.max(0, score - 2));

      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }
    }
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🖱️ Big Icon Tap Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Hits: {hits}</div>
          <div className="stat">Time: {timeLeft}s</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          👁️ Low Vision Friendly - Extra Large Buttons
        </div>
      </div>

      {!gameActive ? (
        <div
          className="game-start"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
            Tap on the correct icon as fast as you can!
          </p>
          <p style={{ fontSize: "3rem", marginBottom: "20px" }}>🖱️</p>
          <button
            onClick={startGame}
            className="btn-primary"
            style={{ fontSize: "1.2rem", padding: "15px 30px" }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div
            className="target-display"
            style={{ textAlign: "center", marginBottom: "20px" }}
          >
            <p style={{ fontSize: "1.2rem" }}>Tap this icon:</p>
            <div style={{ fontSize: "5rem" }}>{targetIcon?.emoji}</div>
          </div>

          <div
            className="icons-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {icons.map((icon, index) => (
              <motion.button
                key={index}
                onClick={() => handleIconTap(icon)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  fontSize: "4rem",
                  padding: "40px",
                  backgroundColor: "#F5F5F5",
                  borderRadius: "20px",
                  cursor: "pointer",
                  border: "3px solid #E5E5EA",
                  transition: "all 0.2s",
                }}
              >
                {icon.emoji}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {!gameActive && timeLeft === 0 && (
        <div
          className="game-over"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          <h3>Game Over!</h3>
          <p>Final Score: {score}</p>
          <p>Correct Taps: {hits}</p>
          <button onClick={startGame} className="btn-secondary">
            Play Again
          </button>
        </div>
      )}

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Tap on the large icon that matches
          the target at the top.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Builds confidence in touchscreen
          interaction for low vision users.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Extra large buttons, high contrast,
          simple gameplay.
        </p>
      </div>
    </div>
  );
};

// 10. Visual Reaction Game (Hearing Impaired)
const VisualReactionGame = () => {
  const [gameState, setGameState] = useState("waiting");
  const [reactionTime, setReactionTime] = useState(null);
  const [scores, setScores] = useState([]);
  const [flash, setFlash] = useState(false);
  const timeoutRef = useRef(null);

  const startGame = () => {
    setGameState("waiting");
    setReactionTime(null);

    const delay = Math.random() * 3000 + 1000;
    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }, delay);
  };

  const handleTap = () => {
    if (gameState === "ready") {
      const time = Date.now() - (flash ? Date.now() - 200 : Date.now());
      setReactionTime(time);
      setScores([...scores, time]);
      setGameState("clicked");
      clearTimeout(timeoutRef.current);

      localStorage.setItem(
        "visual_reaction_score",
        JSON.stringify({
          time: time,
          date: new Date().toISOString(),
        }),
      );
    } else if (gameState === "waiting") {
      alert("Wait for the flash!");
      clearTimeout(timeoutRef.current);
      startGame();
    }
  };

  const averageTime =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>👁️ Visual Reaction Game</h2>
        <div className="game-stats">
          <div className="stat">Best: {Math.min(...scores, 999)}ms</div>
          <div className="stat">Average: {averageTime}ms</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          👂 Hearing Impaired Friendly - Visual Only
        </div>
      </div>

      <motion.div
        className={`reaction-area ${flash ? "flash" : ""}`}
        onClick={handleTap}
        animate={{
          backgroundColor:
            gameState === "ready"
              ? "#34C759"
              : gameState === "clicked"
                ? "#FF3B30"
                : "#5856D6",
          scale: flash ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.1 }}
        style={{
          padding: "80px 40px",
          borderRadius: "20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {gameState === "waiting" && (
          <div>
            <p style={{ fontSize: "1.2rem" }}>⏳ Watch for the flash...</p>
            <button
              onClick={startGame}
              className="btn-primary"
              style={{ marginTop: "20px" }}
            >
              Start Game
            </button>
          </div>
        )}
        {gameState === "ready" && (
          <div>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>🔴 TAP NOW!</p>
            <p style={{ fontSize: "1rem" }}>Quick! Tap the screen!</p>
          </div>
        )}
        {gameState === "clicked" && reactionTime && (
          <div>
            <p style={{ fontSize: "1.5rem" }}>
              ✅ Reaction Time: {reactionTime}ms
            </p>
            <button
              onClick={startGame}
              className="btn-primary"
              style={{ marginTop: "20px" }}
            >
              Try Again
            </button>
          </div>
        )}
      </motion.div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Watch for the screen flash, then tap
          as fast as you can!
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Measures reflexes without
          requiring sound, perfect for hearing impaired.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Visual-only feedback, large tap
          area, no audio dependency.
        </p>
      </div>
    </div>
  );
};

// 11. Visual Rhythm Game (Hearing Impaired)
const VisualRhythmGame = () => {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [showPattern, setShowPattern] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shapes = ["🔴", "🟢", "🔵", "🟡"];

  useEffect(() => {
    startNewRound();
  }, [round]);

  const generatePattern = () => {
    const newPattern = [];
    const patternLength = Math.min(3 + Math.floor(round / 2), 8);
    for (let i = 0; i < patternLength; i++) {
      newPattern.push(shapes[Math.floor(Math.random() * shapes.length)]);
    }
    return newPattern;
  };

  const startNewRound = () => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setUserPattern([]);
    setShowPattern(true);
    setIsPlaying(true);
    setCurrentIndex(0);

    let index = 0;
    const interval = setInterval(() => {
      setCurrentIndex(index);
      index++;
      if (index >= newPattern.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowPattern(false);
          setIsPlaying(false);
        }, 500);
      }
    }, 800);
  };

  const handleShapeClick = (shape) => {
    if (isPlaying || showPattern) return;

    const newUserPattern = [...userPattern, shape];
    setUserPattern(newUserPattern);

    if (newUserPattern.length === pattern.length) {
      const isCorrect = newUserPattern.every(
        (val, idx) => val === pattern[idx],
      );
      if (isCorrect) {
        const pointsEarned = 10 * round;
        setScore(score + pointsEarned);
        setRound(round + 1);

        localStorage.setItem(
          "rhythm_score",
          JSON.stringify({
            score: score + pointsEarned,
            round: round,
            date: new Date().toISOString(),
          }),
        );
      } else {
        alert(
          `Pattern didn't match! The correct pattern was: ${pattern.join(" ")}`,
        );
        setTimeout(() => startNewRound(), 2000);
      }
    }
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🎵 Visual Rhythm Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          👂 Hearing Impaired - Visual Rhythm
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px" }}>
        {showPattern && (
          <div style={{ marginBottom: "30px" }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              Watch the pattern:
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "15px" }}
            >
              {pattern.map((shape, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    scale: idx === currentIndex ? [1, 1.3, 1] : 1,
                    opacity: idx <= currentIndex ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: "3rem" }}
                >
                  {shape}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!showPattern && !isPlaying && (
          <>
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              Now repeat the pattern:
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {userPattern.map((shape, idx) => (
                <div key={idx} style={{ fontSize: "3rem" }}>
                  {shape}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "15px",
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              {shapes.map((shape, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleShapeClick(shape)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    fontSize: "3rem",
                    padding: "20px",
                    borderRadius: "12px",
                    backgroundColor: "#F5F5F5",
                  }}
                >
                  {shape}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Watch the pattern, then repeat it by
          tapping the shapes in order.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Tests timing and focus without
          requiring audio cues.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Visual-only rhythm tracking,
          perfect for hearing impaired users.
        </p>
      </div>
    </div>
  );
};

// 12. Single Tap Game (Motor Disabilities)
const SingleTapGame = () => {
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState("");

  const questions = [
    {
      text: "Which one is a fruit?",
      correct: "Apple",
      options: ["Apple", "Carrot", "Potato", "Broccoli"],
    },
    {
      text: "Which one is a vehicle?",
      correct: "Car",
      options: ["Car", "House", "Tree", "Book"],
    },
    {
      text: "Which one is an animal?",
      correct: "Dog",
      options: ["Dog", "Table", "Chair", "Lamp"],
    },
    {
      text: "Which one is a color?",
      correct: "Blue",
      options: ["Blue", "Apple", "Dog", "Car"],
    },
    {
      text: "Which one is for writing?",
      correct: "Pen",
      options: ["Pen", "Plate", "Cup", "Fork"],
    },
  ];

  const startNewRound = () => {
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    setQuestion(randomQuestion);
    setOptions(randomQuestion.options);
    setFeedback("");
  };

  const handleChoice = (choice) => {
    if (choice === question.correct) {
      const pointsEarned = 10;
      setScore(score + pointsEarned);
      setFeedback("✅ Correct! Great job!");

      localStorage.setItem(
        "single_tap_score",
        JSON.stringify({
          score: score + pointsEarned,
          round: round,
          date: new Date().toISOString(),
        }),
      );

      setTimeout(() => {
        setRound(round + 1);
        startNewRound();
      }, 1500);
    } else {
      setFeedback(`❌ The correct answer was ${question.correct}`);
      setTimeout(() => {
        setFeedback("");
      }, 1500);
    }
  };

  if (!question) {
    startNewRound();
    return <div>Loading...</div>;
  }

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🖐️ Single Tap Choice Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          🖐️ Motor Disability Friendly - Single Tap Only
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "30px" }}>
          {question.text}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleChoice(option)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "20px",
                fontSize: "1.2rem",
                backgroundColor: "#F5F5F5",
                borderRadius: "12px",
                cursor: "pointer",
                border: "2px solid #E5E5EA",
              }}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "20px", fontSize: "1.2rem" }}
          >
            {feedback}
          </motion.div>
        )}
      </div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Simply tap on the correct answer. No
          dragging or complex movements required.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Tests decision-making without
          requiring fine motor skills.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Large buttons, single tap only, no
          dragging or precise movements needed.
        </p>
      </div>
    </div>
  );
};

// 13. Slow Interaction Game (Motor Disabilities)
const SlowInteractionGame = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState("");

  const tasks = [
    {
      instruction: "Tap the blue button",
      correct: "blue",
      options: ["Red", "Blue", "Green", "Yellow"],
    },
    {
      instruction: "Tap the largest button",
      correct: "large",
      options: ["Small", "Large", "Medium", "Tiny"],
    },
    {
      instruction: "Tap the button that says 'Hello'",
      correct: "Hello",
      options: ["Hello", "Goodbye", "Hi", "Bye"],
    },
    {
      instruction: "Tap the circle",
      correct: "circle",
      options: ["Square", "Circle", "Triangle", "Rectangle"],
    },
    {
      instruction: "Tap the number 5",
      correct: "5",
      options: ["2", "3", "4", "5"],
    },
  ];

  const startNewRound = () => {
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    setCurrentTask(randomTask);
    setFeedback("");
  };

  const handleChoice = (choice) => {
    if (choice === currentTask.correct) {
      setScore(score + 10);
      setFeedback("✅ Well done! Take your time for the next one.");

      localStorage.setItem(
        "slow_interaction_score",
        JSON.stringify({
          score: score + 10,
          round: round,
          date: new Date().toISOString(),
        }),
      );

      setTimeout(() => {
        setRound(round + 1);
        startNewRound();
      }, 2000);
    } else {
      setFeedback(`No hurry! Try again. Remember, there's no time limit.`);
      setTimeout(() => {
        setFeedback("");
      }, 2000);
    }
  };

  if (!currentTask) {
    startNewRound();
    return <div>Loading...</div>;
  }

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🐢 Slow Interaction Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          🐢 No Time Pressure - Take Your Time
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px" }}>
        <div
          style={{
            backgroundColor: "#E8F0FE",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
          }}
        >
          <p style={{ fontSize: "1.2rem" }}>
            ⏰ No rush! Take all the time you need.
          </p>
        </div>

        <h3 style={{ fontSize: "1.5rem", marginBottom: "30px" }}>
          {currentTask.instruction}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "20px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {currentTask.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleChoice(option)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "20px",
                fontSize: "1.1rem",
                backgroundColor:
                  option === "blue"
                    ? "#007AFF"
                    : option === "large"
                      ? "#FF9500"
                      : "#F5F5F5",
                color: option === "blue" ? "white" : "black",
                borderRadius: "12px",
                cursor: "pointer",
                border: "2px solid #E5E5EA",
              }}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "20px",
              fontSize: "1.2rem",
              padding: "10px",
              backgroundColor: "#E8F5E9",
              borderRadius: "8px",
            }}
          >
            {feedback}
          </motion.div>
        )}
      </div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> There's no time limit! Take your time
          to choose the correct answer.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Reduces stress and frustration by
          removing time pressure.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Unlimited time, large buttons,
          simple instructions for motor disabilities.
        </p>
      </div>
    </div>
  );
};

// 14. Yes/No Game (Cognitive Impairment)
const YesNoGame = () => {
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [useVoice, setUseVoice] = useState(false);

  const questions = [
    {
      item: "Apple",
      category: "fruit",
      question: "Is this a fruit?",
      answer: "yes",
    },
    {
      item: "Carrot",
      category: "vegetable",
      question: "Is this a vegetable?",
      answer: "yes",
    },
    {
      item: "Dog",
      category: "animal",
      question: "Is this an animal?",
      answer: "yes",
    },
    {
      item: "Car",
      category: "vehicle",
      question: "Is this a vehicle?",
      answer: "yes",
    },
    {
      item: "Table",
      category: "furniture",
      question: "Is this furniture?",
      answer: "yes",
    },
    {
      item: "Apple",
      category: "vehicle",
      question: "Is this a vehicle?",
      answer: "no",
    },
    {
      item: "Dog",
      category: "fruit",
      question: "Is this a fruit?",
      answer: "no",
    },
    {
      item: "Car",
      category: "animal",
      question: "Is this an animal?",
      answer: "no",
    },
  ];

  useEffect(() => {
    const preferences = localStorage.getItem("accessibility_preferences");
    if (preferences) {
      const prefs = JSON.parse(preferences);
      setUseVoice(prefs.voiceEnabled || false);
    }
    startNewRound();
  }, []);

  const startNewRound = () => {
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    setQuestion(randomQuestion);
    setFeedback("");

    if (useVoice && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        `${randomQuestion.item}. ${randomQuestion.question}`,
      );
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (answer) => {
    if (answer === question.answer) {
      setScore(score + 10);
      setFeedback("✅ Correct! Good understanding!");

      localStorage.setItem(
        "yesno_score",
        JSON.stringify({
          score: score + 10,
          round: round,
          date: new Date().toISOString(),
        }),
      );

      setTimeout(() => {
        setRound(round + 1);
        startNewRound();
      }, 1500);
    } else {
      setFeedback(
        `❌ ${question.item} is ${question.answer === "yes" ? "a" : "not a"} ${question.category}. Let's try another!`,
      );
      setTimeout(() => {
        setFeedback("");
      }, 2000);
    }
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🧠 Yes/No Recognition Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          🧠 Cognitive Impairment Friendly - Simple Choices
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px" }}>
        <div
          style={{
            backgroundColor: "#F5F5F5",
            padding: "40px",
            borderRadius: "20px",
            marginBottom: "30px",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>
            {question.item}
          </div>
          <h3 style={{ fontSize: "1.8rem" }}>{question.question}</h3>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginBottom: "20px",
          }}
        >
          <motion.button
            onClick={() => handleAnswer("yes")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "20px 40px",
              fontSize: "1.5rem",
              backgroundColor: "#34C759",
              color: "white",
              borderRadius: "12px",
              cursor: "pointer",
              border: "none",
            }}
          >
            ✅ Yes
          </motion.button>

          <motion.button
            onClick={() => handleAnswer("no")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "20px 40px",
              fontSize: "1.5rem",
              backgroundColor: "#FF3B30",
              color: "white",
              borderRadius: "12px",
              cursor: "pointer",
              border: "none",
            }}
          >
            ❌ No
          </motion.button>
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: "20px", fontSize: "1.2rem" }}
          >
            {feedback}
          </motion.div>
        )}
      </div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Look at the item and answer Yes or No
          to the question.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Tests basic understanding and
          recognition skills.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Simple Yes/No choices, clear
          visuals, optional voice support.
        </p>
      </div>
    </div>
  );
};

// 15. Repeat Pattern Game (Cognitive Impairment)
const RepeatPatternGame = () => {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [isShowing, setIsShowing] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const shapes = ["🔴", "🟢", "🔵"];

  useEffect(() => {
    startNewRound();
  }, [round]);

  const generatePattern = () => {
    const length = Math.min(2 + Math.floor(round / 3), 4);
    const newPattern = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(shapes[Math.floor(Math.random() * shapes.length)]);
    }
    return newPattern;
  };

  const startNewRound = () => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    setUserPattern([]);
    setIsShowing(true);
    setCurrentIndex(0);

    let index = 0;
    const interval = setInterval(() => {
      setCurrentIndex(index);
      index++;
      if (index >= newPattern.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsShowing(false);
        }, 500);
      }
    }, 1000);
  };

  const handleShapeClick = (shape) => {
    if (isShowing) return;

    const newUserPattern = [...userPattern, shape];
    setUserPattern(newUserPattern);

    if (newUserPattern.length === pattern.length) {
      const isCorrect = newUserPattern.every(
        (val, idx) => val === pattern[idx],
      );
      if (isCorrect) {
        setScore(score + 10);

        localStorage.setItem(
          "repeat_pattern_score",
          JSON.stringify({
            score: score + 10,
            round: round,
            date: new Date().toISOString(),
          }),
        );

        setTimeout(() => {
          setRound(round + 1);
        }, 1500);
      } else {
        alert(`Try again! The pattern was: ${pattern.join(" ")}`);
        setTimeout(() => {
          startNewRound();
        }, 2000);
      }
    }
  };

  return (
    <div className="game-wrapper">
      <div className="game-header">
        <h2>🔄 Repeat Pattern Game</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Round: {round}</div>
        </div>
        <div
          className="accessibility-badge"
          style={{
            marginTop: "10px",
            display: "inline-block",
            padding: "5px 10px",
            backgroundColor: "#E8F0FE",
            borderRadius: "20px",
          }}
        >
          🧠 Memory Support - Simple Patterns
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px" }}>
        {isShowing ? (
          <div style={{ marginBottom: "30px" }}>
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              Watch the pattern:
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "15px" }}
            >
              {pattern.map((shape, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    scale: idx === currentIndex ? [1, 1.3, 1] : 1,
                    opacity: idx <= currentIndex ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: "3rem" }}
                >
                  {shape}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              Now repeat the pattern in order:
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "30px",
              }}
            >
              {userPattern.map((shape, idx) => (
                <div key={idx} style={{ fontSize: "3rem" }}>
                  {shape}
                </div>
              ))}
              {userPattern.length === 0 && (
                <div style={{ color: "#999", fontSize: "1rem" }}>
                  Tap the shapes below
                </div>
              )}
            </div>

            <div
              style={{ display: "flex", justifyContent: "center", gap: "20px" }}
            >
              {shapes.map((shape, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleShapeClick(shape)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    fontSize: "3rem",
                    padding: "20px",
                    backgroundColor: "#F5F5F5",
                    borderRadius: "12px",
                    cursor: "pointer",
                    width: "100px",
                    height: "100px",
                  }}
                >
                  {shape}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="game-instructions" style={{ marginTop: "30px" }}>
        <p>
          💡 <strong>How to play:</strong> Watch the pattern, then tap the
          shapes in the same order.
        </p>
        <p>
          🎯 <strong>Why it matters:</strong> Tests short-term memory and helps
          detect memory decline.
        </p>
        <p>
          ♿ <strong>Accessibility:</strong> Simple 2-3 step patterns, clear
          visual cues, no time pressure.
        </p>
      </div>
    </div>
  );
};

// ==================== MAIN GAMES COMPONENT ====================

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [category, setCategory] = useState("core");

  const categories = {
    core: {
      title: "🎮 Core Games",
      description: "Essential games for mental stability and stress relief",
      games: [
        {
          id: "memory",
          name: "Memory Match",
          icon: Brain,
          component: MemoryMatchGame,
          description: "Match pairs to improve memory",
          importance: "Detects early dementia",
        },
        {
          id: "reaction",
          name: "Reaction Time",
          icon: Zap,
          component: ReactionTimeGame,
          description: "Test your reflexes",
          importance: "Measures alertness",
        },
        {
          id: "math",
          name: "Math Logic",
          icon: Calculator,
          component: MathLogicGame,
          description: "Solve simple math",
          importance: "Maintains thinking",
        },
        {
          id: "attention",
          name: "Focus Game",
          icon: Eye,
          component: AttentionGame,
          description: "Find the target",
          importance: "Improves concentration",
        },
        {
          id: "emotion",
          name: "Emotion Check",
          icon: Smile,
          component: EmotionGame,
          description: "Track your mood",
          importance: "Detects stress",
        },
        {
          id: "breathing",
          name: "Breathing Relax",
          icon: Wind,
          component: BreathingGame,
          description: "Calm your mind",
          importance: "Reduces anxiety",
        },
      ],
    },
    special: {
      title: "♿ Special Accessibility Games",
      description: "Games designed for different abilities",
      games: [
        {
          id: "pattern",
          name: "Pattern Match",
          icon: Grid3x3,
          component: PatternMatchGame,
          description: "Match patterns",
          accessibility: "For color-blind users",
          importance: "No color confusion",
        },
        {
          id: "audio",
          name: "Audio Memory",
          icon: Volume2,
          component: AudioMemoryGame,
          description: "Remember sounds",
          accessibility: "For low vision",
          importance: "Tests memory without vision",
        },
        {
          id: "bigicon",
          name: "Big Icon Tap",
          icon: Maximize2,
          component: BigIconTapGame,
          description: "Tap large icons",
          accessibility: "For low vision",
          importance: "Builds confidence",
        },
        {
          id: "visual-reaction",
          name: "Visual Reaction",
          icon: Eye,
          component: VisualReactionGame,
          description: "React to flashes",
          accessibility: "For hearing impaired",
          importance: "Reflex without sound",
        },
        {
          id: "visual-rhythm",
          name: "Visual Rhythm",
          icon: Activity,
          component: VisualRhythmGame,
          description: "Follow patterns",
          accessibility: "For hearing impaired",
          importance: "Tests timing & focus",
        },
        {
          id: "singletap",
          name: "Single Tap",
          icon: Hand,
          component: SingleTapGame,
          description: "Simple choices",
          accessibility: "For motor issues",
          importance: "No precision needed",
        },
        {
          id: "slow",
          name: "Slow Interaction",
          icon: Battery,
          component: SlowInteractionGame,
          description: "No time pressure",
          accessibility: "For motor issues",
          importance: "Reduces stress",
        },
        {
          id: "yesno",
          name: "Yes/No Game",
          icon: AlertCircle,
          component: YesNoGame,
          description: "Basic recognition",
          accessibility: "For cognitive impairment",
          importance: "Tests understanding",
        },
        {
          id: "repeat",
          name: "Repeat Pattern",
          icon: TrendingUp,
          component: RepeatPatternGame,
          description: "Simple sequences",
          accessibility: "For memory support",
          importance: "Detects decline",
        },
      ],
    },
  };

  const GameComponent = selectedGame
    ? categories[category].games.find((g) => g.id === selectedGame)?.component
    : null;

  return (
    <div className="games-page">
      {!selectedGame ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <header className="games-header">
            <h2 className="boldonse-regular">🎯 Brain Training Games</h2>
            <p>Keep your mind active and sharp with our therapeutic games</p>
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "15px",
                borderRadius: "12px",
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: "1rem", color: "white" }}>
                💡 "Our system is not just a game platform, it is an adaptive
                cognitive health analyzer designed inclusively for every elderly
                individual, regardless of their physical or sensory
                limitations."
              </p>
            </div>
          </header>

          <div
            className="category-tabs"
            style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
          >
            <button
              className={`category-tab ${category === "core" ? "active" : ""}`}
              onClick={() => setCategory("core")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              🧠 Core Games (6)
            </button>
            <button
              className={`category-tab ${category === "special" ? "active" : ""}`}
              onClick={() => setCategory("special")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ♿ Special Games (9)
            </button>
          </div>

          <p className="category-description">
            {categories[category].description}
          </p>

          <div
            className="games-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {categories[category].games.map((game) => (
              <motion.div
                key={game.id}
                className="game-card"
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGame(game.id)}
                style={{
                  padding: "20px",
                  backgroundColor: "white",
                  borderRadius: "16px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  className="game-card-icon"
                  style={{ marginBottom: "15px" }}
                >
                  <game.icon size={48} color="#667eea" />
                </div>
                <h3 style={{ marginBottom: "10px" }}>{game.name}</h3>
                <p style={{ color: "#666", marginBottom: "10px" }}>
                  {game.description}
                </p>
                <p style={{ fontSize: "0.85rem", color: "#34C759" }}>
                  🎯 {game.importance}
                </p>
                {game.accessibility && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      padding: "4px 8px",
                      backgroundColor: "#E8F0FE",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                    }}
                  >
                    ♿ {game.accessibility}
                  </span>
                )}
                <button
                  className="btn-play"
                  style={{ marginTop: "15px", width: "100%" }}
                >
                  Play Now →
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="game-play-area">
          <button
            className="back-button"
            onClick={() => setSelectedGame(null)}
            style={{
              padding: "10px 20px",
              marginBottom: "20px",
              backgroundColor: "black",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ChevronLeft size={20} /> Back to Games
          </button>
          {GameComponent && <GameComponent />}
        </div>
      )}
    </div>
  );
};

export default Games;
