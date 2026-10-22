import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Compass, 
  Eye, 
  Video, 
  LayoutGrid, 
  Map, 
  Mic, 
  MicOff, 
  Volume2, 
  X, 
  Activity, 
  Sliders, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { TopViewMinimap } from './TopViewMinimap';
import { CameraViewCard } from './CameraViewCard';
import { RobotStatusCard } from './RobotStatusCard';
import { VoiceAssistant } from './VoiceAssistant';
import { CommandBar } from './CommandBar';
import { speechInput } from '../voice/speechInput';

export function MobileBottomCockpit({
  status,
  currentDestination,
  robotPosition,
  obstacles,
  activeRoute,
  isObstacleDetected,
  blockedObstacle,
  speed,
  onSetSpeed,
  cameraMode,
  onSetCameraMode,
  guidanceText,
  onSpeakGuidance,
  currentLanguage,
  onSelectLanguage,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onVoiceCommand,
  onMoveForward,
  onMoveBackward,
  onTurnLeft,
  onTurnRight,
  locationDescription,
  distanceLeft,
  speedStr
}) {
  const [activeSheetTab, setActiveSheetTab] = useState(null); // null | 'controls' | 'status' | 'map' | 'camera' | 'voice'
  const [isListening, setIsListening] = useState(false);
  const [heardText, setHeardText] = useState('');
  const isMoving = status === 'moving' || status === 'avoiding_obstacle';
  const isPaused = status === 'paused';

  const toggleTab = (tabName) => {
    setActiveSheetTab((prev) => (prev === tabName ? null : tabName));
  };

  const handleToggleMic = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isListening) {
      speechInput.stopListening();
      setIsListening(false);
    } else {
      setHeardText('Listening for command...');
      const started = speechInput.startListening(
        ({ transcript, command }) => {
          setIsListening(false);
          setHeardText(`Heard: "${transcript}"`);
          if (onVoiceCommand) {
            onVoiceCommand(command, transcript);
          }
        },
        ({ state, partial }) => {
          setIsListening(state === 'listening' || state === 'speaking' || state === 'processing');
          if (partial) {
            setHeardText(`"${partial}"`);
          }
        },
        (error) => {
          setIsListening(false);
          setHeardText(`Notice: ${error}`);
        }
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  return (
    <div className="mobile-cockpit-container">
      {/* 1. Slide-up Glassmorphic Drawer / Sheet (when a tab is tapped) */}
      {activeSheetTab && (
        <div className="mobile-sheet-overlay" onClick={() => setActiveSheetTab(null)}>
          <div 
            className="mobile-sheet-card"
            onClick={(e) => e.stopPropagation()}
            role="region"
            aria-label="Expanded Mobile Controls"
          >
            {/* Sheet Handle & Close */}
            <div className="mobile-sheet-header">
              <div className="mobile-sheet-pill-handle" />
              <div className="flex items-center justify-between w-full pt-1">
                <span className="font-bold text-sm text-cyan-300 capitalize flex items-center gap-1.5">
                  {activeSheetTab === 'controls' && <Sliders size={15} />}
                  {activeSheetTab === 'status' && <Activity size={15} />}
                  {activeSheetTab === 'map' && <Map size={15} />}
                  {activeSheetTab === 'camera' && <Video size={15} />}
                  {activeSheetTab === 'voice' && <Sparkles size={15} />}
                  {activeSheetTab === 'controls' ? 'Manual Drive & Speed' : activeSheetTab}
                </span>
                <button
                  type="button"
                  className="mobile-icon-btn"
                  onClick={() => setActiveSheetTab(null)}
                  aria-label="Close panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sheet Body Content */}
            <div className="mobile-sheet-content">
              {/* Tab 1: Manual Controls & Speed */}
              {activeSheetTab === 'controls' && (
                <div className="space-y-4">
                  {/* Speed Selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Autonomous Throttle Speed:
                    </label>
                    <div className="flex items-center gap-2">
                      {[1.0, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                            speed === s 
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                          onClick={() => onSetSpeed && onSetSpeed(s)}
                        >
                          {s.toFixed(1)}x SPEED
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Steering D-Pad */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-2">
                      Manual Teleoperation D-Pad:
                    </label>
                    <div className="mobile-dpad-container">
                      <button
                        type="button"
                        className="mobile-dpad-btn dpad-up"
                        onClick={onMoveForward}
                        title="Move Forward"
                      >
                        <ArrowUp size={20} />
                      </button>
                      <button
                        type="button"
                        className="mobile-dpad-btn dpad-left"
                        onClick={onTurnLeft}
                        title="Turn Left"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="dpad-center-hub" />
                      <button
                        type="button"
                        className="mobile-dpad-btn dpad-right"
                        onClick={onTurnRight}
                        title="Turn Right"
                      >
                        <ArrowRight size={20} />
                      </button>
                      <button
                        type="button"
                        className="mobile-dpad-btn dpad-down"
                        onClick={onMoveBackward}
                        title="Move Backward"
                      >
                        <ArrowDown size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Camera Angle Selector */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Camera Perspective:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'perspective', label: 'Perspective', icon: Compass },
                        { id: 'follow', label: 'Follow Robot', icon: Eye },
                        { id: 'pov', label: 'Onboard POV', icon: Video },
                        { id: 'grid', label: 'Top View', icon: LayoutGrid }
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const active = cameraMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                              active
                                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300'
                            }`}
                            onClick={() => onSetCameraMode(mode.id)}
                          >
                            <Icon size={14} />
                            <span>{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Robot Status Telemetry */}
              {activeSheetTab === 'status' && (
                <RobotStatusCard
                  status={status}
                  currentDestination={currentDestination}
                  locationDescription={locationDescription}
                  distanceLeft={distanceLeft}
                  speed={speedStr}
                  currentLanguage={currentLanguage}
                  onSelectLanguage={onSelectLanguage}
                />
              )}

              {/* Tab 3: Campus Minimap */}
              {activeSheetTab === 'map' && (
                <TopViewMinimap
                  robotPosition={robotPosition}
                  currentDestination={currentDestination}
                  obstacles={obstacles}
                  activeRoute={activeRoute}
                  status={status}
                  blockedObstacle={blockedObstacle}
                />
              )}

              {/* Tab 4: Camera View */}
              {activeSheetTab === 'camera' && (
                <CameraViewCard
                  isObstacleDetected={isObstacleDetected || status === 'avoiding_obstacle'}
                  currentDestination={currentDestination}
                />
              )}

              {/* Tab 5: Voice Assistant & Command Bar */}
              {activeSheetTab === 'voice' && (
                <div className="space-y-3">
                  <CommandBar
                    onExecuteCommand={(text) => {
                      if (onVoiceCommand) onVoiceCommand(text);
                    }}
                    currentLanguage={currentLanguage}
                    isListening={isListening}
                    onToggleVoice={handleToggleMic}
                  />

                  <VoiceAssistant
                    guidanceText={guidanceText}
                    currentLanguage={currentLanguage}
                    status={status}
                    currentDestination={currentDestination}
                    onCommandRecognized={onVoiceCommand}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Persistent Guidance & Speech Bar with Direct Mic Voice Control */}
      <div className="mobile-guidance-bar">
        <button
          type="button"
          className={`mobile-voice-mic-btn ${isListening ? 'listening animate-pulse' : ''}`}
          onClick={handleToggleMic}
          title={isListening ? 'Listening... tap to stop' : 'Tap to speak voice command'}
          aria-label="Voice Command Microphone"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening && <span className="mobile-mic-ping" />}
        </button>

        <div className="mobile-guidance-text-box" onClick={() => toggleTab('voice')}>
          <p className={`mobile-guidance-text truncate ${isListening ? 'text-cyan-300 font-semibold' : ''}`}>
            {heardText || guidanceText || 'Tap mic to speak voice command (e.g. "Go to Library")'}
          </p>
        </div>

        <button
          type="button"
          className="mobile-icon-btn text-cyan-400"
          onClick={onSpeakGuidance}
          title="Play voice audio"
          aria-label="Play guidance audio"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* 3. Primary Circular Action Controls (Green Start, Slate Pause, Red Stop, Blue Reset) */}
      <div className="mobile-primary-action-row">
        {/* Start / Resume */}
        <div className="mobile-circle-col">
          <button
            type="button"
            className="mobile-circle-btn btn-circle-start"
            onClick={isPaused ? onResume : onStart}
            disabled={isMoving && !isPaused}
            title={isPaused ? 'Resume Navigation' : 'Start Navigation'}
            aria-label={isPaused ? 'Resume Navigation' : 'Start Navigation'}
          >
            <Play size={20} fill="currentColor" />
          </button>
          <span className="mobile-btn-caption">{isPaused ? 'Resume' : 'Start'}</span>
        </div>

        {/* Pause */}
        <div className="mobile-circle-col">
          <button
            type="button"
            className="mobile-circle-btn btn-circle-pause"
            onClick={onPause}
            disabled={!isMoving}
            title="Pause Navigation"
            aria-label="Pause Navigation"
          >
            <Pause size={19} fill="currentColor" />
          </button>
          <span className="mobile-btn-caption">Pause</span>
        </div>

        {/* Stop */}
        <div className="mobile-circle-col">
          <button
            type="button"
            className="mobile-circle-btn btn-circle-stop"
            onClick={onStop}
            disabled={!isMoving && !isPaused}
            title="Emergency Stop"
            aria-label="Emergency Stop"
          >
            <Square size={17} fill="currentColor" />
          </button>
          <span className="mobile-btn-caption">Stop</span>
        </div>

        {/* Reset */}
        <div className="mobile-circle-col">
          <button
            type="button"
            className="mobile-circle-btn btn-circle-reset"
            onClick={onReset}
            title="Reset Simulation"
            aria-label="Reset Simulation to Initial Dock"
          >
            <RotateCcw size={18} />
          </button>
          <span className="mobile-btn-caption">Reset</span>
        </div>
      </div>

      {/* 4. Bottom Navigation Tabs Bar */}
      <nav className="mobile-nav-tabs-bar" aria-label="Mobile Navigation Views">
        <button
          type="button"
          className={`mobile-tab-btn ${activeSheetTab === 'controls' ? 'active' : ''}`}
          onClick={() => toggleTab('controls')}
        >
          <Sliders size={16} />
          <span>Drive</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeSheetTab === 'status' ? 'active' : ''}`}
          onClick={() => toggleTab('status')}
        >
          <Activity size={16} />
          <span>Status</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeSheetTab === 'map' ? 'active' : ''}`}
          onClick={() => toggleTab('map')}
        >
          <Map size={16} />
          <span>Map</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeSheetTab === 'camera' ? 'active' : ''}`}
          onClick={() => toggleTab('camera')}
        >
          <Video size={16} />
          <span>Camera</span>
        </button>

        <button
          type="button"
          className={`mobile-tab-btn ${activeSheetTab === 'voice' ? 'active' : ''}`}
          onClick={() => toggleTab('voice')}
        >
          <Sparkles size={16} />
          <span>Voice</span>
        </button>
      </nav>
    </div>
  );
}

export default MobileBottomCockpit;
