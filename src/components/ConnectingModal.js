// Real Native SSH Connecting Modal for Glyph Mobile
// 100% Desktop Parity over Native SSH (Zero Placeholders)
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import OsLogo from './OsLogo';
import { updateServer } from '../services/vaultStorage';
import { sshService } from '../services/sshService';

// Live ms Timer matching Desktop LiveTimer
function LiveTimer({ active }) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setMs(Date.now() - start);
    }, 47);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <View style={styles.timerBadge}>
      <Text style={styles.timerText}>{ms}ms</Text>
    </View>
  );
}

export default function ConnectingModal({ visible, server, onConnected, onCancel }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (visible && server) {
      runConnectionSequence();
    } else {
      setLogs([]);
      setError(null);
      setIsConnecting(false);
    }
  }, [visible, server]);

  const runConnectionSequence = async () => {
    setIsConnecting(true);
    setError(null);
    setLogs(['Initiating native SSH connection...']);

    try {
      setLogs(prev => [...prev, `Connecting to ${server.host}:${server.port || 22} as user ${server.username || 'root'}...`]);

      if (server.zerotier) {
        setLogs(prev => [...prev, `Routing over ZeroTier network ${server.zerotier}...`]);
      }

      const authMethod = (server.privateKey || server.privateKeyPath) ? 'SSH Key' : 'Password';
      setLogs(prev => [...prev, `Authenticating via ${authMethod}...`]);

      const result = await sshService.connect(server);

      setLogs(prev => [...prev, 'Authentication successful! Interactive SSH session established.']);
      
      const detectedOs = result.os || server.os || 'linux';
      setLogs(prev => [...prev, `Probed Remote OS: ${detectedOs.toUpperCase()}`]);

      // Save detected OS to vault
      await updateServer(server.id, { os: detectedOs, status: 'online' });
      const updatedServer = { ...server, os: detectedOs, status: 'online' };

      setIsConnecting(false);
      onConnected(updatedServer);
    } catch (err) {
      setIsConnecting(false);
      const errMsg = err.message || String(err);
      setError(errMsg);
      setLogs(prev => [...prev, `Connection failed: ${errMsg}`]);
    }
  };

  if (!visible || !server) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header matching Desktop */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <OsLogo server={server} size={36} />
              </View>
              <View style={styles.titleColumn}>
                <View style={styles.titleRow}>
                  <Text style={styles.serverName} numberOfLines={1}>{server.name || server.host}</Text>
                  <LiveTimer active={isConnecting} />
                </View>
                <Text style={styles.serverHost} numberOfLines={1}>
                  {server.username}@{server.host}:{server.port || 22}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Terminal Logs Window */}
          <ScrollView
            ref={scrollRef}
            style={styles.terminalWindow}
            contentContainerStyle={styles.terminalContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {logs.map((log, index) => (
              <View key={index} style={styles.logLine}>
                <Text style={styles.chevron}>❯ </Text>
                <Text style={styles.logText}>{log}</Text>
              </View>
            ))}

            {isConnecting && !error && (
              <View style={styles.logLine}>
                <Text style={styles.chevron}>❯ </Text>
                <View style={styles.blinkingCursor} />
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>✖ </Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer (Retry / Close if error) */}
          {error && (
            <View style={styles.footer}>
              <TouchableOpacity onPress={onCancel} style={styles.closeActionBtn}>
                <Text style={styles.closeActionText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={runConnectionSequence} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#0f111a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 440,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  titleColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 6,
    flexShrink: 1,
  },
  serverHost: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  timerBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  timerText: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  terminalWindow: {
    height: 220,
    backgroundColor: '#090b10',
    padding: 14,
  },
  terminalContent: {
    paddingBottom: 10,
  },
  logLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  chevron: {
    color: '#475569',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logText: {
    color: '#a5b4fc',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  blinkingCursor: {
    width: 7,
    height: 14,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '800',
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  closeActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeActionText: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  retryBtnText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '700',
  },
});
