import { Sparkles, Bookmark, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { SelectedProject } from "../../types/projectsHub";
import {
  formatDate,
  frameworkLabels,
  platformLabels,
} from "../../utils/projectLabels";

function PickerCard({
  title,
  subtitle,
  meta,
  icon: Icon,
  accent,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  meta: string;
  icon: typeof Sparkles;
  accent: "vb" | "amber";
  onSelect: () => void;
}) {
  const accentClasses =
    accent === "vb"
      ? "from-vb-accent/20 to-vb-accent/5 text-vb-accent group-hover:border-vb-accent/40"
      : "from-amber-400/20 to-orange-500/10 text-amber-600 group-hover:border-amber-400/40 dark:text-amber-400";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group w-full rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:shadow-md dark:border-vb-border dark:bg-vb-surface"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentClasses}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-zinc-400">{meta}</p>
        </div>
      </div>
    </button>
  );
}

export function ProjectPickerList() {
  const { t } = useTranslation();
  const timeCapsule = useProjectStore((s) => s.timeCapsule);
  const drafts = useProjectStore((s) => s.drafts);
  const setSelectedProject = useProjectStore((s) => s.setSelectedProject);

  const selectCapsule = (project: SelectedProject) => {
    setSelectedProject(project);
  };

  const isEmpty = timeCapsule.length === 0 && drafts.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-vb-border">
        <FolderOpen className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("projectsHub.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {t("projectsHub.pickerTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("projectsHub.pickerSubtitle")}
        </p>
      </header>

      {timeCapsule.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("projectsHub.capsuleSection")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {timeCapsule.map((project) => (
              <PickerCard
                key={project.id}
                title={project.name}
                subtitle={project.slogan}
                meta={`${frameworkLabels[project.framework] ?? project.framework} · ${platformLabels[project.platform ?? "web"]} · ${project.path}`}
                icon={Sparkles}
                accent="vb"
                onSelect={() =>
                  selectCapsule({ kind: "capsule", project })
                }
              />
            ))}
          </div>
        </section>
      )}

      {drafts.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("projectsHub.draftsSection")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {drafts.map((draft) => {
              const name =
                draft.form.identity.name.trim() ||
                t("drafts.unnamedDraft");
              return (
                <PickerCard
                  key={draft.id}
                  title={name}
                  subtitle={draft.form.identity.slogan}
                  meta={`${frameworkLabels[draft.form.framework] ?? draft.form.framework} · ${formatDate(draft.updatedAt)}`}
                  icon={Bookmark}
                  accent="amber"
                  onSelect={() =>
                    selectCapsule({ kind: "draft", draft })
                  }
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
