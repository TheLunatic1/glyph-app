// Selective Vault Import Modal for Glyph Mobile (100% Desktop Parity)
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';
import {
  X,
  Upload,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckSquare,
  Square,
  ShieldCheck,
  ArrowLeft,
  Server
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { decryptImportFile, importSelectedServers } from '../services/vaultStorage';
import OsLogo from '../components/OsLogo';

export default function ImportModal({ visible, onImportSuccess, onClose }) {
  const [step, setStep] = useState('password'); // 'password' | 'select'
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedServers, setParsedServers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('password');
      setFileContent(null);
      setFileName('');
      setMasterPassword('');
      setShowPassword(false);
      setIsDecrypting(false);
      setIsImporting(false);
      setParsedServers([]);
      setSelectedIds([]);
      setErrorMessage('');
    }
  }, [visible]);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFileName(file.name);
        setErrorMessage('');

        let content = '';
        if (Platform.OS === 'web') {
          const response = await fetch(file.uri);
          content = await response.text();
        } else {
          try {
            content = await FileSystem.readAsStringAsync(file.uri, {
              encoding: FileSystem.EncodingType.UTF8
            });
          } catch (legacyErr) {
            try {
              const fileObj = new File(file.uri);
              content = await fileObj.text();
            } catch (newApiErr) {
              const response = await fetch(file.uri);
              content = await response.text();
            }
          }
        }

        setFileContent(content ? content.trim() : '');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to read selected file: ' + e.message);
    }
  };

  const handleDecryptAndProceed = async () => {
    if (!fileContent) {
      setErrorMessage('Please select a .glyph backup file first.');
      return;
    }

    if (!masterPassword) {
      setErrorMessage('Please enter the master encryption password.');
      return;
    }

    setIsDecrypting(true);
    setErrorMessage('');

    try {
      const servers = await decryptImportFile(fileContent, masterPassword);
      if (!Array.isArray(servers) || servers.length === 0) {
        throw new Error('No valid server configurations found in backup file.');
      }

      setParsedServers(servers);
      // Select all servers by default
      const allIds = servers.map((s, idx) => s.id || `temp_${idx}`);
      setSelectedIds(allIds);
      setStep('select');
    } catch (e) {
      console.warn('Decryption failed:', e);
      setErrorMessage(
        e.message || 'Incorrect master password or corrupted backup file. Please verify and try again.'
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = parsedServers.map((s, idx) => s.id || `temp_${idx}`);
    if (selectedIds.length === parsedServers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleConfirmImport = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one server to import.');
      return;
    }

    setIsImporting(true);
    try {
      const serversToImport = parsedServers.filter((s, idx) => {
        const id = s.id || `temp_${idx}`;
        return selectedIds.includes(id);
      });

      const updatedServers = await importSelectedServers(serversToImport);
      Alert.alert(
        'Import Successful',
        `Successfully restored ${serversToImport.length} server(s). Vault now contains ${updatedServers.length} total servers.`
      );
      if (onImportSuccess) {
        onImportSuccess(updatedServers);
      }
      onClose();
    } catch (e) {
      Alert.alert('Import Failed', e.message || 'Failed to save imported servers.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              {step === 'select' ? (
                <TouchableOpacity onPress={() => setStep('password')} style={styles.backBtn}>
                  <ArrowLeft size={18} color={COLORS.emeraldLight} />
                </TouchableOpacity>
              ) : (
                <Upload size={20} color={COLORS.emeraldLight} style={{ marginRight: 8 }} />
              )}
              <View>
                <Text style={styles.title}>
                  {step === 'password' ? 'Import Server Vault' : 'Select Servers to Import'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {step === 'password'
                    ? 'Decrypt .glyph backups from Desktop or Mobile'
                    : `Found ${parsedServers.length} server(s) in backup file`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              onPress={onClose}
              style={styles.closeBtn}
            >
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {step === 'password' ? (
            /* STEP 1: Password & File Selection */
            <View style={styles.body}>
              <Text style={styles.subtitle}>
                Enter the master password used to encrypt the backup, then select your <Text style={{ color: COLORS.emeraldLight, fontWeight: '700' }}>.glyph</Text> file.
              </Text>

              {/* Master Password Input with Eye toggle */}
              <View style={styles.passwordBox}>
                <View style={styles.passwordHeader}>
                  <Lock size={15} color={COLORS.amberLight} style={{ marginRight: 6 }} />
                  <Text style={styles.passwordTitle}>Master Decryption Password</Text>
                </View>
                <View style={styles.passwordInputRow}>
                  <TextInput
                    value={masterPassword}
                    onChangeText={(text) => {
                      setMasterPassword(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    placeholder="Enter master password"
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.passwordInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={COLORS.textSecondary} />
                    ) : (
                      <Eye size={18} color={COLORS.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* File Picker Box */}
              <TouchableOpacity onPress={handlePickFile} style={styles.pickerBox}>
                <FileText size={32} color={fileName ? COLORS.emeraldLight : COLORS.primaryLight} />
                <Text style={styles.pickerTitle} numberOfLines={1}>
                  {fileName ? fileName : 'Choose .glyph Backup File'}
                </Text>
                <Text style={styles.pickerHint}>
                  {fileName ? 'Tap to change file' : 'Tap to browse storage or files'}
                </Text>
              </TouchableOpacity>

              {/* Error Message banner */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Decrypt & Proceed Action Button */}
              <TouchableOpacity
                disabled={isDecrypting || !fileContent || !masterPassword}
                onPress={handleDecryptAndProceed}
                style={[
                  styles.importBtn,
                  (!fileContent || !masterPassword || isDecrypting) && styles.importBtnDisabled
                ]}
              >
                {isDecrypting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ShieldCheck size={18} color="#ffffff" />
                )}
                <Text style={styles.importBtnText}>
                  {isDecrypting ? 'Decrypting Vault...' : 'Decrypt & Load Servers'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 2: Selective Server Import & Preview */
            <View style={styles.body}>
              <View style={styles.selectionBar}>
                <Text style={styles.selectionCount}>
                  Selected ({selectedIds.length}/{parsedServers.length})
                </Text>
                <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn}>
                  <Text style={styles.selectAllText}>
                    {selectedIds.length === parsedServers.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Server List */}
              <ScrollView style={styles.serverScrollList} contentContainerStyle={{ paddingVertical: 4 }}>
                {parsedServers.map((server, idx) => {
                  const serverKey = server.id || `temp_${idx}`;
                  const isSelected = selectedIds.includes(serverKey);
                  return (
                    <TouchableOpacity
                      key={serverKey}
                      onPress={() => toggleSelect(serverKey)}
                      activeOpacity={0.7}
                      style={[
                        styles.serverCard,
                        isSelected && styles.serverCardSelected
                      ]}
                    >
                      <View style={styles.checkboxWrapper}>
                        {isSelected ? (
                          <View style={styles.checkboxChecked}>
                            <Check size={12} color="#ffffff" strokeWidth={3} />
                          </View>
                        ) : (
                          <View style={styles.checkboxUnchecked} />
                        )}
                      </View>

                      <OsLogo server={server} size={32} />

                      <View style={styles.serverInfo}>
                        <Text style={styles.serverName} numberOfLines={1}>
                          {server.name || server.host}
                        </Text>
                        <Text style={styles.serverHost} numberOfLines={1}>
                          {server.username || 'root'}@{server.host}:{server.port || 22}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  onPress={() => setStep('password')}
                  style={styles.backFooterBtn}
                >
                  <Text style={styles.backFooterBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={isImporting || selectedIds.length === 0}
                  onPress={handleConfirmImport}
                  style={[
                    styles.confirmImportBtn,
                    (isImporting || selectedIds.length === 0) && styles.importBtnDisabled
                  ]}
                >
                  {isImporting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Upload size={18} color="#ffffff" />
                  )}
                  <Text style={styles.confirmImportBtnText}>
                    {isImporting ? 'Restoring...' : `Import (${selectedIds.length})`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#0d101a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    marginRight: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  body: {
    padding: 20,
    paddingBottom: 36,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  passwordBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.amberLight,
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 10,
    maxWidth: '90%',
    textAlign: 'center',
  },
  pickerHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    lineHeight: 16,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emerald,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  importBtnDisabled: {
    opacity: 0.4,
  },
  importBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectionCount: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: COLORS.textSecondary,
  },
  selectAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.emeraldLight,
  },
  serverScrollList: {
    maxHeight: 240,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  serverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  serverCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  checkboxWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: COLORS.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  serverInfo: {
    flex: 1,
    minWidth: 0,
  },
  serverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  serverHost: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backFooterBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  backFooterBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmImportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emerald,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmImportBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
