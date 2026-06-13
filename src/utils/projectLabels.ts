import { getBaasLabel } from "../constants/baasProviders";
import { frameworkMeta } from "../constants/platforms";
import {
  codeEditorMeta,
  LEGACY_AI_TOOL_ALIASES,
  normalizeCodeEditor,
} from "../constants/codeEditors";
import { uiUxToolMeta } from "../constants/uiUxTools";

export const platformLabels: Record<string, string> = {
  web: "Web",
  desktop: "Masaüstü",
  mobile: "Mobil",
};

export const frameworkLabels: Record<string, string> = Object.fromEntries(
  Object.entries(frameworkMeta).map(([key, meta]) => [key, meta.label]),
);

frameworkLabels["vite-blank"] = "Vite + React";

export const codeEditorLabels: Record<string, string> = Object.fromEntries(
  Object.entries(codeEditorMeta).map(([key, meta]) => [key, meta.label]),
);

for (const [legacy, mapped] of Object.entries(LEGACY_AI_TOOL_ALIASES)) {
  codeEditorLabels[legacy] = codeEditorMeta[mapped].label;
}

/** @deprecated use codeEditorLabels */
export const aiLabels = codeEditorLabels;

export const uiUxLabels: Record<string, string> = Object.fromEntries(
  Object.entries(uiUxToolMeta).map(([key, meta]) => [key, meta.label]),
);
uiUxLabels.none = "UI/UX yok";

export { deployLabels } from "../constants/deployTargets";

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function getFrameworkLabel(framework: string): string {
  return frameworkLabels[framework] ?? framework;
}

export { musicProviderLabel } from "../constants/musicProviders";
export { getBaasLabel };

export function getCodeEditorLabel(editor: string): string {
  const normalized = normalizeCodeEditor(editor);
  return codeEditorLabels[normalized] ?? codeEditorLabels[editor] ?? editor;
}
