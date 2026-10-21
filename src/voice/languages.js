/**
 * NaviAI Multilingual Command & Voice System
 * Supports English, Spanish, French, German, Hindi, Japanese, Chinese, and Telugu
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', langTag: 'en-US', name: 'English', native: 'English' },
  { code: 'es', langTag: 'es-ES', name: 'Spanish', native: 'Español' },
  { code: 'fr', langTag: 'fr-FR', name: 'French', native: 'Français' },
  { code: 'de', langTag: 'de-DE', name: 'German', native: 'Deutsch' },
  { code: 'hi', langTag: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ja', langTag: 'ja-JP', name: 'Japanese', native: '日本語' },
  { code: 'zh', langTag: 'zh-CN', name: 'Chinese', native: '中文' },
  { code: 'te', langTag: 'te-IN', name: 'Telugu', native: 'తెలుగు' }
];

export const MULTILINGUAL_DICTIONARY = {
  // Destination Matchers
  destinations: {
    library: [
      'library', 'biblioteca', 'bibliothèque', 'bibliothek', 
      'लाइब्रेरी', 'पुस्तकालय', '図書館', '図書室', '图书馆', 'లైబ్రరీ'
    ],
    classroom: [
      'classroom', 'class', 'lecture', 'aula', 'clase', 
      'salle de classe', 'cours', 'klassenzimmer', 'klasse', 
      'कक्षा', 'क्लास', '教室', '课堂', 'తరగతి గది', 'క్లాస్‌రూమ్'
    ],
    cafeteria: [
      'cafeteria', 'cafe', 'canteen', 'dining', 'cafetería', 
      'cafétéria', 'mensa', 'kantine', 'कैफेटेरिया', 'कैंटीन', 
      'カフェテリア', '食堂', '餐厅', 'కాఫెటేరియా', 'క్యాంటీన్'
    ],
    main_gate: [
      'main gate', 'gate', 'entrance', 'door', 'puerta principal', 
      'entrada', 'porte principale', 'entrée', 'haupteingang', 'tor', 
      'मुख्य द्वार', 'गेट', 'メインゲート', '正门', '入口', 'మెయిన్ గేట్', 'ప్రవేశ ద్వారం'
    ]
  },

  // Directional Movement Matchers
  movements: {
    forward: [
      'forward', 'straight', 'ahead', 'go forward', 'move forward',
      'adelante', 'avanzar', 'recto', 'seguir',
      'avancer', 'tout droit', 'en avant',
      'vorwärts', 'geradeaus',
      'आगे', 'आगे बढ़ो', 'सीधे',
      '前進', 'まっすぐ', '前へ',
      '前进', '向前', '直走',
      'ముందుకు', 'ముందుకు వెళ్ళు'
    ],
    backward: [
      'backward', 'reverse', 'back', 'go back',
      'atrás', 'retroceder', 'marcha atrás',
      'reculer', 'en arrière',
      'rückwärts', 'zurück',
      'पीछे', 'पीछे जाओ', 'रिवर्स',
      '後退', '後ろへ', 'バック',
      '后退', '倒车', '向后',
      'వెనుకకు', 'వెనక్కి వెళ్ళు'
    ],
    turnLeft: [
      'turn left', 'left', 'rotate left',
      'girar a la izquierda', 'izquierda', 'doblar a la izquierda',
      'tourner à gauche', 'gauche',
      'links abbiegen', 'nach links', 'links',
      'बाएं मुड़ो', 'बाएं', 'लेफ्ट',
      '左折', '左へ', '左に曲がる',
      '左转', '向左',
      'ఎడమవైపు తిరుగు', 'ఎడమ'
    ],
    turnRight: [
      'turn right', 'right', 'rotate right',
      'girar a la derecha', 'derecha', 'doblar a la derecha',
      'tourner à droite', 'droite',
      'rechts abbiegen', 'nach rechts', 'rechts',
      'दाएं मुड़ो', 'दाएं', 'राइट',
      '右折', '右へ', '右に曲がる',
      '右转', '向右',
      'కుడివైపు తిరుగు', 'కుడి'
    ]
  },

  // Control Matchers
  controls: {
    start: [
      'start', 'navigate', 'go', 'begin',
      'iniciar', 'empezar', 'navegar', 'ir',
      'démarrer', 'commencer', 'naviguer',
      'starten', 'beginnen', 'los',
      'शुरू करो', 'प्रारंभ करो', 'चलो',
      '開始', 'スタート', '行く',
      '开始', '启动', '出发',
      'ప్రారంభించు', 'వెళ్ళు'
    ],
    pause: [
      'pause', 'stop', 'hold', 'halt', 'wait',
      'pausar', 'parar', 'detener', 'alto',
      'pause', 'arrêter', 'attendre',
      'pause', 'anhalten', 'stopp',
      'रुको', 'रोकें', 'ठहरो', 'पॉज़',
      '一時停止', '止まれ', 'ストップ',
      '暂停', '停下', '停止',
      'ఆగు', 'విరామం'
    ],
    resume: [
      'resume', 'continue', 'keep going',
      'reanudar', 'continuar', 'seguir',
      'reprendre', 'continuer',
      'fortsetzen', 'weiter',
      'जारी रखें', 'फिर से शुरू करो',
      '再開', '続ける',
      '继续', '恢复',
      'కొనసాగించు'
    ],
    reset: [
      'reset', 'restart', 'origin', 'dock', 'home',
      'reiniciar', 'restablecer', 'volver', 'origen',
      'réinitialiser', 'repartir',
      'zurücksetzen', 'neustart',
      'रीसेट', 'शुरुआत पर जाओ',
      'リセット', '初期化', '戻る',
      '重置', '复位', '回原点',
      'రీసెట్', 'మొదటి స్థానానికి'
    ],
    addObstacle: [
      'add obstacle', 'obstacle', 'hazard', 'block',
      'añadir obstáculo', 'obstáculo', 'peligro',
      'ajouter un obstacle', 'obstacle', 'danger',
      'hindernis hinzufügen', 'hindernis',
      'बाधा जोड़ें', 'रुकावट', 'खतरा',
      '障害物追加', '障害物',
      '添加障碍', '障碍物',
      'అడ్డంకిని జోడించు'
    ],
    clearObstacles: [
      'clear obstacle', 'clear obstacles', 'remove obstacle', 'delete obstacle',
      'quitar obstáculo', 'limpiar obstáculos',
      'supprimer les obstacles', 'effacer',
      'hindernisse entfernen', 'löschen',
      'बाधा हटाएं', 'रुकावटें साफ करें',
      '障害物クリア', '障害物削除',
      '清除障碍', '移除障碍',
      'అడ్డంకులను తొలగించు'
    ],
    speedUp: [
      'speed up', 'faster', 'accelerate',
      'más rápido', 'acelerar',
      'plus vite', 'accélérer',
      'schneller',
      'तेज करो', 'गति बढ़ाओ',
      'スピードアップ', '速く',
      '加速', '快点',
      'వేగం పెంచు'
    ],
    slowDown: [
      'slow down', 'slower', 'decelerate',
      'más lento', 'desacelerar',
      'plus lent', 'ralentir',
      'langsamer',
      'धीमे करो', 'गति कम करो',
      'スピードダウン', '遅く',
      '减速', '慢点',
      'వేగం తగ్గించు'
    ]
  }
};

export const LANGUAGE_UI_TEXTS = {
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
  es: {
    commandPlaceholder: "'Ir a la biblioteca' o 'avanzar', 'girar a la izquierda'",
    sendBtn: 'Enviar',
    sampleVoice: 'Di: "Ir a la biblioteca", "Avanzar", "Girar"',
    quickPhrases: [
      'Ir a la biblioteca',
      'Navegar a la cafetería',
      'Avanzar',
      'Girar a la izquierda',
      'Girar a la derecha',
      'Retroceder',
      'Pausar navegación',
      'Reiniciar simulación'
    ],
    speech: {
      navStarted: (dest) => `Navegación iniciada hacia ${dest}. Calculando ruta libre de colisiones.`,
      obstacleDetected: () => 'Precaución: Obstáculo detectado en la ruta. Recalculando camino.',
      routeRecalculated: () => 'Ruta alternativa calculada. Reanudando navegación autónoma.',
      destinationReached: (dest) => `Destino alcanzado: ${dest}. Navegación completada con éxito.`,
      noRoute: () => 'Alerta: Camino bloqueado. No se encontró ninguna ruta segura.',
      paused: () => 'Navegación pausada.',
      resumed: () => 'Navegación reanudada.',
      reset: () => 'Simulación restablecida al muelle de origen.'
    }
  },
  fr: {
    commandPlaceholder: "'Aller à la bibliothèque' ou 'avancer', 'tourner à gauche'",
    sendBtn: 'Envoyer',
    sampleVoice: 'Dites : "Aller à la bibliothèque", "Avancer"',
    quickPhrases: [
      'Aller à la bibliothèque',
      'Naviguer vers la cafétéria',
      'Avancer',
      'Tourner à gauche',
      'Tourner à droite',
      'Reculer',
      'Mettre en pause',
      'Réinitialiser'
    ],
    speech: {
      navStarted: (dest) => `Navigation initiée vers ${dest}. Calcul d'un itinéraire sans collision.`,
      obstacleDetected: () => 'Attention : Obstacle détecté sur le parcours. Recalcul en cours.',
      routeRecalculated: () => 'Itinéraire alternatif calculé. Reprise de la navigation autonome.',
      destinationReached: (dest) => `Destination atteinte : ${dest}. Navigation terminée avec succès.`,
      noRoute: () => 'Alerte : Passage bloqué. Aucun itinéraire sûr trouvé.',
      paused: () => 'Navigation en pause.',
      resumed: () => 'Navigation reprise.',
      reset: () => 'Simulation réinitialisée au quai d\'origine.'
    }
  },
  de: {
    commandPlaceholder: "'Gehe zur Bibliothek' oder 'vorwärts', 'nach links'",
    sendBtn: 'Senden',
    sampleVoice: 'Sagen Sie: "Gehe zur Bibliothek", "Vorwärts"',
    quickPhrases: [
      'Gehe zur Bibliothek',
      'Navigiere zur Mensa',
      'Vorwärts',
      'Nach links',
      'Nach rechts',
      'Rückwärts',
      'Pause',
      'Zurücksetzen'
    ],
    speech: {
      navStarted: (dest) => `Navigation nach ${dest} gestartet. Kollisionsfreie Route wird berechnet.`,
      obstacleDetected: () => 'Achtung: Hindernis auf der Route erkannt. Route wird neu berechnet.',
      routeRecalculated: () => 'Alternative Route berechnet. Autonome Navigation fortgesetzt.',
      destinationReached: (dest) => `Ziel erreicht: ${dest}. Navigation erfolgreich abgeschlossen.`,
      noRoute: () => 'Alarm: Weg ist blockiert. Keine sichere Route gefunden.',
      paused: () => 'Navigation angehalten.',
      resumed: () => 'Navigation fortgesetzt.',
      reset: () => 'Simulation auf Startposition zurückgesetzt.'
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
  ja: {
    commandPlaceholder: "'図書館へ行く' または '前進', '左折'",
    sendBtn: '送信',
    sampleVoice: '例: "図書館へ行く", "前進", "停止"',
    quickPhrases: [
      '図書館へ行く',
      'カフェテリアへ行く',
      '前進',
      '左折',
      '右折',
      '後退',
      '一時停止',
      'リセット'
    ],
    speech: {
      navStarted: (dest) => `${dest}へのナビゲーションを開始しました。安全な経路を計算中。`,
      obstacleDetected: () => '注意: 経路上の障害物を検出しました。再計算しています。',
      routeRecalculated: () => '代替ルートを算出しました。自律走行を再開します。',
      destinationReached: (dest) => `${dest}に到着しました。ナビゲーション完了。`,
      noRoute: () => '警告: ルートが遮断されています。安全な経路が見つかりません。',
      paused: () => 'ナビゲーションを一時停止しました。',
      resumed: () => 'ナビゲーションを再開しました。',
      reset: () => '初期ドックにリセットしました。'
    }
  },
  zh: {
    commandPlaceholder: "'去图书馆' 或 '前进', '左转'",
    sendBtn: '发送',
    sampleVoice: '请说: "去图书馆", "前进", "停止"',
    quickPhrases: [
      '去图书馆',
      '导航至餐厅',
      '前进',
      '左转',
      '右转',
      '后退',
      '暂停导航',
      '重置仿真'
    ],
    speech: {
      navStarted: (dest) => `开始前往${dest}。正在规划无碰撞路径。`,
      obstacleDetected: () => '注意：路径检测到障碍物。正在重新规划路径。',
      routeRecalculated: () => '已计算备选路径。恢复自主导航。',
      destinationReached: (dest) => `已到达目的地：${dest}。导航顺利完成。`,
      noRoute: () => '警告：路线受阻。未找到安全可行路径。',
      paused: () => '导航已暂停。',
      resumed: () => '导航已恢复。',
      reset: () => '仿真已重置回起始泊位。'
    }
  },
  te: {
    commandPlaceholder: "'లైబ్రరీకి వెళ్ళు' లేదా 'ముందుకు వెళ్ళు', 'ఎడమవైపు తిరుగు'",
    sendBtn: 'పంపు',
    sampleVoice: 'చెప్పండి: "లైబ్రరీకి వెళ్ళు", "ముందుకు వెళ్ళు"',
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
      routeRecalculated: () => 'ప్రత్యామ్నాయ మార్గం సిద్ధమైంది. నావిగేషన్ కొనసాగుతోంది.',
      destinationReached: (dest) => `లక్ష్యం చేరుకుంది: ${dest}। నావిగేషన్ విజయవంతంగా పూర్తయింది.`,
      noRoute: () => 'హెచ్చరిక: మార్గం మూసివేయబడింది. సురక్షిత మార్గం అందుబాటులో లేదు.',
      paused: () => 'నావిగేషన్ నిలిపివేయబడింది.',
      resumed: () => 'నావిగేషన్ తిరిగి ప్రారంభమైంది.',
      reset: () => 'సిమ్యులేషన్ రీసెట్ చేయబడింది.'
    }
  }
};
