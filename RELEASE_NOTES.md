## v1.0.1 — In-App Update System, Automated Versioning & Safe Area Inset Fixes

### What's New & Improvements

- **In-App Update Notification System (Desktop Parity):**
  - **Automated Background Check:** Performs a lightweight, silent check against official GitHub Releases on startup.
  - **Release Notes & APK Modal:** Shows a glassmorphic update dialog with changelog details, release date, download size, direct 1-tap APK download button, and GitHub release link.
  - **Header Notification Pill:** Displays an interactive `⚡ Update: vX.X.X` badge on the dashboard when a newer release is detected.
  - **Manual Update Checker:** Added an "App Updates & Releases" section in Settings with live check status, spinner feedback, and version verification.
- **Automated Single-Source Versioning:**
  - Dynamic `package.json` single source of truth across all mobile screens (`ServerListScreen`, `SettingsScreen`) and app constants.
  - Gradle `android/app/build.gradle` now parses `versionName` and calculates `versionCode` automatically from `package.json` at build time.
- **Status Bar & Notch Clearance:**
  - Resolved status bar and notch/cutout overlaps across all Android devices (Xiaomi, Samsung OneUI, OnePlus OxygenOS, Google Pixel). Screen headers, server title banners, OS badges, and back navigation controls now dynamically adapt to `StatusBar.currentHeight` and safe area top insets.
- **3-Button Navigation Bar Compatibility:**
  - Added dynamic bottom safe insets across the connected server hub navigation tabs (`Stats`, `Terminal`, `Docker`, `SFTP`, `Snippets`, `Tunnels`, `Secrets`) and all action modals, preventing Android system buttons (`◀`, `●`, `■`) and gesture home indicators from covering navigation controls.
- **Settings & Vault Polish:**
  - Updated the Settings screen and modal action sheets with adaptive top and bottom padding for consistent edge-to-edge layout rendering.
- **Bundle & Asset Optimization:**
  - Recompiled production embedded JS bundle and native assets.