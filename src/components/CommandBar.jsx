import React, { useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { LANGUAGE_UI_TEXTS } from '../voice/languages';

export function CommandBar({
  onExecuteCommand,
  currentLanguage = 'en',
  isListening,
  onToggleVoice
}) {
  const uiTexts = LANGUAGE_UI_TEXTS[currentLanguage] || LANGUAGE_UI_TEXTS.en;
  const [commandText, setCommandText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = commandText.trim() || uiTexts.quickPhrases[0];
    if (query && onExecuteCommand) {
      onExecuteCommand(query);
      setCommandText('');
    }
  };

  return (
    <form className="header-command-bar" onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '480px' }}>
      <button
        type="button"
        className={`command-mic-btn ${isListening ? 'listening animate-pulse' : ''}`}
        onClick={onToggleVoice}
        title={isListening ? 'Listening for speech command...' : 'Click to speak command'}
      >
        <Mic size={16} />
      </button>
      <input
        type="text"
        className="command-input"
        value={commandText}
        onChange={(e) => setCommandText(e.target.value)}
        placeholder={uiTexts.commandPlaceholder}
      />
      <button type="submit" className="command-send-btn">
        <Send size={13} className="inline mr-1" />
        {uiTexts.sendBtn}
      </button>
    </form>
  );
}

export default CommandBar;
