import { useState, useMemo } from "react";
import { Sparkles, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { ProjectCard } from "./ProjectCard";
import { ImportProjectButton } from "../new-project/ImportProjectButton";
import { TitleWithTooltip } from "../ui/TitleWithTooltip";

export function TimeCapsule() {
  const { t } = useTranslation();
  const projects = useProjectStore((s) => s.timeCapsule);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slogan.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q),
    );
  }, [projects, query]);

  return (
    <section className="flex h-full flex-col" data-tour="time-capsule">
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <TitleWithTooltip
              title={t("timeCapsule.title")}
              tooltip={t("tooltips.timeCapsule")}
            />
          </h2>
          {projects.length > 0 && (
            <span className="rounded-full bg-vb-accent/10 px-2 py-0.5 text-xs font-medium text-vb-accent">
              {projects.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("timeCapsule.subtitle")}
        </p>

        <ImportProjectButton />

        {projects.length > 0 && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("timeCapsule.searchPlaceholder")}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-vb-accent dark:border-vb-border dark:bg-zinc-900"
            />
          </div>
        )}
      </header>

      {projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-vb-border">
          <Sparkles className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("timeCapsule.empty")}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          {t("timeCapsule.noResults", { query })}
        </p>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
