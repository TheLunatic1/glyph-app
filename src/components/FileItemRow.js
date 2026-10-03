// SFTP File/Folder Row Component for Glyph Mobile
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Folder, FileText, FileCode, File, Shield, MoreVertical, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { formatBytes } from '../utils/helpers';

export default function FileItemRow({ item, onPress, onOptionsPress }) {
  const isDir = item.type === 'directory';

  const getFileIcon = () => {
    if (isDir) {
      return <Folder size={20} color={COLORS.amberLight} />;
    }
    const name = item.name.toLowerCase();
    if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.py') || name.endsWith('.go') || name.endsWith('.rs')) {
      return <FileCode size={20} color={COLORS.cyanLight} />;
    }
    if (name.endsWith('.json') || name.endsWith('.yml') || name.endsWith('.yaml') || name.endsWith('.conf') || name.endsWith('.env')) {
      return <FileText size={20} color={COLORS.purpleLight} />;
    }
    if (name.endsWith('.pem') || name.endsWith('.key') || name.endsWith('.crt')) {
      return <Shield size={20} color={COLORS.roseLight} />;
    }
    return <File size={20} color={COLORS.textSecondary} />;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(item)}
      style={styles.row}
    >
      <View style={styles.left}>
        <View style={styles.iconWrapper}>{getFileIcon()}</View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.permissions || '-rw-r--r--'}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{isDir ? 'Folder' : formatBytes(item.size)}</Text>
            {item.modified && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{item.modified}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.right}>
        {isDir ? (
          <ChevronRight size={16} color={COLORS.textMuted} />
        ) : (
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => onOptionsPress && onOptionsPress(item)}
            style={styles.optionsBtn}
          >
            <MoreVertical size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconWrapper: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  metaDot: {
    color: COLORS.textMuted,
    marginHorizontal: 5,
    fontSize: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsBtn: {
    padding: 4,
  }
});
