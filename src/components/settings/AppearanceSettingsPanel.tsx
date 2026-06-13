import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { useProjectStore } from "../../stores/projectStore";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { ACCENT_COLORS } from "../../constants/appearance";
import type { AccentColor } from "../../types/appearance";

const accentLabelKeys: Record<AccentColor, string> = {
  blue: "settings.appearanceSection.accentBlue",
  green: "settings.appearanceSection.accentGreen",
  purple: "settings.appearanceSection.accentPurple",
  orange: "settings.appearanceSection.accentOrange",
  rose: "settings.appearanceSection.accentRose",
  cyan: "settings.appearanceSection.accentCyan",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      {description && (
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  );
}

export function AppearanceSettingsPanel() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const settings = useProjectStore((s) => s.settings);
  const setAppearance = useProjectStore((s) => s.setAppearance);

  const themeOptions = [
    {
      value: "light" as const,
      label: t("settings.appearanceSection.themeLight"),
      desc: t("settings.appearanceSection.themeLightDesc"),
    },
    {
      value: "dark" as const,
      label: t("settings.appearanceSection.themeDark"),
      desc: t("settings.appearanceSection.themeDarkDesc"),
    },
    {
      value: "system" as const,
      label: t("settings.appearanceSection.themeSystem"),
      desc: t("settings.appearanceSection.themeSystemDesc"),
    },
  ];

  const densityOptions = [
    {
      value: "comfortable" as const,
      label: t("settings.appearanceSection.densityComfortable"),
      desc: t("settings.appearanceSection.densityComfortableDesc"),
    },
    {
      value: "compact" as const,
      label: t("settings.appearanceSection.densityCompact"),
      desc: t("settings.appearanceSection.densityCompactDesc"),
    },
  ];

  const terminalFontOptions = [
    { value: "system" as const, label: t("settings.appearanceSection.terminalSystem") },
    { value: "fira" as const, label: "Fira Code" },
    { value: "jetbrains" as const, label: "JetBrains Mono" },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("settings.appearanceSection.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings.appearanceSection.description")}
        </p>
      </header>

      <Section
        title={t("settings.appearanceSection.theme")}
        description={t("settings.appearanceSection.themeDesc")}
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {themeOptions.map(({ value, label, desc }) => {
            const selected = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-800/50 dark:hover:border-zinc-600"
                }`}
              >
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title={t("settings.appearanceSection.accentColor")}
        description={t("settings.appearanceSection.accentColorDesc")}
      >
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(({ id, swatch }) => {
            const selected = settings.accentColor === id;
            const label = t(accentLabelKeys[id]);
            return (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={selected}
                onClick={() => setAppearance({ accentColor: id })}
                className={`relative h-9 w-9 rounded-full border-2 transition-transform hover:scale-105 ${
                  selected
                    ? "border-zinc-900 ring-2 ring-vb-accent ring-offset-2 dark:border-white dark:ring-offset-zinc-900"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: swatch }}
              >
                {selected && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title={t("settings.appearanceSection.densityTitle")}
        description={t("settings.appearanceSection.densityDesc")}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {densityOptions.map(({ value, label, desc }) => {
            const selected = settings.density === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setAppearance({ density: value })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  selected
                    ? "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-800/50"
                }`}
              >
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                </span>
                <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title={t("settings.appearanceSection.terminalFont")}
        description={t("settings.appearanceSection.terminalFontDesc")}
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {terminalFontOptions.map(({ value, label }) => {
            const selected = settings.terminalFont === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setAppearance({ terminalFont: value })}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                  selected
                    ? "border-vb-accent bg-vb-accent/10 font-medium text-vb-accent ring-1 ring-vb-accent"
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-800/50 dark:text-zinc-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title={t("settings.appearanceSection.animations")}
        description={t("settings.appearanceSection.animationsDesc")}
      >
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {settings.animationLevel === "full"
                ? t("settings.appearanceSection.animationsOn")
                : t("settings.appearanceSection.animationsOff")}
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
              {t("settings.appearanceSection.animationsOffNote")}
            </span>
          </div>
          <ToggleSwitch
            checked={settings.animationLevel === "full"}
            onChange={(on) =>
              setAppearance({ animationLevel: on ? "full" : "none" })
            }
          />
        </label>
      </Section>
    </div>
  );
}
