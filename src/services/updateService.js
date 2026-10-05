// Glyph Mobile - In-App Update Checker Service
// Queries GitHub Releases API with semver comparison & asset resolution
import {
  APP_VERSION,
  APP_VERSION_TAG,
  GITHUB_RELEASES_API,
  GITHUB_RELEASES_URL
} from '../constants/appInfo';

/**
 * Parses semantic version string into major, minor, patch numbers
 * e.g. "v1.0.1" -> { major: 1, minor: 0, patch: 1 }
 */
export function parseSemver(str) {
  if (!str) return { major: 0, minor: 0, patch: 0 };
  const clean = String(str).replace(/^v/i, '').trim();
  const parts = clean.split('.').map(p => parseInt(p, 10) || 0);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

/**
 * Compares two semantic versions.
 * Returns true if remote is strictly newer than local.
 */
export function isNewerVersion(remoteTag, localTag = APP_VERSION_TAG) {
  const remote = parseSemver(remoteTag);
  const local = parseSemver(localTag);

  if (remote.major > local.major) return true;
  if (remote.major < local.major) return false;

  if (remote.minor > local.minor) return true;
  if (remote.minor < local.minor) return false;

  return remote.patch > local.patch;
}

/**
 * Checks GitHub for latest published release of Glyph Mobile
 * @returns {Promise<{
 *   updateAvailable: boolean,
 *   currentVersion: string,
 *   latestVersion: string,
 *   title: string,
 *   releaseNotes: string,
 *   releaseDate: string,
 *   downloadUrl: string,
 *   releaseUrl: string,
 *   apkName: string,
 *   apkSize: number | null
 * }>}
 */
export async function checkForAppUpdate() {
  try {
    const res = await fetch(GITHUB_RELEASES_API, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Glyph-Mobile-App'
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const release = await res.json();
    const remoteTag = release.tag_name || release.name || '';
    const hasUpdate = isNewerVersion(remoteTag, APP_VERSION_TAG);

    // Find attached Android APK in release assets
    let apkAsset = null;
    if (Array.isArray(release.assets)) {
      apkAsset = release.assets.find(a => 
        a.name?.endsWith('.apk') || 
        a.content_type === 'application/vnd.android.package-archive'
      );
    }

    const downloadUrl = apkAsset?.browser_download_url || release.html_url || GITHUB_RELEASES_URL;

    return {
      updateAvailable: hasUpdate,
      currentVersion: APP_VERSION_TAG,
      latestVersion: remoteTag.startsWith('v') ? remoteTag : `v${remoteTag}`,
      title: release.name || `Release ${remoteTag}`,
      releaseNotes: release.body || 'No release notes provided for this version.',
      releaseDate: release.published_at,
      downloadUrl,
      releaseUrl: release.html_url || GITHUB_RELEASES_URL,
      apkName: apkAsset?.name || 'Glyph-Mobile.apk',
      apkSize: apkAsset?.size || null
    };
  } catch (error) {
    console.warn('[UpdateService] Check for update failed:', error.message || error);
    return {
      updateAvailable: false,
      currentVersion: APP_VERSION_TAG,
      latestVersion: APP_VERSION_TAG,
      error: error.message || String(error)
    };
  }
}
