import { Bookmark, Clock, Trash2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProjectDraft } from "../../types/draft";
import { getDeployShortLabel } from "../../utils/deployLabels";
import {
  formatDate,
  frameworkLabels,
  getBaasLabel,
  getCodeEditorLabel,
  platformLabels,
} from "../../utils/projectLabels";

interface DraftCardProps {
  draft: ProjectDraft;
  onContinue: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DraftCard({ draft, onContinue, onDelete }: DraftCardProps) {
  const { t } = useTranslation();
  const { form } = draft;
  const name = form.identity.name.trim() || t("drafts.unnamedDraft");

  const handleDelete = () => {
    if (!confirm(t("drafts.confirmDelete", { name }))) return;
    onDelete(draft.id);
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-vb-accent/40 hover:shadow-lg dark:border-vb-border dark:bg-vb-surface">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400/70 to-amber-400/0 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-amber-600 dark:text-amber-400">
            <Bookmark className="h-5 w-5" />
          </div>
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <Clock className="h-3 w-3" />
            {formatDate(draft.updatedAt)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </h3>
        {form.identity.slogan ? (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {form.identity.slogan}
          </p>
        ) : (
          <p className="mt-1 text-sm italic text-zinc-400">
            {t("drafts.noSlogan")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-vb-accent/10 px-2 py-0.5 text-xs font-medium text-vb-accent">
            {platformLabels[form.platform]}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {frameworkLabels[form.framework]}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {form.packageManager}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {getCodeEditorLabel(form.aiTool)}
          </span>
          {form.integrations.baasProvider !== "none" && (
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {getBaasLabel(form.integrations.baasProvider)}
            </span>
          )}
          {form.launch.deployTarget !== "none" && (
            <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs text-orange-600 dark:text-orange-400">
              {getDeployShortLabel(form.launch.deployTarget)}
            </span>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onContinue(draft.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-vb-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vb-accent-hover"
          >
            {t("drafts.continue")}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title={t("drafts.deleteDraft")}
            className="rounded-xl border border-zinc-200 p-2.5 text-zinc-400 transition-colors hover:border-red-300 hover:text-red-500 dark:border-vb-border"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
