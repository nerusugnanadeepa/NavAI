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
  currentDestination,
  isListeningExternal
}) {
  const uiTexts = LANGUAGE_UI_TEXTS[currentLanguage] || LANGUAGE_UI_TEXTS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isSupported = speechInput.isSupported();

  const effectiveListening = isListeningExternal !== undefined ? isListeningExternal : isListening;

  // Default guidance text waiting for user speech
  const defaultGuidance = 'Listening for voice commands...';
  const displayGuidance = guidanceText || defaultGuidance;

  const handleToggleListen = () => {
    if (!isSupported) {
      speechOutput.speak(displayGuidance, true);
      return;
    }

    if (effectiveListening || speechInput.activeMode) {
      speechInput.setActiveConversationMode(false);
      speechInput.stopListening();
      setIsListening(false);
    } else {
      setErrorMessage('');
      setTranscript('');
      speechInput.setActiveConversationMode(true);
      const started = speechInput.startListening(
        ({ transcript: heardText, command }) => {
          setTranscript(`"${heardText}"`);
          if (onCommandRecognized) {
            onCommandRecognized(command, heardText);
          }
        },
        ({ state }) => {
          setIsListening(state === 'listening' || state === 'speaking' || state === 'processing');
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

  return (
    <div className="hud-card voice-assistant-card">
      <div className="hud-card-header justify-between">
        <span className="hud-card-title flex items-center gap-1.5">
          <Sparkles size={13} className="text-blue-400" />
          Voice Assistant
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
            effectiveListening
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-700/50 text-slate-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${effectiveListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {effectiveListening ? 'LISTENING' : 'READY'}
          </span>
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
        </div>
      </div>

      <div className="voice-assistant-body">
        {/* Glowing Blue Circular Mic Button */}
        <div className="voice-mic-column">
          <button
            type="button"
            className={`voice-circle-mic-btn ${effectiveListening ? 'listening' : ''}`}
            onClick={handleToggleListen}
            title={effectiveListening ? 'Voice Assistant active (listening)... Tap to pause' : 'Tap to activate voice assistant'}
          >
            {effectiveListening ? (
              <MicOff size={24} color="#ffffff" />
            ) : (
              <Mic size={24} color="#ffffff" />
            )}
            <div className="voice-mic-glow-ring" />
          </button>
        </div>

        {/* Live Spoken Guidance Typography */}
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
