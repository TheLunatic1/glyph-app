// Metric Gauge Component for Glyph Mobile
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function MetricGauge({ label, value, unit = '%', color, subtext, compact = false }) {
  const numValue = Math.min(100, Math.max(0, Number(value) || 0));
  
  const getGaugeColor = () => {
    if (color) return color;
    if (numValue > 85) return COLORS.rose;
    if (numValue > 70) return COLORS.amber;
    return COLORS.emerald;
  };

  const activeColor = getGaugeColor();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactLabel}>{label}</Text>
          <Text style={[styles.compactValue, { color: activeColor }]}>{numValue}{unit}</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${numValue}%`, backgroundColor: activeColor }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.percentage, { color: activeColor }]}>{numValue}{unit}</Text>
      </View>

      <View style={styles.barBgLarge}>
        <View
          style={[
            styles.barFillLarge,
            {
              width: `${numValue}%`,
              backgroundColor: activeColor,
              shadowColor: activeColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 6,
            }
          ]}
        />
      </View>

      {subtext ? <Text style={styles.subtext} numberOfLines={1}>{subtext}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barBgLarge: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFillLarge: {
    height: '100%',
    borderRadius: 3,
  },
  subtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },

  // Compact styles
  compactContainer: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  compactValue: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  }
});
