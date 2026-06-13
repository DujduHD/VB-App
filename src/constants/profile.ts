import type { DefaultLicense, DevRole } from "../types/profile";

export const DEV_ROLE_OPTIONS: { value: DevRole; label: string }[] = [
  { value: "full-stack", label: "Full-Stack" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "ai-assisted", label: "AI Destekli" },
  { value: "devops", label: "DevOps" },
];

export const LICENSE_OPTIONS: { value: DefaultLicense; label: string }[] = [
  { value: "MIT", label: "MIT" },
  { value: "Apache-2.0", label: "Apache 2.0" },
  { value: "Unlicense", label: "Unlicense" },
  { value: "Proprietary", label: "Proprietary" },
];

export const DEFAULT_WORKSPACE_PATH = "~/Projects";
