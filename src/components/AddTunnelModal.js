// Add / Create Tunnel Modal matching Desktop Tunnels.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { Network, X, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function AddTunnelModal({ visible, onSave, onClose }) {
  const [name, setName] = useState('');
  const [localPort, setLocalPort] = useState('');
  const [remoteHost, setRemoteHost] = useState('127.0.0.1');
  const [remotePort, setRemotePort] = useState('');
  const [protocol, setProtocol] = useState('tcp'); // 'tcp' | 'udp'

  const handleSave = () => {
    if (!localPort || !remotePort) {
      Alert.alert('Validation', 'Please provide both local port and remote port.');
      return;
    }

    const lPort = parseInt(localPort, 10);
    const rPort = parseInt(remotePort, 10);

    if (isNaN(lPort) || lPort < 1 || lPort > 65535) {
      Alert.alert('Validation', 'Local port must be between 1 and 65535.');
      return;
    }

    if (isNaN(rPort) || rPort < 1 || rPort > 65535) {
      Alert.alert('Validation', 'Remote port must be between 1 and 65535.');
      return;
    }

    onSave({
      name: name.trim() || `Tunnel :${lPort}`,
      localPort: lPort,
      remoteHost: remoteHost.trim() || '127.0.0.1',
      remotePort: rPort,
      protocol: protocol.toLowerCase(),
      type: 'local',
      status: 'active',
      transferred: '0 B'
    });

    setName('');
    setLocalPort('');
    setRemoteHost('127.0.0.1');
    setRemotePort('');
    setProtocol('tcp');
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
              <Network size={20} color="#818cf8" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Create New Tunnel</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.modalBody}>
            {/* Description note matching Desktop */}
            <Text style={styles.helperText}>
              Create a secure SSH tunnel to access internal remote services directly on your local device.
            </Text>

            {/* Name / Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>TUNNEL NAME (OPTIONAL)</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Postgres DB / Grafana"
                placeholderTextColor={COLORS.textMuted}
                style={styles.textInput}
              />
            </View>

            {/* Port Mapping Row */}
            <View style={styles.portMappingRow}>
              <View style={styles.portCol}>
                <Text style={styles.fieldLabel}>LOCAL PORT</Text>
                <TextInput
                  value={localPort}
                  onChangeText={setLocalPort}
                  placeholder="3306"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  style={[styles.textInput, styles.monoInput]}
                />
              </View>

              <View style={styles.arrowCol}>
                <ArrowRight size={20} color="#64748b" />
              </View>

              <View style={styles.portCol}>
                <Text style={styles.fieldLabel}>REMOTE PORT</Text>
                <TextInput
                  value={remotePort}
                  onChangeText={setRemotePort}
                  placeholder="3306"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  style={[styles.textInput, styles.monoInput]}
                />
              </View>
            </View>

            {/* Remote Host */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>REMOTE DESTINATION HOST</Text>
              <TextInput
                value={remoteHost}
                onChangeText={setRemoteHost}
                placeholder="127.0.0.1"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                style={[styles.textInput, styles.monoInput]}
              />
            </View>

            {/* Protocol Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PROTOCOL</Text>
              <View style={styles.protocolRow}>
                {['tcp', 'udp'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setProtocol(p)}
                    style={[
                      styles.protocolBtn,
                      protocol === p && styles.protocolBtnActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.protocolBtnText,
                        protocol === p && styles.protocolBtnTextActive
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSave} style={styles.bindBtn}>
                <ShieldCheck size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.bindBtnText}>Bind Tunnel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#0f121d',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 440,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalBody: {
    padding: 18,
  },
  helperText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0a0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  portMappingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 14,
  },
  portCol: {
    flex: 1,
  },
  arrowCol: {
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolRow: {
    flexDirection: 'row',
    gap: 10,
  },
  protocolBtn: {
    flex: 1,
    backgroundColor: '#0a0d14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: COLORS.primaryLight,
  },
  protocolBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  protocolBtnTextActive: {
    color: '#ffffff',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  bindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  bindBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
