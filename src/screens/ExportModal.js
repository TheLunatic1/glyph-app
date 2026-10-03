// Selective Vault Export Modal for Glyph Mobile (100% Desktop Parity)
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { X, Download, ShieldCheck, Check, Lock, Eye, EyeOff } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { exportVault } from '../services/vaultStorage';
import OsLogo from '../components/OsLogo';

export default function ExportModal({ visible, servers = [], onClose }) {
  const [selectedIds, setSelectedIds] = useState(servers.map(s => s.id));
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedIds(servers.map(s => s.id));
      setMasterPassword('');
      setShowPassword(false);
      setIsExporting(false);
    }
  }, [visible, servers]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === servers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(servers.map(s => s.id));
    }
  };

  const handleExport = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one server to export.');
      return;
    }

    if (!masterPassword) {
      Alert.alert('Password Required', 'Please enter a Master Password to encrypt this backup.');
      return;
    }

    setIsExporting(true);
    try {
      const encryptedJson = await exportVault(selectedIds, masterPassword);
      const fileName = `glyph_servers_${new Date().toISOString().slice(0, 10)}.glyph`;

      if (Platform.OS === 'web') {
        const blob = new Blob([encryptedJson], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        Alert.alert('Success', 'Backup file downloaded successfully!');
      } else {
        const baseDir = FileSystem.documentDirectory || (Paths ? Paths.document : '');
        const fileUri = `${baseDir}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, encryptedJson, {
          encoding: FileSystem.EncodingType.UTF8
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/octet-stream',
            dialogTitle: 'Export Glyph Encrypted Backup',
            UTI: 'public.data'
          });
        } else {
          Alert.alert('Backup Saved', `Saved to: ${fileName}`);
        }
      }

      onClose();
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'An error occurred during export.');
    } finally {
      setIsExporting(false);
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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Download size={20} color={COLORS.cyanLight} style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.title}>Export Server Vault</Text>
                <Text style={styles.headerSubtitle}>Create an encrypted .glyph backup file</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.sectionSubtitle}>
              Select the servers you want to export into an AES-256-GCM encrypted <Text style={{ color: COLORS.cyanLight, fontWeight: '700' }}>.glyph</Text> backup file.
            </Text>

            {/* Select All Toggle */}
            <View style={styles.selectionBar}>
              <Text style={styles.selectionCount}>
                Select Servers ({selectedIds.length}/{servers.length})
              </Text>
              <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllBtn}>
                <Text style={styles.selectAllText}>
                  {selectedIds.length === servers.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Server List */}
            <ScrollView style={styles.serverScrollList} contentContainerStyle={{ paddingVertical: 4 }}>
              {servers.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No servers available to export.</Text>
                </View>
              ) : (
                servers.map(s => {
                  const isChecked = selectedIds.includes(s.id);
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => toggleSelect(s.id)}
                      activeOpacity={0.7}
                      style={[styles.serverCard, isChecked && styles.serverCardChecked]}
                    >
                      <View style={styles.checkboxWrapper}>
                        {isChecked ? (
                          <View style={styles.checkboxChecked}>
                            <Check size={12} color="#ffffff" strokeWidth={3} />
                          </View>
                        ) : (
                          <View style={styles.checkboxUnchecked} />
                        )}
                      </View>

                      <OsLogo server={s} size={32} />

                      <View style={styles.serverInfo}>
                        <Text style={styles.serverName} numberOfLines={1}>{s.name || s.host}</Text>
                        <Text style={styles.serverHost} numberOfLines={1}>
                          {s.username || 'root'}@{s.host}:{s.port || 22}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            {/* Master Password for Encryption */}
            <View style={styles.passwordBox}>
              <View style={styles.passwordHeader}>
                <Lock size={15} color={COLORS.amberLight} style={{ marginRight: 6 }} />
                <Text style={styles.passwordTitle}>Master Encryption Password</Text>
              </View>
              <View style={styles.passwordInputRow}>
                <TextInput
                  value={masterPassword}
                  onChangeText={setMasterPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  placeholder="Enter a master password to encrypt export"
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
              <Text style={styles.passwordHint}>
                You will need this password when importing these servers on Desktop or other devices.
              </Text>
            </View>

            <TouchableOpacity
              disabled={isExporting || selectedIds.length === 0 || !masterPassword}
              onPress={handleExport}
              style={[
                styles.exportBtn,
                (isExporting || selectedIds.length === 0 || !masterPassword) && styles.exportBtnDisabled
              ]}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <ShieldCheck size={18} color="#ffffff" />
              )}
              <Text style={styles.exportBtnText}>
                {isExporting ? 'Encrypting & Exporting...' : `Export (${selectedIds.length})`}
              </Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    color: COLORS.cyanLight,
  },
  serverScrollList: {
    maxHeight: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
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
  serverCardChecked: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  checkboxWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: COLORS.cyan,
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
  passwordHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cyan,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  exportBtnDisabled: {
    opacity: 0.4,
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  }
});
