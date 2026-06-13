import { useProjectStore } from "../stores/projectStore";

export function useDensity() {
  const density = useProjectStore((s) => s.settings.density);
  const compact = density === "compact";

  return {
    compact,
    sectionGap: compact ? "gap-4" : "gap-8",
    vibeGap: compact ? "gap-4" : "gap-6",
    vibeSpace: compact ? "space-y-4" : "space-y-6",
    gridGap: compact ? "gap-1.5" : "gap-2",
    cardPadding: compact ? "p-2" : "p-3",
    pagePadding: compact ? "p-4 lg:p-6" : "p-6 lg:p-8",
    sidebarPadding: compact ? "p-4" : "p-6",
    settingsPadding: compact ? "p-4 lg:p-6" : "p-6 lg:p-10",
  };
}
