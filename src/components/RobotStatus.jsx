import React from 'react';
import { 
  Activity, 
  MapPin, 
  Gauge, 
  Compass, 
  Layers, 
  Info
} from 'lucide-react';

export function RobotStatus({
  status,
  currentDestination,
  robotPosition,
  progressPercent,
  stats
}) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'moving':
        return { label: 'Moving to Destination', class: 'badge-moving', color: '#06B6D4' };
      case 'avoiding_obstacle':
        return { label: 'Avoiding Obstacle (Replanning)', class: 'badge-avoiding_obstacle', color: '#F59E0B' };
      case 'arrived':
        return { label: 'Arrived at Destination', class: 'badge-arrived', color: '#10B981' };
      case 'planning':
        return { label: 'Planning A* Path...', class: 'badge-planning', color: '#A855F7' };
      case 'paused':
        return { label: 'Navigation Paused', class: 'badge-paused', color: '#F59E0B' };
      case 'no_route':
        return { label: 'No Route Available', class: 'badge-no_route', color: '#EF4444' };
      default:
        return { label: 'Idle / Standing By', class: 'badge-idle', color: '#94A3B8' };
    }
  };

  const statusInfo = getStatusDisplay();
  const worldX = robotPosition?.world?.x?.toFixed(1) ?? '0.0';
  const worldZ = robotPosition?.world?.z?.toFixed(1) ?? '0.0';
  const gridX = robotPosition?.grid?.x ?? 10;
  const gridY = robotPosition?.grid?.y ?? 10;

  return (
    <div className="glass-panel">
      <div className="card-header">
        <h2 className="card-title">
          <Activity size={18} className="card-title-icon" />
          Virtual Robot Telemetry
        </h2>
        <span className={`badge ${statusInfo.class}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="card-body">
        {/* Progress indicator */}
        <div className="route-progress-wrap">
          <div className="route-progress-header">
            <span>Route Progress</span>
            <span className="font-mono">{Math.round(progressPercent)}%</span>
          </div>
          <div className="route-progress-bar-bg">
            <div 
              className="route-progress-fill" 
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* Telemetry data grid */}
        <div className="telemetry-grid">
          <div className="telemetry-item">
            <div className="telemetry-label">Coordinates (World)</div>
            <div className="telemetry-value">
              X: {worldX} | Z: {worldZ}
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-label">Grid Cell</div>
            <div className="telemetry-value">
              [{gridX}, {gridY}]
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-label">Current Goal</div>
            <div className="telemetry-value" style={{ color: currentDestination?.color || 'var(--white-soft)' }}>
              {currentDestination ? currentDestination.name : 'None'}
            </div>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-label">Path Waypoints</div>
            <div className="telemetry-value">
              {stats?.waypointsRemaining ?? 0} left
            </div>
          </div>
        </div>

        {/* Honesty note */}
        <div className="simulation-disclaimer">
          <Info size={14} className="flex-shrink-0" />
          <span>
            <strong>Demo Honesty:</strong> Telemetry is generated from software simulation coordinates.
          </span>
        </div>
      </div>
    </div>
  );
}

export default RobotStatus;
