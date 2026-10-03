// Vault Storage Service for Glyph Mobile
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { generateId } from '../utils/helpers';
import { createEncryptedBackup, decryptBackup } from '../utils/crypto';

const SERVERS_KEY = '@glyph_servers_v3';
const SECRETS_PREFIX = '@glyph_secret_';
const SETTINGS_KEY = '@glyph_settings_v3';



export async function getServers() {
  try {
    const raw = await AsyncStorage.getItem(SERVERS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load servers:', error);
    return [];
  }
}

export async function saveServer(serverData) {
  try {
    const servers = await getServers();
    let updatedServers;

    if (serverData.id) {
      // Edit existing
      updatedServers = servers.map(s => {
        if (s.id === serverData.id) {
          return {
            ...s,
            name: serverData.name || serverData.host,
            host: serverData.host,
            username: serverData.username || 'root',
            port: parseInt(serverData.port, 10) || 22,
            password: serverData.password !== undefined && serverData.password !== '' ? serverData.password : s.password,
            zerotier: serverData.zerotier || '',
            privateKey: serverData.privateKey || '',
            os: serverData.os || s.os || null
          };
        }
        return s;
      });
    } else {
      // Add new
      const newServer = {
        id: generateId(),
        name: serverData.name || serverData.host,
        host: serverData.host,
        username: serverData.username || 'root',
        port: parseInt(serverData.port, 10) || 22,
        password: serverData.password || '',
        zerotier: serverData.zerotier || '',
        privateKey: serverData.privateKey || '',
        os: null, // OS auto-detected on first SSH connect
        status: 'offline',
        createdAt: new Date().toISOString(),
        metrics: {
          cpu: 0,
          ram: 0,
          disk: 0,
          uptime: 0,
          cores: 2,
          ramTotal: 4 * 1024 * 1024 * 1024,
          ramUsed: 0,
          diskTotal: 100 * 1024 * 1024 * 1024,
          diskUsed: 0,
          osName: 'Linux Server',
          kernel: 'Linux'
        }
      };
      updatedServers = [newServer, ...servers];
    }

    await AsyncStorage.setItem(SERVERS_KEY, JSON.stringify(updatedServers));
    return updatedServers;
  } catch (error) {
    console.error('Failed to save server:', error);
    throw error;
  }
}

export async function updateServer(id, updates) {
  try {
    const servers = await getServers();
    const updated = servers.map(s => (s.id === id ? { ...s, ...updates } : s));
    await AsyncStorage.setItem(SERVERS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update server:', error);
    throw error;
  }
}

export async function deleteServer(serverId) {
  try {
    const servers = await getServers();
    const updatedServers = servers.filter(s => s.id !== serverId);
    await AsyncStorage.setItem(SERVERS_KEY, JSON.stringify(updatedServers));
    
    // Clean up associated secrets if any
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(`${SECRETS_PREFIX}${serverId}`);
      }
    } catch (e) {}

    return updatedServers;
  } catch (error) {
    console.error('Failed to delete server:', error);
    throw error;
  }
}

export async function duplicateServer(serverId) {
  try {
    const servers = await getServers();
    const target = servers.find(s => s.id === serverId);
    if (!target) return servers;

    const duplicated = {
      ...target,
      id: generateId(),
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString()
    };

    const updated = [duplicated, ...servers];
    await AsyncStorage.setItem(SERVERS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to duplicate server:', error);
    throw error;
  }
}

// Server Secrets Vault
export async function getServerSecrets(serverId) {
  try {
    if (Platform.OS === 'web') {
      const raw = await AsyncStorage.getItem(`${SECRETS_PREFIX}${serverId}`);
      return raw ? JSON.parse(raw) : [];
    }
    const raw = await SecureStore.getItemAsync(`${SECRETS_PREFIX}${serverId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveServerSecrets(serverId, secrets) {
  try {
    const jsonStr = JSON.stringify(secrets);
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(`${SECRETS_PREFIX}${serverId}`, jsonStr);
    } else {
      await SecureStore.setItemAsync(`${SECRETS_PREFIX}${serverId}`, jsonStr);
    }
  } catch (e) {
    console.error('Failed to save secrets:', e);
  }
}

// App Settings
export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
    return {
      biometricsEnabled: true,
      masterPin: '',
      isLocked: false,
      terminalFontSize: 13,
      terminalTheme: 'dark',
      keepAliveInterval: 30,
      connectionTimeout: 15,
      desktopRelayHost: '192.168.1.100',
      desktopRelayPort: 15354
    };
  } catch (e) {
    return {};
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Export / Import
export async function exportVault(selectedServerIds, masterPassword) {
  const allServers = await getServers();
  const serversToExport = selectedServerIds && selectedServerIds.length > 0
    ? allServers.filter(s => selectedServerIds.includes(s.id))
    : allServers;

  const payload = {
    servers: serversToExport,
    exportedAt: new Date().toISOString()
  };

  return await createEncryptedBackup(payload, masterPassword);
}

export async function decryptImportFile(backupJsonStr, masterPassword) {
  const decrypted = await decryptBackup(backupJsonStr, masterPassword);
  const serversList = Array.isArray(decrypted) 
    ? decrypted 
    : (decrypted && Array.isArray(decrypted.servers) ? decrypted.servers : []);

  if (!Array.isArray(serversList) || serversList.length === 0) {
    throw new Error('No valid servers found in the backup file.');
  }
  return serversList;
}

export async function importSelectedServers(selectedServersList) {
  if (!Array.isArray(selectedServersList) || selectedServersList.length === 0) {
    throw new Error('Please select at least one server to import.');
  }

  const existing = await getServers();
  const existingMap = new Map(existing.map(s => [s.id, s]));

  for (const s of selectedServersList) {
    const id = s.id || generateId();
    existingMap.set(id, { ...s, id });
  }

  const merged = Array.from(existingMap.values());
  await AsyncStorage.setItem(SERVERS_KEY, JSON.stringify(merged));
  return merged;
}

export async function importVault(backupJsonStr, masterPassword) {
  const serversList = await decryptImportFile(backupJsonStr, masterPassword);
  return await importSelectedServers(serversList);
}

