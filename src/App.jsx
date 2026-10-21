import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppHeader 
} from './components/AppHeader';
import { 
  DestinationSelector 
} from './components/DestinationSelector';
import { 
  SimulationControls 
} from './components/SimulationControls';
import { 
  RobotStatus 
} from './components/RobotStatus';
import { 
  SimulationViewport 
} from './components/SimulationViewport';
import { 
  ObstacleAlert 
} from './components/ObstacleAlert';
import { 
  EventLog 
} from './components/EventLog';
import { 
  VoiceAssistant 
} from './components/VoiceAssistant';
import { 
  WelcomeModal 
} from './components/WelcomeModal';
import { useSimulation } from './hooks/useSimulation';
import { speechOutput } from './voice/speechOutput';
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
    resetSimulation,
    addObstacle,
    removeObstacle,
    clearObstacles,
    setSpeed
  } = useSimulation();

  const [isMuted, setIsMuted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [events, setEvents] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      type: 'system',
      message: 'NaviAI Autonomous Navigation System initialized.'
    },
    {
      id: 2,
      time: new Date().toLocaleTimeString(),
      type: 'route',
      message: 'Grid environment loaded. Standing by for destination selection.'
    }
  ]);

  const prevStatusRef = useRef(status);

  // Helper to append events
  const addLogEvent = useCallback((message, type = 'system') => {
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        type,
        message
      }
    ]);
  }, []);

  // Sync Voice guidance with simulation state transitions
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev === status) return;

    if (status === 'planning' && currentDestination) {
      addLogEvent(`Planning collision-aware route to ${currentDestination.name}.`, 'route');
      speechOutput.speakNavStarted(currentDestination.name);
    } else if (status === 'moving' && prev === 'planning') {
      addLogEvent(`Autonomous movement started along computed path.`, 'nav');
    } else if (status === 'avoiding_obstacle') {
      addLogEvent(`Obstacle detected! Recalculating collision-free path.`, 'alert');
      speechOutput.speakObstacleDetected();
    } else if (status === 'moving' && prev === 'avoiding_obstacle') {
      addLogEvent(`Alternative route found. Continuing navigation.`, 'route');
      speechOutput.speakRouteRecalculated();
    } else if (status === 'arrived' && currentDestination) {
      addLogEvent(`Successfully reached ${currentDestination.name}!`, 'success');
      speechOutput.speakDestinationReached(currentDestination.name);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // silent fail if confetti context not ready
      }
    } else if (status === 'no_route') {
      addLogEvent(`No safe route available. Halting robot in simulation.`, 'alert');
      speechOutput.speakNoRoute();
    } else if (status === 'paused') {
      addLogEvent(`Navigation paused by user.`, 'nav');
      speechOutput.speakPaused();
    } else if (status === 'moving' && prev === 'paused') {
      addLogEvent(`Navigation resumed.`, 'nav');
      speechOutput.speakResumed();
    }

    prevStatusRef.current = status;
  }, [status, currentDestination, addLogEvent]);

  // Handle destination choice
  const handleSelectDestination = (destId) => {
    const dest = selectDestination(destId);
    if (dest) {
      addLogEvent(`Destination selected: ${dest.name} (${dest.category}).`, 'nav');
    }
  };

  // Handle Start
  const handleStartNavigation = () => {
    if (!currentDestination) return;
    addLogEvent(`Starting navigation to ${currentDestination.name}.`, 'nav');
    startNavigation();
  };

  // Handle Obstacle Add
  const handleAddObstacle = () => {
    addObstacle();
    addLogEvent(`Simulated obstacle placed on active campus grid.`, 'obstacle');
  };

  // Handle Clear Obstacles
  const handleClearObstacles = () => {
    clearObstacles();
    addLogEvent(`Cleared simulated obstacles.`, 'obstacle');
  };

  // Handle Reset
  const handleResetSimulation = () => {
    resetSimulation();
    speechOutput.speakSimulationReset();
    addLogEvent(`Simulation reset to origin dock.`, 'reset');
  };

  // Handle Voice Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    speechOutput.setMuted(next);
  };

  // Handle Voice Assistant Command
  const handleVoiceCommand = (command, transcript) => {
    addLogEvent(`Voice Command heard: "${transcript}"`, 'voice');

    if (!command) return;

    switch (command.type) {
      case 'SELECT_DESTINATION':
        handleSelectDestination(command.destinationId);
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
        handleAddObstacle();
        break;
      case 'REMOVE_OBSTACLE':
        handleClearObstacles();
        break;
      default:
        addLogEvent(`Voice command not recognized. Please use sample phrases.`, 'voice');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <AppHeader
        status={status}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Responsive Grid Layout */}
      <main className="dashboard-layout">
        {/* Left Column: Destination & Voice Input */}
        <div className="dashboard-col">
          <DestinationSelector
            currentDestination={currentDestination}
            onSelect={handleSelectDestination}
            disabled={status === 'moving' || status === 'avoiding_obstacle'}
          />

          <VoiceAssistant 
            onCommandRecognized={handleVoiceCommand} 
          />
        </div>

        {/* Center Column: 3D Simulation Viewport & Controls */}
        <div className="dashboard-center">
          {/* Obstacle / Status Alert Banner */}
          <ObstacleAlert
            status={status}
            isObstacleDetected={isObstacleDetected}
            currentDestination={currentDestination}
          />

          {/* 3D Simulation Viewport (Where Agent 2 mounts Three.js) */}
          <SimulationViewport
            status={status}
            currentDestination={currentDestination}
            robotPosition={robotPosition}
            obstacles={obstacles}
            activeRoute={activeRoute}
            onAddObstacleAtClick={(pos) => {
              addObstacle(pos);
              addLogEvent(`Simulated obstacle placed at [${pos.grid.x}, ${pos.grid.y}].`, 'obstacle');
            }}
            onRemoveObstacle={(id) => {
              removeObstacle(id);
              addLogEvent(`Obstacle removed from simulation.`, 'obstacle');
            }}
          />

          {/* Simulation Controls Cluster */}
          <SimulationControls
            status={status}
            hasDestination={Boolean(currentDestination)}
            onStart={handleStartNavigation}
            onPause={pauseNavigation}
            onResume={resumeNavigation}
            onReset={handleResetSimulation}
            onAddObstacle={handleAddObstacle}
            onClearObstacles={handleClearObstacles}
            speed={speed}
            onSetSpeed={setSpeed}
            obstacleCount={obstacles.length}
          />
        </div>

        {/* Right Column: Telemetry & Event Log */}
        <div className="dashboard-col dashboard-right">
          <RobotStatus
            status={status}
            currentDestination={currentDestination}
            robotPosition={robotPosition}
            progressPercent={progressPercent}
            stats={stats}
          />

          <EventLog
            events={events}
            onClear={() => setEvents([])}
          />
        </div>
      </main>

      {/* Demo Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
    </div>
  );
}

export default App;
