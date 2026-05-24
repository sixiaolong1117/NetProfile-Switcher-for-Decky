type Locale = "en" | "zh-CN";
type Values = Record<string, string | number>;

const en = {
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.dismiss": "Dismiss",
  "common.error": "Error",
  "common.dhcp": "DHCP",
  "common.static": "Static",
  "common.manual": "Manual",
  "plugin.name": "NetProfile Switcher",
  "confirmDelete.title": "Confirm Delete",
  "confirmDelete.body": "Are you sure you want to delete profile \"{name}\"? This action cannot be undone.",
  "profileEditor.titleEdit": "Edit: {name}",
  "profileEditor.titleNew": "New Network Profile",
  "profileEditor.profileName": "Profile Name",
  "profileEditor.profileNamePlaceholder": "e.g. Home Network",
  "profileEditor.configurationMethod": "Configuration Method",
  "profileEditor.manualStaticIp": "Manual (Static IP)",
  "profileEditor.automaticDhcp": "Automatic (DHCP)",
  "profileEditor.ipAddress": "IP Address",
  "profileEditor.subnetMask": "Subnet Mask",
  "profileEditor.gateway": "Gateway",
  "profileEditor.dnsServers": "DNS Servers",
  "profileEditor.dnsPlaceholder": "DNS {index} (e.g. 8.8.8.8)",
  "profileEditor.addDns": "Add DNS",
  "profileEditor.saveProfile": "Save Profile",
  "profileEditor.saving": "Saving...",
  "validation.profileNameRequired": "Profile name is required",
  "validation.ipRequired": "IP address is required",
  "validation.invalidIp": "Invalid IP address",
  "validation.subnetRequired": "Subnet mask is required",
  "validation.invalidSubnet": "Invalid subnet mask",
  "validation.invalidGateway": "Invalid gateway address",
  "validation.invalidDns": "Invalid DNS address",
  "toast.profileSaved": "Profile Saved",
  "toast.profileApplied": "Profile Applied",
  "toast.dhcpApplied": "DHCP Enabled",
  "toast.applyFailed": "Apply Failed",
  "toast.applyFailedBody": "Open NetProfile Switcher for details.",
  "toast.deleted": "Deleted",
  "currentNetwork.title": "Current Network",
  "currentNetwork.loadError": "Failed to load network data. Is nmcli available?",
  "currentNetwork.loading": "Loading network info...",
  "currentNetwork.method": "Method: {method}",
  "currentNetwork.ip": "IP: {ip}",
  "currentNetwork.mask": "Mask: {mask}",
  "currentNetwork.gateway": "Gateway: {gateway}",
  "currentNetwork.dns": "DNS: {dns}",
  "currentNetwork.refresh": "Refresh",
  "currentNetwork.setDhcp": "Switch Back to DHCP",
  "currentNetwork.settingDhcp": "Switching to DHCP...",
  "applyError.title": "Apply Error",
  "applyError.lastFailed": "Last apply failed",
  "applyError.action": "Action: {action}",
  "applyError.exitCode": "Exit code: {code}",
  "applyError.details": "Details",
  "applyError.command": "Command",
  "profiles.title": "Saved Profiles",
  "profiles.addNew": "Add New Profile",
  "profiles.empty": "No profiles saved yet.",
  "profiles.emptyHelp": "Create a profile to quickly switch network configurations.",
  "actions.apply": "Apply",
  "actions.applying": "Applying...",
  "actions.edit": "Edit",
  "actions.delete": "Delete",
  "api.unknownError": "Unknown error",
  "api.frontendApplyCallFailed": "Frontend apply call failed",
  "api.frontendDhcpCallFailed": "Frontend DHCP call failed",
  "api.switchedDhcp": "Current connection switched to DHCP",
  "api.profileNameRequired": "Profile name is required",
  "api.profileSaved": "Profile '{name}' saved",
  "api.profileDeleted": "Profile '{name}' deleted",
  "api.profileNotFound": "Profile '{name}' not found",
  "api.failedToSaveProfile": "Failed to save profile",
  "api.failedToDeleteProfile": "Failed to delete profile",
  "api.noActiveConnection": "No active network connection found",
  "api.failedConnectionInfo": "Failed to get connection info: {details}",
  "api.ipRequiredManual": "IP address is required for manual profile",
  "api.invalidSubnet": "Invalid subnet mask: {subnet}",
  "api.profileApplied": "Profile '{name}' applied successfully",
  "api.actionFailed": "{action} failed",
  "api.action.clearAddress": "Clear IPv4 address",
  "api.action.clearGateway": "Clear IPv4 gateway",
  "api.action.clearDns": "Clear IPv4 DNS",
  "api.action.allowAutoDns": "Allow automatic DNS",
  "api.action.setDhcp": "Set IPv4 method to DHCP",
  "api.action.setAddress": "Set IPv4 address",
  "api.action.setGateway": "Set IPv4 gateway",
  "api.action.setDns": "Set IPv4 DNS",
  "api.action.ignoreAutoDns": "Ignore automatic DNS",
  "api.action.setManual": "Set IPv4 method to manual",
  "api.action.reactivate": "Reactivate connection",
} as const;

