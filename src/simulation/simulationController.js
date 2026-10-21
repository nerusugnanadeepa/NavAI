/**
 * NaviAI Simulation Controller & State Manager
 * Shared Interface Contract between Agent 1 (UI/Voice) and Agent 2 (Simulation/Pathfinding)
 */

export const DESTINATIONS = [
  {
    id: 'library',
    name: 'Library',
    category: 'Academic Hub',
    description: 'Central campus library & study commons',
    gridPos: { x: 16, y: 4 },
    worldPos: { x: 6, y: 0, z: -6 },
    color: '#3B82F6',
    estimatedDist: '14.2m'
  },
  {
    id: 'classroom',
    name: 'Classroom Block',
    category: 'Lecture Halls',
    description: 'Engineering & Computing classrooms',
    gridPos: { x: 4, y: 16 },
    worldPos: { x: -6, y: 0, z: 6 },
    color: '#06B6D4',
    estimatedDist: '16.8m'
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    category: 'Dining Commons',
    description: 'Campus cafeteria & student pavilion',
    gridPos: { x: 16, y: 16 },
    worldPos: { x: 6, y: 0, z: 6 },
    color: '#A855F7',
    estimatedDist: '21.5m'
  },
  {
    id: 'main_gate',
    name: 'Main Gate',
    category: 'Campus Entry',
    description: 'North visitor entrance and transit dock',
    gridPos: { x: 10, y: 2 },
    worldPos: { x: 0, y: 0, z: -8 },
    color: '#10B981',
    estimatedDist: '9.4m'
  }
];

export const INITIAL_ROBOT_POSITION = {
  grid: { x: 10, y: 10 },
  world: { x: 0, y: 0, z: 0 },
  heading: 0
};

export class SimulationController {
  constructor() {
    this.state = {
      status: 'idle', // 'idle' | 'planning' | 'moving' | 'avoiding_obstacle' | 'arrived' | 'no_route' | 'paused'
      currentDestination: null,
      robotPosition: { ...INITIAL_ROBOT_POSITION },
      activeRoute: [], // Array of waypoints [{grid: {x, y}, world: {x, y, z}}]
      progressPercent: 0,
      obstacles: [
        { id: 'obs-1', grid: { x: 13, y: 7 }, world: { x: 3, y: 0, z: -3 }, label: 'Maintenance Barrier' }
      ],
      speed: 1.0,
      isObstacleDetected: false,
      blockedSegment: null,
      stats: {
        waypointsRemaining: 0,
        totalWaypoints: 0,
        distanceTraveled: 0,
        speedMps: 1.2,
        batteryPercent: 94
      }
    };

    this.listeners = new Set();
    this.engineDelegate = null; // Agent 2 attaches here
    this.movementTimer = null;
    this.currentWaypointIndex = 0;
  }

  attachEngine(delegate) {
    this.engineDelegate = delegate;
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

  selectDestination(destinationId) {
    const dest = DESTINATIONS.find((d) => d.id === destinationId);
    if (!dest) return null;

    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }

    const route = this.generatePath(this.state.robotPosition.grid, dest.gridPos, this.state.obstacles);

    this.setState({
      currentDestination: dest,
      status: 'idle',
      activeRoute: route,
      progressPercent: 0,
      isObstacleDetected: false,
      stats: {
        ...this.state.stats,
        totalWaypoints: route.length,
        waypointsRemaining: route.length,
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

    if (this.engineDelegate?.startNavigation) {
      return this.engineDelegate.startNavigation(dest.id);
    }

    // Agent 1 Built-in Navigation Loop
    setTimeout(() => {
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
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
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

  resetSimulation() {
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }

    this.currentWaypointIndex = 0;
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

  addObstacle(position = null) {
    const newObstacle = position || {
      id: `obs-${Date.now()}`,
      grid: { 
        x: Math.round(this.state.robotPosition.grid.x + (this.state.currentDestination?.gridPos.x - this.state.robotPosition.grid.x) * 0.5), 
        y: Math.round(this.state.robotPosition.grid.y + (this.state.currentDestination?.gridPos.y - this.state.robotPosition.grid.y) * 0.5) 
      },
      world: { x: 2, y: 0, z: -2 },
      label: 'Simulated Hazard Cone'
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

    if (this.engineDelegate?.removeObstacle) {
      this.engineDelegate.removeObstacle(id);
      return;
    }

    // Re-check path if moving
    if (this.state.status === 'moving' && this.state.currentDestination) {
      const newRoute = this.generatePath(
        this.state.robotPosition.grid,
        this.state.currentDestination.gridPos,
        updated
      );
      if (newRoute) {
        this.setState({ activeRoute: newRoute });
      }
    }
  }

  clearObstacles() {
    this.setState({
      obstacles: [],
      isObstacleDetected: false
    });
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
        this.setState({
          status: 'arrived',
          progressPercent: 100,
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

      this.setState({
        robotPosition: {
          grid: nextWaypoint.grid,
          world: { x: nextWaypoint.grid.x - 10, y: 0, z: nextWaypoint.grid.y - 10 },
          heading: 0
        },
        progressPercent: progress,
        stats: {
          ...this.state.stats,
          waypointsRemaining: remaining,
          distanceTraveled: ((this.currentWaypointIndex + 1) * 1.2).toFixed(1)
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

      // Recalculate detour
      setTimeout(() => {
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
      return obstacles.some(obs => Math.hypot(obs.grid.x - gx, obs.grid.y - gy) < 1.4);
    };

    const path = [];
    let curX = start.x;
    let curY = start.y;
    path.push({ grid: { x: curX, y: curY } });

    let safetySteps = 0;
    while ((curX !== goal.x || curY !== goal.y) && safetySteps < 50) {
      safetySteps++;
      const dx = Math.sign(goal.x - curX);
      const dy = Math.sign(goal.y - curY);

      let nextX = curX;
      let nextY = curY;

      // Prefer moving along primary axis unless blocked
      if (dx !== 0 && !isBlocked(curX + dx, curY)) {
        nextX = curX + dx;
      } else if (dy !== 0 && !isBlocked(curX, curY + dy)) {
        nextY = curY + dy;
      } else if (dx !== 0 && dy !== 0 && !isBlocked(curX + dx, curY + dy)) {
        nextX = curX + dx;
        nextY = curY + dy;
      } else {
        // Detour around obstacle
        const detourDirs = [
          { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 },
          { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }
        ];
        const validDetour = detourDirs.find(d => 
          curX + d.x >= 0 && curX + d.x <= 20 &&
          curY + d.y >= 0 && curY + d.y <= 20 &&
          !isBlocked(curX + d.x, curY + d.y)
        );

        if (validDetour) {
          nextX = curX + validDetour.x;
          nextY = curY + validDetour.y;
        } else {
          // completely trapped
          return null;
        }
      }

      curX = nextX;
      curY = nextY;
      path.push({ grid: { x: curX, y: curY } });
    }

    return path;
  }
}

export const simulationController = new SimulationController();
export default simulationController;
