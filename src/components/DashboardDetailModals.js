// Dashboard Detail Modals for CPU, Memory, Disk, GPU, Network matching Desktop Dashboard.jsx
// 100% Real Live Metrics Parsing (Zero Placeholders / Mock Data)
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import {
  X,
  Cpu,
  Layers,
  HardDrive,
  Wifi,
  CircuitBoard,
  Info,
  Terminal
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';

// Helper: Format bytes
export const fmtBytes = (bytes) => {
  const n = parseFloat(bytes) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' GB';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB';
  return n.toFixed(0) + ' B';
};

export const fmtSpeed = (bps) => {
  const n = parseFloat(bps) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB/s';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB/s';
  return n.toFixed(0) + ' B/s';
};

export const parseNet = (raw) => {
  if (!raw) return [];
  return raw.trim().split('\n').map(line => {
    const m = line.match(/^(\S+)\s+RX:(\d+)\s+TX:(\d+)\s+RXS:(\d+)\s+TXS:(\d+)/);
    if (!m) return null;
    return { iface: m[1], rx: m[2], tx: m[3], rxs: m[4], txs: m[5] };
  }).filter(Boolean);
};

// Modal Shell with Backdrop Tap & Non-Collapsing Layout
function ModalShell({ visible, title, icon: Icon, iconColor, onClose, children }) {
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  {Icon && <Icon size={20} color={iconColor || COLORS.primaryLight} style={{ marginRight: 8 }} />}
                  <Text style={styles.modalTitle}>{title}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Progress Bar helper
const Bar = ({ label, value, max, unit = '', inverted = false }) => {
  const numVal = parseFloat(value) || 0;
  const numMax = parseFloat(max) || 1;
  const pct = numMax > 0 ? Math.min(100, Math.max(0, (numVal / numMax) * 100)) : 0;
  const score = inverted ? (100 - pct) : pct;
  const col = score > 85 ? '#ef4444' : score > 70 ? '#f59e0b' : '#6366f1';

  return (
    <View style={styles.barItem}>
      <View style={styles.barLabels}>
        <Text style={styles.barLabelText}>{label}</Text>
        <Text style={styles.barValueText}>
          {numVal.toFixed(0)}{unit} / {numMax.toFixed(0)}{unit} ({pct.toFixed(0)}%)
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barThumb, { width: `${pct}%`, backgroundColor: col }]} />
      </View>
    </View>
  );
};

