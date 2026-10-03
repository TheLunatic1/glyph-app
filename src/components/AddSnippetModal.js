// Add / Create Snippet Modal matching Desktop Commands.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Zap, X, Plus } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function AddSnippetModal({ visible, onSave, onClose }) {
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');

  const handleSave = () => {
    if (!name.trim() || !command.trim()) {
      Alert.alert('Validation', 'Please provide both snippet name and shell command.');
      return;
    }

    onSave({
      name: name.trim(),
      command: command.trim(),
      uses: 0
    });

    setName('');
    setCommand('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Zap size={20} color="#818cf8" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Add Saved Command</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
            {/* Snippet Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>SNIPPET NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Restart Nginx"
                placeholderTextColor={COLORS.textMuted}
                style={styles.textInput}
              />
            </View>

            {/* Shell Command */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>SHELL COMMAND</Text>
              <TextInput
                value={command}
                onChangeText={setCommand}
                placeholder="systemctl restart nginx"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                multiline={true}
                numberOfLines={3}
                style={[styles.textInput, styles.monoInput, { minHeight: 70, textAlignVertical: 'top' }]}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Plus size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Save Snippet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0f121d',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalBody: {
    maxHeight: 340,
  },
  modalBodyContent: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#16192b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  }
});
