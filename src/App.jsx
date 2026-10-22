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
import { DestinationSelector } from './components/DestinationSelector';
import { WelcomeModal } from './components/WelcomeModal';
import { CommandBar } from './components/CommandBar';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileBottomCockpit } from './components/MobileBottomCockpit';
import { MobilePipWidget } from './components/MobilePipWidget';
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
    getLocationDescription,
    lastAction,
    blockedObstacle
  } = useSimulation();

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDestinationsModal, setShowDestinationsModal] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [cameraMode, setCameraMode] = useState('perspective');
  const [guidanceText, setGuidanceText] = useState(
    'System ready at Origin Dock.\nSelect a destination or give voice command (e.g. "Go to Library").'
  );

  const lastActionTimestampRef = useRef(0);

  // Sync Voice guidance & announcements with real-time simulation actions & movements
  useEffect(() => {
    if (!lastAction || lastAction.timestamp === lastActionTimestampRef.current) return;
    lastActionTimestampRef.current = lastAction.timestamp;

    const destName = lastAction.destinationName || currentDestination?.name || 'Library';

    switch (lastAction.type) {
      case 'nav_started': {
        const text = speechOutput.speakNavStarted(
          destName,
          lastAction.direction || 'North',
          lastAction.location || 'Campus Dock'
        );
        setGuidanceText(text);
        break;
      }
      case 'turn': {
        const text = speechOutput.speakTurnGuidance(
          lastAction.turn || 'right',
          lastAction.direction || 'North',
          lastAction.pathway || 'Campus Walkway',
          destName
        );
        setGuidanceText(text);
        break;
      }
      case 'obstacle_detected': {
        const text = speechOutput.speakObstacleDetected(
          lastAction.obstacleLabel || 'Road Barricade',
          destName,
          lastAction.detourTurn || 'right',
          lastAction.detourPathway || 'East Pathway',
          lastAction.detourDir || 'North'
        );
        setGuidanceText(text);
        break;
      }
      case 'alternate_route': {
        const text = speechOutput.speakAlternateRoute(
          lastAction.detourTurn || 'right',
          lastAction.detourPathway || 'East Pathway',
          destName,
          lastAction.detourDir || 'North'
        );
        setGuidanceText(text);
        break;
      }
      case 'manual_forward': {
        const text = speechOutput.speakManualMove('forward', lastAction.direction || 'North');
        setGuidanceText(text);
        break;
      }
      case 'manual_backward': {
        const text = speechOutput.speakManualMove('backward', lastAction.direction || 'South');
        setGuidanceText(text);
        break;
      }
      case 'manual_turn': {
        const text = speechOutput.speakManualTurn(lastAction.turn || 'right', lastAction.direction || 'North');
        setGuidanceText(text);
        break;
      }
      case 'obstacle_blocked_move': {
        const text = speechOutput.speakObstacleBlockedMove();
        setGuidanceText(text);
        break;
      }
      case 'obstacle_added': {
        const text = speechOutput.speakObstacleAdded(lastAction.obstacleLabel || 'Road Barricade');
        setGuidanceText(text);
        break;
      }
      case 'obstacles_cleared': {
        const text = speechOutput.speakObstaclesCleared(destName);
        setGuidanceText(text);
        break;
      }
      case 'arrived': {
        const text = speechOutput.speakDestinationReached(destName);
        setGuidanceText(text);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // Ignore confetti errors in non-browser environments
        }
        break;
      }
      case 'no_route': {
        const text = speechOutput.speakNoRoute();
        setGuidanceText(text);
        break;
      }
      case 'paused': {
        const text = speechOutput.speakPaused();
        setGuidanceText(text);
        break;
      }
      case 'resumed': {
        const text = speechOutput.speakResumed(destName, lastAction.direction || 'North');
        setGuidanceText(text);
        break;
      }
      case 'reset': {
        const text = speechOutput.speakSimulationReset();
        setGuidanceText(text);
        break;
      }
      default:
        break;
    }
  }, [lastAction, currentDestination]);

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
    let cmd = command;
    if (typeof command === 'string') {
      cmd = speechInput.parseCommand(command);
    }
    if (!cmd) return;

    switch (cmd.type) {
      case 'NAVIGATE_TO':
      case 'SELECT_DESTINATION': {
        const dest = selectDestination(cmd.destinationId);
        if (dest) {
          startNavigation(cmd.destinationId);
        }
        break;
      }
      case 'MOVE_FORWARD': {
        moveForward();
        break;
      }
      case 'MOVE_BACKWARD': {
        moveBackward();
        break;
      }
      case 'TURN_LEFT':
        turnLeft();
        break;
      case 'TURN_RIGHT':
        turnRight();
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
      case 'STOP_NAVIGATION':
        handleStopNavigation();
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

  const handleToggleVoiceListening = useCallback(() => {
    if (isVoiceListening) {
      speechInput.stopListening();
      setIsVoiceListening(false);
    } else {
      speechInput.setLanguage(currentLanguage);
      const started = speechInput.startListening(
        ({ transcript, command }) => {
          setIsVoiceListening(false);
          handleVoiceCommand(command, transcript);
        },
        ({ state }) => {
          setIsVoiceListening(state === 'listening' || state === 'speaking' || state === 'processing');
        },
        (error) => {
          setIsVoiceListening(false);
          console.warn('Voice listening error:', error);
        }
      );
      if (started) setIsVoiceListening(true);
    }
  }, [isVoiceListening, currentLanguage, handleVoiceCommand]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    speechOutput.setMuted(next);
  };

  // Location and metrics (Bug 3.4 Fix: do not fallback to Library when destination is null)
  const locDescription = getLocationDescription ? getLocationDescription() : 'Near Cafeteria';
  const targetWorld = currentDestination?.worldPos;
  const curWorld = robotPosition?.world || { x: -5, z: 5.5 };
  const distMeters = (status === 'arrived' || !targetWorld)
    ? 0
    : Math.max(0, Math.round(Math.hypot(targetWorld.x - curWorld.x, targetWorld.z - curWorld.z) * 1.5));
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

      {/* 2. Desktop Floating Glassmorphic HUD Card Layer (Screens > 1024px) */}
      <div className="hud-overlay-container desktop-hud-container">
        {/* Top-Left: Brand Card + Vertical Navigation Menu */}
        <div className="hud-top-left-anchor">
          <LeftSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab === 'map') setCameraMode('perspective');
              if (tab === 'simulation') setCameraMode(prev => prev === 'follow' ? 'perspective' : 'follow');
              if (tab === 'camera') setCameraMode(prev => prev === 'pov' ? 'perspective' : 'pov');
              if (tab === 'settings') setShowWelcome(true);
            }}
            onOpenDestinations={() => setShowDestinationsModal(true)}
            onStartNavigation={handleStartNavigation}
            onToggleVoice={handleToggleVoiceListening}
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
            isListening={isVoiceListening}
            onToggleVoice={handleToggleVoiceListening}
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
            blockedObstacle={blockedObstacle}
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

      {/* 3. Mobile & Tablet Cockpit Experience (Screens <= 1024px) */}
      <div className="mobile-hud-container">
        <MobileTopBar
          status={status}
          currentDestination={currentDestination}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenDrawer={() => setShowMobileDrawer(true)}
          onOpenDestinations={() => setShowDestinationsModal(true)}
          onOpenHelp={() => setShowWelcome(true)}
          distanceLeft={distanceLeft}
        />

        <MobilePipWidget
          robotPosition={robotPosition}
          currentDestination={currentDestination}
          obstacles={obstacles}
          activeRoute={activeRoute}
          status={status}
          isObstacleDetected={isObstacleDetected}
          blockedObstacle={blockedObstacle}
        />

        <MobileBottomCockpit
          status={status}
          currentDestination={currentDestination}
          robotPosition={robotPosition}
          obstacles={obstacles}
          activeRoute={activeRoute}
          isObstacleDetected={isObstacleDetected}
          blockedObstacle={blockedObstacle}
          speed={speed}
          onSetSpeed={setSpeed}
          cameraMode={cameraMode}
          onSetCameraMode={setCameraMode}
          guidanceText={guidanceText}
          onSpeakGuidance={() => speechOutput.speak(guidanceText, true)}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          onStart={handleStartNavigation}
          onPause={pauseNavigation}
          onResume={resumeNavigation}
          onStop={handleStopNavigation}
          onReset={handleResetSimulation}
          onVoiceCommand={(cmd, text) => {
            const parsed = typeof cmd === 'string' ? speechInput.parseCommand(cmd) : cmd;
            handleVoiceCommand(parsed, text || (typeof cmd === 'string' ? cmd : ''));
          }}
          onMoveForward={moveForward}
          onMoveBackward={moveBackward}
          onTurnLeft={turnLeft}
          onTurnRight={turnRight}
          locationDescription={locDescription}
          distanceLeft={distanceLeft}
          speedStr={speedStr}
        />

        <MobileDrawer
          isOpen={showMobileDrawer}
          onClose={() => setShowMobileDrawer(false)}
          status={status}
          currentDestination={currentDestination}
          onSelectDestination={handleSelectDestination}
          onStart={handleStartNavigation}
          onPause={pauseNavigation}
          onResume={resumeNavigation}
          onStop={handleStopNavigation}
          onReset={handleResetSimulation}
          cameraMode={cameraMode}
          onSetCameraMode={setCameraMode}
          speed={speed}
          onSetSpeed={setSpeed}
          onAddObstacle={() => addObstacle()}
          onClearObstacles={clearObstacles}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          onOpenHelp={() => setShowWelcome(true)}
        />
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
