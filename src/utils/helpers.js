// Formatting and general helper functions for Glyph Mobile

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return '0m';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(' ');
}

export function detectOs(server) {
  if (server?.os) return server.os.toLowerCase();
  const name = (server?.name || '').toLowerCase();
  const host = (server?.host || '').toLowerCase();
  const combined = `${name} ${host}`;

  if (combined.includes('ubuntu')) return 'ubuntu';
  if (combined.includes('debian')) return 'debian';
  if (combined.includes('alpine') || combined.includes('edge') || combined.includes('gate')) return 'alpine';
  if (combined.includes('centos')) return 'centos';
  if (combined.includes('arch')) return 'arch';
  if (combined.includes('fedora') || combined.includes('redhat') || combined.includes('rhel')) return 'fedora';
  if (combined.includes('mac') || combined.includes('darwin') || combined.includes('apple')) return 'macos';
  if (combined.includes('win')) return 'windows';
  return 'linux';
}

export function getTagColor(colorName) {
  const colors = {
    indigo: { bg: 'rgba(99, 102, 241, 0.18)', border: 'rgba(99, 102, 241, 0.4)', text: '#a5b4fc' },
    cyan: { bg: 'rgba(6, 182, 212, 0.18)', border: 'rgba(6, 182, 212, 0.4)', text: '#67e8f9' },
    emerald: { bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7' },
    amber: { bg: 'rgba(245, 158, 11, 0.18)', border: 'rgba(245, 158, 11, 0.4)', text: '#fcd34d' },
    rose: { bg: 'rgba(244, 63, 94, 0.18)', border: 'rgba(244, 63, 94, 0.4)', text: '#fda4af' },
    purple: { bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.4)', text: '#d8b4fe' },
  };
  return colors[colorName] || colors.indigo;
}

export function generateId() {
  return 'srv_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}
