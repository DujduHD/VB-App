import type { ProjectDraft } from "./draft";
import type { TimeCapsuleProject } from "./project";

export type ProjectHubMenu = "api" | "cicd" | "env" | "vitrin" | "media";

export type SelectedProject =
  | { kind: "capsule"; project: TimeCapsuleProject }
  | { kind: "draft"; draft: ProjectDraft };

export function selectedProjectName(selected: SelectedProject): string {
  if (selected.kind === "capsule") {
    return selected.project.name;
  }
  return selected.draft.form.identity.name.trim() || "Adsız taslak";
}

export function selectedProjectPath(selected: SelectedProject): string | null {
  if (selected.kind === "capsule") {
    return selected.project.path || null;
  }
  return null;
}

export function selectedProjectHasDiskPath(selected: SelectedProject): boolean {
  return selected.kind === "capsule" && Boolean(selected.project.path?.trim());
}

export function selectedProjectPackageManager(
  selected: SelectedProject,
): string {
  if (selected.kind === "capsule") {
    return selected.project.packageManager;
  }
  return selected.draft.form.packageManager;
}

export function selectedProjectFramework(selected: SelectedProject): string {
  if (selected.kind === "capsule") {
    return selected.project.framework;
  }
  return selected.draft.form.framework;
}

export function selectedProjectSlogan(selected: SelectedProject): string {
  if (selected.kind === "capsule") {
    return selected.project.slogan;
  }
  return selected.draft.form.identity.slogan;
}

export function selectedProjectLogoUrl(selected: SelectedProject): string | null {
  if (selected.kind === "draft") {
    const { logoSource, logoUrl, logoFilePath } = selected.draft.form.identity;
    if (logoSource === "url" && logoUrl.trim()) return logoUrl.trim();
    if (logoSource === "file" && logoFilePath.trim()) return logoFilePath.trim();
  }
  return null;
}
