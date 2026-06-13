import { createPortal } from "react-dom";
import { AlertTriangle, Download, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { dependencyLabel } from "../../constants/dependencyLabels";

export function DependencyModal() {
  const { t } = useTranslation();
  const open = useProjectStore((s) => s.showDependencyModal);
  const missing = useProjectStore((s) => s.missingDependencies);
  const isInstalling = useProjectStore((s) => s.isInstallingDeps);
  const dismiss = useProjectStore((s) => s.dismissDependencyModal);
  const installAndContinue = useProjectStore((s) => s.installMissingAndContinue);

  if (!open || missing.length === 0) return null;

  const onlyEditor = missing.length === 1 && missing[0] === "editor";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dep-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-vb-border dark:bg-zinc-900">
        <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4 dark:border-vb-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/15">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2
                id="dep-modal-title"
                className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {t("dependencyModal.title")}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {t("dependencyModal.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            disabled={isInstalling}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label={t("buttons.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            {t("dependencyModal.missingList")}
          </p>
          <ul className="mb-4 space-y-1.5">
            {missing.map((id) => (
              <li
                key={id}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {dependencyLabel(id)}
              </li>
            ))}
          </ul>
          {onlyEditor && (
            <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              {t("dependencyModal.editorNote")}
            </p>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {onlyEditor
              ? t("dependencyModal.promptEditorOnly")
              : t("dependencyModal.promptInstall")}
          </p>
        </div>

        <div className="flex gap-2 border-t border-zinc-100 px-5 py-4 dark:border-vb-border">
          <button
            type="button"
            onClick={dismiss}
            disabled={isInstalling}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {t("buttons.cancel")}
          </button>
          <button
            type="button"
            disabled={isInstalling}
            onClick={() => void installAndContinue()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-vb-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isInstalling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("buttons.installing")}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {onlyEditor
                  ? t("buttons.startAnyway")
                  : t("buttons.installAndStart")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
