import { SUPPORTED_LANGUAGES, MULTILINGUAL_DICTIONARY } from './languages';

export class SpeechInputEngine {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isListening = false;
    this.activeMode = false;
    this.isSpeakingPaused = false;
    this.currentLang = 'en';
    this.onResultCallback = null;
    this.onStateChangeCallback = null;
    this.onErrorCallback = null;

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyState('listening');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyState('idle');
        if (this.activeMode && !this.isSpeakingPaused) {
          setTimeout(() => {
            if (this.activeMode && !this.isListening && !this.isSpeakingPaused) {
              try {
                this.recognition.start();
              } catch {
                // Ignore restart conflict
              }
            }
          }, 400);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        this.notifyState('error', event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        const command = this.parseCommand(transcript);
        if (this.onResultCallback) {
          this.onResultCallback({ transcript, command });
        }
      };
    }

    if (typeof window !== 'undefined') {
      window.onAndroidMicPermissionResult = (granted) => {
        if (granted) {
          this.notifyState('idle');
          if (this.pendingStartListening) {
            this.pendingStartListening = false;
            this.startListening(this.onResultCallback, this.onStateChangeCallback, this.onErrorCallback);
          }
        } else {
          this.isListening = false;
          this.pendingStartListening = false;
          this.notifyState('error', 'Microphone permission denied');
          if (this.onErrorCallback) {
            this.onErrorCallback('Microphone permission denied');
          }
        }
      };
    }
  }

  isSupported() {
    if (typeof window !== 'undefined' && window.AndroidNativeSpeech) {
      return true;
    }
    return Boolean(this.recognition);
  }

  setLanguage(langCode) {
    this.currentLang = langCode;
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (this.recognition && langObj) {
      this.recognition.lang = langObj.langTag;
    }
  }

  notifyState(state, detail = null) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({ state, detail });
    }
  }

  startListening(onResult, onStateChange, onError) {
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === this.currentLang) || SUPPORTED_LANGUAGES[0];
    const langTag = langObj.langTag || 'en-US';

    // 1. Check if running inside Android APK with native Android SpeechRecognizer
    if (typeof window !== 'undefined' && window.AndroidNativeSpeech) {
      window.onAndroidSpeechResult = (text) => {
        const transcript = text ? text.trim() : '';
        const command = this.parseCommand(transcript);
        this.isListening = false;
        this.notifyState('idle');
        if (this.onResultCallback) {
          this.onResultCallback({ transcript, command });
        }
        if (this.activeMode && !this.isSpeakingPaused) {
          setTimeout(() => {
            if (this.activeMode && !this.isListening && !this.isSpeakingPaused) {
              try {
                window.AndroidNativeSpeech.startListening(langTag);
                this.isListening = true;
                this.notifyState('listening');
              } catch {
                // ignore
              }
            }
          }, 600);
        }
      };

      window.onAndroidSpeechPartialResult = (partialText) => {
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback({ state: 'listening', partial: partialText });
        }
      };

      window.onAndroidSpeechState = (state) => {
        this.isListening = (state === 'listening' || state === 'speaking' || state === 'processing');
        this.notifyState(state);
      };

      window.onAndroidSpeechError = (errorMsg) => {
        this.isListening = false;
        this.notifyState('error', errorMsg);
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMsg);
        }
        if (this.activeMode && !this.isSpeakingPaused) {
          setTimeout(() => {
            if (this.activeMode && !this.isListening && !this.isSpeakingPaused) {
              try {
                window.AndroidNativeSpeech.startListening(langTag);
                this.isListening = true;
                this.notifyState('listening');
              } catch {
                // ignore
              }
            }
          }, 600);
        }
      };

      try {
        window.AndroidNativeSpeech.startListening(langTag);
        this.isListening = true;
        this.notifyState('listening');
        return true;
      } catch (err) {
        console.warn('Native Android speech start error:', err);
        if (onError) onError(err.message || 'Error starting Android microphone');
        return false;
      }
    }

    // 2. Standard Web Speech API (Chrome / Edge / Safari)
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      this.recognition.lang = langTag;
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Could not start recognition:', err);
      return false;
    }
  }

  stopListening() {
    if (typeof window !== 'undefined' && window.AndroidNativeSpeech) {
      try {
        window.AndroidNativeSpeech.stopListening();
      } catch (e) {}
      this.isListening = false;
      this.notifyState('idle');
      return;
    }

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
    }
  }

  setActiveConversationMode(enabled, onResult, onStateChange, onError) {
    this.activeMode = Boolean(enabled);
    if (onResult) this.onResultCallback = onResult;
    if (onStateChange) this.onStateChangeCallback = onStateChange;
    if (onError) this.onErrorCallback = onError;

    if (this.activeMode) {
      this.startListening(this.onResultCallback, this.onStateChangeCallback, this.onErrorCallback);
    } else {
      this.stopListening();
    }
  }

  pauseForSpeech(isSpeaking) {
    this.isSpeakingPaused = Boolean(isSpeaking);
    if (isSpeaking) {
      if (this.isListening) {
        this.stopListening();
      }
    } else {
      if (this.activeMode && !this.isListening) {
        setTimeout(() => {
          if (this.activeMode && !this.isListening && !this.isSpeakingPaused) {
            this.startListening(this.onResultCallback, this.onStateChangeCallback, this.onErrorCallback);
          }
        }, 400);
      }
    }
  }

  parseCommand(text) {
    if (!text) return { type: 'UNKNOWN', raw: '' };

    // Normalize text: lowercase, strip zero-width characters and punctuation
    const clean = text
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract optional step count for directional movement (e.g. "forward 2", "ముందుకు 3")
    let steps = 1;
    const digitMatch = clean.match(/(\d+)/);
    if (digitMatch) {
      const n = parseInt(digitMatch[1], 10);
      if (n > 0 && n <= 10) steps = n;
    } else if (clean.includes('one') || clean.includes('ఒక') || clean.includes('एक') || clean.includes('ഒന്ന്') || clean.includes('ஒன்று') || clean.includes('ಒಂದು')) {
      steps = 1;
    } else if (clean.includes('two') || clean.includes('రెండు') || clean.includes('दो') || clean.includes('രണ്ട്') || clean.includes('இரண்டு') || clean.includes('ಎರಡು')) {
      steps = 2;
    } else if (clean.includes('three') || clean.includes('మూడు') || clean.includes('तीन') || clean.includes('മൂന്ന്') || clean.includes('மூன்று') || clean.includes('ಮೂರು')) {
      steps = 3;
    } else if (clean.includes('four') || clean.includes('నాలుగు') || clean.includes('चार') || clean.includes('നാല്') || clean.includes('நான்கு') || clean.includes('ನಾಲ್ಕು')) {
      steps = 4;
    } else if (clean.includes('five') || clean.includes('ఐదు') || clean.includes('पाँच') || clean.includes('അഞ്ച്') || clean.includes('ஐந்து') || clean.includes('ಐದು')) {
      steps = 5;
    }

    // 1. Conversational Queries & Greetings (multilingual)
    if (MULTILINGUAL_DICTIONARY.conversational?.greeting.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'GREETING', raw: text };
    }
    if (MULTILINGUAL_DICTIONARY.conversational?.status.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'STATUS_QUERY', raw: text };
    }
    if (MULTILINGUAL_DICTIONARY.conversational?.identity.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'IDENTITY_QUERY', raw: text };
    }
    if (MULTILINGUAL_DICTIONARY.conversational?.help.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'HELP_QUERY', raw: text };
    }

    // 2. Clear / Remove Obstacles (multilingual)
    if (MULTILINGUAL_DICTIONARY.controls.clearObstacles.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'REMOVE_OBSTACLE' };
    }

    // 3. Add Obstacle (multilingual)
    if (MULTILINGUAL_DICTIONARY.controls.addObstacle.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'ADD_OBSTACLE' };
    }

    // 4. Directional Movements (multilingual)
    if (MULTILINGUAL_DICTIONARY.movements.forward.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'MOVE_FORWARD', steps };
    }
    if (MULTILINGUAL_DICTIONARY.movements.backward.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'MOVE_BACKWARD', steps };
    }
    if (MULTILINGUAL_DICTIONARY.movements.turnLeft.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'TURN_LEFT' };
    }
    if (MULTILINGUAL_DICTIONARY.movements.turnRight.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'TURN_RIGHT' };
    }

    // 5. Speed Adjustments (multilingual)
    if (MULTILINGUAL_DICTIONARY.controls.speedUp.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'SPEED_UP' };
    }
    if (MULTILINGUAL_DICTIONARY.controls.slowDown.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'SLOW_DOWN' };
    }

    // 6. Navigation Control Commands (multilingual)
    if (MULTILINGUAL_DICTIONARY.controls.stop && MULTILINGUAL_DICTIONARY.controls.stop.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'STOP_NAVIGATION' };
    }
    if (MULTILINGUAL_DICTIONARY.controls.pause.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'PAUSE_NAVIGATION' };
    }
    if (MULTILINGUAL_DICTIONARY.controls.resume.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'RESUME_NAVIGATION' };
    }
    if (MULTILINGUAL_DICTIONARY.controls.reset.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'RESET_SIMULATION' };
    }
    // 5. Destination Navigation Commands (multilingual for Library, Cafeteria, Computer Lab, Auditorium, Main Gate)
    for (const [destId, keywords] of Object.entries(MULTILINGUAL_DICTIONARY.destinations)) {
      if (keywords.some(k => {
        const normK = k.toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        return clean.includes(normK);
      })) {
        const destNames = {
          library: 'Library',
          cafeteria: 'Cafeteria',
          computer_lab: 'Computer Lab',
          classroom: 'Computer Lab',
          auditorium: 'Auditorium',
          main_gate: 'Main Gate'
        };
        const actualDestId = destId === 'classroom' ? 'computer_lab' : destId;
        return { type: 'NAVIGATE_TO', destinationId: actualDestId, name: destNames[destId] };
      }
    }

    if (MULTILINGUAL_DICTIONARY.controls.start.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'START_NAVIGATION' };
    }

    return { type: 'UNKNOWN', raw: text };
  }
}

export const speechInput = new SpeechInputEngine();
export default speechInput;
