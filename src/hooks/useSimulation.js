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
    setSpeed: (multiplier) => simulationController.setSpeed(multiplier)
  };
}

export default useSimulation;
