import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  LeftSidebar 
} from './components/LeftSidebar';
import { 
  RobotStatusCard 
} from './components/RobotStatusCard';
import { 
  TopViewMinimap 
} from './components/TopViewMinimap';
import { 
  NavigationControlsCard 
} from './components/NavigationControlsCard';
import { 
  CameraViewCard 
} from './components/CameraViewCard';
import { 
  VoiceAssistant 
} from './components/VoiceAssistant';
import { 
  ThreeSimulationCanvas 
} from './components/ThreeSimulationCanvas';
import { 
  DestinationSelector 
} from './components/DestinationSelector';
import { 
  WelcomeModal 
} from './components/WelcomeModal';
import { CommandBar } from './components/CommandBar';
import { useSimulation } from './hooks/useSimulation';
import { speechOutput } from './voice/speechOutput';
import { speechInput } from './voice/speechInput';
import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS } from './voice/languages';
import { simulationController } from './simulation/simulationController';
import { X, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import './App.css';

export function App() {
  const {
    status,
    currentDestination,
    robotPosition,
    activeRoute,
    progressPercent,
    obstacles,
    isObstacleDetected,
    speed,
    stats,
    selectDestination,
    startNavigation,
    pauseNavigation,
    resumeNavigation,
    stopNavigation,
    resetSimulation,
    addObstacle,
    removeObstacle,
    clearObstacles,
    setSpeed,
    moveForward,
    moveBackward,
    turnLeft,
    turnRight,
    executeCommand,
    getLocationDescription
  } = useSimulation();

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMuted, setIsMuted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDestinationsModal, setShowDestinationsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [cameraMode, setCameraMode] = useState('perspective');
  const [guidanceText, setGuidanceText] = useState(
    'Obstacle ahead. Recalculating route.\nTurn right and continue towards Library.'
  );

  const prevStatusRef = useRef(status);

  // Sync Voice guidance & announcements with simulation state transitions
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev === status) return;

    const destName = currentDestination?.name || 'Library';

    if (status === 'planning') {
      speechOutput.speakNavStarted(destName);
      setGuidanceText(`Calculating collision-free path towards ${destName}...`);
    } else if (status === 'avoiding_obstacle') {
      // Robot encounters obstacle: announce detection + detour direction
      const text = speechOutput.speakObstacleDetected(destName, 'right');
      setGuidanceText(text);
    } else if (status === 'moving' && prev === 'avoiding_obstacle') {
      const text = speechOutput.speakTurnGuidance('right', destName);
      setGuidanceText(text);
    } else if (status === 'arrived') {
      speechOutput.speakDestinationReached(destName);
      setGuidanceText(`Destination reached: ${destName}. Navigation completed!`);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // silent fail
      }
    } else if (status === 'no_route') {
      speechOutput.speakNoRoute();
      setGuidanceText('Path is blocked. No safe route found.');
    } else if (status === 'paused') {
      speechOutput.speakPaused();
    } else if (status === 'moving' && prev === 'paused') {
      speechOutput.speakResumed();
    }

    prevStatusRef.current = status;
  }, [status, currentDestination]);

  // Handle destination choice
  const handleSelectDestination = (destId) => {
    const dest = selectDestination(destId);
    if (dest) {
      setShowDestinationsModal(false);
      startNavigation(destId);
    }
  };

  // Handle Start (Bug 1.1 Fix: use user's selected destination, not hardcoded 'library')
  const handleStartNavigation = () => {
    const destId = currentDestination?.id || 'library';
    if (!currentDestination) {
      selectDestination(destId);
    }
    startNavigation(destId);
  };

  // Handle Stop (Bug 3.3 Fix: actually stop navigation and cancel route)
  const handleStopNavigation = () => {
    stopNavigation();
    speechOutput.speakPaused();
    setGuidanceText('Navigation stopped. Standing by.');
  };

  // Handle Reset
  const handleResetSimulation = () => {
    resetSimulation();
    speechOutput.speakSimulationReset();
    setGuidanceText('Simulation reset. Standing by for destination selection.');
  };

  // Handle Voice / Command execution across all 6 languages
  const handleVoiceCommand = (command, transcript) => {
    if (!command) return;

    switch (command.type) {
      case 'NAVIGATE_TO':
      case 'SELECT_DESTINATION': {
        const dest = selectDestination(command.destinationId);
        if (dest) {
          startNavigation(command.destinationId);
        }
        break;
      }
      case 'MOVE_FORWARD': {
        const moved = moveForward();
        if (!moved) {
          const spoken = speechOutput.speakObstacleDetected(currentDestination?.name || 'Library', 'right');
          setGuidanceText(spoken);
        }
        break;
      }
      case 'MOVE_BACKWARD': {
        moveBackward();
        break;
      }
      case 'TURN_LEFT':
        turnLeft();
        setGuidanceText('Turned left 90°.');
        break;
      case 'TURN_RIGHT':
        turnRight();
        setGuidanceText('Turned right 90°.');
        break;
      case 'SPEED_UP':
        setSpeed(Math.min(3.0, (speed || 1.0) + 0.5));
        break;
      case 'SLOW_DOWN':
        setSpeed(Math.max(0.5, (speed || 1.0) - 0.5));
        break;
      case 'START_NAVIGATION':
        handleStartNavigation();
        break;
      case 'PAUSE_NAVIGATION':
        pauseNavigation();
        break;
      case 'RESUME_NAVIGATION':
        resumeNavigation();
        break;
      case 'RESET_SIMULATION':
        handleResetSimulation();
        break;
      case 'ADD_OBSTACLE':
        addObstacle();
        break;
      case 'REMOVE_OBSTACLE':
        clearObstacles();
        break;
      default:
        break;
    }
  };

  const handleSelectLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    speechInput.setLanguage(langCode);
    speechOutput.setLanguage(langCode);

    const uiTexts = LANGUAGE_UI_TEXTS[langCode] || LANGUAGE_UI_TEXTS.en;
    if (status === 'avoiding_obstacle' && uiTexts.speech?.obstacleDetected) {
      const text = uiTexts.speech.obstacleDetected(currentDestination?.name || 'Library', 'right');
      setGuidanceText(text);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    speechOutput.setMuted(next);
  };

  // Location and metrics (Bug 3.4 Fix: do not fallback to Library when destination is null)
  const locDescription = getLocationDescription ? getLocationDescription() : 'Near Cafeteria';
  const targetWorld = currentDestination?.worldPos;
  const curWorld = robotPosition?.world || { x: -5, z: 5.5 };
  const distMeters = targetWorld
    ? Math.max(0, Math.round(Math.hypot(targetWorld.x - curWorld.x, targetWorld.z - curWorld.z) * 1.5))
    : 0;
  const distanceLeft = currentDestination ? `${distMeters} m` : '0 m';
  const speedStr = (status === 'moving' || status === 'avoiding_obstacle')
    ? `${(speed * 0.8).toFixed(1)} m/s`
    : '0.0 m/s';

  return (
    <div className="hud-fullscreen-wrapper">
      {/* 1. Underlying Fullscreen 3D Campus Simulation */}
      <div className="simulation-background-viewport">
        <ThreeSimulationCanvas 
          status={status}
          currentDestination={currentDestination}
          robotPosition={robotPosition}
          obstacles={obstacles}
          activeRoute={activeRoute}
          cameraMode={cameraMode}
          onAddObstacleAtClick={(pos) => addObstacle(pos)}
          onRemoveObstacle={(id) => removeObstacle(id)}
        />
      </div>

      {/* 2. Floating Glassmorphic HUD Card Layer Matching Reference Image Layout */}
      <div className="hud-overlay-container">
        {/* Top-Left: Brand Card + Vertical Navigation Menu */}
        <div className="hud-top-left-anchor">
          <LeftSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'map') setCameraMode('perspective');
              if (tab === 'destinations') setShowDestinationsModal(true);
              if (tab === 'start') handleStartNavigation();
              if (tab === 'simulation') setCameraMode(prev => prev === 'follow' ? 'perspective' : 'follow');
              if (tab === 'camera') setCameraMode(prev => prev === 'pov' ? 'perspective' : 'pov');
              if (tab === 'voice') speechOutput.speak(guidanceText, true);
              if (tab === 'settings') setShowWelcome(true);
            }}
            onOpenDestinations={() => setShowDestinationsModal(true)}
            onStartNavigation={handleStartNavigation}
            onToggleVoice={() => speechOutput.speak(guidanceText, true)}
          />
        </div>

        {/* Top-Center: Floating Command Bar (Text & Voice Commands) */}
        <div className="hud-top-center-anchor">
          <CommandBar
            onExecuteCommand={(text) => {
              const parsed = speechInput.parseCommand(text);
              handleVoiceCommand(parsed, text);
            }}
            currentLanguage={currentLanguage}
            isListening={false}
            onToggleVoice={() => speechOutput.speak(guidanceText, true)}
          />
        </div>

        {/* Top-Right: Robot Status Card with Language Selector Dropdown */}
        <div className="hud-top-right-anchor">
          <RobotStatusCard
            status={status}
            currentDestination={currentDestination}
            locationDescription={locDescription}
            distanceLeft={distanceLeft}
            speed={speedStr}
            currentLanguage={currentLanguage}
            onSelectLanguage={handleSelectLanguage}
          />
        </div>

        {/* Bottom-Left: Campus Map (Top View) with dynamic route & obstacle */}
        <div className="hud-bottom-left-anchor">
          <TopViewMinimap
            robotPosition={robotPosition}
            currentDestination={currentDestination}
            obstacles={obstacles}
            activeRoute={activeRoute}
            status={status}
          />
        </div>

        {/* Bottom-Center: Navigation Controls (Start, Pause, Stop, Reset) */}
        <div className="hud-bottom-center-anchor">
          <NavigationControlsCard
            status={status}
            hasDestination={Boolean(currentDestination)}
            onStart={handleStartNavigation}
            onPause={pauseNavigation}
            onResume={resumeNavigation}
            onStop={handleStopNavigation}
            onReset={handleResetSimulation}
            cameraMode={cameraMode}
            onSetCameraMode={setCameraMode}
            speed={speed}
            onSetSpeed={setSpeed}
          />
        </div>

        {/* Bottom-Right: Camera View (Object Detection) & Voice Assistant Stack */}
        <div className="hud-bottom-right-anchor">
          <CameraViewCard
            isObstacleDetected={isObstacleDetected || status === 'avoiding_obstacle'}
            currentDestination={currentDestination}
          />

          <VoiceAssistant
            guidanceText={guidanceText}
            currentLanguage={currentLanguage}
            status={status}
            currentDestination={currentDestination}
            onCommandRecognized={handleVoiceCommand}
          />
        </div>
      </div>

      {/* Select Destination Modal (Opened when clicking 'Select Destination' in menu) */}
      {showDestinationsModal && (
        <div className="destination-modal-overlay" onClick={() => setShowDestinationsModal(false)}>
          <div className="destination-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 className="font-bold text-base text-white">Select Navigation Destination</h3>
              <button 
                type="button" 
                className="hud-mini-btn"
                onClick={() => setShowDestinationsModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <DestinationSelector
              currentDestination={currentDestination}
              onSelect={handleSelectDestination}
              disabled={status === 'moving' || status === 'avoiding_obstacle'}
              currentLanguage={currentLanguage}
            />
          </div>
        </div>
      )}

      {/* Welcome / Help Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
}

export default App;
