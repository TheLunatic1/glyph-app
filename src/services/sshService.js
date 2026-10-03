// Real Native SSH Service Bridge for Glyph Mobile
// 100% Desktop Parity with zero placeholders
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { GlyphSSH } = NativeModules;
const eventEmitter = GlyphSSH ? new NativeEventEmitter(GlyphSSH) : null;

class SSHService {
  constructor() {
    this.isConnected = false;
    this.activeServer = null;
    this.listeners = [];
  }

  /**
   * Connects to a real SSH server using native JSch client
   */
  async connect(serverConfig) {
    if (!GlyphSSH) {
      throw new Error('Native SSH Module is not available on this platform.');
    }

    const payload = {
      host: serverConfig.host,
      port: parseInt(serverConfig.port, 10) || 22,
      username: serverConfig.username || 'root',
      password: serverConfig.password || '',
      privateKey: serverConfig.privateKey || serverConfig.privateKeyPath || '',
      passphrase: serverConfig.passphrase || ''
    };

    try {
      const result = await GlyphSSH.connect(payload);
      this.isConnected = true;
      this.activeServer = serverConfig;
      return result;
    } catch (error) {
      this.isConnected = false;
      this.activeServer = null;
      throw error;
    }
  }

  /**
   * Disconnects active SSH session
   */
  async disconnect() {
    this.stopStatPolling();
    this.listeners.forEach(unsub => {
      try { unsub(); } catch (_) {}
    });
    this.listeners = [];

    if (GlyphSSH && this.isConnected) {
      try {
        await GlyphSSH.disconnect();
      } catch (_) {}
    }
    this.isConnected = false;
    this.activeServer = null;
    return { success: true };
  }

  /**
   * Executes a command on the remote server over SSH
   */
  async exec(command) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.exec(command);
  }

  /**
   * Opens an interactive PTY shell session
   */
  async openShell(tabId = 'default') {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.openShell(tabId);
  }

  /**
   * Writes raw keystroke/text data to the PTY shell
   */
  writeShell(tabId = 'default', data = '') {
    if (GlyphSSH) {
      GlyphSSH.writeShell(tabId, data);
    }
  }

  /**
   * Resizes the PTY shell dimensions
   */
  resizeShell(tabId = 'default', cols = 80, rows = 24) {
    if (GlyphSSH) {
      GlyphSSH.resizeShell(tabId, cols, rows);
    }
  }

  /**
   * Closes a specific shell tab
   */
  closeShell(tabId = 'default') {
    if (GlyphSSH) {
      GlyphSSH.closeShell(tabId);
    }
  }

  /**
   * Starts periodic live system stats polling (CPU, RAM, Disk, Temps, Uptime)
   */
  startStatPolling(intervalMs = 3000) {
    if (GlyphSSH) {
      GlyphSSH.startStatPolling(intervalMs);
    }
  }

  /**
   * Stops stat polling
   */
  stopStatPolling() {
    if (GlyphSSH) {
      GlyphSSH.stopStatPolling();
    }
  }

  // ── SFTP Operations ────────────────────────────────────────────────────────
  async sftpReaddir(path = '/root') {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpReaddir(path);
  }

  async sftpReadFile(path) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpReadFile(path);
  }

  async sftpWriteFile(path, content) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpWriteFile(path, content);
  }

  async sftpDelete(path, isDirectory = false) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpDelete(path, isDirectory);
  }

  async sftpMkdir(path) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpMkdir(path);
  }

  async sftpRename(oldPath, newPath) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpRename(oldPath, newPath);
  }

  async sftpDownloadFile(remotePath, localPath) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpDownloadFile(remotePath, localPath);
  }

  async sftpUploadFile(localPath, remotePath) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.sftpUploadFile(localPath, remotePath);
  }

  // ── Tunnel Operations ──────────────────────────────────────────────────────
  async startTunnel(localPort, remoteHost, remotePort) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.startTunnel(parseInt(localPort, 10), remoteHost, parseInt(remotePort, 10));
  }

  async stopTunnel(localPort) {
    if (!GlyphSSH) throw new Error('Native SSH is not available.');
    return await GlyphSSH.stopTunnel(parseInt(localPort, 10));
  }

  // ── Event Listeners ────────────────────────────────────────────────────────
  onShellOutput(callback) {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('ssh-shell-output-tab', (event) => {
      if (event && callback) {
        callback(event.tabId, event.data);
      }
    });
    this.listeners.push(() => sub.remove());
    return () => sub.remove();
  }

  onShellClosed(callback) {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('ssh-shell-closed', (event) => {
      if (event && callback) {
        callback(event.tabId);
      }
    });
    this.listeners.push(() => sub.remove());
    return () => sub.remove();
  }

  onStats(callback) {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('ssh-stats', (data) => {
      if (data && callback) {
        callback(data);
      }
    });
    this.listeners.push(() => sub.remove());
    return () => sub.remove();
  }

  onStatus(callback) {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('ssh-status', (msg) => {
      if (callback) callback(msg);
    });
    this.listeners.push(() => sub.remove());
    return () => sub.remove();
  }

  onDisconnected(callback) {
    if (!eventEmitter) return () => {};
    const sub = eventEmitter.addListener('ssh-disconnected', (reason) => {
      this.isConnected = false;
      if (callback) callback(reason);
    });
    this.listeners.push(() => sub.remove());
    return () => sub.remove();
  }
}

export const sshService = new SSHService();

