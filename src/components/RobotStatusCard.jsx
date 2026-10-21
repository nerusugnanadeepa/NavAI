import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../voice/languages';

export function RobotStatusCard({
  status,
  currentDestination,
  locationDescription = 'Near Cafeteria',
  distanceLeft = '25 m',
  speed = '0.8 m/s',
  currentLanguage = 'en',
  onSelectLanguage
}) {
  const isNavigating = status === 'moving' || status === 'avoiding_obstacle' || status === 'planning';

  return (
    <div className="hud-card robot-status-hud-card">
      <div className="hud-card-header justify-between">
        <div className="flex items-center gap-2">
          <span className="hud-card-title">Robot Status</span>
          <span className={`status-pill ${isNavigating ? 'status-navigating' : 'status-ready'}`}>
            <span className="status-dot animate-pulse" />
            {isNavigating ? 'Navigating' : 'System Ready'}
          </span>
        </div>

        {/* Header Multilingual Selector Dropdown */}
        <div className="header-lang-selector-wrapper" title="Select Voice & Command Language">
          <Globe size={13} color="#06B6D4" />
          <select 
            className="header-lang-select"
            value={currentLanguage}
            onChange={(e) => onSelectLanguage && onSelectLanguage(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.name})
              </option>
            ))}
          </select>
          <ChevronDown size={11} className="header-lang-arrow" />
        </div>
      </div>

      <div className="robot-status-table">
        <div className="status-row">
          <span className="status-label">Current Location</span>
          <span className="status-val">{locationDescription}</span>
        </div>
        <div className="status-row">
          <span className="status-label">Destination</span>
          <span className="status-val text-cyan-400 font-semibold">
            {currentDestination ? currentDestination.name : 'None (Standing By)'}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">Distance Left</span>
          <span className="status-val font-mono">{distanceLeft}</span>
        </div>
        <div className="status-row">
          <span className="status-label">Speed</span>
          <span className="status-val font-mono">{speed}</span>
        </div>
      </div>
    </div>
  );
}

export default RobotStatusCard;
