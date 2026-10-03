// Saved Command Snippets Service for Glyph Mobile
// 100% Parity with Desktop Glyph Commands
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';

const SNIPPETS_KEY = '@glyph_command_snippets_v3';

export const DEFAULT_SNIPPETS = [
  { id: '1', name: 'Update System', command: 'sudo apt update && sudo apt upgrade -y', uses: 0 },
  { id: '2', name: 'Check Logs', command: 'tail -f /var/log/syslog', uses: 0 },
  { id: '3', name: 'List Ports', command: 'netstat -tulpn', uses: 0 }
];

export async function getSnippets(serverId) {
  try {
    const key = serverId ? `@glyph_commands_${serverId}` : SNIPPETS_KEY;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      await AsyncStorage.setItem(key, JSON.stringify(DEFAULT_SNIPPETS));
      return DEFAULT_SNIPPETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SNIPPETS;
  }
}

export async function saveSnippet(snippet, serverId) {
  try {
    const key = serverId ? `@glyph_commands_${serverId}` : SNIPPETS_KEY;
    const all = await getSnippets(serverId);
    let updated;
    if (snippet.id) {
      updated = all.map(s => (s.id === snippet.id ? { ...s, ...snippet } : s));
    } else {
      const newEntry = {
        id: generateId(),
        name: snippet.name || 'Custom Command',
        command: snippet.command || snippet.cmd || '',
        uses: 0,
      };
      updated = [newEntry, ...all];
    }
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save snippet:', e);
    throw e;
  }
}

export async function recordSnippetUsage(snippetId, serverId) {
  try {
    const key = serverId ? `@glyph_commands_${serverId}` : SNIPPETS_KEY;
    const all = await getSnippets(serverId);
    const updated = all.map(s => (s.id === snippetId ? { ...s, uses: (s.uses || 0) + 1 } : s));
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export async function deleteSnippet(snippetId, serverId) {
  try {
    const key = serverId ? `@glyph_commands_${serverId}` : SNIPPETS_KEY;
    const all = await getSnippets(serverId);
    const updated = all.filter(s => s.id !== snippetId);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete snippet:', e);
    throw e;
  }
}
