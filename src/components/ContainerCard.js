// Docker Container Card Component for Glyph Mobile
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Square, RotateCw, FileText, Trash2, Cpu, HardDrive, Network, Radio } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function ContainerCard({
  container,
  onStart,
  onStop,
  onRestart,
  onViewLogs,
  onRemove
}) {
  const isRunning = container.state === 'running';
  const isPaused = container.state === 'paused';
  const isExited = container.state === 'exited';

  const getStateColor = () => {
    if (isRunning) return COLORS.emerald;
    if (isPaused) return COLORS.amber;
    return COLORS.rose;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <View style={styles.nameRow}>
            <View style={[styles.stateDot, { backgroundColor: getStateColor() }]} />
            <Text style={styles.containerName} numberOfLines={1}>
              {container.name}
            </Text>
          </View>
          <Text style={styles.imageName} numberOfLines={1}>
            {container.image}
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: `${getStateColor()}20`, borderColor: getStateColor() }]}>
          <Text style={[styles.statusText, { color: getStateColor() }]}>
            {container.state.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Ports info */}
      {container.ports && container.ports.length > 0 && (
        <View style={styles.portsRow}>
          <Network size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
          <Text style={styles.portsText}>
            {container.ports.map(p => `${p.public}:${p.private}/${p.type}`).join(', ')}
          </Text>
        </View>
      )}

      {/* Metrics Row */}
      {isRunning && (container.cpuPercent || container.memUsage) && (
        <View style={styles.metricsRow}>
          {container.cpuPercent ? (
            <View style={styles.metricItem}>
              <Cpu size={12} color={COLORS.cyanLight} />
              <Text style={styles.metricText}>CPU: {container.cpuPercent}</Text>
            </View>
          ) : null}
          {container.memUsage ? (
            <View style={styles.metricItem}>
              <HardDrive size={12} color={COLORS.purpleLight} />
              <Text style={styles.metricText}>RAM: {container.memUsage}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onViewLogs(container)}
          style={[styles.actionBtn, styles.logsBtn]}
        >
          <FileText size={14} color={COLORS.cyanLight} />
          <Text style={[styles.actionBtnText, { color: COLORS.cyanLight }]}>Logs</Text>
        </TouchableOpacity>

        {isRunning ? (
          <TouchableOpacity
            onPress={() => onStop(container.id)}
            style={[styles.actionBtn, styles.stopBtn]}
          >
            <Square size={13} color={COLORS.roseLight} />
            <Text style={[styles.actionBtnText, { color: COLORS.roseLight }]}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onStart(container.id)}
            style={[styles.actionBtn, styles.startBtn]}
          >
            <Play size={13} color={COLORS.emeraldLight} />
            <Text style={[styles.actionBtnText, { color: COLORS.emeraldLight }]}>Start</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onRestart(container.id)}
          style={[styles.actionBtn, styles.restartBtn]}
        >
          <RotateCw size={13} color={COLORS.amberLight} />
          <Text style={[styles.actionBtnText, { color: COLORS.amberLight }]}>Restart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onRemove(container.id)}
          style={[styles.actionBtn, styles.removeBtn]}
        >
          <Trash2 size={13} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  containerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  imageName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    marginTop: 2,
    marginLeft: 16,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  portsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  portsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  logsBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  startBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  stopBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  restartBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  removeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: COLORS.border,
    paddingHorizontal: 8,
  }
});
