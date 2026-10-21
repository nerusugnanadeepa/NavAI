/**
 * NaviAI Simulation Controller & State Manager
 * Shared Interface Contract between Agent 1 (UI/Voice) and Agent 2 (Simulation/Pathfinding)
 */

import { speechInput } from '../voice/speechInput';

export const DESTINATIONS = [
  {
    id: 'library',
    name: 'Library',
    category: 'Academic Hub',
    description: 'Central campus library & study commons',
    gridPos: { x: 10, y: 2 },
    worldPos: { x: 0, y: 0, z: -10 },
    color: '#3B82F6',
    estimatedDist: '25m'
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    category: 'Dining Commons',
    description: 'Campus cafeteria & student pavilion',
    gridPos: { x: 3, y: 8 },
    worldPos: { x: -9, y: 0, z: -2 },
    color: '#F59E0B',
    estimatedDist: '12m'
  },
  {
    id: 'computer_lab',
    name: 'Computer Lab',
    category: 'Computing Center',
    description: 'High-performance AI & Computing labs',
    gridPos: { x: 17, y: 7 },
    worldPos: { x: 9, y: 0, z: -3 },
    color: '#06B6D4',
    estimatedDist: '18m'
  },
  {
    id: 'auditorium',
    name: 'Auditorium',
    category: 'Events & Lectures',
    description: 'Main campus auditorium & conference hall',
    gridPos: { x: 17, y: 16 },
    worldPos: { x: 9, y: 0, z: 8 },
    color: '#A855F7',
    estimatedDist: '22m'
  },
  {
    id: 'main_gate',
    name: 'Main Gate',
    category: 'Campus Entry',
    description: 'South stone archway and visitor entrance',
    gridPos: { x: 3, y: 16 },
    worldPos: { x: -8, y: 0, z: 8 },
    color: '#10B981',
    estimatedDist: '15m'
  }
];

export const INITIAL_ROBOT_POSITION = {
  grid: { x: 5, y: 14 },
  world: { x: -5, y: 0, z: 5.5 },
  heading: 45
};

export const INITIAL_OBSTACLES = [
  { id: 'obs-barricade', grid: { x: 7, y: 9 }, world: { x: -2.8, y: 0, z: 0.5 }, label: 'Road Barricade' }
];

export const INITIAL_ROUTE = [
  { grid: { x: 5, y: 14 }, world: { x: -5, y: 0, z: 5.5 } },
  { grid: { x: 6, y: 13 }, world: { x: -4, y: 0, z: 3 } },
  { grid: { x: 7, y: 11 }, world: { x: -1, y: 0, z: 1.5 } },
  { grid: { x: 9, y: 9 }, world: { x: 1.5, y: 0, z: 0 } },
  { grid: { x: 10, y: 7 }, world: { x: 2.5, y: 0, z: -2 } },
  { grid: { x: 10, y: 4 }, world: { x: 2, y: 0, z: -5.5 } },
  { grid: { x: 10, y: 2 }, world: { x: 0.8, y: 0, z: -8 } },
  { grid: { x: 10, y: 0 }, world: { x: 0, y: 0, z: -10 } }
];

export class SimulationController {
  constructor() {
    this.state = {
      status: 'idle', // System ready and Start button enabled on page load!
      currentDestination: DESTINATIONS[0], // Library
      robotPosition: { ...INITIAL_ROBOT_POSITION },
      activeRoute: [...INITIAL_ROUTE],
      progressPercent: 0,
      obstacles: [...INITIAL_OBSTACLES],
      speed: 1.0,
      isObstacleDetected: false,
      blockedSegment: null,
      stats: {
        waypointsRemaining: INITIAL_ROUTE.length,
        totalWaypoints: INITIAL_ROUTE.length,
        distanceTraveled: 0,
        speedMps: 0.8,
        batteryPercent: 94
      }
    };

    this.listeners = new Set();
    this.engineDelegate = null; // Agent 2 attaches here
    this.movementTimer = null;
    this.replanTimeout = null;
    this.planningTimeout = null;
    this.currentWaypointIndex = 0;
    this.cumulativeDistance = 0;
  }

