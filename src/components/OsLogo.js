// OS Logo & Distro Badge Component for Glyph Mobile
// 100% Desktop Parity with Crisp Offline SVG Vectors (Zero Mock/Placeholder)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G, Polygon } from 'react-native-svg';

// OS Distro Brand Configuration & Vectors
export const OS_CONFIG = {
  ubuntu: {
    name: 'Ubuntu',
    bg: 'rgba(233, 84, 32, 0.22)',
    border: '#e95420',
    color: '#e95420',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#e95420" />
        {/* Ubuntu Circle of Friends */}
        <Circle cx="12" cy="5.8" r="1.3" fill="#ffffff" />
        <Circle cx="6.6" cy="15.1" r="1.3" fill="#ffffff" />
        <Circle cx="17.4" cy="15.1" r="1.3" fill="#ffffff" />
        <Path
          d="M12 7.8 A4.2 4.2 0 0 1 15.6 13.8 M8.4 13.8 A4.2 4.2 0 0 1 12 7.8 M15 15 A4.2 4.2 0 0 1 9 15"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
  debian: {
    name: 'Debian',
    bg: 'rgba(215, 10, 83, 0.22)',
    border: '#d70a53',
    color: '#d70a53',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#d70a53" />
        {/* Debian Swirl */}
        <Path
          d="M12 6 C15.5 6 18 8.5 18 11.5 C18 14 16 16.5 13.5 17 C11.5 17.5 9.5 16.5 9 14.5 C8.5 12.5 9.8 10.8 11.8 10.5 C13 10.3 14 11 14.2 12 C14.3 12.6 13.9 13.2 13.2 13.3 C12.8 13.4 12.4 13.1 12.3 12.7"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
  arch: {
    name: 'Arch Linux',
    bg: 'rgba(23, 147, 209, 0.22)',
    border: '#1793d1',
    color: '#1793d1',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#1793d1" />
        {/* Arch Mountain Triangle */}
        <Path
          d="M12 5 L5 18 L8 18 L10.5 13 L13.5 13 L16 18 L19 18 Z"
          fill="#ffffff"
        />
        <Path d="M12 9.5 L10.8 12 L13.2 12 Z" fill="#1793d1" />
      </Svg>
    ),
  },
  alpine: {
    name: 'Alpine',
    bg: 'rgba(13, 89, 142, 0.22)',
    border: '#38bdf8',
    color: '#38bdf8',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#0d597f" />
        {/* Alpine Twin Peaks */}
        <Polygon points="12,6 6,17 11,17" fill="#38bdf8" />
        <Polygon points="16,9 11.5,17 18,17" fill="#ffffff" />
      </Svg>
    ),
  },
  centos: {
    name: 'CentOS',
    bg: 'rgba(147, 34, 127, 0.22)',
    border: '#93227f',
    color: '#93227f',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#93227f" />
        <Rect x="8.5" y="8.5" width="7" height="7" fill="#ffffff" transform="rotate(45 12 12)" />
        <Rect x="10.5" y="10.5" width="3" height="3" fill="#93227f" />
      </Svg>
    ),
  },
  fedora: {
    name: 'Fedora',
    bg: 'rgba(41, 65, 114, 0.22)',
    border: '#51a2da',
    color: '#51a2da',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#294172" />
        <Path
          d="M15 7 A3 3 0 0 0 9 9 V15 A3 3 0 0 0 15 15 M9 11 H15"
          stroke="#51a2da"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
  redhat: {
    name: 'Red Hat',
    bg: 'rgba(238, 0, 0, 0.22)',
    border: '#ee0000',
    color: '#ee0000',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#ee0000" />
        <Path d="M6 14 C8 11 16 11 18 14 L17 16 C14 17 10 17 7 16 Z" fill="#ffffff" />
        <Path d="M9 14 C9 11 15 11 15 14 Z" fill="#111111" />
      </Svg>
    ),
  },
  rocky: {
    name: 'Rocky',
    bg: 'rgba(16, 185, 129, 0.22)',
    border: '#10b981',
    color: '#10b981',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#10b981" />
        <Polygon points="12,5 18,17 6,17" fill="#ffffff" />
        <Polygon points="12,9 15.5,16 8.5,16" fill="#10b981" />
      </Svg>
    ),
  },
  macos: {
    name: 'macOS',
    bg: 'rgba(255, 255, 255, 0.12)',
    border: '#ffffff',
    color: '#ffffff',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#262626" />
        <Path
          d="M13 7 C14 5.8 15 6 15 6 C15 7 14.2 8 13.5 8.2 C13 8.3 12.6 8 13 7 Z M15.5 11.5 C15.5 10 16.5 9.2 16.5 9.2 C15.8 8.2 14.5 8.2 14 8.2 C12.8 8.2 12.2 8.8 11.5 8.8 C10.8 8.8 10 8.2 9 8.2 C7.5 8.2 6 9.5 6 12 C6 14.5 7.5 17.5 9 17.5 C9.8 17.5 10.2 17 11 17 C11.8 17 12.2 17.5 13 17.5 C14.5 17.5 15.8 14.8 16.2 14 C16.2 14 15.5 13.5 15.5 11.5 Z"
          fill="#ffffff"
        />
      </Svg>
    ),
  },
  windows: {
    name: 'Windows',
    bg: 'rgba(0, 164, 239, 0.22)',
    border: '#00a4ef',
    color: '#00a4ef',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#0078d7" />
        <Rect x="7" y="7" width="4.5" height="4.5" fill="#ffffff" />
        <Rect x="12.5" y="7" width="4.5" height="4.5" fill="#ffffff" />
        <Rect x="7" y="12.5" width="4.5" height="4.5" fill="#ffffff" />
        <Rect x="12.5" y="12.5" width="4.5" height="4.5" fill="#ffffff" />
      </Svg>
    ),
  },
  linux: {
    name: 'Linux',
    bg: 'rgba(250, 187, 0, 0.22)',
    border: '#fabb00',
    color: '#fabb00',
    renderVector: (size) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" fill="#1e293b" stroke="#fabb00" strokeWidth="1" />
        {/* Tux Penguin Symbol */}
        <Circle cx="12" cy="9" r="3.2" fill="#ffffff" />
        <Circle cx="11" cy="8.5" r="0.6" fill="#000000" />
        <Circle cx="13" cy="8.5" r="0.6" fill="#000000" />
        <Polygon points="12,9.5 11,10.8 13,10.8" fill="#fabb00" />
        <Path d="M8.5 15 C8.5 12 15.5 12 15.5 15 C15.5 18 8.5 18 8.5 15 Z" fill="#ffffff" />
        <Polygon points="9.5,17 7,18.5 11,18.5" fill="#fabb00" />
        <Polygon points="14.5,17 13,18.5 17,18.5" fill="#fabb00" />
      </Svg>
    ),
  },
};

