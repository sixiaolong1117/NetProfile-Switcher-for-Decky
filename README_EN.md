# NetProfile Switcher for Decky

<div align="center">

<img src="assets/logo.svg" alt="NetProfile Switcher" width="128">

**A Decky network profile switching plugin for Steam Deck / SteamOS<br/>Save and quickly switch IPv4 static addresses, gateways, DNS, and DHCP modes**

[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)
[![Decky](https://img.shields.io/badge/Decky-Plugin-1f2937)](https://github.com/SteamDeckHomebrew/decky-loader)
[![SteamOS](https://img.shields.io/badge/SteamOS-NetworkManager-2ecc71)](https://networkmanager.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)](package.json)
[![Python](https://img.shields.io/badge/Python-Backend-3776ab)](main.py)

**English** | [简体中文](README.md)

</div>

---

## 📖 Introduction

NetProfile Switcher for Decky is a network configuration switching plugin for Steam Deck. It reads the currently active network connection, saves frequently used IPv4 configurations, and applies them to the current connection with a single tap from the Decky sidebar.

It's ideal for users who frequently switch between home networks, gaming accelerators, bypass gateways, or environments that require specific DNS settings. You no longer need to repeatedly enter Desktop Mode or navigate through system network settings — just maintain your presets and switch between them directly in Game Mode.

## 🖼️ Screenshot

![NetProfile Switcher Screenshot](assets/1.jpg)

## ✨ Features

### 🌐 Network Profile Switching

- **Multi-profile management**: Save profile names, IPv4 addresses, subnet masks, gateways, and DNS.
- **Static IP profiles**: Switch the active connection to a manual IPv4 configuration.
- **DHCP profiles**: Save and apply auto-configuration profiles.
- **One-tap apply**: Apply any saved configuration directly from the Decky panel.
- **Quick DHCP restore**: Revert the current connection back to DHCP without needing a saved preset.
- **Connection reapply**: Uses `nmcli device reapply` when available, falling back to reconnecting the current profile.

### 🧭 Current Network Viewer

- **Auto-detect active connection**: Reads the Ethernet or Wi-Fi connection currently in use.
- **Status display**: View the current connection name, configuration method, IP address, subnet mask, gateway, and DNS.
- **Manual refresh**: Re-read the network status from the plugin panel after network changes.
- **Clear error messages**: On failure, displays the action, exit code, command, and `nmcli` output details for easy troubleshooting.

### 📋 Profile Management

- **Add profile**: Create a new static IP or DHCP profile.
- **Edit profile**: Modify saved addresses, gateways, and DNS settings.
- **Delete profile**: Remove unused profiles via a confirmation dialog.
- **Input validation**: Validates IPv4 address and subnet mask format before saving.
- **Local storage**: Profiles are saved in `profiles.json` within the Decky plugin settings directory.

### 🧩 Decky Experience

- **In-Game Mode operation**: Switch network configurations directly from the Decky Quick Access menu.
- **Bilingual interface**: Built-in English and Simplified Chinese text, auto-selected based on system language.
- **Toast notifications**: Instant feedback on save, delete, apply success, or failure.
- **Root permission declaration**: The plugin needs to modify NetworkManager connection profiles, so the `root` flag is declared in `plugin.json`.

## 🚀 Quick Start

### System Requirements

- Steam Deck / SteamOS
- Decky Loader
- NetworkManager with `nmcli`
- Node.js and `pnpm` (source build only)
- Root privileges required for switching network configurations

> When applying static IP, gateway, or DNS settings, the current network may briefly disconnect. Make sure your preset parameters are correct, especially in remote debugging or network-dependent scenarios.

### Installation

#### 🛠️ Get from GitHub Releases



#### 🛠️ Build from Source

1. Clone the repository:

```bash
git clone https://github.com/sixiaolong1117/NetProfile-Switcher-for-Decky.git
cd NetProfile-Switcher-for-Decky
```

2. Install dependencies and build the frontend:

```bash
pnpm install
pnpm run build
```

3. To package the Decky plugin ZIP, prepare the Decky CLI first, then run the build script:

```bash
mkdir -p cli
curl -L -o cli/decky https://github.com/SteamDeckHomebrew/cli/releases/latest/download/decky-linux-x86_64
chmod +x cli/decky
./.vscode/build.sh
```

Build output will be placed in the `out/` directory. The Decky distribution package includes `dist/`, `main.py`, `plugin.json`, `package.json`, `LICENSE`, and README files. You can also run the provided setup and build tasks directly in VS Code / VSCodium.

## 📖 Usage Guide

### ➕ Add a Static Network Profile

1. Open **Network Profile Switcher** from the Decky menu.
2. Click **Add New Profile**.
3. Enter a profile name, e.g., "Home Network" or "Lab Gateway".
4. Select **Manual (Static IP)**.
5. Fill in IP address, subnet mask, gateway, and DNS.
6. Click **Save Profile**.

### 🔁 Switching Profiles

| Action | Description |
|--------|-------------|
| Apply | Apply the selected profile to the current active connection |
| Edit | Modify a saved network preset |
| Delete | Remove an unused network preset |
| Refresh | Re-read the current network status |
| Revert to DHCP | Restore the current connection to DHCP addressing and automatic DNS |

### 🧯 Troubleshooting Apply Failures

When applying fails, the plugin displays error details in the panel:

| Field | Description |
|-------|-------------|
| Action | The step where the failure occurred, e.g., setting IPv4 address or reactivating the connection |
| Exit Code | The return code from the `nmcli` command |
| Details | Error message returned by NetworkManager |
| Command | The `nmcli` command executed by the plugin |

Common causes include: no active network connection, the target connection does not support modification, invalid IP or subnet parameters, NetworkManager refusing to reconnect, or the switched network parameters being unable to reach the current network.

## 🏗️ Architecture

- **Frontend framework**: React / TypeScript / `@decky/ui`
- **Decky API**: `@decky/api` callable backend calls and Toast notifications
- **Backend entry point**: `main.py`
- **Network control**: NetworkManager `nmcli`
- **Configuration storage**: `profiles.json` in the Decky plugin settings directory
- **Internationalization**: `src/i18n.ts`, built-in English and Simplified Chinese
- **Build tools**: Rollup / Decky CLI
- **Plugin permissions**: `debug`, `root`

## 🔒 Privacy

NetProfile Switcher for Decky does not collect, upload, or share personal information. The plugin only stores your created network configuration presets locally and modifies the current NetworkManager connection via local `nmcli`.

## 🤝 Contributing

Issues and Pull Requests are welcome:

- Report compatibility issues across different SteamOS, Decky Loader, or NetworkManager versions
- Improve error messages when network switching fails
- Add translations for more languages
- Refine interaction details in the Decky panel
- Improve installation, packaging, and release workflows

## 📄 License

This project is open-sourced under the [BSD 3-Clause License](LICENSE).

## 🙏 Acknowledgments

- [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) — Steam Deck plugin loader
- [decky-frontend-lib / @decky/ui](https://github.com/SteamDeckHomebrew/decky-frontend-lib) — Decky plugin frontend component library
