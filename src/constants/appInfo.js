import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const APP_VERSION_TAG = `v${packageJson.version}`;
export const APP_NAME = packageJson.name || 'glyph-app';
export const APP_DISPLAY_NAME = 'Glyph';
export const APP_AUTHOR = packageJson.author || 'TheLunatic1 (Salman Toha)';
export const GITHUB_REPO = 'TheLunatic1/glyph-app';
export const GITHUB_RELEASES_API = 'https://api.github.com/repos/TheLunatic1/glyph-app/releases/latest';
export const GITHUB_RELEASES_URL = 'https://github.com/TheLunatic1/glyph-app/releases/latest';
