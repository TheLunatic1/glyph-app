// Circular Progress Ring Component matching Desktop Dashboard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function CircularProgress({
  percentage = 0,
  label = '',
  onPress,
  size = 76,
  strokeWidth = 6,
}) {
  const isNa = percentage < 0;
  const dispPct = isNa ? 0 : Math.min(100, Math.max(0, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dispPct / 100) * circumference;

  const getColor = () => {
    if (isNa) return '#3f3f46';
    if (dispPct > 85) return '#ef4444';
    if (dispPct > 70) return '#f59e0b';
    return '#6366f1'; // brand primary
  };

  const color = getColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <View style={[styles.circleWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1c202e"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.centerTextContainer}>
          <Text style={styles.percentageText}>
            {isNa ? 'N/A' : `${dispPct}%`}
          </Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
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
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
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
