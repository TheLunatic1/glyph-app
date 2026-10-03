// Real Port Forwarding / Tunnel Service for Glyph Mobile (Zero Placeholders)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';
import { sshService } from './sshService';

const TUNNELS_KEY = '@glyph_tunnels_v3';

export async function getTunnels(serverId) {
  try {
    const raw = await AsyncStorage.getItem(TUNNELS_KEY);
    const all = raw ? JSON.parse(raw) : [];
    if (serverId) {
      return all.filter(t => t.serverId === serverId);
    }
    return all;
  } catch (e) {
    return [];
  }
}

export async function saveTunnel(tunnel) {
  try {
    const raw = await AsyncStorage.getItem(TUNNELS_KEY);
    const all = raw ? JSON.parse(raw) : [];
    let updated;
    if (tunnel.id) {
      updated = all.map(t => (t.id === tunnel.id ? { ...t, ...tunnel } : t));
    } else {
      const newEntry = {
        ...tunnel,
        id: generateId(),
        localPort: parseInt(tunnel.localPort, 10),
        remoteHost: tunnel.remoteHost || '127.0.0.1',
        remotePort: parseInt(tunnel.remotePort, 10),
        protocol: tunnel.protocol || 'tcp',
        status: 'stopped'
      };
      updated = [newEntry, ...all];
    }
    await AsyncStorage.setItem(TUNNELS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save tunnel:', e);
    throw e;
  }
}

export async function toggleTunnel(tunnelId) {
  try {
    const raw = await AsyncStorage.getItem(TUNNELS_KEY);
    const all = raw ? JSON.parse(raw) : [];
    const target = all.find(t => t.id === tunnelId);
    if (!target) return all;

    if (target.status === 'active') {
      // Stop native tunnel
      try {
        await sshService.stopTunnel(target.localPort);
      } catch (err) {
        console.warn('Native stop tunnel:', err);
      }
      target.status = 'stopped';
    } else {
      // Start native tunnel
      await sshService.startTunnel(target.localPort, target.remoteHost, target.remotePort);
      target.status = 'active';
    }

    const updated = all.map(t => (t.id === tunnelId ? { ...t, status: target.status } : t));
    await AsyncStorage.setItem(TUNNELS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to toggle tunnel:', e);
    throw e;
  }
}

export async function deleteTunnel(tunnelId) {
  try {
    const raw = await AsyncStorage.getItem(TUNNELS_KEY);
    const all = raw ? JSON.parse(raw) : [];
    const target = all.find(t => t.id === tunnelId);
    if (target && target.status === 'active') {
      try {
        await sshService.stopTunnel(target.localPort);
      } catch (_) {}
    }
    const updated = all.filter(t => t.id !== tunnelId);
    await AsyncStorage.setItem(TUNNELS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete tunnel:', e);
    throw e;
  }
}
