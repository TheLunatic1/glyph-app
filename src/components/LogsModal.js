// Logs Viewer Modal for Glyph Mobile
// 100% Desktop Parity over Docker Logs with Line Numbers & Search
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { X, Search, Copy, Check, Terminal } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { sanitizeAnsi } from './TerminalView';

export default function LogsModal({ visible, title, container, logs = [], onClose }) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const displayTitle = title || (container?.name ? `${container.name} Logs` : 'Container Logs');
  
  let rawText = '';
  if (typeof logs === 'string') {
    rawText = logs;
  } else if (Array.isArray(logs)) {
    rawText = logs.join('\n');
  } else if (logs && typeof logs === 'object') {
    rawText = JSON.stringify(logs, null, 2);
  }

  const cleanText = sanitizeAnsi(rawText || '');
  const allLines = cleanText ? cleanText.split('\n') : [];

  const filteredLogs = allLines.filter(line =>
    line.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(filteredLogs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Terminal size={18} color={COLORS.cyanLight} style={{ marginRight: 8 }} />
              <Text style={styles.title} numberOfLines={1}>
                {displayTitle}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search bar & Copy action */}
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Search size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Filter logs..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
              {copied ? (
                <>
                  <Check size={14} color={COLORS.emeraldLight} />
                  <Text style={[styles.copyBtnText, { color: COLORS.emeraldLight }]}>Copied</Text>
                </>
              ) : (
                <>
                  <Copy size={14} color={COLORS.cyanLight} />
                  <Text style={styles.copyBtnText}>Copy</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Log Stream */}
          <ScrollView
            style={styles.logScrollView}
            contentContainerStyle={styles.logContent}
            showsVerticalScrollIndicator={true}
          >
            {filteredLogs.length === 0 ? (
              <Text style={styles.emptyText}>
                {cleanText ? 'No logs match your filter.' : 'Waiting for logs / No logs output.'}
              </Text>
            ) : (
              filteredLogs.map((line, idx) => (
                <Text key={idx} style={styles.logLine}>
                  <Text style={styles.lineNumber}>{(idx + 1).toString().padStart(3, '0')}  </Text>
                  {line}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0c0f18',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '82%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.cyanLight,
    marginLeft: 6,
  },
  logScrollView: {
    flex: 1,
    backgroundColor: '#07090e',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
  },
  logContent: {
    paddingBottom: 24,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
  },
  logLine: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    lineHeight: 16,
    color: '#e2e8f0',
    marginBottom: 2,
  },
  lineNumber: {
    color: '#475569',
  },
});
