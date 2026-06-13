import { useEffect } from "react";
import { useProjectStore } from "../stores/projectStore";

function applyDomAppearance(
  accentColor: string,
  density: string,
  terminalFont: string,
  animationLevel: string,
) {
  const root = document.documentElement;
  root.dataset.accent = accentColor;
  root.dataset.density = density;
  root.dataset.terminalFont = terminalFont;
  root.dataset.animation = animationLevel;
}

export function useAppearanceEngine() {
  const accentColor = useProjectStore((s) => s.settings.accentColor);
  const density = useProjectStore((s) => s.settings.density);
  const terminalFont = useProjectStore((s) => s.settings.terminalFont);
  const animationLevel = useProjectStore((s) => s.settings.animationLevel);

  useEffect(() => {
    applyDomAppearance(accentColor, density, terminalFont, animationLevel);
  }, [accentColor, density, terminalFont, animationLevel]);
}
