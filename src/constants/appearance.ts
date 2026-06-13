import type { DensityMode, TerminalFont } from "../types/appearance";

export const ACCENT_COLORS: {
  id: import("../types/appearance").AccentColor;
  label: string;
  swatch: string;
}[] = [
  { id: "blue", label: "Mavi", swatch: "#6366f1" },
  { id: "green", label: "Yeşil", swatch: "#22c55e" },
  { id: "purple", label: "Mor", swatch: "#a855f7" },
  { id: "orange", label: "Turuncu", swatch: "#f97316" },
  { id: "rose", label: "Pembe", swatch: "#f43f5e" },
  { id: "cyan", label: "Camgöbeği", swatch: "#06b6d4" },
];

export const DENSITY_OPTIONS: {
  value: DensityMode;
  label: string;
  desc: string;
}[] = [
  { value: "comfortable", label: "Rahat", desc: "Geniş boşluklar" },
  { value: "compact", label: "Sıkı", desc: "Minimal boşluklar" },
];

export const TERMINAL_FONT_OPTIONS: {
  value: TerminalFont;
  label: string;
}[] = [
  { value: "system", label: "Sistem Varsayılanı" },
  { value: "fira", label: "Fira Code" },
  { value: "jetbrains", label: "JetBrains Mono" },
];
