// Authentication Service for Glyph Mobile (Biometrics & Master PIN)
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { hashString } from '../utils/crypto';
import { getSettings, saveSettings } from './vaultStorage';

export async function checkBiometricHardware() {
  if (Platform.OS === 'web') return { hasHardware: false, isEnrolled: false };
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return {
      hasHardware,
      isEnrolled,
      supportedTypes // 1: Fingerprint, 2: Facial Recognition, 3: Iris
    };
  } catch (error) {
    return { hasHardware: false, isEnrolled: false };
  }
}

export async function authenticateWithBiometrics(promptMessage = 'Unlock Glyph Server Vault') {
  if (Platform.OS === 'web') return true;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Use Master PIN',
      fallbackLabel: 'Enter Master PIN',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Biometric auth failed:', error);
    return false;
  }
}

export async function verifyMasterPin(inputPin) {
  const settings = await getSettings();
  if (!settings.masterPinHash) {
    // If no PIN is set, auto-pass
    return true;
  }
  const inputHash = await hashString(inputPin);
  return inputHash === settings.masterPinHash;
}

export async function setMasterPin(newPin) {
  const settings = await getSettings();
  if (!newPin) {
    settings.masterPinHash = null;
    settings.isLocked = false;
  } else {
    settings.masterPinHash = await hashString(newPin);
    settings.isLocked = true;
  }
  await saveSettings(settings);
}
