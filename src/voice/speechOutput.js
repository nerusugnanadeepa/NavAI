import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS, translateDirection, translateTurn } from './languages';

class SpeechOutputEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
    this.currentLang = 'en';
    this.voice = null;
    this.rate = 1.0;
    this.pitch = 1.0;

    if (this.synth) {
      this.initVoice();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  setLanguage(langCode) {
    this.currentLang = langCode;
    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === this.currentLang) || SUPPORTED_LANGUAGES[0];
    const prefix = langObj.code;
    const fullTag = langObj.langTag;

    const preferredVoice = voices.find(v => v.lang === fullTag)
      || voices.find(v => v.lang.startsWith(prefix))
      || voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural')) && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];

    this.voice = preferredVoice || null;
  }

  isSupported() {
    return Boolean(this.synth);
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  getTexts() {
    return LANGUAGE_UI_TEXTS[this.currentLang] || LANGUAGE_UI_TEXTS.en;
  }

  speak(text, priority = false) {
    if (!this.synth || this.isMuted || !text) return;

    try {
      if (priority) {
        this.synth.cancel(); // Cancel ongoing utterance for urgent alerts
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === this.currentLang);
      if (langObj) utterance.lang = langObj.langTag;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error or blocked by browser policy:', err);
    }
  }

  // Multilingual voice announcements with direction & detour details
  speakNavStarted(destinationName, direction = 'North', location = 'Campus Dock') {
    const speechFn = this.getTexts().speech?.navStarted;
    const translatedDir = translateDirection(direction, this.currentLang);
    const text = typeof speechFn === 'function'
      ? speechFn(destinationName, translatedDir, location)
      : `Navigation started towards ${destinationName}. Heading ${translatedDir} from ${location}.`;
    this.speak(text, true);
    return text;
  }

  speakObstacleDetected(obstacleLabel = 'Road Barricade', destinationName = 'Library', detourDir = 'right', pathway = 'East Pathway', direction = 'North') {
    const speechFn = this.getTexts().speech?.obstacleDetected;
    const translatedDetour = translateTurn(detourDir, this.currentLang);
    const translatedDir = translateDirection(direction, this.currentLang);
    const text = typeof speechFn === 'function'
      ? speechFn(obstacleLabel, destinationName, translatedDetour, pathway, translatedDir)
      : `Obstacle detected ahead: ${obstacleLabel} is blocking the direct path to ${destinationName}! Recalculating alternate route.`;
    this.speak(text, true);
    return text;
  }

  speakAlternateRoute(detourDir = 'right', pathway = 'East Pathway', destinationName = 'Library', direction = 'North') {
    const speechFn = this.getTexts().speech?.alternateRoute;
    const translatedDetour = translateTurn(detourDir, this.currentLang);
    const translatedDir = translateDirection(direction, this.currentLang);
    const text = typeof speechFn === 'function'
      ? speechFn(translatedDetour, pathway, destinationName, translatedDir)
      : `Taking alternate route: turning ${translatedDetour} via ${pathway} heading ${translatedDir} towards ${destinationName}.`;
    this.speak(text, true);
    return text;
  }

  speakTurnGuidance(turnDir = 'right', newDir = 'North', pathway = 'Campus Walkway', destinationName = 'Library') {
    const speechFn = this.getTexts().speech?.turnGuidance;
    const translatedTurn = translateTurn(turnDir, this.currentLang);
    const translatedDir = translateDirection(newDir, this.currentLang);
    const text = typeof speechFn === 'function'
      ? speechFn(translatedTurn, translatedDir, pathway, destinationName)
      : `Turning ${translatedTurn} onto ${pathway}, heading ${translatedDir} towards ${destinationName}.`;
    this.speak(text, false);
    return text;
  }

  speakManualMove(action = 'forward', direction = 'North') {
    const speechFn = this.getTexts().speech?.manualMove;
    const translatedDir = translateDirection(direction, this.currentLang);
    const text = typeof speechFn === 'function'
      ? speechFn(action, translatedDir)
      : (action === 'backward' ? 'Moving backward in reverse.' : `Moving forward 1 step, heading ${translatedDir}.`);
    this.speak(text, true);
    return text;
  }

  speakManualTurn(turnDir = 'right', newDir = 'North') {
    const speechFn = this.getTexts().speech?.manualTurn;
    const translatedTurn = translateTurn(turnDir, this.currentLang);
    const translatedDir = translateDirection(newDir, this.currentLang);
    const text = typeof speechFn === 'function'
      ? speechFn(translatedTurn, translatedDir)
      : `Turned ${translatedTurn} 90 degrees. Robot is now facing ${translatedDir}.`;
    this.speak(text, true);
    return text;
  }

  speakObstacleBlockedMove() {
    const speechFn = this.getTexts().speech?.obstacleBlockedMove;
    const text = typeof speechFn === 'function'
      ? speechFn()
      : 'Cannot move forward: obstacle detected directly ahead!';
    this.speak(text, true);
    return text;
  }

  speakObstacleAdded(label = 'Hazard') {
    const speechFn = this.getTexts().speech?.obstacleAdded;
    const text = typeof speechFn === 'function'
      ? speechFn(label)
      : `Obstacle placed: ${label} on campus grid. Scanning path for conflicts.`;
    this.speak(text, true);
    return text;
  }

  speakObstaclesCleared(destinationName = 'Library') {
    const speechFn = this.getTexts().speech?.obstaclesCleared;
    const text = typeof speechFn === 'function'
      ? speechFn(destinationName)
      : `Obstacles cleared. Resuming direct optimal path towards ${destinationName}.`;
    this.speak(text, true);
    return text;
  }

  speakDestinationReached(destinationName) {
    const speechFn = this.getTexts().speech?.destinationReached;
    const text = typeof speechFn === 'function'
      ? speechFn(destinationName)
      : `Destination reached: You have safely arrived at ${destinationName}! Navigation completed successfully.`;
    this.speak(text, true);
    return text;
  }

  speakNoRoute() {
    const text = this.getTexts().speech.noRoute();
    this.speak(text, true);
    return text;
  }

  speakPaused() {
    const text = this.getTexts().speech.paused();
    this.speak(text, true);
    return text;
  }

  speakResumed(destinationName = 'Destination', direction = 'North') {
    const speechFn = this.getTexts().speech?.resumed;
    const translatedDir = translateDirection(direction, this.currentLang);
    const text = typeof speechFn === 'function'
      ? speechFn(destinationName, translatedDir)
      : `Navigation resumed towards ${destinationName}, heading ${translatedDir}.`;
    this.speak(text, true);
    return text;
  }

  speakSimulationReset() {
    const text = this.getTexts().speech.reset();
    this.speak(text, true);
    return text;
  }
}

export const speechOutput = new SpeechOutputEngine();
export default speechOutput;
