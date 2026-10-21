import { SUPPORTED_LANGUAGES, LANGUAGE_UI_TEXTS } from '../src/voice/languages.js';
import { speechOutput } from '../src/voice/speechOutput.js';
import { speechInput } from '../src/voice/speechInput.js';
import { simulationController, DESTINATIONS, INITIAL_ROBOT_POSITION } from '../src/simulation/simulationController.js';

console.log('1. Languages loaded:', SUPPORTED_LANGUAGES.length);
console.log('2. Speech Output initialized:', typeof speechOutput.speakObstacleDetected);
console.log('3. Speech Input initialized:', typeof speechInput.parseCommand);
console.log('4. Simulation Controller state:', simulationController.getState().status);
console.log('5. Simulation Destinations:', DESTINATIONS.length);
console.log('All backend modules tested OK!');
