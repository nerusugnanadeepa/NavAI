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
  // Destination Matchers (All campus destinations from reference layout)
  destinations: {
    library: [
      // English
      'library', 'lib', 'books', 'book', 'reading room', 'study room',
      // Telugu
      'లైబ్రరీ', 'లైబ్రరీకి', 'లైబ్రరి', 'గ్రంథాలయం', 'గ్రంథాలయానికి', 'గ్రంథాలయము', 'పుస్తకాలయం', 'పుస్తకాలు',
      // Hindi
      'लाइब्रेरी', 'पुस्तकालय', 'किताब', 'किताबें', 'वाचनालय',
      // Malayalam
      'ലൈബ്രറി', 'ലൈബ്രറിയിലേക്ക്', 'വായനശാല', 'വായനശാലയിലേക്ക്', 'ഗ്രന്ഥശാല', 'പുസ്തകം',
      // Tamil
      'நூலகம்', 'நூலகத்திற்கு', 'நூலகத்துக்கு', 'லைப்ரரி', 'புத்தகசாலை', 'புத்தகம்',
      // Kannada
      'ಗ್ರಂಥಾಲಯ', 'ಗ್ರಂಥಾಲಯಕ್ಕೆ', 'ಲೈಬ್ರರಿ', 'ಲೈಬ್ರರಿಗೆ', 'ಪುಸ್ತಕ ಭಂಡಾರ', 'ಪುಸ್ತಕ'
    ],
    cafeteria: [
      // English
      'cafeteria', 'cafe', 'canteen', 'dining', 'dining commons', 'food', 'lunch', 'coffee', 'tea', 'eat', 'mess', 'breakfast',
      // Telugu
      'కాఫెటేరియా', 'కాఫెటేరియాకి', 'క్యాంటీన్', 'క్యాంటీన్‌కి', 'క్యాంటీన్కి', 'క్యాంటీనుకి', 'భోజనశాల', 'భోజనం', 'ఆహారం', 'టిఫిన్', 'కాఫీ',
      // Hindi
      'कैफेटेरिया', 'कैंटीन', 'भोजनालय', 'खाना', 'लंच', 'कॉफी', 'चाय', 'नाश्ता', 'मेस',
      // Malayalam
      'കഫറ്റീരിയ', 'കഫറ്റീരിയയിലേക്ക്', 'കാന്റീൻ', 'കാന്റീനിലേക്ക്', 'ഭക്ഷണശാല', 'ഭക്ഷണം', 'ചായ', 'ഊണ്',
      // Tamil
      'உணவகம்', 'உணவகத்திற்கு', 'உணவகத்துக்கு', 'கேண்டீன்', 'கேண்டீனுக்கு', 'சிற்றுண்டிச்சாலை', 'சாப்பாடு', 'உணவு', 'காபி',
      // Kannada
      'ಕ್ಯಾಂಟೀನ್', 'ಕ್ಯಾಂಟೀನ್‌ಗೆ', 'ಕೆಫೆಟೇರಿಯಾ', 'ಕೆಫೆಟೇರಿಯಾಗೆ', 'ಉಪಹಾರ ಗೃಹ', 'ಊಟದ ಮನೆ', 'ಊಟ', 'ತಿಂಡಿ', 'ಕಾಫಿ'
    ],
    computer_lab: [
      // English
      'computer lab', 'lab', 'computing', 'ai lab', 'computer', 'labs', 'classroom', 'class',
      // Telugu
      'కంప్యూటర్ ల్యాబ్', 'ల్యాబ్', 'కంప్యూటర్ ల్యాబ్‌కి', 'క్లాస్‌రూమ్', 'క్లాస్', 'తరగతి గది',
      // Hindi
      'कंप्यूटर लैब', 'लैब', 'कंप्यूटर लैब जाओ', 'क्लासरूम', 'कक्षा',
      // Malayalam
      'കംപ്യൂട്ടർ ലാബ്', 'ലാബ്', 'കംപ്യൂട്ടർ ലാബിലേക്ക്', 'ക്ലാസ്സ് മുറി',
      // Tamil
      'கணினி ஆய்வகம்', 'கம்ப்யூட்டர் லேப்', 'லேப்', 'வகுப்பறை',
      // Kannada
      'ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್', 'ಲ್ಯಾಬ್', 'ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್‌ಗೆ', 'ತರಗತಿ ಕೊಠಡಿ'
    ],
    auditorium: [
      // English
      'auditorium', 'audi', 'hall', 'seminar hall', 'theater', 'stage',
      // Telugu
      'ఆడిటోరియం', 'సభాభవనం', 'ఆడిటోరియంకి', 'హాల్',
      // Hindi
      'ऑडिटोरियम', 'सभागार', 'ऑडिटोरियम जाओ', 'हॉल',
      // Malayalam
      'ഓഡിറ്റോറിയം', 'സഭാ ഹാൾ', 'ഓഡിറ്റോറിയത്തിലേക്ക്',
      // Tamil
      'அரங்கம்', 'ஆடிட்டோரியம்', 'கூடத்திற்கு செல்', 'ஹால்',
      // Kannada
      'ಆಡಿಟೋರಿಯಂ', 'ಸಭಾಂಗಣ', 'ಆಡಿಟೋರಿಯಂಗೆ', 'ಹಾಲ್'
    ],
    main_gate: [
      // English
      'main gate', 'gate', 'entrance', 'entry', 'exit', 'north gate', 'front gate', 'door', 'outside', 'arch',
      // Telugu
      'మెయిన్ గేట్', 'మెయిన్ గేట్‌కి', 'గేట్', 'గేటు', 'గేటుకి', 'గేట్‌కి', 'ప్రవేశ ద్వారం', 'ప్రవేశ ద్వారానికి', 'బయట',
      // Hindi
      'मुख्य द्वार', 'गेट', 'मेन गेट', 'प्रवेश द्वार', 'निकास द्वार', 'दरवाजा', 'बाहर',
      // Malayalam
      'പ്രധാന കവാടം', 'പ്രധാന കവാടത്തിലേക്ക്', 'മെയിൻ ഗേറ്റ്', 'ഗേറ്റ്', 'ഗേറ്റിലേക്ക്', 'പ്രവേശന കവാടം', 'വാതിൽ',
      // Tamil
      'முதன்மை வாயில்', 'முதன்மை வாயிலுக்கு', 'மெயின் கேட்', 'கேட்', 'கேட்டுக்கு', 'நுழைவாயில்', 'நுழைவாயிலுக்கு', 'கதவு',
      // Kannada
      'ಮುಖ್ಯ ದ್ವಾರ', 'ಮುಖ್ಯ ದ್ವಾರಕ್ಕೆ', 'ಮೇನ್ ಗೇಟ್', 'ಗೇಟ್', 'ಗೇಟ್‌ಗೆ', 'ಪ್ರವೇಶ ದ್ವಾರ', 'ಬಾಗಿಲು'
    ]
  },

  // Directional Movement Matchers
  movements: {
    forward: [
      'forward', 'straight', 'ahead', 'go forward', 'move forward', 'step forward', 'advance',
      'ముందుకు', 'ముందుకు వెళ్ళు', 'ముందుకు పో', 'స్ట్రెయిట్', 'ముందు',
      'आगे', 'आगे बढ़ो', 'सीधे', 'सीधे चलो', 'आगे चलो',
      'മുന്നോട്ട്', 'മുന്നോട്ട് പോകുക', 'നേരെ', 'നേരെ പോകുക',
      'முன்னோக்கி', 'முன்னோக்கி செல்', 'முன்னே போ', 'நேராக',
      'ಮುಂದೆ', 'ಮುಂದೆ ಹೋಗು', 'ನೇರವಾಗಿ', 'ನೇರವಾಗಿ ಹೋಗು'
    ],
    backward: [
      'backward', 'reverse', 'back', 'go back', 'move back', 'step back',
      'వెనుకకు', 'వెనక్కి వెళ్ళు', 'వెనక్కి', 'రివర్స్',
      'पीछे', 'पीछे जाओ', 'पीछे हटो', 'रिवर्स',
      'പുറകോട്ട്', 'പുറകോട്ട് പോകുക', 'പിന്നോട്ട്', 'റിവേഴ്സ്',
      'பின்னோக்கி', 'பின்னோக்கி செல்', 'பின்னால் போ', 'ரிவர்ஸ்',
      'ಹಿಂದೆ', 'ಹಿಂದೆ ಹೋಗು', 'ಹಿಂದಕ್ಕೆ', 'ರಿವರ್ಸ್'
    ],
    turnLeft: [
      'turn left', 'left', 'rotate left', 'spin left', 'go left',
      'ఎడమవైపు తిరుగు', 'ఎడమకు తిరుగు', 'ఎడమవైపు', 'ఎడమకు', 'ఎడమ',
      'बाएं मुड़ो', 'बाएं घूमो', 'बाएं', 'लेफ्ट',
      'ഇടത്തോട്ട് തിരിയുക', 'ഇടത്തോട്ട്', 'ഇടത്',
      'இடதுபுறம் திரும்பு', 'இடப்பக்கம் திரும்பு', 'இடது',
      'ಎಡಕ್ಕೆ ತಿರುಗು', 'ಎಡಕ್ಕೆ', 'ಎಡ'
    ],
    turnRight: [
      'turn right', 'right', 'rotate right', 'spin right', 'go right',
      'కుడివైపు తిరుగు', 'కుడికి తిరుగు', 'కుడివైపు', 'కుడికి', 'కుడి',
      'दाएं मुड़ो', 'दाएं घूमो', 'दाएं', 'राइट',
      'വലത്തോട്ട് തിരിയുക', 'വലത്തോട്ട്', 'വലത്',
      'வலதுபுறம் திரும்பு', 'வலப்பக்கம் திரும்பு', 'வலது',
      'ಬಲಕ್ಕೆ ತಿರುಗು', 'ಬಲಕ್ಕೆ', 'ಬಲ'
    ]
  },

  // Control Matchers
  controls: {
    start: [
      'start', 'navigate', 'go', 'begin', 'drive',
      'ప్రారంభించు', 'వెళ్ళు', 'స్టార్ట్',
      'शुरू करो', 'प्रारंभ करो', 'चलो',
      'തുടങ്ങുക', 'പോകുക', 'സ്റ്റാർട്ട്',
      'தொடங்கு', 'போ', 'துவங்கு',
      'ಪ್ರಾರಂಭಿಸು', 'ಹೋಗು', 'ಶುರು ಮಾಡು'
    ],
    pause: [
      'pause', 'hold', 'wait', 'freeze',
      'విరామం', 'ఆగు',
      'ठहरो', 'पॉज़',
      'താൽക്കാലികമായി നിർത്തുക', 'പോസ്',
      'தற்காலிகமாக நிறுத்து', 'நில்',
      'ತಡೆಹಿಡಿ', 'ವಿರಾಮ', 'ನಿಲ್ಲು'
    ],
    stop: [
      'stop', 'halt', 'cancel', 'terminate', 'end navigation',
      'ఆపు', 'స్టాప్', 'రద్దు చేయి',
      'रुको', 'रोकें', 'रोक दो', 'बंद करो',
      'നിർത്തുക', 'സ്റ്റോപ്പ്', 'റദ്ദാക്കുക',
      'நிறுத்து', 'ஸ்டாப்', 'ரத்து செய்',
      'ನಿಲ್ಲಿಸು', 'ಸ್ಟಾಪ್', 'ರದ್ದುಮಾಡು'
    ],
    resume: [
      'resume', 'continue', 'keep going', 'proceed',
      'కొనసాగించు', 'మళ్ళీ ప్రారంభించు',
      'जारी रखें', 'फिर से शुरू करो',
      'തുടരുക', 'വീണ്ടും തുടങ്ങുക',
      'தொடரவும்', 'மீண்டும் தொடங்கு',
      'ಮುಂದುವರಿಸು', 'ಪುನರಾರಂಭಿಸು'
    ],
    reset: [
      'reset', 'restart', 'origin', 'dock', 'home',
      'రీసెట్ చేయి', 'మొదటి స్థానానికి', 'రీసెట్',
      'रीसेट करो', 'शुरुआत पर जाओ', 'रीसेट',
      'റീസെറ്റ് ചെയ്യുക', 'ആദ്യ സ്ഥാനത്തേക്ക്',
      'மீட்டமை', 'ஆரம்ப நிலைக்கு செல்',
      'ರೀಸೆಟ್ ಮಾಡು', 'ಆರಂಭಿಕ ಸ್ಥಾನಕ್ಕೆ'
    ],
    addObstacle: [
      'add obstacle', 'obstacle', 'hazard', 'block', 'barricade',
      'అడ్డంకిని జోడించు', 'అడ్డంకి',
      'बाधा जोड़ें', 'रुकावट', 'खतरा',
      'തടസ്സം ചേർക്കുക', 'തടസ്സം',
      'தடை சேர்', 'தடை',
      'ಅಡಚಣೆ ಸೇರಿಸಿ', 'ತಡೆಗೋಡೆ'
    ],
    clearObstacles: [
      'clear obstacle', 'clear obstacles', 'remove obstacle', 'delete obstacle',
      'అడ్డంకులను తొలగించు',
      'बाधा हटाएं', 'रुकावटें साफ करें',
      'തടസ്സങ്ങൾ മാറ്റുക',
      'தடைகளை நீக்கு',
      'ಅಡಚಣೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ'
    ],
    speedUp: [
      'speed up', 'faster', 'accelerate',
      'వేగం పెంచు', 'త్వరగా',
      'गति बढ़ाओ', 'तेज करो',
      'വേഗത കൂട്ടുക', 'വേഗത്തിൽ',
      'வேகத்தை கூட்டு', 'விரைவாக',
      'ವೇಗ ಹೆಚ್ಚಿಸಿ', 'ವೇಗವಾಗಿ'
    ],
    slowDown: [
      'slow down', 'slower', 'decelerate',
      'వేగం తగ్గించు', 'నెమ్మదిగా',
      'गति कम करो', 'धीमे करो',
      'വേഗത കുറയ്ക്കുക', 'പതുക്കെ',
      'வேகத்தை குறை', 'மெதுவாக',
      'ವೇಗ ಕಡಿಮೆ ಮಾಡಿ', 'ನಿಧಾನವಾಗಿ'
    ]
  },
  conversational: {
    greeting: [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'నమస్కారం', 'హలో', 'బాగున్నారా',
      'नमस्ते', 'हेलो', 'प्रणाम',
      'നമസ്കാരം', 'ഹലോ',
      'வணக்கம்', 'ஹலோ',
      'ನಮಸ್ಕಾರ', 'ಹಲೋ'
    ],
    status: [
      'status', 'where are we', 'where am i', 'location', 'what is your status', 'position',
      'ఎక్కడ ఉన్నాం', 'స్థితి ఏమిటి', 'ఎక్కడున్నావ్',
      'कहाँ हैं', 'स्थिति क्या है', 'कहाँ पर हैं',
      'എവിടെയാണ്', 'നിലവിലെ സ്ഥാനം',
      'எங்கே இருக்கிறோம்', 'தற்போதைய நிலை',
      'ಎಲ್ಲಿದ್ದೇವೆ', 'ಸ್ಥಿತಿ ಏನು'
    ],
    identity: [
      'who are you', 'what is your name', 'what are you',
      'నువ్వు ఎవరు', 'నీ పేరు ఏమిటి',
      'तुम कौन हो', 'तुम्हारा नाम क्या है', 'आप कौन हैं',
      'ആരാണ് നിങ്ങൾ', 'നിന്റെ പേരെന്താണ്',
      'நீ யார்', 'உன் பெயர் என்ன',
      'ನೀವು ಯಾರು', 'ನಿಮ್ಮ ಹೆಸರೇನು'
    ],
    help: [
      'help', 'what can you do', 'commands', 'how to use', 'instructions',
      'సహాయం', 'కమాండ్స్', 'ఎలా వాడాలి',
      'मदद', 'सहायता', 'क्या कर सकते हो',
      'സഹായം', 'എന്തൊക്കെ ചെയ്യാം',
      'உதவி', 'என்ன செய்ய முடியும்',
      'ಸಹಾಯ', 'ಏನು ಮಾಡಬಹುದು'
    ]
  }
};

