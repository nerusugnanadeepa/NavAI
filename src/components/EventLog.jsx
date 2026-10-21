import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Compass, 
  Play, 
  RotateCcw,
  Volume2
} from 'lucide-react';

export function EventLog({ events, onClear }) {
  const [filter, setFilter] = useState('all');
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return ev.type === 'alert' || ev.type === 'obstacle';
    if (filter === 'nav') return ev.type === 'nav' || ev.type === 'route';
    return true;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'alert':
      case 'obstacle':
        return <AlertTriangle size={14} color="#F59E0B" />;
      case 'success':
        return <Check size={14} color="#10B981" />;
      case 'route':
        return <Compass size={14} color="#06B6D4" />;
      case 'voice':
        return <Volume2 size={14} color="#A855F7" />;
      case 'reset':
        return <RotateCcw size={14} color="#94A3B8" />;
      default:
        return <Play size={14} color="#3B82F6" />;
    }
  };

  return (
    <div className="glass-panel">
      <div className="card-header">
        <h2 className="card-title">
          <Terminal size={18} className="card-title-icon" />
          Simulation Event Log
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`hud-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`hud-btn ${filter === 'alerts' ? 'active' : ''}`}
            onClick={() => setFilter('alerts')}
          >
            Alerts
          </button>
          <button
            type="button"
            className={`hud-btn ${filter === 'nav' ? 'active' : ''}`}
            onClick={() => setFilter('nav')}
          >
            Nav
          </button>
          <button
            type="button"
            className="hud-btn"
            onClick={onClear}
            title="Clear event log"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="event-log-container" ref={logContainerRef}>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-mono">
              No navigation events logged yet. Select a destination to begin.
            </div>
          ) : (
            filteredEvents.map((ev, index) => (
              <div key={ev.id || index} className="event-log-row">
                <span className="event-log-time">{ev.time}</span>
                <span className="flex-shrink-0 mt-0.5">{getEventIcon(ev.type)}</span>
                <span className="event-log-msg">{ev.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EventLog;
