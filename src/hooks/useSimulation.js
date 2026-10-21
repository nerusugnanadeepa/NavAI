import { useState, useEffect } from 'react';
import { simulationController } from '../simulation/simulationController';

export function useSimulation() {
  const [simState, setSimState] = useState(() => simulationController.getState());

  useEffect(() => {
    const unsubscribe = simulationController.subscribe((newState) => {
      setSimState(newState);
    });
    return unsubscribe;
  }, []);

  return {
    ...simState,
    selectDestination: (id) => simulationController.selectDestination(id),
    startNavigation: (id) => simulationController.startNavigation(id),
    pauseNavigation: () => simulationController.pauseNavigation(),
    resumeNavigation: () => simulationController.resumeNavigation(),
    resetSimulation: () => simulationController.resetSimulation(),
    addObstacle: (pos) => simulationController.addObstacle(pos),
    removeObstacle: (id) => simulationController.removeObstacle(id),
    clearObstacles: () => simulationController.clearObstacles(),
    setSpeed: (multiplier) => simulationController.setSpeed(multiplier),
    moveForward: (steps) => simulationController.moveForward(steps),
    moveBackward: (steps) => simulationController.moveBackward(steps),
    turnLeft: () => simulationController.turnLeft(),
    turnRight: () => simulationController.turnRight(),
    executeCommand: (cmd) => simulationController.executeCommand(cmd),
    getLocationDescription: () => simulationController.getLocationDescription()
  };
}

export default useSimulation;
