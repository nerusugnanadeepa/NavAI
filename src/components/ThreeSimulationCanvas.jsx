import React, { useEffect, useRef } from 'react';
import { ThreeEngine } from '../simulation/threeEngine';
import { simulationController } from '../simulation/simulationController';

export function ThreeSimulationCanvas({
  status,
  currentDestination,
  robotPosition,
  obstacles,
  activeRoute,
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

    let engine = null;
    let resizeObserver = null;

    try {
      engine = new ThreeEngine(containerRef.current, {
        onAddObstacleAtClick,
        onRemoveObstacle
      });
      engineRef.current = engine;

      // Initial state sync with fallback to simulationController
      const simState = simulationController.getState();
      const effObstacles = (obstacles && obstacles.length > 0) ? obstacles : simState.obstacles;
      const effRoute = (activeRoute && activeRoute.length > 0) ? activeRoute : simState.activeRoute;
      const effPos = robotPosition || simState.robotPosition;
      const effDest = currentDestination !== undefined ? currentDestination : simState.currentDestination;
      const effStatus = status || simState.status;

      engine.syncObstacles(effObstacles || []);
      engine.syncRoute(effRoute || [], effStatus);
      engine.updateRobotPose(effPos);
      engine.updateDestination(effDest);
      engine.setCameraMode(cameraMode);
      engine.setShowGrid(showGrid);

      // ResizeObserver to handle fluid container resizing
      resizeObserver = new ResizeObserver(() => {
        if (engineRef.current) {
          engineRef.current.onResize();
        }
      });
      resizeObserver.observe(containerRef.current);
    } catch (err) {
      console.warn('ThreeEngine initialization caught error, continuing UI render:', err);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (engine) engine.dispose();
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
    if (engineRef.current && obstacles) {
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
    if (engineRef.current && robotPosition) {
      engineRef.current.updateRobotPose(robotPosition);
    }
  }, [robotPosition]);

  // Sync active destination
  useEffect(() => {
    if (engineRef.current && currentDestination !== undefined) {
      engineRef.current.updateDestination(currentDestination);
    }
  }, [currentDestination]);

  // Sync camera mode
  useEffect(() => {
    if (engineRef.current && typeof engineRef.current.setCameraMode === 'function') {
      engineRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  // Sync grid visibility
  useEffect(() => {
    if (engineRef.current && typeof engineRef.current.setShowGrid === 'function') {
      engineRef.current.setShowGrid(showGrid);
    }
  }, [showGrid]);

  return (
    <div className="three-canvas-wrapper" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}>
      {/* Three.js WebGL Mount Target */}
      <div 
        ref={containerRef} 
        className="three-canvas-mount"
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      />
    </div>
  );
}

export default ThreeSimulationCanvas;
