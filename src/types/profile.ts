export type DevRole =
  | "full-stack"
  | "frontend"
  | "backend"
  | "ai-assisted"
  | "devops";

export type DefaultLicense = "MIT" | "Apache-2.0" | "Proprietary" | "Unlicense";

export type AvatarSource = "none" | "url" | "file";

export interface ProfileIdentity {
  avatarUrl: string;
  avatarSource: AvatarSource;
  name: string;
  website: string;
  role: DevRole;
}

export interface ProfileBranding {
  defaultLicense: DefaultLicense;
  copyrightText: string;
}

export interface ProfileWorkspace {
  defaultPath: string;
  terminalCommand: string;
  sshKeyPath: string;
}

export interface ProfileGitCloud {
  githubUsername: string;
  githubPAT: string;
  gistSyncId: string;
}

export interface ProfileAiPreferences {
  globalRules: string;
  customPromptContext: string;
}

export interface ProfileMetrics {
  totalSpawns: number;
  topFramework: string;
  totalFocusTime: number;
}

export interface UserProfile {
  identity: ProfileIdentity;
  branding: ProfileBranding;
  workspace: ProfileWorkspace;
  gitCloud: ProfileGitCloud;
  aiPreferences: ProfileAiPreferences;
  metrics: ProfileMetrics;
}

export type ProfileSection = keyof UserProfile;
