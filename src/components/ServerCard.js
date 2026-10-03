// Server Card Component for Glyph Mobile - Direct Port of Desktop App.jsx Server Card
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Play, Edit2, Trash2 } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme/colors';
import OsLogo from './OsLogo';

export default function ServerCard({ server, onConnect, onEdit, onDelete }) {
  const hasOs = !!server.os;
  const osLabel = hasOs ? server.os.toUpperCase() : 'SAVED';

  return (
    <View style={[styles.card, SHADOWS.card]}>
      {/* Action Buttons in Card Top-Right */}
      <View style={styles.topRightActions}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => onEdit(server)}
          style={styles.actionBtn}
        >
          <Edit2 size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => onDelete(server)}
          style={styles.actionBtn}
        >
          <Trash2 size={16} color="#f87171" />
        </TouchableOpacity>
      </View>

      {/* Clickable Main Info Row */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onConnect(server)}
        style={styles.mainRow}
      >
        <View style={styles.avatarWrapper}>
          <OsLogo server={server} size={42} />
        </View>

        <View style={styles.infoColumn}>
          <Text style={styles.serverName} numberOfLines={1}>
            {server.name}
          </Text>
          <Text style={styles.serverHost} numberOfLines={1}>
            {server.username}@{server.host}:{server.port || 22}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Badges & Connect Footer */}
      <View style={styles.footerRow}>
        <View style={styles.badgeGroup}>
          {/* OS Badge */}
          <View style={[styles.badge, hasOs ? styles.osBadgeKnown : styles.osBadgeSaved]}>
            <View style={[styles.badgeDot, { backgroundColor: hasOs ? '#4ade80' : '#64748b' }]} />
            <Text style={[styles.badgeText, { color: hasOs ? '#4ade80' : '#94a3b8' }]}>
              {osLabel}
            </Text>
          </View>

          {/* ZeroTier Badge */}
          {!!server.zerotier && (
            <View style={[styles.badge, styles.ztBadge]}>
              <View style={[styles.badgeDot, { backgroundColor: '#facc15' }]} />
              <Text style={[styles.badgeText, { color: '#facc15' }]}>
                ZT Network
              </Text>
            </View>
          )}
        </View>

        {/* Connect / Launch CTA */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onConnect(server)}
          style={styles.connectCta}
        >
          <Text style={styles.connectText}>Connect</Text>
          <Play size={12} color={COLORS.primaryLight} fill={COLORS.primaryLight} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f111a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 14,
    position: 'relative',
  },
  topRightActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 60, // leave space for action buttons
  },
  avatarWrapper: {
    marginRight: 12,
  },
  infoColumn: {
    flex: 1,
  },
  serverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  serverHost: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  osBadgeKnown: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  osBadgeSaved: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ztBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderColor: 'rgba(250, 204, 21, 0.25)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  connectCta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  connectText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
});