// ── CPU Modal ────────────────────────────────────────────────────────────────
export function CpuDetailsModal({ visible, metrics = {}, onClose }) {
  const raw = metrics.top || '';
  const cores = metrics.cores || '';
  const temp = metrics.temp || '';

  const lines = raw.split('\n');
  const loadMatch = lines[0] && lines[0].match(/load average:\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
  const tasks = lines.find(l => /Tasks/i.test(l)) || '';

  // Parse per-core data: "cpu0 12.5"
  const coreRows = cores.trim().split('\n').map(line => {
    const m = line.trim().match(/^(cpu\d+)\s+([\d.]+)/);
    return m ? { id: m[1], pct: parseFloat(m[2]) } : null;
  }).filter(Boolean);

  // Parse temperature lines
  const tempRows = temp.trim().split('\n').filter(Boolean);

  return (
    <ModalShell visible={visible} title="CPU Details" icon={Cpu} iconColor="#818cf8" onClose={onClose}>
      {loadMatch && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionHeader}>LOAD AVERAGE</Text>
          <View style={styles.loadGrid}>
            {['1 min', '5 min', '15 min'].map((label, idx) => (
              <View key={label} style={styles.loadBox}>
                <Text style={styles.loadValue}>{loadMatch[idx + 1] || '0.00'}</Text>
                <Text style={styles.loadLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {tasks ? (
        <View style={styles.tasksBox}>
          <Text style={styles.tasksText}>{tasks.trim()}</Text>
        </View>
      ) : null}

      {coreRows.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionHeader}>
            PER-THREAD USAGE ({coreRows.length} THREADS)
          </Text>
          <View style={styles.coresGrid}>
            {coreRows.map((c) => {
              const col = c.pct > 85 ? '#ef4444' : c.pct > 70 ? '#f59e0b' : '#6366f1';
              return (
                <View key={c.id} style={styles.coreCard}>
                  <View style={styles.coreCardHeader}>
                    <Text style={styles.coreIdText}>{c.id}</Text>
                    <Text style={[styles.corePctText, { color: col }]}>{c.pct.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.coreBarTrack}>
                    <View style={[styles.coreBarThumb, { width: `${c.pct}%`, backgroundColor: col }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <Text style={styles.sectionHeader}>TEMPERATURE</Text>
      {tempRows.length > 0 ? (
        <View style={styles.tempGrid}>
          {tempRows.map((line, i) => {
            const tempMatch = line.match(/([+\-]?\d+(?:\.\d+)?)\s*°?\s*C(?:\s|$)/i);
            const tempVal = tempMatch ? parseFloat(tempMatch[1]) : 0;
            const hot = tempVal > 80;
            const warm = tempVal > 65;
            const label = line.replace(/[+\-]?\d+(?:\.\d+)?\s*°?\s*C.*/i, '').replace(/[:\s]+$/, '').trim() || `Zone ${i}`;
            return (
              <View key={i} style={[styles.tempBox, hot && styles.tempBoxHot, warm && styles.tempBoxWarm]}>
                <Text style={styles.tempLabel} numberOfLines={1}>{label}</Text>
                <Text style={[styles.tempValue, { color: hot ? '#ef4444' : warm ? '#f59e0b' : '#4ade80' }]}>
                  {tempVal > 0 ? `${tempVal.toFixed(0)}°C` : line}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.noDataBox}>
          <Text style={styles.noDataText}>No thermal sensors detected. If this is a physical server, you may need to install the sensors package:</Text>
          <View style={styles.cmdCard}>
            <Text style={styles.cmdText}>sudo apt install lm-sensors</Text>
          </View>
          <Text style={styles.noteText}>Note: Virtual Machines (VPS) rarely expose hardware sensors to guest OS.</Text>
        </View>
      )}

      {!raw && !cores && (
        <Text style={styles.waitingText}>Waiting for real-time CPU data...</Text>
      )}
    </ModalShell>
  );
}

// ── Memory Modal ─────────────────────────────────────────────────────────────
export function MemDetailsModal({ visible, metrics = {}, onClose }) {
  const raw = metrics.free || '';
  const lines = raw.split('\n').filter(Boolean);
  let memTotal = 0, memUsed = 0, memFree = 0, memBuff = 0;
  let swapTotal = 0, swapUsed = 0, swapFree = 0;

  if (lines.length > 0) {
    const headerLine = lines.find(l => l.toLowerCase().includes('total'));
    const memLine = lines.find(l => /^Mem/i.test(l));
    const swapLine = lines.find(l => /^Swap/i.test(l));

    if (headerLine && memLine) {
      const headers = headerLine.trim().split(/\s+/).map(h => h.toLowerCase());
      const vals = memLine.trim().split(/\s+/).slice(1);
      const map = {};
      headers.forEach((h, i) => map[h] = +vals[i]);

      memTotal = map.total || 0;
      memUsed = map.used || 0;
      memFree = map.free || 0;
      memBuff = (map['buff/cache'] || 0) + (map.buffers || 0) + (map.cached || 0);
    } else if (memLine) {
      const p = memLine.trim().split(/\s+/);
      memTotal = +p[1] || 0;
      memUsed = +p[2] || 0;
      memFree = +p[3] || 0;
      memBuff = +p[5] || 0;
    }

    if (swapLine) {
      const p = swapLine.trim().split(/\s+/);
      swapTotal = +p[1] || 0;
      swapUsed = +p[2] || 0;
      swapFree = +p[3] || 0;
    }
  }

  const humanMB = v => (v >= 1024 ? (v / 1024).toFixed(1) + ' GB' : v + ' MB');

  return (
    <ModalShell visible={visible} title="Memory & Swap Details" icon={Layers} iconColor="#c084fc" onClose={onClose}>
      {memTotal > 0 ? (
        <>
          <View style={styles.memStatsGrid}>
            {[
              { l: 'Total RAM', v: humanMB(memTotal) },
              { l: 'Used', v: humanMB(memUsed) },
              { l: 'Buff/Cache', v: humanMB(memBuff) },
              { l: 'Free', v: humanMB(memFree) }
            ].map(item => (
              <View key={item.l} style={styles.memStatBox}>
                <Text style={styles.memStatVal}>{item.v}</Text>
                <Text style={styles.memStatLbl}>{item.l}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHeader, { marginTop: 18 }]}>RAM BREAKDOWN</Text>
          <Bar label="Used" value={memUsed} max={memTotal} unit=" MB" />
          <Bar label="Buff/Cache" value={memBuff} max={memTotal} unit=" MB" />
          <Bar label="Free" value={memFree} max={memTotal} unit=" MB" inverted={true} />

          {swapTotal > 0 && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 18 }]}>SWAP USAGE</Text>
              <Bar label="Swap Used" value={swapUsed} max={swapTotal} unit=" MB" />
              <Bar label="Swap Free" value={swapFree} max={swapTotal} unit=" MB" inverted={true} />
            </>
          )}
        </>
      ) : (
        <Text style={styles.waitingText}>Waiting for real-time memory data...</Text>
      )}
    </ModalShell>
  );
}

// ── Disk Modal ───────────────────────────────────────────────────────────────
export function DiskDetailsModal({ visible, metrics = {}, onClose }) {
  const raw = metrics.df || '';
  const rows = raw.split('\n').filter(Boolean).slice(1).map(l => l.trim().split(/\s+/));

  return (
    <ModalShell visible={visible} title="Storage & Partitions" icon={HardDrive} iconColor="#fb923c" onClose={onClose}>
      {rows.length > 0 ? (
        rows.map((r, i) => {
          const pctMatch = (r[4] || '').replace('%', '');
          const pct = parseFloat(pctMatch) || 0;
          const mount = r[5] || r[r.length - 1] || '/';
          const fs = r[0] || 'filesystem';
          const total = r[1] || '—';
          const used = r[2] || '—';
          const free = r[3] || '—';
          const col = pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#6366f1';

          return (
            <View key={i} style={styles.diskPartitionCard}>
              <View style={styles.diskPartHeader}>
                <Text style={styles.mountPointText}>{mount}</Text>
                <Text style={styles.fsText} numberOfLines={1}>{fs}</Text>
              </View>
              <View style={styles.diskTrack}>
                <View style={[styles.diskThumb, { width: `${pct}%`, backgroundColor: col }]} />
              </View>
              <View style={styles.diskFooter}>
                <Text style={styles.diskFooterText}>Used: <Text style={styles.diskHighlight}>{used}</Text></Text>
                <Text style={styles.diskFooterText}>Free: <Text style={styles.diskHighlight}>{free}</Text></Text>
                <Text style={styles.diskFooterText}>Total: <Text style={styles.diskHighlight}>{total}</Text></Text>
                <Text style={[styles.diskHighlight, { color: col, fontWeight: '800' }]}>{pct}%</Text>
              </View>
            </View>
          );
        })
      ) : (
        <Text style={styles.waitingText}>Waiting for storage partition data...</Text>
      )}
    </ModalShell>
  );
}

// ── Network Modal ────────────────────────────────────────────────────────────
export function NetDetailsModal({ visible, metrics = {}, onClose }) {
  const raw = metrics.net || '';
  const rows = parseNet(raw);

  return (
    <ModalShell visible={visible} title="Network Interfaces" icon={Wifi} iconColor="#22d3ee" onClose={onClose}>
      {rows.length > 0 ? (
        <View>
          <View style={styles.netHeaderRow}>
            <Text style={[styles.netColHeader, { flex: 1.2 }]}>Interface</Text>
            <Text style={[styles.netColHeader, { flex: 1, color: '#4ade80', textAlign: 'center' }]}>↓ Speed</Text>
            <Text style={[styles.netColHeader, { flex: 1, color: '#60a5fa', textAlign: 'center' }]}>↑ Speed</Text>
            <Text style={[styles.netColHeader, { flex: 1, textAlign: 'right' }]}>Total RX</Text>
          </View>

          {rows.map((item) => (
            <View key={item.iface} style={styles.netRow}>
              <View style={[styles.netCol, { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <View style={styles.netDot} />
                <Text style={styles.ifaceName}>{item.iface}</Text>
              </View>
              <Text style={[styles.netCol, { flex: 1, color: '#4ade80', fontWeight: '700', textAlign: 'center' }]}>
                {fmtSpeed(item.rxs)}
              </Text>
              <Text style={[styles.netCol, { flex: 1, color: '#60a5fa', fontWeight: '700', textAlign: 'center' }]}>
                {fmtSpeed(item.txs)}
              </Text>
              <Text style={[styles.netCol, { flex: 1, color: '#94a3b8', textAlign: 'right' }]}>
                {fmtBytes(item.rx)}
              </Text>
            </View>
          ))}
          <Text style={styles.netFooterNote}>Live speeds update automatically every 3 seconds.</Text>
        </View>
      ) : (
        <Text style={styles.waitingText}>Waiting for live network interface statistics...</Text>
      )}
    </ModalShell>
  );
}

// ── GPU Modal (Exact Desktop Glyph Parity) ────────────────────────────────────
export function GpuDetailsModal({ visible, metrics = {}, onClose }) {
  const raw = (metrics.gpuRaw || '').trim();
  const isNoGpu = raw === 'NO_GPU' || metrics.gpu === -1 || (!raw && metrics.gpu === undefined);

  if (isNoGpu) {
    return (
      <ModalShell visible={visible} title="GPU Details" icon={CircuitBoard} iconColor="#10b981" onClose={onClose}>
        <View style={styles.noGpuCard}>
          <Text style={styles.noGpuTitle}>No GPU Stats Available</Text>
          <Text style={styles.noGpuText}>
            We could not detect any GPU monitoring tools on this server. If you have a GPU installed, you may need to install the appropriate drivers and tools:
          </Text>

          <View style={styles.driverSection}>
            <Text style={[styles.driverTitle, { color: '#4ade80' }]}>NVIDIA GPUs</Text>
            <View style={styles.cmdCard}>
              <Text style={styles.cmdText}>sudo apt install nvidia-utils-535</Text>
            </View>
            <Text style={styles.driverSubtext}>Glyph uses nvidia-smi to fetch real-time metrics.</Text>
          </View>

          <View style={styles.driverSection}>
            <Text style={[styles.driverTitle, { color: '#f87171' }]}>AMD GPUs</Text>
            <View style={styles.cmdCard}>
              <Text style={styles.cmdText}>sudo apt install rocm-smi</Text>
            </View>
            <Text style={styles.driverSubtext}>Glyph will also try to read /sys/class/drm directly if ROCm is unavailable.</Text>
          </View>

          <View style={styles.driverSection}>
            <Text style={[styles.driverTitle, { color: '#60a5fa' }]}>Intel GPUs</Text>
            <View style={styles.cmdCard}>
              <Text style={styles.cmdText}>sudo apt install intel-gpu-tools</Text>
            </View>
            <Text style={styles.driverSubtext}>Provides the intel_gpu_top monitoring command.</Text>
          </View>
        </View>
      </ModalShell>
    );
  }

  // Format: index, name, util %, temp, memTotal, memUsed
  const rows = raw.split('\n').filter(Boolean).map(l => l.split(', '));

  return (
    <ModalShell visible={visible} title="GPU Details" icon={CircuitBoard} iconColor="#10b981" onClose={onClose}>
      {rows.length > 0 ? (
        rows.map(r => {
          if (r.length < 6) return null;
          const [id, name, util, temp, memTotalStr, memUsedStr] = r;
          const pct = parseFloat(util) || 0;
          const memTotal = parseFloat(memTotalStr) || 0;
          const memUsed = parseFloat(memUsedStr) || 0;
          const tempVal = parseFloat(temp) || 0;
          return (
            <View key={id} style={styles.gpuCard}>
              <View style={styles.gpuHeader}>
                <Text style={styles.gpuName}>{name}</Text>
                <Text style={styles.gpuIndex}>GPU {id}</Text>
              </View>

              <View style={styles.gpuMetricsGrid}>
                <View style={styles.gpuMetricBox}>
                  <Text style={styles.gpuMetricLabel}>Temperature</Text>
                  <Text style={[styles.gpuMetricVal, { color: tempVal > 80 ? '#ef4444' : tempVal > 65 ? '#f59e0b' : '#4ade80' }]}>
                    {tempVal > 0 ? `${tempVal}°C` : '—'}
                  </Text>
                </View>
                <View style={styles.gpuMetricBox}>
                  <Text style={styles.gpuMetricLabel}>Core Usage</Text>
                  <Text style={[styles.gpuMetricVal, { color: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#818cf8' }]}>
                    {pct}%
                  </Text>
                </View>
              </View>

              <Bar label="VRAM Usage" value={memUsed} max={memTotal} unit=" MB" />
            </View>
          );
        })
      ) : (
        <Text style={styles.waitingText}>No GPU stats detected on host.</Text>
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    maxWidth: 460,
    height: '75%',
    maxHeight: '85%',
    minHeight: 420,
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 18,
    paddingBottom: 28,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  loadGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  loadBox: {
    flex: 1,
    backgroundColor: '#161926',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  loadValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#818cf8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  loadLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  tasksBox: {
    backgroundColor: '#161926',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tasksText: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  coresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coreCard: {
    width: '48%',
    backgroundColor: '#161926',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  coreCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  coreIdText: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  corePctText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  coreBarTrack: {
    height: 4,
    backgroundColor: '#27272a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  coreBarThumb: {
    height: 4,
    borderRadius: 2,
  },
  tempGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tempBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#161926',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tempBoxHot: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  tempBoxWarm: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  tempLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  noDataBox: {
    backgroundColor: '#161926',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  noDataText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 10,
  },
  cmdCard: {
    backgroundColor: '#0a0d14',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 6,
  },
  cmdText: {
    color: '#818cf8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  waitingText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 24,
  },
  barItem: {
    marginBottom: 12,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabelText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  barValueText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barThumb: {
    height: 6,
    borderRadius: 3,
  },
  memStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  memStatBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#161926',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  memStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  memStatLbl: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  diskPartitionCard: {
    backgroundColor: '#161926',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  diskPartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mountPointText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  fsText: {
    fontSize: 11,
    color: '#64748b',
  },
  diskTrack: {
    height: 6,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  diskThumb: {
    height: 6,
    borderRadius: 3,
  },
  diskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diskFooterText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  diskHighlight: {
    color: '#ffffff',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  netHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  netColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  netCol: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  netDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  ifaceName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  netFooterNote: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 14,
  },
  noGpuCard: {
    backgroundColor: '#161926',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  noGpuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  noGpuText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 14,
  },
  driverSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  driverTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  driverSubtext: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  gpuCard: {
    backgroundColor: '#161926',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gpuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gpuName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  gpuIndex: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  gpuMetricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  gpuMetricBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  gpuMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gpuMetricVal: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
