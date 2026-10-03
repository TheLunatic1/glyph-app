// Real SFTP Service for Glyph Mobile
// 100% Desktop Parity over Native SFTP (Zero Placeholders)
import { sshService } from './sshService';

export class SFTPService {
  constructor(server) {
    this.server = server;
    this.currentPath = '/root';
  }

  /**
   * Lists files in the remote directory using real SFTP
   */
  async listFiles(path = this.currentPath) {
    this.currentPath = path;
    const rawList = await sshService.sftpReaddir(path);
    
    // Sort: directories first, then alphabetical
    return rawList.sort((a, b) => {
      const aIsDir = a.isDirectory || a.type === 'directory';
      const bIsDir = b.isDirectory || b.type === 'directory';
      if (aIsDir === bIsDir) {
        return (a.name || a.filename || '').localeCompare(b.name || b.filename || '');
      }
      return aIsDir ? -1 : 1;
    });
  }

  /**
   * Reads real remote file content via SFTP
   */
  async readFile(filePath) {
    return await sshService.sftpReadFile(filePath);
  }

  /**
   * Saves / uploads file content to remote file via SFTP
   */
  async saveFile(filePath, newContent) {
    return await sshService.sftpWriteFile(filePath, newContent);
  }

  /**
   * Creates a new remote directory
   */
  async createFolder(parentPath, folderName) {
    const fullPath = `${parentPath === '/' ? '' : parentPath}/${folderName}`;
    await sshService.sftpMkdir(fullPath);
    return await this.listFiles(parentPath);
  }

  /**
   * Deletes a remote file or folder
   */
  async deleteItem(parentPath, itemName, isDirectory = false) {
    const fullPath = `${parentPath === '/' ? '' : parentPath}/${itemName}`;
    await sshService.sftpDelete(fullPath, isDirectory);
    return await this.listFiles(parentPath);
  }

  /**
   * Renames a remote file or folder
   */
  async renameItem(oldPath, newPath) {
    await sshService.sftpRename(oldPath, newPath);
    const parent = oldPath.substring(0, oldPath.lastIndexOf('/')) || '/';
    return await this.listFiles(parent);
  }

  /**
   * Downloads a remote file directly to local filesystem storage
   */
  async downloadFile(remotePath, localPath) {
    return await sshService.sftpDownloadFile(remotePath, localPath);
  }

  /**
   * Uploads a local file to remote SFTP path
   */
  async uploadFile(localPath, remotePath) {
    return await sshService.sftpUploadFile(localPath, remotePath);
  }
}
