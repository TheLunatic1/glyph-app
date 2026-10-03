// Mobile Terminal Accessory Keyboard for Glyph Mobile
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerDownLeft, Copy, Clipboard as PasteIcon, Trash2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function TerminalKeyboard({ onKeyPress, onSendMacro }) {
  const [ctrlActive, setCtrlActive] = useState(false);
  const [altActive, setAltActive] = useState(false);

  const handlePress = (key, type = 'char') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (key === 'CTRL') {
      setCtrlActive(!ctrlActive);
      return;
    }

    if (key === 'ALT') {
      setAltActive(!altActive);
      return;
    }

    if (onKeyPress) {
      onKeyPress(key, { ctrl: ctrlActive, alt: altActive, type });
    }

    if (ctrlActive) setCtrlActive(false);
    if (altActive) setAltActive(false);
  };

  const handlePaste = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const text = await Clipboard.getStringAsync();
    if (text && onKeyPress) {
      onKeyPress(text, { paste: true });
    }
  };

  return (
    <View style={styles.accessoryBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modifier Keys */}
        <TouchableOpacity
          onPress={() => handlePress('ESC', 'special')}
          style={[styles.keyBtn, styles.specialKey]}
        >
          <Text style={styles.keyTextSpecial}>ESC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress('TAB', 'special')}
          style={[styles.keyBtn, styles.specialKey]}
        >
          <Text style={styles.keyTextSpecial}>TAB</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress('CTRL')}
          style={[styles.keyBtn, ctrlActive && styles.keyBtnActive]}
        >
          <Text style={[styles.keyTextSpecial, ctrlActive && styles.keyTextActive]}>CTRL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress('ALT')}
          style={[styles.keyBtn, altActive && styles.keyBtnActive]}
        >
          <Text style={[styles.keyTextSpecial, altActive && styles.keyTextActive]}>ALT</Text>
        </TouchableOpacity>

        {/* Quick Signals */}
        <TouchableOpacity
          onPress={() => onSendMacro && onSendMacro('SIGINT')}
          style={[styles.keyBtn, styles.macroKey]}
        >
          <Text style={styles.keyTextMacro}>^C</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSendMacro && onSendMacro('SIGTSTP')}
          style={[styles.keyBtn, styles.macroKey]}
        >
          <Text style={styles.keyTextMacro}>^Z</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSendMacro && onSendMacro('EOF')}
          style={[styles.keyBtn, styles.macroKey]}
        >
          <Text style={styles.keyTextMacro}>^D</Text>
        </TouchableOpacity>

        {/* Essential Terminal Chars */}
        {['|', '/', '~', '-', '_', '$', ':', ';', '&', '>', '<', '`', '"', "'"].map(char => (
          <TouchableOpacity
            key={char}
            onPress={() => handlePress(char, 'char')}
            style={styles.keyBtn}
          >
            <Text style={styles.keyText}>{char}</Text>
          </TouchableOpacity>
        ))}

        {/* Navigation Arrows */}
        <TouchableOpacity
          onPress={() => handlePress('UP', 'arrow')}
          style={[styles.keyBtn, styles.arrowKey]}
        >
          <ArrowUp size={16} color={COLORS.cyanLight} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress('DOWN', 'arrow')}
          style={[styles.keyBtn, styles.arrowKey]}
        >
          <ArrowDown size={16} color={COLORS.cyanLight} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress('LEFT', 'arrow')}
          style={[styles.keyBtn, styles.arrowKey]}
        >
          <ArrowLeft size={16} color={COLORS.cyanLight} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress('RIGHT', 'arrow')}
          style={[styles.keyBtn, styles.arrowKey]}
        >
          <ArrowRight size={16} color={COLORS.cyanLight} />
        </TouchableOpacity>

        {/* Clipboard Actions */}
        <TouchableOpacity
          onPress={handlePaste}
          style={[styles.keyBtn, styles.specialKey]}
        >
          <PasteIcon size={14} color={COLORS.emeraldLight} style={{ marginRight: 3 }} />
          <Text style={[styles.keyTextSpecial, { color: COLORS.emeraldLight }]}>Paste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePress('CLEAR', 'special')}
          style={[styles.keyBtn, styles.specialKey]}
        >
          <Trash2 size={13} color={COLORS.roseLight} style={{ marginRight: 3 }} />
          <Text style={[styles.keyTextSpecial, { color: COLORS.roseLight }]}>Clear</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  accessoryBar: {
    backgroundColor: '#0c0f17',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyBtn: {
    backgroundColor: 'rgba(30, 36, 56, 0.85)',
    height: 36,
    minWidth: 38,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  keyBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },
  specialKey: {
    backgroundColor: 'rgba(40, 48, 75, 0.9)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  macroKey: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  arrowKey: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    minWidth: 36,
    paddingHorizontal: 6,
  },
  keyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keyTextSpecial: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  keyTextMacro: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.roseLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keyTextActive: {
    color: '#ffffff',
  }
});
