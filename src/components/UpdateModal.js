// Glyph Mobile - In-App Update Modal
// 100% Desktop Parity with Glassmorphic Styling, Release Notes & Direct APK Download
import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Download, ExternalLink, X, ArrowRight, Calendar, HardDrive } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';

function fmtBytes(bytes) {
  if (!bytes) return null;
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return null;
  }
}

export default function UpdateModal({ visible, info, onClose }) {
  const insets = useSafeAreaInsets();

  if (!visible || !info) return null;

  const handleDownload = () => {
    if (info.downloadUrl) {
      Linking.openURL(info.downloadUrl);
    } else if (info.releaseUrl) {
      Linking.openURL(info.releaseUrl);
    }
  };

  const handleOpenGitHub = () => {
    if (info.releaseUrl) {
      Linking.openURL(info.releaseUrl);
    }
  };

  const formattedDate = formatDate(info.releaseDate);
  const formattedSize = fmtBytes(info.apkSize);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, SHADOWS.glowPrimary]}>
                <Zap size={22} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Update Available</Text>
                <Text style={styles.headerSubtitle}>
                  A new version of Glyph Mobile is ready
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Version Transition Banner */}
          <View style={styles.versionBanner}>
            <View style={styles.versionPillOld}>
              <Text style={styles.versionOldText}>{info.currentVersion}</Text>
            </View>
            <ArrowRight size={16} color={COLORS.primaryLight} style={{ marginHorizontal: 8 }} />
            <View style={styles.versionPillNew}>
              <Text style={styles.versionNewText}>{info.latestVersion}</Text>
            </View>
            {formattedSize && (
              <View style={styles.metaBadge}>
                <HardDrive size={11} color={COLORS.cyanLight} style={{ marginRight: 4 }} />
                <Text style={styles.metaBadgeText}>{formattedSize}</Text>
              </View>
            )}
          </View>

          {/* Release Title & Date */}
          {info.title && info.title !== info.latestVersion && (
            <Text style={styles.releaseTitle} numberOfLines={1}>
              {info.title}
            </Text>
          )}

          {formattedDate && (
            <View style={styles.dateRow}>
              <Calendar size={12} color={COLORS.textMuted} style={{ marginRight: 5 }} />
              <Text style={styles.dateText}>Released {formattedDate}</Text>
            </View>
          )}

          {/* Release Notes Card */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesHeader}>WHAT'S NEW</Text>
            <ScrollView
              style={styles.notesScroll}
              contentContainerStyle={styles.notesContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.notesText}>
                {info.releaseNotes}
              </Text>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDownload}
              style={styles.downloadBtn}
            >
              <Download size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.downloadBtnText}>Download APK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenGitHub}
              style={styles.gitHubBtn}
              title="View on GitHub"
            >
              <ExternalLink size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
            <Text style={styles.laterBtnText}>Remind Me Later</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#0f1322',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  versionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  versionPillOld: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  versionOldText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  versionPillNew: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  versionNewText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  metaBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.cyanLight,
  },
  releaseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  notesContainer: {
    backgroundColor: '#0a0d16',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 16,
    maxHeight: 180,
  },
  notesHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  notesScroll: {
    maxHeight: 140,
  },
  notesContent: {
    paddingRight: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  gitHubBtn: {
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  laterBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  }
});
