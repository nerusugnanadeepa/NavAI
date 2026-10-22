import React, { useState } from 'react';
import { Map, Video, Minimize2, Maximize2 } from 'lucide-react';
import { TopViewMinimap } from './TopViewMinimap';
import { CameraViewCard } from './CameraViewCard';

export function MobilePipWidget({
  robotPosition,
  currentDestination,
  obstacles,
  activeRoute,
  status,
  isObstacleDetected,
  blockedObstacle
}) {
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'camera'
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="mobile-pip-minimized">
        <button
          type="button"
          className="mobile-pip-badge-btn"
          onClick={() => setIsMinimized(false)}
          title="Expand Mini View"
          aria-label="Expand Mini View"
        >
          {viewMode === 'map' ? <Map size={13} /> : <Video size={13} />}
          <span>{viewMode === 'map' ? 'Minimap' : 'Camera'}</span>
          <Maximize2 size={11} className="ml-0.5 opacity-70" />
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-pip-container" role="complementary" aria-label="Picture in picture view">
      {/* Mini Header */}
      <div className="mobile-pip-header">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`mobile-pip-tab ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <Map size={11} />
            <span>Map</span>
          </button>
          <button
            type="button"
            className={`mobile-pip-tab ${viewMode === 'camera' ? 'active' : ''}`}
            onClick={() => setViewMode('camera')}
          >
            <Video size={11} />
            <span>POV</span>
          </button>
        </div>

        <button
          type="button"
          className="mobile-pip-close-btn"
          onClick={() => setIsMinimized(true)}
          title="Minimize to pill"
          aria-label="Minimize"
        >
          <Minimize2 size={12} />
        </button>
      </div>

      {/* Mini Viewport */}
      <div className="mobile-pip-body">
        {viewMode === 'map' ? (
          <div className="mobile-pip-map-frame">
            <TopViewMinimap
              robotPosition={robotPosition}
              currentDestination={currentDestination}
              obstacles={obstacles}
              activeRoute={activeRoute}
              status={status}
              blockedObstacle={blockedObstacle}
            />
          </div>
        ) : (
          <div className="mobile-pip-camera-frame">
            <CameraViewCard
              isObstacleDetected={isObstacleDetected || status === 'avoiding_obstacle'}
              currentDestination={currentDestination}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MobilePipWidget;
