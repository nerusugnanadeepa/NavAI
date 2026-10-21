import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  X
} from 'lucide-react';

export function ObstacleAlert({ status, isObstacleDetected, currentDestination, onDismiss }) {
  if (isObstacleDetected || status === 'avoiding_obstacle') {
    return (
      <div className="alert-banner alert-banner-amber animate-pulse-amber">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <div className="flex-1">
          <strong>Obstacle Detected on Active Path!</strong>
          <p className="text-xs mt-0.5 opacity-90">
            Halting robot and recalculating alternative collision-free A* route.
          </p>
        </div>
        <RefreshCw size={16} className="animate-spin flex-shrink-0" />
      </div>
    );
  }

  if (status === 'no_route') {
    return (
      <div className="alert-banner alert-banner-red">
        <XCircle size={20} className="flex-shrink-0" />
        <div className="flex-1">
          <strong>No Safe Route Available!</strong>
          <p className="text-xs mt-0.5 opacity-90">
            Simulated obstacles have completely blocked the path to {currentDestination?.name || 'the destination'}.
          </p>
        </div>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="btn-icon p-1">
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  if (status === 'arrived') {
    return (
      <div className="alert-banner alert-banner-green">
        <CheckCircle2 size={20} className="flex-shrink-0" />
        <div className="flex-1">
          <strong>Destination Reached!</strong>
          <p className="text-xs mt-0.5 opacity-90">
            Virtual robot has successfully arrived at {currentDestination?.name || 'the target point'}.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default ObstacleAlert;
