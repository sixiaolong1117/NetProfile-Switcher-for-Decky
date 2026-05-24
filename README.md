# NetProfile Switcher for Decky

<div align="center">

<img src="assets/logo.svg" alt="NetProfile Switcher" width="128">

**面向 Steam Deck / SteamOS 的 Decky 网络配置预设切换插件<br/>保存并快速切换 IPv4 静态地址、网关、DNS 与 DHCP 模式**

[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)
[![Decky](https://img.shields.io/badge/Decky-Plugin-1f2937)](https://github.com/SteamDeckHomebrew/decky-loader)
[![SteamOS](https://img.shields.io/badge/SteamOS-NetworkManager-2ecc71)](https://networkmanager.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)](package.json)
[![Python](https://img.shields.io/badge/Python-Backend-3776ab)](main.py)

[English](README_EN.md) | **简体中文**

</div>

---

## 📖 简介

NetProfile Switcher for Decky 是一个用于 Steam Deck 的网络配置切换插件。它可以读取当前活动网络连接，保存常用的 IPv4 配置，并在 Decky 侧边栏中一键应用到当前连接。

适合经常在家庭网络、游戏加速器、旁路网关或需要指定 DNS 的环境之间切换的场景。你不需要反复进入桌面模式或系统网络设置页面修改参数，只要维护好预设，就可以在游戏模式中快速切换。

## 🖼️ 界面预览

![NetProfile Switcher 界面预览](assets/1.jpg)

## ✨ 功能特性

### 🌐 网络预设切换

- **多配置管理**：保存配置名称、IPv4 地址、子网掩码、网关、DNS。
- **静态 IP 预设**：将当前活动连接切换为手动 IPv4 配置。
- **DHCP 预设**：保存并应用自动获取地址的配置。
- **一键应用**：在 Decky 面板中直接应用指定配置。
- **DHCP 快捷恢复**：无需创建预设，也可以将当前连接快速切回 DHCP。
- **连接重新生效**：优先使用 `nmcli device reapply`，不可用时回退到重新连接当前配置。

### 🧭 当前网络查看

- **自动识别当前连接**：读取正在使用的以太网或 Wi-Fi 连接。
- **状态信息展示**：查看当前连接名称、配置方式、IP 地址、子网掩码、网关与 DNS。
- **手动刷新**：网络变化后可在插件面板中重新读取状态。
- **清晰错误信息**：应用失败时显示动作、退出码、命令与 `nmcli` 返回详情，方便排查问题。

### 📋 配置管理

- **添加配置**：新建静态 IP 或 DHCP 配置。
- **编辑配置**：修改已保存配置的地址、网关与 DNS。
- **删除配置**：通过确认弹窗删除不再使用的配置。
- **输入校验**：保存前校验 IPv4 地址和子网掩码格式。
- **本地保存**：配置存储在 Decky 插件设置目录中的 `profiles.json`。

### 🧩 Decky 体验

- **游戏模式内操作**：直接在 Decky 快捷访问菜单中完成网络切换。
- **中英文界面**：内置简体中文与 English 文案，并随系统语言自动选择。
- **Toast 提示**：保存、删除、应用成功或失败时给出即时反馈。
- **Root 权限声明**：插件需要修改 NetworkManager 连接配置，因此在 `plugin.json` 中声明了 `root` 标记。

## 🚀 快速开始

### 系统要求

- Steam Deck / SteamOS
- Decky Loader
- NetworkManager 与 `nmcli`
- Node.js 与 `pnpm`（仅源码构建需要）
- 切换网络配置需要 root 权限

> 应用静态 IP、网关或 DNS 时，当前网络可能会短暂断开。请确认预设参数正确，尤其是在远程调试或依赖网络连接的场景中。

### 安装

#### 🛠️ 从 GitHub Releases 获取

点击 [此处](https://github.com/sixiaolong1117/NetProfile-Switcher-for-Decky/releases/latest/download/NetProfile.Switcher.zip) 立刻下载最新版本，或在 Decky 插件上通过以下 URL 安装最新版本：

```
https://github.com/sixiaolong1117/NetProfile-Switcher-for-Decky/releases/latest/download/NetProfile.Switcher.zip
```

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

## 🏗️ 技术架构

- **前端框架**：React / TypeScript / `@decky/ui`
- **Decky API**：`@decky/api` callable 后端调用与 Toast 提示
- **后端入口**：`main.py`
- **网络控制**：NetworkManager `nmcli`
- **配置存储**：Decky 插件设置目录下的 `profiles.json`
- **国际化**：`src/i18n.ts`，内置 English 与简体中文
- **构建工具**：Rollup / Decky CLI
- **插件权限**：`debug`、`root`

## 🔒 隐私

NetProfile Switcher for Decky 不会收集、上传或分享个人信息。插件只在本机保存你创建的网络配置预设，并通过本机 `nmcli` 修改当前 NetworkManager 连接。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request：

- 反馈不同 SteamOS、Decky Loader 或 NetworkManager 版本下的兼容性问题
- 改进网络切换失败时的错误提示
- 补充更多语言文本
- 优化 Decky 面板中的交互细节
- 完善安装、打包与发布流程

## 📄 许可证

本项目基于 [BSD 3-Clause License](LICENSE) 开源。

## 🙏 致谢

- [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) — Steam Deck 插件加载器
- [decky-frontend-lib / @decky/ui](https://github.com/SteamDeckHomebrew/decky-frontend-lib) — Decky 插件前端组件库
