// Biometric & Master PIN Lock Screen for Glyph Mobile
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Shield, Fingerprint, Delete, Lock } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import { authenticateWithBiometrics, verifyMasterPin } from '../services/authService';

export default function BiometricLockView({ onUnlocked }) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Attempt biometric prompt on mount
    triggerBiometrics();
  }, []);

  const triggerBiometrics = async () => {
    const success = await authenticateWithBiometrics('Authenticate to unlock Glyph Vault');
    if (success) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onUnlocked();
    }
  };

  const handleDigitPress = async (digit) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg('');

    if (newPin.length >= 4) {
      const isValid = await verifyMasterPin(newPin);
      if (isValid) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onUnlocked();
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        setErrorMsg('Invalid Master PIN. Please try again.');
        setPin('');
      }
    }
  };

  const handleDeleteDigit = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      {/* Header / Brand */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, SHADOWS.glowPrimary]}>
          <Shield size={36} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.appName}>Glyph Vault</Text>
        <Text style={styles.appSubtitle}>Enter Master PIN or use Biometrics</Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.pinDotsRow}>
        {[0, 1, 2, 3].map(idx => (
          <View
            key={idx}
            style={[
              styles.pinDot,
              pin.length > idx && styles.pinDotFilled,
              errorMsg ? styles.pinDotError : null
            ]}
          />
        ))}
      </View>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {/* Keypad */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['bio', '0', 'del']
        ].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map(item => {
              if (item === 'bio') {
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={triggerBiometrics}
                    style={[styles.keypadBtn, styles.keypadBtnSpecial]}
                  >
                    <Fingerprint size={28} color={COLORS.cyanLight} />
                  </TouchableOpacity>
                );
              }
              if (item === 'del') {
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={handleDeleteDigit}
                    style={[styles.keypadBtn, styles.keypadBtnSpecial]}
                  >
                    <Delete size={24} color={COLORS.roseLight} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleDigitPress(item)}
                  style={styles.keypadBtn}
                >
                  <Text style={styles.keypadDigit}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  pinDotError: {
    borderColor: COLORS.rose,
    backgroundColor: 'rgba(244, 63, 94, 0.3)',
  },
  errorText: {
    color: COLORS.roseLight,
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
    marginTop: 10,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(25, 30, 48, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadBtnSpecial: {
    backgroundColor: 'rgba(15, 18, 30, 0.6)',
  },
  keypadDigit: {
    fontSize: 26,
    fontWeight: '600',
    color: '#ffffff',
  }
});
