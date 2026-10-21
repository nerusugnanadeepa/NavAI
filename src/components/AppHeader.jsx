import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Volume2, 
  VolumeX, 
  Battery, 
  Wifi, 
  Compass, 
  Radio, 
  ShieldAlert,
  HelpCircle,
  Mic,
  Globe,
  ChevronDown
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS } from '../voice/languages';

export function AppHeader({ 
  status, 
  isMuted, 
  onToggleMute, 
  onOpenHelp, 
  stats,
  onExecuteCommand,
  isListening,
  onToggleVoice,
  currentLanguage = 'en',
  onSelectLanguage
}) {
  const uiTexts = LANGUAGE_UI_TEXTS[currentLanguage] || LANGUAGE_UI_TEXTS.en;
  const [commandText, setCommandText] = useState(uiTexts.quickPhrases[0] || 'Go to the library');

  useEffect(() => {
    const texts = LANGUAGE_UI_TEXTS[currentLanguage] || LANGUAGE_UI_TEXTS.en;
    setCommandText(texts.quickPhrases[0] || 'Go to the library');
  }, [currentLanguage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commandText.trim() && onExecuteCommand) {
      onExecuteCommand(commandText.trim());
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'moving':
        return <span className="badge badge-moving"><Radio size={12} className="animate-pulse" /> Autonomous Moving</span>;
      case 'avoiding_obstacle':
        return <span className="badge badge-avoiding_obstacle"><ShieldAlert size={12} /> Recalculating Path</span>;
      case 'arrived':
        return <span className="badge badge-arrived"><Compass size={12} /> Arrived At Goal</span>;
      case 'planning':
        return <span className="badge badge-planning"><Radio size={12} /> Calculating A* Path</span>;
      case 'paused':
        return <span className="badge badge-paused">Navigation Paused</span>;
      case 'no_route':
        return <span className="badge badge-no_route">No Route Available</span>;
      default:
        return <span className="badge badge-idle">System Ready</span>;
    }
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon-wrapper">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="brand-title">
            Navi<span>AI</span>
          </h1>
          <p className="brand-tagline">Your Voice. Your Vision. Your Way.</p>
        </div>
      </div>
 
      {/* Center Interactive Command Bar (Matches Picture!) */}
      <div className="header-command-container">
        <form className="header-command-bar" onSubmit={handleSubmit}>
          <button
            type="button"
            className={`command-mic-btn ${isListening ? 'listening animate-pulse' : ''}`}
            onClick={onToggleVoice}
            title={isListening ? 'Listening for speech command...' : 'Click to speak command'}
          >
            <Mic size={17} />
          </button>
          <input
            type="text"
            className="command-input"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            placeholder={uiTexts.commandPlaceholder}
          />
          <button type="submit" className="command-send-btn">
            {uiTexts.sendBtn}
          </button>
        </form>
      </div>

      <div className="header-status-group">
        {getStatusBadge()}

        <div className="system-stat-pill" title="Telemetry Signal">
          <Wifi size={14} color="#06B6D4" />
          <span>Link: <strong>99.8%</strong></span>
        </div>

        <div className="system-stat-pill" title="Virtual Robot Battery">
          <Battery size={14} color="#10B981" />
          <span>Power: <strong>{stats?.batteryPercent ?? 94}%</strong></span>
        </div>

        {/* Language Selector Dropdown (Matches Reference Picture!) */}
        <div className="header-lang-selector-wrapper" title="Select Voice & Command Language">
          <Globe size={14} color="#06B6D4" />
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
          <ChevronDown size={12} className="header-lang-arrow" />
        </div>

        <button 
          className="btn btn-outline btn-icon text-cyan-400"
          onClick={onOpenHelp}
          title="Open Simulation Guide"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>

        <button 
          className={`btn btn-outline btn-icon ${isMuted ? 'text-slate-400' : 'text-cyan-500'}`}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Voice Guidance' : 'Mute Voice Guidance'}
          aria-label={isMuted ? 'Unmute Voice' : 'Mute Voice'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} color="#06B6D4" />}
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