type TranslationKey = keyof typeof en;

const zhCN: Record<TranslationKey, string> = {
  "common.cancel": "取消",
  "common.delete": "删除",
  "common.dismiss": "关闭",
  "common.error": "错误",
  "common.dhcp": "DHCP",
  "common.static": "静态",
  "common.manual": "手动",
  "plugin.name": "网络配置切换器",
  "confirmDelete.title": "确认删除",
  "confirmDelete.body": "确定要删除配置 \"{name}\" 吗？此操作无法撤销。",
  "profileEditor.titleEdit": "编辑：{name}",
  "profileEditor.titleNew": "新建网络配置",
  "profileEditor.profileName": "配置名称",
  "profileEditor.profileNamePlaceholder": "例如：家庭网络",
  "profileEditor.configurationMethod": "配置方式",
  "profileEditor.manualStaticIp": "手动（静态 IP）",
  "profileEditor.automaticDhcp": "自动（DHCP）",
  "profileEditor.ipAddress": "IP 地址",
  "profileEditor.subnetMask": "子网掩码",
  "profileEditor.gateway": "网关",
  "profileEditor.dnsServers": "DNS 服务器",
  "profileEditor.dnsPlaceholder": "DNS {index}（例如 8.8.8.8）",
  "profileEditor.addDns": "添加 DNS",
  "profileEditor.saveProfile": "保存配置",
  "profileEditor.saving": "正在保存...",
  "validation.profileNameRequired": "请输入配置名称",
  "validation.ipRequired": "请输入 IP 地址",
  "validation.invalidIp": "IP 地址无效",
  "validation.subnetRequired": "请输入子网掩码",
  "validation.invalidSubnet": "子网掩码无效",
  "validation.invalidGateway": "网关地址无效",
  "validation.invalidDns": "DNS 地址无效",
  "toast.profileSaved": "配置已保存",
  "toast.profileApplied": "配置已应用",
  "toast.dhcpApplied": "已切回 DHCP",
  "toast.applyFailed": "应用失败",
  "toast.applyFailedBody": "打开网络配置切换器查看详情。",
  "toast.deleted": "已删除",
  "currentNetwork.title": "当前网络",
  "currentNetwork.loadError": "加载网络数据失败。nmcli 是否可用？",
  "currentNetwork.loading": "正在加载网络信息...",
  "currentNetwork.method": "方式：{method}",
  "currentNetwork.ip": "IP：{ip}",
  "currentNetwork.mask": "掩码：{mask}",
  "currentNetwork.gateway": "网关：{gateway}",
  "currentNetwork.dns": "DNS：{dns}",
  "currentNetwork.refresh": "刷新",
  "currentNetwork.setDhcp": "切回 DHCP",
  "currentNetwork.settingDhcp": "正在切回 DHCP...",
  "applyError.title": "应用错误",
  "applyError.lastFailed": "上次应用失败",
  "applyError.action": "动作：{action}",
  "applyError.exitCode": "退出码：{code}",
  "applyError.details": "详情",
  "applyError.command": "命令",
  "profiles.title": "已保存配置",
  "profiles.addNew": "添加新配置",
  "profiles.empty": "还没有保存配置。",
  "profiles.emptyHelp": "创建配置后即可快速切换网络设置。",
  "actions.apply": "应用",
  "actions.applying": "正在应用...",
  "actions.edit": "编辑",
  "actions.delete": "删除",
  "api.unknownError": "未知错误",
  "api.frontendApplyCallFailed": "前端调用应用配置失败",
  "api.frontendDhcpCallFailed": "前端调用 DHCP 切换失败",
  "api.switchedDhcp": "当前连接已切换为 DHCP",
  "api.profileNameRequired": "请输入配置名称",
  "api.profileSaved": "配置“{name}”已保存",
  "api.profileDeleted": "配置“{name}”已删除",
  "api.profileNotFound": "找不到配置“{name}”",
  "api.failedToSaveProfile": "保存配置失败",
  "api.failedToDeleteProfile": "删除配置失败",
  "api.noActiveConnection": "未找到活动网络连接",
  "api.failedConnectionInfo": "获取连接信息失败：{details}",
  "api.ipRequiredManual": "手动配置需要填写 IP 地址",
  "api.invalidSubnet": "子网掩码无效：{subnet}",
  "api.profileApplied": "配置“{name}”已成功应用",
  "api.actionFailed": "{action}失败",
  "api.action.clearAddress": "清除 IPv4 地址",
  "api.action.clearGateway": "清除 IPv4 网关",
  "api.action.clearDns": "清除 IPv4 DNS",
  "api.action.allowAutoDns": "允许自动 DNS",
  "api.action.setDhcp": "将 IPv4 方式设为 DHCP",
  "api.action.setAddress": "设置 IPv4 地址",
  "api.action.setGateway": "设置 IPv4 网关",
  "api.action.setDns": "设置 IPv4 DNS",
  "api.action.ignoreAutoDns": "忽略自动 DNS",
  "api.action.setManual": "将 IPv4 方式设为手动",
  "api.action.reactivate": "重新激活连接",
};

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en,
  "zh-CN": zhCN,
};

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";

  const candidates = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  return candidates.some((candidate) => candidate.toLowerCase().startsWith("zh")) ? "zh-CN" : "en";
}

