import { ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { SectionHeader } from "./SectionHeader";
import { LogoField } from "./LogoField";

export function IdentitySection() {
  const { t } = useTranslation();
  const name = useProjectStore((s) => s.form.identity.name);
  const slogan = useProjectStore((s) => s.form.identity.slogan);
  const setIdentity = useProjectStore((s) => s.setIdentity);

  return (
    <div>
      <SectionHeader icon={ImageIcon} title={t("form.identity.title")} />
      <div className="space-y-3">
        <div>
          <label
            htmlFor="project-name"
            className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            {t("form.identity.projectNameRequired")}
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setIdentity({ name: e.target.value })}
            placeholder={t("form.identity.placeholders.name")}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-900"
          />
        </div>
        <div>
          <label
            htmlFor="project-slogan"
            className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            {t("form.identity.slogan")}
          </label>
          <input
            id="project-slogan"
            type="text"
            value={slogan}
            onChange={(e) => setIdentity({ slogan: e.target.value })}
            placeholder={t("form.identity.placeholders.slogan")}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-900"
          />
        </div>
        <div>
          <LogoField />
        </div>
      </div>
    </div>
  );
}
