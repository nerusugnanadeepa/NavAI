import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Coffee, 
  DoorOpen, 
  MapPin, 
  Navigation
} from 'lucide-react';
import { DESTINATIONS } from '../simulation/simulationController';

const ICON_MAP = {
  library: BookOpen,
  classroom: GraduationCap,
  cafeteria: Coffee,
  main_gate: DoorOpen
};

export function DestinationSelector({ currentDestination, onSelect, disabled }) {
  return (
    <div className="glass-panel">
      <div className="card-header">
        <h2 className="card-title">
          <MapPin size={18} className="card-title-icon" />
          Where do you want to go?
        </h2>
        {currentDestination && (
          <span className="badge badge-planning">
            Target: {currentDestination.name}
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="destination-grid">
          {DESTINATIONS.map((dest) => {
            const Icon = ICON_MAP[dest.id] || Navigation;
            const isSelected = currentDestination?.id === dest.id;

            return (
              <button
                key={dest.id}
                type="button"
                className={`destination-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelect(dest.id)}
                disabled={disabled}
                aria-pressed={isSelected}
              >
                <div className="destination-card-top">
                  <div className="destination-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <span className="font-mono text-xs" style={{ color: dest.color }}>
                    {dest.estimatedDist}
                  </span>
                </div>
                <div className="destination-name">{dest.name}</div>
                <div className="destination-meta">{dest.category}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DestinationSelector;
