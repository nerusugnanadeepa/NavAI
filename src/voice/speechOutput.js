/**
 * NaviAI Voice Guidance Engine (Speech Output)
 * Uses the Web Speech API (window.speechSynthesis)
 */

class SpeechOutputEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
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

  initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer clear English neural/natural voices if available
    const preferredVoice = voices.find(
      v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural')) && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
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

  speak(text, priority = false) {
    if (!this.synth || this.isMuted || !text) return;

    try {
      if (priority) {
        this.synth.cancel(); // Cancel ongoing utterance for urgent alerts
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) utterance.voice = this.voice;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error or blocked by browser policy:', err);
    }
  }

  // Pre-configured voice announcements
  speakNavStarted(destinationName) {
    this.speak(`Navigation initiated towards ${destinationName}. Calculating collision-free route.`, true);
  }

  speakObstacleDetected() {
    this.speak('Caution: Obstacle detected on active route. Recalculating path.', true);
  }

  speakRouteRecalculated() {
    this.speak('Alternative route calculated. Resuming autonomous navigation.', true);
  }

  speakDestinationReached(destinationName) {
    this.speak(`Destination reached: ${destinationName}. Navigation completed successfully.`, true);
  }

  speakNoRoute() {
    this.speak('Alert: Path is blocked. No safe alternative route found in the simulation.', true);
  }

  speakPaused() {
    this.speak('Navigation paused.');
  }

  speakResumed() {
    this.speak('Navigation resumed.');
  }

  speakSimulationReset() {
    this.speak('Simulation reset to origin dock.');
  }
}

export const speechOutput = new SpeechOutputEngine();
export default speechOutput;
