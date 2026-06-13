import { FolderInput, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";

export function ImportProjectButton() {
  const { t } = useTranslation();
  const importExternalProject = useProjectStore((s) => s.importExternalProject);
  const isImporting = useProjectStore((s) => s.isImporting);
  const isBusy = useProjectStore(
    (s) => s.isSubmitting || s.isCheckingDeps || s.isInstallingDeps,
  );

  return (
    <button
      type="button"
      onClick={() => void importExternalProject()}
      disabled={isImporting || isBusy}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-vb-accent/40 bg-vb-accent/5 px-4 py-2.5 text-sm font-medium text-vb-accent transition-all hover:border-vb-accent hover:bg-vb-accent/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-vb-accent/50 dark:bg-vb-accent/10"
    >
      {isImporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("import.analyzing")}
        </>
      ) : (
        <>
          <FolderInput className="h-4 w-4" />
          {t("import.button")}
        </>
      )}
    </button>
  );
}
