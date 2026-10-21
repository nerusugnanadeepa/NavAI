import { SUPPORTED_LANGUAGES, MULTILINGUAL_DICTIONARY } from './languages';

export class SpeechInputEngine {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isListening = false;
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
  }

  isSupported() {
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
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.onErrorCallback = onError;

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('Could not start recognition:', err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
    }
  }

  parseCommand(text) {
    if (!text) return { type: 'UNKNOWN', raw: '' };
    const clean = text.toLowerCase().trim();

    // 1. Destination Navigation Commands (multilingual)
    for (const [destId, keywords] of Object.entries(MULTILINGUAL_DICTIONARY.destinations)) {
      if (keywords.some(k => clean.includes(k.toLowerCase()))) {
        const destNames = {
          library: 'Library',
          classroom: 'Classroom Block',
          cafeteria: 'Cafeteria',
          main_gate: 'Main Gate'
        };
        return { type: 'NAVIGATE_TO', destinationId: destId, name: destNames[destId] };
      }
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
      return { type: 'MOVE_FORWARD' };
    }
    if (MULTILINGUAL_DICTIONARY.movements.backward.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'MOVE_BACKWARD' };
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
    if (MULTILINGUAL_DICTIONARY.controls.pause.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'PAUSE_NAVIGATION' };
    }
    if (MULTILINGUAL_DICTIONARY.controls.resume.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'RESUME_NAVIGATION' };
    }
    if (MULTILINGUAL_DICTIONARY.controls.reset.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'RESET_SIMULATION' };
    }
    if (MULTILINGUAL_DICTIONARY.controls.start.some(k => clean.includes(k.toLowerCase()))) {
      return { type: 'START_NAVIGATION' };
    }

    return { type: 'UNKNOWN', raw: text };
  }
}

export const speechInput = new SpeechInputEngine();
export default speechInput;
