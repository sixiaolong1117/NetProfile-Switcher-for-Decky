declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

// ── Network Profile Types ────────────────────────────────────────

interface NetworkProfile {
  name: string;
  ip: string;
  subnet_mask: string;
  gateway: string;
  dns: string[];
  method: "manual" | "auto";
}

interface ApiResult {
  success: boolean;
  message: string;
  error_action?: string;
  error_details?: string;
  error_command?: string;
  error_code?: number;
}

interface CurrentNetwork {
  connection_name?: string;
  ip?: string;
  subnet_mask?: string;
  gateway?: string;
  dns?: string[];
  method?: string;
  error?: string;
}
