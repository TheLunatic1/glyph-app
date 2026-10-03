// ANSI Terminal View for Glyph Mobile
// 100% Desktop Parity with Compact Monospace Font & Clean ANSI Output
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import TerminalKeyboard from './TerminalKeyboard';

// Sanitize raw ANSI control codes, OSC sequences, mode toggles, and carriage returns
export function sanitizeAnsi(text) {
  if (!text) return '';
  let clean = text;

  // 1. Strip OSC window title / terminal sequences: \x1b]0;... \x07, \x1b]0;...\x1b\\, or bare ]0;...
  clean = clean.replace(/\x1b\][0-9];[^\x07\x1b\n\r]*(\x07|\x1b\\)?/g, '');
  clean = clean.replace(/\]0;[^\x07\x1b\n\r]*(\x07|\x1b\\)?/g, '');

  // 2. Strip bracketed paste mode toggles: \x1b[?2004h, \x1b[?2004l, [?2004h, [?2004l
  clean = clean.replace(/\x1b\[\?2004[hl]/g, '');
  clean = clean.replace(/\[\?2004[hl]/g, '');

  // 3. Strip other CSI mode/cursor codes (excluding SGR color codes ending in 'm')
  clean = clean.replace(/\x1b\[\??[0-9;]*[a-ln-zA-Z]/g, '');

  // 4. Strip non-printable ASCII control characters except \n, \t, and \x1b
  clean = clean.replace(/[\x00-\x08\x0b\x0c\x0e-\x1a\x1c-\x1f\x07]/g, '');

  // 5. Normalize carriage return + line feed
  clean = clean.replace(/\r\n/g, '\n').replace(/\r/g, '');

  return clean;
}

// Parse ANSI color escape sequences into styled segments
export function parseAnsi(text) {
  if (!text) return [];
  const sanitized = sanitizeAnsi(text);

  // Split on ANSI color escape codes: \x1b[...m
  const regex = /\x1b\[([0-9;]+)m/g;
  const segments = [];
  let lastIndex = 0;
  let currentStyle = { color: COLORS.terminalText };

  let match;
  while ((match = regex.exec(sanitized)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: sanitized.substring(lastIndex, match.index),
        style: { ...currentStyle }
      });
    }

    const code = match[1];
    if (code === '0' || code === '00') {
      currentStyle = { color: COLORS.terminalText, fontWeight: 'normal' };
    } else if (code === '1' || code === '01') {
      currentStyle.fontWeight = 'bold';
    } else if (code === '30') {
      currentStyle.color = '#4b5563';
    } else if (code === '31' || code === '1;31') {
      currentStyle.color = COLORS.rose;
    } else if (code === '32' || code === '1;32') {
      currentStyle.color = COLORS.emerald;
    } else if (code === '33' || code === '1;33') {
      currentStyle.color = COLORS.amber;
    } else if (code === '34' || code === '1;34') {
      currentStyle.color = COLORS.cyanLight;
    } else if (code === '35' || code === '1;35') {
      currentStyle.color = COLORS.purpleLight;
    } else if (code === '36' || code === '1;36') {
      currentStyle.color = COLORS.cyan;
    } else if (code === '37' || code === '1;37') {
      currentStyle.color = '#ffffff';
    } else if (code === '90') {
      currentStyle.color = '#6b7280';
    } else if (code === '91') {
      currentStyle.color = '#f87171';
    } else if (code === '92') {
      currentStyle.color = '#4ade80';
    } else if (code === '93') {
      currentStyle.color = '#facc15';
    } else if (code === '94') {
      currentStyle.color = '#60a5fa';
    } else if (code === '95') {
      currentStyle.color = '#c084fc';
    } else if (code === '96') {
      currentStyle.color = '#22d3ee';
    } else if (code === '97') {
      currentStyle.color = '#ffffff';
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < sanitized.length) {
    segments.push({
      text: sanitized.substring(lastIndex),
      style: { ...currentStyle }
    });
  }

  return segments;
}

export default function TerminalView({ output = '', onCommandSubmit, onClear, fontSize = 11.5 }) {
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [output]);

  const handleSubmit = () => {
    if (onCommandSubmit) {
      onCommandSubmit(inputText);
    }
    if (inputText.trim()) {
      setHistory(prev => [inputText, ...prev]);
    }
    setInputText('');
    setHistoryIndex(-1);
  };

  const handleAccessoryKeyPress = (key, meta) => {
    if (meta?.paste) {
      setInputText(prev => prev + key);
      return;
    }

    if (key === 'CLEAR') {
      if (onClear) onClear();
      return;
    }

    if (key === 'UP') {
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputText(history[nextIdx]);
      }
      return;
    }

    if (key === 'DOWN') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputText(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputText('');
      }
      return;
    }

    if (meta?.ctrl) {
      if (onCommandSubmit) {
        onCommandSubmit(key);
      }
      return;
    }

    if (key === 'TAB') {
      setInputText(prev => prev + '\t');
      return;
    }

    if (key === 'ESC') {
      if (onCommandSubmit) {
        onCommandSubmit('\x1b');
      }
      return;
    }

    setInputText(prev => prev + key);
  };

  const segments = parseAnsi(output);

  return (
    <View style={styles.container}>
      {/* Terminal Screen Buffer */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.terminalScroll}
        contentContainerStyle={styles.terminalContent}
        showsVerticalScrollIndicator={true}
      >
        <Text style={[styles.terminalText, { fontSize, lineHeight: fontSize * 1.38 }]}>
          {segments.map((seg, idx) => (
            <Text key={idx} style={seg.style}>
              {seg.text}
            </Text>
          ))}
        </Text>
      </ScrollView>

      {/* Terminal Command Input Bar */}
      <View style={styles.inputContainer}>
        <Text style={styles.promptSymbol}>&gt;</Text>
        <TextInput
          ref={inputRef}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSubmit}
          placeholder="Enter command..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.textInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
        />
        {inputText.length > 0 && (
          <TouchableOpacity onPress={() => setInputText('')} style={styles.clearInputBtn}>
            <Text style={styles.clearInputText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile Accessory Keyboard Bar */}
      <TerminalKeyboard onKeyPress={handleAccessoryKeyPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  terminalScroll: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  terminalContent: {
    paddingBottom: 16,
  },
  terminalText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.terminalText,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f1422',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptSymbol: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.cyanLight,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12.5,
    color: '#ffffff',
    paddingVertical: 4,
  },
  clearInputBtn: {
    padding: 6,
  },
  clearInputText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
