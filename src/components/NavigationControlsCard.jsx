import React from 'react';
import { Play, Pause, Square, RotateCcw, Video, Compass, Eye, LayoutGrid } from 'lucide-react';

export function NavigationControlsCard({
  status,
  hasDestination,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  cameraMode = 'perspective',
  onSetCameraMode,
  speed = 1.0,
  onSetSpeed,
  disabled
}) {
  const isMoving = status === 'moving' || status === 'avoiding_obstacle';
  const isPaused = status === 'paused';

  return (
    <div className="hud-card nav-controls-card">
      <div className="hud-card-header justify-between">
        <span className="hud-card-title">Navigation Controls</span>
        {onSetSpeed && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Speed</span>
            {[1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                type="button"
                className={`hud-mini-btn text-[10px] px-1.5 py-0.5 rounded ${speed === s ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/60 font-bold' : ''}`}
                onClick={() => onSetSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
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
            onClick={onStop || onPause}
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

      {onSetCameraMode && (
        <div className="flex items-center justify-center gap-1.5 pt-2 pb-1 border-t border-slate-700/50 mt-1 flex-wrap">
          <span className="text-[10px] text-slate-400 font-mono mr-1">Camera:</span>
          {[
            { id: 'perspective', label: 'Perspective', icon: Compass },
            { id: 'follow', label: 'Follow', icon: Eye },
            { id: 'pov', label: 'Robot POV', icon: Video },
            { id: 'grid', label: 'Top View', icon: LayoutGrid }
          ].map((mode) => {
            const Icon = mode.icon;
            const active = cameraMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                  active
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(0,242,254,0.3)]'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                }`}
                onClick={() => onSetCameraMode(mode.id)}
              >
                <Icon size={11} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NavigationControlsCard;
