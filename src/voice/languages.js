/**
 * NaviAI Multilingual Command & Voice System
 * Supported Languages: Telugu, English, Hindi, Malayalam, Tamil, Kannada
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'te', langTag: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
  { code: 'en', langTag: 'en-US', name: 'English', native: 'English' },
  { code: 'hi', langTag: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ml', langTag: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'ta', langTag: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', langTag: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' }
];

export const MULTILINGUAL_DICTIONARY = {
  // Destination Matchers
  destinations: {
    library: [
      // English
      'library',
      // Telugu
      'లైబ్రరీ', 'గ్రంథాలయం', 'పుస్తకాలయం',
      // Hindi
      'लाइब्रेरी', 'पुस्तकालय',
      // Malayalam
      'ലൈബ്രറി', 'വായനശാല', 'ഗ്രന്ഥശാല',
      // Tamil
      'நூலகம்', 'லைப்ரரி', 'புத்தகசாலை',
      // Kannada
      'ಗ್ರಂಥಾಲಯ', 'ಲೈಬ್ರರಿ', 'ಪುಸ್ತಕ ಭಂಡಾರ'
    ],
    classroom: [
      // English
      'classroom', 'class', 'lecture',
      // Telugu
      'తరగతి గది', 'క్లాస్‌రూమ్', 'క్లాస్',
      // Hindi
      'कक्षा', 'क्लास', 'क्लासरूम',
      // Malayalam
      'ക്ലാസ്സ് മുറി', 'ക്ലാസ്സ്', 'ക്ലാസ്റൂം',
      // Tamil
      'வகுப்பறை', 'வகுப்பு', 'கிளாஸ்ரூம்',
      // Kannada
      'ತರಗತಿ ಕೊಠಡಿ', 'ತರಗತಿ', 'ಕ್ಲಾಸ್‌ರೂಮ್'
    ],
    cafeteria: [
      // English
      'cafeteria', 'cafe', 'canteen', 'dining',
      // Telugu
      'కాఫెటేరియా', 'క్యాంటీన్', 'భోజనశాల',
      // Hindi
      'कैफेटेरिया', 'कैंटीन', 'भोजनालय',
      // Malayalam
      'കഫറ്റീരിയ', 'കാന്റീൻ', 'ഭക്ഷണശാല',
      // Tamil
      'உணவகம்', 'கேண்டீன்', 'சிற்றுண்டிச்சாலை',
      // Kannada
      'ಕ್ಯಾಂಟೀನ್', 'ಉಪಹಾರ ಗೃಹ', 'ಕೆಫೆಟೇರಿಯಾ'
    ],
    main_gate: [
      // English
      'main gate', 'gate', 'entrance',
      // Telugu
      'మెయిన్ గేట్', 'ప్రవేశ ద్వారం', 'గేటు',
      // Hindi
      'मुख्य द्वार', 'गेट', 'मेन गेट',
      // Malayalam
      'പ്രധാന കവാടം', 'മെയിൻ ഗേറ്റ്', 'ഗേറ്റ്',
      // Tamil
      'முதன்மை வாயில்', 'மெயின் கேட்', 'நுழைவாயில்',
      // Kannada
      'ಮುಖ್ಯ ದ್ವಾರ', 'ಮೇನ್ ಗೇಟ್', 'ಪ್ರವೇಶ ದ್ವಾರ', 'ಗೇಟ್'
    ]
  },

  // Directional Movement Matchers
  movements: {
    forward: [
      // English
      'forward', 'straight', 'ahead', 'go forward', 'move forward',
      // Telugu
      'ముందుకు', 'ముందుకు వెళ్ళు', 'స్ట్రెయిట్',
      // Hindi
      'आगे', 'आगे बढ़ो', 'सीधे', 'सीधे चलो',
      // Malayalam
      'മുന്നോട്ട്', 'മുന്നോട്ട് പോകുക', 'നേരെ പോകുക',
      // Tamil
      'முன்னோக்கி', 'முன்னோக்கி செல்', 'முன்னே போ', 'நேராக செல்',
      // Kannada
      'ಮುಂದೆ', 'ಮುಂದೆ ಹೋಗು', 'ನೇರವಾಗಿ ಹೋಗು'
    ],
    backward: [
      // English
      'backward', 'reverse', 'back', 'go back',
      // Telugu
      'వెనుకకు', 'వెనక్కి వెళ్ళు', 'రివర్స్',
      // Hindi
      'पीछे', 'पीछे जाओ', 'रिवर्स',
      // Malayalam
      'പുറകോട്ട്', 'പുറകോട്ട് പോകുക', 'പിന്നോട്ട്',
      // Tamil
      'பின்னோக்கி', 'பின்னோக்கி செல்', 'பின்னால் போ', 'ரிவர்ஸ்',
      // Kannada
      'ಹಿಂದೆ', 'ಹಿಂದೆ ಹೋಗು', 'ರಿವರ್ಸ್'
    ],
    turnLeft: [
      // English
      'turn left', 'left', 'rotate left',
      // Telugu
      'ఎడమవైపు తిరుగు', 'ఎడమకు తిరుగు', 'ఎడమ',
      // Hindi
      'बाएं मुड़ो', 'बाएं घूमो', 'बाएं', 'लेफ्ट',
      // Malayalam
      'ഇടത്തോട്ട് തിരിയുക', 'ഇടത്തോട്ട്', 'ഇടത്',
      // Tamil
      'இடதுபுறம் திரும்பு', 'இடப்பக்கம் திரும்பு', 'இடது',
      // Kannada
      'ಎಡಕ್ಕೆ ತಿರುಗು', 'ಎಡಕ್ಕೆ', 'ಎಡ'
    ],
    turnRight: [
      // English
      'turn right', 'right', 'rotate right',
      // Telugu
      'కుడివైపు తిరుగు', 'కుడికి తిరుగు', 'కుడి',
      // Hindi
      'दाएं मुड़ो', 'दाएं घूमो', 'दाएं', 'राइट',
      // Malayalam
      'വലത്തോട്ട് തിരിയുക', 'വലത്തോട്ട്', 'വലത്',
      // Tamil
      'வலதுபுறம் திரும்பு', 'வலப்பக்கம் திரும்பு', 'வலது',
      // Kannada
      'ಬಲಕ್ಕೆ ತಿರುಗು', 'ಬಲಕ್ಕೆ', 'ಬಲ'
    ]
  },

  // Control Matchers
  controls: {
    start: [
      // English
      'start', 'navigate', 'go', 'begin',
      // Telugu
      'ప్రారంభించు', 'వెళ్ళు', 'స్టార్ట్',
      // Hindi
      'शुरू करो', 'प्रारंभ करो', 'चलो',
      // Malayalam
      'തുടങ്ങുക', 'പോകുക', 'സ്റ്റാർട്ട്',
      // Tamil
      'தொடங்கு', 'போ', 'துவங்கு',
      // Kannada
      'ಪ್ರಾರಂಭಿಸು', 'ಹೋಗು', 'ಶುರು ಮಾಡು'
    ],
    pause: [
      // English
      'pause', 'stop', 'hold', 'halt', 'wait',
      // Telugu
      'ఆపు', 'విరామం', 'స్టాప్', 'ఆగు',
      // Hindi
      'रुको', 'रोकें', 'ठहरो', 'पॉज़',
      // Malayalam
      'നിർത്തുക', 'താൽക്കാലികമായി നിർത്തുക', 'പോസ്',
      // Tamil
      'நிறுத்து', 'தற்காலிகமாக நிறுத்து',
      // Kannada
      'ನಿಲ್ಲಿಸು', 'ತಡೆಹಿಡಿ', 'ವಿರಾಮ'
    ],
    resume: [
      // English
      'resume', 'continue', 'keep going',
      // Telugu
      'కొనసాగించు', 'మళ్ళీ ప్రారంభించు',
      // Hindi
      'जारी रखें', 'फिर से शुरू करो',
      // Malayalam
      'തുടരുക', 'വീണ്ടും തുടങ്ങുക',
      // Tamil
      'தொடரவும்', 'மீண்டும் தொடங்கு',
      // Kannada
      'ಮುಂದುವರಿಸು', 'ಪುನರಾರಂಭಿಸು'
    ],
    reset: [
      // English
      'reset', 'restart', 'origin', 'dock', 'home',
      // Telugu
      'రీసెట్ చేయి', 'మొదటి స్థానానికి', 'రీసెట్',
      // Hindi
      'रीसेट करो', 'शुरुआत पर जाओ', 'रीसेट',
      // Malayalam
      'റീസെറ്റ് ചെയ്യുക', 'ആദ്യ സ്ഥാനത്തേക്ക്',
      // Tamil
      'மீட்டமை', 'ஆரம்ப நிலைக்கு செல்',
      // Kannada
      'ರೀಸೆಟ್ ಮಾಡು', 'ಆರಂಭಿಕ ಸ್ಥಾನಕ್ಕೆ'
    ],
    addObstacle: [
      // English
      'add obstacle', 'obstacle', 'hazard', 'block',
      // Telugu
      'అడ్డంకిని జోడించు', 'అడ్డంకి',
      // Hindi
      'बाधा जोड़ें', 'रुकावट', 'खतरा',
      // Malayalam
      'തടസ്സം ചേർക്കുക', 'തടസ്സം',
      // Tamil
      'தடை சேர்', 'தடை',
      // Kannada
      'ಅಡಚಣೆ ಸೇರಿಸಿ', 'ತಡೆಗೋಡೆ'
    ],
    clearObstacles: [
      // English
      'clear obstacle', 'clear obstacles', 'remove obstacle', 'delete obstacle',
      // Telugu
      'అడ్డంకులను తొలగించు',
      // Hindi
      'बाधा हटाएं', 'रुकावटें साफ करें',
      // Malayalam
      'തടസ്സങ്ങൾ മാറ്റുക',
      // Tamil
      'தடைகளை நீக்கு',
      // Kannada
      'ಅಡಚಣೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ'
    ],
    speedUp: [
      // English
      'speed up', 'faster', 'accelerate',
      // Telugu
      'వేగం పెంచు', 'త్వరగా',
      // Hindi
      'गति बढ़ाओ', 'तेज करो',
      // Malayalam
      'വേഗത കൂട്ടുക', 'വേഗത്തിൽ',
      // Tamil
      'வேகத்தை கூட்டு', 'விரைவாக',
      // Kannada
      'ವೇಗ ಹೆಚ್ಚಿಸಿ', 'ವೇಗವಾಗಿ'
    ],
    slowDown: [
      // English
      'slow down', 'slower', 'decelerate',
      // Telugu
      'వేగం తగ్గించు', 'నెమ్మదిగా',
      // Hindi
      'गति कम करो', 'धीमे करो',
      // Malayalam
      'വേഗത കുറയ്ക്കുക', 'പതുക്കെ',
      // Tamil
      'வேகத்தை குறை', 'மெதுவாக',
      // Kannada
      'ವೇಗ ಕಡಿಮೆ ಮಾಡಿ', 'ನಿಧಾನವಾಗಿ'
    ]
  }
};

export const LANGUAGE_UI_TEXTS = {
  te: {
    commandPlaceholder: "'లైబ్రరీకి వెళ్ళు' లేదా 'ముందుకు వెళ్ళు', 'ఎడమవైపు తిరుగు'",
    sendBtn: 'పంపు',
    sampleVoice: 'చెప్పండి: "లైబ్రరీకి వెళ్ళు", "ముందుకు వెళ్ళు", "ఆపు"',
    quickPhrases: [
      'లైబ్రరీకి వెళ్ళు',
      'కాఫెటేరియాకి వెళ్ళు',
      'ముందుకు వెళ్ళు',
      'ఎడమవైపు తిరుగు',
      'కుడివైపు తిరుగు',
      'వెనక్కి వెళ్ళు',
      'ఆపు',
      'రీసెట్ చేయి'
    ],
    speech: {
      navStarted: (dest) => `${dest} కు నావిగేషన్ ప్రారంభించబడింది. సురక్షిత మార్గాన్ని లెక్కిస్తున్నాము.`,
      obstacleDetected: () => 'హెచ్చరిక: మార్గంలో అడ్డంకి కనుగొనబడింది. కొత్త మార్గం లెక్కిస్తున్నాము.',
      routeRecalculated: () => 'ప్రత్యామ్నాయ మార్గం సిద్ధమైంది. స్వయంప్రతిపత్తి నావిగేషన్ కొనసాగుతోంది.',
      destinationReached: (dest) => `లక్ష్యం చేరుకుంది: ${dest}. నావిగేషన్ విజయవంతంగా పూర్తయింది.`,
      noRoute: () => 'హెచ్చరిక: మార్గం మూసివేయబడింది. సురక్షిత మార్గం అందుబాటులో లేదు.',
      paused: () => 'నావిగేషన్ నిలిపివేయబడింది.',
      resumed: () => 'నావిగేషన్ తిరిగి ప్రారంభమైంది.',
      reset: () => 'సిమ్యులేషన్ రీసెట్ చేయబడింది.'
    }
  },
  en: {
    commandPlaceholder: "'Go to the library' or 'move forward', 'turn left'",
    sendBtn: 'Send',
    sampleVoice: 'Say: "Go to Library", "Move Forward", "Turn Left"',
    quickPhrases: [
      'Go to the Library',
      'Navigate to Cafeteria',
      'Move Forward',
      'Turn Left',
      'Turn Right',
      'Move Backward',
      'Pause Navigation',
      'Reset Simulation'
    ],
    speech: {
      navStarted: (dest) => `Navigation initiated towards ${dest}. Calculating collision-free route.`,
      obstacleDetected: () => 'Caution: Obstacle detected on active route. Recalculating path.',
      routeRecalculated: () => 'Alternative route calculated. Resuming autonomous navigation.',
      destinationReached: (dest) => `Destination reached: ${dest}. Navigation completed successfully.`,
      noRoute: () => 'Alert: Path is blocked. No safe alternative route found in the simulation.',
      paused: () => 'Navigation paused.',
      resumed: () => 'Navigation resumed.',
      reset: () => 'Simulation reset to origin dock.'
    }
  },
  hi: {
    commandPlaceholder: "'लाइब्रेरी जाओ' या 'आगे बढ़ो', 'बाएं मुड़ो'",
    sendBtn: 'भेजें',
    sampleVoice: 'बोलें: "लाइब्रेरी जाओ", "आगे बढ़ो", "रुको"',
    quickPhrases: [
      'लाइब्रेरी जाओ',
      'कैफेटेरिया जाओ',
      'आगे बढ़ो',
      'बाएं मुड़ो',
      'दाएं मुड़ो',
      'पीछे जाओ',
      'नेविगेशन रोकें',
      'रीसेट करो'
    ],
    speech: {
      navStarted: (dest) => `${dest} की ओर नेविगेशन शुरू हो गया है। सुरक्षित मार्ग की गणना की जा रही है।`,
      obstacleDetected: () => 'सावधान: रास्ते में रुकावट का पता चला है। नया मार्ग खोजा जा रहा है।',
      routeRecalculated: () => 'वैकल्पिक मार्ग मिल गया है। स्वायत्त नेविगेशन जारी है।',
      destinationReached: (dest) => `गंतव्य पहुंच गए: ${dest}। नेविगेशन सफलतापूर्वक पूरा हुआ।`,
      noRoute: () => 'चेतावनी: मार्ग अवरुद्ध है। कोई सुरक्षित रास्ता उपलब्ध नहीं है।',
      paused: () => 'नेविगेशन रोक दिया गया है।',
      resumed: () => 'नेविगेशन फिर से शुरू हो गया है।',
      reset: () => 'सिमुलेशन मूल डॉक पर रीसेट हो गया है।'
    }
  },
  ml: {
    commandPlaceholder: "'ലൈബ്രറിയിലേക്ക് പോകുക' അല്ലെങ്കിൽ 'മുന്നോട്ട് പോകുക'",
    sendBtn: 'അയക്കുക',
    sampleVoice: 'പറയുക: "ലൈബ്രറിയിലേക്ക് പോകുക", "മുന്നോട്ട്", "നിർത്തുക"',
    quickPhrases: [
      'ലൈബ്രറിയിലേക്ക് പോകുക',
      'കാന്റീനിലേക്ക് പോകുക',
      'മുന്നോട്ട് പോകുക',
      'ഇടത്തോട്ട് തിരിയുക',
      'വലത്തോട്ട് തിരിയുക',
      'പുറകോട്ട് പോകുക',
      'നിർത്തുക',
      'റീസെറ്റ് ചെയ്യുക'
    ],
    speech: {
      navStarted: (dest) => `${dest} ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. സുരക്ഷിത പാത കണ്ടെത്തുന്നു.`,
      obstacleDetected: () => 'ശ്രദ്ധിക്കുക: വഴിയിൽ തടസ്സം കണ്ടെത്തി. പുതിയ പാത കണ്ടെത്തുന്നു.',
      routeRecalculated: () => 'ഇതര പാത കണ്ടെത്തി. ഓട്ടോണമസ് നാവിഗേഷൻ തുടരുന്നു.',
      destinationReached: (dest) => `ലക്ഷ്യസ്ഥാനത്ത് എത്തി: ${dest}. നാവിഗേഷൻ വിജയകരമായി പൂർത്തിയായി.`,
      noRoute: () => 'മുന്നറിയിപ്പ്: വഴി തടസ്സപ്പെട്ടിരിക്കുന്നു. സുരക്ഷിതമായ പാത ലഭ്യമല്ല.',
      paused: () => 'നാവിഗേഷൻ നിർത്തിവെച്ചു.',
      resumed: () => 'നാവിഗേഷൻ പുനരാരംഭിച്ചു.',
      reset: () => 'സിമുലേഷൻ ആദ്യ സ്ഥാനത്തേക്ക് പുനഃക്രമീകരിച്ചു.'
    }
  },
  ta: {
    commandPlaceholder: "'நூலகத்திற்கு செல்' அல்லது 'முன்னோக்கி செல்'",
    sendBtn: 'அனுப்பு',
    sampleVoice: 'சொல்லுங்கள்: "நூலகத்திற்கு செல்", "முன்னோக்கி செல்", "நிறுத்து"',
    quickPhrases: [
      'நூலகத்திற்கு செல்',
      'உணவகத்திற்கு செல்',
      'முன்னோக்கி செல்',
      'இடதுபுறம் திரும்பு',
      'வலதுபுறம் திரும்பு',
      'பின்னோக்கி செல்',
      'நிறுத்து',
      'மீட்டமை'
    ],
    speech: {
      navStarted: (dest) => `${dest} நோக்கி வழிகாட்டல் தொடங்கியது. பாதுகாப்பான பாதை கணக்கிடப்படுகிறது.`,
      obstacleDetected: () => 'கவனம்: பாதையில் தடை கண்டறியப்பட்டது. மாற்றுப் பாதை கணக்கிடப்படுகிறது.',
      routeRecalculated: () => 'மாற்றுப் பாதை கண்டறியப்பட்டது. தன்னாட்சி வழிகாட்டல் தொடர்கிறது.',
      destinationReached: (dest) => `இலக்கை அடைந்தது: ${dest}. வழிகாட்டல் வெற்றிகரமாக முடிந்தது.`,
      noRoute: () => 'எச்சரிக்கை: பாதை அடைக்கப்பட்டுள்ளது. பாதுகாப்பான மாற்று வழி இல்லை.',
      paused: () => 'வழிகாட்டல் தற்காலிகமாக நிறுத்தப்பட்டது.',
      resumed: () => 'வழிகாட்டல் மீண்டும் தொடர்கிறது.',
      reset: () => 'உருவகப்படுத்துதல் ஆரம்ப நிலைக்கு மீட்டமைக்கப்பட்டது.'
    }
  },
  kn: {
    commandPlaceholder: "'ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗು' ಅಥವಾ 'ಮುಂದೆ ಹೋಗು'",
    sendBtn: 'ಕಳುಹಿಸು',
    sampleVoice: 'ಹೇಳಿ: "ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗು", "ಮುಂದೆ ಹೋಗು", "ನಿಲ್ಲಿಸು"',
    quickPhrases: [
      'ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗು',
      'ಕ್ಯಾಂಟೀನ್‌ಗೆ ಹೋಗು',
      'ಮುಂದೆ ಹೋಗು',
      'ಎಡಕ್ಕೆ ತಿರುಗು',
      'ಬಲಕ್ಕೆ ತಿರುಗು',
      'ಹಿಂದೆ ಹೋಗು',
      'ನಿಲ್ಲಿಸು',
      'ರೀಸೆಟ್ ಮಾಡು'
    ],
    speech: {
      navStarted: (dest) => `${dest} ಕಡೆಗೆ ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭವಾಗಿದೆ. ಸುರಕ್ಷಿತ ಮಾರ್ಗವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ.`,
      obstacleDetected: () => 'ಎಚ್ಚರಿಕೆ: ಮಾರ್ಗದಲ್ಲಿ ಅಡಚಣೆ ಕಂಡುಬಂದಿದೆ. ಹೊಸ ಮಾರ್ಗವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ.',
      routeRecalculated: () => 'ಪರ್ಯಾಯ ಮಾರ್ಗ ಸಿದ್ಧವಾಗಿದೆ. ಸ್ವಾಯತ್ತ ಚಾಲನೆ ಮುಂದುವರಿದಿದೆ.',
      destinationReached: (dest) => `ಗುರಿ ತಲುಪಿದೆ: ${dest}. ನ್ಯಾವಿಗೇಷನ್ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ.`
      ,
      noRoute: () => 'ಎಚ್ಚರಿಕೆ: ಮಾರ್ಗ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಯಾವುದೇ ಸುರಕ್ಷಿತ ಮಾರ್ಗ ಲಭ್ಯವಿಲ್ಲ.',
      paused: () => 'ನ್ಯಾವಿಗೇಷನ್ ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ.',
      resumed: () => 'ನ್ಯಾವಿಗೇಷನ್ ಪುನರಾರಂಭಗೊಂಡಿದೆ.',
      reset: () => 'ಸಿಮ್ಯುಲೇಶನ್ ಅನ್ನು ಪ್ರಾರಂಭಿಕ ಸ್ಥಾನಕ್ಕೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.'
    }
  }
};
