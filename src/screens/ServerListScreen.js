// Main Server List Screen for Glyph Mobile - Direct Port of Desktop App.jsx Dashboard
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Image,
  Linking,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Search,
  Settings,
  Server,
  Trash2,
  Download,
  Upload,
  Terminal,
  X,
  Zap
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import { APP_VERSION_TAG } from '../constants/appInfo';
import ServerCard from '../components/ServerCard';

export default function ServerListScreen({
  servers = [],
  onSelectServer,
  onAddServer,
  onEditServer,
  onDeleteServer,
  onOpenSettings,
  onOpenImport,
  onOpenExport,
  updateInfo,
  onOpenUpdateModal
}) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [serverToDelete, setServerToDelete] = useState(null);

  // Filter servers by search query (name, host, username, os)
  const filteredServers = servers.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.host || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q) ||
      (s.os || '').toLowerCase().includes(q)
    );
  });

  const confirmDelete = () => {
    if (serverToDelete) {
      onDeleteServer(serverToDelete.id);
      setServerToDelete(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20) + 6,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {/* Top Header matching Desktop App.jsx */}
      <View style={styles.header}>
        <View style={styles.brandingRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
          />
          <View style={styles.titleColumn}>
            <View style={styles.titleRow}>
              <Text style={styles.appTitle}>Glyph</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>{APP_VERSION_TAG}</Text>
              </View>
              {updateInfo?.updateAvailable && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onOpenUpdateModal}
                  style={styles.updatePillBadge}
                >
                  <Zap size={11} color="#ffffff" style={{ marginRight: 3 }} />
                  <Text style={styles.updatePillText}>{updateInfo.latestVersion}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.appSubtitle}>Secure SSH & Server Management</Text>
          </View>
        </View>

        {/* Action Buttons matching Desktop: Import, Export, Settings, Add Server */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={onOpenImport}
            style={styles.iconBtn}
            title="Import Servers"
          >
            <Download size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenExport}
            style={styles.iconBtn}
            title="Export Servers"
          >
            <Upload size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenSettings}
            style={styles.iconBtn}
            title="Settings"
          >
            <Settings size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onAddServer}
            style={[styles.addBtn, SHADOWS.glowPrimary]}
          >
            <Plus size={16} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.addBtnText}>Add Server</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search saved servers..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved Servers</Text>
        <Text style={styles.serverCountText}>
          {filteredServers.length} {filteredServers.length === 1 ? 'server' : 'servers'}
        </Text>
      </View>

      {/* Servers List */}
      <ScrollView
        style={styles.serverScroll}
        contentContainerStyle={styles.serverScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredServers.length === 0 ? (
          <View style={styles.emptyState}>
            <Server size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No servers saved</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'No servers match your search query.' : 'Add a server to get started'}
            </Text>
            <TouchableOpacity onPress={onAddServer} style={styles.emptyAddBtn}>
              <Plus size={16} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.emptyAddBtnText}>Add Server</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredServers.map(s => (
            <ServerCard
              key={s.id}
              server={s}
              onConnect={onSelectServer}
              onEdit={onEditServer}
              onDelete={target => setServerToDelete(target)}
            />
          ))
        )}
      </ScrollView>

      {/* Delete Confirmation Modal matching Desktop App.jsx */}
      {serverToDelete && (
        <Modal
          visible={!!serverToDelete}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setServerToDelete(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteDialog}>
              <View style={styles.deleteHeader}>
                <View style={styles.deleteTitleRow}>
                  <Trash2 size={20} color="#f87171" style={{ marginRight: 8 }} />
                  <Text style={styles.deleteTitle}>Delete Server</Text>
                </View>
                <TouchableOpacity onPress={() => setServerToDelete(null)}>
                  <X size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.deleteBody}>
                <Text style={styles.deletePrompt}>
                  Are you sure you want to delete <Text style={{ color: '#ffffff', fontWeight: '700' }}>{serverToDelete.name}</Text>? This action cannot be undone.
                </Text>
                
                <View style={styles.deleteActions}>
                  <TouchableOpacity
                    onPress={() => setServerToDelete(null)}
                    style={styles.deleteCancelBtn}
                  >
                    <Text style={styles.deleteCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDelete}
                    style={styles.deleteConfirmBtn}
                  >
                    <Text style={styles.deleteConfirmText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
    marginRight: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  versionBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  updatePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#818cf8',
    marginLeft: 4,
  },
  updatePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  appSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  attributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  authorHighlight: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  serverCountText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  serverScroll: {
    flex: 1,
  },
  serverScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  deleteDialog: {
    backgroundColor: '#0f111a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  deleteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  deleteBody: {
    padding: 20,
  },
  deletePrompt: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  deleteCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  deleteCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  deleteConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  deleteConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