  attachEngine(delegate) {
    this.engineDelegate = delegate;
    if (delegate) {
      if (delegate.syncObstacles) delegate.syncObstacles(this.state.obstacles);
      if (delegate.updateRobotPose) delegate.updateRobotPose(this.state.robotPosition);
      if (delegate.updateDestination) delegate.updateDestination(this.state.currentDestination);
      if (delegate.syncRoute) delegate.syncRoute(this.state.activeRoute, this.state.status);
    }
  }

  detachEngine(delegate = null) {
    if (!delegate || this.engineDelegate === delegate) {
      this.engineDelegate = null;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error notifying simulation listener:', err);
      }
    });

    // Directly sync 3D Three.js engine delegate
    if (this.engineDelegate) {
      if (currentState.robotPosition && this.engineDelegate.updateRobotPose) {
        this.engineDelegate.updateRobotPose(currentState.robotPosition);
      }
      if (currentState.activeRoute && this.engineDelegate.syncRoute) {
        this.engineDelegate.syncRoute(currentState.activeRoute, currentState.status);
      }
      if (currentState.obstacles && this.engineDelegate.syncObstacles) {
        this.engineDelegate.syncObstacles(currentState.obstacles);
      }
      if (this.engineDelegate.updateDestination) {
        this.engineDelegate.updateDestination(currentState.currentDestination);
      }
    }
  }

  getState() {
    return { ...this.state };
  }

  setState(partial) {
    this.state = {
      ...this.state,
      ...partial,
      stats: {
        ...this.state.stats,
        ...(partial.stats || {})
      }
    };
    this.notify();
  }

  getLocationDescription() {
    const { world } = this.state.robotPosition;
    if (world.z < -6) return 'Near Library';
    if (world.x < -3 && world.z < 2 && world.z > -4) return 'Near Cafeteria';
    if (world.x < -3 && world.z >= 2) return 'Near Main Gate';
    if (world.x > 3 && world.z < 2) return 'Near Computer Lab';
    if (world.x > 3 && world.z >= 2) return 'Near Auditorium';
    return 'Central Plaza Fountain';
  }

  selectDestination(destinationId) {
    if (destinationId === 'classroom') destinationId = 'computer_lab';
    const dest = DESTINATIONS.find((d) => d.id === destinationId);
    if (!dest) return null;

    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    if (this.replanTimeout) {
      clearTimeout(this.replanTimeout);
      this.replanTimeout = null;
    }

    this.cumulativeDistance = 0;

    const route = this.generatePath(this.state.robotPosition.grid, dest.gridPos, this.state.obstacles);

    this.setState({
      currentDestination: dest,
      status: 'idle',
      activeRoute: route || [],
      progressPercent: 0,
      isObstacleDetected: false,
      stats: {
        ...this.state.stats,
        totalWaypoints: route ? route.length : 0,
        waypointsRemaining: route ? route.length : 0,
        distanceTraveled: 0
      }
    });

    if (this.engineDelegate?.onDestinationSelected) {
      this.engineDelegate.onDestinationSelected(dest);
    }
    return dest;
  }

  startNavigation(destinationId = null) {
    let dest = this.state.currentDestination;
    if (destinationId) {
      dest = this.selectDestination(destinationId);
    }

    if (!dest) {
      console.warn('Cannot start navigation: No destination selected');
      return false;
    }

    this.setState({
      status: 'planning',
      isObstacleDetected: false
    });

    if (this.planningTimeout) {
      clearTimeout(this.planningTimeout);
      this.planningTimeout = null;
    }

    if (this.engineDelegate?.startNavigation) {
      return this.engineDelegate.startNavigation(dest.id);
    }

    // Agent 1 Built-in Navigation Loop
    this.planningTimeout = setTimeout(() => {
      this.planningTimeout = null;
      const route = this.generatePath(this.state.robotPosition.grid, dest.gridPos, this.state.obstacles);
      if (!route || route.length === 0) {
        this.setState({ status: 'no_route' });
        return;
      }

      this.currentWaypointIndex = 0;
      this.setState({
        status: 'moving',
        activeRoute: route,
        stats: {
          ...this.state.stats,
          totalWaypoints: route.length,
          waypointsRemaining: route.length
        }
      });

      this.startMovementTicker();
    }, 400);

    return true;
  }

  pauseNavigation() {
    if (this.planningTimeout) {
      clearTimeout(this.planningTimeout);
      this.planningTimeout = null;
    }
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    if (this.replanTimeout) {
      clearTimeout(this.replanTimeout);
      this.replanTimeout = null;
    }

    this.setState({ status: 'paused' });

    if (this.engineDelegate?.pauseNavigation) {
      this.engineDelegate.pauseNavigation();
    }
  }

  resumeNavigation() {
    if (this.state.status !== 'paused') return;

    this.setState({ status: 'moving' });
    this.startMovementTicker();

    if (this.engineDelegate?.resumeNavigation) {
      this.engineDelegate.resumeNavigation();
    }
  }

  stopNavigation() {
    if (this.planningTimeout) {
      clearTimeout(this.planningTimeout);
      this.planningTimeout = null;
    }
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    if (this.replanTimeout) {
      clearTimeout(this.replanTimeout);
      this.replanTimeout = null;
    }

    this.currentWaypointIndex = 0;
    this.setState({
      status: 'idle',
      activeRoute: [],
      isObstacleDetected: false
    });

    if (this.engineDelegate?.stopNavigation) {
      this.engineDelegate.stopNavigation();
    }
  }

  resetSimulation() {
    if (this.planningTimeout) {
      clearTimeout(this.planningTimeout);
      this.planningTimeout = null;
    }
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    if (this.replanTimeout) {
      clearTimeout(this.replanTimeout);
      this.replanTimeout = null;
    }

    this.currentWaypointIndex = 0;
    this.cumulativeDistance = 0;
    this.setState({
      status: 'idle',
      currentDestination: null,
      robotPosition: { ...INITIAL_ROBOT_POSITION },
      activeRoute: [],
      progressPercent: 0,
      isObstacleDetected: false,
      blockedSegment: null,
      stats: {
        ...this.state.stats,
        waypointsRemaining: 0,
        totalWaypoints: 0,
        distanceTraveled: 0
      }
    });

    if (this.engineDelegate?.resetSimulation) {
      this.engineDelegate.resetSimulation();
    }
  }

  // Directional Manual Commands for Simulated Robot
  moveForward(steps = 1) {
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    const headingRad = (this.state.robotPosition.heading || 0) * (Math.PI / 180);
    const dx = Math.round(Math.sin(headingRad)) * steps;
    const dy = Math.round(-Math.cos(headingRad)) * steps;

    const nextGridX = Math.min(19, Math.max(1, this.state.robotPosition.grid.x + dx));
    const nextGridY = Math.min(19, Math.max(1, this.state.robotPosition.grid.y + dy));

    // Collision detection with obstacles
    const isBlocked = this.state.obstacles.some(
      obs => Math.hypot(obs.grid.x - nextGridX, obs.grid.y - nextGridY) < 1.3
    );

    if (isBlocked) {
      this.setState({
        status: 'avoiding_obstacle',
        isObstacleDetected: true
      });
      // Auto-recover after 2.5s so robot isn't trapped in avoiding_obstacle forever
      setTimeout(() => {
        if (this.state.status === 'avoiding_obstacle' && !this.movementTimer) {
          this.setState({ status: 'idle', isObstacleDetected: false });
        }
      }, 2500);
      return false;
    }

    const startPt = { ...this.state.robotPosition.grid };
    const targetPt = { x: nextGridX, y: nextGridY };
    const miniRoute = [{ grid: startPt }, { grid: targetPt }];

    this.cumulativeDistance += 1.2 * steps;

    this.setState({
      status: 'moving',
      activeRoute: miniRoute,
      robotPosition: {
        grid: targetPt,
        world: { x: targetPt.x - 10, y: 0, z: targetPt.y - 10 },
        heading: this.state.robotPosition.heading
      },
      stats: {
        ...this.state.stats,
        distanceTraveled: this.cumulativeDistance.toFixed(1)
      }
    });

    setTimeout(() => {
      if (this.state.status === 'moving' && !this.movementTimer) {
        this.setState({ status: 'idle', activeRoute: [] });
      }
    }, 600);

    return true;
  }

  moveBackward(steps = 1) {
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    const headingRad = (this.state.robotPosition.heading || 0) * (Math.PI / 180);
    const dx = -Math.round(Math.sin(headingRad)) * steps;
    const dy = Math.round(Math.cos(headingRad)) * steps;

    const nextGridX = Math.min(19, Math.max(1, this.state.robotPosition.grid.x + dx));
    const nextGridY = Math.min(19, Math.max(1, this.state.robotPosition.grid.y + dy));

    const isBlocked = this.state.obstacles.some(
      obs => Math.hypot(obs.grid.x - nextGridX, obs.grid.y - nextGridY) < 1.3
    );

    if (isBlocked) {
      this.setState({
        status: 'avoiding_obstacle',
        isObstacleDetected: true
      });
      // Auto-recover after 2.5s so robot isn't trapped in avoiding_obstacle forever
      setTimeout(() => {
        if (this.state.status === 'avoiding_obstacle' && !this.movementTimer) {
          this.setState({ status: 'idle', isObstacleDetected: false });
        }
      }, 2500);
      return false;
    }

    const startPt = { ...this.state.robotPosition.grid };
    const targetPt = { x: nextGridX, y: nextGridY };
    const miniRoute = [{ grid: startPt }, { grid: targetPt }];

    this.cumulativeDistance += 1.2 * steps;

    this.setState({
      status: 'moving',
      activeRoute: miniRoute,
      robotPosition: {
        grid: targetPt,
        world: { x: targetPt.x - 10, y: 0, z: targetPt.y - 10 },
        heading: this.state.robotPosition.heading
      },
      stats: {
        ...this.state.stats,
        distanceTraveled: this.cumulativeDistance.toFixed(1)
      }
    });

    setTimeout(() => {
      if (this.state.status === 'moving' && !this.movementTimer) {
        this.setState({ status: 'idle', activeRoute: [] });
      }
    }, 600);

    return true;
  }

  turnLeft() {
    const newHeading = (this.state.robotPosition.heading - 90 + 360) % 360;
    this.setState({
      robotPosition: {
        ...this.state.robotPosition,
        heading: newHeading
      }
    });
    return true;
  }

  turnRight() {
    const newHeading = (this.state.robotPosition.heading + 90) % 360;
    this.setState({
      robotPosition: {
        ...this.state.robotPosition,
        heading: newHeading
      }
    });
    return true;
  }

  // Universal Multilingual Command Interpreter & Executor
  executeCommand(commandInput) {
    if (!commandInput) return { success: false, message: 'Empty command' };

    let cmdType = '';
    let targetDest = null;
    let steps = 1;

    if (typeof commandInput === 'object') {
      cmdType = commandInput.type;
      targetDest = commandInput.destinationId;
      steps = commandInput.steps || 1;
    } else {
      const parsed = speechInput.parseCommand(commandInput);
      cmdType = parsed.type;
      targetDest = parsed.destinationId;
      steps = parsed.steps || 1;
    }

    switch (cmdType) {
      case 'NAVIGATE_TO':
      case 'SELECT_DESTINATION': {
        const dest = this.selectDestination(targetDest);
        if (dest) {
          this.startNavigation(targetDest);
          return { success: true, message: `Navigating to ${dest.name}` };
        }
        return { success: false, message: 'Destination not found' };
      }
      case 'START_NAVIGATION':
        return { success: this.startNavigation(), message: 'Navigation started' };
      case 'MOVE_FORWARD':
        return { success: this.moveForward(1), message: 'Moving forward' };
      case 'MOVE_BACKWARD':
        return { success: this.moveBackward(1), message: 'Moving backward' };
      case 'TURN_LEFT':
        return { success: this.turnLeft(), message: 'Turned left' };
      case 'TURN_RIGHT':
        return { success: this.turnRight(), message: 'Turned right' };
      case 'PAUSE_NAVIGATION':
        this.pauseNavigation();
        return { success: true, message: 'Navigation paused' };
      case 'RESUME_NAVIGATION':
        this.resumeNavigation();
        return { success: true, message: 'Navigation resumed' };
      case 'RESET_SIMULATION':
        this.resetSimulation();
        return { success: true, message: 'Reset to origin dock' };
      case 'ADD_OBSTACLE':
        this.addObstacle();
        return { success: true, message: 'Obstacle placed' };
      case 'REMOVE_OBSTACLE':
        this.clearObstacles();
        return { success: true, message: 'Obstacles cleared' };
      default:
        return { success: false, message: `Unknown command: ${commandInput}` };
    }
  }

  addObstacle(position = null) {
    const currentDest = this.state.currentDestination;
    const targetX = currentDest ? currentDest.gridPos.x : 16;
    const targetY = currentDest ? currentDest.gridPos.y : 16;
    const spawnedGridX = Math.min(19, Math.max(1, Math.round(
      this.state.robotPosition.grid.x + (targetX - this.state.robotPosition.grid.x) * 0.5
    )));
    const spawnedGridY = Math.min(19, Math.max(1, Math.round(
      this.state.robotPosition.grid.y + (targetY - this.state.robotPosition.grid.y) * 0.5
    )));
    const newObstacle = position || {
      id: `obs-${Date.now()}`,
      grid: { x: spawnedGridX, y: spawnedGridY },
      world: { x: spawnedGridX - 10, y: 0, z: spawnedGridY - 10 },
      label: `Simulated Hazard [${spawnedGridX}, ${spawnedGridY}]`
    };

    const updatedObstacles = [...this.state.obstacles, newObstacle];

    this.setState({
      obstacles: updatedObstacles
    });

    if (this.engineDelegate?.addObstacle) {
      this.engineDelegate.addObstacle(newObstacle);
      return;
    }

    // If currently moving, check if obstacle intersects active path
    if (this.state.status === 'moving' && this.state.currentDestination) {
      this.checkObstacleCollisionAndReplan(newObstacle);
    }
  }

  removeObstacle(id = null) {
    const updated = id
      ? this.state.obstacles.filter(o => o.id !== id)
      : this.state.obstacles.slice(0, -1);

    this.setState({
      obstacles: updated,
      isObstacleDetected: false
    });

    // Re-check path if moving or avoiding obstacle
    if ((this.state.status === 'moving' || this.state.status === 'avoiding_obstacle') && this.state.currentDestination) {
      const newRoute = this.generatePath(
        this.state.robotPosition.grid,
        this.state.currentDestination.gridPos,
        updated
      );
      if (newRoute && newRoute.length > 0) {
        this.currentWaypointIndex = 0;
        this.setState({
          activeRoute: newRoute,
          status: 'moving',
          stats: {
            ...this.state.stats,
            totalWaypoints: newRoute.length,
            waypointsRemaining: newRoute.length
          }
        });
        if (!this.movementTimer) {
          this.startMovementTicker();
        }
      }
    }

    if (this.engineDelegate?.removeObstacle) {
      this.engineDelegate.removeObstacle(id);
    }
  }

  clearObstacles() {
    this.setState({
      obstacles: [],
      isObstacleDetected: false
    });

    if ((this.state.status === 'moving' || this.state.status === 'avoiding_obstacle') && this.state.currentDestination) {
      const newRoute = this.generatePath(
        this.state.robotPosition.grid,
        this.state.currentDestination.gridPos,
        []
      );
      if (newRoute && newRoute.length > 0) {
        this.currentWaypointIndex = 0;
        this.setState({
          activeRoute: newRoute,
          status: 'moving',
          stats: {
            ...this.state.stats,
            totalWaypoints: newRoute.length,
            waypointsRemaining: newRoute.length
          }
        });
        if (!this.movementTimer) {
          this.startMovementTicker();
        }
      }
    }

    if (this.engineDelegate?.clearObstacles) {
      this.engineDelegate.clearObstacles();
    }
  }

  setSpeed(multiplier) {
    this.setState({ speed: multiplier });
    if (this.state.status === 'moving') {
      this.startMovementTicker();
    }
    if (this.engineDelegate?.setSpeed) {
      this.engineDelegate.setSpeed(multiplier);
    }
  }

  // Autonomous Movement Engine Loop
  startMovementTicker() {
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
    }

    const intervalMs = Math.max(150, Math.round(600 / (this.state.speed || 1.0)));

    this.movementTimer = setInterval(() => {
      const route = this.state.activeRoute;
      if (!route || route.length === 0 || this.currentWaypointIndex >= route.length) {
        clearInterval(this.movementTimer);
        this.movementTimer = null;
        const lastWaypoint = route && route.length > 0 ? route[route.length - 1]?.grid : null;
        const isAtGoal = Boolean(lastWaypoint && this.state.currentDestination &&
          lastWaypoint.x === this.state.currentDestination.gridPos.x &&
          lastWaypoint.y === this.state.currentDestination.gridPos.y);
        this.setState({
          status: isAtGoal ? 'arrived' : 'no_route',
          progressPercent: isAtGoal ? 100 : this.state.progressPercent,
          stats: {
            ...this.state.stats,
            waypointsRemaining: 0
          }
        });
        return;
      }

      const nextWaypoint = route[this.currentWaypointIndex];
      const remaining = route.length - this.currentWaypointIndex - 1;
      const progress = ((this.currentWaypointIndex + 1) / route.length) * 100;

      const dx = nextWaypoint.grid.x - this.state.robotPosition.grid.x;
      const dy = nextWaypoint.grid.y - this.state.robotPosition.grid.y;
      const headingDeg = (dx !== 0 || dy !== 0)
        ? ((Math.atan2(dy, dx) * 180 / Math.PI) + 90)
        : (this.state.robotPosition.heading || 0);

      this.cumulativeDistance += 1.2;

      this.setState({
        robotPosition: {
          grid: nextWaypoint.grid,
          world: { x: nextWaypoint.grid.x - 10, y: 0, z: nextWaypoint.grid.y - 10 },
          heading: headingDeg
        },
        progressPercent: progress,
        stats: {
          ...this.state.stats,
          waypointsRemaining: remaining,
          distanceTraveled: this.cumulativeDistance.toFixed(1)
        }
      });

      this.currentWaypointIndex++;
    }, intervalMs);
  }

  checkObstacleCollisionAndReplan(obstacle) {
    // Check if new obstacle lies close to remaining waypoints
    const remainingWaypoints = this.state.activeRoute.slice(this.currentWaypointIndex);
    const isBlocking = remainingWaypoints.some((wp) => {
      const dist = Math.hypot(wp.grid.x - obstacle.grid.x, wp.grid.y - obstacle.grid.y);
      return dist <= 1.5;
    });

    if (isBlocking) {
      if (this.movementTimer) {
        clearInterval(this.movementTimer);
        this.movementTimer = null;
      }

      this.setState({
        status: 'avoiding_obstacle',
        isObstacleDetected: true
      });

      if (this.replanTimeout) {
        clearTimeout(this.replanTimeout);
        this.replanTimeout = null;
      }

      // Recalculate detour
      this.replanTimeout = setTimeout(() => {
        this.replanTimeout = null;

        const detour = this.generatePath(
          this.state.robotPosition.grid,
          this.state.currentDestination.gridPos,
          this.state.obstacles
        );

        if (!detour || detour.length === 0) {
          this.setState({
            status: 'no_route',
            isObstacleDetected: false
          });
          return;
        }

        this.currentWaypointIndex = 0;
        this.setState({
          status: 'moving',
          isObstacleDetected: false,
          activeRoute: detour,
          stats: {
            ...this.state.stats,
            totalWaypoints: detour.length,
            waypointsRemaining: detour.length
          }
        });

        this.startMovementTicker();
      }, 1400);
    }
  }

  // Pathfinding algorithm generating collision-free waypoints
  generatePath(start, goal, obstacles) {
    const isBlocked = (gx, gy) => {
      if (gx < 0 || gx > 20 || gy < 0 || gy > 20) return true;
      return obstacles.some(obs => Math.hypot(obs.grid.x - gx, obs.grid.y - gy) < 1.3);
    };
    if (isBlocked(goal.x, goal.y)) return null;
    const queue = [[start]];
    const visited = new Set([`${start.x},${start.y}`]);
    const dirs = [
      { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }
    ];
    while (queue.length > 0) {
      const path = queue.shift();
      const curr = path[path.length - 1];
      if (curr.x === goal.x && curr.y === goal.y) {
        return path.map(pt => ({ grid: { x: pt.x, y: pt.y } }));
      }
      // Sort neighbor directions by straight-line distance to goal (A* heuristic)
      const sortedDirs = [...dirs].sort((a, b) => {
        const distA = Math.hypot(goal.x - (curr.x + a.x), goal.y - (curr.y + a.y));
        const distB = Math.hypot(goal.x - (curr.x + b.x), goal.y - (curr.y + b.y));
        return distA - distB;
      });
      for (const d of sortedDirs) {
        const nx = curr.x + d.x;
        const ny = curr.y + d.y;
        const key = `${nx},${ny}`;
        if (!visited.has(key) && !isBlocked(nx, ny)) {
          visited.add(key);
          queue.push([...path, { x: nx, y: ny }]);
        }
      }
    }
    return null; // Safe fallback: goal is truly unreachable
  }
}

export const simulationController = new SimulationController();
export default simulationController;
