import { useMemo, useState } from "react";
import { Bookmark, Search, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { DraftCard } from "./DraftCard";

export function DraftsPage() {
  const { t } = useTranslation();
  const drafts = useProjectStore((s) => s.drafts);
  const loadDraft = useProjectStore((s) => s.loadDraft);
  const deleteDraft = useProjectStore((s) => s.deleteDraft);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drafts;
    return drafts.filter((d) => {
      const name = d.form.identity.name.toLowerCase();
      const slogan = d.form.identity.slogan.toLowerCase();
      const framework = d.form.framework.toLowerCase();
      return name.includes(q) || slogan.includes(q) || framework.includes(q);
    });
  }, [drafts, query]);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10">
                <Bookmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {t("drafts.title")}
              </h2>
              {drafts.length > 0 && (
                <span className="rounded-full bg-vb-accent/10 px-2.5 py-0.5 text-xs font-semibold text-vb-accent">
                  {drafts.length}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("drafts.subtitle")}
            </p>
          </div>
        </div>

        {drafts.length > 0 && (
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("drafts.searchPlaceholder")}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-900"
            />
          </div>
        )}
      </header>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 px-8 py-20 text-center dark:border-vb-border">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <FileText className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t("drafts.emptyTitle")}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            {t("drafts.emptyDescription", { draft: t("buttons.draft") })}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          {t("drafts.noResults", { query })}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onContinue={loadDraft}
              onDelete={deleteDraft}
            />
          ))}
        </div>
      )}
    </div>
  );
}
