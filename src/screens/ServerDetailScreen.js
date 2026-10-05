// Connected Server Hub Screen for Glyph Mobile
// 100% Real Native SSH, Terminal, Docker, SFTP, Hardware Stats, Tunnels, Secrets (Zero Placeholders)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  ChevronLeft,
  Activity,
  Terminal as TerminalIcon,
  Folder,
  Box,
  Zap,
  Globe,
  Lock,
  RotateCw,
  Trash2,
  Plus,
  Search,
  Copy,
  FolderPlus,
  Play,
  Clock,
  Users,
  Eye,
  EyeOff,
  Info,
  Download,
  TrendingUp
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import OsLogo from '../components/OsLogo';
import CircularProgress from '../components/CircularProgress';
import NetworkCard from '../components/NetworkCard';
import {
  CpuDetailsModal,
  MemDetailsModal,
  DiskDetailsModal,
  NetDetailsModal,
  GpuDetailsModal
} from '../components/DashboardDetailModals';
import AddTunnelModal from '../components/AddTunnelModal';
import AddSnippetModal from '../components/AddSnippetModal';
import TerminalView from '../components/TerminalView';
import ContainerCard from '../components/ContainerCard';
import FileItemRow from '../components/FileItemRow';
import LogsModal from '../components/LogsModal';
import CodeEditorModal from '../components/CodeEditorModal';
import { sshService } from '../services/sshService';
import { DockerService } from '../services/dockerService';
import { SFTPService } from '../services/sftpService';
import { getSnippets, saveSnippet, deleteSnippet, recordSnippetUsage } from '../services/snippetsService';
import { getTunnels, saveTunnel, toggleTunnel, deleteTunnel } from '../services/tunnelService';
import { getServerSecrets, saveServerSecrets } from '../services/vaultStorage';

