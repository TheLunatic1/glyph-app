// Add / Edit Server Modal for Glyph Mobile - Direct Port of Desktop App.jsx Server Form
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
  KeyboardAvoidingView
} from 'react-native';
import { ShieldCheck, Eye, EyeOff, X, ChevronDown, ChevronUp, Key, Network } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';

export default function AddEditServerModal({ visible, server, onSave, onClose }) {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('');
  const [zerotier, setZerotier] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (server) {
      setName(server.name || '');
      setHost(server.host || '');
      setPort(String(server.port || 22));
      setUsername(server.username || 'root');
      setPassword('');
      setZerotier(server.zerotier || '');
      setPrivateKey(server.privateKey || server.privateKeyPath || '');
      setShowAdvanced(!!(server.zerotier || server.privateKey || server.privateKeyPath));
    } else {
      setName('');
      setHost('');
      setPort('22');
      setUsername('root');
      setPassword('');
      setZerotier('');
      setPrivateKey('');
      setShowAdvanced(false);
    }
    setShowPassword(false);
  }, [server, visible]);

  const handleSubmit = () => {
    if (!host.trim()) {
      Alert.alert('Validation Error', 'Please enter a Host / IP address.');
      return;
    }

    const payload = {
      ...(server || {}),
      name: name.trim() || host.trim(),
      host: host.trim(),
      port: parseInt(port, 10) || 22,
      username: username.trim() || 'root',
      zerotier: zerotier.trim(),
      privateKey: privateKey.trim(),
    };

    if (password.length > 0) {
      payload.password = password;
    }

    onSave(payload);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ShieldCheck size={22} color={COLORS.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.title}>
                {server?.id ? 'Edit Server (Secure Vault)' : 'Add New Server (Secure Vault)'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Name (Alias) */}
            <View style={styles.field}>
              <Text style={styles.label}>Name (Alias)</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Prod Server"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
            </View>

            {/* Host / IP */}
            <View style={styles.field}>
              <Text style={styles.label}>Host / IP *</Text>
              <TextInput
                value={host}
                onChangeText={setHost}
                placeholder="192.168.1.100"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Port & Username Row */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Port</Text>
                <TextInput
                  value={port}
                  onChangeText={setPort}
                  placeholder="22"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={[styles.field, { flex: 2 }]}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="root"
                  placeholderTextColor={COLORS.textMuted}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={server?.id ? "•••••••• (leave empty to keep)" : "••••••••"}
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                  autoCapitalize="none"
                  autoCorrect={false}
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

            {/* Advanced Options Accordion */}
            {showAdvanced && (
              <View style={styles.advancedBox}>
                <View style={styles.field}>
                  <View style={styles.advancedLabelRow}>
                    <Network size={14} color="#facc15" style={{ marginRight: 6 }} />
                    <Text style={styles.label}>ZeroTier Network ID <Text style={styles.optionalText}>(Optional)</Text></Text>
                  </View>
                  <TextInput
                    value={zerotier}
                    onChangeText={setZerotier}
                    placeholder="e5cd7a9e1cae134f"
                    placeholderTextColor={COLORS.textMuted}
                    style={[styles.input, styles.monoInput]}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.helperText}>
                    ZeroTier Network ID for mesh routing and secure P2P overlay
                  </Text>
                </View>

                <View style={[styles.field, { marginTop: 12 }]}>
                  <View style={styles.advancedLabelRow}>
                    <Key size={14} color={COLORS.cyanLight} style={{ marginRight: 6 }} />
                    <Text style={styles.label}>SSH Private Key Path / Key <Text style={styles.optionalText}>(Optional)</Text></Text>
                  </View>
                  <TextInput
                    value={privateKey}
                    onChangeText={setPrivateKey}
                    placeholder="/home/user/.ssh/id_rsa or paste key"
                    placeholderTextColor={COLORS.textMuted}
                    multiline={privateKey.includes('\n')}
                    style={[styles.input, styles.monoInput, privateKey.includes('\n') && { height: 70 }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.helperText}>
                    Path to your private key file or paste the OpenSSH private key
                  </Text>
                </View>
              </View>
            )}

            {/* Toggle Advanced */}
            <TouchableOpacity
              onPress={() => setShowAdvanced(!showAdvanced)}
              style={styles.toggleAdvancedBtn}
            >
              <Text style={styles.toggleAdvancedText}>
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </Text>
              {showAdvanced ? (
                <ChevronUp size={16} color={COLORS.primaryLight} />
              ) : (
                <ChevronDown size={16} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f111a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  formScroll: {
    maxHeight: 520,
  },
  formContainer: {
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748b',
  },
  input: {
    backgroundColor: '#0a0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  advancedBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    padding: 14,
    marginBottom: 14,
  },
  advancedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    marginLeft: 2,
  },
  toggleAdvancedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 20,
  },
  toggleAdvancedText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
