import { invoke } from "@tauri-apps/api/core";
import type { AddCicdResult } from "../types/cicd";
import type { InjectEnvResult } from "../types/envVault";
import type { InjectMediaResult } from "../types/media";
import type { NewProjectForm, ProjectAnalysis, TimeCapsuleProject } from "../types/project";
import type { UserProfile } from "../types/profile";

export interface CreateProjectResult {
  project: TimeCapsuleProject;
  logs: string[];
  prompt: string;
}

export interface WakeProjectResult {
  logs: string[];
  prompt: string;
}

export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

export interface StagedLogo {
  path: string;
  fileName: string;
}

function toProfilePayload(profile: UserProfile) {
  return {
    identityName: profile.identity.name,
    identityWebsite: profile.identity.website,
    defaultLicense: profile.branding.defaultLicense,
    copyrightText: profile.branding.copyrightText,
    defaultPath: profile.workspace.defaultPath,
    terminalCommand: profile.workspace.terminalCommand,
    sshKeyPath: profile.workspace.sshKeyPath,
    githubUsername: profile.gitCloud.githubUsername,
    githubPat: profile.gitCloud.githubPAT,
    globalRules: profile.aiPreferences.globalRules,
    customPromptContext: profile.aiPreferences.customPromptContext,
  };
}

function toRustPayload(
  form: NewProjectForm,
  existingProjectPath?: string | null,
) {
  return {
    identity: {
      name: form.identity.name,
      slogan: form.identity.slogan,
      logoUrl: form.identity.logoUrl,
      logoFilePath: form.identity.logoFilePath,
      logoFileName: form.identity.logoFileName,
      logoSource: form.identity.logoSource,
    },
    platform: form.platform,
    framework: form.framework,
    packageManager: form.packageManager,
    aiTool: form.aiTool,
    integrations: {
      baasProvider: form.integrations.baasProvider,
      databaseUrl: form.integrations.databaseUrl,
      databaseToken: form.integrations.databaseToken,
      databaseSecret: form.integrations.databaseSecret,
      supabaseUrl: form.integrations.supabaseUrl,
      supabaseAnonKey: form.integrations.supabaseAnonKey,
      supabaseServiceKey: form.integrations.supabaseServiceKey,
      firebaseApiKey: form.integrations.firebaseApiKey,
      firebaseAuthDomain: form.integrations.firebaseAuthDomain,
      firebaseProjectId: form.integrations.firebaseProjectId,
      firebaseAppId: form.integrations.firebaseAppId,
      dockerEnabled: form.integrations.dockerEnabled,
    },
    vibe: {
      uiUxTool: form.vibe.uiUxTool,
      musicProvider: form.vibe.musicProvider,
    },
    launch: {
      deployTarget: form.launch.deployTarget,
      gitEnabled: form.launch.gitEnabled,
      openGithub: form.launch.openGithub,
    },
    ...(existingProjectPath?.trim()
      ? { existingProjectPath: existingProjectPath.trim() }
      : {}),
  };
}

export async function loadTimeCapsule(): Promise<TimeCapsuleProject[]> {
  if (!isTauri()) return [];
  return invoke<TimeCapsuleProject[]>("load_time_capsule");
}

export async function checkDependencies(
  form: NewProjectForm,
): Promise<string[]> {
  if (!isTauri()) return [];
  return invoke<string[]>("check_dependencies", {
    request: toRustPayload(form),
  });
}

export async function installDependencies(
  form: NewProjectForm,
  targets: string[],
): Promise<string[]> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<string[]>("install_dependencies", {
    request: toRustPayload(form),
    targets,
  });
}

export async function createProject(
  form: NewProjectForm,
  musicQuery: string,
  userProfile: UserProfile,
  existingProjectPath?: string | null,
): Promise<CreateProjectResult> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<CreateProjectResult>("create_project", {
    request: toRustPayload(form, existingProjectPath),
    musicQuery,
    userProfile: toProfilePayload(userProfile),
  });
}

export async function wakeProject(
  id: string,
  musicQuery: string,
  customPromptContext: string,
): Promise<WakeProjectResult> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<WakeProjectResult>("wake_project", {
    request: { id, musicQuery, customPromptContext },
  });
}

export async function previewPrompt(form: NewProjectForm): Promise<string> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<string>("preview_prompt", {
    request: toRustPayload(form),
  });
}

export async function findFreePort(preferred = 3000): Promise<number> {
  if (!isTauri()) return preferred;
  return invoke<number>("find_free_port", { preferred });
}

export async function removeFromCapsule(
  id: string,
): Promise<TimeCapsuleProject[]> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<TimeCapsuleProject[]>("remove_from_capsule", { id });
}

export async function pickProjectDirectory(): Promise<string | null> {
  if (!isTauri()) return null;
  return invoke<string | null>("pick_project_directory");
}

export async function analyzeProject(path: string): Promise<ProjectAnalysis> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<ProjectAnalysis>("analyze_project", { path });
}

export async function pickLogoFile(): Promise<StagedLogo | null> {
  if (!isTauri()) {
    throw new Error("Logo seçimi yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<StagedLogo | null>("pick_logo_file");
}

export async function readLogoPreview(path: string): Promise<string> {
  if (!isTauri()) return "";
  return invoke<string>("read_logo_preview", { path });
}

export async function removeStagedLogo(path: string): Promise<void> {
  if (!isTauri() || !path) return;
  await invoke("remove_staged_logo", { path });
}

export async function pickMediaFiles(): Promise<string[]> {
  if (!isTauri()) return [];
  return invoke<string[]>("pick_media_files");
}

export async function injectMedia(
  projectPath: string,
  framework: string,
  sourcePaths: string[],
): Promise<InjectMediaResult> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<InjectMediaResult>("inject_media", {
    projectPath,
    framework,
    sourcePaths,
  });
}

export async function copyToClipboard(text: string): Promise<void> {
  if (!isTauri()) {
    await navigator.clipboard.writeText(text);
    return;
  }
  await invoke("copy_to_clipboard", { text });
}

export async function loadGlobalEnvVault(): Promise<string> {
  if (!isTauri()) return "";
  return invoke<string>("load_global_env_vault");
}

export async function saveGlobalEnvVault(content: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  await invoke("save_global_env_vault", { content });
}

export async function injectEnv(
  projectPath: string,
  provider: string,
  envContent?: string,
): Promise<InjectEnvResult> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<InjectEnvResult>("inject_env", {
    projectPath,
    provider,
    envContent: envContent?.trim() ? envContent : null,
  });
}

export async function addGithubActions(
  projectPath: string,
  framework: string,
  packageManager: string,
): Promise<AddCicdResult> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<AddCicdResult>("add_github_actions", {
    projectPath,
    framework,
    packageManager,
  });
}

export async function saveShareImagePng(
  base64Png: string,
  defaultName: string,
): Promise<string | null> {
  if (!isTauri()) {
    throw new Error("Bu özellik yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<string | null>("save_share_image_png", {
    base64Png,
    defaultName,
  });
}
