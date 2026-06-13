import type {
  DefaultLicense,
  DevRole,
  ProfileAiPreferences,
  ProfileBranding,
  ProfileGitCloud,
  ProfileIdentity,
  ProfileMetrics,
  ProfileSection,
  ProfileWorkspace,
  UserProfile,
} from "../types/profile";
import { DEFAULT_WORKSPACE_PATH } from "../constants/profile";

const PROFILE_KEY = "vb-user-profile";
const GITHUB_PAT_KEY = "vb-github-pat";

export const DEFAULT_USER_PROFILE: UserProfile = {
  identity: {
    avatarUrl: "",
    avatarSource: "none",
    name: "VeliDevo",
    website: "",
    role: "full-stack",
  },
  branding: {
    defaultLicense: "MIT",
    copyrightText: "",
  },
  workspace: {
    defaultPath: DEFAULT_WORKSPACE_PATH,
    terminalCommand: "alacritty",
    sshKeyPath: "~/.ssh/id_rsa",
  },
  gitCloud: {
    githubUsername: "",
    githubPAT: "",
    gistSyncId: "",
  },
  aiPreferences: {
    globalRules: "",
    customPromptContext: "",
  },
  metrics: {
    totalSpawns: 0,
    topFramework: "—",
    totalFocusTime: 0,
  },
};

function isDevRole(v: unknown): v is DevRole {
  return (
    v === "full-stack" ||
    v === "frontend" ||
    v === "backend" ||
    v === "ai-assisted" ||
    v === "devops"
  );
}

function isLicense(v: unknown): v is DefaultLicense {
  return (
    v === "MIT" ||
    v === "Apache-2.0" ||
    v === "Proprietary" ||
    v === "Unlicense"
  );
}

function mergeSection<T>(defaults: T, partial: unknown): T {
  if (!partial || typeof partial !== "object") return { ...defaults };
  return { ...defaults, ...(partial as Partial<T>) };
}

export function loadUserProfile(): UserProfile {
  if (typeof localStorage === "undefined") return { ...DEFAULT_USER_PROFILE };

  const pat = localStorage.getItem(GITHUB_PAT_KEY) ?? "";

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_USER_PROFILE,
        gitCloud: { ...DEFAULT_USER_PROFILE.gitCloud, githubPAT: pat },
      };
    }

    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    const identity = mergeSection(DEFAULT_USER_PROFILE.identity, parsed.identity);
    const branding = mergeSection(DEFAULT_USER_PROFILE.branding, parsed.branding);
    const workspace = mergeSection(
      DEFAULT_USER_PROFILE.workspace,
      parsed.workspace,
    );
    const gitCloud = mergeSection(DEFAULT_USER_PROFILE.gitCloud, parsed.gitCloud);
    const aiPreferences = mergeSection(
      DEFAULT_USER_PROFILE.aiPreferences,
      parsed.aiPreferences,
    );
    const metrics = mergeSection(DEFAULT_USER_PROFILE.metrics, parsed.metrics);

    return {
      identity: {
        ...identity,
        role: isDevRole(identity.role) ? identity.role : "full-stack",
        avatarSource:
          identity.avatarSource === "url" || identity.avatarSource === "file"
            ? identity.avatarSource
            : identity.avatarUrl.startsWith("data:")
              ? "file"
              : identity.avatarUrl.trim()
                ? "url"
                : "none",
      } as ProfileIdentity,
      branding: {
        ...branding,
        defaultLicense: isLicense(branding.defaultLicense)
          ? branding.defaultLicense
          : "MIT",
      } as ProfileBranding,
      workspace: workspace as ProfileWorkspace,
      gitCloud: {
        ...gitCloud,
        githubPAT: pat,
      } as ProfileGitCloud,
      aiPreferences: aiPreferences as ProfileAiPreferences,
      metrics: {
        totalSpawns:
          typeof metrics.totalSpawns === "number" ? metrics.totalSpawns : 0,
        topFramework:
          typeof metrics.topFramework === "string"
            ? metrics.topFramework
            : "—",
        totalFocusTime:
          typeof metrics.totalFocusTime === "number"
            ? metrics.totalFocusTime
            : 0,
      } as ProfileMetrics,
    };
  } catch {
    return {
      ...DEFAULT_USER_PROFILE,
      gitCloud: { ...DEFAULT_USER_PROFILE.gitCloud, githubPAT: pat },
    };
  }
}

export function saveUserProfile(profile: UserProfile): void {
  const { githubPAT, ...gitCloudRest } = profile.gitCloud;
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({ ...profile, gitCloud: gitCloudRest }),
  );
  localStorage.setItem(GITHUB_PAT_KEY, githubPAT);
}

export function profileSection<K extends ProfileSection>(
  profile: UserProfile,
  section: K,
): UserProfile[K] {
  return profile[section];
}
