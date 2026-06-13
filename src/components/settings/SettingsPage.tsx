import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDensity } from "../../hooks/useDensity";
import {
  User,
  Globe,
  Languages,
  Palette,
  Info,
  Settings,
  FolderOpen,
  Music,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProfileSettingsPanel } from "./ProfileSettingsPanel";
import { DomainSettingsPanel } from "./DomainSettingsPanel";
import { MusicSettingsPanel } from "./MusicSettingsPanel";
import { AppearanceSettingsPanel } from "./AppearanceSettingsPanel";
import { LanguageSettingsPanel } from "./LanguageSettingsPanel";
import { DocumentationPanel } from "./DocumentationPanel";

type SettingsSection =
  | "profile"
  | "domain"
  | "music"
  | "language"
  | "appearance"
  | "docs"
  | "about";

const navItemDefs: {
  id: SettingsSection;
  labelKey: string;
  icon: LucideIcon;
}[] = [
  { id: "profile", labelKey: "settings.profile", icon: User },
  { id: "domain", labelKey: "settings.domain", icon: Globe },
  { id: "music", labelKey: "settings.music", icon: Music },
  { id: "language", labelKey: "settings.language", icon: Languages },
  { id: "appearance", labelKey: "settings.appearance", icon: Palette },
  { id: "docs", labelKey: "settings.docs", icon: BookOpen },
  { id: "about", labelKey: "settings.about", icon: Info },
];

function AboutPanel() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-xl">
      <header className="mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("settings.aboutSection.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings.aboutSection.description")}
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {t("settings.aboutSection.body")}
        </p>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-vb-border dark:bg-zinc-800/50">
          <FolderOpen className="h-4 w-4 shrink-0 text-zinc-400" />
          <div className="min-w-0 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {t("settings.aboutSection.version")}
            </span>
            {" · "}
            0.1.0
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ section }: { section: SettingsSection }) {
  switch (section) {
    case "profile":
      return <ProfileSettingsPanel />;
    case "domain":
      return <DomainSettingsPanel />;
    case "music":
      return <MusicSettingsPanel />;
    case "language":
      return <LanguageSettingsPanel />;
    case "appearance":
      return <AppearanceSettingsPanel />;
    case "docs":
      return <DocumentationPanel />;
    case "about":
      return <AboutPanel />;
  }
}

export function SettingsPage() {
  const { t } = useTranslation();
  const [section, setSection] = useState<SettingsSection>("profile");
  const { settingsPadding } = useDensity();

  return (
    <div className="flex h-full w-full min-h-0">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 dark:border-vb-border dark:bg-zinc-900/50">
        <div className="border-b border-zinc-200 px-4 py-5 dark:border-vb-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vb-accent/10">
              <Settings className="h-4 w-4 text-vb-accent" />
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("settings.title")}
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {navItemDefs.map(({ id, labelKey, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  active
                    ? "bg-vb-accent/10 font-medium text-vb-accent"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(labelKey)}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={`flex-1 overflow-y-auto ${settingsPadding}`}>
        <div
          className={`mx-auto w-full ${section === "docs" ? "max-w-4xl" : "max-w-2xl"}`}
        >
          <SettingsContent section={section} />
        </div>
      </div>
    </div>
  );
}
