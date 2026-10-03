# AGENTS.md — Glyph Mobile (iOS & Android) Developer & Architecture Documentation

## Project Overview & Philosophy
**Glyph Mobile** is the official cross-platform mobile companion app for Glyph Desktop (`dev.glyph.mobile`). Built with Expo and React Native, it gives engineers and DevOps administrators instant, secure, and encrypted mobile access to their SSH servers, live server metrics, PTY terminal sessions with a dedicated mobile accessory keyboard, remote SFTP file browsing and code editing, Docker container management with real-time search, port-forwarding tunnels, saved command snippet launcher, and encrypted `.glyph` backup import/export.

## Workspace & Codebase Tree
```
glyph-app/
├── app.json                   # Expo application metadata, iOS/Android permissions, FaceID config
├── App.js                     # Main entry router, security lock lifecycle, modal management
├── package.json               # Dependencies and scripts (React 19, React Native, Expo 57)
├── assets/                    # Icons, adaptive icons, and splash screens
└── src/
    ├── theme/
    │   └── colors.js          # Glassmorphic dark palette tokens matching Glyph Desktop
    ├── utils/
    │   ├── crypto.js          # Master PIN hashing, AES-compatible backup encryption/decryption
    │   └── helpers.js         # Formatting helpers (bytes, uptime, OS detection, ID generation)
    ├── services/
    │   ├── vaultStorage.js    # SecureStore + AsyncStorage encrypted server vault
    │   ├── authService.js     # Biometric (Touch ID / Face ID) and Master PIN verification
    │   ├── sshService.js      # Native JSch SSH bridge (PTY shell stream, live stat deltas, SFTP, tunnels)
    │   ├── dockerService.js   # Real Docker CLI executor over SSH (start/stop/restart/rm/logs/stats/search)
    │   ├── sftpService.js     # Real SFTP Channel client (readdir, readFile, writeFile, mkdir, rm, rename)
    │   ├── snippetsService.js # Pre-configured & custom command snippet library
    │   └── tunnelService.js   # Real SSH port-forwarding tunnels manager
    ├── components/
    │   ├── OsLogo.js          # OS badge (Ubuntu, Debian, Alpine, CentOS, Arch, macOS, Windows)
    │   ├── CircularProgress.js# SVG Circular ring progress gauge for CPU, RAM, Disk, GPU
    │   ├── NetworkCard.js     # Dual RX/TX bandwidth metrics card with visual indicator arrows
    │   ├── DashboardDetailModals.js# Metric breakdown modals (Per-thread CPU load/Temps, Memory/Swap allocation, Storage & Partitions, GPU Driver Guides & Stats, Network Interfaces)
    │   ├── AddTunnelModal.js  # SSH Port-Forwarding tunnel creator modal (Local/Remote/Protocol)
    │   ├── AddSnippetModal.js # Saved snippet launcher creator modal (Name/Command/Category/Desc)
    │   ├── MetricGauge.js     # Circular/linear CPU, RAM, Disk gauge meters
    │   ├── ServerCard.js      # Glassmorphic server card with metrics, status, launch button
    │   ├── TerminalKeyboard.js# Mobile accessory keyboard toolbar (Esc, Tab, Ctrl, Alt, arrows)
    │   ├── TerminalView.js    # ANSI terminal emulator with styled text and command history
    │   ├── ContainerCard.js   # Docker container card with live state and action buttons
    │   ├── LogsModal.js       # Real-time container/system logs viewer with search & copy
    │   ├── FileItemRow.js     # SFTP file/directory row with permission badges and file icons
    │   ├── CodeEditorModal.js # Remote code & config file editor with line numbers and save
    │   └── BiometricLockView.js# Security screen with Master PIN keypad & Biometric unlock
    └── screens/
        ├── ServerListScreen.js# Main server dashboard with official Glyph logo, search, trademark header attribution, tag filters, and add FAB
        ├── ServerDetailScreen.js# Multi-tab server manager (Stats with 5-Card Circular Rings, Terminal, Docker, SFTP, Snippets, Tunnels, Secrets)
        ├── AddEditServerModal.js# Server setup with connection test, auth mode, and OS icons
        ├── SettingsScreen.js  # Trademark attribution, Open Source documentation suite (License, Contributing, Code of Conduct, Release Notes), PIN/Biometrics setup, terminal font size, desktop sync, backups
        ├── ExportModal.js     # Selective encrypted .glyph backup exporter with sharing
        └── ImportModal.js     # .glyph encrypted backup importer with master password prompt
```

## Critical Architectural Rules & Invariants
1. **Design Parity:** The UI must adhere strictly to Glyph Desktop's dark glassmorphic design language (`#0a0d14` background, translucent card overlays, glowing indigo/cyan accents).
2. **Encrypted Vault Storage:** Server credentials and secrets must be encrypted locally with Master PIN/Password hashes and biometric auth (`expo-secure-store` / `expo-local-authentication`).
3. **Backup Compatibility:** The `.glyph` backup format produced by Glyph Mobile is 100% interoperable and encrypted with Glyph Desktop.
4. **Cross-Platform Parity:** All components and features are built with standard React Native primitives and Expo modules to run seamlessly on both **Android** and **iOS**.

## CI/CD & GitHub Actions Workflows
- **Release Automation (`.github/workflows/release.yml`):**
  - **Triggers:** Push to `main` modifying `package.json`, or manual dispatch with custom tag input.
  - **Prepare Job:** Resolves version from `package.json`, detects new releases, creates and pushes git tags (`vX.X.X`).
  - **Android Build Job:** Sets up Java 17 Temurin, Node.js 20, bundles React Native Expo assets, executes Gradle `./gradlew assembleRelease bundleRelease`, packages `Glyph-Mobile-vX.X.X.apk` and `.aab`, and publishes to GitHub Releases with changelog from `RELEASE_NOTES.md`.
- **Security Guard (`.github/workflows/security-guard.yml`):**
  - Continuous AST and signature scan for malicious dropper payloads, C2 addresses, and excessive whitespace padding across all branches and pull requests.
- **Issue & PR Governance (`.github/ISSUE_TEMPLATE/` & `PULL_REQUEST_TEMPLATE.md`):** Standardized issue submission and PR checklists.

## Build, Test & Run Workflow
```bash
# Start development server
npm start

# Run on Android Emulator or connected device
npm run android

# Bundle embedded assets for Android
npm run bundle:android

# Run on iOS Simulator (macOS) or preview via Expo Go on iPhone
npm run ios

# Run web preview
npm run web
```
