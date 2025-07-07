import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { Scene } from "./Scene"; // Import the Scene component
import { useAuth } from "./hooks/useAuth";
import { AuthModal } from "./components/AuthModal";
import { UserProfile } from "./components/UserProfile";
import { Leaderboard } from "./components/Leaderboard";
import { GameComplete } from "./components/GameComplete";
import "./index.css"; // Import styles

function App() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [coinCount, setCoinCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  
  const { user, loading } = useAuth();

  useEffect(() => {
    setGameStartTime(Date.now());
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - gameStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStartTime]);

  // Check if all coins are collected
  useEffect(() => {
    if (coinCount >= 10) { // Assuming 10 total coins
      setShowGameComplete(true);
    }
  }, [coinCount]);

  const handleRestart = () => {
    setCoinCount(0);
    setElapsedTime(0);
    setGameStartTime(Date.now());
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: 'monospace'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Canvas>
        <Physics broadphase="SAP" gravity={[0, -2.8, 0]}>
          <Scene coinCount={coinCount} setCoinCount={setCoinCount} />
        </Physics>
      </Canvas>

      <div className="controls">
        <p>Coins: {coinCount}/10</p>
        <p>Time Elapsed: {elapsedTime} seconds</p>
        <p>Press W A S D to move</p>
        <p>Press K to swap camera</p>
        <p>Press R to reset</p>
        <p>Press arrows for flips</p>
      </div>

      {user ? (
        <UserProfile onShowLeaderboard={() => setShowLeaderboard(true)} />
      ) : (
        <button 
          className="auth-button"
          onClick={() => setShowAuthModal(true)}
        >
          Sign In
        </button>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <Leaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />
      
      <GameComplete
        isOpen={showGameComplete}
        onClose={() => setShowGameComplete(false)}
        coinsCollected={coinCount}
        timeElapsed={elapsedTime}
        onRestart={handleRestart}
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
