import { memo } from "react";
import {
  Code2,
  Wind,
  Zap,
  Ghost,
  Sparkles,
  Box,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { CodeEditor } from "../../types/project";
import { CODE_EDITORS, codeEditorMeta } from "../../constants/codeEditors";
import { SectionHeader } from "../new-project/SectionHeader";

const codeEditorIcons: Record<CodeEditor, LucideIcon> = {
  cursor: Code2,
  vscode: Code2,
  windsurf: Wind,
  zed: Zap,
  void: Ghost,
  trae: Sparkles,
  pearai: Box,
  antigravity: Rocket,
};

export const CodeEditorPicker = memo(function CodeEditorPicker() {
  const { t } = useTranslation();
  const aiTool = useProjectStore((s) => s.form.aiTool);
  const setCodeEditor = useProjectStore((s) => s.setCodeEditor);

  return (
    <div>
      <SectionHeader icon={Code2} title={t("form.vibeExtended.codeEditorTitle")} />
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        {t("form.vibeExtended.codeEditorDesc")}
      </p>
      <div className="max-h-64 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2">
          {CODE_EDITORS.map((editor) => {
            const meta = codeEditorMeta[editor];
            const Icon = codeEditorIcons[editor];
            const selected = aiTool === editor;

            return (
              <button
                key={editor}
                type="button"
                onClick={() => setCodeEditor(editor)}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900 dark:hover:border-zinc-600"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-vb-accent text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
                    {meta.desc}
                  </span>
                  {meta.tag && (
                    <span className="mt-1 inline-block rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
                      {meta.tag}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
