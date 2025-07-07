import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const Leaderboard = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getLeaderboard } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await getLeaderboard();
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      setLeaderboard(data || []);
    }
    
    setLoading(false);
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <h2>🏆 Leaderboard</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="leaderboard-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="leaderboard-list">
              <div className="leaderboard-item header">
                <span className="rank">Rank</span>
                <span className="username">Player</span>
                <span className="coins">Coins</span>
                <span className="time">Best Time</span>
              </div>
              
              {leaderboard.map((player, index) => (
                <div key={player.username} className="leaderboard-item">
                  <span className="rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="username">{player.username}</span>
                  <span className="coins">{player.total_coins}</span>
                  <span className="time">{formatTime(player.best_time)}</span>
                </div>
              ))}
              
              {leaderboard.length === 0 && (
                <div className="no-data">No players yet. Be the first!</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};