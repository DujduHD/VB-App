import { memo, useMemo, useState } from "react";
import {
  Database,
  Ban,
  Server,
  Layers,
  HardDrive,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { BaasProvider } from "../../types/project";
import {
  ALL_BAAS_PROVIDERS,
  baasCategoryLabels,
  baasCategoryOrder,
  baasProviderMeta,
  baasProvidersByCategory,
  type BaasCategory,
} from "../../constants/baasProviders";
import { SectionHeader } from "../new-project/SectionHeader";

const categoryIcons: Record<BaasCategory, LucideIcon> = {
  postgres: Database,
  sqlite: HardDrive,
  nosql: Layers,
  redis: Server,
  upstash: Server,
  analytics: Database,
};

export const BaasProviderGrid = memo(function BaasProviderGrid() {
  const { t } = useTranslation();
  const baasProvider = useProjectStore((s) => s.form.integrations.baasProvider);
  const setIntegrations = useProjectStore((s) => s.setIntegrations);
  const [category, setCategory] = useState<BaasCategory | "all">("all");

  const visibleProviders = useMemo(() => {
    if (category === "all") return ALL_BAAS_PROVIDERS;
    return baasProvidersByCategory[category];
  }, [category]);

  return (
    <>
      <SectionHeader icon={Database} title={t("form.integrationsExtended.baasTitle")} />
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        {t("form.integrationsExtended.baasDesc")}
      </p>

      <button
        type="button"
        onClick={() => setIntegrations({ baasProvider: "none" })}
        className={`mb-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
          baasProvider === "none"
            ? "border-zinc-400 bg-zinc-100 ring-1 ring-zinc-400 dark:border-zinc-500 dark:bg-zinc-800"
            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900"
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-200/80 dark:bg-zinc-700">
          <Ban className="h-4 w-4 text-zinc-500" />
        </div>
        <div>
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("form.integrationsExtended.noneLabel")}
          </span>
          <span className="text-xs text-zinc-500">
            {t("form.integrationsExtended.noneDesc")}
          </span>
        </div>
      </button>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            category === "all"
              ? "bg-vb-accent text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {t("common.all")}
        </button>
        {baasCategoryOrder.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === cat
                ? "bg-vb-accent text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {baasCategoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="max-h-56 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2">
          {visibleProviders.map((provider) => {
            const pMeta = baasProviderMeta[provider];
            const Icon = categoryIcons[pMeta.category];
            const selected = baasProvider === provider;

            return (
              <button
                key={provider}
                type="button"
                onClick={() =>
                  setIntegrations({ baasProvider: provider as BaasProvider })
                }
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-vb-accent text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {pMeta.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
                    {pMeta.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
});
