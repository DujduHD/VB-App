import { PackageOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";

export function ExternalImportAlert() {
  const { t } = useTranslation();
  const isExternalImport = useProjectStore((s) => s.isExternalImport);

  if (!isExternalImport) return null;

  return (
    <div
      role="status"
      className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100"
    >
      <PackageOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="leading-relaxed">{t("import.externalModeBanner")}</p>
    </div>
  );
}
