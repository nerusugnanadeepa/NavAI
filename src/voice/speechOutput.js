import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS, translateDirection, translateTurn } from './languages';

class SpeechOutputEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
    this.currentLang = 'en';
    this.voice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;

    if (this.synth) {
      this.initVoice();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }

    if (typeof window !== 'undefined') {
      window.onAndroidTtsStart = () => {
        if (this.onSpeechStart) this.onSpeechStart();
      };
      window.onAndroidTtsEnd = () => {
        if (this.onSpeechEnd) this.onSpeechEnd();
      };
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
    if (typeof window !== 'undefined' && window.AndroidNativeSpeech && typeof window.AndroidNativeSpeech.speak === 'function') {
      return true;
    }
    return Boolean(this.synth);
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      if (this.synth) {
        this.synth.cancel();
      }
      if (typeof window !== 'undefined' && window.AndroidNativeSpeech && typeof window.AndroidNativeSpeech.stopSpeaking === 'function') {
        window.AndroidNativeSpeech.stopSpeaking();
      }
    }
  }

  getMuted() {
    return this.isMuted;
  }

  getTexts() {
    return LANGUAGE_UI_TEXTS[this.currentLang] || LANGUAGE_UI_TEXTS.en;
  }

  speak(text, priority = false) {
    if (this.isMuted || !text) return;

    // 1. Direct Native Android TTS (No browser autoplay block, direct device speaker output)
    if (typeof window !== 'undefined' && window.AndroidNativeSpeech && typeof window.AndroidNativeSpeech.speak === 'function') {
      try {
        if (priority && typeof window.AndroidNativeSpeech.stopSpeaking === 'function') {
          window.AndroidNativeSpeech.stopSpeaking();
        }
        const langObj = SUPPORTED_LANGUAGES.find(l => l.code === this.currentLang) || SUPPORTED_LANGUAGES[0];
        const langTag = langObj ? langObj.langTag : 'en-US';
        if (this.onSpeechStart) this.onSpeechStart();
        window.AndroidNativeSpeech.speak(text, langTag);
        return;
      } catch (err) {
        console.warn('Native Android TTS error, falling back to Web Speech API:', err);
      }
    }

    if (!this.synth) return;

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

      utterance.onstart = () => {
        if (this.onSpeechStart) this.onSpeechStart();
      };
      utterance.onend = () => {
        if (this.onSpeechEnd) this.onSpeechEnd();
      };
      utterance.onerror = () => {
        if (this.onSpeechEnd) this.onSpeechEnd();
      };

      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error or blocked by browser policy:', err);
      if (this.onSpeechEnd) this.onSpeechEnd();
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

  speakGreeting() {
    const greetings = {
      en: 'Hello! I am NaviAI, your autonomous campus navigation robot. How can I help you today? You can ask me to navigate to any building or control my movement.',
      te: 'నమస్కారం! నేను NaviAI, మీ క్యాంపస్ నావిగేషన్ రోబోట్. నేను మీకు ఎలా సహాయపడగలను?',
      hi: 'नमस्ते! मैं NaviAI हूँ, आपका कैंपस नेविगेशन रोबोट। मैं आपकी क्या मदद कर सकता हूँ?',
      ml: 'നമസ്കാരം! ഞാൻ NaviAI ആണ്, ക്യാമ്പസ് നാവിഗേഷൻ റോബോട്ട്. എനിക്ക് എന്ത് സഹായം വേണം?',
      ta: 'வணக்கம்! நான் NaviAI, வளாக வழிசெலுத்தல் ரோபோ. நான் உங்களுக்கு எப்படி உதவ முடியும்?',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು NaviAI, ಕ್ಯಾಂಪಸ್ ನ್ಯಾವಿಗೇಷನ್ ರೋಬೋಟ್. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?'
    };
    const text = greetings[this.currentLang] || greetings.en;
    this.speak(text, true);
    return text;
  }

  speakStatus(location = 'Near Cafeteria', status = 'idle', destination = null) {
    const statusMap = {
      idle: 'standing by at origin dock',
      planning: 'planning route',
      moving: 'navigating towards destination',
      avoiding_obstacle: 'avoiding obstacle and following alternate detour',
      arrived: 'arrived at destination',
      paused: 'paused'
    };
    const friendlyStatus = statusMap[status] || status;
    const destStr = destination ? `Destination is ${destination}.` : 'No destination selected.';
    const text = `We are currently located near ${location}. Robot status is ${friendlyStatus}. ${destStr}`;
    this.speak(text, true);
    return text;
  }

  speakIdentity() {
    const text = 'I am NaviAI, a vision-based autonomous campus navigation robot powered by 3D spatial perception and multilingual voice guidance.';
    this.speak(text, true);
    return text;
  }

  speakHelp() {
    const text = 'You can ask me to navigate to the Library, Cafeteria, Computer Lab, Auditorium, or Main Gate. You can also tell me to move forward, backward, turn left, turn right, speed up, or stop.';
    this.speak(text, true);
    return text;
  }

  speakStopped() {
    const texts = {
      en: 'Navigation stopped. Active route canceled. Standing by for instructions.',
      te: 'నావిగేషన్ ఆపివేయబడింది. తదుపరి ఆదేశాల కోసం వేచి ఉన్నాను.',
      hi: 'नेविगेशन रोक दिया गया है। अगले निर्देश की प्रतीक्षा है।',
      ml: 'നാവിഗേഷൻ നിർത്തി. നിർദ്ദേശങ്ങൾക്കായി കാത്തിരിക്കുന്നു.',
      ta: 'வழிசெலுத்தல் நிறுத்தப்பட்டது. புதிய கட்டளைக்காக காத்திருக்கிறது.',
      kn: 'ನ್ಯಾವಿಗೇಷನ್ ನಿಲ್ಲಿಸಲಾಗಿದೆ. ಸೂಚನೆಗಳಿಗಾಗಿ ಕಾಯುತ್ತಿದ್ದೇನೆ.'
    };
    const text = texts[this.currentLang] || texts.en;
    this.speak(text, true);
    return text;
  }

  speakSpeedChanged(speedMultiplier = 1.0) {
    const speedMps = (0.8 * speedMultiplier).toFixed(1);
    const text = `Speed updated to ${speedMps} meters per second.`;
    this.speak(text, true);
    return text;
  }

  speakUnknown(heardText) {
    const text = `I heard: ${heardText}. You can say: Go to Library, Move forward, Turn left, or Stop.`;
    this.speak(text, true);
    return text;
  }
}

export const speechOutput = new SpeechOutputEngine();
export default speechOutput;
