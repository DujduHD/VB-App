import { memo, useMemo, useState } from "react";
import {
  Palette,
  Ban,
  PenTool,
  Layers,
  Image,
  Box,
  Sparkles,
  Wand2,
  Smartphone,
  Component,
  LayoutGrid,
  Pencil,
  Circle,
  MonitorSmartphone,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { UiUxTool } from "../../types/project";
import {
  uiUxCategoryLabels,
  uiUxCategoryOrder,
  uiUxToolMeta,
  uiUxToolsByCategory,
  type UiUxCategory,
} from "../../constants/uiUxTools";
import { SectionHeader } from "../new-project/SectionHeader";

const uiUxIcons: Record<UiUxTool, LucideIcon> = {
  none: Ban,
  figma: PenTool,
  framer: Layers,
  penpot: PenTool,
  canva: Image,
  spline: Box,
  stick: Sparkles,
  v0: Wand2,
  uizard: Smartphone,
  relume: Component,
  miro: LayoutGrid,
  excalidraw: Pencil,
  dribbble: Circle,
  mobbin: MonitorSmartphone,
};

export const UiUxToolPicker = memo(function UiUxToolPicker() {
  const { t } = useTranslation();
  const uiUxTool = useProjectStore((s) => s.form.vibe.uiUxTool);
  const setVibe = useProjectStore((s) => s.setVibe);
  const [uiUxCategory, setUiUxCategory] = useState<UiUxCategory | "all">("all");

  const visibleUiUxTools = useMemo(() => {
    if (uiUxCategory === "all") {
      return uiUxCategoryOrder.flatMap((cat) => uiUxToolsByCategory[cat]);
    }
    return uiUxToolsByCategory[uiUxCategory];
  }, [uiUxCategory]);

  const selectedMeta = uiUxToolMeta[uiUxTool];

  return (
    <div>
      <SectionHeader icon={Palette} title={t("form.vibeExtended.uiUxTitle")} />
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        {t("form.vibeExtended.uiUxDesc")}
      </p>

      <button
        type="button"
        onClick={() => setVibe({ uiUxTool: "none" })}
        className={`mb-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
          uiUxTool === "none"
            ? "border-zinc-400 bg-zinc-100 ring-1 ring-zinc-400 dark:border-zinc-500 dark:bg-zinc-800 dark:ring-zinc-500"
            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900"
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-200/80 dark:bg-zinc-700">
          <Ban className="h-4 w-4 text-zinc-500" />
        </div>
        <div>
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("common.none")}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("form.vibeExtended.uiUxNoneDesc")}
          </span>
        </div>
      </button>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setUiUxCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            uiUxCategory === "all"
              ? "bg-vb-accent text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {t("common.all")}
        </button>
        {uiUxCategoryOrder.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setUiUxCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              uiUxCategory === cat
                ? "bg-vb-accent text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {uiUxCategoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="max-h-56 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2">
          {visibleUiUxTools.map((tool) => {
            const meta = uiUxToolMeta[tool];
            const Icon = uiUxIcons[tool];
            const selected = uiUxTool === tool;

            return (
              <button
                key={tool}
                type="button"
                onClick={() => setVibe({ uiUxTool: tool })}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900 dark:hover:border-zinc-600"
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
                    {meta.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
                    {meta.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {uiUxTool !== "none" && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-vb-accent/5 px-3 py-2 text-[11px] text-vb-accent dark:bg-vb-accent/10">
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span>
            <strong className="font-semibold">{selectedMeta.label}</strong> —{" "}
            {selectedMeta.desc}
          </span>
        </p>
      )}
    </div>
  );
});
