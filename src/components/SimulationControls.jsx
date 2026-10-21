import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  Trash2, 
  SlidersHorizontal,
  FastForward
} from 'lucide-react';

export function SimulationControls({
  status,
  hasDestination,
  onStart,
  onPause,
  onResume,
  onReset,
  onAddObstacle,
  onClearObstacles,
  speed,
  onSetSpeed,
  obstacleCount
}) {
  const isMoving = status === 'moving' || status === 'avoiding_obstacle';
  const isPaused = status === 'paused';
  const isArrived = status === 'arrived';

  return (
    <div className="glass-panel">
      <div className="card-header">
        <h2 className="card-title">
          <SlidersHorizontal size={18} className="card-title-icon" />
          Navigation Controls
        </h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((val) => (
            <button
              key={val}
              type="button"
              className={`hud-btn ${speed === val ? 'active' : ''}`}
              onClick={() => onSetSpeed(val)}
              title={`${val}x Simulation Speed`}
            >
              {val}x
            </button>
          ))}
        </div>
      </div>

      <div className="card-body">
        <div className="controls-cluster">
          {/* Primary Action Button (Start / Resume / Pause) */}
          <div className="primary-action-row">
            {!isMoving && !isPaused ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onStart}
                disabled={!hasDestination || isArrived}
              >
                <Play size={18} />
                <span>Start Navigation</span>
              </button>
            ) : isPaused ? (
              <button
                type="button"
                className="btn btn-cyan"
                onClick={onResume}
              >
                <Play size={18} />
                <span>Resume Route</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-amber"
                onClick={onPause}
              >
                <Pause size={18} />
                <span>Pause Navigation</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline"
              onClick={onReset}
              title="Reset robot position and clear route"
            >
              <RotateCcw size={16} />
              <span>Reset Dock</span>
            </button>
          </div>

          {/* Obstacle Controls */}
          <div className="obstacle-row">
            <button
              type="button"
              className="btn btn-amber"
              onClick={onAddObstacle}
              title="Spawn simulated obstacle on or near active route"
            >
              <AlertTriangle size={16} />
              <span>+ Add Obstacle</span>
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={onClearObstacles}
              disabled={obstacleCount === 0}
              title="Clear all simulated obstacles"
            >
              <Trash2 size={16} />
              <span>Clear ({obstacleCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationControls;