export const DIRECTION_TRANSLATIONS = {
  North: { en: 'North', te: 'ఉత్తరం', hi: 'उत्तर', ml: 'വടക്ക്', ta: 'வடக்கு', kn: 'ಉತ್ತರ' },
  South: { en: 'South', te: 'దక్షిణం', hi: 'दक्षिण', ml: 'തെക്ക്', ta: 'தெற்கு', kn: 'ದಕ್ಷಿಣ' },
  East: { en: 'East', te: 'తూర్పు', hi: 'पूर्व', ml: 'കിഴക്ക്', ta: 'கிழக்கு', kn: 'ಪೂರ್ವ' },
  West: { en: 'West', te: 'పడమర', hi: 'पश्चिम', ml: 'പടിഞ്ഞാറ്', ta: 'மேற்கு', kn: 'ಪಶ್ಚಿಮ' },
  'North-East': { en: 'North-East', te: 'ఈశాన్యం', hi: 'उत्तर-पूर्व', ml: 'വടക്കുകിഴക്ക്', ta: 'வடகிழக்கு', kn: 'ಈಶಾನ್ಯ' },
  'North-West': { en: 'North-West', te: 'వాయువ్యం', hi: 'उत्तर-पश्चिम', ml: 'വടക്കുപടിഞ്ഞാറ്', ta: 'வடமேற்கு', kn: 'ವಾಯುವ್ಯ' },
  'South-East': { en: 'South-East', te: 'ఆగ్నేయం', hi: 'दक्षिण-पूर्व', ml: 'തെക്കുകിഴക്ക്', ta: 'தென்கிழக்கு', kn: 'ಆಗ್ನೇಯ' },
  'South-West': { en: 'South-West', te: 'నైరుతి', hi: 'दक्षिण-पश्चिम', ml: 'തെക്കുപടിഞ്ഞാറ്', ta: 'தென்மேற்கு', kn: 'ನೈಋತ್ಯ' }
};