// Map distro aliases to canonical config
const ALIAS_MAP = {
  ubuntu: 'ubuntu',
  debian: 'debian',
  raspbian: 'debian',
  kali: 'debian',
  'kali-linux': 'debian',
  pop: 'ubuntu',
  'pop!_os': 'ubuntu',
  mint: 'debian',
  linuxmint: 'debian',
  centos: 'centos',
  fedora: 'fedora',
  rhel: 'redhat',
  redhat: 'redhat',
  'red hat': 'redhat',
  rocky: 'rocky',
  almalinux: 'centos',
  alma: 'centos',
  arch: 'arch',
  archlinux: 'arch',
  manjaro: 'arch',
  alpine: 'alpine',
  macos: 'macos',
  darwin: 'macos',
  apple: 'macos',
  windows: 'windows',
  linux: 'linux',
};

export default function OsLogo({ server, osType, size = 36, style }) {
  const rawOs = server?.os || osType || (typeof server === 'string' ? server : null);
  const serverName = server?.name || server?.host || 'Server';

  let matchedConfig = null;
  if (rawOs) {
    const key = rawOs.toLowerCase().trim();
    const canonical = ALIAS_MAP[key] || (key.includes('ubuntu') ? 'ubuntu' : key.includes('debian') ? 'debian' : key.includes('arch') ? 'arch' : key.includes('alpine') ? 'alpine' : key.includes('cent') ? 'centos' : key.includes('fedora') ? 'fedora' : key.includes('red') ? 'redhat' : key.includes('rocky') ? 'rocky' : key.includes('mac') || key.includes('darwin') ? 'macos' : key.includes('win') ? 'windows' : 'linux');
    matchedConfig = OS_CONFIG[canonical] || OS_CONFIG.linux;
  }

  const radius = Math.round(size * 0.28);
  const vectorSize = Math.round(size * 0.72);

  if (matchedConfig) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: matchedConfig.bg,
            borderColor: matchedConfig.border,
          },
          style,
        ]}
      >
        {matchedConfig.renderVector(vectorSize)}
      </View>
    );
  }

  // Fallback initial avatar matching Desktop ui-avatars
  const initials = (serverName.replace(/[^A-Za-z0-9]/g, '').slice(0, 2) || 'SV').toUpperCase();
  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: 'rgba(99, 102, 241, 0.18)',
          borderColor: 'rgba(99, 102, 241, 0.4)',
        },
        style,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    color: '#a5b4fc',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
