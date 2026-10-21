import React from 'react';
import { Map, Navigation } from 'lucide-react';

export function TopViewMinimap({
  robotPosition,
  currentDestination,
  obstacles,
  activeRoute,
  status
}) {
  // Grid size 20x20 mapped to 100x100 viewBox
  const toSvg = (grid) => ({
    x: (grid.x / 20) * 100,
    y: (grid.y / 20) * 100
  });

  const robotPt = toSvg(robotPosition?.grid || { x: 5, y: 14 });
  const robotHeading = robotPosition?.heading || 45;

  return (
    <div className="hud-card minimap-card">
      <div className="hud-card-header">
        <span className="hud-card-title flex items-center gap-1.5">
          <Map size={13} className="text-cyan-400" />
          Campus Map <span className="text-xs text-slate-400 font-normal">(Top View)</span>
        </span>
      </div>

      <div className="minimap-container">
        <svg viewBox="0 0 100 100" className="minimap-svg" preserveAspectRatio="xMidYMid meet">
          {/* Background ground & subtle grid */}
          <rect width="100" height="100" fill="#1b2838" />
          
          <defs>
            <pattern id="mini-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#mini-grid)" />

          {/* Green lawn patches */}
          <rect x="5" y="5" width="90" height="90" fill="#2d4a22" rx="4" opacity="0.6" />

          {/* Sandstone Paved Pathways */}
          <g stroke="#d5cebf" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Main Gate to Fountain */}
            <line x1="20" y1="80" x2="50" y2="50" />
            {/* Fountain to Library */}
            <line x1="50" y1="50" x2="50" y2="18" />
            {/* Fountain to Cafeteria */}
            <line x1="50" y1="50" x2="18" y2="45" />
            {/* Fountain to Computer Lab */}
            <line x1="50" y1="50" x2="82" y2="40" />
            {/* Fountain to Auditorium */}
            <line x1="50" y1="50" x2="82" y2="80" />
          </g>

          {/* Central Fountain Pool */}
          <circle cx="50" cy="50" r="7" fill="#38bdf8" stroke="#d5cebf" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="2.5" fill="#bae6fd" />

          {/* Building Outlines & Labels */}
          {/* Library (Top) */}
          <g transform="translate(50, 15)">
            <rect x="-16" y="-8" width="32" height="14" rx="2" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
            <text y="0" textAnchor="middle" fill="#f8fafc" fontSize="3.6" fontWeight="bold">Library</text>
          </g>

          {/* Cafeteria (Left) */}
          <g transform="translate(18, 45)">
            <rect x="-14" y="-8" width="24" height="16" rx="2" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
            <text y="1" textAnchor="middle" fill="#f8fafc" fontSize="3.2" fontWeight="bold">Cafeteria</text>
          </g>

          {/* Computer Lab (Right Top) */}
          <g transform="translate(82, 40)">
            <rect x="-14" y="-8" width="26" height="15" rx="2" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
            <text y="-0.5" textAnchor="middle" fill="#f8fafc" fontSize="2.8" fontWeight="bold">Computer</text>
            <text y="3" textAnchor="middle" fill="#f8fafc" fontSize="2.8" fontWeight="bold">Lab</text>
          </g>

          {/* Auditorium (Right Bottom) */}
          <g transform="translate(82, 80)">
            <rect x="-14" y="-8" width="26" height="16" rx="2" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
            <text y="1" textAnchor="middle" fill="#f8fafc" fontSize="3.2" fontWeight="bold">Auditorium</text>
          </g>

          {/* Main Gate (Left Bottom) */}
          <g transform="translate(20, 80)">
            <rect x="-12" y="-4" width="24" height="8" rx="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
            <text y="1.2" textAnchor="middle" fill="#f8fafc" fontSize="3.0" fontWeight="bold">Main Gate</text>
          </g>

          {/* Dynamic Blocked Red Dashed Trajectory Line leading to obstacle only when avoiding obstacle */}
          {status === 'avoiding_obstacle' && obstacles && obstacles.length > 0 && (() => {
            const nearestObs = obstacles[obstacles.length - 1];
            const obsPt = toSvg(nearestObs.grid || nearestObs);
            return (
              <line
                x1={robotPt.x}
                y1={robotPt.y}
                x2={obsPt.x}
                y2={obsPt.y}
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeDasharray="2.5 1.5"
              />
            );
          })()}

          {/* Dynamic Active Glowing Cyan Navigation Route */}
          {activeRoute && activeRoute.length > 1 ? (
            <path
              d={activeRoute.reduce((acc, wp, idx) => {
                const pt = toSvg(wp.grid || wp);
                return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
              }, '')}
              fill="none"
              stroke="#00f2fe"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            currentDestination && (
              <line
                x1={robotPt.x}
                y1={robotPt.y}
                x2={toSvg(currentDestination.gridPos).x}
                y2={toSvg(currentDestination.gridPos).y}
                stroke="#00f2fe"
                strokeWidth="1.6"
                strokeDasharray="2 2"
              />
            )
          )}

          {/* Dynamic Obstacle Markers */}
          {obstacles && obstacles.map((obs, idx) => {
            const pt = toSvg(obs.grid || obs);
            return (
              <g key={obs.id || idx} transform={`translate(${pt.x}, ${pt.y})`}>
                <rect x="-3" y="-1.8" width="6" height="3.6" rx="0.8" fill="#dc2626" stroke="#ffffff" strokeWidth="0.6" />
                <circle cx="0" cy="0" r="1" fill="#ffffff" />
              </g>
            );
          })}

          {/* Dynamic Destination Pin (Only when destination is selected) */}
          {currentDestination && (() => {
            const destPt = toSvg(currentDestination.gridPos);
            return (
              <g transform={`translate(${destPt.x}, ${destPt.y})`}>
                <circle cx="0" cy="0" r="4.2" fill="none" stroke="#10b981" strokeWidth="0.8" opacity="0.6" className="animate-ping" />
                <circle cx="0" cy="0" r="3.2" fill="#10b981" stroke="#ffffff" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.2" fill="#ffffff" />
              </g>
            );
          })()}

          {/* Blue Robot Circular Marker with Direction Arrow */}
          <g transform={`translate(${robotPt.x}, ${robotPt.y}) rotate(${robotHeading})`}>
            <circle cx="0" cy="0" r="3.8" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.0" />
            <path d="M 0 -2.5 L 2 1.5 L 0 0.8 L -2 1.5 Z" fill="#ffffff" />
          </g>
        </svg>

        {/* Bottom Legend */}
        <div className="minimap-legend">
          <div className="legend-item">
            <span className="legend-dot bg-blue-500" />
            <span>Robot</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bg-emerald-500" />
            <span>Destination</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bg-red-500" />
            <span>Obstacle</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopViewMinimap;
