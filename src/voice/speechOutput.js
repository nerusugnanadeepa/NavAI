import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS } from './languages';

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

  // Multilingual voice announcements
  speakNavStarted(destinationName) {
    const text = this.getTexts().speech.navStarted(destinationName);
    this.speak(text, true);
  }

  speakObstacleDetected(destinationName = 'Library', direction = 'right') {
    const speechFn = this.getTexts().speech.obstacleDetected;
    const text = typeof speechFn === 'function' ? speechFn(destinationName, direction) : 'Obstacle ahead. Recalculating route.';
    this.speak(text, true);
    return text;
  }

  speakTurnGuidance(direction = 'right', landmark = 'Library') {
    const speechFn = this.getTexts().speech.turnGuidance;
    const text = typeof speechFn === 'function' ? speechFn(direction, landmark) : `Turn ${direction} towards ${landmark}.`;
    this.speak(text, false);
    return text;
  }

  speakRouteRecalculated(destinationName = 'Library') {
    const speechFn = this.getTexts().speech.routeRecalculated;
    const text = typeof speechFn === 'function' ? speechFn(destinationName) : 'Alternative route calculated.';
    this.speak(text, true);
    return text;
  }

  speakDestinationReached(destinationName) {
    const text = this.getTexts().speech.destinationReached(destinationName);
    this.speak(text, true);
  }

  speakNoRoute() {
    const text = this.getTexts().speech.noRoute();
    this.speak(text, true);
  }

  speakPaused() {
    const text = this.getTexts().speech.paused();
    this.speak(text);
  }

  speakResumed() {
    const text = this.getTexts().speech.resumed();
    this.speak(text);
  }

  speakSimulationReset() {
    const text = this.getTexts().speech.reset();
    this.speak(text);
  }
}

export const speechOutput = new SpeechOutputEngine();
export default speechOutput;
