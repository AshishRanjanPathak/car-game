import { useAuth } from '../hooks/useAuth';

export const UserProfile = ({ onShowLeaderboard }) => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user || !profile) return null;

  return (
    <div className="user-profile">
      <div className="profile-info">
        <h3>👋 {profile.username}</h3>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total Coins:</span>
            <span className="stat-value">{profile.total_coins}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Best Time:</span>
            <span className="stat-value">{formatTime(profile.best_time)}</span>
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        <button onClick={onShowLeaderboard} className="leaderboard-button">
          🏆 Leaderboard
        </button>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </div>
    </div>
  );
};