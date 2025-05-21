import React, { useState } from 'react';
import { LevelProgress } from '../lib/types';

interface LevelProgressBarProps {
  progress: LevelProgress;
  onLevelUp?: () => void;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ progress, onLevelUp }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Déclencher l'animation de montée en niveau
  const triggerLevelUpAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
      if (onLevelUp) onLevelUp();
    }, 3000); // Animation de 3 secondes
  };

  return (
    <div className="level-progress-container">
      {showAnimation && (
        <div className="level-up-animation">
          <div className="level-up-text">NIVEAU {progress.currentLevel}!</div>
          <div className="level-up-title">{progress.title}</div>
        </div>
      )}
      
      <div className="level-info">
        <div className="level-badge">
          <span className="level-number">{progress.currentLevel}</span>
        </div>
        <div className="level-details">
          <h3 className="level-title">{progress.title}</h3>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progress.progressPercentage}%` }}
            ></div>
          </div>
          <div className="exp-text">
            {Math.round(progress.currentExp)} / {progress.nextLevelExp} XP
          </div>
        </div>
      </div>
      
      {/* Bouton de test pour déclencher l'animation */}
      <button 
        className="test-level-up-btn"
        onClick={triggerLevelUpAnimation}
      >
        Tester l'animation de montée en niveau
      </button>
    </div>
  );
};

export default LevelProgressBar;
