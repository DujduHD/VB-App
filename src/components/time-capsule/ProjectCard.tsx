import {
  Sparkles,
  FolderOpen,
  Clock,
  Zap,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TimeCapsuleProject } from "../../types/project";
import { useProjectStore } from "../../stores/projectStore";
import { useToastStore } from "../../stores/toastStore";
import { getDeployShortLabel } from "../../utils/deployLabels";
import {
  formatDate,
  frameworkLabels,
  getBaasLabel,
  getCodeEditorLabel,
  platformLabels,
} from "../../utils/projectLabels";
import { WakePreview } from "./WakePreview";

export function ProjectCard({ project }: { project: TimeCapsuleProject }) {
  const { t } = useTranslation();
  const wakeProject = useProjectStore((s) => s.wakeProject);
  const removeFromCapsule = useProjectStore((s) => s.removeFromCapsule);
  const isWaking = useProjectStore((s) => s.isWaking);
  const showToast = useToastStore((s) => s.show);
  const waking = isWaking === project.id;

  const handleRemove = async () => {
    if (!confirm(t("timeCapsule.confirmRemove", { name: project.name }))) return;
    try {
      await removeFromCapsule(project.id);
      showToast(t("toast.removedFromCapsule"), "info");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("toast.deleteFailed");
      showToast(msg, "error");
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-vb-accent/50 hover:shadow-lg dark:border-vb-border dark:bg-vb-surface">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-vb-accent/0 via-vb-accent/60 to-vb-accent/0 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-vb-accent/20 to-vb-accent/5 text-vb-accent">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1">
            {project.port && (
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800">
                :{project.port}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Clock className="h-3 w-3" />
              {formatDate(project.createdAt)}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {project.name}
        </h3>
        {project.slogan && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {project.slogan}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.platform && (
            <span className="rounded-md bg-vb-accent/10 px-2 py-0.5 text-xs font-medium text-vb-accent">
              {platformLabels[project.platform] ?? project.platform}
            </span>
          )}
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {frameworkLabels[project.framework]}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {project.packageManager}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {getCodeEditorLabel(project.aiTool)}
          </span>
          {project.baasProvider && project.baasProvider !== "none" && (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {getBaasLabel(project.baasProvider)}
            </span>
          )}
          {project.deployTarget && project.deployTarget !== "none" && (
            <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs text-orange-600 dark:text-orange-400">
              {getDeployShortLabel(project.deployTarget)}
            </span>
          )}
        </div>

        <WakePreview project={project} />

        <div className="mt-3 flex items-center gap-1 text-xs text-zinc-400">
          <FolderOpen className="h-3 w-3 shrink-0" />
          <span className="truncate" title={project.path}>
            {project.path}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => wakeProject(project.id)}
            disabled={waking}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-vb-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vb-accent-hover disabled:opacity-50"
          >
            <Zap className={`h-4 w-4 ${waking ? "animate-pulse" : ""}`} />
            {waking ? t("timeCapsule.waking") : t("timeCapsule.wake")}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            title={t("timeCapsule.removeFromCapsule")}
            className="rounded-lg border border-zinc-200 p-2.5 text-zinc-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-vb-border"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 flex items-center gap-1 text-[10px] text-zinc-400">
          <ExternalLink className="h-3 w-3" />
          {t("timeCapsule.wakeHint")}
        </p>
      </div>
    </article>
  );
}
