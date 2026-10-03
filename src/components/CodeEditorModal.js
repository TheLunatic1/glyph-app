// Remote Code Editor Modal for Glyph Mobile SFTP
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
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Save, FileCode, Check } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function CodeEditorModal({ visible, filePath, initialContent = '', onSave, onClose }) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, visible]);

  const fileName = filePath ? filePath.substring(filePath.lastIndexOf('/') + 1) : 'editor';

  const handleSave = async () => {
    setIsSaving(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    try {
      if (onSave) {
        await onSave(filePath, content);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      Alert.alert('Error', 'Failed to save file changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Split lines for line numbers
  const lines = content.split('\n');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <FileCode size={18} color={COLORS.cyanLight} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
              <Text style={styles.filePath} numberOfLines={1}>{filePath}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              disabled={isSaving}
              onPress={handleSave}
              style={[styles.saveBtn, savedSuccess && styles.savedSuccessBtn]}
            >
              {savedSuccess ? (
                <>
                  <Check size={14} color="#ffffff" />
                  <Text style={styles.saveBtnText}>Saved</Text>
                </>
              ) : (
                <>
                  <Save size={14} color="#ffffff" />
                  <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Editor Area */}
        <ScrollView style={styles.editorScroll} contentContainerStyle={styles.editorContent}>
          <View style={styles.editorRow}>
            {/* Line numbers column */}
            <View style={styles.lineNumbersCol}>
              {lines.map((_, i) => (
                <Text key={i} style={styles.lineNumberText}>
                  {i + 1}
                </Text>
              ))}
            </View>

            {/* Input field */}
            <TextInput
              multiline
              value={content}
              onChangeText={setContent}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              style={styles.textInput}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: 12,
    backgroundColor: '#101420',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  filePath: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  savedSuccessBtn: {
    backgroundColor: COLORS.emerald,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  editorScroll: {
    flex: 1,
    backgroundColor: '#080a10',
  },
  editorContent: {
    paddingBottom: 40,
  },
  editorRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  lineNumbersCol: {
    width: 40,
    paddingRight: 8,
    alignItems: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
  },
  lineNumberText: {
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  textInput: {
    flex: 1,
    color: '#f8fafc',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 0,
  }
});
