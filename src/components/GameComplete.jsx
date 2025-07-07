import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const GameComplete = ({ 
  isOpen, 
  onClose, 
  coinsCollected, 
  timeElapsed, 
  onRestart 
}) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user, saveGameSession } = useAuth();

  useEffect(() => {
    if (isOpen && user && !saved) {
      handleSaveSession();
    }
  }, [isOpen, user, saved]);

  const handleSaveSession = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await saveGameSession(coinsCollected, timeElapsed);
    
    if (error) {
      console.error('Error saving game session:', error);
    } else {
      setSaved(true);
    }
    
    setSaving(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    setSaved(false);
    onRestart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="game-complete-overlay">
      <div className="game-complete-modal">
        <div className="game-complete-header">
          <h2>🎉 Game Complete!</h2>
        </div>

        <div className="game-complete-content">
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-icon">🪙</span>
              <span className="stat-text">Coins Collected: {coinsCollected}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⏱️</span>
              <span className="stat-text">Time: {formatTime(timeElapsed)}</span>
            </div>
          </div>

          {user && (
            <div className="save-status">
              {saving && <p>💾 Saving your progress...</p>}
              {saved && <p>✅ Progress saved!</p>}
            </div>
          )}

          {!user && (
            <div className="auth-prompt">
              <p>Sign in to save your progress and compete on the leaderboard!</p>
            </div>
          )}

          <div className="game-complete-actions">
            <button onClick={handleRestart} className="restart-button">
              🔄 Play Again
            </button>
            <button onClick={onClose} className="continue-button">
              Continue Driving
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};