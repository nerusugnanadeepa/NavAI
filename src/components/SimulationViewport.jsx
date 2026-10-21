import React, { useState, useRef } from 'react';
import { 
  Eye, 
  Grid3X3, 
  Layers, 
  Compass, 
  Box, 
  MapPin, 
  AlertTriangle,
  Radio,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { DESTINATIONS } from '../simulation/simulationController';

export function SimulationViewport({
  children,
  status,
  currentDestination,
  robotPosition,
  obstacles,
  activeRoute,
  onAddObstacleAtClick,
  onRemoveObstacle
}) {
  const [cameraMode, setCameraMode] = useState('grid'); // 'grid' | 'perspective' | 'follow'
  const [showGrid, setShowGrid] = useState(true);
  const svgRef = useRef(null);

  // Grid dimensions for campus map
  const GRID_SIZE = 20;
  const CELL_PX = 28;
  const MAP_WIDTH = GRID_SIZE * CELL_PX; // 560px
  const MAP_HEIGHT = GRID_SIZE * CELL_PX; // 560px

  // Convert grid coords to pixel coords inside the map
  const toPx = (gridCoord) => {
    return {
      x: (gridCoord.x / GRID_SIZE) * 100,
      y: (gridCoord.y / GRID_SIZE) * 100
    };
  };

  const handleSvgClick = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gridX = Math.min(19, Math.max(1, Math.round((clickX / rect.width) * GRID_SIZE)));
    const gridY = Math.min(19, Math.max(1, Math.round((clickY / rect.height) * GRID_SIZE)));

    if (onAddObstacleAtClick) {
      onAddObstacleAtClick({
        id: `obs-${Date.now()}`,
        grid: { x: gridX, y: gridY },
        world: { x: gridX - 10, y: 0, z: gridY - 10 },
        label: `Hazard [${gridX},${gridY}]`
      });
    }
  };

  const robotPx = toPx(robotPosition?.grid || { x: 10, y: 10 });

  return (
    <div className="simulation-viewport-card">
      {/* Top HUD Overlay */}
      <div className="viewport-hud-header">
        <div className="hud-title-badge">
          <Box size={14} color="#06B6D4" />
          <span>Interactive Campus Simulation</span>
          <span className="font-mono text-xs opacity-75">
            ({obstacles.length} Obstacles | Status: {status.toUpperCase()})
          </span>
        </div>

        <div className="hud-controls-group">
          <button
            type="button"
            className={`hud-btn ${cameraMode === 'grid' ? 'active' : ''}`}
            onClick={() => setCameraMode('grid')}
            title="2D Navigable Campus Grid"
          >
            <Grid3X3 size={12} />
            <span>2D Radar</span>
          </button>

          <button
            type="button"
            className={`hud-btn ${cameraMode === 'perspective' ? 'active' : ''}`}
            onClick={() => setCameraMode('perspective')}
            title="Isometric 3D Perspective"
          >
            <Eye size={12} />
            <span>3D View</span>
          </button>

          <button
            type="button"
            className={`hud-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid Lines"
          >
            <Compass size={12} />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        className="viewport-canvas-container"
        style={{ minHeight: '440px', background: '#070D18', position: 'relative' }}
        title="Click anywhere on the campus map to place a simulated obstacle"
      >
        {children ? (
          children
        ) : (
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-2 select-none">
            {/* SVG Tactical Navigation Map */}
            <svg
              ref={svgRef}
              onClick={handleSvgClick}
              viewBox="0 0 100 100"
              className="w-full h-full max-h-[500px]"
              preserveAspectRatio="xMidYMid meet"
              style={{
                cursor: 'crosshair',
                transform: cameraMode === 'perspective' ? 'rotateX(30deg) rotateZ(-10deg) scale(0.95)' : 'none',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Grid Background */}
              {showGrid && (
                <defs>
                  <pattern id="campus-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.2" />
                  </pattern>
                </defs>
              )}
              {showGrid && <rect width="100" height="100" fill="url(#campus-grid)" />}

              {/* Walkable Pathways connecting campus buildings */}
              <g stroke="rgba(6, 182, 212, 0.15)" strokeWidth="3" fill="none" strokeLinecap="round">
                <line x1="50" y1="50" x2="80" y2="20" /> {/* Dock to Library */}
                <line x1="50" y1="50" x2="20" y2="80" /> {/* Dock to Classroom */}
                <line x1="50" y1="50" x2="80" y2="80" /> {/* Dock to Cafeteria */}
                <line x1="50" y1="50" x2="50" y2="10" /> {/* Dock to Main Gate */}
                <line x1="80" y1="20" x2="80" y2="80" /> {/* Library to Cafeteria */}
                <line x1="20" y1="80" x2="80" y2="80" /> {/* Classroom to Cafeteria */}
                <line x1="50" y1="10" x2="80" y2="20" /> {/* Main Gate to Library */}
              </g>

              {/* Campus Buildings / Zones */}
              {DESTINATIONS.map((dest) => {
                const px = toPx(dest.gridPos);
                const isTarget = currentDestination?.id === dest.id;

                return (
                  <g key={dest.id} transform={`translate(${px.x}, ${px.y})`}>
                    {/* Destination Halo */}
                    {isTarget && (
                      <circle 
                        r="8" 
                        fill="none" 
                        stroke={dest.color} 
                        strokeWidth="0.8" 
                        strokeDasharray="2 1"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0' }}
                      />
                    )}
                    {/* Building Base */}
                    <rect
                      x="-5"
                      y="-5"
                      width="10"
                      height="10"
                      rx="1.5"
                      fill={isTarget ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.7)'}
                      stroke={isTarget ? dest.color : '#334155'}
                      strokeWidth={isTarget ? '0.8' : '0.4'}
                    />
                    <text
                      y="8"
                      fontSize="2.4"
                      textAnchor="middle"
                      fill={isTarget ? '#F8FAFC' : '#94A3B8'}
                      fontWeight={isTarget ? '700' : '500'}
                    >
                      {dest.name}
                    </text>
                  </g>
                );
              })}

              {/* Robot Origin Dock */}
              <g transform="translate(50, 50)">
                <rect x="-3" y="-3" width="6" height="6" rx="1" fill="rgba(15, 23, 42, 0.8)" stroke="#334155" strokeWidth="0.4" />
                <text y="5" fontSize="2" textAnchor="middle" fill="#64748B">Central Dock</text>
              </g>

              {/* Planned Route Line (A* waypoints) */}
              {activeRoute && activeRoute.length > 1 && (
                <polyline
                  points={activeRoute.map(pt => `${toPx(pt.grid || { x: (pt.x || 0) + 10, y: (pt.z || 0) + 10 }).x},${toPx(pt.grid || { x: (pt.x || 0) + 10, y: (pt.z || 0) + 10 }).y}`).join(' ')}
                  fill="none"
                  stroke={status === 'avoiding_obstacle' ? '#F59E0B' : '#10B981'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={status === 'moving' ? '2 1.5' : 'none'}
                />
              )}

              {/* Simulated Obstacles */}
              {obstacles.map((obs) => {
                const px = toPx(obs.grid);
                return (
                  <g 
                    key={obs.id} 
                    transform={`translate(${px.x}, ${px.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRemoveObstacle) onRemoveObstacle(obs.id);
                    }}
                  >
                    <circle r="4.5" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" strokeWidth="0.6" />
                    <polygon points="-2.5,2.5 0,-2.5 2.5,2.5" fill="#F59E0B" />
                    <text y="5.5" fontSize="1.8" textAnchor="middle" fill="#FDE68A">Obstacle</text>
                  </g>
                );
              })}

              {/* Virtual Autonomous Robot Marker */}
              <g transform={`translate(${robotPx.x}, ${robotPx.y}) rotate(${robotPosition?.heading || 0})`}>
                {/* Radar pulse ring */}
                <circle 
                  r="6" 
                  fill="none" 
                  stroke="#06B6D4" 
                  strokeWidth="0.5" 
                  opacity="0.6"
                  className="animate-pulse-cyan"
                />
                {/* Robot body */}
                <circle r="3.2" fill="#0F172A" stroke="#06B6D4" strokeWidth="1" />
                <circle r="1.5" fill="#06B6D4" />
                {/* Direction indicator pointer */}
                <polygon points="0,-3.5 -1.2,-1.5 1.2,-1.5" fill="#F8FAFC" />
                <text y="-5" fontSize="2.4" textAnchor="middle" fill="#67E8F9" fontWeight="700">
                  NaviBot
                </text>
              </g>
            </svg>

            {/* Click-to-place helper prompt */}
            <div className="absolute bottom-16 right-4 pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5">
              <PlusCircle size={12} className="text-amber-400" />
              <span>Click anywhere on campus map to spawn simulated obstacle</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD Legend & Scale */}
      <div className="viewport-hud-bottom">
        <div className="hud-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#06B6D4' }} />
            <span>Virtual Robot</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#10B981' }} />
            <span>Safe A* Route</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#F59E0B' }} />
            <span>Simulated Obstacle</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#3B82F6' }} />
            <span>Campus Destination</span>
          </div>
        </div>

        <div className="hud-title-badge font-mono text-xs">
          <span>Scale: 1 grid = 1.0m</span>
        </div>
      </div>
    </div>
  );
}

export default SimulationViewport;
