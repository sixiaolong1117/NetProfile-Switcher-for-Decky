# AGENTS.md

## 项目概述

Decky 插件，用于 Steam Deck 上快速切换网络配置（IPv4 静态地址、网关、DNS、DHCP）。

## 技术栈

- **前端**：TypeScript + React + @decky/ui + @decky/api
- **后端**：Python (Decky Plugin API)
- **构建**：pnpm + Rollup (@decky/rollup)
- **网络管理**：nmcli (NetworkManager CLI)

## 开发命令

```bash
# 安装依赖
pnpm install

# 构建前端
pnpm run build

# 打包 Decky 插件 ZIP（需要先安装 Decky CLI）
mkdir -p cli
curl -L -o cli/decky https://github.com/SteamDeckHomebrew/cli/releases/latest/download/decky-linux-x86_64
chmod +x cli/decky
./.vscode/build.sh
```

## 项目结构

```
src/              # TypeScript 前端代码
  index.tsx       # 主入口，UI 组件
  i18n.ts         # 国际化（中英文）
  types.d.ts      # 类型定义
main.py           # Python 后端，NetworkManager 操作
plugin.json       # Decky 插件元数据
rollup.config.js  # Rollup 构建配置
```

## 关键约定

### 前端

- 使用 @decky/ui 组件库（ButtonItem, PanelSection, ModalRoot 等）
- 使用 @decky/api 的 `callable` 调用后端方法
- 所有字符串使用 `t()` 函数国际化
- 新增翻译键需同步更新 `en` 和 `zhCN` 对象

### 后端

- 所有网络操作通过 `nmcli -t` 执行
- 配置文件存储在 `decky.DECKY_PLUGIN_SETTINGS_DIR/profiles.json`
- 错误返回格式：`{"success": bool, "message": str, "error_action": str, "error_details": str, "error_command": str, "error_code": int}`

### 构建产物

- 前端输出到 `dist/`
- 最终插件包在 `out/` 目录
- 包含：`dist/`, `main.py`, `plugin.json`, `package.json`, `LICENSE`, README

## 注意事项

- `pnpm run test` 未配置，无测试脚本
- TypeScript 严格模式：`noUnusedLocals`, `noUnusedParameters`, `noImplicitAny` 均启用
- 构建需要 sudo 权限（Decky CLI 需要）
- 插件需要在 Steam Deck 上通过 Decky Loader 运行
