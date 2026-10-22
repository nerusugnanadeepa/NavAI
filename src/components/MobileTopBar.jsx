import React from 'react';
import { 
  MapPin, 
  Volume2, 
  VolumeX, 
  Globe, 
  ChevronDown,
  HelpCircle,
  ShieldAlert,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../voice/languages';

export function MobileTopBar({
  status,
  currentDestination,
  currentLanguage = 'en',
  onSelectLanguage,
  isMuted,
  onToggleMute,
  onOpenDestinations,
  onOpenHelp,
  distanceLeft
}) {
  const isNavigating = status === 'moving' || status === 'avoiding_obstacle' || status === 'planning';
  const isObstacle = status === 'avoiding_obstacle';

  const getStatusBadge = () => {
    if (isObstacle) {
      return (
        <span className="mobile-status-pill status-obstacle animate-pulse">
          <ShieldAlert size={10} className="flex-shrink-0" />
          <span>Obstacle</span>
        </span>
      );
    }
    if (isNavigating) {
      return (
        <span className="mobile-status-pill status-moving">
          <span className="mobile-status-dot animate-pulse" />
          <span>Navigating</span>
        </span>
      );
    }
    if (status === 'arrived') {
      return (
        <span className="mobile-status-pill status-arrived">
          <CheckCircle2 size={10} className="flex-shrink-0" />
          <span>Arrived</span>
        </span>
      );
    }
    return (
      <span className="mobile-status-pill status-ready">
        <span className="mobile-status-dot" />
        <span>Ready</span>
      </span>
    );
  };

  return (
    <header className="mobile-top-bar">
      {/* Left: Brand Logo & Status */}
      <div className="flex items-center gap-2">

        <div className="mobile-brand-wrapper">
          <div className="mobile-brand-disc">
            <div className="mobile-brand-dot" />
          </div>
          <div className="mobile-brand-text">
            <span className="mobile-brand-name">Navi<span>AI</span></span>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      {/* Center: Destination Quick-Select Pill */}
      <button
        type="button"
        className="mobile-dest-pill"
        onClick={onOpenDestinations}
        title="Tap to change destination"
      >
        <MapPin size={12} className="text-cyan-400 flex-shrink-0" />
        <span className="mobile-dest-name truncate">
          {currentDestination ? currentDestination.name : 'Select Dest'}
        </span>
        {currentDestination && distanceLeft && (
          <span className="mobile-dest-dist font-mono">{distanceLeft}</span>
        )}
      </button>

      {/* Right: Audio Mute + Language Dropdown + Help */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={`mobile-icon-btn ${isMuted ? 'text-amber-400' : 'text-slate-300'}`}
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
          title={isMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        <div className="mobile-lang-wrap">
          <Globe size={13} className="mobile-lang-icon" />
          <select
            className="mobile-lang-select"
            value={currentLanguage}
            onChange={(e) => onSelectLanguage && onSelectLanguage(e.target.value)}
            aria-label="Select voice and UI language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.code.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown size={10} className="mobile-lang-chevron" />
        </div>

        <button
          type="button"
          className="mobile-icon-btn"
          onClick={onOpenHelp}
          aria-label="Open Help and Guide"
          title="Help & Info"
        >
          <HelpCircle size={17} />
        </button>
      </div>
    </header>
  );
}

export default MobileTopBar;
