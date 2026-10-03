## v1.0.0 — Initial Mobile Release: Live Telemetry, Terminal, SFTP, Docker & Encrypted Vault

### What's New & Core Capabilities

- **Real-Time 5-Metric Telemetry:** Live hardware dashboard featuring CPU Usage, Memory Usage, Disk Usage, GPU Detection & Usage, and Network Speed in/out gauges with animated SVG progress rings.
- **Interactive Hardware Breakdown Modals:** 
  - **CPU Details:** Real-time 1m, 5m, 15m load averages, active/sleeping task counts, per-thread load bars (`cpu0`..`cpuN`), and thermal sensors status with driver guidance (`lm-sensors`).
  - **Memory & Swap Details:** Total RAM, Used, Buff/Cache, Free RAM breakdown with color-coded bars, plus Swap partition metrics.
  - **Storage & Partitions:** Live filesystem mount table (`/`, `/boot`, `/run`, `/boot/efi`, etc.) with partition sizes, free space, and device paths.
  - **GPU Details & Driver Setup:** Multi-vendor probe (NVIDIA `nvidia-smi`, AMD `/sys/class/drm`, Intel GPU) with 1-click driver installation guidance (`nvidia-utils-535`, `rocm-smi`, `intel-gpu-tools`).
  - **Network Interfaces:** Multi-interface bandwidth table (`lo`, `ens3`, `docker0`, bridges `br-*`, and `veth*`) with live transfer speeds and accumulated RX volumes.
- **Interactive Terminal & Mobile Accessory Bar:** ANSI terminal with mobile helper bar (ESC, TAB, CTRL, ALT, ^C, ^Z, ^D, arrows, pipe `|`, slash `/`) for effortless mobile shell sessions.
- **Remote SFTP File Browser & Code Editor:** Directory explorer, streaming file downloads with native system share sheets, and remote code/config editor with line numbers and instant save.
- **Docker Container Management:** Real-time search by container name, ID, or image, live start/stop/restart/remove controls, and streaming container logs viewer with search & clipboard copy.
- **SSH Tunnels & Secrets:** Port-forwarding tunnel manager and encrypted server secrets vault with terminal auto-injection.
- **Encrypted Backup Vault:** AES-256-GCM master-password encrypted backup import and export compatible with Desktop Glyph.
- **Security & Privacy:** Biometric lock (Face ID / Touch ID) and Master PIN authentication safeguarding all credentials locally.