export const locale = detectLocale();

export function t(key: TranslationKey, values: Values = {}): string {
  const template = translations[locale][key] || en[key];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}

const apiMessagePatterns: Array<[RegExp, TranslationKey, (match: RegExpMatchArray) => Values]> = [
  [/^Profile '(.+)' saved$/, "api.profileSaved", (match) => ({ name: match[1] })],
  [/^Profile '(.+)' deleted$/, "api.profileDeleted", (match) => ({ name: match[1] })],
  [/^Profile '(.+)' not found$/, "api.profileNotFound", (match) => ({ name: match[1] })],
  [/^Profile '(.+)' applied successfully$/, "api.profileApplied", (match) => ({ name: match[1] })],
  [/^Failed to get connection info: (.*)$/, "api.failedConnectionInfo", (match) => ({ details: match[1] })],
  [/^Invalid subnet mask: (.*)$/, "api.invalidSubnet", (match) => ({ subnet: match[1] })],
];

const apiMessageMap: Record<string, TranslationKey> = {
  "Profile name is required": "api.profileNameRequired",
  "Failed to save profile": "api.failedToSaveProfile",
  "Failed to delete profile": "api.failedToDeleteProfile",
  "No active network connection found": "api.noActiveConnection",
  "IP address is required for manual profile": "api.ipRequiredManual",
  "Frontend apply call failed": "api.frontendApplyCallFailed",
  "Frontend DHCP call failed": "api.frontendDhcpCallFailed",
  "Switched current connection to DHCP": "api.switchedDhcp",
};

const apiActionMap: Record<string, TranslationKey> = {
  "Clear IPv4 address": "api.action.clearAddress",
  "Clear IPv4 gateway": "api.action.clearGateway",
  "Clear IPv4 DNS": "api.action.clearDns",
  "Allow automatic DNS": "api.action.allowAutoDns",
  "Set IPv4 method to DHCP": "api.action.setDhcp",
  "Set IPv4 address": "api.action.setAddress",
  "Set IPv4 gateway": "api.action.setGateway",
  "Set IPv4 DNS": "api.action.setDns",
  "Ignore automatic DNS": "api.action.ignoreAutoDns",
  "Set IPv4 method to manual": "api.action.setManual",
  "Reactivate connection": "api.action.reactivate",
};

export function apiAction(action?: string): string {
  if (!action) return t("api.unknownError");
  const key = apiActionMap[action];
  return key ? t(key) : action;
}

export function apiMessage(message?: string, action?: string): string {
  if (!message) return t("api.unknownError");
  if (action && message === `${action} failed`) {
    return t("api.actionFailed", { action: apiAction(action) });
  }

  const exactKey = apiMessageMap[message];
  if (exactKey) return t(exactKey);

  for (const [regex, key, getValues] of apiMessagePatterns) {
    const match = message.match(regex);
    if (match) return t(key, getValues(match));
  }

  return message;
}
