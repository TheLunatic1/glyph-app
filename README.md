# Glyph Mobile

Glyph Mobile is the official cross-platform mobile companion app for **Glyph Desktop** (`dev.glyph.mobile`). Built with Expo and React Native, Glyph Mobile gives system administrators, DevOps engineers, and developers instant, secure, encrypted mobile access to their SSH servers, live hardware telemetry, interactive PTY terminal sessions, remote SFTP file browsing and code editing, Docker container management, port-forwarding tunnels, and encrypted backup vaults.

---

## Features

### 1. Live Hardware Telemetry & Interactive Breakdown Modals
* **5-Metric Real-Time Dashboard:** SVG circular gauge meters for CPU Usage, Memory Usage, Disk Usage, GPU Detection & Usage, and Dual RX/TX Network Bandwidth.
* **Per-Thread CPU Load:** Detailed 1m, 5m, 15m load averages, active/sleeping task counts, per-thread load meters (`cpu0`..`cpuN`), and thermal sensor diagnostic status.
* **Memory & Swap Breakdown:** Total RAM, Used, Buff/Cache, Free RAM allocation with dynamic progress bars, plus live Swap partition metrics.
* **Storage & Partitions:** Live filesystem mount table (`/`, `/boot`, `/run`, `/boot/efi`, etc.) with partition capacity and mount devices.
* **Multi-Vendor GPU Diagnostics:** Automatic probe for NVIDIA (`nvidia-smi`), AMD (`/sys/class/drm` / `rocm-smi`), and Intel GPUs (`intel_gpu_top`) with 1-click driver installation guidance.
* **Network Interfaces:** Multi-interface throughput table (`lo`, `ens3`, `docker0`, `br-*`, `veth*`) showing real-time `↓ Speed`, `↑ Speed`, and `Total RX` transfer volume.

### 2. Interactive Terminal & Mobile Keyboard Toolbar
* **ANSI Terminal Emulator:** Full-fidelity streaming PTY terminal over native SSH.
* **Mobile Accessory Keys:** Quick-access accessory bar including `ESC`, `TAB`, `CTRL`, `ALT`, `^C`, `^Z`, `^D`, `|`, `/`, and arrow keys.
* **Customizable Typography:** In-app font size adjustments with instant persistence.

### 3. Remote SFTP File Manager & Code Editor
* **Directory Browser:** Traverse remote directories with permission badges, file size formatting, and search.
* **Native Streaming Downloads:** Download remote files directly to mobile with system share sheets.
* **Built-in Code Editor:** Edit remote configuration files and scripts with line numbers, monospaced font, and instant remote save.

### 4. Docker Container Management
* **Real-time Search:** Instant search across container Names, Images, IDs, and States.
* **Daemon Controls:** Start, Stop, Restart, and Remove containers with 1 tap.
* **Streaming Logs Viewer:** Full container log terminal with search filter and clipboard copy.

### 5. Tunnels & Secrets Vault
* **SSH Port Forwarding:** Forward internal remote ports to your local mobile interface with 1-click toggles.
* **Encrypted Secrets Injection:** Store sensitive environment variables and passwords, securely injecting them into terminal sessions without manual typing.

### 6. Security & Interoperability
* **Biometric Authentication:** Face ID / Touch ID hardware unlock and optional Master PIN.
* **Desktop Vault Interoperability:** Export and import AES-256-GCM encrypted `.glyph` backup files fully compatible with Desktop Glyph.

---

## Getting Started

### Prerequisites
* Node.js v18 or newer
* npm / yarn
* Android SDK (for Android build) / Xcode (for iOS build on macOS)

### Installation
```bash
# Clone the repository
git clone https://github.com/TheLunatic1/glyph-app.git
cd glyph-app

# Install dependencies
npm install

# Start Metro development server
npm start
```

### Running on Devices & Emulators
```bash
# Run on Android
npm run android

# Run on iOS Simulator (macOS)
npm run ios
```

---

## Author & Attribution

**Designed & Developed by:**
* **TheLunatic1 (Salman Toha)** — [GitHub Profile](https://github.com/TheLunatic1) • [Glyph Desktop Repository](https://github.com/TheLunatic1/Glyph)

---

## License

Glyph Mobile is open source software licensed under the [Apache License, Version 2.0](LICENSE).  
See the [NOTICE](NOTICE) file for required attribution terms.
