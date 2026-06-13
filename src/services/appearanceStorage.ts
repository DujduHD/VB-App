import {
  DEFAULT_APPEARANCE,
  type AccentColor,
  type AnimationLevel,
  type AppearanceSettings,
  type DensityMode,
  type TerminalFont,
} from "../types/appearance";

const APPEARANCE_KEY = "vb-appearance";

function isAccentColor(v: unknown): v is AccentColor {
  return (
    v === "blue" ||
    v === "green" ||
    v === "purple" ||
    v === "orange" ||
    v === "rose" ||
    v === "cyan"
  );
}

function isDensity(v: unknown): v is DensityMode {
  return v === "comfortable" || v === "compact";
}

function isTerminalFont(v: unknown): v is TerminalFont {
  return v === "system" || v === "fira" || v === "jetbrains";
}

function isAnimationLevel(v: unknown): v is AnimationLevel {
  return v === "full" || v === "none";
}

export function loadAppearanceSettings(): AppearanceSettings {
  if (typeof localStorage === "undefined") return { ...DEFAULT_APPEARANCE };

  try {
    const raw = localStorage.getItem(APPEARANCE_KEY);
    if (!raw) return { ...DEFAULT_APPEARANCE };
    const parsed = JSON.parse(raw) as Partial<AppearanceSettings>;
    return {
      accentColor: isAccentColor(parsed.accentColor)
        ? parsed.accentColor
        : DEFAULT_APPEARANCE.accentColor,
      density: isDensity(parsed.density)
        ? parsed.density
        : DEFAULT_APPEARANCE.density,
      terminalFont: isTerminalFont(parsed.terminalFont)
        ? parsed.terminalFont
        : DEFAULT_APPEARANCE.terminalFont,
      animationLevel: isAnimationLevel(parsed.animationLevel)
        ? parsed.animationLevel
        : DEFAULT_APPEARANCE.animationLevel,
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export function saveAppearanceSettings(settings: AppearanceSettings): void {
  localStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings));
}
