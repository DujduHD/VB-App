import { Rocket, Loader2, Eraser, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";

export function FormFooter() {
  const { t, i18n } = useTranslation();
  const projectName = useProjectStore((s) => s.form.identity.name);
  const isSubmitting = useProjectStore((s) => s.isSubmitting);
  const isCheckingDeps = useProjectStore((s) => s.isCheckingDeps);
  const isInstallingDeps = useProjectStore((s) => s.isInstallingDeps);
  const saveDraft = useProjectStore((s) => s.saveDraft);
  const clearForm = useProjectStore((s) => s.clearForm);
  const draftSavedAt = useProjectStore((s) => s.draftSavedAt);
  const activeDraftId = useProjectStore((s) => s.activeDraftId);

  const isBusy = isSubmitting || isCheckingDeps || isInstallingDeps;
  const canSubmit = projectName.trim().length > 0 && !isBusy;

  let submitLabel = t("buttons.start");
  if (isCheckingDeps) submitLabel = t("buttons.scanning");
  else if (isInstallingDeps) submitLabel = t("buttons.installing");
  else if (isSubmitting) submitLabel = t("buttons.creating");

  return (
    <div className="sticky bottom-0 border-t border-zinc-200 bg-zinc-50 pt-4 dark:border-vb-border dark:bg-vb-bg">
      {(draftSavedAt || activeDraftId) && (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <Bookmark className="h-3 w-3 text-vb-accent" />
          {activeDraftId ? t("form.draftEditing") : t("form.draftSaved")}
          {draftSavedAt && (
            <>
              {" · "}
              {new Intl.DateTimeFormat(i18n.language, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(draftSavedAt))}
            </>
          )}
        </p>
      )}
      <div className="grid grid-cols-[1fr_1fr_1.6fr] gap-2">
        <button
          type="button"
          onClick={clearForm}
          disabled={isBusy}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm font-medium text-zinc-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-vb-border dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <Eraser className="h-4 w-4" />
          {t("buttons.clear")}
        </button>
        <button
          type="button"
          onClick={saveDraft}
          disabled={isBusy}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-vb-accent/30 bg-vb-accent/5 px-3 py-3 text-sm font-medium text-vb-accent transition-all hover:border-vb-accent hover:bg-vb-accent/10 disabled:cursor-not-allowed disabled:opacity-40 dark:border-vb-accent/40 dark:bg-vb-accent/10"
        >
          <Bookmark className="h-4 w-4" />
          {t("buttons.draft")}
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-xl bg-vb-accent py-3 text-sm font-semibold text-white shadow-sm shadow-vb-accent/25 transition-colors hover:bg-vb-accent-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {submitLabel}
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              {t("buttons.start")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
