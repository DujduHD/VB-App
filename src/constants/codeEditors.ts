import type { CodeEditor } from "../types/project";

export interface CodeEditorMeta {
  label: string;
  desc: string;
  tag?: string;
}

export const codeEditorMeta: Record<CodeEditor, CodeEditorMeta> = {
  cursor: {
    label: "Cursor",
    desc: "AI-first editör — Composer & Agent",
    tag: "Popüler",
  },
  vscode: {
    label: "VS Code",
    desc: "Copilot, Continue ve eklentiler",
    tag: "Popüler",
  },
  windsurf: {
    label: "Windsurf",
    desc: "Codeium Cascade AI editör",
    tag: "AI Native",
  },
  zed: {
    label: "Zed",
    desc: "Hızlı editör — Zed AI desteği",
    tag: "Performans",
  },
  void: {
    label: "Void",
    desc: "Açık kaynak Cursor alternatifi",
    tag: "AI Native",
  },
  trae: {
    label: "Trae",
    desc: "ByteDance AI IDE",
    tag: "AI Native",
  },
  pearai: {
    label: "PearAI",
    desc: "Açık kaynak AI editör",
    tag: "AI Native",
  },
  antigravity: {
    label: "Antigravity",
    desc: "Google AI IDE",
    tag: "AI Native",
  },
};

export const CODE_EDITORS = Object.keys(codeEditorMeta) as CodeEditor[];

/** Eski Zaman Kapsülü / taslak kayıtları */
export const LEGACY_AI_TOOL_ALIASES: Record<string, CodeEditor> = {
  claude: "vscode",
  chatgpt: "vscode",
  gemini: "vscode",
  llama: "vscode",
  code: "vscode",
};

export function normalizeCodeEditor(value: string): CodeEditor {
  return (LEGACY_AI_TOOL_ALIASES[value] ?? value) as CodeEditor;
}

export const DEFAULT_CODE_EDITOR: CodeEditor = "cursor";
