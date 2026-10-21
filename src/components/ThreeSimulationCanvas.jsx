import React, { useEffect, useRef } from 'react';
import { ThreeEngine } from '../simulation/threeEngine';

export function ThreeSimulationCanvas({
  status,
  currentDestination,
  robotPosition,
  obstacles = [],
  activeRoute = [],
  onAddObstacleAtClick,
  onRemoveObstacle,
  cameraMode = 'perspective',
  showGrid = true
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  // Initialize Three.js engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new ThreeEngine(containerRef.current, {
      onAddObstacleAtClick,
      onRemoveObstacle
    });
    engineRef.current = engine;

    // Initial state sync
    engine.syncObstacles(obstacles);
    engine.syncRoute(activeRoute, status);
    engine.updateRobotPose(robotPosition);
    engine.updateDestination(currentDestination);
    engine.setCameraMode(cameraMode);
    engine.setShowGrid(showGrid);

    // ResizeObserver to handle fluid container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (engineRef.current) {
        engineRef.current.onResize();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync callbacks if updated
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.callbacks = {
        onAddObstacleAtClick,
        onRemoveObstacle
      };
    }
  }, [onAddObstacleAtClick, onRemoveObstacle]);

  // Sync obstacles
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.syncObstacles(obstacles);
    }
  }, [obstacles]);

  // Sync route & status
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.syncRoute(activeRoute, status);
    }
  }, [activeRoute, status]);

  // Sync robot position & heading
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateRobotPose(robotPosition);
    }
  }, [robotPosition]);

  // Sync active destination
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateDestination(currentDestination);
    }
  }, [currentDestination]);

  // Sync camera mode
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  // Sync grid visibility
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setShowGrid(showGrid);
    }
  }, [showGrid]);

  return (
    <div className="three-canvas-wrapper w-full h-full relative min-h-[460px] overflow-hidden">
      {/* Three.js WebGL Mount Target */}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[460px]"
        style={{ touchAction: 'none' }}
      />

      {/* Floating 3D Interaction HUD Helper */}
      <div className="absolute bottom-3 right-3 pointer-events-none bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2 shadow-xl">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>
          {cameraMode === 'follow' 
            ? 'Camera: Following NaviBot' 
            : cameraMode === 'grid' 
            ? 'Camera: 2D Tactical Radar' 
            : 'Orbit: Left-drag | Pan: Right-drag | Zoom: Scroll'}
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-300 font-medium">Click ground to place hazard</span>
      </div>
    </div>
  );
}

export default ThreeSimulationCanvas;
