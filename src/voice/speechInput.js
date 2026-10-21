/**
 * NaviAI Voice Recognition Engine (Speech Input)
 * Uses browser SpeechRecognition or webkitSpeechRecognition
 */

export class SpeechInputEngine {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    this.recognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.isListening = false;
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
    const clean = text.toLowerCase();

    // Check Destination commands
    if (clean.includes('library')) {
      return { type: 'SELECT_DESTINATION', destinationId: 'library', name: 'Library' };
    }
    if (clean.includes('classroom') || clean.includes('class')) {
      return { type: 'SELECT_DESTINATION', destinationId: 'classroom', name: 'Classroom Block' };
    }
    if (clean.includes('cafeteria') || clean.includes('cafe') || clean.includes('canteen')) {
      return { type: 'SELECT_DESTINATION', destinationId: 'cafeteria', name: 'Cafeteria' };
    }
    if (clean.includes('main gate') || clean.includes('gate') || clean.includes('entrance')) {
      return { type: 'SELECT_DESTINATION', destinationId: 'main_gate', name: 'Main Gate' };
    }

    // Check Navigation Control commands
    if (clean.includes('start') || clean.includes('navigate') || clean.includes('go')) {
      return { type: 'START_NAVIGATION' };
    }
    if (clean.includes('pause') || clean.includes('hold') || clean.includes('stop')) {
      return { type: 'PAUSE_NAVIGATION' };
    }
    if (clean.includes('resume') || clean.includes('continue')) {
      return { type: 'RESUME_NAVIGATION' };
    }
    if (clean.includes('reset') || clean.includes('restart') || clean.includes('origin')) {
      return { type: 'RESET_SIMULATION' };
    }
    // Prioritize removal commands first
    if (
      clean.includes('remove obstacle') || 
      clean.includes('clear obstacle') || 
      clean.includes('clear obstacles') || 
      clean.includes('delete obstacle')
    ) {
      return { type: 'REMOVE_OBSTACLE' };
    }
    // Then check obstacle injection commands
    if (
      clean.includes('add obstacle') || 
      clean.includes('block') || 
      clean.includes('hazard') || 
      clean.includes('obstacle')
    ) {
      return { type: 'ADD_OBSTACLE' };
    }

    return { type: 'UNKNOWN', raw: text };
  }
}

export const speechInput = new SpeechInputEngine();
export default speechInput;
