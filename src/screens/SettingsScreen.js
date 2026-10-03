// Settings & App Configuration Screen for Glyph Mobile
// Trademark Attribution, Biometrics, Terminal & MCP Relay
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  Image
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  Shield,
  Fingerprint,
  Terminal,
  Download,
  Upload,
  Wifi,
  HardDrive,
  Check,
  ChevronLeft,
  ExternalLink
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { getSettings, saveSettings } from '../services/vaultStorage';
import { setMasterPin, checkBiometricHardware } from '../services/authService';

const GithubIcon = ({ size = 16, color = '#ffffff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </Svg>
);

export default function SettingsScreen({ onBack, onOpenExport, onOpenImport }) {
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [terminalFontSize, setTerminalFontSize] = useState(11.5);
  const [desktopHost, setDesktopHost] = useState('192.168.1.100');
  const [desktopPort, setDesktopPort] = useState('15354');
  const [bioHardware, setBioHardware] = useState({ hasHardware: false });
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const s = await getSettings();
    setBiometricsEnabled(s.biometricsEnabled !== false);
    setHasExistingPin(!!s.masterPinHash);
    setTerminalFontSize(s.terminalFontSize || 11.5);
    setDesktopHost(s.desktopRelayHost || '192.168.1.100');
    setDesktopPort(String(s.desktopRelayPort || 15354));

    const hw = await checkBiometricHardware();
    setBioHardware(hw);
  };

  const handleSavePin = async () => {
    if (!pin) {
      await setMasterPin(null);
      setHasExistingPin(false);
      Alert.alert('Security', 'Master PIN has been removed.');
      return;
    }

    if (pin.length < 4) {
      Alert.alert('PIN Error', 'PIN must be at least 4 digits.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please re-enter.');
      return;
    }

    await setMasterPin(pin);
    setHasExistingPin(true);
    setPin('');
    setConfirmPin('');
    triggerSaved();
    Alert.alert('Success', 'Master PIN set successfully!');
  };

  const handleSavePreferences = async () => {
    await saveSettings({
      biometricsEnabled,
      terminalFontSize,
      desktopRelayHost: desktopHost,
      desktopRelayPort: parseInt(desktopPort, 10) || 15354
    });
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Preferences</Text>
        <View style={{ width: 40 }}>
          {savedBadge && (
            <View style={styles.savedPill}>
              <Check size={12} color={COLORS.emeraldLight} />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Author & Trademark Card (Desktop Parity) */}
        <View style={styles.trademarkCard}>
          <View style={styles.trademarkTop}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.trademarkLogo}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.trademarkTitleRow}>
                <Text style={styles.trademarkTitle}>Glyph</Text>
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>v1.0.0</Text>
                </View>
              </View>
              <Text style={styles.trademarkSubtitle}>Secure SSH & Server Management</Text>
            </View>
          </View>

          <View style={styles.authorDivider} />

          <View style={styles.authorRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorLabel}>DESIGNED & DEVELOPED BY</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Linking.openURL('https://github.com/TheLunatic1')}
                style={styles.authorLink}
              >
                <Text style={styles.authorName}>TheLunatic1</Text>
                <Text style={styles.authorRealName}>(Salman Toha)</Text>
                <ExternalLink size={13} color="#818cf8" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/TheLunatic1/Glyph')}
              style={styles.githubBtn}
            >
              <GithubIcon size={16} color="#ffffff" />
              <Text style={styles.githubBtnText}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={18} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Security & Lock</Text>
          </View>

          {/* Biometrics toggle */}
          <View style={styles.rowItem}>
            <View style={styles.rowItemLeft}>
              <Fingerprint size={20} color={COLORS.cyanLight} style={{ marginRight: 10 }} />
              <View>
                <Text style={styles.rowTitle}>Biometric Unlock</Text>
                <Text style={styles.rowSubtitle}>Face ID / Touch ID authentication</Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={val => {
                setBiometricsEnabled(val);
                saveSettings({ biometricsEnabled: val });
              }}
              trackColor={{ false: '#262d40', true: COLORS.primary }}
              thumbColor={biometricsEnabled ? '#ffffff' : '#94a3b8'}
            />
          </View>

          {/* PIN Setup */}
          <View style={styles.pinCard}>
            <Text style={styles.pinCardTitle}>
              {hasExistingPin ? 'Change Master PIN' : 'Set Master PIN (Optional)'}
            </Text>
            <View style={styles.pinInputRow}>
              <TextInput
                value={pin}
                onChangeText={setPin}
                secureTextEntry={true}
                keyboardType="numeric"
                maxLength={6}
                placeholder="New 4-6 digit PIN"
                placeholderTextColor={COLORS.textMuted}
                style={styles.pinInput}
              />
              <TextInput
                value={confirmPin}
                onChangeText={setConfirmPin}
                secureTextEntry={true}
                keyboardType="numeric"
                maxLength={6}
                placeholder="Confirm PIN"
                placeholderTextColor={COLORS.textMuted}
                style={styles.pinInput}
              />
            </View>
            <TouchableOpacity onPress={handleSavePin} style={styles.savePinBtn}>
              <Text style={styles.savePinBtnText}>Update PIN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terminal Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Terminal size={18} color={COLORS.cyanLight} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Terminal & Density</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Font Size ({terminalFontSize}pt)</Text>
            <View style={styles.fontSizeControls}>
              <TouchableOpacity
                onPress={() => {
                  const val = Math.max(9, Math.round((terminalFontSize - 0.5) * 10) / 10);
                  setTerminalFontSize(val);
                  saveSettings({ terminalFontSize: val });
                }}
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.fontSizeValue}>{terminalFontSize}</Text>
              <TouchableOpacity
                onPress={() => {
                  const val = Math.min(18, Math.round((terminalFontSize + 0.5) * 10) / 10);
                  setTerminalFontSize(val);
                  saveSettings({ terminalFontSize: val });
                }}
                style={styles.fontBtn}
              >
                <Text style={styles.fontBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Desktop Pair & MCP Relay */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wifi size={18} color={COLORS.amberLight} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Desktop Pairing & MCP Relay</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Sync with Glyph Desktop running on your local network (port 15354).
          </Text>

          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 2.5, marginRight: 8 }]}>
              <Text style={styles.fieldLabel}>Desktop IP</Text>
              <TextInput
                value={desktopHost}
                onChangeText={setDesktopHost}
                onBlur={handleSavePreferences}
                placeholder="192.168.1.100"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
            </View>
            <View style={[styles.field, { flex: 1.2 }]}>
              <Text style={styles.fieldLabel}>Port</Text>
              <TextInput
                value={desktopPort}
                onChangeText={setDesktopPort}
                onBlur={handleSavePreferences}
                keyboardType="numeric"
                placeholder="15354"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* Backup & Restore */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <HardDrive size={18} color={COLORS.emeraldLight} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Backup & Migration</Text>
          </View>

          <View style={styles.backupActions}>
            <TouchableOpacity onPress={onOpenExport} style={styles.backupBtn}>
              <Download size={16} color={COLORS.cyanLight} />
              <Text style={[styles.backupBtnText, { color: COLORS.cyanLight }]}>Export .glyph Backup</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onOpenImport} style={styles.backupBtn}>
              <Upload size={16} color={COLORS.emeraldLight} />
              <Text style={[styles.backupBtnText, { color: COLORS.emeraldLight }]}>Import .glyph Backup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Glyph • Made by <Text style={{ color: '#818cf8', fontWeight: '700' }}>TheLunatic1 (Salman Toha)</Text>
          </Text>
          <Text style={styles.footerSubtext}>v1.0.0 • All rights reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 18, 29, 0.95)',
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  savedText: {
    fontSize: 10,
    color: COLORS.emeraldLight,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 50,
  },
  trademarkCard: {
    backgroundColor: '#0f121d',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  trademarkTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trademarkLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  trademarkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trademarkTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818cf8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  trademarkSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  authorDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  authorLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#818cf8',
  },
  authorRealName: {
    fontSize: 13,
    color: '#cbd5e1',
    marginLeft: 4,
  },
  githubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  githubBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rowSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pinCard: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  pinCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  pinInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  pinInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  savePinBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  savePinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fontBtn: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  fontSizeValue: {
    color: COLORS.cyanLight,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
  rowFields: {
    flexDirection: 'row',
  },
  field: {
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  backupActions: {
    gap: 8,
  },
  backupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 10,
  },
  backupBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