export const TURN_TRANSLATIONS = {
  left: { en: 'left', te: 'ఎడమవైపు', hi: 'बाएं', ml: 'ഇടത്തോട്ട്', ta: 'இடதுபுறம்', kn: 'ಎಡಕ್ಕೆ' },
  right: { en: 'right', te: 'కుడివైపు', hi: 'दाएं', ml: 'വലത്തോട്ട്', ta: 'வலதுபுறம்', kn: 'ಬಲಕ್ಕೆ' },
  straight: { en: 'straight', te: 'సూటిగా', hi: 'सीधे', ml: 'നേരെ', ta: 'நேராக', kn: 'ನೇರವಾಗಿ' }
};

export function translateDirection(dir, lang = 'en') {
  if (!dir) return dir;
  return DIRECTION_TRANSLATIONS[dir]?.[lang] || DIRECTION_TRANSLATIONS[dir]?.en || dir;
}

export function translateTurn(turn, lang = 'en') {
  if (!turn) return turn;
  const key = turn.toLowerCase();
  return TURN_TRANSLATIONS[key]?.[lang] || TURN_TRANSLATIONS[key]?.en || turn;
}

export const LANGUAGE_UI_TEXTS = {
  te: {
    commandPlaceholder: "ఉదా: 'లైబ్రరీకి వెళ్ళు', 'కాఫెటేరియాకి వెళ్ళు', 'ముందుకు వెళ్ళు'...",
    sendBtn: 'పంపు',
    sampleVoice: 'చెప్పండి: "లైబ్రరీకి వెళ్ళు", "క్యాంటీన్‌కి వెళ్ళు", "ముందుకు వెళ్ళు"',
    destinationLabels: {
      library: 'లైబ్రరీ',
      cafeteria: 'కాఫెటేరియా',
      computer_lab: 'కంప్యూటర్ ల్యాబ్',
      classroom: 'కంప్యూటర్ ల్యాబ్',
      auditorium: 'ఆడిటోరియం',
      main_gate: 'మెయిన్ గేట్'
    },
    quickPhrases: [
      'లైబ్రరీకి వెళ్ళు',
      'కాఫెటేరియాకి వెళ్ళు',
      'కంప్యూటర్ ల్యాబ్‌కి వెళ్ళు',
      'ఆడిటోరియంకి వెళ్ళు',
      'మెయిన్ గేట్‌కి వెళ్ళు',
      'ముందుకు వెళ్ళు',
      'ఎడమవైపు తిరుగు',
      'కుడివైపు తిరుగు',
      'ఆపు',
      'రీసెట్ చేయి'
    ],
    speech: {
      navStarted: (dest, dir = 'ఉత్తరం', loc = 'ప్రారంభ స్థానం') =>
        `${dest} వైపు నావిగేషన్ ప్రారంభించబడింది. ${loc} నుండి ${dir} వైపు ప్రయాణిస్తున్నాము.`,
      obstacleDetected: (obs = 'రోడ్డు అడ్డంకి', dest = 'లైబ్రరీ', detourDir = 'కుడివైపు', pathway = 'తూర్పు మార్గం') =>
        `హెచ్చరిక: ముందు ${obs} గుర్తించబడింది! ${dest} వైపు మార్గం నిరోధించబడింది. ప్రత్యామ్నాయ మార్గాన్ని లెక్కిస్తున్నాము.`,
      alternateRoute: (detourDir = 'కుడివైపు', pathway = 'తూర్పు మార్గం', dest = 'లైబ్రరీ', dir = 'ఉత్తరం') =>
        `ప్రత్యామ్నాయ మార్గం ఎంచుకోబడింది: అడ్డంకిని నివారించడానికి ${detourDir} తిరిగి ${pathway} గుండా ${dir} వైపు ${dest} కి కొనసాగుతున్నాము.`,
      turnGuidance: (turnDir = 'కుడివైపు', newDir = 'ఉత్తరం', pathway = 'క్యాంపస్ మార్గం', dest = 'లైబ్రరీ') =>
        `${turnDir} తిరిగి ${pathway} పై ${newDir} వైపు ${dest} దిశగా వెళ్తున్నాము.`,
      manualMove: (action, dir = 'ఉత్తరం') =>
        action === 'backward' ? 'వెనుకకు రివర్స్ వెళ్తున్నాము.' : `ముందుకు ఒక అడుగు వేస్తున్నాము, దిశ: ${dir}.`,
      manualTurn: (turnDir = 'కుడివైపు', newDir = 'ఉత్తరం') =>
        `${turnDir} 90 డిగ్రీలు తిరిగాము. ఇప్పుడు రోబోట్ దిశ: ${newDir}.`,
      obstacleBlockedMove: () =>
        'ముందుకు వెళ్ళలేము: నేరుగా ముందు అడ్డంకి ఉంది!',
      obstacleAdded: (label = 'అడ్డంకి') =>
        `క్యాంపస్ గ్రిడ్‌పై కొత్త అడ్డంకి (${label}) జోడించబడింది. మార్గ భద్రతను స్కాన్ చేస్తున్నాము.`,
      obstaclesCleared: (dest = 'లైబ్రరీ') =>
        `అడ్డంకులు తొలగించబడ్డాయి. ${dest} వైపు నేరుగా సురక్షిత మార్గాన్ని పునఃప్రారంభిస్తున్నాము.`,
      destinationReached: (dest) =>
        `లక్ష్యం చేరుకుంది: ${dest} వద్దకు సురక్షితంగా చేరుకున్నారు! నావిగేషన్ విజయవంతంగా పూర్తయింది.`,
      noRoute: () =>
        'హెచ్చరిక: మార్గాలన్నీ మూసివేయబడ్డాయి. సురక్షిత ప్రత్యామ్నాయ మార్గం అందుబాటులో లేదు.',
      paused: () =>
        'నావిగేషన్ తాత్కాలికంగా నిలిపివేయబడింది. రోబోట్ ఆగింది.',
      resumed: (dest = 'లక్ష్యం', dir = 'ఉత్తరం') =>
        `${dest} వైపు నావిగేషన్ పునఃప్రారంభించబడింది, ప్రయాణ దిశ: ${dir}.`,
      reset: () =>
        'సిమ్యులేషన్ రీసెట్ చేయబడింది. ప్రారంభ డాక్ వద్ద వేచి ఉంది.'
    }
  },
  en: {
    commandPlaceholder: "E.g. 'Go to Library', 'Drive to Cafeteria', 'Move forward'...",
    sendBtn: 'Send',
    sampleVoice: 'Say: "Go to Library", "Go to Cafeteria", "Move Forward"',
    destinationLabels: {
      library: 'Library',
      cafeteria: 'Cafeteria',
      computer_lab: 'Computer Lab',
      classroom: 'Computer Lab',
      auditorium: 'Auditorium',
      main_gate: 'Main Gate'
    },
    quickPhrases: [
      'Go to the Library',
      'Navigate to Cafeteria',
      'Go to Computer Lab',
      'Drive to Auditorium',
      'Go to Main Gate',
      'Move Forward',
      'Turn Left',
      'Turn Right',
      'Pause Navigation',
      'Reset Simulation'
    ],
    speech: {
      navStarted: (dest, dir = 'North', loc = 'Dock') =>
        `Navigation started towards ${dest}. Heading ${dir} from ${loc}.`,
      obstacleDetected: (obs = 'Road Barricade', dest = 'Library', detourDir = 'right', pathway = 'East Pathway') =>
        `Obstacle detected ahead: ${obs} is blocking the direct path to ${dest}! Recalculating alternate route.`,
      alternateRoute: (detourDir = 'right', pathway = 'East Pathway', dest = 'Library', dir = 'North') =>
        `Taking alternate route: turning ${detourDir} via ${pathway} heading ${dir} towards ${dest}.`,
      turnGuidance: (turnDir = 'right', newDir = 'North', pathway = 'Campus Walkway', dest = 'Library') =>
        `Turning ${turnDir} onto ${pathway}, heading ${newDir} towards ${dest}.`,
      manualMove: (action, dir = 'North') =>
        action === 'backward' ? 'Moving backward in reverse.' : `Moving forward 1 step, heading ${dir}.`,
      manualTurn: (turnDir = 'right', newDir = 'North') =>
        `Turned ${turnDir} 90 degrees. Robot is now facing ${newDir}.`,
      obstacleBlockedMove: () =>
        'Cannot move forward: obstacle detected directly ahead!',
      obstacleAdded: (label = 'Hazard') =>
        `Obstacle placed: ${label} on campus grid. Scanning path for conflicts.`,
      obstaclesCleared: (dest = 'Library') =>
        `Obstacles cleared. Resuming direct optimal path towards ${dest}.`,
      destinationReached: (dest) =>
        `Destination reached: You have safely arrived at ${dest}! Navigation completed successfully.`,
      noRoute: () =>
        'Alert: Path is blocked. No safe alternative route found in the simulation.',
      paused: () =>
        'Navigation paused. Robot stopped.',
      resumed: (dest = 'Destination', dir = 'North') =>
        `Navigation resumed towards ${dest}, heading ${dir}.`,
      reset: () =>
        'Simulation reset to origin dock. Standing by for destination.'
    }
  },
  hi: {
    commandPlaceholder: "उदा: 'लाइब्रेरी जाओ', 'कैफेटेरिया जाओ', 'आगे बढ़ो'...",
    sendBtn: 'भेजें',
    sampleVoice: 'बोलें: "लाइब्रेरी जाओ", "कैफेटेरिया जाओ", "आगे बढ़ो"',
    destinationLabels: {
      library: 'लाइब्रेरी',
      cafeteria: 'कैफेटेरिया',
      computer_lab: 'कंप्यूटर लैब',
      classroom: 'कंप्यूटर लैब',
      auditorium: 'ऑडिटोरियम',
      main_gate: 'मुख्य द्वार'
    },
    quickPhrases: [
      'लाइब्रेरी जाओ',
      'कैफेटेरिया जाओ',
      'कंप्यूटर लैब जाओ',
      'ऑडिटोरियम जाओ',
      'मेन गेट जाओ',
      'आगे बढ़ो',
      'बाएं मुड़ो',
      'दाएं मुड़ो',
      'नेविगेशन रोकें',
      'रीसेट करो'
    ],
    speech: {
      navStarted: (dest, dir = 'उत्तर', loc = 'मूल स्थान') =>
        `${dest} की ओर नेविगेशन शुरू हुआ। ${loc} से ${dir} दिशा में आगे बढ़ रहे हैं।`,
      obstacleDetected: (obs = 'रुकावट', dest = 'लाइब्रेरी', detourDir = 'दाएं', pathway = 'पूर्वी मार्ग') =>
        `आगे बाधा मिली: ${obs} ने ${dest} का सीधा रास्ता रोक दिया है! वैकल्पिक मार्ग खोजा जा रहा है।`,
      alternateRoute: (detourDir = 'दाएं', pathway = 'पूर्वी मार्ग', dest = 'लाइब्रेरी', dir = 'उत्तर') =>
        `वैकल्पिक रास्ता चुना गया: बाधा से बचने के लिए ${detourDir} मुड़कर ${pathway} से ${dir} दिशा में ${dest} की ओर बढ़ रहे हैं।`,
      turnGuidance: (turnDir = 'दाएं', newDir = 'उत्तर', pathway = 'कैंपस मार्ग', dest = 'लाइब्रेरी') =>
        `${turnDir} मुड़कर ${pathway} पर ${newDir} दिशा में ${dest} की ओर बढ़ें।`,
      manualMove: (action, dir = 'उत्तर') =>
        action === 'backward' ? 'पीछे रिवर्स चल रहे हैं।' : `एक कदम आगे बढ़ रहे हैं, दिशा: ${dir}।`,
      manualTurn: (turnDir = 'दाएं', newDir = 'उत्तर') =>
        `${turnDir} 90 अंश मुड़े। रोबोट अब ${newDir} दिशा में है।`,
      obstacleBlockedMove: () =>
        'आगे नहीं बढ़ सकते: ठीक सामने बाधा उपस्थित है!',
      obstacleAdded: (label = 'बाधा') =>
        `कैंपस ग्रिड पर बाधा (${label}) जोड़ी गई। मार्ग सुरक्षा जांची जा रही है।`,
      obstaclesCleared: (dest = 'लाइब्रेरी') =>
        `बाधाएं हटा दी गई हैं। ${dest} की ओर सीधा मार्ग बहाल किया गया।`,
      destinationReached: (dest) =>
        `गंतव्य पहुंच गए: आप सुरक्षित रूप से ${dest} पहुंच चुके हैं! नेविगेशन संपन्न हुआ।`,
      noRoute: () =>
        'चेतावनी: मार्ग अवरुद्ध है। कोई सुरक्षित वैकल्पिक रास्ता उपलब्ध नहीं है।',
      paused: () =>
        'नेविगेशन रोक दिया गया है। रोबोट रुका हुआ है।',
      resumed: (dest = 'गंतव्य', dir = 'उत्तर') =>
        `${dest} की ओर नेविगेशन फिर से शुरू, दिशा: ${dir}।`,
      reset: () =>
        'सिमुलेशन मूल डॉक पर रीसेट हो गया है।'
    }
  },
  ml: {
    commandPlaceholder: "ഉദാ: 'ലൈബ്രറിയിലേക്ക് പോകുക', 'കാന്റീനിലേക്ക് പോകുക'...",
    sendBtn: 'അയക്കുക',
    sampleVoice: 'പറയുക: "ലൈബ്രറിയിലേക്ക് പോകുക", "കാന്റീനിലേക്ക് പോകുക"',
    destinationLabels: {
      library: 'ലൈബ്രറി',
      cafeteria: 'കഫറ്റീരിയ',
      computer_lab: 'കംപ്യൂട്ടർ ലാബ്',
      classroom: 'കംപ്യൂട്ടർ ലാബ്',
      auditorium: 'ഓഡിറ്റോറിയം',
      main_gate: 'പ്രധാന കവാടം'
    },
    quickPhrases: [
      'ലൈബ്രറിയിലേക്ക് പോകുക',
      'കാന്റീനിലേക്ക് പോകുക',
      'കംപ്യൂട്ടർ ലാബിലേക്ക് പോകുക',
      'ഓഡിറ്റോറിയത്തിലേക്ക് പോകുക',
      'ഗേറ്റിലേക്ക് പോകുക',
      'മുന്നോട്ട് പോകുക',
      'ഇടത്തോട്ട് തിരിയുക',
      'വലത്തോട്ട് തിരിയുക',
      'നിർത്തുക',
      'റീസെറ്റ് ചെയ്യുക'
    ],
    speech: {
      navStarted: (dest, dir = 'വടക്ക്', loc = 'ഡ്രൈവ് ഡോക്ക്') =>
        `${dest} ലേക്ക് നാവിഗേഷൻ ആരംഭിച്ചു. ${loc} ൽ നിന്ന് ${dir} ദിശയിലേക്ക് നീങ്ങുന്നു.`,
      obstacleDetected: (obs = 'തടസ്സം', dest = 'ലൈബ്രറി', detourDir = 'വലത്തോട്ട്', pathway = 'കിഴക്കൻ പാത') =>
        `മുന്നറിയിപ്പ്: മുന്നിൽ ${obs} കണ്ടെത്തി! ${dest} ലേക്കുള്ള വഴി തടസ്സപ്പെട്ടിരിക്കുന്നു. ഇതര പാത കണ്ടെത്തുന്നു.`,
      alternateRoute: (detourDir = 'വലത്തോട്ട്', pathway = 'കിഴക്കൻ പാത', dest = 'ലൈബ്രറി', dir = 'വടക്ക്') =>
        `ഇതര പാത തിരഞ്ഞെടുക്കുന്നു: തടസ്സം ഒഴിവാക്കാൻ ${detourDir} തിരിഞ്ഞ് ${pathway} വഴി ${dir} ദിശയിലേക്ക് ${dest} ലേക്ക് പോകുന്നു.`,
      turnGuidance: (turnDir = 'വലത്തോട്ട്', newDir = 'വടക്ക്', pathway = 'പാത', dest = 'ലൈബ്രറി') =>
        `${turnDir} തിരിഞ്ഞ് ${pathway} ലൂടെ ${newDir} ദിശയിലേക്ക് ${dest} ലേക്ക് നീങ്ങുക.`,
      manualMove: (action, dir = 'വടക്ക്') =>
        action === 'backward' ? 'പുറകോട്ട് റിവേഴ്സ് നീങ്ങുന്നു.' : `ഒരു പടി മുന്നോട്ട് നീങ്ങുന്നു, ദിശ: ${dir}.`,
      manualTurn: (turnDir = 'വലത്തോട്ട്', newDir = 'വടക്ക്') =>
        `${turnDir} 90 ഡിഗ്രി തിരിഞ്ഞു. ഇപ്പോൾ റോബോട്ടിന്റെ ദിശ: ${newDir}.`,
      obstacleBlockedMove: () =>
        'മുന്നോട്ട് പോകാനാകില്ല: മുന്നിൽ തടസ്സമുണ്ട്!',
      obstacleAdded: (label = 'തടസ്സം') =>
        `ക്യാമ്പസ് ഗ്രിഡിൽ ${label} ചേർത്തു. സുരക്ഷാ സ്കാനിംഗ് നടത്തുന്നു.`,
      obstaclesCleared: (dest = 'ലൈബ്രറി') =>
        `തടസ്സങ്ങൾ നീക്കി. ${dest} ലേക്കുള്ള നേരിട്ടുള്ള പാത പുനരാരംഭിച്ചു.`,
      destinationReached: (dest) =>
        `ലക്ഷ്യസ്ഥാനത്ത് എത്തി: നിങ്ങൾ ${dest} ൽ സുരക്ഷിതമായി എത്തിച്ചേർന്നു! നാവിഗേഷൻ പൂർത്തിയായി.`,
      noRoute: () =>
        'മുന്നറിയിപ്പ്: എല്ലാ വഴികളും തടസ്സപ്പെട്ടു. സുരക്ഷിതമായ ഇതര പാത ലഭ്യമല്ല.',
      paused: () =>
        'നാവിഗേഷൻ നിർത്തിവെച്ചു. റോബോട്ട് കാത്തുനിൽക്കുന്നു.',
      resumed: (dest = 'ലക്ഷ്യസ്ഥാനം', dir = 'വടക്ക്') =>
        `${dest} ലേക്ക് നാവിഗേഷൻ പുനരാരംഭിച്ചു, ദിശ: ${dir}.`,
      reset: () =>
        'സിമുലേഷൻ ആദ്യ സ്ഥാനത്തേക്ക് പുനഃക്രമീകരിച്ചു.'
    }
  },
  ta: {
    commandPlaceholder: "உதா: 'நூலகத்திற்கு செல்', 'உணவகத்திற்கு செல்'...",
    sendBtn: 'அனுப்பு',
    sampleVoice: 'சொல்லுங்கள்: "நூலகத்திற்கு செல்", "உணவகத்திற்கு செல்"',
    destinationLabels: {
      library: 'நூலகம்',
      cafeteria: 'உணவகம்',
      computer_lab: 'கணினி ஆய்வகம்',
      classroom: 'கணினி ஆய்வகம்',
      auditorium: 'அரங்கம்',
      main_gate: 'முதன்மை வாயில்'
    },
    quickPhrases: [
      'நூலகத்திற்கு செல்',
      'உணவகத்திற்கு செல்',
      'கணினி ஆய்வகத்திற்கு செல்',
      'அரங்கத்திற்கு செல்',
      'முதன்மை வாயிலுக்கு செல்',
      'முன்னோக்கி செல்',
      'இடதுபுறம் திரும்பு',
      'வலதுபுறம் திரும்பு',
      'நிறுத்து',
      'மீட்டமை'
    ],
    speech: {
      navStarted: (dest, dir = 'வடக்கு', loc = 'ஆரம்ப நிலை') =>
        `${dest} நோக்கி வழிகாட்டல் தொடங்கியது. ${loc} இலிருந்து ${dir} திசையில் பயணிக்கிறது.`,
      obstacleDetected: (obs = 'தடை', dest = 'நூலகம்', detourDir = 'வலதுபுறம்', pathway = 'கிழக்கு பாதை') =>
        `எச்சரிக்கை: முன்னே ${obs} கண்டறியப்பட்டது! ${dest} செல்லும் பாதை அடைக்கப்பட்டுள்ளது. மாற்றுப் பாதை கணக்கிடப்படுகிறது.`,
      alternateRoute: (detourDir = 'வலதுபுறம்', pathway = 'கிழக்கு பாதை', dest = 'நூலகம்', dir = 'வடக்கு') =>
        `மாற்றுப் பாதை எடுக்கப்படுகிறது: தடையைத் தவிர்க்க ${detourDir} திரும்பி ${pathway} வழியாக ${dir} திசையில் ${dest} நோக்கி செல்கிறது.`,
      turnGuidance: (turnDir = 'வலதுபுறம்', newDir = 'வடக்கு', pathway = 'பாதை', dest = 'நூலகம்') =>
        `${turnDir} திரும்பி ${pathway} வழியாக ${newDir} திசையில் ${dest} நோக்கி செல்லவும்.`,
      manualMove: (action, dir = 'வடக்கு') =>
        action === 'backward' ? 'பின்னோக்கி ரிவர்ஸ் செல்கிறது.' : `ஒரு அடி முன்னோக்கி நகர்கிறது, திசை: ${dir}.`,
      manualTurn: (turnDir = 'வலதுபுறம்', newDir = 'வடக்கு') =>
        `${turnDir} 90 டிகிரி திரும்பியது. இப்போது ரோபோவின் திசை: ${newDir}.`,
      obstacleBlockedMove: () =>
        'முன்னே செல்ல முடியாது: நேரே தடை உள்ளது!',
      obstacleAdded: (label = 'தடை') =>
        `வளாகத்தில் புதிய தடை (${label}) சேர்க்கப்பட்டது. பாதுகாப்பு சோதிக்கப்படுகிறது.`,
      obstaclesCleared: (dest = 'நூலகம்') =>
        `தடைகள் நீக்கப்பட்டன. ${dest} நோக்கி நேரடிப் பாதை மீண்டும் தொடங்கப்பட்டது.`,
      destinationReached: (dest) =>
        `இலக்கை அடைந்தது: நீங்கள் ${dest} ஐ பாதுகாப்பாக அடைந்துவிட்டீர்கள்! வழிகாட்டல் வெற்றிகரமாக முடிந்தது.`,
      noRoute: () =>
        'எச்சரிக்கை: அனைத்து வழிகளும் அடைக்கப்பட்டுள்ளன. மாற்றுப் பாதை கிடைக்கவில்லை.',
      paused: () =>
        'வழிகாட்டல் தற்காலிகமாக நிறுத்தப்பட்டது.',
      resumed: (dest = 'இலக்கு', dir = 'வடக்கு') =>
        `${dest} நோக்கி வழிகாட்டல் மீண்டும் தொடங்கியது, திசை: ${dir}.`,
      reset: () =>
        'உருவகப்படுத்துதல் ஆரம்ப நிலைக்கு மீட்டமைக்கப்பட்டது.'
    }
  },
  kn: {
    commandPlaceholder: "ಉದಾ: 'ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗು', 'ಕ್ಯಾಂಟೀನ್‌ಗೆ ಹೋಗು'...",
    sendBtn: 'ಕಳುಹಿಸು',
    sampleVoice: 'ಹೇಳಿ: "ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗು", "ಕ್ಯಾಂಟೀನ್‌ಗೆ ಹೋಗು"',
    destinationLabels: {
      library: 'ಗ್ರಂಥಾಲಯ',
      cafeteria: 'ಕ್ಯಾಂಟೀನ್',
      computer_lab: 'ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್',
      classroom: 'ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್',
      auditorium: 'ಆಡಿಟೋರಿಯಂ',
      main_gate: 'ಮುಖ್ಯ ದ್ವಾರ'
    },
    quickPhrases: [
      'ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗು',
      'ಕ್ಯಾಂಟೀನ್‌ಗೆ ಹೋಗು',
      'ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್‌ಗೆ ಹೋಗು',
      'ಆಡಿಟೋರಿಯಂಗೆ ಹೋಗು',
      'ಮುಖ್ಯ ದ್ವಾರಕ್ಕೆ ಹೋಗು',
      'ಮುಂದೆ ಹೋಗು',
      'ಎಡಕ್ಕೆ ತಿರುಗು',
      'ಬಲಕ್ಕೆ ತಿರುಗು',
      'ನಿಲ್ಲಿಸು',
      'ರೀಸೆಟ್ ಮಾಡು'
    ],
    speech: {
      navStarted: (dest, dir = 'ಉತ್ತರ', loc = 'ಆರಂಭಿಕ ಡಾಕ್') =>
        `${dest} ಕಡೆಗೆ ನ್ಯಾವಿಗೇಷನ್ ಪ್ರಾರಂಭವಾಗಿದೆ. ${loc} ನಿಂದ ${dir} ದಿಕ್ಕಿನಲ್ಲಿ ಚಲಿಸುತ್ತಿದೆ.`,
      obstacleDetected: (obs = 'ಅಡಚಣೆ', dest = 'ಗ್ರಂಥಾಲಯ', detourDir = 'ಬಲಕ್ಕೆ', pathway = 'ಪೂರ್ವ ಮಾರ್ಗ') =>
        `ಎಚ್ಚರಿಕೆ: ಮುಂದೆ ${obs} ಕಂಡುಬಂದಿದೆ! ${dest} ಕಡೆಗೆ ಮಾರ್ಗ ತಡೆಯಲ್ಪಟ್ಟಿದೆ. ಪರ್ಯಾಯ ಮಾರ್ಗ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ.`,
      alternateRoute: (detourDir = 'ಬಲಕ್ಕೆ', pathway = 'ಪೂರ್ವ ಮಾರ್ಗ', dest = 'ಗ್ರಂಥಾಲಯ', dir = 'ಉತ್ತರ') =>
        `ಪರ್ಯಾಯ ಮಾರ್ಗ ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ: ಅಡಚಣೆ ತಪ್ಪಿಸಲು ${detourDir} ತಿರುಗಿ ${pathway} ಮೂಲಕ ${dir} ದಿಕ್ಕಿನಲ್ಲಿ ${dest} ಕಡೆಗೆ ಸಾಗುತ್ತಿದೆ.`,
      turnGuidance: (turnDir = 'ಬಲಕ್ಕೆ', newDir = 'ಉತ್ತರ', pathway = 'ಮಾರ್ಗ', dest = 'ಗ್ರಂಥಾಲಯ') =>
        `${turnDir} ತಿರುಗಿ ${pathway} ಮೂಲಕ ${newDir} ದಿಕ್ಕಿನಲ್ಲಿ ${dest} ಕಡೆಗೆ ಮುಂದುವರಿಯಿರಿ.`,
      manualMove: (action, dir = 'ಉತ್ತರ') =>
        action === 'backward' ? 'ಹಿಂದಕ್ಕೆ ರಿವರ್ಸ್ ಹೋಗುತ್ತಿದೆ.' : `ಒಂದು ಹೆಜ್ಜೆ ಮುಂದೆ ಸಾಗುತ್ತಿದೆ, ದಿಕ್ಕು: ${dir}.`,
      manualTurn: (turnDir = 'ಬಲಕ್ಕೆ', newDir = 'ಉತ್ತರ') =>
        `${turnDir} 90 ಡಿಗ್ರಿ ತಿರುಗಿದೆ. ಈಗ ರೋಬೋಟ್ ದಿಕ್ಕು: ${newDir}.`,
      obstacleBlockedMove: () =>
        'ಮುಂದೆ ಹೋಗಲು ಸಾಧ್ಯವಿಲ್ಲ: ನೇರವಾಗಿ ಅಡಚಣೆಯಿದೆ!',
      obstacleAdded: (label = 'ಅಡಚಣೆ') =>
        `ಕ್ಯಾಂಪಸ್ ಗ್ರಿಡ್‌ನಲ್ಲಿ ${label} ಸೇರಿಸಲಾಗಿದೆ. ಮಾರ್ಗ ಸುರಕ್ಷತೆ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.`,
      obstaclesCleared: (dest = 'ಗ್ರಂಥಾಲಯ') =>
        `ಅಡಚಣೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ${dest} ಕಡೆಗೆ ನೇರ ಮಾರ್ಗ ಪುನರಾರಂಭಗೊಂಡಿದೆ.`,
      destinationReached: (dest) =>
        `ಗುರಿ ತಲುಪಿದೆ: ನೀವು ${dest} ಅನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ತಲುಪಿದ್ದೀರಿ! ನ್ಯಾವಿಗೇಷನ್ ಪೂರ್ಣಗೊಂಡಿದೆ.`,
      noRoute: () =>
        'ಎಚ್ಚರಿಕೆ: ಎಲ್ಲಾ ಮಾರ್ಗಗಳು ನಿರ್ಬಂಧಿಸಲ್ಪಟ್ಟಿವೆ. ಯಾವುದೇ ಪರ್ಯಾಯ ಮಾರ್ಗವಿಲ್ಲ.',
      paused: () =>
        'ನ್ಯಾವಿಗೇಷನ್ ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ. ರೋಬೋಟ್ ನಿಂತಿದೆ.',
      resumed: (dest = 'ಗುರಿ', dir = 'ಉತ್ತರ') =>
        `${dest} ಕಡೆಗೆ ನ್ಯಾವಿಗೇಷನ್ ಪುನರಾರಂಭಗೊಂಡಿದೆ, ದಿಕ್ಕು: ${dir}.`,
      reset: () =>
        'ಸಿಮ್ಯುಲೇಶನ್ ಅನ್ನು ಪ್ರಾರಂಭಿಕ ಸ್ಥಾನಕ್ಕೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.'
    }
  }
};

