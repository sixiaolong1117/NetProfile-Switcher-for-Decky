# NetProfile Switcher for Decky

<div align="center">

<img src="assets/logo.png" alt="NetProfile Switcher" width="128">

**面向 Steam Deck / SteamOS 的 Decky 网络配置预设切换插件<br/>保存并快速切换 IPv4 静态地址、网关、DNS 与 DHCP 模式**

[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)
[![Decky](https://img.shields.io/badge/Decky-Plugin-1f2937)](https://github.com/SteamDeckHomebrew/decky-loader)
[![SteamOS](https://img.shields.io/badge/SteamOS-NetworkManager-2ecc71)](https://networkmanager.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-Backend-3776ab)](https://www.python.org/)

[English](README_EN.md) | **简体中文**

</div>

---

## 📖 简介

NetProfile Switcher for Decky 是一款面向 Steam Deck 桌面的网络配置预设工具。它可以保存不同的网络配置（IPv4 地址、子网掩码、网关与 DNS），并在需要时一键切换到指定配置。

适合经常在家庭网络、游戏加速器、旁路网关或需要指定 DNS 的环境之间切换的场景。你不需要反复进入 SteamOS 系统设置手动修改网络参数，只要维护好预设，点击即可应用。

## 🖼️ 界面预览

![NetProfile Switcher 界面预览](assets/1.jpg)

## ✨ 功能特性

### 🌐 网络预设切换

- **多配置管理**：保存配置名称、IPv4 地址、子网掩码、网关、DNS。
- **一键应用**：在 Decky 面板中直接应用指定配置。
- **DHCP 快捷恢复**：无需创建预设，也可以将当前连接快速切回 DHCP。
- **连接重新生效**：优先使用 `nmcli device reapply`，不可用时回退到重新连接当前配置。
- **显示当前连接信息**：读取正在使用的以太网或 Wi-Fi 连接。查看当前连接名称、配置方式、IP 地址、子网掩码、网关与 DNS。
- **游戏模式内操作**：直接在 Decky 快捷访问菜单中完成网络切换。

## 🚀 快速开始

### 系统要求

- Steam Deck / SteamOS
- Decky Loader

> 应用静态 IP、网关或 DNS 时，当前网络可能会短暂断开。请确认预设参数正确，尤其是在远程调试或依赖网络连接的场景中。

### 安装

#### 🛠️ 从 GitHub Releases 获取

从 [GitHub Releases](https://github.com/sixiaolong1117/NetProfile-Switcher-for-Decky/releases/) 下载最新的 `.zip` 安装包，传输至 SteamDeck，打开 Dekcy 插件的开发者模式，选择 `从 ZIP 压缩文件安装插件`。

<!-- 点击 [此处](https://github.com/sixiaolong1117/NetProfile-Switcher-for-Decky/releases/latest/download/NetProfile.Switcher.zip) 立刻下载最新版本，或在 Decky 插件上通过以下 URL 安装最新版本：

```
https://github.com/sixiaolong1117/NetProfile-Switcher-for-Decky/releases/latest/download/NetProfile.Switcher.zip
``` -->

#### 🛠️ 从源码构建

1. 克隆仓库：

```bash
git clone https://github.com/sixiaolong1117/NetProfile-Switcher-for-Decky.git
cd NetProfile-Switcher-for-Decky
```

2. 安装依赖并构建前端：

```bash
pnpm install
pnpm run build
```

3. 如需打包 Decky 插件 ZIP，可先准备 Decky CLI，再运行构建脚本：

```bash
mkdir -p cli
curl -L -o cli/decky https://github.com/SteamDeckHomebrew/cli/releases/latest/download/decky-linux-x86_64
chmod +x cli/decky
./.vscode/build.sh
```

构建产物会输出到 `out/` 目录。用于 Decky 分发的包会包含 `dist/`、`main.py`、`plugin.json`、`package.json`、`LICENSE` 与 README 文件。也可以在 VS Code / VSCodium 中直接运行仓库提供的 setup 与 build 任务。

## 📖 使用指南

### ➕ 添加静态网络配置

1. 打开 Decky 菜单中的 **网络配置切换器**。
2. 点击 **添加新配置**。
3. 填写配置名称，例如“家庭网络”或“实验室网关”。
4. 选择 **手动（静态 IP）**。
5. 填写 IP 地址、子网掩码、网关与 DNS。
6. 点击 **保存配置**。

### 🔁 切换配置

| 操作 | 说明 |
|------|------|
| 应用 | 将指定配置应用到当前活动连接 |
| 编辑 | 修改已保存的网络预设 |
| 删除 | 删除不再使用的网络预设 |
| 刷新 | 重新读取当前网络状态 |
| 切回 DHCP | 将当前连接恢复为 DHCP 地址与自动 DNS |

### 🧯 排查应用失败

应用失败时，插件会在面板中显示错误详情：

| 字段 | 说明 |
|------|------|
| 动作 | 失败发生在哪一步，例如设置 IPv4 地址或重新激活连接 |
| 退出码 | `nmcli` 命令的返回码 |
| 详情 | NetworkManager 返回的错误信息 |
| 命令 | 插件执行的 `nmcli` 命令 |

常见原因包括：当前没有活动网络连接、目标连接不支持修改、IP 或子网参数无效、NetworkManager 拒绝重连，或切换后的网络参数无法连通当前网络。

## 🔒 隐私

NetProfile Switcher for Decky 不会收集、上传或分享个人信息。插件只在本机保存你创建的网络配置预设，并通过本机 `nmcli` 修改当前 NetworkManager 连接。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。

## 📄 许可证

本项目基于 [BSD 3-Clause License](LICENSE) 开源。

## 🙏 致谢

- [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) — Steam Deck 插件加载器
- [decky-frontend-lib / @decky/ui](https://github.com/SteamDeckHomebrew/decky-frontend-lib) — Decky 插件前端组件库
