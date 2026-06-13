import { useState } from "react";
import { GitBranch, Loader2, Workflow } from "lucide-react";
import { useTranslation } from "react-i18next";
import { addGithubActions } from "../../services/tauri";
import { useToastStore } from "../../stores/toastStore";
import type { Framework, PackageManager } from "../../types/project";
import { formatError } from "../../utils/formatError";

export function CicdPanel({
  projectPath,
  framework,
  packageManager,
}: {
  projectPath: string;
  framework: Framework;
  packageManager: PackageManager;
}) {
  const { t } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const [isAdding, setIsAdding] = useState(false);
  const [workflowPath, setWorkflowPath] = useState("");

  const handleAdd = async () => {
    setIsAdding(true);
    setWorkflowPath("");
    try {
      const result = await addGithubActions(
        projectPath,
        framework,
        packageManager,
      );
      setWorkflowPath(result.workflowPath);
      showToast(result.message, "success");
    } catch (err) {
      showToast(formatError(err, t("projectsHub.cicd.addFailed")), "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mt-4 space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-vb-border dark:bg-zinc-900/50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Workflow className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              GitHub Actions
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t("projectsHub.cicd.description")}
            </p>
            <p className="mt-2 font-mono text-[11px] text-zinc-400">
              .github/workflows/main.yml
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={isAdding}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {isAdding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("projectsHub.cicd.adding")}
          </>
        ) : (
          <>
            <GitBranch className="h-4 w-4" />
            {t("projectsHub.cicd.addButton")}
          </>
        )}
      </button>

      {workflowPath && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {t("projectsHub.cicd.createdAt", { path: workflowPath })}
        </p>
      )}
    </div>
  );
}