export default function ServerDetailScreen({ server, onBack }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'terminal' | 'docker' | 'sftp' | 'commands' | 'tunnels' | 'secrets'
  const [metrics, setMetrics] = useState({});
  const [terminalOutput, setTerminalOutput] = useState('');
  
  // Modals for Dashboard Metrics Breakdowns
  const [activeMetricModal, setActiveMetricModal] = useState(null); // 'cpu' | 'mem' | 'disk' | 'net'

  // Modals for Adding Tunnel / Snippet
  const [addTunnelModalVisible, setAddTunnelModalVisible] = useState(false);
  const [addSnippetModalVisible, setAddSnippetModalVisible] = useState(false);

  // Docker State
  const dockerServiceRef = useRef(new DockerService(server));
  const [containers, setContainers] = useState([]);
  const [dockerSearch, setDockerSearch] = useState('');
  const [dockerLoading, setDockerLoading] = useState(false);
  const [dockerError, setDockerError] = useState(null);
  const [selectedContainerLogs, setSelectedContainerLogs] = useState(null);

  // SFTP State
  const sftpServiceRef = useRef(new SFTPService(server));
  const [currentPath, setCurrentPath] = useState('/root');
  const [fileList, setFileList] = useState([]);
  const [sftpLoading, setSftpLoading] = useState(false);
  const [sftpError, setSftpError] = useState(null);
  const [activeEditorFile, setActiveEditorFile] = useState(null);
  const [editorInitialContent, setEditorInitialContent] = useState('');

  // Commands / Snippets State
  const [snippets, setSnippets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Tunnels State
  const [tunnels, setTunnels] = useState([]);

  // Secrets State
  const [secrets, setSecrets] = useState([]);
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretVal, setNewSecretVal] = useState('');

  useEffect(() => {
    // 1. Subscribe to Native Stat Polling
    const removeStatsListener = sshService.onStats((incomingMetrics) => {
      setMetrics(incomingMetrics);
    });

    // 2. Subscribe to Native PTY Shell Output
    const removeShellListener = sshService.onShellOutput((tabId, chunk) => {
      setTerminalOutput(prev => prev + chunk);
    });

    // 3. Open PTY shell session
    sshService.openShell('main').catch(err => {
      console.warn('Open native shell error:', err);
    });

    // 4. Start Hardware Stat Polling (3s interval)
    sshService.startStatPolling(3000);

    // 5. Load services
    loadDocker();
    loadSFTP('/root');
    loadSnippets();
    loadTunnels();
    loadSecrets();

    return () => {
      sshService.stopStatPolling();
      sshService.closeShell('main');
      removeStatsListener();
      removeShellListener();
    };
  }, [server]);

  // Loaders
  const loadDocker = async (q = dockerSearch) => {
    setDockerLoading(true);
    setDockerError(null);
    try {
      const list = await dockerServiceRef.current.getContainers(q);
      setContainers(list);
    } catch (err) {
      setDockerError(err.message || 'Docker is not running or not installed on this host.');
      setContainers([]);
    } finally {
      setDockerLoading(false);
    }
  };

  const loadSFTP = async (path) => {
    setSftpLoading(true);
    setSftpError(null);
    try {
      const files = await sftpServiceRef.current.listFiles(path);
      setCurrentPath(path);
      setFileList(files);
    } catch (err) {
      setSftpError(err.message || 'Failed to list directory contents.');
      setFileList([]);
    } finally {
      setSftpLoading(false);
    }
  };

  const loadSnippets = async () => {
    const s = await getSnippets(server.id);
    setSnippets(s);
  };

  const loadTunnels = async () => {
    const t = await getTunnels(server.id);
    setTunnels(t);
  };

  const loadSecrets = async () => {
    const sec = await getServerSecrets(server.id);
    setSecrets(sec);
  };

  // Terminal actions
  const handleTerminalSubmit = (cmd) => {
    sshService.writeShell('main', cmd + '\n');
  };

  const handleTerminalClear = () => {
    setTerminalOutput('');
  };

  // Docker actions
  const handleStartContainer = async (id) => {
    try {
      await dockerServiceRef.current.startContainer(id);
      loadDocker();
    } catch (e) {
      Alert.alert('Docker Error', e.message);
    }
  };

  const handleStopContainer = async (id) => {
    try {
      await dockerServiceRef.current.stopContainer(id);
      loadDocker();
    } catch (e) {
      Alert.alert('Docker Error', e.message);
    }
  };

  const handleRestartContainer = async (id) => {
    try {
      await dockerServiceRef.current.restartContainer(id);
      loadDocker();
    } catch (e) {
      Alert.alert('Docker Error', e.message);
    }
  };

  const handleRemoveContainer = async (id) => {
    Alert.alert('Remove Container', 'Are you sure you want to remove this container?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await dockerServiceRef.current.removeContainer(id);
            loadDocker();
          } catch (e) {
            Alert.alert('Docker Error', e.message);
          }
        }
      }
    ]);
  };

  const handleViewContainerLogs = async (container) => {
    setSelectedContainerLogs({ container, logs: 'Loading container logs from Docker daemon...' });
    try {
      const logs = await dockerServiceRef.current.getContainerLogs(container.id, 200);
      setSelectedContainerLogs({ container, logs });
    } catch (e) {
      setSelectedContainerLogs({ container, logs: 'Failed to retrieve container logs: ' + (e.message || String(e)) });
    }
  };

  // SFTP actions
  const handleFileClick = async (item) => {
    const itemName = item.name || item.filename;
    const isDir = item.isDirectory || item.type === 'directory';

    if (isDir) {
      const nextPath = currentPath === '/' ? `/${itemName}` : `${currentPath}/${itemName}`;
      loadSFTP(nextPath);
    } else {
      const filePath = currentPath === '/' ? `/${itemName}` : `${currentPath}/${itemName}`;
      try {
        const content = await sftpServiceRef.current.readFile(filePath);
        setActiveEditorFile(filePath);
        setEditorInitialContent(content);
      } catch (e) {
        Alert.alert('SFTP Error', 'Unable to read file: ' + e.message);
      }
    }
  };

  const handleDownloadFile = async (item) => {
    try {
      const itemName = item.name || item.filename;
      const filePath = currentPath === '/' ? `/${itemName}` : `${currentPath}/${itemName}`;
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      const localUri = `${FileSystem.cacheDirectory}${itemName}`;
      try {
        await sftpServiceRef.current.downloadFile(filePath, localUri);
      } catch (_) {
        const content = await sftpServiceRef.current.readFile(filePath);
        await FileSystem.writeAsStringAsync(localUri, content);
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          dialogTitle: `Save or Share ${itemName}`,
        });
      } else {
        Alert.alert('Downloaded', `File saved to: ${localUri}`);
      }
    } catch (e) {
      Alert.alert('Download Error', 'Unable to download file: ' + (e.message || String(e)));
    }
  };

  const handleSaveEditedFile = async (filePath, content) => {
    try {
      await sftpServiceRef.current.saveFile(filePath, content);
      Alert.alert('Saved', 'File saved successfully via SFTP.');
      loadSFTP(currentPath);
    } catch (e) {
      Alert.alert('SFTP Error', 'Unable to save file: ' + e.message);
    }
  };

  const handleNavigateUp = () => {
    if (currentPath === '/' || currentPath === '') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    loadSFTP(parent);
  };

  // Commands / Snippets actions
  const handleRunSnippet = async (snip) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const updated = await recordSnippetUsage(snip.id, server.id);
    setSnippets(updated);
    setActiveTab('terminal');
    setTimeout(() => {
      sshService.writeShell('main', (snip.command || snip.cmd) + '\n');
    }, 150);
  };

  const handleSaveNewSnippet = async (snippetData) => {
    const updated = await saveSnippet(snippetData, server.id);
    setSnippets(updated);
  };

  const handleDeleteSnippet = async (id) => {
    Alert.alert('Delete Snippet', 'Are you sure you want to remove this command snippet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteSnippet(id, server.id);
          setSnippets(updated);
        }
      }
    ]);
  };

  const handleCopySnippet = async (cmd) => {
    await Clipboard.setStringAsync(cmd);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Copied', 'Command copied to clipboard.');
  };

  // Tunnels actions
  const handleSaveNewTunnel = async (tunnelData) => {
    try {
      const updated = await saveTunnel({ ...tunnelData, serverId: server.id });
      setTunnels(updated.filter(t => t.serverId === server.id));
    } catch (e) {
      Alert.alert('Tunnel Error', e.message);
    }
  };

  const handleToggleTunnel = async (id) => {
    try {
      const updated = await toggleTunnel(id);
      setTunnels(updated.filter(t => t.serverId === server.id));
    } catch (e) {
      Alert.alert('Tunnel Error', e.message);
    }
  };

  const handleDeleteTunnel = async (id) => {
    Alert.alert('Delete Tunnel', 'Are you sure you want to remove this port forwarding tunnel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteTunnel(id);
          setTunnels(updated.filter(t => t.serverId === server.id));
        }
      }
    ]);
  };

  // Secrets actions
  const handleAddSecret = async () => {
    if (!newSecretKey.trim() || !newSecretVal.trim()) {
      Alert.alert('Validation', 'Please provide both secret key and value.');
      return;
    }
    const updated = [...secrets, { key: newSecretKey.trim(), value: newSecretVal.trim() }];
    await saveServerSecrets(server.id, updated);
    setSecrets(updated);
    setNewSecretKey('');
    setNewSecretVal('');
  };

  const handleDeleteSecret = async (key) => {
    const updated = secrets.filter(s => s.key !== key);
    await saveServerSecrets(server.id, updated);
    setSecrets(updated);
  };

  const toggleRevealSecret = (key) => {
    setRevealedSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopySecret = async (val) => {
    await Clipboard.setStringAsync(val);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Copied', 'Secret value copied to clipboard.');
  };

  const handleInjectSecret = (val) => {
    setActiveTab('terminal');
    setTimeout(() => {
      sshService.writeShell('main', val);
    }, 150);
  };

  const tabs = [
    { id: 'dashboard', label: 'Stats', icon: Activity },
    { id: 'terminal', label: 'Terminal', icon: TerminalIcon },
    { id: 'docker', label: 'Docker', icon: Box },
    { id: 'sftp', label: 'SFTP', icon: Folder },
    { id: 'commands', label: 'Snippets', icon: Zap },
    { id: 'tunnels', label: 'Tunnels', icon: Globe },
    { id: 'secrets', label: 'Secrets', icon: Lock },
  ];

  return (
    <View style={styles.container}>
      {/* Top Navigation Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20) + 6,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            sshService.disconnect();
            onBack();
          }}
          style={styles.backBtn}
        >
          <ChevronLeft size={22} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <View style={styles.headerTitleRow}>
            <OsLogo server={server} size={24} style={{ marginRight: 8 }} />
            <Text style={styles.serverName} numberOfLines={1}>{server.name || server.host}</Text>
          </View>
          <Text style={styles.serverHost} numberOfLines={1}>
            {server.username}@{server.host}:{server.port || 22}
          </Text>
        </View>
      </View>

      {/* Main View Container */}
      <View style={styles.mainContent}>
        {/* ── DASHBOARD TAB ──────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
            {/* Header info */}
            <View style={styles.dashHeader}>
              <Text style={styles.dashTitle}>Live Metrics</Text>
              <Text style={styles.dashSubtitle}>Real-time system polling from remote host</Text>
            </View>

            {/* High Core notice if >16 threads */}
            {(metrics.coreCount || 0) > 16 && (
              <View style={styles.highCoreBanner}>
                <Info size={18} color="#818cf8" style={{ marginTop: 1, marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.highCoreTitle}>High-capacity host detected</Text>
                  <Text style={styles.highCoreText}>
                    {metrics.coreCount} threads active. Displayed metrics reflect total host allocation.
                  </Text>
                </View>
              </View>
            )}

            {/* Compute Disk Percentage with exact parity to Desktop Glyph Dashboard.jsx */}
            {(() => {
              let displayDisk = metrics.disk !== undefined ? metrics.disk : -1;
              if (metrics.df) {
                const lines = metrics.df.trim().split('\n').filter(Boolean);
                if (lines[1]) {
                  const p = lines[1].trim().split(/\s+/);
                  const pToken = p.find(t => t.endsWith('%')) || p[4] || '0';
                  displayDisk = parseFloat(String(pToken).replace('%', '')) || 0;
                }
              }
              return (
                <View style={styles.metricsGrid}>
                  <View style={styles.metricsRow}>
                    <CircularProgress
                      label="CPU Usage"
                      percentage={metrics.cpu !== undefined ? metrics.cpu : -1}
                      onPress={() => setActiveMetricModal('cpu')}
                    />
                    <CircularProgress
                      label="Memory"
                      percentage={metrics.ram !== undefined ? metrics.ram : -1}
                      onPress={() => setActiveMetricModal('mem')}
                    />
                  </View>

                  <View style={[styles.metricsRow, { marginTop: 10 }]}>
                    <CircularProgress
                      label="Disk Usage"
                      percentage={displayDisk}
                      onPress={() => setActiveMetricModal('disk')}
                    />
                    <CircularProgress
                      label="GPU Usage"
                      percentage={metrics.gpu !== undefined ? metrics.gpu : -1}
                      onPress={() => setActiveMetricModal('gpu')}
                    />
                  </View>

                  <View style={{ marginTop: 10 }}>
                    <NetworkCard
                      rxSpeed={metrics.rxSpeed || 0}
                      txSpeed={metrics.txSpeed || 0}
                      onPress={() => setActiveMetricModal('net')}
                    />
                  </View>
                </View>
              );
            })()}

            {/* System Uptime & Active Users Cards */}
            <View style={styles.statsSummaryRow}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryTitleRow}>
                  <Clock size={14} color="#818cf8" style={{ marginRight: 6 }} />
                  <Text style={styles.summaryTitle}>SYSTEM UPTIME</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {metrics.uptimeStr || (metrics.uptime ? metrics.uptime : '—')}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryTitleRow}>
                  <Users size={14} color="#38bdf8" style={{ marginRight: 6 }} />
                  <Text style={styles.summaryTitle}>ACTIVE USERS</Text>
                </View>
                <Text style={styles.summaryValue}>{metrics.usersCount !== undefined ? metrics.usersCount : '—'}</Text>
              </View>
            </View>

            {/* Host Specifications Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardSectionTitle}>HOST SPECIFICATIONS</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Remote OS</Text>
                <Text style={styles.infoVal}>{(server.os || 'Linux').toUpperCase()}</Text>
              </View>

              {metrics.kernel ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Kernel</Text>
                  <Text style={styles.infoVal} numberOfLines={1}>{metrics.kernel.trim()}</Text>
                </View>
              ) : null}

              {metrics.coreCount ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>Cores / Threads</Text>
                  <Text style={styles.infoVal}>{metrics.coreCount} Cores</Text>
                </View>
              ) : null}

              {server.zerotier ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>ZeroTier Mesh</Text>
                  <Text style={[styles.infoVal, { color: '#fbbf24' }]}>{server.zerotier}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        )}

        {/* ── TERMINAL TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'terminal' && (
          <TerminalView
            output={terminalOutput}
            onCommandSubmit={handleTerminalSubmit}
            onClear={handleTerminalClear}
          />
        )}

        {/* ── DOCKER TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'docker' && (
          <View style={styles.tabContainer}>
            <View style={styles.searchBar}>
              <Search size={15} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                value={dockerSearch}
                onChangeText={(val) => {
                  setDockerSearch(val);
                  loadDocker(val);
                }}
                placeholder="Search containers by name, image, ID..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>

            <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
              <View style={styles.countRow}>
                <Text style={styles.countText}>
                  {containers.length} CONTAINER{containers.length !== 1 ? 'S' : ''} FOUND
                </Text>
                <TouchableOpacity onPress={() => loadDocker(dockerSearch)} style={{ padding: 4 }}>
                  {dockerLoading ? (
                    <ActivityIndicator size="small" color={COLORS.cyanLight} />
                  ) : (
                    <RotateCw size={14} color={COLORS.cyanLight} />
                  )}
                </TouchableOpacity>
              </View>

              {dockerError ? (
                <View style={styles.emptyContainerBox}>
                  <Box size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyContainerTitle}>Docker Unavailable</Text>
                  <Text style={styles.emptyContainerSubtitle}>{dockerError}</Text>
                  <TouchableOpacity onPress={() => loadDocker(dockerSearch)} style={styles.retryBtn}>
                    <Text style={styles.retryBtnText}>Retry Connection</Text>
                  </TouchableOpacity>
                </View>
              ) : containers.length === 0 && !dockerLoading ? (
                <View style={styles.emptyContainerBox}>
                  <Box size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyContainerTitle}>No Containers Running</Text>
                  <Text style={styles.emptyContainerSubtitle}>
                    {dockerSearch ? 'No containers match your search query.' : 'No Docker containers found on this server.'}
                  </Text>
                </View>
              ) : (
                containers.map(c => (
                  <ContainerCard
                    key={c.id}
                    container={c}
                    onStart={handleStartContainer}
                    onStop={handleStopContainer}
                    onRestart={handleRestartContainer}
                    onViewLogs={() => handleViewContainerLogs(c)}
                    onRemove={handleRemoveContainer}
                  />
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* ── SFTP TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'sftp' && (
          <View style={styles.tabContainer}>
            <View style={styles.pathBar}>
              <TouchableOpacity onPress={handleNavigateUp} style={styles.upBtn}>
                <Text style={styles.upBtnText}>..</Text>
              </TouchableOpacity>
              <Text style={styles.currentPathText} numberOfLines={1}>
                {currentPath}
              </Text>
              <TouchableOpacity
                onPress={() => loadSFTP(currentPath)}
                style={styles.folderAddBtn}
              >
                {sftpLoading ? (
                  <ActivityIndicator size="small" color={COLORS.cyanLight} />
                ) : (
                  <RotateCw size={14} color={COLORS.cyanLight} />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
              {sftpError ? (
                <View style={styles.emptyContainerBox}>
                  <Folder size={40} color={COLORS.roseLight} />
                  <Text style={styles.emptyContainerTitle}>SFTP Error</Text>
                  <Text style={styles.emptyContainerSubtitle}>{sftpError}</Text>
                  <TouchableOpacity onPress={() => loadSFTP(currentPath)} style={styles.retryBtn}>
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : fileList.length === 0 && !sftpLoading ? (
                <View style={styles.emptyContainerBox}>
                  <Folder size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyContainerTitle}>Empty Directory</Text>
                  <Text style={styles.emptyContainerSubtitle}>No files or folders found in this location.</Text>
                </View>
              ) : (
                fileList.map((item, idx) => (
                  <FileItemRow
                    key={idx}
                    item={item}
                    onPress={handleFileClick}
                    onOptionsPress={(target) => {
                      const targetName = target.name || target.filename;
                      Alert.alert(targetName, 'File Actions', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Download & Share',
                          onPress: () => handleDownloadFile(target)
                        },
                        {
                          text: 'Edit in Editor',
                          onPress: () => handleFileClick(target)
                        },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await sftpServiceRef.current.deleteItem(currentPath, targetName, target.isDirectory);
                              loadSFTP(currentPath);
                            } catch (e) {
                              Alert.alert('SFTP Error', e.message);
                            }
                          }
                        }
                      ]);
                    }}
                  />
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* ── COMMAND SNIPPETS TAB ─────────────────────────────────────────── */}
        {activeTab === 'commands' && (
          <View style={styles.tabContainer}>
            <View style={styles.tabHeaderBar}>
              <View>
                <Text style={styles.tabHeaderTitle}>Saved Commands</Text>
                <Text style={styles.tabHeaderSubtitle}>Manage and execute frequent shell snippets</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setAddSnippetModalVisible(true)}
                style={styles.headerActionBtn}
              >
                <Plus size={14} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.headerActionBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
              <View style={styles.snippetSortHeader}>
                <TrendingUp size={15} color="#818cf8" style={{ marginRight: 6 }} />
                <Text style={styles.snippetSortHeaderText}>Sorted by Most Used</Text>
              </View>

              {snippets
                .slice()
                .sort((a, b) => (b.uses || 0) - (a.uses || 0))
                .map(snip => (
                  <View key={snip.id} style={styles.snippetCard}>
                    <View style={styles.snippetHeader}>
                      <Text style={styles.snippetTitle}>{snip.name}</Text>
                      {snip.uses !== undefined ? (
                        <Text style={styles.snippetUsesText}>{snip.uses} uses</Text>
                      ) : null}
                    </View>

                    <View style={styles.commandPreview}>
                      <Text style={styles.commandCode} numberOfLines={2}>
                        {snip.command || snip.cmd}
                      </Text>
                    </View>

                    <View style={styles.snippetActionRow}>
                      <TouchableOpacity
                        onPress={() => handleRunSnippet(snip)}
                        style={styles.runSnippetBtn}
                      >
                        <Play size={14} color="#ffffff" />
                        <Text style={styles.runSnippetText}>Run in Terminal</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleCopySnippet(snip.command || snip.cmd)}
                        style={styles.snippetIconBtn}
                      >
                        <Copy size={16} color={COLORS.cyanLight} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDeleteSnippet(snip.id)}
                        style={styles.snippetIconBtn}
                      >
                        <Trash2 size={16} color={COLORS.roseLight} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}

        {/* ── TUNNELS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'tunnels' && (
          <View style={styles.tabContainer}>
            <View style={styles.tabHeaderBar}>
              <Text style={styles.tabHeaderTitle}>Port Forwarding</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setAddTunnelModalVisible(true)}
                style={styles.headerActionBtn}
              >
                <Plus size={14} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.headerActionBtnText}>Add Tunnel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
              <Text style={styles.tunnelSubheader}>ACTIVE SSH PORT FORWARDS</Text>

              {tunnels.length === 0 ? (
                <View style={styles.emptyTunnelBox}>
                  <Globe size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyTunnelTitle}>No Active Tunnels</Text>
                  <Text style={styles.emptyTunnelSubtitle}>
                    Create a secure local SSH tunnel to forward internal ports directly to this mobile device.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAddTunnelModalVisible(true)}
                    style={styles.emptyAddTunnelBtn}
                  >
                    <Plus size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.emptyAddTunnelBtnText}>Create New Tunnel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                tunnels.map(tun => {
                  const isActive = tun.status === 'active';
                  return (
                    <View key={tun.id} style={styles.tunnelCard}>
                      <View style={styles.tunnelInfo}>
                        <View style={styles.tunnelTitleRow}>
                          <View style={[styles.stateDot, { backgroundColor: isActive ? COLORS.emerald : COLORS.offline }]} />
                          <Text style={styles.tunnelName}>{tun.name}</Text>
                          <View style={styles.protoBadge}>
                            <Text style={styles.protoBadgeText}>{(tun.protocol || 'tcp').toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={styles.tunnelRoute}>
                          Local :{tun.localPort} ➜ {tun.remoteHost || '127.0.0.1'}:{tun.remotePort}
                        </Text>
                      </View>

                      <View style={styles.tunnelActions}>
                        <TouchableOpacity
                          onPress={() => handleToggleTunnel(tun.id)}
                          style={[styles.tunnelToggleBtn, isActive ? styles.tunnelActiveBtn : styles.tunnelInactiveBtn]}
                        >
                          <Text style={[styles.tunnelToggleText, isActive && { color: COLORS.emeraldLight }]}>
                            {isActive ? 'Active' : 'Start'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDeleteTunnel(tun.id)}
                          style={styles.tunnelDeleteBtn}
                        >
                          <Trash2 size={16} color={COLORS.roseLight} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {/* ── SECRETS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'secrets' && (
          <ScrollView style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
            {/* Add Secret Form */}
            <View style={styles.addSecretBox}>
              <Text style={styles.cardSectionTitle}>ADD SERVER SECRET</Text>
              <TextInput
                value={newSecretKey}
                onChangeText={setNewSecretKey}
                placeholder="Secret Key (e.g. DB_PASSWORD)"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                style={styles.secretInput}
              />
              <TextInput
                value={newSecretVal}
                onChangeText={setNewSecretVal}
                placeholder="Secret Value"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={true}
                style={[styles.secretInput, { marginTop: 8 }]}
              />
              <TouchableOpacity onPress={handleAddSecret} style={styles.addSecretBtn}>
                <Plus size={15} color="#ffffff" />
                <Text style={styles.addSecretBtnText}>Save Secret</Text>
              </TouchableOpacity>
            </View>

            {/* Secrets List */}
            {secrets.length === 0 ? (
              <Text style={styles.emptyText}>No secrets stored for this server yet.</Text>
            ) : (
              secrets.map((sec, idx) => {
                const isRevealed = !!revealedSecrets[sec.key];
                return (
                  <View key={idx} style={styles.secretCard}>
                    <View style={styles.secretInfo}>
                      <Text style={styles.secretKeyName}>{sec.key}</Text>
                      <Text style={styles.secretValueText}>
                        {isRevealed ? sec.value : '••••••••••••••••'}
                      </Text>
                    </View>

                    <View style={styles.secretActions}>
                      <TouchableOpacity onPress={() => toggleRevealSecret(sec.key)} style={styles.iconBtn}>
                        {isRevealed ? (
                          <EyeOff size={16} color={COLORS.textSecondary} />
                        ) : (
                          <Eye size={16} color={COLORS.textSecondary} />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleCopySecret(sec.value)} style={styles.iconBtn}>
                        <Copy size={16} color={COLORS.cyanLight} />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleInjectSecret(sec.value)} style={styles.iconBtn} title="Inject to Terminal">
                        <TerminalIcon size={16} color={COLORS.emeraldLight} />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleDeleteSecret(sec.key)} style={styles.iconBtn}>
                        <Trash2 size={16} color={COLORS.roseLight} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* Bottom Tabs Navigation */}
      <View
        style={[
          styles.bottomNav,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.navTab}
            >
              <Icon
                size={20}
                color={isSelected ? COLORS.primaryLight : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.navLabel,
                  isSelected && styles.navLabelActive
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dashboard Breakdown Modals */}
      <CpuDetailsModal
        visible={activeMetricModal === 'cpu'}
        metrics={metrics}
        onClose={() => setActiveMetricModal(null)}
      />
      <MemDetailsModal
        visible={activeMetricModal === 'mem'}
        metrics={metrics}
        onClose={() => setActiveMetricModal(null)}
      />
      <DiskDetailsModal
        visible={activeMetricModal === 'disk'}
        metrics={metrics}
        onClose={() => setActiveMetricModal(null)}
      />
      <NetDetailsModal
        visible={activeMetricModal === 'net'}
        metrics={metrics}
        onClose={() => setActiveMetricModal(null)}
      />
      <GpuDetailsModal
        visible={activeMetricModal === 'gpu'}
        metrics={metrics}
        onClose={() => setActiveMetricModal(null)}
      />

      {/* Add Modals */}
      <AddTunnelModal
        visible={addTunnelModalVisible}
        onClose={() => setAddTunnelModalVisible(false)}
        onSave={handleSaveNewTunnel}
      />
      <AddSnippetModal
        visible={addSnippetModalVisible}
        onClose={() => setAddSnippetModalVisible(false)}
        onSave={handleSaveNewSnippet}
      />

      {/* Logs Modal */}
      {selectedContainerLogs && (
        <LogsModal
          visible={!!selectedContainerLogs}
          container={selectedContainerLogs.container}
          logs={selectedContainerLogs.logs}
          onClose={() => setSelectedContainerLogs(null)}
        />
      )}

      {/* Remote Code Editor Modal */}
      {activeEditorFile && (
        <CodeEditorModal
          visible={!!activeEditorFile}
          filePath={activeEditorFile}
          initialContent={editorInitialContent}
          onSave={handleSaveEditedFile}
          onClose={() => setActiveEditorFile(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 18, 29, 0.95)',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  serverHost: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  statusDotLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  statusLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: 0.6,
  },
  mainContent: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 24,
  },
  dashHeader: {
    marginBottom: 16,
  },
  dashTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  dashSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  highCoreBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  highCoreTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
  },
  highCoreText: {
    fontSize: 11,
    color: '#c7d2fe',
    marginTop: 2,
  },
  metricsGrid: {
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#0f121d',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoCard: {
    backgroundColor: '#0f121d',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  infoKey: {
    fontSize: 12,
    color: '#94a3b8',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161926',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  emptyContainerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#0f121d',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyContainerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 12,
  },
  emptyContainerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
  },
  pathBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161926',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  upBtn: {
    paddingRight: 10,
    paddingVertical: 4,
  },
  upBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#818cf8',
  },
  currentPathText: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  folderAddBtn: {
    padding: 6,
  },
  tabHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  tabHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  tabHeaderSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  snippetSortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  snippetSortHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818cf8',
  },
  snippetUsesText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  snippetCard: {
    backgroundColor: '#0f121d',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  snippetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  snippetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  categoryBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#818cf8',
  },
  snippetDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  commandPreview: {
    backgroundColor: '#161926',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  commandCode: {
    fontSize: 12,
    color: '#38bdf8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  snippetActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  runSnippetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  runSnippetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  snippetIconBtn: {
    padding: 8,
    backgroundColor: '#161926',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tunnelSubheader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  emptyTunnelBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#0f121d',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTunnelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 12,
  },
  emptyTunnelSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
  },
  emptyAddTunnelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyAddTunnelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  tunnelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f121d',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tunnelInfo: {
    flex: 1,
    marginRight: 10,
  },
  tunnelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tunnelName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  protoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  protoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
  },
  tunnelRoute: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tunnelActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tunnelToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tunnelActiveBtn: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: '#4ade80',
  },
  tunnelInactiveBtn: {
    backgroundColor: '#161926',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tunnelToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tunnelDeleteBtn: {
    padding: 6,
  },
  addSecretBox: {
    backgroundColor: '#0f121d',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secretInput: {
    backgroundColor: '#161926',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addSecretBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  addSecretBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  secretCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f121d',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secretInfo: {
    flex: 1,
    marginRight: 10,
  },
  secretKeyName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  secretValueText: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  secretActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0f121d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#818cf8',
  },
});
