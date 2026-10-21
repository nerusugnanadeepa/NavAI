import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  AlertCircle 
} from 'lucide-react';
import { speechInput } from '../voice/speechInput';
import { speechOutput } from '../voice/speechOutput';
import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS } from '../voice/languages';

export function VoiceAssistant({ 
  onCommandRecognized, 
  currentLanguage = 'en',
  guidanceText,
  status = 'idle',
  currentDestination
}) {
  const uiTexts = LANGUAGE_UI_TEXTS[currentLanguage] || LANGUAGE_UI_TEXTS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isSupported = speechInput.isSupported();

  // Reference image text fallback
  const defaultGuidance = uiTexts.speech?.obstacleDetected
    ? uiTexts.speech.obstacleDetected(currentDestination?.name || 'Library', 'right')
    : 'Obstacle ahead. Recalculating route.\nTurn right and continue towards Library.';

  const displayGuidance = guidanceText || defaultGuidance;

  const handleToggleListen = () => {
    if (!isSupported) {
      // If mic not supported, speak the guidance text as an audio demonstration
      speechOutput.speak(displayGuidance, true);
      return;
    }

    if (isListening) {
      speechInput.stopListening();
      setIsListening(false);
    } else {
      setErrorMessage('');
      setTranscript('Listening for voice command...');
      const started = speechInput.startListening(
        ({ transcript: heardText, command }) => {
          setTranscript(`"${heardText}"`);
          if (onCommandRecognized) {
            onCommandRecognized(command, heardText);
          }
        },
        ({ state }) => {
          setIsListening(state === 'listening');
        },
        (error) => {
          setIsListening(false);
          setErrorMessage(`Mic notice: ${error}`);
        }
      );

      if (!started) {
        setIsListening(false);
      }
    }
  };

  const handleSpeakGuidance = (e) => {
    e.stopPropagation();
    speechOutput.speak(displayGuidance, true);
  };

  const handleQuickCommand = (samplePhrase) => {
    const parsed = speechInput.parseCommand(samplePhrase);
    setTranscript(`"${samplePhrase}"`);
    if (onCommandRecognized) {
      onCommandRecognized(parsed, samplePhrase);
    }
  };

  return (
    <div className="hud-card voice-assistant-card">
      <div className="hud-card-header justify-between">
        <span className="hud-card-title flex items-center gap-1.5">
          <Sparkles size={13} className="text-blue-400" />
          Voice Assistant
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="hud-mini-btn"
            onClick={handleSpeakGuidance}
            title="Read guidance aloud"
          >
            <Volume2 size={12} />
          </button>
          <button
            type="button"
            className="hud-mini-btn"
            onClick={() => setShowQuickPhrases(!showQuickPhrases)}
            title="Toggle Quick Voice Phrases"
          >
            <HelpCircle size={12} />
          </button>
        </div>
      </div>

      <div className="voice-assistant-body">
        {/* Glowing Blue Circular Mic Button (Matches Reference Image exactly!) */}
        <div className="voice-mic-column">
          <button
            type="button"
            className={`voice-circle-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleToggleListen}
            title={isListening ? 'Stop listening' : 'Click to speak or listen'}
          >
            {isListening ? (
              <MicOff size={24} color="#ffffff" />
            ) : (
              <Mic size={24} color="#ffffff" />
            )}
            <div className="voice-mic-glow-ring" />
          </button>
        </div>

        {/* Live Spoken Guidance Typography (Matches Reference Image!) */}
        <div className="voice-guidance-content">
          <p className="voice-guidance-text">
            {displayGuidance}
          </p>
          {transcript && (
            <p className="voice-transcript-sub">
              Heard: {transcript}
            </p>
          )}
        </div>
      </div>

      {/* Expandable Multilingual Quick Command Pills */}
      {showQuickPhrases && (
        <div className="voice-quick-phrases-panel">
          <div className="text-[10px] text-slate-400 mb-1 font-semibold flex items-center justify-between">
            <span>Quick Spoken Commands ({currentLangObj.native}):</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {uiTexts.quickPhrases.slice(0, 6).map((phrase) => (
              <button
                key={phrase}
                type="button"
                className="voice-quick-pill"
                onClick={() => handleQuickCommand(phrase)}
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="voice-error-text">
          <AlertCircle size={11} className="inline mr-1" />
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default VoiceAssistant;
