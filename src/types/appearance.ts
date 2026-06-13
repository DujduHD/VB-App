export type AccentColor = "blue" | "green" | "purple" | "orange" | "rose" | "cyan";

export type DensityMode = "comfortable" | "compact";

export type TerminalFont = "system" | "fira" | "jetbrains";

export type AnimationLevel = "full" | "none";

export interface AppearanceSettings {
  accentColor: AccentColor;
  density: DensityMode;
  terminalFont: TerminalFont;
  animationLevel: AnimationLevel;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  accentColor: "blue",
  density: "comfortable",
  terminalFont: "system",
  animationLevel: "full",
};
