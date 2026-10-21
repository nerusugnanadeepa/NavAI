import React from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

export function NavigationControlsCard({
  status,
  hasDestination,
  onStart,
  onPause,
  onResume,
  onReset,
  disabled
}) {
  const isMoving = status === 'moving' || status === 'avoiding_obstacle';
  const isPaused = status === 'paused';

  return (
    <div className="hud-card nav-controls-card">
      <div className="hud-card-header">
        <span className="hud-card-title">Navigation Controls</span>
      </div>

      <div className="nav-controls-circle-row">
        {/* Start Button (Green) */}
        <div className="nav-btn-col">
          <button
            type="button"
            className="circle-control-btn btn-circle-start"
            onClick={isPaused ? onResume : onStart}
            disabled={disabled || (isMoving && !isPaused)}
            title="Start / Resume Autonomous Navigation"
          >
            <Play size={20} fill="currentColor" />
          </button>
          <span className="nav-btn-label">Start</span>
        </div>

        {/* Pause Button (Slate/Dark) */}
        <div className="nav-btn-col">
          <button
            type="button"
            className="circle-control-btn btn-circle-pause"
            onClick={onPause}
            disabled={!isMoving}
            title="Pause Autonomous Navigation"
          >
            <Pause size={20} fill="currentColor" />
          </button>
          <span className="nav-btn-label">Pause</span>
        </div>

        {/* Stop Button (Red) */}
        <div className="nav-btn-col">
          <button
            type="button"
            className="circle-control-btn btn-circle-stop"
            onClick={onPause}
            disabled={!isMoving && !isPaused}
            title="Emergency Stop"
          >
            <Square size={18} fill="currentColor" />
          </button>
          <span className="nav-btn-label">Stop</span>
        </div>

        {/* Reset Button (Blue) */}
        <div className="nav-btn-col">
          <button
            type="button"
            className="circle-control-btn btn-circle-reset"
            onClick={onReset}
            title="Reset Simulation to Initial Dock"
          >
            <RotateCcw size={19} />
          </button>
          <span className="nav-btn-label">Reset</span>
        </div>
      </div>
    </div>
  );
}

export default NavigationControlsCard;
