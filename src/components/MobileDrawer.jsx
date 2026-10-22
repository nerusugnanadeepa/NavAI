import React from 'react';
import { 
  X, 
  MapPin, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Video, 
  Compass, 
  Eye, 
  LayoutGrid, 
  ShieldAlert, 
  Trash2, 
  PlusCircle, 
  Globe, 
  HelpCircle,
  BookOpen,
  Coffee,
  Monitor,
  Theater,
  DoorOpen
} from 'lucide-react';
import { DESTINATIONS } from '../simulation/simulationController';
import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS } from '../voice/languages';

const DEST_ICONS = {
  library: BookOpen,
  cafeteria: Coffee,
  computer_lab: Monitor,
  auditorium: Theater,
  main_gate: DoorOpen
};

export function MobileDrawer({
  isOpen,
  onClose,
  status,
  currentDestination,
  onSelectDestination,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  cameraMode,
  onSetCameraMode,
  speed,
  onSetSpeed,
  onAddObstacle,
  onClearObstacles,
  currentLanguage,
  onSelectLanguage,
  onOpenHelp
}) {
  if (!isOpen) return null;

  const isMoving = status === 'moving' || status === 'avoiding_obstacle';
  const isPaused = status === 'paused';
  const uiTexts = LANGUAGE_UI_TEXTS[currentLanguage] || LANGUAGE_UI_TEXTS.en;

  const handleSelectDest = (destId) => {
    if (onSelectDestination) {
      onSelectDestination(destId);
    }
    onClose();
  };

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <aside 
        className="mobile-drawer-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div className="flex items-center gap-3">
            <div className="brand-disc-icon" style={{ width: 36, height: 36 }}>
              <div className="disc-inner-dot" style={{ width: 10, height: 10 }} />
            </div>
            <div>
              <h2 className="mobile-drawer-title">Navi<span>AI</span></h2>
              <p className="mobile-drawer-subtitle">Vision-Based Autonomous Navigation</p>
            </div>
          </div>
          <button 
            type="button" 
            className="mobile-drawer-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="mobile-drawer-body">
          {/* Quick Driving Action Buttons */}
          <div className="mobile-drawer-section">
            <h3 className="mobile-section-heading">Quick Controls</h3>
            <div className="mobile-drawer-action-grid">
              <button
                type="button"
                className="mobile-quick-action-btn btn-action-start"
                onClick={() => {
                  if (isPaused) onResume();
                  else onStart();
                  onClose();
                }}
                disabled={isMoving && !isPaused}
              >
                <Play size={16} fill="currentColor" />
                <span>{isPaused ? 'Resume' : 'Start'}</span>
              </button>

              <button
                type="button"
                className="mobile-quick-action-btn btn-action-pause"
                onClick={() => {
                  onPause();
                  onClose();
                }}
                disabled={!isMoving}
              >
                <Pause size={16} fill="currentColor" />
                <span>Pause</span>
              </button>

              <button
                type="button"
                className="mobile-quick-action-btn btn-action-stop"
                onClick={() => {
                  onStop();
                  onClose();
                }}
                disabled={!isMoving && !isPaused}
              >
                <Square size={14} fill="currentColor" />
                <span>Stop</span>
              </button>

              <button
                type="button"
                className="mobile-quick-action-btn btn-action-reset"
                onClick={() => {
                  onReset();
                  onClose();
                }}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Destination Selector List */}
          <div className="mobile-drawer-section">
            <div className="flex items-center justify-between mb-2">
              <h3 className="mobile-section-heading mb-0">Campus Destinations</h3>
              <span className="text-[11px] text-cyan-400 font-medium">Tap to Navigate</span>
            </div>
            <div className="mobile-dest-list">
              {DESTINATIONS.map((dest) => {
                const Icon = DEST_ICONS[dest.id] || MapPin;
                const isSelected = currentDestination?.id === dest.id;
                const localizedName = uiTexts.destinationLabels?.[dest.id] || dest.name;

                return (
                  <button
                    key={dest.id}
                    type="button"
                    className={`mobile-dest-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectDest(dest.id)}
                  >
                    <div className="mobile-dest-item-left">
                      <div className="mobile-dest-icon-box" style={{ color: dest.color }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="mobile-dest-item-name">{localizedName}</div>
                        <div className="mobile-dest-item-category">{dest.category}</div>
                      </div>
                    </div>
                    <span className="mobile-dest-item-dist font-mono">{dest.estimatedDist}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera View Mode */}
          <div className="mobile-drawer-section">
            <h3 className="mobile-section-heading">3D Camera Viewpoint</h3>
            <div className="mobile-camera-grid">
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
                    className={`mobile-mode-btn ${active ? 'active' : ''}`}
                    onClick={() => onSetCameraMode(mode.id)}
                  >
                    <Icon size={14} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed & Obstacle Controls */}
          <div className="mobile-drawer-section">
            <h3 className="mobile-section-heading">Speed & Simulation</h3>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs text-slate-300">Robot Throttle:</span>
              <div className="flex items-center gap-1.5">
                {[1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`hud-mini-btn px-2.5 py-1 text-xs font-mono rounded-lg ${speed === s ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : ''}`}
                    onClick={() => onSetSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn btn-amber text-xs py-2 min-h-0 flex items-center justify-center gap-1.5 rounded-lg"
                onClick={() => {
                  onAddObstacle();
                  onClose();
                }}
              >
                <PlusCircle size={14} />
                <span>+ Add Obstacle</span>
              </button>
              <button
                type="button"
                className="btn btn-outline text-xs py-2 min-h-0 flex items-center justify-center gap-1.5 rounded-lg"
                onClick={() => {
                  onClearObstacles();
                  onClose();
                }}
              >
                <Trash2 size={14} />
                <span>Clear Obstacles</span>
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="mobile-drawer-section">
            <h3 className="mobile-section-heading">Voice & UI Language</h3>
            <div className="mobile-lang-grid">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    className={`mobile-lang-chip ${active ? 'active' : ''}`}
                    onClick={() => onSelectLanguage(lang.code)}
                  >
                    <span className="font-semibold">{lang.native}</span>
                    <span className="text-[10px] opacity-70">({lang.name})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Help & Documentation */}
          <div className="mobile-drawer-section pb-6">
            <button
              type="button"
              className="btn btn-outline w-full flex items-center justify-center gap-2 text-xs py-2.5 rounded-xl"
              onClick={() => {
                onClose();
                onOpenHelp();
              }}
            >
              <HelpCircle size={15} />
              <span>How NaviAI Works (Help & Guide)</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default MobileDrawer;
