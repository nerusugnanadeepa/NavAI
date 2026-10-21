import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  HelpCircle, 
  AlertCircle,
  Volume2
} from 'lucide-react';
import { speechInput } from '../voice/speechInput';
import { speechOutput } from '../voice/speechOutput';

export function VoiceAssistant({ onCommandRecognized }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const isSupported = speechInput.isSupported();

  const handleToggleListen = () => {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Use the UI controls.');
      return;
    }

    if (isListening) {
      speechInput.stopListening();
      setIsListening(false);
    } else {
      setErrorMessage('');
      setTranscript('Listening for command...');
      const started = speechInput.startListening(
        ({ transcript: heardText, command }) => {
          setTranscript(`"${heardText}"`);
          setLastCommand(command);
          if (onCommandRecognized) {
            onCommandRecognized(command, heardText);
          }
        },
        ({ state }) => {
          setIsListening(state === 'listening');
        },
        (error) => {
          setIsListening(false);
          setErrorMessage(`Mic notice: ${error}. Please check mic permissions.`);
        }
      );

      if (!started) {
        setIsListening(false);
      }
    }
  };

  const handleQuickCommand = (samplePhrase) => {
    const parsed = speechInput.parseCommand(samplePhrase);
    setTranscript(`"${samplePhrase}"`);
    setLastCommand(parsed);
    if (onCommandRecognized) {
      onCommandRecognized(parsed, samplePhrase);
    }
  };

  return (
    <div className="glass-panel">
      <div className="card-header">
        <h2 className="card-title">
          <Sparkles size={18} color="#A855F7" />
          Voice AI Assistant
        </h2>
        <span className="badge badge-planning" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
          Web Speech API
        </span>
      </div>

      <div className="card-body">
        {/* Mic control & waveform */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`btn btn-icon ${isListening ? 'btn-danger animate-pulse' : 'btn-cyan'}`}
            onClick={handleToggleListen}
            title={isListening ? 'Stop listening' : 'Start voice command'}
            style={isListening ? { background: '#EF4444', borderColor: '#EF4444' } : {}}
          >
            {isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} />}
          </button>

          <div className="flex-1">
            <div className="text-xs font-semibold text-white-soft">
              {isListening ? 'Listening for voice command...' : 'Click mic to speak command'}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {transcript || 'Say: "Go to Library", "Pause", "Reset"'}
            </div>
          </div>

          {isListening && (
            <div className="voice-wave-container">
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
            </div>
          )}
        </div>

        {/* Last recognized command tag */}
        {lastCommand && lastCommand.type !== 'UNKNOWN' && (
          <div className="system-stat-pill justify-between bg-purple-950/40 border-purple-500/40 text-xs text-purple-300">
            <span>Action: <strong>{lastCommand.type}</strong></span>
            {lastCommand.name && <span>Target: <strong>{lastCommand.name}</strong></span>}
          </div>
        )}

        {/* Quick click suggestions (Voice simulation/touch fallback) */}
        <div>
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <HelpCircle size={12} />
            <span>Try spoken or simulated voice commands:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Go to Library',
              'Navigate to Cafeteria',
              'Move Forward',
              'Turn Left',
              'Turn Right',
              'Move Backward',
              'Pause Navigation',
              'Resume Navigation',
              'Reset Simulation',
              'Add Obstacle'
            ].map((phrase) => (
              <button
                key={phrase}
                type="button"
                className="hud-btn"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => handleQuickCommand(phrase)}
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>

        {/* Error notification if mic unsupported or blocked */}
        {errorMessage && (
          <div className="simulation-disclaimer border-amber-500/50 text-amber-300 text-xs">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceAssistant;
