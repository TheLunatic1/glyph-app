import { Platform } from 'react-native';

// Glyph Mobile Design System - Colors & Theme Tokens
// 100% harmonious with Glyph Desktop Glassmorphism

export const COLORS = {
  // Backgrounds
  bgDark: '#0a0c12',
  bgSubtle: '#0f121d',
  cardBg: 'rgba(21, 25, 38, 0.85)',
  cardBgSolid: '#151926',
  cardBgElevated: '#1a2030',
  cardBgGlass: 'rgba(25, 30, 48, 0.65)',
  modalBg: '#121624',
  headerBg: 'rgba(11, 14, 22, 0.92)',
  inputBg: 'rgba(15, 18, 29, 0.8)',
  inputBgFocused: 'rgba(20, 25, 42, 0.95)',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.14)',
  borderFocus: 'rgba(99, 102, 241, 0.55)',
  borderAccent: 'rgba(56, 189, 248, 0.4)',
  
  // Brand / Primaries
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primaryGlow: 'rgba(99, 102, 241, 0.35)',
  
  // Accents
  cyan: '#06b6d4',
  cyanLight: '#38bdf8',
  purple: '#a855f7',
  purpleLight: '#c084fc',
  emerald: '#10b981',
  emeraldLight: '#34d399',
  emeraldGlow: 'rgba(16, 185, 129, 0.25)',
  amber: '#f59e0b',
  amberLight: '#fbbf24',
  rose: '#f43f5e',
  roseLight: '#fb7185',
  roseGlow: 'rgba(244, 63, 94, 0.25)',
  
  // Typography
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textSubtle: '#475569',
  
  // Status Colors
  online: '#10b981',
  offline: '#64748b',
  warning: '#f59e0b',
  error: '#f43f5e',
  connecting: '#38bdf8',
  
  // Terminal Colors
  terminalBg: '#080a0f',
  terminalHeader: '#0e111a',
  terminalText: '#e2e8f0',
  terminalCursor: '#38bdf8',
  terminalGreen: '#4ade80',
  terminalYellow: '#fde047',
  terminalBlue: '#60a5fa',
  terminalMagenta: '#c084fc',
  terminalCyan: '#22d3ee',
  
  // Tag Colors
  tagColors: {
    indigo: { bg: 'rgba(99, 102, 241, 0.18)', border: 'rgba(99, 102, 241, 0.4)', text: '#a5b4fc' },
    cyan: { bg: 'rgba(6, 182, 212, 0.18)', border: 'rgba(6, 182, 212, 0.4)', text: '#67e8f9' },
    emerald: { bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7' },
    amber: { bg: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.4)', text: '#fcd34d' },
    rose: { bg: 'rgba(244, 63, 94, 0.18)', border: 'rgba(244, 63, 94, 0.4)', text: '#fda4af' },
    purple: { bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.4)', text: '#d8b4fe' },
  }
};

export const SHADOWS = {
  glowPrimary: Platform.select({
    web: { boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)' },
    default: {
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    }
  }),
  card: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    }
  }),
  modal: Platform.select({
    web: { boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 16,
    }
  })
};

