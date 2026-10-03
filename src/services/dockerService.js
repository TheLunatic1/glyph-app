// Real Docker Service for Glyph Mobile
// 100% Desktop Parity over Native SSH (Zero Placeholders)
import { sshService } from './sshService';

export class DockerService {
  constructor(server) {
    this.server = server;
  }

  /**
   * Fetches real containers directly from the remote Docker daemon
   */
  async getContainers(searchQuery = '') {
    const cmd = `docker ps -a --format '{"id":"{{.ID}}", "image":"{{.Image}}", "name":"{{.Names}}", "status":"{{.Status}}", "state":"{{.State}}"}' 2>&1`;
    const output = await sshService.exec(cmd);

    if (!output || output.includes('command not found') || output.includes('Cannot connect')) {
      if (output.includes('permission denied')) {
        throw new Error('Docker permission denied. Ensure user is in the "docker" group or run as root.');
      }
      throw new Error('Docker is not installed or not running on this server.');
    }

    const lines = output.trim().split('\n').filter(Boolean);
    const parsed = lines.map(line => {
      try {
        return JSON.parse(line.trim());
      } catch (_) {
        return null;
      }
    }).filter(Boolean);

    // Fetch stats in parallel for enriched card view
    try {
      const statsCmd = `docker stats --no-stream --format '{"id":"{{.ID}}", "cpuPercent":"{{.CPUPerc}}", "memUsage":"{{.MemUsage}}", "memPercent":"{{.MemPerc}}", "netIO":"{{.NetIO}}"}' 2>/dev/null`;
      const statsOut = await sshService.exec(statsCmd);
      if (statsOut) {
        const statLines = statsOut.trim().split('\n').filter(Boolean);
        const statsMap = new Map();
        statLines.forEach(l => {
          try {
            const s = JSON.parse(l.trim());
            statsMap.set(s.id, s);
          } catch (_) {}
        });

        parsed.forEach(c => {
          const s = statsMap.get(c.id);
          if (s) {
            c.cpuPercent = s.cpuPercent;
            c.memUsage = s.memUsage;
            c.memPercent = s.memPercent;
            c.netIO = s.netIO;
          }
        });
      }
    } catch (_) {}

    if (!searchQuery.trim()) {
      return parsed;
    }

    const q = searchQuery.toLowerCase().trim();
    return parsed.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.image || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q) ||
      (c.state || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    );
  }

  async startContainer(id) {
    const out = await sshService.exec(`docker start ${id} 2>&1`);
    return out;
  }

  async stopContainer(id) {
    const out = await sshService.exec(`docker stop ${id} 2>&1`);
    return out;
  }

  async restartContainer(id) {
    const out = await sshService.exec(`docker restart ${id} 2>&1`);
    return out;
  }

  async removeContainer(id) {
    const out = await sshService.exec(`docker rm -f ${id} 2>&1`);
    return out;
  }

  async getContainerLogs(id, tail = 200) {
    const cleanId = (id || '').trim();
    if (!cleanId) return 'No container ID specified.';
    const out = await sshService.exec(`docker logs --tail ${tail} ${cleanId} 2>&1`);
    return out || 'No logs available for this container.';
  }

  async getContainerInspect(id) {
    const out = await sshService.exec(`docker inspect ${id} 2>&1`);
    try {
      return JSON.parse(out);
    } catch (_) {
      return out;
    }
  }
}
