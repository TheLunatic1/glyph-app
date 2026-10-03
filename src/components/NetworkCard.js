// Network Card Component matching Desktop Dashboard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';

const fmtSpeed = (bps) => {
  const n = parseFloat(bps) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB/s';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB/s';
  return n.toFixed(0) + ' B/s';
};

export default function NetworkCard({ rxSpeed = 0, txSpeed = 0, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.speedRow}>
          <ArrowDown size={14} color="#4ade80" />
          <Text style={styles.rxSpeedText}>{fmtSpeed(rxSpeed)}</Text>
        </View>
        <View style={[styles.speedRow, { marginTop: 8 }]}>
          <ArrowUp size={14} color="#60a5fa" />
          <Text style={styles.txSpeedText}>{fmtSpeed(txSpeed)}</Text>
        </View>
      </View>
      <Text style={styles.label}>Network</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0f121d',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rxSpeedText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4ade80',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  txSpeedText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#60a5fa',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  label: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
