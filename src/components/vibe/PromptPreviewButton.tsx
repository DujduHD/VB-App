import { useState } from "react";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { previewPrompt } from "../../services/tauri";

export function PromptPreviewButton() {
  const { t } = useTranslation();
  const projectName = useProjectStore((s) => s.form.identity.name);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState("");

  const handlePreview = async () => {
    const form = useProjectStore.getState().form;
    if (!form.identity.name.trim()) return;
    try {
      const text = await previewPrompt(form);
      setPreviewText(text);
      setShowPreview(true);
    } catch {
      setPreviewText(t("form.vibeExtended.previewDesktopOnly"));
      setShowPreview(true);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handlePreview}
        disabled={!projectName.trim()}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-vb-accent hover:text-vb-accent disabled:opacity-40 dark:border-vb-border dark:text-zinc-400"
      >
        <Eye className="h-3.5 w-3.5" />
        {t("form.vibeExtended.promptPreview")}
      </button>
      {showPreview && (
        <pre className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[11px] leading-relaxed text-zinc-600 dark:border-vb-border dark:bg-zinc-900 dark:text-zinc-400">
          {previewText}
        </pre>
      )}
    </div>
  );
}
